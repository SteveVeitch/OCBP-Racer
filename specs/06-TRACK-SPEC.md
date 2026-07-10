# OCBP Racer — Track Specification

## 1. Track Philosophy

- **Single track for MVP:** "Midnight Circuit"
- Urban street circuit aesthetic
- Learnable layout that rewards skill
- Mix of speed sections and technical corners

## 2. Track Design: "Midnight Circuit"

### 2.1 Overview
```
Total Length:     1.8 km (approx)
Lap Count:        3-5 (configurable)
Surface:          Dry asphalt
Setting:          Urban night
Theme:            Downtown city streets
```

### 2.2 Layout Map (Approximation)

```
         ╭────────────╮
         │  CHICANE   │
    ╭────╯            ╰────╮
    │   STRAIGHT 1         │
    │                      │
    ╰──╮              ╭───╯
       │  S-BEND      │
    ╭──╯              ╰───╮
    │   STRAIGHT 2         │
    │                      │
    ╰────╮            ╭────╯
         │  HAIRPIN   │
         ╰────────────╯
              ↓
         START/FINISH
```

### 2.3 Section Breakdown

| Section | Length | Character | Speed |
|---------|--------|-----------|-------|
| Start/Finish Straight | 200m | Wide, flat out | High |
| Turn 1 (Right Sweeper) | 80m | Long radius, banked | Medium |
| Back Straight | 180m | Slight curve, full throttle | High |
| Chicane (L-R) | 60m | Tight, technical | Low |
| Short Straight | 100m | Brief acceleration zone | Medium |
| S-Bend (R-L-R) | 120m | Flowing, rhythm section | Medium |
| Hairpin (Left) | 50m | Tightest corner, slow | Very Low |
| Return Straight | 200m | Drag race to finish | High |

### 2.4 Corner Properties

| Corner | Radius | Ideal Entry Speed | Banking | Difficulty |
|--------|--------|-------------------|---------|------------|
| Turn 1 | 40m | 120 km/h | 5° | Easy |
| Chicane Entry | 15m | 60 km/h | None | Hard |
| Chicane Exit | 15m | 60 km/h | None | Hard |
| S-Bend Entry | 25m | 90 km/h | 3° | Medium |
| S-Bend Mid | 20m | 80 km/h | None | Medium |
| S-Bend Exit | 30m | 100 km/h | 2° | Medium |
| Hairpin | 12m | 40 km/h | None | Hard |

## 3. Track Geometry

### 3.1 Spline-Based Construction
Track built from a Catmull-Rom spline:
- Control points define center line
- Track width extruded from center
- Separate splines for left/right boundaries

### 3.2 Road Surface
```
Width:           12m (standard), 16m (start/finish)
Lanes:           2 per direction (implied, not marked)
Curbs:           0.5m raised edges on corners
Surface:         Flat (no elevation changes in MVP)
```

### 3.3 Geometry Resolution
- Spline segments: 100-200 per track
- Road mesh: Triangle strip from spline
- Triangle count: < 50K for road surface

## 4. Track Boundaries

### 4.1 Barrier Types
| Type | Location | Physics | Visual |
|------|----------|---------|--------|
| Concrete Wall | Outside of corners | Solid | Grey concrete |
| Guardrail | Straight sections | Solid | Metal rail |
| Tire Barrier | Hairpin | Solid (high restitution) | Stacked tires |
| No Barrier | Start/finish | None | Open |

### 4.2 Barrier Placement
- Outer edge of all corners
- Both sides of straight sections
- 0.5m offset from track edge

### 4.3 Barrier Physics
```
Restitution:       0.3 (concrete), 0.5 (tires)
Friction:          0.4
Collision Shape:   Box colliders along boundary
```

## 5. Start/Finish

### 5.1 Start Positions
```
Grid Layout:       2×2 staggered (4 cars)
Pole Position:     Inside line, 10m before finish
Grid Spacing:      3m between rows, 1.5m between columns
```

### 5.2 Checkpoint System
```
Checkpoints:       4 (one per quarter track)
Finish Line:       1 (cross to complete lap)
Trigger Type:      Invisible plane across track
Direction:         Forward only (wrong way detection)
```

### 5.3 Wrong Way Detection
- If car crosses checkpoint in wrong direction
- Display "WRONG WAY" warning
- No penalty in MVP (just visual feedback)

## 6. Visual Environment

### 6.1 Track Decorations
| Element | Count | Purpose |
|---------|-------|---------|
| Street Lights | 25-30 | Lighting, atmosphere |
| Buildings | 20-30 | Skyline backdrop |
| Barriers | Along entire track | Boundary definition |
| Start Gantry | 1 | Start/finish marker |
| Billboards | 3-5 | Decorative, lit |

### 6.2 Building Style
- Simple box geometry
- Dark silhouettes against night sky
- Occasional lit windows (emissive material)
- No detailed geometry needed

### 6.3 Ground Plane
- Extends 100m beyond track in all directions
- Dark ground texture
- Receives shadows from all lights

## 7. Track Loading

### 7.1 Asset Pipeline
```
1. Define control points (JSON config)
2. Generate spline at runtime
3. Extrude road mesh from spline
4. Generate collision mesh from boundaries
5. Load decoration models
6. Place lights along spline
```

### 7.2 Runtime Generation
- Track geometry built at load time (not pre-authored)
- Allows parameter tweaking
- Collision mesh generated automatically

## 8. Post-MVP Track Features

- Multiple tracks (3-5)
- Elevation changes (hills, dips)
- Weather effects (rain, fog)
- Day/night cycle
- Different surfaces (wet, gravel sections)
- Track editor

## 9. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| Track loads | All geometry visible within 3 seconds |
| Track driveable | Car stays on surface, no falling through |
| Barriers work | Car bounces off walls |
| Lap detection | Lap counter increments on finish line cross |
| Wrong way detection | Warning displays on wrong direction |
| Start grid | Cars spawn in correct positions |
| 60 FPS | Track renders at target frame rate |
| No visual pop-in | Fog hides distant geometry |
| Consistent width | Road width matches spec throughout |
