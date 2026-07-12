import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { CarController } from './CarController'
import { CarFactory } from '../cars/CarFactory'
import { CarDefinition, CARS } from '../cars/CarConfigs'

export class PhysicsWorld {
  private world!: RAPIER.World
  private gravity: RAPIER.Vector3
  private carFactory!: CarFactory

  constructor() {
    this.gravity = { x: 0, y: -9.81, z: 0 }
  }

  async init(): Promise<void> {
    await RAPIER.init()
    this.world = new RAPIER.World(this.gravity)
    this.carFactory = new CarFactory(this.world)
    this.createGround()
  }

  private createGround(): void {
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed()
    groundBodyDesc.setTranslation(0, -0.1, 0)
    const groundBody = this.world.createRigidBody(groundBodyDesc)

    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(100, 0.1, 100)
    this.world.createCollider(groundColliderDesc, groundBody)
  }

  createCarWithFactory(carId: string, scene: THREE.Scene): CarController {
    const definition = CARS.find(c => c.id === carId)
    if (!definition) throw new Error(`Unknown car: ${carId}`)
    return this.carFactory.createCar(definition, scene)
  }

  createAICar(definition: CarDefinition, scene: THREE.Scene): CarController {
    return this.carFactory.createCar(definition, scene)
  }

  step(_dt: number): void {
    if (this.world) {
      this.world.step()
    }
  }

  getWorld(): RAPIER.World {
    return this.world
  }

  getCarFactory(): CarFactory {
    return this.carFactory
  }

  dispose(): void {
    if (this.world) {
      this.world.free()
    }
  }
}
