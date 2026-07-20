---
id: 5-1-procedural-engine-audio
epic: 5
title: Procedural Engine Audio
status: done
frs:
  - FR13
---

# Story 5.1: Procedural Engine Audio

As a **player**,
I want **engine sounds that respond to RPM and throttle**,
So that **I feel connected to the car's performance**.

**Acceptance Criteria:**

**Given** a race starts
**When** audio initializes
**Then** two oscillators create the engine sound (primary + secondary)
**And** primary oscillator uses car's primaryWaveform (sawtooth/square/triangle/sine)
**And** secondary oscillator uses car's secondaryWaveform at 0.5× base frequency
**And** frequencies scale from baseFrequency to maxFrequency based on RPM ratio

**Given** the engine audio is playing
**When** RPM changes
**Then** primary frequency = baseFreq + rpmRatio × (maxFreq - baseFreq)
**And** secondary frequency = primaryFreq × 0.5
**And** volume scales: 0.7 + rpmRatio × 0.3
**And** lowpass filter frequency = 600 + rpmRatio × 1400 Hz

**Given** the engine is at high RPM (> 92%)
**When** redline is approached
**Then** frequency wobble adds 3Hz oscillation (overrev effect)
**And** primary/secondary gain crossfades (0.7→0.4 primary, 0.3→0.6 secondary)

**Given** a turbo car is selected
**When** boost builds
**Then** turbo whistle oscillator (sine, 2000-4000Hz) plays
**And** whistle volume = boostLevel × 0.15
**And** LFO modulates whistle frequency (6Hz, ±200Hz)

**Given** the player lifts off throttle at high boost
**When** boostLevel > 0.3
**Then** turbo flutter plays (noise burst, bandpass 2000-3000Hz, 0.4s decay)
**And** flutter has LFO modulation (20-30Hz, ±500Hz)

**Given** the player lifts off throttle at high RPM
**When** rpmRatio > 0.4
**Then** exhaust pop plays (square wave, 200-500Hz, 0.05s decay)
**And** 1-2 pops per event, spaced 0.04s apart
