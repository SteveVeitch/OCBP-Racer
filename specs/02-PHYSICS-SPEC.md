# OCBP Racer — Physics Specification

## 1. Philosophy

**"Arcade-Realistic" = FlatOut / Burnout feel**

- Cars feel weighty and physical
- Grip breaks predictably — you can learn to control slides
- Forgiving: the car fights to stay on the road
- Fun first: if it feels right but isn't physically accurate, keep the feel

## 2. Physics Engine

**Rapier.js 0.19.3 (WASM)** for:
- Rigid body dynamics
- Collision detection

### 2.1 Physics World Configuration
```
Gravity:              -9.81 m/s² (Y-axis down)
Fixed Timestep:       1/120 Hz (8.33ms)
Linear Damping:       1.0 (on car bodies)
Angular Damping:      5.0 (on car bodies)
Collider Friction:    0.8 (car), varies (barriers)
```

## 3. Car Physics Model

### 3.1 Coordinate System
- X: Right
- Y: Up
- Z: Forward (car local space)
- All values in meters, meters/second, radians

### 3.2 Car Body
- Represented as a Rapier dynamic rigid body
- Shape: Box collider (1.0 × 0.5 × 2.0)
- Mass set via `setAdditionalMass()` per car config
- Ground enforced: car snapped to y=0.5, vertical velocity zeroed each tick

### 3.3 Force Application Model

Each physics tick, the car controller applies forces as **impulses (N·s per step)**:

```
1. ENGINE FORCE (forward)
   - Applied at car center in forward direction
   - Force = ThrottlePercent × EngineForce × ForceMultiplier
   - ForceMultiplier = max(0, 1 - speedRatio × 0.9)
   - SpeedRatio = currentSpeed / maxSpeed
   - Force diminishes toward zero as car approaches top speed

2. BRAKE / REVERSE FORCE
   - If forwardSpeed > 1.0 m/s: BRAKE
     - Applied opposite to velocity direction
     - Force = BrakePercent × BrakeForce
   - If forwardSpeed ≤ 1.0 m/s: REVERSE
     - Applied opposite to forward direction (pushes car backward)
     - Force = BrakePercent × EngineForce × 0.4
     - Capped at 35% of maxSpeed (reverse speed limit)

3. STEERING
   - Rotates car body around Y-axis
   - Steering angle lerps toward target at rate: dt × 10
   - Turn rate = steerAngle × speedFactor × SteerSpeed
   - SpeedFactor = min(speed / 3, 1) — no turning at standstill
   - Steering direction flips when reversing (forwardSpeed < 0)

4. DRAG FORCE (opposes motion, LINEAR)
   - DragForce = DragCoeff × speed × 0.01
   - Applied opposite to velocity vector

5. DOWNFORCE (presses car to ground)
   - Force = DownforceCoeff × speed² × 0.0001
   - Applied as downward impulse

6. GRIP / SLIP MODEL (lateral stability)
   - Replaces old auto-correct system
   - Lateral force governed by slip angle → grip coefficient curve
   - Active when speed > 0.5 m/s and slip angle > 0°
   - See section 3.4 for full model

7. THROTTLE RAMP-UP
   - Throttle input ramps linearly from 0 → 1 at THROTTLE_RAMP_UP (2.5 /sec)
   - Throttle decays from 1 → 0 at THROTTLE_RAMP_DOWN (4.0 /sec) when released
   - Prevents instant full-power snap, gives 0-1 in ~0.4s
```

### 3.4 Tire Grip Model

Grip is modeled through the interaction of:
- **Slip angle** — difference between car heading and velocity direction
- **Peak grip coefficient** — determines maximum lateral force
- **Slip angle peak** — slip angle at which grip is maximum
- **Slip angle limit** — slip angle beyond which car loses control
- **Grip force factor** — global scaling (GRIP_FORCE_FACTOR = 0.15)

```
                   Grip
                    ↑
        ┌───────────┤
        │           │
   ╭────╯           ╰────╮
  ╱                       ╲
 ╱                         ╲
╱                           ╲
──────┼──────────┼───────────→ Slip Angle
     0°        Peak        Limit
```

**Slip Angle Calculation:**
```
slipAngle = atan2(|lateralVelocity|, |forwardSpeed|) × (180 / π)
```

**Grip Response Curve (per car config):**
- **0° to slipAnglePeak:** Grip increases linearly from 0 to peakGrip
- **slipAnglePeak to slipAngleLimit:** Grip decreases linearly from peakGrip to 0
- **Beyond slipAngleLimit:** Grip = 0 (full slide)

**Lateral Force Application:**
```
if (slipAngle < slipAnglePeak):
    gripCoeff = peakGrip × (slipAngle / slipAnglePeak)
else if (slipAngle < slipAngleLimit):
    gripCoeff = peakGrip × (1 - (slipAngle - slipAnglePeak) / (slipAngleLimit - slipAnglePeak))
else:
    gripCoeff = 0

lateralForce = sign × gripCoeff × speed × GRIP_FORCE_FACTOR
```

The lateral force is applied as an impulse in the car's right direction to counteract sliding. When grip is high, the car resists sliding. When grip drops, the car slides freely.

**Key constants:**
```
GRIP_FORCE_FACTOR = 0.15
THROTTLE_RAMP_UP  = 2.5 /sec
THROTTLE_RAMP_DOWN = 4.0 /sec
WHEEL_RADIUS      = 0.32 m
ROLL_FACTOR       = 0.03
MAX_ROLL_ANGLE    = 5°
```

### 3.5 Speed-Dependent Steering

```
TurnRate = SteerAngle × SpeedFactor × SteerSpeed
SpeedFactor = min(speed / 3, 1)
```

At low speed (< 3 m/s), steering is reduced to prevent snap at standstill.

### 3.6 Reverse Gear

When brake input is held and forward speed is ≤ 1.0 m/s:
- Car applies reverse force at 40% of engine force
- Reverse speed capped at 35% of max speed
- Steering direction flips so controls remain intuitive (A=left, D=right)

### 3.7 NaN Guard

If car position contains NaN values:
- Position reset to (0, 0.5, 0)
- Velocity and angular velocity zeroed
- Prevents physics explosions from corrupting state

## 4. Car Tuning Parameters

### 4.1 Actual CarConfig Interface

```typescript
interface CarConfig {
  mass: number          // kg (1250-1550)
  engineForce: number   // impulse N·s per step (750-950)
  brakeForce: number    // impulse N·s per step (1900-2400)
  steerSpeed: number    // rad/s turn rate multiplier (1.8-2.5)
  maxSteerAngle: number // radians (0.42-0.48)
  maxSpeed: number      // km/h (235-265)
  dragCoeff: number     // linear drag coefficient (1.3-1.6)
  peakGrip: number      // grip coefficient (1.6-2.4)
  downforce: number     // downforce coefficient (0.8-1.8)
  slipAnglePeak: number // degrees (6-12)
  slipAngleLimit: number // degrees (20-35)
  autoCorrect: number   // DEPRECATED — not used by grip/slip model
  turboLagTime: number  // seconds (0 for NA cars)
}
```

> **Note:** `autoCorrect` remains in the interface for backward compatibility but is no longer applied by the physics engine. The grip/slip model (section 3.4) replaces all lateral auto-correction.

### 4.2 Actual Car Parameters

| Parameter | Rossini 488 | Weissach GT3 | Kaiju GT-R | Stingray Z06 |
|-----------|------------|-------------|------------|-------------|
| **Mass (kg)** | 1550 | 1400 | 1500 | 1250 |
| **Engine Force (impulse)** | 800 | 850 | 950 | 750 |
| **Brake Force (impulse)** | 2000 | 2200 | 1900 | 2400 |
| **Steer Speed** | 1.8 | 2.2 | 2.0 | 2.5 |
| **Max Steer (rad)** | 0.45 | 0.42 | 0.48 | 0.44 |
| **Max Speed (km/h)** | 235 | 245 | 250 | 265 |
| **Drag Coeff** | 1.5 | 1.4 | 1.6 | 1.3 |
| **Peak Grip** | 1.9 | 2.4 | 1.6 | 2.1 |
| **Downforce** | 1.2 | 1.8 | 0.8 | 1.5 |
| **Slip Angle Peak (°)** | 8 | 6 | 12 | 7 |
| **Slip Angle Limit (°)** | 25 | 20 | 35 | 22 |
| **Auto-Correct** | 0.4 | 0.6 | 0.2 | 0.5 |
| **Turbo Lag (s)** | 0.15 | 0.00 | 0.25 | 0.00 |

### 4.3 RPM Calculation

```
RPM = 800 + min(1, speedRatio) × 6700
Where: speedRatio = currentSpeed (m/s) / (maxSpeed / 3.6)
```

RPM ranges from 800 (idle) to 7500 (max).

## 5. Collision Model

### 5.1 Collision Groups
```
GROUP_STATIC:    Track barriers (fixed rigid bodies)
GROUP_CAR:       Player and AI car bodies (dynamic)
```

### 5.2 Barrier Collisions
- Box colliders along track edges
- Friction: varies by material
- Cars are pushed away from walls
- Restitution: default Rapier values

### 5.3 Car-to-Car Collisions
- Default Rapier collision response
- Both cars affected by contact forces

### 5.4 Ground Collision
- Fixed ground plane at y = -0.1
- Car body size: cuboid(1, 0.5, 2)
- Ground enforcement: car snapped to y = 0.5 each tick

## 6. AI Physics

AI cars use the same physics model as the player car:
- Same CarController with same forces
- Same collision behavior
- Different control inputs (see AI spec)
- AI controllers track lap progress via spline parameter t

## 7. Debug Visualization

### 7.1 Debug Mode (Development Only)
- Draw tire contact points
- Draw velocity vectors
- Draw slip angle indicators (color-coded)
- Draw force application points
- Graph: throttle vs speed vs RPM
- Graph: slip angle vs grip coefficient

### 7.2 Runtime Tuning
All car parameters adjustable via debug UI sliders:
- Changes apply in real-time
- Save/load parameter sets as JSON
- Compare two parameter sets side-by-side

## 8. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| Car accelerates from 0 | Speed increases on throttle |
| Car brakes effectively | Speed decreases on brake |
| Car steers correctly | A=left, D=right (forward and reverse) |
| Reverse works | Car moves backward when brake held at low speed |
| Top speed reached | Speed plateaus near maxSpeed config value |
| Steering reduces at high speed | Turn rate decreases with speed |
| NaN guard works | Car resets on NaN position |
| Downforce increases grip | Less sliding at high speed |
| Auto-correct stabilizes | Lateral velocity reduced when not steering |
| Throttle ramp-up | ~0.4s from 0 to full throttle |
| Grip/slip model | Car slides controllably at high slip angles |
