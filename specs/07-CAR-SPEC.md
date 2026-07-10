# OCBP Racer — Car Specification

## 1. Car Design Philosophy

- **4 cars for MVP**, each with a distinct personality
- All exotic sports car styling (no trucks, sedans, etc.)
- Visual variety through different body shapes
- Performance differences felt through handling, not just numbers

## 2. Car Roster

### 2.1 Phantom GT — "The Gentleman's Express"

**Style:** Grand Tourer / Luxury Sports
**Personality:** Balanced, stable, forgiving
**Best For:** Beginners, consistent lap times

```
Visual Characteristics:
  - Long hood, short deck
  - Smooth, flowing lines
  - Dual exhaust
  - Chrome accents
  - Color: Pearl White / Silver

Handling Profile:
  - Neutral handling (understeer bias)
  - Excellent high-speed stability
  - Moderate drift capability
  - Forgiving at the limit
```

### 2.2 Viper RS — "The Scalpel"

**Style:** Track-Focused Sports
**Personality:** Precise, grippy, rewards skill
**Best For:** Experienced players, time trials

```
Visual Characteristics:
  - Aggressive aero package
  - Wide body, low stance
  - Large rear wing
  - Race-inspired livery
  - Color: Racing Green / Black

Handling Profile:
  - Highest grip of all cars
  - Sharp, responsive steering
  - Low drift tendency
  - Punishes mistakes (tight limit)
```

### 2.3 Inferno SS — "The Wild Card"

**Style:** Muscle-Influenced Exotic
**Personality:** Loose, powerful, drift-happy
**Best For:** Players who like chaos, drift challenges

```
Visual Characteristics:
  - Wide, muscular haunches
  - Aggressive front fascia
  - Quad exhaust tips
  - Bold, angular design
  - Color: Deep Red / Orange

Handling Profile:
  - Highest power-to-weight
  - Loose rear end (oversteer bias)
  - Easiest to drift
  - Least stable at limit
```

### 2.4 AeroVen TT — "The Arrow"

**Style:** Lightweight Hypercar
**Personality:** Agile, responsive, top speed focused
**Best For:** Speed demons, overtaking

```
Visual Characteristics:
  - Ultra-low profile
  - Active aero elements (visual)
  - Center exhaust
  - Futuristic, aerodynamic shape
  - Color: Electric Blue / Matte Black

Handling Profile:
  - Lightest car
  - Fastest top speed
  - Quick direction changes
  - Moderate grip, moderate drift
```

## 3. Tuning Parameters

### 3.1 Parameter Comparison Table

| Parameter | Phantom GT | Viper RS | Inferno SS | AeroVen TT |
|-----------|-----------|----------|------------|------------|
| **Mass (kg)** | 1600 | 1400 | 1700 | 1250 |
| **Engine Force (N)** | 6500 | 6000 | 8500 | 7000 |
| **Brake Force (N)** | 10000 | 12000 | 9000 | 10500 |
| **Brake Bias** | 0.6 | 0.55 | 0.65 | 0.58 |
| **Max Steer (rad)** | 0.45 | 0.42 | 0.50 | 0.48 |
| **Wheelbase (m)** | 2.65 | 2.50 | 2.70 | 2.45 |
| **Track Width (m)** | 1.70 | 1.75 | 1.80 | 1.65 |
| **COM Height (m)** | 0.40 | 0.35 | 0.45 | 0.32 |
| **Drag Coeff** | 0.38 | 0.35 | 0.42 | 0.30 |
| **Downforce Coeff** | 1.0 | 1.8 | 0.8 | 1.2 |
| **Peak Grip** | 2.0 | 2.4 | 1.6 | 2.1 |
| **Slip Angle Peak (°)** | 12 | 10 | 14 | 11 |
| **Slip Angle Limit (°)** | 30 | 25 | 35 | 28 |
| **Auto-Correct** | 0.4 | 0.5 | 0.2 | 0.4 |
| **Max Speed (km/h)** | 240 | 225 | 255 | 265 |

### 3.2 Speed Categories

| Car | 0-100 km/h | 100-200 km/h | Top Speed |
|-----|-----------|-------------|-----------|
| Phantom GT | 4.5s | 8.0s | 240 km/h |
| Viper RS | 5.0s | 7.5s | 225 km/h |
| Inferno SS | 3.8s | 7.0s | 255 km/h |
| AeroVen TT | 4.0s | 6.5s | 265 km/h |

### 3.3 Handling Behavior Summary

| Behavior | Phantom GT | Viper RS | Inferno SS | AeroVen TT |
|----------|-----------|----------|------------|------------|
| Understeer tendency | Medium | Low | High | Medium |
| Oversteer tendency | Low | Low | High | Medium |
| Drift ease | Medium | Hard | Easy | Medium |
| Stability | High | High | Low | Medium |
| Responsiveness | Medium | High | Low | High |

## 4. Car Model Requirements

### 4.1 Geometry
- Low-poly mesh for MVP (placeholder)
- Approximate real car proportions
- Distinct silhouette for each car
- 4 wheels visible

### 4.2 Texture Maps
- Albedo (color)
- Normal (surface detail)
- Roughness (surface finish)
- Metalness (metal areas)

### 4.3 Scale
- Real-world scale (meters)
- Approximate dimensions:
  ```
  Length: 4.2 - 4.8m
  Width:  1.8 - 2.0m
  Height: 1.1 - 1.4m
  ```

## 5. Car Selection Screen

### 5.1 Display
- 4 cars shown in a horizontal lineup
- Highlight selected car
- Show key stats:
  - Power (bar graph)
  - Grip (bar graph)
  - Speed (bar graph)
  - Handling (bar graph)

### 5.2 Preview
- Rotate selected car model
- Show car name and description
- Show car color

## 6. Car Animation

### 6.1 Visual Effects
- Wheel rotation (mapped to speed)
- Steering angle (front wheels turn)
- Body roll (lateral G-force)
- Pitch (acceleration/braking squat)

### 6.2 Post-MVP
- Suspension travel animation
- Damage deformation
- Smoke/sparks particles

## 7. Car Data Format

Each car defined as a TypeScript config object:

```typescript
interface CarConfig {
  id: string;
  name: string;
  description: string;
  style: string;
  color: string;
  mass: number;
  engineForce: number;
  brakeForce: number;
  brakeBias: number;
  maxSteerAngle: number;
  wheelbase: number;
  trackWidth: number;
  centerOfMassY: number;
  dragCoeff: number;
  downforceCoeff: number;
  peakGrip: number;
  slipAnglePeak: number;
  slipAngleLimit: number;
  autoCorrectStrength: number;
  maxSpeed: number;
  modelPath: string;      // GLTF model path
  texturePath: string;    // Texture path
}
```

## 8. Placeholder Assets

### 8.1 Placeholder Approach
- Use simple colored boxes for car bodies
- 4 wheels per car (cylinders or torus)
- Different color per car for identification
- Replace with GLTF models when available

### 8.2 Replacement Workflow
1. Create/import GLTF model
2. Place in `assets/models/cars/`
3. Update `modelPath` in car config
4. Adjust scale if needed
5. Apply PBR textures

## 9. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| 4 cars load | All cars spawn correctly |
| Cars look different | Visual distinction clear |
| Handling differs | Each car feels unique |
| Stats match table | Performance within ±10% of targets |
| Car selection works | Can browse and select any car |
| Model loads | GLTF models render correctly |
| Textures apply | PBR materials visible |
| Animation works | Wheels spin, steering turns |
