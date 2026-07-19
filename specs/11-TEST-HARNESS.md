# OCBP Racer — Test Harness Specification

## 1. Overview

OCBP Racer uses a three-layer testing strategy:

| Layer | Tool | Environment | Test Count | Purpose |
|-------|------|-------------|------------|---------|
| **Layer 1** | Vitest | Node.js | 88 | Unit tests for pure logic (configs, utils, bindings, AI profiles) |
| **Layer 2** | Custom harness | Browser | 139 | Integration tests (physics, rendering, audio, game systems) |
| **Layer 3** | Playwright | Headless Chromium | 22 | E2E tests (UI flows, state transitions, navigation) |

**Total: 249 tests across 3 layers**

## 2. Layer 1: Vitest Unit Tests

### 2.1 Accessing
```bash
npm test              # Run all unit tests
npm run test:watch    # Watch mode
npm run test:ui       # UI mode
```

### 2.2 Architecture
- Vitest v4.1.10 with globals mode
- Node environment (no browser needed)
- Files: `src/**/*.test.ts`

### 2.3 Test Files
| File | Tests | Coverage |
|------|-------|----------|
| `src/cars/CarConfigs.test.ts` | 11 | CARS constant, getCarById, getCarsForReleaseChannel |
| `src/environment/WeatherPresets.test.ts` | 8 | Preset values, multiplier ranges, id/name matching |
| `src/core/StateMachine.test.ts` | 18 | State transitions, listeners, race results, settings |
| `src/environment/EnvironmentModifiers.test.ts` | 3 | combineModifiers function |
| `src/input/InputManager.test.ts` | 9 | DEFAULT_KEY_BINDINGS structure, duplicate keys |
| `src/ai/AIController.test.ts` | 7 | DIFFICULTY_PROFILES progression, valid ranges |
| `src/utils.test.ts` | 23 | formatTime, getOrdinalSuffix, convertSpeed, speedUnitLabel |
| `src/ui/LeaderboardManager.test.ts` | 9 | addEntry, sorting, limits, clearLeaderboard |

## 3. Layer 2: Browser Test Harness

### 3.1 Accessing
```
http://localhost:3000?test
```

Append `?test` to the dev server URL to activate the test harness instead of the normal game.

### 3.2 How It Works
1. `main.ts` checks for `?test` query parameter
2. If present, imports and runs `runTestHarness()` from `src/test-harness.ts`
3. Tests execute synchronously and asynchronously in the browser
4. Results displayed as an overlay on the page
5. If all tests pass, clicking the results overlay starts the game

## 4. Test Framework

### 4.1 Architecture
- Custom lightweight test framework (no external testing libraries)
- `test(name, fn)` — synchronous test with try/catch
- `testAsync(name, fn)` — async test with try/catch
- `assert(condition, msg)` — throws on failure
- Results collected in `results[]` array
- Console output: `✓` for pass, `✗` for fail

### 4.2 Test Result Structure
```typescript
interface TestResult {
  name: string
  passed: boolean
  error?: string  // Error message if failed
  phase: string
  duration?: number
}
```

### 4.3 Output Format
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

### 4.4 Visual Overlay
- Dark background (#0a0a1a)
- Green text for passing tests (#00ff88)
- Red text for failing tests (#ff4444)
- Summary header with pass/fail count
- Multi-column layout for compact display
- If all pass: "CLICK ANYWHERE TO START" hint

### 4.5 Enhanced Assertions
The test harness includes an `expect()`-style assertion library:
- `expect(value).toBe(expected)` — strict equality
- `expect(value).toEqual(expected)` — deep equality
- `expect(value).toBeGreaterThan(n)` / `toBeLessThan(n)`
- `expect(value).toBeTruthy()` / `toBeFalsy()`
- `expect(value).toContain(item)` — array/string contains (throws if value is not an array or string)
- `expect(value).toHaveLength(n)` — array/string length (throws if value is not an array or string)

### 4.6 JSON Output
The harness outputs structured JSON for CI/headless consumption:
```json
{
  "total": 139,
  "passed": 139,
  "failed": 0,
  "duration": 1234.5,
  "phases": [
    {
      "name": "Phase 0: Setup",
      "tests": [
        { "name": "Three.js imports", "passed": true, "duration": 1.2 }
      ]
    }
  ]
}
```
Output tagged with `[TEST_JSON]` prefix in console. Results also exposed on `window.__OCBP_TEST_RESULTS__`.

## 5. Visual Style — Arcade Terminal

The test harness overlay is styled to feel like part of the arcade game: a glowing green terminal panel centered on a dark screen.

### 5.1 Layout Structure
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
║         127/127 PASSED                                    ║
║                                                           ║
║            CLICK ANYWHERE TO START                        ║
╚═══════════════════════════════════════════════════════════╝
```

### 5.2 Container Styling
- **Centering:** Overlay uses `display:flex; align-items:center; justify-content:center` to center the panel
- **Border:** 2px solid #00ff88 with `border-radius: 8px`
- **Glow animation:** Pulsing `box-shadow` in green (00ff88), oscillating between 8px and 16px spread
- **Scanline:** A 4px-tall translucent green gradient sweeps vertically on a 4s loop
- **Background:** Near-black (`rgba(5,5,16,0.97)`)
- **No internal scroll:** Grid fits entirely within the viewport — no `overflow-y`

### 5.3 Grid Implementation
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

### 5.4 Typography
- Font: `'Courier New', monospace`
- Title: 16px, bold, letter-spacing 3px, uppercase, green with text-shadow glow
- Phase headers: 10px, bold, uppercase, green
- Test items: 11px, grey (#889), green (#00ff88) for pass, red (#ff4444) for fail
- Summary: 14px, bold, letter-spacing 2px

### 5.5 Layout
- Fixed 5-column grid — all 23 phases visible at once, no scrolling required
- Container width: 95vw, centered on screen
- Phase cards compact: 6px/8px padding, 10px font

### 5.6 Summary Bar
- Centered below grid, separated by a green border-top
- Green (#00ff88) with glow if all pass
- Red (#ff4444) with glow if any fail
- Format: `127/127 PASSED` or `125/127 PASSED — 2 FAILED`
- Red background if any fail

## 6. Test Inventory

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

### Phase 23: Release Channels (5 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 119 | TrackDefinition includes releaseChannel field | Sync | Checks all 6 tracks have releaseChannel |
| 120 | Midnight Circuit is green release | Sync | Checks midnight-circuit has releaseChannel 'green' |
| 121 | All other tracks are blue releases | Sync | Checks tracks 2-6 have releaseChannel 'blue' |
| 122 | GameSettings includes releaseChannel field | Sync | Checks default settings has releaseChannel 'green' |
| 123 | getTracksForReleaseChannel filters correctly | Sync | Filters green channel → only midnight-circuit; blue → all 6 |

### Phase 24: Car Release Channels (4 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 124 | CarDefinition includes releaseChannel field | Sync | Checks all 4 cars have releaseChannel |
| 125 | Rossini 488 is green release | Sync | Checks rossini-488 has releaseChannel 'green' |
| 126 | All other cars are blue releases | Sync | Checks cars 2-4 have releaseChannel 'blue' |
| 127 | getCarsForReleaseChannel filters correctly | Sync | Filters green channel → only rossini-488; blue → all 4 |

### Phase 25: Engine Audio Samples (4 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 128 | AudioManager has loadEngineSamples method | Sync | Checks loadEngineSamples exists on prototype |
| 129 | AudioManager has sample cache | Sync | Checks sampleCache property exists |
| 130 | CarController has getThrottle method | Sync | Checks getThrottle exists on CarController prototype |
| 131 | ENGINE_SAMPLE_PATHS covers all 4 cars | Sync | Verifies all 4 car IDs exist in CARS |

### Phase 26: Handling Overhaul (5 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 132 | CarController has calculateSlipAngle method | Sync | Checks calculateSlipAngle exists on prototype |
| 133 | CarController has calculateGripCoefficient method | Sync | Checks calculateGripCoefficient exists on prototype |
| 134 | All cars have distinct mass values | Sync | Ensures each car has unique mass |
| 135 | All cars have distinct peakGrip values | Sync | Ensures each car has unique peak grip |
| 136 | All cars have distinct slipAnglePeak values | Sync | Ensures each car has unique slip angle peak |

### Phase 27: Turbo Sample Audio (3 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 137 | AudioManager has loadTurboSamples method | Sync | Checks loadTurboSamples exists on prototype |
| 138 | AudioManager has turboSampleCache | Sync | Checks turboSampleCache property exists |
| 139 | Turbo cars only: Rossini and Kaiju | Sync | Verifies exactly 2 turbo cars with correct IDs |

**Total: 139 tests** (Phases 0–27)

## 6. Test Dependencies

### 6.1 Required Systems
| System | Tests Using It |
|--------|---------------|
| Three.js | 1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 30, 57, 106–110 |
| Rapier.js | 7, 8, 9, 10, 11, 12, 21, 30, 36, 37, 47, 48 |
| CarFactory | 8, 9, 10, 11, 12, 30, 47, 48, 91, 92, 99, 100 |
| Track | 15–21, 36–40, 47, 48, 55 |
| SplinePath | 16, 17, 21 |
| AIController | 36, 37, 38, 39, 40 |
| InputManager | 22, 23, 75–79 |
| StateMachine | 41–46, 67, 68, 80, 86–89, 93 |
| AudioManager | 32–35, 85, 128, 129 |
| CameraController | 13, 14, 63–66 |
| EnvironmentManager | 108 |
| TimeOfDayPresets | 56, 57, 106, 109, 111–115, 117, 118 |
| WeatherPresets | 58–60 |
| LeaderboardManager | 69–72 |
| HUDGauges | 95–98 |
| TrackDefinitions | 119–121, 123 |
| CarConfigs | 2, 3, 24–29, 83–85, 104, 105, 124–127 |

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

-- Phase 23: Release Channels --
  ✓ TrackDefinition includes releaseChannel field
  ✓ Midnight Circuit is green release
  ✓ All other tracks are blue releases
  ✓ GameSettings includes releaseChannel field
  ✓ getTracksForReleaseChannel filters correctly

-- Phase 24: Car Release Channels --
  ✓ CarDefinition includes releaseChannel field
  ✓ Rossini 488 is green release
  ✓ All other cars are blue releases
  ✓ getCarsForReleaseChannel filters correctly

=== Results ===
127 passed, 0 failed, 127 total
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

## 11. Layer 3: Playwright E2E Tests

### 11.1 Accessing
```bash
npm run test:e2e       # Run all E2E tests
npm run test:e2e:ui    # Playwright UI mode
```

### 11.2 Architecture
- Playwright v1.61.1 with Chromium
- Headless mode with SwiftShader WebGL (for CI compatibility)
- Shared page per serial describe block (via `test.beforeAll`)
- Game init takes ~45s in headless Chrome (SwiftShader software rendering)
- Config: `playwright.config.ts`

### 11.3 Test Files
| File | Tests | Coverage |
|------|-------|----------|
| `e2e/main-menu.spec.ts` | 5 | Title, version, navigation to car select/settings/leaderboard |
| `e2e/car-select.spec.ts` | 5 | Car cards, selection, direct navigation to car preview |
| `e2e/track-select.spec.ts` | 4 | Track options, ToD/weather overrides, Back navigation |
| `e2e/settings.spec.ts` | 5 | Settings title, sliders, MPH/KPH, graphics quality, Back |
| `e2e/full-flow.spec.ts` | 3 | Complete car selection flow, back navigation, settings+leaderboard |

### 11.4 Key Design Decisions
- **Serial describe blocks**: Each test file uses `test.describe.serial` with `test.beforeAll` to share a single page across tests (avoids re-initializing the game per test)
- **Green release channel**: Car select tests accommodate the default `'green'` channel which shows only 1 car (Rossini 488)
- **Long timeouts**: Game init requires 60s+ timeout in headless Chrome due to SwiftShader software rendering
- **No data-testid attributes**: All selectors use CSS classes and text content (matching existing UI patterns)

### 11.5 Running All Tests
```bash
npm test                    # Layer 1: Vitest unit tests (88 tests, ~240ms)
# Layer 2: Browser harness (139 tests, open http://localhost:3000?test)
npm run test:e2e            # Layer 3: Playwright E2E (22 tests, ~5min)
```
