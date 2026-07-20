---
id: 7-2-settings-persistence
epic: 7
title: Settings Persistence
status: done
frs:
  - FR14
---

# Story 7.2: Settings Persistence

As a **player**,
I want **my settings to persist between sessions**,
So that **I don't have to reconfigure every time**.

**Acceptance Criteria:**

**Given** any setting is changed
**When** the change is made
**Then** the setting is saved to localStorage (ocbp-settings key)
**And** the setting persists across page reloads

**Given** the game loads
**When** settings are initialized
**Then** saved settings are loaded from localStorage
**And** missing settings fall back to defaults:
- masterVolume: 1.0
- engineVolume: 1.0
- steerSensitivity: 1.0
- speedUnit: 'mph'
- graphicsQuality: 'high'
- cameraDefault: 'chase'
- fogEnabled: true
- weatherOverride: 'auto'
- todOverride: 'auto'
- aiDifficulty: 'normal'
- releaseChannel: 'blue'
- demoEnabled: true
