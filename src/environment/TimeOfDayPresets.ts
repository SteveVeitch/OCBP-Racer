import * as THREE from 'three'

export interface TimeOfDayPreset {
  id: string
  name: string
  ambientColor: THREE.Color
  ambientIntensity: number
  directionalColor: THREE.Color
  directionalIntensity: number
  directionalAngle: number
  fogColor: THREE.Color
  fogNear: number
  fogFar: number
  skyColor: THREE.Color
  temperatureCelsius: number
}

export const TimeOfDayPresets: Record<string, TimeOfDayPreset> = {
  dawn: {
    id: 'dawn',
    name: 'Dawn',
    ambientColor: new THREE.Color(0x7a5a3a),
    ambientIntensity: 0.45,
    directionalColor: new THREE.Color(0xffaa55),
    directionalIntensity: 0.9,
    directionalAngle: 15,
    fogColor: new THREE.Color(0x5a3a2a),
    fogNear: 80,
    fogFar: 250,
    skyColor: new THREE.Color(0x2a2a4a),
    temperatureCelsius: 14
  },
  day: {
    id: 'day',
    name: 'Day',
    ambientColor: new THREE.Color(0xaabbcc),
    ambientIntensity: 0.7,
    directionalColor: new THREE.Color(0xffffff),
    directionalIntensity: 1.5,
    directionalAngle: 60,
    fogColor: new THREE.Color(0xbbccdd),
    fogNear: 120,
    fogFar: 350,
    skyColor: new THREE.Color(0x5599dd),
    temperatureCelsius: 22
  },
  dusk: {
    id: 'dusk',
    name: 'Dusk',
    ambientColor: new THREE.Color(0x774433),
    ambientIntensity: 0.45,
    directionalColor: new THREE.Color(0xff7733),
    directionalIntensity: 0.8,
    directionalAngle: 10,
    fogColor: new THREE.Color(0x553322),
    fogNear: 70,
    fogFar: 220,
    skyColor: new THREE.Color(0x332222),
    temperatureCelsius: 18
  },
  night: {
    id: 'night',
    name: 'Night',
    ambientColor: new THREE.Color(0x222244),
    ambientIntensity: 0.25,
    directionalColor: new THREE.Color(0x4444ff),
    directionalIntensity: 0.2,
    directionalAngle: 0,
    fogColor: new THREE.Color(0x0a0a15),
    fogNear: 40,
    fogFar: 160,
    skyColor: new THREE.Color(0x050510),
    temperatureCelsius: 10
  }
}
