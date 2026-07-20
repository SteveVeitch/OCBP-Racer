---
id: 2-2-car-spec-card
epic: 2
title: Car Spec Card
status: done
frs:
  - FR17
  - UX-DR5
---

# Story 2.2: Car Spec Card

As a **player**,
I want **to see detailed car specifications alongside the 3D preview**,
So that **I can compare car performance before choosing**.

**Acceptance Criteria:**

**Given** the car preview is active
**When** the spec card renders
**Then** a semi-transparent panel appears on the right side (400px width, max 40%)
**And** the panel shows car name (36px, Rajdhani, uppercase)
**And** the panel shows car subtitle (14px, dim text)
**And** the panel shows engine info (displacement, type, horsepower)

**Given** the spec card is displayed
**When** performance stats render
**Then** 4 stat bars display: Power, Grip, Speed, Drift
**And** each bar is 180px wide with green fill
**And** values are calibrated: highest car fills ~85%, others proportional
**And** stat row shows label on left, bar on right

**Given** the spec card is displayed
**When** additional details render
**Then** top speed shows (converted to current speed unit)
**And** power-to-weight ratio shows (engineForce / mass, formatted as "X.XX g")
**And** details section has top border separator

**Given** the spec card is displayed
**When** navigation buttons render
**Then** "Back" button returns to car select
**And** "Continue" button proceeds to track select
**And** hint text shows "Drag to rotate • Scroll to zoom"

**Given** the car preview is active
**When** the player navigates back
**Then** the preview scene is cleaned up (mesh removed from scene)
**And** state transitions to CAR_SELECT
