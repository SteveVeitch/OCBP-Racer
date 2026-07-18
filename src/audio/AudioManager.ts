import { EngineDefinition } from '../cars/CarConfigs'

const ENGINE_SAMPLE_PATHS: Record<string, { idle: string; accel: string }> = {
  'rossini-488': { idle: '/assets/audio/engines/rossini-488/idle.wav', accel: '/assets/audio/engines/rossini-488/accel.wav' },
  'weissach-gt3': { idle: '/assets/audio/engines/weissach-gt3/idle.wav', accel: '/assets/audio/engines/weissach-gt3/accel.wav' },
  'kaiju-gt-r': { idle: '/assets/audio/engines/kaiju-gt-r/idle.wav', accel: '/assets/audio/engines/kaiju-gt-r/accel.wav' },
  'stingray-z06': { idle: '/assets/audio/engines/stingray-z06/idle.wav', accel: '/assets/audio/engines/stingray-z06/accel.wav' }
}

const TURBO_SAMPLE_PATHS: Record<string, { whistle: string; flutter: string }> = {
  'rossini-488': { whistle: '/assets/audio/turbo/rossini-488/whistle.wav', flutter: '/assets/audio/turbo/rossini-488/flutter.wav' },
  'kaiju-gt-r': { whistle: '/assets/audio/turbo/kaiju-gt-r/whistle.wav', flutter: '/assets/audio/turbo/kaiju-gt-r/flutter.wav' }
}

export class AudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private engineGain: GainNode | null = null
  private engineIdleBuffer: AudioBuffer | null = null
  private engineAccelBuffer: AudioBuffer | null = null
  private engineIdleSource: AudioBufferSourceNode | null = null
  private engineAccelSource: AudioBufferSourceNode | null = null
  private engineIdleGain: GainNode | null = null
  private engineAccelGain: GainNode | null = null
  private engineFilter: BiquadFilterNode | null = null
  private screechGain: GainNode | null = null
  private screechFilter: BiquadFilterNode | null = null
  private screechSource: AudioBufferSourceNode | null = null
  private windGain: GainNode | null = null
  private windFilter: BiquadFilterNode | null = null
  private windSource: AudioBufferSourceNode | null = null
  private turboWhistleGain: GainNode | null = null
  private turboWhistleSource: AudioBufferSourceNode | null = null
  private masterVolume = 1.0
  private engineVolume = 1.0
  private initialized = false
  private stopTimeout: ReturnType<typeof setTimeout> | null = null

  private currentEngine: EngineDefinition | null = null
  private currentCarId: string | null = null
  private prevThrottle = 0
  private lastPopTime = 0
  private sampleCache: Map<string, { idle: AudioBuffer; accel: AudioBuffer }> = new Map()
  private turboSampleCache: Map<string, { whistle: AudioBuffer; flutter: AudioBuffer }> = new Map()

  async init(): Promise<void> {
    try {
      this.ctx = new AudioContext()

      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.masterVolume
      this.masterGain.connect(this.ctx.destination)

      this.initialized = true
    } catch (err) {
      console.warn('[AudioManager] AudioContext creation failed:', err)
      this.initialized = false
    }
  }

  private ensureContext(): boolean {
    if (!this.ctx || !this.masterGain) return false
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.initialized
  }

  async loadEngineSamples(carId: string): Promise<void> {
    if (!this.ctx) return
    if (this.sampleCache.has(carId)) return

    const paths = ENGINE_SAMPLE_PATHS[carId]
    if (!paths) {
      console.warn(`[AudioManager] No engine samples for car: ${carId}`)
      return
    }

    try {
      const [idleResponse, accelResponse] = await Promise.all([
        fetch(paths.idle),
        fetch(paths.accel)
      ])
      const [idleArrayBuffer, accelArrayBuffer] = await Promise.all([
        idleResponse.arrayBuffer(),
        accelResponse.arrayBuffer()
      ])
      const [idleBuffer, accelBuffer] = await Promise.all([
        this.ctx.decodeAudioData(idleArrayBuffer),
        this.ctx.decodeAudioData(accelArrayBuffer)
      ])
      this.sampleCache.set(carId, { idle: idleBuffer, accel: accelBuffer })
    } catch (err) {
      console.warn(`[AudioManager] Failed to load engine samples for ${carId}:`, err)
    }
  }

  async loadTurboSamples(carId: string): Promise<void> {
    if (!this.ctx) return
    if (this.turboSampleCache.has(carId)) return

    const paths = TURBO_SAMPLE_PATHS[carId]
    if (!paths) return

    try {
      const [whistleResponse, flutterResponse] = await Promise.all([
        fetch(paths.whistle),
        fetch(paths.flutter)
      ])
      const [whistleArrayBuffer, flutterArrayBuffer] = await Promise.all([
        whistleResponse.arrayBuffer(),
        flutterResponse.arrayBuffer()
      ])
      const [whistleBuffer, flutterBuffer] = await Promise.all([
        this.ctx.decodeAudioData(whistleArrayBuffer),
        this.ctx.decodeAudioData(flutterArrayBuffer)
      ])
      this.turboSampleCache.set(carId, { whistle: whistleBuffer, flutter: flutterBuffer })
    } catch (err) {
      console.warn(`[AudioManager] Failed to load turbo samples for ${carId}:`, err)
    }
  }

  private initEngineSampled(engine?: EngineDefinition, carId?: string): void {
    if (!this.ctx || !this.masterGain) return

    this.stopEngineSources()

    this.currentEngine = engine ?? null
    this.currentCarId = carId ?? null

    this.engineGain = this.ctx.createGain()
    this.engineGain.gain.value = 0
    this.engineGain.connect(this.masterGain)

    this.engineFilter = this.ctx.createBiquadFilter()
    this.engineFilter.type = 'lowpass'
    this.engineFilter.frequency.value = 800
    this.engineFilter.Q.value = 2
    this.engineFilter.connect(this.engineGain)

    const cached = carId ? this.sampleCache.get(carId) : null
    if (!cached) return

    this.engineIdleBuffer = cached.idle
    this.engineAccelBuffer = cached.accel

    this.engineIdleGain = this.ctx.createGain()
    this.engineIdleGain.gain.value = 1
    this.engineIdleGain.connect(this.engineFilter)

    this.engineAccelGain = this.ctx.createGain()
    this.engineAccelGain.gain.value = 0
    this.engineAccelGain.connect(this.engineFilter)

    this.engineIdleSource = this.ctx.createBufferSource()
    this.engineIdleSource.buffer = this.engineIdleBuffer
    this.engineIdleSource.loop = true
    this.engineIdleSource.playbackRate.value = 0.35
    this.engineIdleSource.connect(this.engineIdleGain)
    this.engineIdleSource.start()

    this.engineAccelSource = this.ctx.createBufferSource()
    this.engineAccelSource.buffer = this.engineAccelBuffer
    this.engineAccelSource.loop = true
    this.engineAccelSource.playbackRate.value = 0.35
    this.engineAccelSource.connect(this.engineAccelGain)
    this.engineAccelSource.start()
  }

  private stopEngineSources(): void {
    try { this.engineIdleSource?.stop() } catch { /* already stopped */ }
    try { this.engineAccelSource?.stop() } catch { /* already stopped */ }
    this.engineIdleSource = null
    this.engineAccelSource = null
    this.engineIdleGain = null
    this.engineAccelGain = null
    this.engineIdleBuffer = null
    this.engineAccelBuffer = null
  }

  private initTurboWhistle(): void {
    if (!this.ctx || !this.masterGain) return

    this.stopTurboWhistle()

    const cached = this.currentCarId ? this.turboSampleCache.get(this.currentCarId) : null
    if (!cached) return

    this.turboWhistleGain = this.ctx.createGain()
    this.turboWhistleGain.gain.value = 0
    this.turboWhistleGain.connect(this.masterGain)

    this.turboWhistleSource = this.ctx.createBufferSource()
    this.turboWhistleSource.buffer = cached.whistle
    this.turboWhistleSource.loop = true
    this.turboWhistleSource.playbackRate.value = 0.6
    this.turboWhistleSource.connect(this.turboWhistleGain)
    this.turboWhistleSource.start()
  }

  private stopTurboWhistle(): void {
    try { this.turboWhistleSource?.stop() } catch { /* already stopped */ }
    this.turboWhistleSource = null
  }

  private initTireScreech(): void {
    if (!this.ctx || !this.masterGain) return

    if (this.screechSource) {
      try { this.screechSource.stop() } catch { /* already stopped */ }
      this.screechSource = null
    }

    const bufferSize = this.ctx.sampleRate * 2
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    this.screechGain = this.ctx.createGain()
    this.screechGain.gain.value = 0
    this.screechGain.connect(this.masterGain)

    this.screechFilter = this.ctx.createBiquadFilter()
    this.screechFilter.type = 'bandpass'
    this.screechFilter.frequency.value = 2000
    this.screechFilter.Q.value = 3
    this.screechFilter.connect(this.screechGain)

    this.screechSource = this.ctx.createBufferSource()
    this.screechSource.buffer = noiseBuffer
    this.screechSource.loop = true
    this.screechSource.connect(this.screechFilter)
    this.screechSource.start()
  }

  private initWindNoise(): void {
    if (!this.ctx || !this.masterGain) return

    if (this.windSource) {
      try { this.windSource.stop() } catch { /* already stopped */ }
      this.windSource = null
    }

    const bufferSize = this.ctx.sampleRate * 2
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    this.windGain = this.ctx.createGain()
    this.windGain.gain.value = 0
    this.windGain.connect(this.masterGain)

    this.windFilter = this.ctx.createBiquadFilter()
    this.windFilter.type = 'lowpass'
    this.windFilter.frequency.value = 400
    this.windFilter.Q.value = 1
    this.windFilter.connect(this.windGain)

    this.windSource = this.ctx.createBufferSource()
    this.windSource.buffer = noiseBuffer
    this.windSource.loop = true
    this.windSource.connect(this.windFilter)
    this.windSource.start()
  }

  async startRaceAudio(engine?: EngineDefinition, carId?: string): Promise<void> {
    if (!this.ensureContext()) return

    if (this.stopTimeout !== null) {
      clearTimeout(this.stopTimeout)
      this.stopTimeout = null
    }

    this.stopEngineSources()

    if (carId) {
      await Promise.all([
        this.loadEngineSamples(carId),
        this.loadTurboSamples(carId)
      ])
    }

    this.initEngineSampled(engine, carId)
    this.initTurboWhistle()
    this.initTireScreech()
    this.initWindNoise()
  }

  stopRaceAudio(): void {
    if (!this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime

    for (const g of [this.engineGain, this.screechGain, this.windGain, this.turboWhistleGain]) {
      if (g) {
        g.gain.cancelScheduledValues(now)
        g.gain.setValueAtTime(g.gain.value, now)
        g.gain.linearRampToValueAtTime(0, now + 0.05)
      }
    }

    const localIdleSource = this.engineIdleSource
    const localAccelSource = this.engineAccelSource
    const localScreech = this.screechSource
    const localWind = this.windSource
    const localTurbo = this.turboWhistleSource

    this.engineIdleSource = null
    this.engineAccelSource = null
    this.screechSource = null
    this.windSource = null
    this.turboWhistleSource = null

    this.stopTimeout = setTimeout(() => {
      this.stopTimeout = null
      try { localIdleSource?.stop() } catch { /* ignore */ }
      try { localAccelSource?.stop() } catch { /* ignore */ }
      try { localScreech?.stop() } catch { /* ignore */ }
      try { localWind?.stop() } catch { /* ignore */ }
      try { localTurbo?.stop() } catch { /* ignore */ }
    }, 100)
  }

  private engineLogCount = 0

  playEngine(rpm: number, _throttle: number, boostLevel: number = 0): void {
    if (!this.ensureContext() || !this.engineGain) return

    const engine = this.currentEngine
    const redline = engine?.redline ?? 7500
    const rpmRatio = Math.min(rpm / redline, 1)

    const now = this.ctx!.currentTime

    if (this.engineIdleSource && this.engineAccelSource && this.engineIdleGain && this.engineAccelGain) {
      const crossfadeStart = 0.3
      const crossfadeEnd = 0.7

      let idleMix: number
      let accelMix: number

      if (rpmRatio <= crossfadeStart) {
        idleMix = 1
        accelMix = 0
      } else if (rpmRatio >= crossfadeEnd) {
        idleMix = 0
        accelMix = 1
      } else {
        const t = (rpmRatio - crossfadeStart) / (crossfadeEnd - crossfadeStart)
        idleMix = 1 - t
        accelMix = t
      }

      this.engineIdleGain.gain.setTargetAtTime(idleMix, now, 0.05)
      this.engineAccelGain.gain.setTargetAtTime(accelMix, now, 0.05)

      const basePlaybackRate = 0.35
      const maxPlaybackRate = 1.8
      const playbackRate = basePlaybackRate + rpmRatio * (maxPlaybackRate - basePlaybackRate)

      this.engineIdleSource.playbackRate.setTargetAtTime(playbackRate, now, 0.05)
      this.engineAccelSource.playbackRate.setTargetAtTime(playbackRate, now, 0.05)
    }

    const vol = (0.7 + rpmRatio * 0.3) * this.engineVolume
    this.engineGain.gain.setTargetAtTime(vol, now, 0.05)

    let wobble = 0
    if (rpmRatio > 0.92) {
      const overRev = (rpmRatio - 0.92) / 0.08
      wobble = Math.sin(rpm * 0.05) * overRev * 0.03
      const currentRate = basePlaybackRate + rpmRatio * (maxPlaybackRate - basePlaybackRate)
      if (this.engineIdleSource) {
        this.engineIdleSource.playbackRate.setTargetAtTime(currentRate + wobble, now, 0.02)
      }
      if (this.engineAccelSource) {
        this.engineAccelSource.playbackRate.setTargetAtTime(currentRate + wobble, now, 0.02)
      }
    }

    const filterFreq = 600 + rpmRatio * 1400
    this.engineFilter!.frequency.setTargetAtTime(filterFreq, now, 0.05)

    if (this.turboWhistleGain && this.turboWhistleSource) {
      const turboVol = boostLevel * 0.15 * this.engineVolume
      this.turboWhistleGain.gain.setTargetAtTime(turboVol, now, 0.08)
      const turboRate = 0.6 + boostLevel * 1.0
      this.turboWhistleSource.playbackRate.setTargetAtTime(turboRate, now, 0.1)
    }

    if (this.prevThrottle > 0 && _throttle <= 0 && boostLevel > 0.3) {
      this.playTurboFlutter()
    }

    if (this.prevThrottle > 0 && _throttle <= 0 && rpmRatio > 0.4) {
      const now2 = performance.now() / 1000
      if (now2 - this.lastPopTime > 0.15) {
        this.playExhaustPop()
        this.lastPopTime = now2
      }
    }

    this.prevThrottle = _throttle
  }

  private playTurboFlutter(): void {
    if (!this.ensureContext() || !this.masterGain) return

    const cached = this.currentCarId ? this.turboSampleCache.get(this.currentCarId) : null
    if (!cached) return

    const now = this.ctx!.currentTime
    const src = this.ctx!.createBufferSource()
    src.buffer = cached.flutter
    src.playbackRate.value = 0.9 + Math.random() * 0.2

    const gain = this.ctx!.createGain()
    gain.gain.setValueAtTime(0.12 * this.engineVolume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    src.connect(gain)
    gain.connect(this.masterGain!)
    src.start()
  }

  private playExhaustPop(): void {
    if (!this.ensureContext()) return

    const now = this.ctx!.currentTime
    const popCount = 1 + Math.floor(Math.random() * 2)

    for (let i = 0; i < popCount; i++) {
      const delay = i * 0.04
      const osc = this.ctx!.createOscillator()
      osc.type = 'square'
      osc.frequency.value = 200 + Math.random() * 300

      const gain = this.ctx!.createGain()
      gain.gain.setValueAtTime(0.06 * this.engineVolume, now + delay)
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05)

      const filter = this.ctx!.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 600

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.masterGain!)
      osc.start(now + delay)
      osc.stop(now + delay + 0.08)
    }
  }

  playTireScreech(intensity: number): void {
    if (!this.ensureContext() || !this.screechGain || !this.screechFilter) return

    const vol = Math.min(1, intensity * 0.4) * this.engineVolume
    const now = this.ctx!.currentTime
    this.screechGain.gain.setTargetAtTime(vol, now, 0.02)

    const freq = 1500 + intensity * 1500
    this.screechFilter.frequency.setTargetAtTime(freq, now, 0.02)
  }

  playWindNoise(speed: number): void {
    if (!this.ensureContext() || !this.windGain || !this.windFilter) return

    const vol = Math.min(0.15, speed / 200) * this.engineVolume
    const now = this.ctx!.currentTime
    this.windGain.gain.setTargetAtTime(vol, now, 0.1)

    const freq = 200 + (speed / 250) * 600
    this.windFilter.frequency.setTargetAtTime(freq, now, 0.1)
  }

  playCollision(): void {
    if (!this.ensureContext()) return

    const now = this.ctx!.currentTime

    const osc = this.ctx!.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 100 + Math.random() * 50

    const gain = this.ctx!.createGain()
    gain.gain.setValueAtTime(0.3 * this.masterVolume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc.connect(gain)
    gain.connect(this.masterGain!)
    osc.start()
    osc.stop(now + 0.25)

    const noiseLen = this.ctx!.sampleRate * 0.15
    const noiseBuf = this.ctx!.createBuffer(1, noiseLen, this.ctx!.sampleRate)
    const noiseData = noiseBuf.getChannelData(0)
    for (let i = 0; i < noiseLen; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen)
    }

    const noiseSrc = this.ctx!.createBufferSource()
    noiseSrc.buffer = noiseBuf

    const noiseGain = this.ctx!.createGain()
    noiseGain.gain.setValueAtTime(0.25 * this.masterVolume, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    const filter = this.ctx!.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2000

    noiseSrc.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(this.masterGain!)
    noiseSrc.start()
    noiseSrc.stop(now + 0.2)
  }

  playUIClick(): void {
    this.playTone(600, 0.06, 'sine', 0.1)
  }

  playUIConfirm(): void {
    this.playTone(800, 0.08, 'sine', 0.12)
    setTimeout(() => this.playTone(1200, 0.08, 'sine', 0.1), 60)
  }

  playCountdownTick(): void {
    this.playTone(440, 0.15, 'square', 0.08)
  }

  playCountdownGo(): void {
    this.playTone(880, 0.2, 'square', 0.12)
  }

  playRaceComplete(): void {
    const notes = [523, 659, 784, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.1), i * 120)
    })
  }

  private playTone(freq: number, duration: number, type: OscillatorType, volume: number): void {
    if (!this.ensureContext()) return

    const now = this.ctx!.currentTime
    const osc = this.ctx!.createOscillator()
    osc.type = type
    osc.frequency.value = freq

    const gain = this.ctx!.createGain()
    gain.gain.setValueAtTime(volume * this.masterVolume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(this.masterGain!)
    osc.start()
    osc.stop(now + duration + 0.05)
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05)
    }
  }

  setEngineVolume(volume: number): void {
    this.engineVolume = Math.max(0, Math.min(1, volume))
  }

  suspend(): void {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend()
    }
  }

  resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  dispose(): void {
    this.stopRaceAudio()
    if (this.stopTimeout !== null) {
      clearTimeout(this.stopTimeout)
      this.stopTimeout = null
    }
    this.sampleCache.clear()
    this.turboSampleCache.clear()
    this.ctx?.close()
  }
}
