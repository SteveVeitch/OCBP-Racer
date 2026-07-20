---
id: 9-3-demo-activity-tracking
epic: 9
title: Demo Activity Tracking
status: done
frs:
  - FR6
---

# Story 9.3: Demo Activity Tracking

As a **player**,
I want **the idle timer to reset when I interact**,
So that **demo doesn't start while I'm actively using the game**.

**Acceptance Criteria:**

**Given** the game is on the main menu
**When** keyboard, mouse, or touch input is detected
**Then** the idle timer resets to 0
**And** demo mode does not activate

**Given** the game is on the main menu
**When** gamepad input is detected
**Then** the idle timer resets to 0
**And** demo mode does not activate

**Given** the idle timer is tracking
**When** the user returns to the main menu after a race
**Then** the idle timer resets to 0
**And** demo mode waits another 180 seconds

**Given** demo mode is active
**When** the player presses any key or gamepad button
**Then** demo exits and returns to main menu
**And** the idle timer resets
