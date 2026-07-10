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
| `confirm` | Button | true/false | Menu selection |
| `back` | Button | true/false | Menu back / cancel |

## 3. Keyboard Mapping

### 3.1 Primary Layout (Default)
```
Action        Key(s)
─────────────────────
Throttle      W / ArrowUp
Brake         S / ArrowDown
Steer Left    A / ArrowLeft     (+1)
Steer Right   D / ArrowRight    (-1)
Pause         Escape
Confirm       Enter / Space
Back          Escape / Backspace
```

### 3.2 Steering Direction
- A/ArrowLeft = +1 (left)
- D/ArrowRight = -1 (right)
- This matches the convention where positive steer = left

### 3.3 No Smoothing
- Throttle and brake: digital (0 or 1)
- Steering: digital (-1, 0, or +1)
- No input smoothing applied (responsive, instant feel)

## 4. Gamepad Mapping

### 4.1 Xbox Layout (Default)
```
Action        Button/Axis
─────────────────────────
Throttle      RT (Right Trigger, Axis 7)
Brake         LT (Left Trigger, Axis 6)
Steer Left    Left Stick Left (Axis 0 > 0, negated)
Steer Right   Left Stick Right (Axis 0 < 0, negated)
Pause         Start (Button 9)
Confirm       A (Button 0)
Back          B (Button 1)
```

### 4.2 PlayStation Layout (Auto-detected)
```
Action        Button/Axis
─────────────────────────
Throttle      R2 (Axis 7)
Brake         L2 (Axis 6)
Steer Left    Left Stick Left (Axis 0 > 0, negated)
Steer Right   Left Stick Right (Axis 0 < 0, negated)
Pause         Options (Button 9)
Confirm       X (Button 0)
Back          O (Button 1)
```

### 4.3 Gamepad Features
- **Dead Zone:** 0.15 (both sticks and triggers)
- **Steer Exponent:** 1.4 (sensitivity curve)
- **Vibration:** Not used in MVP (reserved for post-MVP)
- **Hot-plug:** Detect gamepad connect/disconnect at runtime

### 4.4 Gamepad Steer Direction
- Left stick left (Axis 0 > 0): Negated → negative steer → left
- Left stick right (Axis 0 < 0): Negated → positive steer → right
- Negation applied in `getGamepadState()`

## 5. Input Processing

### 5.1 Dead Zone (Gamepad Only)
```
if (abs(rawInput) < deadZone)
    output = 0
else
    output = (rawInput - sign(rawInput) × deadZone) / (1 - deadZone)
```

This ensures zero drift while maintaining full range.

### 5.2 Response Curves

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

### 5.3 No Input Smoothing
- Throttle/Brake: no smoothing (direct response)
- Steering: no smoothing (instant response)
- This provides a responsive, arcade feel

## 6. Game State Input Behavior

| Game State | Input Enabled |
|------------|---------------|
| MENU | Confirm, Back |
| CAR_SELECT | Steer (browse), Confirm, Back |
| TRACK_SELECT | Confirm, Back |
| COUNTDOWN | None (locked) |
| RACING | All driving inputs |
| PAUSED | Confirm (resume), Back (quit) |
| RESULTS | Confirm (replay), Back (menu) |

## 7. Pause Behavior

- Pause freezes physics and game state
- Input buffer cleared on unpause (prevents stale inputs)
- Escape key or Start button to pause/unpause

## 8. Reverse Gear

When brake input is held and car is nearly stationary (forwardSpeed ≤ 1.0 m/s):
- Car applies reverse force at 40% of engine force
- Reverse speed capped at 35% of max speed
- Steering direction flips so controls remain intuitive (A=left, D=right)

## 9. Accessibility Considerations

### 9.1 Remappable Keys (Post-MVP)
- All driving actions remappable
- Save per-device profiles

### 9.2 Assist Options (Post-MVP)
- Auto-accelerate toggle
- Steering assist strength
- Braking assist strength

## 10. Acceptance Criteria

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
