Feature: Car System
  The game provides a roster of 4 exotic sports cars with distinct configurations,
  visual models, engine definitions, and release channel gating.

  # ── Roster ──

  Scenario: Exactly 4 cars are defined
    Given the car roster is loaded
    Then there are exactly 4 cars

  Scenario: All car IDs are unique
    Given the car roster is loaded
    Then no two cars share the same ID

  Scenario: Each car has a valid physics configuration
    Given the car roster is loaded
    Then every car has mass, engineForce, brakeForce, steerSpeed, maxSteerAngle,
      maxSpeed, dragCoeff, peakGrip, downforce, and slipAnglePeak greater than 0
    And every car has slipAngleLimit greater than slipAnglePeak

  Scenario: Each car has a distinct mass
    Given the car roster is loaded
    Then all 4 cars have different mass values

  Scenario: Each car has a distinct peak grip
    Given the car roster is loaded
    Then all 4 cars have different peakGrip values

  Scenario: Each car has a distinct slip angle peak
    Given the car roster is loaded
    Then all 4 cars have different slipAnglePeak values

  # ── Engine Definitions ──

  Scenario: Each car has an engine definition
    Given the car roster is loaded
    Then every car has an engine with type, displacement, and horsepower > 100
    And every car has baseFrequency > 0 and maxFrequency > baseFrequency
    And every car has a primaryWaveform and secondaryWaveform

  Scenario: Turbo cars have turbo lag
    Given the car roster is loaded
    Then Rossini 488 has turboLagTime of 0.15
    And Kaiju GT-R has turboLagTime of 0.25

  Scenario: Naturally aspirated cars have zero turbo lag
    Given the car roster is loaded
    Then Weissach GT3 has turboLagTime of 0.0
    And Stingray Z06 has turboLagTime of 0.0

  # ── Lookup ──

  Scenario: Car lookup by valid ID returns the correct car
    Given the car roster is loaded
    When looking up car "rossini-488"
    Then the result has name "Rossini 488"

  Scenario: Car lookup by unknown ID throws
    Given the car roster is loaded
    When looking up car "unknown-id"
    Then an error is thrown

  Scenario: All cars are retrievable by their own ID
    Given the car roster is loaded
    Then every car in the roster can be retrieved by its own ID

  # ── Visual Model ──

  Scenario: CarFactory creates a colored mesh for each car
    Given the car roster is loaded
    When creating a mesh for any car
    Then the mesh group has at least 5 children (body, cabin, wheels)

  Scenario: CarFactory creates preview meshes for all cars
    Given the car roster is loaded
    When creating a preview mesh for each car
    Then each preview mesh is not null

  Scenario: CarFactory generates thumbnails for all cars
    Given the car roster is loaded
    When generating thumbnails
    Then a Map with 4 entries is returned
    And each entry is a data image URL

  # ── Release Channels ──

  Scenario: All cars have a release channel
    Given the car roster is loaded
    Then every car has a releaseChannel of "green" or "blue"

  Scenario: Rossini 488 is the green release car
    Given the car roster is loaded
    Then Rossini 488 has releaseChannel "green"

  Scenario: All other cars are blue releases
    Given the car roster is loaded
    Then Weissach GT3, Kaiju GT-R, and Stingray Z06 have releaseChannel "blue"

  Scenario: Green channel returns only green cars
    Given the car roster is loaded
    When filtering cars by releaseChannel "green"
    Then only Rossini 488 is returned

  Scenario: Blue channel returns all cars
    Given the car roster is loaded
    When filtering cars by releaseChannel "blue"
    Then all 4 cars are returned

  Scenario: Green channel is a subset of blue
    Given the car roster is loaded
    When filtering cars by releaseChannel "green" and "blue"
    Then every green car is also in the blue set
