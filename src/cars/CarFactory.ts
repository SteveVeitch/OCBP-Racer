import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import RAPIER from '@dimforge/rapier3d-compat'
import { CarController, CarConfig } from '../physics/CarController'
import { CarDefinition, CARS } from './CarConfigs'

interface BoxSpec {
  w: number; h: number; d: number
  x: number; y: number; z: number
  mat: 'paint' | 'dark' | 'glass' | 'grille' | 'chrome' | 'headlight' | 'taillight'
  shadow?: boolean
}

interface WheelSpec {
  frontZ: number; rearZ: number
  x: number; y: number
}

interface CarMeshProfile {
  body: BoxSpec[]
  extras: BoxSpec[]
  wheels: { left: WheelSpec; right: WheelSpec }
}

const PROFILES: Record<string, CarMeshProfile> = {
  'rossini-488': {
    body: [
      { w: 1.9, h: 0.40, d: 4.3, x: 0, y: 0.32, z: 0, mat: 'paint', shadow: true },
      { w: 1.7, h: 0.12, d: 1.3, x: 0, y: 0.58, z: 1.3, mat: 'paint', shadow: true },
      { w: 1.4, h: 0.45, d: 1.2, x: 0, y: 0.75, z: 0.2, mat: 'glass', shadow: true },
      { w: 1.3, h: 0.06, d: 0.9, x: 0, y: 1.00, z: 0, mat: 'paint', shadow: true },
      { w: 1.8, h: 0.15, d: 0.8, x: 0, y: 0.58, z: -1.2, mat: 'paint', shadow: true },
      { w: 1.9, h: 0.25, d: 0.12, x: 0, y: 0.25, z: 2.15, mat: 'grille' },
      { w: 1.8, h: 0.25, d: 0.10, x: 0, y: 0.25, z: -2.15, mat: 'dark' },
    ],
    extras: [
      { w: 1.9, h: 0.04, d: 0.25, x: 0, y: 0.12, z: 2.2, mat: 'dark' },
      { w: 1.7, h: 0.08, d: 0.3, x: 0, y: 0.12, z: -2.2, mat: 'dark' },
      { w: 0.1, h: 0.15, d: 0.6, x: -0.95, y: 0.35, z: -0.3, mat: 'dark' },
      { w: 0.1, h: 0.15, d: 0.6, x: 0.95, y: 0.35, z: -0.3, mat: 'dark' },
    ],
    wheels: {
      left: { x: 0.95, y: 0.32, frontZ: 1.30, rearZ: 1.25 },
      right: { x: 0.95, y: 0.32, frontZ: 1.30, rearZ: 1.25 },
    },
  },

  'weissach-gt3': {
    body: [
      { w: 1.85, h: 0.42, d: 4.2, x: 0, y: 0.33, z: 0, mat: 'paint', shadow: true },
      { w: 1.6, h: 0.14, d: 1.4, x: 0, y: 0.60, z: 1.2, mat: 'paint', shadow: true },
      { w: 1.45, h: 0.50, d: 1.3, x: 0, y: 0.79, z: 0.1, mat: 'glass', shadow: true },
      { w: 1.35, h: 0.06, d: 1.0, x: 0, y: 1.07, z: 0, mat: 'paint', shadow: true },
      { w: 1.7, h: 0.20, d: 0.9, x: 0, y: 0.64, z: -1.1, mat: 'paint', shadow: true },
      { w: 1.85, h: 0.28, d: 0.12, x: 0, y: 0.26, z: 2.1, mat: 'grille' },
      { w: 1.75, h: 0.28, d: 0.10, x: 0, y: 0.26, z: -2.1, mat: 'dark' },
    ],
    extras: [
      { w: 1.8, h: 0.05, d: 0.2, x: 0, y: 0.12, z: 2.1, mat: 'dark' },
      { w: 1.6, h: 0.04, d: 0.3, x: 0, y: 0.55, z: -1.8, mat: 'dark', shadow: true },
      { w: 0.06, h: 0.20, d: 0.06, x: -0.6, y: 0.44, z: -1.8, mat: 'dark' },
      { w: 0.06, h: 0.20, d: 0.06, x: 0.6, y: 0.44, z: -1.8, mat: 'dark' },
      { w: 0.15, h: 0.03, d: 0.3, x: -0.9, y: 0.18, z: 2.0, mat: 'dark' },
      { w: 0.15, h: 0.03, d: 0.3, x: 0.9, y: 0.18, z: 2.0, mat: 'dark' },
    ],
    wheels: {
      left: { x: 0.92, y: 0.32, frontZ: 1.25, rearZ: 1.20 },
      right: { x: 0.92, y: 0.32, frontZ: 1.25, rearZ: 1.20 },
    },
  },

  'kaiju-gt-r': {
    body: [
      { w: 2.0, h: 0.42, d: 4.4, x: 0, y: 0.33, z: 0, mat: 'paint', shadow: true },
      { w: 1.7, h: 0.13, d: 1.3, x: 0, y: 0.60, z: 1.3, mat: 'paint', shadow: true },
      { w: 1.5, h: 0.48, d: 1.3, x: 0, y: 0.78, z: 0.15, mat: 'glass', shadow: true },
      { w: 1.4, h: 0.06, d: 1.0, x: 0, y: 1.05, z: 0, mat: 'paint', shadow: true },
      { w: 1.7, h: 0.12, d: 0.9, x: 0, y: 0.60, z: -1.2, mat: 'paint', shadow: true },
      { w: 2.0, h: 0.30, d: 0.15, x: 0, y: 0.26, z: 2.2, mat: 'grille' },
      { w: 1.9, h: 0.30, d: 0.12, x: 0, y: 0.26, z: -2.2, mat: 'dark' },
    ],
    extras: [
      { w: 1.7, h: 0.05, d: 0.35, x: 0, y: 0.50, z: -1.9, mat: 'dark', shadow: true },
      { w: 0.06, h: 0.22, d: 0.06, x: -0.65, y: 0.39, z: -1.9, mat: 'dark' },
      { w: 0.06, h: 0.22, d: 0.06, x: 0.65, y: 0.39, z: -1.9, mat: 'dark' },
      { w: 0.12, h: 0.30, d: 1.0, x: -1.0, y: 0.33, z: 0.5, mat: 'paint', shadow: true },
      { w: 0.12, h: 0.30, d: 1.0, x: 1.0, y: 0.33, z: 0.5, mat: 'paint', shadow: true },
      { w: 0.12, h: 0.30, d: 1.0, x: -1.0, y: 0.33, z: -0.5, mat: 'paint', shadow: true },
      { w: 0.12, h: 0.30, d: 1.0, x: 1.0, y: 0.33, z: -0.5, mat: 'paint', shadow: true },
      { w: 0.08, h: 0.10, d: 3.0, x: -1.0, y: 0.18, z: 0, mat: 'dark' },
      { w: 0.08, h: 0.10, d: 3.0, x: 1.0, y: 0.18, z: 0, mat: 'dark' },
    ],
    wheels: {
      left: { x: 1.0, y: 0.32, frontZ: 1.35, rearZ: 1.30 },
      right: { x: 1.0, y: 0.32, frontZ: 1.35, rearZ: 1.30 },
    },
  },

  'stingray-z06': {
    body: [
      { w: 1.88, h: 0.38, d: 4.2, x: 0, y: 0.31, z: 0, mat: 'paint', shadow: true },
      { w: 1.65, h: 0.11, d: 1.2, x: 0, y: 0.56, z: 1.3, mat: 'paint', shadow: true },
      { w: 1.35, h: 0.44, d: 1.15, x: 0, y: 0.72, z: 0.2, mat: 'glass', shadow: true },
      { w: 1.25, h: 0.06, d: 0.85, x: 0, y: 0.97, z: 0, mat: 'paint', shadow: true },
      { w: 1.75, h: 0.14, d: 0.85, x: 0, y: 0.57, z: -1.15, mat: 'paint', shadow: true },
      { w: 1.88, h: 0.24, d: 0.12, x: 0, y: 0.24, z: 2.1, mat: 'grille' },
      { w: 1.75, h: 0.24, d: 0.10, x: 0, y: 0.24, z: -2.1, mat: 'dark' },
    ],
    extras: [
      { w: 1.85, h: 0.04, d: 0.22, x: 0, y: 0.11, z: 2.15, mat: 'dark' },
      { w: 1.65, h: 0.08, d: 0.28, x: 0, y: 0.11, z: -2.15, mat: 'dark' },
      { w: 0.12, h: 0.18, d: 0.7, x: -0.94, y: 0.35, z: -0.2, mat: 'dark' },
      { w: 0.12, h: 0.18, d: 0.7, x: 0.94, y: 0.35, z: -0.2, mat: 'dark' },
    ],
    wheels: {
      left: { x: 0.94, y: 0.32, frontZ: 1.28, rearZ: 1.22 },
      right: { x: 0.94, y: 0.32, frontZ: 1.28, rearZ: 1.22 },
    },
  },
}

const GLTF_PATHS: Record<string, string> = {
  'rossini-488': '/assets/models/2018_ferrari_488_gt3/scene.gltf',
  'weissach-gt3': '/assets/models/2009_porsche_911_gt3_rsr/scene.gltf',
  'kaiju-gt-r': '/assets/models/2018_nissan_gtr/scene.gltf',
  'stingray-z06': '/assets/models/2020_chevrolet_corvette_c8/scene.gltf',
}

const TARGET_LENGTHS: Record<string, number> = {
  'rossini-488': 4.3,
  'weissach-gt3': 4.2,
  'kaiju-gt-r': 4.4,
  'stingray-z06': 4.2,
}

interface ModelOverride {
  scaleMultiplier?: number
  yOffsetOverride?: number
  hideRearGeometry?: boolean
}

const MODEL_OVERRIDES: Record<string, ModelOverride> = {
  'kaiju-gt-r': { scaleMultiplier: 2.0, yOffsetOverride: 0.15, hideRearGeometry: true },
}

interface LightPositions {
  frontX: number
  frontY: number
  frontZ: number
  rearX: number
  rearY: number
  rearZ: number
  headlightSize: { w: number; h: number }
  headlightCircle?: boolean
  taillightSize: { w: number; h: number }
  taillightCircle?: boolean
}

const LIGHT_OFFSETS: Record<string, LightPositions> = {
  'rossini-488': {
    frontX: 0.60, frontY: 0.59, frontZ: 1.73,
    rearX: 0.72, rearY: 0.73, rearZ: -1.78,
    headlightSize: { w: 0.04, h: 0.04 },
    headlightCircle: true,
    taillightSize: { w: 0.08, h: 0.08 },
    taillightCircle: true,
  },
  'weissach-gt3': {
    frontX: 0.60, frontY: 0.59, frontZ: 1.69,
    rearX: 0.70, rearY: 0.73, rearZ: -1.74,
    headlightSize: { w: 0.04, h: 0.04 },
    headlightCircle: true,
    taillightSize: { w: 0.08, h: 0.08 },
    taillightCircle: true,
  },
  'kaiju-gt-r': {
    frontX: 0.62, frontY: 0.59, frontZ: 1.77,
    rearX: 0.75, rearY: 0.73, rearZ: -1.82,
    headlightSize: { w: 0.04, h: 0.04 },
    headlightCircle: true,
    taillightSize: { w: 0.08, h: 0.08 },
    taillightCircle: true,
  },
  'stingray-z06': {
    frontX: 0.60, frontY: 0.57, frontZ: 1.69,
    rearX: 0.72, rearY: 0.71, rearZ: -1.74,
    headlightSize: { w: 0.04, h: 0.04 },
    headlightCircle: true,
    taillightSize: { w: 0.08, h: 0.08 },
    taillightCircle: true,
  },
}

interface CachedGLTFModel {
  scene: THREE.Group
  scale: number
  yOffset: number
}

const GLTF_WHEEL_NAMES: Record<string, string[]> = {
  'rossini-488': [
    'gt3:LOD_A_TYRE_mm_tyre',      // FL
    'gt3:LOD_A_TYRE_mm_tyre1',     // FR
    'gt3:LOD_A_TYRE_REAR_mm_tyre', // RL
    'gt3:LOD_A_TYRE_REAR_mm_tyre1______' // RR
  ],
}

const GLTF_RIM_NAMES: Record<string, string[]> = {
  'rossini-488': [
    'gt3:LOD_A_WHEEL_mm_wheel',         // FL
    'gt3:LOD_A_WHEEL_mm_wheel1',        // FR
    'gt3:LOD_A_WHEEL_REAR_mm_wheel',    // RL
    'gt3:LOD_A_WHEEL_REAR_mm_wheel1',   // RR
  ],
}

const _box = new THREE.BoxGeometry(1, 1, 1)

function addBox(group: THREE.Group, spec: BoxSpec, mats: Record<string, THREE.Material>): void {
  const mesh = new THREE.Mesh(_box, mats[spec.mat])
  mesh.scale.set(spec.w, spec.h, spec.d)
  mesh.position.set(spec.x, spec.y, spec.z)
  if (spec.shadow) mesh.castShadow = true
  group.add(mesh)
}

export class CarFactory {
  private world: RAPIER.World
  private modelCache = new Map<string, CachedGLTFModel>()

  constructor(world: RAPIER.World) {
    this.world = world
  }

  async preloadModels(): Promise<void> {
    const loader = new GLTFLoader()
    const entries = Object.entries(GLTF_PATHS)

    const results = await Promise.allSettled(
      entries.map(async ([carId, path]) => {
        const gltf = await loader.loadAsync(path)
        const scene = gltf.scene

        const box = new THREE.Box3().setFromObject(scene)
        const size = box.getSize(new THREE.Vector3())
        const targetLen = TARGET_LENGTHS[carId] || 4.3
        let scale = targetLen / Math.max(size.z, 0.01)

        const override = MODEL_OVERRIDES[carId]
        if (override?.scaleMultiplier) scale *= override.scaleMultiplier

        scene.scale.setScalar(scale)

        const scaledBox = new THREE.Box3().setFromObject(scene)
        const yOffset = override?.yOffsetOverride ?? -scaledBox.min.y

        this.modelCache.set(carId, { scene, scale, yOffset })
      })
    )

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.warn(`Failed to load GLTF for ${entries[i][0]}:`, r.reason)
      }
    })
  }

  hasModel(carId: string): boolean {
    return this.modelCache.has(carId)
  }

  createCar(definition: CarDefinition, scene: THREE.Scene): CarController {
    const body = this.createRigidBody(definition.config)
    const mesh = this.createCarMesh(definition)
    scene.add(mesh)
    return new CarController(body, mesh, definition.config)
  }

  createPreviewMesh(carId: string): THREE.Group {
    const definition = CARS.find(c => c.id === carId)
    if (!definition) throw new Error(`Unknown car: ${carId}`)
    return this.createCarMesh(definition)
  }

  private createRigidBody(config: CarConfig): RAPIER.RigidBody {
    const desc = RAPIER.RigidBodyDesc.dynamic()
    desc.setTranslation(0, 0.5, 0)
    desc.setAdditionalMass(config.mass)
    desc.setLinearDamping(1.0)
    desc.setAngularDamping(5.0)

    const body = this.world.createRigidBody(desc)

    const colliderDesc = RAPIER.ColliderDesc.cuboid(1, 0.5, 2)
    colliderDesc.setFriction(0.8)
    this.world.createCollider(colliderDesc, body)

    return body
  }

  private createCarMesh(definition: CarDefinition): THREE.Group {
    const group = new THREE.Group()
    const profile = PROFILES[definition.id]
    if (!profile) return group

    const cached = this.modelCache.get(definition.id)
    if (cached) {
      const model = cached.scene.clone(true)
      model.position.y = cached.yOffset

      model.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true

          const mat = child.material
          if (mat instanceof THREE.MeshStandardMaterial && !mat.transparent) {
            if (mat.emissiveIntensity > 0) return
            const roughness = mat.roughness
            const metalness = mat.metalness
            if (roughness < 0.5 && metalness > 0.3) {
              const tinted = mat.clone()
              tinted.color.set(definition.color)
              child.material = tinted
            }
          }
        }
      })

      const override = MODEL_OVERRIDES[definition.id]
      if (override?.hideRearGeometry) {
        model.updateMatrixWorld(true)
        model.traverse(child => {
          if (!(child instanceof THREE.Mesh) || !child.geometry) return
          const wb = new THREE.Box3().setFromObject(child)
          if (wb.isEmpty()) return
          const wc = wb.getCenter(new THREE.Vector3())
          if (wc.z < -3.0) child.visible = false
        })
      }

      group.add(model)

      const wheelNames = GLTF_WHEEL_NAMES[definition.id]
      const rimNames = GLTF_RIM_NAMES[definition.id]
      if (wheelNames) {
        this.wrapGLTFWheels(group, model, wheelNames, rimNames)
      }
    } else {
      const mats = this.createMaterials(definition.color)
      for (const spec of profile.body) addBox(group, spec, mats)
      for (const spec of profile.extras) addBox(group, spec, mats)
      this.addQuadExhausts(group, definition.id, mats)
    }

    const mats = this.createMaterials(definition.color)
    this.addLights(group, profile.body, mats, definition.id)
    if (!cached) {
      this.addWheels(group, profile, mats)
    }

    return group
  }

  private wrapGLTFWheels(root: THREE.Group, gltfScene: THREE.Group, wheelNames: string[], rimNames: string[]): boolean {
    const wheels: THREE.Object3D[] = []
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const scl = new THREE.Vector3()

    for (let i = 0; i < wheelNames.length; i++) {
      const tyreNode = this.findNode(gltfScene, wheelNames[i])
      if (!tyreNode?.parent) return false

      const m = (tyreNode as any).matrix as THREE.Matrix4
      m.decompose(pos, quat, scl)

      this.centerNodeGeometry(tyreNode)

      tyreNode.position.copy(pos)
      tyreNode.rotation.set(0, 0, 0)
      tyreNode.rotation.order = 'YXZ'
      tyreNode.scale.copy(scl)
      ;(tyreNode as any).matrixAutoUpdate = true

      const rimName = rimNames[i]
      if (rimName) {
        const rimNode = this.findNode(gltfScene, rimName)
        if (rimNode?.parent) {
          this.centerNodeGeometry(rimNode)
          rimNode.position.set(0, 0, 0)
          rimNode.rotation.set(0, 0, 0)
          rimNode.scale.set(1, 1, 1)
          ;(rimNode as any).matrixAutoUpdate = true
          rimNode.parent.remove(rimNode)
          tyreNode.add(rimNode)
        }
      }

      wheels.push(tyreNode)
    }

    root.userData.gltfWheels = wheels
    return true
  }

  private centerNodeGeometry(node: THREE.Object3D, outCenter?: THREE.Vector3): void {
    const box = new THREE.Box3()
    let found = false

    for (const child of node.children) {
      if (child instanceof THREE.Mesh && child.geometry) {
        const posAttr = child.geometry.attributes.position
        if (!posAttr) continue
        child.updateMatrix()
        const cb = new THREE.Box3().setFromBufferAttribute(posAttr as THREE.BufferAttribute)
        cb.applyMatrix4(child.matrix)
        if (!found) { box.copy(cb); found = true } else box.union(cb)
      }
    }

    if (!found) {
      if (outCenter) outCenter.set(0, 0, 0)
      return
    }

    const c = box.getCenter(outCenter ?? new THREE.Vector3())

    for (const child of node.children) {
      if (child instanceof THREE.Mesh) {
        child.position.x -= c.x
        child.position.y -= c.y
        child.position.z -= c.z
      }
    }
  }

  private findNode(root: THREE.Object3D, name: string): THREE.Object3D | undefined {
    let found: THREE.Object3D | undefined
    root.traverse(child => {
      if (child.name === name && !found) found = child
    })
    return found
  }

  private createMaterials(color: number): Record<string, THREE.Material> {
    return {
      paint: new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.85 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, metalness: 0.2 }),
      glass: new THREE.MeshStandardMaterial({
        color: 0x111822, roughness: 0.1, metalness: 0.9,
      }),
      grille: new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.6, metalness: 0.4 }),
      chrome: new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.15, metalness: 0.95 }),
      headlight: new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xffffcc, emissiveIntensity: 3.0,
        roughness: 0.1, metalness: 0.5,
      }),
      taillight: new THREE.MeshStandardMaterial({
        color: 0xff0000, emissive: 0xff2200, emissiveIntensity: 2.0,
        roughness: 0.2, metalness: 0.3,
      }),
    }
  }

  private addLights(group: THREE.Group, _body: BoxSpec[], mats: Record<string, THREE.Material>, carId?: string): void {
    let fx: number, fy: number, fz: number
    let rx: number, ry: number, rz: number
    let hw: number, hh: number, tw: number, th: number
    let circleRear = false
    let circleFront = false

    const offsets = carId ? LIGHT_OFFSETS[carId] : undefined
    if (offsets) {
      fx = offsets.frontX; fy = offsets.frontY; fz = offsets.frontZ
      rx = offsets.rearX; ry = offsets.rearY; rz = offsets.rearZ
      hw = offsets.headlightSize.w; hh = offsets.headlightSize.h
      tw = offsets.taillightSize.w; th = offsets.taillightSize.h
      circleRear = !!offsets.taillightCircle
      circleFront = !!offsets.headlightCircle
    } else {
      const frontBumper = _body.find(b => b.mat === 'grille')
      const rearBumper = _body.find(b => b.z < -2.0)
      if (!frontBumper || !rearBumper) return

      fx = frontBumper.w * 0.29
      fy = frontBumper.y + frontBumper.h * 0.5
      fz = frontBumper.z + frontBumper.d * 0.5 + 0.02
      rx = rearBumper.w * 0.33
      ry = rearBumper.y + rearBumper.h * 0.2
      rz = rearBumper.z - rearBumper.d * 0.5 - 0.02
      hw = 0.3; hh = 0.12; tw = 0.25; th = 0.1
    }

    if (circleFront) {
      const geo = new THREE.SphereGeometry(hw, 16, 16)
      const meshL = new THREE.Mesh(geo, mats.headlight)
      meshL.position.set(-fx, fy, fz)
      group.add(meshL)
      const meshR = new THREE.Mesh(geo, mats.headlight)
      meshR.position.set(fx, fy, fz)
      group.add(meshR)
    } else {
      addBox(group, { w: hw, h: hh, d: 0.06, x: -fx, y: fy, z: fz, mat: 'headlight' }, mats)
      addBox(group, { w: hw, h: hh, d: 0.06, x: fx, y: fy, z: fz, mat: 'headlight' }, mats)
    }

    if (circleRear) {
      const geo = new THREE.SphereGeometry(tw, 16, 16)
      const meshL = new THREE.Mesh(geo, mats.taillight)
      meshL.position.set(-rx, ry, rz)
      group.add(meshL)
      const meshR = new THREE.Mesh(geo, mats.taillight)
      meshR.position.set(rx, ry, rz)
      group.add(meshR)
    } else {
      addBox(group, { w: tw, h: th, d: 0.05, x: -rx, y: ry, z: rz, mat: 'taillight' }, mats)
      addBox(group, { w: tw, h: th, d: 0.05, x: rx, y: ry, z: rz, mat: 'taillight' }, mats)
    }

    const hlL = new THREE.SpotLight(0xffeedd, 25, 60, 0.5, 0.4, 1.5)
    hlL.position.set(-fx, fy, fz)
    hlL.target.position.set(-fx, 0, 20)
    group.add(hlL)
    group.add(hlL.target)

    const hlR = new THREE.SpotLight(0xffeedd, 25, 60, 0.5, 0.4, 1.5)
    hlR.position.set(fx, fy, fz)
    hlR.target.position.set(fx, 0, 20)
    group.add(hlR)
    group.add(hlR.target)

    const tlL = new THREE.PointLight(0xff2200, 1.5, 8)
    tlL.position.set(-rx, ry, rz)
    group.add(tlL)

    const tlR = new THREE.PointLight(0xff2200, 1.5, 8)
    tlR.position.set(rx, ry, rz)
    group.add(tlR)
  }

  private addWheels(group: THREE.Group, profile: CarMeshProfile, mats: Record<string, THREE.Material>): void {
    const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16)
    const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.24, 8)

    const wl = profile.wheels.left
    const wr = profile.wheels.right
    const positions = [
      { x: -wl.x, y: wl.y, z: wl.frontZ },
      { x: wr.x, y: wr.y, z: wr.frontZ },
      { x: -wl.x, y: wl.y, z: -wl.rearZ },
      { x: wr.x, y: wr.y, z: -wr.rearZ },
    ]

    positions.forEach(pos => {
      const wheelGroup = new THREE.Group()

      const tire = new THREE.Mesh(tireGeo, mats.dark)
      tire.rotation.z = Math.PI / 2
      wheelGroup.add(tire)

      const rim = new THREE.Mesh(rimGeo, mats.chrome)
      rim.rotation.z = Math.PI / 2
      wheelGroup.add(rim)

      wheelGroup.position.set(pos.x, pos.y, pos.z)
      wheelGroup.castShadow = true
      group.add(wheelGroup)
    })
  }

  private addQuadExhausts(group: THREE.Group, carId: string, mats: Record<string, THREE.Material>): void {
    if (carId !== 'kaiju-gt-r') return

    const cylGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8)
    const offsets = [
      { x: -0.4, y: 0.55 },
      { x: -0.15, y: 0.55 },
      { x: 0.15, y: 0.55 },
      { x: 0.4, y: 0.55 },
    ]

    offsets.forEach(({ x, y }) => {
      const exhaust = new THREE.Mesh(cylGeo, mats.chrome)
      exhaust.position.set(x, y, -2.2)
      exhaust.rotation.x = Math.PI / 2
      group.add(exhaust)
    })
  }
}
