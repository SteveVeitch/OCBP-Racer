export interface InputState {
  throttle: number
  brake: number
  steer: number
  pause: boolean
  confirm: boolean
  back: boolean
}

export class InputManager {
  private keys: Set<string> = new Set()
  private gamepadIndex: number | null = null

  private readonly DEAD_ZONE = 0.15
  private readonly STEER_EXPONENT = 1.4

  constructor() {
    this.setupKeyboard()
    this.setupGamepad()
  }

  private setupKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code)
    })

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code)
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

  getState(): InputState {
    if (this.gamepadIndex !== null) {
      return this.getGamepadState()
    }
    return this.getKeyboardState()
  }

  private getKeyboardState(): InputState {
    return {
      throttle: this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0,
      brake: this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0,
      steer: this.getKeyboardSteer(),
      pause: this.keys.has('Escape'),
      confirm: this.keys.has('Enter') || this.keys.has('Space'),
      back: this.keys.has('Escape') || this.keys.has('Backspace')
    }
  }

  private getKeyboardSteer(): number {
    let steer = 0
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) steer += 1
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) steer -= 1
    return steer
  }

  private getGamepadState(): InputState {
    const gamepads = navigator.getGamepads()
    const gamepad = gamepads[this.gamepadIndex!]
    if (!gamepad) return this.getKeyboardState()

    const leftStickX = this.applyDeadZone(gamepad.axes[0])
    const rightTrigger = this.applyDeadZone(gamepad.axes[7])
    const leftTrigger = this.applyDeadZone(gamepad.axes[6])

    return {
      throttle: rightTrigger,
      brake: leftTrigger,
      steer: -this.applySteerCurve(leftStickX),
      pause: gamepad.buttons[9]?.pressed ?? false,
      confirm: gamepad.buttons[0]?.pressed ?? false,
      back: gamepad.buttons[1]?.pressed ?? false
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
