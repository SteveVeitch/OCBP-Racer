# OCBP Racer — Audio Specification

## 1. Audio Architecture

### 1.1 Technology
- **Library:** Web Audio API (native browser API, no external libraries)
- **Approach:** 100% procedural synthesis — no audio files required
- **Channels:** Stereo (MVP)
- **Mixing:** Single master bus with per-category volume control

### 1.2 Audio Manager
```
AudioManager
├── AudioContext (Web Audio API)
├── masterGain (master volume)
├── Engine Sample Playback (per-car)
│   ├── engineIdleBuffer (AudioBuffer — idle loop WAV)
│   ├── engineAccelBuffer (AudioBuffer — accel loop WAV)
│   ├── engineIdleSource (AudioBufferSourceNode, looped)
│   ├── engineAccelSource (AudioBufferSourceNode, looped)
│   ├── engineIdleGain (crossfade mixer)
│   ├── engineAccelGain (crossfade mixer)
│   ├── engineFilter (lowpass, 600-2000Hz)
│   └── sampleCache (Map<carId, {idle, accel}>)
├── Turbo Sample Playback (turbo cars only)
│   ├── turboWhistleSource (AudioBufferSourceNode, looped)
│   ├── turboWhistleGain (boost-linked envelope)
│   └── turboSampleCache (Map<carId, {whistle, flutter}>)
├── Tire Screech Synthesis
│   ├── screechSource (looping white noise buffer)
│   ├── screechFilter (bandpass, 1.5-3.5kHz)
│   └── screechGain (volume envelope)
├── Wind Synthesis
│   ├── windSource (looping white noise buffer)
│   ├── windFilter (lowpass, 200-800Hz)
│   └── windGain (volume envelope)
└── One-Shot Synthesis
    ├── Collision (noise burst + sine, decaying)
    └── UI (sine/square oscillator tones)
```

### 1.3 Lifecycle
```
init()                   → Creates AudioContext + masterGain
loadEngineSamples(carId) → Fetches & decodes idle + accel WAVs for car, caches in sampleCache
loadTurboSamples(carId)  → Fetches & decodes whistle + flutter WAVs for turbo cars, caches in turboSampleCache
startRaceAudio()         → Loads samples if needed, creates sample-based engine + turbo + screech/wind nodes
stopRaceAudio()          → Fades out + stops all continuous nodes (50ms)
ensureContext()          → Auto-resumes suspended AudioContext (browser policy)
```

### 1.4 Browser Audio Policy
- AudioContext created on first user interaction
- `ensureContext()` resumes suspended context on every play call
- If audio fails to initialize, game continues silently
- No audio errors crash the game

## 2. Sound Categories

### 2.1 Engine Sound

Engine sound is **sample-based** using WAV loops per car, with real-time pitch-shifting via `playbackRate`.

#### Sample Loading
```
ENGINE_SAMPLE_PATHS = {
  'rossini-488':  { idle: 'assets/audio/engines/rossini-488/idle.wav',  accel: 'assets/audio/engines/rossini-488/accel.wav' },
  'weissach-gt3': { idle: 'assets/audio/engines/weissach-gt3/idle.wav', accel: 'assets/audio/engines/weissach-gt3/accel.wav' },
  'kaiju-gt-r':   { idle: 'assets/audio/engines/kaiju-gt-r/idle.wav',   accel: 'assets/audio/engines/kaiju-gt-r/accel.wav' },
  'stingray-z06': { idle: 'assets/audio/engines/stingray-z06/idle.wav', accel: 'assets/audio/engines/stingray-z06/accel.wav' }
}

TURBO_SAMPLE_PATHS = {
  'rossini-488':  { whistle: 'assets/audio/turbo/rossini-488/whistle.wav',  flutter: 'assets/audio/turbo/rossini-488/flutter.wav' },
  'kaiju-gt-r':   { whistle: 'assets/audio/turbo/kaiju-gt-r/whistle.wav',   flutter: 'assets/audio/turbo/kaiju-gt-r/flutter.wav' }
}
```

#### Playback Method (Per-Car)
Two AudioBufferSourceNodes loop simultaneously, crossfaded by RPM:

**Idle Loop:**
- Source: idle.wav (synthesized engine at low RPM)
- Loop: true
- Base playbackRate: 0.7
- Crossfade: full volume when rpmRatio < 0.3

**Accel Loop:**
- Source: accel.wav (synthesized engine at high RPM)
- Loop: true
- Base playbackRate: 0.7
- Crossfade: full volume when rpmRatio > 0.7

**Crossfade:**
```
crossfadeStart = 0.3  (30% of redline)
crossfadeEnd   = 0.7  (70% of redline)
idleMix  = 1 - t      (t = 0→1 in crossfade zone)
accelMix = t
```

**Pitch Shifting:**
```
playbackRate = 0.7 + rpmRatio × 0.8   (range: 0.7× to 1.5×)
```

#### Per-Car Sample Sources

| Car | Engine Type | Idle Source | Accel Source |
|-----|-------------|-------------|--------------|
| Rossini 488 | V8 Turbo | motorseamless01 (OpenGameArt CC0) | motorseamless03 |
| Weissach GT3 | Flat-6 NA | motorseamless05 | motorseamless07 |
| Kaiju GT-R | V6 Turbo | motorseamless09 | motorseamless11 |
| Stingray Z06 | V8 NA | motorseamless02 | motorseamless04 |

#### RPM Variation at Top End
When RPM approaches redline (>92% redline), a pitch wobble is added:
```
if (rpm / redline > 0.92):
    overRev = (rpmRatio - 0.92) / 0.08
    wobble = sin(rpm × 0.05) × overRev × 0.03
    playbackRate += wobble
```

#### Playback Rules
```
Trigger:      Continuous (while race active)
Playback:     Created fresh per race via startRaceAudio()
Pitch:        Per-car RPM-to-playbackRate mapping
Filter:       Lowpass, 600-2000Hz (follows RPM)
Volume:       engineVolume (0.6 default)
Ramp:         setTargetAtTime with 50ms time constant
Sample Cache: Samples cached per carId to avoid re-fetching
```

### 2.2 Turbo Sound (Turbo Cars Only)

Only active for cars with `aspiration === 'turbo'` (Rossini 488, Kaiju GT-R).

Turbo audio is **sample-based** using WAV files per car.

#### Turbo Sample Loading
```
TURBO_SAMPLE_PATHS = {
  'rossini-488':  { whistle: 'assets/audio/turbo/rossini-488/whistle.wav',  flutter: 'assets/audio/turbo/rossini-488/flutter.wav' },
  'kaiju-gt-r':   { whistle: 'assets/audio/turbo/kaiju-gt-r/whistle.wav',   flutter: 'assets/audio/turbo/kaiju-gt-r/flutter.wav' }
}
```

#### Turbo Whistle (Continuous Loop)
- Source: whistle.wav (loopable high-frequency sine sweep with harmonics)
- Loop: true
- Base playbackRate: 0.6 (idle)
- Max playbackRate: 1.6 (full boost)
- Formula: `playbackRate = 0.6 + boostLevel × 1.0`
- Volume: `boostLevel × 0.15 × engineVolume`
- Ramp: setTargetAtTime with 80ms time constant (volume), 100ms (pitch)
- Per-car variation:
  - **Rossini 488:** Smooth, refined — base 4.2kHz, sweep ±1.8kHz, gentle harmonics
  - **Kaiju GT-R:** Aggressive, raw — base 3.8kHz, sweep ±3.2kHz, prominent harmonics

#### Turbo Flutter (One-Shot)
Triggered when throttle is released while turbo is spooled:
```
Trigger:        prevThrottle > 0 AND throttle == 0 AND boostLevel > 0.3
Sound:          Per-car WAV one-shot playback (blow-off / flutter)
PlaybackRate:   0.9–1.1 (slight random variation)
Volume:         0.12 × engineVolume
Duration:       Per WAV length (~0.2-0.3s)
```
- Per-car variation:
  - **Rossini 488:** Subtle, clean blow-off — short descending tone
  - **Kaiju GT-R:** Pronounced flutter — "stu-tu-tu" staccato pattern

#### Turbo Spool-Up
```
boostLevel increases from 0→1 over turboLagTime seconds
boostLevel = clamp(timeSinceThrottleOn / turboLagTime, 0, 1)
Turbo whistle volume and playbackRate follow boostLevel
```

### 2.3 Exhaust Pops & Bangs

#### Synthesis Method
- Real-time square oscillator bursts (1-2 per trigger)
- Highpass filtered at 600Hz for bite
- Triggered during deceleration

#### Trigger Conditions
```
Exhaust Pop Triggers:
  prevThrottle > 0 AND throttle == 0 AND rpmRatio > 0.4
  Min interval: 0.15s between pops

Pop Parameters:
  Count:        1-2 pops per trigger (random)
  Delay:        40ms between pops
  Frequency:    200-500 Hz (randomized per pop)
  Volume:       0.06 × engineVolume
  Decay:        Exponential, 0.05s
  Filter:       Highpass 600Hz
```

### 2.4 Tire Screech

#### Synthesis Method
- **White noise** buffer (2 seconds, looped) generated at runtime
- Passed through **bandpass filter** (center frequency 1.5-3.5kHz)
- Filter frequency increases with slip intensity

#### Playback Rules
```
Trigger:      Slip angle > 5° AND grip < peakGrip × 0.8
Playback:     Looped noise, created fresh per race
Filter Freq:  1500 + intensity × 1500 Hz
Filter Q:     3
Volume:       min(1, intensity × 0.4) × engineVolume
Ramp:         setTargetAtTime with 20ms time constant
```

#### Intensity Curve
```
Slip 5°:   0.0 (threshold — no sound)
Slip 10°:  0.2
Slip 20°:  0.4
Slip 30°:  0.6
```

### 2.5 Wind Noise

#### Synthesis Method
- **White noise** buffer (2 seconds, looped) generated at runtime
- Passed through **lowpass filter** (200-800Hz)

#### Playback Rules
```
Trigger:      Speed > 0 km/h (always audible at speed)
Playback:     Looped noise, created fresh per race
Filter Freq:  200 + (speed / 250) × 600 Hz
Filter Q:     1
Volume:       min(0.15, speed / 200) × engineVolume
Ramp:         setTargetAtTime with 100ms time constant
```

#### Volume Curve
```
Speed 0:     0.0
Speed 50:    0.03
Speed 100:   0.06
Speed 200:   0.12
Speed 250:   0.15 (cap)
```

### 2.6 Collision Sounds

#### Synthesis Method
- Short **noise burst** (0.15s) with decaying envelope
- Plus a low **sine tone** (100-150Hz, 0.2s)
- Lowpass filtered noise at 2000Hz

#### Playback Rules
```
Trigger:     Collision event (contact detected)
Duration:    0.2-0.25s (exponential decay)
Frequency:   100 + random × 50 Hz (sine)
Volume:      0.3 × masterVolume (sine) + 0.25 × masterVolume (noise)
```

### 2.7 UI Sounds

| Sound | Trigger | Freq | Duration | Type | Volume |
|-------|---------|------|----------|------|--------|
| Click | Menu navigation | 600 Hz | 60ms | sine | 0.1 |
| Confirm | Selection confirmed | 800→1200 Hz | 80ms×2 | sine | 0.12/0.1 |
| Countdown Tick | 3, 2, 1 | 440 Hz | 150ms | square | 0.08 |
| Countdown Go | Race start | 880 Hz | 200ms | square | 0.12 |
| Race Complete | Cross finish | 523→659→784→1047 | 200ms each | sine | 0.1 |

## 3. Volume Management

### 3.1 Volume Architecture
```
Master Volume (0-1)
├── Engine Volume (0-1) — applied to engine, turbo, screech, wind, exhaust
├── Collision Volume — uses master only
└── UI Volume — uses master only
```

### 3.2 Settings Integration
- Master Volume: `settings.masterVolume` (0-100%)
- Engine Volume: `settings.engineVolume` (0-100%)
- Both updated in real-time via `setMasterVolume()` / `setEngineVolume()`
- Settings persisted to localStorage

### 3.3 Audio Suspend/Resume
- `suspend()` called when game pauses
- `resume()` called when game unpauses
- Prevents audio continuing while paused

## 4. Cross-Car Audio Variation

### 4.1 Engine Character by Car

| Car | Engine | Character | Sound Signature |
|-----|--------|-----------|-----------------|
| Rossini 488 | 3.9L TT V8 | Smooth, refined, slightly muffled by turbos | Medium pitch, clean tone |
| Weissach GT3 | 4.0L NA Flat-6 | High-revving, raw, mechanical | High pitch, metallic rasp |
| Kaiju GT-R | 3.8L TT V6 | Deep, throaty, turbo whoosh | Low-medium pitch, aggressive |
| Stingray Z06 | 5.5L NA V8 | Raw, screaming, instant | High pitch, flat-plane scream |

### 4.2 Idle Character
Each car has a distinct idle sound:
- **V8 Turbo (Rossini):** Smooth, slightly burbling idle (45 Hz base)
- **Flat-6 NA (Weissach):** Mechanical, rhythmic idle (55 Hz base)
- **V6 Turbo (Kaiju):** Deep, uneven idle with turbo whistle (50 Hz base)
- **V8 NA (Stingray):** Raw, aggressive idle (42 Hz base)

### 4.3 Deceleration Character
- **NA cars (GT3, Z06):** Engine braking sound, exhaust pops on lift-off
- **Turbo cars (488, GT-R):** Sample-based turbo flutter WAV on lift-off, muted engine braking

## 5. Performance

### 5.1 Audio Budget
- Max simultaneous continuous sounds: 5 (engine, turbo whistle, screech, wind, exhaust)
- Oscillators created per race, destroyed on race end
- Noise buffers: 2s each, looped (minimal memory)
- One-shot sounds: fire-and-forget, auto-disconnect

### 5.2 Memory
- Engine + turbo audio asset files: ~6MB total (engine samples + turbo samples)
- Runtime noise buffers: ~240KB total (3 buffers × 2s × 44.1kHz × float32)
- Total AudioNode count: ~20 during race (up from 15 with turbo)

### 5.3 Cleanup
- `stopRaceAudio()` fades + stops oscillators, nulls references
- `dispose()` closes AudioContext
- Prevents node accumulation across races
- All local references captured before nulling (prevents race conditions)

## 6. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| Engine sound plays | Audible during race, frequency tracks RPM |
| Engine sounds differ | Each car has distinct sonic character |
| Turbo whistle plays | Turbo cars show boost-linked whistle |
| Turbo flutter triggers | Audible on throttle release when boosted |
| Exhaust pops trigger | Pops on deceleration for all cars |
| NA cars sound raw | GT3/Z06 have instant, responsive engine tone |
| RPM variation at redline | Subtle pitch wobble near redline |
| Tire screech triggers | Audible during drift (slip > 5°) |
| Tire screech fades | Fades out when drift ends |
| Wind noise plays | Audible at high speed, volume scales |
| Collision sounds play | Audible on wall contact |
| UI sounds work | Clicks on menu navigation |
| Volume controls work | Sliders adjust volume in real-time |
| Audio pauses | No sound when game paused |
| Audio stops on race end | No lingering oscillators after race |
| No audio glitches | No pops, clicks, or stuttering |
| 60 FPS maintained | Audio doesn't cause frame drops |
