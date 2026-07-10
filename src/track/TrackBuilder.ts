import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { SplinePath } from './SplinePath'

export interface TrackConfig {
  roadWidth: number
  barrierHeight: number
  barrierOffset: number
  roadColor: number
  barrierColor: number
}

const DEFAULT_CONFIG: TrackConfig = {
  roadWidth: 12,
  barrierHeight: 1.0,
  barrierOffset: 0.5,
  roadColor: 0x333333,
  barrierColor: 0x888888
}

export class TrackBuilder {
  private config: TrackConfig

  constructor(config?: Partial<TrackConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  buildTrack(
    spline: SplinePath,
    scene: THREE.Scene,
    world: RAPIER.World,
    divisions: number = 200
  ): void {
    const roadMesh = this.createRoadMesh(spline, divisions)
    scene.add(roadMesh)

    const barrierMeshes = this.createBarriers(spline, divisions)
    barrierMeshes.forEach((mesh) => scene.add(mesh))

    this.createBarrierCollision(spline, world, divisions)
  }

  private createRoadMesh(
    spline: SplinePath,
    divisions: number
  ): THREE.Mesh {
    const geometry = new THREE.BufferGeometry()
    const vertices: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    const indices: number[] = []

    const halfWidth = this.config.roadWidth / 2

    for (let i = 0; i <= divisions; i++) {
      const t = i / divisions
      const point = spline.getPoint(t)
      const right = spline.getRightVector(t)

      const left = point.clone().add(right.clone().multiplyScalar(-halfWidth))
      const rightPoint = point.clone().add(right.clone().multiplyScalar(halfWidth))

      vertices.push(left.x, 0.01, left.z)
      vertices.push(rightPoint.x, 0.01, rightPoint.z)

      normals.push(0, 1, 0)
      normals.push(0, 1, 0)

      uvs.push(0, t * 20)
      uvs.push(1, t * 20)

      if (i < divisions) {
        const base = i * 2
        indices.push(base, base + 1, base + 2)
        indices.push(base + 1, base + 3, base + 2)
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)

    const material = new THREE.MeshStandardMaterial({
      color: this.config.roadColor,
      roughness: 0.9,
      metalness: 0.0
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.receiveShadow = true
    return mesh
  }

  private createBarriers(
    spline: SplinePath,
    divisions: number
  ): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = []
    const halfWidth = this.config.roadWidth / 2 + this.config.barrierOffset

    for (let side = -1; side <= 1; side += 2) {
      const geometry = new THREE.BufferGeometry()
      const vertices: number[] = []
      const normals: number[] = []
      const indices: number[] = []

      for (let i = 0; i <= divisions; i++) {
        const t = i / divisions
        const point = spline.getPoint(t)
        const right = spline.getRightVector(t)

        const barrierPoint = point.clone().add(
          right.clone().multiplyScalar(side * halfWidth)
        )

        vertices.push(barrierPoint.x, 0, barrierPoint.z)
        vertices.push(barrierPoint.x, this.config.barrierHeight, barrierPoint.z)

        normals.push(0, 0, side)
        normals.push(0, 0, side)

        if (i < divisions) {
          const base = i * 2
          if (side === -1) {
            indices.push(base, base + 2, base + 1)
            indices.push(base + 1, base + 2, base + 3)
          } else {
            indices.push(base, base + 1, base + 2)
            indices.push(base + 1, base + 3, base + 2)
          }
        }
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
      geometry.setIndex(indices)

      const material = new THREE.MeshStandardMaterial({
        color: this.config.barrierColor,
        roughness: 0.8,
        metalness: 0.2
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.castShadow = true
      mesh.receiveShadow = true
      meshes.push(mesh)
    }

    return meshes
  }

  private createBarrierCollision(
    spline: SplinePath,
    world: RAPIER.World,
    divisions: number
  ): void {
    const halfWidth = this.config.roadWidth / 2 + this.config.barrierOffset
    const step = Math.floor(divisions / 20)

    for (let side = -1; side <= 1; side += 2) {
      const bodyDesc = RAPIER.RigidBodyDesc.fixed()
      const body = world.createRigidBody(bodyDesc)

      for (let i = 0; i < divisions; i += step) {
        const t = i / divisions
        const tNext = Math.min((i + step) / divisions, 1)
        const point = spline.getPoint(t)
        const pointNext = spline.getPoint(tNext)
        const right = spline.getRightVector(t)

        const start = point.clone().add(right.clone().multiplyScalar(side * halfWidth))
        const end = pointNext.clone().add(right.clone().multiplyScalar(side * halfWidth))

        const length = start.distanceTo(end)
        const mid = start.clone().add(end).multiplyScalar(0.5)

        const direction = end.clone().sub(start).normalize()
        const angle = Math.atan2(direction.x, direction.z)

        const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, length / 2)
        colliderDesc.setTranslation(mid.x, 0.5, mid.z)
        colliderDesc.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle))
        world.createCollider(colliderDesc, body)
      }
    }
  }
}
