---
id: 4-2-camera-settings
epic: 4
title: Camera Settings
status: done
frs:
  - FR11
---

# Story 4.2: Camera Settings

As a **player**,
I want **to set my preferred default camera view**,
So that **races start with my favorite perspective**.

**Acceptance Criteria:**

**Given** the settings menu is displayed
**When** camera default options appear
**Then** 5 options display: Chase, Cockpit, Windscreen, Hood, Bumper
**And** default is Chase
**And** selected option has green border

**Given** the player selects a camera default
**When** the setting is saved
**Then** it persists to localStorage (GameSettings.cameraDefault)
**And** the selected camera is applied when the race starts
**And** the setting applies immediately via cameraController.setView()
