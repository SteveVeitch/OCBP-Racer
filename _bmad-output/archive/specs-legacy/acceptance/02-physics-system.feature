Feature: Physics System
  The game simulates arcade-realistic car physics including acceleration, braking,
  steering, grip, slip angles, turbo boost, and environmental modifiers.

  # ── Core Physics ──

  Scenario: Rapier WASM physics world initializes
    Given a PhysicsWorld is created
    When initialized
    Then the world exists and is ready

  Scenario: Car body and collider are created
    Given a PhysicsWorld and a car
    When the car is created via CarFactory
    Then the car has a position, initial speed of 0, and a mesh in the scene

  Scenario: Car accelerates on throttle
    Given a car on a track
    When full throttle is applied for 60 frames
    Then the car's speed is greater than 0

  Scenario: Car decelerates when braking
    Given a car moving at speed
    When brakes are applied for 120 frames
    Then the car's speed decreases

  Scenario: Car steers when steer input is applied
    Given a car on a track
    When steer input of 1.0 is applied for 120 frames
    Then the car's yaw angle changes by more than 0.01 radians

  # ── Handling ──

  Scenario: CarController has slip angle calculation
    Given a CarController exists
    Then it has a calculateSlipAngle method

  Scenario: CarController has grip coefficient calculation
    Given a CarController exists
    Then it has a calculateGripCoefficient method

  Scenario: Brake force produces realistic deceleration
    Given a car with brakeForce configured
    When braking from speed
    Then deceleration is approximately 1g (not 15g)

  Scenario: Speed-dependent braking scales force
    Given a car at low speed
    When braking is applied
    Then the brake force is reduced to approximately 30% of maximum
    And at high speed the brake force is at full strength

  Scenario: Braking induces understeer
    Given a car is braking and steering simultaneously
    Then lateral grip is reduced by up to 40%

  Scenario: currentBrakeInput resets on physics reset
    Given a CarController with active brake input
    When resetPhysics is called
    Then currentBrakeInput is 0

  # ── Turbo ──

  Scenario: Turbo boost ramps up for turbo cars
    Given a turbo car (Rossini 488 or Kaiju GT-R)
    When throttle is held for 60 frames
    Then turboBoost is greater than 0 and less than or equal to 1
    And naBoost equals 1

  Scenario: NA cars have no turbo boost ramp
    Given a naturally aspirated car (Weissach GT3 or Stingray Z06)
    When throttle is held for 60 frames
    Then turboBoost is 0 and naBoost is 1

  # ── Environment Modifiers ──

  Scenario: Environment modifiers combine correctly
    Given grip, drag, braking, and steer multipliers
    When combineModifiers is called
    Then the result contains gripMultiplier, dragMultiplier, brakingMultiplier, steerMultiplier

  Scenario: Neutral modifiers pass through unchanged
    Given all multipliers are 1.0
    When combineModifiers is called
    Then all output multipliers are 1.0

  Scenario: Weather affects car physics in simulation
    Given a dry car and a wet car on the same track
    When both run for 180 frames
    Then the wet car's speed is less than the dry car's speed

  # ── Wall Hits ──

  Scenario: Wall hits are tracked during simulation
    Given a car weaving on a track
    When driven for 600 frames
    Then wallHits is a number greater than or equal to 0
