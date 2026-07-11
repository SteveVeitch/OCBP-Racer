export interface LeaderboardEntry {
  carId: string
  trackId: string
  totalTime: number
  bestLapTime: number
  wallHits: number
  topSpeed: number
  date: string
}

interface LeaderboardStore {
  tracks: Record<string, LeaderboardEntry[]>
  overall: LeaderboardEntry[]
}

const STORAGE_KEY = 'ocbp-leaderboard'
const MAX_ENTRIES_PER_TRACK = 10
const MAX_OVERALL = 20

function load(): LeaderboardStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch { /* ignore */ }
  return { tracks: {}, overall: [] }
}

function save(store: LeaderboardStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch { /* ignore */ }
}

export function addLeaderboardEntry(entry: LeaderboardEntry): void {
  const store = load()

  if (!store.tracks[entry.trackId]) {
    store.tracks[entry.trackId] = []
  }
  store.tracks[entry.trackId].push(entry)
  store.tracks[entry.trackId].sort((a, b) => a.totalTime - b.totalTime)
  if (store.tracks[entry.trackId].length > MAX_ENTRIES_PER_TRACK) {
    store.tracks[entry.trackId] = store.tracks[entry.trackId].slice(0, MAX_ENTRIES_PER_TRACK)
  }

  store.overall.push(entry)
  store.overall.sort((a, b) => a.totalTime - b.totalTime)
  if (store.overall.length > MAX_OVERALL) {
    store.overall = store.overall.slice(0, MAX_OVERALL)
  }

  save(store)
}

export function getTrackLeaderboard(trackId: string): LeaderboardEntry[] {
  const store = load()
  return store.tracks[trackId] || []
}

export function getOverallLeaderboard(): LeaderboardEntry[] {
  return load().overall
}

export function clearLeaderboard(): void {
  save({ tracks: {}, overall: [] })
}
