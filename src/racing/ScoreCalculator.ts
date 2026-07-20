interface RaceResult {
  position: number
  points: number
  totalTime: number
  bestLapTime: number
  wallHits: number
  topSpeed: number
}

interface RaceInput {
  position: number
  totalTime: number
  bestLapTime: number
  wallHits: number
  topSpeed: number
  lapTimes: number[]
}

export class ScoreCalculator {
  private pointsMap: Record<number, number> = {
    1: 10,
    2: 7,
    3: 5,
    4: 2,
  }

  getPoints(position: number): number {
    return this.pointsMap[position] || 0
  }

  calculateResults(input: RaceInput): RaceResult {
    return {
      position: input.position,
      points: this.getPoints(input.position),
      totalTime: input.totalTime,
      bestLapTime: input.bestLapTime,
      wallHits: input.wallHits,
      topSpeed: input.topSpeed,
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toFixed(3).padStart(6, '0')}`
  }

  getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }

  convertSpeed(kmh: number, unit: 'mph' | 'kph'): number {
    return unit === 'mph' ? Math.round(kmh * 0.621371) : Math.round(kmh)
  }

  speedUnitLabel(unit: 'mph' | 'kph'): string {
    return unit.toUpperCase()
  }
}
