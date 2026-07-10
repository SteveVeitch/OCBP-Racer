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
```

Note: LOADING state was removed. Track select directly triggers race start.

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
│                                         │
│           v0.1.0 MVP                    │
└─────────────────────────────────────────┘
```

**Elements:**
| Element | Type | Action |
|---------|------|--------|
| Title | Heading | "OCBP RACER" — decorative |
| Subtitle | Text | "STREET RACING" |
| Start Race | Button (primary) | → CAR_SELECT |
| Version | Text | "v0.1.0 MVP" |

### 3.2 Car Select

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│           SELECT CAR                    │
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ PGT │ │ VRS │ │ ISS │ │ AVT │      │
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
- Subtitle
- 4 stat bars: Power, Grip, Speed, Drift

### 3.3 Track Select

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│           SELECT TRACK                  │
│                                         │
│        Midnight Circuit                 │
│        1.8 km • 3 Laps • Urban Night    │
│                                         │
│         [BACK]  [START RACE]            │
└─────────────────────────────────────────┘
```

**Note:** Only 1 track in MVP. Clicking "Start Race" begins the race.

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

### 3.5 In-Race HUD

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│   LAP 1/3    TIME 0:00.00    BEST --:--│
│                                         │
│                                         │
│                                         │
│                                         │
│ ┌──────────────┐           ┌──────────┐ │
│ │   142 km/h   │           │    1st   │ │
│ │  ▂▃▅▆▇█▇▅▃▂ │           │          │ │
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
| Wrong Way | Center | Pulsing "WRONG WAY" text |

### 3.6 Pause Menu

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│              PAUSED                     │
│                                         │
│         [ RESUME    ]                   │
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

### 3.7 Race Results

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│           1st                           │
│                                         │
│           Total Time                    │
│           1:42.356                      │
│                                         │
│           Best Lap                      │
│           0:32.123                      │
│                                         │
│         [RACE AGAIN]  [MAIN MENU]       │
│                                         │
└─────────────────────────────────────────┘
```

**Elements:**
- Final position (large, gold, with ordinal suffix)
- Total race time
- Best lap time
- Buttons: Race Again (→ restart), Main Menu (→ menu)

## 4. UI Styling

### 4.1 Design System

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

### 4.2 Visual Style
- Dark, semi-transparent backgrounds
- Neon accents (street racer aesthetic)
- Sharp corners (no border-radius)
- Subtle glow effects on active elements
- Monospace numbers for speed/times (Courier New)

### 4.3 Typography
```
Title:        72px, Bold, Rajdhani, neon green glow
Subtitle:     24px, Rajdhani, dim color, wide spacing
Button:       22px, Semi-bold, Rajdhani, uppercase
HUD Speed:    48px, Monospace, bold, neon green
HUD RPM:      10px, Rajdhani
HUD Items:    24px, Monospace, neon green
Results:      96px, Bold, Rajdhani, gold
```

### 4.4 Button Style
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

## 5. UI Animations

### 5.1 Transitions
- Screen transitions: Fade in (0.3s)
- Menu selection: Scale up on hover (1.02x)
- Button press: Scale down (0.98x)

### 5.2 HUD Updates
- Speed number: Updates every frame (no smoothing)
- RPM bar: Updates every frame (linear gradient)
- Wrong way: Pulse animation (0.5s infinite)
- Countdown numbers: Fade in (0.5s)

## 6. Centered Layout

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

## 7. Responsive Design

### 7.1 Target Resolution
- Primary: 1920×1080
- Minimum: 1280×720
- UI scales proportionally

### 7.2 UI Scaling
```
Scale Factor = min(screenWidth / 1920, screenHeight / 1080)
Apply to all UI element sizes
```

## 8. Settings Menu (Post-MVP)

| Setting | Options |
|---------|---------|
| Resolution | 720p, 1080p, 1440p |
| Fullscreen | On/Off |
| VSync | On/Off |
| Master Volume | 0-100% |
| SFX Volume | 0-100% |
| Music Volume | 0-100% |
| Graphics Quality | Low, Medium, High |
| Steer Sensitivity | 0.5-2.0 |
| Dead Zone | 0.05-0.3 |

## 9. Acceptance Criteria

| Test | Pass Condition |
|------|---------------|
| All screens render | Every UI state displays correctly |
| Navigation works | Keyboard and gamepad navigate menus |
| HUD displays | Speed, lap, position visible during race |
| HUD updates | Values change in real-time |
| Pause works | Game freezes, menu appears |
| Results show | Correct position and times displayed |
| Responsive | UI scales on different resolutions |
| No UI lag | Animations smooth at 60 FPS |
| Styling consistent | All screens match design system |
| Centered layout | All screens centered vertically and horizontally |
