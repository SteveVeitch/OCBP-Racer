import * as THREE from 'three'

export class ParticleSystem {
  private scene: THREE.Scene
  private particles: THREE.Points[] = []
  private maxParticles = 50

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  emitTireSmoke(position: THREE.Vector3, intensity: number): void {
    if (intensity < 0.1) return

    const smokeGeometry = new THREE.BufferGeometry()
    const count = Math.floor(intensity * 8)
    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 1.5
      positions[i * 3 + 1] = position.y + Math.random() * 0.5
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 1.5
    }

    smokeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const smokeMaterial = new THREE.PointsMaterial({
      color: 0xcccccc,
      size: 0.8 + intensity * 0.5,
      transparent: true,
      opacity: 0.4 * intensity,
      depthWrite: false
    })

    const smoke = new THREE.Points(smokeGeometry, smokeMaterial)
    smoke.userData.lifetime = 0
    smoke.userData.maxLifetime = 0.5 + intensity * 0.5
    smoke.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      1 + Math.random(),
      (Math.random() - 0.5) * 2
    )

    this.scene.add(smoke)
    this.particles.push(smoke)

    if (this.particles.length > this.maxParticles) {
      const oldest = this.particles.shift()!
      this.scene.remove(oldest)
      oldest.geometry.dispose()
      ;(oldest.material as THREE.PointsMaterial).dispose()
    }
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      particle.userData.lifetime += dt

      if (particle.userData.lifetime >= particle.userData.maxLifetime) {
        this.scene.remove(particle)
        particle.geometry.dispose()
        ;(particle.material as THREE.PointsMaterial).dispose()
        this.particles.splice(i, 1)
        continue
      }

      const life = particle.userData.lifetime / particle.userData.maxLifetime
      const positions = particle.geometry.attributes.position.array as Float32Array

      for (let j = 0; j < positions.length / 3; j++) {
        positions[j * 3] += particle.userData.velocity.x * dt
        positions[j * 3 + 1] += particle.userData.velocity.y * dt
        positions[j * 3 + 2] += particle.userData.velocity.z * dt
      }
      particle.geometry.attributes.position.needsUpdate = true

      const mat = particle.material as THREE.PointsMaterial
      mat.opacity = 0.4 * (1 - life)
      mat.size = 0.8 + life * 2
    }
  }

  dispose(): void {
    this.particles.forEach(p => {
      this.scene.remove(p)
      p.geometry.dispose()
      ;(p.material as THREE.PointsMaterial).dispose()
    })
    this.particles = []
  }
}
