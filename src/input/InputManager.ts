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

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  throttle: ['KeyW', 'ArrowUp'],
  brake: ['KeyS', 'ArrowDown'],
  steerLeft: ['KeyA', 'ArrowLeft'],
  steerRight: ['KeyD', 'ArrowRight'],
  pause: ['Escape'],
  confirm: ['Enter', 'Space'],
  back: ['Backspace'],
  cameraSwitch: ['KeyC']
}

const STORAGE_KEY = 'ocbp-bindings'

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

export class InputManager {
  private keys: Set<string> = new Set()
  private gamepadIndex: number | null = null

  private readonly DEAD_ZONE = 0.15
  private STEER_EXPONENT = 1.4

  private bindings: KeyBindings = loadBindings()
  private listeningFor: keyof KeyBindings | null = null
  private onBindingChanged?: (action: keyof KeyBindings, keys: string[]) => void

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
    })
  }

  private setupGamepad(): void {
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadIndex = e.gamepad.index
    })

    window.addEventListener('gamepaddisconnected', () => {
      this.gamepadIndex = null
    })
  }

  setSteerSensitivity(sensitivity: number): void {
    this.STEER_EXPONENT = 1.0 + (1 - Math.max(0, Math.min(1, sensitivity))) * 1.0
  }

  getState(): InputState {
    if (this.gamepadIndex !== null) {
      return this.getGamepadState()
    }
    return this.getKeyboardState()
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

    const leftStickX = this.applyDeadZone(gamepad.axes[0] ?? 0)
    const rightTrigger = this.applyDeadZone(gamepad.axes[7] ?? 0)
    const leftTrigger = this.applyDeadZone(gamepad.axes[6] ?? 0)

    return {
      throttle: rightTrigger,
      brake: leftTrigger,
      steer: -this.applySteerCurve(leftStickX),
      pause: gamepad.buttons[9]?.pressed ?? false,
      confirm: gamepad.buttons[0]?.pressed ?? false,
      back: gamepad.buttons[1]?.pressed ?? false,
      cameraSwitch: gamepad.buttons[3]?.pressed ?? false
    }
  }

  private applyDeadZone(value: number): number {
    if (Math.abs(value) < this.DEAD_ZONE) return 0
    return (Math.sign(value) * (Math.abs(value) - this.DEAD_ZONE)) / (1 - this.DEAD_ZONE)
  }

  private applySteerCurve(value: number): number {
    return Math.sign(value) * Math.pow(Math.abs(value), this.STEER_EXPONENT)
  }
}
