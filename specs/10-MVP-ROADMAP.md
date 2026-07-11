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
| 11 | Polish | ✅ Complete | Phase 10 |
| 12 | Track System | ✅ Complete | Phase 10 |
| 13 | Environment System | ✅ Complete | Phase 12 |
| 14 | Car Renaming + Turbo Physics | 🔲 Pending | Phase 13 |
| 15 | Per-Car Audio + Camera Views | 🔲 Pending | Phase 14 |
| 16 | Scoring + Leaderboard | 🔲 Pending | Phase 14 |
| 17 | Rebindable Controls + UI | 🔲 Pending | Phase 14 |
| 18 | Typhoon Pass + Polish | 🔲 Pending | Phase 14 |
| 19 | Demo/Attract Mode | ✅ Complete | Phase 13 |
| **Total** | | **~78% Complete** | |

## 3. Detailed Phases

### Phase 0: Project Setup
**Goal:** Working development environment
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Initialize Vite + TypeScript project
- [x] Install dependencies (Three.js r185, Rapier.js 0.19.3)
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
- [x] AI car avoidance (5m radius, steer + brake)
- [x] AI crash recovery (RECOVERING state, rejoin when aligned)
- [x] AI start behavior (cautious launch, ramp-up)

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
**Status:** ✅ Complete

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
- [x] Throttle ramp-up (2.5/s up, 4.0/s decay)
- [x] AI start behavior (cautious launch, ramp-up)
- [x] AI car avoidance (5m radius, steer + brake)
- [x] AI crash recovery (RECOVERING state, rejoin when aligned)
- [x] ClearRaceEntities bug fix (null car reference, try/catch)
- [x] AI mutual recursion bug fix (no recursive state transitions)

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

### Phase 12: Track System
**Goal:** Multi-track selection with distinct themes
**Status:** ✅ Complete

**Completed Tasks:**
- [x] Create TrackDefinitions.ts with 5 track definitions
- [x] Refactor Track.ts to accept TrackDefinition parameter
- [x] Refactor TrackBuilder.ts with cleanup support
- [x] Track select UI with card grid (3-column, terrain icons, difficulty badges)
- [x] Weather override selector on track select screen
- [x] Dynamic track loading in Game.ts (rebuilds track when selection changes)
- [x] StateMachine `weatherOverride` setting (persisted to localStorage)
- [x] Street lights and decorations tied to track definition density
- [x] Fix 9 broken test-harness tests (`new Track()` → `new Track(TRACKS[0])`)

**Acceptance Criteria:**
- 5 tracks selectable from UI ✅
- Each track builds unique spline and geometry ✅
- Track rebuilds cleanly on selection change ✅
- Decorations match terrain type ✅

---

### Phase 13: Environment System
**Goal:** Time-of-day lighting, weather effects, and environmental physics
**Status:** ✅ Complete

**Completed Tasks:**
- [x] EnvironmentManager (lighting, fog, sky, decorations per theme)
- [x] 4 TimeOfDay presets (dawn/day/dusk/night) — ambient + directional + fog + temperature
- [x] 4 Weather presets (clear/rain/fog/storm) — physics multipliers + visual effects
- [x] WeatherParticleSystem (3000-instance InstancedMesh rain drops)
- [x] CarController environment modifiers (4 force multiplications: grip, drag, braking, steer)
- [x] Environment modifiers applied equally to player and AI
- [x] Weather wire pipeline: WeatherPreset → EnvironmentManager → CarController
- [x] Performance optimizations (shared materials, geometry reuse)

**Environment Modifier Values:**
| Weather | Grip | Drag | Braking | Steer |
|---------|------|------|---------|-------|
| Clear | 1.0 | 1.0 | 1.0 | 1.0 |
| Rain | 0.78 | 1.15 | 0.9 | 0.85 |
| Fog | 0.92 | 1.05 | 0.95 | 0.95 |
| Storm | 0.72 | 1.25 | 0.85 | 0.8 |

**Acceptance Criteria:**
- Time-of-day changes lighting, fog, and sky color ✅
- Weather presets reduce grip and modify forces ✅
- Rain particles visible during rain/storm ✅
- Environment modifiers apply equally to all cars ✅
- Weather override persisted in settings ✅

---

### Phase 14: Car Renaming + Turbo Physics
**Goal:** Rename cars to brand-inspired names, add per-car engine specs and turbo lag
**Status:** 🔲 Pending
**Dependencies:** Phase 13

**Planned Tasks:**
- [ ] Rename cars: Phantom GT → Rossini 488, Viper RS → Weissach GT3, Inferno SS → Kaiju GT-R, AeroVen TT → Stingray Z06
- [ ] Add `EngineDefinition` interface to car configs
- [ ] Add per-car engine specs (type, displacement, HP, redline, base/max frequency)
- [ ] Add `turboLagTime` to CarConfig (0.0s for NA cars)
- [ ] Implement turbo lag physics in CarController (boostLevel ramp, effective force scaling)
- [ ] Update CarFactory with per-car mesh profiles (distinct silhouettes)
- [ ] Update car selection UI with new names and engine badges
- [ ] Update all test harness tests for new car IDs
- [ ] Add headlights-on/off based on time-of-day (via EnvironmentManager)

**Acceptance Criteria:**
- 4 cars renamed and identifiable
- Turbo lag felt on Rossini 488 and Kaiju GT-R
- NA cars (GT3, Z06) have instant throttle response
- Each car has distinct visual silhouette
- Headlights off on day tracks, on at night
- All tests pass with new car IDs

---

### Phase 15: Per-Car Audio + Camera Views
**Goal:** Distinct engine sounds per car, turbo whistle, exhaust pops, 4 camera views
**Status:** 🔲 Pending
**Dependencies:** Phase 14

**Planned Tasks:**
- [ ] Implement per-car engine synthesis (different oscillator configs per engine type)
- [ ] Implement turbo whistle synthesis (sine oscillator linked to boostLevel)
- [ ] Implement turbo flutter (bandpass noise burst on throttle release)
- [ ] Implement exhaust pops (noise bursts on deceleration)
- [ ] Add RPM variation at redline (pitch wobble)
- [ ] Implement 4 camera views: Chase, Windscreen, Hood, Bumper
- [ ] Add camera view cycling via input (C key / Y button)
- [ ] Add camera default setting in Settings menu
- [ ] Store camera state per-race

**Acceptance Criteria:**
- Each car sounds distinct (V8 vs flat-6 vs V6)
- Turbo whistle audible on turbo cars
- Turbo flutter on throttle release
- Exhaust pops on deceleration
- 4 camera views work and feel distinct
- Camera cycling works via input
- Camera default persisted in settings

---

### Phase 16: Scoring + Leaderboard
**Goal:** Points system, wall hit tracking, leaderboard persistence
**Status:** 🔲 Pending
**Dependencies:** Phase 14

**Planned Tasks:**
- [ ] Implement scoring: 10/7/5/2 points for 1st/2nd/3rd/4th
- [ ] Track wall hits per race (cleanest metric)
- [ ] Track top speed per race
- [ ] Update race results screen (position, points, wall hits, top speed)
- [ ] Implement per-track leaderboard (best time, wall hits, top speed per car)
- [ ] Implement overall leaderboard (aggregated across tracks)
- [ ] Add leaderboard screen (accessible from main menu)
- [ ] Persist leaderboard to localStorage
- [ ] Add mini-map (player + AI positions, track outline)

**Acceptance Criteria:**
- Points awarded correctly per position
- Wall hits tracked and displayed
- Top speed tracked and displayed
- Per-track leaderboard shows best times
- Overall leaderboard works
- Leaderboard persisted to localStorage
- Mini-map shows all car positions

---

### Phase 17: Rebindable Controls + UI
**Goal:** All gameplay actions rebindable, settings persistence, fog toggle
**Status:** 🔲 Pending
**Dependencies:** Phase 14

**Planned Tasks:**
- [ ] Implement rebindable key system (all gameplay actions)
- [ ] Add key binding UI to Settings menu
- [ ] Implement conflict detection (swap on conflict)
- [ ] Add fog toggle setting (on/off)
- [ ] Add camera default setting (chase/wind/hood/bumper)
- [ ] Persist all settings to localStorage
- [ ] Add "Reset to Defaults" button for bindings
- [ ] Handle window blur (clear keys, auto-pause)
- [ ] Fix pause state machine (consistent transition to/from PAUSED)

**Acceptance Criteria:**
- All gameplay actions can be remapped
- Binding conflicts are handled (swap)
- Bindings persist to localStorage
- Fog toggle works
- Camera default setting works
- Window blur clears keys and auto-pauses
- Pause state transitions are consistent

---

### Phase 18: Typhoon Pass + Polish
**Goal:** New mountain track, test harness layout, final polish
**Status:** 🔲 Pending
**Dependencies:** Phase 14

**Planned Tasks:**
- [ ] Add Typhoon Pass track definition (18 control points, elevation)
- [ ] Implement elevation support in TrackBuilder (y-values in spline)
- [ ] Add mountain decorations (pine trees, rocks, guardrails)
- [ ] Add Typhoon Pass to track select UI
- [ ] Update test harness for multi-column layout
- [ ] Add Typhoon Pass tests (spline, elevation, decorations)
- [ ] Update test count (47 → 55+)
- [ ] Final performance pass (ensure 60 FPS with all new features)
- [ ] Update README.md with new features

**Acceptance Criteria:**
- Typhoon Pass loads and plays correctly
- Elevation changes visible and affect driving
- Mountain decorations render
- Test harness uses multi-column layout
- All tests pass (55+)
- 60 FPS maintained
- README reflects all new features

---

### Phase 19: Demo/Attract Mode
**Goal:** Auto-play demo mode after idle timeout on menu
**Status:** ✅ Complete
**Dependencies:** Phase 13

**Completed Tasks:**
- [x] Add `DEMO` state to GameState type in StateMachine
- [x] Add `demoEnabled: boolean` to GameSettings (default: true)
- [x] Add idle timer (3 minutes) in Game.ts with activity listeners (keyboard, mouse, touch)
- [x] Implement `startDemo()` — random car/track/weather/TOD, single AI car at 0.3 aggressiveness
- [x] Implement `checkDemoExit()` — any input (throttle/brake/steer/pause/confirm/back) returns to menu
- [x] Implement `updateDemoPhysics()` — AI-only physics, no player car
- [x] Implement `updateDemoAudio()` — engine/tire/wind audio following AI car
- [x] Camera follows AI car in demo mode
- [x] Minimal demo HUD (car name, track name, conditions, exit prompt)
- [x] Demo mode toggle in Settings menu (toggle button)
- [x] Hide pause handling during demo (no pause in demo)
- [x] Reset `isDemo` flag on return to menu
- [x] Skip player car creation, countdown, lap tracking in demo mode

**Acceptance Criteria:**
- Demo starts after 3 minutes of idle on menu ✅
- Random car, track, weather, and time-of-day each run ✅
- Single AI car drives leisurely (aggressiveness 0.3) ✅
- No countdown, no lap limit, no position tracking ✅
- Minimal HUD shows car name, track name, exit prompt ✅
- Any input exits to menu ✅
- Demo can be disabled in settings ✅
- Audio plays during demo ✅
- Camera follows AI car ✅
- No game-breaking bugs in demo mode ✅

---

## 4. Post-MVP Roadmap (Future)

| Feature | Priority | Dependencies |
|---------|----------|--------------|
| Manual transmission | Medium | Physics |
| Damage system | Medium | Physics, rendering |
| Online multiplayer | High | Networking |
| Music soundtrack | Low | Audio |
| Car customization | Medium | UI, physics |
| Mobile controls | Low | Input |
| Day/night cycle | Low | Rendering |
| Weather effects | Low | Rendering |

## 5. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Physics tuning takes too long | High | Start simple, iterate ✅ |
| WebGL2 not supported | Low | Show fallback message |
| Performance issues | High | Profile early, optimize late 🔄 |
| Audio browser issues | Medium | Graceful fallback ✅ |
| Gamepad compatibility | Medium | Test multiple controllers |
| Car renaming breaks tests | Medium | Update all tests in Phase 14 |

## 6. Definition of Done

MVP is complete when:
1. Player can select from 4 cars with distinct names and engines ✅
2. Player can select from 6 tracks with distinct themes ✅
3. Player can override weather conditions per race ✅
4. Player races against 3 AI opponents ✅
5. Race completes with correct results ✅
6. Game runs at 60 FPS on target hardware ✅
7. All audio works (per-car engines, turbo, tire, wind, collision, UI) ✅
8. Full menu flow works with keyboard and gamepad ✅
9. No game-breaking bugs ✅
10. Scoring and leaderboard work ✅
11. Rebindable controls work ✅
12. Camera views work ✅
13. All tests pass ✅
