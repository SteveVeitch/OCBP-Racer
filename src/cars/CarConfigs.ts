import { CarConfig } from '../physics/CarController'

export interface EngineDefinition {
  type: string
  displacement: string
  horsepower: number
  redline: number
  baseFrequency: number
  maxFrequency: number
}

export interface CarDefinition {
  id: string
  name: string
  subtitle: string
  color: number
  config: CarConfig
  description: string
  engine: EngineDefinition
}

export const CARS: CarDefinition[] = [
  {
    id: 'rossini-488',
    name: 'Rossini 488',
    subtitle: 'The Prancing Horse',
    color: 0xdc143c,
    description: 'Balanced, stable, beginner-friendly. Italian mid-engine exotic with twin-turbo V8.',
    engine: {
      type: 'Twin-Turbo V8',
      displacement: '3.9L',
      horsepower: 661,
      redline: 8000,
      baseFrequency: 35,
      maxFrequency: 220
    },
    config: {
      mass: 1550,
      engineForce: 800,
      brakeForce: 2000,
      steerSpeed: 1.8,
      maxSteerAngle: 0.45,
      maxSpeed: 235,
      dragCoeff: 1.5,
      peakGrip: 1.9,
      downforce: 1.2,
      slipAnglePeak: 8,
      slipAngleLimit: 25,
      autoCorrect: 0.4,
      turboLagTime: 0.15
    }
  },
  {
    id: 'weissach-gt3',
    name: 'Weissach GT3',
    subtitle: 'The Scalpel',
    color: 0x1a5c1a,
    description: 'High grip, precise, rewards skill. German track-focused sports car with naturally aspirated flat-6.',
    engine: {
      type: 'NA Flat-6',
      displacement: '4.0L',
      horsepower: 502,
      redline: 8500,
      baseFrequency: 40,
      maxFrequency: 260
    },
    config: {
      mass: 1400,
      engineForce: 850,
      brakeForce: 2200,
      steerSpeed: 2.2,
      maxSteerAngle: 0.42,
      maxSpeed: 245,
      dragCoeff: 1.4,
      peakGrip: 2.4,
      downforce: 1.8,
      slipAnglePeak: 6,
      slipAngleLimit: 20,
      autoCorrect: 0.6,
      turboLagTime: 0.0
    }
  },
  {
    id: 'kaiju-gt-r',
    name: 'Kaiju GT-R',
    subtitle: 'The Wild Card',
    color: 0xcc2200,
    description: 'High power, loose rear, drifts easily. Japanese turbocharged super-GT with twin-turbo V6.',
    engine: {
      type: 'Twin-Turbo V6',
      displacement: '3.8L',
      horsepower: 565,
      redline: 7200,
      baseFrequency: 30,
      maxFrequency: 200
    },
    config: {
      mass: 1500,
      engineForce: 950,
      brakeForce: 1900,
      steerSpeed: 2.0,
      maxSteerAngle: 0.48,
      maxSpeed: 250,
      dragCoeff: 1.6,
      peakGrip: 1.6,
      downforce: 0.8,
      slipAnglePeak: 12,
      slipAngleLimit: 35,
      autoCorrect: 0.2,
      turboLagTime: 0.25
    }
  },
  {
    id: 'stingray-z06',
    name: 'Stingray Z06',
    subtitle: 'The Arrow',
    color: 0x1155cc,
    description: 'Agile, responsive, top speed focused. American mid-engine exotic with naturally aspirated V8.',
    engine: {
      type: 'NA V8',
      displacement: '5.5L',
      horsepower: 670,
      redline: 8600,
      baseFrequency: 32,
      maxFrequency: 240
    },
    config: {
      mass: 1250,
      engineForce: 750,
      brakeForce: 2400,
      steerSpeed: 2.5,
      maxSteerAngle: 0.44,
      maxSpeed: 265,
      dragCoeff: 1.3,
      peakGrip: 2.1,
      downforce: 1.5,
      slipAnglePeak: 7,
      slipAngleLimit: 22,
      autoCorrect: 0.5,
      turboLagTime: 0.0
    }
  }
]

export function getCarById(id: string): CarDefinition {
  const car = CARS.find(c => c.id === id)
  if (!car) throw new Error(`Unknown car: ${id}`)
  return car
}
