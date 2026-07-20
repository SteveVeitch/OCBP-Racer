---
id: 1-1-project-foundation
epic: 1
title: Project Foundation
status: done
frs:
  - AR1
  - AR2
  - AR3
  - AR4
  - AR5
  - AR6
  - AR7
  - AR8
  - AR9
  - AR10
  - UX-DR1
  - UX-DR2
  - UX-DR15
  - UX-DR18
---

# Story 1.1: Project Foundation

As a **developer**,
I want **a properly initialized TypeScript project with Three.js, Rapier.js, Vite, and a basic game loop**,
So that **the foundation supports all future racing gameplay development**.

**Acceptance Criteria:**

**Given** the project repository
**When** a developer runs `npm install` and `npm run dev`
**Then** the Vite dev server starts on port 3000 with HMR
**And** the browser displays a WebGL2 canvas filling the viewport

**Given** the game loop is running
**When** a frame is rendered
**Then** the physics step runs at 120 Hz fixed timestep (8.33ms)
**And** the render step runs at variable timestep
**And** frame time is capped at 0.1s to prevent spiral of death
**And** physics accumulator pattern handles multiple steps per frame

**Given** the state machine is initialized
**When** the game loads
**Then** the state transitions through MENU → CAR_SELECT → TRACK_SELECT → COUNTDOWN → RACING → RESULTS → MENU
**And** each state renders its corresponding screen

**Given** the renderer is configured
**When** the scene renders
**Then** antialiasing is enabled
**And** shadow maps are enabled (PCFSoftShadowMap)
**And** tone mapping is ACESFilmicToneMapping
**And** output color space is SRGBColorSpace

**Given** fog is configured
**When** the scene renders
**Then** FogExp2 is applied with color #0d1520 and density 0.006
**And** fog can be toggled via settings
