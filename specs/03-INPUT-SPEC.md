# OCBP Racer — Input Specification

## 1. Input Architecture

### 1.1 Abstraction Layer

```
Physical Devices → Input Manager → Unified Axes → Game Systems
     ↓                                    ↓
  Keyboard        InputManager.getAxis()    Throttle: 0.0 - 1.0
  Gamepad         InputManager.isPressed()  Brake: 0.0 - 1.0
                                     Steering: -1.0 - 1.0
```

### 1.2 Polling Rate
- Input polled every frame (60 Hz minimum)
- Gamepad polled via `navigator.getGamepads()`
- No event-based input (prevents timing issues)

## 2. Action Definitions

| Action | Type | Range | Description |
|--------|------|-------|-------------|
| `throttle` | Axis | 0.0 → 1.0 | Acceleration |
| `brake` | Axis | 0.0 → 1.0 | Braking / reverse |
| `steer` | Axis | -1.0 → 1.0 | Left (-1) to Right (+1) |
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
Steer Left    A / ArrowLeft
Steer Right   D / ArrowRight
Pause         Escape
Confirm       Enter / Space
Back          Escape / Backspace
```

### 3.2 Alt Layout (Optional, configurable post-MVP)
```
Throttle      Up Arrow
Brake         Down Arrow
Steer Left    Left Arrow
Steer Right   Right Arrow
```

## 4. Gamepad Mapping

### 4.1 Xbox Layout (Default)
```
Action        Button
─────────────────────
Throttle      RT (Right Trigger, Axis 7)
Brake         LT (Left Trigger, Axis 6)
Steer Left    Left Stick Left (Axis 0 < 0)
Steer Right   Left Stick Right (Axis 0 > 0)
Pause         Start (Button 9)
Confirm       A (Button 0)
Back          B (Button 1)
```

### 4.2 PlayStation Layout (Auto-detected)
```
Action        Button
─────────────────────
Throttle      R2 (Axis 7)
Brake         L2 (Axis 6)
Steer Left    Left Stick Left (Axis 0 < 0)
Steer Right   Left Stick Right (Axis 0 > 0)
Pause         Options (Button 9)
Confirm       X (Button 0)
Back          O (Button 1)
```

### 4.3 Gamepad Features
- **Dead Zone:** 0.15 (both sticks and triggers)
- **Vibration:** Not used in MVP (reserved for post-MVP)
- **Hot-plug:** Detect gamepad connect/disconnect at runtime

## 5. Input Processing

### 5.1 Dead Zone
```
if (abs(rawInput) < deadZone)
    output = 0
else
    output = (rawInput - sign(rawInput) × deadZone) / (1 - deadZone)
```

This ensures zero drift while maintaining full range.

### 5.2 Response Curves

#### Throttle (Linear)
```
output = input
```
Direct mapping — press more, go faster.

#### Brake (Linear)
```
output = input
```
Direct mapping — press more, brake harder.

#### Steering (Sensitivity Curve)
```
output = sign(input) × pow(abs(input), steerExponent)
```
`steerExponent = 1.4` (default)

This makes small steering inputs less twitchy at high speed while keeping full lock available.

### 5.3 Input Smoothing

#### Steering
- Low-pass filter applied to raw steering input
- Smoothing factor: `0.15` (lower = smoother, higher = more responsive)
- Prevents instant full-lock snaps

#### Throttle/Brake
- No smoothing — direct response for feel

## 6. Game State Input Behavior

| Game State | Input Enabled |
|------------|---------------|
| MENU | Confirm, Back, Navigate |
| CAR_SELECT | Steer (browse), Confirm, Back |
| TRACK_SELECT | Steer (browse), Confirm, Back |
| COUNTDOWN | None (locked) |
| RACING | All driving inputs |
| PAUSED | Confirm (resume), Back (quit) |
| RESULTS | Confirm (continue), Back (replay) |

## 7. Input Display

### 7.1 Visual Feedback
- Show current input device icon (keyboard / Xbox / PlayStation)
- Show throttle/brake as vertical bars
- Show steering as horizontal bar
- Optional: show raw input vs processed input (debug mode)

### 7.2 Device Switching
- If gamepad connected → show gamepad prompts
- If keyboard used → show keyboard prompts
- Auto-detect and switch prompts in real-time

## 8. Pause Behavior

- Pause freezes physics and game state
- Input buffer cleared on unpause (prevents stale inputs)
- Gamepad rumble stopped on pause

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
| Steering smoothing | No instant full-lock from neutral |
| Gamepad hot-plug | Device detected within 1 second |
| Pause blocks input | Driving inputs ignored during pause |
| Device detection | Correct prompts shown for active device |
