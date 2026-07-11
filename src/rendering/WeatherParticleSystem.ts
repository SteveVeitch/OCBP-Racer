import * as THREE from 'three'

const MAX_DROPS = 3000
const DROP_SPEED = 25
const DROP_AREA = 80
const DROP_HEIGHT = 30

export class WeatherParticleSystem {
  private scene: THREE.Scene
  private mesh!: THREE.InstancedMesh
  private dummy = new THREE.Object3D()
  private velocities: Float32Array
  private count = 0
  private active = false

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.velocities = new Float32Array(MAX_DROPS * 3)
    this.initMesh()
  }

  private initMesh(): void {
    this.mesh = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.8, 4),
      new THREE.MeshBasicMaterial({ color: 0x9999cc, transparent: true, opacity: 0.4 }),
      MAX_DROPS
    )
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.mesh.count = 0
    this.scene.add(this.mesh)
  }

  setIntensity(intensity: number): void {
    this.count = Math.floor(intensity * MAX_DROPS)
    this.active = this.count > 0
    this.mesh.count = this.active ? this.count : 0

    if (this.active) {
      for (let i = 0; i < this.count; i++) {
        this.resetDrop(i)
        const y = Math.random() * DROP_HEIGHT
        this.velocities[i * 3 + 1] = -DROP_SPEED * (0.8 + Math.random() * 0.4)
        this.dummy.position.set(
          this.velocities[i * 3],
          y,
          this.velocities[i * 3 + 2]
        )
        this.dummy.updateMatrix()
        this.mesh.setMatrixAt(i, this.dummy.matrix)
      }
      this.mesh.instanceMatrix.needsUpdate = true
    }
  }

  private resetDrop(i: number): void {
    const x = (Math.random() - 0.5) * DROP_AREA
    const z = (Math.random() - 0.5) * DROP_AREA
    this.velocities[i * 3] = x
    this.velocities[i * 3 + 1] = DROP_HEIGHT
    this.velocities[i * 3 + 2] = z
  }

  update(dt: number, playerPos?: THREE.Vector3): void {
    if (!this.active) return

    const offsetX = playerPos ? playerPos.x : 0
    const offsetZ = playerPos ? playerPos.z : 0

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3
      this.velocities[idx + 1] -= DROP_SPEED * dt * 2

      let x = this.velocities[idx]
      let y = this.velocities[idx + 1]
      let z = this.velocities[idx + 2]

      if (y < 0) {
        this.resetDrop(i)
        x = this.velocities[idx] + offsetX
        y = DROP_HEIGHT
        z = this.velocities[idx + 2] + offsetZ
        this.velocities[idx + 1] = -DROP_SPEED * (0.8 + Math.random() * 0.4)
      }

      this.dummy.position.set(x, y, z)
      this.dummy.updateMatrix()
      this.mesh.setMatrixAt(i, this.dummy.matrix)
    }

    this.mesh.instanceMatrix.needsUpdate = true
  }

  dispose(): void {
    this.scene.remove(this.mesh)
    this.mesh.geometry.dispose()
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach(m => m.dispose())
    } else {
      this.mesh.material.dispose()
    }
  }
}
