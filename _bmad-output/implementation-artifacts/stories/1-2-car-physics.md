---
id: 1-2-car-physics
epic: 1
title: Car Physics
status: done
frs:
  - FR1
  - NFR9
---

# Story 1.2: Car Physics

As a **player**,
I want **my car to accelerate, brake, and steer with arcade-sim hybrid handling**,
So that **I can drive around the track with authentic but accessible physics**.

**Acceptance Criteria:**

**Given** a car is on a flat surface
**When** the player applies throttle
**Then** engine force is applied as impulse (N·s per step)
**And** force = ThrottlePercent × EngineForce × ForceMultiplier × TurboBoost
**And** ForceMultiplier = max(0, 1 - speedRatio × 0.9) (diminishes near top speed)
**And** throttle ramps up linearly from 0→1 at 2.5/sec (0-1 in ~0.4s)
**And** throttle decays from 1→0 at 4.0/sec when released

**Given** the car is moving
**When** the player applies brake
**Then** if forwardSpeed > 1.0 m/s: brake force applies opposite to velocity
**And** brake force scales with speed: full force above 36 km/h, 30% at very low speed
**And** if forwardSpeed ≤ 1.0 m/s: reverse force applies at 40% engine force
**And** reverse speed capped at 35% of maxSpeed

**Given** the car is moving
**When** the player steers left/right
**Then** car rotates around Y-axis (direct rotation, not torque)
**And** steering is speed-dependent: reduced at low speed (< 3 m/s) and high speed
**And** HighSpeedFactor = 1 / (1 + speed × 0.03)
**And** angular velocity is NOT zeroed (car sustains yaw through corners)
**And** steering direction flips when reversing

**Given** the car is sliding
**When** slip angle increases
**Then** grip follows response curve: increases to peakGrip at slipAnglePeak, then decreases to 0 at slipAngleLimit
**And** lateral force = gripCoeff × mass × 0.001 × speedGripScale × gripMultiplier
**And** grip reduces at high speed (speedGripScale = 1 / (1 + speed × 0.02))

**Given** the car applies throttle while sliding
**When** slip angle > 0
**Then** throttle direction blends toward velocity direction
**And** slipBlendFactor = min(slipAngle / 15, 1) × 0.3 (max 30% blend)
**And** enables power oversteer (rear steps out under throttle)

**Given** a turbocharged car (Rossini 488 or Kaiju GT-R)
**When** throttle is applied
**Then** boostLevel = clamp(timeSinceThrottleOn / turboLagTime, 0, 1)
**And** effectiveEngineForce = engineForce × (0.6 + 0.4 × boostLevel)
**And** Rossini lag: 0.15s, Kaiju lag: 0.25s
**And** NA cars (Weissach, Stingray) have instant response (turboLagTime = 0)

**Given** the car's speed is calculated
**When** the physics updates
**Then** RPM = 800 + min(1, speedRatio) × 6700
**And** speedRatio = currentSpeed (m/s) / (maxSpeed / 3.6)

**Given** the car goes airborne or physics explodes
**When** position contains NaN values
**Then** position resets to (0, 0.5, 0)
**And** velocity and angular velocity are zeroed

**Given** the car body is configured
**When** physics initializes
**Then** mass is set per car config (1250-1550 kg)
**And** linear damping = 1.0
**And** angular damping = 2.0 (allows natural yaw)
**And** ground enforced: car snapped to y = 0.5 each tick
