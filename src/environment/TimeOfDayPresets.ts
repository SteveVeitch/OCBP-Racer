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
    ambientColor: new THREE.Color(0x4a3a2a),
    ambientIntensity: 0.3,
    directionalColor: new THREE.Color(0xffaa55),
    directionalIntensity: 0.6,
    directionalAngle: 15,
    fogColor: new THREE.Color(0x3a2a1a),
    fogNear: 80,
    fogFar: 250,
    skyColor: new THREE.Color(0x1a1a2a),
    temperatureCelsius: 14
  },
  day: {
    id: 'day',
    name: 'Day',
    ambientColor: new THREE.Color(0x888899),
    ambientIntensity: 0.5,
    directionalColor: new THREE.Color(0xffffff),
    directionalIntensity: 1.0,
    directionalAngle: 60,
    fogColor: new THREE.Color(0xaabbcc),
    fogNear: 120,
    fogFar: 350,
    skyColor: new THREE.Color(0x4488cc),
    temperatureCelsius: 22
  },
  dusk: {
    id: 'dusk',
    name: 'Dusk',
    ambientColor: new THREE.Color(0x553322),
    ambientIntensity: 0.35,
    directionalColor: new THREE.Color(0xff7733),
    directionalIntensity: 0.5,
    directionalAngle: 10,
    fogColor: new THREE.Color(0x442211),
    fogNear: 70,
    fogFar: 220,
    skyColor: new THREE.Color(0x221122),
    temperatureCelsius: 18
  },
  night: {
    id: 'night',
    name: 'Night',
    ambientColor: new THREE.Color(0x111122),
    ambientIntensity: 0.15,
    directionalColor: new THREE.Color(0x4444ff),
    directionalIntensity: 0.15,
    directionalAngle: 0,
    fogColor: new THREE.Color(0x0a0a15),
    fogNear: 40,
    fogFar: 160,
    skyColor: new THREE.Color(0x050510),
    temperatureCelsius: 10
  }
}
