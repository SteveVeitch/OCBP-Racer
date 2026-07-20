import * as THREE from 'three'
import { SplinePath } from '../track/SplinePath'
import { CarController } from '../physics/CarController'
import { InputState } from '../input/InputManager'
import { AIDifficulty } from '../core/StateMachine'

type AIState = 'STARTING' | 'RACING' | 'RECOVERING'

interface DifficultyProfile {
  speedMultiplier: number
  aggressiveness: number
  lookAheadBase: number
  lookAheadSpeedFactor: number
  brakingAggression: number
  racingLineOffset: number
  recoveryTimeout: number
  steerSmoothing: number
}

const DIFFICULTY_PROFILES: Record<AIDifficulty, DifficultyProfile> = {
  easy: {
    speedMultiplier: 0.55,
    aggressiveness: 0.15,
    lookAheadBase: 0.03,
    lookAheadSpeedFactor: 0.001,
    brakingAggression: 0.3,
    racingLineOffset: 0.0,
    recoveryTimeout: 8.0,
    steerSmoothing: 0.15,
  },
  normal: {
    speedMultiplier: 0.75,
    aggressiveness: 0.4,
    lookAheadBase: 0.05,
    lookAheadSpeedFactor: 0.002,
    brakingAggression: 0.6,
    racingLineOffset: 0.003,
    recoveryTimeout: 5.0,
    steerSmoothing: 0.08,
  },
  hard: {
    speedMultiplier: 0.92,
    aggressiveness: 0.7,
    lookAheadBase: 0.07,
    lookAheadSpeedFactor: 0.003,
    brakingAggression: 0.85,
    racingLineOffset: 0.006,
    recoveryTimeout: 3.0,
    steerSmoothing: 0.04,
  },
  expert: {
    speedMultiplier: 1.0,
    aggressiveness: 0.9,
    lookAheadBase: 0.09,
    lookAheadSpeedFactor: 0.004,
    brakingAggression: 1.0,
    racingLineOffset: 0.008,
    recoveryTimeout: 2.0,
    steerSmoothing: 0.02,
  },
}

const AVOIDANCE_RADIUS = 5.0
const START_CONE_COS = Math.cos(45 * Math.PI / 180)
const START_THROTTLE_RAMP = 1.5
const START_DURATION = 3.0
const RECOVERY_LATERAL_THRESHOLD = 4.0
const RECOVERY_SPEED_THRESHOLD = 2.0
const RECOVERY_ALIGN_COS = Math.cos(30 * Math.PI / 180)
const RECOVERY_DISTANCE_THRESHOLD = 4.0
const RECOVERY_THROTTLE_CUT_DURATION = 0.5

const _toTarget = new THREE.Vector3()
const _forward = new THREE.Vector3()
const _right = new THREE.Vector3()
const _toOther = new THREE.Vector3()
const _carPos = new THREE.Vector3()
const _cross = new THREE.Vector3()
const _tangent = new THREE.Vector3()
const _tangentAhead = new THREE.Vector3()

export class AIController {
  private car: CarController
  private spline: SplinePath
  private targetT = 0
  private currentT = 0
  private lap = 0
  private halfLapPassed = false
  private profile: DifficultyProfile
  private allCars: CarController[] = []
  private smoothSteer = 0

  private aiState: AIState = 'STARTING'
  private raceTimer = 0
  private startDelay: number
  private recoveryTimer = 0
  private recoveryThrottleCutTimer = 0

  constructor(
    car: CarController,
    spline: SplinePath,
    difficulty: AIDifficulty = 'normal',
    allCars: CarController[] = [],
  ) {
    this.car = car
    this.spline = spline
    this.profile = DIFFICULTY_PROFILES[difficulty]
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
      return { throttle: 0.5, brake: 0, steer: this.calculateSteer(carPos), pause: false, confirm: false, back: false, cameraSwitch: false }
    }

    if (this.raceTimer < this.startDelay) {
      return { throttle: 0, brake: 0, steer: 0, pause: false, confirm: false, back: false, cameraSwitch: false }
    }

    const elapsed = this.raceTimer - this.startDelay
    const throttleRamp = Math.min(1, elapsed / START_THROTTLE_RAMP)
    const throttleCap = 0.6 + this.profile.aggressiveness * 0.4
    const baseThrottle = throttleRamp * throttleCap

    const avoidance = this.calculateAvoidance(carPos)
    const steer = this.calculateSteer(carPos)

    return {
      throttle: Math.max(0, baseThrottle - avoidance.throttleReduction),
      brake: avoidance.brakeForce,
      steer: steer + avoidance.steerOffset,
      pause: false, confirm: false, back: false, cameraSwitch: false,
    }
  }

  private updateRacing(_dt: number, carPos: THREE.Vector3): InputState {
    if (this.checkCrashRecovery(carPos)) {
      this.aiState = 'RECOVERING'
      this.recoveryTimer = 0
      this.recoveryThrottleCutTimer = RECOVERY_THROTTLE_CUT_DURATION
      return { throttle: 0, brake: 0.5, steer: 0, pause: false, confirm: false, back: false, cameraSwitch: false }
    }

    const steer = this.calculateSteer(carPos)
    const speed = this.car.getSpeed() / 3.6
    const targetSpeed = this.calculateTargetSpeed()
    const speedDiff = targetSpeed - speed

    let throttle = 0
    let brake = 0

    if (speedDiff > 1) {
      throttle = Math.min(1, speedDiff / 8)
    } else if (speedDiff < -1) {
      brake = Math.min(1, (-speedDiff / 8) * this.profile.brakingAggression)
    }

    const avoidance = this.calculateAvoidance(carPos)

    return {
      throttle: Math.max(0, throttle - avoidance.throttleReduction),
      brake: Math.max(brake, avoidance.brakeForce),
      steer: steer + avoidance.steerOffset,
      pause: false, confirm: false, back: false, cameraSwitch: false,
    }
  }

  private updateRecovering(dt: number, carPos: THREE.Vector3): InputState {
    this.recoveryTimer += dt
    this.recoveryThrottleCutTimer = Math.max(0, this.recoveryThrottleCutTimer - dt)

    if (this.recoveryTimer > this.profile.recoveryTimeout) {
      this.teleportToSpline()
      this.aiState = 'RACING'
      this.recoveryTimer = 0
      return { throttle: 0.5, brake: 0, steer: this.calculateSteer(carPos), pause: false, confirm: false, back: false, cameraSwitch: false }
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
      return { throttle: 0.5, brake: 0, steer: this.calculateSteer(carPos), pause: false, confirm: false, back: false, cameraSwitch: false }
    }

    return {
      throttle,
      brake: 0,
      steer,
      pause: false, confirm: false, back: false, cameraSwitch: false,
    }
  }

  private calculateSteer(carPos: THREE.Vector3): number {
    const targetPoint = this.spline.getPoint(this.targetT)

    _forward.set(0, 0, 1).applyQuaternion(this.car.getQuaternion()).setY(0).normalize()
    _toTarget.subVectors(targetPoint, carPos).setY(0).normalize()

    _cross.crossVectors(_forward, _toTarget)
    let rawSteer = Math.max(-1, Math.min(1, _cross.y * 3))

    const offset = this.profile.racingLineOffset
    if (offset > 0) {
      const curvature = this.getCurvatureAhead()
      rawSteer += Math.sign(rawSteer) * curvature * offset * 50
      rawSteer = Math.max(-1, Math.min(1, rawSteer))
    }

    this.smoothSteer += (rawSteer - this.smoothSteer) * this.profile.steerSmoothing
    return Math.max(-1, Math.min(1, this.smoothSteer))
  }

  private getCurvatureAhead(): number {
    const steps = 5
    let totalAngle = 0
    for (let i = 0; i < steps; i++) {
      const t1 = (this.targetT + (i * 0.02)) % 1
      const t2 = (this.targetT + ((i + 1) * 0.02)) % 1
      this.spline.getTangent(t1).setY(0).normalize()
      this.spline.getTangent(t2).setY(0).normalize()
      _tangent.copy(this.spline.getTangent(t1)).setY(0).normalize()
      _tangentAhead.copy(this.spline.getTangent(t2)).setY(0).normalize()
      totalAngle += 1 - Math.abs(_tangent.dot(_tangentAhead))
    }
    return Math.min(1, totalAngle)
  }

  private calculateTargetSpeed(): number {
    const maxSpeedMs = this.car.getMaxSpeed() / 3.6
    const baseTarget = maxSpeedMs * this.profile.speedMultiplier

    const cornerSeverity = this.getCornerSeverity()
    const slowDown = cornerSeverity * (1 + this.profile.aggressiveness * 0.5)
    const cornerSpeed = maxSpeedMs * Math.max(0.25, 1 - slowDown * 0.7)

    return Math.max(5, Math.min(baseTarget, cornerSpeed))
  }

  private getCornerSeverity(): number {
    const checkPoints = 8
    const stepSize = 0.03
    let maxAngle = 0

    for (let i = 0; i < checkPoints; i++) {
      const t1 = (this.targetT + i * stepSize) % 1
      const t2 = (this.targetT + (i + 1) * stepSize) % 1
      _tangent.copy(this.spline.getTangent(t1)).setY(0).normalize()
      _tangentAhead.copy(this.spline.getTangent(t2)).setY(0).normalize()
      const angle = 1 - Math.abs(_tangent.dot(_tangentAhead))
      if (angle > maxAngle) maxAngle = angle
    }

    return Math.min(1, maxAngle * 3)
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
    return Math.max(0.3, 1 - this.getCornerSeverity() * 2)
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

    if (closestT > 0.3 && closestT < 0.7) {
      this.halfLapPassed = true
    }
    if (this.halfLapPassed && prevT > 0.9 && closestT < 0.1) {
      this.lap++
      this.halfLapPassed = false
    }

    const speed = this.car.getSpeed() / 3.6
    const lookAhead = this.profile.lookAheadBase + speed * this.profile.lookAheadSpeedFactor
    this.targetT = (closestT + lookAhead) % 1
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

  private teleportToSpline(): void {
    const carPos = this.car.getPosition()
    let closestT = 0
    let closestDist = Infinity
    for (let i = 0; i < 50; i++) {
      const t = i / 50
      const point = this.spline.getPoint(t)
      const dx = carPos.x - point.x
      const dz = carPos.z - point.z
      const dist = dx * dx + dz * dz
      if (dist < closestDist) {
        closestDist = dist
        closestT = t
      }
    }
    const point = this.spline.getPoint(closestT)
    this.car.setPosition(new THREE.Vector3(point.x, 0.5, point.z))

    const tangent = this.spline.getTangent(closestT)
    const angle = Math.atan2(tangent.x, tangent.z)
    this.car.setLookAt(angle)

    this.car.resetPhysics()

    this.targetT = (closestT + this.profile.lookAheadBase) % 1
    this.currentT = closestT
  }

  reset(): void {
    this.targetT = 0
    this.currentT = 0
    this.lap = 0
    this.halfLapPassed = false
    this.smoothSteer = 0
    this.aiState = 'STARTING'
    this.raceTimer = 0
    this.recoveryTimer = 0
    this.recoveryThrottleCutTimer = 0
  }

  setAllCars(cars: CarController[]): void {
    this.allCars = cars
  }
}
