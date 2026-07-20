---
id: 8-3-race-metrics
epic: 8
title: Race Metrics
status: done
frs:
  - FR15
  - FR16
---

# Story 8.3: Race Metrics

As a **player**,
I want **wall hits and top speed tracked during races**,
So that **I can improve my driving precision**.

**Acceptance Criteria:**

**Given** the race is in progress
**When** the car's speed drops suddenly
**Then** wall hit is detected if speedDelta > 20 km/h and lastSpeed > 5 km/h
**And** wall hit counter increments
**And** collision sound plays
**And** 0.5s cooldown prevents multiple detections per impact

**Given** the race is in progress
**When** the car reaches a new top speed
**Then** topSpeed updates if currentSpeed > topSpeed
**And** topSpeed is displayed on the results screen

**Given** the race ends
**When** results display
**Then** wall hits count shows
**And** top speed shows (in current speed unit)
**And** both metrics are saved to the leaderboard entry
