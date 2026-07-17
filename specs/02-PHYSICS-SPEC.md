# OCBP Racer — Physics Specification

## 1. Philosophy

**"Arcade-Sim Hybrid" — FlatOut meets Gran Turismo Lite**

- Cars feel weighty with visible weight transfer
- Grip breaks predictably — rear steps out under power (controllable oversteer)
- Forgiving but rewarding: skillful driving is noticeably faster
- Speed-dependent steering: tight at low speed, relaxed at high speed
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
Angular Damping:      2.0 (on car bodies — allows natural yaw)
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
- Mass set via `setAdditionalMass()` per car config — affects all impulse-based forces
- Ground enforced: car snapped to y=0.5, vertical velocity zeroed each tick

### 3.3 Force Application Model

Each physics tick, the car controller applies forces as **impulses (N·s per step)**:

```
1. ENGINE FORCE (forward)
   - Applied at car center
   - Direction: blends between forward vector and velocity direction based on slip
     (enables power oversteer — rear steps out under throttle in a corner)
   - Force = ThrottlePercent × EngineForce × ForceMultiplier × TurboBoost
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
   - Rotates car body around Y-axis (direct rotation, not torque)
   - Speed-dependent: steering authority reduces at high speed
     - HighSpeedFactor = 1 / (1 + speed × 0.03)
   - Turn rate = steerAngle × speedFactor × highSpeedFactor × SteerSpeed
   - speedFactor = min(speed / 3, 1) — reduced steering at standstill
   - Angular velocity is NOT zeroed — car can sustain yaw through corners
   - Steering direction flips when reversing (forwardSpeed < 0)

4. DRAG FORCE (opposes motion, LINEAR)
   - DragForce = DragCoeff × speed × 0.01
   - Applied opposite to velocity vector

5. DOWNFORCE (presses car to ground)
   - Force = DownforceCoeff × speed² × 0.0001
   - Applied as downward impulse

6. GRIP / SLIP MODEL (lateral stability)
   - Mass-proportional: heavier cars have more grip
   - Speed-attenuated: grip reduces at high speed (car can slide more)
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
- **Mass-proportional grip** — force scales with car mass (heavier = more grip)
- **Speed attenuation** — grip reduces at high speed to allow slides

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

speedGripScale = 1 / (1 + speed × 0.02)  // reduces grip at high speed
lateralForce = sign × gripCoeff × mass × 0.001 × speedGripScale × gripMultiplier
```

At high speed, grip is reduced, allowing the car to slide more in corners.
At low speed, full grip applies proportional to car mass.

**Key constants:**
```
GRIP_FORCE_FACTOR  = 0.001 (mass-proportional)
GRIP_SPEED_SCALE   = 0.02  (speed attenuation)
HIGH_SPEED_FACTOR  = 0.03  (steering reduction)
THROTTLE_RAMP_UP   = 2.5 /sec
THROTTLE_RAMP_DOWN = 4.0 /sec
WHEEL_RADIUS       = 0.32 m
ROLL_FACTOR        = 0.03
MAX_ROLL_ANGLE     = 5°
```

### 3.5 Speed-Dependent Steering

```
SpeedFactor    = min(speed / 3, 1)        // low-speed reduction
HighSpeedFactor = 1 / (1 + speed × 0.03)  // high-speed reduction
TurnRate = SteerAngle × SpeedFactor × HighSpeedFactor × SteerSpeed
```

At low speed (< 3 m/s), steering is reduced to prevent snap at standstill.
At high speed, steering authority is reduced — corrections are more subtle.

### 3.6 Power Oversteer (Throttle Blending)

When the car is sliding, throttle force direction blends between the car's forward
vector and the velocity direction. This allows the rear to step out under power:
```
slipBlendFactor = min(slipAngle / 15, 1) × 0.3  // max 30% blend at extreme slip
throttleDir = lerp(forward, velocityDir, slipBlendFactor)
```
At zero slip, throttle pushes straight forward (normal behavior).
At high slip, throttle partially follows the velocity vector, allowing power slides.

### 3.7 Reverse Gear

When brake input is held and forward speed is ≤ 1.0 m/s:
- Car applies reverse force at 40% of engine force
- Reverse speed capped at 35% of max speed
- Steering direction flips so controls remain intuitive (A=left, D=right)

### 3.8 NaN Guard

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
  turboLagTime: number  // seconds (0 for NA cars)
}
```

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
  turboLagTime: number  // seconds (0 for NA cars)
}
```

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
| Speed-dependent steering | Steering authority reduces at high speed |
| NaN guard works | Car resets on NaN position |
| Throttle ramp-up | ~0.4s from 0 to full throttle |
| Grip/slip model | Car slides controllably at high slip angles |
| Oversteer on power | Rear steps out when throttle applied in a corner |
| Mass matters | Heavier cars have more grip, lighter cars more agile |
| High-speed looseness | Car is easier to slide at high speed |
| Angular momentum | Car retains yaw through corners (not instantly killed) |
