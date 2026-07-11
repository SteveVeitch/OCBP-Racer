export interface EnvironmentModifiers {
  gripMultiplier: number
  dragMultiplier: number
  brakingMultiplier: number
  steerMultiplier: number
}

export function combineModifiers(
  weatherGrip: number,
  weatherDrag: number,
  weatherBraking: number,
  weatherSteer: number
): EnvironmentModifiers {
  return {
    gripMultiplier: weatherGrip,
    dragMultiplier: weatherDrag,
    brakingMultiplier: weatherBraking,
    steerMultiplier: weatherSteer
  }
}
