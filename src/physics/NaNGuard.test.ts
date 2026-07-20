import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NaNGuard } from './NaNGuard'

describe('NaNGuard (1.2-UNIT-005)', () => {
  let guard: NaNGuard

  beforeEach(() => {
    vi.clearAllMocks()
    guard = new NaNGuard()
  })

  describe('position validation', () => {
    it('resets position to (0, 0.5, 0) when NaN detected', () => {
      const position = { x: NaN, y: 0.5, z: 10 }

      const result = guard.validatePosition(position)

      expect(result).toEqual({ x: 0, y: 0.5, z: 0 })
    })

    it('keeps valid position unchanged', () => {
      const position = { x: 10, y: 0.5, z: 20 }

      const result = guard.validatePosition(position)

      expect(result).toEqual(position)
    })

    it('resets when any component is NaN', () => {
      expect(guard.validatePosition({ x: 1, y: NaN, z: 1 })).toEqual({ x: 0, y: 0.5, z: 0 })
      expect(guard.validatePosition({ x: 1, y: 1, z: NaN })).toEqual({ x: 0, y: 0.5, z: 0 })
    })
  })

  describe('velocity validation', () => {
    it('zeros velocity when NaN detected', () => {
      const velocity = { x: NaN, y: 0, z: 5 }

      const result = guard.validateVelocity(velocity)

      expect(result).toEqual({ x: 0, y: 0, z: 0 })
    })

    it('keeps valid velocity unchanged', () => {
      const velocity = { x: 10, y: 0, z: 5 }

      const result = guard.validateVelocity(velocity)

      expect(result).toEqual(velocity)
    })
  })

  describe('angular velocity validation', () => {
    it('zeros angular velocity when NaN detected', () => {
      const angular = { x: 0, y: NaN, z: 0 }

      const result = guard.validateAngularVelocity(angular)

      expect(result).toEqual({ x: 0, y: 0, z: 0 })
    })

    it('keeps valid angular velocity unchanged', () => {
      const angular = { x: 0, y: 1.5, z: 0 }

      const result = guard.validateAngularVelocity(angular)

      expect(result).toEqual(angular)
    })
  })

  describe('full car state validation', () => {
    it('resets entire car state when position is NaN', () => {
      const carState = {
        position: { x: NaN, y: 0.5, z: 10 },
        velocity: { x: 50, y: 0, z: 100 },
        angularVelocity: { x: 0, y: 2, z: 0 }
      }

      const result = guard.validateCarState(carState)

      expect(result.position).toEqual({ x: 0, y: 0.5, z: 0 })
      expect(result.velocity).toEqual({ x: 0, y: 0, z: 0 })
      expect(result.angularVelocity).toEqual({ x: 0, y: 0, z: 0 })
    })

    it('keeps valid car state unchanged', () => {
      const carState = {
        position: { x: 10, y: 0.5, z: 20 },
        velocity: { x: 50, y: 0, z: 100 },
        angularVelocity: { x: 0, y: 2, z: 0 }
      }

      const result = guard.validateCarState(carState)

      expect(result).toEqual(carState)
    })
  })

  describe('detection logging', () => {
    it('logs NaN detection events', () => {
      const logSpy = vi.spyOn(guard, 'logDetection')

      guard.validatePosition({ x: NaN, y: 0, z: 0 })

      expect(logSpy).toHaveBeenCalledWith('position', expect.any(Object))
    })

    it('increments detection counter', () => {
      guard.validatePosition({ x: NaN, y: 0, z: 0 })
      guard.validateVelocity({ x: NaN, y: 0, z: 0 })

      expect(guard.getDetectionCount()).toBe(2)
    })
  })
})
