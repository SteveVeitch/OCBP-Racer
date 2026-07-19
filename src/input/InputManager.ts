export interface InputState {
  throttle: number
  brake: number
  steer: number
  pause: boolean
  confirm: boolean
  back: boolean
  cameraSwitch: boolean
}

export interface KeyBindings {
  throttle: string[]
  brake: string[]
  steerLeft: string[]
  steerRight: string[]
  pause: string[]
  confirm: string[]
  back: string[]
  cameraSwitch: string[]
}

export interface GamepadBinding {
  type: 'axis' | 'button'
  index: number
  direction?: 1 | -1
}

export interface GamepadBindings {
  throttle: GamepadBinding
  brake: GamepadBinding
  steerLeft: GamepadBinding
  steerRight: GamepadBinding
  pause: GamepadBinding
  confirm: GamepadBinding
  back: GamepadBinding
  cameraSwitch: GamepadBinding
}

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  throttle: ['KeyW', 'ArrowUp'],
  brake: ['KeyS', 'ArrowDown'],
  steerLeft: ['KeyA', 'ArrowLeft'],
  steerRight: ['KeyD', 'ArrowRight'],
  pause: ['Escape'],
  confirm: ['Enter', 'Space'],
  back: ['Escape'],
  cameraSwitch: ['KeyC']
}

export const DEFAULT_GAMEPAD_BINDINGS: GamepadBindings = {
  throttle: { type: 'button', index: 7, direction: 1 },
  brake: { type: 'button', index: 6, direction: 1 },
  steerLeft: { type: 'axis', index: 0, direction: -1 },
  steerRight: { type: 'axis', index: 0, direction: 1 },
  pause: { type: 'button', index: 9 },
  confirm: { type: 'button', index: 0 },
  back: { type: 'button', index: 1 },
  cameraSwitch: { type: 'button', index: 3 }
}

const STORAGE_KEY = 'ocbp-bindings'
const GAMEPAD_STORAGE_KEY = 'ocbp-gamepad-bindings'

function loadBindings(): KeyBindings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return { ...DEFAULT_KEY_BINDINGS, ...JSON.parse(raw) }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_KEY_BINDINGS }
}

function saveBindings(bindings: KeyBindings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings))
  } catch { /* ignore */ }
}

function loadGamepadBindings(): GamepadBindings {
  try {
    const raw = localStorage.getItem(GAMEPAD_STORAGE_KEY)
    if (raw) {
      return { ...DEFAULT_GAMEPAD_BINDINGS, ...JSON.parse(raw) }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_GAMEPAD_BINDINGS }
}

function saveGamepadBindings(bindings: GamepadBindings): void {
  try {
    localStorage.setItem(GAMEPAD_STORAGE_KEY, JSON.stringify(bindings))
  } catch { /* ignore */ }
}

export type GamepadBindingAction = keyof GamepadBindings

export class InputManager {
  private keys: Set<string> = new Set()
  private gamepadIndex: number | null = null

  private readonly DEAD_ZONE = 0.15
  private STEER_EXPONENT = 1.4

  private bindings: KeyBindings = loadBindings()
  private listeningFor: keyof KeyBindings | null = null
  private onBindingChanged?: (action: keyof KeyBindings, keys: string[]) => void

  private gamepadBindings: GamepadBindings = loadGamepadBindings()
  private listeningForGamepad: GamepadBindingAction | null = null
  private onGamepadBindingChanged?: (action: GamepadBindingAction, binding: GamepadBinding) => void
  private prevGamepadState: { buttons: boolean[]; axes: number[] } = { buttons: [], axes: [] }

  constructor() {
    this.setupKeyboard()
    this.setupGamepad()
  }

  private setupKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      if (this.listeningFor) {
        e.preventDefault()
        e.stopPropagation()
        this.handleNewBinding(e.code)
        return
      }

      const allBoundKeys = Object.values(this.bindings).flat()
      if (allBoundKeys.includes(e.code)) {
        e.preventDefault()
      }
      this.keys.add(e.code)
    })

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code)
    })

    window.addEventListener('blur', () => {
      this.keys.clear()
      this.gamepadIndex = null
    })

    window.addEventListener('focus', () => {
      const gamepads = navigator.getGamepads()
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          this.gamepadIndex = i
          break
        }
      }
    })
  }

  private setupGamepad(): void {
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadIndex = e.gamepad.index
      console.log(`[Input] Gamepad connected: "${e.gamepad.id}" at index ${e.gamepad.index}`)
    })

    window.addEventListener('gamepaddisconnected', (e) => {
      console.log(`[Input] Gamepad disconnected: "${e.gamepad.id}"`)
      if (this.gamepadIndex === e.gamepad.index) {
        this.gamepadIndex = null
      }
    })
  }

  setSteerSensitivity(sensitivity: number): void {
    this.STEER_EXPONENT = 1.0 + (1 - Math.max(0, Math.min(1, sensitivity))) * 1.0
  }

  getState(): InputState {
    const kbState = this.getKeyboardState()
    if (this.gamepadIndex === null) {
      this.rescanGamepads()
    }
    if (this.gamepadIndex !== null) {
      const gpState = this.getGamepadState()
      return {
        throttle: gpState.throttle || kbState.throttle,
        brake: gpState.brake || kbState.brake,
        steer: gpState.steer || kbState.steer,
        pause: gpState.pause || kbState.pause,
        confirm: gpState.confirm || kbState.confirm,
        back: gpState.back || kbState.back,
        cameraSwitch: gpState.cameraSwitch || kbState.cameraSwitch
      }
    }
    return kbState
  }

  isAnyKeyPressed(): boolean {
    if (this.keys.size > 0) return true
    if (this.gamepadIndex === null) this.rescanGamepads()
    if (this.gamepadIndex !== null) {
      const gamepads = navigator.getGamepads()
      const gamepad = gamepads[this.gamepadIndex]
      if (gamepad) {
        for (const btn of gamepad.buttons) {
          if (btn.pressed) return true
        }
        for (const axis of gamepad.axes) {
          if (Math.abs(axis) > 0.5) return true
        }
      }
    }
    return false
  }

  getGamepadIndex(): number | null {
    return this.gamepadIndex
  }

  private rescanGamepads(): void {
    const gamepads = navigator.getGamepads()
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        this.gamepadIndex = i
        return
      }
    }
  }

  getKeys(): Set<string> {
    return this.keys
  }

  getBindings(): KeyBindings {
    return { ...this.bindings }
  }

  setBindings(bindings: KeyBindings): void {
    this.bindings = { ...bindings }
    saveBindings(this.bindings)
  }

  resetBindings(): void {
    this.bindings = { ...DEFAULT_KEY_BINDINGS }
    saveBindings(this.bindings)
  }

  getGamepadBindings(): GamepadBindings {
    return { ...this.gamepadBindings }
  }

  setGamepadBindings(bindings: GamepadBindings): void {
    this.gamepadBindings = { ...bindings }
    saveGamepadBindings(this.gamepadBindings)
  }

  resetGamepadBindings(): void {
    this.gamepadBindings = { ...DEFAULT_GAMEPAD_BINDINGS }
    saveGamepadBindings(this.gamepadBindings)
  }

  startListening(action: keyof KeyBindings, callback: (action: keyof KeyBindings, keys: string[]) => void): void {
    this.listeningFor = action
    this.onBindingChanged = callback
  }

  isListening(): boolean {
    return this.listeningFor !== null
  }

  cancelListening(): void {
    this.listeningFor = null
    this.onBindingChanged = undefined
  }

  startListeningGamepad(action: GamepadBindingAction, callback: (action: GamepadBindingAction, binding: GamepadBinding) => void): void {
    this.listeningForGamepad = action
    this.onGamepadBindingChanged = callback
    this.captureGamepadSnapshot()
  }

  isListeningGamepad(): boolean {
    return this.listeningForGamepad !== null
  }

  cancelListeningGamepad(): void {
    this.listeningForGamepad = null
    this.onGamepadBindingChanged = undefined
  }

  pollGamepadBinding(): void {
    if (!this.listeningForGamepad) return
    if (this.gamepadIndex === null) return

    const gamepads = navigator.getGamepads()
    const gamepad = gamepads[this.gamepadIndex]
    if (!gamepad) return

    const action = this.listeningForGamepad

    for (let i = 0; i < gamepad.buttons.length; i++) {
      const pressed = gamepad.buttons[i]?.pressed ?? false
      const wasPressed = this.prevGamepadState.buttons[i] ?? false
      if (pressed && !wasPressed) {
        this.listeningForGamepad = null
        this.applyGamepadBinding(action, { type: 'button', index: i })
        return
      }
    }

    for (let i = 0; i < gamepad.axes.length; i++) {
      const val = gamepad.axes[i] ?? 0
      const prevVal = this.prevGamepadState.axes[i] ?? 0
      if (Math.abs(val) > 0.5 && Math.abs(prevVal) <= 0.5) {
        this.listeningForGamepad = null
        const direction: 1 | -1 = val > 0 ? 1 : -1
        this.applyGamepadBinding(action, { type: 'axis', index: i, direction })
        return
      }
    }

    this.captureGamepadSnapshot()
  }

  private captureGamepadSnapshot(): void {
    const gamepads = navigator.getGamepads()
    const gamepad = this.gamepadIndex !== null ? gamepads[this.gamepadIndex] : null
    if (!gamepad) {
      this.prevGamepadState = { buttons: [], axes: [] }
      return
    }
    this.prevGamepadState = {
      buttons: gamepad.buttons.map(b => b.pressed),
      axes: [...gamepad.axes]
    }
  }

  private applyGamepadBinding(action: GamepadBindingAction, binding: GamepadBinding): void {
    const existingAction = this.findActionForGamepadBinding(binding)
    if (existingAction && existingAction !== action) {
      this.gamepadBindings[existingAction] = { ...DEFAULT_GAMEPAD_BINDINGS[existingAction] }
    }

    this.gamepadBindings[action] = binding
    saveGamepadBindings(this.gamepadBindings)
    this.onGamepadBindingChanged?.(action, binding)
    this.onGamepadBindingChanged = undefined
  }

  private findActionForGamepadBinding(binding: GamepadBinding): GamepadBindingAction | null {
    for (const [action, b] of Object.entries(this.gamepadBindings) as Array<[GamepadBindingAction, GamepadBinding]>) {
      if (b.type === binding.type && b.index === binding.index && b.direction === binding.direction) {
        return action
      }
    }
    return null
  }

  private handleNewBinding(code: string): void {
    if (!this.listeningFor) return

    const action = this.listeningFor
    this.listeningFor = null

    const existingAction = this.findActionForKey(code)
    if (existingAction && existingAction !== action) {
      const existingKeys = [...this.bindings[existingAction]]
      const conflictingIndex = existingKeys.indexOf(code)
      if (conflictingIndex >= 0) {
        existingKeys.splice(conflictingIndex, 1)
        if (existingKeys.length === 0) {
          existingKeys.push(DEFAULT_KEY_BINDINGS[existingAction][0])
        }
        this.bindings[existingAction] = existingKeys
      }
    }

    const actionKeys = [...this.bindings[action]]
    const codeIndex = actionKeys.indexOf(code)
    if (codeIndex >= 0) {
      actionKeys.splice(codeIndex, 1)
    }
    actionKeys.unshift(code)
    this.bindings[action] = actionKeys

    saveBindings(this.bindings)
    this.onBindingChanged?.(action, this.bindings[action])
    this.onBindingChanged = undefined
  }

  private findActionForKey(code: string): keyof KeyBindings | null {
    for (const [action, keys] of Object.entries(this.bindings) as Array<[keyof KeyBindings, string[]]>) {
      if (keys.includes(code)) return action
    }
    return null
  }

  private isKeyActive(keys: string[]): boolean {
    return keys.some(k => this.keys.has(k))
  }

  private getKeyboardState(): InputState {
    return {
      throttle: this.isKeyActive(this.bindings.throttle) ? 1 : 0,
      brake: this.isKeyActive(this.bindings.brake) ? 1 : 0,
      steer: this.getKeyboardSteer(),
      pause: this.isKeyActive(this.bindings.pause),
      confirm: this.isKeyActive(this.bindings.confirm),
      back: this.isKeyActive(this.bindings.back),
      cameraSwitch: this.isKeyActive(this.bindings.cameraSwitch)
    }
  }

  private getKeyboardSteer(): number {
    let steer = 0
    if (this.isKeyActive(this.bindings.steerLeft)) steer += 1
    if (this.isKeyActive(this.bindings.steerRight)) steer -= 1
    return steer
  }

  private getGamepadState(): InputState {
    const gamepads = navigator.getGamepads()
    const gamepad = gamepads[this.gamepadIndex!]
    if (!gamepad) return this.getKeyboardState()

    const gb = this.gamepadBindings

    return {
      throttle: this.readGamepadAxis(gamepad, gb.throttle),
      brake: this.readGamepadAxis(gamepad, gb.brake),
      steer: this.readGamepadSteer(gamepad),
      pause: this.readGamepadButton(gamepad, gb.pause),
      confirm: this.readGamepadButton(gamepad, gb.confirm),
      back: this.readGamepadButton(gamepad, gb.back),
      cameraSwitch: this.readGamepadButton(gamepad, gb.cameraSwitch)
    }
  }

  private readGamepadAxis(gamepad: Gamepad, binding: GamepadBinding): number {
    if (binding.type === 'button') {
      return gamepad.buttons[binding.index]?.value ?? 0
    }
    const raw = gamepad.axes[binding.index] ?? 0
    const directed = binding.direction ? raw * binding.direction : raw
    return this.applyDeadZone(Math.abs(directed)) * Math.sign(directed || 1)
  }

  private readGamepadButton(gamepad: Gamepad, binding: GamepadBinding): boolean {
    if (binding.type === 'button') {
      return gamepad.buttons[binding.index]?.pressed ?? false
    }
    const raw = gamepad.axes[binding.index] ?? 0
    const directed = binding.direction ? raw * binding.direction : raw
    return directed > 0.5
  }

  private readGamepadSteer(gamepad: Gamepad): number {
    const gb = this.gamepadBindings
    const leftRaw = this.readGamepadAxisRaw(gamepad, gb.steerLeft)
    const rightRaw = this.readGamepadAxisRaw(gamepad, gb.steerRight)
    let steer = 0
    if (leftRaw > this.DEAD_ZONE) steer += leftRaw
    if (rightRaw > this.DEAD_ZONE) steer -= rightRaw
    return this.applySteerCurve(steer)
  }

  private readGamepadAxisRaw(gamepad: Gamepad, binding: GamepadBinding): number {
    if (binding.type === 'button') {
      return gamepad.buttons[binding.index]?.pressed ? 1 : 0
    }
    const raw = gamepad.axes[binding.index] ?? 0
    return binding.direction ? raw * binding.direction : raw
  }

  private applyDeadZone(value: number): number {
    if (Math.abs(value) < this.DEAD_ZONE) return 0
    return (Math.sign(value) * (Math.abs(value) - this.DEAD_ZONE)) / (1 - this.DEAD_ZONE)
  }

  private applySteerCurve(value: number): number {
    return Math.sign(value) * Math.pow(Math.abs(value), this.STEER_EXPONENT)
  }
}
