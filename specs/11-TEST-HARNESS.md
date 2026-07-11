# OCBP Racer — Test Harness Specification

## 1. Overview

The test harness is an automated in-browser test suite that validates all game systems. It runs 77 tests across 16 phases, covering project setup through full integration.

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
║         77/77 PASSED                                     ║
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
- **Scrollbar:** Thin green (6px) with track matching background

### 4.3 Grid Implementation
```css
.th-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.th-phase {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 4px;
  padding: 10px 12px;
}
.th-phase-head {
  color: #00ff88;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(0,255,136,0.15);
}
```

### 4.4 Typography
- Font: `'Courier New', monospace`
- Title: 16px, bold, letter-spacing 3px, uppercase, green with text-shadow glow
- Phase headers: 11px, bold, uppercase, green
- Test items: 11px, grey (#889), green (#00ff88) for pass, red (#ff4444) for fail
- Summary: 14px, bold, letter-spacing 2px

### 4.5 Responsive Behavior
- Grid auto-fill with `minmax(220px, 1fr)` handles all screen sizes
- Wide screens: 3-4 columns
- Medium screens: 2 columns
- Narrow screens: 1 column
- Container max-width: 95vw, max-height: 92vh, with overflow-y scroll

### 4.6 Summary Bar
- Centered below grid, separated by a green border-top
- Green (#00ff88) with glow if all pass
- Red (#ff4444) with glow if any fail
- Format: `77/77 PASSED` or `75/77 PASSED — 2 FAILED`
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

### Phase 4: Track (5 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 15 | Track creates | Sync | Creates Track, checks spline exists |
| 16 | Track spline is closed loop | Sync | Gets points at t=0 and t=0.5, checks distance > 10 |
| 17 | Track has checkpoints | Sync | Gets start position, checks defined |
| 18 | Track lap counting works | Sync | Checks lapCount=3, currentLap=0 |
| 19 | Track builds into scene | Async | Builds track into scene, checks children added |

### Phase 5: Input System (2 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 20 | InputManager creates | Sync | Creates InputManager, checks throttle/brake/steer are numbers, pause is boolean |
| 21 | Default input is zeroed | Sync | Checks throttle=0, brake=0, steer=0 |

### Phase 6: Car Roster (6 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 22 | Rossini 488 config | Sync | Checks mass=1550, color=0xdc143c |
| 23 | Weissach GT3 config | Sync | Checks peakGrip=2.4 |
| 24 | Kaiju GT-R config | Sync | Checks engineForce=950 |
| 25 | Stingray Z06 config | Sync | Checks maxSpeed=265 |
| 26 | CarFactory creates colored mesh | Async | Creates car, checks mesh has ≥5 children (body+cabin+4wheels) |
| 26b | Turbo lag times correct | Sync | Checks turboLagTime: 488=0.15, GT3=0.0, GTR=0.25, Z06=0.0 |

### Phase 7: Audio System (2 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 27 | AudioManager creates without error | Sync | Creates AudioManager, checks not null |
| 27b | Per-car engine config exists | Sync | Checks all 4 cars have engine.type, baseFrequency, maxFrequency |

### Phase 8: AI Opponents (2 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 28 | AIController creates | Async | Creates AIController, checks not null, car matches |
| 29 | AI produces input | Async | Updates AI, checks throttle/steer are numbers |

### Phase 9: UI (4 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 30 | StateMachine creates with MENU state | Sync | Creates StateMachine, checks current='MENU' |
| 31 | StateMachine transitions | Sync | Transitions to CAR_SELECT, checks current and previous |
| 32 | StateMachine stores car selection | Sync | Sets selected car, gets it back |
| 33 | StateMachine stores race results | Sync | Sets results, gets them back |

### Phase 10: Game Loop (2 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 34 | Full integration: car on track | Async | Creates world + track + car, runs 300 steps, checks speed > 0 and position changed |
| 35 | Full integration: 4 cars on track | Async | Creates 4 cars, runs 60 steps, checks all speeds > 0 |

### Phase 11: Track Definitions (6 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 36 | 6 tracks defined | Sync | Checks TRACKS.length === 6 |
| 37 | All tracks have required fields | Sync | Verifies id, name, controlPoints (>=10), distanceKm, checkpointCount (>=6) |
| 38 | Track difficulties range from Easy to Expert | Sync | Checks all difficulty levels present |
| 39 | Track IDs are unique | Sync | Checks no duplicate IDs |
| 40 | All tracks create valid splines | Sync | Creates Track for each definition, verifies spline points not too close |
| 41 | All tracks build into scene | Async | Builds each track into scene, checks meshes added |

### Phase 12: Time of Day (2 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 42 | 4 time-of-day presets exist | Sync | Verifies dawn, day, dusk, night presets |
| 43 | Time-of-day presets have valid values | Sync | Checks ambientIntensity, fogNear/Far, temperature |

### Phase 13: Weather System (4 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 44 | 4 weather presets exist | Sync | Verifies clear, rain, fog, storm presets |
| 45 | Clear weather has no modifiers | Sync | Checks grip/drag/braking = 1.0, rainIntensity = 0 |
| 46 | Storm reduces grip below rain | Sync | Checks storm.gripMultiplier < rain.gripMultiplier |
| 47 | Environment modifiers combine correctly | Sync | Checks combineModifiers returns correct values |

### Phase 14: Turbo Lag (3 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 48 | Turbo cars have positive lag | Sync | Checks Rossini 488 and Kaiju GT-R turboLagTime > 0 |
| 49 | NA cars have zero lag | Sync | Checks Weissach GT3 and Stingray Z06 turboLagTime === 0 |
| 50 | Boost level ramps correctly | Sync | Simulates throttle-on timing, checks boostLevel progression |

### Phase 15: Camera Views (3 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 51 | 4 camera views defined | Sync | Verifies Chase, Windscreen, Hood, Bumper parameters |
| 52 | Camera view cycling works | Sync | Cycles through views, checks all return to Chase |
| 53 | Camera FOV varies by view | Sync | Checks each view has different BaseFOV |

### Phase 16: Scoring + Leaderboard (4 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 54 | Scoring points correct | Sync | Checks 1st=10, 2nd=7, 3rd=5, 4th=2 |
| 55 | Wall hits tracked | Sync | Verifies wallHitCount increments on collision |

### Phase 17: Demo Mode (2 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 56 | DEMO state exists | Sync | Creates StateMachine, checks DEMO is valid GameState |
| 57 | demoEnabled defaults to true | Sync | Checks default settings.demoEnabled === true |

**Total: 57 tests** (55 base + 2 new)

## 6. Test Dependencies

### 6.1 Required Systems
| System | Tests Using It |
|--------|---------------|
| Three.js | 1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 26 |
| Rapier.js | 7, 8, 9, 10, 11, 12, 19, 26, 28, 29, 34, 35 |
| CarFactory | 8, 9, 10, 11, 12, 26, 34, 35 |
| CarConfigs | 2, 3, 22, 23, 24, 25, 26b, 27b, 48, 49 |
| Track | 15, 16, 17, 18, 19, 28, 29, 34, 35 |
| SplinePath | 16, 17, 19 |
| AIController | 28, 29 |
| InputManager | 20, 21 |
| StateMachine | 30, 31, 32, 33 |
| AudioManager | 27, 27b |
| CameraController | 13, 14, 51, 52, 53 |

### 6.2 Async Tests
Tests 7, 8, 9, 10, 11, 12, 19, 26, 28, 29, 34, 35 require async execution because they initialize Rapier.js WASM. Each test creates and disposes its own PhysicsWorld instance.

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

-- Phase 3: Chase Camera --
  ✓ CameraController creates
  ✓ Camera follows car position

-- Phase 4: Track --
  ✓ Track creates
  ✓ Track spline is closed loop
  ✓ Track has checkpoints
  ✓ Track lap counting works
  ✓ Track builds into scene

-- Phase 5: Input System --
  ✓ InputManager creates
  ✓ Default input is zeroed

-- Phase 6: Car Roster --
  ✓ Rossini 488 config
  ✓ Weissach GT3 config
  ✓ Kaiju GT-R config
  ✓ Stingray Z06 config
  ✓ CarFactory creates colored mesh
  ✓ Turbo lag times correct

-- Phase 7: Audio System --
  ✓ AudioManager creates without error
  ✓ Per-car engine config exists

-- Phase 8: AI Opponents --
  ✓ AIController creates
  ✓ AI produces input

-- Phase 9: UI --
  ✓ StateMachine creates with MENU state
  ✓ StateMachine transitions
  ✓ StateMachine stores car selection
  ✓ StateMachine stores race results

-- Phase 10: Game Loop --
  ✓ Full integration: car on track
  ✓ Full integration: 4 cars on track

-- Phase 11: Track Definitions --
  ✓ 6 tracks defined
  ✓ All tracks have required fields
  ✓ Track difficulties range from Easy to Expert
  ✓ Track IDs are unique
  ✓ All tracks create valid splines
  ✓ All tracks build into scene

-- Phase 12: Time of Day --
  ✓ 4 time-of-day presets exist
  ✓ Time-of-day presets have valid values

-- Phase 13: Weather System --
  ✓ 4 weather presets exist
  ✓ Clear weather has no modifiers
  ✓ Storm reduces grip below rain
  ✓ Environment modifiers combine correctly

-- Phase 14: Turbo Lag --
  ✓ Turbo cars have positive lag
  ✓ NA cars have zero lag
  ✓ Boost level ramps correctly

-- Phase 15: Camera Views --
  ✓ 4 camera views defined
  ✓ Camera view cycling works
  ✓ Camera FOV varies by view

-- Phase 16: Scoring --
  ✓ Scoring points correct
  ✓ Wall hits tracked

-- Phase 17: Demo Mode --
  ✓ DEMO state exists
  ✓ demoEnabled defaults to true

=== Results ===
57 passed, 0 failed, 57 total
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
