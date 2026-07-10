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

## 2. Game State Machine

```
MENU → CAR_SELECT → TRACK_SELECT → LOADING → COUNTDOWN → RACING → PAUSED → RESULTS → MENU
         ↑                                                              │
         └──────────────────────────────────────────────────────────────┘
                                    (back / restart)
```

## 3. Screen Definitions

### 3.1 Main Menu

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│           OCBP RACER                    │
│           ─────────                     │
│                                         │
│           [ START RACE ]                │
│           [ SETTINGS    ]               │
│           [ QUIT        ]               │
│                                         │
│           v0.1.0                        │
└─────────────────────────────────────────┘
```

**Elements:**
| Element | Type | Action |
|---------|------|--------|
| Title | Heading | Decorative |
| Start Race | Button | → CAR_SELECT |
| Settings | Button | → Settings modal |
| Quit | Button | Close tab / show message |
| Version | Text | Display only |

**Background:**
- Animated car silhouette or blurred track preview
- Subtle particle effect (optional)

### 3.2 Car Select

**Layout:**
```
┌─────────────────────────────────────────┐
│  ← BACK                                 │
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ PGT │ │ VRS │ │ ISS │ │ AVT │      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
│                                         │
│  PHANTOM GT                             │
│  "The Gentleman's Express"              │
│                                         │
│  POWER  ████░░░░░░  65%                 │
│  GRIP   ██████░░░░  75%                 │
│  SPEED  ███████░░░  80%                 │
│  DRIFT  ███░░░░░░░  40%                 │
│                                         │
│           [ SELECT ]                    │
└─────────────────────────────────────────┘
```

**Interactions:**
- Left/Right arrows or A/D to browse cars
- Enter/Space or A button to select
- Escape or B button to go back
- 3D car model rotates in background

### 3.3 Track Select

**Layout:**
```
┌─────────────────────────────────────────┐
│  ← BACK                                 │
│                                         │
│        MIDNIGHT CIRCUIT                 │
│        ─────────────────                │
│                                         │
│        [Track preview image]            │
│                                         │
│        Length: 1.8km                    │
│        Laps: 3                          │
│                                         │
│           [ START RACE ]                │
└─────────────────────────────────────────┘
```

**Note:** Only 1 track in MVP, but UI shows track info for future expansion.

### 3.4 Loading Screen

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│           Loading...                    │
│           ████████░░░░░░  65%           │
│                                         │
│           "Drifting is just stylish     │
│            cornering"                   │
│                                         │
└─────────────────────────────────────────┘
```

**Elements:**
- Progress bar (0-100%)
- Loading tips (rotate randomly)
- Animated spinner or pulse

### 3.5 Countdown

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│              3                          │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Behavior:**
- Large centered number
- Counts: 3 → 2 → 1 → GO!
- Each number fades in/out
- "GO!" is green, larger, slightly longer
- Input locked during countdown
- Cars cannot move

### 3.6 In-Race HUD

**Layout:**
```
┌─────────────────────────────────────────┐
│ LAP 2/5          POSITION 1/4    TIME   │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│ ┌──────────────┐           ┌──────────┐ │
│ │   142 km/h   │           │  ▲ 3rd   │ │
│ │  ┌────────┐  │           │  ▲ 2nd   │ │
│ │  │ RPM    │  │           │  ● 1st   │ │
│ │  │ ████░░ │  │           │  ▼ 4th   │ │
│ │  └────────┘  │           │          │ │
│ └──────────────┘           └──────────┘ │
└─────────────────────────────────────────┘
```

**HUD Elements:**

| Element | Position | Content |
|---------|----------|---------|
| Lap Counter | Top-left | "LAP 2/5" |
| Position | Top-center | "POSITION 1/4" |
| Timer | Top-right | Current lap time + best |
| Speedometer | Bottom-left | Digital km/h + analog gauge |
| RPM Bar | Bottom-left | Horizontal bar below speed |
| Position Indicator | Bottom-right | Vertical list of positions |

### 3.7 Pause Menu

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│         ▐▐  PAUSED                      │
│                                         │
│         [ RESUME    ]                   │
│         [ RESTART   ]                   │
│         [ QUIT RACE ]                   │
│                                         │
└─────────────────────────────────────────┘
```

**Behavior:**
- Game freezes completely
- Semi-transparent dark overlay
- Input blocked except menu navigation
- Escape or Start button to pause/unpause

### 3.8 Race Results

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│           RACE COMPLETE                 │
│           ─────────────                 │
│                                         │
│           1st PLACE                     │
│                                         │
│           Time: 1:42.356                │
│           Best Lap: 0:32.123            │
│                                         │
│           [ RACE AGAIN ]                │
│           [ MAIN MENU  ]                │
└─────────────────────────────────────────┘
```

**Elements:**
- Final position (1st, 2nd, etc.)
- Total race time
- Best lap time
- Buttons to continue

## 4. UI Styling

### 4.1 Design System

```
Font:             'Rajdhani' (Google Fonts) or system monospace
Primary Color:    #00ff88 (neon green)
Secondary Color:  #ff3366 (hot pink)
Background:       rgba(0, 0, 0, 0.7)
Text Color:       #ffffff
Accent:           #ffcc00 (gold)
```

### 4.2 Visual Style
- Dark, semi-transparent backgrounds
- Neon accents (street racer aesthetic)
- Sharp corners (no border-radius)
- Subtle glow effects on active elements
- Monospace numbers for speed/times

### 4.3 Typography
```
Title:        48px, Bold
Heading:      32px, Bold
Body:         18px, Regular
HUD Numbers:  24px, Monospace
Small:        14px, Regular
```

## 5. UI Animations

### 5.1 Transitions
- Screen transitions: Fade in/out (0.3s)
- Menu selection: Scale up on hover (1.05x)
- Button press: Scale down (0.95x) then back

### 5.2 HUD Updates
- Speed number: Smooth count up/down (0.1s interpolation)
- Lap counter: Slide in from top
- Position change: Flash + color change
- Timer: Red when behind best time, green when ahead

## 6. Responsive Design

### 6.1 Target Resolution
- Primary: 1920×1080
- Minimum: 1280×720
- Scale UI proportionally

### 6.2 UI Scaling
```
Scale Factor = min(screenWidth / 1920, screenHeight / 1080)
Apply to all UI element sizes
```

## 7. Accessibility

### 7.1 Keyboard Navigation
- All menus navigable with keyboard
- Focus indicators visible
- Tab order logical

### 7.2 Screen Reader (Post-MVP)
- ARIA labels on interactive elements
- Announce state changes

### 7.3 Color Blindness (Post-MVP)
- Avoid red/green for critical info
- Use shapes + colors for position indicator

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
