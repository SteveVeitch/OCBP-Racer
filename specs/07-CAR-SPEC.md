# OCBP Racer — Car Specification

## 1. Car Design Philosophy

- **4 cars**, each with a distinct personality inspired by real automotive archetypes
- All exotic sports car styling (no trucks, sedans, etc.)
- Visual variety through different colors, shapes, and handling
- Performance differences felt through handling, not just numbers
- Each car has a unique engine type that affects audio synthesis and turbo behavior

## 2. Car Roster

### 2.1 Rossini 488 — "The Prancing Horse"

**Style:** Italian Mid-Engine Exotic
**Personality:** Balanced, stable, forgiving
**Best For:** Beginners, consistent lap times
**Engine:** 3.9L Twin-Turbo Flat-Plane V8 (670 HP)
**Layout:** Mid-engine, rear-wheel drive

```
Visual Characteristics:
  - Rosso Corsa red (#dc143c)
  - Low, wide mid-engine profile
  - Aggressive front splitter
  - Large rear diffuser
  - Headlights and taillights

Handling Profile:
  - Moderate engine force (800 impulse)
  - Medium peak grip (1.9)
  - Good stability
  - Forgiving at the limit
  - Turbo lag: 0.15s (mild)
```

### 2.2 Weissach GT3 — "The Scalpel"

**Style:** German Track-Focused Sports
**Personality:** Precise, grippy, rewards skill
**Best For:** Experienced players, time trials
**Engine:** 4.0L Naturally Aspirated Flat-6 (503 HP)
**Layout:** Rear-engine, rear-wheel drive

```
Visual Characteristics:
  - Racing green (#1a5c1a)
  - Distinct rear-engine profile
  - Fixed rear wing
  - Aggressive front canards
  - Headlights and taillights

Handling Profile:
  - Highest grip (2.4)
  - Sharp steering (2.2 steer speed)
  - Low drift tendency
  - Punishes mistakes (tight limit)
  - No turbo (instant throttle response)
```

### 2.3 Kaiju GT-R — "The Monster"

**Style:** Japanese Turbocharged Super-GT
**Personality:** Loose, powerful, drift-happy
**Best For:** Players who like chaos, drift challenges
**Engine:** 3.8L Twin-Turbo V6 (600 HP)
**Layout:** Front-engine, all-wheel drive (AWD biased rear)

```
Visual Characteristics:
  - Midnight purple (#2d1b4e)
  - Wide-body fender flares
  - Large rear wing
  - Quad exhaust tips
  - Headlights and taillights

Handling Profile:
  - Highest engine force (950 impulse)
  - Lowest grip (1.6)
  - Loose rear end (oversteer bias)
  - Easiest to drift
  - Turbo lag: 0.25s (significant)
```

### 2.4 Stingray Z06 — "The American Blade"

**Style:** Lightweight American Mid-Engine Exotic
**Personality:** Agile, responsive, top speed focused
**Best For:** Speed demons, overtaking
**Engine:** 5.5L Naturally Aspirated Flat-Plane V8 (670 HP)
**Layout:** Mid-engine, rear-wheel drive

```
Visual Characteristics:
  - Arctic blue (#1155cc)
  - Sharp, angular mid-engine profile
  - Aggressive side intakes
  - Minimalist rear end
  - Headlights and taillights

Handling Profile:
  - Lightest car (1250 kg)
  - Fastest top speed (265 km/h)
  - Quick direction changes (2.5 steer speed)
  - Moderate grip (2.1)
  - No turbo (instant throttle response)
```

## 3. Tuning Parameters

### 3.1 Parameter Comparison Table

| Parameter | Rossini 488 | Weissach GT3 | Kaiju GT-R | Stingray Z06 |
|-----------|------------|-------------|------------|-------------|
| **Mass (kg)** | 1550 | 1400 | 1500 | 1250 |
| **Engine Force (impulse)** | 800 | 850 | 950 | 750 |
| **Brake Force (impulse)** | 2000 | 2200 | 1900 | 2400 |
| **Steer Speed** | 1.8 | 2.2 | 2.0 | 2.5 |
| **Max Steer (rad)** | 0.45 | 0.42 | 0.48 | 0.44 |
| **Max Speed (km/h)** | 235 | 245 | 250 | 265 |
| **Drag Coeff** | 1.5 | 1.4 | 1.6 | 1.3 |
| **Peak Grip** | 1.9 | 2.4 | 1.6 | 2.1 |
| **Downforce** | 1.2 | 1.8 | 0.8 | 1.5 |
| **Slip Angle Peak (°)** | 8 | 6 | 12 | 7 |
| **Slip Angle Limit (°)** | 25 | 20 | 35 | 22 |
| **Auto-Correct** | 0.4 | 0.6 | 0.2 | 0.5 |

### 3.2 Engine Specifications

| Car | Engine | Layout | Aspiration | HP | Torque | Redline |
|-----|--------|--------|------------|-----|--------|---------|
| Rossini 488 | 3.9L Flat-Plane V8 | Mid RWD | Twin-Turbo | 670 | 760 Nm | 8000 |
| Weissach GT3 | 4.0L Flat-6 | Rear RWD | Naturally Aspirated | 503 | 465 Nm | 9000 |
| Kaiju GT-R | 3.8L V6 | Front AWD | Twin-Turbo | 600 | 637 Nm | 7000 |
| Stingray Z06 | 5.5L Flat-Plane V8 | Mid RWD | Naturally Aspirated | 670 | 624 Nm | 8600 |

### 3.3 Turbo Lag Parameters

Turbocharged cars (Rossini 488, Kaiju GT-R) exhibit delayed power delivery:

```
Turbo Lag Time:      Seconds from throttle application to full boost
  Rossini 488:       0.15s (mild — small twin turbos, quick spool)
  Kaiju GT-R:        0.25s (significant — larger turbos, more lag)
  Weissach GT3:      0.00s (NA — instant response)
  Stingray Z06:      0.00s (NA — instant response)

Turbo Boost Model:
  boostLevel = clamp((timeSinceThrottleOn) / turboLagTime, 0, 1)
  effectiveEngineForce = engineForce × (0.6 + 0.4 × boostLevel)
  // At 0% boost: 60% power
  // At 100% boost: 100% power
```

### 3.4 Speed Categories

| Car | Top Speed | Reverse Speed |
|-----|-----------|---------------|
| Rossini 488 | 235 km/h | 82 km/h |
| Weissach GT3 | 245 km/h | 86 km/h |
| Kaiju GT-R | 250 km/h | 88 km/h |
| Stingray Z06 | 265 km/h | 93 km/h |

Reverse speed = 35% of max speed.

### 3.5 Handling Behavior Summary

| Behavior | Rossini 488 | Weissach GT3 | Kaiju GT-R | Stingray Z06 |
|----------|------------|-------------|------------|-------------|
| Understeer tendency | Medium | Low | High | Medium |
| Oversteer tendency | Low | Low | High | Medium |
| Drift ease | Medium | Hard | Easy | Medium |
| Stability | High | High | Low | Medium |
| Responsiveness | Medium | High | Low | High |
| Braking | Good | Very Good | Fair | Best |
| Throttle response | Slight lag | Instant | Notable lag | Instant |

## 4. Car Model Requirements

### 4.1 Geometry (Enhanced Procedural)
Each car has a **distinct procedural silhouette** — not the same box shape with different colors. All built from Three.js primitives (BoxGeometry, CylinderGeometry, LatheGeometry) with no external models.

### 4.2 Per-Car Mesh Profiles

#### Rossini 488 — Italian Mid-Engine
```
Lower Body:     Box (1.9 × 0.40 × 4.3) — low, wide stance
Hood:           Box (1.7 × 0.12 × 1.3) — sloped nose, offset +1.3z
Cabin:          Box (1.4 × 0.45 × 1.2) — compact greenhouse, offset +0.2z
Roof:           Box (1.3 × 0.06 × 0.9) — paint, offset 0z
Rear Deck:      Box (1.8 × 0.15 × 0.8) — engine cover, offset -1.2z
Front Splitter: Box (1.9 × 0.04 × 0.25) — dark, offset +2.2z
Side Intakes:   2× Box (0.1 × 0.15 × 0.6) — dark, offset ±0.95x, -0.3z
Rear Diffuser:  Box (1.7 × 0.08 × 0.3) — dark, offset -2.2z
Front Bumper:   Box (1.9 × 0.25 × 0.12) — grille, offset +2.15z
Rear Bumper:    Box (1.8 × 0.25 × 0.10) — dark, offset -2.15z
```

#### Weissach GT3 — German Rear-Engine
```
Lower Body:     Box (1.85 × 0.42 × 4.2) — classic 911 shape
Hood:           Box (1.6 × 0.14 × 1.4) — sloped front, offset +1.2z
Cabin:          Box (1.45 × 0.5 × 1.3) — taller greenhouse, offset +0.1z
Roof:           Box (1.35 × 0.06 × 1.0) — paint, offset 0z
Rear Deck:      Box (1.7 × 0.2 × 0.9) — raised engine cover, offset -1.1z
Front Spoiler:  Box (1.8 × 0.05 × 0.2) — dark, offset +2.1z
Fixed Wing:     Box (1.6 × 0.04 × 0.3) — dark, offset -1.8z, y+0.55
Wing Supports:  2× Box (0.06 × 0.2 × 0.06) — dark, offset ±0.6x, -1.8z
Front Canards:  2× Box (0.15 × 0.03 × 0.3) — dark, offset ±0.9x, +2.0z
Front Bumper:   Box (1.85 × 0.28 × 0.12) — grille, offset +2.1z
Rear Bumper:    Box (1.75 × 0.28 × 0.10) — dark, offset -2.1z
```

#### Kaiju GT-R — Japanese Wide-Body
```
Lower Body:     Box (2.0 × 0.42 × 4.4) — wide-body stance
Hood:           Box (1.7 × 0.13 × 1.3) — vented hood, offset +1.3z
Cabin:          Box (1.5 × 0.48 × 1.3) — aggressive rake, offset +0.15z
Roof:           Box (1.4 × 0.06 × 1.0) — paint, offset 0z
Rear Deck:      Box (1.7 × 0.12 × 0.9) — trunk, offset -1.2z
Front Bumper:   Box (2.0 × 0.3 × 0.15) — aggressive grille, offset +2.2z
Rear Bumper:    Box (1.9 × 0.3 × 0.12) — dark, offset -2.2z
Fender Flares:  4× Box (0.12 × 0.3 × 1.0) — body color, offset ±1.0x ±0.5z
Rear Wing:      Box (1.7 × 0.05 × 0.35) — dark, offset -1.9z, y+0.5
Wing Supports:  2× Box (0.06 × 0.22 × 0.06) — dark, offset ±0.65x, -1.9z
Side Skirts:     2× Box (0.08 × 0.1 × 3.0) — dark, offset ±1.0x
Quad Exhausts:  4× Cylinder (0.04 radius, 0.1 height) — chrome, offset ±0.4x ±0.55y, -2.2z
```

#### Stingray Z06 — American Mid-Engine
```
Lower Body:     Box (1.88 × 0.38 × 4.2) — sharp, angular
Hood:           Box (1.65 × 0.11 × 1.2) — pointed nose, offset +1.3z
Cabin:          Box (1.35 × 0.44 × 1.15) — compact, offset +0.2z
Roof:           Box (1.25 × 0.06 × 0.85) — paint, offset 0z
Rear Deck:      Box (1.75 × 0.14 × 0.85) — engine cover, offset -1.15z
Front Splitter: Box (1.85 × 0.04 × 0.22) — dark, offset +2.15z
Side Intakes:   2× Box (0.12 × 0.18 × 0.7) — dark, offset ±0.94x, -0.2z
Rear Diffuser:  Box (1.65 × 0.08 × 0.28) — dark, offset -2.15z
Front Bumper:   Box (1.88 × 0.24 × 0.12) — aggressive, offset +2.1z
Rear Bumper:    Box (1.75 × 0.24 × 0.10) — dark, offset -2.1z
```

### 4.3 Lights (Per-Car)
```
Headlights:    2× Box (0.3 × 0.12 × 0.08), emissive warm white
Taillights:    2× Box (0.25 × 0.1 × 0.06), emissive red
Headlight Lamps: 2× SpotLight, intensity 8, range 30, angle 0.4
Taillight Lamps: 2× PointLight, intensity 1.5, range 8
```

Headlights are **off by default** on day-time tracks, **on by default** on night/dusk/dawn tracks. Controlled via EnvironmentManager time-of-day setting.

### 4.4 Wheels (Per-Car)
```
4 wheels, each containing:
  Tire:  Cylinder (0.32 radius, 0.22 width), dark material
  Rim:   Cylinder (0.20 radius, 0.24 width), silver material

Positions vary per car profile:
  Rossini 488:    Front (-0.95, 0.32, 1.30), Rear (-0.95, 0.32, -1.25)
  Weissach GT3:   Front (-0.92, 0.32, 1.25), Rear (-0.92, 0.32, -1.20)
  Kaiju GT-R:     Front (-1.0, 0.32, 1.35), Rear (-1.0, 0.32, -1.30)
  Stingray Z06:   Front (-0.94, 0.32, 1.28), Rear (-0.94, 0.32, -1.22)
```

### 4.5 Dimensions

| Car | Length | Width | Height | Wheelbase |
|-----|--------|-------|--------|-----------|
| Rossini 488 | 4.3m | 1.9m | 1.20m | 2.55m |
| Weissach GT3 | 4.2m | 1.85m | 1.25m | 2.45m |
| Kaiju GT-R | 4.4m | 2.0m | 1.22m | 2.65m |
| Stingray Z06 | 4.2m | 1.88m | 1.18m | 2.50m |

## 5. Car Selection Screen

### 5.1 Display
- 4 cars shown in a horizontal grid
- Highlight selected car (green border + glow)
- Show key stats as bar graphs:
  - Power (engineForce / 950 × 100%)
  - Grip (peakGrip / 2.4 × 100%)
  - Speed (maxSpeed / 265 × 100%)
  - Drift (slipAngleLimit / 35 × 100%)

### 5.2 Card Layout
Each car card shows:
- Color preview rectangle
- Car name
- Subtitle ("The Prancing Horse", etc.)
- Engine badge ("Twin-Turbo V8", "Flat-6 NA", etc.)
- 4 stat bars (Power, Grip, Speed, Drift)
- Turbo indicator (if applicable)

## 6. Car Data Format

Each car defined as a TypeScript config object:

```typescript
interface CarDefinition {
  id: string           // 'rossini-488', 'weissach-gt3', 'kaiju-gt-r', 'stingray-z06'
  name: string         // Display name
  subtitle: string     // Tagline
  color: number        // Hex color for mesh and UI
  description: string  // Handling description
  engine: EngineDefinition  // Engine specs for audio synthesis
  config: CarConfig    // Physics tuning parameters
}

interface EngineDefinition {
  type: 'v8-turbo' | 'flat6-na' | 'v6-turbo' | 'v8-na'
  cylinders: number        // 6 or 8
  displacement: string     // e.g. '3.9L'
  aspiration: 'turbo' | 'na'
  redline: number          // RPM
  idleRPM: number          // default 800
  // Audio synthesis parameters
  baseFrequency: number    // Hz at idle (e.g. 45 for V8, 55 for flat-6)
  maxFrequency: number     // Hz at redline (e.g. 180 for V8, 220 for flat-6)
  harmonicContent: number  // 0-1, richness of tone
  roughness: number        // 0-1, irregularity of waveform
}

interface CarConfig {
  mass: number          // kg
  engineForce: number   // impulse N·s per step
  brakeForce: number    // impulse N·s per step
  steerSpeed: number    // rad/s multiplier
  maxSteerAngle: number // radians
  maxSpeed: number      // km/h
  dragCoeff: number     // linear drag
  peakGrip: number      // grip coefficient
  downforce: number     // downforce coefficient
  slipAnglePeak: number // degrees
  slipAngleLimit: number // degrees
  autoCorrect: number   // DEPRECATED — not used by grip/slip model
  turboLagTime: number  // seconds (0 for NA cars)
}
```

## 7. Car Colors (Hex)

| Car | Color | Hex |
|-----|-------|-----|
| Rossini 488 | Rosso Corsa | `0xdc143c` |
| Weissach GT3 | Racing Green | `0x1a5c1a` |
| Kaiju GT-R | Midnight Purple | `0x2d1b4e` |
| Stingray Z06 | Arctic Blue | `0x1155cc` |

## 8. Car Mesh Construction

### 8.1 Body Parts
Each car has a unique silhouette defined by its per-car mesh profile (section 4.2). Common parts:
- Lower body (main chassis)
- Hood (front section)
- Cabin (glass greenhouse)
- Roof (top panel)
- Rear deck (engine/trunk cover)
- Front splitter/spoiler
- Rear diffuser
- Bumpers (front + rear)
- Headlights (emissive boxes)
- Taillights (emissive boxes)
- 4 wheels (tire + rim)

### 8.2 Lights
```
Headlights:    2× Box (0.3 × 0.12 × 0.08), emissive yellow-white
Taillights:    2× Box (0.25 × 0.1 × 0.06), emissive red
Headlight Lamps: 2× SpotLight, intensity 8, range 30, angle 0.4
Taillight Lamps: 2× PointLight, intensity 1.5, range 8
```

### 8.3 Wheels
```
4 wheels, each containing:
  Tire:  Cylinder (0.32 radius, 0.22 width), dark material
  Rim:   Cylinder (0.20 radius, 0.24 width), silver material
  Positions: Per-car (see section 4.4)
```

## 9. Placeholder Assets

### 9.1 Placeholder Approach
- Use procedural box/lathe-based mesh (no external models)
- 4 wheels per car with tire/rim detail
- Headlights and taillights as emissive boxes + light sources
- Distinct color and silhouette per car
- Replace with GLTF models when available (post-MVP)

### 9.2 Replacement Workflow
1. Create/import GLTF model
2. Place in `assets/models/cars/`
3. Update CarFactory to load GLTF
4. Adjust scale if needed
5. Apply PBR textures

## 10. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| 4 cars load | All cars spawn correctly |
| Cars look different | Distinct silhouettes and colors |
| Handling differs | Each car feels unique |
| Stats match table | Performance within ±10% of targets |
| Car selection works | Can browse and select any car |
| Headlights work | SpotLights visible on road (night tracks) |
| Taillights work | Red glow behind car |
| Wheels visible | 4 wheels per car with detail |
| Turbo lag works | Turbo cars show delayed power delivery |
| NA cars respond instantly | No throttle delay on GT3/Z06 |
