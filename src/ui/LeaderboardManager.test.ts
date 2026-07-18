import { describe, it, expect, beforeEach, vi } from 'vitest'
import { addLeaderboardEntry, getTrackLeaderboard, getOverallLeaderboard, clearLeaderboard } from './LeaderboardManager'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

function makeEntry(overrides: Partial<{ carId: string; trackId: string; totalTime: number; bestLapTime: number; wallHits: number; topSpeed: number; date: string }> = {}) {
  return {
    carId: 'rossini-488',
    trackId: 'midnight-circuit',
    totalTime: 60,
    bestLapTime: 20,
    wallHits: 0,
    topSpeed: 200,
    date: '2026-01-01',
    ...overrides
  }
}

describe('LeaderboardManager', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.mocked(localStorageMock.getItem).mockReset()
    vi.mocked(localStorageMock.setItem).mockReset()
    clearLeaderboard()
  })

  describe('addLeaderboardEntry', () => {
    it('adds entry to track leaderboard', () => {
      addLeaderboardEntry(makeEntry())
      const lb = getTrackLeaderboard('midnight-circuit')
      expect(lb).toHaveLength(1)
      expect(lb[0].carId).toBe('rossini-488')
    })

    it('adds entry to overall leaderboard', () => {
      addLeaderboardEntry(makeEntry())
      const overall = getOverallLeaderboard()
      expect(overall).toHaveLength(1)
    })

    it('sorts by totalTime ascending', () => {
      addLeaderboardEntry(makeEntry({ totalTime: 70 }))
      addLeaderboardEntry(makeEntry({ totalTime: 50 }))
      addLeaderboardEntry(makeEntry({ totalTime: 60 }))
      const lb = getTrackLeaderboard('midnight-circuit')
      expect(lb[0].totalTime).toBe(50)
      expect(lb[1].totalTime).toBe(60)
      expect(lb[2].totalTime).toBe(70)
    })

    it('limits track leaderboard to 10 entries', () => {
      for (let i = 0; i < 15; i++) {
        addLeaderboardEntry(makeEntry({ totalTime: 50 + i }))
      }
      const lb = getTrackLeaderboard('midnight-circuit')
      expect(lb).toHaveLength(10)
      expect(lb[9].totalTime).toBe(59)
    })

    it('limits overall leaderboard to 20 entries', () => {
      for (let i = 0; i < 25; i++) {
        addLeaderboardEntry(makeEntry({ trackId: `track-${i}`, totalTime: 50 + i }))
      }
      const overall = getOverallLeaderboard()
      expect(overall).toHaveLength(20)
    })

    it('separates by trackId', () => {
      addLeaderboardEntry(makeEntry({ trackId: 'track-a', totalTime: 60 }))
      addLeaderboardEntry(makeEntry({ trackId: 'track-b', totalTime: 70 }))
      expect(getTrackLeaderboard('track-a')).toHaveLength(1)
      expect(getTrackLeaderboard('track-b')).toHaveLength(1)
    })
  })

  describe('getTrackLeaderboard', () => {
    it('returns empty array for unknown track', () => {
      expect(getTrackLeaderboard('unknown')).toEqual([])
    })
  })

  describe('getOverallLeaderboard', () => {
    it('returns empty array when no entries', () => {
      expect(getOverallLeaderboard()).toEqual([])
    })
  })

  describe('clearLeaderboard', () => {
    it('clears all data', () => {
      addLeaderboardEntry(makeEntry())
      clearLeaderboard()
      expect(getTrackLeaderboard('midnight-circuit')).toEqual([])
      expect(getOverallLeaderboard()).toEqual([])
    })
  })
})
