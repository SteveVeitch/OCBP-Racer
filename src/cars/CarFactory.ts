import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { CarController, CarConfig } from '../physics/CarController'
import { CarDefinition } from './CarConfigs'

export class CarFactory {
  private world: RAPIER.World

  constructor(world: RAPIER.World) {
    this.world = world
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
    const color = definition.color

    const paintMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.25,
      metalness: 0.85
    })
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8,
      metalness: 0.2
    })
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x223344,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.7
    })
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffcc,
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.5
    })
    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff2200,
      emissiveIntensity: 1.0,
      roughness: 0.2,
      metalness: 0.3
    })
    const grilleMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 0.6,
      metalness: 0.4
    })

    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.45, 4.2), paintMat)
    lowerBody.position.y = 0.35
    lowerBody.castShadow = true
    group.add(lowerBody)

    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.15, 1.2), paintMat)
    hood.position.set(0, 0.65, 1.2)
    hood.castShadow = true
    group.add(hood)

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 1.4), glassMat)
    cabin.position.set(0, 0.95, 0.1)
    cabin.castShadow = true
    group.add(cabin)

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.0), paintMat)
    roof.position.set(0, 1.23, 0.0)
    roof.castShadow = true
    group.add(roof)

    const rearDeck = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 1.0), paintMat)
    rearDeck.position.set(0, 0.65, -1.1)
    rearDeck.castShadow = true
    group.add(rearDeck)

    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.3, 0.15), grilleMat)
    frontBumper.position.set(0, 0.25, 2.1)
    group.add(frontBumper)

    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 0.1), darkMat)
    rearBumper.position.set(0, 0.25, -2.1)
    group.add(rearBumper)

    const frontSpoiler = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 0.2), darkMat)
    frontSpoiler.position.set(0, 0.12, 2.1)
    group.add(frontSpoiler)

    const leftHeadlight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.08), headlightMat)
    leftHeadlight.position.set(-0.55, 0.45, 2.12)
    group.add(leftHeadlight)

    const rightHeadlight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.08), headlightMat)
    rightHeadlight.position.set(0.55, 0.45, 2.12)
    group.add(rightHeadlight)

    const leftTaillight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.06), taillightMat)
    leftTaillight.position.set(-0.6, 0.5, -2.12)
    group.add(leftTaillight)

    const rightTaillight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.06), taillightMat)
    rightTaillight.position.set(0.6, 0.5, -2.12)
    group.add(rightTaillight)

    const wheelGeometry = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16)
    const rimGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.24, 8)
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.2,
      metalness: 0.9
    })

    const wheelPositions = [
      { x: -0.95, y: 0.32, z: 1.25 },
      { x: 0.95, y: 0.32, z: 1.25 },
      { x: -0.95, y: 0.32, z: -1.2 },
      { x: 0.95, y: 0.32, z: -1.2 }
    ]

    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group()

      const tire = new THREE.Mesh(wheelGeometry, darkMat)
      tire.rotation.z = Math.PI / 2
      wheelGroup.add(tire)

      const rim = new THREE.Mesh(rimGeometry, rimMat)
      rim.rotation.z = Math.PI / 2
      wheelGroup.add(rim)

      wheelGroup.position.set(pos.x, pos.y, pos.z)
      wheelGroup.castShadow = true
      group.add(wheelGroup)
    })

    const headlightL = new THREE.SpotLight(0xffeedd, 8, 30, 0.4, 0.5, 1.5)
    headlightL.position.set(-0.55, 0.45, 2.15)
    headlightL.target.position.set(-0.55, 0, 15)
    group.add(headlightL)
    group.add(headlightL.target)

    const headlightR = new THREE.SpotLight(0xffeedd, 8, 30, 0.4, 0.5, 1.5)
    headlightR.position.set(0.55, 0.45, 2.15)
    headlightR.target.position.set(0.55, 0, 15)
    group.add(headlightR)
    group.add(headlightR.target)

    const tailLightL = new THREE.PointLight(0xff2200, 1.5, 8)
    tailLightL.position.set(-0.6, 0.5, -2.15)
    group.add(tailLightL)

    const tailLightR = new THREE.PointLight(0xff2200, 1.5, 8)
    tailLightR.position.set(0.6, 0.5, -2.15)
    group.add(tailLightR)

    return group
  }
}
