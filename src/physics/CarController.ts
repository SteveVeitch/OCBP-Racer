import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { InputState } from '../input/InputManager'
import { EnvironmentModifiers } from '../environment/EnvironmentModifiers'

export interface CarConfig {
  mass: number
  engineForce: number
  brakeForce: number
  steerSpeed: number
  maxSteerAngle: number
  maxSpeed: number
  dragCoeff: number
  peakGrip: number
  downforce: number
  slipAnglePeak: number
  slipAngleLimit: number
  turboLagTime: number
}

const DEFAULT_CONFIG: CarConfig = {
  mass: 1500,
  engineForce: 800,
  brakeForce: 2000,
  steerSpeed: 2.0,
  maxSteerAngle: 0.5,
  maxSpeed: 235,
  dragCoeff: 1.5,
  peakGrip: 1.9,
  downforce: 1.2,
  slipAnglePeak: 8,
  slipAngleLimit: 25,
  turboLagTime: 0.0
}

const WHEEL_RADIUS = 0.32
const ROLL_FACTOR = 0.03
const MAX_ROLL_ANGLE = 5 * (Math.PI / 180)
const GRIP_FORCE_FACTOR = 0.15
const THROTTLE_RAMP_UP = 2.5
const THROTTLE_RAMP_DOWN = 4.0
const TURBO_DECAY_RATE = 8.0
const TURBO_BOOST_MULTIPLIER = 0.18
const MS_PER_KMH = 1 / 3.6

const _quat = new THREE.Quaternion()
const _forward = new THREE.Vector3()
const _right = new THREE.Vector3()
const _axisY = new THREE.Vector3(0, 1, 0)
const _newQuat = new THREE.Quaternion()
const _velDir = new THREE.Vector3()

function safeNumber(v: number, fallback: number): number {
  return Number.isFinite(v) && v > 0 ? v : fallback
}

export class CarController {
  private body: RAPIER.RigidBody
  private mesh: THREE.Group
  private config: CarConfig
  private currentSteer = 0
  private lateralVelocity = 0
  private wheelSpin = 0
  private throttleLevel = 0
  private boostLevel = 0
  private roadHeight = 0

  private wheelFL!: THREE.Group
  private wheelFR!: THREE.Group
  private wheelRL!: THREE.Group
  private wheelRR!: THREE.Group
  private envModifiers: EnvironmentModifiers = {
    gripMultiplier: 1.0,
    dragMultiplier: 1.0,
    brakingMultiplier: 1.0,
    steerMultiplier: 1.0
  }

  private maxSpeedMS: number
  private _cachedForwardSpeed = 0
  private _cachedHorizontalSpeed = 0

  constructor(body: RAPIER.RigidBody, mesh: THREE.Group, config?: Partial<CarConfig>) {
    this.body = body
    this.mesh = mesh
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.maxSpeedMS = this.config.maxSpeed * MS_PER_KMH
    this.findWheels()
  }

  private findWheels(): void {
    const children = this.mesh.children
    const wheelGroups: THREE.Group[] = []
    for (const child of children) {
      if (child instanceof THREE.Group && child.children.length >= 2) {
        const hasTire = child.children.some(c =>
          c instanceof THREE.Mesh && c.geometry.type === 'CylinderGeometry'
        )
        if (hasTire) wheelGroups.push(child)
      }
    }
    if (wheelGroups.length >= 4) {
      this.wheelFL = wheelGroups[0]
      this.wheelFR = wheelGroups[1]
      this.wheelRL = wheelGroups[2]
      this.wheelRR = wheelGroups[3]
    }
  }

  update(dt: number, input: InputState): void {
    this.enforceGround()

    const velocity = this.body.linvel()
    const rotation = this.body.rotation()
    _quat.set(rotation.x, rotation.y, rotation.z, rotation.w)

    _forward.set(0, 0, 1).applyQuaternion(_quat)
    _right.set(1, 0, 0).applyQuaternion(_quat)

    this._cachedForwardSpeed = velocity.x * _forward.x + velocity.z * _forward.z
    this._cachedHorizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)

    this.lateralVelocity = velocity.x * _right.x + velocity.z * _right.z

    this.updateSteering(input.steer, dt)
    this.updateThrottleLevel(input.throttle, dt)
    this.applyThrottle(this.throttleLevel)
    this.applyBrake(input.brake)
    this.applyDrag()
    this.applyDownforce()
    this.applyGripForce()
    this.updateMesh(dt)

    const speedKmh = this._cachedHorizontalSpeed * 3.6
    if (speedKmh > this.config.maxSpeed * 1.1) {
      const ratio = (this.config.maxSpeed * 1.1) / speedKmh
      this.body.setLinvel(
        { x: velocity.x * ratio, y: velocity.y, z: velocity.z * ratio },
        true
      )
    }
  }

  private calculateSlipAngle(): number {
    const forwardSpeed = Math.abs(this._cachedForwardSpeed)
    const latSpeed = Math.abs(this.lateralVelocity)

    if (forwardSpeed < 0.5) return 0
    return Math.atan2(latSpeed, forwardSpeed) * (180 / Math.PI)
  }

  private calculateGripCoefficient(slipAngle: number): number {
    const peak = this.config.slipAnglePeak
    const limit = this.config.slipAngleLimit

    if (slipAngle <= 0) return 0
    if (slipAngle <= peak) {
      return this.config.peakGrip * (slipAngle / peak)
    }
    if (slipAngle <= limit) {
      return this.config.peakGrip * (1 - (slipAngle - peak) / (limit - peak))
    }
    return 0
  }

  private applyGripForce(): void {
    const speed = this._cachedHorizontalSpeed
    if (speed < 0.5) return

    const slipAngle = this.calculateSlipAngle()
    const gripCoeff = this.calculateGripCoefficient(slipAngle)

    if (gripCoeff < 0.01) return

    const sign = this.lateralVelocity > 0 ? -1 : 1
    const force = sign * gripCoeff * speed * GRIP_FORCE_FACTOR * this.envModifiers.gripMultiplier

    this.body.applyImpulse(
      { x: _right.x * force, y: 0, z: _right.z * force },
      true
    )
  }

  private updateSteering(input: number, dt: number): void {
    const steerDir = this._cachedForwardSpeed >= 0 ? input : -input
    const targetSteer = steerDir * this.config.maxSteerAngle
    const steerDiff = targetSteer - this.currentSteer
    this.currentSteer += steerDiff * Math.min(dt * 10, 1)

    const currentAngle = Math.atan2(
      2 * (_quat.w * _quat.y + _quat.x * _quat.z),
      1 - 2 * (_quat.y * _quat.y + _quat.z * _quat.z)
    )

    const speed = this._cachedHorizontalSpeed
    const speedFactor = Math.min(speed / 3, 1)
    const turnRate = this.currentSteer * speedFactor * this.config.steerSpeed * this.envModifiers.steerMultiplier

    const newAngle = currentAngle + turnRate * dt
    _newQuat.setFromAxisAngle(_axisY, newAngle)

    this.body.setRotation(
      { x: _newQuat.x, y: _newQuat.y, z: _newQuat.z, w: _newQuat.w },
      true
    )
    this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
  }

  private updateThrottleLevel(input: number, dt: number): void {
    if (input > 0) {
      this.throttleLevel = Math.min(1, this.throttleLevel + THROTTLE_RAMP_UP * dt)
    } else {
      this.throttleLevel = Math.max(0, this.throttleLevel - THROTTLE_RAMP_DOWN * dt)
    }

    const turboLag = this.config.turboLagTime
    if (turboLag > 0) {
      if (input > 0) {
        const spoolRate = 1 / turboLag
        this.boostLevel = Math.min(1, this.boostLevel + spoolRate * dt)
      } else {
        this.boostLevel = Math.max(0, this.boostLevel - TURBO_DECAY_RATE * dt)
      }
    } else {
      this.boostLevel = input > 0 ? 1 : 0
    }
  }

  private applyThrottle(input: number): void {
    if (input <= 0) return

    const speed = this._cachedHorizontalSpeed
    const speedRatio = speed / this.maxSpeedMS
    const forceMultiplier = Math.max(0, 1 - speedRatio * 0.9)
    const turboBoost = 1 + this.boostLevel * TURBO_BOOST_MULTIPLIER
    const force = input * this.config.engineForce * forceMultiplier * turboBoost

    this.body.applyImpulse(
      { x: _forward.x * force, y: 0, z: _forward.z * force },
      true
    )
  }

  private applyBrake(input: number): void {
    if (input <= 0) return

    const velocity = this.body.linvel()

    const speed = this._cachedHorizontalSpeed

    if (this._cachedForwardSpeed > 1.0) {
      const mag = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)
      if (mag > 0.01) {
        _velDir.set(velocity.x / mag, 0, velocity.z / mag)
      } else {
        _velDir.set(0, 0, 0)
      }
      const brakeForce = input * this.config.brakeForce * this.envModifiers.brakingMultiplier
      this.body.applyImpulse(
        { x: -_velDir.x * brakeForce, y: 0, z: -_velDir.z * brakeForce },
        true
      )
    } else {
      const reverseMaxSpeed = this.maxSpeedMS * 0.35
      if (speed < reverseMaxSpeed) {
        const reverseForce = input * this.config.engineForce * 0.4
        this.body.applyImpulse(
          { x: -_forward.x * reverseForce, y: 0, z: -_forward.z * reverseForce },
          true
        )
      }
    }
  }

  private applyDrag(): void {
    const velocity = this.body.linvel()
    const speed = this._cachedHorizontalSpeed

    if (speed > 0.1) {
      const dragMagnitude = this.config.dragCoeff * speed * 0.01 * this.envModifiers.dragMultiplier
      this.body.applyImpulse(
        {
          x: -velocity.x * dragMagnitude,
          y: 0,
          z: -velocity.z * dragMagnitude
        },
        true
      )
    }
  }

  private applyDownforce(): void {
    const speed = this._cachedHorizontalSpeed
    const force = this.config.downforce * speed * speed * 0.0001
    this.body.applyImpulse({ x: 0, y: -force, z: 0 }, true)
  }

  private enforceGround(): void {
    const pos = this.body.translation()
    if (isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z)) {
      this.body.setTranslation({ x: 0, y: this.roadHeight + 0.5, z: 0 }, true)
      this.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
      return
    }
    const minY = this.roadHeight + 0.5
    if (pos.y < minY) {
      this.body.setTranslation({ x: pos.x, y: minY, z: pos.z }, true)
    }
    const vel = this.body.linvel()
    if (Math.abs(vel.y) > 1e-4) {
      this.body.setLinvel({ x: vel.x, y: 0, z: vel.z }, true)
    }
  }

  private updateMesh(dt: number): void {
    const position = this.body.translation()
    const rotation = this.body.rotation()

    this.mesh.position.set(position.x, position.y - 0.5, position.z)
    this.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)

    const speed = this._cachedHorizontalSpeed
    this.wheelSpin += speed * dt / WHEEL_RADIUS

    const rollAngle = Math.max(-MAX_ROLL_ANGLE,
      Math.min(MAX_ROLL_ANGLE, this.lateralVelocity * ROLL_FACTOR))
    this.mesh.rotateZ(rollAngle)

    if (this.wheelFL) {
      this.wheelFL.rotation.x = this.wheelSpin
      this.wheelFL.rotation.y = this.currentSteer
    }
    if (this.wheelFR) {
      this.wheelFR.rotation.x = this.wheelSpin
      this.wheelFR.rotation.y = this.currentSteer
    }
    if (this.wheelRL) {
      this.wheelRL.rotation.x = this.wheelSpin
    }
    if (this.wheelRR) {
      this.wheelRR.rotation.x = this.wheelSpin
    }
  }

  getPosition(): THREE.Vector3 {
    const pos = this.body.translation()
    if (isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z)) {
      return new THREE.Vector3(0, 0.5, 0)
    }
    return new THREE.Vector3(pos.x, pos.y, pos.z)
  }

  setPosition(position: THREE.Vector3): void {
    this.body.setTranslation({ x: position.x, y: position.y, z: position.z }, true)
  }

  setLookAt(angle: number): void {
    _newQuat.setFromAxisAngle(_axisY, angle)
    this.body.setRotation({ x: _newQuat.x, y: _newQuat.y, z: _newQuat.z, w: _newQuat.w }, true)
    this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
  }

  resetPhysics(): void {
    this.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    this.currentSteer = 0
    this.lateralVelocity = 0
    this.wheelSpin = 0
    this.throttleLevel = 0
    this.boostLevel = 0
  }

  syncMesh(): void {
    const pos = this.body.translation()
    const rot = this.body.rotation()
    this.mesh.position.set(pos.x, pos.y - 0.5, pos.z)
    this.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w)
  }

  getPositionRef(): { x: number; y: number; z: number } {
    return this.body.translation()
  }

  getVelocityRef(): RAPIER.Vector {
    return this.body.linvel()
  }

  getVelocity(): THREE.Vector3 {
    const vel = this.body.linvel()
    return new THREE.Vector3(vel.x || 0, vel.y || 0, vel.z || 0)
  }

  getQuaternion(): THREE.Quaternion {
    const rot = this.body.rotation()
    return new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
  }

  getSpeed(): number {
    const vel = this.body.linvel()
    const vx = vel.x || 0
    const vz = vel.z || 0
    return Math.sqrt(vx * vx + vz * vz) * 3.6
  }

  getMaxSpeed(): number {
    return this.config.maxSpeed
  }

  getLateralVelocity(): number {
    return this.lateralVelocity || 0
  }

  getSteerAngle(): number {
    return this.currentSteer
  }

  getSlipAngle(): number {
    return this.calculateSlipAngle()
  }

  getGripCoefficient(): number {
    return this.calculateGripCoefficient(this.calculateSlipAngle())
  }

  getRPM(): number {
    const speed = this._cachedHorizontalSpeed
    const speedRatio = speed / this.maxSpeedMS
    return 800 + Math.min(1, speedRatio) * 6700
  }

  getBoostLevel(): number {
    return this.boostLevel
  }

  getConfig(): CarConfig {
    return this.config
  }

  getMesh(): THREE.Group {
    return this.mesh
  }

  getBody(): RAPIER.RigidBody {
    return this.body
  }

  setEnvironmentModifiers(mods: EnvironmentModifiers): void {
    const safe = safeNumber
    this.envModifiers = {
      gripMultiplier: safe(mods.gripMultiplier, 1.0),
      dragMultiplier: safe(mods.dragMultiplier, 1.0),
      brakingMultiplier: safe(mods.brakingMultiplier, 1.0),
      steerMultiplier: safe(mods.steerMultiplier, 1.0)
    }
  }

  setRoadHeight(h: number): void {
    this.roadHeight = h
  }

  getEnvironmentModifiers(): EnvironmentModifiers {
    return { ...this.envModifiers }
  }

  disposeMesh(): void {
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
  }
}
