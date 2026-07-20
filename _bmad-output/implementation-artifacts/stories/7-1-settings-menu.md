---
id: 7-1-settings-menu
epic: 7
title: Settings Menu
status: done
frs:
  - FR14
  - UX-DR12
---

# Story 7.1: Settings Menu

As a **player**,
I want **to configure audio, graphics, and control settings**,
So that **the game behaves according to my preferences**.

**Acceptance Criteria:**

**Given** the player opens settings from main menu or pause menu
**When** the settings screen appears
**Then** a two-column layout displays (Audio/Graphics left, Controls right)
**And** the panel has dark background with slide-up animation (0.3s)

**Given** the Audio/Graphics column is displayed
**When** settings render
**Then** Master Volume slider (0-1, step 0.01)
**And** Engine Volume slider (0-1, step 0.01)
**And** Steer Sensitivity slider (0-2, step 0.05)
**And** Speed Unit toggle (MPH / KPH)
**And** Graphics Quality toggle (Low / Medium / High)
**And** Camera Default toggle (Chase / Cockpit / Windscreen / Hood / Bumper)
**And** Fog toggle (on/off)

**Given** the Controls column is displayed
**When** settings render
**Then** Keyboard tab with rebinding controls
**And** Gamepad tab with rebinding controls
**And** Reset Defaults button for each

**Given** the player adjusts a slider
**When** the value changes
**Then** the setting is immediately applied
**And** the setting is saved to localStorage

**Given** Graphics Quality is set to Low
**When** graphics apply
**Then** bloom is disabled
**And** pixel ratio is 1

**Given** Graphics Quality is set to Medium
**When** graphics apply
**Then** bloom strength = 0.35
**And** bloom resolution = half screen
**And** pixel ratio is 1

**Given** Graphics Quality is set to High
**When** graphics apply
**Then** bloom strength = 0.5
**And** bloom resolution = full screen
**And** pixel ratio = min(devicePixelRatio, 2)
