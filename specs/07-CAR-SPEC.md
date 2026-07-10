# OCBP Racer — Car Specification

## 1. Car Design Philosophy

- **4 cars for MVP**, each with a distinct personality
- All exotic sports car styling (no trucks, sedans, etc.)
- Visual variety through different colors and handling
- Performance differences felt through handling, not just numbers

## 2. Car Roster

### 2.1 Phantom GT — "The Gentleman's Express"

**Style:** Grand Tourer / Luxury Sports
**Personality:** Balanced, stable, forgiving
**Best For:** Beginners, consistent lap times

```
Visual Characteristics:
  - Pearl white/silver color (#cccccccc)
  - Sports car body shape
  - Headlights and taillights

Handling Profile:
  - Moderate engine force (800 impulse)
  - Medium peak grip (1.9)
  - Good stability
  - Forgiving at the limit
```

### 2.2 Viper RS — "The Scalpel"

**Style:** Track-Focused Sports
**Personality:** Precise, grippy, rewards skill
**Best For:** Experienced players, time trials

```
Visual Characteristics:
  - Racing green color (#1a5c1a)
  - Sports car body shape
  - Headlights and taillights

Handling Profile:
  - Highest grip (2.4)
  - Sharp steering (2.2 steer speed)
  - Low drift tendency
  - Punishes mistakes (tight limit)
```

### 2.3 Inferno SS — "The Wild Card"

**Style:** Muscle-Influenced Exotic
**Personality:** Loose, powerful, drift-happy
**Best For:** Players who like chaos, drift challenges

```
Visual Characteristics:
  - Deep red color (#cc2200)
  - Sports car body shape
  - Headlights and taillights

Handling Profile:
  - Highest engine force (950 impulse)
  - Lowest grip (1.6)
  - Loose rear end (oversteer bias)
  - Easiest to drift
```

### 2.4 AeroVen TT — "The Arrow"

**Style:** Lightweight Hypercar
**Personality:** Agile, responsive, top speed focused
**Best For:** Speed demons, overtaking

```
Visual Characteristics:
  - Electric blue color (#1155cc)
  - Sports car body shape
  - Headlights and taillights

Handling Profile:
  - Lightest car (1250 kg)
  - Fastest top speed (265 km/h)
  - Quick direction changes (2.5 steer speed)
  - Moderate grip (2.1)
```

## 3. Tuning Parameters

### 3.1 Parameter Comparison Table

| Parameter | Phantom GT | Viper RS | Inferno SS | AeroVen TT |
|-----------|-----------|----------|------------|------------|
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

### 3.2 Speed Categories

| Car | Top Speed | Reverse Speed |
|-----|-----------|---------------|
| Phantom GT | 235 km/h | 82 km/h |
| Viper RS | 245 km/h | 86 km/h |
| Inferno SS | 250 km/h | 88 km/h |
| AeroVen TT | 265 km/h | 93 km/h |

Reverse speed = 35% of max speed.

### 3.3 Handling Behavior Summary

| Behavior | Phantom GT | Viper RS | Inferno SS | AeroVen TT |
|----------|-----------|----------|------------|------------|
| Understeer tendency | Medium | Low | High | Medium |
| Oversteer tendency | Low | Low | High | Medium |
| Drift ease | Medium | Hard | Easy | Medium |
| Stability | High | High | Low | Medium |
| Responsiveness | Medium | High | Low | High |
| Braking | Good | Very Good | Fair | Best |

## 4. Car Model Requirements

### 4.1 Geometry (MVP)
- Procedural sports car mesh (no external models)
- Full body with distinct sections: hood, cabin, roof, rear deck, bumpers, spoiler
- Headlights and taillights with emissive materials
- 4 wheels with tire + rim detail
- Headlight SpotLights and taillight PointLights

### 4.2 Dimensions
- Approximate dimensions (from box geometry):
  ```
  Length: 4.2m (lower body)
  Width:  1.9m (lower body)
  Height: 1.23m (to roof)
  ```

### 4.3 Visual Distinction
- Each car identified by unique color
- Same mesh shape for all cars (MVP)
- Distinct handling provides gameplay differentiation

## 5. Car Selection Screen

### 5.1 Display
- 4 cars shown in a horizontal grid
- Highlight selected car (green border + glow)
- Show key stats as bar graphs:
  - Power (engineForce / 850 × 100%)
  - Grip (peakGrip / 2.4 × 100%)
  - Speed (maxSpeed / 265 × 100%)
  - Drift (slipAngleLimit / 35 × 100%)

### 5.2 Card Layout
Each car card shows:
- Color preview rectangle
- Car name
- Subtitle ("The Gentleman's Express", etc.)
- 4 stat bars (Power, Grip, Speed, Drift)

## 6. Car Data Format

Each car defined as a TypeScript config object:

```typescript
interface CarDefinition {
  id: string           // 'phantom-gt', 'viper-rs', 'inferno-ss', 'aeroven-tt'
  name: string         // Display name
  subtitle: string     // Tagline
  color: number        // Hex color for mesh and UI
  description: string  // Handling description
  config: CarConfig    // Physics tuning parameters
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
  autoCorrect: number   // lateral stability 0-1
}
```

## 7. Car Colors (Hex)

| Car | Color | Hex |
|-----|-------|-----|
| Phantom GT | Pearl White | `0xcccccc` |
| Viper RS | Racing Green | `0x1a5c1a` |
| Inferno SS | Deep Red | `0xcc2200` |
| AeroVen TT | Electric Blue | `0x1155cc` |

## 8. Car Mesh Construction

### 8.1 Body Parts
```
Lower Body:    Box (1.9 × 0.45 × 4.2) — main body
Hood:          Box (1.7 × 0.15 × 1.2) — front, offset +1.2z
Cabin:         Box (1.5 × 0.5 × 1.4) — glass, offset +0.1z
Roof:          Box (1.4 × 0.08 × 1.0) — paint, offset 0z
Rear Deck:     Box (1.6 × 0.1 × 1.0) — paint, offset -1.1z
Front Bumper:  Box (1.9 × 0.3 × 0.15) — grille, offset +2.1z
Rear Bumper:   Box (1.8 × 0.3 × 0.1) — dark, offset -2.1z
Front Spoiler: Box (1.7 × 0.06 × 0.2) — dark, offset +2.1z
```

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
  Positions: Front (-0.95, 0.32, 1.25), Rear (-0.95, 0.32, -1.2)
```

## 9. Placeholder Assets

### 9.1 Placeholder Approach
- Use procedural box-based mesh (no external models)
- 4 wheels per car with tire/rim detail
- Headlights and taillights as emissive boxes + light sources
- Different color per car for identification
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
| Cars look different | Color distinction clear |
| Handling differs | Each car feels unique |
| Stats match table | Performance within ±10% of targets |
| Car selection works | Can browse and select any car |
| Headlights work | SpotLights visible on road |
| Taillights work | Red glow behind car |
| Wheels visible | 4 wheels per car with detail |
