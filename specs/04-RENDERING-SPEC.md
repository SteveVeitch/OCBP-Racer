# OCBP Racer — Rendering Specification

## 1. Rendering Pipeline

### 1.1 Technology
- **Renderer:** Three.js WebGLRenderer
- **API:** WebGL2
- **Pixel Ratio:** `window.devicePixelRatio` (capped at 2.0)
- **Antialiasing:** MSAA 4x (configurable)

### 1.2 Render Loop
```
1. Update camera position (spring follow)
2. Set camera FOV based on speed
3. Update shadow maps
4. Render scene to screen
5. Apply post-processing (if enabled)
```

## 2. Scene Configuration

### 2.1 Renderer Settings
```
antialias:        true
alpha:            false
powerPreference:  "high-performance"
toneMapping:      ACESFilmicToneMapping
toneMappingExp:   1.0
outputColorSpace: SRGBColorSpace
shadowMap.enabled: true
shadowMap.type:    PCFSoftShadowMap
```

### 2.2 Fog
- Type: Exponential fog
- Color: Matches sky/environment
- Density: 0.01 (subtle distance fade)
- Prevents pop-in at draw distance

## 3. Lighting Model

### 3.1 MVP Lighting (Night Urban)

#### Primary Light — Moon/Sky
```
Type:           DirectionalLight
Color:          #4466aa (cool blue-white)
Intensity:      0.3
Cast Shadows:   Yes
Shadow Map:     2048x2048
Shadow Camera:  Orthographic, 100m bounds
Shadow Bias:    -0.001
```

#### Ambient Light
```
Type:           AmbientLight
Color:          #1a1a2e (dark blue)
Intensity:      0.4
```

#### Street Lights (Instanced)
```
Type:           PointLight
Color:          #ff9944 (warm orange)
Intensity:      2.0
Range:          15m
Cast Shadows:   No (too expensive)
Count:          20-30 along track
```

#### Car Headlights
```
Type:           SpotLight (per car)
Color:          #ffffff
Intensity:      3.0
Range:          30m
Angle:          0.6 rad (34°)
Cast Shadows:   No
```

### 3.2 Light Count Budget
- Directional lights: 1 (max 2)
- Ambient lights: 1
- Point lights: 30 max
- Spot lights: 8 max (4 per car × 2 cars visible)

## 4. Camera System

### 4.1 Chase Camera Parameters
```
Distance:         6.0m (behind car)
Height:           2.5m (above car)
LookAhead:        4.0m (forward of car)
RotationLag:      0.08 (lower = more lag)
PositionSpring:   12.0 (stiffness)
PositionDamp:     0.85 (damping)
```

### 4.2 FOV with Speed
```
FOV = BaseFOV + (Speed / MaxSpeed) × FOVRange

BaseFOV:   60°
FOVRange:  15° (max 75° at top speed)
```

### 4.3 Camera Behaviors

#### Normal Driving
- Follows behind car with spring dynamics
- Looks ahead based on velocity direction
- Slight tilt during steering

#### Drift
- Camera lags behind car rotation (car rotates more than camera)
- Creates visual "yaw" feeling
- Strength proportional to slip angle

#### Wall Proximity
- Camera pulls forward slightly when near walls
- Prevents camera clipping through geometry

#### High Speed
- Camera moves back slightly
- FOV increases

### 4.4 Camera Collision
- Raycast from camera to car
- If obstructed, camera moves forward to avoid clipping through walls
- Smooth interpolation back when obstruction clears

## 5. Material System

### 5.1 PBR Materials (MeshStandardMaterial)

#### Car Paint
```
Metalness:      0.8
Roughness:      0.2 - 0.4 (varies by car)
Clearcoat:      1.0 (via MeshPhysicalMaterial)
ClearcoatRoughness: 0.1
EnvMapIntensity: 1.5
Color:          Per-car base color
```

#### Track Asphalt
```
Metalness:      0.0
Roughness:      0.7 - 0.9
Color:          #333333
Normal Map:     Yes (asphalt texture)
```

#### Concrete Barriers
```
Metalness:      0.0
Roughness:      0.9
Color:          #888888
```

#### Metal Guardrails
```
Metalness:      0.9
Roughness:      0.3
Color:          #cccccc
```

### 5.2 Texture Maps Required
| Material | Albedo | Normal | Roughness | Metal |
|----------|--------|--------|-----------|-------|
| Car Paint | Yes | No | No | No |
| Asphalt | Yes | Yes | No | No |
| Concrete | Yes | Yes | No | No |
| Metal | Yes | Yes | Yes | Yes |

### 5.3 Texture Resolution
- Car: 2048×2048 (Albedo)
- Track: 1024×1024 (tiling)
- Environment: 512×512

## 6. Environment

### 6.1 Skybox
- Gradient sky (dark blue → black at horizon)
- Or: equirectangular environment map (city night)
- Used for reflections on car paint

### 6.2 Ground
- Large plane extending beyond track
- Dark asphalt or concrete texture
- Receives shadows

### 6.3 Track Decorations
- Street lights (point light sources)
- Building silhouettes (simple box geometry, no detail)
- Barriers along track edges
- Start/finish gantry

## 7. Post-Processing (MVP)

### 7.1 Bloom
```
Threshold:  0.8
Strength:   0.3
Radius:     0.5
Purpose:    Headlights, street lights glow
```

### 7.2 Optional: Motion Blur
- Per-object motion blur
- Strength: 0.2 (subtle)
- Only on fast-moving objects (cars)

### 7.3 NOT in MVP
- SSAO (too expensive)
- Screen-space reflections
- Depth of field
- Ray tracing

## 8. Level of Detail (LOD)

### 8.1 Car LOD
| Distance | Model | Notes |
|----------|-------|-------|
| 0-50m | Full detail | All geometry, full textures |
| 50-100m | Medium | Reduced geometry, half-res textures |
| 100m+ | Low | Billboard or very simple mesh |

### 8.2 Track LOD
- Tiling textures with mipmapping
- No geometry LOD needed for flat track
- Building decorations: simple boxes at all distances

## 9. Particle Effects (MVP Scope)

### 9.1 Tire Smoke
- Emitted during drift
- White/grey, semi-transparent
- Billboard sprites
- Lifetime: 0.5-1.0 seconds
- Count: 50 max active particles

### 9.2 Optional: Sparks
- On wall contact
- Small, fast, short-lived
- Yellow/orange

## 10. Performance Optimization

### 10.1 Instancing
- Street lights: InstancedMesh
- Barriers: InstancedMesh
- Buildings: InstancedMesh

### 10.2 Frustum Culling
- Enabled by default
- Track sections outside camera culled

### 10.3 Shadow Optimization
- Only primary directional light casts shadows
- Shadow map updated every other frame (if needed)
- Cars outside shadow camera culled

## 11. Debug Rendering

### 11.1 Development Mode
- Wireframe overlay toggle
- Bounding box visualization
- Physics collider visualization
- FPS counter
- Draw call counter
- Triangle count

## 12. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| Scene renders | Car visible on track at 60 FPS |
| Lighting correct | Night scene readable, no pitch black areas |
| Camera follows | Smooth chase cam at 60 FPS |
| FOV changes | Noticeable (but subtle) FOV increase at speed |
| Bloom works | Lights glow, not overblown |
| Car paint reflects | Environment map visible on car surface |
| Shadows render | Car and track cast soft shadows |
| Textures load | No missing pink textures |
| 60 FPS maintained | No drops below 55 FPS on target hardware |
