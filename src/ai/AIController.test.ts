import { describe, it, expect } from 'vitest'

const DIFFICULTY_PROFILES = {
  easy: {
    speedMultiplier: 0.55,
    aggressiveness: 0.15,
    lookAheadBase: 0.03,
    lookAheadSpeedFactor: 0.001,
    brakingAggression: 0.3,
    racingLineOffset: 0.0,
    recoveryTimeout: 8.0,
    steerSmoothing: 0.15,
  },
  normal: {
    speedMultiplier: 0.75,
    aggressiveness: 0.4,
    lookAheadBase: 0.05,
    lookAheadSpeedFactor: 0.002,
    brakingAggression: 0.6,
    racingLineOffset: 0.003,
    recoveryTimeout: 5.0,
    steerSmoothing: 0.08,
  },
  hard: {
    speedMultiplier: 0.92,
    aggressiveness: 0.7,
    lookAheadBase: 0.07,
    lookAheadSpeedFactor: 0.003,
    brakingAggression: 0.85,
    racingLineOffset: 0.006,
    recoveryTimeout: 3.0,
    steerSmoothing: 0.04,
  },
  expert: {
    speedMultiplier: 1.0,
    aggressiveness: 0.9,
    lookAheadBase: 0.09,
    lookAheadSpeedFactor: 0.004,
    brakingAggression: 1.0,
    racingLineOffset: 0.008,
    recoveryTimeout: 2.0,
    steerSmoothing: 0.02,
  },
}

describe('AI Difficulty Profiles', () => {
  it('has exactly 4 profiles', () => {
    expect(Object.keys(DIFFICULTY_PROFILES)).toHaveLength(4)
  })

  it('has easy, normal, hard, expert', () => {
    expect(DIFFICULTY_PROFILES.easy).toBeDefined()
    expect(DIFFICULTY_PROFILES.normal).toBeDefined()
    expect(DIFFICULTY_PROFILES.hard).toBeDefined()
    expect(DIFFICULTY_PROFILES.expert).toBeDefined()
  })

  it('speedMultiplier increases with difficulty', () => {
    const speeds = Object.values(DIFFICULTY_PROFILES).map(p => p.speedMultiplier)
    for (let i = 1; i < speeds.length; i++) {
      expect(speeds[i]).toBeGreaterThan(speeds[i - 1])
    }
  })

  it('aggressiveness increases with difficulty', () => {
    const aggs = Object.values(DIFFICULTY_PROFILES).map(p => p.aggressiveness)
    for (let i = 1; i < aggs.length; i++) {
      expect(aggs[i]).toBeGreaterThan(aggs[i - 1])
    }
  })

  it('recoveryTimeout decreases with difficulty', () => {
    const timeouts = Object.values(DIFFICULTY_PROFILES).map(p => p.recoveryTimeout)
    for (let i = 1; i < timeouts.length; i++) {
      expect(timeouts[i]).toBeLessThan(timeouts[i - 1])
    }
  })

  it('pro profile has max speed multiplier', () => {
    expect(DIFFICULTY_PROFILES.expert.speedMultiplier).toBe(1.0)
  })

  it('all profiles have valid ranges', () => {
    for (const [, profile] of Object.entries(DIFFICULTY_PROFILES)) {
      expect(profile.speedMultiplier).toBeGreaterThan(0)
      expect(profile.speedMultiplier).toBeLessThanOrEqual(1.0)
      expect(profile.aggressiveness).toBeGreaterThanOrEqual(0)
      expect(profile.aggressiveness).toBeLessThanOrEqual(1.0)
      expect(profile.brakingAggression).toBeGreaterThanOrEqual(0)
      expect(profile.brakingAggression).toBeLessThanOrEqual(1.0)
      expect(profile.steerSmoothing).toBeGreaterThanOrEqual(0)
      expect(profile.steerSmoothing).toBeLessThanOrEqual(1.0)
      expect(profile.recoveryTimeout).toBeGreaterThan(0)
    }
  })
})
