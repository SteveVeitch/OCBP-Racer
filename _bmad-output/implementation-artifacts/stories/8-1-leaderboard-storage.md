---
id: 8-1-leaderboard-storage
epic: 8
title: Leaderboard Storage
status: done
frs:
  - FR10
---

# Story 8.1: Leaderboard Storage

As a **player**,
I want **my race results saved to a leaderboard**,
So that **I can track my improvement over time**.

**Acceptance Criteria:**

**Given** the race ends
**When** results are recorded
**Then** an entry is added to the leaderboard with:
- carId, trackId
- totalTime, bestLapTime
- wallHits, topSpeed
- date (ISO string)

**Given** a new entry is added
**When** the leaderboard is updated
**Then** the entry is inserted into the track's leaderboard
**And** entries are sorted by totalTime (ascending)
**And** only top 10 entries per track are kept
**And** the entry is added to the overall leaderboard
**And** only top 20 overall entries are kept

**Given** the leaderboard is stored
**When** data persists
**Then** it is saved to localStorage (ocbp-leaderboard key)
**And** data survives page reloads

**Given** the player wants to clear leaderboards
**When** clearLeaderboard() is called
**Then** all track and overall entries are removed
**And** localStorage is updated
