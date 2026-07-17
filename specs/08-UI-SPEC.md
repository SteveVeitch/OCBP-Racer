# OCBP Racer — UI Specification

## 1. UI Architecture

### 1.1 Technology
- **Method:** HTML/CSS overlay on top of Three.js canvas
- **No canvas-based UI** (DOM is easier to style and accessible)
- **Framework:** None (vanilla TypeScript + CSS for MVP)
- **Post-MVP:** Consider React/Vue if complexity grows

### 1.2 Layer Structure
```
┌─────────────────────────────┐
│         UI Layer            │  ← HTML/CSS (on top)
├─────────────────────────────┤
│       Three.js Canvas       │  ← WebGL (behind)
├─────────────────────────────┤
│         Background          │  ← Body background
└─────────────────────────────┘
```

### 1.3 Loading Screen
- HTML loading screen shown before game initializes
- Dark background (#0d1520) with centered spinner
- CSS-only spinner animation (no JS)
- Fades out when game loads (opacity transition)
- Google Fonts loaded via `<link>` tags with preconnect

## 2. Game State Machine

```
MENU → CAR_SELECT → CAR_PREVIEW → TRACK_SELECT → COUNTDOWN → RACING → RESULTS → MENU
                    ↕ Back                           ↕ Back
                  CAR_SELECT                      CAR_PREVIEW
                                    ↕
                                SETTINGS
                                ↕
                              PAUSED
                    MENU → (3 min idle) → DEMO → (any input) → MENU
```

Note: SETTINGS is accessible from Main Menu, Pause Menu, and Track Select. Back from SETTINGS returns to previous state.

## 3. Screen Definitions

### 3.1 Main Menu

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│           OCBP RACER                    │
│           STREET RACING                 │
│                                         │
│           [ START RACE ]                │
│           [ SETTINGS ]                  │
│                                         │
│           v0.3.0                        │
└─────────────────────────────────────────┘
```

**Elements:**
| Element | Type | Action |
|---------|------|--------|
| Title | Heading | "OCBP RACER" — decorative |
| Subtitle | Text | "STREET RACING" |
| Start Race | Button (primary) | → CAR_SELECT |
| Settings | Button | → SETTINGS |
| Version | Text | "v0.3.0" |

### 3.2 Car Select

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│           SELECT CAR                    │
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ R488│ │ WGT3│ │ KGR │ │ SZ06│      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
│                                         │
│         [BACK]  [NEXT]                  │
└─────────────────────────────────────────┘
```

**Interactions:**
- Click a car card to select it
- Click "Next" → TRACK_SELECT
- Click "Back" → MENU
- Click "Next" → CAR_PREVIEW
- Selected car has green border + glow

**Car Cards Show:**
- Static 3/4 view 3D rendering of the car (rendered via Three.js, captured as image)
- Car name
- Subtitle ("The Prancing Horse", etc.)
- Engine badge ("3.9L Twin-Turbo V8 • 661 HP") — no TURBO indicator
- 4 stat bars: Power, Grip, Speed, Drift

### 3.3 Car Preview

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│         [3D car model rotating]         │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  CAR NAME                          │ │
│  │  Subtitle                          │ │
│  │  Engine info                       │ │
│  │  ████████ Power  ████████░░ Grip   │ │
│  │  ████████ Speed  ████░░░░░░ Drift  │ │
│  │  Top Speed: XXX km/h               │ │
│  │  ───────────────────────────────── │ │
│  │  Drag to rotate • Scroll to zoom   │ │
│  │           [Back] [Continue]        │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Elements:**
| Element | Type | Action |
|---------|------|--------|
| 3D Car Model | Three.js preview scene | Rotates automatically, draggable |
| Spec Box | Dark overlay card | Car name, stats, details |
| Back | Button | → CAR_SELECT |
| Continue | Button (primary) | → TRACK_SELECT |

**Behavior:**
- 3D car model rendered in dedicated preview scene (off-white background)
- Camera orbits car at 30° elevation, auto-rotates CW
- Mouse drag rotates manually (3s resume timeout)
- Scroll zooms in/out (min 3, max 12)
- Spec box shows full car stats with arcade styling
- Engine info shown inline without TURBO badge
- Power bar calibrated: highest-power car fills ~85% of bar width, others proportional

**Power Bar Calibration:**
- Normalize against `engineForce / 8500` (same formula as current)
- Cap fill at 85% for the highest-power car (Weissach GT3 at 850/8500 = 10% → rescale)
- Actually: find max power stat across all cars, set that car's fill to 85%, others proportional
- Affects both car selection cards and car preview stat bars

### 3.4 Track Select

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│           SELECT TRACK                  │
│                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ Track1 │ │ Track2 │ │ Track3 │      │
│  └────────┘ └────────┘ └────────┘      │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ Track4 │ │ Track5 │ │ Track6 │      │
│  └────────┘ └────────┘ └────────┘      │
│                                         │
│  Weather: [Auto] [Clear] [Rain]        │
│                                         │
│         [BACK]  [START RACE]            │
└─────────────────────────────────────────┘
```

**Track Cards Show:**
- Track name
- Difficulty badge (Easy/Medium/Hard/Expert)
- Distance in km
- Terrain icon (Urban/Coastal/Mountain/Industrial)
- Default time-of-day
- Default weather
- Highlight selected track (green border)
- Click "Back" → CAR_PREVIEW
- Click "Start Race" → COUNTDOWN

**AI Difficulty Override:**
- Row of toggle buttons below track grid (same row as weather)
- Options: Easy, Normal, Hard, Expert (default: Normal)
- Persisted to localStorage

**Weather Override:**
- Row of toggle buttons below track grid
- Options: Auto (uses track default), Clear, Rain, Fog, Storm
- Persisted to localStorage

**Time-of-Day Override:**
- Row of toggle buttons below weather row
- Options: Auto (uses track default), Dawn, Day, Dusk, Night
- Persisted to localStorage

### 3.5 Countdown

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│              3                          │
│                                         │
└─────────────────────────────────────────┘
```

**Behavior:**
- Large centered number (180px font)
- Counts: 3 → 2 → 1 → GO!
- Each number appears for 1 second, then removed
- "GO!" is gold/yellow, slightly smaller (120px)
- Input locked during countdown
- Cars cannot move
- Pause available during countdown (pauses countdown)

### 3.6 In-Race HUD

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│   LAP 1/3    TIME 0:00.00    BEST --:--│
│                                         │
│                                         │
│                    ┌──────┐             │
│                    │ MINI │             │
│                    │ MAP  │             │
│                    └──────┘             │
│                                         │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │  SPEEDO  │ │   REVS  │ │  BOOST  │    │
│ │  160px   │ │  160px  │ │  160px  │    │
│ └─────────┘ └─────────┘ └─────────┘    │
│                                         │
│          WRONG WAY (if applicable)      │
│                          ┌──────────┐   │
│                          │    1st   │   │
│                          └──────────┘   │
└─────────────────────────────────────────┘
```

**HUD Elements:**

| Element | Position | Content |
|---------|----------|---------|
| Lap Counter | Top bar | "LAP 1/3" |
| Timer | Top bar | Current race time |
| Best Time | Top bar | Best lap time (or "--:--.--") |
| Speedometer | Bottom-left | Canvas gauge, 160px diameter, analog dial |
| Rev Counter | Bottom-left (right of speedo) | Canvas gauge, 160px diameter, analog dial |
| Turbo Boost | Bottom-left (right of revs) | Canvas gauge, 160px diameter, only for turbo cars |
| Position | Bottom-right | Position number + ordinal |
| Mini-map | Top-right corner | Player + AI positions |
| Wrong Way | Center | Pulsing "WRONG WAY" text |

### 3.6.1 Speedometer Gauge

- **Style:** Realistic analog, white-on-black
- **Size:** 160×160px canvas
- **Sweep:** 7 o'clock (210°) to 3 o'clock (330°) — 240° total arc
- **Range:** 0 to maxSpeed × 1.1 (in current speed unit)
- **Ticks:** Major ticks every 20 units, minor ticks every 10 units
- **Numbers:** Major tick values displayed around rim
- **Needle:** White, tapered, smooth animation
- **Center:** Digital speed readout (current value)
- **Label:** "km/h" or "MPH" below center

### 3.6.2 Rev Counter Gauge

- **Style:** Realistic analog, white-on-black, redline zone in red
- **Size:** 160×160px canvas
- **Sweep:** 7 o'clock (210°) to 1 o'clock (30°) — 300° total arc (clockwise through top)
- **Range:** 0 to per-car redline × 1.1 (e.g., 8800 for Rossini)
- **Ticks:** Major ticks every 1000 RPM, minor ticks every 500 RPM
- **Redline zone:** Red arc from redline to max
- **Numbers:** Major tick values displayed around rim
- **Needle:** White, tapered, smooth animation
- **Center:** Digital RPM readout
- **Label:** "RPM" below center

### 3.6.3 Turbo Boost Gauge

- **Style:** Realistic analog, white-on-black, boost zone in cyan/blue
- **Size:** 160×160px canvas
- **Sweep:** 7 o'clock (210°) to 1 o'clock (30°) — 300° total arc
- **Range:** 0% to 100% boost
- **Data:** Throttle + turbo lag blend — boost rises with throttle, delayed by turboLagTime; decays at TURBO_DECAY_RATE when off throttle
- **Ticks:** Major ticks at 0/25/50/75/100%
- **Boost zone:** Cyan/blue arc above 75%
- **Needle:** White, tapered, smooth animation
- **Center:** Digital percentage readout
- **Label:** "BOOST" below center
- **Visibility:** Only shown for cars with turboLagTime > 0 (Rossini 488, Kaiju GT-R)

### 3.7 Pause Menu

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│              PAUSED                     │
│                                         │
│         [ RESUME    ]                   │
│         [ SETTINGS  ]                   │
│         [ RESTART   ]                   │
│         [ QUIT RACE ]                   │
│                                         │
└─────────────────────────────────────────┘
```

**Behavior:**
- Game freezes completely
- Semi-transparent dark overlay (rgba(0,0,0,0.7))
- Input blocked except menu navigation
- Escape or Start button to pause/unpause
- Settings button opens SETTINGS, back returns to PAUSED (not MENU)
- Restart button restarts current race
- Audio suspended while paused, resumed on unpause
- Auto-pause when browser tab becomes hidden (visibilitychange API)

### 3.8 Race Results

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│           1st                           │
│           10 points                     │
│                                         │
│           Total Time                    │
│           1:42.356                      │
│                                         │
│           Best Lap                      │
│           0:32.123                      │
│                                         │
│           Wall Hits: 2                  │
│           Top Speed: 248 km/h           │
│                                         │
│         [RACE AGAIN]  [MAIN MENU]       │
│                                         │
└─────────────────────────────────────────┘
```

**Elements:**
- Final position (large, gold, with ordinal suffix)
- Points earned
- Total race time
- Best lap time
- Wall hits count (cleanest metric)
- Top speed reached
- Buttons: Race Again (→ restart), Main Menu (→ menu)

### 3.9 Leaderboard Screen

**Layout:**
```
┌──────────────────────────────────────────────────┐
│                                                  │
│              LEADERBOARD                         │
│                                                  │
│  ┌──────────┬───────────────────────────────────┐│
│  │ OVERALL  │  #   Car        Time    Wall  MPH  ││
│  │ Midnight │  1   Rossini    1:42    2     148  ││
│  │ Sunset   │  2   Weissach   1:43    0     146  ││
│  │ Thunder  │  3   Kaiju      1:44    3     155  ││
│  │ Typhoon  │  4   Stingray   1:45    1     164  ││
│  │ Neon     │                                          │
│  │ Iron     │                                          │
│  └──────────┴───────────────────────────────────┘│
│                                                  │
│                 [ BACK ]                         │
└──────────────────────────────────────────────────┘
```

**Leaderboard Features:**
- Fixed dimensions: centered panel, 600px wide, 480px tall
- Top 10 entries per track, top 20 overall
- Tabs positioned vertically on the left side (not top)
- All entries show full stats (time, walls, speed) — not just 1st place
- Tabs styled as arcade sidebar with active state indicator
- Per-track leaderboard (best times per track)
- Overall leaderboard (best combined times)
- Top speed shown in the unit currently selected (MPH or KPH)
- Sorted by total time (ascending)
- Accessible from main menu and race results
- Scrollable content area for entries beyond visible area

### 3.10 Settings Menu

**Layout: Two-column arcade panel, centered**
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    SETTINGS                              │
│                                                          │
│  ┌─── AUDIO / GRAPHICS ───┐  ┌─── CONTROLS ──────────┐  │
│  │                         │  │                        │  │
│  │  Master Volume          │  │  Throttle:   W    [≡]  │  │
│  │  ████████░░  80%        │  │  Brake:      S    [≡]  │  │
│  │                         │  │  Steer L:    A    [≡]  │  │
│  │  Engine Volume          │  │  Steer R:    D    [≡]  │  │
│  │  ██████░░░░  60%        │  │  Pause:     Esc   [≡]  │  │
│  │                         │  │  Camera:     C    [≡]  │  │
│  │  Steer Sensitivity      │  │                        │  │
│  │  ████░░░░░░  1.0x       │  │  [Reset Defaults]     │  │
│  │                         │  │                        │  │
│  │  Speed Unit             │  └────────────────────────┘  │
│  │  [ MPH ] [ KPH ]        │                             │
│  │                         │                             │
│  │  Graphics Quality       │                             │
│  │  [Low] [Med] [High]     │                             │
│  │                         │                             │
│  │  Fog Toggle  [On/Off]   │                             │
│  │                         │                             │
│  │  Camera Default         │                             │
│  │  [Chase] [Wind/H/B]     │                             │
│  │                         │                             │
│  │  Demo Mode  [On/Off]    │                             │
│  │                         │                             │
│  │  Release Channel        │                             │
│  │  [Green] [Blue]         │                             │
│  └─────────────────────────┘                             │
│                                                          │
│                      [ BACK ]                            │
└──────────────────────────────────────────────────────────┘
```

**Settings (GameSettings interface):**

| Setting | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Master Volume | Slider | 0-100% | 100% | Overall audio volume |
| Engine Volume | Slider | 0-100% | 60% | Engine + procedural sound volume |
| Steer Sensitivity | Slider | 0-200% | 100% | Steering response curve exponent (1.0-2.0) |
| Speed Unit | Button group | MPH/KPH | MPH | Display unit for speed (internal always km/h) |
| Graphics Quality | Button group | Low/Med/High | High | Bloom strength + pixel ratio |
| Fog Toggle | Toggle | On/Off | On | Enable/disable fog rendering |
| Camera Default | Button group | Chase/Wind/Hood/Bumper | Chase | Default camera view |
| Demo Mode | Toggle | On/Off | On | Enable/disable attract mode after 3 min idle |
| Release Channel | Button group | Green/Blue | Green | Green = released tracks only, Blue = includes unreleased tracks |
| Key Bindings | Per-action | See 03-INPUT-SPEC | Defaults | Rebindable controls |

**Speed Unit:**
- Stores `speedUnit: 'mph' | 'kph'` in GameSettings (default: `'mph'`)
- Internal physics always use km/h (`CarController.getSpeed()`)
- Conversion applied at display: MPH = km/h * 0.621371, KPH = km/h
- Affects: HUD speedometer, results top speed, leaderboard top speed
- Does not affect physics, lap times, or any non-display values

**Layout Behavior:**
- Two vertical columns side-by-side, centered in the screen
- Left column: Audio sliders + Speed Unit + Graphics + Fog + Camera + Demo Mode
- Right column: Controls (key bindings) + Reset Defaults
- Both columns inside a single arcade-styled border panel
- Panel background: `var(--bg-darker)` with 1px border
- Columns separated by a vertical divider line

**Fog Toggle:**
- Controls `scene.fog` visibility
- Useful for testing and debugging
- Persisted to localStorage
- Default: On (fog visible)

**Camera Default:**
- Sets the starting camera view for races
- Can be overridden mid-race with camera button
- Persisted to localStorage

**Release Channel:**
- `releaseChannel: 'green' | 'blue'` in GameSettings (default: `'green'`)
- **Green:** Only released tracks appear in Track Select (Midnight Circuit)
- **Blue:** All tracks appear, including unreleased tracks marked with a blue badge
- Each track has a `releaseChannel` field (`'green'` or `'blue'`)
- Track Select filters tracks based on this setting
- Persisted to localStorage

**Behavior:**
- Accessible from Main Menu, Pause Menu, and Track Select
- Changes apply immediately (no restart needed)
- Settings persisted to `localStorage` key `ocbp-settings`
- Back button returns to previous state (MENU or PAUSED via RACING)
- AudioContext auto-resumes on user interaction

**Graphics Quality Levels:**
- **Low:** Bloom disabled, pixel ratio 1
- **Medium:** Bloom strength 0.4, half-resolution, pixel ratio 1
- **High:** Bloom strength 0.6, full resolution, pixel ratio up to 2

### 3.11 Demo Mode (Attract)

**Trigger:** 3-minute idle timer on MENU state (keyboard, mouse, and gamepad activity resets timer). Can be disabled via Settings.

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│         ┌───────────────────┐           │
│         │   ROSSINI 488     │           │
│         │   Midnight Circuit│           │
│         │   Clear • Night   │           │
│         └───────────────────┘           │
│                                         │
│         [AI car driving on track]       │
│                                         │
│                                         │
│                                         │
│   Press any key to return to menu       │
└─────────────────────────────────────────┘
```

**Behavior:**
- Single AI car drives at aggressiveness 0.3 (leisurely pace)
- Random car, track, weather, and time-of-day selected each run
- No countdown, no lap limit, no position tracking, no race results
- No player car — camera follows the AI car
- Minimal HUD overlay only (car name, track name, conditions, exit prompt)
- Any input (throttle, brake, steer, pause, confirm, back, keyboard, mouse, gamepad) exits to MENU
- Audio plays (engine, tire, wind) following the AI car

**HUD Elements:**
| Element | Position | Content |
|---------|----------|---------|
| Car Name | Top center | Car name (28px, primary color) |
| Track Name | Top center | Track name (16px, dim) |
| Conditions | Top center | Weather + time-of-day (12px, dim) |
| Exit Prompt | Bottom center | "Press any key to return to menu" (18px, 40% opacity, pulsing) |

**Setting:**
- `demoEnabled: boolean` in GameSettings (default: `true`)
- Toggle in Settings menu as "Demo Mode (Attract)"
- Persisted to localStorage

## 4. Scoring System

### 4.1 Race Points

| Position | Points |
|----------|--------|
| 1st | 10 |
| 2nd | 7 |
| 3rd | 5 |
| 4th | 2 |

### 4.2 Cleanest Rating
- Tracked per race as "wall hits" (number of barrier collisions)
- Displayed on results screen and leaderboard
- Cleanest = fewest wall hits
- Rating shown as dots: ●●○ = 2 hits, ●●● = 3+ hits

### 4.3 Top Speed Tracking
- Highest speed reached during race
- Displayed on results screen and leaderboard
- Useful for comparing car performance

### 4.4 Score Persistence
- Results saved to localStorage per track
- Leaderboard tracks best time, wall hits, top speed per car per track
- Overall leaderboard aggregates across all tracks

## 5. Mini-Map

### 5.1 Layout
- Positioned in top-right corner of HUD
- Semi-transparent background (rgba(0,0,0,0.3))
- Size: 120×120px (scalable with UI)

### 5.2 Content
- Track outline (simplified, 2D projection of spline)
- Player position: green dot
- AI positions: red dots (3 opponents)
- Start/finish line marker

### 5.3 Behavior
- Rotates to keep player at bottom center
- Zoom level adjusts to show full track
- Updates every frame
- Non-obtrusive during racing

### 5.4 Track Outline Generation
- Project 3D spline points to 2D (x,z plane)
- Scale to fit within minimap bounds
- Center on player position
- Draw as filled polygon with semi-transparent fill

## 6. UI Styling

### 6.1 Design System

```
Font:             'Rajdhani' (Google Fonts), system-ui fallback
Primary Color:    #00ff88 (neon green)
Secondary Color:  #ff3366 (hot pink)
Accent:           #ffcc00 (gold)
Background:       rgba(10, 10, 26, 0.92) — dark blue-black
Darker Background: rgba(5, 5, 15, 0.95)
Text Color:       #ffffff
Text Dim:         #8888aa
Border:           rgba(255, 255, 255, 0.1)
```

### 6.2 Visual Style
- Dark, semi-transparent backgrounds
- Neon accents (street racer aesthetic)
- Sharp corners (no border-radius)
- Subtle glow effects on active elements
- Monospace numbers for speed/times (Courier New)

### 6.3 Typography
```
Title:        72px, Bold, Rajdhani, neon green glow
Subtitle:     24px, Rajdhani, dim color, wide spacing
Button:       22px, Semi-bold, Rajdhani, uppercase
HUD Speed:    48px, Monospace, bold, neon green
HUD RPM:      10px, Rajdhani
HUD Items:    24px, Monospace, neon green
Results:      96px, Bold, Rajdhani, gold
```

### 6.4 Button Style
```
Font:         Rajdhani, 22px, Semi-bold
Color:        White
Background:   Transparent
Border:       2px solid rgba(255,255,255,0.1)
Padding:      14px 48px
Min Width:    280px
Uppercase:    Yes
Letter Spacing: 3px

Hover:        Border green, text green, subtle green bg
Active:       Scale 0.98
Primary:      Green border + green text + green bg
```

## 7. UI Animations

### 7.1 Transitions
- Screen transitions: Fade in (0.3s)
- Menu selection: Scale up on hover (1.02x)
- Button press: Scale down (0.98x)

### 7.2 HUD Updates
- Speed number: Updates every frame (no smoothing)
- RPM bar: Updates every frame (linear gradient)
- Wrong way: Pulse animation (0.5s infinite)
- Countdown numbers: Fade in (0.5s)
- Mini-map: Updates every frame

## 8. Centered Layout

All overlay screens use flexbox centering:
```css
.ui-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
```

This ensures all UI content is centered regardless of screen size.

## 9. Responsive Design

### 9.1 Target Resolution
- Primary: 1920×1080
- Minimum: 1280×720
- UI scales proportionally

### 9.2 UI Scaling
```
Scale Factor = min(screenWidth / 1920, screenHeight / 1080)
Clamped between 0.5 and 1.0
Applied as CSS transform: scale() on the UI container
Transform-origin: top left
```

The UI container gets `transform: scale(factor)` with `transform-origin: top left`. The container is sized to 1920×1080 and scaled down for smaller screens. The canvas behind is unaffected.

### 9.3 Resize Handling
- Window resize event triggers recalculation of scale factor
- Three.js camera aspect ratio updated separately
- UI scales independently of 3D viewport

## 10. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| All screens render | Every UI state displays correctly |
| Navigation works | Keyboard and gamepad navigate menus |
| HUD displays | Speed, lap, position visible during race |
| HUD updates | Values change in real-time |
| Pause works | Game freezes, menu appears |
| Results show | Correct position, times, wall hits, top speed |
| Responsive | UI scales on different resolutions |
| No UI lag | Animations smooth at 60 FPS |
| Styling consistent | All screens match design system |
| Centered layout | All screens centered vertically and horizontally |
| Settings accessible | Can open settings from main menu |
| Volume controls | Sliders adjust audio volume in real-time |
| Sensitivity control | Steering sensitivity adjusts driving feel |
| Graphics toggle | Bloom can be toggled on/off |
| Fog toggle | Fog can be toggled on/off |
| Camera setting | Default camera view can be changed |
| Settings persist | Settings saved to localStorage |
| Key rebinding | All gameplay actions can be remapped |
| Leaderboard shows | Best times per track displayed |
| Mini-map renders | Player + AI positions visible |
| Scoring works | Points awarded correctly per position |
| Demo mode triggers | Starts after 3 min idle on menu |
| Demo mode HUD | Car name, track name, exit prompt visible |
| Demo mode exits | Any input returns to menu |
| Demo mode toggle | Setting disables/enables demo mode |
