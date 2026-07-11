import * as THREE from 'three'
import { TimeOfDayPreset } from './TimeOfDayPresets'
import { WeatherPreset } from './WeatherPresets'
import { TerrainType } from '../track/TrackDefinitions'

export class EnvironmentManager {
  private scene: THREE.Scene
  private ambientLight: THREE.AmbientLight
  private directionalLight: THREE.DirectionalLight
  private fogStartNear = 40
  private fogStartFar = 160
  private weatherFogAdd = 0
  private weatherVisibility = 1.0
  private decorations: THREE.Object3D[] = []

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

  applyTimeOfDay(preset: TimeOfDayPreset): void {
    this.fogStartNear = preset.fogNear
    this.fogStartFar = preset.fogFar
    this.ambientLight.color.copy(preset.ambientColor)
    this.ambientLight.intensity = preset.ambientIntensity
    this.directionalLight.color.copy(preset.directionalColor)
    this.directionalLight.intensity = preset.directionalIntensity
    const angle = THREE.MathUtils.degToRad(preset.directionalAngle)
    this.directionalLight.position.set(
      Math.cos(angle) * 80,
      Math.sin(angle) * 80 + 20,
      30
    )
    this.scene.background = preset.skyColor.clone()
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
      this.scene.fog.near = near
      this.scene.fog.far = far
    }
  }

  clearDecorations(): void {
    for (const deco of this.decorations) {
      this.scene.remove(deco)
    }
    this.decorations = []
  }

  addDecorations(terrain: TerrainType, roadCenter: THREE.Vector3, roadRadius: number): void {
    this.clearDecorations()
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
      const angle = (i / 25) * Math.PI * 2
      const dist = radius * 1.4 + Math.random() * 20
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const w = 4 + Math.random() * 6
      const h = 8 + Math.random() * 20
      const d = 4 + Math.random() * 6
      const geom = new THREE.BoxGeometry(w, h, d)
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.0, 0.0, 0.15 + Math.random() * 0.1),
        roughness: 0.9,
        metalness: 0.1
      })
      const mesh = new THREE.Mesh(geom, mat)
      mesh.position.set(x, h / 2, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      this.scene.add(mesh)
      this.decorations.push(mesh)
    }
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2
      const dist = radius * 1.2 + Math.random() * 5
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const lightGeom = new THREE.CylinderGeometry(0.1, 0.1, 5, 6)
      const lightMat = new THREE.MeshStandardMaterial({ color: 0x444444 })
      const pole = new THREE.Mesh(lightGeom, lightMat)
      pole.position.set(x, 2.5, z)
      this.scene.add(pole)
      this.decorations.push(pole)
      const bulbGeom = new THREE.SphereGeometry(0.2, 6, 6)
      const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffcc66 })
      const bulb = new THREE.Mesh(bulbGeom, bulbMat)
      bulb.position.set(x, 5.2, z)
      this.scene.add(bulb)
      this.decorations.push(bulb)
    }
  }

  private addCoastalDecorations(center: THREE.Vector3, radius: number): void {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = radius * 1.5 + Math.random() * 30
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const treeHeight = 3 + Math.random() * 4
      const trunkGeom = new THREE.CylinderGeometry(0.15, 0.2, treeHeight * 0.4, 6)
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x553311 })
      const trunk = new THREE.Mesh(trunkGeom, trunkMat)
      trunk.position.set(x, treeHeight * 0.2, z)
      this.scene.add(trunk)
      this.decorations.push(trunk)
      const foliageGeom = new THREE.SphereGeometry(1 + Math.random(), 8, 8)
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x225522 })
      const foliage = new THREE.Mesh(foliageGeom, foliageMat)
      foliage.position.set(x, treeHeight * 0.6, z)
      foliage.castShadow = true
      this.scene.add(foliage)
      this.decorations.push(foliage)
    }
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const dist = radius * 1.3 + Math.random() * 8
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const rockSize = 0.5 + Math.random() * 1.5
      const rockGeom = new THREE.DodecahedronGeometry(rockSize, 0)
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 1.0 })
      const rock = new THREE.Mesh(rockGeom, rockMat)
      rock.position.set(x, rockSize * 0.4, z)
      rock.rotation.set(Math.random(), Math.random(), Math.random())
      this.scene.add(rock)
      this.decorations.push(rock)
    }
  }

  private addMountainDecorations(center: THREE.Vector3, radius: number): void {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = radius * 1.4 + Math.random() * 40
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const rockSize = 2 + Math.random() * 5
      const rockGeom = new THREE.DodecahedronGeometry(rockSize, 1)
      const rockMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.0, 0.0, 0.3 + Math.random() * 0.15),
        roughness: 0.95
      })
      const rock = new THREE.Mesh(rockGeom, rockMat)
      rock.position.set(x, rockSize * 0.3, z)
      rock.rotation.set(Math.random(), Math.random(), Math.random())
      rock.castShadow = true
      this.scene.add(rock)
      this.decorations.push(rock)
    }
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = radius * 1.3 + Math.random() * 20
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const treeHeight = 2 + Math.random() * 3
      const trunkGeom = new THREE.CylinderGeometry(0.1, 0.15, treeHeight, 5)
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x443322 })
      const trunk = new THREE.Mesh(trunkGeom, trunkMat)
      trunk.position.set(x, treeHeight / 2, z)
      this.scene.add(trunk)
      this.decorations.push(trunk)
      const coneGeom = new THREE.ConeGeometry(1 + Math.random() * 0.5, treeHeight * 0.6, 6)
      const coneMat = new THREE.MeshStandardMaterial({ color: 0x1a4a1a })
      const cone = new THREE.Mesh(coneGeom, coneMat)
      cone.position.set(x, treeHeight * 0.8, z)
      cone.castShadow = true
      this.scene.add(cone)
      this.decorations.push(cone)
    }
  }

  private addIndustrialDecorations(center: THREE.Vector3, radius: number): void {
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2
      const dist = radius * 1.4 + Math.random() * 15
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const w = 5 + Math.random() * 8
      const h = 5 + Math.random() * 12
      const d = 5 + Math.random() * 8
      const geom = new THREE.BoxGeometry(w, h, d)
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.05 + Math.random() * 0.05, 0.1, 0.25 + Math.random() * 0.1),
        roughness: 0.85,
        metalness: 0.3
      })
      const mesh = new THREE.Mesh(geom, mat)
      mesh.position.set(x, h / 2, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      this.scene.add(mesh)
      this.decorations.push(mesh)
    }
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const dist = radius * 1.3 + Math.random() * 10
      const x = center.x + Math.cos(angle) * dist
      const z = center.z + Math.sin(angle) * dist
      const chimneyGeom = new THREE.CylinderGeometry(0.5, 0.7, 15 + Math.random() * 10, 8)
      const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x554444, roughness: 0.9 })
      const chimney = new THREE.Mesh(chimneyGeom, chimneyMat)
      chimney.position.set(x, 10, z)
      chimney.castShadow = true
      this.scene.add(chimney)
      this.decorations.push(chimney)
    }
  }

  dispose(): void {
    this.clearDecorations()
  }
}
