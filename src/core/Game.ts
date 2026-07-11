import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { InputManager } from '../input/InputManager'
import { PhysicsWorld } from '../physics/PhysicsWorld'
import { CarController } from '../physics/CarController'
import { CameraController } from '../rendering/CameraController'
import { ParticleSystem } from '../rendering/ParticleSystem'
import { WeatherParticleSystem } from '../rendering/WeatherParticleSystem'
import { Track } from '../track/Track'
import { TRACKS, getTrackById, getTrackTimeOfDay, getTrackWeather } from '../track/TrackDefinitions'
import { EnvironmentManager } from '../environment/EnvironmentManager'
import { combineModifiers } from '../environment/EnvironmentModifiers'
import { TimeOfDayPresets } from '../environment/TimeOfDayPresets'
import { WeatherPresets } from '../environment/WeatherPresets'
import { StateMachine, RaceResults } from './StateMachine'
import { UIManager } from '../ui/UIManager'
import { AudioManager } from '../audio/AudioManager'
import { AIController } from '../ai/AIController'
import { CARS, getCarById } from '../cars/CarConfigs'
import { MiniMap } from '../rendering/MiniMap'
import { addLeaderboardEntry } from '../ui/LeaderboardManager'

interface RaceData {
  startTime: number
  lapTimes: number[]
  currentLapStart: number
  totalTime: number
  bestLapTime: number
  position: number
  finished: boolean
  wrongWay: boolean
  wallHits: number
  topSpeed: number
  lastSpeed: number
  wallHitCooldown: number
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
  private weatherParticles!: WeatherParticleSystem
  private environment!: EnvironmentManager
  private selectedTrackId: string = TRACKS[0].id

  private streetLightRefs: THREE.Object3D[] = []
  private raceActive = false

  private raceData: RaceData = {
    startTime: 0,
    lapTimes: [],
    currentLapStart: 0,
    totalTime: 0,
    bestLapTime: 0,
    position: 1,
    finished: false,
    wrongWay: false,
    wallHits: 0,
    topSpeed: 0,
    lastSpeed: 0,
    wallHitCooldown: 0
  }

  private countdownTimer = 0
  private countdownStep = -1

  private readonly PHYSICS_TIMESTEP = 1 / 120
  private accumulator = 0
  private lastTime = 0
  private lastFrameDt = 1 / 60

  private pausePressed = false
  private cameraSwitchPressed = false
  private transitionCooldown = 0

  private isDemo = false
  private lastActivityTime = 0
  private static readonly DEMO_IDLE_TIMEOUT = 180
  private miniMap: MiniMap | null = null

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

      log('Setting up input...')
      this.input = new InputManager()

      log('Initializing physics (Rapier WASM)...')
      this.physics = new PhysicsWorld()
      await this.physics.init()
      log('Physics initialized OK')

      log('Creating track...')
      this.selectedTrackId = this.state.getSelectedTrack()
      const trackDef = getTrackById(this.selectedTrackId)
      this.track = new Track(trackDef)
      this.track.build(this.scene, this.physics.getWorld())
      log('Track built OK')

      log('Setting up environment...')
      this.environment = new EnvironmentManager(this.scene)
      this.applyEnvironment()
      log('Environment OK')

      log('Setting up lighting...')
      this.addStreetLights()

      log('Adding track decorations...')
      this.addTrackDecorations()

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

      log('Setting up weather particles...')
      this.weatherParticles = new WeatherParticleSystem(this.scene)

      log('Setting up UI...')
      this.ui.init({
        onCarSelected: (id) => this.state.setSelectedCar(id),
        onTrackSelected: (id) => this.setTrack(id),
        onRaceStart: () => this.startRace(),
        onRestart: () => this.restartRace(),
        onResume: () => this.resumeRace(),
        onBackToMenu: () => this.returnToMenu(),
        onSettingsChanged: () => this.applySettings(),
        onRebindAction: (action, cb) => this.input.startListening(action, cb),
        onResetBindings: () => this.input.resetBindings(),
        getBindings: () => this.input.getBindings()
      })
      log('UI initialized OK')

      log('Starting game loop...')
      this.setupAutoPause()
      this.setupActivityListeners()
      this.lastActivityTime = performance.now() / 1000
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
    this.scene.fog = new THREE.Fog(0x0a0a15, 40, 160)
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

  private setupAutoPause(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.raceActive && !this.paused) {
        this.paused = true
        this.ui.showPause()
        this.audio.suspend()
      }
    })
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

  private cleanupStreetLights(): void {
    for (const obj of this.streetLightRefs) {
      this.scene.remove(obj)
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose())
          } else {
            child.material.dispose()
          }
        } else if (child instanceof THREE.PointLight) {
          child.dispose()
        }
      })
    }
    this.streetLightRefs = []
  }

  private addStreetLights(): void {
    const spline = this.track.getSpline()
    const def = this.track.getDefinition()
    const count = def.streetLightDensity

    const sharedPoleGeom = new THREE.CylinderGeometry(0.1, 0.12, 7, 6)
    const sharedPoleMat = new THREE.MeshStandardMaterial({ color: 0x555555 })
    const sharedBulbGeom = new THREE.SphereGeometry(0.25, 8, 8)
    const sharedBulbMat = new THREE.MeshStandardMaterial({
      color: 0xffcc88,
      emissive: 0xffcc88,
      emissiveIntensity: 3
    })

    for (let i = 0; i < count; i++) {
      const t = i / count
      const point = spline.getPoint(t)
      const right = spline.getRightVector(t)

      const group = new THREE.Group()

      const light = new THREE.PointLight(0xffcc88, 3.0, 40)
      light.position.set(right.x * 8, 7, right.z * 8)
      light.castShadow = false
      group.add(light)

      const pole = new THREE.Mesh(sharedPoleGeom, sharedPoleMat)
      pole.position.set(right.x * 8, 3.5, right.z * 8)
      group.add(pole)

      const bulb = new THREE.Mesh(sharedBulbGeom, sharedBulbMat)
      bulb.position.set(right.x * 8, 7.2, right.z * 8)
      group.add(bulb)

      group.position.set(point.x, 0, point.z)
      this.scene.add(group)
      this.streetLightRefs.push(group)
    }
  }

  private addTrackDecorations(): void {
    const def = this.track.getDefinition()
    const center = this.track.getCenter()
    const radius = this.track.getRadius()
    this.environment.addDecorations(def.terrain, center, radius)
  }

  private applyEnvironment(): void {
    const def = getTrackById(this.selectedTrackId)
    if (!def) return
    const timeOfDay = getTrackTimeOfDay(def, this.state.getSettings().todOverride)
    const weatherOverride = this.state.getSettings().weatherOverride
    const weather = getTrackWeather(def, weatherOverride)
    this.environment.applyTimeOfDay(timeOfDay)
    this.environment.applyWeather(weather)
    const mods = combineModifiers(
      weather.gripMultiplier,
      weather.dragMultiplier,
      weather.brakingMultiplier,
      weather.steerMultiplier
    )
    this.car?.setEnvironmentModifiers(mods)
    this.aiCars.forEach(car => car.setEnvironmentModifiers(mods))
    this.weatherParticles?.setIntensity(weather.rainIntensity)
  }

  setTrack(trackId: string): void {
    if (this.raceActive) return
    this.selectedTrackId = trackId
  }

  private startRace(): void {
    if (this.transitionCooldown > 0) return
    this.transitionCooldown = 0.3

    this.clearRaceEntities()

    const trackDef = getTrackById(this.selectedTrackId)
    if (trackDef && trackDef.id !== this.track.getDefinition().id) {
      this.cleanupStreetLights()
      this.track.cleanup(this.scene, this.physics.getWorld())
      this.environment.clearDecorations()
      this.track = new Track(trackDef)
      this.track.build(this.scene, this.physics.getWorld())
      this.addStreetLights()
      this.addTrackDecorations()
      this.applyEnvironment()
    } else {
      this.applyEnvironment()
    }

    const carId = this.state.getSelectedCar()
    this.car = this.physics.createCarWithFactory(carId, this.scene)
    const startPos = this.track.getStartPosition(0)
    const startRot = this.track.getStartRotation()
    this.car.setPosition(new THREE.Vector3(startPos.x, 0.5, startPos.z))
    this.car.setLookAt(startRot)
    this.car.resetPhysics()
    const resolvedDef = trackDef || TRACKS[0]
    const weather = getTrackWeather(resolvedDef, this.state.getSettings().weatherOverride)
    const mods = combineModifiers(
      weather.gripMultiplier,
      weather.dragMultiplier,
      weather.brakingMultiplier,
      weather.steerMultiplier
    )
    this.car.setEnvironmentModifiers(mods)
    this.cameraController.reset()
    const defaultCamera = this.state.getSettings().cameraDefault
    this.cameraController.setView(defaultCamera)
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
      aiCar.setEnvironmentModifiers(mods)
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
      wrongWay: false,
      wallHits: 0,
      topSpeed: 0,
      lastSpeed: 0,
      wallHitCooldown: 0
    }

    this.countdownStep = -1
    this.countdownTimer = 0
    this.raceActive = true

    if (this.miniMap) {
      this.miniMap.dispose()
    }
    this.miniMap = new MiniMap()
    this.miniMap.setTrack(this.track.getSpline())

    try {
      this.audio.stopRaceAudio()
      this.audio.startRaceAudio(getCarById(carId).engine)
    } catch (err) {
      logError('Audio init failed (non-fatal):', err)
    }
    this.state.transition('COUNTDOWN')
  }

  private restartRace(): void {
    if (this.transitionCooldown > 0) return

    this.clearRaceEntities()
    this.ui.hideAll()
    this.paused = false
    this.startRace()
  }

  private resumeRace(): void {
    this.paused = false
    this.ui.hidePause()
    this.audio.resume()
  }

  private returnToMenu(): void {
    if (this.transitionCooldown > 0) return
    this.transitionCooldown = 0.3

    this.clearRaceEntities()
    this.audio.stopRaceAudio()
    this.ui.hideAll()
    this.state.transition('MENU')
    this.paused = false
    this.raceActive = false
    this.isDemo = false
  }

  private clearRaceEntities(): void {
    if (this.miniMap) {
      this.miniMap.dispose()
      this.miniMap = null
    }
    if (this.car) {
      this.scene.remove(this.car.getMesh())
      this.car.disposeMesh()
      try { this.physics.getWorld().removeRigidBody(this.car.getBody()) } catch { /* already removed */ }
      this.car = undefined as unknown as CarController
    }
    this.aiCars.forEach(car => {
      this.scene.remove(car.getMesh())
      car.disposeMesh()
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
    this.lastFrameDt = deltaTime

    if (this.transitionCooldown > 0) {
      this.transitionCooldown = Math.max(0, this.transitionCooldown - deltaTime)
    }

    this.handlePauseInput()
    this.handleCameraSwitch()

    const currentState = this.state.getCurrent()

    if (currentState === 'DEMO') {
      this.accumulator += deltaTime

      while (this.accumulator >= this.PHYSICS_TIMESTEP) {
        this.updateDemoPhysics(this.PHYSICS_TIMESTEP)
        this.accumulator -= this.PHYSICS_TIMESTEP
      }

      this.updateParticles()
      this.updateWeatherParticles()
      this.updateDemoAudio()
      this.checkDemoExit()
    } else if (currentState === 'COUNTDOWN') {
      this.updateCountdown(deltaTime)
    } else if (currentState === 'RACING' && !this.paused) {
      this.accumulator += deltaTime

      while (this.accumulator >= this.PHYSICS_TIMESTEP) {
        this.updatePhysics(this.PHYSICS_TIMESTEP)
        this.accumulator -= this.PHYSICS_TIMESTEP
      }

      this.updateRaceLogic()
      this.updateHUD()
      this.updateMiniMap()
      this.updateParticles()
      this.updateWeatherParticles()
      this.updateAudio()
    }

    this.updateCamera()
    this.render()

    if (currentState === 'MENU' && !this.isDemo && this.state.getSettings().demoEnabled) {
      const now = performance.now() / 1000
      if (now - this.lastActivityTime >= Game.DEMO_IDLE_TIMEOUT) {
        this.startDemo()
      }
    }
  }

  private handlePauseInput(): void {
    if (this.isDemo) return

    const inputState = this.input.getState()
    const currentState = this.state.getCurrent()

    if (inputState.pause && !this.pausePressed) {
      this.pausePressed = true

      if (currentState === 'RACING' || currentState === 'COUNTDOWN') {
        if (this.paused) {
          this.paused = false
          this.ui.hidePause()
          this.audio.resume()
        } else {
          this.paused = true
          this.ui.showPause()
          this.audio.suspend()
        }
      }
    } else if (!inputState.pause) {
      this.pausePressed = false
    }
  }

  private handleCameraSwitch(): void {
    if (this.isDemo) return

    const inputState = this.input.getState()
    const currentState = this.state.getCurrent()

    if (inputState.cameraSwitch && !this.cameraSwitchPressed) {
      this.cameraSwitchPressed = true
      if (currentState === 'RACING' || currentState === 'COUNTDOWN') {
        this.cameraController.cycleView()
      }
    } else if (!inputState.cameraSwitch) {
      this.cameraSwitchPressed = false
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
    if (!this.isDemo) {
      const roadH = this.track.getRoadHeight(this.car.getPosition())
      this.car.setRoadHeight(roadH)
      this.car.update(dt, inputState)
    }

    this.aiControllers.forEach(ai => {
      const aiInput = ai.update(dt)
      aiInput.pause = false
      aiInput.confirm = false
      aiInput.back = false
      const aiRoadH = this.track.getRoadHeight(ai.getCar().getPosition())
      ai.getCar().setRoadHeight(aiRoadH)
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
    const currentSpeed = this.car.getSpeed()

    if (currentSpeed > this.raceData.topSpeed) {
      this.raceData.topSpeed = currentSpeed
    }

    const speedDelta = this.raceData.lastSpeed - currentSpeed
    if (this.raceData.wallHitCooldown <= 0 && this.raceData.lastSpeed > 5 && speedDelta > 20) {
      this.raceData.wallHits++
      this.raceData.wallHitCooldown = 0.5
      this.audio.playCollision()
    }
    this.raceData.wallHitCooldown = Math.max(0, this.raceData.wallHitCooldown - 1 / 60)
    this.raceData.lastSpeed = currentSpeed

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
      const dx = position.x - point.x
      const dz = position.z - point.z
      const dist = dx * dx + dz * dz
      if (dist < closestDist) {
        closestDist = dist
        closestT = t
      }
    }

    return closestT
  }

  private finishRace(): void {
    this.raceData.finished = true
    this.raceActive = false
    this.calculatePosition()

    if (this.miniMap) {
      this.miniMap.dispose()
      this.miniMap = null
    }

    const POINTS_TABLE = [10, 7, 5, 2]
    const points = POINTS_TABLE[this.raceData.position - 1] || 0
    const carId = this.state.getSelectedCar()
    const trackId = this.state.getSelectedTrack()

    const results: RaceResults = {
      position: this.raceData.position,
      points,
      totalTime: this.raceData.totalTime,
      bestLapTime: this.raceData.bestLapTime,
      lapTimes: this.raceData.lapTimes,
      wallHits: this.raceData.wallHits,
      topSpeed: this.raceData.topSpeed,
      carId,
      trackId
    }

    this.state.setRaceResults(results)

    addLeaderboardEntry({
      carId,
      trackId,
      totalTime: this.raceData.totalTime,
      bestLapTime: this.raceData.bestLapTime,
      wallHits: this.raceData.wallHits,
      topSpeed: this.raceData.topSpeed,
      date: new Date().toISOString()
    })

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

  private updateMiniMap(): void {
    if (!this.miniMap || !this.car) return
    const aiPositions = this.aiCars.map(c => c.getPosition())
    this.miniMap.update(this.car.getPosition(), aiPositions)
  }

  private updateParticles(): void {
    const lateralVelocity = Math.abs(this.car.getLateralVelocity())
    const speed = this.car.getSpeed() / 3.6

    if (lateralVelocity > 2 && speed > 5) {
      const intensity = Math.min(1, lateralVelocity / 10)
      this.particles.emitTireSmoke(this.car.getPosition(), intensity)
    }

    this.particles.update(this.lastFrameDt)
  }

  private updateWeatherParticles(): void {
    if (this.weatherParticles && this.car) {
      this.weatherParticles.update(this.lastFrameDt, this.car.getPosition())
    }
  }

  private updateAudio(): void {
    if (!this.car) return

    const rpm = this.car.getRPM()
    const speed = this.car.getSpeed()
    const slipAngle = this.car.getSlipAngle()
    const gripCoeff = this.car.getGripCoefficient()
    const boostLevel = this.car.getBoostLevel()

    this.audio.playEngine(rpm, 0, boostLevel)

    if (slipAngle > 5 && gripCoeff < this.car.getConfig().peakGrip * 0.8) {
      const screechIntensity = Math.min(1, (slipAngle - 5) / 15)
      this.audio.playTireScreech(screechIntensity)
    } else {
      this.audio.playTireScreech(0)
    }

    this.audio.playWindNoise(speed)
  }

  private updateCamera(): void {
    if (this.isDemo) {
      if (this.aiCars.length > 0) {
        const aiCar = this.aiCars[0]
        this.cameraController.update(
          aiCar.getPosition(), aiCar.getVelocity(), aiCar.getQuaternion(),
          aiCar.getSpeed(), aiCar.getMaxSpeed(), this.lastFrameDt
        )
      }
      return
    }
    if (!this.car) return

    const carPosition = this.car.getPosition()
    const carVelocity = this.car.getVelocity()
    const carQuaternion = this.car.getQuaternion()
    const speed = this.car.getSpeed()
    const maxSpeed = this.car.getMaxSpeed()

    this.cameraController.update(carPosition, carVelocity, carQuaternion, speed, maxSpeed, this.lastFrameDt)
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
    if (this.scene) {
      this.scene.fog = settings.fogEnabled ? new THREE.Fog(0x0a0a15, 40, 160) : null
    }
  }

  private setupActivityListeners(): void {
    const resetTimer = () => {
      this.lastActivityTime = performance.now() / 1000
    }
    window.addEventListener('keydown', resetTimer)
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('mousedown', resetTimer)
    window.addEventListener('touchstart', resetTimer)
  }

  private startDemo(): void {
    if (this.transitionCooldown > 0) return
    this.transitionCooldown = 0.3
    this.isDemo = true

    this.clearRaceEntities()

    const carIndex = Math.floor(Math.random() * CARS.length)
    const trackIndex = Math.floor(Math.random() * TRACKS.length)
    const weatherKeys: Array<keyof typeof WeatherPresets> = ['clear', 'rain', 'fog', 'storm']
    const todKeys: Array<keyof typeof TimeOfDayPresets> = ['dawn', 'day', 'dusk', 'night']
    const randomWeatherKey = weatherKeys[Math.floor(Math.random() * weatherKeys.length)]
    const randomTodKey = todKeys[Math.floor(Math.random() * todKeys.length)]
    const randomWeather = WeatherPresets[randomWeatherKey]
    const randomTod = TimeOfDayPresets[randomTodKey]

    const carDef = CARS[carIndex]
    const trackDef = TRACKS[trackIndex]

    this.state.setSelectedCar(carDef.id)
    this.state.setSelectedTrack(trackDef.id)

    if (trackDef.id !== this.track.getDefinition().id) {
      this.cleanupStreetLights()
      this.track.cleanup(this.scene, this.physics.getWorld())
      this.environment.clearDecorations()
      this.track = new Track(trackDef)
      this.track.build(this.scene, this.physics.getWorld())
      this.addStreetLights()
      this.addTrackDecorations()
    }

    this.environment.applyTimeOfDay(randomTod)
    this.environment.applyWeather(randomWeather)
    const mods = combineModifiers(
      randomWeather.gripMultiplier,
      randomWeather.dragMultiplier,
      randomWeather.brakingMultiplier,
      randomWeather.steerMultiplier
    )

    const startRot = this.track.getStartRotation()
    const aiPos = this.track.getStartPosition(0)
    const aiCar = this.physics.createCarWithFactory(carDef.id, this.scene)
    aiCar.setPosition(new THREE.Vector3(aiPos.x, 0.5, aiPos.z))
    aiCar.setLookAt(startRot)
    aiCar.resetPhysics()
    aiCar.setEnvironmentModifiers(mods)
    this.aiCars = [aiCar]
    this.aiControllers = [new AIController(aiCar, this.track.getSpline(), 0.3, [aiCar])]

    this.track.reset()

    const behindDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), startRot)
    this.camera.position.set(aiPos.x + behindDir.x * 8, aiPos.y + 3, aiPos.z + behindDir.z * 8)
    this.camera.lookAt(aiPos.x, aiPos.y + 1, aiPos.z)
    this.cameraController.reset()

    this.raceActive = true

    try {
      this.audio.stopRaceAudio()
      this.audio.startRaceAudio(carDef.engine)
    } catch (err) {
      logError('Audio init failed (non-fatal):', err)
    }

    this.state.transition('DEMO')
    this.ui.showDemoHUD(carDef.name, trackDef.name, randomWeather.name, randomTod.name)
  }

  private checkDemoExit(): void {
    const inputState = this.input.getState()
    if (inputState.throttle > 0 || inputState.brake > 0 || Math.abs(inputState.steer) > 0 ||
        inputState.pause || inputState.confirm || inputState.back) {
      this.returnToMenu()
    }
  }

  private updateDemoPhysics(dt: number): void {
    this.aiControllers.forEach(ai => {
      const aiInput = ai.update(dt)
      aiInput.pause = false
      aiInput.confirm = false
      aiInput.back = false
      const aiRoadH = this.track.getRoadHeight(ai.getCar().getPosition())
      ai.getCar().setRoadHeight(aiRoadH)
      ai.getCar().update(dt, aiInput)
    })

    this.physics.step(dt)
  }

  private updateDemoAudio(): void {
    if (this.aiCars.length === 0) return
    const aiCar = this.aiCars[0]

    this.audio.playEngine(aiCar.getRPM(), 0, aiCar.getBoostLevel())

    const slipAngle = aiCar.getSlipAngle()
    const gripCoeff = aiCar.getGripCoefficient()
    if (slipAngle > 5 && gripCoeff < aiCar.getConfig().peakGrip * 0.8) {
      const screechIntensity = Math.min(1, (slipAngle - 5) / 15)
      this.audio.playTireScreech(screechIntensity)
    } else {
      this.audio.playTireScreech(0)
    }

    this.audio.playWindNoise(aiCar.getSpeed())
  }

  dispose(): void {
    this.running = false
    this.clearRaceEntities()
    this.cleanupStreetLights()
    this.particles.dispose()
    this.weatherParticles?.dispose()
    this.environment?.dispose()
    this.physics.dispose()
    this.audio.dispose()
    this.renderer.dispose()
  }
}
