---
id: 6-1-keyboard-rebinding
epic: 6
title: Keyboard Rebinding
status: done
frs:
  - FR12
---

# Story 6.1: Keyboard Rebinding

As a **player**,
I want **to customize my keyboard controls**,
So that **I can use my preferred key layout**.

**Acceptance Criteria:**

**Given** the settings menu is displayed
**When** keyboard controls section appears
**Then** 8 actions display: Throttle, Brake, Steer Left, Steer Right, Pause, Confirm, Back, Camera Switch
**And** each action shows current key binding(s)
**And** each action has a "Rebind" button

**Given** the player clicks "Rebind" for an action
**When** listening mode activates
**Then** the next key pressed becomes the new binding
**And** the binding is saved to localStorage (ocbp-bindings)
**And** conflicting bindings are automatically swapped

**Given** a new key binding is set
**When** the key conflicts with another action
**Then** the conflicting action loses that key
**And** the conflicting action falls back to its first default key
**And** the conflict handler logs the reset action

**Given** the player wants to reset bindings
**When** "Reset Defaults" is clicked
**Then** all keyboard bindings restore to defaults:
- Throttle: KeyW, ArrowUp
- Brake: KeyS, ArrowDown
- Steer Left: KeyA, ArrowLeft
- Steer Right: KeyD, ArrowRight
- Pause: Escape
- Confirm: Enter, Space
- Back: Escape
- Camera Switch: KeyC
