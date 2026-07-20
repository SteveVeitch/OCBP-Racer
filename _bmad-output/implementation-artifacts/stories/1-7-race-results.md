---
id: 1-7-race-results
epic: 1
title: Race Results
status: done
frs:
  - FR5
  - FR19
  - UX-DR10
---

# Story 1.7: Race Results

As a **player**,
I want **to see my race performance after finishing**,
So that **I can understand how well I did**.

**Acceptance Criteria:**

**Given** the race ends
**When** the results screen appears
**Then** the final position displays (1st, 2nd, 3rd, 4th) in gold, 96px font
**And** points earned display (10/7/5/2)

**Given** the results screen is shown
**When** the player views results
**Then** total race time displays (format: M:SS.mmm)
**And** best lap time displays
**And** wall hits count displays
**And** top speed reached displays (in current speed unit)

**Given** the results screen is shown
**When** the player selects "Race Again"
**Then** the same race restarts

**Given** the results screen is shown
**When** the player selects "Main Menu"
**Then** the game returns to the main menu
