import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { TimeOfDayPreset } from './TimeOfDayPresets'
import { WeatherPreset } from './WeatherPresets'
import { TerrainType } from '../track/TrackDefinitions'

function createGroundTexture(terrain: TerrainType): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  switch (terrain) {
    case 'urban': {
      ctx.fillStyle = '#1a1a1a'
      ctx.fillRect(0, 0, size, size)
      for (let i = 0; i < 8000; i++) {
        const x = Math.random() * size
        const y = Math.random() * size
        const v = Math.random() * 20
        ctx.fillStyle = `rgba(${v},${v},${v + 5},0.5)`
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2)
      }
      break
    }
    case 'coastal': {
      ctx.fillStyle = '#3a3a2a'
      ctx.fillRect(0, 0, size, size)
      for (let i = 0; i < 6000; i++) {
        const x = Math.random() * size
        const y = Math.random() * size
        const g = 30 + Math.random() * 30
        ctx.fillStyle = `rgba(${g * 0.6},${g},${g * 0.4},0.4)`
        ctx.fillRect(x, y, 1 + Math.random() * 3, 1 + Math.random() * 3)
      }
      break
    }
    case 'mountain': {
      ctx.fillStyle = '#2a2820'
      ctx.fillRect(0, 0, size, size)
      for (let i = 0; i < 10000; i++) {
        const x = Math.random() * size
        const y = Math.random() * size
        const v = 25 + Math.random() * 35
        ctx.fillStyle = `rgba(${v + 5},${v},${v - 5},0.5)`
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2)
      }
      break
    }
    case 'industrial': {
      ctx.fillStyle = '#1e1e1e'
      ctx.fillRect(0, 0, size, size)
      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * size
        const y = Math.random() * size
        const v = 20 + Math.random() * 25
        ctx.fillStyle = `rgba(${v},${v - 3},${v - 5},0.5)`
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2)
      }
      break
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(20, 20)
  return tex
}

function createBuildingTexture(hue: number, lightness: number, windowRatio: number): THREE.CanvasTexture {
  const w = 256
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = `hsl(${hue}, 8%, ${lightness * 100}%)`
  ctx.fillRect(0, 0, w, h)

  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 10
    data[i] = Math.max(0, Math.min(255, data[i] + noise))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
  }
  ctx.putImageData(imageData, 0, 0)

  const winW = 14
  const winH = 18
  const gapX = 24
  const gapY = 30
  const startX = 20
  const startY = 15
  const cols = Math.floor((w - startX * 2) / gapX)
  const rows = Math.floor((h - startY * 2) / gapY)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > windowRatio) continue
      const wx = startX + c * gapX
      const wy = startY + r * gapY
      const lit = Math.random() > 0.35
      if (lit) {
        const warmth = Math.random()
        const wr = 200 + warmth * 55
        const wg = 180 + warmth * 40
        const wb = 100 + warmth * 30
        ctx.fillStyle = `rgba(${wr},${wg},${wb},0.9)`
        ctx.fillRect(wx, wy, winW, winH)
        ctx.fillStyle = `rgba(${wr},${wg},${wb},0.15)`
        ctx.fillRect(wx - 2, wy - 2, winW + 4, winH + 4)
      } else {
        ctx.fillStyle = `rgba(30,30,40,0.8)`
        ctx.fillRect(wx, wy, winW, winH)
      }
    }
  }

  const floorH = 8
  ctx.fillStyle = `hsl(${hue}, 5%, ${lightness * 80}%)`
  for (let r = 0; r < rows; r++) {
    const fy = startY + r * gapY + winH + 2
    ctx.fillRect(0, fy, w, floorH)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

function createRockTexture(baseColor: number): THREE.MeshStandardMaterial {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const r = (baseColor >> 16) & 0xff
  const g = (baseColor >> 8) & 0xff
  const b = baseColor & 0xff

  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.fillRect(0, 0, size, size)

  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 30
    data[i] = Math.max(0, Math.min(255, data[i] + noise))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
  }
  ctx.putImageData(imageData, 0, 0)

  const tex = new THREE.CanvasTexture(canvas)
  return new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.95,
    metalness: 0.05
  })
}

export class EnvironmentManager {
  private scene: THREE.Scene
  private ambientLight: THREE.AmbientLight
  private directionalLight: THREE.DirectionalLight
  private fogStartNear = 40
  private fogStartFar = 160
  private weatherFogAdd = 0
  private weatherVisibility = 1.0
  private fogColor: THREE.Color = new THREE.Color(0x0a0a15)
  private decorations: THREE.Object3D[] = []
  private groundMesh: THREE.Mesh | null = null
  private groundGeometry: THREE.PlaneGeometry | null = null
  private currentTerrain: TerrainType | null = null
  private hdrCache = new Map<string, THREE.Texture>()
  private pmremGenerator: THREE.PMREMGenerator | null = null

  private sharedUrbanBaseMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9, metalness: 0.05 })
  private sharedIndustrialBaseMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.9, metalness: 0.1 })
  private sharedCoastalTrunkMat = new THREE.MeshStandardMaterial({ color: 0x553311, roughness: 0.95 })
  private sharedMountainTrunkMat = new THREE.MeshStandardMaterial({ color: 0x443322, roughness: 0.95 })
  private sharedChimneyMat = new THREE.MeshStandardMaterial({ color: 0x554444, roughness: 0.85, metalness: 0.15 })
  private sharedBandMat = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.6, metalness: 0.3 })

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    this.directionalLight.position.set(50, 80, 30)
    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.width = 2048
    this.directionalLight.shadow.mapSize.height = 2048
    this.directionalLight.shadow.camera.near = 0.5
    this.directionalLight.shadow.camera.far = 200
    this.directionalLight.shadow.camera.left = -100
    this.directionalLight.shadow.camera.right = 100
    this.directionalLight.shadow.camera.top = 100
    this.directionalLight.shadow.camera.bottom = -100
    this.scene.add(this.ambientLight)
    this.scene.add(this.directionalLight)
    this.scene.fog = new THREE.Fog(0x0a0a15, 40, 160)
    this.scene.background = new THREE.Color(0x050510)
  }

  async initEnvironmentMaps(renderer: THREE.WebGLRenderer, presets: TimeOfDayPreset[]): Promise<void> {
    this.pmremGenerator = new THREE.PMREMGenerator(renderer)
    this.pmremGenerator.compileEquirectangularShader()

    const loader = new RGBELoader()
    const uniquePaths = [...new Set(presets.map(p => p.hdrPath).filter(Boolean))] as string[]

    const loadPromises = uniquePaths.map(async (hdrPath) => {
      try {
        const texture = await loader.loadAsync(hdrPath)
        const envMap = this.pmremGenerator!.fromEquirectangular(texture).texture
        texture.dispose()
        this.hdrCache.set(hdrPath, envMap)
      } catch (err) {
        console.warn(`Failed to load HDR: ${hdrPath}`, err)
      }
    })

    await Promise.all(loadPromises)
  }

  applyTimeOfDay(preset: TimeOfDayPreset): void {
    this.fogStartNear = preset.fogNear
    this.fogStartFar = preset.fogFar
    this.fogColor = preset.fogColor.clone()
    this.ambientLight.intensity = 0
    this.directionalLight.intensity = 0
    if (preset.hdrPath && this.hdrCache.has(preset.hdrPath)) {
      const envMap = this.hdrCache.get(preset.hdrPath)!
      this.scene.background = envMap
      this.scene.environment = envMap
    } else {
      this.scene.background = preset.skyColor.clone()
      this.scene.environment = null
    }
    this.updateFog()
  }

  applyWeather(preset: WeatherPreset): void {
    this.weatherFogAdd = preset.fogDensityAdd
    this.weatherVisibility = preset.visibilityMultiplier
    this.updateFog()
  }

  private updateFog(): void {
    const near = Math.max(10, this.fogStartNear - this.weatherFogAdd)
    const far = Math.max(30, this.fogStartFar * this.weatherVisibility)
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.color.copy(this.fogColor)
      this.scene.fog.near = near
      this.scene.fog.far = far
    }
  }

  setGroundTexture(terrain: TerrainType): void {
    if (terrain === this.currentTerrain && this.groundMesh) return

    if (this.groundMesh) {
      this.scene.remove(this.groundMesh)
      const oldMat = this.groundMesh.material as THREE.MeshStandardMaterial
      if (oldMat.map) oldMat.map.dispose()
      oldMat.dispose()
    } else {
      this.groundGeometry = new THREE.PlaneGeometry(400, 400)
    }

    this.currentTerrain = terrain
    const tex = createGroundTexture(terrain)
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.95,
      metalness: 0.0
    })
    this.groundMesh = new THREE.Mesh(this.groundGeometry!, mat)
    this.groundMesh.rotation.x = -Math.PI / 2
    this.groundMesh.position.y = -0.01
    this.groundMesh.receiveShadow = true
    this.scene.add(this.groundMesh)
  }

  clearDecorations(): void {
    const sharedMats = new Set<THREE.Material>([
      this.sharedUrbanBaseMat,
      this.sharedIndustrialBaseMat,
      this.sharedCoastalTrunkMat,
      this.sharedMountainTrunkMat,
      this.sharedChimneyMat,
      this.sharedBandMat
    ])

    for (const deco of this.decorations) {
      this.scene.remove(deco)
      deco.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (child.material instanceof THREE.MeshStandardMaterial) {
            if (!sharedMats.has(child.material)) {
              if (child.material.map) child.material.map.dispose()
              child.material.dispose()
            }
          } else if (Array.isArray(child.material)) {
            child.material.forEach(m => {
              if (!sharedMats.has(m)) {
                if (m instanceof THREE.MeshStandardMaterial && m.map) m.map.dispose()
                m.dispose()
              }
            })
          }
        }
      })
    }
    this.decorations = []
  }

  addDecorations(terrain: TerrainType, roadCenter: THREE.Vector3, roadRadius: number): void {
    this.clearDecorations()
    this.setGroundTexture(terrain)
    switch (terrain) {
      case 'urban':
        this.addUrbanDecorations(roadCenter, roadRadius)
        break
      case 'coastal':
        this.addCoastalDecorations(roadCenter, roadRadius)
        break
      case 'mountain':
        this.addMountainDecorations(roadCenter, roadRadius)
        break
      case 'industrial':
        this.addIndustrialDecorations(roadCenter, roadRadius)
        break
    }
  }

  private addUrbanDecorations(center: THREE.Vector3, radius: number): void {
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2 + (Math.random() - 0.5) * 0.3
      const dist = radius * 1.3 + Math.random() * 25
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const w = 5 + Math.random() * 8
      const h = 10 + Math.random() * 25
      const d = 5 + Math.random() * 8

      const hue = Math.random() * 15 + 210
      const lightness = 0.12 + Math.random() * 0.08
      const winTex = createBuildingTexture(hue, lightness, 0.7)
      winTex.repeat.set(1, h / 10)

      const geom = new THREE.BoxGeometry(w, h, d)
      const mat = new THREE.MeshStandardMaterial({
        map: winTex,
        roughness: 0.85,
        metalness: 0.1
      })
      const mesh = new THREE.Mesh(geom, mat)
      mesh.position.set(x, h / 2, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      this.scene.add(mesh)
      this.decorations.push(mesh)

      const baseH = 1.0 + Math.random() * 1.5
      const baseGeom = new THREE.BoxGeometry(w + 0.4, baseH, d + 0.4)
      const baseMesh = new THREE.Mesh(baseGeom, this.sharedUrbanBaseMat)
      baseMesh.position.set(x, baseH / 2, z)
      baseMesh.castShadow = true
      baseMesh.receiveShadow = true
      this.scene.add(baseMesh)
      this.decorations.push(baseMesh)
    }
  }

  private addCoastalDecorations(center: THREE.Vector3, radius: number): void {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = radius * 1.4 + Math.random() * 30
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const treeHeight = 3 + Math.random() * 5
      const trunkGeom = new THREE.CylinderGeometry(0.12, 0.2, treeHeight * 0.4, 8)
      const trunk = new THREE.Mesh(trunkGeom, this.sharedCoastalTrunkMat)
      trunk.position.set(x, treeHeight * 0.2, z)
      trunk.castShadow = true
      this.scene.add(trunk)
      this.decorations.push(trunk)

      const foliageR = 1.0 + Math.random() * 1.5
      const foliageGeom = new THREE.SphereGeometry(foliageR, 10, 8)
      const foliageColor = new THREE.Color().setHSL(0.28 + Math.random() * 0.06, 0.5 + Math.random() * 0.2, 0.2 + Math.random() * 0.1)
      const foliageMat = new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.9 })
      const foliage = new THREE.Mesh(foliageGeom, foliageMat)
      foliage.position.set(x, treeHeight * 0.65, z)
      foliage.castShadow = true
      this.scene.add(foliage)
      this.decorations.push(foliage)
    }
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = radius * 1.2 + Math.random() * 10
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const rockSize = 0.5 + Math.random() * 1.5
      const rockGeom = new THREE.DodecahedronGeometry(rockSize, 1)
      const rockMat = createRockTexture(0x666666)
      const rock = new THREE.Mesh(rockGeom, rockMat)
      rock.position.set(x, rockSize * 0.35, z)
      rock.rotation.set(Math.random(), Math.random(), Math.random())
      rock.castShadow = true
      this.scene.add(rock)
      this.decorations.push(rock)
    }
  }

  private addMountainDecorations(center: THREE.Vector3, radius: number): void {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = radius * 1.3 + Math.random() * 40
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const rockSize = 2 + Math.random() * 6
      const rockGeom = new THREE.DodecahedronGeometry(rockSize, 1)
      const baseVal = 0.3 + Math.random() * 0.15
      const rockColor = new THREE.Color().setHSL(0.05, 0.15, baseVal)
      const rockMat = createRockTexture(rockColor.getHex())
      const rock = new THREE.Mesh(rockGeom, rockMat)
      rock.position.set(x, rockSize * 0.25, z)
      rock.rotation.set(Math.random() * 0.5, Math.random(), Math.random() * 0.5)
      rock.castShadow = true
      this.scene.add(rock)
      this.decorations.push(rock)
    }
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = radius * 1.2 + Math.random() * 20
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const treeHeight = 2 + Math.random() * 4
      const trunkGeom = new THREE.CylinderGeometry(0.1, 0.18, treeHeight * 0.4, 6)
      const trunk = new THREE.Mesh(trunkGeom, this.sharedMountainTrunkMat)
      trunk.position.set(x, treeHeight * 0.2, z)
      this.scene.add(trunk)
      this.decorations.push(trunk)

      const layers = 2 + Math.floor(Math.random() * 2)
      for (let l = 0; l < layers; l++) {
        const layerR = (1.2 - l * 0.3) + Math.random() * 0.3
        const coneGeom = new THREE.ConeGeometry(layerR, treeHeight * 0.3, 7)
        const coneColor = new THREE.Color().setHSL(0.3, 0.4 + Math.random() * 0.2, 0.15 + Math.random() * 0.1)
        const coneMat = new THREE.MeshStandardMaterial({ color: coneColor, roughness: 0.9 })
        const cone = new THREE.Mesh(coneGeom, coneMat)
        cone.position.set(x, treeHeight * 0.4 + l * treeHeight * 0.2, z)
        cone.castShadow = true
        this.scene.add(cone)
        this.decorations.push(cone)
      }
    }
  }

  private addIndustrialDecorations(center: THREE.Vector3, radius: number): void {
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2 + (Math.random() - 0.5) * 0.3
      const dist = radius * 1.3 + Math.random() * 20
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const w = 6 + Math.random() * 10
      const h = 6 + Math.random() * 14
      const d = 6 + Math.random() * 10

      const hue = 15 + Math.random() * 20
      const lightness = 0.2 + Math.random() * 0.1
      const winTex = createBuildingTexture(hue, lightness, 0.4)
      winTex.repeat.set(1, h / 10)

      const geom = new THREE.BoxGeometry(w, h, d)
      const mat = new THREE.MeshStandardMaterial({
        map: winTex,
        roughness: 0.8,
        metalness: 0.25
      })
      const mesh = new THREE.Mesh(geom, mat)
      mesh.position.set(x, h / 2, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      this.scene.add(mesh)
      this.decorations.push(mesh)

      const baseH = 1.5
      const baseGeom = new THREE.BoxGeometry(w + 0.4, baseH, d + 0.4)
      const baseMesh = new THREE.Mesh(baseGeom, this.sharedIndustrialBaseMat)
      baseMesh.position.set(x, baseH / 2, z)
      baseMesh.receiveShadow = true
      this.scene.add(baseMesh)
      this.decorations.push(baseMesh)
    }
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5
      const dist = radius * 1.2 + Math.random() * 12
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const chimneyH = 12 + Math.random() * 10
      const chimneyGeom = new THREE.CylinderGeometry(0.6, 0.8, chimneyH, 10)
      const chimney = new THREE.Mesh(chimneyGeom, this.sharedChimneyMat)
      chimney.position.set(x, chimneyH / 2, z)
      chimney.castShadow = true
      this.scene.add(chimney)
      this.decorations.push(chimney)

      const bandGeom = new THREE.CylinderGeometry(0.7, 0.7, 1.0, 10)
      const band = new THREE.Mesh(bandGeom, this.sharedBandMat)
      band.position.set(x, chimneyH * 0.75, z)
      this.scene.add(band)
      this.decorations.push(band)
    }
  }

  dispose(): void {
    this.clearDecorations()
    if (this.groundMesh) {
      this.scene.remove(this.groundMesh)
      const mat = this.groundMesh.material as THREE.MeshStandardMaterial
      if (mat.map) mat.map.dispose()
      mat.dispose()
      this.groundGeometry?.dispose()
      this.groundMesh = null
      this.groundGeometry = null
      this.currentTerrain = null
    }
    for (const envMap of this.hdrCache.values()) {
      envMap.dispose()
    }
    this.hdrCache.clear()
    this.pmremGenerator?.dispose()
    this.pmremGenerator = null
    this.scene.remove(this.ambientLight)
    this.scene.remove(this.directionalLight)
    this.sharedUrbanBaseMat.dispose()
    this.sharedIndustrialBaseMat.dispose()
    this.sharedCoastalTrunkMat.dispose()
    this.sharedMountainTrunkMat.dispose()
    this.sharedChimneyMat.dispose()
    this.sharedBandMat.dispose()
  }
}
