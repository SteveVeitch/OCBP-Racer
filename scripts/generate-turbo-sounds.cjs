const fs = require('fs')
const path = require('path')

const SAMPLE_RATE = 44100
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'audio', 'turbo')

function writeWav16Mono(filePath, samples) {
  const numSamples = samples.length
  const dataSize = numSamples * 2
  const fileSize = 44 + dataSize
  const buf = Buffer.alloc(fileSize)

  buf.write('RIFF', 0)
  buf.writeUInt32LE(fileSize - 8, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(1, 22)
  buf.writeUInt32LE(SAMPLE_RATE, 24)
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28)
  buf.writeUInt16LE(2, 32)
  buf.writeUInt16LE(16, 34)
  buf.write('data', 36)
  buf.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2)
  }

  fs.writeFileSync(filePath, buf)
  console.log(`  Wrote ${filePath} (${(fileSize / 1024).toFixed(1)} KB, ${(numSamples / SAMPLE_RATE).toFixed(2)}s)`)
}

function generateWhistle(opts) {
  const { duration, baseFreq, sweepRange, bandwidth, amplitude, sweepShape, noiseRatio, tonalRatio } = opts
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const fadeLen = Math.floor(SAMPLE_RATE * 0.02)
  const samples = new Float64Array(numSamples)

  const bw = bandwidth || 800

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const loopT = (t % duration) / duration

    let sweepPhase
    if (sweepShape === 'smooth') {
      sweepPhase = (1 - Math.cos(loopT * Math.PI * 2)) / 2
    } else if (sweepShape === 'asymmetric') {
      sweepPhase = Math.pow((1 - Math.cos(loopT * Math.PI * 2)) / 2, 0.7)
    } else {
      sweepPhase = Math.sin(loopT * Math.PI * 2)
    }

    const freq = baseFreq + sweepRange * sweepPhase
    const w0 = 2 * Math.PI * freq / SAMPLE_RATE
    const alpha = Math.sin(w0) / (2 * (bw / SAMPLE_RATE / 2 + 0.001))
    const cosw0 = Math.cos(w0)
    const a0 = 1 + alpha
    const a1 = -2 * cosw0
    const a2 = 1 - alpha
    const b0g = (1 - cosw0) / 2
    const b1g = 1 - cosw0
    const b2g = (1 - cosw0) / 2

    const noise = Math.random() * 2 - 1
    const bandNoise = (b0g * noise + b1g * b6 + b2g * b5 - a1 * b1 - a2 * b2) / a0
    b0 = bandNoise
    b1 = b0; b2 = b1; b5 = b2; b6 = bandNoise

    const nVal = bandNoise * noiseRatio * amplitude

    let tVal = 0
    if (tonalRatio > 0) {
      tVal = Math.sin(2 * Math.PI * (freq * 0.5) * t) * tonalRatio * amplitude * 0.3
      tVal += Math.sin(2 * Math.PI * freq * t) * tonalRatio * amplitude * 0.15
    }

    let val = nVal + tVal

    const slowMod = 0.8 + 0.2 * Math.sin(loopT * Math.PI * 2 * 1.7)
    const fastMod = 0.9 + 0.1 * Math.sin(loopT * Math.PI * 2 * 5.3)
    val *= slowMod * fastMod

    if (i < fadeLen) {
      val *= i / fadeLen
    } else if (i > numSamples - fadeLen) {
      val *= (numSamples - i) / fadeLen
    }

    samples[i] = val
  }

  const start = samples[0]
  const blendLen = Math.floor(SAMPLE_RATE * 0.05)
  for (let i = 0; i < blendLen; i++) {
    const t = i / blendLen
    const idx = numSamples - blendLen + i
    samples[idx] = samples[idx] * (1 - t) + start * t
  }

  return samples
}

function generateFlutter(opts) {
  const { duration, filterFreq, filterQ, noiseMix, toneFreq, decay, amplitude, tailLength } = opts
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)

  let prevNoise = 0
  let prevPrevNoise = 0

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const env = Math.exp(-t / decay) * amplitude

    const rawNoise = Math.random() * 2 - 1
    prevPrevNoise = prevNoise
    prevNoise = rawNoise

    const smoothedNoise = (rawNoise + prevNoise * 2 + prevPrevNoise) / 4
    const filteredNoise = smoothedNoise * env * noiseMix

    const tailEnv = t > decay * 0.5 ? Math.exp(-(t - decay * 0.5) / (tailLength || 0.08)) * 0.4 : 0.4
    const tone = Math.sin(2 * Math.PI * (toneFreq || filterFreq * 0.6) * t) * env * tailEnv

    samples[i] = filteredNoise + tone
  }

  const peak = Math.max(...Array.from(samples).map(Math.abs))
  if (peak > 0) {
    for (let i = 0; i < numSamples; i++) {
      samples[i] /= peak
    }
  }

  return samples
}

// ─── Rossini 488: Smooth, refined, 488 GTB-style ───
console.log('Generating Rossini 488 turbo sounds...')

const rossiniWhistle = generateWhistle({
  duration: 2.0,
  baseFreq: 4000,
  sweepRange: 2000,
  bandwidth: 600,
  amplitude: 0.55,
  sweepShape: 'smooth',
  noiseRatio: 0.8,
  tonalRatio: 0.3
})
writeWav16Mono(path.join(OUTPUT_DIR, 'rossini-488', 'whistle.wav'), rossiniWhistle)

const rossiniFlutter = generateFlutter({
  duration: 0.30,
  filterFreq: 2200,
  filterQ: 4,
  noiseMix: 0.7,
  toneFreq: 1600,
  decay: 0.04,
  amplitude: 0.45,
  tailLength: 0.06
})
writeWav16Mono(path.join(OUTPUT_DIR, 'rossini-488', 'flutter.wav'), rossiniFlutter)

// ─── Kaiju GT-R: Aggressive, raw, wider range ───
console.log('Generating Kaiju GT-R turbo sounds...')

const kaijuWhistle = generateWhistle({
  duration: 2.0,
  baseFreq: 3500,
  sweepRange: 3500,
  bandwidth: 1000,
  amplitude: 0.65,
  sweepShape: 'asymmetric',
  noiseRatio: 0.75,
  tonalRatio: 0.4
})
writeWav16Mono(path.join(OUTPUT_DIR, 'kaiju-gt-r', 'whistle.wav'), kaijuWhistle)

const kaijuFlutter = generateFlutter({
  duration: 0.35,
  filterFreq: 1800,
  filterQ: 3,
  noiseMix: 0.6,
  toneFreq: 1200,
  decay: 0.055,
  amplitude: 0.55,
  tailLength: 0.10
})
writeWav16Mono(path.join(OUTPUT_DIR, 'kaiju-gt-r', 'flutter.wav'), kaijuFlutter)

console.log('\nDone! 4 turbo WAV files generated.')
