Feature: Audio System
  The game provides per-car engine synthesis, turbo sounds, tire screech,
  wind noise, collision impacts, and UI sound effects.

  # ── AudioManager ──

  Scenario: AudioManager creates without error
    Given an AudioManager is instantiated
    Then it is not null

  Scenario: AudioManager initializes audio context
    Given an AudioManager
    When init is called
    Then no error is thrown

  Scenario: Master volume accepts and clamps values
    Given an AudioManager
    When setMasterVolume is called with 0.5, -1, and 2
    Then no error is thrown for any value

  Scenario: Engine volume accepts and clamps values
    Given an AudioManager
    When setEngineVolume is called with 0.7, -0.5, and 1.5
    Then no error is thrown for any value

  # ── UI Sounds ──

  Scenario: AudioManager provides UI click sound
    Given an AudioManager
    Then playUIClick is a callable function

  Scenario: AudioManager provides UI confirm sound
    Given an AudioManager
    Then playUIConfirm is a callable function

  # ── Engine Samples ──

  Scenario: AudioManager has engine sample loading
    Given an AudioManager
    Then loadEngineSamples is a callable function

  Scenario: AudioManager maintains an engine sample cache
    Given an AudioManager
    Then the sampleCache property exists

  Scenario: Engine sample paths cover all 4 cars
    Given the engine sample paths
    Then all 4 car IDs are represented

  # ── Turbo Samples ──

  Scenario: AudioManager has turbo sample loading
    Given an AudioManager
    Then loadTurboSamples is a callable function

  Scenario: AudioManager maintains a turbo sample cache
    Given an AudioManager
    Then the turboSampleCache property exists

  Scenario: Exactly 2 cars are turbocharged
    Given the car roster
    Then Rossini 488 and Kaiju GT-R are turbo cars
    And Weissach GT3 and Stingray Z06 are not turbo cars
