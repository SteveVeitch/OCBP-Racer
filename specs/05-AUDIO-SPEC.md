# OCBP Racer — Audio Specification

## 1. Audio Architecture

### 1.1 Technology
- **Library:** Howler.js
- **Format:** MP3 (fallback) + WebM/OGG (preferred)
- **Channels:** Stereo (MVP), Spatial 3D (post-MVP)
- **Mixing:** Single bus architecture (MVP)

### 1.2 Audio Manager
```
AudioManager
├── SoundPool (pre-loaded sounds)
├── VolumeControl (master, sfx)
├── SoundTrigger (event → sound mapping)
└── DeviceDetection (audio context init on user gesture)
```

## 2. Sound Categories

### 2.1 Engine Sound

#### Sample Set
- 3-5 engine sound samples per car
- Each sample: loopable engine tone at fixed RPM
- Crossfade between samples based on RPM

#### Playback Rules
```
Trigger:     Continuous (while car exists)
Playback:    Looped
Pitch:       Mapped to RPM
Volume:      Mapped to throttle position
Pan:         Center (MVP), Spatial (post-MVP)
```

#### RPM-to-Pitch Mapping
```
Min RPM:     800  → Pitch: 0.5
Idle RPM:    1000 → Pitch: 0.6
Mid RPM:     4000 → Pitch: 1.0
Max RPM:     7500 → Pitch: 1.5
Overrev:     8000+ → Pitch: 1.6 + stutter
```

#### Volume Curve
```
Idle (no throttle): 0.3
Cruising:          0.5
Full throttle:     0.8
```

### 2.2 Tire Screech

#### Sample Set
- 2-3 screech variations
- Loopable, 1-2 seconds each
- Clean screech + gritty screech

#### Playback Rules
```
Trigger:     Slip angle > 10°
Playback:    Looped while condition met
Volume:      Mapped to slip angle (0→1 over 10°-30°)
Crossfade:   Between samples based on slip intensity
Stop:        When slip angle < 8° (with fade out)
```

#### Volume Curve
```
Slip 10°: 0.0 (threshold)
Slip 20°: 0.5
Slip 30°: 1.0
```

### 2.3 Wind Noise

#### Sample Set
- 1 loopable wind sample (white noise, filtered)

#### Playback Rules
```
Trigger:     Speed > 30 m/s (~108 km/h)
Volume:      Mapped to speed
Filter:      Low-pass cutoff increases with speed
```

#### Volume Curve
```
Speed 0:    0.0
Speed 30:   0.1 (threshold)
Speed 60:   0.3
Speed 80+:  0.5
```

### 2.4 Collision Sounds

#### Sample Set
- Wall impact: 3 variations (light, medium, heavy)
- Car-to-car: 2 variations
- Barrier scrape: 1 loopable sample

#### Playback Rules
```
Trigger:     Collision event (Rapier contact)
Volume:      Mapped to impact force
Pitch:       ±10% random variation
Priority:    Limit to 3 simultaneous collisions
```

#### Volume Curve
```
Force < 1000 N:   0.0 (ignore)
Force 1000-5000:  0.3 - 0.6
Force > 5000:     0.8 - 1.0
```

### 2.5 UI Sounds

| Sound | Trigger | Description |
|-------|---------|-------------|
| Menu Navigate | Menu selection change | Soft click |
| Menu Confirm | Selection confirmed | Positive chime |
| Menu Back | Cancel / back | Subtle whoosh |
| Countdown Tick | Race countdown (3, 2, 1) | Beep |
| Countdown Go | Race start | Higher beep |
| Race Complete | Cross finish line | Celebration sting |

## 3. Volume Management

### 3.1 Volume Buses
```
Master Volume:     1.0 (user control)
├── SFX Volume:    0.8 (default)
│   ├── Engine:    0.6
│   ├── Tires:     0.7
│   ├── Wind:      0.4
│   ├── Collision: 0.8
│   └── UI:        0.5
└── Music Volume:  0.5 (post-MVP)
```

### 3.2 Ducking
- No ducking in MVP (no music to duck)
- Post-MVP: SFX duck music during speech/important events

## 4. Sound Playback Patterns

### 4.1 Continuous Sounds
- Engine sound: always playing, pitch/volume modulated
- Wind: playing when speed > threshold
- Tire screech: playing when slipping

### 4.2 One-Shot Sounds
- Collision impacts
- UI navigation
- Countdown beeps

### 4.3 Sound Pool
- Pre-load all sounds on game start
- Reuse audio nodes for continuous sounds
- Limit concurrent one-shots to prevent voice stealing

## 5. Audio Initialization

### 5.1 Browser Audio Policy
- AudioContext created on first user interaction (click/keypress)
- All sounds queued until context is active
- Show "Click to start" prompt if needed

### 5.2 Fallback
- If audio fails to initialize, game continues silently
- No audio errors crash the game

## 6. Cross-Car Audio Variation

Each car has unique engine samples:
| Car | Engine Character |
|-----|-----------------|
| Phantom GT | Refined V8 rumble |
| Viper RS | High-revving flat-6 |
| Inferno SS | Deep V10 growl |
| AeroVen TT | Turbo V12 whine |

## 7. Audio File Structure

```
assets/audio/
├── engine/
│   ├── phantom-gt/
│   │   ├── engine-800rpm.mp3
│   │   ├── engine-3000rpm.mp3
│   │   └── engine-7000rpm.mp3
│   ├── viper-rs/
│   ├── inferno-ss/
│   └── aeroven-tt/
├── tires/
│   ├── screech-01.mp3
│   ├── screech-02.mp3
│   └── screech-gritty.mp3
├── sfx/
│   ├── wall-impact-light.mp3
│   ├── wall-impact-medium.mp3
│   ├── wall-impact-heavy.mp3
│   ├── car-collision-01.mp3
│   ├── car-collision-02.mp3
│   └── wind-loop.mp3
├── ui/
│   ├── navigate.mp3
│   ├── confirm.mp3
│   ├── back.mp3
│   ├── countdown-tick.mp3
│   ├── countdown-go.mp3
│   └── race-complete.mp3
└── (Placeholder folder for future music/)
```

## 8. Performance

### 8.1 Audio Budget
- Max simultaneous sounds: 16
- Max continuous sounds: 4 (engine × 2, wind, tires)
- Audio decode: pre-loaded, not on-demand

### 8.2 Memory
- Total audio assets: < 20 MB
- Individual sample: < 500 KB
- Engine samples: < 200 KB each (loopable)

## 9. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| Engine sound plays | Audible on car selection and race |
| Engine pitch changes | Noticeable pitch increase with RPM |
| Tire screech triggers | Audible during drift |
| Tire screech fades | Fades out when drift ends |
| Wind noise triggers | Audible at high speed |
| Collision sounds play | Audible on wall contact |
| UI sounds work | Clicks on menu navigation |
| Volume controls work | Sliders adjust volume in real-time |
| No audio glitches | No pops, clicks, or stuttering |
| 60 FPS maintained | Audio doesn't cause frame drops |
