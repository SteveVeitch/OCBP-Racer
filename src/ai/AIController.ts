import * as THREE from 'three'
import { SplinePath } from '../track/SplinePath'
import { CarController } from '../physics/CarController'
import { InputState } from '../input/InputManager'

type AIState = 'STARTING' | 'RACING' | 'RECOVERING'

const AVOIDANCE_RADIUS = 5.0
const START_CONE_COS = Math.cos(45 * Math.PI / 180)
const START_THROTTLE_RAMP = 1.5
const START_DURATION = 3.0
const RECOVERY_LATERAL_THRESHOLD = 4.0
const RECOVERY_SPEED_THRESHOLD = 2.0
const RECOVERY_ALIGN_COS = Math.cos(30 * Math.PI / 180)
const RECOVERY_DISTANCE_THRESHOLD = 4.0
const RECOVERY_THROTTLE_CUT_DURATION = 0.5
const RECOVERY_TIMEOUT = 5.0
const BASE_LOOK_AHEAD = 0.04
const LOOK_AHEAD_SPEED_FACTOR = 0.002

const _toTarget = new THREE.Vector3()
const _forward = new THREE.Vector3()
const _right = new THREE.Vector3()
const _toOther = new THREE.Vector3()
const _carPos = new THREE.Vector3()
const _cross = new THREE.Vector3()

export class AIController {
  private car: CarController
  private spline: SplinePath
  private targetT = 0
  private currentT = 0
  private lap = 0
  private aggressiveness: number
  private lookAheadDistance = BASE_LOOK_AHEAD
  private allCars: CarController[] = []

  private aiState: AIState = 'STARTING'
  private raceTimer = 0
  private startDelay: number
  private recoveryTimer = 0
  private recoveryThrottleCutTimer = 0

  constructor(car: CarController, spline: SplinePath, aggressiveness: number = 0.5, allCars: CarController[] = []) {
    this.car = car
    this.spline = spline
    this.aggressiveness = aggressiveness
    this.allCars = allCars
    this.startDelay = 0.2 + Math.random() * 0.6
  }

  update(dt: number): InputState {
    this.raceTimer += dt

    const carPos = this.car.getPosition()
    this.updateTargetT(carPos)

    switch (this.aiState) {
      case 'STARTING':
        return this.updateStarting(dt, carPos)
      case 'RECOVERING':
        return this.updateRecovering(dt, carPos)
      case 'RACING':
      default:
        return this.updateRacing(dt, carPos)
    }
  }

  private updateStarting(_dt: number, carPos: THREE.Vector3): InputState {
    if (this.raceTimer >= START_DURATION) {
      this.aiState = 'RACING'
      return { throttle: 0.5, brake: 0, steer: this.calculateSteer(carPos), pause: false, confirm: false, back: false }
    }

    if (this.raceTimer < this.startDelay) {
      return { throttle: 0, brake: 0, steer: 0, pause: false, confirm: false, back: false }
    }

    const elapsed = this.raceTimer - this.startDelay
    const throttleRamp = Math.min(1, elapsed / START_THROTTLE_RAMP)
    const throttleCap = 0.7 + this.aggressiveness * 0.3
    const baseThrottle = throttleRamp * throttleCap

    const avoidance = this.calculateAvoidance(carPos)
    const steer = this.calculateSteer(carPos)
    const brake = avoidance.brakeForce

    return {
      throttle: Math.max(0, baseThrottle - avoidance.throttleReduction),
      brake,
      steer: steer + avoidance.steerOffset,
      pause: false,
      confirm: false,
      back: false
    }
  }

  private updateRacing(_dt: number, carPos: THREE.Vector3): InputState {
    if (this.checkCrashRecovery(carPos)) {
      this.aiState = 'RECOVERING'
      this.recoveryTimer = 0
      this.recoveryThrottleCutTimer = RECOVERY_THROTTLE_CUT_DURATION
      return { throttle: 0, brake: 0.5, steer: 0, pause: false, confirm: false, back: false }
    }

    const steer = this.calculateSteer(carPos)
    const speed = this.car.getSpeed() / 3.6
    const targetSpeed = this.calculateTargetSpeed()
    const speedDiff = targetSpeed - speed

    let throttle = 0
    let brake = 0

    if (speedDiff > 2) {
      throttle = Math.min(1, speedDiff / 10)
    } else if (speedDiff < -2) {
      brake = Math.min(1, -speedDiff / 10)
    }

    const avoidance = this.calculateAvoidance(carPos)

    return {
      throttle: Math.max(0, throttle - avoidance.throttleReduction),
      brake: Math.max(brake, avoidance.brakeForce),
      steer: steer + avoidance.steerOffset,
      pause: false,
      confirm: false,
      back: false
    }
  }

  private updateRecovering(dt: number, carPos: THREE.Vector3): InputState {
    this.recoveryTimer += dt
    this.recoveryThrottleCutTimer = Math.max(0, this.recoveryThrottleCutTimer - dt)

    if (this.recoveryTimer > RECOVERY_TIMEOUT) {
      this.aiState = 'RACING'
      this.recoveryTimer = 0
      return { throttle: 0.5, brake: 0, steer: this.calculateSteer(carPos), pause: false, confirm: false, back: false }
    }

    const throttle = this.recoveryThrottleCutTimer > 0 ? 0 : 0.3

    const nearestObstacle = this.findNearestObstacle(carPos)
    let steer = 0

    if (nearestObstacle) {
      _toOther.subVectors(carPos, nearestObstacle).setY(0).normalize()
      steer = _toOther.x > 0 ? 0.8 : -0.8
    } else {
      steer = this.calculateSteer(carPos)
    }

    if (this.canRejoin(carPos)) {
      this.aiState = 'RACING'
      this.recoveryTimer = 0
      return { throttle: 0.5, brake: 0, steer: this.calculateSteer(carPos), pause: false, confirm: false, back: false }
    }

    return {
      throttle,
      brake: 0,
      steer,
      pause: false,
      confirm: false,
      back: false
    }
  }

  private calculateSteer(carPos: THREE.Vector3): number {
    const targetPoint = this.spline.getPoint(this.targetT)

    _forward.set(0, 0, 1).applyQuaternion(this.car.getQuaternion()).setY(0).normalize()
    _toTarget.subVectors(targetPoint, carPos).setY(0).normalize()

    _cross.crossVectors(_forward, _toTarget)
    return Math.max(-1, Math.min(1, _cross.y * 3))
  }

  private calculateTargetSpeed(): number {
    const targetTangent = this.spline.getTangent(this.targetT)
    const lookAheadT = (this.targetT + 0.05) % 1
    const lookAheadTangent = this.spline.getTangent(lookAheadT)
    const cornerAngle = Math.abs(1 - Math.abs(targetTangent.dot(lookAheadTangent)))
    const slowDown = cornerAngle * (1 + this.aggressiveness * 0.5)
    return Math.max(5, 20 - slowDown * 15)
  }

  private calculateAvoidance(carPos: THREE.Vector3): { steerOffset: number, throttleReduction: number, brakeForce: number } {
    let steerOffset = 0
    let throttleReduction = 0
    let brakeForce = 0

    _forward.set(0, 0, 1).applyQuaternion(this.car.getQuaternion()).setY(0).normalize()
    _right.set(1, 0, 0).applyQuaternion(this.car.getQuaternion()).setY(0).normalize()

    for (const other of this.allCars) {
      if (other === this.car) continue

      const otherPos = other.getPosition()
      const dist = carPos.distanceTo(otherPos)

      if (dist > AVOIDANCE_RADIUS) continue

      _toOther.subVectors(otherPos, carPos).setY(0)
      const distXZ = _toOther.length()
      if (distXZ < 0.01) continue

      _toOther.normalize()
      const forwardDot = _forward.dot(_toOther)

      if (forwardDot < START_CONE_COS) continue

      const proximity = 1 - (distXZ / AVOIDANCE_RADIUS)
      const side = _right.dot(_toOther)

      steerOffset += -side * proximity * 0.5
      throttleReduction += proximity * 0.4

      if (distXZ < 3.0) {
        brakeForce = Math.max(brakeForce, proximity * 0.6)
      }
    }

    steerOffset = Math.max(-0.8, Math.min(0.8, steerOffset))
    throttleReduction = Math.min(0.8, throttleReduction)

    return { steerOffset, throttleReduction, brakeForce }
  }

  private checkCrashRecovery(carPos: THREE.Vector3): boolean {
    const latVel = Math.abs(this.car.getLateralVelocity())
    if (latVel > RECOVERY_LATERAL_THRESHOLD) return true

    const speed = this.car.getSpeed() / 3.6
    if (speed < RECOVERY_SPEED_THRESHOLD) {
      const dist = this.distanceToSpline(carPos)
      if (dist > RECOVERY_DISTANCE_THRESHOLD * 2) return true
    }

    const speedRatio = speed / (this.car.getMaxSpeed() / 3.6)
    const expectedSpeedRatio = this.getExpectedSpeedRatio()
    if (speedRatio < expectedSpeedRatio * 0.3 && speed > 1) return true

    return false
  }

  private getExpectedSpeedRatio(): number {
    const targetTangent = this.spline.getTangent(this.targetT)
    const lookAheadT = (this.targetT + 0.05) % 1
    const lookAheadTangent = this.spline.getTangent(lookAheadT)
    const cornerAngle = Math.abs(1 - Math.abs(targetTangent.dot(lookAheadTangent)))
    return Math.max(0.3, 1 - cornerAngle * 2)
  }

  private canRejoin(carPos: THREE.Vector3): boolean {
    const dist = this.distanceToSpline(carPos)
    if (dist > RECOVERY_DISTANCE_THRESHOLD) return false

    const tangent = this.spline.getTangent(this.currentT)
    _forward.set(0, 0, 1).applyQuaternion(this.car.getQuaternion()).setY(0).normalize()

    const alignment = _forward.dot(tangent)
    return alignment > RECOVERY_ALIGN_COS
  }

  private distanceToSpline(carPos: THREE.Vector3): number {
    let closestDist = Infinity
    const steps = 20
    for (let i = 0; i < steps; i++) {
      const t = i / steps
      const point = this.spline.getPoint(t)
      const dx = carPos.x - point.x
      const dz = carPos.z - point.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < closestDist) closestDist = dist
    }
    return closestDist
  }

  private findNearestObstacle(carPos: THREE.Vector3): THREE.Vector3 | null {
    let nearest: THREE.Vector3 | null = null
    let nearestDist = Infinity

    for (const other of this.allCars) {
      if (other === this.car) continue
      const otherPos = other.getPosition()
      const dist = carPos.distanceTo(otherPos)
      if (dist < nearestDist && dist < AVOIDANCE_RADIUS) {
        nearestDist = dist
        _carPos.copy(otherPos)
        nearest = _carPos
      }
    }

    return nearest
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

    const speed = this.car.getSpeed() / 3.6
    this.lookAheadDistance = BASE_LOOK_AHEAD + speed * LOOK_AHEAD_SPEED_FACTOR
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
    this.aiState = 'STARTING'
    this.raceTimer = 0
    this.recoveryTimer = 0
    this.recoveryThrottleCutTimer = 0
  }

  setAggressiveness(value: number): void {
    this.aggressiveness = Math.max(0, Math.min(1, value))
  }

  setAllCars(cars: CarController[]): void {
    this.allCars = cars
  }
}
