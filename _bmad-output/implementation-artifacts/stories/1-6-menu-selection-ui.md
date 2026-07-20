---
id: 1-6-menu-selection-ui
epic: 1
title: Menu & Selection UI
status: done
frs:
  - FR2
  - FR3
  - FR7
  - FR8
  - FR9
  - UX-DR3
  - UX-DR4
  - UX-DR5
  - UX-DR6
  - UX-DR12
  - UX-DR15
  - UX-DR16
  - UX-DR17
  - UX-DR18
---

# Story 1.6: Menu & Selection UI

As a **player**,
I want **to navigate menus and select my car and track with proper filtering**,
So that **I can customize my race before starting**.

**Acceptance Criteria:**

**Given** the game loads
**When** the main menu appears
**Then** the title "OCBP RACER" displays with neon green styling
**And** "Start Race" and "Settings" buttons are visible
**And** keyboard and gamepad can navigate
**And** gamepad items show .gp-focus green outline (2px solid #00ff88)

**Given** the player selects "Start Race"
**When** the car select screen appears
**Then** 4 car cards display with 3D thumbnails
**And** each card shows car name, subtitle, engine badge (no TURBO indicator)
**And** each card shows 4 stat bars: Power, Grip, Speed, Drift
**And** stat bars calibrated: highest car fills ~85%, others proportional
**And** selected car has green border + glow

**Given** a car is selected
**When** the car preview appears
**Then** a 3D model renders in dedicated preview scene (off-white background)
**And** camera orbits at 30° elevation, auto-rotates CW
**And** mouse drag rotates manually (3s resume timeout)
**And** scroll zooms in/out (min 3, max 12)
**And** spec box shows full car details with arcade styling
**And** engine info shown inline without TURBO badge
**And** Back/Continue buttons navigate

**Given** the player continues to track select
**When** the track select screen appears
**Then** 6 track cards display in a 3-column grid
**And** each card shows name, difficulty badge, distance, terrain icon
**And** each card shows default time-of-day and weather
**And** selected track has green border

**Given** the release channel is set to Green
**When** car and track select load
**Then** only released cars and tracks appear (Rossini 488, Midnight Circuit)

**Given** the release channel is set to Blue
**When** car and track select load
**Then** all cars and tracks appear

**Given** the track select is shown
**When** weather override is available
**Then** options: Auto, Clear, Rain, Fog, Storm
**And** default is Auto (uses track default)
**And** persisted to localStorage

**Given** the track select is shown
**When** time-of-day override is available
**Then** options: Auto, Dawn, Day, Dusk, Night
**And** default is Auto (uses track default)
**And** persisted to localStorage

**Given** the track select is shown
**When** AI difficulty override is available
**Then** options: Easy, Normal, Hard, Expert (default: Normal)
**And** persisted to localStorage

**Given** the UI is styled
**When** any screen renders
**Then** fonts use Rajdhani (Google Fonts), system-ui fallback
**And** primary color is #00ff88 (neon green)
**And** secondary color is #ff3366 (hot pink)
**And** accent is #ffcc00 (gold)
**And** backgrounds are rgba(10, 10, 26, 0.92)
**And** buttons are 22px, uppercase, 3px letter spacing
**And** screen transitions fade in 0.3s
**And** button hover scales 1.02x, press scales 0.98x
