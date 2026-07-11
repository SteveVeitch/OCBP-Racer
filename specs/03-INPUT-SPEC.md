# OCBP Racer — Input Specification

## 1. Input Architecture

### 1.1 Abstraction Layer

```
Physical Devices → InputManager → Unified InputState → Game Systems
     ↓                                    ↓
  Keyboard        InputManager.getState()  Throttle: 0.0 - 1.0
  Gamepad                                   Brake: 0.0 - 1.0
                                      Steering: -1.0 - 1.0
```

### 1.2 Polling Rate
- Input polled every frame
- Gamepad polled via `navigator.getGamepads()`
- No event-based input (prevents timing issues)

## 2. Action Definitions

| Action | Type | Range | Description |
|--------|------|-------|-------------|
| `throttle` | Axis | 0.0 → 1.0 | Acceleration |
| `brake` | Axis | 0.0 → 1.0 | Braking / reverse |
| `steer` | Axis | -1.0 → 1.0 | Right (-1) to Left (+1) |
| `pause` | Button | true/false | Pause menu toggle |
| `camera` | Button | true/false | Cycle camera view (chase → windscreen → hood → bumper) |
| `confirm` | Button | true/false | Menu selection |
| `back` | Button | true/false | Menu back / cancel |

## 3. Rebindable Key System

### 3.1 Rebindable Actions
All gameplay actions can be remapped by the player:

| Action | Category | Default Keyboard | Default Gamepad |
|--------|----------|------------------|-----------------|
| `throttle` | Driving | W / ArrowUp | RT (Axis 7) |
| `brake` | Driving | S / ArrowDown | LT (Axis 6) |
| `steerLeft` | Driving | A / ArrowLeft | Left Stick Left (Axis 0 > 0) |
| `steerRight` | Driving | D / ArrowRight | Left Stick Right (Axis 0 < 0) |
| `pause` | UI | Escape | Start (Button 9) |
| `camera` | View | C | Y (Button 3) |
| `confirm` | UI | Enter / Space | A (Button 0) |
| `back` | UI | Escape / Backspace | B (Button 1) |

### 3.2 Binding Storage
```typescript
interface KeyBindings {
  throttle: string       // e.g. 'KeyW', 'ArrowUp'
  brake: string          // e.g. 'KeyS', 'ArrowDown'
  steerLeft: string      // e.g. 'KeyA', 'ArrowLeft'
  steerRight: string     // e.g. 'KeyD', 'ArrowRight'
  pause: string          // e.g. 'Escape'
  camera: string         // e.g. 'KeyC'
  confirm: string        // e.g. 'Enter'
  back: string           // e.g. 'Escape'
}

interface GamepadBindings {
  throttle: { type: 'axis', index: number, direction: 1 | -1 }
  brake: { type: 'axis', index: number, direction: 1 | -1 }
  steerLeft: { type: 'axis', index: number, direction: 1 | -1 }
  steerRight: { type: 'axis', index: number, direction: 1 | -1 }
  pause: { type: 'button', index: number }
  camera: { type: 'button', index: number }
  confirm: { type: 'button', index: number }
  back: { type: 'button', index: number }
}
```

### 3.3 Binding Persistence
- Key bindings stored in `settings.keyBindings` (keyboard)
- Gamepad bindings stored in `settings.gamepadBindings`
- Saved to localStorage key `ocbp-settings`
- Reset to defaults button in settings

### 3.4 Conflict Detection
- When rebinding, check for conflicts with other actions
- If conflict detected: swap bindings (old action gets the displaced key)
- Prevent duplicate bindings for same device

### 3.5 Binding UI
Located in Settings menu under "Controls" section:
- List of all rebindable actions
- Current binding shown next to each action
- Click action → press new key → binding updated
- "Reset to Defaults" button

## 4. Keyboard Mapping

### 4.1 Primary Layout (Default)
```
Action        Key(s)
─────────────────────
Throttle      W / ArrowUp
Brake         S / ArrowDown
Steer Left    A / ArrowLeft     (+1)
Steer Right   D / ArrowRight    (-1)
Pause         Escape
Camera        C
Confirm       Enter / Space
Back          Escape / Backspace
```

### 4.2 Steering Direction
- A/ArrowLeft = +1 (left)
- D/ArrowRight = -1 (right)
- This matches the convention where positive steer = left

### 4.3 No Smoothing
- Throttle and brake: digital (0 or 1)
- Steering: digital (-1, 0, or +1)
- No input smoothing applied (responsive, instant feel)

## 5. Gamepad Mapping

### 5.1 Xbox Layout (Default)
```
Action        Button/Axis
──────────────────────────
Throttle      RT (Right Trigger, Axis 7)
Brake         LT (Left Trigger, Axis 6)
Steer Left    Left Stick Left (Axis 0 > 0, negated)
Steer Right   Left Stick Right (Axis 0 < 0, negated)
Pause         Start (Button 9)
Camera        Y (Button 3)
Confirm       A (Button 0)
Back          B (Button 1)
```

### 5.2 PlayStation Layout (Auto-detected)
```
Action        Button/Axis
──────────────────────────
Throttle      R2 (Axis 7)
Brake         L2 (Axis 6)
Steer Left    Left Stick Left (Axis 0 > 0, negated)
Steer Right   Left Stick Right (Axis 0 < 0, negated)
Pause         Options (Button 9)
Camera        Triangle (Button 3)
Confirm       X (Button 0)
Back          O (Button 1)
```

### 5.3 Gamepad Features
- **Dead Zone:** 0.15 (both sticks and triggers)
- **Steer Exponent:** 1.4 (sensitivity curve)
- **Vibration:** Not used in MVP (reserved for post-MVP)
- **Hot-plug:** Detect gamepad connect/disconnect at runtime

### 5.4 Gamepad Steer Direction
- Left stick left (Axis 0 > 0): Negated → negative steer → left
- Left stick right (Axis 0 < 0): Negated → positive steer → right
- Negation applied in `getGamepadState()`

## 6. Input Processing

### 6.1 Dead Zone (Gamepad Only)
```
if (abs(rawInput) < deadZone)
    output = 0
else
    output = (rawInput - sign(rawInput) × deadZone) / (1 - deadZone)
```

This ensures zero drift while maintaining full range.

### 6.2 Response Curves

#### Throttle/Brake (Keyboard)
- Digital: 0 or 1 (no analog)
- Direct mapping for instant response

#### Throttle/Brake (Gamepad)
- Analog with dead zone applied
- Linear response (no curve)

#### Steering (Keyboard)
- Digital: -1, 0, or +1
- No smoothing, instant response

#### Steering (Gamepad)
- Dead zone applied first
- Sensitivity curve: `output = sign(input) × pow(abs(input), 1.4)`
- Exponent 1.4 makes small inputs less twitchy

### 6.3 No Input Smoothing
- Throttle/Brake: no smoothing (direct response)
- Steering: no smoothing (instant response)
- This provides a responsive, arcade feel

## 7. Game State Input Behavior

| Game State | Input Enabled |
|------------|---------------|
| MENU | Confirm, Back |
| CAR_SELECT | Steer (browse), Confirm, Back |
| TRACK_SELECT | Confirm, Back |
| COUNTDOWN | None (locked) |
| RACING | All driving inputs, camera, pause |
| PAUSED | Confirm (resume), Back (quit) |
| RESULTS | Confirm (replay), Back (menu) |

## 8. Pause Behavior

### 8.1 Pause State Machine Fix
- **Pause:** Use `state.transition('PAUSED')` consistently
- **Unpause:** Use `state.transition(state.previous)` to return to previous state
- Input buffer cleared on unpause (prevents stale inputs)
- Escape key or Start button to pause/unpause
- Pause during countdown: countdown pauses, game state transitions to PAUSED
- Pause during race: physics freeze, HUD freezes

### 8.2 Auto-Pause
- Game auto-pauses on tab hide (visibilitychange event)
- Prevents physics running while tab is backgrounded

## 9. Reverse Gear

When brake input is held and car is nearly stationary (forwardSpeed ≤ 1.0 m/s):
- Car applies reverse force at 40% of engine force
- Reverse speed capped at 35% of max speed
- Steering direction flips so controls remain intuitive (A=left, D=right)

## 10. Camera Switch

### 10.1 Camera Views
Pressing the camera button cycles through views in order:
```
Chase → Windscreen → Hood → Bumper → Chase (cycle)
```

### 10.2 Camera Bindings
- **Keyboard:** C key (default, rebindable)
- **Gamepad:** Y button (default, rebindable)
- Single press = next view
- No cooldown between switches

### 10.3 Camera View Definitions
See `04-RENDERING-SPEC.md` Section 4 for camera positions and parameters.

## 11. Window Blur Handling

- All keys cleared on window blur event (`blur`)
- Prevents stuck keys when user tabs away during gameplay
- Gamepad state also cleared on blur

## 12. Accessibility Considerations

### 12.1 Remappable Keys
- All driving actions remappable via settings UI
- Per-device profiles (keyboard + gamepad separate)
- Reset to defaults button

### 12.2 Assist Options (Post-MVP)
- Auto-accelerate toggle
- Steering assist strength
- Braking assist strength

## 13. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| Keyboard input responds | All actions trigger within 1 frame |
| Gamepad input responds | All axes/buttons polled correctly |
| Dead zone works | Input < 0.15 reads as 0 |
| Dead zone full range | Input at 1.0 reaches 1.0 |
| Gamepad hot-plug | Device detected within 1 second |
| Pause blocks input | Driving inputs ignored during pause |
| Device detection | Correct prompts shown for active device |
| Reverse controls | A=left, D=right when reversing |
| Key rebinding works | Can remap all gameplay actions |
| Binding conflicts swap | Conflicting bindings are swapped, not duplicated |
| Bindings persist | Saved to localStorage, restored on reload |
| Camera switch works | C/Y cycles through 4 camera views |
| Pause state correct | Consistent transition to/from PAUSED |
| Auto-pause on blur | Game pauses when tab hidden |
| Keys cleared on blur | No stuck keys after window blur |
