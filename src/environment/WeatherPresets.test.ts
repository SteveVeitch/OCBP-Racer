import { describe, it, expect } from 'vitest'
import { WeatherPresets } from './WeatherPresets'

describe('WeatherPresets', () => {
  it('has exactly 4 presets', () => {
    expect(Object.keys(WeatherPresets)).toHaveLength(4)
  })

  it('has clear, rain, fog, storm', () => {
    expect(WeatherPresets.clear).toBeDefined()
    expect(WeatherPresets.rain).toBeDefined()
    expect(WeatherPresets.fog).toBeDefined()
    expect(WeatherPresets.storm).toBeDefined()
  })

  it('clear preset has neutral multipliers', () => {
    const clear = WeatherPresets.clear
    expect(clear.gripMultiplier).toBe(1.0)
    expect(clear.dragMultiplier).toBe(1.0)
    expect(clear.brakingMultiplier).toBe(1.0)
    expect(clear.steerMultiplier).toBe(1.0)
    expect(clear.rainIntensity).toBe(0)
    expect(clear.fogDensityAdd).toBe(0)
    expect(clear.visibilityMultiplier).toBe(1.0)
  })

  it('rain reduces grip and visibility', () => {
    const rain = WeatherPresets.rain
    expect(rain.gripMultiplier).toBeLessThan(1.0)
    expect(rain.visibilityMultiplier).toBeLessThan(1.0)
    expect(rain.rainIntensity).toBeGreaterThan(0)
    expect(rain.fogDensityAdd).toBeGreaterThan(0)
  })

  it('fog reduces visibility significantly', () => {
    const fog = WeatherPresets.fog
    expect(fog.visibilityMultiplier).toBeLessThan(WeatherPresets.rain.visibilityMultiplier)
    expect(fog.fogDensityAdd).toBeGreaterThan(WeatherPresets.rain.fogDensityAdd)
    expect(fog.rainIntensity).toBe(0)
  })

  it('storm has worst grip', () => {
    const storm = WeatherPresets.storm
    expect(storm.gripMultiplier).toBeLessThan(WeatherPresets.rain.gripMultiplier)
    expect(storm.rainIntensity).toBe(1.0)
  })

  it('all presets have valid multiplier ranges', () => {
    for (const preset of Object.values(WeatherPresets)) {
      expect(preset.gripMultiplier).toBeGreaterThan(0)
      expect(preset.gripMultiplier).toBeLessThanOrEqual(1.0)
      expect(preset.dragMultiplier).toBeGreaterThanOrEqual(1.0)
      expect(preset.brakingMultiplier).toBeGreaterThan(0)
      expect(preset.brakingMultiplier).toBeLessThanOrEqual(1.0)
      expect(preset.steerMultiplier).toBeGreaterThan(0)
      expect(preset.steerMultiplier).toBeLessThanOrEqual(1.0)
      expect(preset.rainIntensity).toBeGreaterThanOrEqual(0)
      expect(preset.rainIntensity).toBeLessThanOrEqual(1.0)
      expect(preset.fogDensityAdd).toBeGreaterThanOrEqual(0)
      expect(preset.visibilityMultiplier).toBeGreaterThan(0)
      expect(preset.visibilityMultiplier).toBeLessThanOrEqual(1.0)
    }
  })

  it('all presets have matching id and name', () => {
    for (const [key, preset] of Object.entries(WeatherPresets)) {
      expect(preset.id).toBe(key)
      expect(preset.name).toBeTruthy()
    }
  })
})
