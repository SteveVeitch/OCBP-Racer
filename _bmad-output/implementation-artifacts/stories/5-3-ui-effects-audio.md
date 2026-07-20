---
id: 5-3-ui-effects-audio
epic: 5
title: UI & Effects Audio
status: done
frs:
  - FR13
---

# Story 5.3: UI & Effects Audio

As a **player**,
I want **audio feedback for UI interactions and race events**,
So that **I receive auditory confirmation of actions**.

**Acceptance Criteria:**

**Given** the player clicks a UI button
**When** click is registered
**Then** UI click plays (sine 600Hz, 0.06s, volume 0.1)

**Given** the player confirms a selection
**When** confirm is registered
**Then** UI confirm plays (sine 800Hz + 1200Hz, 0.08s, volume 0.12)

**Given** the countdown is active
**When** each number displays
**Then** countdown tick plays (square 440Hz, 0.15s, volume 0.08)

**Given** the countdown reaches GO
**When** GO displays
**Then** countdown go plays (square 880Hz, 0.2s, volume 0.12)

**Given** the race ends
**When** results display
**Then** race complete plays (ascending arpeggio: 523→659→784→1047Hz, 0.2s each)

**Given** audio volumes are adjusted
**When** settings change
**Then** masterVolume affects all output (0-1 range)
**And** engineVolume affects engine, turbo, tire sounds (0-1 range)
**And** audio context suspends/resumes with pause
