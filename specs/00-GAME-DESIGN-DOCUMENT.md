# OCBP Racer — Game Design Document

## 1. Overview

**Title:** OCBP Racer
**Genre:** Arcade Street Racing
**Platform:** Desktop Web Browser (WebGL2)
**Players:** Single-player (MVP), Online Multiplayer (post-MVP)
**Target Audience:** Broad — accessible to casual players, deep enough for enthusiasts

## 2. Vision Statement

A browser-based street racing game featuring exotic sports cars with semi-realistic visuals and physics that feel authentic but remain accessible. Players should feel like skilled drivers without needing a sim rig.

## 3. Core Gameplay Loop

```
Select Car → Select Track → Race → See Results → Repeat
```

### 3.1 Race Structure
- Player races against AI opponents on a closed circuit
- Goal: Complete laps in the fastest time / finish in first place
- Race length: 3-5 laps (configurable post-MVP)

### 3.2 Progression (MVP)
- Select from 4 available cars
- Race on 1 track
- Beat your best time
- No unlock system in MVP

### 3.3 Progression (Post-MVP)
- Unlock new cars and tracks
- Championship mode
- Time trial leaderboards
- Online multiplayer

## 4. Car Roster (MVP)

| Car | Style | Handling Archetype |
|-----|-------|-------------------|
| **Phantom GT** | Grand Tourer | Balanced, stable, beginner-friendly |
| **Viper RS** | Track-Focused Sports | High grip, precise, rewards skill |
| **Inferno SS** | Muscle-Influenced Exotic | High power, loose rear, drifts easily |
| **AeroVen TT** | Lightweight Hypercar | Agile, responsive, top speed focused |

Each car has distinct:
- Visual design (exotic sports car styling)
- Tuning parameters (see `07-CAR-SPEC.md`)
- Handling personality (see `02-PHYSICS-SPEC.md`)

## 5. Track Design (MVP)

**Single Track: "Midnight Circuit"**
- Urban street circuit theme
- Mix of straights, sweepers, and tight chicanes
- 1.5 - 2.0 km total length
- Day/night: Night setting with city lighting
- Surface: Dry asphalt

See `06-TRACK-SPEC.md` for detailed specifications.

## 6. Controls

### 6.1 Input Methods
- Keyboard (WASD or Arrow Keys)
- Gamepad (Xbox/PlayStation layout)

### 6.2 Actions
- Throttle
- Brake / Reverse
- Steer Left / Right
- Handbrake (post-MVP)

See `03-INPUT-SPEC.md` for detailed mappings and response curves.

## 7. Camera

- Third-person chase camera
- Look-ahead based on velocity
- Spring/damper following
- FOV increase with speed
- Smooth rotation during drift

See `04-RENDERING-SPEC.md` for camera specifications.

## 8. Audio

### 8.1 MVP Sound Effects
- Engine sound (pitch-mapped to RPM)
- Tire screech (lateral slip)
- Wind noise (speed-dependent)
- Collision impacts (wall, car)
- UI sounds (menu navigation, race start)

### 8.2 Post-MVP
- Spatial 3D audio
- Music soundtrack
- Crowd/ambient sounds

See `05-AUDIO-SPEC.md` for detailed specifications.

## 9. UI / HUD

### 9.1 In-Race HUD
- Speedometer (digital + analog)
- Lap counter
- Position indicator
- Mini-map (post-MVP)

### 9.2 Menus
- Main menu
- Car selection
- Track selection
- Race results
- Settings

See `08-UI-SPEC.md` for detailed specifications.

## 10. Visual Style

- Semi-realistic PBR rendering
- Night urban aesthetic
- Exotic sports car focus
- Clean, readable visuals over photorealism
- Post-processing: bloom, subtle motion blur

See `04-RENDERING-SPEC.md` for rendering pipeline details.

## 11. Performance Targets

| Metric | Target |
|--------|--------|
| Frame Rate | 60 FPS |
| Resolution | 1920x1080 (scalable) |
| Load Time | < 5 seconds |
| Browser Support | Chrome, Firefox, Edge, Safari (latest 2 versions) |

## 12. Out of Scope (MVP)

- Damage / deformation system
- Manual transmission
- Multiplayer
- Music soundtrack
- Mobile / touch controls
- Car customization / tuning
- Weather effects
- Day/night cycle
