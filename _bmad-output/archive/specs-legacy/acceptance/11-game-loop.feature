Feature: Game Loop
  The game orchestrates the full race lifecycle: car/track selection, countdown,
  racing with AI opponents, lap counting, scoring, results, and demo mode.

  # ── Race Flow ──

  Scenario: Start Race creates cars and track
    Given the user has selected a car and track
    When Start Race is clicked
    Then the player car and 3 AI opponents are created
    And the track is loaded
    And the game transitions to COUNTDOWN

  Scenario: Countdown runs for 5 seconds
    Given the game is in COUNTDOWN state
    Then 3, 2, 1, and GO! are displayed sequentially
    And after 5 seconds the game transitions to RACING

  Scenario: Race tracks lap completion
    Given a race is in progress
    When the player crosses the halfway point and start/finish line
    Then the lap counter increments

  Scenario: Race ends after completing all laps
    Given a race with 3 laps
    When the player completes lap 3
    Then finishRace is called
    And the game transitions to RESULTS

  Scenario: Results are stored in state
    Given a race has finished
    When finishRace is called
    Then raceResults contains position, points, totalTime, bestLapTime,
      wallHits, topSpeed, carId, and trackId
    And the leaderboard entry is added

  # ── Position Tracking ──

  Scenario: Position is calculated from lap and spline progress
    Given a player and AI cars on track
    When position is calculated
    Then it compares lap count and t-parameter across all cars

  # ── Wall Hit Detection ──

  Scenario: Wall hits are detected by speed delta
    Given a car driving above speed 5 km/h
    When a sudden speed drop greater than 20 km/h occurs
    Then a wall hit is recorded

  # ── Wrong Way Detection ──

  Scenario: Wrong way is detected when driving opposite to track direction
    Given a car on the track
    When driving against the track spline direction
    Then the wrong way indicator activates

  # ── Auto-Pause ──

  Scenario: Game auto-pauses on tab hide
    Given a race is in progress
    When the browser tab becomes hidden
    Then the game transitions to PAUSED

  # ── Demo Mode ──

  Scenario: Demo mode starts after 3 minutes idle
    Given the game is on the main menu
    When 3 minutes pass without input
    Then a demo race begins with random car, track, weather, and time-of-day

  Scenario: Demo mode runs a single AI car
    Given demo mode is active
    Then a single AI car drives at aggressiveness 0.3
    And no player car exists
    And the camera follows the AI car

  Scenario: Demo mode exits on any input
    Given demo mode is active
    When any keyboard, mouse, or gamepad input occurs
    Then the game returns to the main menu

  Scenario: Demo mode respects setting toggle
    Given demo mode is disabled in settings
    When 3 minutes of idle time pass
    Then demo mode does not start

  # ── Integration ──

  Scenario: Full car-on-track integration
    Given a physics world, track, and car
    When 300 physics frames are simulated
    Then the car has speed > 0 and position has changed from start

  Scenario: 4 cars on track integration
    Given a physics world, track, and 4 cars
    When 60 physics frames are simulated
    Then all 4 cars have speed > 0
