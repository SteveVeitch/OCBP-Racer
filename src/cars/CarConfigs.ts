import { CarConfig } from '../physics/CarController'

export interface CarDefinition {
  id: string
  name: string
  subtitle: string
  color: number
  config: CarConfig
  description: string
}

export const CARS: CarDefinition[] = [
  {
    id: 'phantom-gt',
    name: 'Phantom GT',
    subtitle: "The Gentleman's Express",
    color: 0xcccccc,
    description: 'Balanced, stable, forgiving. Perfect for beginners and consistent lap times.',
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
      autoCorrect: 0.4
    }
  },
  {
    id: 'viper-rs',
    name: 'Viper RS',
    subtitle: 'The Scalpel',
    color: 0x1a5c1a,
    description: 'Precise, grippy, rewards skill. Highest grip, sharp steering.',
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
      autoCorrect: 0.6
    }
  },
  {
    id: 'inferno-ss',
    name: 'Inferno SS',
    subtitle: 'The Wild Card',
    color: 0xcc2200,
    description: 'Loose, powerful, drift-happy. Highest power-to-weight, oversteer bias.',
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
      autoCorrect: 0.2
    }
  },
  {
    id: 'aeroven-tt',
    name: 'AeroVen TT',
    subtitle: 'The Arrow',
    color: 0x1155cc,
    description: 'Agile, responsive, top speed focused. Lightest with fastest top speed.',
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
      autoCorrect: 0.5
    }
  }
]

export function getCarById(id: string): CarDefinition {
  const car = CARS.find(c => c.id === id)
  if (!car) throw new Error(`Unknown car: ${id}`)
  return car
}
