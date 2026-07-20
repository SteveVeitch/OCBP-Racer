---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories"]
inputDocuments:
  - _bmad-output/planning-artifacts/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/epics.md
---

# OCBP Racer - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for OCBP Racer, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Single-player racing against AI opponents on closed circuits
FR2: Car selection from 4 distinct cars (Rossini 488, Weissach GT3, Kaiju GT-R, Stingray Z06)
FR3: Track selection from 6 tracks with distinct themes and difficulty
FR4: Race structure: 3 laps, configurable post-MVP
FR5: Scoring system: 10/7/5/2 points for 1st/2nd/3rd/4th
FR6: Demo/attract mode after 1 minute idle on main menu
FR7: Weather override per race (Auto, Clear, Rain, Fog, Storm)
FR8: Time-of-day override per race (Auto, Dawn, Day, Dusk, Night)
FR9: AI difficulty override (Easy, Normal, Hard, Expert)
FR10: Leaderboard tracking per-track and overall (best times, wall hits, top speed)
FR11: 5 camera views (Chase, Cockpit, Windscreen, Hood, Bumper)
FR12: Rebindable controls for keyboard and gamepad
FR13: Procedural audio synthesis (engine, turbo, exhaust, tire, wind, collision, UI)
FR14: Settings persistence to localStorage
FR15: Wall hit tracking (cleanest metric)
FR16: Top speed tracking per race
FR17: Car preview with 3D rotating model and spec card
FR18: Pause menu with resume, settings, restart, quit options
FR19: Race results with position, points, times, wall hits, top speed

### NonFunctional Requirements

NFR1: 60 FPS frame rate target at 1920x1080
NFR2: < 5 seconds load time
NFR3: Browser support: Chrome, Firefox, Edge, Safari (latest 2 versions)
NFR4: Semi-realistic PBR rendering with dynamic time-of-day lighting
NFR5: Weather effects (rain, fog, storm)
NFR6: Performance budget: <200 draw calls, <500K triangles, <512MB texture memory
NFR7: JavaScript bundle < 2MB gzipped
NFR8: Graceful WebGL2 fallback message
NFR9: NaN guard in car physics (reset position/velocity)
NFR10: Gamepad disconnect handling (fallback to keyboard)

### Additional Requirements

AR1: TypeScript 7.x for type safety and developer experience
AR2: Three.js r185+ for WebGL2 3D rendering
AR3: Rapier.js 0.19.3 for WASM-accelerated rigid body physics
AR4: Vite 5.4 for dev server, bundling, HMR
AR5: Fixed timestep physics at 120 Hz with accumulator pattern
AR6: State machine: MENU → CAR_SELECT → TRACK_SELECT → COUNTDOWN → RACING → RESULTS → MENU
AR7: Entity model: PlayerCar, AICars[], Track, Environment, Camera, Particles
AR8: Frame time capping at 0.1s to prevent spiral of death
AR9: Standalone build with serve.bat for offline distribution
AR10: Test harness: 85 tests across 19 phases accessible via ?test query param

### UX Design Requirements

UX-DR1: HTML/CSS overlay UI on top of Three.js canvas (no canvas-based UI)
UX-DR2: Loading screen with CSS-only spinner animation and fade-out transition
UX-DR3: Main Menu with OCBP RACER title, Start Race button, Settings button
UX-DR4: Car Select screen with 3D thumbnails, engine badges, stat bars (Power, Grip, Speed, Drift)
UX-DR5: Car Preview screen with rotating 3D model, spec card, Back/Continue buttons
UX-DR6: Track Select screen with 3-column grid, difficulty badges, weather/time-of-day overrides
UX-DR7: Countdown screen with 3-2-1-GO! sequence (1 second per number)
UX-DR8: In-Race HUD with analog gauges (speedometer, rev counter, turbo boost), lap counter, position, mini-map
UX-DR9: Pause Menu with Resume, Settings, Restart, Quit options and semi-transparent overlay
UX-DR10: Race Results screen with position (gold), points, times, wall hits, top speed
UX-DR11: Leaderboard screen with vertical tabs (per-track + overall), top 10 entries per track
UX-DR12: Settings menu with two-column layout (Audio/Graphics + Controls with Keyboard/Gamepad tabs)
UX-DR13: Mini-map with track outline, player (green dot), AI positions (red dots)
UX-DR14: Responsive design with scale factor (0.5-1.0) for 1280x720 minimum
UX-DR15: Arcade styling with neon green (#00ff88) primary, hot pink secondary, gold accent
UX-DR16: Gamepad navigation with .gp-focus green outline (2px solid #00ff88)
UX-DR17: Button styling: Rajdhani font, 22px, uppercase, 3px letter spacing, primary = green
UX-DR18: Screen transitions: Fade in 0.3s, button hover scale 1.02x, press scale 0.98x

### FR Coverage Map

FR1: Epic 1 - Single-player racing against AI
FR2: Epic 1 - Car selection from 4 cars
FR3: Epic 1 - Track selection from 6 tracks
FR4: Epic 1 - Race structure (3 laps)
FR5: Epic 1 - Scoring system
FR6: Epic 9 - Demo/attract mode
FR7: Epic 3 - Weather override
FR8: Epic 3 - Time-of-day override
FR9: Epic 3 - AI difficulty override
FR10: Epic 8 - Leaderboard tracking
FR11: Epic 4 - 5 camera views
FR12: Epic 6 - Rebindable controls
FR13: Epic 5 - Procedural audio
FR14: Epic 7 - Settings persistence
FR15: Epic 8 - Wall hit tracking
FR16: Epic 8 - Top speed tracking
FR17: Epic 2 - Car preview with 3D model
FR18: Epic 7 - Pause menu
FR19: Epic 1 - Race results

## Epic List

### Epic 1: Core Racing Experience
Users can select a car, select a track, race against AI, and see results
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR19

### Epic 2: Car Showcase
Users can preview cars with 3D rotating models and detailed specifications
**FRs covered:** FR17

### Epic 3: Race Customization
Users can customize weather, time-of-day, and AI difficulty per race
**FRs covered:** FR7, FR8, FR9

### Epic 4: Immersive Cameras
Users can switch between 5 camera views during racing
**FRs covered:** FR11

### Epic 5: Dynamic Audio
Users experience procedural audio that responds to car behavior
**FRs covered:** FR13

### Epic 6: Personalized Controls
Users can rebind controls for keyboard and gamepad
**FRs covered:** FR12

### Epic 7: Settings & Preferences
Users can configure and save their preferences between sessions
**FRs covered:** FR14, FR18

### Epic 8: Performance Leaderboards
Users can track and compare their best times, wall hits, and top speeds
**FRs covered:** FR10, FR15, FR16

### Epic 9: Demo Showcase
Game demonstrates itself when idle (attract mode)
**FRs covered:** FR6

---

## Epic 1: Core Racing Experience

Users can select a car, select a track, race against AI, and see results

### Story 1.1: Project Foundation

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

### Story 1.2: Car Physics

As a **player**,
I want **my car to accelerate, brake, and steer with arcade-sim hybrid handling**,
So that **I can drive around the track with authentic but accessible physics**.

**Acceptance Criteria:**

**Given** a car is on a flat surface
**When** the player applies throttle
**Then** engine force is applied as impulse (N·s per step)
**And** force = ThrottlePercent × EngineForce × ForceMultiplier × TurboBoost
**And** ForceMultiplier = max(0, 1 - speedRatio × 0.9) (diminishes near top speed)
**And** throttle ramps up linearly from 0→1 at 2.5/sec (0-1 in ~0.4s)
**And** throttle decays from 1→0 at 4.0/sec when released

**Given** the car is moving
**When** the player applies brake
**Then** if forwardSpeed > 1.0 m/s: brake force applies opposite to velocity
**And** brake force scales with speed: full force above 36 km/h, 30% at very low speed
**And** if forwardSpeed ≤ 1.0 m/s: reverse force applies at 40% engine force
**And** reverse speed capped at 35% of maxSpeed

**Given** the car is moving
**When** the player steers left/right
**Then** car rotates around Y-axis (direct rotation, not torque)
**And** steering is speed-dependent: reduced at low speed (< 3 m/s) and high speed
**And** HighSpeedFactor = 1 / (1 + speed × 0.03)
**And** angular velocity is NOT zeroed (car sustains yaw through corners)
**And** steering direction flips when reversing

**Given** the car is sliding
**When** slip angle increases
**Then** grip follows response curve: increases to peakGrip at slipAnglePeak, then decreases to 0 at slipAngleLimit
**And** lateral force = gripCoeff × mass × 0.001 × speedGripScale × gripMultiplier
**And** grip reduces at high speed (speedGripScale = 1 / (1 + speed × 0.02))

**Given** the car applies throttle while sliding
**When** slip angle > 0
**Then** throttle direction blends toward velocity direction
**And** slipBlendFactor = min(slipAngle / 15, 1) × 0.3 (max 30% blend)
**And** enables power oversteer (rear steps out under throttle)

**Given** a turbocharged car (Rossini 488 or Kaiju GT-R)
**When** throttle is applied
**Then** boostLevel = clamp(timeSinceThrottleOn / turboLagTime, 0, 1)
**And** effectiveEngineForce = engineForce × (0.6 + 0.4 × boostLevel)
**And** Rossini lag: 0.15s, Kaiju lag: 0.25s
**And** NA cars (Weissach, Stingray) have instant response (turboLagTime = 0)

**Given** the car's speed is calculated
**When** the physics updates
**Then** RPM = 800 + min(1, speedRatio) × 6700
**And** speedRatio = currentSpeed (m/s) / (maxSpeed / 3.6)

**Given** the car goes airborne or physics explodes
**When** position contains NaN values
**Then** position resets to (0, 0.5, 0)
**And** velocity and angular velocity are zeroed

**Given** the car body is configured
**When** physics initializes
**Then** mass is set per car config (1250-1550 kg)
**And** linear damping = 1.0
**And** angular damping = 2.0 (allows natural yaw)
**And** ground enforced: car snapped to y = 0.5 each tick

### Story 1.3: Track System

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

### Story 1.4: AI Opponents

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

### Story 1.5: Race Flow

As a **player**,
I want **a complete race from countdown to results with proper pause handling**,
So that **I can experience a full racing session that respects my time**.

**Acceptance Criteria:**

**Given** the player starts a race
**When** the race loads
**Then** a countdown displays: 3 → 2 → 1 → GO!
**And** each number appears for 1 second
**And** GO! is gold/yellow, slightly smaller (120px vs 180px)
**And** input is locked during countdown
**And** cars cannot move until GO!

**Given** the countdown is active
**When** the player pauses
**Then** the countdown pauses
**And** game state transitions to PAUSED
**And** input blocked except menu navigation

**Given** the race is in progress
**When** the player completes a lap
**Then** the lap counter increments
**And** best lap time is tracked
**And** lap counter is 0-indexed internally, displayed as 1-indexed

**Given** the race is in progress
**When** the player's position changes
**Then** the position indicator updates
**And** scoring reflects current position (10/7/5/2 points for 1st/2nd/3rd/4th)

**Given** all laps are completed
**When** the race ends
**Then** the game transitions to RESULTS state

**Given** the browser tab becomes hidden
**When** visibilitychange event fires
**Then** the game auto-pauses
**And** physics stops running while tab is backgrounded

**Given** the game is paused
**When** the player resumes
**Then** state returns to previous state (RACING or COUNTDOWN)
**And** input buffer is cleared (prevents stale inputs)

### Story 1.6: Menu & Selection UI

As a **player**,
I want **to navigate menus and select my car and track with proper filtering**,
So that **I can customize my race before starting**.

**Acceptance Criteria:**

**Given** the game loads
**When** the main menu appears
**Then** the title "OCBP RACER" displays with neon green styling
**And** "Start Race" and "Settings" buttons are visible
**And** keyboard and gamepad can navigate
**And** gamepad items show .gp-focus green outline (2px solid #00ff88)

**Given** the player selects "Start Race"
**When** the car select screen appears
**Then** 4 car cards display with 3D thumbnails
**And** each card shows car name, subtitle, engine badge (no TURBO indicator)
**And** each card shows 4 stat bars: Power, Grip, Speed, Drift
**And** stat bars calibrated: highest car fills ~85%, others proportional
**And** selected car has green border + glow

**Given** a car is selected
**When** the car preview appears
**Then** a 3D model renders in dedicated preview scene (off-white background)
**And** camera orbits at 30° elevation, auto-rotates CW
**And** mouse drag rotates manually (3s resume timeout)
**And** scroll zooms in/out (min 3, max 12)
**And** spec box shows full car details with arcade styling
**And** engine info shown inline without TURBO badge
**And** Back/Continue buttons navigate

**Given** the player continues to track select
**When** the track select screen appears
**Then** 6 track cards display in a 3-column grid
**And** each card shows name, difficulty badge, distance, terrain icon
**And** each card shows default time-of-day and weather
**And** selected track has green border

**Given** the release channel is set to Green
**When** car and track select load
**Then** only released cars and tracks appear (Rossini 488, Midnight Circuit)

**Given** the release channel is set to Blue
**When** car and track select load
**Then** all cars and tracks appear

**Given** the track select is shown
**When** weather override is available
**Then** options: Auto, Clear, Rain, Fog, Storm
**And** default is Auto (uses track default)
**And** persisted to localStorage

**Given** the track select is shown
**When** time-of-day override is available
**Then** options: Auto, Dawn, Day, Dusk, Night
**And** default is Auto (uses track default)
**And** persisted to localStorage

**Given** the track select is shown
**When** AI difficulty override is available
**Then** options: Easy, Normal, Hard, Expert (default: Normal)
**And** persisted to localStorage

**Given** the UI is styled
**When** any screen renders
**Then** fonts use Rajdhani (Google Fonts), system-ui fallback
**And** primary color is #00ff88 (neon green)
**And** secondary color is #ff3366 (hot pink)
**And** accent is #ffcc00 (gold)
**And** backgrounds are rgba(10, 10, 26, 0.92)
**And** buttons are 22px, uppercase, 3px letter spacing
**And** screen transitions fade in 0.3s
**And** button hover scales 1.02x, press scales 0.98x

### Story 1.7: Race Results

As a **player**,
I want **to see my race performance after finishing**,
So that **I can understand how well I did**.

**Acceptance Criteria:**

**Given** the race ends
**When** the results screen appears
**Then** the final position displays (1st, 2nd, 3rd, 4th) in gold, 96px font
**And** points earned display (10/7/5/2)

**Given** the results screen is shown
**When** the player views results
**Then** total race time displays (format: M:SS.mmm)
**And** best lap time displays
**And** wall hits count displays
**And** top speed reached displays (in current speed unit)

**Given** the results screen is shown
**When** the player selects "Race Again"
**Then** the same race restarts

**Given** the results screen is shown
**When** the player selects "Main Menu"
**Then** the game returns to the main menu

### Story 1.8: In-Race HUD

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

---

## Epic 2: Car Showcase

Users can preview cars with 3D rotating models and detailed specifications

### Story 2.1: Car Preview Scene

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

### Story 2.2: Car Spec Card

As a **player**,
I want **to see detailed car specifications alongside the 3D preview**,
So that **I can compare car performance before choosing**.

**Acceptance Criteria:**

**Given** the car preview is active
**When** the spec card renders
**Then** a semi-transparent panel appears on the right side (400px width, max 40%)
**And** the panel shows car name (36px, Rajdhani, uppercase)
**And** the panel shows car subtitle (14px, dim text)
**And** the panel shows engine info (displacement, type, horsepower)

**Given** the spec card is displayed
**When** performance stats render
**Then** 4 stat bars display: Power, Grip, Speed, Drift
**And** each bar is 180px wide with green fill
**And** values are calibrated: highest car fills ~85%, others proportional
**And** stat row shows label on left, bar on right

**Given** the spec card is displayed
**When** additional details render
**Then** top speed shows (converted to current speed unit)
**And** power-to-weight ratio shows (engineForce / mass, formatted as "X.XX g")
**And** details section has top border separator

**Given** the spec card is displayed
**When** navigation buttons render
**Then** "Back" button returns to car select
**And** "Continue" button proceeds to track select
**And** hint text shows "Drag to rotate • Scroll to zoom"

**Given** the car preview is active
**When** the player navigates back
**Then** the preview scene is cleaned up (mesh removed from scene)
**And** state transitions to CAR_SELECT

---

## Epic 3: Race Customization

Users can customize weather, time-of-day, and AI difficulty per race

### Story 3.1: Weather Override

As a **player**,
I want **to choose weather conditions before each race**,
So that **I can experience different driving challenges**.

**Acceptance Criteria:**

**Given** the track select screen is displayed
**When** weather override options appear
**Then** 5 options display: Auto, Clear, Rain, Fog, Storm
**And** default is Auto (uses track's default weather)
**And** selected option has green border and glow
**And** options are styled as buttons (14px, Rajdhani, uppercase)

**Given** the player selects a weather option
**When** the selection is made
**Then** the setting is saved to localStorage (GameSettings.weatherOverride)
**And** the setting persists between sessions
**And** the override applies when the race starts

**Given** a weather override is set to Auto
**When** the race loads
**Then** the track's default weather is used (e.g., Midnight Circuit = Clear)
**And** weather presets apply correct rain intensity, fog density, storm effects

### Story 3.2: Time-of-Day Override

As a **player**,
I want **to choose the time of day before each race**,
So that **I can race under different lighting conditions**.

**Acceptance Criteria:**

**Given** the track select screen is displayed
**When** time-of-day override options appear
**Then** 5 options display: Auto, Dawn, Day, Dusk, Night
**And** default is Auto (uses track's default TOD)
**And** selected option has green border and glow

**Given** the player selects a TOD option
**When** the selection is made
**Then** the setting is saved to localStorage (GameSettings.todOverride)
**And** the setting persists between sessions
**And** the override applies when the race starts

**Given** a TOD override is set
**When** the race loads
**Then** lighting presets apply (ambient color/intensity, directional color/intensity)
**And** HDR environment map switches to matching time period
**And** street lights activate for night/dusk/dawn

### Story 3.3: AI Difficulty Override

As a **player**,
I want **to choose AI difficulty before each race**,
So that **I can adjust the challenge level**.

**Acceptance Criteria:**

**Given** the track select screen is displayed
**When** AI difficulty options appear
**Then** 4 options display: Easy, Normal, Hard, Expert
**And** each option has a distinct color (green, yellow, orange, pink)
**And** default is Normal
**And** selected option has green border and glow

**Given** the player selects an AI difficulty
**When** the selection is made
**Then** the setting is saved to localStorage (GameSettings.aiDifficulty)
**And** the setting persists between sessions
**And** AI controllers use the selected difficulty profile

**Given** Easy difficulty is selected
**When** AI controllers initialize
**Then** speedMultiplier = 0.55, aggressiveness = 0.15
**And** recoveryTimeout = 8.0s, steerSmoothing = 0.15

**Given** Normal difficulty is selected
**When** AI controllers initialize
**Then** speedMultiplier = 0.75, aggressiveness = 0.4
**And** recoveryTimeout = 5.0s, steerSmoothing = 0.08

**Given** Hard difficulty is selected
**When** AI controllers initialize
**Then** speedMultiplier = 0.92, aggressiveness = 0.7
**And** recoveryTimeout = 3.0s, steerSmoothing = 0.04

**Given** Expert difficulty is selected
**When** AI controllers initialize
**Then** speedMultiplier = 1.0, aggressiveness = 0.9
**And** recoveryTimeout = 2.0s, steerSmoothing = 0.02

---

## Epic 4: Immersive Cameras

Users can switch between 5 camera views during racing

### Story 4.1: Camera Views

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

### Story 4.2: Camera Settings

As a **player**,
I want **to set my preferred default camera view**,
So that **races start with my favorite perspective**.

**Acceptance Criteria:**

**Given** the settings menu is displayed
**When** camera default options appear
**Then** 5 options display: Chase, Cockpit, Windscreen, Hood, Bumper
**And** default is Chase
**And** selected option has green border

**Given** the player selects a camera default
**When** the setting is saved
**Then** it persists to localStorage (GameSettings.cameraDefault)
**And** the selected camera is applied when the race starts
**And** the setting applies immediately via cameraController.setView()

---

## Epic 5: Dynamic Audio

Users experience procedural audio that responds to car behavior

### Story 5.1: Procedural Engine Audio

As a **player**,
I want **engine sounds that respond to RPM and throttle**,
So that **I feel connected to the car's performance**.

**Acceptance Criteria:**

**Given** a race starts
**When** audio initializes
**Then** two oscillators create the engine sound (primary + secondary)
**And** primary oscillator uses car's primaryWaveform (sawtooth/square/triangle/sine)
**And** secondary oscillator uses car's secondaryWaveform at 0.5× base frequency
**And** frequencies scale from baseFrequency to maxFrequency based on RPM ratio

**Given** the engine audio is playing
**When** RPM changes
**Then** primary frequency = baseFreq + rpmRatio × (maxFreq - baseFreq)
**And** secondary frequency = primaryFreq × 0.5
**And** volume scales: 0.7 + rpmRatio × 0.3
**And** lowpass filter frequency = 600 + rpmRatio × 1400 Hz

**Given** the engine is at high RPM (> 92%)
**When** redline is approached
**Then** frequency wobble adds 3Hz oscillation (overrev effect)
**And** primary/secondary gain crossfades (0.7→0.4 primary, 0.3→0.6 secondary)

**Given** a turbo car is selected
**When** boost builds
**Then** turbo whistle oscillator (sine, 2000-4000Hz) plays
**And** whistle volume = boostLevel × 0.15
**And** LFO modulates whistle frequency (6Hz, ±200Hz)

**Given** the player lifts off throttle at high boost
**When** boostLevel > 0.3
**Then** turbo flutter plays (noise burst, bandpass 2000-3000Hz, 0.4s decay)
**And** flutter has LFO modulation (20-30Hz, ±500Hz)

**Given** the player lifts off throttle at high RPM
**When** rpmRatio > 0.4
**Then** exhaust pop plays (square wave, 200-500Hz, 0.05s decay)
**And** 1-2 pops per event, spaced 0.04s apart

### Story 5.2: Tire & Wind Audio

As a **player**,
I want **tire screech and wind sounds that match driving conditions**,
So that **I hear realistic environmental feedback**.

**Acceptance Criteria:**

**Given** the car is sliding
**When** slip angle > 5 and grip < 80% of peak
**Then** tire screech plays (filtered noise, bandpass 1500-3000Hz)
**And** screech intensity = min(1, (slipAngle - 5) / 15) × 0.4
**And** screech frequency = 1500 + intensity × 1500 Hz

**Given** the car is moving at speed
**When** speed increases
**Then** wind noise volume = min(0.15, speed / 200)
**And** wind filter frequency = 200 + (speed / 250) × 600 Hz

**Given** the car collides
**When** collision is detected
**Then** collision sound plays (sine 100-150Hz + noise burst, 0.2s decay)
**And** collision volume = 0.3 × masterVolume

### Story 5.3: UI & Effects Audio

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

---

## Epic 6: Personalized Controls

Users can rebind controls for keyboard and gamepad

### Story 6.1: Keyboard Rebinding

As a **player**,
I want **to customize my keyboard controls**,
So that **I can use my preferred key layout**.

**Acceptance Criteria:**

**Given** the settings menu is displayed
**When** keyboard controls section appears
**Then** 8 actions display: Throttle, Brake, Steer Left, Steer Right, Pause, Confirm, Back, Camera Switch
**And** each action shows current key binding(s)
**And** each action has a "Rebind" button

**Given** the player clicks "Rebind" for an action
**When** listening mode activates
**Then** the next key pressed becomes the new binding
**And** the binding is saved to localStorage (ocbp-bindings)
**And** conflicting bindings are automatically swapped

**Given** a new key binding is set
**When** the key conflicts with another action
**Then** the conflicting action loses that key
**And** the conflicting action falls back to its first default key
**And** the conflict handler logs the reset action

**Given** the player wants to reset bindings
**When** "Reset Defaults" is clicked
**Then** all keyboard bindings restore to defaults:
- Throttle: KeyW, ArrowUp
- Brake: KeyS, ArrowDown
- Steer Left: KeyA, ArrowLeft
- Steer Right: KeyD, ArrowRight
- Pause: Escape
- Confirm: Enter, Space
- Back: Escape
- Camera Switch: KeyC

### Story 6.2: Gamepad Support

As a **player**,
I want **to use a gamepad with rebindable controls**,
So that **I have a console-like racing experience**.

**Acceptance Criteria:**

**Given** a gamepad is connected
**When** the gamepadconnected event fires
**Then** the gamepad index is stored
**And** gamepad input is polled each frame
**And** gamepad state is merged with keyboard state (OR logic)

**Given** a gamepad is disconnected
**When** the gamepaddisconnected event fires
**Then** the gamepad index is cleared
**And** keyboard input becomes the sole source
**And** the game continues without interruption

**Given** the settings menu is displayed
**When** gamepad controls section appears
**Then** 8 actions display with current gamepad bindings
**And** each action shows binding type (button/axis) and index
**And** each action has a "Rebind" button

**Given** the player clicks "Rebind" for a gamepad action
**When** listening mode activates
**Then** the next button press or axis movement is captured
**And** axis bindings include direction (positive/negative)
**And** the binding is saved to localStorage (ocbp-gamepad-bindings)
**And** conflicting bindings are automatically swapped

**Given** a gamepad axis is used for steering
**When** raw axis value is read
**Then** dead zone of 0.15 is applied
**And** steer curve is applied (exponent 1.4 for fine control at low values)
**And** dead zone remapping: output = (input - deadZone) / (1 - deadZone)

**Given** the player navigates menus with gamepad
**When** D-pad or stick input is detected
**Then** focus moves between focusable elements
**And** focused element shows .gp-focus green outline
**And** confirm button clicks the focused element
**And** back button navigates to previous screen

---

## Epic 7: Settings & Preferences

Users can configure and save their preferences between sessions

### Story 7.1: Settings Menu

As a **player**,
I want **to configure audio, graphics, and control settings**,
So that **the game behaves according to my preferences**.

**Acceptance Criteria:**

**Given** the player opens settings from main menu or pause menu
**When** the settings screen appears
**Then** a two-column layout displays (Audio/Graphics left, Controls right)
**And** the panel has dark background with slide-up animation (0.3s)

**Given** the Audio/Graphics column is displayed
**When** settings render
**Then** Master Volume slider (0-1, step 0.01)
**And** Engine Volume slider (0-1, step 0.01)
**And** Steer Sensitivity slider (0-2, step 0.05)
**And** Speed Unit toggle (MPH / KPH)
**And** Graphics Quality toggle (Low / Medium / High)
**And** Camera Default toggle (Chase / Cockpit / Windscreen / Hood / Bumper)
**And** Fog toggle (on/off)

**Given** the Controls column is displayed
**When** settings render
**Then** Keyboard tab with rebinding controls
**And** Gamepad tab with rebinding controls
**And** Reset Defaults button for each

**Given** the player adjusts a slider
**When** the value changes
**Then** the setting is immediately applied
**And** the setting is saved to localStorage

**Given** Graphics Quality is set to Low
**When** graphics apply
**Then** bloom is disabled
**And** pixel ratio is 1

**Given** Graphics Quality is set to Medium
**When** graphics apply
**Then** bloom strength = 0.35
**And** bloom resolution = half screen
**And** pixel ratio is 1

**Given** Graphics Quality is set to High
**When** graphics apply
**Then** bloom strength = 0.5
**And** bloom resolution = full screen
**And** pixel ratio = min(devicePixelRatio, 2)

### Story 7.2: Settings Persistence

As a **player**,
I want **my settings to persist between sessions**,
So that **I don't have to reconfigure every time**.

**Acceptance Criteria:**

**Given** any setting is changed
**When** the change is made
**Then** the setting is saved to localStorage (ocbp-settings key)
**And** the setting persists across page reloads

**Given** the game loads
**When** settings are initialized
**Then** saved settings are loaded from localStorage
**And** missing settings fall back to defaults:
- masterVolume: 1.0
- engineVolume: 1.0
- steerSensitivity: 1.0
- speedUnit: 'mph'
- graphicsQuality: 'high'
- cameraDefault: 'chase'
- fogEnabled: true
- weatherOverride: 'auto'
- todOverride: 'auto'
- aiDifficulty: 'normal'
- releaseChannel: 'blue'
- demoEnabled: true

### Story 7.3: Pause Menu

As a **player**,
I want **to pause the game and access options**,
So that **I can take a break or adjust settings mid-race**.

**Acceptance Criteria:**

**Given** the race is in progress
**When** the player presses Escape or gamepad Start
**Then** the game pauses (physics stops, state → PAUSED)
**And** a semi-transparent overlay appears (black, 70% opacity)
**And** "PAUSED" title displays (48px, Rajdhani, uppercase)

**Given** the pause menu is displayed
**When** options render
**Then** "Resume" button returns to previous state
**And** "Settings" button opens settings screen
**And** "Restart" button restarts the same race
**And** "Quit" button returns to main menu

**Given** the player pauses during countdown
**When** the game is paused
**Then** the countdown timer freezes
**And** resuming restores the countdown state

**Given** the browser tab becomes hidden
**When** visibilitychange fires
**Then** the game auto-pauses if race is active
**And** audio context suspends

**Given** the player resumes from pause
**When** Resume is selected
**Then** state returns to previous state (RACING or COUNTDOWN)
**And** input buffer is cleared (prevents stale inputs)
**And** audio context resumes

---

## Epic 8: Performance Leaderboards

Users can track and compare their best times, wall hits, and top speeds

### Story 8.1: Leaderboard Storage

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

### Story 8.2: Leaderboard UI

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

### Story 8.3: Race Metrics

As a **player**,
I want **wall hits and top speed tracked during races**,
So that **I can improve my driving precision**.

**Acceptance Criteria:**

**Given** the race is in progress
**When** the car's speed drops suddenly
**Then** wall hit is detected if speedDelta > 20 km/h and lastSpeed > 5 km/h
**And** wall hit counter increments
**And** collision sound plays
**And** 0.5s cooldown prevents multiple detections per impact

**Given** the race is in progress
**When** the car reaches a new top speed
**Then** topSpeed updates if currentSpeed > topSpeed
**And** topSpeed is displayed on the results screen

**Given** the race ends
**When** results display
**Then** wall hits count shows
**And** top speed shows (in current speed unit)
**And** both metrics are saved to the leaderboard entry

---

## Epic 9: Demo Showcase

Game demonstrates itself when idle (attract mode)

### Story 9.1: Demo Mode

As a **player**,
I want **the game to showcase itself when I'm away**,
So that **I can see gameplay before deciding to play**.

**Acceptance Criteria:**

**Given** the game is on the main menu
**When** the idle timer reaches 60 seconds (1 minute)
**Then** demo mode activates automatically
**And** a random car is selected (from all available cars)
**And** a random track is selected (from all available tracks)
**And** random weather is selected (clear, rain, fog, storm)
**And** random TOD is selected (dawn, day, dusk, night)

**Given** demo mode activates
**When** the demo starts
**Then** a single AI car spawns with 'easy' difficulty
**And** the car drives autonomously around the track
**And** the camera follows in chase view
**And** the demo renders with full environment (weather, lighting, particles)

**Given** demo mode is active
**When** the game loop runs
**Then** physics updates for the AI car each frame
**And** weather particles update based on selected weather
**And** tire smoke emits when AI drifts

**Given** the player interacts during demo
**When** any key is pressed or gamepad button/axis is active
**Then** demo mode exits immediately
**And** the game returns to the main menu
**And** the idle timer resets

### Story 9.2: Demo HUD

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

### Story 9.3: Demo Activity Tracking

As a **player**,
I want **the idle timer to reset when I interact**,
So that **demo doesn't start while I'm actively using the game**.

**Acceptance Criteria:**

**Given** the game is on the main menu
**When** keyboard, mouse, or touch input is detected
**Then** the idle timer resets to 0
**And** demo mode does not activate

**Given** the game is on the main menu
**When** gamepad input is detected
**Then** the idle timer resets to 0
**And** demo mode does not activate

**Given** the idle timer is tracking
**When** the user returns to the main menu after a race
**Then** the idle timer resets to 0
**And** demo mode waits another 180 seconds

**Given** demo mode is active
**When** the player presses any key or gamepad button
**Then** demo exits and returns to main menu
**And** the idle timer resets
