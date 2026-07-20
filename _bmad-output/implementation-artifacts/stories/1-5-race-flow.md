---
id: 1-5-race-flow
epic: 1
title: Race Flow
status: done
frs:
  - FR4
  - FR5
  - FR19
---

# Story 1.5: Race Flow

As a **player**,
I want **a complete race from countdown to results with proper pause handling**,
So that **I can experience a full racing session that respects my time**.

**Acceptance Criteria:**

**Given** the player starts a race
**When** the race loads
**Then** a countdown displays: 3 → 2 → 1 → GO!
**And** each number appears for 1 second
**And** GO! is gold/yellow, slightly smaller (120px vs 180px)
**And** input is locked during countdown
**And** cars cannot move until GO!

**Given** the countdown is active
**When** the player pauses
**Then** the countdown pauses
**And** game state transitions to PAUSED
**And** input blocked except menu navigation

**Given** the race is in progress
**When** the player completes a lap
**Then** the lap counter increments
**And** best lap time is tracked
**And** lap counter is 0-indexed internally, displayed as 1-indexed

**Given** the race is in progress
**When** the player's position changes
**Then** the position indicator updates
**And** scoring reflects current position (10/7/5/2 points for 1st/2nd/3rd/4th)

**Given** all laps are completed
**When** the race ends
**Then** the game transitions to RESULTS state

**Given** the browser tab becomes hidden
**When** visibilitychange event fires
**Then** the game auto-pauses
**And** physics stops running while tab is backgrounded

**Given** the game is paused
**When** the player resumes
**Then** state returns to previous state (RACING or COUNTDOWN)
**And** input buffer is cleared (prevents stale inputs)
