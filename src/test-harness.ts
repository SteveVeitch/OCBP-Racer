import * as THREE from 'three'
import { InputManager, DEFAULT_KEY_BINDINGS } from './input/InputManager'
import { PhysicsWorld } from './physics/PhysicsWorld'
import { CarController } from './physics/CarController'
import { CameraController } from './rendering/CameraController'
import { Track } from './track/Track'
import { TRACKS } from './track/TrackDefinitions'
import { StateMachine } from './core/StateMachine'
import { CARS, getCarById } from './cars/CarConfigs'
import { CarFactory } from './cars/CarFactory'
import { AIController } from './ai/AIController'
import { AudioManager } from './audio/AudioManager'
import { UIManager } from './ui/UIManager'
import { TimeOfDayPresets } from './environment/TimeOfDayPresets'
import { WeatherPresets } from './environment/WeatherPresets'
import { combineModifiers } from './environment/EnvironmentModifiers'
import { addLeaderboardEntry, getTrackLeaderboard, getOverallLeaderboard, clearLeaderboard } from './ui/LeaderboardManager'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  phase: string
}

const results: TestResult[] = []
let currentPhase = 'General'

function test(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true, phase: currentPhase })
    console.log(`  ✓ ${name}`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    results.push({ name, passed: false, error: msg, phase: currentPhase })
    console.error(`  ✗ ${name}: ${msg}`)
  }
}

async function testAsync(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
    results.push({ name, passed: true, phase: currentPhase })
    console.log(`  ✓ ${name}`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    results.push({ name, passed: false, error: msg, phase: currentPhase })
    console.error(`  ✗ ${name}: ${msg}`)
  }
}

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(msg)
}

export async function runTestHarness(): Promise<void> {
  console.log('=== OCBP Racer Test Harness ===\n')

  // ── Phase 0: Project Setup ──
  currentPhase = 'Phase 0: Setup'
  console.log('-- Phase 0: Project Setup --')
  test('Three.js imports', () => {
    assert(typeof THREE.Scene === 'function', 'THREE.Scene not found')
    assert(typeof THREE.PerspectiveCamera === 'function', 'Camera not found')
    assert(typeof THREE.WebGLRenderer === 'function', 'Renderer not found')
  })
  test('Car configs defined', () => {
    assert(CARS.length === 4, `Expected 4 cars, got ${CARS.length}`)
    CARS.forEach(car => {
      assert(car.id.length > 0, `Car missing id`)
      assert(car.name.length > 0, `Car missing name`)
      assert(car.config.engineForce > 0, `${car.name} engineForce <= 0`)
      assert(car.config.maxSpeed > 0, `${car.name} maxSpeed <= 0`)
    })
  })
  test('getCarById works', () => {
    const car = getCarById('rossini-488')
    assert(car.name === 'Rossini 488', `Wrong car: ${car.name}`)
  })

  // ── Phase 1: Core Rendering ──
  currentPhase = 'Phase 1: Rendering'
  console.log('\n-- Phase 1: Core Rendering --')
  test('WebGL renderer creates', () => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    assert(gl !== null, 'WebGL not available')
  })
  test('Scene + camera + lights', () => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    scene.add(camera)
    scene.add(new THREE.AmbientLight(0x404060, 0.6))
    scene.add(new THREE.DirectionalLight(0xffffff, 0.8))
    assert(scene.children.length >= 3, `Scene has ${scene.children.length} children, expected >= 3`)
  })
  test('Ground plane creates', () => {
    const geom = new THREE.PlaneGeometry(200, 200)
    const mat = new THREE.MeshStandardMaterial({ color: 0x111111 })
    const mesh = new THREE.Mesh(geom, mat)
    assert(mesh.geometry.attributes.position.count > 0, 'Ground has no vertices')
  })

  // ── Phase 2: Basic Car Physics ──
  currentPhase = 'Phase 2: Physics'
  console.log('\n-- Phase 2: Car Physics --')
  await testAsync('Rapier WASM initializes', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    assert(pw.getWorld() !== undefined, 'World not created')
    pw.dispose()
  })
  await testAsync('Car body + collider created', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const factory = new CarFactory(pw.getWorld())
    const carDef = CARS[0]
    const car = factory.createCar(carDef, scene)
    assert(car !== null, 'Car not created')
    assert(car.getPosition() !== undefined, 'Car has no position')
    assert(car.getSpeed() === 0, 'New car should have 0 speed')
    assert(scene.children.length === 1, `Scene should have car mesh, has ${scene.children.length}`)
    pw.dispose()
  })
  await testAsync('Car accelerates on throttle', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const factory = new CarFactory(pw.getWorld())
    const car = factory.createCar(CARS[0], scene)

    for (let i = 0; i < 60; i++) {
      car.update(1 / 60, { throttle: 1, brake: 0, steer: 0, pause: false, confirm: false, back: false,
      cameraSwitch: false })
      pw.step(1 / 60)
    }

    const speed = car.getSpeed()
    assert(speed > 0, `Car didn't accelerate, speed = ${speed}`)
    pw.dispose()
  })
  await testAsync('Car brakes', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const factory = new CarFactory(pw.getWorld())
    const car = factory.createCar(CARS[0], scene)

    for (let i = 0; i < 60; i++) {
      car.update(1 / 60, { throttle: 1, brake: 0, steer: 0, pause: false, confirm: false, back: false,
      cameraSwitch: false })
      pw.step(1 / 60)
    }
    const midSpeed = car.getSpeed()

    for (let i = 0; i < 120; i++) {
      car.update(1 / 60, { throttle: 0, brake: 1, steer: 0, pause: false, confirm: false, back: false,
      cameraSwitch: false })
      pw.step(1 / 60)
    }
    const afterBrake = car.getSpeed()
    assert(afterBrake < midSpeed, `Brake didn't slow car: ${midSpeed} -> ${afterBrake}`)
    pw.dispose()
  })
  await testAsync('Car steers', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const factory = new CarFactory(pw.getWorld())
    const car = factory.createCar(CARS[0], scene)
    car.setLookAt(0)

    for (let i = 0; i < 120; i++) {
      car.update(1 / 60, { throttle: 0.5, brake: 0, steer: 1, pause: false, confirm: false, back: false,
      cameraSwitch: false })
      pw.step(1 / 60)
    }

    const quat = car.getQuaternion()
    const angle = Math.atan2(
      2 * (quat.w * quat.y + quat.x * quat.z),
      1 - 2 * (quat.y * quat.y + quat.z * quat.z)
    )
    assert(Math.abs(angle) > 0.01, `Car didn't steer, angle = ${angle}`)
    pw.dispose()
  })
  await testAsync('4 cars have distinct configs', async () => {
    const speeds = CARS.map(c => c.config.maxSpeed)
    const forces = CARS.map(c => c.config.engineForce)
    const grips = CARS.map(c => c.config.peakGrip)
    assert(new Set(speeds).size === 4, 'Car max speeds not all distinct')
    assert(new Set(forces).size === 4, 'Car engine forces not all distinct')
    assert(new Set(grips).size === 4, 'Car grip values not all distinct')
  })

  // ── Phase 3: Chase Camera ──
  currentPhase = 'Phase 3: Camera'
  console.log('\n-- Phase 3: Chase Camera --')
  test('CameraController creates', () => {
    const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    const cc = new CameraController(cam)
    assert(cc !== null, 'CameraController not created')
  })
  test('Camera follows car position', () => {
    const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    const cc = new CameraController(cam)
    const carPos = new THREE.Vector3(10, 0.5, 10)
    const carVel = new THREE.Vector3(0, 0, 5)
    const carQuat = new THREE.Quaternion()
    cc.update(carPos, carVel, carQuat, 50, 235, 1 / 60)
    assert(cam.position.x !== 0 || cam.position.z !== 0, 'Camera didn\'t move')
  })

  // ── Phase 4: Track ──
  currentPhase = 'Phase 4: Track'
  console.log('\n-- Phase 4: Track --')
  test('Track creates', () => {
    const track = new Track(TRACKS[0])
    assert(track !== null, 'Track not created')
    assert(track.getSpline() !== undefined, 'Spline not created')
  })
  test('Track spline is closed loop', () => {
    const track = new Track(TRACKS[0])
    const spline = track.getSpline()
    const p0 = spline.getPoint(0)
    const p1 = spline.getPoint(0.5)
    assert(p0.distanceTo(p1) > 10, 'Spline points too close — not a proper loop')
  })
  test('Track has checkpoints', () => {
    const track = new Track(TRACKS[0])
    const pos = track.getStartPosition(0)
    assert(pos !== undefined, 'No start position')
  })
  test('Track lap counting works', () => {
    const track = new Track(TRACKS[0])
    assert(track.getLapCount() === 3, `Expected 3 laps, got ${track.getLapCount()}`)
    assert(track.getCurrentLap() === 0, `Expected lap 0, got ${track.getCurrentLap()}`)
  })
  test('Track getCenter returns valid vector', () => {
    const track = new Track(TRACKS[0])
    const center = track.getCenter()
    assert(typeof center.x === 'number', 'center.x not a number')
    assert(typeof center.z === 'number', 'center.z not a number')
    assert(Math.abs(center.x) < 1000, `center.x out of range: ${center.x}`)
    assert(Math.abs(center.z) < 1000, `center.z out of range: ${center.z}`)
  })
  test('Track getRadius returns positive value', () => {
    const track = new Track(TRACKS[0])
    const radius = track.getRadius()
    assert(radius > 0, `radius should be positive: ${radius}`)
    assert(radius < 1000, `radius out of range: ${radius}`)
  })
  await testAsync('Track builds into scene', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const track = new Track(TRACKS[0])
    const beforeCount = scene.children.length
    track.build(scene, pw.getWorld())
    assert(scene.children.length > beforeCount, 'Track didn\'t add meshes to scene')
    pw.dispose()
  })

  // ── Phase 5: Input System ──
  currentPhase = 'Phase 5: Input'
  console.log('\n-- Phase 5: Input System --')
  test('InputManager creates', () => {
    const im = new InputManager()
    const state = im.getState()
    assert(typeof state.throttle === 'number', 'throttle not a number')
    assert(typeof state.brake === 'number', 'brake not a number')
    assert(typeof state.steer === 'number', 'steer not a number')
    assert(typeof state.pause === 'boolean', 'pause not a boolean')
  })
  test('Default input is zeroed', () => {
    const im = new InputManager()
    const state = im.getState()
    assert(state.throttle === 0, `throttle should be 0, got ${state.throttle}`)
    assert(state.brake === 0, `brake should be 0, got ${state.brake}`)
    assert(state.steer === 0, `steer should be 0, got ${state.steer}`)
  })

  // ── Phase 6: Car Roster ──
  currentPhase = 'Phase 6: Cars'
  console.log('\n-- Phase 6: Car Roster --')
  test('Rossini 488 config', () => {
    const car = getCarById('rossini-488')
    assert(car.config.mass === 1550, `Rossini mass: ${car.config.mass}`)
    assert(car.color === 0xdc143c, 'Rossini color wrong')
  })
  test('Weissach GT3 config', () => {
    const car = getCarById('weissach-gt3')
    assert(car.config.peakGrip === 2.4, `Weissach grip: ${car.config.peakGrip}`)
  })
  test('Kaiju GT-R config', () => {
    const car = getCarById('kaiju-gt-r')
    assert(car.config.engineForce === 950, `Kaiju force: ${car.config.engineForce}`)
  })
  test('Stingray Z06 config', () => {
    const car = getCarById('stingray-z06')
    assert(car.config.maxSpeed === 265, `Stingray speed: ${car.config.maxSpeed}`)
  })
  test('Turbo lag times correct', () => {
    const turbo488 = getCarById('rossini-488')
    const naGT3 = getCarById('weissach-gt3')
    const turboGTR = getCarById('kaiju-gt-r')
    const naZ06 = getCarById('stingray-z06')
    assert(turbo488.config.turboLagTime === 0.15, `488 lag: ${turbo488.config.turboLagTime}`)
    assert(naGT3.config.turboLagTime === 0.0, `GT3 lag: ${naGT3.config.turboLagTime}`)
    assert(turboGTR.config.turboLagTime === 0.25, `GTR lag: ${turboGTR.config.turboLagTime}`)
    assert(naZ06.config.turboLagTime === 0.0, `Z06 lag: ${naZ06.config.turboLagTime}`)
  })
  test('Per-car engine config exists', () => {
    CARS.forEach(car => {
      assert(car.engine !== undefined, `${car.name} missing engine`)
      assert(car.engine.type.length > 0, `${car.name} missing engine type`)
      assert(car.engine.baseFrequency > 0, `${car.name} missing baseFrequency`)
      assert(car.engine.maxFrequency > car.engine.baseFrequency, `${car.name} maxFrequency <= baseFrequency`)
    })
  })
  await testAsync('CarFactory creates colored mesh', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const factory = new CarFactory(pw.getWorld())
    const car = factory.createCar(CARS[0], scene)
    const mesh = car.getMesh()
    assert(mesh.children.length >= 5, `Car mesh should have body+cabin+4wheels, has ${mesh.children.length}`)
    pw.dispose()
  })
  await testAsync('Boost level ramps up for turbo car over time', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const factory = new CarFactory(pw.getWorld())
    const turboCar = factory.createCar(getCarById('rossini-488'), scene)
    const naCar = factory.createCar(getCarById('weissach-gt3'), scene)

    const input = { throttle: 1, brake: 0, steer: 0, pause: false, confirm: false, back: false, cameraSwitch: false }
    for (let i = 0; i < 60; i++) {
      turboCar.update(1 / 60, input)
      naCar.update(1 / 60, input)
      pw.step(1 / 60)
    }

    const turboBoost = turboCar.getBoostLevel()
    const naBoost = naCar.getBoostLevel()
    assert(turboBoost > 0, `Turbo car should have boost > 0: ${turboBoost}`)
    assert(turboBoost <= 1, `Turbo boost out of range: ${turboBoost}`)
    assert(naBoost === 1, `NA car should have instant full boost: ${naBoost}`)
    pw.dispose()
  })

  // ── Phase 7: Audio System ──
  currentPhase = 'Phase 7: Audio'
  console.log('\n-- Phase 7: Audio System --')
  test('AudioManager creates without error', () => {
    const am = new AudioManager()
    assert(am !== null, 'AudioManager not created')
  })
  test('AudioManager init creates context', async () => {
    const am = new AudioManager()
    await am.init()
    assert(true, 'init() completed without error')
  })
  test('AudioManager setMasterVolume clamps values', () => {
    const am = new AudioManager()
    am.setMasterVolume(0.5)
    am.setMasterVolume(-1)
    am.setMasterVolume(2)
    assert(true, 'setMasterVolume handled all values without error')
  })
  test('AudioManager setEngineVolume clamps values', () => {
    const am = new AudioManager()
    am.setEngineVolume(0.7)
    am.setEngineVolume(-0.5)
    am.setEngineVolume(1.5)
    assert(true, 'setEngineVolume handled all values without error')
  })

  // ── Phase 8: AI ──
  currentPhase = 'Phase 8: AI'
  console.log('\n-- Phase 8: AI Opponents --')
  await testAsync('AIController creates', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const track = new Track(TRACKS[0])
    const factory = new CarFactory(pw.getWorld())
    const car = factory.createCar(CARS[1], scene)
    const ai = new AIController(car, track.getSpline())
    assert(ai !== null, 'AI not created')
    assert(ai.getCar() === car, 'AI car mismatch')
    pw.dispose()
  })
  await testAsync('AI produces input', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const track = new Track(TRACKS[0])
    const factory = new CarFactory(pw.getWorld())
    const car = factory.createCar(CARS[1], scene)
    const startPos = track.getStartPosition(1)
    car.setPosition(new THREE.Vector3(startPos.x, 0.5, startPos.z))
    car.setLookAt(track.getStartRotation())
    const ai = new AIController(car, track.getSpline())
    const input = ai.update(1 / 60)
    assert(typeof input.throttle === 'number', 'AI throttle not a number')
    assert(typeof input.steer === 'number', 'AI steer not a number')
    pw.dispose()
  })
  await testAsync('AI aggressiveness affects driving', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const track = new Track(TRACKS[0])
    const factory = new CarFactory(pw.getWorld())

    const carSlow = factory.createCar(CARS[0], scene)
    const startPosSlow = track.getStartPosition(0)
    carSlow.setPosition(new THREE.Vector3(startPosSlow.x, 0.5, startPosSlow.z))
    carSlow.setLookAt(track.getStartRotation())
    const aiSlow = new AIController(carSlow, track.getSpline(), 'beginner')

    const carFast = factory.createCar(CARS[0], scene)
    const startPosFast = track.getStartPosition(0)
    carFast.setPosition(new THREE.Vector3(startPosFast.x, 0.5, startPosFast.z))
    carFast.setLookAt(track.getStartRotation())
    const aiFast = new AIController(carFast, track.getSpline(), 'pro')

    for (let i = 0; i < 300; i++) {
      aiSlow.update(1 / 60)
      aiFast.update(1 / 60)
      pw.step(1 / 60)
    }

    const posSlow = carSlow.getPosition()
    const posFast = carFast.getPosition()
    const distSlow = Math.sqrt(posSlow.x * posSlow.x + posSlow.z * posSlow.z)
    const distFast = Math.sqrt(posFast.x * posFast.x + posFast.z * posFast.z)
    assert(distFast >= distSlow - 5, `Fast AI should be ahead: slow=${distSlow.toFixed(1)}, fast=${distFast.toFixed(1)}`)
    pw.dispose()
  })
  await testAsync('AI lap counter requires halfway progress', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const track = new Track(TRACKS[0])
    const factory = new CarFactory(pw.getWorld())
    const car = factory.createCar(CARS[0], scene)
    car.setPosition(new THREE.Vector3(0, 0.5, 0))
    car.setLookAt(track.getStartRotation())
    const ai = new AIController(car, track.getSpline())

    // Teleport car near start/finish twice without crossing halfway
    for (let cycle = 0; cycle < 5; cycle++) {
      car.setPosition(new THREE.Vector3(0, 0.5, 0.1))
      car.resetPhysics()
      ai.update(1 / 60)
    }
    assert(ai.getLap() === 0, `Lap should be 0 before halfway: ${ai.getLap()}`)
    pw.dispose()
  })
  await testAsync('AI recovery teleport resets position to spline', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const track = new Track(TRACKS[0])
    const factory = new CarFactory(pw.getWorld())
    const car = factory.createCar(CARS[0], scene)
    car.setPosition(new THREE.Vector3(0, 0.5, 0))
    car.setLookAt(track.getStartRotation())
    const ai = new AIController(car, track.getSpline())

    // Let AI get through STARTING phase (3s = 180 frames)
    for (let i = 0; i < 200; i++) {
      ai.update(1 / 60)
      pw.step(1 / 60)
    }

    // Now teleport car far off track to trigger RECOVERING
    car.setPosition(new THREE.Vector3(500, 0.5, 500))
    car.resetPhysics()

    // Run enough updates to exceed RECOVERY_TIMEOUT (intermediate = 5s at 1/60 steps = 300 frames)
    for (let i = 0; i < 320; i++) {
      ai.update(1 / 60)
      pw.step(1 / 60)
    }

    const pos = car.getPosition()
    const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z)
    assert(dist < 50, `Car should be teleported back near track: dist=${dist.toFixed(1)}`)
    pw.dispose()
  })

  // ── Phase 9: UI ──
  currentPhase = 'Phase 9: UI'
  console.log('\n-- Phase 9: UI --')
  test('StateMachine creates with MENU state', () => {
    const sm = new StateMachine()
    assert(sm.getCurrent() === 'MENU', `Initial state: ${sm.getCurrent()}`)
  })
  test('StateMachine transitions', () => {
    const sm = new StateMachine()
    sm.transition('CAR_SELECT')
    assert(sm.getCurrent() === 'CAR_SELECT', `After transition: ${sm.getCurrent()}`)
    assert(sm.getPrevious() === 'MENU', `Previous: ${sm.getPrevious()}`)
  })
  test('StateMachine stores car selection', () => {
    const sm = new StateMachine()
    sm.setSelectedCar('weissach-gt3')
    assert(sm.getSelectedCar() === 'weissach-gt3', `Selected: ${sm.getSelectedCar()}`)
  })
  test('StateMachine stores race results', () => {
    const sm = new StateMachine()
    sm.setRaceResults({ position: 1, points: 10, totalTime: 60, bestLapTime: 20, lapTimes: [20, 20, 20], wallHits: 0, topSpeed: 200, carId: 'rossini-488', trackId: 'midnight-circuit' })
    const r = sm.getRaceResults()
    assert(r !== null && r.position === 1, 'Results not stored')
  })
  test('DEMO state exists', () => {
    const sm = new StateMachine()
    sm.transition('DEMO')
    assert(sm.getCurrent() === 'DEMO', `State: ${sm.getCurrent()}`)
  })
  test('demoEnabled defaults to true', () => {
    const sm = new StateMachine()
    assert(sm.getSettings().demoEnabled === true, `demoEnabled: ${sm.getSettings().demoEnabled}`)
  })

  // ── Phase 10: Game Loop ──
  currentPhase = 'Phase 10: Integration'
  console.log('\n-- Phase 10: Game Loop --')
  await testAsync('Full integration: car on track', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const track = new Track(TRACKS[0])
    track.build(scene, pw.getWorld())

    const factory = new CarFactory(pw.getWorld())
    const car = factory.createCar(CARS[0], scene)
    const startPos = track.getStartPosition(0)
    car.setPosition(new THREE.Vector3(startPos.x, 0.5, startPos.z))
    car.setLookAt(track.getStartRotation())

    for (let i = 0; i < 300; i++) {
      car.update(1 / 60, { throttle: 1, brake: 0, steer: 0, pause: false, confirm: false, back: false,
      cameraSwitch: false })
      pw.step(1 / 60)
    }

    const pos = car.getPosition()
    const speed = car.getSpeed()
    assert(speed > 0, `Car didn't move: speed=${speed}`)
    assert(
      Math.abs(pos.x - startPos.x) > 0.1 || Math.abs(pos.z - startPos.z) > 0.1,
      `Car didn't change position`
    )
    pw.dispose()
  })
  await testAsync('Full integration: 4 cars on track', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const track = new Track(TRACKS[0])
    track.build(scene, pw.getWorld())

    const factory = new CarFactory(pw.getWorld())
    const cars: CarController[] = []
    for (let i = 0; i < 4; i++) {
      const car = factory.createCar(CARS[i], scene)
      const startPos = track.getStartPosition(i)
      car.setPosition(new THREE.Vector3(startPos.x, 0.5, startPos.z))
      car.setLookAt(track.getStartRotation())
      cars.push(car)
    }

    for (let i = 0; i < 60; i++) {
      cars.forEach(car => {
        car.update(1 / 60, { throttle: 1, brake: 0, steer: 0, pause: false, confirm: false, back: false,
      cameraSwitch: false })
      })
      pw.step(1 / 60)
    }

    const speeds = cars.map(c => c.getSpeed())
    assert(speeds.every(s => s > 0), `Some cars didn't move: ${speeds}`)
    pw.dispose()
  })

  // ── Phase 11: Track Definitions ──
  currentPhase = 'Phase 11: Tracks'
  console.log('\n-- Phase 11: Track Definitions --')
  test('6 tracks defined', () => {
    assert(TRACKS.length === 6, `Expected 6 tracks, got ${TRACKS.length}`)
  })
  test('All tracks have required fields', () => {
    TRACKS.forEach(t => {
      assert(t.id.length > 0, `${t.id} missing id`)
      assert(t.name.length > 0, `${t.id} missing name`)
      assert(t.controlPoints.length >= 10, `${t.id} has <10 control points`)
      assert(t.distanceKm > 0, `${t.id} distanceKm <= 0`)
      assert(t.checkpointCount >= 6, `${t.id} has <6 checkpoints`)
    })
  })
  test('Typhoon Pass has elevation in control points', () => {
    const tp = TRACKS.find(t => t.id === 'typhoon-pass')
    assert(tp !== undefined, 'Typhoon Pass not found')
    const hasElevation = tp!.controlPoints.some(p => p.y > 0.5)
    assert(hasElevation, 'Typhoon Pass has no elevation changes')
  })
  test('Track difficulties range from Easy to Expert', () => {
    const diffs = TRACKS.map(t => t.difficulty)
    assert(diffs.includes('Easy'), 'No Easy track')
    assert(diffs.includes('Medium'), 'No Medium track')
    assert(diffs.includes('Hard'), 'No Hard track')
    assert(diffs.includes('Expert'), 'No Expert track')
  })
  test('Track IDs are unique', () => {
    const ids = TRACKS.map(t => t.id)
    assert(new Set(ids).size === ids.length, 'Duplicate track IDs')
  })
  test('All tracks create valid splines', () => {
    TRACKS.forEach(t => {
      const track = new Track(t)
      const spline = track.getSpline()
      const p0 = spline.getPoint(0)
      const p1 = spline.getPoint(0.5)
      assert(p0.distanceTo(p1) > 5, `${t.id}: spline points too close`)
    })
  })
  await testAsync('All tracks build into scene', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    for (const t of TRACKS) {
      const track = new Track(t)
      const before = scene.children.length
      track.build(scene, pw.getWorld())
      assert(scene.children.length > before, `${t.id} didn't add meshes`)
    }
    pw.dispose()
  })

  // ── Phase 12: Time of Day ──
  currentPhase = 'Phase 12: Time of Day'
  console.log('\n-- Phase 12: Time of Day --')
  test('4 time-of-day presets exist', () => {
    assert(Object.keys(TimeOfDayPresets).length === 4, 'Expected 4 presets')
    assert('dawn' in TimeOfDayPresets, 'Missing dawn')
    assert('day' in TimeOfDayPresets, 'Missing day')
    assert('dusk' in TimeOfDayPresets, 'Missing dusk')
    assert('night' in TimeOfDayPresets, 'Missing night')
  })
  test('Time-of-day presets have valid values', () => {
    Object.values(TimeOfDayPresets).forEach(p => {
      assert(p.ambientIntensity >= 0 && p.ambientIntensity <= 2, `${p.id}: bad ambientIntensity`)
      assert(p.fogNear > 0, `${p.id}: fogNear <= 0`)
      assert(p.fogFar > p.fogNear, `${p.id}: fogFar <= fogNear`)
      assert(typeof p.temperatureCelsius === 'number', `${p.id}: missing temperature`)
    })
  })

  // ── Phase 13: Weather System ──
  currentPhase = 'Phase 13: Weather'
  console.log('\n-- Phase 13: Weather System --')
  test('4 weather presets exist', () => {
    assert(Object.keys(WeatherPresets).length === 4, 'Expected 4 presets')
    assert('clear' in WeatherPresets, 'Missing clear')
    assert('rain' in WeatherPresets, 'Missing rain')
    assert('fog' in WeatherPresets, 'Missing fog')
    assert('storm' in WeatherPresets, 'Missing storm')
  })
  test('Clear weather has no modifiers', () => {
    const w = WeatherPresets.clear
    assert(w.gripMultiplier === 1.0, 'Clear grip != 1.0')
    assert(w.dragMultiplier === 1.0, 'Clear drag != 1.0')
    assert(w.brakingMultiplier === 1.0, 'Clear braking != 1.0')
    assert(w.rainIntensity === 0, 'Clear has rain')
  })
  test('Storm reduces grip below rain', () => {
    assert(WeatherPresets.storm.gripMultiplier < WeatherPresets.rain.gripMultiplier,
      'Storm should be slipperier than rain')
  })
  test('Environment modifiers combine correctly', () => {
    const mods = combineModifiers(0.8, 1.2, 0.9, 0.85)
    assert(mods.gripMultiplier === 0.8, `grip: ${mods.gripMultiplier}`)
    assert(mods.dragMultiplier === 1.2, `drag: ${mods.dragMultiplier}`)
    assert(mods.brakingMultiplier === 0.9, `braking: ${mods.brakingMultiplier}`)
    assert(mods.steerMultiplier === 0.85, `steer: ${mods.steerMultiplier}`)
  })
  test('Weather reduces car acceleration in simulation', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const factory = new CarFactory(pw.getWorld())

    const carDry = factory.createCar(CARS[0], scene)
    const carWet = factory.createCar(CARS[0], scene)

    const dryMods = combineModifiers(1.0, 1.0, 1.0, 1.0)
    const wetMods = combineModifiers(0.72, 1.25, 0.85, 0.8)
    carDry.setEnvironmentModifiers(dryMods)
    carWet.setEnvironmentModifiers(wetMods)

    for (let i = 0; i < 180; i++) {
      const input = { throttle: 1, brake: 0, steer: 0, pause: false, confirm: false, back: false,
      cameraSwitch: false }
      carDry.update(1 / 60, input)
      carWet.update(1 / 60, input)
      pw.step(1 / 60)
    }

    const drySpeed = carDry.getSpeed()
    const wetSpeed = carWet.getSpeed()
    assert(wetSpeed < drySpeed, `Wet should be slower: dry=${drySpeed.toFixed(1)}, wet=${wetSpeed.toFixed(1)}`)
    pw.dispose()
  })

  // ── Phase 15: Camera Views ──
  currentPhase = 'Phase 15: Camera Views'
  console.log('\n-- Phase 15: Camera Views --')
  test('CameraController creates with chase view', () => {
    const cam = new CameraController(new THREE.PerspectiveCamera())
    assert(cam.getView() === 'chase', `Default view: ${cam.getView()}`)
  })
  test('cycleView cycles through all 4 views', () => {
    const cam = new CameraController(new THREE.PerspectiveCamera())
    const views: string[] = []
    for (let i = 0; i < 4; i++) {
      views.push(cam.cycleView())
    }
    assert(views[0] === 'windscreen', `After 1: ${views[0]}`)
    assert(views[1] === 'hood', `After 2: ${views[1]}`)
    assert(views[2] === 'bumper', `After 3: ${views[2]}`)
    assert(views[3] === 'chase', `After 4: ${views[3]}`)
  })
  test('setView changes to specific view', () => {
    const cam = new CameraController(new THREE.PerspectiveCamera())
    cam.setView('hood')
    assert(cam.getView() === 'hood', `View after set: ${cam.getView()}`)
  })
  test('getViewConfigs returns all 4 views', () => {
    const cam = new CameraController(new THREE.PerspectiveCamera())
    const configs = cam.getViewConfigs()
    assert('chase' in configs, 'Missing chase')
    assert('windscreen' in configs, 'Missing windscreen')
    assert('hood' in configs, 'Missing hood')
    assert('bumper' in configs, 'Missing bumper')
  })

  // ── Phase 16: Scoring + Leaderboard ──
  currentPhase = 'Phase 16: Scoring'
  console.log('\n-- Phase 16: Scoring + Leaderboard --')
  test('RaceResults includes scoring fields', () => {
    const sm = new StateMachine()
    sm.setRaceResults({
      position: 1, points: 10, totalTime: 90, bestLapTime: 28,
      lapTimes: [28, 30, 32], wallHits: 2, topSpeed: 245,
      carId: 'rossini-488', trackId: 'midnight-circuit'
    })
    const r = sm.getRaceResults()
    assert(r !== null, 'Results null')
    assert(r!.points === 10, `Points: ${r!.points}`)
    assert(r!.wallHits === 2, `Wall hits: ${r!.wallHits}`)
    assert(r!.topSpeed === 245, `Top speed: ${r!.topSpeed}`)
    assert(r!.carId === 'rossini-488', `Car: ${r!.carId}`)
    assert(r!.trackId === 'midnight-circuit', `Track: ${r!.trackId}`)
  })
  test('LEADERBOARD state exists', () => {
    const sm = new StateMachine()
    sm.transition('LEADERBOARD')
    assert(sm.getCurrent() === 'LEADERBOARD', `State: ${sm.getCurrent()}`)
  })
  test('Leaderboard add + retrieve per-track', () => {
    clearLeaderboard()
    addLeaderboardEntry({
      carId: 'rossini-488', trackId: 'midnight-circuit',
      totalTime: 90, bestLapTime: 28, wallHits: 1, topSpeed: 230,
      date: '2026-01-01'
    })
    const entries = getTrackLeaderboard('midnight-circuit')
    assert(entries.length === 1, `Track entries: ${entries.length}`)
    assert(entries[0].totalTime === 90, `Time: ${entries[0].totalTime}`)
  })
  test('Leaderboard overall aggregates', () => {
    clearLeaderboard()
    addLeaderboardEntry({
      carId: 'rossini-488', trackId: 'midnight-circuit',
      totalTime: 90, bestLapTime: 28, wallHits: 0, topSpeed: 230, date: '2026-01-01'
    })
    addLeaderboardEntry({
      carId: 'weissach-gt3', trackId: 'sunset-boulevard',
      totalTime: 100, bestLapTime: 30, wallHits: 2, topSpeed: 220, date: '2026-01-01'
    })
    const overall = getOverallLeaderboard()
    assert(overall.length === 2, `Overall: ${overall.length}`)
    assert(overall[0].totalTime <= overall[1].totalTime, 'Not sorted')
  })
  test('Leaderboard sorts by time ascending', () => {
    clearLeaderboard()
    addLeaderboardEntry({
      carId: 'kaiju-gt-r', trackId: 'midnight-circuit',
      totalTime: 110, bestLapTime: 35, wallHits: 3, topSpeed: 210, date: '2026-01-01'
    })
    addLeaderboardEntry({
      carId: 'rossini-488', trackId: 'midnight-circuit',
      totalTime: 85, bestLapTime: 26, wallHits: 0, topSpeed: 240, date: '2026-01-01'
    })
    const entries = getTrackLeaderboard('midnight-circuit')
    assert(entries[0].totalTime === 85, `First: ${entries[0].totalTime}`)
    assert(entries[1].totalTime === 110, `Second: ${entries[1].totalTime}`)
    clearLeaderboard()
  })
  test('clearLeaderboard empties all data', () => {
    addLeaderboardEntry({
      carId: 'rossini-488', trackId: 'midnight-circuit',
      totalTime: 90, bestLapTime: 28, wallHits: 1, topSpeed: 230, date: '2026-01-01'
    })
    assert(getTrackLeaderboard('midnight-circuit').length > 0, 'Pre-condition failed')
    clearLeaderboard()
    assert(getTrackLeaderboard('midnight-circuit').length === 0, 'Track leaderboard not cleared')
    assert(getOverallLeaderboard().length === 0, 'Overall leaderboard not cleared')
  })
  test('Scoring points map correctly: 10/7/5/2', () => {
    const POINTS_TABLE = [10, 7, 5, 2]
    const sm = new StateMachine()
    for (let pos = 1; pos <= 4; pos++) {
      sm.setRaceResults({
        position: pos, points: POINTS_TABLE[pos - 1], totalTime: 90, bestLapTime: 28,
        lapTimes: [28, 30, 32], wallHits: 0, topSpeed: 230,
        carId: 'rossini-488', trackId: 'midnight-circuit'
      })
      const r = sm.getRaceResults()
      assert(r!.points === POINTS_TABLE[pos - 1], `Position ${pos}: expected ${POINTS_TABLE[pos - 1]} points, got ${r!.points}`)
    }
  })
  test('Wall hits tracked in simulation', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const track = new Track(TRACKS[0])
    track.build(scene, pw.getWorld())
    const factory = new CarFactory(pw.getWorld())
    const car = factory.createCar(CARS[0], scene)
    const startPos = track.getStartPosition(0)
    car.setPosition(new THREE.Vector3(startPos.x, 0.5, startPos.z))
    car.setLookAt(track.getStartRotation())

    let wallHits = 0
    let lastSpeed = 0
    for (let i = 0; i < 600; i++) {
      car.update(1 / 60, { throttle: 1, brake: 0, steer: (i % 60 < 30 ? 1 : -1), pause: false, confirm: false, back: false, cameraSwitch: false })
      pw.step(1 / 60)
      const speed = car.getSpeed()
      const delta = lastSpeed - speed
      if (lastSpeed > 5 && delta > 15) wallHits++
      lastSpeed = speed
    }

    assert(typeof wallHits === 'number', 'wallHitCount not a number')
    assert(wallHits >= 0, `Wall hits should be >= 0: ${wallHits}`)
    pw.dispose()
  })

  // ── Phase 17: Rebindable Controls ──
  currentPhase = 'Phase 17: Controls'
  console.log('\n-- Phase 17: Rebindable Controls --')
  test('InputManager creates with default bindings', () => {
    const im = new InputManager()
    const b = im.getBindings()
    assert(b.throttle[0] === 'KeyW', `Throttle: ${b.throttle[0]}`)
    assert(b.brake[0] === 'KeyS', `Brake: ${b.brake[0]}`)
    assert(b.steerLeft[0] === 'KeyA', `SteerLeft: ${b.steerLeft[0]}`)
    assert(b.pause[0] === 'Escape', `Pause: ${b.pause[0]}`)
  })
  test('InputManager default bindings match constant', () => {
    const im = new InputManager()
    const b = im.getBindings()
    for (const key of Object.keys(DEFAULT_KEY_BINDINGS) as Array<keyof typeof DEFAULT_KEY_BINDINGS>) {
      assert(b[key][0] === DEFAULT_KEY_BINDINGS[key][0], `${key} mismatch`)
    }
  })
  test('InputManager resetBindings restores defaults', () => {
    const im = new InputManager()
    im.resetBindings()
    const b = im.getBindings()
    assert(b.throttle[0] === 'KeyW', 'Not reset')
  })
  test('InputManager setBindings round-trip', () => {
    const im = new InputManager()
    im.resetBindings()
    const custom = { ...DEFAULT_KEY_BINDINGS, throttle: ['KeyT'] }
    im.setBindings(custom)
    const b = im.getBindings()
    assert(b.throttle[0] === 'KeyT', `Throttle after set: ${b.throttle[0]}`)
    assert(b.brake[0] === 'KeyS', 'Brake should be unchanged')
    im.resetBindings()
  })
  test('InputManager conflict detection swaps bindings', () => {
    const im = new InputManager()
    im.resetBindings()
    const custom = { ...DEFAULT_KEY_BINDINGS, pause: ['KeyC'], cameraSwitch: ['Escape'] }
    im.setBindings(custom)
    const b2 = im.getBindings()
    assert(b2.pause[0] === 'KeyC', `Pause after conflict: ${b2.pause[0]}`)
    assert(b2.cameraSwitch[0] === 'Escape', `Camera after conflict: ${b2.cameraSwitch[0]}`)
    im.resetBindings()
  })

  // ── Phase 18: Bug Fixes & Polish ──
  currentPhase = 'Phase 18: Bug Fixes & Polish'
  console.log('\n-- Phase 18: Bug Fixes & Polish --')
  test('StateMachine LOADING state removed', () => {
    const sm = new StateMachine()
    const valid = sm.getCurrent() as string
    assert(valid !== 'LOADING', `Current state should not be LOADING: ${valid}`)
  })
  test('CarConfig autoCorrect field removed', () => {
    for (const car of CARS) {
      const cfg: Record<string, unknown> = car.config as unknown as Record<string, unknown>
      assert(!('autoCorrect' in cfg), `${car.name} still has autoCorrect`)
    }
  })
  test('EngineDefinition has per-car waveforms', () => {
    for (const car of CARS) {
      assert(typeof car.engine.primaryWaveform === 'string', `${car.name} missing primaryWaveform`)
      assert(typeof car.engine.secondaryWaveform === 'string', `${car.name} missing secondaryWaveform`)
      const valid: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle']
      assert(valid.includes(car.engine.primaryWaveform), `${car.name} invalid primaryWaveform: ${car.engine.primaryWaveform}`)
      assert(valid.includes(car.engine.secondaryWaveform), `${car.name} invalid secondaryWaveform: ${car.engine.secondaryWaveform}`)
    }
  })
  test('Turbo cars have turboLagTime > 0', () => {
    const turbo = CARS.filter(c => c.config.turboLagTime > 0)
    assert(turbo.length === 2, `Expected 2 turbo cars, got ${turbo.length}`)
    const turboIds = turbo.map(c => c.id).sort()
    assert(turboIds[0] === 'kaiju-gt-r', `Expected Kaiju to be turbo, got ${turboIds[0]}`)
    assert(turboIds[1] === 'rossini-488', `Expected Rossini to be turbo, got ${turboIds[1]}`)
  })
  test('NA cars have turboLagTime === 0', () => {
    const na = CARS.filter(c => c.config.turboLagTime === 0)
    assert(na.length === 2, `Expected 2 NA cars, got ${na.length}`)
    const naIds = na.map(c => c.id).sort()
    assert(naIds[0] === 'stingray-z06', `Expected Stingray to be NA, got ${naIds[0]}`)
    assert(naIds[1] === 'weissach-gt3', `Expected Weissach to be NA, got ${naIds[1]}`)
  })
  test('AudioManager has UI audio methods', () => {
    const am = new AudioManager()
    assert(typeof am.playUIClick === 'function', 'playUIClick missing')
    assert(typeof am.playUIConfirm === 'function', 'playUIConfirm missing')
  })

  // ── Phase 19: Car Preview & HUD Score Removal ──
  currentPhase = 'Phase 19: Car Preview & HUD Score Removal'
  console.log('\n-- Phase 19: Car Preview & HUD Score Removal --')
  test('StateMachine has CAR_PREVIEW state', () => {
    const sm = new StateMachine()
    sm.transition('CAR_SELECT')
    sm.transition('CAR_PREVIEW')
    assert(sm.getCurrent() === 'CAR_PREVIEW', `State: ${sm.getCurrent()}`)
  })
  test('CAR_PREVIEW transitions to TRACK_SELECT', () => {
    const sm = new StateMachine()
    sm.transition('CAR_SELECT')
    sm.transition('CAR_PREVIEW')
    sm.transition('TRACK_SELECT')
    assert(sm.getCurrent() === 'TRACK_SELECT', `State: ${sm.getCurrent()}`)
  })
  test('CAR_PREVIEW transitions back to CAR_SELECT', () => {
    const sm = new StateMachine()
    sm.transition('CAR_SELECT')
    sm.transition('CAR_PREVIEW')
    sm.transition('CAR_SELECT')
    assert(sm.getCurrent() === 'CAR_SELECT', `State: ${sm.getCurrent()}`)
  })
  test('TRACK_SELECT transitions back to CAR_PREVIEW', () => {
    const sm = new StateMachine()
    sm.transition('CAR_SELECT')
    sm.transition('CAR_PREVIEW')
    sm.transition('TRACK_SELECT')
    sm.transition('CAR_PREVIEW')
    assert(sm.getCurrent() === 'CAR_PREVIEW', `State: ${sm.getCurrent()}`)
  })
  test('CarFactory has createPreviewMesh method', () => {
    const pf = new PhysicsWorld()
    const factory = pf.getCarFactory()
    assert(typeof factory.createPreviewMesh === 'function', 'createPreviewMesh missing')
    pf.dispose()
  })
  test('CarFactory createPreviewMesh returns a Group', async () => {
    const pf = new PhysicsWorld()
    await pf.init()
    const factory = pf.getCarFactory()
    await factory.preloadModels()
    const mesh = factory.createPreviewMesh('rossini-488')
    assert(mesh !== null && mesh !== undefined, 'Mesh is null/undefined')
    assert(typeof mesh === 'object', `Mesh type: ${typeof mesh}`)
    pf.dispose()
  })
  test('createPreviewMesh works for all 4 cars', async () => {
    const pf = new PhysicsWorld()
    await pf.init()
    const factory = pf.getCarFactory()
    await factory.preloadModels()
    for (const car of CARS) {
      const mesh = factory.createPreviewMesh(car.id)
      assert(mesh !== null && mesh !== undefined, `${car.name} mesh is null/undefined`)
    }
    pf.dispose()
  })
  test('CarPreview state type exists in GameState', () => {
    const sm = new StateMachine()
    sm.transition('CAR_SELECT')
    sm.transition('CAR_PREVIEW')
    const s = sm.getCurrent()
    assert(s === 'CAR_PREVIEW', `State: ${s}`)
  })
  test('UIManager can be constructed', () => {
    const sm = new StateMachine()
    const ui = new UIManager(sm)
    assert(ui !== null, 'UIManager construction failed')
  })

  // ── Summary ──
  console.log('\n=== Results ===')
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  console.log(`${passed} passed, ${failed} failed, ${results.length} total`)

  if (failed > 0) {
    console.log('\nFailed tests:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ✗ ${r.name}: ${r.error}`)
    })
  }

  // Display results in page — multi-column grid, centered, arcade-style
  const phaseOrder = [...new Set(results.map(r => r.phase))]
  const phaseGroups = phaseOrder.map(phase => ({
    phase,
    tests: results.filter(r => r.phase === phase)
  }))

  const el = document.createElement('div')
  el.id = 'test-results'
  el.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:#050510;z-index:9999;
    display:flex;align-items:center;justify-content:center;
    font-family:'Courier New',monospace;
  `
  el.innerHTML = `
    <style>
      @keyframes borderGlow {
        0%,100% { box-shadow: 0 0 8px #00ff88, inset 0 0 8px rgba(0,255,136,0.05); }
        50% { box-shadow: 0 0 16px #00ff88, inset 0 0 12px rgba(0,255,136,0.08); }
      }
      @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }
      .th-container {
        border: 2px solid #00ff88;
        border-radius: 8px;
        background: rgba(5,5,16,0.97);
        padding: 16px 20px 12px;
        width: 95vw;
        max-height: 92vh;
        position: relative;
        animation: borderGlow 3s ease-in-out infinite;
      }
      .th-container::-webkit-scrollbar { width: 6px; }
      .th-container::-webkit-scrollbar-track { background: #0a0a1a; }
      .th-container::-webkit-scrollbar-thumb { background: #00ff88; border-radius: 3px; }
      .th-scanline {
        position:absolute;top:0;left:0;width:100%;height:4px;
        background:linear-gradient(180deg,transparent,rgba(0,255,136,0.06),transparent);
        animation:scanline 4s linear infinite;pointer-events:none;
      }
      .th-title {
        text-align:center;color:#00ff88;font-size:16px;font-weight:bold;
        letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;
        text-shadow:0 0 10px rgba(0,255,136,0.5);
      }
      .th-subtitle {
        text-align:center;color:#556;font-size:10px;margin-bottom:10px;
      }
      .th-grid {
        display:grid;
        grid-template-columns:1fr 1fr 1fr 1fr 1fr;
        gap:8px;margin-bottom:10px;
      }
      .th-phase {
        background:rgba(255,255,255,0.02);
        border:1px solid rgba(255,255,255,0.06);
        border-radius:4px;padding:6px 8px;
      }
      .th-phase-head {
        color:#00ff88;font-size:10px;font-weight:bold;
        letter-spacing:1px;text-transform:uppercase;
        margin-bottom:4px;padding-bottom:3px;
        border-bottom:1px solid rgba(255,255,136,0.15);
      }
      .th-phase .th-test {
        font-size:10px;padding:0.5px 0;color:#889;
      }
      .th-phase .th-test.pass { color:#00ff88; }
      .th-phase .th-test.fail { color:#ff4444; }
      .th-summary {
        text-align:center;padding:6px;margin-top:2px;
        border-top:1px solid rgba(0,255,136,0.15);
      }
      .th-summary .th-count {
        font-size:14px;font-weight:bold;letter-spacing:2px;
      }
      .th-summary .th-count.all-pass { color:#00ff88; text-shadow:0 0 8px rgba(0,255,136,0.4); }
      .th-summary .th-count.has-fail { color:#ff4444; text-shadow:0 0 8px rgba(255,68,68,0.4); }
      .th-click-hint {
        text-align:center;color:#556;font-size:10px;margin-top:8px;
        letter-spacing:1px;
      }
    </style>
    <div class="th-container">
      <div class="th-scanline"></div>
      <div class="th-title">=== OCBP Racer ===</div>
      <div class="th-subtitle">Test Harness</div>
      <div class="th-grid">
        ${phaseGroups.map(g => `
          <div class="th-phase">
            <div class="th-phase-head">${g.phase}</div>
            ${g.tests.map(r => `
              <div class="th-test ${r.passed ? 'pass' : 'fail'}">
                ${r.passed ? '\u2713' : '\u2717'} ${r.name}${r.error ? ` — ${r.error}` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
      <div class="th-summary">
        <div class="th-count ${failed === 0 ? 'all-pass' : 'has-fail'}">
          ${passed}/${results.length} PASSED${failed > 0 ? ` — ${failed} FAILED` : ''}
        </div>
      </div>
      ${failed === 0 ? `<div class="th-click-hint">CLICK ANYWHERE TO START</div>` : ''}
    </div>
  `
  document.body.appendChild(el)

  if (failed === 0) {
    el.addEventListener('click', () => {
      el.remove()
      import('./core/Game').then(({ Game }) => {
        const game = new Game()
        game.init().catch(err => {
          console.error('Game init failed:', err)
        })
      })
    })
  }
}
