# OCBP Racer — MVP Roadmap

## 1. Overview

This document defines the phased build order for the Minimum Viable Product (MVP). Each phase has clear acceptance criteria and produces a testable milestone.

## 2. Phase Summary

| Phase | Milestone | Status | Dependencies |
|-------|-----------|--------|--------------|
| 0 | Project Setup | ✅ Complete | None |
| 1 | Core Rendering | ✅ Complete | Phase 0 |
| 2 | Basic Car Physics | ✅ Complete | Phase 1 |
| 3 | Chase Camera | ✅ Complete | Phase 2 |
| 4 | Track Generation | ✅ Complete | Phase 2 |
| 5 | Input System | ✅ Complete | Phase 2 |
| 6 | Car Roster | ✅ Complete | Phase 2 |
| 7 | Audio System | ✅ Complete | Phase 5 |
| 8 | AI Opponents | ✅ Complete | Phase 4 |
| 9 | UI / HUD | ✅ Complete | Phase 5 |
| 10 | Game Loop | ✅ Complete | Phase 8, 9 |
| 11 | Polish | 🔄 In Progress | Phase 10 |
| **Total** | | **~95% Complete** | |

## 3. Detailed Phases

### Phase 0: Project Setup
**Goal:** Working development environment
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Initialize Vite + TypeScript project
- [x] Install dependencies (Three.js r185, Rapier.js 0.19.3, Howler.js 2.2)
- [x] Set up file structure per `01-TECHNICAL-ARCHITECTURE.md`
- [x] Create basic HTML entry point with loading screen
- [x] Verify dev server runs
- [x] Set up Google Fonts (Rajdhani) with preconnect

**Acceptance Criteria:**
- `npm run dev` starts server ✅
- TypeScript compiles without errors ✅
- Loading screen displays ✅

---

### Phase 1: Core Rendering
**Goal:** 3D scene with lighting and ground plane
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Initialize Three.js renderer (WebGL2)
- [x] Create scene with camera
- [x] Add ambient + hemisphere + directional lights
- [x] Create ground plane (dark surface)
- [x] Add fog for distance fade
- [x] Implement render loop with fixed timestep

**Acceptance Criteria:**
- Dark ground plane visible ✅
- Lighting creates visible shadows ✅
- 60 FPS maintained ✅

---

### Phase 2: Basic Car Physics
**Goal:** A box that drives with arcade-realistic physics
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Initialize Rapier.js physics world
- [x] Create car body (rigid box)
- [x] Implement tire grip model (slip angle → grip curve)
- [x] Apply engine force based on throttle input
- [x] Apply brake force based on brake input
- [x] Implement steering (rotate car body)
- [x] Add drag and downforce
- [x] Add auto-correct for lateral stability
- [x] Implement reverse gear
- [x] Implement steering reversal when reversing
- [x] Add NaN guard for position/velocity

**Acceptance Criteria:**
- Car accelerates from standstill ✅
- Car brakes effectively ✅
- Car steers and maintains grip ✅
- Car drifts controllably at high slip angles ✅
- Steering reduces at high speed ✅
- Reverse gear works with correct steering ✅

---

### Phase 3: Chase Camera
**Goal:** Smooth third-person camera following the car
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Implement spring-based position following
- [x] Add look-ahead based on car forward direction
- [x] Implement rotation lag
- [x] Add speed-based FOV change
- [x] Camera reset at race start

**Acceptance Criteria:**
- Camera follows car smoothly ✅
- FOV increases subtly at high speed ✅
- Camera resets properly at race start ✅

---

### Phase 4: Track Generation
**Goal:** Drivable circuit with barriers
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Implement Catmull-Rom spline system
- [x] Define "Midnight Circuit" oval control points (12 points)
- [x] Extrude road mesh from spline
- [x] Generate barrier collision meshes
- [x] Create checkpoint system (8 checkpoints)
- [x] Implement lap detection
- [x] Implement wrong-way detection (track tangent-based)
- [x] Add street lights along track
- [x] Add building decorations

**Acceptance Criteria:**
- Track loads and renders ✅
- Car stays on road surface ✅
- Barriers stop car ✅
- Lap counter increments correctly ✅
- Wrong-way warning displays (not when reversing) ✅

---

### Phase 5: Input System
**Goal:** Keyboard and gamepad both work
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Implement keyboard polling
- [x] Implement gamepad polling (Web Gamepad API)
- [x] Create unified input abstraction
- [x] Apply dead zones (0.15)
- [x] Apply response curves (steering exponent 1.4)
- [x] Implement gamepad hot-plug detection
- [x] Correct keyboard steer directions (A=+1, D=-1)
- [x] Correct gamepad steer direction (negated)

**Acceptance Criteria:**
- Keyboard controls car ✅
- Gamepad controls car ✅
- Dead zones prevent drift ✅
- Device detection works ✅

---

### Phase 6: Car Roster
**Goal:** 4 distinct cars with unique handling
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Create car config system (TypeScript interfaces)
- [x] Implement Phantom GT config
- [x] Implement Viper RS config
- [x] Implement Inferno SS config
- [x] Implement AeroVen TT config
- [x] Create CarFactory for instantiation
- [x] Build procedural sports car mesh with headlights/taillights

**Acceptance Criteria:**
- 4 cars can be selected and driven ✅
- Each car feels distinct ✅
- Visual distinction clear (different colors) ✅
- Headlights and taillights work ✅

---

### Phase 7: Audio System
**Goal:** Engine, tire, and UI sounds
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Initialize Web Audio API AudioManager
- [x] Procedural engine synthesis (sawtooth + square oscillators, lowpass filter)
- [x] Procedural tire screech (bandpass-filtered white noise)
- [x] Procedural wind noise (lowpass-filtered white noise)
- [x] Collision sound synthesis (noise burst + sine tone)
- [x] UI sounds (sine/square tones for navigation, countdown, race complete)
- [x] Race lifecycle (startRaceAudio / stopRaceAudio per race)
- [x] Audio suspend/resume on pause
- [x] Master volume + engine volume controls
- [x] AudioContext auto-resume on user interaction
- [x] Graceful fallback if audio fails

**Acceptance Criteria:**
- AudioManager creates without error ✅
- Engine sound pitch tracks RPM ✅
- Tire screech triggers during drift ✅
- Wind noise scales with speed ✅
- UI sounds work on navigation ✅
- Volume controls work in real-time ✅
- Audio pauses/unpauses with game ✅
- No audio glitches ✅

---

### Phase 8: AI Opponents
**Goal:** 3 AI cars racing on track
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Implement racing line (follows track spline)
- [x] Implement speed controller (slow for corners)
- [x] Implement throttle/steering control for AI
- [x] Spawn 3 AI cars at grid positions
- [x] Implement AI lap tracking (via spline t parameter)
- [x] AI cars track lap progress independently

**Acceptance Criteria:**
- 3 AI cars complete laps ✅
- AI slows for corners ✅
- AI stays on track ✅
- AI cars are catchable ✅
- 60 FPS with 4 cars total ✅

---

### Phase 9: UI / HUD
**Goal:** Complete menu flow and in-race HUD
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Implement state machine (MENU → CAR_SELECT → etc.)
- [x] Build Main Menu screen
- [x] Build Car Select screen (with stat bars)
- [x] Build Track Select screen
- [x] Build Countdown overlay
- [x] Build in-race HUD (speed, lap, position, timer, RPM, wrong way)
- [x] Build Pause menu
- [x] Build Race Results screen
- [x] Add centered flexbox layout for all screens

**Acceptance Criteria:**
- Full menu flow works ✅
- HUD displays correct values ✅
- Pause freezes game ✅
- Results show correct position and times ✅

---

### Phase 10: Game Loop
**Goal:** Complete race from start to finish
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Implement race start sequence (grid → countdown → go)
- [x] Implement lap counting (3 laps)
- [x] Implement race finish detection
- [x] Implement position tracking
- [x] Implement race results calculation
- [x] Add restart functionality
- [x] Add return to menu
- [x] Fix loading state overwrite bug

**Acceptance Criteria:**
- Can start race from menu ✅
- Race completes after 3 laps ✅
- Final position is correct ✅
- Results screen shows correct data ✅
- Can restart or return to menu ✅

---

### Phase 11: Polish
**Goal:** Juice and polish for feel
**Status:** 🔄 In Progress

**Completed Tasks:**
- [x] Add tire smoke particles during drift
- [x] Tune lighting for night urban aesthetic
- [x] Add car headlights/taillights
- [x] Improve car mesh detail
- [x] Add building decorations with lit windows
- [x] Fix car start grid spacing (5m)
- [x] Fix keyboard/gamepad steer directions
- [x] Implement reverse gear
- [x] Fix wrong-way detection
- [x] Rotate track for proper camera orientation
- [x] Add bloom post-processing (UnrealBloomPass, 3 quality presets)
- [x] Add body roll animation (±5° Z-axis tilt)
- [x] Add wheel rotation animation (spin + front steer)
- [x] Implement procedural audio (engine, tires, wind, collision, UI)
- [x] Camera wall collision (raycast, prevent barrier clipping)
- [x] Settings menu (master volume, engine volume, steer sensitivity, graphics quality)
- [x] Responsive UI scaling (CSS transform, 1920×1080 base)
- [x] Settings persistence (localStorage)
- [x] Grip/slip model (triangle curve, replaces auto-correct)
- [x] Throttle ramp-up (0.4s to full power)
- [x] AI start behavior (cautious launch, ramp-up)
- [x] AI car avoidance (5m radius, steer + brake)
- [x] AI crash recovery (RECOVERING state, rejoin when aligned)
- [x] ClearRaceEntities bug fix (null car reference, try/catch)
- [x] AI mutual recursion bug fix (no recursive state transitions)

**Remaining Tasks:**
- [ ] Performance profiling and optimization
- [ ] Additional edge case fixes
- [ ] Howler.js dependency removal from package.json (unused)

**Acceptance Criteria:**
- Tire smoke visible during drift ✅
- Bloom makes lights glow ✅
- Car visually leans in corners ✅
- Wheels spin and steer ✅
- Audio works fully (engine, tires, wind, collision, UI) ✅
- Camera doesn't clip through barriers ✅
- Settings menu works ✅
- Responsive across resolutions ✅
- 60 FPS stable with all effects ✅
- Game feels fun to play ✅

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
| Physics tuning takes too long | High | Start simple, iterate ✅ |
| WebGL2 not supported | Low | Show fallback message |
| Performance issues | High | Profile early, optimize late 🔄 |
| Audio browser issues | Medium | Graceful fallback ✅ |
| Gamepad compatibility | Medium | Test multiple controllers |

## 6. Definition of Done

MVP is complete when:
1. Player can select a car from 4 options ✅
2. Player can start a race on Midnight Circuit ✅
3. Player races against 3 AI opponents ✅
4. Race completes with correct results ✅
5. Game runs at 60 FPS on target hardware ✅
6. All audio works (engine, tires, collision, UI) ✅
7. Full menu flow works with keyboard and gamepad ✅
8. No game-breaking bugs ✅
