---
id: 1-3-track-system
epic: 1
title: Track System
status: done
frs:
  - FR3
---

# Story 1.3: Track System

As a **player**,
I want **to race on a track with defined boundaries, checkpoints, and terrain decorations**,
So that **I can complete laps in an immersive environment**.

**Acceptance Criteria:**

**Given** a track is selected
**When** the race loads
**Then** a procedural road mesh is generated from Catmull-Rom spline control points
**And** road width is 12m (standard)
**And** road has 200 divisions (segments)
**And** road material is MeshStandardMaterial (#333333, rough 0.9)

**Given** the track is generated
**When** barriers are placed
**Then** barriers line both sides of the track
**And** barrier height is 1.0m, offset 0.5m from road edge
**And** visual barriers are W-beam mesh strips
**And** collision barriers are box colliders (0.5 × 0.5 × segmentLength/2)
**And** barriers are fixed (static) rigid bodies

**Given** the track has checkpoints
**When** checkpoints are configured
**Then** checkpoint count varies per track (8-14, evenly spaced)
**And** trigger radius is 20m
**And** checkpoints must be passed in order (0 → 1 → ... → N-1 → 0)

**Given** the car crosses a checkpoint
**When** the checkpoint is the next in sequence
**Then** the checkpoint is marked as passed
**And** when checkpoint 0 is passed after checkpoint N-1: lap increments

**Given** the car drives backward
**When** velocity direction opposes track tangent
**Then** wrong way detection triggers: dot(velocityDir, trackTangent) < -0.5
**And** "WRONG WAY" pulsing text appears
**And** wrong way ignored when car is reversing (forwardSpeed < 0)
**And** wrong way ignored when speed < 0.5 m/s

**Given** the track is loaded
**When** start positions are configured
**Then** grid layout is 2×2 staggered (4 cars)
**And** grid spacing is 5m between rows, 2.5m between columns
**And** pole position is at t = 0 on spline (start/finish)
**And** start direction follows initial tangent of spline

**Given** the track is loaded
**When** decorations are placed
**Then** terrain-appropriate decorations appear (urban: buildings, mountain: trees, coastal: palm trees, industrial: warehouses)
**And** street lights are placed along spline at evenly spaced points
**And** street lights are 7m tall with emissive warm orange bulbs (#ffcc88)

**Given** the ground plane is rendered
**When** the track loads
**Then** a 400×400 ground plane is placed at y = -0.01
**And** PBR ground textures are applied per terrain type (ambientCG CC0)
**And** textures tiled at 40×40 repeat on 1K map
**And** falls back to procedural canvas textures if PBR fails

**Given** 6 tracks are defined
**When** track selection is available
**Then** Midnight Circuit (Easy, 0.22km, Urban, Night, Clear, 8 checkpoints)
**And** Sunset Boulevard (Medium, 0.45km, Coastal, Dusk, Clear, 10 checkpoints)
**And** Thunder Ridge (Hard, 0.70km, Mountain, Day, Clear, 12 checkpoints)
**And** Neon District (Expert, 0.55km, Urban, Night, Rain, 12 checkpoints)
**And** Iron Circuit (Expert, 0.85km, Industrial, Dawn, Fog, 14 checkpoints)
**And** Typhoon Pass (Hard, 0.65km, Mountain, Day, Rain, 12 checkpoints)
