Feature: E2E User Flows
  End-to-end browser tests verify that complete user journeys work correctly
  in a real browser environment (Chromium, headless, SwiftShader WebGL).

  # ── Main Menu ──

  Scenario: Main menu renders all elements
    Given the game loads in a browser
    Then the title "OCBP RACER" is visible
    And the subtitle "Street Racing" is visible
    And Start Race, Settings, and Leaderboard buttons are visible
    And the version number starts with "v"

  Scenario: Main menu navigates to car select
    Given the game loads in a browser
    When Start Race is clicked
    Then the car select container is visible

  Scenario: Main menu navigates to settings
    Given the game loads in a browser
    When Settings is clicked
    Then the settings title is visible

  Scenario: Main menu navigates to leaderboard
    Given the game loads in a browser
    When Leaderboard is clicked
    Then the leaderboard title is visible

  # ── Car Selection ──

  Scenario: Car select displays car cards
    Given the user navigates to car select
    Then at least 1 car card is visible

  Scenario: First car is selected by default
    Given the user navigates to car select
    Then exactly 1 car card has the selected class

  Scenario: Clicking a car card opens car preview
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

  # ── Full Forward Flow ──

  Scenario: Complete car selection flow reaches track select
    Given the game loads in a browser
    When Start Race is clicked
    And a car card is clicked
    And Continue is clicked
    Then the Start Race button is visible on track select

  # ── Back Navigation Chain ──

  Scenario: Back button navigates through all screens
    Given the user has reached track select
    When Back is clicked
    Then the car select container is visible
    When Back is clicked again
    Then the main menu title is visible

  # ── Track Selection ──

  Scenario: Track select shows Start Race button
    Given the user navigates to track select
    Then the Start Race button is visible

  Scenario: Track select has time-of-day override
    Given the user navigates to track select
    Then a "Night" option is visible

  Scenario: Track select has weather override
    Given the user navigates to track select
    Then a "Rain" option is visible

  Scenario: Back from track select returns to car preview
    Given the user is on track select
    When Back is clicked
    Then the car preview spec name is visible

  # ── Settings ──

  Scenario: Settings screen renders correctly
    Given the user opens settings
    Then the title contains "Settings"

  Scenario: Settings has volume slider
    Given the user opens settings
    Then a volume slider is visible

  Scenario: Settings has MPH/KPH options
    Given the user opens settings
    Then "MPH" and "KPH" options are visible

  Scenario: Settings has graphics quality options
    Given the user opens settings
    Then "Low", "Medium", and "High" options are visible

  Scenario: Back from settings returns to main menu
    Given the user opens settings
    When Back is clicked
    Then the main menu title is visible

  # ── Settings & Leaderboard Round-Trip ──

  Scenario: Settings and leaderboard are accessible from main menu
    Given the game loads in a browser
    When Settings is clicked
    Then the settings title is visible
    When Back is clicked
    Then the main menu title is visible
    When Leaderboard is clicked
    Then the leaderboard title is visible
    When Back is clicked
    Then the main menu title is visible

  # ── Race Flow ──

  Scenario: Race can be started from track select
    Given the user has navigated to track select
    When Start Race is clicked
    Then the countdown number becomes visible

  Scenario: Countdown transitions to HUD
    Given the countdown has started
    When the countdown completes
    Then the HUD is visible

  Scenario: Race completes and shows results
    Given a race is in progress
    When the race finishes
    Then the results container is visible
    And the results position is visible
    And Total Time, Best Lap, Wall Hits, and Top Speed labels are visible
    And Race Again and Main Menu buttons are visible

  Scenario: Main Menu from results returns to main menu
    Given the user is on the results screen
    When Main Menu is clicked
    Then the main menu title is visible
