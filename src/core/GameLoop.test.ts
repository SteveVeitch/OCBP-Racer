import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GameLoop } from './GameLoop'

describe('GameLoop', () => {
  let gameLoop: GameLoop

  beforeEach(() => {
    vi.clearAllMocks()
    gameLoop = new GameLoop()
  })

  describe('fixed timestep (1.1-UNIT-001)', () => {
    it('runs physics at 120 Hz (8.33ms per step)', () => {
      const PHYSICS_HZ = 120
      const EXPECTED_DT = 1 / PHYSICS_HZ

      expect(gameLoop.getPhysicsDt()).toBeCloseTo(EXPECTED_DT, 3)
    })

    it('accumulates time and steps physics correctly', () => {
      const physicsSpy = vi.spyOn(gameLoop, 'stepPhysics')

      gameLoop.update(0.025) // 25ms frame

      // Should step physics 3 times (25ms / 8.33ms ≈ 3)
      expect(physicsSpy).toHaveBeenCalledTimes(3)
    })

    it('carries remainder time to next frame', () => {
      gameLoop.update(0.020) // 20ms frame = 2 physics steps + 3.34ms remainder

      const remainder = gameLoop.getAccumulator()
      expect(remainder).toBeGreaterThan(0)
      expect(remainder).toBeLessThan(0.00833)
    })
  })

  describe('frame time cap (1.1-UNIT-002)', () => {
    it('caps frame time at 0.1s to prevent spiral of death', () => {
      const physicsSpy = vi.spyOn(gameLoop, 'stepPhysics')

      gameLoop.update(0.5) // 500ms frame (tab hidden scenario)

      // Should cap at 0.1s = 12 physics steps max
      expect(physicsSpy).toHaveBeenCalledTimes(12)
    })

    it('does not cap when frame time is normal', () => {
      const physicsSpy = vi.spyOn(gameLoop, 'stepPhysics')

      gameLoop.update(0.016) // 16ms frame (60fps)

      // Should step 1-2 times, not capped
      expect(physicsSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('render step', () => {
    it('runs render at variable timestep', () => {
      const renderSpy = vi.spyOn(gameLoop, 'render')

      gameLoop.update(0.016)

      expect(renderSpy).toHaveBeenCalledOnce()
    })

    it('passes actual delta time to render', () => {
      const renderSpy = vi.spyOn(gameLoop, 'render')

      gameLoop.update(0.025)

      expect(renderSpy).toHaveBeenCalledWith(0.025)
    })
  })
})
