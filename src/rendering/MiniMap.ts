import * as THREE from 'three'
import { SplinePath } from '../track/SplinePath'

const SIZE = 120
const PADDING = 10

export class MiniMap {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private trackPoints: THREE.Vector2[] = []
  private trackMin = new THREE.Vector2()
  private trackMax = new THREE.Vector2()
  private trackRange = new THREE.Vector2()
  private scale = 1

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = SIZE
    this.canvas.height = SIZE
    this.canvas.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: ${SIZE}px;
      height: ${SIZE}px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      pointer-events: none;
      z-index: 101;
    `
    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2D context')
    this.ctx = ctx
  }

  setTrack(spline: SplinePath): void {
    const points = spline.getSpacedPoints(100)
    this.trackPoints = points.map(p => new THREE.Vector2(p.x, p.z))

    let minX = Infinity, maxX = -Infinity
    let minZ = Infinity, maxZ = -Infinity
    for (const p of this.trackPoints) {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minZ) minZ = p.y
      if (p.y > maxZ) maxZ = p.y
    }

    this.trackMin.set(minX, minZ)
    this.trackMax.set(maxX, maxZ)
    this.trackRange.set(maxX - minX, maxZ - minZ)
    const maxRange = Math.max(this.trackRange.x, this.trackRange.y)
    this.scale = (SIZE - PADDING * 2) / maxRange

    document.body.appendChild(this.canvas)
  }

  update(
    playerPos: THREE.Vector3,
    aiPositions: THREE.Vector3[]
  ): void {
    if (this.trackPoints.length === 0) return

    this.ctx.clearRect(0, 0, SIZE, SIZE)

    const cx = SIZE / 2
    const cy = SIZE / 2
    const offsetX = cx - (playerPos.x - this.trackMin.x) * this.scale
    const offsetZ = cy - (playerPos.z - this.trackMin.y) * this.scale

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    for (let i = 0; i < this.trackPoints.length; i++) {
      const p = this.trackPoints[i]
      const sx = (p.x - this.trackMin.x) * this.scale + offsetX
      const sy = (p.y - this.trackMin.y) * this.scale + offsetZ
      if (i === 0) {
        this.ctx.moveTo(sx, sy)
      } else {
        this.ctx.lineTo(sx, sy)
      }
    }
    this.ctx.closePath()
    this.ctx.stroke()

    for (const aiPos of aiPositions) {
      const ax = (aiPos.x - this.trackMin.x) * this.scale + offsetX
      const ay = (aiPos.z - this.trackMin.y) * this.scale + offsetZ
      if (ax >= 0 && ax <= SIZE && ay >= 0 && ay <= SIZE) {
        this.ctx.fillStyle = '#ff3366'
        this.ctx.beginPath()
        this.ctx.arc(ax, ay, 3, 0, Math.PI * 2)
        this.ctx.fill()
      }
    }

    this.ctx.fillStyle = '#00ff88'
    this.ctx.beginPath()
    this.ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    this.ctx.fill()
  }

  show(): void {
    this.canvas.style.display = 'block'
  }

  hide(): void {
    this.canvas.style.display = 'none'
  }

  dispose(): void {
    this.canvas.remove()
  }
}
