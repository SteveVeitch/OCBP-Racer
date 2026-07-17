import { EngineDefinition } from '../cars/CarConfigs'

const ENGINE_SAMPLE_PATHS: Record<string, { idle: string; accel: string }> = {
  'rossini-488': { idle: 'assets/audio/engines/rossini-488/idle.wav', accel: 'assets/audio/engines/rossini-488/accel.wav' },
  'weissach-gt3': { idle: 'assets/audio/engines/weissach-gt3/idle.wav', accel: 'assets/audio/engines/weissach-gt3/accel.wav' },
  'kaiju-gt-r': { idle: 'assets/audio/engines/kaiju-gt-r/idle.wav', accel: 'assets/audio/engines/kaiju-gt-r/accel.wav' },
  'stingray-z06': { idle: 'assets/audio/engines/stingray-z06/idle.wav', accel: 'assets/audio/engines/stingray-z06/accel.wav' }
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
  private turboWhistleOsc: OscillatorNode | null = null
  private turboWhistleFilter: BiquadFilterNode | null = null
  private masterVolume = 1.0
  private engineVolume = 0.6
  private initialized = false
  private stopTimeout: ReturnType<typeof setTimeout> | null = null

  private currentEngine: EngineDefinition | null = null
  private currentCarId: string | null = null
  private prevThrottle = 0
  private lastPopTime = 0
  private sampleCache: Map<string, { idle: AudioBuffer; accel: AudioBuffer }> = new Map()

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
    this.engineIdleSource.playbackRate.value = 0.8
    this.engineIdleSource.connect(this.engineIdleGain)
    this.engineIdleSource.start()

    this.engineAccelSource = this.ctx.createBufferSource()
    this.engineAccelSource.buffer = this.engineAccelBuffer
    this.engineAccelSource.loop = true
    this.engineAccelSource.playbackRate.value = 0.8
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

    this.turboWhistleGain = this.ctx.createGain()
    this.turboWhistleGain.gain.value = 0
    this.turboWhistleGain.connect(this.masterGain)

    this.turboWhistleFilter = this.ctx.createBiquadFilter()
    this.turboWhistleFilter.type = 'bandpass'
    this.turboWhistleFilter.frequency.value = 4000
    this.turboWhistleFilter.Q.value = 5
    this.turboWhistleFilter.connect(this.turboWhistleGain)

    this.turboWhistleOsc = this.ctx.createOscillator()
    this.turboWhistleOsc.type = 'sine'
    this.turboWhistleOsc.frequency.value = 3000
    this.turboWhistleOsc.connect(this.turboWhistleFilter)
    this.turboWhistleOsc.start()
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
      await this.loadEngineSamples(carId)
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
    const localTurbo = this.turboWhistleOsc

    this.engineIdleSource = null
    this.engineAccelSource = null
    this.screechSource = null
    this.windSource = null
    this.turboWhistleOsc = null

    this.stopTimeout = setTimeout(() => {
      this.stopTimeout = null
      try { localIdleSource?.stop() } catch { /* ignore */ }
      try { localAccelSource?.stop() } catch { /* ignore */ }
      try { localScreech?.stop() } catch { /* ignore */ }
      try { localWind?.stop() } catch { /* ignore */ }
      try { localTurbo?.stop() } catch { /* ignore */ }
    }, 100)
  }

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

      this.engineIdleGain.gain.setTargetAtTime(idleMix * this.engineVolume, now, 0.05)
      this.engineAccelGain.gain.setTargetAtTime(accelMix * this.engineVolume, now, 0.05)

      const basePlaybackRate = 0.7
      const maxPlaybackRate = 1.5
      const playbackRate = basePlaybackRate + rpmRatio * (maxPlaybackRate - basePlaybackRate)

      this.engineIdleSource.playbackRate.setTargetAtTime(playbackRate, now, 0.05)
      this.engineAccelSource.playbackRate.setTargetAtTime(playbackRate, now, 0.05)
    }

    const vol = this.engineGain.gain.value > 0 ? this.engineGain.gain.value : 0.05 + rpmRatio * this.engineVolume
    this.engineGain.gain.setTargetAtTime(vol, now, 0.05)

    let wobble = 0
    if (rpmRatio > 0.92) {
      const overRev = (rpmRatio - 0.92) / 0.08
      wobble = Math.sin(rpm * 0.05) * overRev * 0.03
      const currentRate = 0.7 + rpmRatio * 0.8
      if (this.engineIdleSource) {
        this.engineIdleSource.playbackRate.setTargetAtTime(currentRate + wobble, now, 0.02)
      }
      if (this.engineAccelSource) {
        this.engineAccelSource.playbackRate.setTargetAtTime(currentRate + wobble, now, 0.02)
      }
    }

    const filterFreq = 600 + rpmRatio * 1400
    this.engineFilter!.frequency.setTargetAtTime(filterFreq, now, 0.05)

    if (this.turboWhistleGain && this.turboWhistleOsc && this.turboWhistleFilter) {
      const turboVol = boostLevel * 0.12 * this.engineVolume
      this.turboWhistleGain.gain.setTargetAtTime(turboVol, now, 0.08)
      const turboFreq = 3000 + boostLevel * 5000
      this.turboWhistleOsc.frequency.setTargetAtTime(turboFreq, now, 0.1)
      this.turboWhistleFilter.frequency.setTargetAtTime(turboFreq, now, 0.1)
    }

    if (boostLevel > 0.3 && this.prevThrottle <= 0) {
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
    if (!this.ensureContext()) return

    const now = this.ctx!.currentTime
    const osc = this.ctx!.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(2500, now)
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12)

    const gain = this.ctx!.createGain()
    gain.gain.setValueAtTime(0.08 * this.engineVolume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    const filter = this.ctx!.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1800
    filter.Q.value = 3

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain!)
    osc.start()
    osc.stop(now + 0.2)
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
    this.ctx?.close()
  }
}
