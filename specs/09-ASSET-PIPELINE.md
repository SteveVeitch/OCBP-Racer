# OCBP Racer — Asset Pipeline Specification

## 1. Asset Philosophy

- **Placeholder first:** Get the game running with simple geometry
- **Swap later:** Replace placeholders with real art assets
- **Document everything:** Know exactly what each asset needs

## 2. Asset Categories

### 2.1 Models (3D Geometry)

| Category | Format | Source | MVP | Post-MVP |
|----------|--------|--------|-----|----------|
| Cars | GLTF/GLB | Blender/Maya | Box placeholders | Detailed models |
| Track | Procedural | Generated in code | N/A | Pre-authored |
| Buildings | GLTF/GLB | Blender | Simple boxes | Detailed models |
| Barriers | GLTF/GLB | Blender | Simple boxes | Detailed models |
| Decorations | GLTF/GLB | Blender | None | Street props |

### 2.2 Textures

| Category | Format | Resolution | Maps Required |
|----------|--------|------------|---------------|
| Car Paint | PNG | 2048×2048 | Albedo, Normal, Roughness, Metal |
| Track Surface | PNG | 1024×1024 | Albedo, Normal |
| Concrete | PNG | 512×512 | Albedo, Normal |
| Metal | PNG | 512×512 | Albedo, Normal, Roughness, Metal |
| Environment | HDR/PNG | 1024×1024 | Equirectangular map |

### 2.3 Audio

| Category | Format | Sample Rate | Channels |
|----------|--------|-------------|----------|
| Engine | MP3/WAV | 44.1 kHz | Mono → Stereo |
| Tires | MP3/WAV | 44.1 kHz | Mono → Stereo |
| SFX | MP3/WAV | 44.1 kHz | Mono → Stereo |
| UI | MP3/WAV | 44.1 kHz | Mono → Stereo |

## 3. Placeholder Strategy

### 3.1 Philosophy
Use the simplest possible geometry to prove gameplay works. Real art comes later.

### 3.2 Placeholder Assets

#### Cars
```
Structure:
├── Body: Box (4.5m × 1.9m × 1.3m)
├── Cabin: Smaller box on top (offset forward)
├── Wheels: 4 cylinders (radius 0.35m, width 0.25m)
└── Color: Solid color per car

Colors:
  Phantom GT:  #f0f0f0 (white)
  Viper RS:    #006400 (dark green)
  Inferno SS:  #8b0000 (dark red)
  AeroVen TT:  #0066ff (blue)
```

#### Track
```
Structure:
├── Road: Extruded spline (flat plane)
├── Barriers: Thin boxes along edges
├── Buildings: Tall boxes in background
└── Ground: Large dark plane
```

### 3.3 Placeholder Textures
- Use solid colors for all surfaces in MVP
- Add simple noise/variation in post-processing
- No texture files needed for MVP placeholders

## 4. Real Asset Pipeline

### 4.1 3D Model Workflow

```
1. Model in Blender (or other DCC tool)
   ↓
2. Export as GLTF/GLB
   ↓
3. Optimize (Draco compression, LOD generation)
   ↓
4. Place in assets/models/
   ↓
5. Reference in car config JSON
   ↓
6. Load at runtime via Three.js GLTFLoader
```

### 4.2 Model Requirements

#### Car Models
```
Polygon Budget:    10,000 - 30,000 triangles
Scale:            Real-world (meters)
Origin:           Center of car, ground level
Forward:          -Z axis (Three.js convention)
UV Unwrapped:     Yes
Material:         Single PBR material per car
Naming:           phantom_gt.glb, viper_rs.glb, etc.
```

#### Track Models
```
Polygon Budget:    50,000 triangles (road + barriers)
Format:           Procedural generation from spline data
Collision:        Generated separately (simplified mesh)
```

### 4.3 Texture Workflow

```
1. Create/source textures
   ↓
2. Resize to target resolution
   ↓
3. Convert to PNG (albedo, normal) or JPEG (roughness)
   ↓
4. Generate mipmaps (automatic in Three.js)
   ↓
5. Place in assets/textures/
   ↓
6. Reference in material definitions
```

### 4.4 Texture Requirements

#### Car Textures
```
Albedo:     RGB, no alpha, sRGB color space
Normal:     RGB, tangent space, linear color space
Roughness:  Grayscale, linear color space
Metalness:  Grayscale, linear color space

Packing:    Can pack Roughness (G), Metal (B), AO (R) into single texture
```

#### Track Textures
```
Albedo:     RGB, tiling (seamless), sRGB
Normal:     RGB, tiling, tangent space
Resolution: 1024×1024 minimum
```

## 5. Asset Loading

### 5.1 Loading Strategy
```
1. Show loading screen
2. Load all assets in parallel
3. Report progress (0-100%)
4. Initialize game when complete
5. Cache loaded assets in memory
```

### 5.2 Loading Manager
```typescript
// Pseudocode
const loader = new GLTFLoader();
const audioLoader = new AudioLoader();

// Track progress
const totalAssets = models.length + textures.length + audioFiles.length;
let loadedAssets = 0;

// Load each asset, increment counter
onLoad: loadedAssets++;
progress = loadedAssets / totalAssets;
```

### 5.3 Asset Caching
- Loaded GLTF scenes cached in memory
- Textures shared between materials where possible
- Audio buffers pre-decoded

## 6. File Organization

```
assets/
├── models/
│   └── cars/
│       ├── phantom_gt.glb
│       ├── viper_rs.glb
│       ├── inferno_ss.glb
│       └── aeroven_tt.glb
│
├── textures/
│   ├── cars/
│   │   ├── phantom_gt_albedo.png
│   │   ├── phantom_gt_normal.png
│   │   ├── phantom_gt_roughness_metal.png
│   │   └── ... (same for each car)
│   │
│   ├── track/
│   │   ├── asphalt_albedo.png
│   │   ├── asphalt_normal.png
│   │   ├── concrete_albedo.png
│   │   └── concrete_normal.png
│   │
│   └── env/
│       └── city_night_hdr.hdr
│
├── audio/
│   ├── engine/
│   ├── tires/
│   ├── sfx/
│   └── ui/
│
└── fonts/
    └── rajdhani.woff2
```

## 7. Asset Creation Tools

### 7.1 Recommended Tools

| Task | Tool | Cost |
|------|------|------|
| 3D Modeling | Blender | Free |
| Texturing | Substance Painter | Paid (or trial) |
| Texturing (free) | Material Maker | Free |
| Audio Editing | Audacity | Free |
| Audio (free SFX) | Freesound.org | Free |
| Font | Google Fonts | Free |

### 7.2 Blender Export Settings
```
Format: GLB (binary GLTF)
Apply Modifiers: Yes
UV Coordinates: Yes
Materials: Export as PBR
Draco Compression: Yes (for smaller files)
```

## 8. Asset Substitution Guide

### 8.1 How to Replace Placeholder Cars

```
Step 1: Create or download a car model in GLB format
Step 2: Verify scale (should be ~4.5m long in Blender)
Step 3: Ensure forward is -Z, up is +Y
Step 4: Export as GLB with Draco compression
Step 5: Place in assets/models/cars/[car_name].glb
Step 6: Update modelPath in car config
Step 7: Create PBR textures (2048×2048)
Step 8: Place textures in assets/textures/cars/
Step 9: Update texturePath in car config
Step 10: Test in game, adjust scale if needed
```

### 8.2 How to Replace Placeholder Track

The track is procedurally generated from spline data in `06-TRACK-SPEC.md`. To replace:
```
Step 1: Modify control points in track config
Step 2: Adjust road width in TrackBuilder
Step 3: Add visual detail meshes (curbs, barriers)
Step 4: Add decoration models (buildings, lights)
Step 5: Test lap detection still works
```

### 8.3 How to Add New Audio

```
Step 1: Find/create audio sample (MP3 or WAV)
Step 2: Trim to target length (loopable for continuous sounds)
Step 3: Normalize volume
Step 4: Convert to MP3 (128kbps minimum)
Step 5: Place in correct assets/audio/ subfolder
Step 6: Update AudioManager to reference new file
Step 7: Test volume levels in game
```

## 9. Asset Budget

| Category | Budget (MVP) | Budget (Final) |
|----------|-------------|----------------|
| 3D Models | < 5 MB | < 50 MB |
| Textures | < 20 MB | < 200 MB |
| Audio | < 20 MB | < 100 MB |
| Total | < 50 MB | < 500 MB |

## 10. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| Placeholder cars render | 4 colored boxes visible |
| Placeholder track renders | Road surface visible |
| GLTF loads | Real models replace placeholders |
| Textures apply | PBR materials visible on models |
| Audio loads | All sounds play correctly |
| No memory leaks | Assets load/unload cleanly |
| Loading time | < 5 seconds for all assets |
| File sizes | Within budget |
