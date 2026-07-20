import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ScoreCalculator } from './ScoreCalculator'

describe('ScoreCalculator (1.7-UNIT-001)', () => {
  let calculator: ScoreCalculator

  beforeEach(() => {
    vi.clearAllMocks()
    calculator = new ScoreCalculator()
  })

  describe('position to points mapping', () => {
    it('awards 10 points for 1st place', () => {
      expect(calculator.getPoints(1)).toBe(10)
    })

    it('awards 7 points for 2nd place', () => {
      expect(calculator.getPoints(2)).toBe(7)
    })

    it('awards 5 points for 3rd place', () => {
      expect(calculator.getPoints(3)).toBe(5)
    })

    it('awards 2 points for 4th place', () => {
      expect(calculator.getPoints(4)).toBe(2)
    })

    it('awards 0 points for positions below 4th', () => {
      expect(calculator.getPoints(5)).toBe(0)
      expect(calculator.getPoints(10)).toBe(0)
    })
  })

  describe('race results calculation', () => {
    it('calculates correct results for winner', () => {
      const results = calculator.calculateResults({
        position: 1,
        totalTime: 65.5,
        bestLapTime: 20.1,
        wallHits: 2,
        topSpeed: 235,
        lapTimes: [21.0, 22.5, 22.0],
      })

      expect(results.position).toBe(1)
      expect(results.points).toBe(10)
      expect(results.totalTime).toBe(65.5)
      expect(results.bestLapTime).toBe(20.1)
      expect(results.wallHits).toBe(2)
      expect(results.topSpeed).toBe(235)
    })

    it('calculates correct results for 2nd place', () => {
      const results = calculator.calculateResults({
        position: 2,
        totalTime: 67.2,
        bestLapTime: 21.5,
        wallHits: 5,
        topSpeed: 220,
        lapTimes: [22.0, 23.0, 22.2],
      })

      expect(results.points).toBe(7)
    })
  })

  describe('time formatting', () => {
    it('formats time as M:SS.mmm', () => {
      expect(calculator.formatTime(65.5)).toBe('1:05.500')
    })

    it('formats time under 1 minute', () => {
      expect(calculator.formatTime(45.123)).toBe('0:45.123')
    })

    it('formats time with leading zero', () => {
      expect(calculator.formatTime(5.5)).toBe('0:05.500')
    })
  })

  describe('ordinal suffix', () => {
    it('returns "st" for 1st', () => {
      expect(calculator.getOrdinal(1)).toBe('1st')
    })

    it('returns "nd" for 2nd', () => {
      expect(calculator.getOrdinal(2)).toBe('2nd')
    })

    it('returns "rd" for 3rd', () => {
      expect(calculator.getOrdinal(3)).toBe('3rd')
    })

    it('returns "th" for 4th', () => {
      expect(calculator.getOrdinal(4)).toBe('4th')
    })

    it('returns "th" for 11th, 12th, 13th', () => {
      expect(calculator.getOrdinal(11)).toBe('11th')
      expect(calculator.getOrdinal(12)).toBe('12th')
      expect(calculator.getOrdinal(13)).toBe('13th')
    })
  })

  describe('speed conversion', () => {
    it('converts km/h to mph', () => {
      expect(calculator.convertSpeed(100, 'mph')).toBe(62)
    })

    it('keeps km/h when unit is kph', () => {
      expect(calculator.convertSpeed(100, 'kph')).toBe(100)
    })

    it('returns correct speed unit label', () => {
      expect(calculator.speedUnitLabel('mph')).toBe('MPH')
      expect(calculator.speedUnitLabel('kph')).toBe('KPH')
    })
  })
})
