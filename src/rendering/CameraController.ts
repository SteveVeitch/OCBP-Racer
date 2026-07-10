import * as THREE from 'three'

export interface CameraConfig {
  distance: number
  height: number
  lookAhead: number
  springStiffness: number
  springDamping: number
  rotationLag: number
  baseFOV: number
  fovRange: number
}

const DEFAULT_CONFIG: CameraConfig = {
  distance: 6.0,
  height: 2.5,
  lookAhead: 1.0,
  springStiffness: 30.0,
  springDamping: 0.95,
  rotationLag: 0.08,
  baseFOV: 60,
  fovRange: 2
}

export class CameraController {
  private camera: THREE.PerspectiveCamera
  private config: CameraConfig

  private velocity = new THREE.Vector3()
  private currentFOV: number

  constructor(camera: THREE.PerspectiveCamera, config?: Partial<CameraConfig>) {
    this.camera = camera
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.currentFOV = this.config.baseFOV
  }

  update(
    carPosition: THREE.Vector3,
    _carVelocity: THREE.Vector3,
    carQuaternion: THREE.Quaternion,
    speed: number,
    maxSpeed: number,
    dt: number
  ): void {
    const targetPosition = this.calculateTargetPosition(carPosition, carQuaternion)
    this.springFollow(targetPosition, dt)
    this.updateLookAt(carPosition, carQuaternion)
    this.updateFOV(speed, maxSpeed)
  }

  private calculateTargetPosition(
    carPosition: THREE.Vector3,
    carQuaternion: THREE.Quaternion
  ): THREE.Vector3 {
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(carQuaternion)
    const behind = forward.clone().multiplyScalar(-this.config.distance)
    behind.y = 0

    const up = new THREE.Vector3(0, this.config.height, 0)

    const lookAheadOffset = forward.clone().multiplyScalar(this.config.lookAhead)
    lookAheadOffset.y = 0

    return carPosition.clone().add(behind).add(up).add(lookAheadOffset)
  }

  private springFollow(target: THREE.Vector3, dt: number): void {
    const displacement = target.clone().sub(this.camera.position)
    const springForce = displacement.multiplyScalar(this.config.springStiffness)
    const dampingForce = this.velocity.clone().multiplyScalar(-this.config.springDamping * 10)

    const acceleration = springForce.add(dampingForce)
    this.velocity.add(acceleration.multiplyScalar(dt))
    this.camera.position.add(this.velocity.clone().multiplyScalar(dt))
  }

  private updateLookAt(carPosition: THREE.Vector3, carQuaternion: THREE.Quaternion): void {
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(carQuaternion)
    const lookAheadPoint = carPosition.clone().add(forward.multiplyScalar(3))
    lookAheadPoint.y += 1

    this.camera.lookAt(lookAheadPoint)
  }

  private updateFOV(speed: number, maxSpeed: number): void {
    const speedRatio = Math.min(speed / maxSpeed, 1)
    const targetFOV = this.config.baseFOV + speedRatio * this.config.fovRange

    this.currentFOV += (targetFOV - this.currentFOV) * 0.05
    this.camera.fov = this.currentFOV
    this.camera.updateProjectionMatrix()
  }

  reset(): void {
    this.velocity.set(0, 0, 0)
  }
}
