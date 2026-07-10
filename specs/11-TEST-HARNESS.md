# OCBP Racer — Test Harness Specification

## 1. Overview

The test harness is an automated in-browser test suite that validates all game systems. It runs 35 tests across 10 phases, covering project setup through full integration.

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
35 passed, 0 failed, 35 total
```

### 3.4 Visual Overlay
- Dark background (#0a0a1a)
- Green text for passing tests (#00ff88)
- Red text for failing tests (#ff4444)
- Summary header with pass/fail count
- If all pass: "All tests passed! Click anywhere to start the game."

## 4. Test Inventory

### Phase 0: Project Setup (3 tests)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 1 | Three.js imports | Sync | Verifies THREE.Scene, PerspectiveCamera, WebGLRenderer exist |
| 2 | Car configs defined | Sync | Checks 4 cars exist with valid ids, names, engineForce, maxSpeed |
| 3 | getCarById works | Sync | Looks up 'phantom-gt' and verifies name |

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
| 22 | Phantom GT config | Sync | Checks mass=1550, color=0xcccccc |
| 23 | Viper RS config | Sync | Checks peakGrip=2.4 |
| 24 | Inferno SS config | Sync | Checks engineForce=950 |
| 25 | AeroVen TT config | Sync | Checks maxSpeed=265 |
| 26 | CarFactory creates colored mesh | Async | Creates car, checks mesh has ≥5 children (body+cabin+4wheels) |

### Phase 7: Audio System (1 test)

| # | Test Name | Type | Description |
|---|-----------|------|-------------|
| 27 | AudioManager creates without error | Sync | Creates AudioManager, checks not null |

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

**Total: 35 tests**

## 5. Test Dependencies

### 5.1 Required Systems
| System | Tests Using It |
|--------|---------------|
| Three.js | 1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 26 |
| Rapier.js | 7, 8, 9, 10, 11, 12, 19, 26, 28, 29, 34, 35 |
| CarFactory | 8, 9, 10, 11, 12, 26, 34, 35 |
| CarConfigs | 2, 3, 22, 23, 24, 25 |
| Track | 15, 16, 17, 18, 19, 28, 29, 34, 35 |
| SplinePath | 16, 17, 19 |
| AIController | 28, 29 |
| InputManager | 20, 21 |
| StateMachine | 30, 31, 32, 33 |
| AudioManager | 27 |
| CameraController | 13, 14 |

### 5.2 Async Tests
Tests 7, 8, 9, 10, 11, 12, 19, 26, 28, 29, 34, 35 require async execution because they initialize Rapier.js WASM. Each test creates and disposes its own PhysicsWorld instance.

### 5.3 Test Isolation
- Each async test creates its own PhysicsWorld and disposes it after
- No shared state between tests (except the results array)
- Tests can run in any order

## 6. Running Tests

### 6.1 Development
```bash
npm run dev
# Open http://localhost:3000?test
```

### 6.2 Expected Output (Console)
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
  ✓ Phantom GT config
  ✓ Viper RS config
  ✓ Inferno SS config
  ✓ AeroVen TT config
  ✓ CarFactory creates colored mesh

-- Phase 7: Audio System --
  ✓ AudioManager creates without error

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

=== Results ===
35 passed, 0 failed, 35 total
```

## 7. Failure Handling

### 7.1 Failed Test Display
- Failed tests shown in red with error message
- Console output shows `✗` prefix with error details
- Game cannot be started from overlay if any tests fail

### 7.2 Common Failure Causes
| Failure | Likely Cause |
|---------|-------------|
| Three.js imports | Three.js not installed or import path wrong |
| Rapier WASM initializes | Rapier WASM files not served correctly |
| Car configs defined | CarConfigs.ts values changed |
| Track creates | Track.ts or SplinePath.ts broken |
| AI produces input | AIController.ts broken |
| StateMachine transitions | StateMachine.ts state machine broken |

## 8. Adding New Tests

### 8.1 Location
All tests are in `src/test-harness.ts`.

### 8.2 Adding a Sync Test
```typescript
test('My new test', () => {
  const result = someFunction()
  assert(result === expected, `Expected ${expected}, got ${result}`)
})
```

### 8.3 Adding an Async Test
```typescript
await testAsync('My async test', async () => {
  const pw = new PhysicsWorld()
  await pw.init()
  // ... test logic ...
  pw.dispose()
})
```

### 8.4 Naming Convention
- Use descriptive names (e.g., "Car accelerates on throttle")
- Group by phase with console.log headers
- Keep tests focused (one assertion per test ideal)

## 9. Performance Considerations

- Async tests create/dispose PhysicsWorld instances (Rapier WASM)
- Total test execution: ~2-5 seconds depending on hardware
- No network requests during tests (all local)
- Test overlay is DOM-based (not canvas)
