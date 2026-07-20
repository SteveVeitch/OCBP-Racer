---
id: 4-1-camera-views
epic: 4
title: Camera Views
status: done
frs:
  - FR11
---

# Story 4.1: Camera Views

As a **player**,
I want **to switch between different camera perspectives while racing**,
So that **I can experience the race from multiple viewpoints**.

**Acceptance Criteria:**

**Given** the race is in progress
**When** the player presses the camera switch button (KeyC or gamepad Y)
**Then** the camera cycles through: Chase → Cockpit → Windscreen → Hood → Bumper
**And** the transition is instant (no smooth interpolation between views)
**And** the camera velocity is zeroed on switch

**Given** the Chase camera is active
**When** the camera updates
**Then** distance = 6.0m behind, height = 2.5m
**And** lookAhead = 1.0m, baseFOV = 60°
**And** spring follow with stiffness 30.0, damping 0.95
**And** wall collision detection (raycast, 0.5m radius)

**Given** the Cockpit camera is active
**When** the camera updates
**Then** position is 0.45m behind car center, 0.95m height + car-specific offset
**And** car-specific offsets: Rossini 0.0, Weissach 0.2, Kaiju 0.2, Stingray 0.0
**And** camera near plane = 0.01 (prevents clipping)
**And** lookAhead = 0.0, baseFOV = 70°

**Given** the Windscreen camera is active
**When** the camera updates
**Then** distance = 0.3m, height = 1.2m, lookAhead = 2.0m
**And** baseFOV = 80°, fovRange = 5°

**Given** the Hood camera is active
**When** the camera updates
**Then** distance = 0.1m, height = 0.9m, lookAhead = 3.0m
**And** baseFOV = 72°, fovRange = 4°

**Given** the Bumper camera is active
**When** the camera updates
**Then** distance = 0.0m, height = 0.35m, lookAhead = 4.0m
**And** baseFOV = 85°, fovRange = 8°

**Given** any camera view is active
**When** speed changes
**Then** FOV scales from baseFOV to baseFOV + fovRange based on speed ratio
**And** FOV interpolation is smooth (0.05 lerp factor)
