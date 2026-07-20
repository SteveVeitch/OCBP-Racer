---
id: 8-2-leaderboard-ui
epic: 8
title: Leaderboard UI
status: done
frs:
  - FR10
  - UX-DR11
---

# Story 8.2: Leaderboard UI

As a **player**,
I want **to view my best performances on a leaderboard screen**,
So that **I can compare times across tracks and cars**.

**Acceptance Criteria:**

**Given** the player opens the leaderboard from main menu
**When** the leaderboard screen appears
**Then** a tabbed panel displays (vertical tabs on left, content on right)
**And** "Overall" tab is selected by default
**And** 6 track tabs appear (one per track, truncated to 12 chars)

**Given** a tab is selected
**When** entries render
**Then** a header row shows: #, Car, Time, Walls, Speed
**And** up to 10 entries display per track
**And** 1st place entry is gold colored
**And** wall hits show "Clean" (green) if 0, count (pink) if > 0
**And** speed shows in current speed unit with unit label

**Given** a tab is selected
**When** the tab visual state updates
**Then** active tab has green left border and green text
**And** inactive tabs have dim text
**And** hover effect brightens inactive tab text

**Given** the leaderboard has no entries
**When** the content area is empty
**Then** "No entries yet" message displays (centered, dim text)
