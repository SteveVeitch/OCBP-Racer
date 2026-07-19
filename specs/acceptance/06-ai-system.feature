Feature: AI System
  The game provides AI opponents with 4 difficulty profiles, racing line tracking,
  lap counting, and off-track recovery.

  # ── Difficulty Profiles ──

  Scenario: Exactly 4 difficulty profiles exist
    Given the AI difficulty profiles are loaded
    Then there are exactly 4 profiles

  Scenario: Profiles are named beginner, intermediate, advanced, pro
    Given the AI difficulty profiles are loaded
    Then all four named profiles exist

  Scenario: Speed multiplier increases with difficulty
    Given the AI difficulty profiles are loaded
    Then each profile's speedMultiplier is greater than the previous

  Scenario: Aggressiveness increases with difficulty
    Given the AI difficulty profiles are loaded
    Then each profile's aggressiveness is greater than the previous

  Scenario: Recovery timeout decreases with difficulty
    Given the AI difficulty profiles are loaded
    Then each profile's recoveryTimeout is less than the previous

  Scenario: Pro profile has maximum speed multiplier
    Given the AI difficulty profiles are loaded
    Then the pro profile has speedMultiplier of 1.0

  Scenario: All profiles have valid ranges
    Given the AI difficulty profiles are loaded
    Then speedMultiplier is in (0, 1]
    And aggressiveness is in [0, 1]
    And brakingAggression is in [0, 1]
    And steerSmoothing is in [0, 1]
    And recoveryTimeout is greater than 0

  # ── Controller ──

  Scenario: AIController creates with a car
    Given an AIController
    When created
    Then it is not null and getCar() returns the correct car

  Scenario: AI produces throttle and steer input
    Given an AIController
    When update is called
    Then throttle and steer are numbers

  Scenario: Aggressiveness affects driving distance
    Given a beginner AI and a pro AI
    When both run for 300 frames
    Then the pro AI covers at least as much distance as the beginner (within 5 units)

  # ── Lap Counting ──

  Scenario: AI lap counter requires halfway progress
    Given an AI car near the start/finish line
    When teleported across the finish 5 times without passing halfway
    Then the lap count remains 0

  # ── Recovery ──

  Scenario: AI recovery teleport resets position to spline
    Given an AI car teleported off-track
    When 320 recovery frames pass
    Then the car's position is within 50 units of the track origin
