export class CheckpointValidator {
  private checkpointCount: number
  private nextCheckpoint: number = 0
  private lapCount: number = 0
  private lastCheckpoint: number = -1

  constructor(checkpointCount: number) {
    this.checkpointCount = checkpointCount
  }

  getCheckpointCount(): number {
    return this.checkpointCount
  }

  getLapCount(): number {
    return this.lapCount
  }

  getLastCheckpoint(): number {
    return this.lastCheckpoint
  }

  validate(checkpoint: number): boolean {
    if (checkpoint === this.nextCheckpoint) {
      const isFirstCheckpoint = this.lastCheckpoint === -1
      const completingLap = checkpoint === 0 && !isFirstCheckpoint

      this.lastCheckpoint = checkpoint
      this.nextCheckpoint = (checkpoint + 1) % this.checkpointCount

      if (completingLap) {
        this.lapCount++
      }

      return true
    }

    return false
  }

  isWrongWay(checkpoint: number): boolean {
    if (checkpoint < this.lastCheckpoint && checkpoint !== 0) {
      return true
    }
    return false
  }

  reset(): void {
    this.nextCheckpoint = 0
    this.lapCount = 0
    this.lastCheckpoint = -1
  }
}
