export interface WeatherPreset {
  id: string
  name: string
  gripMultiplier: number
  dragMultiplier: number
  brakingMultiplier: number
  steerMultiplier: number
  rainIntensity: number
  fogDensityAdd: number
  visibilityMultiplier: number
}

export const WeatherPresets: Record<string, WeatherPreset> = {
  clear: {
    id: 'clear',
    name: 'Clear',
    gripMultiplier: 1.0,
    dragMultiplier: 1.0,
    brakingMultiplier: 1.0,
    steerMultiplier: 1.0,
    rainIntensity: 0,
    fogDensityAdd: 0,
    visibilityMultiplier: 1.0
  },
  rain: {
    id: 'rain',
    name: 'Rain',
    gripMultiplier: 0.78,
    dragMultiplier: 1.15,
    brakingMultiplier: 0.9,
    steerMultiplier: 0.85,
    rainIntensity: 0.6,
    fogDensityAdd: 30,
    visibilityMultiplier: 0.8
  },
  fog: {
    id: 'fog',
    name: 'Fog',
    gripMultiplier: 0.92,
    dragMultiplier: 1.05,
    brakingMultiplier: 0.95,
    steerMultiplier: 0.95,
    rainIntensity: 0,
    fogDensityAdd: 120,
    visibilityMultiplier: 0.5
  },
  storm: {
    id: 'storm',
    name: 'Storm',
    gripMultiplier: 0.72,
    dragMultiplier: 1.25,
    brakingMultiplier: 0.85,
    steerMultiplier: 0.8,
    rainIntensity: 1.0,
    fogDensityAdd: 80,
    visibilityMultiplier: 0.55
  }
}
