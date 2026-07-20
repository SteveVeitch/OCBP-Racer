---
id: 3-2-time-of-day-override
epic: 3
title: Time-of-Day Override
status: done
frs:
  - FR8
---

# Story 3.2: Time-of-Day Override

As a **player**,
I want **to choose the time of day before each race**,
So that **I can race under different lighting conditions**.

**Acceptance Criteria:**

**Given** the track select screen is displayed
**When** time-of-day override options appear
**Then** 5 options display: Auto, Dawn, Day, Dusk, Night
**And** default is Auto (uses track's default TOD)
**And** selected option has green border and glow

**Given** the player selects a TOD option
**When** the selection is made
**Then** the setting is saved to localStorage (GameSettings.todOverride)
**And** the setting persists between sessions
**And** the override applies when the race starts

**Given** a TOD override is set
**When** the race loads
**Then** lighting presets apply (ambient color/intensity, directional color/intensity)
**And** HDR environment map switches to matching time period
**And** street lights activate for night/dusk/dawn
