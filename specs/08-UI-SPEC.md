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
MENU → CAR_SELECT → TRACK_SELECT → COUNTDOWN → RACING → RESULTS → MENU
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
│           v0.2.0                        │
└─────────────────────────────────────────┘
```

**Elements:**
| Element | Type | Action |
|---------|------|--------|
| Title | Heading | "OCBP RACER" — decorative |
| Subtitle | Text | "STREET RACING" |
| Start Race | Button (primary) | → CAR_SELECT |
| Settings | Button | → SETTINGS |
| Version | Text | "v0.2.0" |

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
- Selected car has green border + glow

**Car Cards Show:**
- Color preview rectangle
- Car name
- Subtitle ("The Prancing Horse", etc.)
- Engine badge ("Twin-Turbo V8", "Flat-6 NA", etc.)
- Turbo indicator (if applicable)
- 4 stat bars: Power, Grip, Speed, Drift

### 3.3 Track Select

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

**Weather Override:**
- Row of toggle buttons below track grid
- Options: Auto (uses track default), Clear, Rain, Fog, Storm
- Persisted to localStorage

### 3.4 Countdown

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

### 3.5 In-Race HUD

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
│ ┌──────────────┐           ┌──────────┐ │
│ │   142 km/h   │           │    1st   │ │
│ │  ▂▃▅▆▇█▇▅▃▂ │           │  10 pts  │ │
│ └──────────────┘           └──────────┘ │
│                                         │
│          WRONG WAY (if applicable)      │
└─────────────────────────────────────────┘
```

**HUD Elements:**

| Element | Position | Content |
|---------|----------|---------|
| Lap Counter | Top bar | "LAP 1/3" |
| Timer | Top bar | Current race time |
| Best Time | Top bar | Best lap time (or "--:--.--") |
| Speedometer | Bottom-left | Digital km/h (48px monospace) |
| RPM Bar | Above speed | Gradient bar (0-100%) |
| Position | Bottom-right | Position number + ordinal |
| Score | Below position | Points earned (e.g. "10 pts") |
| Mini-map | Top-right corner | Player + AI positions |
| Wrong Way | Center | Pulsing "WRONG WAY" text |

### 3.6 Pause Menu

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

### 3.7 Race Results

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

### 3.8 Leaderboard Screen

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│           LEADERBOARD                   │
│                                         │
│  Track: Midnight Circuit    [All Tracks]│
│                                         │
│  #  Car       Time      Clean  Speed    │
│  1  Rossini   1:42.356   ●●○   248     │
│  2  Weissach  1:43.112   ●●●   235     │
│  3  Kaiju     1:44.890   ●○○   261     │
│  4  Stingray  1:45.234   ●●○   265     │
│                                         │
│         [BACK]                          │
└─────────────────────────────────────────┘
```

**Leaderboard Features:**
- Per-track leaderboard (best times per track)
- Overall leaderboard (best combined times)
- Cleanest rating: ● = wall hit, ○ = clean segment
- Top speed column
- Sorted by total time (ascending)
- Accessible from main menu and race results

### 3.9 Settings Menu

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│           SETTINGS                      │
│                                         │
│  Master Volume    ████████░░  80%       │
│  Engine Volume    ██████░░░░  60%       │
│  Steer Sensitivity ████░░░░░  1.0x      │
│  Graphics Quality  [Low] [Med] [High]   │
│  Fog Toggle        [On] [Off]           │
│  Camera Default    [Chase] [Wind/H/B]  │
│                                         │
│  ── CONTROLS ──                         │
│  Throttle:     W / ↑        [Change]    │
│  Brake:        S / ↓        [Change]    │
│  Steer Left:   A / ←        [Change]    │
│  Steer Right:  D / →        [Change]    │
│  Pause:        Esc           [Change]    │
│  Camera:       C             [Change]    │
│  [Reset Defaults]                        │
│                                         │
│           [ BACK ]                      │
└─────────────────────────────────────────┘
```

**Settings (GameSettings interface):**

| Setting | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Master Volume | Slider | 0-100% | 100% | Overall audio volume |
| Engine Volume | Slider | 0-100% | 60% | Engine + procedural sound volume |
| Steer Sensitivity | Slider | 0-200% | 100% | Steering response curve exponent (1.0-2.0) |
| Graphics Quality | Button group | Low/Med/High | High | Bloom strength + pixel ratio |
| Fog Toggle | Button group | On/Off | On | Enable/disable fog rendering |
| Camera Default | Button group | Chase/Wind/Hood/Bumper | Chase | Default camera view |
| Demo Mode | Toggle | On/Off | On | Enable/disable attract mode after 3 min idle |
| Key Bindings | Per-action | See 03-INPUT-SPEC | Defaults | Rebindable controls |

**Fog Toggle:**
- Controls `scene.fog` visibility
- Useful for testing and debugging
- Persisted to localStorage
- Default: On (fog visible)

**Camera Default:**
- Sets the starting camera view for races
- Can be overridden mid-race with camera button
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

### 3.10 Demo Mode (Attract)

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
