# OCBP Racer — Physics Specification

## 1. Philosophy

**"Arcade-Realistic" = FlatOut / Burnout feel**

- Cars feel weighty and physical
- Grip breaks predictably — you can learn to control slides
- Forgiving: the car fights to stay on the road
- Fun first: if it feels right but isn't physically accurate, keep the feel

## 2. Physics Engine

**Rapier.js (WASM)** for:
- Rigid body dynamics
- Collision detection
- Continuous collision detection (prevents tunneling at high speed)

### 2.1 Physics World Configuration
```
Gravity:              -9.81 m/s² (Y-axis down)
Fixed Timestep:       1/120 Hz (8.33ms)
Solver Iterations:    4 (position), 8 (velocity)
CCD:                  Enabled for car bodies
Sleep Threshold:      Disabled for active cars
```

## 3. Car Physics Model

### 3.1 Coordinate System
- X: Right
- Y: Up
- Z: Forward (car local space)
- All values in meters, meters/second, radians

### 3.2 Car Body
- Represented as a Rapier rigid body
- Shape: Box collider (simplified from mesh)
- Dimensions: Approximated from car bounds
- Center of mass: Low and slightly forward (0.3m height, 0.1m forward of center)

### 3.3 Force Application Model

Each physics tick, the car controller applies:

```
1. ENGINE FORCE (longitudinal)
   - Applied at rear wheels (RWD for all cars)
   - Force = ThrottlePercent × MaxEngineForce
   - Force reduced by: gear ratio, speed

2. BRAKE FORCE (longitudinal)
   - Applied at all four wheels
   - Force = BrakePercent × MaxBrakeForce
   - Separate front/rear bias per car

3. STEERING FORCE (lateral)
   - Applied by rotating front wheel colliders
   - MaxSteerAngle varies by speed (see §3.5)

4. DRAG FORCE (opposes motion)
   - Aerodynamic drag: F_drag = 0.5 × Cd × A × ρ × v²
   - Rolling resistance: F_roll = Crr × m × g

5. DOWNFORCE (presses car to ground)
   - F_down = DownforceCoeff × v²
   - Increases grip at speed
```

### 3.4 Tire Grip Model (Simplified)

The heart of "arcade-realistic":

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
     0°        12°         30°
      ↑          ↑           ↑
   Peak Grip  Breakaway   Full Slide
```

**Slip Angle Calculation:**
```
slipAngle = atan2(lateralVelocity, abs(forwardVelocity))
```

**Grip Response Curve:**
- **0° - 12°:** Grip increases (progressive, predictable)
- **12°:** Peak grip (optimal slip angle)
- **12° - 25°:** Grip decreases gradually (controlled drift)
- **25°+:** Grip drops off (full slide, harder to control)

**Arcade Assist:**
- Auto-corrective steering applied when slip angle > 15°
- Strength varies per car (Inferno SS = less assist, Viper RS = more)

### 3.5 Speed-Dependent Steering

```
MaxSteerAngle = BaseSteerAngle × (1 - Speed/MaxSpeed × 0.6)
```

At high speed, steering is reduced to prevent snap oversteer.

### 3.6 Transmission (Auto Only)

```
Gear Ratios:
  1st: 3.5:1
  2nd: 2.2:1
  3rd: 1.5:1
  4th: 1.1:1
  5th: 0.85:1
  6th: 0.7:1

Shift Points:
  Upshift:   RPM > 7000
  Downshift: RPM < 3000

Shift Time: 150ms (torque interruption)
```

RPM Calculation:
```
RPM = (wheelAngularVelocity × gearRatio × finalDrive) × 9.55
```

## 4. Car Tuning Parameters

Each car is defined by these parameters:

| Parameter | Type | Range | Description |
|-----------|------|-------|-------------|
| `mass` | kg | 1200-1800 | Vehicle mass |
| `maxEngineForce` | N | 5000-9000 | Peak engine output |
| `maxBrakeForce` | N | 8000-15000 | Peak braking force |
| `brakeBias` | 0-1 | 0.5-0.7 | Front brake proportion |
| `maxSteerAngle` | rad | 0.4-0.6 | Max front wheel angle |
| `wheelbase` | m | 2.4-2.8 | Front-to-rear axle |
| `trackWidth` | m | 1.6-1.8 | Left-to-right axle |
| `centerOfMassY` | m | 0.3-0.5 | Height of COM |
| `dragCoeff` | - | 0.3-0.5 | Aerodynamic drag |
| `downforceCoeff` | - | 0.5-2.0 | Speed-dependent downforce |
| `peakGripCoeff` | - | 1.5-2.5 | Tire friction coefficient |
| `slipAnglePeak` | deg | 10-14 | Slip angle at peak grip |
| `slipAngleLimit` | deg | 25-35 | Slip angle at breakaway |
| `autoCorrectStrength` | 0-1 | 0.2-0.6 | Arcade assist strength |
| `maxSpeed` | m/s | 55-75 | Top speed (≈200-270 km/h) |

## 5. Collision Model

### 5.1 Collision Groups
```
GROUP_STATIC:    Track walls, barriers, buildings
GROUP_CAR:       Player and AI car bodies
GROUP_SENSOR:    Checkpoints, finish line
```

### 5.2 Wall Collisions
- Elastic collision with restitution = 0.3
- No damage in MVP
- Cars are pushed away from walls
- Speed loss on impact: 30-50% depending on angle

### 5.3 Car-to-Car Collisions
- Soft-body approximation via restitution = 0.5
- Both cars affected
- Slight push-apart force

## 6. AI Physics

AI cars use the same physics model as the player car:
- Same tire model
- Same engine/brake forces
- Same collision behavior
- Different control inputs (see AI spec)

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
| Car accelerates from 0-100 km/h | Within ±0.5s of spec target |
| Car brakes from 100-0 km/h | Within ±0.5m of spec target |
| Car maintains grip at 10° slip | Grip coefficient > 0.9 × peak |
| Car begins sliding at 20° slip | Grip coefficient < 0.7 × peak |
| Car drifts controllably at 25° slip | Player can maintain drift for 2+ seconds |
| Steering reduces at high speed | Max steer angle < 50% of low-speed max |
| Top speed reached | Within ±5 km/h of spec target |
| Auto-shift at correct RPM | Shifts within ±200 RPM of target |
