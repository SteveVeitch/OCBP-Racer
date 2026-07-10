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
├── Engine Synthesis
│   ├── engineOsc (sawtooth oscillator, base frequency)
│   ├── engineOsc2 (square oscillator, sub-octave)
│   ├── engineFilter (lowpass, Q=2)
│   └── engineGain (volume envelope)
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

#### Synthesis Method
- Two oscillators mixed together:
  - Primary: **sawtooth** waveform, base frequency 40-200Hz
  - Secondary: **square** waveform, 0.5× primary frequency, 15% volume
- Both pass through a **lowpass filter** (Q=2) for warmth
- Frequency mapped from RPM: `freq = 40 + (rpm / 7500) × 160`

#### Playback Rules
```
Trigger:      Continuous (while race active)
Playback:     Created fresh per race via startRaceAudio()
Frequency:    40-200Hz mapped from RPM (800-7500)
Filter:       Lowpass, cutoff follows frequency
Volume:       0.05 + (rpm / 7500) × engineVolume
Ramp:         setTargetAtTime with 50ms time constant
```

#### RPM-to-Frequency Mapping
```
RPM 800  (idle)  →  48 Hz
RPM 4000 (mid)   → 125 Hz
RPM 7500 (max)   → 200 Hz
```

### 2.2 Tire Screech

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

### 2.3 Wind Noise

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

### 2.4 Collision Sounds

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

### 2.5 UI Sounds

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
├── Engine Volume (0-1) — applied to engine, screech, wind
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

Engine frequency range is the same for all cars (40-200Hz). Car personality comes from distinct physics (RPM curves, power delivery) rather than separate audio parameters.

| Car | RPM Range | Feel |
|-----|-----------|------|
| Phantom GT | 800-7500 | Smooth, refined |
| Viper RS | 800-7500 | High-revving |
| Inferno SS | 800-7500 | Deep, throaty |
| AeroVen TT | 800-7500 | Responsive |

## 5. Performance

### 5.1 Audio Budget
- Max simultaneous continuous sounds: 3 (engine, screech, wind)
- Oscillators created per race, destroyed on race end
- Noise buffers: 2s each, looped (minimal memory)
- One-shot sounds: fire-and-forget, auto-disconnect

### 5.2 Memory
- Zero audio asset files on disk
- Runtime noise buffers: ~160KB total (2 buffers × 2s × 44.1kHz × float32)
- Total AudioNode count: ~15 during race

### 5.3 Cleanup
- `stopRaceAudio()` fades + stops oscillators, nulls references
- `dispose()` closes AudioContext
- Prevents node accumulation across races

## 6. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| Engine sound plays | Audible during race, frequency tracks RPM |
| Engine pitch changes | Noticeable pitch increase with speed |
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
