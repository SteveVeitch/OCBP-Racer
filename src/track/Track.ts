import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { SplinePath } from './SplinePath'
import { TrackBuilder } from './TrackBuilder'

export interface Checkpoint {
  position: THREE.Vector3
  normal: THREE.Vector3
  width: number
}

export class Track {
  private spline!: SplinePath
  private builder: TrackBuilder
  private checkpoints: Checkpoint[] = []
  private lapCount = 3
  private currentLap = 0
  private lastCheckpoint = -1

  constructor() {
    this.builder = new TrackBuilder()
    this.createOvalTrack()
  }

  private createOvalTrack(): void {
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 25),
      new THREE.Vector3(-8, 0, 45),
      new THREE.Vector3(-25, 0, 50),
      new THREE.Vector3(-42, 0, 45),
      new THREE.Vector3(-50, 0, 25),
      new THREE.Vector3(-50, 0, 0),
      new THREE.Vector3(-50, 0, -25),
      new THREE.Vector3(-42, 0, -45),
      new THREE.Vector3(-25, 0, -50),
      new THREE.Vector3(-8, 0, -45),
      new THREE.Vector3(0, 0, -25)
    ]

    this.spline = new SplinePath(points)
    this.createCheckpoints()
  }

  private createCheckpoints(): void {
    const divisions = 8
    for (let i = 0; i < divisions; i++) {
      const t = i / divisions
      const position = this.spline.getPoint(t)
      const tangent = this.spline.getTangent(t)

      this.checkpoints.push({
        position: position.clone(),
        normal: tangent.clone(),
        width: 20
      })
    }
  }

  build(scene: THREE.Scene, world: RAPIER.World): void {
    this.builder.buildTrack(this.spline, scene, world, 200)
  }

  checkCheckpoints(carPosition: THREE.Vector3): { passedCheckpoint: number; lapComplete: boolean } {
    for (let i = 0; i < this.checkpoints.length; i++) {
      const checkpoint = this.checkpoints[i]
      const distance = carPosition.distanceTo(checkpoint.position)

      if (distance < checkpoint.width) {
        if (i === (this.lastCheckpoint + 1) % this.checkpoints.length) {
          if (i === 0 && this.lastCheckpoint === this.checkpoints.length - 1) {
            this.currentLap++
            this.lastCheckpoint = i
            return { passedCheckpoint: i, lapComplete: this.currentLap >= this.lapCount }
          }
          this.lastCheckpoint = i
          return { passedCheckpoint: i, lapComplete: false }
        }
      }
    }

    return { passedCheckpoint: -1, lapComplete: false }
  }

  checkWrongWay(_carPosition: THREE.Vector3, carVelocity: THREE.Vector3): boolean {
    if (this.lastCheckpoint < 0) return false
    const speed = carVelocity.length()
    if (speed < 0.5) return false

    const checkpoint = this.checkpoints[this.lastCheckpoint]
    const trackTangent = checkpoint.normal
    const velocityDir = carVelocity.clone().normalize()

    const dot = trackTangent.dot(velocityDir)
    return dot < -0.5
  }

  getStartPosition(index: number): THREE.Vector3 {
    const t = 0
    const position = this.spline.getPoint(t)
    const right = this.spline.getRightVector(t)

    const row = Math.floor(index / 2)
    const col = index % 2

    const offset = right.clone().multiplyScalar((col - 0.5) * 2.5)
    const backOffset = this.spline.getTangent(t).clone().multiplyScalar(-row * 5)

    return position.clone().add(offset).add(backOffset)
  }

  getStartRotation(): number {
    const tangent = this.spline.getTangent(0)
    return Math.atan2(tangent.x, tangent.z)
  }

  reset(): void {
    this.currentLap = 0
    this.lastCheckpoint = -1
  }

  getCurrentLap(): number {
    return this.currentLap
  }

  getLapCount(): number {
    return this.lapCount
  }

  getSpline(): SplinePath {
    return this.spline
  }
}
