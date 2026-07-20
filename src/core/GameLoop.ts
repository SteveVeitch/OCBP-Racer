export class GameLoop {
  private physicsDt: number
  private accumulator: number = 0
  private physicsStepFn: () => void = () => {}
  private renderFn: (dt: number) => void = () => {}

  constructor(physicsHz: number = 120) {
    this.physicsDt = 1 / physicsHz
  }

  getPhysicsDt(): number {
    return this.physicsDt
  }

  getAccumulator(): number {
    return this.accumulator
  }

  stepPhysics(): void {
    this.physicsStepFn()
  }

  setPhysicsStep(fn: () => void): void {
    this.physicsStepFn = fn
  }

  setRender(fn: (dt: number) => void): void {
    this.renderFn = fn
  }

  update(frameTime: number): void {
    const cappedTime = Math.min(frameTime, 0.1)
    this.accumulator += cappedTime

    while (this.accumulator >= this.physicsDt) {
      this.stepPhysics()
      this.accumulator -= this.physicsDt
    }

    this.render(frameTime)
  }

  render(dt: number): void {
    this.renderFn(dt)
  }
}
