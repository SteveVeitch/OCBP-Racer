export type GameState =
  | 'MENU'
  | 'CAR_SELECT'
  | 'TRACK_SELECT'
  | 'LOADING'
  | 'COUNTDOWN'
  | 'RACING'
  | 'PAUSED'
  | 'RESULTS'

export interface RaceResults {
  position: number
  totalTime: number
  bestLapTime: number
  lapTimes: number[]
}

export class StateMachine {
  private current: GameState = 'MENU'
  private previous: GameState = 'MENU'
  private listeners: Map<GameState, (() => void)[]> = new Map()
  private raceResults: RaceResults | null = null
  private selectedCarId = 'phantom-gt'
  private selectedTrackId = 'midnight-circuit'

  getCurrent(): GameState {
    return this.current
  }

  getPrevious(): GameState {
    return this.previous
  }

  transition(next: GameState): void {
    if (this.current === next) return
    this.previous = this.current
    this.current = next
    this.notify(next)
  }

  on(state: GameState, callback: () => void): void {
    if (!this.listeners.has(state)) {
      this.listeners.set(state, [])
    }
    this.listeners.get(state)!.push(callback)
  }

  private notify(state: GameState): void {
    const callbacks = this.listeners.get(state)
    if (callbacks) {
      callbacks.forEach(cb => cb())
    }
  }

  setRaceResults(results: RaceResults): void {
    this.raceResults = results
  }

  getRaceResults(): RaceResults | null {
    return this.raceResults
  }

  setSelectedCar(id: string): void {
    this.selectedCarId = id
  }

  getSelectedCar(): string {
    return this.selectedCarId
  }

  setSelectedTrack(id: string): void {
    this.selectedTrackId = id
  }

  getSelectedTrack(): string {
    return this.selectedTrackId
  }
}
