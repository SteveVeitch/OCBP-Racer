export class AudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private engineGain: GainNode | null = null
  private engineOsc: OscillatorNode | null = null
  private engineOsc2: OscillatorNode | null = null
  private engineFilter: BiquadFilterNode | null = null
  private screechGain: GainNode | null = null
  private screechFilter: BiquadFilterNode | null = null
  private windGain: GainNode | null = null
  private windFilter: BiquadFilterNode | null = null
  private masterVolume = 1.0
  private engineVolume = 0.6
  private initialized = false

  async init(): Promise<void> {
    this.ctx = new AudioContext()

    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = this.masterVolume
    this.masterGain.connect(this.ctx.destination)

    this.initialized = true
  }

  private ensureContext(): boolean {
    if (!this.ctx || !this.masterGain) return false
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.initialized
  }

  private initEngine(): void {
    if (!this.ctx || !this.masterGain) return

    if (this.engineOsc) {
      try { this.engineOsc.stop() } catch { /* already stopped */ }
      try { this.engineOsc2?.stop() } catch { /* already stopped */ }
    }

    this.engineGain = this.ctx.createGain()
    this.engineGain.gain.value = 0
    this.engineGain.connect(this.masterGain)

    this.engineFilter = this.ctx.createBiquadFilter()
    this.engineFilter.type = 'lowpass'
    this.engineFilter.frequency.value = 800
    this.engineFilter.Q.value = 2
    this.engineFilter.connect(this.engineGain)

    this.engineOsc = this.ctx.createOscillator()
    this.engineOsc.type = 'sawtooth'
    this.engineOsc.frequency.value = 80
    this.engineOsc.connect(this.engineFilter)
    this.engineOsc.start()

    this.engineOsc2 = this.ctx.createOscillator()
    this.engineOsc2.type = 'square'
    this.engineOsc2.frequency.value = 40

    const gain2 = this.ctx.createGain()
    gain2.gain.value = 0.15

    this.engineOsc2.connect(gain2)
    gain2.connect(this.engineGain)
    this.engineOsc2.start()
  }

  private initTireScreech(): void {
    if (!this.ctx || !this.masterGain) return

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

    const screechSource = this.ctx.createBufferSource()
    screechSource.buffer = noiseBuffer
    screechSource.loop = true
    screechSource.connect(this.screechFilter)
    screechSource.start()
  }

  private initWindNoise(): void {
    if (!this.ctx || !this.masterGain) return

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

    const windSource = this.ctx.createBufferSource()
    windSource.buffer = noiseBuffer
    windSource.loop = true
    windSource.connect(this.windFilter)
    windSource.start()
  }

  startRaceAudio(): void {
    if (!this.ensureContext()) return
    this.initEngine()
    this.initTireScreech()
    this.initWindNoise()
  }

  stopRaceAudio(): void {
    if (!this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime

    if (this.engineGain) {
      this.engineGain.gain.cancelScheduledValues(now)
      this.engineGain.gain.setValueAtTime(this.engineGain.gain.value, now)
      this.engineGain.gain.linearRampToValueAtTime(0, now + 0.05)
    }
    if (this.screechGain) {
      this.screechGain.gain.cancelScheduledValues(now)
      this.screechGain.gain.setValueAtTime(this.screechGain.gain.value, now)
      this.screechGain.gain.linearRampToValueAtTime(0, now + 0.05)
    }
    if (this.windGain) {
      this.windGain.gain.cancelScheduledValues(now)
      this.windGain.gain.setValueAtTime(this.windGain.gain.value, now)
      this.windGain.gain.linearRampToValueAtTime(0, now + 0.05)
    }

    setTimeout(() => {
      try { this.engineOsc?.stop() } catch { /* ignore */ }
      try { this.engineOsc2?.stop() } catch { /* ignore */ }
      this.engineOsc = null
      this.engineOsc2 = null
    }, 100)
  }

  playEngine(rpm: number, _throttle: number): void {
    if (!this.ensureContext() || !this.engineOsc || !this.engineOsc2 || !this.engineGain) return

    const freq = 40 + (rpm / 7500) * 160
    const now = this.ctx!.currentTime
    this.engineOsc.frequency.setTargetAtTime(freq, now, 0.05)
    this.engineOsc2.frequency.setTargetAtTime(freq * 0.5, now, 0.05)

    const vol = 0.05 + (rpm / 7500) * this.engineVolume
    this.engineGain.gain.setTargetAtTime(vol, now, 0.05)
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
    this.masterVolume = volume
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05)
    }
  }

  setEngineVolume(volume: number): void {
    this.engineVolume = volume
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
    this.ctx?.close()
  }
}
