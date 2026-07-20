---
id: 1-4-ai-opponents
epic: 1
title: AI Opponents
status: done
frs:
  - FR1
---

# Story 1.4: AI Opponents

As a **player**,
I want **to race against AI-controlled opponents with realistic behavior**,
So that **I have competitive racing without other humans**.

**Acceptance Criteria:**

**Given** a race starts
**When** AI cars are spawned
**Then** 3 AI opponents appear on the track
**And** each AI uses the same physics model as the player car
**And** AI controllers receive allCars reference for avoidance awareness

**Given** the AI is in STARTING state
**When** the race begins
**Then** throttle ramps up over 1.5 seconds (0 → full)
**And** maximum throttle capped at 70% during first 2 seconds
**And** slight random delay per AI (0.2s–0.8s) before acceleration
**And** close-range avoidance: raycast in 6m forward cone
**And** if car within cone, apply braking proportional to closeness

**Given** the AI is in RACING state
**When** the race is in progress
**Then** AI tracks a target point on spline with lookAheadDistance
**And** steering via cross product of forward vector and direction to target
**And** speed modulated based on upcoming corner severity
**And** proximity scan: check all other car positions each frame
**And** if car within 5m and roughly ahead, steer toward open side
**And** throttle reduced by up to 40% based on proximity

**Given** the AI is in RECOVERING state
**When** collision or loss of control detected
**Then** throttle cut to 0 for first 0.5s
**And** steer away from nearest obstacle
**And** realign with track spline once speed is low and obstacles clear
**And** gradual throttle re-application when aligned within 30° of track tangent
**And** transition back to RACING when within 4m of racing line and facing within 30° of tangent

**Given** difficulty level is set
**When** Beginner is selected
**Then** aggressiveness = 0.3, corner slow-down = 0.6, avoidance radius = 7.0m
**And** throttle on straights = 0.7, steering precision = 0.6
**And** max speed fraction = 0.75

**Given** difficulty level is set
**When** Intermediate is selected
**Then** aggressiveness = 0.5, corner slow-down = 0.4, avoidance radius = 5.0m
**And** throttle on straights = 0.85, steering precision = 0.8
**And** max speed fraction = 0.85

**Given** difficulty level is set
**When** Advanced is selected
**Then** aggressiveness = 0.7, corner slow-down = 0.25, avoidance radius = 3.5m
**And** throttle on straights = 0.95, steering precision = 0.9
**And** max speed fraction = 0.92

**Given** difficulty level is set
**When** Pro is selected
**Then** aggressiveness = 0.9, corner slow-down = 0.1, avoidance radius = 2.0m
**And** throttle on straights = 1.0, steering precision = 1.0
**And** max speed fraction = 1.0

**Given** difficulty is persisted
**When** the player changes difficulty
**Then** setting is saved to localStorage as GameSettings.aiDifficulty
