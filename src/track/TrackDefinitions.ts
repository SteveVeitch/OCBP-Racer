import * as THREE from 'three'
import { TimeOfDayPreset, TimeOfDayPresets } from '../environment/TimeOfDayPresets'
import { WeatherPreset, WeatherPresets } from '../environment/WeatherPresets'

export type TerrainType = 'urban' | 'coastal' | 'mountain' | 'industrial'

export interface TrackDefinition {
  id: string
  name: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert'
  distanceKm: number
  terrain: TerrainType
  defaultTimeOfDay: string
  defaultWeather: string
  controlPoints: THREE.Vector3[]
  roadColor: number
  roadColorWet?: number
  barrierColor: number
  checkpointCount: number
  buildingDensity: number
  streetLightDensity: number
}

export const TRACKS: TrackDefinition[] = [
  {
    id: 'midnight-circuit',
    name: 'Midnight Circuit',
    difficulty: 'Easy',
    distanceKm: 0.22,
    terrain: 'urban',
    defaultTimeOfDay: 'night',
    defaultWeather: 'clear',
    controlPoints: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 25),
      new THREE.Vector3(-8, 0, 45),
      new THREE.Vector3(-25, 0, 50),
      new THREE.Vector3(-42, 0, 45),
      new THREE.Vector3(-50, 0, 25),
      new THREE.Vector3(-50, 0, 0),
      new THREE.Vector3(-50, 0, -25),
      new THREE.Vector3(-42, 0, -45),
      new THREE.Vector3(-25, 0, -50),
      new THREE.Vector3(-8, 0, -45),
      new THREE.Vector3(0, 0, -25)
    ],
    roadColor: 0x333333,
    roadColorWet: 0x222233,
    barrierColor: 0x888888,
    checkpointCount: 8,
    buildingDensity: 25,
    streetLightDensity: 20
  },
  {
    id: 'sunset-boulevard',
    name: 'Sunset Boulevard',
    difficulty: 'Medium',
    distanceKm: 0.45,
    terrain: 'coastal',
    defaultTimeOfDay: 'dusk',
    defaultWeather: 'clear',
    controlPoints: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(10, 0, 30),
      new THREE.Vector3(25, 0, 55),
      new THREE.Vector3(15, 0, 80),
      new THREE.Vector3(-10, 0, 95),
      new THREE.Vector3(-35, 0, 110),
      new THREE.Vector3(-60, 0, 105),
      new THREE.Vector3(-85, 0, 85),
      new THREE.Vector3(-95, 0, 60),
      new THREE.Vector3(-80, 0, 35),
      new THREE.Vector3(-60, 0, 15),
      new THREE.Vector3(-55, 0, -10),
      new THREE.Vector3(-60, 0, -35),
      new THREE.Vector3(-40, 0, -55),
      new THREE.Vector3(-15, 0, -45),
      new THREE.Vector3(-5, 0, -20)
    ],
    roadColor: 0x3a3a3a,
    roadColorWet: 0x2a2a3a,
    barrierColor: 0x998877,
    checkpointCount: 10,
    buildingDensity: 12,
    streetLightDensity: 16
  },
  {
    id: 'thunder-ridge',
    name: 'Thunder Ridge',
    difficulty: 'Hard',
    distanceKm: 0.70,
    terrain: 'mountain',
    defaultTimeOfDay: 'day',
    defaultWeather: 'clear',
    controlPoints: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(15, 0, 35),
      new THREE.Vector3(40, 0, 65),
      new THREE.Vector3(55, 0, 100),
      new THREE.Vector3(35, 0, 130),
      new THREE.Vector3(10, 0, 150),
      new THREE.Vector3(-20, 0, 160),
      new THREE.Vector3(-50, 0, 145),
      new THREE.Vector3(-65, 0, 115),
      new THREE.Vector3(-80, 0, 85),
      new THREE.Vector3(-95, 0, 55),
      new THREE.Vector3(-110, 0, 30),
      new THREE.Vector3(-120, 0, -5),
      new THREE.Vector3(-105, 0, -35),
      new THREE.Vector3(-80, 0, -60),
      new THREE.Vector3(-55, 0, -80),
      new THREE.Vector3(-30, 0, -90),
      new THREE.Vector3(-5, 0, -75),
      new THREE.Vector3(10, 0, -50),
      new THREE.Vector3(5, 0, -25)
    ],
    roadColor: 0x3d3d3d,
    roadColorWet: 0x2d2d3d,
    barrierColor: 0x777777,
    checkpointCount: 12,
    buildingDensity: 6,
    streetLightDensity: 8
  },
  {
    id: 'typhoon-pass',
    name: 'Typhoon Pass',
    difficulty: 'Hard',
    distanceKm: 0.65,
    terrain: 'mountain',
    defaultTimeOfDay: 'day',
    defaultWeather: 'rain',
    controlPoints: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, 0.5, 30),
      new THREE.Vector3(15, 1.5, 55),
      new THREE.Vector3(30, 2.5, 75),
      new THREE.Vector3(50, 2.0, 85),
      new THREE.Vector3(65, 1.0, 80),
      new THREE.Vector3(75, 0.0, 65),
      new THREE.Vector3(80, 0.5, 45),
      new THREE.Vector3(70, 1.0, 25),
      new THREE.Vector3(55, 1.5, 10),
      new THREE.Vector3(40, 2.5, -5),
      new THREE.Vector3(25, 3.0, -15),
      new THREE.Vector3(10, 2.0, -30),
      new THREE.Vector3(-5, 1.0, -45),
      new THREE.Vector3(-15, 0.0, -55),
      new THREE.Vector3(-20, 0.5, -40),
      new THREE.Vector3(-15, 0.3, -20),
      new THREE.Vector3(-5, 0.1, -5)
    ],
    roadColor: 0x3a3a3a,
    roadColorWet: 0x2a2a3a,
    barrierColor: 0x777777,
    checkpointCount: 12,
    buildingDensity: 0,
    streetLightDensity: 0
  },
  {
    id: 'neon-district',
    name: 'Neon District',
    difficulty: 'Expert',
    distanceKm: 0.55,
    terrain: 'urban',
    defaultTimeOfDay: 'night',
    defaultWeather: 'rain',
    controlPoints: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, 0, 25),
      new THREE.Vector3(18, 0, 45),
      new THREE.Vector3(40, 0, 50),
      new THREE.Vector3(55, 0, 35),
      new THREE.Vector3(60, 0, 10),
      new THREE.Vector3(50, 0, -15),
      new THREE.Vector3(30, 0, -30),
      new THREE.Vector3(15, 0, -50),
      new THREE.Vector3(-5, 0, -65),
      new THREE.Vector3(-30, 0, -60),
      new THREE.Vector3(-50, 0, -45),
      new THREE.Vector3(-65, 0, -20),
      new THREE.Vector3(-60, 0, 5),
      new THREE.Vector3(-45, 0, 25),
      new THREE.Vector3(-25, 0, 35),
      new THREE.Vector3(-10, 0, 20)
    ],
    roadColor: 0x2a2a2a,
    roadColorWet: 0x1a1a2a,
    barrierColor: 0x666677,
    checkpointCount: 10,
    buildingDensity: 30,
    streetLightDensity: 24
  },
  {
    id: 'iron-circuit',
    name: 'Iron Circuit',
    difficulty: 'Expert',
    distanceKm: 0.85,
    terrain: 'industrial',
    defaultTimeOfDay: 'dawn',
    defaultWeather: 'fog',
    controlPoints: [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(20, 0, 40),
      new THREE.Vector3(50, 0, 75),
      new THREE.Vector3(80, 0, 90),
      new THREE.Vector3(110, 0, 70),
      new THREE.Vector3(130, 0, 40),
      new THREE.Vector3(140, 0, 10),
      new THREE.Vector3(125, 0, -20),
      new THREE.Vector3(100, 0, -45),
      new THREE.Vector3(70, 0, -65),
      new THREE.Vector3(45, 0, -90),
      new THREE.Vector3(20, 0, -110),
      new THREE.Vector3(-10, 0, -120),
      new THREE.Vector3(-40, 0, -105),
      new THREE.Vector3(-65, 0, -80),
      new THREE.Vector3(-85, 0, -55),
      new THREE.Vector3(-100, 0, -25),
      new THREE.Vector3(-110, 0, 5),
      new THREE.Vector3(-100, 0, 35),
      new THREE.Vector3(-75, 0, 55),
      new THREE.Vector3(-45, 0, 45),
      new THREE.Vector3(-20, 0, 20)
    ],
    roadColor: 0x333333,
    roadColorWet: 0x222233,
    barrierColor: 0x555555,
    checkpointCount: 14,
    buildingDensity: 18,
    streetLightDensity: 14
  }
]

export function getTrackById(id: string): TrackDefinition | undefined {
  return TRACKS.find(t => t.id === id)
}

export function getTrackTimeOfDay(trackDef: TrackDefinition, override?: string): TimeOfDayPreset {
  const key = override && override !== 'auto' ? override : trackDef.defaultTimeOfDay
  return TimeOfDayPresets[key] || TimeOfDayPresets.night
}

export function getTrackWeather(trackDef: TrackDefinition, override?: string): WeatherPreset {
  const key = override && override !== 'auto' ? override : trackDef.defaultWeather
  return WeatherPresets[key] || WeatherPresets.clear
}
