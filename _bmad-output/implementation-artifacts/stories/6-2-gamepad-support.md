---
id: 6-2-gamepad-support
epic: 6
title: Gamepad Support
status: done
frs:
  - FR12
  - NFR10
---

# Story 6.2: Gamepad Support

As a **player**,
I want **to use a gamepad with rebindable controls**,
So that **I have a console-like racing experience**.

**Acceptance Criteria:**

**Given** a gamepad is connected
**When** the gamepadconnected event fires
**Then** the gamepad index is stored
**And** gamepad input is polled each frame
**And** gamepad state is merged with keyboard state (OR logic)

**Given** a gamepad is disconnected
**When** the gamepaddisconnected event fires
**Then** the gamepad index is cleared
**And** keyboard input becomes the sole source
**And** the game continues without interruption

**Given** the settings menu is displayed
**When** gamepad controls section appears
**Then** 8 actions display with current gamepad bindings
**And** each action shows binding type (button/axis) and index
**And** each action has a "Rebind" button

**Given** the player clicks "Rebind" for a gamepad action
**When** listening mode activates
**Then** the next button press or axis movement is captured
**And** axis bindings include direction (positive/negative)
**And** the binding is saved to localStorage (ocbp-gamepad-bindings)
**And** conflicting bindings are automatically swapped

**Given** a gamepad axis is used for steering
**When** raw axis value is read
**Then** dead zone of 0.15 is applied
**And** steer curve is applied (exponent 1.4 for fine control at low values)
**And** dead zone remapping: output = (input - deadZone) / (1 - deadZone)

**Given** the player navigates menus with gamepad
**When** D-pad or stick input is detected
**Then** focus moves between focusable elements
**And** focused element shows .gp-focus green outline
**And** confirm button clicks the focused element
**And** back button navigates to previous screen
