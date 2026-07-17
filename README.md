# OCBP Racer

A browser-based arcade street racing game featuring exotic sports cars with semi-realistic physics. Built with Three.js, Rapier.js, and TypeScript.

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-7.x-blue)
![Three.js](https://img.shields.io/badge/Three.js-r185-black)
![Rapier.js](https://img.shields.io/badge/Rapier.js-0.19.3-purple)

## Play

### Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### Standalone Build (no npm required to run)

Build a self-contained version that can run with just Python or Node.js — no npm install needed.

```bash
# Build the standalone package
build-standalone.bat
```

This produces a `dist/` folder with everything bundled. To run:

```bash
cd dist
serve.bat
```

Or manually:

```bash
cd dist
python -m http.server 8000
# Open http://localhost:8000
```

**Requirements to run:** Python 3.x or Node.js (just for the HTTP server — the game itself is pure browser). WASM physics requires an HTTP server; `file://` will not work.

**To redistribute:** Copy the entire `dist/` folder. Recipients just need Python or Node.js and a modern browser.

## Test Harness

Run the automated test suite:

```
http://localhost:3000?test
```

127 tests validate all game systems. Click the results overlay to start the game.

## How to Play

### Controls

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Accelerate | W / ↑ | RT (Right Trigger) |
| Brake / Reverse | S / ↓ | LT (Left Trigger) |
| Steer Left | A / ← | Left Stick ← |
| Steer Right | D / → | Left Stick → |
| Pause | Escape | Start |
| Camera | C | Y |
| Confirm | Enter / Space | A |
| Back | Escape / Backspace | B |

All gameplay actions are **rebindable** via the Settings menu.

### Reverse Gear

Hold **S** (or **LT**) while nearly stopped to reverse. Steering directions remain intuitive (A = left, D = right) even when reversing.

### Camera Views

Press **C** (or **Y**) to cycle through camera views:

| View | Description |
|------|-------------|
| Chase | Third-person, spring follow, look-ahead |
| Windscreen | Interior view, direct attach, wide FOV |
| Hood | On-hood, direct attach, aggressive angle |
| Bumper | Low, direct attach, maximum speed sensation |

### Game Flow

```
Main Menu → Car Select → Car Preview → Track Select → Countdown → Race → Results → Repeat
```

### Demo / Attract Mode

After 1 minute of inactivity on the main menu, a demo race begins automatically with a random car, track, weather, and time-of-day. A single AI car drives at a leisurely pace. Press any key to return to the menu. Can be disabled in Settings.

## The Cars

| Car | Engine | Top Speed | Personality |
|-----|--------|-----------|-------------|
| **Rossini 488** | 3.9L TT V8 | 235 km/h | Balanced, stable, beginner-friendly |
| **Weissach GT3** | 4.0L NA Flat-6 | 245 km/h | Highest grip, precise, rewards skill |
| **Kaiju GT-R** | 3.8L TT V6 | 250 km/h | High power, loose rear, drifts easily |
| **Stingray Z06** | 5.5L NA V8 | 265 km/h | Lightest, fastest, agile |

Each car has distinct handling, engine sound, and turbo behavior. Turbocharged cars (Rossini 488, Kaiju GT-R) exhibit throttle lag, while NA cars (Weissach GT3, Stingray Z06) respond instantly.

### Car Stats

| Stat | Rossini 488 | Weissach GT3 | Kaiju GT-R | Stingray Z06 |
|------|------------|-------------|------------|-------------|
| Power | ████████░░ | █████████░ | ██████████ | ███████░░░ |
| Grip | ████████░░ | ██████████ | ██████░░░░ | █████████░ |
| Speed | ████████░░ | █████████░ | █████████░ | ██████████ |
| Drift | ███████░░░ | █████░░░░░ | ██████████ | ██████░░░░ |

## The Tracks

| Track | Difficulty | Distance | Terrain | Setting |
|-------|-----------|----------|---------|---------|
| **Midnight Circuit** | Easy | 0.22 km | Urban | Night, Clear |
| **Sunset Boulevard** | Medium | 0.45 km | Coastal | Dusk, Clear |
| **Thunder Ridge** | Hard | 0.70 km | Mountain | Day, Clear |
| **Neon District** | Expert | 0.55 km | Urban | Night, Rain |
| **Iron Circuit** | Expert | 0.85 km | Industrial | Dawn, Fog |
| **Typhoon Pass** | Hard | 0.65 km | Mountain | Day, Rain |

Each track has distinct terrain-themed decorations (buildings, trees, rocks, industrial structures), street light density, and default weather/time-of-day conditions. Weather can be overridden per race.

### Weather & Environment

- **4 weather presets**: Clear, Rain, Fog, Storm — each modifies grip, drag, braking, and steering
- **4 time-of-day presets**: Dawn, Day, Dusk, Night — each sets ambient/directional lighting, fog, and sky color
- **Rain particles**: Up to 3000 instanced rain drops during rain/storm
- Environmental modifiers apply equally to player and AI for fair racing

## Scoring & Leaderboard

### Race Points

| Position | Points |
|----------|--------|
| 1st | 10 |
| 2nd | 7 |
| 3rd | 5 |
| 4th | 2 |

### Cleanest Rating
- Wall hits tracked per race
- Fewer wall hits = cleaner race
- Leaderboard shows best time, wall hits, and top speed per track

## Settings

| Setting | Description |
|---------|-------------|
| Master Volume | Overall audio volume |
| Engine Volume | Engine + procedural sound volume |
| Steer Sensitivity | Steering response curve |
| Speed Unit | MPH or KPH display (internal always km/h) |
| Graphics Quality | Bloom strength + pixel ratio (Low/Med/High) |
| Fog Toggle | Enable/disable fog (for testing) |
| Camera Default | Starting camera view |
| Demo Mode | Enable/disable attract mode (on/off) |
| Release Channel | Green = released tracks only, Blue = includes unreleased tracks |
| Key Bindings | Rebind all gameplay actions |

Settings are persisted to localStorage.

## Release Channels

Cars and tracks are released in two channels:

- **Green (released):** Available to all players.
- **Blue (unreleased):** In development, only visible when Release Channel is set to "Blue" in Settings.

| Car | Channel |
|-----|---------|
| Rossini 488 | Green |
| Weissach GT3 | Blue |
| Kaiju GT-R | Blue |
| Stingray Z06 | Blue |

| Track | Channel |
|-------|---------|
| Midnight Circuit | Green |
| Sunset Boulevard | Blue |
| Thunder Ridge | Blue |
| Neon District | Blue |
| Iron Circuit | Blue |
| Typhoon Pass | Blue |

## Technical Architecture

### Tech Stack

- **Three.js r185** — WebGL2 rendering with PBR materials, bloom post-processing
- **Rapier.js 0.19.3** — WASM-accelerated rigid body physics
- **Web Audio API** — Procedural audio synthesis (no audio files)
- **TypeScript 7.x** — Type-safe development
- **Vite 5.4** — Fast dev server and bundling

### Physics Model

The game uses an arcade-realistic physics model:

- **Engine force** applied as impulse (N·s per step), diminishing with speed
- **Turbo lag** — delayed power delivery for turbocharged cars (0.15-0.25s)
- **Throttle ramp-up** — 2.5/s from 0 to full power (prevents snap)
- **Linear drag** opposes motion (`dragCoeff × speed × 0.01`)
- **Downforce** increases grip at speed
- **Grip/slip model** — triangle curve from slip angle to grip coefficient
- **Environmental physics** — weather modifiers multiply grip, drag, braking, and steering forces
- **Body roll** — mesh tilts ±5° in corners based on lateral velocity
- **Wheel animation** — spin with speed, front wheels steer
- **Reverse gear** with intuitive steering reversal
- **NaN guard** resets car on physics corruption

Physics runs at a fixed 120 Hz timestep with accumulator pattern.

### Rendering

- Dynamic time-of-day lighting (dawn/day/dusk/night)
- **HDR environment maps** — ambientCG 4K EXR skyboxes with image-based lighting for realistic car paint reflections
- **PBR ground textures** — ambientCG CC0 materials per terrain (asphalt, rock, concrete, pebbles) with color/normal/roughness maps
- Weather effects (rain particles, fog density)
- ACES Filmic tone mapping (exposure 0.7)
- Ambient + directional lighting (dynamic via EnvironmentManager presets)
- 20+ street lights per track (point lights, warm orange) — night tracks only
- Car headlights/taillights — toggleable, off on day tracks
- Car taillights (point lights, red)
- **Bloom post-processing** (UnrealBloomPass)
- **Camera wall collision** — raycast prevents camera clipping
- **Rain particles** — 3000-instance InstancedMesh
- Terrain-themed decorations (buildings, trees, rocks, industrial structures)
- Tire smoke particles during drift
- Body roll and wheel animation
- PBR materials (metalness/roughness workflow)

### Car Mesh

Each car uses a GLTF model for detailed body geometry with procedural wheels and lighting:
- GLTF body models with per-car paint tinting
- 4 procedural spinning wheels (tire + rim detail)
- Headlights and taillights with emissive materials
- Spot/point lights attached to car group for shadow casting
- Headlights off on day tracks, on at night/dusk/dawn

### AI

3 AI opponents with 3-state behavior:
- **STARTING** — Cautious launch with throttle ramp and 3-second delay
- **RACING** — Normal racing with corner speed reduction, 5m car avoidance
- **RECOVERING** — Post-crash state, cuts throttle, steers away from obstacles
- Racing line tracking via closest spline point
- Independent lap progress tracking

### Input

- Keyboard (WASD/Arrow keys) and gamepad support
- Dead zone: 0.15 (gamepad)
- Steering sensitivity curve: exponent 1.4
- Hot-plug detection for gamepads
- Correct steering in reverse (A=left, D=right)
- **Rebindable controls** — all gameplay actions remappable
- Window blur handling — clears keys, auto-pauses

### Audio

- 100% procedural synthesis via Web Audio API — no audio files
- **Per-car engine synthesis** — distinct sound per engine type
- **Turbo whistle** — boost-linked sine oscillator (2-8kHz)
- **Turbo flutter** — bandpass noise burst on throttle release
- **Exhaust pops** — noise bursts on deceleration
- **RPM wobble** — pitch variation near redline
- Tire screech: bandpass-filtered white noise, triggered by slip angle
- Wind: lowpass-filtered white noise, scales with speed
- Collision: noise burst + sine tone with decay
- UI: sine/square tones for navigation, countdown, race complete

### UI

- HTML/CSS overlay on Three.js canvas
- Neon green (#00ff88) + hot pink (#ff3366) + gold (#ffcc00) design system
- Rajdhani font (Google Fonts)
- Screens: Main Menu, Car Select, Car Preview, Track Select, Countdown, HUD, Pause, Results, Settings, Leaderboard, Demo
- **Car selection** — static 3D thumbnails, engine badges, stat bars
- **HUD gauges** — realistic analog speedometer, rev counter, turbo boost gauge (160px canvas dials)
- **Settings menu** — two-column arcade layout, volume, sensitivity, speed unit, graphics, fog toggle, camera default, release channel, key bindings
- **Leaderboard** — per-track + overall best times, wall hits, top speed (75% width, vertical tabs)
- **Mini-map** — player + AI positions during race
- **Scoring** — 10/7/5/2 points per position
- **Responsive scaling** — CSS transform scales UI to any resolution
- **Settings persistence** — saved to localStorage
- Centered flexbox layout
- Loading screen with CSS spinner

## Project Structure

```
OCBP Racer/
├── specs/                      # SDD specification documents
├── assets/                     # Game assets
│   ├── models/                 # GLTF car models (Sketchfab, CC licenses)
│   ├── hdr/                    # HDR environment maps (Polyhaven, CC0)
│   └── textures/               # PBR ground textures (ambientCG, CC0)
├── public/                     # Static assets (Rapier WASM)
├── src/
│   ├── main.ts                 # Entry point
│   ├── test-harness.ts         # 118 automated tests
│   ├── core/
│   │   ├── Game.ts             # Main game loop + race logic
│   │   └── StateMachine.ts     # Game state transitions
│   ├── input/
│   │   └── InputManager.ts     # Keyboard + gamepad input
│   ├── physics/
│   │   ├── PhysicsWorld.ts     # Rapier.js WASM wrapper
│   │   └── CarController.ts    # Car physics, grip/slip, turbo lag, env modifiers
│   ├── rendering/
│   │   ├── CameraController.ts # 4 camera views + spring follow + wall collision
│   │   ├── ParticleSystem.ts   # Tire smoke particles
│   │   ├── WeatherParticleSystem.ts  # Rain particles (InstancedMesh)
│   │   └── MiniMap.ts          # Track overlay with car positions
│   ├── audio/
│   │   └── AudioManager.ts     # Per-car engine synthesis, turbo, exhaust
│   ├── cars/
│   │   ├── CarConfigs.ts       # 4 car definitions with engines
│   │   └── CarFactory.ts       # GLTF models + procedural wheels, paint tinting
│   ├── track/
│   │   ├── Track.ts            # Track logic + checkpoints
│   │   ├── TrackBuilder.ts     # Procedural road + barriers + cleanup
│   │   ├── TrackDefinitions.ts # 6 track definitions with control points
│   │   └── SplinePath.ts       # Catmull-Rom spline
│   ├── environment/
│   │   ├── EnvironmentManager.ts     # Lighting, fog, sky, decorations
│   │   ├── TimeOfDayPresets.ts       # 4 presets (dawn/day/dusk/night)
│   │   ├── WeatherPresets.ts         # 4 presets (clear/rain/fog/storm)
│   │   └── EnvironmentModifiers.ts   # Physics multiplier structs
│   ├── ai/
│   │   └── AIController.ts     # AI 3-state behavior + difficulty levels
│   └── ui/
│       └── UIManager.ts        # HTML/CSS overlay UI + leaderboard
├── dist/                       # Standalone build output
│   ├── index.html              # Production entry point
│   ├── rapier_wasm3d_bg.wasm   # Physics engine WASM binary
│   ├── serve.bat               # One-click server launcher
│   ├── build-standalone.bat    # Rebuild script
│   └── assets/                 # Bundled JS + GLTF models
├── build-standalone.bat        # Build standalone package
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Development

### Prerequisites

- Node.js 18+
- Modern browser (Chrome, Firefox, Edge, Safari — latest 2 versions)

### Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production (Vite)
npm run preview      # Preview production build
build-standalone.bat # Build standalone dist/ (no npm needed to run)
```

### Test Harness

```bash
npm run dev
# Open http://localhost:3000?test
```

## Specifications

The game is designed using a comprehensive Software Design Document (SDD) system:

| Spec | Description |
|------|-------------|
| `00-GAME-DESIGN-DOCUMENT.md` | Game overview, vision, core loop |
| `01-TECHNICAL-ARCHITECTURE.md` | Tech stack, file structure, data flow |
| `02-PHYSICS-SPEC.md` | Physics model, car forces, grip model |
| `03-INPUT-SPEC.md` | Input mapping, rebindable controls, dead zones |
| `04-RENDERING-SPEC.md` | Rendering pipeline, 4 camera views, materials |
| `05-AUDIO-SPEC.md` | Per-car engine synthesis, turbo, exhaust pops |
| `06-TRACK-SPEC.md` | 6 tracks, checkpoints, wrong-way detection |
| `07-CAR-SPEC.md` | Car roster, engines, turbo lag, procedural meshes |
| `08-UI-SPEC.md` | UI screens, scoring, leaderboard, settings |
| `09-ASSET-PIPELINE.md` | Asset workflow, placeholder strategy |
| `10-EPIC-ROADMAP.md` | Build phases, completion status |
| `11-TEST-HARNESS.md` | Test suite documentation |

## 3D Model Credits

Car body models are sourced from Sketchfab under Creative Commons licenses:

| Car | Model | Author | License |
|-----|-------|--------|---------|
| Rossini 488 | [2018 Ferrari 488 GT3](https://sketchfab.com/3d-models/2018-ferrari-488-gt3-bb14ee3833564f349a317d704a506cd3) | Ddiaz Design | CC-BY-4.0 |
| Weissach GT3 | [2022 Porsche 911 GT3 (992)](https://sketchfab.com/3d-models/2022-porsche-911-gt3-992-ba01afbaf32846e598db315be3507db3) | Ddiaz Design | CC-BY-4.0 |
| Kaiju GT-R | [Nissan GT-R R35 Nismo](https://sketchfab.com/3d-models/nissan-gt-r-r35-nismo-wwwvecarzcom-9cfbe4727b7f4af0a11772687c4a1f59) | vecarz | CC-BY-4.0 |
| Stingray Z06 | [2020 Chevrolet Corvette C8 Stingray](https://sketchfab.com/3d-models/2020-chevrolet-corvette-c8-stingray-f59b9f961c9b48c9b0f8cb59c6a345aa) | Ddiaz Design | CC-BY-4.0 |

## Other 3rd-Party Assets

| Asset | Source | Author | License |
|-------|--------|--------|---------|
| HDR Environment Maps | [ambientCG](https://ambientcg.com/) (dawn, day, dusk, night) | ambientCG | CC0 1.0 |
| PBR Ground Textures | [ambientCG](https://ambientcg.com/) (urban, coastal, mountain, industrial) | ambientCG | CC0 1.0 |
| Rajdhani Font | [Google Fonts](https://fonts.google.com/specimen/Rajdhani) | Indian Type Foundry | SIL OFL 1.1 |

## License

MIT
