# 12 — AI Driver Behavior Specification

## 1. Overview

This specification defines the behavior of AI-controlled opponents in OCBP Racer.
AI drivers follow the racing line, avoid collisions with other cars and barriers,
and recover gracefully from crashes.

## 2. Design Goals

- AI should feel like cautious-to-moderately-skilled human drivers
- AI should not pile into each other at race start
- AI should avoid stationary / crashed cars on track
- AI should recover from wall collisions by steering clear of obstacles
- Behavior scales with the `aggressiveness` parameter (0 = cautious, 1 = bold)

## 3. AI States

Each AI driver operates in one of three behavioral states:

| State | Description |
|-------|-------------|
| **STARTING** | First ~3 seconds after race start. Cautious acceleration, heavy avoidance. |
| **RACING** | Normal race behavior. Follows racing line, avoids cars, takes corners. |
| **RECOVERING** | Post-crash recovery. Steers away from walls/cars, rejoins racing line. |

### 3.1 State Transitions

```
STARTING ──(3s elapsed)──► RACING
RACING   ──(collision detected)──► RECOVERING
RECOVERING ──(clear path + aligned with track)──► RACING
```

## 4. Start Behavior (STARTING)

### 4.1 Cautious Launch
- Throttle ramp-up over 1.5 seconds (0 → full)
- Maximum throttle capped at 70% during first 2 seconds
- Slight random delay per AI (0.2s–0.8s) before beginning acceleration

### 4.2 Close-Range Avoidance
- Raycast / proximity check in a 6m forward cone
- If another car is within the cone, apply additional braking proportional to closeness
- Minimum following distance: 3 car lengths (≈8m)

## 5. Racing Behavior (RACING)

### 5.1 Racing Line Following
- AI tracks a target point on the spline, offset ahead by `lookAheadDistance`
- Steering calculated via cross product of forward vector and direction to target
- Speed modulated based on upcoming corner severity

### 5.2 Car Avoidance
- Proximity scan: check all other car positions each frame
- If a car is within `avoidanceRadius` (5m) and roughly ahead:
  - Steer toward the open side (away from the other car)
  - Reduce throttle by up to 40% based on proximity
- Avoidance weakens with distance and resolves smoothly

### 5.3 Corner Behavior
- Target speed reduced based on corner angle
- `aggressiveness` affects corner entry speed:
  - Low aggressiveness: slow early, wide entry
  - High aggressiveness: carry more speed, tighter line

## 6. Recovery Behavior (RECOVERING)

### 6.1 Crash Detection
AI enters RECOVERING when any of:
- Lateral velocity exceeds 4 m/s (sliding / spinning)
- Forward speed drops below 2 m/s while away from racing line
- Speed ratio vs expected spline speed drops below 0.3

### 6.2 Recovery Maneuvers
1. **Throttle cut**: reduce throttle to 0 for the first 0.5s
2. **Steer away from nearest obstacle**: find closest car or barrier, steer opposite
3. **Realign with track**: once speed is low and obstacles are clear, steer toward
   the nearest point on the racing spline
4. **Gradual throttle**: re-apply throttle only when aligned within 30° of track tangent

### 6.3 Rejoining
- When car is within 4m of the racing line AND facing within 30° of track tangent,
  transition back to RACING
- Brief throttle ramp-up (0.5s) to avoid jerky re-entry

## 7. Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `aggressiveness` | 0.3–0.7 | Per-AI skill/risk factor |
| `avoidanceRadius` | 5.0m | Radius to detect and avoid other cars |
| `startConeAngle` | 45° | Forward detection cone half-angle |
| `startThrottleRamp` | 1.5s | Time to reach full throttle at start |
| `recoveryLateralThreshold` | 4.0 m/s | Lateral speed indicating loss of control |
| `recoverySpeedThreshold` | 2.0 m/s | Forward speed below which recovery triggers |
| `recoveryAlignThreshold` | 30° | Max angle from track tangent to rejoin |
| `recoveryDistanceThreshold` | 4.0m | Max distance from spline to rejoin |

## 8. AI Difficulty Levels

The game supports 4 difficulty levels, selectable on the track selection screen. Each level scales multiple AI behavior parameters:

| Parameter | Beginner | Intermediate | Advanced | Pro |
|-----------|----------|-------------|----------|-----|
| Aggressiveness | 0.3 | 0.5 | 0.7 | 0.9 |
| Corner slow-down | 0.6 | 0.4 | 0.25 | 0.1 |
| Avoidance radius | 7.0m | 5.0m | 3.5m | 2.0m |
| Throttle on straights | 0.7 | 0.85 | 0.95 | 1.0 |
| Steering precision | 0.6 | 0.8 | 0.9 | 1.0 |
| Recovery speed | Slow | Normal | Fast | Instant |
| Max speed fraction | 0.75 | 0.85 | 0.92 | 1.0 |

Difficulty is persisted in `GameSettings.aiDifficulty` and saved to localStorage.

## 9. AI Constructor Changes

`AIController` constructor accepts additional parameters:

```typescript
constructor(
  car: CarController,
  spline: SplinePath,
  difficulty?: AIDifficulty,
  allCars?: CarController[]
)
```

The `allCars` reference gives the AI awareness of other cars for avoidance.
Game.ts passes the full car list when constructing AI controllers.

Difficulty parameter accepts: `'beginner' | 'intermediate' | 'advanced' | 'pro'`.

## 10. Out of Scope

- Rubber-banding / dynamic difficulty within a race
- AI pit stops
- AI personality / team behavior
- Multiplayer AI
