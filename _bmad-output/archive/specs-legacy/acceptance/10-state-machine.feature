Feature: State Machine
  The game uses a finite state machine to manage screen transitions,
  persist selections, store race results, and maintain settings.

  # ── States ──

  Scenario: Game starts at MENU
    Given a new StateMachine
    Then the current state is "MENU"
    And the previous state is "MENU"

  Scenario: LOADING state does not exist
    Given a new StateMachine
    Then "LOADING" is not a valid state

  Scenario: All expected states are valid
    Given a new StateMachine
    Then MENU, CAR_SELECT, CAR_PREVIEW, TRACK_SELECT, COUNTDOWN,
      RACING, PAUSED, RESULTS, SETTINGS, DEMO, and LEADERBOARD are valid states

  # ── Transitions ──

  Scenario: Basic transition updates current and previous
    Given a new StateMachine
    When transitioning to CAR_SELECT
    Then current is "CAR_SELECT" and previous is "MENU"

  Scenario: Self-transition is ignored
    Given a StateMachine in MENU state
    When transitioning to MENU
    Then current remains "MENU" and previous remains "MENU"

  Scenario: Full race flow chains correctly
    Given a new StateMachine
    When transitioning MENU → CAR_SELECT → CAR_PREVIEW → TRACK_SELECT → COUNTDOWN → RACING
    Then current is "RACING" and previous is "COUNTDOWN"

  # ── Listeners ──

  Scenario: Listener fires on target state
    Given a StateMachine
    When a listener is registered for CAR_SELECT
    And transitioning to CAR_SELECT
    Then the listener fires exactly once

  Scenario: Listener does not fire on other states
    Given a StateMachine
    When a listener is registered for MENU
    And transitioning to CAR_SELECT
    Then the listener does not fire

  Scenario: Multiple listeners fire independently
    Given a StateMachine
    When two listeners are registered for RACING
    And transitioning to RACING
    Then both listeners fire exactly once

  # ── Selections ──

  Scenario: Default car is rossini-488
    Given a new StateMachine
    Then getSelectedCar() returns "rossini-488"

  Scenario: Default track is midnight-circuit
    Given a new StateMachine
    Then getSelectedTrack() returns "midnight-circuit"

  Scenario: Car selection persists
    Given a StateMachine
    When setSelectedCar("kaiju-gt-r") is called
    Then getSelectedCar() returns "kaiju-gt-r"

  Scenario: Track selection persists
    Given a StateMachine
    When setSelectedTrack("sunset-boulevard") is called
    Then getSelectedTrack() returns "sunset-boulevard"

  # ── Race Results ──

  Scenario: Race results start as null
    Given a new StateMachine
    Then getRaceResults() returns null

  Scenario: Race results can be stored and retrieved
    Given a StateMachine
    When setRaceResults is called with position, points, totalTime, bestLapTime,
      lapTimes, wallHits, topSpeed, carId, and trackId
    Then getRaceResults() returns the full results object

  Scenario: Scoring points map correctly
    Given the points table
    Then position 1 earns 10 points
    And position 2 earns 7 points
    And position 3 earns 5 points
    And position 4 earns 2 points

  # ── Settings ──

  Scenario: Default settings have expected values
    Given a new StateMachine
    When getSettings is called
    Then masterVolume is 1.0
    And engineVolume is 0.6
    And speedUnit is "mph"
    And graphicsQuality is "high"
    And releaseChannel is "green"
    And demoEnabled is true

  Scenario: Partial settings update preserves other values
    Given a StateMachine
    When updateSettings changes speedUnit to "kph"
    Then masterVolume remains 1.0

  Scenario: Settings persist to localStorage
    Given a StateMachine
    When updateSettings is called
    Then localStorage.setItem is called with key "ocbp-settings"
