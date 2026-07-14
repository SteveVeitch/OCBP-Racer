export interface GaugeData {
  speed: number
  maxSpeed: number
  rpm: number
  redline: number
  boost: number
  hasTurbo: boolean
  speedUnit: 'mph' | 'kph'
}

const GAUGE_SIZE = 160
const GAUGE_GAP = 8
const MARGIN = 30

const START = (2 * Math.PI) / 3
const SPEED_SPAN = (4 * Math.PI) / 3
const REV_SPAN = Math.PI
const BOOST_SPAN = (2 * Math.PI) / 3

const BG_COLOR = 'rgba(8, 8, 20, 0.92)'
const RIM_COLOR = 'rgba(255, 255, 255, 0.15)'
const TICK_COLOR = 'rgba(255, 255, 255, 0.7)'
const TICK_DIM_COLOR = 'rgba(255, 255, 255, 0.25)'
const NUM_COLOR = 'rgba(255, 255, 255, 0.8)'
const NEEDLE_COLOR = '#ffffff'
const REDLINE_COLOR = '#ff3366'
const BOOST_COLOR = '#00ccff'
const TEXT_DIM = 'rgba(255, 255, 255, 0.4)'

export class HUDGauges {
  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private container!: HTMLDivElement
  private currentSpeed = 0
  private currentRpm = 0
  private currentBoost = 0

  create(parent: HTMLElement): void {
    this.container = document.createElement('div')
    this.container.style.cssText = `
      position: absolute;
      bottom: ${MARGIN}px;
      left: ${MARGIN}px;
      display: flex;
      gap: ${GAUGE_GAP}px;
      pointer-events: none;
      z-index: 51;
    `

    this.canvas = document.createElement('canvas')
    const totalWidth = GAUGE_SIZE * 3 + GAUGE_GAP * 2
    this.canvas.width = totalWidth
    this.canvas.height = GAUGE_SIZE
    this.canvas.style.cssText = `width:${totalWidth}px;height:${GAUGE_SIZE}px;`

    this.container.appendChild(this.canvas)
    parent.appendChild(this.container)

    this.ctx = this.canvas.getContext('2d')!
  }

  update(data: GaugeData): void {
    this.currentSpeed += (data.speed - this.currentSpeed) * 0.2
    this.currentRpm += (data.rpm - this.currentRpm) * 0.25
    this.currentBoost += (data.boost - this.currentBoost) * 0.15

    this.draw(data)
  }

  private draw(data: GaugeData): void {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.drawSpeedometer(ctx, data)

    ctx.save()
    ctx.translate(GAUGE_SIZE + GAUGE_GAP, 0)
    this.drawRevCounter(ctx, data)
    ctx.restore()

    if (data.hasTurbo) {
      ctx.save()
      ctx.translate((GAUGE_SIZE + GAUGE_GAP) * 2, 0)
      this.drawBoostGauge(ctx)
      ctx.restore()
    }
  }

  private drawSpeedometer(ctx: CanvasRenderingContext2D, data: GaugeData): void {
    const cx = GAUGE_SIZE / 2
    const cy = GAUGE_SIZE / 2
    const r = GAUGE_SIZE / 2 - 4
    const maxVal = data.maxSpeed * 1.1

    this.drawGaugeBase(ctx, cx, cy, r)
    this.drawArc(ctx, cx, cy, r, START, START + SPEED_SPAN)
    this.drawSpeedTicks(ctx, cx, cy, r, maxVal, data.speedUnit)
    this.drawNeedle(ctx, cx, cy, r - 20, START, SPEED_SPAN, (this.currentSpeed / maxVal) * 2)
    this.drawCenterHub(ctx, cx, cy)
    this.drawCenterText(ctx, cx, cy - 6, Math.round(this.currentSpeed * 2).toString(), 22, '#ffffff')
    this.drawCenterLabel(ctx, cx, cy + 18, data.speedUnit === 'mph' ? 'MPH' : 'KM/H')
  }

  private drawRevCounter(ctx: CanvasRenderingContext2D, data: GaugeData): void {
    const cx = GAUGE_SIZE / 2
    const cy = GAUGE_SIZE / 2
    const r = GAUGE_SIZE / 2 - 4
    const maxVal = data.redline * 1.1

    this.drawGaugeBase(ctx, cx, cy, r)
    this.drawArc(ctx, cx, cy, r, START, START + REV_SPAN)
    this.drawRedlineZone(ctx, cx, cy, r, data.redline, maxVal)
    this.drawRpmTicks(ctx, cx, cy, r, maxVal)
    this.drawNeedle(ctx, cx, cy, r - 20, START, REV_SPAN, (this.currentRpm / maxVal) * 3)
    this.drawCenterHub(ctx, cx, cy)
    this.drawCenterText(ctx, cx, cy - 6, Math.round(this.currentRpm * 3).toString(), 20, '#ffffff')
    this.drawCenterLabel(ctx, cx, cy + 18, 'RPM')
  }

  private drawBoostGauge(ctx: CanvasRenderingContext2D): void {
    const cx = GAUGE_SIZE / 2
    const cy = GAUGE_SIZE / 2
    const r = GAUGE_SIZE / 2 - 4

    this.drawGaugeBase(ctx, cx, cy, r)
    this.drawArc(ctx, cx, cy, r, START, START + BOOST_SPAN)
    this.drawBoostTicks(ctx, cx, cy, r)
    this.drawNeedle(ctx, cx, cy, r - 20, START, BOOST_SPAN, this.currentBoost)
    this.drawCenterHub(ctx, cx, cy)
    this.drawCenterText(ctx, cx, cy - 6, Math.round(this.currentBoost * 100).toString(), 22, BOOST_COLOR)
    this.drawCenterLabel(ctx, cx, cy + 18, 'BOOST')
  }

  private drawGaugeBase(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r + 2, 0, Math.PI * 2)
    ctx.fillStyle = BG_COLOR
    ctx.fill()
    ctx.strokeStyle = RIM_COLOR
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.restore()
  }

  private drawArc(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number,
    startAngle: number, endAngle: number
  ): void {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r - 6, startAngle, endAngle, false)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.restore()
  }

  private drawSpeedTicks(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number,
    maxVal: number, _unit: string
  ): void {
    const majorStep = 20
    const minorStep = 10

    for (let v = 0; v <= maxVal; v += minorStep) {
      const t = v / maxVal
      const angle = START + t * SPEED_SPAN
      const isMajor = v % majorStep === 0
      const innerR = isMajor ? r - 18 : r - 12

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR)
      ctx.lineTo(cx + Math.cos(angle) * (r - 7), cy + Math.sin(angle) * (r - 7))
      ctx.strokeStyle = isMajor ? TICK_COLOR : TICK_DIM_COLOR
      ctx.lineWidth = isMajor ? 1.5 : 0.8
      ctx.stroke()
      ctx.restore()

      if (isMajor) {
        const numR = r - 28
        const nx = cx + Math.cos(angle) * numR
        const ny = cy + Math.sin(angle) * numR
        ctx.save()
        ctx.font = '10px "Courier New", monospace'
        ctx.fillStyle = NUM_COLOR
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(v.toString(), nx, ny)
        ctx.restore()
      }
    }
  }

  private drawRpmTicks(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number,
    maxVal: number
  ): void {
    const majorStep = 1000
    const minorStep = 500

    for (let v = 0; v <= maxVal; v += minorStep) {
      const t = v / maxVal
      const angle = START + t * REV_SPAN
      const isMajor = v % majorStep === 0
      const innerR = isMajor ? r - 18 : r - 12

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR)
      ctx.lineTo(cx + Math.cos(angle) * (r - 7), cy + Math.sin(angle) * (r - 7))
      ctx.strokeStyle = isMajor ? TICK_COLOR : TICK_DIM_COLOR
      ctx.lineWidth = isMajor ? 1.5 : 0.8
      ctx.stroke()
      ctx.restore()

      if (isMajor) {
        const numR = r - 28
        const nx = cx + Math.cos(angle) * numR
        const ny = cy + Math.sin(angle) * numR
        ctx.save()
        ctx.font = '10px "Courier New", monospace'
        ctx.fillStyle = NUM_COLOR
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText((v / 1000).toFixed(0), nx, ny)
        ctx.restore()
      }
    }
  }

  private drawBoostTicks(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number
  ): void {
    const majorStep = 25
    const minorStep = 5
    const maxVal = 100

    for (let v = 0; v <= maxVal; v += minorStep) {
      const t = v / maxVal
      const angle = START + t * BOOST_SPAN
      const isMajor = v % majorStep === 0
      const innerR = isMajor ? r - 18 : r - 12

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR)
      ctx.lineTo(cx + Math.cos(angle) * (r - 7), cy + Math.sin(angle) * (r - 7))
      ctx.strokeStyle = v >= 75 ? BOOST_COLOR : (isMajor ? TICK_COLOR : TICK_DIM_COLOR)
      ctx.lineWidth = isMajor ? 1.5 : 0.8
      ctx.stroke()
      ctx.restore()

      if (isMajor) {
        const numR = r - 28
        const nx = cx + Math.cos(angle) * numR
        const ny = cy + Math.sin(angle) * numR
        ctx.save()
        ctx.font = '10px "Courier New", monospace'
        ctx.fillStyle = v >= 75 ? BOOST_COLOR : NUM_COLOR
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(v.toString(), nx, ny)
        ctx.restore()
      }
    }
  }

  private drawRedlineZone(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number,
    redline: number, maxVal: number
  ): void {
    const t0 = redline / maxVal
    const a0 = START + t0 * REV_SPAN
    const a1 = START + REV_SPAN

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r - 7, a0, a1, false)
    ctx.strokeStyle = REDLINE_COLOR
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.5
    ctx.stroke()
    ctx.restore()
  }

  private drawNeedle(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, length: number,
    startAngle: number, span: number, value: number
  ): void {
    const clamped = Math.max(0, Math.min(1, value))
    const angle = startAngle + clamped * span

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle + Math.PI / 2)

    ctx.beginPath()
    ctx.moveTo(-5, 0)
    ctx.lineTo(0, -length)
    ctx.lineTo(5, 0)
    ctx.closePath()
    ctx.fillStyle = NEEDLE_COLOR
    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)'
    ctx.shadowBlur = 6
    ctx.fill()
    ctx.restore()
  }

  private drawCenterHub(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#333'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#666'
    ctx.fill()
    ctx.restore()
  }

  private drawCenterText(
    ctx: CanvasRenderingContext2D, cx: number, cy: number,
    text: string, size: number, color: string
  ): void {
    ctx.save()
    ctx.font = `bold ${size}px "Courier New", monospace`
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, cx, cy)
    ctx.restore()
  }

  private drawCenterLabel(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, label: string
  ): void {
    ctx.save()
    ctx.font = '9px "Courier New", monospace'
    ctx.fillStyle = TEXT_DIM
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, cx, cy)
    ctx.restore()
  }

  remove(): void {
    this.container?.remove()
  }
}
