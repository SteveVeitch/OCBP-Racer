import { describe, it, expect } from 'vitest'
import { combineModifiers } from './EnvironmentModifiers'

describe('EnvironmentModifiers', () => {
  it('combineModifiers returns correct object', () => {
    const result = combineModifiers(0.8, 1.2, 0.9, 0.85)
    expect(result).toEqual({
      gripMultiplier: 0.8,
      dragMultiplier: 1.2,
      brakingMultiplier: 0.9,
      steerMultiplier: 0.85
    })
  })

  it('combineModifiers with neutral values', () => {
    const result = combineModifiers(1.0, 1.0, 1.0, 1.0)
    expect(result).toEqual({
      gripMultiplier: 1.0,
      dragMultiplier: 1.0,
      brakingMultiplier: 1.0,
      steerMultiplier: 1.0
    })
  })

  it('combineModifiers with zero values', () => {
    const result = combineModifiers(0, 0, 0, 0)
    expect(result.gripMultiplier).toBe(0)
    expect(result.dragMultiplier).toBe(0)
    expect(result.brakingMultiplier).toBe(0)
    expect(result.steerMultiplier).toBe(0)
  })
})
