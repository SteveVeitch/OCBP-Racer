# OCBP Racer

A browser-based arcade street racing game featuring exotic sports cars with semi-realistic physics. Built with Three.js, Rapier.js, and TypeScript.

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-7.x-blue)
![Three.js](https://img.shields.io/badge/Three.js-r185-black)
![Rapier.js](https://img.shields.io/badge/Rapier.js-0.19.3-purple)

## Play

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Test Harness

Run the automated test suite:

```
http://localhost:3000?test
```

47 tests validate all game systems. Click the results overlay to start the game.

## How to Play

### Controls

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Accelerate | W / ↑ | RT (Right Trigger) |
| Brake / Reverse | S / ↓ | LT (Left Trigger) |
| Steer Left | A / ← | Left Stick ← |
| Steer Right | D / → | Left Stick → |
| Pause | Escape | Start |
| Confirm | Enter / Space | A |
| Back | Escape / Backspace | B |

### Reverse Gear

Hold **S** (or **LT**) while nearly stopped to reverse. Steering directions remain intuitive (A = left, D = right) even when reversing.

### Game Flow

```
Main Menu → Car Select → Track Select → Countdown → Race → Results → Repeat
```

## The Cars

| Car | Style | Top Speed | Personality |
|-----|-------|-----------|-------------|
| **Phantom GT** | Grand Tourer | 235 km/h | Balanced, stable, beginner-friendly |
| **Viper RS** | Track Sports | 245 km/h | Highest grip, precise, rewards skill |
| **Inferno SS** | Muscle Exotic | 250 km/h | High power, loose rear, drifts easily |
| **AeroVen TT** | Hypercar | 265 km/h | Lightest, fastest, agile |

Each car has distinct handling tuned through 12 parameters: mass, engine force, brake force, steering speed, max steer angle, top speed, drag, grip, downforce, slip angles, and auto-correct strength.

### Car Stats

| Stat | Phantom GT | Viper RS | Inferno SS | AeroVen TT |
|------|-----------|----------|------------|------------|
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

Each track has distinct terrain-themed decorations (buildings, trees, rocks, industrial structures), street light density, and default weather/time-of-day conditions. Weather can be overridden per race.

### Weather & Environment

- **4 weather presets**: Clear, Rain, Fog, Storm — each modifies grip, drag, braking, and steering
- **4 time-of-day presets**: Dawn, Day, Dusk, Night — each sets ambient/directional lighting, fog, and sky color
- **Rain particles**: Up to 3000 instanced rain drops during rain/storm
- Environmental modifiers apply equally to player and AI for fair racing

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
- **Throttle ramp-up** — 0.4s from 0 to full power (prevents snap)
- **Linear drag** opposes motion (`dragCoeff × speed × 0.01`)
- **Downforce** increases grip at speed
- **Grip/slip model** — triangle curve from slip angle to grip coefficient, replaces auto-correct
- **Environmental physics** — weather modifiers multiply grip, drag, braking, and steering forces
- **Body roll** — mesh tilts ±5° in corners based on lateral velocity
- **Wheel animation** — spin with speed, front wheels steer
- **Reverse gear** with intuitive steering reversal
- **NaN guard** resets car on physics corruption

Physics runs at a fixed 120 Hz timestep with accumulator pattern.

### Car Physics Parameters

```typescript
interface CarConfig {
  mass: number          // kg (1250-1550)
  engineForce: number   // impulse (750-950)
  brakeForce: number    // impulse (1900-2400)
  steerSpeed: number    // rad/s (1.8-2.5)
  maxSteerAngle: number // radians (0.42-0.48)
  maxSpeed: number      // km/h (235-265)
  dragCoeff: number     // linear (1.3-1.6)
  peakGrip: number      // coefficient (1.6-2.4)
  downforce: number     // coefficient (0.8-1.8)
  slipAnglePeak: number // degrees (6-12)
  slipAngleLimit: number // degrees (20-35)
  autoCorrect: number   // 0-1 (0.2-0.6)
}
```

### Rendering

- Night urban aesthetic with exponential fog
- ACES Filmic tone mapping (exposure 1.4)
- Ambient + hemisphere + directional lighting (dynamic via EnvironmentManager)
- 4 time-of-day presets (dawn/day/dusk/night) — ambient color, directional angle, fog, sky
- 4 weather presets (clear/rain/fog/storm) — fog density, visibility
- 20+ street lights per track (point lights, warm orange)
- Car headlights (spot lights, intensity 8)
- Car taillights (point lights, red)
- **Bloom post-processing** (UnrealBloomPass) — makes emissive materials glow
- **Camera wall collision** — raycast prevents camera clipping through barriers
- **Rain particles** — 3000-instance InstancedMesh during rain/storm
- Terrain-themed decorations (buildings, trees, rocks, industrial structures)
- Tire smoke particles during drift
- Body roll and wheel animation
- PBR materials (metalness/roughness workflow)

### Car Mesh

Each car is a procedural sports car built from box geometry:
- Lower body, hood, cabin (glass), roof, rear deck
- Bumpers, front spoiler
- Headlights and taillights with emissive materials
- 4 wheels with tire + rim detail
- Headlight/taillight point lights attached to car group

### AI

3 AI opponents with 3-state behavior:
- **STARTING** — Cautious launch with throttle ramp and 3-second delay
- **RACING** — Normal racing with corner speed reduction, 5m car avoidance (steer + brake + throttle reduction)
- **RECOVERING** — Post-crash state, cuts throttle, steers away from obstacles, rejoins when aligned with track
- Racing line tracking via closest spline point
- Configurable aggressiveness per car (0.3-0.7)
- Independent lap progress tracking

### Input

- Keyboard (WASD/Arrow keys) and gamepad support
- Dead zone: 0.15 (gamepad)
- Steering sensitivity curve: exponent 1.4
- Hot-plug detection for gamepads
- Correct steering in reverse (A=left, D=right)

### Audio

- 100% procedural synthesis via Web Audio API — no audio files
- Engine: sawtooth + square oscillators, frequency mapped to RPM
- Tire screech: bandpass-filtered white noise, triggered by slip angle
- Wind: lowpass-filtered white noise, scales with speed
- Collision: noise burst + sine tone with decay
- UI: sine/square tones for navigation, countdown, race complete

### UI

- HTML/CSS overlay on Three.js canvas
- Neon green (#00ff88) + hot pink (#ff3366) + gold (#ffcc00) design system
- Rajdhani font (Google Fonts)
- Screens: Main Menu, Car Select, Track Select, Countdown, HUD, Pause, Results, Settings
- **Settings menu** — master volume, engine volume, steer sensitivity, graphics quality (Low/Med/High)
- **Responsive scaling** — CSS transform scales UI to any resolution (1920×1080 base)
- **Settings persistence** — saved to localStorage
- Centered flexbox layout
- Loading screen with CSS spinner

## Project Structure

```
OCBP Racer/
├── specs/                      # 12 SDD specification documents
├── src/
│   ├── main.ts                 # Entry point
│   ├── test-harness.ts         # 47 automated tests
│   ├── core/
│   │   ├── Game.ts             # Main game loop + race logic
│   │   └── StateMachine.ts     # Game state transitions
│   ├── input/
│   │   └── InputManager.ts     # Keyboard + gamepad input
│   ├── physics/
│   │   ├── PhysicsWorld.ts     # Rapier.js WASM wrapper
│   │   └── CarController.ts    # Car physics, grip/slip, env modifiers
│   ├── rendering/
│   │   ├── CameraController.ts # Chase cam with spring follow + wall collision
│   │   ├── ParticleSystem.ts   # Tire smoke particles
│   │   └── WeatherParticleSystem.ts  # Rain particles (InstancedMesh)
│   ├── audio/
│   │   └── AudioManager.ts     # Web Audio API procedural synthesis
│   ├── cars/
│   │   ├── CarConfigs.ts       # 4 car definitions
│   │   └── CarFactory.ts       # Car mesh + body creation
│   ├── track/
│   │   ├── Track.ts            # Track logic + checkpoints
│   │   ├── TrackBuilder.ts     # Procedural road + barriers + cleanup
│   │   ├── TrackDefinitions.ts # 5 track definitions with control points
│   │   └── SplinePath.ts       # Catmull-Rom spline
│   ├── environment/
│   │   ├── EnvironmentManager.ts     # Lighting, fog, sky, decorations
│   │   ├── TimeOfDayPresets.ts       # 4 presets (dawn/day/dusk/night)
│   │   ├── WeatherPresets.ts         # 4 presets (clear/rain/fog/storm)
│   │   └── EnvironmentModifiers.ts   # Physics multiplier structs
│   ├── ai/
│   │   └── AIController.ts     # AI 3-state behavior (STARTING/RACING/RECOVERING)
│   └── ui/
│       └── UIManager.ts        # HTML/CSS overlay UI
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
npm run build        # Build for production
npm run preview      # Preview production build
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
| `03-INPUT-SPEC.md` | Input mapping, dead zones, response curves |
| `04-RENDERING-SPEC.md` | Rendering pipeline, lighting, materials |
| `05-AUDIO-SPEC.md` | Audio architecture, sound categories |
| `06-TRACK-SPEC.md` | Track design, checkpoints, wrong-way |
| `07-CAR-SPEC.md` | Car roster, tuning parameters, mesh |
| `08-UI-SPEC.md` | UI screens, styling, HUD layout |
| `09-ASSET-PIPELINE.md` | Asset workflow, placeholder strategy |
| `10-MVP-ROADMAP.md` | Build phases, completion status |
| `11-TEST-HARNESS.md` | Test suite documentation |

## License

MIT
