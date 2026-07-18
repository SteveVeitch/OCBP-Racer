import { describe, it, expect } from 'vitest'
import { CARS, getCarById, getCarsForReleaseChannel } from './CarConfigs'

describe('CarConfigs', () => {
  describe('CARS constant', () => {
    it('has exactly 4 cars', () => {
      expect(CARS).toHaveLength(4)
    })

    it('has unique ids', () => {
      const ids = CARS.map(c => c.id)
      expect(new Set(ids).size).toBe(4)
    })

    it('all cars have valid config values', () => {
      for (const car of CARS) {
        expect(car.config.mass).toBeGreaterThan(0)
        expect(car.config.engineForce).toBeGreaterThan(0)
        expect(car.config.brakeForce).toBeGreaterThan(0)
        expect(car.config.steerSpeed).toBeGreaterThan(0)
        expect(car.config.maxSteerAngle).toBeGreaterThan(0)
        expect(car.config.maxSpeed).toBeGreaterThan(0)
        expect(car.config.dragCoeff).toBeGreaterThan(0)
        expect(car.config.peakGrip).toBeGreaterThan(0)
        expect(car.config.downforce).toBeGreaterThanOrEqual(0)
        expect(car.config.slipAnglePeak).toBeGreaterThan(0)
        expect(car.config.slipAngleLimit).toBeGreaterThan(car.config.slipAnglePeak)
      }
    })

    it('all cars have engine definitions', () => {
      for (const car of CARS) {
        expect(car.engine.type).toBeTruthy()
        expect(car.engine.displacement).toBeTruthy()
        expect(car.engine.horsepower).toBeGreaterThan(0)
        expect(car.engine.redline).toBeGreaterThan(0)
        expect(car.engine.baseFrequency).toBeGreaterThan(0)
        expect(car.engine.maxFrequency).toBeGreaterThan(car.engine.baseFrequency)
        expect(['sawtooth', 'triangle', 'square', 'sine']).toContain(car.engine.primaryWaveform)
        expect(['sawtooth', 'triangle', 'square', 'sine']).toContain(car.engine.secondaryWaveform)
      }
    })

    it('all cars have release channels', () => {
      for (const car of CARS) {
        expect(['green', 'blue']).toContain(car.releaseChannel)
      }
    })
  })

  describe('getCarById', () => {
    it('returns correct car for valid id', () => {
      const car = getCarById('rossini-488')
      expect(car.name).toBe('Rossini 488')
      expect(car.id).toBe('rossini-488')
    })

    it('throws for unknown id', () => {
      expect(() => getCarById('unknown')).toThrow('Unknown car: unknown')
    })

    it('finds all 4 cars by id', () => {
      for (const car of CARS) {
        expect(getCarById(car.id)).toBe(car)
      }
    })
  })

  describe('getCarsForReleaseChannel', () => {
    it('green channel returns only green cars', () => {
      const greenCars = getCarsForReleaseChannel('green')
      expect(greenCars.length).toBeGreaterThan(0)
      for (const car of greenCars) {
        expect(car.releaseChannel).toBe('green')
      }
    })

    it('blue channel returns all cars', () => {
      const blueCars = getCarsForReleaseChannel('blue')
      expect(blueCars).toHaveLength(4)
    })

    it('green channel is a subset of blue', () => {
      const greenCars = getCarsForReleaseChannel('green')
      const blueCars = getCarsForReleaseChannel('blue')
      for (const car of greenCars) {
        expect(blueCars).toContainEqual(car)
      }
    })
  })
})
