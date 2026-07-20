---
id: 2-1-car-preview-scene
epic: 2
title: Car Preview Scene
status: done
frs:
  - FR17
  - UX-DR5
---

# Story 2.1: Car Preview Scene

As a **player**,
I want **to see a 3D rotating model of my selected car before racing**,
So that **I can appreciate the car's design and make an informed selection**.

**Acceptance Criteria:**

**Given** the player selects a car from the car select screen
**When** the car preview state activates
**Then** a dedicated preview scene renders with off-white background (#0d1520)
**And** the scene contains 3-point studio lighting (key, fill, rim)
**And** a circular ground plane is rendered at y = -0.01

**Given** the preview scene is active
**When** the car model loads
**Then** the GLTF model renders in the center of the preview scene
**And** the camera is positioned at 30° elevation
**And** the camera orbits clockwise at 0.4 rad/s

**Given** the player drags the mouse horizontally
**When** mouse movement is detected during preview
**Then** the car rotates manually (0.008 rad per pixel)
**And** auto-rotation pauses for 3 seconds after manual input
**And** auto-rotation resumes after timeout

**Given** the player scrolls the mouse wheel
**When** scroll input is detected during preview
**Then** zoom level adjusts (min 3, max 12)
**And** camera maintains 30° elevation at new radius

**Given** the preview scene renders
**When** post-processing is active
**Then** bloom is applied (threshold 0.85, strength 0.3, radius 0.7)
**And** the preview uses a separate EffectComposer from the main scene
