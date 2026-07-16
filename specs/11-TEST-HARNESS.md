# OCBP Racer — Test Harness Specification

## 1. Overview

The test harness is an automated in-browser test suite that validates all game systems. It runs 118 tests across 23 phases (Phase 0–22), covering project setup through HDR lighting and car headlights.

## 2. Accessing the Test Harness

### 2.1 URL
```
http://localhost:3000?test
```

Append `?test` to the dev server URL to activate the test harness instead of the normal game.

### 2.2 How It Works
1. `main.ts` checks for `?test` query parameter
2. If present, imports and runs `runTestHarness()` from `src/test-harness.ts`
3. Tests execute synchronously and asynchronously in the browser
4. Results displayed as an overlay on the page
5. If all tests pass, clicking the results overlay starts the game

## 3. Test Framework

### 3.1 Architecture
- Custom lightweight test framework (no external testing libraries)
- `test(name, fn)` — synchronous test with try/catch
- `testAsync(name, fn)` — async test with try/catch
- `assert(condition, msg)` — throws on failure
- Results collected in `results[]` array
- Console output: `✓` for pass, `✗` for fail

### 3.2 Test Result Structure
```typescript
interface TestResult {
  name: string
  passed: boolean
  error?: string  // Error message if failed
}
```

### 3.3 Output Format
```
=== OCBP Racer Test Harness ===

-- Phase 0: Project Setup --
  ✓ Three.js imports
  ✓ Car configs defined
  ✓ getCarById works

-- Phase 1: Core Rendering --
  ✓ WebGL renderer creates
  ✓ Scene + camera + lights
  ✓ Ground plane creates

...

=== Results ===
55 passed, 0 failed, 55 total
```

### 3.4 Visual Overlay
- Dark background (#0a0a1a)
- Green text for passing tests (#00ff88)
- Red text for failing tests (#ff4444)
- Summary header with pass/fail count
- Multi-column layout for compact display
- If all pass: "CLICK ANYWHERE TO START" hint

## 4. Visual Style — Arcade Terminal

The test harness overlay is styled to feel like part of the arcade game: a glowing green terminal panel centered on a dark screen.

### 4.1 Layout Structure
The overlay is a flexbox-centered container with a CSS grid inside for phase columns:

```
╔═══════════════════════════════════════════════════════════╗
║  (scanline animation sweeps vertically)                   ║
║                                                           ║
║              ═══ OCBP Racer ═══                           ║
║                  Test Harness                             ║
║                                                           ║
║  ┌──────────────────┐  ┌──────────────────┐              ║
║  │ PHASE 0: SETUP   │  │ PHASE 1: RENDER │              ║
║  │  ✓ Three.js      │  │  ✓ WebGL         │              ║
║  │  ✓ Car configs   │  │  ✓ Scene         │              ║
║  │  ✓ getCarById    │  │  ✓ Ground        │              ║
║  └──────────────────┘  └──────────────────┘              ║
║  ┌──────────────────┐  ┌──────────────────┐              ║
║  │ PHASE 2: PHYSICS │  │ PHASE 3: CAMERA │              ║
║  │  ✓ Rapier WASM   │  │  ✓ Controller    │              ║
║  │  ✓ Car body      │  │  ✓ Follows car   │              ║
║  │  ✓ Accelerates   │  └──────────────────┘              ║
║  └──────────────────┘                                    ║
║  ... (remaining phases) ...                               ║
║                                                           ║
║  ─────────────────────────────────────────                ║
║         118/118 PASSED                                    ║
║                                                           ║
║            CLICK ANYWHERE TO START                        ║
╚═══════════════════════════════════════════════════════════╝
```

### 4.2 Container Styling
- **Centering:** Overlay uses `display:flex; align-items:center; justify-content:center` to center the panel
- **Border:** 2px solid #00ff88 with `border-radius: 8px`
- **Glow animation:** Pulsing `box-shadow` in green (00ff88), oscillating between 8px and 16px spread
- **Scanline:** A 4px-tall translucent green gradient sweeps vertically on a 4s loop
- **Background:** Near-black (`rgba(5,5,16,0.97)`)
- **No internal scroll:** Grid fits entirely within the viewport — no `overflow-y`

### 4.3 Grid Implementation
Fixed 5-column layout. 23 phase cards arranged in 5 columns × 5 rows, fitting on one screen without scroll.

```css
.th-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 8px;
}
.th-phase {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 4px;
  padding: 6px 8px;
}
.th-phase-head {
  color: #00ff88;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(0,255,136,0.15);
}
```

### 4.4 Typography
- Font: `'Courier New', monospace`
- Title: 16px, bold, letter-spacing 3px, uppercase, green with text-shadow glow
- Phase headers: 10px, bold, uppercase, green
- Test items: 11px, grey (#889), green (#00ff88) for pass, red (#ff4444) for fail
- Summary: 14px, bold, letter-spacing 2px

### 4.5 Layout
- Fixed 5-column grid — all 23 phases visible at once, no scrolling required
- Container width: 95vw, centered on screen
- Phase cards compact: 6px/8px padding, 10px font

### 4.6 Summary Bar
- Centered below grid, separated by a green border-top
- Green (#00ff88) with glow if all pass
- Red (#ff4444) with glow if any fail
- Format: `118/118 PASSED` or `116/118 PASSED — 2 FAILED`
- Red background if any fail

## 5. Test Inventory

### Phase 0: Project Setup (3 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 1 | Three.js imports | Sync | Verifies THREE.Scene, PerspectiveCamera, WebGLRenderer exist |
| 2 | Car configs defined | Sync | Checks 4 cars exist with valid ids, names, engineForce, maxSpeed |
| 3 | getCarById works | Sync | Looks up 'rossini-488' and verifies name |

### Phase 1: Core Rendering (3 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 4 | WebGL renderer creates | Sync | Checks WebGL/WebGL2 context available |
| 5 | Scene + camera + lights | Sync | Creates scene with camera + ambient + directional, checks ≥3 children |
| 6 | Ground plane creates | Sync | Creates PlaneGeometry, checks vertex count > 0 |

### Phase 2: Car Physics (6 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 7 | Rapier WASM initializes | Async | Creates PhysicsWorld, inits, checks world exists |
| 8 | Car body + collider created | Async | Creates car via CarFactory, checks position, speed=0, mesh in scene |
| 9 | Car accelerates on throttle | Async | Runs 60 physics steps with full throttle, checks speed > 0 |
| 10 | Car brakes | Async | Accelerates then brakes for 120 steps, checks speed decreased |
| 11 | Car steers | Async | Runs 120 steps with steer=1, checks quaternion angle changed |
| 12 | 4 cars have distinct configs | Async | Creates 4 cars via CarFactory, checks each config differs |

### Phase 3: Chase Camera (2 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 13 | CameraController creates | Sync | Creates CameraController, checks not null |
| 14 | Camera follows car position | Sync | Updates camera with car position, checks camera moved |

### Phase 4: Track (7 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 15 | Track creates | Sync | Creates Track, checks spline exists |
| 16 | Track spline is closed loop | Sync | Gets points at t=0 and t=0.5, checks distance > 10 |
| 17 | Track has checkpoints | Sync | Gets start position, checks defined |
| 18 | Track lap counting works | Sync | Checks lapCount=3, currentLap=0 |
| 19 | Track getCenter returns valid vector | Sync | Checks center.x and center.z are numbers in range |
| 20 | Track getRadius returns positive value | Sync | Checks radius > 0 and < 1000 |
| 21 | Track builds into scene | Async | Builds track into scene, checks children added |

### Phase 5: Input System (2 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 22 | InputManager creates | Sync | Creates InputManager, checks throttle/brake/steer are numbers, pause is boolean |
| 23 | Default input is zeroed | Sync | Checks throttle=0, brake=0, steer=0 |

### Phase 6: Car Roster (8 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 24 | Rossini 488 config | Sync | Checks mass=1550, color=0xdc143c |
| 25 | Weissach GT3 config | Sync | Checks peakGrip=2.4 |
| 26 | Kaiju GT-R config | Sync | Checks engineForce=950 |
| 27 | Stingray Z06 config | Sync | Checks maxSpeed=265 |
| 28 | Turbo lag times correct | Sync | Checks turboLagTime: 488=0.15, GT3=0.0, GTR=0.25, Z06=0.0 |
| 29 | Per-car engine config exists | Sync | Checks all 4 cars have engine.type, baseFrequency, maxFrequency |
| 30 | CarFactory creates colored mesh | Async | Creates car, checks mesh has ≥5 children (body+cabin+4wheels) |
| 31 | Boost level ramps up for turbo car over time | Async | Simulates throttle-on for 60 frames, checks turboBoost > 0 and naBoost = 1 |

### Phase 7: Audio System (4 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 32 | AudioManager creates without error | Sync | Creates AudioManager, checks not null |
| 33 | AudioManager init creates context | Async | Calls init(), checks no error thrown |
| 34 | AudioManager setMasterVolume clamps values | Sync | Sets 0.5, -1, 2 — no error thrown |
| 35 | AudioManager setEngineVolume clamps values | Sync | Sets 0.7, -0.5, 1.5 — no error thrown |

### Phase 8: AI Opponents (5 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 36 | AIController creates | Async | Creates AIController, checks not null, car matches |
| 37 | AI produces input | Async | Updates AI, checks throttle/steer are numbers |
| 38 | AI aggressiveness affects driving | Async | Runs beginner vs pro AI for 300 steps, checks fast AI ahead |
| 39 | AI lap counter requires halfway progress | Async | Teleports car near start/finish 5 times without crossing halfway, checks lap=0 |
| 40 | AI recovery teleport resets position to spline | Async | Teleports car off-track, runs 320 recovery frames, checks car near track |

### Phase 9: UI (6 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 41 | StateMachine creates with MENU state | Sync | Creates StateMachine, checks current='MENU' |
| 42 | StateMachine transitions | Sync | Transitions to CAR_SELECT, checks current and previous |
| 43 | StateMachine stores car selection | Sync | Sets selected car, gets it back |
| 44 | StateMachine stores race results | Sync | Sets results, gets them back |
| 45 | DEMO state exists | Sync | Creates StateMachine, checks DEMO is valid GameState |
| 46 | demoEnabled defaults to true | Sync | Checks default settings.demoEnabled === true |

### Phase 10: Game Loop (2 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 47 | Full integration: car on track | Async | Creates world + track + car, runs 300 steps, checks speed > 0 and position changed |
| 48 | Full integration: 4 cars on track | Async | Creates 4 cars, runs 60 steps, checks all speeds > 0 |

### Phase 11: Track Definitions (7 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 49 | 6 tracks defined | Sync | Checks TRACKS.length === 6 |
| 50 | All tracks have required fields | Sync | Verifies id, name, controlPoints (>=10), distanceKm, checkpointCount (>=6) |
| 51 | Typhoon Pass has elevation in control points | Sync | Checks at least one control point has y > 0.5 |
| 52 | Track difficulties range from Easy to Expert | Sync | Checks all difficulty levels present |
| 53 | Track IDs are unique | Sync | Checks no duplicate IDs |
| 54 | All tracks create valid splines | Sync | Creates Track for each definition, verifies spline points not too close |
| 55 | All tracks build into scene | Async | Builds each track into scene, checks meshes added |

### Phase 12: Time of Day (2 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 56 | 4 time-of-day presets exist | Sync | Verifies dawn, day, dusk, night presets |
| 57 | Time-of-day presets have valid values | Sync | Checks ambientIntensity, fogNear/Far, temperature |

### Phase 13: Weather System (5 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 58 | 4 weather presets exist | Sync | Verifies clear, rain, fog, storm presets |
| 59 | Clear weather has no modifiers | Sync | Checks grip/drag/braking = 1.0, rainIntensity = 0 |
| 60 | Storm reduces grip below rain | Sync | Checks storm.gripMultiplier < rain.gripMultiplier |
| 61 | Environment modifiers combine correctly | Sync | Checks combineModifiers returns correct values |
| 62 | Weather reduces car acceleration in simulation | Async | Simulates dry vs wet for 180 steps, checks wetSpeed < drySpeed |

### Phase 15: Camera Views (4 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 63 | CameraController creates with chase view | Sync | Checks default view is 'chase' |
| 64 | cycleView cycles through all 4 views | Sync | Cycles 4 times, checks windscreen→hood→bumper→chase |
| 65 | setView changes to specific view | Sync | Sets 'hood', checks getView() returns 'hood' |
| 66 | getViewConfigs returns all 4 views | Sync | Checks chase, windscreen, hood, bumper keys present |

### Phase 16: Scoring + Leaderboard (8 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 67 | RaceResults includes scoring fields | Sync | Sets results with all fields, verifies retrieval |
| 68 | LEADERBOARD state exists | Sync | Transitions to LEADERBOARD, checks valid state |
| 69 | Leaderboard add + retrieve per-track | Sync | Adds entry, retrieves per-track, checks length and time |
| 70 | Leaderboard overall aggregates | Sync | Adds 2 entries different tracks, checks overall length=2, sorted |
| 71 | Leaderboard sorts by time ascending | Sync | Adds 2 entries same track, checks order |
| 72 | clearLeaderboard empties all data | Sync | Adds entry, clears, checks empty |
| 73 | Scoring points map correctly: 10/7/5/2 | Sync | Checks each position gets correct points |
| 74 | Wall hits tracked in simulation | Async | Drives car with alternating steer for 600 steps, checks wallHits >= 0 |

### Phase 17: Rebindable Controls (5 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 75 | InputManager creates with default bindings | Sync | Checks throttle=W, brake=S, steerLeft=A, pause=Escape |
| 76 | InputManager default bindings match constant | Sync | Iterates DEFAULT_KEY_BINDINGS, checks all match |
| 77 | InputManager resetBindings restores defaults | Sync | Resets, checks throttle=W |
| 78 | InputManager setBindings round-trip | Sync | Sets custom throttle=T, checks it sticks, brake unchanged |
| 79 | InputManager conflict detection swaps bindings | Sync | Swaps pause↔cameraSwitch, checks both updated |

### Phase 18: Bug Fixes & Polish (6 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 80 | StateMachine LOADING state removed | Sync | Verifies LOADING is no longer a valid state |
| 81 | CarConfig autoCorrect field removed | Sync | Checks all cars lack autoCorrect property |
| 82 | EngineDefinition has per-car waveforms | Sync | All 4 cars have valid primaryWaveform and secondaryWaveform |
| 83 | Turbo cars have turboLagTime > 0 | Sync | Rossini and Kaiju are turbo |
| 84 | NA cars have turboLagTime === 0 | Sync | Weissach and Stingray are NA |
| 85 | AudioManager has UI audio methods | Sync | playUIClick and playUIConfirm exist |

### Phase 19: Car Preview & HUD Score Removal (9 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 86 | StateMachine has CAR_PREVIEW state | Sync | Transitions MENU→CAR_SELECT→CAR_PREVIEW |
| 87 | CAR_PREVIEW transitions to TRACK_SELECT | Sync | CAR_PREVIEW→TRACK_SELECT works |
| 88 | CAR_PREVIEW transitions back to CAR_SELECT | Sync | CAR_PREVIEW→CAR_SELECT works |
| 89 | TRACK_SELECT transitions back to CAR_PREVIEW | Sync | TRACK_SELECT→CAR_PREVIEW works |
| 90 | CarFactory has createPreviewMesh method | Sync | Checks method exists on prototype |
| 91 | CarFactory createPreviewMesh returns a Group | Async | Creates preview mesh for rossini-488, checks not null |
| 92 | createPreviewMesh works for all 4 cars | Async | Iterates all CARS, checks each mesh not null |
| 93 | CarPreview state type exists in GameState | Sync | Transitions to CAR_PREVIEW, checks state |
| 94 | UIManager can be constructed | Sync | Creates UIManager with StateMachine, checks not null |

### Phase 20: HUD Gauges, Thumbnails & UI Fixes (11 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 95 | HUDGauges class exists | Sync | Checks HUDGauges is a function |
| 96 | HUDGauges has create method | Sync | Checks create exists on prototype |
| 97 | HUDGauges has update method | Sync | Checks update exists on prototype |
| 98 | HUDGauges has remove method | Sync | Checks remove exists on prototype |
| 99 | CarFactory has generateThumbnails method | Sync | Checks method exists on prototype |
| 100 | generateThumbnails returns Map with 4 entries | Async | Generates thumbnails, checks Map with 4 data URLs |
| 101 | UIManager init accepts thumbnails parameter | Sync | Checks init method exists |
| 102 | UIManager has updateHUD method | Sync | Checks updateHUD exists |
| 103 | UIManager has showHUD method | Sync | Checks showHUD exists |
| 104 | Car engine text is two-line format | Sync | Checks all cars have engine.displacement and type |
| 105 | Car engine definitions have displacement + type + HP | Sync | Checks displacement, type, horsepower > 100 for all cars |

### Phase 21: HDR Environment Maps (5 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 106 | All 4 TOD presets have hdrPath | Sync | Checks hdrPath is a non-empty string on all presets |
| 107 | HDR paths reference assets/hdr/ directory | Sync | Checks path starts with 'assets/hdr/' and ends with .hdr/.exr |
| 108 | EnvironmentManager has initEnvironmentMaps method | Sync | Checks method exists on prototype |
| 109 | TimeOfDayPreset interface includes hdrPath field | Sync | Checks 'hdrPath' in day preset |
| 110 | skyColor fallback still exists on all presets | Sync | Checks skyColor is instance of THREE.Color |

### Phase 22: EXR Support, Lighting Presets, Car Headlights (8 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 111 | TimeOfDayPreset includes hdrVerticalOffset field | Sync | Checks field exists on night preset |
| 112 | Night preset has hdrVerticalOffset 0.15 | Sync | Checks exact value |
| 113 | Dawn, day, dusk presets have no hdrVerticalOffset | Sync | Checks undefined or 0 |
| 114 | All presets have ambient and directional light values | Sync | Checks ambientIntensity, directionalIntensity, colors on all presets |
| 115 | Night preset has elevated ambient/directional (0.6) | Sync | Checks night ambient=0.6 and directional=0.6 |
| 116 | CarController has setHeadlights method | Sync | Checks method exists on prototype |
| 117 | All 4 HDR files use .exr extension | Sync | Checks all hdrPath ends with .exr |
| 118 | All HDR paths contain 1k resolution suffix | Sync | Checks all hdrPath includes '1k' |

**Total: 118 tests** (Phases 0–22)

## 6. Test Dependencies

### 6.1 Required Systems
| System | Tests Using It |
|--------|---------------|
| Three.js | 1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 30, 57, 106–110 |
| Rapier.js | 7, 8, 9, 10, 11, 12, 21, 30, 36, 37, 47, 48 |
| CarFactory | 8, 9, 10, 11, 12, 30, 47, 48, 91, 92, 99, 100 |
| CarConfigs | 2, 3, 24–29, 83–85, 104, 105 |
| Track | 15–21, 36–40, 47, 48, 55 |
| SplinePath | 16, 17, 21 |
| AIController | 36, 37, 38, 39, 40 |
| InputManager | 22, 23, 75–79 |
| StateMachine | 41–46, 67, 68, 80, 86–89, 93 |
| AudioManager | 32–35, 85 |
| CameraController | 13, 14, 63–66 |
| EnvironmentManager | 108 |
| TimeOfDayPresets | 56, 57, 106, 109, 111–115, 117, 118 |
| WeatherPresets | 58–60 |
| LeaderboardManager | 69–72 |
| HUDGauges | 95–98 |

### 6.2 Async Tests
Tests 7–12, 21, 30, 31, 36–40, 47, 48, 55, 62, 74, 91, 92, 100 require async execution because they initialize Rapier.js WASM or load GLTF models. Each physics test creates and disposes its own PhysicsWorld instance.

### 6.3 Test Isolation
- Each async test creates its own PhysicsWorld and disposes it after
- No shared state between tests (except the results array)
- Tests can run in any order

## 7. Running Tests

### 7.1 Development
```bash
npm run dev
# Open http://localhost:3000?test
```

### 7.2 Expected Output (Console)
```
=== OCBP Racer Test Harness ===

-- Phase 0: Project Setup --
  ✓ Three.js imports
  ✓ Car configs defined
  ✓ getCarById works

-- Phase 1: Core Rendering --
  ✓ WebGL renderer creates
  ✓ Scene + camera + lights
  ✓ Ground plane creates

-- Phase 2: Car Physics --
  ✓ Rapier WASM initializes
  ✓ Car body + collider created
  ✓ Car accelerates on throttle
  ✓ Car brakes
  ✓ Car steers
  ✓ 4 cars have distinct configs

...

-- Phase 22: Lighting & Headlight Overrides --
  ✓ TimeOfDayPreset includes hdrVerticalOffset field
  ✓ Night preset has hdrVerticalOffset 0.15
  ✓ Dawn, day, dusk presets have no hdrVerticalOffset
  ✓ All presets have ambient and directional light values
  ✓ Night preset has elevated ambient/directional (0.6)
  ✓ CarController has setHeadlights method
  ✓ All 4 HDR files use .exr extension
  ✓ All HDR paths contain 1k resolution suffix

=== Results ===
118 passed, 0 failed, 118 total
```

## 8. Failure Handling

### 8.1 Failed Test Display
- Failed tests shown in red with error message
- Console output shows `✗` prefix with error details
- Game cannot be started from overlay if any tests fail

### 8.2 Common Failure Causes
| Failure | Likely Cause |
|---------|-------------|
| Three.js imports | Three.js not installed or import path wrong |
| Rapier WASM initializes | Rapier WASM files not served correctly |
| Car configs defined | CarConfigs.ts values changed |
| Track creates | Track.ts or SplinePath.ts broken |
| AI produces input | AIController.ts broken |
| StateMachine transitions | StateMachine.ts state machine broken |
| Turbo lag times | CarConfig.turboLagTime not added |
| Camera views | CameraController view system not implemented |

## 9. Adding New Tests

### 9.1 Location
All tests are in `src/test-harness.ts`.

### 9.2 Adding a Sync Test
```typescript
test('My new test', () => {
  const result = someFunction()
  assert(result === expected, `Expected ${expected}, got ${result}`)
})
```

### 9.3 Adding an Async Test
```typescript
await testAsync('My async test', async () => {
  const pw = new PhysicsWorld()
  await pw.init()
  // ... test logic ...
  pw.dispose()
})
```

### 9.4 Naming Convention
- Use descriptive names (e.g., "Car accelerates on throttle")
- Group by phase with console.log headers
- Keep tests focused (one assertion per test ideal)

## 10. Performance Considerations

- Async tests create/dispose PhysicsWorld instances (Rapier WASM)
- Total test execution: ~3-6 seconds depending on hardware
- No network requests during tests (all local)
- Test overlay is DOM-based (not canvas)
- Multi-column layout reduces vertical scroll
