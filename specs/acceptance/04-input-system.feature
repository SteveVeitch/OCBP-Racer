Feature: Input System
  The game supports keyboard and gamepad input with rebindable controls,
  dead zones, conflict detection, and hot-plug gamepad rediscovery.

  # ── Keyboard Defaults ──

  Scenario: Default keyboard bindings cover all actions
    Given an InputManager with default bindings
    Then throttle maps to KeyW and ArrowUp
    And brake maps to KeyS and ArrowDown
    And steerLeft maps to KeyA and ArrowLeft
    And steerRight maps to KeyD and ArrowRight
    And pause maps to Escape
    And confirm maps to Enter and Space
    And back maps to Escape
    And cameraSwitch maps to KeyC

  Scenario: No duplicate keys across keyboard actions
    Given an InputManager with default bindings
    Then no key code is used by more than one action

  Scenario: Default input is zeroed
    Given a fresh InputManager
    Then throttle, brake, and steer are all 0

  Scenario: InputManager returns correct types
    Given an InputManager
    When getState is called
    Then throttle, brake, and steer are numbers
    And pause is a boolean

  # ── Gamepad Defaults ──

  Scenario: Default gamepad bindings use triggers as buttons
    Given default gamepad bindings
    Then throttle maps to Button 7 (RT)
    And brake maps to Button 6 (LT)
    And pause maps to Button 9 (Start)
    And camera maps to Button 3 (Y)
    And confirm maps to Button 0 (A)
    And back maps to Button 1 (B)

  # ── Dead Zone ──

  Scenario: Gamepad dead zone zeroes small inputs
    Given a gamepad axis value below 0.15
    When the dead zone is applied
    Then the output is 0

  Scenario: Gamepad dead zone preserves full range
    Given a gamepad axis value of 1.0
    When the dead zone is applied
    Then the output is 1.0

  Scenario: Steering uses the same dead zone normalization as throttle and brake
    Given gamepad steering input
    When the dead zone is applied
    Then the output ramps smoothly from 0 to 1 (not a hard threshold)

  # ── Rebinding ──

  Scenario: Keyboard bindings can be set and retrieved
    Given an InputManager
    When throttle is rebound to KeyT
    Then throttle maps to KeyT
    And brake is unchanged

  Scenario: Reset bindings restores defaults
    Given an InputManager with custom bindings
    When resetBindings is called
    Then throttle maps back to KeyW

  Scenario: Conflict detection swaps bindings
    Given an InputManager
    When pause and cameraSwitch swap keys
    Then pause has the old camera key and cameraSwitch has the old pause key

  # ── Binding Persistence ──

  Scenario: Keyboard bindings are stored in ocbp-settings
    Given the user rebinds a keyboard action
    When settings are saved
    Then the binding is persisted under the ocbp-settings localStorage key

  Scenario: Gamepad bindings are stored separately
    Given the user rebinds a gamepad action
    When bindings are saved
    Then the binding is persisted under the ocbp-gamepad-bindings localStorage key

  Scenario: Stored gamepad bindings preserve direction property
    Given a gamepad axis binding with direction -1
    When saved and reloaded
    Then the direction property is preserved

  # ── Gamepad Rebinding UI ──

  Scenario: Settings shows Keyboard and Gamepad tabs
    Given the user opens Settings → Controls
    Then both a Keyboard tab and a Gamepad tab are visible

  Scenario: Escape cancels gamepad rebinding
    Given the user is rebinding a gamepad action
    When Escape is pressed
    Then the rebind is cancelled without changing the binding

  Scenario: Gamepad conflicts are logged
    Given a gamepad rebind causes a conflict
    Then the conflict is logged to console via setGamepadConflictHandler

  # ── Hot-Plug ──

  Scenario: Gamepad is detected at runtime
    Given a gamepad is connected
    When navigator.getGamepads() returns a valid device
    Then the gamepad is usable for input

  Scenario: Gamepad rediscovery throttles to once per second
    Given the tracked gamepad disconnects
    When rescanGamepads runs
    Then it polls navigator.getGamepads() at most once per second

  Scenario: Gamepad rediscovery triggers on window focus
    Given the tracked gamepad was disconnected
    When the browser tab gains focus
    Then rescanGamepads is triggered

  # ── Game State Input ──

  Scenario: Driving inputs are blocked during countdown
    Given the game is in COUNTDOWN state
    Then throttle, brake, and steer inputs are ignored

  Scenario: Driving inputs are blocked during pause
    Given the game is in PAUSED state
    Then throttle, brake, and steer inputs are ignored

  Scenario: PAUSED state accepts Back to return to menu
    Given the game is in PAUSED state
    When Back is pressed
    Then the game transitions to MENU

  # ── Window Blur ──

  Scenario: All keys are cleared on window blur
    Given the user is pressing keys
    When the window loses focus
    Then all key states are cleared

  Scenario: Demo idle timer resets on any input
    Given the game is on the main menu
    When keyboard, mouse, or gamepad activity occurs
    Then the demo idle timer resets
