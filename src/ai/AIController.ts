import * as THREE from 'three'
import { SplinePath } from '../track/SplinePath'
import { CarController } from '../physics/CarController'
import { InputState } from '../input/InputManager'

export class AIController {
  private car: CarController
  private spline: SplinePath
  private targetT = 0
  private currentT = 0
  private lap = 0
  private aggressiveness: number
  private lookAheadDistance = 0.05

  constructor(car: CarController, spline: SplinePath, aggressiveness: number = 0.5) {
    this.car = car
    this.spline = spline
    this.aggressiveness = aggressiveness
  }

  update(_dt: number): InputState {
    const carPos = this.car.getPosition()
    this.updateTargetT(carPos)

    const targetPoint = this.spline.getPoint(this.targetT)
    const targetTangent = this.spline.getTangent(this.targetT)
    const carSpeed = this.car.getSpeed() / 3.6

    const toTarget = new THREE.Vector3()
      .subVectors(targetPoint, carPos)
      .setY(0)

    const forward = new THREE.Vector3(0, 0, 1)
      .applyQuaternion(this.car.getQuaternion())
      .setY(0)
      .normalize()

    const cross = new THREE.Vector3().crossVectors(forward, toTarget.normalize())
    const steerAmount = Math.max(-1, Math.min(1, cross.y * 3))

    const cornerAngle = Math.abs(1 - Math.abs(targetTangent.dot(toTarget.normalize())))
    const slowDown = cornerAngle * (1 + this.aggressiveness * 0.5)
    const targetSpeed = Math.max(5, 20 - slowDown * 15)
    const speedDiff = targetSpeed - carSpeed

    let throttle = 0
    let brake = 0

    if (speedDiff > 2) {
      throttle = Math.min(1, speedDiff / 10)
    } else if (speedDiff < -2) {
      brake = Math.min(1, -speedDiff / 10)
    }

    return {
      throttle,
      brake,
      steer: steerAmount,
      pause: false,
      confirm: false,
      back: false
    }
  }

  private updateTargetT(carPos: THREE.Vector3): void {
    let closestT = 0
    let closestDist = Infinity

    const searchSteps = 20
    for (let i = 0; i < searchSteps; i++) {
      const testT = (this.targetT + i / searchSteps) % 1
      const point = this.spline.getPoint(testT)
      const dist = carPos.distanceTo(point)
      if (dist < closestDist) {
        closestDist = dist
        closestT = testT
      }
    }

    const prevT = this.currentT
    this.currentT = closestT
    if (prevT > 0.9 && closestT < 0.1) {
      this.lap++
    }

    this.targetT = (closestT + this.lookAheadDistance) % 1
  }

  getCar(): CarController {
    return this.car
  }

  getLap(): number {
    return this.lap
  }

  getCurrentT(): number {
    return this.currentT
  }

  reset(): void {
    this.targetT = 0
    this.currentT = 0
    this.lap = 0
  }

  setAggressiveness(value: number): void {
    this.aggressiveness = Math.max(0, Math.min(1, value))
  }
}
