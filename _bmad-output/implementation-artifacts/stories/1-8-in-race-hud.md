---
id: 1-8-in-race-hud
epic: 1
title: In-Race HUD
status: done
frs:
  - UX-DR8
  - UX-DR13
---

# Story 1.8: In-Race HUD

As a **player**,
I want **to see my speed, RPM, lap, position, and mini-map during the race**,
So that **I can monitor my performance in real-time**.

**Acceptance Criteria:**

**Given** the race is in progress
**When** the HUD renders
**Then** a speedometer gauge displays current speed (160px canvas, analog dial)
**And** sweep is 240° (7 o'clock to 3 o'clock)
**And** range is 0 to maxSpeed × 1.1
**And** major ticks every 20 units, minor ticks every 10
**And** needle is white, tapered, smooth animation
**And** center shows digital speed readout
**And** label shows "km/h" or "MPH" based on settings

**Given** the race is in progress
**When** the HUD renders
**Then** a rev counter gauge displays RPM (160px canvas)
**And** sweep is 300° (7 o'clock to 1 o'clock)
**And** range is 0 to per-car redline × 1.1
**And** redline zone shown in red arc
**And** center shows digital RPM readout

**Given** a turbo car is selected
**When** the HUD renders
**Then** a turbo boost gauge displays boost percentage (160px canvas)
**And** sweep is 300°
**And** boost zone (cyan/blue) above 75%
**And** boost rises with throttle, delayed by turboLagTime
**And** boost decays when off throttle

**Given** the HUD is displayed
**When** the race is in progress
**Then** lap counter shows "LAP X/3"
**And** timer shows current race time
**And** best time shows best lap (or "--:--.--")
**And** position indicator shows current position

**Given** the mini-map is active
**When** the race is in progress
**Then** track outline displays in top-right corner (120×120px)
**And** player position shows as green dot
**And** AI positions show as red dots
**And** start/finish line marker appears
**And** mini-map rotates to keep player at bottom center
**And** zoom level adjusts to show full track

**Given** the car is rendered
**When** materials are applied
**Then** car paint uses PBR (metalness 0.85, roughness 0.25, per-car color)
**And** car glass is transparent (opacity 0.7, metalness 0.9)
**And** dark parts use #111111 (roughness 0.8)
**And** wheels have tire (dark) and rim (silver) materials

**Given** the lighting is configured
**When** time-of-day is set
**Then** night: ambient #222244 (0.6), directional #4444ff (0.6)
**And** dawn: ambient #7a5a3a (0.11), directional #ffaa55 (0.22)
**And** day: ambient #aabbcc (0.18), directional #ffffff (0.38)
**And** dusk: ambient #774433 (0.11), directional #ff7733 (0.2)
**And** HDR environment maps loaded for skybox and IBL reflections

**Given** car lights are configured
**When** headlights are active (night/dusk/dawn)
**Then** 2 SpotLights per car (intensity 8, range 30, angle 0.4)
**And** headlight material emissive intensity = 1.5
**And** headlights OFF on day tracks

**Given** car lights are configured
**When** taillights are active
**Then** 2 PointLights per car (intensity 1.5, range 8)
**And** taillight material emissive intensity = 1.0

**Given** wheels are rendered
**When** the car moves
**Then** all 4 wheels spin based on forward speed
**And** front 2 wheels steer based on currentSteer angle
**And** body roll applied: lateralVelocity × rollFactor (clamped ±5°)

**Given** post-processing is configured
**When** the scene renders
**Then** bloom is applied (threshold 0.85, strength 0.6, radius 0.4)
**And** quality presets: Low (disabled), Medium (0.4, half res), High (0.6, full res)

**Given** particles are active
**When** the car drifts (lateral velocity > 2, speed > 5)
**Then** tire smoke emits (white/grey, semi-transparent Points)
**And** 50 max active particles, lifetime 0.5-1.0s

**Given** rain weather is active
**When** particles are rendered
**Then** 3000-instance InstancedMesh rain drops
**And** follows player position
**And** only active during rain/storm weather
