import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StateMachine } from './StateMachine'

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

describe('StateMachine', () => {
  let sm: StateMachine

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    sm = new StateMachine()
  })

  describe('initial state', () => {
    it('starts at MENU', () => {
      expect(sm.getCurrent()).toBe('MENU')
    })

    it('previous is MENU initially', () => {
      expect(sm.getPrevious()).toBe('MENU')
    })

    it('has default car', () => {
      expect(sm.getSelectedCar()).toBe('rossini-488')
    })

    it('has default track', () => {
      expect(sm.getSelectedTrack()).toBe('midnight-circuit')
    })
  })

  describe('transition', () => {
    it('transitions to new state', () => {
      sm.transition('CAR_SELECT')
      expect(sm.getCurrent()).toBe('CAR_SELECT')
    })

    it('updates previous state', () => {
      sm.transition('CAR_SELECT')
      expect(sm.getPrevious()).toBe('MENU')
    })

    it('ignores self-transition', () => {
      sm.transition('MENU')
      expect(sm.getCurrent()).toBe('MENU')
      expect(sm.getPrevious()).toBe('MENU')
    })

    it('fires listener on target state', () => {
      const cb = vi.fn()
      sm.on('CAR_SELECT', cb)
      sm.transition('CAR_SELECT')
      expect(cb).toHaveBeenCalledOnce()
    })

    it('does not fire listener on other states', () => {
      const cb = vi.fn()
      sm.on('MENU', cb)
      sm.transition('CAR_SELECT')
      expect(cb).not.toHaveBeenCalled()
    })

    it('fires multiple listeners', () => {
      const cb1 = vi.fn()
      const cb2 = vi.fn()
      sm.on('RACING', cb1)
      sm.on('RACING', cb2)
      sm.transition('RACING')
      expect(cb1).toHaveBeenCalledOnce()
      expect(cb2).toHaveBeenCalledOnce()
    })

    it('chains multiple transitions', () => {
      sm.transition('CAR_SELECT')
      sm.transition('TRACK_SELECT')
      sm.transition('COUNTDOWN')
      sm.transition('RACING')
      expect(sm.getCurrent()).toBe('RACING')
      expect(sm.getPrevious()).toBe('COUNTDOWN')
    })
  })

  describe('race results', () => {
    it('starts with null results', () => {
      expect(sm.getRaceResults()).toBeNull()
    })

    it('stores race results', () => {
      const results = {
        position: 1,
        points: 10,
        totalTime: 65.5,
        bestLapTime: 20.1,
        lapTimes: [21.0, 22.5, 22.0],
        wallHits: 2,
        topSpeed: 235,
        carId: 'rossini-488',
        trackId: 'midnight-circuit'
      }
      sm.setRaceResults(results)
      expect(sm.getRaceResults()).toEqual(results)
    })
  })

  describe('car/track selection', () => {
    it('sets and gets car', () => {
      sm.setSelectedCar('kaiju-gt-r')
      expect(sm.getSelectedCar()).toBe('kaiju-gt-r')
    })

    it('sets and gets track', () => {
      sm.setSelectedTrack('sunset-boulevard')
      expect(sm.getSelectedTrack()).toBe('sunset-boulevard')
    })
  })

  describe('settings', () => {
    it('returns default settings', () => {
      const settings = sm.getSettings()
      expect(settings.masterVolume).toBe(1.0)
      expect(settings.engineVolume).toBe(0.6)
      expect(settings.speedUnit).toBe('mph')
      expect(settings.graphicsQuality).toBe('high')
      expect(settings.releaseChannel).toBe('green')
    })

    it('updates settings partially', () => {
      sm.updateSettings({ speedUnit: 'kph' })
      expect(sm.getSettings().speedUnit).toBe('kph')
      expect(sm.getSettings().masterVolume).toBe(1.0)
    })

    it('persists to localStorage', () => {
      sm.updateSettings({ masterVolume: 0.5 })
      expect(localStorage.setItem).toHaveBeenCalled()
    })
  })
})
