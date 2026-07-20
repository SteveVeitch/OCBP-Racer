Feature: Camera System
  The game provides 5 camera views (chase, cockpit, windscreen, hood, bumper) with
  distinct behaviors, FOV scaling, and view cycling.

  # ── Controller ──

  Scenario: CameraController creates successfully
    Given a CameraController is instantiated
    Then it is not null

  Scenario: Default view is chase
    Given a CameraController
    Then the default view is "chase"

  Scenario: Camera follows car position
    Given a CameraController and a car position
    When update is called with the car's position
    Then the camera position moves away from the origin

  # ── View Cycling ──

  Scenario: cycleView cycles through all 5 views
    Given a CameraController
    When cycleView is called 5 times
    Then the view order is chase → cockpit → windscreen → hood → bumper → chase

  Scenario: setView changes to a specific view
    Given a CameraController
    When setView("hood") is called
    Then getView() returns "hood"

  Scenario: getViewConfigs returns all 5 view configs
    Given a CameraController
    When getViewConfigs is called
    Then the result has keys: chase, cockpit, windscreen, hood, bumper

  # ── Cockpit Camera ──

  Scenario: Cockpit camera is inside the car at driver eye level
    Given a CameraController
    When setView("cockpit") is called
    Then the camera height is approximately 0.95m (seated eye level)
    And the camera is positioned 0.45m behind car center (driver seat)

  Scenario: Cockpit camera has minimal spring follow
    Given a CameraController in cockpit view
    Then springStiffness is 200.0 and springDamping is 0.7

  Scenario: Cockpit camera does not use wall collision
    Given a CameraController in cockpit view
    When update is called
    Then wall collision raycasting is not performed

  # ── Camera Bindings ──

  Scenario: Camera switch is bound to C key on keyboard
    Given default keyboard bindings
    Then cameraSwitch maps to KeyC

  Scenario: Camera switch is bound to Y button on gamepad
    Given default gamepad bindings
    Then camera maps to Button 3
