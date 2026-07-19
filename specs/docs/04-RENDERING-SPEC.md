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
- Density: 0.006 (default, varies by weather preset)
- Prevents pop-in at draw distance
- **Fog Toggle:** Can be disabled via settings for testing
- When fog is off: `scene.fog = null`

### 2.3 HDR Environment Maps
- Loaded via `RGBELoader` from `three/examples/jsm/loaders/RGBELoader.js`
- Processed through `THREE.PMREMGenerator` at startup for PBR environment reflections
- Cached in `EnvironmentManager.hdrCache` (Map<string, THREE.Texture>)
- Applied as both `scene.background` (skybox) and `scene.environment` (IBL reflections)
- Falls back to flat `skyColor` if HDR fails to load
- Source: Polyhaven.com (CC0 licensed), 1K resolution (~1.4-1.8 MB each)
- Total HDR footprint: ~6 MB (4 files)

| TOD Preset | HDR File | Source |
|------------|----------|--------|
| dawn | `dawn_1k.exr` | ambientCG "Morning Sky HDRI 014 B" (CC0) |
| day | `day_1k.exr` | ambientCG "Day Sky HDRI 063 B" (CC0) |
| dusk | `dusk_1k.exr` | ambientCG "Evening Sky HDRI 016 A" (CC0) |
| night | `night_1k.exr` | ambientCG "Night Sky HDRI 003" (CC0) |

All 4 HDRs are EXR format, loaded via `EXRLoader` from `three/addons/loaders/EXRLoader.js`. File extension is auto-detected: `.exr` → EXRLoader, `.hdr` → RGBELoader.

Night preset uses `hdrVerticalOffset: 0.15` to push the equirectangular horizon below the game horizon, preventing the sky from dominating the top half of the screen.

## 3. Lighting Model

### 3.1 Lighting Presets (Per Time-of-Day)

#### Night (Default)
```
Ambient Light:       #222244, intensity 0.6
Directional Light:   #4444ff, intensity 0.6, position (50, 80, 30)
Fog Color:           #0a0a15, near 40, far 160
Headlights:          ON (CarController.setHeadlights(true))
Street Lights:       ON (point lights, intensity 5, warm orange, distance 30)
                     + emissive bulb meshes (emissiveIntensity 6.0)
HDR vertical offset: 0.15 (pushes horizon down)
```

#### Dawn
```
Ambient Light:       #7a5a3a, intensity 0.11
Directional Light:   #ffaa55, intensity 0.22, angle 15
Fog Color:           #5a3a2a, near 80, far 250
Headlights:          ON (CarController.setHeadlights(true))
Street Lights:       OFF
```

#### Day
```
Ambient Light:       #aabbcc, intensity 0.18
Directional Light:   #ffffff, intensity 0.38, angle 60
Fog Color:           #bbccdd, near 120, far 350
Headlights:          OFF (CarController.setHeadlights(false))
Street Lights:       OFF
```

#### Dusk
```
Ambient Light:       #774433, intensity 0.11
Directional Light:   #ff7733, intensity 0.2, angle 10
Fog Color:           #553322, near 70, far 220
Headlights:          ON (CarController.setHeadlights(true))
Street Lights:       OFF
Headlights:          ON
Street Lights:       ON
```

### 3.2 Street Lights (Along Track)
```
Type:           PointLight
Color:          #ffcc88 (warm orange)
Intensity:      3.0
Range:          40m
Cast Shadows:   No
Count:          20 along track spline (varies by track density)
Pole Height:    7m
Bulb Size:      0.25m radius
Bulb Emissive:  #ffcc88, intensity 3
```

### 3.3 Car Headlights
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

**Headlight State:**
- OFF on day-time tracks (timeOfDay === 'day')
- ON on night/dusk/dawn tracks
- Controlled via EnvironmentManager
- Emissive material intensity matches light state

### 3.4 Car Taillights
```
Type:           PointLight (2 per car)
Color:          #ff2200
Intensity:      1.5
Range:          8m
Position:       Rear corners of car
```

### 3.5 Light Count Budget
- Directional lights: 1
- Ambient lights: 1
- Hemisphere lights: 1
- Point lights: 22 (20 street + 2 taillights per car, 4 cars)
- Spot lights: 8 (2 per car × 4 cars)

## 4. Camera System

### 4.1 Camera Views

The game supports 5 camera views, switchable via the camera button:

#### Chase Camera (Default)
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

#### Cockpit Camera
```
Distance:         0.45m (behind car center, at driver seat)
Height:           0.95m (seated eye level)
LookAhead:        0.0m (position at driver seat, lookAt handles forward view)
SpringStiffness:  200.0 (very tight follow)
SpringDamping:    0.7
RotationLag:      0.003 (near-instant rotation tracking)
BaseFOV:          70° (natural interior perspective)
FOVRange:         3° (max 73° at top speed)
```

#### Windscreen Camera
```
Distance:         0.0m (inside car)
Height:           0.8m (driver eye level)
LookAhead:        3.0m (forward)
SpringStiffness:  50.0 (tighter follow)
SpringDamping:    0.9
RotationLag:      0.03 (less lag for immersion)
BaseFOV:          75° (wider for interior)
FOVRange:         5° (max 80° at top speed)
```

#### Hood Camera
```
Distance:         0.0m (on hood)
Height:           0.3m (above hood surface)
LookAhead:        2.0m (forward)
SpringStiffness:  40.0
SpringDamping:    0.92
RotationLag:      0.05
BaseFOV:          70°
FOVRange:         4° (max 74° at top speed)
```

#### Bumper Camera
```
Distance:         0.0m (at bumper)
Height:           0.4m (low, aggressive)
LookAhead:        4.0m (far forward for speed feel)
SpringStiffness:  60.0 (very tight)
SpringDamping:    0.85
RotationLag:      0.02 (minimal lag)
BaseFOV:          80° (wide for speed sensation)
FOVRange:         8° (max 88° at top speed)
```

### 4.2 Camera View Parameters Table

| Parameter | Chase | Cockpit | Windscreen | Hood | Bumper |
|-----------|-------|---------|------------|------|--------|
| Distance | 6.0m | 0.45m | 0.3m | 0.1m | 0.0m |
| Height | 2.5m | 0.95m | 1.2m | 0.9m | 0.35m |
| LookAhead | 1.0m | 0.0m | 2.0m | 3.0m | 4.0m |
| SpringStiffness | 30.0 | 200.0 | 80.0 | 100.0 | 120.0 |
| SpringDamping | 0.95 | 0.7 | 0.9 | 0.85 | 0.8 |
| RotationLag | 0.08 | 0.003 | 0.02 | 0.01 | 0.005 |
| BaseFOV | 60° | 70° | 80° | 72° | 85° |
| FOVRange | 2° | 3° | 5° | 4° | 8° |

### 4.3 FOV with Speed
```
FOV = BaseFOV + (Speed / MaxSpeed) × FOVRange
```
Each view has its own FOV range for appropriate speed sensation.

### 4.4 Camera Behaviors

#### Spring Follow (All Views)
```
displacement = target - camera.position
springForce = displacement × stiffness
dampingForce = velocity × -damping × 10
acceleration = springForce + dampingForce
velocity += acceleration × dt
camera.position += velocity × dt
```

#### Look At
- Chase: car position + 1m forward + 1m up
- Cockpit: car position + 5m forward + 0.4m up (through windshield at road level)
- Windscreen: car position + 5m forward + 0.5m up
- Hood: car position + 3m forward + 0.2m up
- Bumper: car position + 6m forward + 0.1m up

### 4.5 Camera Reset
- Called at race start
- Position set behind car based on start rotation
- Velocity zeroed
- View set to player's chosen default (from settings)

### 4.6 Camera Wall Collision
- Raycast from car position to desired camera position
- If ray hits a barrier collider, camera pulls forward to intersection point + 0.5m offset
- Prevents camera from clipping through track barriers
- Smooth interpolation back when obstruction clears
- Only active in Chase view (other views are car-attached)

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
EmissiveIntensity: 1.5 (ON) / 0.0 (OFF)
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
- Large plane (400×400)
- Receives shadows
- Y = -0.01
- PBR ground textures per terrain type (ambientCG, CC0 license):
  - **Urban**: Asphalt024B — cracked asphalt (Color + NormalDX + Roughness)
  - **Coastal**: Ground022 — pebbles/river rock (Color + NormalDX + Roughness)
  - **Mountain**: Rock026 — gray cliff rock, photogrammetry (Color + NormalDX + Roughness)
  - **Industrial**: Concrete039 — broken brown concrete, photogrammetry (Color + NormalDX + Roughness)
- Textures tiled at 40×40 repeat on a 1K map
- Normal scale: 0.8 (subtle surface detail)
- Falls back to procedural canvas textures if PBR fails to load

### 6.2 Track Decorations
- Street lights along spline (poles + bulb meshes, no light sources)
- Terrain-appropriate decorations (buildings, trees, rocks, industrial structures)
- Buildings have visible window textures (no emissive)
- Decoration count varies by track density parameter

### 6.3 Building Style
- Simple box geometry with varied scale
- Dark silhouettes against night sky
- Random lit windows (emissive material)
- Cast and receive shadows
- Building foundations visible on urban tracks

## 7. Car Mesh Construction

### 7.1 GLTF Body Models (Current)
Each car uses a GLTF model loaded asynchronously at startup for detailed body geometry. Models are cached, scaled to target dimensions, and paint-tinted by applying the car color to PBR materials with low roughness and high metalness. The model is a single child Group with BufferGeometry children.

### 7.2 Procedural Wheels (Always)
4 procedural wheels are always added to each car for spin animation, regardless of GLTF availability:
- Tire: CylinderGeometry (0.32 radius, 0.22 width), dark material
- Rim: CylinderGeometry (0.20 radius, 0.24 width), silver material
- Wheel groups detected by `CarController.findWheels()` — finds direct children of root Group that are Groups with ≥2 children including CylinderGeometry

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

### 8.2 Weather Particles
- Rain: 3000-instance InstancedMesh drops
- Follows player position
- Only active during rain/storm weather
- See `WeatherParticleSystem.ts`

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

### 10.1 Frustum Culling
- Enabled by default

### 10.2 Shadow Optimization
- Only primary directional light casts shadows
- Shadow map 2048×2048

### 10.3 Material Sharing
- Shared materials for common surfaces (asphalt, barriers, grass)
- Car paint materials per-car (4 total)
- Barrier material shared across all barrier meshes

## 11. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| Scene renders | Car visible on track at 60 FPS |
| Lighting correct | Scene readable, appropriate for time-of-day |
| Camera follows | Smooth chase cam at 60 FPS |
| Camera collision | Camera doesn't clip through barriers |
| FOV changes | Subtle FOV increase at speed |
| Camera views work | All 5 views switchable and functional |
| Bloom works | Emissive surfaces glow |
| Car headlights work | SpotLights illuminate road ahead (night tracks) |
| Headlights off day | Headlights disabled on day tracks |
| Car taillights work | Red glow visible behind car |
| Wheels spin | Front and rear wheels rotate with speed |
| Wheels steer | Front wheels turn with steering input |
| Body roll | Car leans into corners |
| Shadows render | Car and track cast soft shadows |
| Fog toggle | Fog can be disabled via settings |
| Mini-map renders | Track outline + positions visible |
| 60 FPS maintained | No drops below 55 FPS on target hardware |
