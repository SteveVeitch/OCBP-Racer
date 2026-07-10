# OCBP Racer — MVP Roadmap

## 1. Overview

This document defines the phased build order for the Minimum Viable Product (MVP). Each phase has clear acceptance criteria and produces a testable milestone.

## 2. Phase Summary

| Phase | Milestone | Duration | Dependencies |
|-------|-----------|----------|--------------|
| 0 | Project Setup | 1 day | None |
| 1 | Core Rendering | 2 days | Phase 0 |
| 2 | Basic Car Physics | 3 days | Phase 1 |
| 3 | Chase Camera | 1 day | Phase 2 |
| 4 | Track Generation | 3 days | Phase 2 |
| 5 | Input System | 2 days | Phase 2 |
| 6 | Car Roster | 2 days | Phase 2 |
| 7 | Audio System | 2 days | Phase 5 |
| 8 | AI Opponents | 3 days | Phase 4 |
| 9 | UI / HUD | 3 days | Phase 5 |
| 10 | Game Loop | 2 days | Phase 8, 9 |
| 11 | Polish | 3 days | Phase 10 |
| **Total** | | **~27 days** | |

## 3. Detailed Phases

### Phase 0: Project Setup
**Goal:** Working development environment

**Tasks:**
- [ ] Initialize Vite + TypeScript project
- [ ] Install dependencies (Three.js, Rapier.js, Howler.js)
- [ ] Set up file structure per `01-TECHNICAL-ARCHITECTURE.md`
- [ ] Configure ESLint + Prettier
- [ ] Set up Git repository
- [ ] Create basic HTML entry point
- [ ] Verify dev server runs

**Acceptance Criteria:**
- `npm run dev` starts server
- TypeScript compiles without errors
- Empty Three.js scene renders

---

### Phase 1: Core Rendering
**Goal:** 3D scene with lighting and ground plane

**Tasks:**
- [ ] Initialize Three.js renderer (WebGL2)
- [ ] Create scene with camera
- [ ] Add directional light + ambient light
- [ ] Create ground plane (dark surface)
- [ ] Add fog for distance fade
- [ ] Implement render loop with fixed timestep

**Acceptance Criteria:**
- Dark ground plane visible
- Lighting creates visible shadows
- 60 FPS maintained

---

### Phase 2: Basic Car Physics
**Goal:** A box that drives with arcade-realistic physics

**Tasks:**
- [ ] Initialize Rapier.js physics world
- [ ] Create car body (rigid box)
- [ ] Implement tire grip model (slip angle → grip curve)
- [ ] Apply engine force based on throttle input
- [ ] Apply brake force based on brake input
- [ ] Implement steering (rotate front wheels)
- [ ] Add drag and rolling resistance
- [ ] Add downforce
- [ ] Tune for "arcade-realistic" feel

**Acceptance Criteria:**
- Car accelerates from 0-100 km/h in 4-5 seconds
- Car brakes effectively
- Car steers and maintains grip
- Car drifts controllably at high slip angles
- Steering reduces at high speed

---

### Phase 3: Chase Camera
**Goal:** Smooth third-person camera following the car

**Tasks:**
- [ ] Implement spring-based position following
- [ ] Add look-ahead based on velocity
- [ ] Implement rotation lag
- [ ] Add speed-based FOV change
- [ ] Add camera collision detection (raycast)

**Acceptance Criteria:**
- Camera follows car smoothly
- Camera doesn't clip through walls
- FOV increases subtly at high speed
- Camera lags during drift

---

### Phase 4: Track Generation
**Goal:** Drivable circuit with barriers

**Tasks:**
- [ ] Implement Catmull-Rom spline system
- [ ] Define "Midnight Circuit" control points
- [ ] Extrude road mesh from spline
- [ ] Generate barrier collision meshes
- [ ] Create checkpoint system (4 checkpoints + finish line)
- [ ] Implement lap detection
- [ ] Add wrong-way detection

**Acceptance Criteria:**
- Track loads and renders
- Car stays on road surface
- Barriers stop car
- Lap counter increments correctly
- Wrong-way warning displays

---

### Phase 5: Input System
**Goal:** Keyboard and gamepad both work

**Tasks:**
- [ ] Implement keyboard polling
- [ ] Implement gamepad polling (Web Gamepad API)
- [ ] Create unified input abstraction
- [ ] Apply dead zones
- [ ] Apply response curves (steering sensitivity)
- [ ] Add input smoothing for steering
- [ ] Implement gamepad hot-plug detection

**Acceptance Criteria:**
- Keyboard controls car
- Gamepad controls car
- Dead zones prevent drift
- Steering is smooth, not twitchy
- Device detection works

---

### Phase 6: Car Roster
**Goal:** 4 distinct cars with unique handling

**Tasks:**
- [ ] Create car config system (TypeScript interfaces)
- [ ] Implement Phantom GT config
- [ ] Implement Viper RS config
- [ ] Implement Inferno SS config
- [ ] Implement AeroVen TT config
- [ ] Create CarFactory for instantiation
- [ ] Replace placeholder geometry with colored boxes per car

**Acceptance Criteria:**
- 4 cars can be selected and driven
- Each car feels distinct
- Performance matches spec targets (±10%)
- Visual distinction clear (different colors)

---

### Phase 7: Audio System
**Goal:** Engine, tire, and UI sounds

**Tasks:**
- [ ] Initialize Howler.js audio manager
- [ ] Implement engine sound (RPM-mapped pitch)
- [ ] Implement tire screech (slip-mapped volume)
- [ ] Implement wind noise (speed-mapped)
- [ ] Implement collision sounds (force-mapped)
- [ ] Implement UI sounds (navigate, confirm, back)
- [ ] Add volume controls

**Acceptance Criteria:**
- Engine sound plays and pitch changes with RPM
- Tire screech triggers during drift
- Wind noise audible at high speed
- Collision sounds play on impact
- UI sounds work in menus
- Volume sliders functional

---

### Phase 8: AI Opponents
**Goal:** 3 AI cars racing on track

**Tasks:**
- [ ] Implement racing line (precomputed from track spline)
- [ ] Implement speed controller (slow for corners)
- [ ] Implement throttle/steering control for AI
- [ ] Add rubber-banding (optional, tune later)
- [ ] Spawn 3 AI cars at grid positions
- [ ] Implement simple collision avoidance

**Acceptance Criteria:**
- 3 AI cars complete laps
- AI slows for corners
- AI stays on track
- AI cars are catchable (not impossible)
- 60 FPS with 4 cars total

---

### Phase 9: UI / HUD
**Goal:** Complete menu flow and in-race HUD

**Tasks:**
- [ ] Implement state machine (MENU → CAR_SELECT → etc.)
- [ ] Build Main Menu screen
- [ ] Build Car Select screen (with 3D preview)
- [ ] Build Track Select screen
- [ ] Build Loading screen (with progress bar)
- [ ] Build Countdown overlay
- [ ] Build in-race HUD (speed, lap, position, timer)
- [ ] Build Pause menu
- [ ] Build Race Results screen

**Acceptance Criteria:**
- Full menu flow works
- HUD displays correct values
- Pause freezes game
- Results show correct position and times
- Keyboard and gamepad navigate all menus

---

### Phase 10: Game Loop
**Goal:** Complete race from start to finish

**Tasks:**
- [ ] Implement race start sequence (grid → countdown → go)
- [ ] Implement lap counting (3 laps default)
- [ ] Implement race finish detection
- [ ] Implement position tracking
- [ ] Implement race results calculation
- [ ] Add restart functionality
- [ ] Add return to menu

**Acceptance Criteria:**
- Can start race from menu
- Race completes after 3 laps
- Final position is correct
- Results screen shows correct data
- Can restart or return to menu

---

### Phase 11: Polish
**Goal:** Juice and polish for feel

**Tasks:**
- [ ] Add tire smoke particles during drift
- [ ] Add bloom post-processing
- [ ] Add body roll animation (car lean)
- [ ] Add wheel rotation animation
- [ ] Add steering angle animation
- [ ] Tune all physics parameters
- [ ] Tune all audio levels
- [ ] Performance profiling and optimization
- [ ] Bug fixes and edge cases

**Acceptance Criteria:**
- Tire smoke visible during drift
- Bloom makes lights glow
- Car visually leans in corners
- Wheels spin and steer
- 60 FPS stable with all effects
- Game feels fun to play

---

## 4. Post-MVP Roadmap (Future)

| Feature | Priority | Dependencies |
|---------|----------|--------------|
| Additional tracks | High | Track system |
| Manual transmission | Medium | Physics |
| Damage system | Medium | Physics, rendering |
| Online multiplayer | High | Networking |
| Music soundtrack | Low | Audio |
| Car customization | Medium | UI, physics |
| Mobile controls | Low | Input |
| Day/night cycle | Low | Rendering |
| Weather effects | Low | Rendering |
| Leaderboards | Medium | Networking |

## 5. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Physics tuning takes too long | High | Start simple, iterate |
| WebGL2 not supported | Low | Show fallback message |
| Performance issues | High | Profile early, optimize late |
| Audio browser issues | Medium | Graceful fallback |
| Gamepad compatibility | Medium | Test multiple controllers |

## 6. Definition of Done

MVP is complete when:
1. Player can select a car from 4 options
2. Player can start a race on Midnight Circuit
3. Player races against 3 AI opponents
4. Race completes with correct results
5. Game runs at 60 FPS on target hardware
6. All audio works (engine, tires, collision, UI)
7. Full menu flow works with keyboard and gamepad
8. No game-breaking bugs
