# OCBP Racer — Rendering Specification

## 1. Rendering Pipeline

### 1.1 Technology
- **Renderer:** Three.js WebGLRenderer
- **API:** WebGL2
- **Pixel Ratio:** `window.devicePixelRatio` (capped at 2.0)
- **Antialiasing:** Enabled

### 1.2 Render Loop
```
1. Update camera position (spring follow)
2. Set camera FOV based on speed
3. Update shadow maps
4. Render scene to screen
```

## 2. Scene Configuration

### 2.1 Renderer Settings
```
antialias:            true
alpha:                false
shadowMap.enabled:    true
shadowMap.type:       PCFSoftShadowMap
toneMapping:          ACESFilmicToneMapping
toneMappingExposure:  1.4
outputColorSpace:     SRGBColorSpace
```

### 2.2 Fog
- Type: Exponential fog (FogExp2)
- Color: `#0d1520` (dark blue-black)
- Density: 0.006
- Prevents pop-in at draw distance

## 3. Lighting Model

### 3.1 MVP Lighting (Night Urban)

#### Ambient Light
```
Type:           AmbientLight
Color:          #6688aa (cool blue)
Intensity:      1.2
```

#### Hemisphere Light
```
Type:           HemisphereLight
Sky Color:      #8899bb
Ground Color:   #445566
Intensity:      0.8
```

#### Directional Light (Moon/Sky)
```
Type:           DirectionalLight
Color:          #99aacc (cool blue-white)
Intensity:      1.5
Position:       (50, 80, 30)
Cast Shadows:   Yes
Shadow Map:     2048×2048
Shadow Camera:  Orthographic, ±80m bounds
```

#### Street Lights (Along Track)
```
Type:           PointLight
Color:          #ffcc88 (warm orange)
Intensity:      3.0
Range:          40m
Cast Shadows:   No
Count:          20 along track spline
Pole Height:    7m
Bulb Size:      0.25m radius
Bulb Emissive:  #ffcc88, intensity 3
```

#### Car Headlights
```
Type:           SpotLight (2 per car)
Color:          #ffeedd
Intensity:      8
Range:          30m
Angle:          0.4 rad
Penumbra:       0.5
Decay:          1.5
Position:       Front corners of car
Target:         15m ahead
```

#### Car Taillights
```
Type:           PointLight (2 per car)
Color:          #ff2200
Intensity:      1.5
Range:          8m
Position:       Rear corners of car
```

### 3.2 Light Count Budget
- Directional lights: 1
- Ambient lights: 1
- Hemisphere lights: 1
- Point lights: 22 (20 street + 2 taillights per car, 4 cars)
- Spot lights: 8 (2 per car × 4 cars)

## 4. Camera System

### 4.1 Chase Camera Parameters
```
Distance:         6.0m (behind car)
Height:           2.5m (above car)
LookAhead:        1.0m (forward of car)
SpringStiffness:  30.0
SpringDamping:    0.95
RotationLag:      0.08
BaseFOV:          60°
FOVRange:         2° (max 62° at top speed)
```

### 4.2 FOV with Speed
```
FOV = BaseFOV + (Speed / MaxSpeed) × FOVRange
FOV increases subtly from 60° to 62° at top speed
```

### 4.3 Camera Behaviors

#### Normal Driving
- Spring-based position following toward target
- Target: behind car (distance) + above (height) + ahead (lookAhead)
- Forward direction extracted from car quaternion

#### Spring Follow
```
displacement = target - camera.position
springForce = displacement × stiffness
dampingForce = velocity × -damping × 10
acceleration = springForce + dampingForce
velocity += acceleration × dt
camera.position += velocity × dt
```

#### Look At
- Camera looks at car position + 3m forward + 1m up
- Forward direction from car quaternion

#### High Speed
- FOV increases subtly (2° range)

### 4.4 Camera Reset
- Called at race start
- Position set behind car based on start rotation
- Velocity zeroed

### 4.5 Camera Wall Collision
- Raycast from car position to desired camera position
- If ray hits a barrier collider, camera pulls forward to intersection point + 0.5m offset
- Prevents camera from clipping through track barriers
- Smooth interpolation back when obstruction clears

## 5. Material System

### 5.1 PBR Materials (MeshStandardMaterial)

#### Car Paint
```
Metalness:      0.85
Roughness:      0.25
Color:          Per-car color (hex number)
```

#### Car Glass (Cabin)
```
Metalness:      0.9
Roughness:      0.05
Color:          #223344
Transparent:    true
Opacity:        0.7
```

#### Car Dark Parts (Bumpers, Spoiler)
```
Metalness:      0.2
Roughness:      0.8
Color:          #111111
```

#### Car Grille
```
Metalness:      0.4
Roughness:      0.6
Color:          #0a0a0a
```

#### Headlight Material
```
Color:          #ffffff
Emissive:       #ffffcc
EmissiveIntensity: 1.5
Roughness:      0.1
Metalness:      0.5
```

#### Taillight Material
```
Color:          #ff0000
Emissive:       #ff2200
EmissiveIntensity: 1.0
Roughness:      0.2
Metalness:      0.3
```

#### Track Asphalt
```
Metalness:      0.0
Roughness:      0.9
Color:          #333333
```

#### Track Barriers
```
Metalness:      0.2
Roughness:      0.8
Color:          #888888
```

#### Car Wheels
```
Tire:           Dark (#111111), rough, non-metallic
Rim:            Silver (#888888), smooth, metallic
Geometry:       Cylinder (0.32 radius, 0.22 width)
```

## 6. Environment

### 6.1 Ground
- Large plane (200×200)
- Dark color (#111111)
- Receives shadows
- Y = 0

### 6.2 Track Decorations
- Street lights along spline (poles + bulbs)
- Building silhouettes (box geometry, dark blue #1a1a2e)
- Buildings have lit windows (random emissive yellow #ffdd88)
- 25 buildings placed randomly along track

### 6.3 Building Style
- Simple box geometry with varied scale
- Dark silhouettes against night sky
- Random lit windows (emissive material)
- Cast and receive shadows

## 7. Car Mesh Construction

### 7.1 Sports Car Shape (Procedural)
Each car is a THREE.Group containing:
- Lower body (1.9 × 0.45 × 4.2 box)
- Hood (1.7 × 0.15 × 1.2 box, offset forward)
- Cabin/glass (1.5 × 0.5 × 1.4 box, transparent)
- Roof (1.4 × 0.08 × 1.0 box)
- Rear deck (1.6 × 0.1 × 1.0 box, offset back)
- Front bumper (1.9 × 0.3 × 0.15 box)
- Rear bumper (1.8 × 0.3 × 0.1 box)
- Front spoiler (1.7 × 0.06 × 0.2 box)
- Headlights (0.3 × 0.12 × 0.08 boxes, emissive)
- Taillights (0.25 × 0.1 × 0.06 boxes, emissive)
- 4 wheels (cylinder + rim detail)
- 2 headlights (SpotLight)
- 2 taillights (PointLight)

### 7.2 Wheel Positions
```
Front-Left:  (-0.95, 0.32, 1.25)
Front-Right: (0.95, 0.32, 1.25)
Rear-Left:   (-0.95, 0.32, -1.2)
Rear-Right:  (0.95, 0.32, -1.2)
```

### 7.3 Wheel Animation
- **Spin:** All 4 wheels rotate around local X axis based on forward speed
  - Spin angle += speed × dt × (1 / wheelRadius)
  - Wheel radius ≈ 0.32m
- **Steer:** Front 2 wheels rotate around local Y axis based on currentSteer
  - Front wheel Y rotation = currentSteer angle
- Wheel groups stored as references in CarController for animation

### 7.4 Body Roll
- Car mesh tilts around Z axis based on lateral force
- Roll angle = lateralVelocity × rollFactor (clamped to ±5°)
- Applied as additional rotation in CarController.updateMesh()
- Creates visual lean into corners

## 8. Particle Effects (MVP Scope)

### 8.1 Tire Smoke
- Emitted during drift (lateral velocity > 2 and speed > 5)
- White/grey, semi-transparent Points
- Billboard sprites (PointsMaterial)
- Lifetime: 0.5-1.0 seconds
- Count: 50 max active particles
- Particles rise and fade over lifetime
- Size grows over lifetime (0.8 to 2.8)

## 9. Post-Processing

### 9.1 Bloom (UnrealBloomPass)
```
Threshold:  0.85
Strength:   0.6
Radius:     0.4
Pipeline:   EffectComposer → RenderPass → UnrealBloomPass → Output
```

Bloom makes emissive materials (headlights, taillights, street light bulbs, building windows) glow naturally in the night scene. The threshold ensures only bright emissive surfaces bloom, not the entire scene.

**Quality presets (via Settings menu):**

| Quality | Strength | Resolution | Pixel Ratio |
|---------|----------|------------|-------------|
| Low | 0 (disabled) | — | 1 |
| Medium | 0.4 | half | 1 |
| High | 0.6 | full | max(devicePixelRatio, 2) |

### 9.2 NOT in MVP
- Motion blur
- SSAO
- Screen-space reflections
- Depth of field
- Ray tracing

## 10. Performance Optimization

### 9.1 Frustum Culling
- Enabled by default

### 9.2 Shadow Optimization
- Only primary directional light casts shadows
- Shadow map 2048×2048

## 11. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| Scene renders | Car visible on track at 60 FPS |
| Lighting correct | Night scene readable, no pitch black areas |
| Camera follows | Smooth chase cam at 60 FPS |
| Camera collision | Camera doesn't clip through barriers |
| FOV changes | Subtle FOV increase at speed |
| Bloom works | Emissive surfaces (headlights, street lights) glow |
| Car headlights work | SpotLights illuminate road ahead |
| Car taillights work | Red glow visible behind car |
| Wheels spin | Front and rear wheels rotate with speed |
| Wheels steer | Front wheels turn with steering input |
| Body roll | Car leans into corners |
| Shadows render | Car and track cast soft shadows |
| 60 FPS maintained | No drops below 55 FPS on target hardware |
