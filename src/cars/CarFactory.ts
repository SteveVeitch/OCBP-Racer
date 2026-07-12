import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import RAPIER from '@dimforge/rapier3d-compat'
import { CarController, CarConfig } from '../physics/CarController'
import { CarDefinition } from './CarConfigs'

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
}

const MODEL_OVERRIDES: Record<string, ModelOverride> = {
  'kaiju-gt-r': { scaleMultiplier: 2.0, yOffsetOverride: 0.15 },
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
    'gt3:LOD_A_TYRE_REAR_mm_tyre1' // RR
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

    let useProceduralWheels = true

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

      group.add(model)

      const wheelNames = GLTF_WHEEL_NAMES[definition.id]
      if (wheelNames && this.extractGLTFWheels(group, model, wheelNames)) {
        useProceduralWheels = false
      }
    } else {
      const mats = this.createMaterials(definition.color)
      for (const spec of profile.body) addBox(group, spec, mats)
      for (const spec of profile.extras) addBox(group, spec, mats)
      this.addQuadExhausts(group, definition.id, mats)
    }

    const mats = this.createMaterials(definition.color)
    this.addLights(group, profile.body, mats)
    if (useProceduralWheels) {
      this.addWheels(group, profile, mats)
    }

    return group
  }

  private extractGLTFWheels(root: THREE.Group, gltfScene: THREE.Group, wheelNames: string[]): boolean {
    const _worldPos = new THREE.Vector3()

    for (const name of wheelNames) {
      let found: THREE.Object3D | undefined
      gltfScene.traverse(child => {
        if (child.name === name && !found) found = child
      })
      if (!found) return false

      found.getWorldPosition(_worldPos)
      root.worldToLocal(_worldPos)

      const wheelGroup = new THREE.Group()
      wheelGroup.userData.isWheel = true
      wheelGroup.position.copy(_worldPos)

      const clone = found.clone(true)
      wheelGroup.add(clone)

      found.parent?.remove(found)

      root.add(wheelGroup)
    }

    return true
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

  private addLights(group: THREE.Group, body: BoxSpec[], mats: Record<string, THREE.Material>): void {
    const frontBumper = body.find(b => b.mat === 'grille')
    const rearBumper = body.find(b => b.z < -2.0)
    if (!frontBumper || !rearBumper) return

    const fx = frontBumper.w * 0.29
    const fy = frontBumper.y + frontBumper.h * 0.5
    const fz = frontBumper.z + frontBumper.d * 0.5 + 0.02
    const rx = rearBumper.w * 0.33
    const ry = rearBumper.y + rearBumper.h * 0.2
    const rz = rearBumper.z - rearBumper.d * 0.5 - 0.02

    addBox(group, { w: 0.3, h: 0.12, d: 0.08, x: -fx, y: fy, z: fz, mat: 'headlight' }, mats)
    addBox(group, { w: 0.3, h: 0.12, d: 0.08, x: fx, y: fy, z: fz, mat: 'headlight' }, mats)
    addBox(group, { w: 0.25, h: 0.1, d: 0.06, x: -rx, y: ry, z: rz, mat: 'taillight' }, mats)
    addBox(group, { w: 0.25, h: 0.1, d: 0.06, x: rx, y: ry, z: rz, mat: 'taillight' }, mats)

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
