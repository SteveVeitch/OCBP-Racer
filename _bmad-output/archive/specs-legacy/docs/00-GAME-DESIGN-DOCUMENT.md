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
Select Car → Preview Car → Select Track → Race → See Results → Repeat
```

### 3.1 Race Structure
- Player races against AI opponents on a closed circuit
- Goal: Complete laps in the fastest time / finish in first place
- Race length: 3 laps (configurable post-MVP)
- Scoring: 10/7/5/2 points for 1st/2nd/3rd/4th

### 3.2 Progression
- Select from 4 available cars with distinct engines and handling
- Race on 6 tracks with distinct themes, difficulty, and environmental conditions
- Override weather conditions per race
- Beat your best time on the leaderboard
- Track wall hits (cleanest metric) and top speed

### 3.3 Demo / Attract Mode
- After 3 minutes of idle on the main menu, a demo race begins automatically
- Random car, track, weather, and time-of-day are selected each run
- A single AI car drives at a leisurely pace (aggressiveness 0.3)
- Minimal HUD shows car name, track name, and conditions
- Any input (keyboard, mouse, or gamepad) exits the demo and returns to the menu
- Demo mode can be disabled in Settings

## 4. Car Roster

| Car | Engine | Style | Handling Archetype |
|-----|--------|-------|-------------------|
| **Rossini 488** | 3.9L TT V8 | Italian Mid-Engine Exotic | Balanced, stable, beginner-friendly |
| **Weissach GT3** | 4.0L NA Flat-6 | German Track-Focused Sports | High grip, precise, rewards skill |
| **Kaiju GT-R** | 3.8L TT V6 | Japanese Turbocharged Super-GT | High power, loose rear, drifts easily |
| **Stingray Z06** | 5.5L NA V8 | American Mid-Engine Exotic | Agile, responsive, top speed focused |

Each car has distinct:
- Visual design (unique procedural silhouettes)
- Engine type (turbocharged vs naturally aspirated)
- Tuning parameters (see `07-CAR-SPEC.md`)
- Handling personality (see `02-PHYSICS-SPEC.md`)
- Audio character (see `05-AUDIO-SPEC.md`)

## 5. Track Design

**6 Tracks with Distinct Themes:**

| Track | Difficulty | Distance | Terrain | Setting |
|-------|-----------|----------|---------|---------|
| **Midnight Circuit** | Easy | 0.22 km | Urban | Night, Clear |
| **Sunset Boulevard** | Medium | 0.45 km | Coastal | Dusk, Clear |
| **Thunder Ridge** | Hard | 0.70 km | Mountain | Day, Clear |
| **Neon District** | Expert | 0.55 km | Urban | Night, Rain |
| **Iron Circuit** | Expert | 0.85 km | Industrial | Dawn, Fog |
| **Typhoon Pass** | Hard | 0.65 km | Mountain | Day, Rain |

See `06-TRACK-SPEC.md` for detailed specifications.

## 6. Controls

### 6.1 Input Methods
- Keyboard (WASD or Arrow Keys)
- Gamepad (Xbox/PlayStation layout)

### 6.2 Actions
- Throttle
- Brake / Reverse
- Steer Left / Right
- Pause
- Camera Switch (Chase → Cockpit → Windscreen → Hood → Bumper)

### 6.3 Rebindable Controls
All gameplay actions can be remapped via the settings UI.

See `03-INPUT-SPEC.md` for detailed mappings, response curves, and binding storage.

## 7. Camera

- 5 camera views: Chase, Cockpit, Windscreen, Hood, Bumper
- Chase: Third-person with spring follow, look-ahead, FOV increase with speed
- Cockpit: Interior driver seat view, spring follow, near-instant rotation tracking, no wall collision
- Windscreen: Interior view, wide FOV, minimal lag
- Hood: On-hood view, aggressive angle
- Bumper: Low bumper view, maximum speed sensation
- Camera wall collision in chase view
- Switchable via input (C key / Y button)

See `04-RENDERING-SPEC.md` for camera specifications.

## 8. Audio

### 8.1 Sound Effects
- Per-car engine synthesis (distinct sound per engine type)
- Turbo whistle and flutter (turbocharged cars)
- Exhaust pops and bangs (all cars)
- Tire screech (lateral slip)
- Wind noise (speed-dependent)
- Collision impacts (wall, car)
- UI sounds (menu navigation, race start)

### 8.2 Audio Character
- V8 Turbo (Rossini): Smooth, refined, turbo whoosh
- Flat-6 NA (Weissach): High-revving, raw, mechanical
- V6 Turbo (Kaiju): Deep, throaty, turbo flutter
- V8 NA (Stingray): Screaming, instant, flat-plane character

See `05-AUDIO-SPEC.md` for detailed specifications.

## 9. UI / HUD

### 9.1 In-Race HUD
- Speedometer gauge (160px analog dial, realistic style)
- Rev counter gauge (160px analog dial with redline zone)
- Turbo boost gauge (160px analog dial, turbo cars only)
- Lap counter
- Position indicator
- Mini-map (player + AI positions)
- Wrong way indicator

### 9.2 Menus
- Main menu
- Car selection (with 3D thumbnails, engine badges, stat bars)
- Car preview (3D model + full spec card, Back/Continue)
- Track selection (3-column grid, weather override)
- Race results (position, points, wall hits, top speed)
- Leaderboard (per-track + overall)
- Settings (volume, sensitivity, graphics, fog toggle, camera default, key bindings)

See `08-UI-SPEC.md` for detailed specifications.

## 10. Visual Style

- Semi-realistic PBR rendering
- Dynamic time-of-day lighting (dawn/day/dusk/night)
- HDR environment maps for skybox backgrounds and image-based lighting (Polyhaven CC0)
- PBR ground textures per terrain (ambientCG CC0) — color, normal, roughness maps
- Weather effects (rain, fog, storm)
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
- Day/night cycle during race
