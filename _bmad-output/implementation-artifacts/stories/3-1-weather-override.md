---
id: 3-1-weather-override
epic: 3
title: Weather Override
status: done
frs:
  - FR7
---

# Story 3.1: Weather Override

As a **player**,
I want **to choose weather conditions before each race**,
So that **I can experience different driving challenges**.

**Acceptance Criteria:**

**Given** the track select screen is displayed
**When** weather override options appear
**Then** 5 options display: Auto, Clear, Rain, Fog, Storm
**And** default is Auto (uses track's default weather)
**And** selected option has green border and glow
**And** options are styled as buttons (14px, Rajdhani, uppercase)

**Given** the player selects a weather option
**When** the selection is made
**Then** the setting is saved to localStorage (GameSettings.weatherOverride)
**And** the setting persists between sessions
**And** the override applies when the race starts

**Given** a weather override is set to Auto
**When** the race loads
**Then** the track's default weather is used (e.g., Midnight Circuit = Clear)
**And** weather presets apply correct rain intensity, fog density, storm effects
