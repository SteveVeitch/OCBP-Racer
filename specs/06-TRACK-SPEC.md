# OCBP Racer — Track Specification

## 1. Track Philosophy

- **Single track for MVP:** "Midnight Circuit"
- Urban night oval circuit aesthetic
- Learnable layout that rewards skill
- Mix of sweepers and straight sections

## 2. Track Design: "Midnight Circuit"

### 2.1 Overview
```
Total Length:     ~220m (closed oval)
Lap Count:        3 (default)
Surface:          Dry asphalt (procedural)
Setting:          Urban night
Theme:            City street circuit
Shape:            Oval (rotated +90° from base orientation)
```

### 2.2 Layout Shape

```
              START/FINISH
                  ↓
         ╭────────────╮
    ╭────╯            ╰────╮
    │                      │
    │   LEFT STRAIGHT      │
    │                      │
    ╰────╮            ╭────╯
         │   RIGHT       │
         │  STRAIGHT     │
         ╰────────────╯
```

The track is a closed oval with control points rotated +90° so the initial tangent points +Z (toward the camera).

### 2.3 Control Points

12 Catmull-Rom control points defining the oval:

| Index | Position (x, y, z) | Description |
|-------|-------------------|-------------|
| 0 | (0, 0, 0) | Start/finish (tangent → +Z) |
| 1 | (0, 0, 25) | Start straight |
| 2 | (-8, 0, 45) | Turn entry |
| 3 | (-25, 0, 50) | Back straight start |
| 4 | (-42, 0, 45) | Turn entry |
| 5 | (-50, 0, 25) | Mid-back |
| 6 | (-50, 0, 0) | Back straight midpoint |
| 7 | (-50, 0, -25) | Turn entry |
| 8 | (-42, 0, -45) | Turn entry |
| 9 | (-25, 0, -50) | Back straight start |
| 10 | (-8, 0, -45) | Turn entry |
| 11 | (0, 0, -25) | Return to start |

### 2.4 Spline Configuration
```
Curve Type:       CatmullRomCurve3
Closed:           true
Tension:          0.5
Direction:        Counter-clockwise (when viewed from above)
Initial Tangent:  +Z direction (toward camera)
```

## 3. Track Geometry

### 3.1 Spline-Based Construction
Track built from a Catmull-Rom spline:
- Control points define center line
- Track width extruded from center using right vector
- Right vector = cross(up, tangent) normalized

### 3.2 Road Surface
```
Width:           12m (standard)
Road Divisions:  200 segments
Surface:         Flat (y = 0.01), no elevation changes
Material:        MeshStandardMaterial (#333333, rough 0.9)
UV Mapping:      Tiling along track length
```

### 3.3 Geometry Resolution
- Spline segments: 200 per track
- Road mesh: Triangle strip from spline
- Road height: 0.01 (slightly above ground)

## 4. Track Boundaries

### 4.1 Barrier Configuration
```
Barrier Height:  1.0m
Barrier Offset:  0.5m from road edge
Total Edge:      6.5m from center (road half-width + offset)
Material:        MeshStandardMaterial (#888888, rough 0.8, metal 0.2)
```

### 4.2 Barrier Placement
- Both sides of track along entire length
- Visual barriers: thin mesh strips
- Collision barriers: box colliders (0.5 × 0.5 × segmentLength/2)

### 4.3 Barrier Physics
```
Body Type:       Fixed (static)
Collider:        Box (0.5 × 0.5 × segmentLength/2)
Segments:        10 per side (20 total collision boxes per side)
```

## 5. Start/Finish

### 5.1 Start Positions
```
Grid Layout:       2×2 staggered (4 cars)
Grid Spacing:      5m between rows (lengthwise)
Column Offset:     2.5m between columns (sideways)
Pole Position:     t = 0 on spline (start/finish)
Start Direction:   +Z (initial tangent of spline)
```

### 5.2 Start Rotation
```
Rotation = atan2(tangent.x, tangent.z) at t = 0
```

### 5.3 Checkpoint System
```
Checkpoints:       8 (evenly spaced along track)
Divisions:         8
Trigger Radius:    20m (checkpoint width)
Direction:         Track tangent at checkpoint position
```

### 5.4 Checkpoint Properties
| Checkpoint | Approx. Position | Notes |
|------------|------------------|-------|
| 0 | Start/finish | Lap completion check |
| 1 | 1/8 around | |
| 2 | 1/4 around | |
| 3 | 3/8 around | |
| 4 | 1/2 around | Halfway point |
| 5 | 5/8 around | |
| 6 | 3/4 around | |
| 7 | 7/8 around | Final before finish |

### 5.5 Lap Detection
- Checkpoints must be passed in order (0 → 1 → 2 → ... → 7 → 0)
- When checkpoint 0 is passed after checkpoint 7: lap increments
- Lap counter: 0-indexed internally, displayed as 1-indexed

### 5.6 Wrong Way Detection
- Compares car velocity direction to track tangent at last checkpoint
- Track tangent stored as `checkpoint.normal` (spline tangent at that position)
- Wrong way: `dot(velocityDir, trackTangent) < -0.5`
- Speed gate: velocity < 0.5 → no wrong way (stationary car)
- Ignored when car is reversing (forwardSpeed < 0)
- Visual feedback: "WRONG WAY" pulsing text (no penalty in MVP)

## 6. Visual Environment

### 6.1 Track Decorations
| Element | Count | Purpose |
|---------|-------|---------|
| Street Lights | 20 | Lighting, atmosphere |
| Buildings | 25 | Skyline backdrop |
| Barriers | Along entire track | Boundary definition |

### 6.2 Street Light Placement
- Lights placed along spline at 20 evenly spaced points
- Positioned 8m to the right of track center
- Pole height: 7m
- Bulb: sphere geometry (0.25m radius)
- Material: emissive warm orange (#ffcc88, intensity 3)

### 6.3 Building Style
- Simple box geometry with varied scale
- Width: 5-15m, Height: 8-28m, Depth: 5-10m
- Dark silhouettes against night sky (#1a1a2e)
- Random lit windows (emissive yellow #ffdd88, intensity 0.5)
- Placed 15-30m from track center, on random side
- Cast and receive shadows

### 6.4 Ground Plane
- Large plane (200×200) at y = 0
- Dark color (#111111)
- Receives shadows from all lights

## 7. Track Loading

### 7.1 Asset Pipeline
```
1. Define control points (12 Vector3 in code)
2. Generate CatmullRomCurve3 spline (closed, tension 0.5)
3. Extrude road mesh from spline (200 divisions)
4. Generate barrier visual meshes (2 sides)
5. Generate barrier collision boxes (2 sides × 10 segments)
6. Place street lights along spline
7. Place buildings randomly along spline
```

### 7.2 Runtime Generation
- Track geometry built at load time (not pre-authored)
- Control points are hardcoded in Track.ts
- All geometry is procedural

## 8. Post-MVP Track Features

- Multiple tracks (3-5)
- Elevation changes (hills, dips)
- Weather effects (rain, fog)
- Day/night cycle
- Different surfaces (wet, gravel sections)
- Track editor
- Spline-based chicanes and tight corners

## 9. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| Track loads | All geometry visible within 3 seconds |
| Track driveable | Car stays on surface, no falling through |
| Barriers work | Car bounces off walls |
| Lap detection | Lap counter increments on finish line cross |
| Wrong way detection | Warning displays on wrong direction (not when reversing) |
| Start grid | Cars spawn in correct staggered positions |
| 60 FPS | Track renders at target frame rate |
| No visual pop-in | Fog hides distant geometry |
| Consistent width | Road width matches 12m spec throughout |
