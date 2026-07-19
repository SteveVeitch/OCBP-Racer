Feature: UI System
  The game provides a full HTML/CSS overlay UI including main menu, car selection,
  car preview, track selection, in-race HUD, pause menu, results, settings,
  leaderboard, and demo mode.

  # ── Main Menu ──

  Scenario: Main menu displays title and buttons
    Given the game loads to the main menu
    Then the title contains "OCBP RACER"
    And the subtitle contains "Street Racing"
    And three buttons are visible: Start Race, Settings, Leaderboard

  Scenario: Main menu displays version number
    Given the game loads to the main menu
    Then the version text contains "v"

  # ── Car Select ──

  Scenario: Car select shows car cards
    Given the user navigates to car select
    Then at least 1 car card is visible

  Scenario: First car is selected by default
    Given the user navigates to car select
    Then exactly 1 car card has the selected class

  Scenario: Clicking a car card navigates to car preview
    Given the user is on car select
    When a car card is clicked
    Then the car preview spec name is visible

  Scenario: Back from car preview returns to car select
    Given the user is on car preview
    When Back is clicked
    Then the car select container is visible

  Scenario: Back from car select returns to main menu
    Given the user is on car select
    When Back is clicked
    Then the main menu title is visible

  # ── Car Preview ──

  Scenario: Car preview shows spec name
    Given the user navigates to car preview
    Then the car preview spec name is visible and non-empty

  Scenario: Continue navigates to track select
    Given the user is on car preview
    When Continue is clicked
    Then the track select screen is visible

  # ── Track Select ──

  Scenario: Track select shows Start Race button
    Given the user navigates to track select
    Then the Start Race button is visible

  Scenario: Track select has time-of-day override
    Given the user navigates to track select
    Then a "Night" time-of-day option is visible

  Scenario: Track select has weather override
    Given the user navigates to track select
    Then a "Rain" weather option is visible

  Scenario: Back from track select returns to car preview
    Given the user is on track select
    When Back is clicked
    Then the car preview spec name is visible

  # ── In-Race HUD ──

  Scenario: HUD displays lap counter
    Given a race has started
    Then the HUD lap counter is visible and contains "/"

  Scenario: HUD displays race timer
    Given a race has started
    Then the HUD time display is visible and not "--:--"

  Scenario: HUD displays position
    Given a race has started
    Then the HUD position element is visible

  # ── Pause Menu ──

  Scenario: Pause menu shows Resume, Settings, Restart, Quit
    Given the game is paused
    Then Resume, Settings, Restart, and Quit Race buttons are visible

  Scenario: Resume returns to race
    Given the game is paused
    When Resume is clicked
    Then the HUD is visible and the game resumes

  # ── Results Screen ──

  Scenario: Results show position and points
    Given a race has finished
    Then the results position is visible
    And the points display is visible

  Scenario: Results show timing information
    Given a race has finished
    Then "Total Time" and "Best Lap" labels are visible
    And formatted time values are shown

  Scenario: Results show race stats
    Given a race has finished
    Then "Wall Hits" and "Top Speed" labels are visible

  Scenario: Results offer Race Again and Main Menu
    Given a race has finished
    Then "Race Again" and "Main Menu" buttons are visible

  Scenario: Race Again restarts the race
    Given the user is on the results screen
    When Race Again is clicked
    Then the countdown or race begins again

  Scenario: Main Menu returns to main menu
    Given the user is on the results screen
    When Main Menu is clicked
    Then the main menu title is visible

  # ── Settings ──

  Scenario: Settings displays title
    Given the user opens settings
    Then the settings title contains "Settings"

  Scenario: Settings has volume slider
    Given the user opens settings
    Then a volume slider is visible

  Scenario: Settings has MPH/KPH speed unit toggle
    Given the user opens settings
    Then "MPH" and "KPH" options are visible

  Scenario: Settings has graphics quality options
    Given the user opens settings
    Then "Low", "Medium", and "High" options are visible

  Scenario: Settings has Keyboard/Gamepad control tabs
    Given the user opens settings
    Then Keyboard and Gamepad tabs are visible in the controls column

  Scenario: Settings persists to localStorage
    Given the user changes a setting
    Then the change is saved to the ocbp-settings localStorage key

  # ── Leaderboard ──

  Scenario: Leaderboard displays title
    Given the user opens the leaderboard
    Then the title contains "LEADERBOARD"

  Scenario: Leaderboard has per-track tabs
    Given the user opens the leaderboard
    Then track tabs are visible on the left side

  Scenario: Leaderboard shows entries with stats
    Given the leaderboard has entries
    Then entries show time, wall hits, and top speed

  Scenario: Leaderboard sorts by time ascending
    Given the leaderboard has multiple entries
    Then entries are sorted by total time from lowest to highest

  Scenario: Track leaderboard is limited to 10 entries
    Given 15 entries are added for one track
    Then only the 10 best entries are retained

  Scenario: Overall leaderboard is limited to 20 entries
    Given 25 entries are added across tracks
    Then only the 20 best entries are retained

  Scenario: Clear leaderboard empties all data
    Given the leaderboard has entries
    When clearLeaderboard is called
    Then both per-track and overall leaderboards return empty

  # ── Demo Mode ──

  Scenario: Demo mode triggers after 3 minutes idle
    Given the game is on the main menu
    When 3 minutes of idle time pass (keyboard, mouse, gamepad reset timer)
    Then the demo mode begins with a random car, track, weather, and time-of-day

  Scenario: Demo mode shows minimal HUD
    Given demo mode is active
    Then car name, track name, conditions, and exit prompt are visible

  Scenario: Demo mode exits on any input
    Given demo mode is active
    When any keyboard, mouse, or gamepad input occurs
    Then the game returns to the main menu

  Scenario: Demo mode can be disabled in settings
    Given the user disables demo mode in settings
    When 3 minutes of idle time pass
    Then demo mode does not start

  Scenario: Demo mode exit uses tracked gamepad index
    Given demo mode is active and a gamepad is connected
    When gamepad input is detected via the tracked index
    Then the game returns to the main menu
