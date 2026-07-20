interface Vec3 {
  x: number
  y: number
  z: number
}

interface CarState {
  position: Vec3
  velocity: Vec3
  angularVelocity: Vec3
}

export class NaNGuard {
  private detectionCount: number = 0

  private hasNaN(vec: Vec3): boolean {
    return isNaN(vec.x) || isNaN(vec.y) || isNaN(vec.z)
  }

  validatePosition(position: Vec3): Vec3 {
    if (this.hasNaN(position)) {
      this.logDetection('position', position)
      return { x: 0, y: 0.5, z: 0 }
    }
    return position
  }

  validateVelocity(velocity: Vec3): Vec3 {
    if (this.hasNaN(velocity)) {
      this.logDetection('velocity', velocity)
      return { x: 0, y: 0, z: 0 }
    }
    return velocity
  }

  validateAngularVelocity(angular: Vec3): Vec3 {
    if (this.hasNaN(angular)) {
      this.logDetection('angularVelocity', angular)
      return { x: 0, y: 0, z: 0 }
    }
    return angular
  }

  validateCarState(carState: CarState): CarState {
    const position = this.validatePosition(carState.position)
    
    if (this.hasNaN(carState.position)) {
      return {
        position: { x: 0, y: 0.5, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        angularVelocity: { x: 0, y: 0, z: 0 }
      }
    }

    return {
      position,
      velocity: this.validateVelocity(carState.velocity),
      angularVelocity: this.validateAngularVelocity(carState.angularVelocity)
    }
  }

  logDetection(type: string, value: Vec3): void {
    this.detectionCount++
    console.warn(`[NaNGuard] NaN detected in ${type}:`, value)
  }

  getDetectionCount(): number {
    return this.detectionCount
  }
}
