import { describe, it, expect } from 'vitest'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toFixed(2).padStart(5, '0')}`
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

function convertSpeed(kmh: number, unit: 'mph' | 'kph'): number {
  return unit === 'mph' ? Math.round(kmh * 0.621371) : Math.round(kmh)
}

function speedUnitLabel(unit: 'mph' | 'kph'): string {
  return unit.toUpperCase()
}

describe('formatTime', () => {
  it('formats 0 seconds', () => {
    expect(formatTime(0)).toBe('0:00.00')
  })

  it('formats seconds under 10', () => {
    expect(formatTime(5.5)).toBe('0:05.50')
  })

  it('formats exactly 60 seconds', () => {
    expect(formatTime(60)).toBe('1:00.00')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(125.75)).toBe('2:05.75')
  })

  it('pads seconds with leading zero', () => {
    expect(formatTime(61)).toBe('1:01.00')
  })

  it('formats large times', () => {
    expect(formatTime(3661.5)).toBe('61:01.50')
  })
})

describe('getOrdinalSuffix', () => {
  it('returns st for 1', () => {
    expect(getOrdinalSuffix(1)).toBe('st')
  })

  it('returns nd for 2', () => {
    expect(getOrdinalSuffix(2)).toBe('nd')
  })

  it('returns rd for 3', () => {
    expect(getOrdinalSuffix(3)).toBe('rd')
  })

  it('returns th for 4', () => {
    expect(getOrdinalSuffix(4)).toBe('th')
  })

  it('returns th for 11', () => {
    expect(getOrdinalSuffix(11)).toBe('th')
  })

  it('returns th for 12', () => {
    expect(getOrdinalSuffix(12)).toBe('th')
  })

  it('returns th for 13', () => {
    expect(getOrdinalSuffix(13)).toBe('th')
  })

  it('returns st for 21', () => {
    expect(getOrdinalSuffix(21)).toBe('st')
  })

  it('returns nd for 22', () => {
    expect(getOrdinalSuffix(22)).toBe('nd')
  })

  it('returns rd for 23', () => {
    expect(getOrdinalSuffix(23)).toBe('rd')
  })

  it('returns th for 24', () => {
    expect(getOrdinalSuffix(24)).toBe('th')
  })
})

describe('convertSpeed', () => {
  it('converts kmh to mph', () => {
    expect(convertSpeed(100, 'mph')).toBe(62)
  })

  it('passes through kmh when unit is kph', () => {
    expect(convertSpeed(100, 'kph')).toBe(100)
  })

  it('converts 0', () => {
    expect(convertSpeed(0, 'mph')).toBe(0)
    expect(convertSpeed(0, 'kph')).toBe(0)
  })

  it('rounds result', () => {
    expect(convertSpeed(1, 'mph')).toBe(1)
  })
})

describe('speedUnitLabel', () => {
  it('returns MPH for mph', () => {
    expect(speedUnitLabel('mph')).toBe('MPH')
  })

  it('returns KPH for kph', () => {
    expect(speedUnitLabel('kph')).toBe('KPH')
  })
})
