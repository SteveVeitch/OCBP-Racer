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
├── Engine Synthesis (per-car config)
│   ├── Primary Oscillator (sawtooth/square, car-specific)
│   ├── Secondary Oscillator (sub-harmonic, car-specific)
│   ├── Engine Filter (lowpass, Q varies by car)
│   ├── Engine Gain (volume envelope)
│   └── Turbo Synthesis (if car has turbo)
│       ├── Turbo Whistle Oscillator (sine, 2-8kHz)
│       ├── Turbo Flutter Noise (bandpass noise)
│       └── Turbo Gain (boost-linked envelope)
├── Tire Screech Synthesis
│   ├── screechSource (looping white noise buffer)
│   ├── screechFilter (bandpass, 1.5-3.5kHz)
│   └── screechGain (volume envelope)
├── Wind Synthesis
│   ├── windSource (looping white noise buffer)
│   ├── windFilter (lowpass, 200-800Hz)
│   └── windGain (volume envelope)
├── Exhaust Synthesis
│   ├── popsBuffer (pre-generated noise bursts)
│   └── popsGain (volume envelope)
└── One-Shot Synthesis
    ├── Collision (noise burst + sine, decaying)
    └── UI (sine/square oscillator tones)
```

### 1.3 Lifecycle
```
init()              → Creates AudioContext + masterGain
startRaceAudio()    → Creates fresh engine/screech/wind nodes per race
stopRaceAudio()     → Fades out + stops all continuous oscillators (50ms)
ensureContext()     → Auto-resumes suspended AudioContext (browser policy)
```

### 1.4 Browser Audio Policy
- AudioContext created on first user interaction
- `ensureContext()` resumes suspended context on every play call
- If audio fails to initialize, game continues silently
- No audio errors crash the game

## 2. Sound Categories

### 2.1 Engine Sound

Engine synthesis is **per-car** based on `EngineDefinition` in the car config. Each engine type produces a distinct sonic character.

#### Synthesis Method (Per-Car)

Each engine has two oscillators mixed together, filtered for warmth:

**Oscillator 1 (Primary):**
- Waveform: sawtooth (V8), square (flat-6), or sawtooth (V6)
- Frequency: `baseFrequency + (rpm / redline) × (maxFrequency - baseFrequency)`

**Oscillator 2 (Sub-harmonic):**
- Waveform: square (always)
- Frequency: 0.5× primary frequency
- Volume: `harmonicContent × 0.15`

**Filter:**
- Type: Lowpass
- Q: `2 + roughness × 3` (higher Q = more resonant)
- Cutoff: follows primary frequency × 1.5

#### Per-Car Engine Profiles

| Car | Engine Type | Base Freq | Max Freq | Harmonic | Roughness | Filter Q |
|-----|-------------|-----------|----------|----------|-----------|----------|
| Rossini 488 | V8 Turbo | 45 Hz | 180 Hz | 0.7 | 0.3 | 2.9 |
| Weissach GT3 | Flat-6 NA | 55 Hz | 220 Hz | 0.5 | 0.1 | 2.3 |
| Kaiju GT-R | V6 Turbo | 50 Hz | 195 Hz | 0.6 | 0.4 | 3.2 |
| Stingray Z06 | V8 NA | 42 Hz | 175 Hz | 0.8 | 0.2 | 2.6 |

#### RPM-to-Frequency Mapping
```
frequency = baseFrequency + (rpm / redline) × (maxFrequency - baseFrequency)

Rossini 488:   45 Hz (idle) → 180 Hz (redline 8000)
Weissach GT3:  55 Hz (idle) → 220 Hz (redline 9000)
Kaiju GT-R:    50 Hz (idle) → 195 Hz (redline 7000)
Stingray Z06:  42 Hz (idle) → 175 Hz (redline 8600)
```

#### RPM Variation at Top End
When RPM approaches redline (>90% redline), a subtle pitch wobble is added:
```
if (rpm / redline > 0.9):
    wobbleAmount = 0.02 × sin(time × 15)  // ±2% pitch wobble at 15Hz
    frequency *= (1 + wobbleAmount)
```

#### Playback Rules
```
Trigger:      Continuous (while race active)
Playback:     Created fresh per race via startRaceAudio()
Frequency:    Per-car RPM mapping (see table)
Filter:       Lowpass, cutoff follows frequency
Volume:       0.05 + (rpm / redline) × engineVolume
Ramp:         setTargetAtTime with 50ms time constant
```

### 2.2 Turbo Sound (Turbo Cars Only)

Only active for cars with `aspiration === 'turbo'` (Rossini 488, Kaiju GT-R).

#### Turbo Whistle
```
Type:           Sine oscillator
Frequency:      2000 + boostLevel × 6000 Hz (2-8kHz range)
Volume:         boostLevel × 0.06 × engineVolume
Ramp:           setTargetAtTime with 100ms time constant
```

#### Turbo Flutter (Blow-Off)
Triggered when throttle is released while turbo is spooled:
```
Trigger:        Throttle goes from >0.5 to <0.1 while boostLevel > 0.5
Sound:          Bandpass-filtered noise burst
Filter Freq:    3000 Hz (decaying to 800 Hz over 0.3s)
Filter Q:       5
Duration:       0.3s (exponential decay)
Volume:         0.15 × engineVolume
```

#### Turbo Spool-Up
```
boostLevel increases from 0→1 over turboLagTime seconds
boostLevel = clamp(timeSinceThrottleOn / turboLagTime, 0, 1)
Turbo whistle volume and frequency follow boostLevel
```

### 2.3 Exhaust Pops & Bangs

#### Synthesis Method
- Pre-generated buffer of 8-12 short noise bursts (5-15ms each)
- Lowpass filtered at 2000Hz for warmth
- Triggered during deceleration or gear shifts (simulated)

#### Trigger Conditions
```
Exhaust Pop Triggers (any of):
  1. Throttle released from >70% while RPM > 50% redline
  2. Speed drops rapidly (>20 km/h deceleration in 0.5s)
  3. Random chance during engine braking (1% per frame when braking + high RPM)

Pop Parameters:
  Duration:     30-80ms per burst
  Frequency:    800-1500 Hz (randomized per pop)
  Volume:       0.04-0.08 × engineVolume
  Decay:        Exponential, 0.05s time constant
  Polys:        Up to 3 simultaneous pops
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
- **Turbo cars (488, GT-R):** Turbo flutter on lift-off, muted engine braking

## 5. Performance

### 5.1 Audio Budget
- Max simultaneous continuous sounds: 5 (engine, turbo whistle, screech, wind, exhaust)
- Oscillators created per race, destroyed on race end
- Noise buffers: 2s each, looped (minimal memory)
- One-shot sounds: fire-and-forget, auto-disconnect

### 5.2 Memory
- Zero audio asset files on disk
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
