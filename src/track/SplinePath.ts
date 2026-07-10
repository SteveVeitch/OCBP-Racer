import * as THREE from 'three'

export class SplinePath {
  private curve: THREE.CatmullRomCurve3

  constructor(points: THREE.Vector3[]) {
    this.curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5)
  }

  getPoint(t: number): THREE.Vector3 {
    return this.curve.getPoint(t)
  }

  getTangent(t: number): THREE.Vector3 {
    return this.curve.getTangent(t).normalize()
  }

  getPoints(divisions: number): THREE.Vector3[] {
    return this.curve.getPoints(divisions)
  }

  getLength(): number {
    return this.curve.getLength()
  }

  getSpacedPoints(divisions: number): THREE.Vector3[] {
    return this.curve.getSpacedPoints(divisions)
  }

  getRightVector(t: number): THREE.Vector3 {
    const tangent = this.getTangent(t)
    const up = new THREE.Vector3(0, 1, 0)
    return new THREE.Vector3().crossVectors(up, tangent).normalize()
  }
}
