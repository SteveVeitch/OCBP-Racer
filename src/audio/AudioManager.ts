import { EngineDefinition } from '../cars/CarConfigs'

export class AudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private engineGain: GainNode | null = null
  private enginePrimaryOsc: OscillatorNode | null = null
  private engineSecondaryOsc: OscillatorNode | null = null
  private enginePrimaryGain: GainNode | null = null
  private engineSecondaryGain: GainNode | null = null
  private engineFilter: BiquadFilterNode | null = null
  private screechGain: GainNode | null = null
  private screechFilter: BiquadFilterNode | null = null
  private screechSource: AudioBufferSourceNode | null = null
  private windGain: GainNode | null = null
  private windFilter: BiquadFilterNode | null = null
  private windSource: AudioBufferSourceNode | null = null
  private turboWhistleGain: GainNode | null = null
  private turboWhistleOsc: OscillatorNode | null = null
  private turboWhistleLfo: OscillatorNode | null = null
  private turboWhistleLfoGain: GainNode | null = null
  private masterVolume = 1.0
  private engineVolume = 1.0
  private initialized = false
  private stopTimeout: ReturnType<typeof setTimeout> | null = null

  private currentEngine: EngineDefinition | null = null
  private prevThrottle = 0
  private lastPopTime = 0

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

  private initEngineProcedural(engine?: EngineDefinition): void {
    if (!this.ctx || !this.masterGain) return

    this.stopEngineSources()

    this.currentEngine = engine ?? null

    this.engineGain = this.ctx.createGain()
    this.engineGain.gain.value = 0
    this.engineGain.connect(this.masterGain)

    this.engineFilter = this.ctx.createBiquadFilter()
    this.engineFilter.type = 'lowpass'
    this.engineFilter.frequency.value = 800
    this.engineFilter.Q.value = 2
    this.engineFilter.connect(this.engineGain)

    const baseFreq = engine?.baseFrequency ?? 35
    const waveform = engine?.primaryWaveform ?? 'sawtooth'

    this.enginePrimaryGain = this.ctx.createGain()
    this.enginePrimaryGain.gain.value = 0.7
    this.enginePrimaryGain.connect(this.engineFilter)

    this.enginePrimaryOsc = this.ctx.createOscillator()
    this.enginePrimaryOsc.type = waveform
    this.enginePrimaryOsc.frequency.value = baseFreq
    this.enginePrimaryOsc.connect(this.enginePrimaryGain)
    this.enginePrimaryOsc.start()

    const secondaryWaveform = engine?.secondaryWaveform ?? 'sawtooth'

    this.engineSecondaryGain = this.ctx.createGain()
    this.engineSecondaryGain.gain.value = 0.3
    this.engineSecondaryGain.connect(this.engineFilter)

    this.engineSecondaryOsc = this.ctx.createOscillator()
    this.engineSecondaryOsc.type = secondaryWaveform
    this.engineSecondaryOsc.frequency.value = baseFreq * 0.5
    this.engineSecondaryOsc.connect(this.engineSecondaryGain)
    this.engineSecondaryOsc.start()
  }

  private stopEngineSources(): void {
    try { this.enginePrimaryOsc?.stop() } catch { /* already stopped */ }
    try { this.engineSecondaryOsc?.stop() } catch { /* already stopped */ }
    this.enginePrimaryOsc = null
    this.engineSecondaryOsc = null
    this.enginePrimaryGain = null
    this.engineSecondaryGain = null
    this.engineGain = null
  }

  private initTurboWhistle(): void {
    if (!this.ctx || !this.masterGain) return

    this.stopTurboWhistle()

    this.turboWhistleGain = this.ctx.createGain()
    this.turboWhistleGain.gain.value = 0
    this.turboWhistleGain.connect(this.masterGain)

    const whistleFilter = this.ctx.createBiquadFilter()
    whistleFilter.type = 'bandpass'
    whistleFilter.frequency.value = 3000
    whistleFilter.Q.value = 8
    whistleFilter.connect(this.turboWhistleGain)

    this.turboWhistleOsc = this.ctx.createOscillator()
    this.turboWhistleOsc.type = 'sine'
    this.turboWhistleOsc.frequency.value = 2000
    this.turboWhistleOsc.connect(whistleFilter)
    this.turboWhistleOsc.start()

    this.turboWhistleLfoGain = this.ctx.createGain()
    this.turboWhistleLfoGain.gain.value = 200
    this.turboWhistleLfoGain.connect(this.turboWhistleOsc.frequency)

    this.turboWhistleLfo = this.ctx.createOscillator()
    this.turboWhistleLfo.type = 'sine'
    this.turboWhistleLfo.frequency.value = 6
    this.turboWhistleLfo.connect(this.turboWhistleLfoGain)
    this.turboWhistleLfo.start()
  }

  private stopTurboWhistle(): void {
    try { this.turboWhistleOsc?.stop() } catch { /* already stopped */ }
    try { this.turboWhistleLfo?.stop() } catch { /* already stopped */ }
    this.turboWhistleOsc = null
    this.turboWhistleLfo = null
    this.turboWhistleLfoGain = null
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

  async startRaceAudio(engine?: EngineDefinition): Promise<void> {
    if (!this.ensureContext()) return

    if (this.stopTimeout !== null) {
      clearTimeout(this.stopTimeout)
      this.stopTimeout = null
    }

    this.stopEngineSources()

    this.initEngineProcedural(engine)
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

    const localPrimaryOsc = this.enginePrimaryOsc
    const localSecondaryOsc = this.engineSecondaryOsc
    const localScreech = this.screechSource
    const localWind = this.windSource
    const localTurboOsc = this.turboWhistleOsc
    const localTurboLfo = this.turboWhistleLfo

    this.enginePrimaryOsc = null
    this.engineSecondaryOsc = null
    this.screechSource = null
    this.windSource = null
    this.turboWhistleOsc = null
    this.turboWhistleLfo = null

    this.stopTimeout = setTimeout(() => {
      this.stopTimeout = null
      try { localPrimaryOsc?.stop() } catch { /* ignore */ }
      try { localSecondaryOsc?.stop() } catch { /* ignore */ }
      try { localScreech?.stop() } catch { /* ignore */ }
      try { localWind?.stop() } catch { /* ignore */ }
      try { localTurboOsc?.stop() } catch { /* ignore */ }
      try { localTurboLfo?.stop() } catch { /* ignore */ }
    }, 100)
  }

  playEngine(rpm: number, _throttle: number, boostLevel: number = 0): void {
    if (!this.ensureContext() || !this.engineGain) return

    const engine = this.currentEngine
    const redline = engine?.redline ?? 7500
    const rpmRatio = Math.min(rpm / redline, 1)

    const now = this.ctx!.currentTime

    const baseFreq = engine?.baseFrequency ?? 35
    const maxFreq = engine?.maxFrequency ?? 220
    const primaryFreq = baseFreq + rpmRatio * (maxFreq - baseFreq)

    if (this.enginePrimaryOsc) {
      let wobble = 0
      if (rpmRatio > 0.92) {
        const overRev = (rpmRatio - 0.92) / 0.08
        wobble = Math.sin(rpm * 0.05) * overRev * 3
      }
      this.enginePrimaryOsc.frequency.setTargetAtTime(primaryFreq + wobble, now, 0.02)
    }
    if (this.engineSecondaryOsc) {
      this.engineSecondaryOsc.frequency.setTargetAtTime(primaryFreq * 0.5, now, 0.02)
    }

    if (this.enginePrimaryGain) {
      const crossfadeStart = 0.3
      const crossfadeEnd = 0.7
      let mix: number
      if (rpmRatio <= crossfadeStart) mix = 0.7
      else if (rpmRatio >= crossfadeEnd) mix = 0.4
      else mix = 0.7 - 0.3 * ((rpmRatio - crossfadeStart) / (crossfadeEnd - crossfadeStart))
      this.enginePrimaryGain.gain.setTargetAtTime(mix, now, 0.05)
    }
    if (this.engineSecondaryGain) {
      const crossfadeStart = 0.3
      const crossfadeEnd = 0.7
      let mix: number
      if (rpmRatio <= crossfadeStart) mix = 0.3
      else if (rpmRatio >= crossfadeEnd) mix = 0.6
      else mix = 0.3 + 0.3 * ((rpmRatio - crossfadeStart) / (crossfadeEnd - crossfadeStart))
      this.engineSecondaryGain.gain.setTargetAtTime(mix, now, 0.05)
    }

    const vol = (0.7 + rpmRatio * 0.3) * this.engineVolume
    this.engineGain.gain.setTargetAtTime(vol, now, 0.05)

    const filterFreq = 600 + rpmRatio * 1400
    this.engineFilter!.frequency.setTargetAtTime(filterFreq, now, 0.05)

    if (this.turboWhistleGain && this.turboWhistleOsc) {
      const turboVol = boostLevel * 0.15 * this.engineVolume
      this.turboWhistleGain.gain.setTargetAtTime(turboVol, now, 0.08)
      const turboFreq = 2000 + boostLevel * 2000
      this.turboWhistleOsc.frequency.setTargetAtTime(turboFreq, now, 0.1)
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

    const now = this.ctx!.currentTime

    const bufferSize = this.ctx!.sampleRate * 0.4
    const noiseBuffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const src = this.ctx!.createBufferSource()
    src.buffer = noiseBuffer

    const filter = this.ctx!.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2000 + Math.random() * 1000
    filter.Q.value = 4

    const gain = this.ctx!.createGain()
    gain.gain.setValueAtTime(0.12 * this.engineVolume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    const lfoOsc = this.ctx!.createOscillator()
    lfoOsc.type = 'sine'
    lfoOsc.frequency.value = 20 + Math.random() * 10
    const lfoGain = this.ctx!.createGain()
    lfoGain.gain.value = 500
    lfoOsc.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain!)
    lfoOsc.start()
    src.start()
    src.stop(now + 0.4)
    lfoOsc.stop(now + 0.4)
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
    this.ctx?.close()
  }
}
