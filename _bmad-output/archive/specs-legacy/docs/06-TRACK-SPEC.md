# OCBP Racer — Track Specification

## 1. Track Philosophy

- **6 tracks** with distinct themes, difficulty, and environmental conditions
- Each track has unique terrain-themed decorations and environmental presets
- Weather can be overridden per race
- Tracks range from beginner-friendly ovals to expert technical circuits

## 2. Track Roster

| # | Track | Difficulty | Distance | Terrain | Default Time | Default Weather | Checkpoints | Release |
|---|-------|-----------|----------|---------|-------------|-----------------|-------------|---------|
| 1 | Midnight Circuit | Easy | 0.22 km | Urban | Night | Clear | 8 | Green |
| 2 | Sunset Boulevard | Medium | 0.45 km | Coastal | Dusk | Clear | 10 | Blue |
| 3 | Thunder Ridge | Hard | 0.70 km | Mountain | Day | Clear | 12 | Blue |
| 4 | Neon District | Expert | 0.55 km | Urban | Night | Rain | 12 | Blue |
| 5 | Iron Circuit | Expert | 0.85 km | Industrial | Dawn | Fog | 14 | Blue |
| 6 | Typhoon Pass | Hard | 0.65 km | Mountain | Day | Rain | 12 | Blue |

## 3. Track Design: "Midnight Circuit"

### 3.1 Overview
```
Total Length:     ~220m (closed oval)
Lap Count:        3 (default)
Surface:          Dry asphalt (procedural)
Setting:          Urban night
Theme:            City street circuit
Shape:            Oval (rotated +90° from base orientation)
```

### 3.2 Control Points

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

### 3.3 Spline Configuration
```
Curve Type:       CatmullRomCurve3
Closed:           true
Tension:          0.5
Direction:        Counter-clockwise (when viewed from above)
Initial Tangent:  +Z direction (toward camera)
```

## 4. Track Design: "Typhoon Pass"

### 4.1 Overview
```
Total Length:     ~650m (winding mountain pass)
Lap Count:        3 (default)
Surface:          Wet asphalt (rain)
Setting:          Mountain day with rain
Theme:            Alpine mountain pass with elevation
Shape:            Winding S-curves with switchbacks
```

### 4.2 Track Theme
- Mountain pass through steep terrain
- Elevation changes along the track (hills and dips)
- Rain weather by default (wet surface, reduced grip)
- Trees and rocks lining the track
- Guardrails on cliff edges
- Overcast sky with rain particles
- Day time with dramatic cloud cover

### 4.3 Control Points

18 Catmull-Rom control points defining the mountain pass:

| Index | Position (x, y, z) | Description |
|-------|-------------------|-------------|
| 0 | (0, 0, 0) | Start/finish |
| 1 | (5, 0.5, 30) | Gentle uphill |
| 2 | (15, 1.5, 55) | Climbing right |
| 3 | (30, 2.5, 75) | Hill crest |
| 4 | (50, 2.0, 85) | Crest + turn left |
| 5 | (65, 1.0, 80) | Downhill left |
| 6 | (75, 0.0, 65) | Valley floor |
| 7 | (80, 0.5, 45) | S-curve entry |
| 8 | (70, 1.0, 25) | S-curve mid |
| 9 | (55, 1.5, 10) | S-curve exit, climbing |
| 10 | (40, 2.5, -5) | Ridge line |
| 11 | (25, 3.0, -15) | High point |
| 12 | (10, 2.0, -30) | Downhill switchback |
| 13 | (-5, 1.0, -45) | Tight hairpin |
| 14 | (-15, 0.0, -55) | Valley return |
| 15 | (-20, 0.5, -40) | Gentle climb back |
| 16 | (-15, 0.3, -20) | Final approach |
| 17 | (-5, 0.1, -5) | Return to start |

### 4.4 Elevation Profile
```
Height
  3m │         ╭──╮
  2m │    ╭───╯  ╰──╮
  1m │───╯          ╰──╮
  0m │                 ╰──────────
     └──────────────────────────────→ Distance
     Start                       Finish
```

Maximum elevation change: ~3.0m
Smooth sinusoidal elevation for comfortable racing feel.

### 4.5 Spline Configuration
```
Curve Type:       CatmullRomCurve3
Closed:           true
Tension:          0.4 (slightly smoother for mountain curves)
Direction:        Clockwise (when viewed from above)
Elevation:        Yes (y-values in control points)
```

### 4.6 Environmental Presets
```
Time of Day:      Day
Weather:          Rain (default, overridable)
Ambient Light:    #aabbcc, intensity 1.4
Directional:      #ffffff, intensity 2.0 (overcast)
Fog:              #8899aa, density 0.008
Ground Color:     #2a3a2a (mountain grass)
Decorations:      Pine trees, rocks, guardrails
```

### 4.7 Terrain-Specific Features
- **Trees:** Pine trees along track edges (30-40 instances)
- **Rocks:** Boulders near cliff edges (15-20 instances)
- **Guardrails:** W-beam barriers on cliff sides
- **Ground:** Mountain grass/rock texture (procedural)
- **Elevation:** Track spline has y-values for hills

### 4.8 Difficulty: Hard
- Winding curves require precise steering
- Elevation changes affect car balance
- Rain reduces grip by 22% (default weather)
- Narrow sections demand careful positioning
- Switchbacks punish speed without control

## 5. Track Geometry

### 5.1 Spline-Based Construction
Track built from a Catmull-Rom spline:
- Control points define center line
- Track width extruded from center using right vector
- Right vector = cross(up, tangent) normalized
- For elevated tracks: up vector follows world Y (0,1,0)

### 5.2 Road Surface
```
Width:           12m (standard)
Road Divisions:  200 segments
Surface:         Follows elevation (y varies), 0.01 above terrain
Material:        MeshStandardMaterial (#333333, rough 0.9)
UV Mapping:      Tiling along track length
```

### 5.3 Geometry Resolution
- Spline segments: 200 per track
- Road mesh: Triangle strip from spline
- Road height: 0.01 above terrain y

## 6. Track Boundaries

### 6.1 Barrier Configuration
```
Barrier Height:  1.0m
Barrier Offset:  0.5m from road edge
Total Edge:      6.5m from center (road half-width + offset)
Material:        MeshStandardMaterial (#888888, rough 0.8, metal 0.2)
```

### 6.2 Barrier Placement
- Both sides of track along entire length
- Visual barriers: W-beam mesh strips
- Collision barriers: box colliders (0.5 × 0.5 × segmentLength/2)

### 6.3 Barrier Physics
```
Body Type:       Fixed (static)
Collider:        Box (0.5 × 0.5 × segmentLength/2)
Segments:        10 per side (20 total collision boxes per side)
```

## 7. Start/Finish

### 7.1 Start Positions
```
Grid Layout:       2×2 staggered (4 cars)
Grid Spacing:      5m between rows (lengthwise)
Column Offset:     2.5m between columns (sideways)
Pole Position:     t = 0 on spline (start/finish)
Start Direction:   +Z (initial tangent of spline)
```

### 7.2 Start Rotation
```
Rotation = atan2(tangent.x, tangent.z) at t = 0
```

### 7.3 Checkpoint System
```
Checkpoints:       8-14 (varies by track, evenly spaced along track)
Divisions:         Equal to checkpoint count
Trigger Radius:    20m (checkpoint width)
Direction:         Track tangent at checkpoint position
```

### 7.4 Checkpoint Properties
| Checkpoint | Approx. Position | Notes |
|------------|------------------|-------|
| 0 | Start/finish | Lap completion check |
| 1 | 1/N around | |
| ... | ... | |
| N-1 | (N-1)/N around | Final before finish |

### 7.5 Lap Detection
- Checkpoints must be passed in order (0 → 1 → 2 → ... → N-1 → 0)
- When checkpoint 0 is passed after checkpoint N-1: lap increments
- Lap counter: 0-indexed internally, displayed as 1-indexed

### 7.6 Wrong Way Detection
- Compares car velocity direction to track tangent at last checkpoint
- Track tangent stored as `checkpoint.normal` (spline tangent at that position)
- Wrong way: `dot(velocityDir, trackTangent) < -0.5`
- Speed gate: velocity < 0.5 → no wrong way (stationary car)
- Ignored when car is reversing (forwardSpeed < 0)
- Visual feedback: "WRONG WAY" pulsing text (no penalty in MVP)

## 8. Visual Environment

### 8.1 Track Decorations (Per Terrain)

| Terrain | Decorations | Ground Color |
|---------|-------------|--------------|
| Urban | Buildings, street lights | #111111 |
| Coastal | Palm trees, beach, ocean | #c2b280 |
| Mountain | Pine trees, rocks, cliffs | #2a3a2a |
| Industrial | Warehouses, smokestacks | #1a1a1a |

### 8.2 Street Light Placement
- Lights placed along spline at evenly spaced points
- Density varies by track (urban: high, mountain: low)
- Positioned 8m to the right of track center
- Pole height: 7m
- Bulb: sphere geometry (0.25m radius)
- Material: emissive warm orange (#ffcc88, intensity 3)

### 8.3 Ground Plane
- Large plane (200×200) at y = 0
- Color varies by terrain type
- Receives shadows from all lights

## 9. Track Loading

### 9.1 Asset Pipeline
```
1. Define control points (12-20 Vector3 in code)
2. Generate CatmullRomCurve3 spline (closed, tension varies)
3. Extrude road mesh from spline (200 divisions)
4. Generate barrier visual meshes (2 sides)
5. Generate barrier collision boxes (2 sides × 10 segments)
6. Place street lights along spline
7. Place terrain-appropriate decorations
```

### 9.2 Runtime Generation
- Track geometry built at load time (not pre-authored)
- Control points are hardcoded in TrackDefinitions.ts
- All geometry is procedural
- Track rebuilds cleanly on selection change

## 10. Post-MVP Track Features

- More tracks (7+)
- Dynamic elevation changes
- Day/night cycle
- Different surfaces (wet, gravel, ice sections)
- Track editor
- Weather changes during race

## 11. Acceptance Criteria

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
| 6 tracks selectable | All tracks load and play correctly |
| Elevation works | Mountain tracks have visible terrain changes |
| Decorations match | Trees for mountain, buildings for urban, etc. |
