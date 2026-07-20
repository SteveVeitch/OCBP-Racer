import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CheckpointValidator } from './CheckpointValidator'

describe('CheckpointValidator (1.3-UNIT-001)', () => {
  let validator: CheckpointValidator

  beforeEach(() => {
    vi.clearAllMocks()
    validator = new CheckpointValidator(10) // 10 checkpoints
  })

  describe('sequence validation', () => {
    it('accepts checkpoints in order (0 → 1 → 2)', () => {
      expect(validator.validate(0)).toBe(true)
      expect(validator.validate(1)).toBe(true)
      expect(validator.validate(2)).toBe(true)
    })

    it('rejects out-of-order checkpoint', () => {
      validator.validate(0)
      validator.validate(1)

      expect(validator.validate(3)).toBe(false) // Skipped 2
    })

    it('rejects same checkpoint twice', () => {
      validator.validate(0)
      validator.validate(1)

      expect(validator.validate(1)).toBe(false)
    })

    it('wraps from last checkpoint to 0 (lap complete)', () => {
      // Pass all checkpoints 0-9
      for (let i = 0; i < 10; i++) {
        validator.validate(i)
      }

      // Next checkpoint 0 = lap complete
      expect(validator.validate(0)).toBe(true)
    })
  })

  describe('lap counting', () => {
    it('increments lap when checkpoint 0 passed after last', () => {
      // Complete first lap
      for (let i = 0; i < 10; i++) {
        validator.validate(i)
      }
      validator.validate(0) // Lap 1 complete

      expect(validator.getLapCount()).toBe(1)
    })

    it('counts multiple laps', () => {
      // Complete 3 laps
      for (let lap = 0; lap < 3; lap++) {
        for (let i = 0; i < 10; i++) {
          validator.validate(i)
        }
        validator.validate(0) // Lap complete
      }

      expect(validator.getLapCount()).toBe(3)
    })

    it('does not increment lap on intermediate checkpoints', () => {
      validator.validate(0)
      validator.validate(1)
      validator.validate(2)

      expect(validator.getLapCount()).toBe(0)
    })
  })

  describe('wrong way detection', () => {
    it('detects wrong way when going backward', () => {
      validator.validate(0)
      validator.validate(1)
      validator.validate(2)

      // Going backward to checkpoint 1
      expect(validator.isWrongWay(1)).toBe(true)
    })

    it('does not detect wrong way for forward movement', () => {
      validator.validate(0)
      validator.validate(1)

      expect(validator.isWrongWay(2)).toBe(false)
    })
  })

  describe('reset', () => {
    it('resets all state', () => {
      validator.validate(0)
      validator.validate(1)
      validator.validate(2)

      validator.reset()

      expect(validator.getLapCount()).toBe(0)
      expect(validator.getLastCheckpoint()).toBe(-1)
    })
  })

  describe('track configuration', () => {
    it('validates checkpoint count matches track', () => {
      const v = new CheckpointValidator(8) // Midnight Circuit

      expect(v.getCheckpointCount()).toBe(8)
    })

    it('handles different track checkpoint counts', () => {
      const tracks = [
        { name: 'Midnight Circuit', checkpoints: 8 },
        { name: 'Sunset Boulevard', checkpoints: 10 },
        { name: 'Thunder Ridge', checkpoints: 12 },
        { name: 'Neon District', checkpoints: 12 },
        { name: 'Iron Circuit', checkpoints: 14 },
        { name: 'Typhoon Pass', checkpoints: 12 },
      ]

      tracks.forEach(track => {
        const v = new CheckpointValidator(track.checkpoints)
        expect(v.getCheckpointCount()).toBe(track.checkpoints)
      })
    })
  })
})
