# OCBP Racer — Technical Architecture

## 1. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Language | TypeScript | 7.x | Type safety, developer experience |
| Renderer | Three.js | r185+ | WebGL2 3D rendering |
| Physics | Rapier.js | 0.19.3 | WASM-accelerated rigid body physics |
| Audio | Howler.js | 2.2+ | Cross-browser audio playback |
| Build | Vite | 5.4 | Dev server, bundling, HMR |
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
- Variable timestep rendering
- Frame time capping to prevent spiral of death (max 0.1s)

### 3.2 State Machine
```
MENU → CAR_SELECT → TRACK_SELECT → COUNTDOWN → RACING → RESULTS → MENU
```
Note: LOADING state was removed; loading is handled by the browser before game init.

### 3.3 Entity Model (MVP)
```
GameWorld
├── PlayerCar (physics body + CarController)
├── AICars[] (physics body + AIController)
├── Track (spline path + procedural road mesh + barriers)
├── Environment (lighting, buildings, street lights)
├── Camera (chase cam with spring dynamics)
└── Particles (tire smoke)
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
│   ├── 10-MVP-ROADMAP.md
│   └── 11-TEST-HARNESS.md
│
├── src/
│   ├── main.ts                     ← Entry point, game initialization
│   ├── test-harness.ts             ← Automated test suite (35 tests)
│   │
│   ├── core/
│   │   ├── Game.ts                 ← Main game class, loop, race logic
│   │   └── StateMachine.ts         ← Game state transitions
│   │
│   ├── input/
│   │   └── InputManager.ts         ← Unified keyboard + gamepad input
│   │
│   ├── physics/
│   │   ├── PhysicsWorld.ts         ← Rapier.js WASM wrapper
│   │   └── CarController.ts        ← Car physics model + reverse gear
│   │
│   ├── rendering/
│   │   ├── CameraController.ts     ← Chase cam with spring follow
│   │   └── ParticleSystem.ts       ← Tire smoke particles
│   │
│   ├── audio/
│   │   └── AudioManager.ts         ← Howler.js stub (placeholder)
│   │
│   ├── cars/
│   │   ├── CarConfigs.ts           ← 4 car definitions + types
│   │   └── CarFactory.ts           ← Car mesh + physics body creation
│   │
│   ├── track/
│   │   ├── Track.ts                ← Track logic, checkpoints, wrong way
│   │   ├── TrackBuilder.ts         ← Procedural road + barrier meshes
│   │   └── SplinePath.ts           ← Catmull-Rom spline wrapper
│   │
│   ├── ai/
│   │   └── AIController.ts         ← AI racing line follower
│   │
│   └── ui/
│       └── UIManager.ts            ← HTML/CSS overlay UI
│
├── index.html                      ← Entry HTML with loading screen
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
```

## 5. Data Flow

### 5.1 Frame Flow
```
1. Poll input devices (keyboard/gamepad)
2. Step physics (fixed timestep 1/120s, accumulator pattern)
   a. Apply car forces (throttle, steering, brake, reverse)
   b. Step Rapier world
   c. Read back positions/rotations
3. Update game systems
   a. AI decisions + car updates
   b. Camera target update
   c. UI HUD values
   d. Particle emission
4. Render Three.js scene
5. Draw UI overlay
```

### 5.2 Physics Accumulator
- Game loop accumulates delta time
- Physics steps run at 120 Hz (fixed timestep)
- Multiple physics steps per frame if needed
- Frame time capped at 0.1s to prevent spiral of death

## 6. Build Configuration

### 6.1 Vite Config
- Dev server with HMR
- Static asset handling
- TypeScript compilation

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
- NaN guard in CarController (resets position/velocity)
- Physics simulation continues on audio failure
- Gamepad disconnect handled (falls back to keyboard)
- Fatal error display on init failure
- Uncaught errors logged to console

## 9. Testing Strategy

### 9.1 Test Harness
- Automated test suite: `src/test-harness.ts`
- 35 tests across 10 phases
- Accessible at `http://localhost:3000?test`
- Tests run in browser with visual results overlay
- Click results to start game (if all pass)

### 9.2 Test Categories
- Phase 0: Project setup (imports, configs)
- Phase 1: Core rendering (WebGL, scene, lights)
- Phase 2: Car physics (Rapier init, acceleration, braking, steering)
- Phase 3: Chase camera (creation, following)
- Phase 4: Track (creation, spline, checkpoints, building)
- Phase 5: Input system (creation, defaults)
- Phase 6: Car roster (configs, mesh creation)
- Phase 7: Audio system (creation)
- Phase 8: AI opponents (creation, input generation)
- Phase 9: UI state machine (transitions, storage)
- Phase 10: Integration (car on track, 4 cars on track)
