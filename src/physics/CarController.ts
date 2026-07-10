import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { InputState } from '../input/InputManager'

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
  autoCorrect: number
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
  autoCorrect: 0.4
}

export class CarController {
  private body: RAPIER.RigidBody
  private mesh: THREE.Group
  private config: CarConfig
  private currentSteer = 0
  private lateralVelocity = 0

  constructor(body: RAPIER.RigidBody, mesh: THREE.Group, config?: Partial<CarConfig>) {
    this.body = body
    this.mesh = mesh
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  update(dt: number, input: InputState): void {
    this.enforceGround()
    this.updateLateralVelocity()
    this.updateSteering(input.steer, dt)
    this.applyThrottle(input.throttle)
    this.applyBrake(input.brake)
    this.applyDrag()
    this.applyDownforce()
    this.applyAutoCorrect()
    this.updateMesh()
  }

  private updateLateralVelocity(): void {
    const velocity = this.body.linvel()
    const rotation = this.body.rotation()
    const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat)
    this.lateralVelocity = velocity.x * right.x + velocity.z * right.z
  }

  private updateSteering(input: number, dt: number): void {
    const rotation = this.body.rotation()
    const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat)
    const velocity = this.body.linvel()
    const forwardSpeed = velocity.x * forward.x + velocity.z * forward.z

    const steerDir = forwardSpeed >= 0 ? input : -input
    const targetSteer = steerDir * this.config.maxSteerAngle
    const steerDiff = targetSteer - this.currentSteer
    this.currentSteer += steerDiff * Math.min(dt * 10, 1)

    const currentAngle = Math.atan2(
      2 * (quat.w * quat.y + quat.x * quat.z),
      1 - 2 * (quat.y * quat.y + quat.z * quat.z)
    )

    const speed = this.getSpeed() / 3.6
    const speedFactor = Math.min(speed / 3, 1)
    const turnRate = this.currentSteer * speedFactor * this.config.steerSpeed

    const newAngle = currentAngle + turnRate * dt
    const newQuat = new THREE.Quaternion()
    newQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), newAngle)

    this.body.setRotation(
      { x: newQuat.x, y: newQuat.y, z: newQuat.z, w: newQuat.w },
      true
    )
    this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
  }

  private applyThrottle(input: number): void {
    if (input <= 0) return

    const rotation = this.body.rotation()
    const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat)

    const speed = this.getSpeed() / 3.6
    const speedRatio = speed / (this.config.maxSpeed / 3.6)
    const forceMultiplier = Math.max(0, 1 - speedRatio * 0.9)
    const force = input * this.config.engineForce * forceMultiplier

    this.body.applyImpulse(
      { x: forward.x * force, y: 0, z: forward.z * force },
      true
    )
  }

  private applyBrake(input: number): void {
    if (input <= 0) return

    const velocity = this.body.linvel()
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)

    const rotation = this.body.rotation()
    const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat)

    const forwardSpeed = velocity.x * forward.x + velocity.z * forward.z

    if (forwardSpeed > 1.0) {
      const velDir = new THREE.Vector3(velocity.x, 0, velocity.z).normalize()
      const brakeForce = input * this.config.brakeForce
      this.body.applyImpulse(
        { x: -velDir.x * brakeForce, y: 0, z: -velDir.z * brakeForce },
        true
      )
    } else {
      const reverseMaxSpeed = this.config.maxSpeed / 3.6 * 0.35
      if (speed < reverseMaxSpeed) {
        const reverseForce = input * this.config.engineForce * 0.4
        this.body.applyImpulse(
          { x: -forward.x * reverseForce, y: 0, z: -forward.z * reverseForce },
          true
        )
      }
    }
  }

  private applyDrag(): void {
    const velocity = this.body.linvel()
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z)

    if (speed > 0.1) {
      const dragMagnitude = this.config.dragCoeff * speed * 0.01
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
    const speed = this.getSpeed() / 3.6
    const force = this.config.downforce * speed * speed * 0.0001
    this.body.applyImpulse({ x: 0, y: -force, z: 0 }, true)
  }

  private applyAutoCorrect(): void {
    if (Math.abs(this.currentSteer) < 0.01) {
      const speed = this.getSpeed() / 3.6
      if (speed > 2) {
        const correction = -this.lateralVelocity * this.config.autoCorrect * 0.1
        const rotation = this.body.rotation()
        const quat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat)
        this.body.applyImpulse(
          { x: right.x * correction, y: 0, z: right.z * correction },
          true
        )
      }
    }
  }

  private enforceGround(): void {
    const pos = this.body.translation()
    if (isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z)) {
      this.body.setTranslation({ x: 0, y: 0.5, z: 0 }, true)
      this.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
      this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
      return
    }
    if (pos.y < 0.5) {
      this.body.setTranslation({ x: pos.x, y: 0.5, z: pos.z }, true)
    }
    const vel = this.body.linvel()
    if (vel.y !== 0) {
      this.body.setLinvel({ x: vel.x, y: 0, z: vel.z }, true)
    }
  }

  private updateMesh(): void {
    const position = this.body.translation()
    const rotation = this.body.rotation()

    this.mesh.position.set(position.x, position.y - 0.5, position.z)
    this.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
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
    const quat = new THREE.Quaternion()
    quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle)
    this.body.setRotation({ x: quat.x, y: quat.y, z: quat.z, w: quat.w }, true)
    this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
  }

  resetPhysics(): void {
    this.body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    this.body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    this.currentSteer = 0
    this.lateralVelocity = 0
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

  getRPM(): number {
    const speed = this.getSpeed() / 3.6
    const speedRatio = speed / (this.config.maxSpeed / 3.6)
    return 800 + Math.min(1, speedRatio) * 6700
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
}
