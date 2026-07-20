---
id: 9-2-demo-hud
epic: 9
title: Demo HUD
status: done
frs:
  - FR6
---

# Story 9.2: Demo HUD

As a **player**,
I want **to see what car and track are being demonstrated**,
So that **I can identify the content being showcased**.

**Acceptance Criteria:**

**Given** demo mode is active
**When** the demo HUD renders
**Then** car name displays at top center (28px, Rajdhani, green, uppercase)
**And** track name displays below car name (16px, dim, uppercase)
**And** weather and TOD conditions display below track name (12px, dim)
**And** "PRESS ANY KEY TO START" prompt displays at bottom (18px, dim, pulsing animation)

**Given** the demo HUD is displayed
**When** the demo runs
**Then** the HUD has semi-transparent dark background
**And** the HUD does not interfere with gameplay (pointer-events: none)
