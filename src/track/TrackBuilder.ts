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

const _scratchVec = new THREE.Vector3()
const _scratchVec2 = new THREE.Vector3()
const _scratchVec3 = new THREE.Vector3()
const _scratchVec4 = new THREE.Vector3()
const _scratchQuat = new THREE.Quaternion()
const _axisY = new THREE.Vector3(0, 1, 0)

function createAsphaltTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(0, 0, size, size)

  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 25
    data[i] = Math.max(0, Math.min(255, data[i] + noise))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
  }
  ctx.putImageData(imageData, 0, 0)

  const edgeWidth = size * 0.06
  ctx.fillStyle = '#cccccc'
  ctx.fillRect(0, 0, size, edgeWidth)
  ctx.fillRect(0, size - edgeWidth, size, edgeWidth)

  const centerX = size / 2
  const dashLen = size * 0.08
  const gapLen = size * 0.06
  ctx.fillStyle = '#ddcc44'
  for (let y = 0; y < size; y += dashLen + gapLen) {
    ctx.fillRect(centerX - 2, y, 4, dashLen)
  }

  for (let y = 0; y < size; y += 2) {
    const row = Math.floor(y / 4)
    const isRumble = row % 2 === 0
    if (isRumble) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(0, y, edgeWidth * 0.6, 2)
      ctx.fillRect(size - edgeWidth * 0.6, y, edgeWidth * 0.6, 2)
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 20)
  tex.anisotropy = 8
  return tex
}

function createBarrierMaterial(): THREE.MeshStandardMaterial {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#666666'
  ctx.fillRect(0, 0, size, size)

  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 15
    data[i] = Math.max(0, Math.min(255, data[i] + noise))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
  }
  ctx.putImageData(imageData, 0, 0)

  const stripeH = size * 0.15
  ctx.fillStyle = '#cc2222'
  ctx.fillRect(0, 0, size, stripeH)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, stripeH, size, stripeH)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping

  return new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.7,
    metalness: 0.4
  })
}

function createGuardrailGeometry(
  spline: SplinePath,
  divisions: number,
  side: number,
  halfWidth: number
): THREE.BufferGeometry {
  const railHeight = 0.75

  const vertices: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const bottomY = 0.0
  const midY = railHeight * 0.45
  const topY = railHeight
  const flangeW = 0.06
  const webW = 0.03

  for (let i = 0; i <= divisions; i++) {
    const t = i / divisions
    const point = spline.getPoint(t)
    const right = spline.getRightVector(t)
    const offset = side * halfWidth

    const cx = point.x + right.x * offset
    const cz = point.z + right.z * offset

    _scratchVec.set(right.x * side, 0, right.z * side)

    const bx = cx - _scratchVec.x * flangeW
    const bz = cz - _scratchVec.z * flangeW
    vertices.push(bx, bottomY, bz)
    normals.push(-_scratchVec.x * side, 0, -_scratchVec.z * side)
    uvs.push(0, t * 20)

    const tx = cx + _scratchVec.x * flangeW
    const tz = cz + _scratchVec.z * flangeW
    vertices.push(tx, topY, tz)
    normals.push(_scratchVec.x * side, 0, _scratchVec.z * side)
    uvs.push(1, t * 20)

    const mx1 = cx - _scratchVec.x * webW
    const mz1 = cz - _scratchVec.z * webW
    vertices.push(mx1, midY, mz1)
    normals.push(0, 0, side)
    uvs.push(0.5, t * 20)

    if (i < divisions) {
      const base = i * 3
      indices.push(base, base + 3, base + 1)
      indices.push(base + 1, base + 3, base + 4)
      indices.push(base, base + 2, base + 3)
      indices.push(base + 2, base + 5, base + 3)
      indices.push(base + 1, base + 4, base + 2)
      indices.push(base + 2, base + 4, base + 5)
    }
  }

  const geom = new THREE.BufferGeometry()
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geom.setIndex(indices)
  geom.computeVertexNormals()
  return geom
}

export class TrackBuilder {
  private config: TrackConfig
  private sceneMeshes: THREE.Mesh[] = []
  private rigidBodies: RAPIER.RigidBody[] = []
  private disposedMaterials = new Set<THREE.Material>()

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
    this.sceneMeshes.push(roadMesh)

    const barrierMat = createBarrierMaterial()
    const halfWidth = this.config.roadWidth / 2 + this.config.barrierOffset
    for (const side of [-1, 1]) {
      const geom = createGuardrailGeometry(spline, divisions, side, halfWidth)
      const mesh = new THREE.Mesh(geom, barrierMat)
      mesh.castShadow = true
      mesh.receiveShadow = true
      scene.add(mesh)
      this.sceneMeshes.push(mesh)
    }

    this.createBarrierCollision(spline, world, divisions)
  }

  getRoadMaterial(): THREE.MeshStandardMaterial | null {
    if (this.sceneMeshes.length > 0) {
      const mat = this.sceneMeshes[0].material
      if (mat instanceof THREE.MeshStandardMaterial) return mat
    }
    return null
  }

  cleanup(scene: THREE.Scene, world: RAPIER.World): void {
    this.disposedMaterials.clear()

    for (const mesh of this.sceneMeshes) {
      scene.remove(mesh)
      mesh.geometry.dispose()
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => {
          if (!this.disposedMaterials.has(m)) {
            this.disposedMaterials.add(m)
            if (m instanceof THREE.MeshStandardMaterial && m.map) m.map.dispose()
            m.dispose()
          }
        })
      } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
        if (!this.disposedMaterials.has(mesh.material)) {
          this.disposedMaterials.add(mesh.material)
          if (mesh.material.map) mesh.material.map.dispose()
          mesh.material.dispose()
        }
      } else if (!this.disposedMaterials.has(mesh.material as THREE.Material)) {
        const mat = mesh.material as THREE.Material
        this.disposedMaterials.add(mat)
        mat.dispose()
      }
    }
    this.sceneMeshes = []
    this.disposedMaterials.clear()

    for (const body of this.rigidBodies) {
      world.removeRigidBody(body)
    }
    this.rigidBodies = []
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

      _scratchVec.copy(point).addScaledVector(right, -halfWidth)
      _scratchVec2.copy(point).addScaledVector(right, halfWidth)

      vertices.push(_scratchVec.x, point.y + 0.01, _scratchVec.z)
      vertices.push(_scratchVec2.x, point.y + 0.01, _scratchVec2.z)

      const n = new THREE.Vector3().crossVectors(
        new THREE.Vector3().subVectors(_scratchVec2, _scratchVec),
        new THREE.Vector3(0, 1, 0)
      ).normalize()

      normals.push(n.x, n.y, n.z)
      normals.push(n.x, n.y, n.z)

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

    const asphaltTex = createAsphaltTexture()
    const material = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      color: this.config.roadColor,
      roughness: 0.85,
      metalness: 0.0
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.receiveShadow = true
    return mesh
  }

  private createBarrierCollision(
    spline: SplinePath,
    world: RAPIER.World,
    divisions: number
  ): void {
    const halfWidth = this.config.roadWidth / 2 + this.config.barrierOffset
    const step = Math.max(1, Math.floor(divisions / 20))

    for (const side of [-1, 1]) {
      const bodyDesc = RAPIER.RigidBodyDesc.fixed()
      const body = world.createRigidBody(bodyDesc)
      this.rigidBodies.push(body)

      for (let i = 0; i < divisions; i += step) {
        const t = i / divisions
        const tNext = Math.min((i + step) / divisions, 1)
        const point = spline.getPoint(t)
        const pointNext = spline.getPoint(tNext)
        const right = spline.getRightVector(t)

        _scratchVec.copy(point).addScaledVector(right, side * halfWidth)
        _scratchVec2.copy(pointNext).addScaledVector(right, side * halfWidth)

        const length = _scratchVec.distanceTo(_scratchVec2)
        if (length < 0.1) continue

        _scratchVec3.copy(_scratchVec).add(_scratchVec2).multiplyScalar(0.5)

        _scratchVec4.copy(_scratchVec2).sub(_scratchVec).normalize()
        const angle = Math.atan2(_scratchVec4.x, _scratchVec4.z)

        const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, length / 2)
        colliderDesc.setTranslation(_scratchVec3.x, _scratchVec3.y + 0.5, _scratchVec3.z)
        _scratchQuat.setFromAxisAngle(_axisY, angle)
        colliderDesc.setRotation(_scratchQuat)
        world.createCollider(colliderDesc, body)
      }
    }
  }
}
