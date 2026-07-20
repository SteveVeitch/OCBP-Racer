---
id: 7-3-pause-menu
epic: 7
title: Pause Menu
status: done
frs:
  - FR18
  - UX-DR9
---

# Story 7.3: Pause Menu

As a **player**,
I want **to pause the game and access options**,
So that **I can take a break or adjust settings mid-race**.

**Acceptance Criteria:**

**Given** the race is in progress
**When** the player presses Escape or gamepad Start
**Then** the game pauses (physics stops, state → PAUSED)
**And** a semi-transparent overlay appears (black, 70% opacity)
**And** "PAUSED" title displays (48px, Rajdhani, uppercase)

**Given** the pause menu is displayed
**When** options render
**Then** "Resume" button returns to previous state
**And** "Settings" button opens settings screen
**And** "Restart" button restarts the same race
**And** "Quit" button returns to main menu

**Given** the player pauses during countdown
**When** the game is paused
**Then** the countdown timer freezes
**And** resuming restores the countdown state

**Given** the browser tab becomes hidden
**When** visibilitychange fires
**Then** the game auto-pauses if race is active
**And** audio context suspends

**Given** the player resumes from pause
**When** Resume is selected
**Then** state returns to previous state (RACING or COUNTDOWN)
**And** input buffer is cleared (prevents stale inputs)
**And** audio context resumes
