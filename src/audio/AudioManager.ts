import { Howler } from 'howler'

export class AudioManager {
  private sounds: Map<string, unknown> = new Map()
  private masterVolume = 1.0
  private initialized = false

  async init(): Promise<void> {
    this.initialized = true
    Howler.volume(this.masterVolume)
  }

  playEngine(_rpm: number, _throttle: number): void {
    if (!this.initialized) return
  }

  playTireScreech(_intensity: number): void {
    if (!this.initialized) return
  }

  playWindNoise(_speed: number): void {
    if (!this.initialized) return
  }

  playCollision(): void {
    if (!this.initialized) return
  }

  playUIClick(): void {
    if (!this.initialized) return
  }

  playUIConfirm(): void {
    if (!this.initialized) return
  }

  playCountdownTick(): void {
    if (!this.initialized) return
  }

  playCountdownGo(): void {
    if (!this.initialized) return
  }

  playRaceComplete(): void {
    if (!this.initialized) return
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = volume
    Howler.volume(volume)
  }

  suspend(): void {
    Howler.volume(0)
  }

  resume(): void {
    Howler.volume(this.masterVolume)
  }

  dispose(): void {
    this.sounds.clear()
  }
}
