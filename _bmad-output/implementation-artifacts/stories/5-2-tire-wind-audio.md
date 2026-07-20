---
id: 5-2-tire-wind-audio
epic: 5
title: Tire & Wind Audio
status: done
frs:
  - FR13
---

# Story 5.2: Tire & Wind Audio

As a **player**,
I want **tire screech and wind sounds that match driving conditions**,
So that **I hear realistic environmental feedback**.

**Acceptance Criteria:**

**Given** the car is sliding
**When** slip angle > 5 and grip < 80% of peak
**Then** tire screech plays (filtered noise, bandpass 1500-3000Hz)
**And** screech intensity = min(1, (slipAngle - 5) / 15) × 0.4
**And** screech frequency = 1500 + intensity × 1500 Hz

**Given** the car is moving at speed
**When** speed increases
**Then** wind noise volume = min(0.15, speed / 200)
**And** wind filter frequency = 200 + (speed / 250) × 600 Hz

**Given** the car collides
**When** collision is detected
**Then** collision sound plays (sine 100-150Hz + noise burst, 0.2s decay)
**And** collision volume = 0.3 × masterVolume
