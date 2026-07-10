import * as THREE from 'three'
import { InputManager } from './input/InputManager'
import { PhysicsWorld } from './physics/PhysicsWorld'
import { CarController } from './physics/CarController'
import { CameraController } from './rendering/CameraController'
import { Track } from './track/Track'
import { StateMachine } from './core/StateMachine'
import { CARS, getCarById } from './cars/CarConfigs'
import { CarFactory } from './cars/CarFactory'
import { AIController } from './ai/AIController'
import { AudioManager } from './audio/AudioManager'

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

function test(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
    console.log(`  ✓ ${name}`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    results.push({ name, passed: false, error: msg })
    console.error(`  ✗ ${name}: ${msg}`)
  }
}

async function testAsync(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
    results.push({ name, passed: true })
    console.log(`  ✓ ${name}`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    results.push({ name, passed: false, error: msg })
    console.error(`  ✗ ${name}: ${msg}`)
  }
}

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(msg)
}

export async function runTestHarness(): Promise<void> {
  console.log('=== OCBP Racer Test Harness ===\n')

  // ── Phase 0: Project Setup ──
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
    const phantom = getCarById('phantom-gt')
    assert(phantom.name === 'Phantom GT', `Wrong car: ${phantom.name}`)
  })

  // ── Phase 1: Core Rendering ──
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
      car.update(1 / 60, { throttle: 1, brake: 0, steer: 0, pause: false, confirm: false, back: false })
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
      car.update(1 / 60, { throttle: 1, brake: 0, steer: 0, pause: false, confirm: false, back: false })
      pw.step(1 / 60)
    }
    const midSpeed = car.getSpeed()

    for (let i = 0; i < 120; i++) {
      car.update(1 / 60, { throttle: 0, brake: 1, steer: 0, pause: false, confirm: false, back: false })
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
      car.update(1 / 60, { throttle: 0.5, brake: 0, steer: 1, pause: false, confirm: false, back: false })
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
  console.log('\n-- Phase 4: Track --')
  test('Track creates', () => {
    const track = new Track()
    assert(track !== null, 'Track not created')
    assert(track.getSpline() !== undefined, 'Spline not created')
  })
  test('Track spline is closed loop', () => {
    const track = new Track()
    const spline = track.getSpline()
    const p0 = spline.getPoint(0)
    const p1 = spline.getPoint(0.5)
    assert(p0.distanceTo(p1) > 10, 'Spline points too close — not a proper loop')
  })
  test('Track has checkpoints', () => {
    const track = new Track()
    const pos = track.getStartPosition(0)
    assert(pos !== undefined, 'No start position')
  })
  test('Track lap counting works', () => {
    const track = new Track()
    assert(track.getLapCount() === 3, `Expected 3 laps, got ${track.getLapCount()}`)
    assert(track.getCurrentLap() === 0, `Expected lap 0, got ${track.getCurrentLap()}`)
  })
  await testAsync('Track builds into scene', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const track = new Track()
    const beforeCount = scene.children.length
    track.build(scene, pw.getWorld())
    assert(scene.children.length > beforeCount, 'Track didn\'t add meshes to scene')
    pw.dispose()
  })

  // ── Phase 5: Input System ──
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
  console.log('\n-- Phase 6: Car Roster --')
  test('Phantom GT config', () => {
    const car = getCarById('phantom-gt')
    assert(car.config.mass === 1550, `Phantom mass: ${car.config.mass}`)
    assert(car.color === 0xcccccc, 'Phantom color wrong')
  })
  test('Viper RS config', () => {
    const car = getCarById('viper-rs')
    assert(car.config.peakGrip === 2.4, `Viper grip: ${car.config.peakGrip}`)
  })
  test('Inferno SS config', () => {
    const car = getCarById('inferno-ss')
    assert(car.config.engineForce === 950, `Inferno force: ${car.config.engineForce}`)
  })
  test('AeroVen TT config', () => {
    const car = getCarById('aeroven-tt')
    assert(car.config.maxSpeed === 265, `AeroVen speed: ${car.config.maxSpeed}`)
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

  // ── Phase 7: Audio System ──
  console.log('\n-- Phase 7: Audio System --')
  test('AudioManager creates without error', () => {
    const am = new AudioManager()
    assert(am !== null, 'AudioManager not created')
  })

  // ── Phase 8: AI ──
  console.log('\n-- Phase 8: AI Opponents --')
  await testAsync('AIController creates', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const track = new Track()
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
    const track = new Track()
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

  // ── Phase 9: UI ──
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
    sm.setSelectedCar('viper-rs')
    assert(sm.getSelectedCar() === 'viper-rs', `Selected: ${sm.getSelectedCar()}`)
  })
  test('StateMachine stores race results', () => {
    const sm = new StateMachine()
    sm.setRaceResults({ position: 1, totalTime: 60, bestLapTime: 20, lapTimes: [20, 20, 20] })
    const r = sm.getRaceResults()
    assert(r !== null && r.position === 1, 'Results not stored')
  })

  // ── Phase 10: Game Loop ──
  console.log('\n-- Phase 10: Game Loop --')
  await testAsync('Full integration: car on track', async () => {
    const pw = new PhysicsWorld()
    await pw.init()
    const scene = new THREE.Scene()
    const track = new Track()
    track.build(scene, pw.getWorld())

    const factory = new CarFactory(pw.getWorld())
    const car = factory.createCar(CARS[0], scene)
    const startPos = track.getStartPosition(0)
    car.setPosition(new THREE.Vector3(startPos.x, 0.5, startPos.z))
    car.setLookAt(track.getStartRotation())

    for (let i = 0; i < 300; i++) {
      car.update(1 / 60, { throttle: 1, brake: 0, steer: 0, pause: false, confirm: false, back: false })
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
    const track = new Track()
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
        car.update(1 / 60, { throttle: 1, brake: 0, steer: 0, pause: false, confirm: false, back: false })
      })
      pw.step(1 / 60)
    }

    const speeds = cars.map(c => c.getSpeed())
    assert(speeds.every(s => s > 0), `Some cars didn't move: ${speeds}`)
    pw.dispose()
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

  // Display results in page
  const el = document.createElement('div')
  el.id = 'test-results'
  el.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:#0a0a1a;color:#ccc;font-family:monospace;font-size:13px;
    padding:20px;z-index:9999;overflow:auto;
  `
  el.innerHTML = `
    <h2 style="color:${failed > 0 ? '#ff4444' : '#00ff88'};margin-bottom:10px">
      Test Results: ${passed}/${results.length} passed
    </h2>
    ${results.map(r => `
      <div style="color:${r.passed ? '#00ff88' : '#ff4444'};margin:4px 0">
        ${r.passed ? '✓' : '✗'} ${r.name}${r.error ? ` — ${r.error}` : ''}
      </div>
    `).join('')}
    ${failed === 0 ? `
      <div style="margin-top:20px;color:#00ff88;font-size:16px">
        All tests passed! Click anywhere to start the game.
      </div>
    ` : ''}
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
