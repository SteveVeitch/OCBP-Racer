# OCBP Racer — Technical Architecture

## 1. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Language | TypeScript | 5.x | Type safety, developer experience |
| Renderer | Three.js | r160+ | WebGL2 3D rendering |
| Physics | Rapier.js | 0.14+ | WASM-accelerated rigid body physics |
| Audio | Howler.js | 2.2+ | Cross-browser audio playback |
| Build | Vite | 6.x | Dev server, bundling, HMR |
| Package Manager | npm | 10+ | Dependency management |

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Game Loop                          │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Input   │→ │ Physics  │→ │  Update  │→ │ Render │ │
│  │ Manager  │  │  Step    │  │ Systems  │  │        │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│       ↑              ↑             ↑            │       │
│       │              │             │            ↓       │
│  ┌────┴────┐   ┌─────┴─────┐  ┌───┴───┐  ┌────┴────┐  │
│  │ Keyboard│   │  Rapier   │  │  Car  │  │ Three.js│  │
│  │ Gamepad │   │  World    │  │ State │  │  Scene  │  │
│  └─────────┘   └───────────┘  └───────┘  └─────────┘  │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Audio   │  │   UI     │  │  State   │             │
│  │ Manager  │  │ Overlay  │  │ Machine  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

## 3. Core Systems

### 3.1 Game Loop
- Fixed timestep physics (120 Hz)
- Variable timestep rendering with interpolation
- Frame time capping to prevent spiral of death

### 3.2 State Machine
```
MENU → CAR_SELECT → TRACK_SELECT → COUNTDOWN → RACING → RESULTS → MENU
```

### 3.3 Entity Model (MVP)
```
GameWorld
├── PlayerCar (physics body + car controller)
├── AICars[] (physics body + AI controller)
├── Track (static collision mesh + visual mesh)
├── Environment (lighting, skybox, decorations)
└── Camera (chase cam with spring dynamics)
```

## 4. File Structure

```
OCBP Racer/
├── specs/                          ← SDD documentation
│   ├── 00-GAME-DESIGN-DOCUMENT.md
│   ├── 01-TECHNICAL-ARCHITECTURE.md
│   ├── 02-PHYSICS-SPEC.md
│   ├── 03-INPUT-SPEC.md
│   ├── 04-RENDERING-SPEC.md
│   ├── 05-AUDIO-SPEC.md
│   ├── 06-TRACK-SPEC.md
│   ├── 07-CAR-SPEC.md
│   ├── 08-UI-SPEC.md
│   ├── 09-ASSET-PIPELINE.md
│   └── 10-MVP-ROADMAP.md
│
├── src/
│   ├── main.ts                     ← Entry point, game initialization
│   ├── core/
│   │   ├── Game.ts                 ← Main game class, loop management
│   │   ├── StateMachine.ts         ← Game state transitions
│   │   ├── Clock.ts                ← Fixed timestep management
│   │   └── EventBus.ts             ← Inter-system communication
│   │
│   ├── input/
│   │   ├── InputManager.ts         ← Unified input abstraction
│   │   ├── KeyboardDevice.ts       ← Keyboard polling
│   │   └── GamepadDevice.ts        ← Gamepad polling + vibration
│   │
│   ├── physics/
│   │   ├── PhysicsWorld.ts         ← Rapier.js wrapper
│   │   ├── CarController.ts        ← Car physics model
│   │   ├── TireModel.ts            ← Lateral/longitudinal grip
│   │   └── CollisionGroups.ts      ← Collision layer definitions
│   │
│   ├── rendering/
│   │   ├── SceneManager.ts         ← Three.js scene setup
│   │   ├── CameraController.ts     ← Chase cam with spring follow
│   │   ├── Lighting.ts             ← Scene lighting configuration
│   │   ├── Materials.ts            ← PBR material definitions
│   │   └── PostProcessing.ts       ← Bloom, motion blur
│   │
│   ├── audio/
│   │   ├── AudioManager.ts         ← Sound loading, playback
│   │   ├── EngineSound.ts          ← RPM-mapped engine audio
│   │   └── TireSound.ts            ← Slip-mapped screech
│   │
│   ├── cars/
│   │   ├── CarFactory.ts           ← Car instantiation from config
│   │   ├── CarConfig.ts            ← Car tuning parameter types
│   │   └── configs/
│   │       ├── phantom-gt.ts
   │       ├── viper-rs.ts
│   │       ├── inferno-ss.ts
│   │       └── aeroven-tt.ts
│   │
│   ├── track/
│   │   ├── TrackBuilder.ts         ← Track mesh generation
│   │   ├── SplinePath.ts           ← Catmull-Rom spline math
│   │   └── CollisionMesh.ts        ← Physics boundary generation
│   │
│   ├── ai/
│   │   ├── AIController.ts         ← Basic AI driver
│   │   └── RacingLine.ts           ← Precomputed optimal path
│   │
│   ├── ui/
│   │   ├── HUD.ts                  ← In-race overlay
│   │   ├── MainMenu.ts             ← Title screen
│   │   ├── CarSelect.ts            ← Car selection screen
│   │   └── RaceResults.ts          ← Post-race display
│   │
│   └── debug/
│       ├── PhysicsGraph.ts         ← Real-time physics telemetry
│       ├── DebugOverlay.ts         ← FPS, memory, physics stats
│       └── DevControls.ts          ← Runtime parameter tweaking
│
├── assets/
│   ├── models/                     ← GLTF/GLB car and track models
│   ├── textures/                   ← PBR texture maps
│   │   ├── cars/                   ← Per-car textures
│   │   ├── track/                  ← Track surface, barriers
│   │   └── env/                    ← Skybox, environment maps
│   ├── audio/
│   │   ├── engine/                 ← Engine sound samples
│   │   ├── tires/                  ← Tire screech samples
│   │   ├── ui/                     ← Menu sounds
│   │   └── sfx/                    ← Collision, ambient
│   └── fonts/                      ← UI fonts
│
├── public/                         ← Static files served as-is
│   └── index.html
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
```

## 5. Data Flow

### 5.1 Frame Flow
```
1. Poll input devices
2. Read gamepad state → unified input axes
3. Step physics (fixed timestep, may run 0-2 times)
   a. Apply car forces (throttle, steering, brake)
   b. Step Rapier world
   c. Read back positions/rotations
4. Update game systems
   a. Update AI decisions
   b. Update camera target
   c. Update audio parameters
   d. Update UI values
5. Interpolate visual positions (render alpha)
6. Render Three.js scene
7. Draw UI overlay
```

### 5.2 Interpolation
- Physics state: `previousState + alpha * (currentState - previousState)`
- Alpha = accumulated time / fixed timestep
- Ensures smooth rendering between physics ticks

## 6. Build Configuration

### 6.1 Vite Config
- Dev server with HMR
- Static asset handling
- TypeScript compilation
- GLTF model loading via plugin

### 6.2 Production
- Tree shaking
- Code splitting
- Asset hashing
- Target: ES2020 (modern browsers)

## 7. Performance Budget

| Resource | Budget |
|----------|--------|
| Draw calls | < 200 |
| Triangles | < 500K |
| Texture memory | < 512 MB |
| JavaScript bundle | < 2 MB (gzipped) |
| Total assets | < 50 MB |
| Physics bodies | < 50 |
| Audio channels | < 16 |

## 8. Error Handling

- Graceful WebGL2 fallback message
- Physics simulation continues on audio failure
- Asset load failures show placeholder
- Gamepad disconnect handled mid-race
- Uncaught errors logged to console (dev mode)

## 9. Testing Strategy

### 9.1 Unit Tests
- Physics math (tire model, force calculations)
- Spline interpolation
- Input mapping
- State machine transitions

### 9.2 Integration Tests
- Car spawns and drives
- Track loads and has collision
- Audio plays on trigger

### 9.3 Manual Testing
- Feel of each car (qualitative)
- Visual quality checks
- Performance profiling on target hardware
