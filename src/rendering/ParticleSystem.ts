import * as THREE from 'three'

interface PooledParticle {
  mesh: THREE.Points
  geometry: THREE.BufferGeometry
  material: THREE.PointsMaterial
  active: boolean
  lifetime: number
  maxLifetime: number
  velocity: THREE.Vector3
}

const _vel = new THREE.Vector3()

export class ParticleSystem {
  private scene: THREE.Scene
  private pool: PooledParticle[] = []
  private readonly POOL_SIZE = 30
  private readonly MAX_POSITIONS = 24
  private nextIndex = 0

  constructor(scene: THREE.Scene) {
    this.scene = scene
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(this.MAX_POSITIONS * 3)
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

      const material = new THREE.PointsMaterial({
        color: 0xcccccc,
        size: 0.8,
        transparent: true,
        opacity: 0,
        depthWrite: false
      })

      const mesh = new THREE.Points(geometry, material)
      mesh.visible = false
      scene.add(mesh)

      this.pool.push({
        mesh,
        geometry,
        material,
        active: false,
        lifetime: 0,
        maxLifetime: 1,
        velocity: new THREE.Vector3()
      })
    }
  }

  emitTireSmoke(position: THREE.Vector3, intensity: number): void {
    if (intensity < 0.1) return

    const p = this.pool[this.nextIndex]
    this.nextIndex = (this.nextIndex + 1) % this.POOL_SIZE

    if (p.active) {
      this.scene.remove(p.mesh)
    }

    const count = Math.floor(intensity * 8)
    const positions = p.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < this.MAX_POSITIONS; i++) {
      if (i < count) {
        positions[i * 3] = position.x + (Math.random() - 0.5) * 1.5
        positions[i * 3 + 1] = position.y + Math.random() * 0.5
        positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 1.5
      } else {
        positions[i * 3] = 0
        positions[i * 3 + 1] = -1000
        positions[i * 3 + 2] = 0
      }
    }
    p.geometry.attributes.position.needsUpdate = true
    p.geometry.setDrawRange(0, count)

    p.material.size = 0.8 + intensity * 0.5
    p.material.opacity = 0.4 * intensity

    _vel.set(
      (Math.random() - 0.5) * 2,
      1 + Math.random(),
      (Math.random() - 0.5) * 2
    )
    p.velocity.copy(_vel)

    p.active = true
    p.lifetime = 0
    p.maxLifetime = 0.5 + intensity * 0.5
    p.mesh.visible = true
  }

  update(dt: number): void {
    for (const p of this.pool) {
      if (!p.active) continue

      p.lifetime += dt

      if (p.lifetime >= p.maxLifetime) {
        p.active = false
        p.mesh.visible = false
        continue
      }

      const life = p.lifetime / p.maxLifetime
      const positions = p.geometry.attributes.position.array as Float32Array
      const count = p.geometry.drawRange.count

      for (let j = 0; j < count; j++) {
        positions[j * 3] += p.velocity.x * dt
        positions[j * 3 + 1] += p.velocity.y * dt
        positions[j * 3 + 2] += p.velocity.z * dt
      }
      p.geometry.attributes.position.needsUpdate = true

      p.material.opacity = 0.4 * (1 - life)
      p.material.size = 0.8 + life * 2
    }
  }

  dispose(): void {
    for (const p of this.pool) {
      this.scene.remove(p.mesh)
      p.geometry.dispose()
      p.material.dispose()
    }
    this.pool = []
  }
}
