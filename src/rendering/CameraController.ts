import * as THREE from 'three'

export type CameraView = 'chase' | 'windscreen' | 'hood' | 'bumper'

export interface CameraConfig {
  distance: number
  height: number
  lookAhead: number
  springStiffness: number
  springDamping: number
  rotationLag: number
  baseFOV: number
  fovRange: number
  wallCheckRadius: number
}

const VIEW_CONFIGS: Record<CameraView, CameraConfig> = {
  chase: {
    distance: 6.0,
    height: 2.5,
    lookAhead: 1.0,
    springStiffness: 30.0,
    springDamping: 0.95,
    rotationLag: 0.08,
    baseFOV: 60,
    fovRange: 2,
    wallCheckRadius: 0.5
  },
  windscreen: {
    distance: 0.3,
    height: 1.2,
    lookAhead: 2.0,
    springStiffness: 80.0,
    springDamping: 0.9,
    rotationLag: 0.02,
    baseFOV: 80,
    fovRange: 5,
    wallCheckRadius: 0.2
  },
  hood: {
    distance: 0.1,
    height: 0.9,
    lookAhead: 3.0,
    springStiffness: 100.0,
    springDamping: 0.85,
    rotationLag: 0.01,
    baseFOV: 72,
    fovRange: 4,
    wallCheckRadius: 0.1
  },
  bumper: {
    distance: 0.0,
    height: 0.35,
    lookAhead: 4.0,
    springStiffness: 120.0,
    springDamping: 0.8,
    rotationLag: 0.005,
    baseFOV: 85,
    fovRange: 8,
    wallCheckRadius: 0.0
  }
}

const VIEW_ORDER: CameraView[] = ['chase', 'windscreen', 'hood', 'bumper']

const raycaster = new THREE.Raycaster()

export class CameraController {
  private camera: THREE.PerspectiveCamera
  private config: CameraConfig
  private currentView: CameraView

  private velocity = new THREE.Vector3()
  private currentFOV: number
  private wallObjects: THREE.Object3D[] = []

  constructor(camera: THREE.PerspectiveCamera, config?: Partial<CameraConfig>) {
    this.camera = camera
    this.currentView = 'chase'
    this.config = { ...VIEW_CONFIGS.chase, ...config }
    this.currentFOV = this.config.baseFOV
  }

  setWallObjects(objects: THREE.Object3D[]): void {
    this.wallObjects = objects
  }

  cycleView(): CameraView {
    const idx = VIEW_ORDER.indexOf(this.currentView)
    this.currentView = VIEW_ORDER[(idx + 1) % VIEW_ORDER.length]
    this.config = VIEW_CONFIGS[this.currentView]
    this.velocity.set(0, 0, 0)
    this.currentFOV = this.config.baseFOV
    this.camera.fov = this.currentFOV
    this.camera.updateProjectionMatrix()
    return this.currentView
  }

  setView(view: CameraView): void {
    if (this.currentView === view) return
    this.currentView = view
    this.config = VIEW_CONFIGS[view]
    this.velocity.set(0, 0, 0)
    this.currentFOV = this.config.baseFOV
    this.camera.fov = this.currentFOV
    this.camera.updateProjectionMatrix()
  }

  getView(): CameraView {
    return this.currentView
  }

  getViewConfigs(): Record<CameraView, CameraConfig> {
    return VIEW_CONFIGS
  }

  update(
    carPosition: THREE.Vector3,
    _carVelocity: THREE.Vector3,
    carQuaternion: THREE.Quaternion,
    speed: number,
    maxSpeed: number,
    dt: number
  ): void {
    if (this.currentView === 'chase') {
      const targetPosition = this.calculateTargetPosition(carPosition, carQuaternion)
      this.resolveWallCollision(carPosition, targetPosition)
      this.springFollow(targetPosition, dt)
    } else {
      const directPosition = this.calculateTargetPosition(carPosition, carQuaternion)
      this.camera.position.copy(directPosition)
      this.velocity.set(0, 0, 0)
    }

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

  private resolveWallCollision(carPosition: THREE.Vector3, target: THREE.Vector3): void {
    if (this.wallObjects.length === 0) return

    const dir = target.clone().sub(carPosition)
    const distance = dir.length()
    if (distance < 0.01) return

    dir.normalize()

    raycaster.set(carPosition, dir)
    raycaster.far = distance
    raycaster.near = 0

    const intersects = raycaster.intersectObjects(this.wallObjects, true)

    if (intersects.length > 0) {
      const hit = intersects[0]
      const safeDistance = Math.max(hit.distance - this.config.wallCheckRadius, 0.5)
      const clampedDir = dir.multiplyScalar(safeDistance)
      target.copy(carPosition).add(clampedDir)
      target.y = carPosition.y + this.config.height
    }
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
