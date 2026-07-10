import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { InputManager } from '../input/InputManager'
import { PhysicsWorld } from '../physics/PhysicsWorld'
import { CarController } from '../physics/CarController'
import { CameraController } from '../rendering/CameraController'
import { ParticleSystem } from '../rendering/ParticleSystem'
import { Track } from '../track/Track'
import { StateMachine, RaceResults } from './StateMachine'
import { UIManager } from '../ui/UIManager'
import { AudioManager } from '../audio/AudioManager'
import { AIController } from '../ai/AIController'
import { CARS } from '../cars/CarConfigs'

interface RaceData {
  startTime: number
  lapTimes: number[]
  currentLapStart: number
  totalTime: number
  bestLapTime: number
  position: number
  finished: boolean
  wrongWay: boolean
}

function log(msg: string): void {
  console.log(`[Game] ${msg}`)
}

function logError(msg: string, err?: unknown): void {
  console.error(`[Game] ${msg}`, err ?? '')
}

export class Game {
  private renderer!: THREE.WebGLRenderer
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private cameraController!: CameraController
  private composer!: EffectComposer
  private bloomPass!: UnrealBloomPass
  private clock!: THREE.Clock
  private input!: InputManager
  private physics!: PhysicsWorld
  private car!: CarController
  private track!: Track
  private running = false
  private paused = false

  private state: StateMachine
  private ui: UIManager
  private audio: AudioManager

  private aiControllers: AIController[] = []
  private aiCars: CarController[] = []
  private particles!: ParticleSystem

  private raceData: RaceData = {
    startTime: 0,
    lapTimes: [],
    currentLapStart: 0,
    totalTime: 0,
    bestLapTime: 0,
    position: 1,
    finished: false,
    wrongWay: false
  }

  private countdownTimer = 0
  private countdownStep = -1

  private readonly PHYSICS_TIMESTEP = 1 / 120
  private accumulator = 0
  private lastTime = 0

  private pausePressed = false

  constructor() {
    this.state = new StateMachine()
    this.ui = new UIManager(this.state)
    this.audio = new AudioManager()
  }

  async init(): Promise<void> {
    try {
      log('Setting up renderer...')
      this.setupRenderer()

      log('Setting up scene...')
      this.setupScene()

      log('Setting up camera...')
      this.setupCamera()

      log('Creating ground...')
      this.createGround()

      log('Setting up input...')
      this.input = new InputManager()

      log('Initializing physics (Rapier WASM)...')
      this.physics = new PhysicsWorld()
      await this.physics.init()
      log('Physics initialized OK')

      log('Creating track...')
      this.track = new Track()
      this.track.build(this.scene, this.physics.getWorld())
      log('Track built OK')

      log('Setting up lighting...')
      this.setupLighting()

      log('Adding track environment...')
      this.addTrackEnvironment()

      log('Setting up camera controller...')
      this.cameraController = new CameraController(this.camera)

      log('Setting up post-processing...')
      this.setupPostProcessing()

      log('Initializing audio...')
      await this.audio.init()
      this.applySettings()
      log('Audio initialized OK')

      log('Setting up particle system...')
      this.particles = new ParticleSystem(this.scene)

      log('Setting up UI...')
      this.ui.init({
        onCarSelected: (id) => this.state.setSelectedCar(id),
        onRaceStart: () => this.startRace(),
        onRestart: () => this.restartRace(),
        onBackToMenu: () => this.returnToMenu(),
        onSettingsChanged: () => this.applySettings()
      })
      log('UI initialized OK')

      log('Starting game loop...')
      this.start()
      log('Game started OK — all systems go')
    } catch (err) {
      logError('INIT FAILED:', err)
      this.showFatalError(err)
    }
  }

  private showFatalError(err: unknown): void {
    const msg = err instanceof Error ? err.message : String(err)
    const el = document.createElement('div')
    el.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:#1a0a0a;color:#ff4444;font-family:monospace;font-size:14px;
      padding:40px;z-index:9999;overflow:auto;white-space:pre-wrap;
    `
    el.textContent = `FATAL ERROR DURING INIT:\n\n${msg}\n\nCheck browser console for details.`
    document.body.appendChild(el)
  }

  private setupRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.4
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    document.body.appendChild(this.renderer.domElement)

    window.addEventListener('resize', () => this.onResize())
  }

  private setupScene(): void {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0d1520)
    this.scene.fog = new THREE.FogExp2(0x0d1520, 0.006)
    this.clock = new THREE.Clock()
  }

  private setupCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 3, -6)
    this.camera.lookAt(0, 1, 0)
  }

  private setupPostProcessing(): void {
    this.composer = new EffectComposer(this.renderer)

    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.6,
      0.4,
      0.85
    )
    this.composer.addPass(this.bloomPass)
    this.applyGraphicsQuality()
  }

  private applyGraphicsQuality(): void {
    const quality = this.state.getSettings().graphicsQuality
    switch (quality) {
      case 'low':
        this.bloomPass.strength = 0
        this.bloomPass.enabled = false
        this.renderer.setPixelRatio(1)
        break
      case 'medium':
        this.bloomPass.strength = 0.4
        this.bloomPass.enabled = true
        this.bloomPass.resolution.set(window.innerWidth / 2, window.innerHeight / 2)
        this.renderer.setPixelRatio(1)
        break
      case 'high':
        this.bloomPass.strength = 0.6
        this.bloomPass.enabled = true
        this.bloomPass.resolution.set(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        break
    }
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0x6688aa, 1.2)
    this.scene.add(ambient)

    const hemisphere = new THREE.HemisphereLight(0x8899bb, 0x445566, 0.8)
    this.scene.add(hemisphere)

    const directional = new THREE.DirectionalLight(0x99aacc, 1.5)
    directional.position.set(50, 80, 30)
    directional.castShadow = true
    directional.shadow.mapSize.width = 2048
    directional.shadow.mapSize.height = 2048
    directional.shadow.camera.near = 0.5
    directional.shadow.camera.far = 300
    directional.shadow.camera.left = -80
    directional.shadow.camera.right = 80
    directional.shadow.camera.top = 80
    directional.shadow.camera.bottom = -80
    this.scene.add(directional)

    const spline = this.track.getSpline()
    for (let i = 0; i < 20; i++) {
      const t = i / 20
      const point = spline.getPoint(t)
      const right = spline.getRightVector(t)

      const light = new THREE.PointLight(0xffcc88, 3.0, 40)
      light.position.set(
        point.x + right.x * 8,
        7,
        point.z + right.z * 8
      )
      light.castShadow = false
      this.scene.add(light)

      const poleGeometry = new THREE.CylinderGeometry(0.1, 0.12, 7, 6)
      const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 })
      const pole = new THREE.Mesh(poleGeometry, poleMaterial)
      pole.position.set(
        point.x + right.x * 8,
        3.5,
        point.z + right.z * 8
      )
      this.scene.add(pole)

      const bulbGeometry = new THREE.SphereGeometry(0.25, 8, 8)
      const bulbMaterial = new THREE.MeshStandardMaterial({
        color: 0xffcc88,
        emissive: 0xffcc88,
        emissiveIntensity: 3
      })
      const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial)
      bulb.position.set(
        point.x + right.x * 8,
        7.2,
        point.z + right.z * 8
      )
      this.scene.add(bulb)
    }
  }

  private addTrackEnvironment(): void {
    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1)
    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.9,
      metalness: 0.1
    })

    const spline = this.track.getSpline()
    for (let i = 0; i < 25; i++) {
      const t = Math.random()
      const point = spline.getPoint(t)
      const right = spline.getRightVector(t)
      const side = Math.random() > 0.5 ? 1 : -1

      const width = 5 + Math.random() * 10
      const height = 8 + Math.random() * 20
      const depth = 5 + Math.random() * 10

      const building = new THREE.Mesh(buildingGeometry, buildingMaterial.clone())
      building.scale.set(width, height, depth)
      building.position.set(
        point.x + right.x * side * (15 + Math.random() * 15),
        height / 2,
        point.z + right.z * side * (15 + Math.random() * 15)
      )
      building.castShadow = true
      building.receiveShadow = true
      this.scene.add(building)

      if (Math.random() > 0.5) {
        const windowRows = Math.floor(height / 3)
        const windowCols = Math.floor(width / 3)
        for (let r = 0; r < windowRows; r++) {
          for (let c = 0; c < windowCols; c++) {
            if (Math.random() > 0.6) continue
            const windowGeometry = new THREE.PlaneGeometry(1, 1.5)
            const windowMaterial = new THREE.MeshStandardMaterial({
              color: 0xffdd88,
              emissive: 0xffdd88,
              emissiveIntensity: 0.5
            })
            const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial)
            windowMesh.position.set(
              building.position.x + (c - windowCols / 2) * 2.5,
              2 + r * 3,
              building.position.z + side * depth / 2 + 0.1
            )
            this.scene.add(windowMesh)
          }
        }
      }
    }
  }

  private createGround(): void {
    const geometry = new THREE.PlaneGeometry(200, 200)
    const material = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9,
      metalness: 0.0
    })
    const ground = new THREE.Mesh(geometry, material)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = 0
    ground.receiveShadow = true
    this.scene.add(ground)
  }

  private startRace(): void {
    this.clearRaceEntities()

    const carId = this.state.getSelectedCar()
    this.car = this.physics.createCarWithFactory(carId, this.scene)
    const startPos = this.track.getStartPosition(0)
    const startRot = this.track.getStartRotation()
    this.car.setPosition(new THREE.Vector3(startPos.x, 0.5, startPos.z))
    this.car.setLookAt(startRot)
    this.car.resetPhysics()
    this.cameraController.reset()
    const behindDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0), startRot
    )
    this.camera.position.set(
      startPos.x + behindDir.x * 8,
      startPos.y + 3,
      startPos.z + behindDir.z * 8
    )
    this.camera.lookAt(startPos.x, startPos.y + 1, startPos.z)

    this.aiCars = []
    this.aiControllers = []
    const allCars: CarController[] = [this.car]
    const otherCars = CARS.filter(c => c.id !== carId)
    for (let i = 0; i < 3; i++) {
      const aiCarDef = otherCars[i % otherCars.length]
      const aiCar = this.physics.createCarWithFactory(aiCarDef.id, this.scene)
      const aiPos = this.track.getStartPosition(i + 1)
      aiCar.setPosition(new THREE.Vector3(aiPos.x, 0.5, aiPos.z))
      aiCar.setLookAt(startRot)
      aiCar.resetPhysics()
      allCars.push(aiCar)

      const aiController = new AIController(aiCar, this.track.getSpline(), 0.3 + i * 0.2, allCars)
      this.aiCars.push(aiCar)
      this.aiControllers.push(aiController)
    }

    this.track.reset()

    this.raceData = {
      startTime: 0,
      lapTimes: [],
      currentLapStart: 0,
      totalTime: 0,
      bestLapTime: 0,
      position: 1,
      finished: false,
      wrongWay: false
    }

    this.countdownStep = -1
    this.countdownTimer = 0
    try {
      this.audio.stopRaceAudio()
      this.audio.startRaceAudio()
    } catch (err) {
      logError('Audio init failed (non-fatal):', err)
    }
    this.state.transition('COUNTDOWN')
  }

  private restartRace(): void {
    this.clearRaceEntities()
    this.ui.hideAll()
    this.startRace()
  }

  private returnToMenu(): void {
    this.clearRaceEntities()
    this.audio.stopRaceAudio()
    this.ui.hideAll()
    this.state.transition('MENU')
    this.paused = false
  }

  private clearRaceEntities(): void {
    if (this.car) {
      this.scene.remove(this.car.getMesh())
      try { this.physics.getWorld().removeRigidBody(this.car.getBody()) } catch { /* already removed */ }
      this.car = undefined as unknown as CarController
    }
    this.aiCars.forEach(car => {
      this.scene.remove(car.getMesh())
      try { this.physics.getWorld().removeRigidBody(car.getBody()) } catch { /* already removed */ }
    })
    this.aiCars = []
    this.aiControllers = []
  }

  private start(): void {
    this.running = true
    this.lastTime = performance.now() / 1000
    this.clock.start()
    this.animate()
  }

  private animate(): void {
    if (!this.running) return
    requestAnimationFrame(() => this.animate())

    const currentTime = performance.now() / 1000
    let deltaTime = currentTime - this.lastTime
    this.lastTime = currentTime

    if (deltaTime > 0.1) deltaTime = 0.1

    this.handlePauseInput()

    const currentState = this.state.getCurrent()

    if (currentState === 'COUNTDOWN') {
      this.updateCountdown(deltaTime)
    } else if (currentState === 'RACING' && !this.paused) {
      this.accumulator += deltaTime

      while (this.accumulator >= this.PHYSICS_TIMESTEP) {
        this.updatePhysics(this.PHYSICS_TIMESTEP)
        this.accumulator -= this.PHYSICS_TIMESTEP
      }

      this.updateRaceLogic()
      this.updateHUD()
      this.updateParticles()
      this.updateAudio()
    }

    this.updateCamera()
    this.render()
  }

  private handlePauseInput(): void {
    const inputState = this.input.getState()
    const currentState = this.state.getCurrent()

    if (inputState.pause && !this.pausePressed) {
      this.pausePressed = true

      if (currentState === 'RACING') {
        if (this.paused) {
          this.paused = false
          this.ui.hidePause()
          this.audio.resume()
        } else {
          this.paused = true
          this.ui.showPause()
          this.audio.suspend()
        }
      } else if (currentState === 'PAUSED') {
        this.paused = false
        this.ui.hidePause()
        this.audio.resume()
        this.state.transition('RACING')
      }
    } else if (!inputState.pause) {
      this.pausePressed = false
    }
  }

  private updateCountdown(dt: number): void {
    this.countdownTimer += dt

    const stepDuration = 1.0
    const currentStep = Math.floor(this.countdownTimer / stepDuration)

    if (currentStep > this.countdownStep) {
      this.countdownStep = currentStep

      if (this.countdownStep < 3) {
        this.ui.updateCountdown(3 - this.countdownStep)
        this.audio.playCountdownTick()
      } else if (this.countdownStep === 4) {
        this.ui.updateCountdown('GO!')
        this.audio.playCountdownGo()
      }
    }

    if (this.countdownTimer >= 5.0) {
      this.raceData.startTime = performance.now() / 1000
      this.raceData.currentLapStart = this.raceData.startTime
      this.state.transition('RACING')
      this.ui.showHUD()
    }
  }

  private updatePhysics(dt: number): void {
    const inputState = this.input.getState()
    this.car.update(dt, inputState)

    this.aiControllers.forEach(ai => {
      const aiInput = ai.update(dt)
      aiInput.pause = false
      aiInput.confirm = false
      aiInput.back = false
      ai.getCar().update(dt, aiInput)
    })

    this.physics.step(dt)
  }

  private updateRaceLogic(): void {
    if (this.raceData.finished) return

    const now = performance.now() / 1000
    this.raceData.totalTime = now - this.raceData.startTime

    const carPos = this.car.getPosition()
    const carVel = this.car.getVelocity()

    const result = this.track.checkCheckpoints(carPos)
    if (result.lapComplete) {
      const lapTime = now - this.raceData.currentLapStart
      this.raceData.lapTimes.push(lapTime)

      if (this.raceData.bestLapTime === 0 || lapTime < this.raceData.bestLapTime) {
        this.raceData.bestLapTime = lapTime
      }

      this.raceData.currentLapStart = now

      if (this.track.getCurrentLap() >= this.track.getLapCount()) {
        this.finishRace()
        return
      }
    }

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.car.getQuaternion())
    const forwardSpeed = carVel.x * forward.x + carVel.z * forward.z
    this.raceData.wrongWay = forwardSpeed >= 0 && this.track.checkWrongWay(carPos, carVel)

    this.calculatePosition()
  }

  private calculatePosition(): void {
    let position = 1
    const playerT = this.getClosestTrackT(this.car.getPosition())
    const playerLap = this.track.getCurrentLap()

    this.aiControllers.forEach(ai => {
      const aiLap = ai.getLap()
      const aiT = ai.getCurrentT()

      if (aiLap > playerLap || (aiLap === playerLap && aiT > playerT)) {
        position++
      }
    })

    this.raceData.position = position
  }

  private getClosestTrackT(position: THREE.Vector3): number {
    const spline = this.track.getSpline()
    let closestT = 0
    let closestDist = Infinity

    for (let i = 0; i < 50; i++) {
      const t = i / 50
      const point = spline.getPoint(t)
      const dist = position.distanceTo(point)
      if (dist < closestDist) {
        closestDist = dist
        closestT = t
      }
    }

    return closestT
  }

  private finishRace(): void {
    this.raceData.finished = true

    const results: RaceResults = {
      position: this.raceData.position,
      totalTime: this.raceData.totalTime,
      bestLapTime: this.raceData.bestLapTime,
      lapTimes: this.raceData.lapTimes
    }

    this.state.setRaceResults(results)
    this.audio.playRaceComplete()
    this.audio.stopRaceAudio()
    this.state.transition('RESULTS')
    this.ui.showResults()
  }

  private updateHUD(): void {
    this.ui.updateHUD({
      speed: this.car.getSpeed(),
      lap: this.track.getCurrentLap(),
      totalLaps: this.track.getLapCount(),
      time: this.raceData.totalTime,
      bestTime: this.raceData.bestLapTime,
      position: this.raceData.position,
      wrongWay: this.raceData.wrongWay,
      rpm: this.car.getRPM()
    })
  }

  private updateParticles(): void {
    const lateralVelocity = Math.abs(this.car.getLateralVelocity())
    const speed = this.car.getSpeed() / 3.6

    if (lateralVelocity > 2 && speed > 5) {
      const intensity = Math.min(1, lateralVelocity / 10)
      this.particles.emitTireSmoke(this.car.getPosition(), intensity)
    }

    this.particles.update(1 / 60)
  }

  private updateAudio(): void {
    if (!this.car) return

    const rpm = this.car.getRPM()
    const speed = this.car.getSpeed()
    const slipAngle = this.car.getSlipAngle()
    const gripCoeff = this.car.getGripCoefficient()

    this.audio.playEngine(rpm, 0)

    if (slipAngle > 5 && gripCoeff < this.car.getConfig().peakGrip * 0.8) {
      const screechIntensity = Math.min(1, (slipAngle - 5) / 15)
      this.audio.playTireScreech(screechIntensity)
    } else {
      this.audio.playTireScreech(0)
    }

    this.audio.playWindNoise(speed)
  }

  private updateCamera(): void {
    if (!this.car) return

    const carPosition = this.car.getPosition()
    const carVelocity = this.car.getVelocity()
    const carQuaternion = this.car.getQuaternion()
    const speed = this.car.getSpeed()
    const maxSpeed = this.car.getMaxSpeed()

    this.cameraController.update(carPosition, carVelocity, carQuaternion, speed, maxSpeed, 1 / 60)
  }

  private render(): void {
    if (this.bloomPass.enabled) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }

  private onResize(): void {
    const w = window.innerWidth
    const h = window.innerHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.composer.setSize(w, h)
    this.bloomPass.resolution.set(w, h)
    this.applyGraphicsQuality()
  }

  private applySettings(): void {
    const settings = this.state.getSettings()
    this.audio.setMasterVolume(settings.masterVolume)
    this.audio.setEngineVolume(settings.engineVolume)
    this.input?.setSteerSensitivity(settings.steerSensitivity)
    this.applyGraphicsQuality()
  }

  dispose(): void {
    this.running = false
    this.clearRaceEntities()
    this.particles.dispose()
    this.physics.dispose()
    this.audio.dispose()
    this.renderer.dispose()
  }
}
