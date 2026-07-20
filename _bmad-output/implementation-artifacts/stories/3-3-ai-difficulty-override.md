---
id: 3-3-ai-difficulty-override
epic: 3
title: AI Difficulty Override
status: done
frs:
  - FR9
---

# Story 3.3: AI Difficulty Override

As a **player**,
I want **to choose AI difficulty before each race**,
So that **I can adjust the challenge level**.

**Acceptance Criteria:**

**Given** the track select screen is displayed
**When** AI difficulty options appear
**Then** 4 options display: Easy, Normal, Hard, Expert
**And** each option has a distinct color (green, yellow, orange, pink)
**And** default is Normal
**And** selected option has green border and glow

**Given** the player selects an AI difficulty
**When** the selection is made
**Then** the setting is saved to localStorage (GameSettings.aiDifficulty)
**And** the setting persists between sessions
**And** AI controllers use the selected difficulty profile

**Given** Easy difficulty is selected
**When** AI controllers initialize
**Then** speedMultiplier = 0.55, aggressiveness = 0.15
**And** recoveryTimeout = 8.0s, steerSmoothing = 0.15

**Given** Normal difficulty is selected
**When** AI controllers initialize
**Then** speedMultiplier = 0.75, aggressiveness = 0.4
**And** recoveryTimeout = 5.0s, steerSmoothing = 0.08

**Given** Hard difficulty is selected
**When** AI controllers initialize
**Then** speedMultiplier = 0.92, aggressiveness = 0.7
**And** recoveryTimeout = 3.0s, steerSmoothing = 0.04

**Given** Expert difficulty is selected
**When** AI controllers initialize
**Then** speedMultiplier = 1.0, aggressiveness = 0.9
**And** recoveryTimeout = 2.0s, steerSmoothing = 0.02
