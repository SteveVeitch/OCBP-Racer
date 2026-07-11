import { StateMachine } from '../core/StateMachine'
import { CARS } from '../cars/CarConfigs'
import { TRACKS } from '../track/TrackDefinitions'

export class UIManager {
  private container!: HTMLDivElement
  private state: StateMachine
  private onCarSelected?: (id: string) => void
  private onTrackSelected?: (id: string) => void
  private onRaceStart?: () => void
  private onRestart?: () => void
  private onBackToMenu?: () => void
  private onSettingsChanged?: () => void
  private selectedCarIndex = 0
  private selectedTrackIndex = 0

  constructor(state: StateMachine) {
    this.state = state
  }

  init(callbacks: {
    onCarSelected?: (id: string) => void
    onTrackSelected?: (id: string) => void
    onRaceStart?: () => void
    onRestart?: () => void
    onBackToMenu?: () => void
    onSettingsChanged?: () => void
  }): void {
    this.onCarSelected = callbacks.onCarSelected
    this.onTrackSelected = callbacks.onTrackSelected
    this.onRaceStart = callbacks.onRaceStart
    this.onRestart = callbacks.onRestart
    this.onBackToMenu = callbacks.onBackToMenu
    this.onSettingsChanged = callbacks.onSettingsChanged

    this.container = document.createElement('div')
    this.container.id = 'ui-container'
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 100;
      font-family: 'Segoe UI', system-ui, sans-serif;
      transform-origin: top left;
    `
    document.body.appendChild(this.container)

    this.injectStyles()
    this.setupStateListeners()
    this.setupResponsiveScaling()
    this.showScreen('MENU')
  }

  private setupResponsiveScaling(): void {
    const updateScale = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      const baseW = 1920
      const baseH = 1080
      const scaleX = w / baseW
      const scaleY = h / baseH
      const scale = Math.max(Math.min(scaleX, scaleY), 0.5)
      this.container.style.transform = `scale(${scale})`
      this.container.style.width = `${baseW}px`
      this.container.style.height = `${baseH}px`
    }
    updateScale()
    window.addEventListener('resize', updateScale)
  }

  private injectStyles(): void {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');

      :root {
        --primary: #00ff88;
        --secondary: #ff3366;
        --accent: #ffcc00;
        --bg-dark: rgba(10, 10, 26, 0.92);
        --bg-darker: rgba(5, 5, 15, 0.95);
        --text: #ffffff;
        --text-dim: #8888aa;
        --border: rgba(255, 255, 255, 0.1);
      }

      .ui-screen {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: none;
        pointer-events: auto;
      }

      .ui-screen.active {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .ui-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-darker);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      @keyframes glow {
        0%, 100% { text-shadow: 0 0 10px var(--primary), 0 0 20px var(--primary); }
        50% { text-shadow: 0 0 20px var(--primary), 0 0 40px var(--primary), 0 0 60px var(--primary); }
      }

      .menu-title {
        font-family: 'Rajdhani', sans-serif;
        font-size: 72px;
        font-weight: 700;
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 8px;
        margin-bottom: 8px;
        text-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
      }

      .menu-subtitle {
        font-family: 'Rajdhani', sans-serif;
        font-size: 24px;
        color: var(--text-dim);
        letter-spacing: 12px;
        text-transform: uppercase;
        margin-bottom: 60px;
      }

      .menu-btn {
        font-family: 'Rajdhani', sans-serif;
        font-size: 22px;
        font-weight: 600;
        color: var(--text);
        background: transparent;
        border: 2px solid var(--border);
        padding: 14px 48px;
        margin: 8px;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 3px;
        transition: all 0.2s ease;
        min-width: 280px;
        text-align: center;
      }

      .menu-btn:hover {
        border-color: var(--primary);
        color: var(--primary);
        background: rgba(0, 255, 136, 0.05);
        transform: scale(1.02);
      }

      .menu-btn:active {
        transform: scale(0.98);
      }

      .menu-btn.primary {
        border-color: var(--primary);
        color: var(--primary);
        background: rgba(0, 255, 136, 0.1);
      }

      .menu-btn.primary:hover {
        background: rgba(0, 255, 136, 0.2);
      }

      .car-select-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 1000px;
        padding: 40px;
      }

      .car-grid {
        display: flex;
        gap: 20px;
        margin: 30px 0;
        justify-content: center;
        flex-wrap: wrap;
      }

      .car-card {
        width: 200px;
        padding: 20px;
        background: var(--bg-dark);
        border: 2px solid var(--border);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
      }

      .car-card:hover {
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-4px);
      }

      .car-card.selected {
        border-color: var(--primary);
        background: rgba(0, 255, 136, 0.08);
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
      }

      .car-card-name {
        font-family: 'Rajdhani', sans-serif;
        font-size: 20px;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 4px;
      }

      .car-card-subtitle {
        font-size: 12px;
        color: var(--text-dim);
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .car-color-preview {
        width: 100%;
        height: 60px;
        margin-bottom: 12px;
        border-radius: 2px;
      }

      .car-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 6px 0;
        font-size: 11px;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .car-stat-bar {
        width: 80px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        position: relative;
      }

      .car-stat-fill {
        height: 100%;
        background: var(--primary);
        transition: width 0.3s ease;
      }

      .hud {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 50;
      }

      .hud-top {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 30px;
        align-items: center;
      }

      .hud-item {
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        color: var(--text);
        text-transform: uppercase;
        letter-spacing: 2px;
        background: var(--bg-dark);
        padding: 8px 20px;
        border: 1px solid var(--border);
      }

      .hud-item .label {
        font-size: 10px;
        color: var(--text-dim);
        display: block;
      }

      .hud-item .value {
        font-size: 24px;
        font-family: 'Courier New', monospace;
        color: var(--primary);
      }

      .hud-speed {
        position: absolute;
        bottom: 30px;
        left: 30px;
        background: var(--bg-dark);
        padding: 15px 25px;
        border: 1px solid var(--border);
        text-align: center;
      }

      .hud-speed .speed-value {
        font-family: 'Courier New', monospace;
        font-size: 48px;
        font-weight: 700;
        color: var(--primary);
        line-height: 1;
      }

      .hud-speed .speed-unit {
        font-size: 12px;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 2px;
      }

      .hud-position {
        position: absolute;
        bottom: 30px;
        right: 30px;
        background: var(--bg-dark);
        padding: 15px 25px;
        border: 1px solid var(--border);
        text-align: center;
      }

      .hud-position .pos-value {
        font-family: 'Courier New', monospace;
        font-size: 48px;
        font-weight: 700;
        color: var(--accent);
        line-height: 1;
      }

      .hud-position .pos-suffix {
        font-size: 18px;
        color: var(--accent);
        vertical-align: super;
      }

      .hud-wrong-way {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Rajdhani', sans-serif;
        font-size: 48px;
        font-weight: 700;
        color: var(--secondary);
        text-transform: uppercase;
        letter-spacing: 8px;
        animation: pulse 0.5s ease infinite;
        display: none;
      }

      .hud-wrong-way.visible {
        display: block;
      }

      .countdown-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 200;
        pointer-events: none;
      }

      .countdown-overlay.active {
        display: flex;
      }

      .countdown-number {
        font-family: 'Rajdhani', sans-serif;
        font-size: 180px;
        font-weight: 700;
        color: var(--primary);
        text-shadow: 0 0 40px rgba(0, 255, 136, 0.6);
        animation: pulse 0.5s ease;
      }

      .countdown-go {
        color: var(--accent);
        text-shadow: 0 0 40px rgba(255, 204, 0, 0.6);
        font-size: 120px;
      }

      .pause-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 150;
        flex-direction: column;
      }

      .pause-overlay.active {
        display: flex;
      }

      .pause-title {
        font-family: 'Rajdhani', sans-serif;
        font-size: 48px;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 40px;
        text-transform: uppercase;
        letter-spacing: 8px;
      }

      .results-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: var(--bg-darker);
        padding: 50px 80px;
        border: 1px solid var(--border);
        animation: slideUp 0.5s ease;
      }

      .results-position {
        font-family: 'Rajdhani', sans-serif;
        font-size: 96px;
        font-weight: 700;
        color: var(--accent);
        line-height: 1;
        margin-bottom: 10px;
      }

      .results-position-suffix {
        font-size: 36px;
        vertical-align: super;
      }

      .results-time {
        font-family: 'Courier New', monospace;
        font-size: 28px;
        color: var(--text);
        margin: 8px 0;
      }

      .results-label {
        font-size: 12px;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 4px;
      }

      .results-buttons {
        display: flex;
        gap: 16px;
        margin-top: 40px;
      }

      .version-text {
        position: fixed;
        bottom: 10px;
        right: 15px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.2);
        z-index: 10;
      }

      .track-info {
        background: var(--bg-dark);
        padding: 30px 50px;
        border: 1px solid var(--border);
        margin: 30px 0;
        text-align: center;
        min-width: 400px;
      }

      .track-name {
        font-family: 'Rajdhani', sans-serif;
        font-size: 36px;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 8px;
      }

      .track-details {
        font-size: 14px;
        color: var(--text-dim);
        letter-spacing: 2px;
        text-transform: uppercase;
      }

      .rpm-bar {
        position: absolute;
        bottom: 90px;
        left: 30px;
        width: 160px;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid var(--border);
      }

      .rpm-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary), var(--accent), var(--secondary));
        transition: width 0.05s linear;
      }

      .settings-panel {
        background: var(--bg-darker);
        padding: 50px 80px;
        border: 1px solid var(--border);
        animation: slideUp 0.3s ease;
        min-width: 500px;
      }

      .settings-title {
        font-family: 'Rajdhani', sans-serif;
        font-size: 42px;
        font-weight: 700;
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 6px;
        margin-bottom: 30px;
        text-align: center;
      }

      .settings-group {
        margin-bottom: 24px;
      }

      .settings-label {
        font-family: 'Rajdhani', sans-serif;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 8px;
        display: block;
      }

      .settings-slider {
        width: 100%;
        height: 6px;
        -webkit-appearance: none;
        appearance: none;
        background: rgba(255, 255, 255, 0.1);
        outline: none;
        cursor: pointer;
      }

      .settings-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        background: var(--primary);
        border: none;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
      }

      .settings-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: var(--primary);
        border: none;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
      }

      .settings-value {
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: var(--primary);
        float: right;
        margin-top: -22px;
      }

      .settings-options {
        display: flex;
        gap: 8px;
      }

      .settings-option {
        flex: 1;
        padding: 10px;
        background: transparent;
        border: 2px solid var(--border);
        color: var(--text-dim);
        font-family: 'Rajdhani', sans-serif;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
      }

      .settings-option:hover {
        border-color: rgba(255, 255, 255, 0.3);
        color: var(--text);
      }

      .settings-option.active {
        border-color: var(--primary);
        color: var(--primary);
        background: rgba(0, 255, 136, 0.1);
      }

      .settings-buttons {
        display: flex;
        gap: 16px;
        justify-content: center;
        margin-top: 30px;
      }

      .demo-hud {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 50;
      }

      .demo-hud-top {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        background: var(--bg-dark);
        padding: 12px 32px;
        border: 1px solid var(--border);
      }

      .demo-hud-car {
        font-family: 'Rajdhani', sans-serif;
        font-size: 28px;
        font-weight: 700;
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 3px;
      }

      .demo-hud-track {
        font-family: 'Rajdhani', sans-serif;
        font-size: 16px;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-top: 2px;
      }

      .demo-hud-conditions {
        font-size: 12px;
        color: var(--text-dim);
        letter-spacing: 1px;
        margin-top: 4px;
      }

      .demo-hud-prompt {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        font-family: 'Rajdhani', sans-serif;
        font-size: 18px;
        color: rgba(255, 255, 255, 0.4);
        text-transform: uppercase;
        letter-spacing: 3px;
        animation: pulse 2s ease infinite;
      }

      .settings-toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .settings-toggle-label {
        font-family: 'Rajdhani', sans-serif;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 2px;
      }

      .settings-toggle-btn {
        width: 52px;
        height: 28px;
        border-radius: 14px;
        border: 2px solid var(--border);
        background: rgba(255, 255, 255, 0.1);
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
      }

      .settings-toggle-btn.active {
        border-color: var(--primary);
        background: rgba(0, 255, 136, 0.2);
      }

      .settings-toggle-btn::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--text-dim);
        transition: all 0.2s ease;
      }

      .settings-toggle-btn.active::after {
        left: 26px;
        background: var(--primary);
      }
    `
    document.head.appendChild(style)
  }

  private setupStateListeners(): void {
    this.state.on('MENU', () => this.showScreen('MENU'))
    this.state.on('CAR_SELECT', () => this.showScreen('CAR_SELECT'))
    this.state.on('TRACK_SELECT', () => this.showScreen('TRACK_SELECT'))
    this.state.on('SETTINGS', () => this.showScreen('SETTINGS'))
    this.state.on('COUNTDOWN', () => this.showCountdown())
    this.state.on('RACING', () => this.showHUD())
    this.state.on('PAUSED', () => this.showPause())
    this.state.on('RESULTS', () => this.showResults())
    this.state.on('DEMO', () => this.showDemoHUDFromState())
  }

  private showScreen(name: string): void {
    this.container.innerHTML = ''

    const screen = document.createElement('div')
    screen.className = 'ui-screen active'

    switch (name) {
      case 'MENU':
        this.buildMainMenu(screen)
        break
      case 'CAR_SELECT':
        this.buildCarSelect(screen)
        break
      case 'TRACK_SELECT':
        this.buildTrackSelect(screen)
        break
      case 'SETTINGS':
        this.buildSettings(screen)
        break
    }

    this.container.appendChild(screen)
  }

  private buildMainMenu(parent: HTMLElement): void {
    const overlay = document.createElement('div')
    overlay.className = 'ui-overlay'

    const title = document.createElement('div')
    title.className = 'menu-title'
    title.textContent = 'OCBP RACER'

    const subtitle = document.createElement('div')
    subtitle.className = 'menu-subtitle'
    subtitle.textContent = 'Street Racing'

    const startBtn = this.createButton('Start Race', 'primary')
    startBtn.onclick = () => this.state.transition('CAR_SELECT')

    const settingsBtn = this.createButton('Settings')
    settingsBtn.onclick = () => this.state.transition('SETTINGS')

    const version = document.createElement('div')
    version.className = 'version-text'
    version.textContent = 'v0.1.0 MVP'

    overlay.appendChild(title)
    overlay.appendChild(subtitle)
    overlay.appendChild(startBtn)
    overlay.appendChild(settingsBtn)
    overlay.appendChild(version)
    parent.appendChild(overlay)
  }

  private buildCarSelect(parent: HTMLElement): void {
    const overlay = document.createElement('div')
    overlay.className = 'ui-overlay'

    const container = document.createElement('div')
    container.className = 'car-select-container'

    const title = document.createElement('div')
    title.className = 'menu-title'
    title.style.fontSize = '42px'
    title.style.marginBottom = '10px'
    title.textContent = 'SELECT CAR'

    const grid = document.createElement('div')
    grid.className = 'car-grid'

    CARS.forEach((car, index) => {
      const card = document.createElement('div')
      card.className = `car-card ${index === this.selectedCarIndex ? 'selected' : ''}`
      card.onclick = () => {
        this.selectedCarIndex = index
        this.state.setSelectedCar(car.id)
        this.onCarSelected?.(car.id)
        grid.querySelectorAll('.car-card').forEach(c => c.classList.remove('selected'))
        card.classList.add('selected')
      }

      const colorPreview = document.createElement('div')
      colorPreview.className = 'car-color-preview'
      colorPreview.style.background = `#${car.color.toString(16).padStart(6, '0')}`

      const name = document.createElement('div')
      name.className = 'car-card-name'
      name.textContent = car.name

      const subtitle = document.createElement('div')
      subtitle.className = 'car-card-subtitle'
      subtitle.textContent = car.subtitle

      const engineBadge = document.createElement('div')
      engineBadge.className = 'car-card-subtitle'
      engineBadge.style.color = 'var(--primary)'
      engineBadge.style.marginBottom = '12px'
      engineBadge.textContent = `${car.engine.displacement} ${car.engine.type} \u2022 ${car.engine.horsepower} HP`

      const stats = [
        { label: 'Power', value: car.config.engineForce / 8500 },
        { label: 'Grip', value: car.config.peakGrip / 2.4 },
        { label: 'Speed', value: car.config.maxSpeed / 265 },
        { label: 'Drift', value: car.config.slipAngleLimit / 35 }
      ]

      const statsContainer = document.createElement('div')
      stats.forEach(stat => {
        const row = document.createElement('div')
        row.className = 'car-stat'
        row.innerHTML = `
          <span>${stat.label}</span>
          <div class="car-stat-bar">
            <div class="car-stat-fill" style="width: ${stat.value * 100}%"></div>
          </div>
        `
        statsContainer.appendChild(row)
      })

      card.appendChild(colorPreview)
      card.appendChild(name)
      card.appendChild(subtitle)
      card.appendChild(engineBadge)
      card.appendChild(statsContainer)
      grid.appendChild(card)
    })

    const backBtn = this.createButton('Back')
    backBtn.onclick = () => this.state.transition('MENU')

    const nextBtn = this.createButton('Next', 'primary')
    nextBtn.onclick = () => this.state.transition('TRACK_SELECT')

    const buttons = document.createElement('div')
    buttons.style.display = 'flex'
    buttons.style.gap = '16px'
    buttons.appendChild(backBtn)
    buttons.appendChild(nextBtn)

    container.appendChild(title)
    container.appendChild(grid)
    container.appendChild(buttons)
    overlay.appendChild(container)
    parent.appendChild(overlay)
  }

  private buildTrackSelect(parent: HTMLElement): void {
    const overlay = document.createElement('div')
    overlay.className = 'ui-overlay'

    const container = document.createElement('div')
    container.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%;max-width:1200px;padding:20px;'

    const title = document.createElement('div')
    title.className = 'menu-title'
    title.style.fontSize = '42px'
    title.style.marginBottom = '10px'
    title.textContent = 'SELECT TRACK'

    const trackGrid = document.createElement('div')
    trackGrid.style.cssText = 'display:grid;grid-template-columns:repeat(3,280px);gap:16px;margin:20px 0;justify-content:center;'

    const difficultyColors: Record<string, string> = {
      'Easy': '#00ff88',
      'Medium': '#ffcc00',
      'Hard': '#ff8844',
      'Expert': '#ff3366'
    }

    const terrainIcons: Record<string, string> = {
      'urban': '\u{1F3D9}',
      'coastal': '\u{1F3A4}',
      'mountain': '\u{26F0}',
      'industrial': '\u{1F3ED}'
    }

    TRACKS.forEach((track, index) => {
      const card = document.createElement('div')
      card.style.cssText = `
        padding:16px;background:var(--bg-dark);border:2px solid var(--border);
        cursor:pointer;transition:all 0.2s ease;text-align:center;
        ${index === this.selectedTrackIndex ? 'border-color:var(--primary);background:rgba(0,255,136,0.08);box-shadow:0 0 20px rgba(0,255,136,0.2);' : ''}
      `
      card.onmouseenter = () => {
        if (index !== this.selectedTrackIndex) card.style.borderColor = 'rgba(255,255,255,0.3)'
      }
      card.onmouseleave = () => {
        if (index !== this.selectedTrackIndex) card.style.borderColor = 'var(--border)'
      }
      card.onclick = () => {
        this.selectedTrackIndex = index
        this.state.setSelectedTrack(track.id)
        this.onTrackSelected?.(track.id)
        this.showScreen('TRACK_SELECT')
      }

      const terrainIcon = document.createElement('div')
      terrainIcon.style.cssText = 'font-size:28px;margin-bottom:4px;'
      terrainIcon.textContent = terrainIcons[track.terrain] || ''

      const name = document.createElement('div')
      name.style.cssText = 'font-family:Rajdhani,sans-serif;font-size:18px;font-weight:700;color:var(--text);margin-bottom:2px;'
      name.textContent = track.name

      const diffBadge = document.createElement('div')
      diffBadge.style.cssText = `font-size:11px;color:${difficultyColors[track.difficulty]};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;`
      diffBadge.textContent = track.difficulty

      const stats = document.createElement('div')
      stats.style.cssText = 'font-size:11px;color:var(--text-dim);line-height:1.6;'
      stats.innerHTML = `${track.distanceKm} km &bull; ${track.terrain}<br>${track.defaultTimeOfDay}`

      card.appendChild(terrainIcon)
      card.appendChild(name)
      card.appendChild(diffBadge)
      card.appendChild(stats)
      trackGrid.appendChild(card)
    })

    const weatherGroup = document.createElement('div')
    weatherGroup.style.cssText = 'margin:12px 0;text-align:center;'
    const weatherLabel = document.createElement('div')
    weatherLabel.style.cssText = 'font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;'
    weatherLabel.textContent = 'Weather Override'
    const weatherOptions = document.createElement('div')
    weatherOptions.className = 'settings-options'
    weatherOptions.style.justifyContent = 'center'
    const weatherChoices = ['auto', 'clear', 'rain', 'fog', 'storm']
    const currentWeather = this.state.getSettings().weatherOverride
    weatherChoices.forEach(w => {
      const btn = document.createElement('button')
      btn.className = `settings-option ${currentWeather === w ? 'active' : ''}`
      btn.style.minWidth = '80px'
      btn.textContent = w.charAt(0).toUpperCase() + w.slice(1)
      btn.onclick = () => {
        this.state.updateSettings({ weatherOverride: w })
        this.onSettingsChanged?.()
        weatherOptions.querySelectorAll('.settings-option').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
      }
      weatherOptions.appendChild(btn)
    })
    weatherGroup.appendChild(weatherLabel)
    weatherGroup.appendChild(weatherOptions)

    const buttons = document.createElement('div')
    buttons.style.cssText = 'display:flex;gap:16px;margin-top:16px;'

    const backBtn = this.createButton('Back')
    backBtn.onclick = () => this.state.transition('CAR_SELECT')

    const startBtn = this.createButton('Start Race', 'primary')
    startBtn.onclick = () => {
      this.state.setSelectedTrack(TRACKS[this.selectedTrackIndex].id)
      this.onRaceStart?.()
    }

    buttons.appendChild(backBtn)
    buttons.appendChild(startBtn)

    container.appendChild(title)
    container.appendChild(trackGrid)
    container.appendChild(weatherGroup)
    container.appendChild(buttons)
    overlay.appendChild(container)
    parent.appendChild(overlay)
  }

  private buildSettings(parent: HTMLElement): void {
    const overlay = document.createElement('div')
    overlay.className = 'ui-overlay'

    const panel = document.createElement('div')
    panel.className = 'settings-panel'

    const title = document.createElement('div')
    title.className = 'settings-title'
    title.textContent = 'Settings'

    const settings = this.state.getSettings()

    const masterGroup = this.createSliderGroup('Master Volume', settings.masterVolume, 0, 1, 0.01, (v) => {
      this.state.updateSettings({ masterVolume: v })
      this.onSettingsChanged?.()
    })

    const engineGroup = this.createSliderGroup('Engine Volume', settings.engineVolume, 0, 1, 0.01, (v) => {
      this.state.updateSettings({ engineVolume: v })
      this.onSettingsChanged?.()
    })

    const steerGroup = this.createSliderGroup('Steer Sensitivity', settings.steerSensitivity, 0, 2, 0.05, (v) => {
      this.state.updateSettings({ steerSensitivity: v })
      this.onSettingsChanged?.()
    })

    const graphicsGroup = document.createElement('div')
    graphicsGroup.className = 'settings-group'

    const graphicsLabel = document.createElement('div')
    graphicsLabel.className = 'settings-label'
    graphicsLabel.textContent = 'Graphics Quality'

    const graphicsOptions = document.createElement('div')
    graphicsOptions.className = 'settings-options'

    const qualities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high']
    qualities.forEach(q => {
      const btn = document.createElement('button')
      btn.className = `settings-option ${settings.graphicsQuality === q ? 'active' : ''}`
      btn.textContent = q.charAt(0).toUpperCase() + q.slice(1)
      btn.onclick = () => {
        this.state.updateSettings({ graphicsQuality: q })
        this.onSettingsChanged?.()
        graphicsOptions.querySelectorAll('.settings-option').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
      }
      graphicsOptions.appendChild(btn)
    })

    graphicsGroup.appendChild(graphicsLabel)
    graphicsGroup.appendChild(graphicsOptions)

    const cameraGroup = document.createElement('div')
    cameraGroup.className = 'settings-group'

    const cameraLabel = document.createElement('div')
    cameraLabel.className = 'settings-label'
    cameraLabel.textContent = 'Camera Default'

    const cameraOptions = document.createElement('div')
    cameraOptions.className = 'settings-options'

    const cameras: Array<'chase' | 'windscreen' | 'hood' | 'bumper'> = ['chase', 'windscreen', 'hood', 'bumper']
    const cameraLabels: Record<string, string> = { chase: 'Chase', windscreen: 'Windscreen', hood: 'Hood', bumper: 'Bumper' }
    cameras.forEach(c => {
      const btn = document.createElement('button')
      btn.className = `settings-option ${settings.cameraDefault === c ? 'active' : ''}`
      btn.textContent = cameraLabels[c]
      btn.onclick = () => {
        this.state.updateSettings({ cameraDefault: c })
        this.onSettingsChanged?.()
        cameraOptions.querySelectorAll('.settings-option').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
      }
      cameraOptions.appendChild(btn)
    })

    cameraGroup.appendChild(cameraLabel)
    cameraGroup.appendChild(cameraOptions)

    const fogToggle = document.createElement('div')
    fogToggle.className = 'settings-toggle'

    const fogLabel = document.createElement('div')
    fogLabel.className = 'settings-toggle-label'
    fogLabel.textContent = 'Fog'

    const fogBtn = document.createElement('button')
    fogBtn.className = `settings-toggle-btn ${settings.fogEnabled ? 'active' : ''}`
    fogBtn.onclick = () => {
      const newVal = !this.state.getSettings().fogEnabled
      this.state.updateSettings({ fogEnabled: newVal })
      this.onSettingsChanged?.()
      fogBtn.classList.toggle('active', newVal)
    }

    fogToggle.appendChild(fogLabel)
    fogToggle.appendChild(fogBtn)

    const demoToggle = document.createElement('div')
    demoToggle.className = 'settings-toggle'

    const demoLabel = document.createElement('div')
    demoLabel.className = 'settings-toggle-label'
    demoLabel.textContent = 'Demo Mode (Attract)'

    const demoBtn = document.createElement('button')
    demoBtn.className = `settings-toggle-btn ${settings.demoEnabled ? 'active' : ''}`
    demoBtn.onclick = () => {
      const newVal = !this.state.getSettings().demoEnabled
      this.state.updateSettings({ demoEnabled: newVal })
      this.onSettingsChanged?.()
      demoBtn.classList.toggle('active', newVal)
    }

    demoToggle.appendChild(demoLabel)
    demoToggle.appendChild(demoBtn)

    const buttons = document.createElement('div')
    buttons.className = 'settings-buttons'

    const backBtn = this.createButton('Back', 'primary')
    backBtn.onclick = () => {
      const prev = this.state.getPrevious()
      if (prev === 'PAUSED') {
        this.state.transition('RACING')
      } else {
        this.state.transition('MENU')
      }
    }

    buttons.appendChild(backBtn)

    panel.appendChild(title)
    panel.appendChild(masterGroup)
    panel.appendChild(engineGroup)
    panel.appendChild(steerGroup)
    panel.appendChild(graphicsGroup)
    panel.appendChild(cameraGroup)
    panel.appendChild(fogToggle)
    panel.appendChild(demoToggle)
    panel.appendChild(buttons)
    overlay.appendChild(panel)
    parent.appendChild(overlay)
  }

  private createSliderGroup(
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (v: number) => void
  ): HTMLElement {
    const group = document.createElement('div')
    group.className = 'settings-group'

    const labelEl = document.createElement('div')
    labelEl.className = 'settings-label'
    labelEl.textContent = label

    const valueEl = document.createElement('div')
    valueEl.className = 'settings-value'
    valueEl.textContent = `${Math.round(value * 100)}%`

    const slider = document.createElement('input')
    slider.type = 'range'
    slider.className = 'settings-slider'
    slider.min = String(min)
    slider.max = String(max)
    slider.step = String(step)
    slider.value = String(value)
    slider.oninput = () => {
      const v = parseFloat(slider.value)
      valueEl.textContent = `${Math.round(v * 100)}%`
      onChange(v)
    }

    group.appendChild(labelEl)
    group.appendChild(valueEl)
    group.appendChild(slider)
    return group
  }

  private showCountdown(): void {
    this.container.innerHTML = ''
    const overlay = document.createElement('div')
    overlay.className = 'countdown-overlay active'
    this.container.appendChild(overlay)
  }

  updateCountdown(value: number | string): void {
    const overlay = this.container.querySelector('.countdown-overlay')
    if (!overlay) return

    const existing = overlay.querySelector('.countdown-number')
    if (existing) existing.remove()

    const num = document.createElement('div')
    num.className = `countdown-number ${value === 'GO!' ? 'countdown-go' : ''}`
    num.textContent = String(value)
    overlay.appendChild(num)

    setTimeout(() => num.remove(), 800)
  }

  showHUD(): void {
    this.container.innerHTML = ''

    const hud = document.createElement('div')
    hud.className = 'hud'
    hud.id = 'hud'

    hud.innerHTML = `
      <div class="hud-top">
        <div class="hud-item">
          <span class="label">Lap</span>
          <span class="value" id="hud-lap">1/3</span>
        </div>
        <div class="hud-item">
          <span class="label">Time</span>
          <span class="value" id="hud-time">0:00.00</span>
        </div>
        <div class="hud-item">
          <span class="label">Best</span>
          <span class="value" id="hud-best">--:--.--</span>
        </div>
      </div>
      <div class="hud-speed">
        <div class="speed-value" id="hud-speed">0</div>
        <div class="speed-unit">km/h</div>
      </div>
      <div class="rpm-bar">
        <div class="rpm-fill" id="hud-rpm"></div>
      </div>
      <div class="hud-position">
        <span class="pos-value" id="hud-position">1</span><span class="pos-suffix" id="hud-pos-suffix">st</span>
      </div>
      <div class="hud-wrong-way" id="hud-wrong-way">WRONG WAY</div>
    `

    this.container.appendChild(hud)
  }

  updateHUD(data: {
    speed: number
    lap: number
    totalLaps: number
    time: number
    bestTime: number
    position: number
    wrongWay: boolean
    rpm: number
  }): void {
    const speedEl = document.getElementById('hud-speed')
    const lapEl = document.getElementById('hud-lap')
    const timeEl = document.getElementById('hud-time')
    const bestEl = document.getElementById('hud-best')
    const posEl = document.getElementById('hud-position')
    const posSuffix = document.getElementById('hud-pos-suffix')
    const wrongWay = document.getElementById('hud-wrong-way')
    const rpmFill = document.getElementById('hud-rpm')

    if (speedEl) speedEl.textContent = Math.round(data.speed).toString()
    if (lapEl) lapEl.textContent = `${Math.min(data.lap + 1, data.totalLaps)}/${data.totalLaps}`
    if (timeEl) timeEl.textContent = this.formatTime(data.time)
    if (bestEl) bestEl.textContent = data.bestTime > 0 ? this.formatTime(data.bestTime) : '--:--.--'
    if (posEl) posEl.textContent = data.position.toString()
    if (posSuffix) posSuffix.textContent = this.getOrdinalSuffix(data.position)
    if (wrongWay) wrongWay.classList.toggle('visible', data.wrongWay)
    if (rpmFill) rpmFill.style.width = `${Math.min(100, (data.rpm / 7500) * 100)}%`
  }

  showPause(): void {
    let pauseOverlay = document.getElementById('pause-overlay')
    if (!pauseOverlay) {
      pauseOverlay = document.createElement('div')
      pauseOverlay.id = 'pause-overlay'
      pauseOverlay.className = 'pause-overlay active'

      const title = document.createElement('div')
      title.className = 'pause-title'
      title.textContent = 'PAUSED'

      const resumeBtn = this.createButton('Resume', 'primary')
      resumeBtn.onclick = () => this.state.transition('RACING')

      const settingsBtn = this.createButton('Settings')
      settingsBtn.onclick = () => this.state.transition('SETTINGS')

      const restartBtn = this.createButton('Restart Race')
      restartBtn.onclick = () => {
        this.onRestart?.()
      }

      const quitBtn = this.createButton('Quit Race')
      quitBtn.onclick = () => {
        this.onBackToMenu?.()
      }

      pauseOverlay.appendChild(title)
      pauseOverlay.appendChild(resumeBtn)
      pauseOverlay.appendChild(settingsBtn)
      pauseOverlay.appendChild(restartBtn)
      pauseOverlay.appendChild(quitBtn)
      this.container.appendChild(pauseOverlay)
    } else {
      pauseOverlay.classList.add('active')
    }
  }

  hidePause(): void {
    const pauseOverlay = document.getElementById('pause-overlay')
    if (pauseOverlay) pauseOverlay.classList.remove('active')
  }

  showResults(): void {
    const results = this.state.getRaceResults()
    if (!results) return

    this.container.innerHTML = ''

    const screen = document.createElement('div')
    screen.className = 'ui-screen active'

    const overlay = document.createElement('div')
    overlay.className = 'ui-overlay'

    const container = document.createElement('div')
    container.className = 'results-container'

    const pos = document.createElement('div')
    pos.className = 'results-position'
    pos.innerHTML = `${results.position}<span class="results-position-suffix">${this.getOrdinalSuffix(results.position)}</span>`

    const timeLabel = document.createElement('div')
    timeLabel.className = 'results-label'
    timeLabel.textContent = 'Total Time'

    const time = document.createElement('div')
    time.className = 'results-time'
    time.textContent = this.formatTime(results.totalTime)

    const bestLabel = document.createElement('div')
    bestLabel.className = 'results-label'
    bestLabel.textContent = 'Best Lap'

    const best = document.createElement('div')
    best.className = 'results-time'
    best.textContent = this.formatTime(results.bestLapTime)

    const buttons = document.createElement('div')
    buttons.className = 'results-buttons'

    const raceAgainBtn = this.createButton('Race Again', 'primary')
    raceAgainBtn.onclick = () => {
      this.onRestart?.()
    }

    const menuBtn = this.createButton('Main Menu')
    menuBtn.onclick = () => {
      this.onBackToMenu?.()
    }

    buttons.appendChild(raceAgainBtn)
    buttons.appendChild(menuBtn)

    container.appendChild(pos)
    container.appendChild(timeLabel)
    container.appendChild(time)
    container.appendChild(bestLabel)
    container.appendChild(best)
    container.appendChild(buttons)
    overlay.appendChild(container)
    screen.appendChild(overlay)
    this.container.appendChild(screen)
  }

  hideAll(): void {
    this.container.innerHTML = ''
  }

  showDemoHUD(carName: string, trackName: string, weatherName: string, todName: string): void {
    this.container.innerHTML = ''

    const hud = document.createElement('div')
    hud.className = 'demo-hud'
    hud.id = 'demo-hud'

    const top = document.createElement('div')
    top.className = 'demo-hud-top'

    const carLabel = document.createElement('div')
    carLabel.className = 'demo-hud-car'
    carLabel.textContent = carName

    const trackLabel = document.createElement('div')
    trackLabel.className = 'demo-hud-track'
    trackLabel.textContent = trackName

    const conditions = document.createElement('div')
    conditions.className = 'demo-hud-conditions'
    conditions.textContent = `${weatherName} \u2022 ${todName}`

    top.appendChild(carLabel)
    top.appendChild(trackLabel)
    top.appendChild(conditions)

    const prompt = document.createElement('div')
    prompt.className = 'demo-hud-prompt'
    prompt.textContent = 'Press any key to return to menu'

    hud.appendChild(top)
    hud.appendChild(prompt)
    this.container.appendChild(hud)
  }

  private showDemoHUDFromState(): void {
    const car = this.state.getSelectedCar()
    const track = this.state.getSelectedTrack()
    const carDef = CARS.find(c => c.id === car)
    const trackDef = TRACKS.find(t => t.id === track)
    this.showDemoHUD(
      carDef?.name ?? 'Unknown',
      trackDef?.name ?? 'Unknown',
      this.state.getSettings().weatherOverride === 'auto' ? 'Clear' : this.state.getSettings().weatherOverride,
      'Day'
    )
  }

  private createButton(text: string, variant?: string): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = `menu-btn ${variant || ''}`
    btn.textContent = text
    return btn
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toFixed(2).padStart(5, '0')}`
  }

  private getOrdinalSuffix(n: number): string {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }
}
