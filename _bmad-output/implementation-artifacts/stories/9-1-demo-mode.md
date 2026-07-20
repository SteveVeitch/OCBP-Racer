---
id: 9-1-demo-mode
epic: 9
title: Demo Mode
status: done
frs:
  - FR6
---

# Story 9.1: Demo Mode

As a **player**,
I want **the game to showcase itself when I'm away**,
So that **I can see gameplay before deciding to play**.

**Acceptance Criteria:**

**Given** the game is on the main menu
**When** the idle timer reaches 180 seconds (3 minutes)
**Then** demo mode activates automatically
**And** a random car is selected (from all available cars)
**And** a random track is selected (from all available tracks)
**And** random weather is selected (clear, rain, fog, storm)
**And** random TOD is selected (dawn, day, dusk, night)

**Given** demo mode activates
**When** the demo starts
**Then** a single AI car spawns with 'easy' difficulty
**And** the car drives autonomously around the track
**And** the camera follows in chase view
**And** the demo renders with full environment (weather, lighting, particles)

**Given** demo mode is active
**When** the game loop runs
**Then** physics updates for the AI car each frame
**And** weather particles update based on selected weather
**And** tire smoke emits when AI drifts

**Given** the player interacts during demo
**When** any key is pressed or gamepad button/axis is active
**Then** demo mode exits immediately
**And** the game returns to the main menu
**And** the idle timer resets
