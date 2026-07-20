---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-07-20'
---

# Test Design: OCBP Racer - All Epics

**Date:** 2026-07-20
**Author:** Steve
**Status:** Draft

---

## Executive Summary

**Scope:** Epic-Level test design for OCBP Racer (9 epics, 29 stories)

**Risk Summary:**

- Total risks identified: 10
- High-priority risks (≥6): 3 (R1, R2, R3)
- Critical categories: TECH, PERF

**Coverage Summary:**

- P0 scenarios: 7 (~20-30 hours)
- P1 scenarios: 16 (~25-40 hours)
- P2/P3 scenarios: 11 (~10-20 hours)
- **Total effort**: ~55-90 hours (~7-11 days)

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|-----------|------------|
| Multiplayer | Not in PRD | N/A |
| Mobile platforms | Browser-only target | N/A |
| Accessibility audit | Not in current NFRs | Document for future |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|-------------|--------|-------|------------|-------|----------|
| R1 | TECH | Physics NaN causes game crash | 2 | 3 | 6 | Unit test NaN guard, edge case coverage | Dev | Sprint 1 |
| R2 | PERF | 60 FPS target missed on mid-range hardware | 3 | 2 | 6 | Performance benchmarks, profiling | Dev | Sprint 1 |
| R3 | PERF | Draw calls exceed 200 limit in complex scenes | 3 | 2 | 6 | Scene complexity audits, instancing | Dev | Sprint 1 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
|---------|----------|-------------|-------------|--------|-------|------------|-------|
| R5 | BUS | AI behavior breaks race balance | 2 | 2 | 4 | Difficulty profile validation | Dev |
| R6 | PERF | Bundle exceeds 2MB gzipped | 2 | 2 | 4 | Bundle analysis, code splitting | Dev |
| R7 | BUS | Checkpoint detection fails (wrong lap count) | 2 | 2 | 4 | Sequence validation unit tests | Dev |
| R10 | TECH | Browser compatibility gaps (Safari WebGL) | 2 | 2 | 4 | Cross-browser E2E matrix | QA |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
|---------|----------|-------------|-------------|--------|-------|--------|
| R4 | TECH | WebGL2 unavailable → no fallback message | 1 | 2 | 2 | Document |
| R8 | TECH | Gamepad disconnect causes input loss | 2 | 1 | 2 | Document |
| R9 | DATA | localStorage corrupted → settings lost | 1 | 1 | 1 | Document |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **DATA**: Data Integrity (loss, corruption, inconsistency)

---

## NFR Planning

**Purpose:** Capture NFR thresholds, planned validation, and evidence expected for later `nfr-assess`.

| NFR Category | Requirement / Threshold | Risk Link | Planned Validation | Evidence Needed |
|--------------|-------------------------|-----------|-------------------|-----------------|
| Performance | 60 FPS @ 1920×1080 | R2 | Frame rate benchmark during race | FPS metrics log |
| Performance | <5s load time | R6 | Load time measurement | Timing metrics |
| Performance | <200 draw calls, <500K triangles | R3 | Scene complexity audit | Draw call count log |
| Performance | <2MB gzipped bundle | R6 | Bundle size check in CI | Build output |
| Reliability | NaN guard → reset position/velocity | R1 | Unit test edge cases | Test pass/fail |
| Compatibility | Chrome/Firefox/Edge/Safari (latest 2) | R10 | Cross-browser E2E runs | CI test reports |
| Reliability | Graceful WebGL2 fallback message | R4 | Mock WebGL2 unavailable | Fallback message visible |
| Reliability | Gamepad disconnect → keyboard fallback | R8 | Disconnect during race | Game continues |

**Unknown thresholds:** None — all NFRs have defined thresholds.

---

## Entry Criteria

- [ ] Requirements and assumptions agreed upon by QA, Dev, PM
- [ ] Test environment provisioned (Vite dev server)
- [ ] Test data available (car configs, track definitions)
- [ ] Feature deployed to test environment
- [ ] Vitest framework configured
- [ ] Playwright configured for E2E tests

## Exit Criteria

- [ ] All P0 tests passing
- [ ] All P1 tests passing (or failures triaged)
- [ ] No open high-priority bugs
- [ ] Unit test coverage ≥ 80%
- [ ] NFR evidence identified for all 8 thresholds
- [ ] MITIGATE risks (R1, R2, R3) verified

---

## Test Coverage Plan

### P0 (Critical) - Run on every commit

**Criteria**: Blocks core journey + High risk (≥6) + No workaround

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| Game loop 120 Hz | Unit | R2 | 1 | Dev | Physics timestep |
| Frame time cap | Unit | R2 | 1 | Dev | Spiral of death |
| State machine | Unit | — | 1 | Dev | Core flow |
| NaN guard | Unit | R1 | 1 | Dev | Edge cases |
| Checkpoint sequence | Unit | R7 | 1 | Dev | Lap detection |
| Score calculation | Unit | — | 1 | Dev | Points system |
| Full race flow | E2E | — | 1 | QA | End-to-end |

**Total P0**: 7 tests, ~20-30 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
|-------------|------------|-----------|------------|-------|-------|
| Car braking | Unit | — | 1 | Dev | Force scaling |
| Steering | Unit | — | 1 | Dev | Speed reduction |
| Grip curve | Unit | — | 1 | Dev | Slip angle |
| Turbo lag | Unit | — | 1 | Dev | Timing |
| Wrong way | Unit | — | 1 | Dev | Detection |
| AI profiles | Unit | R5 | 1 | Dev | Difficulty params |
| Countdown | Unit | — | 1 | Dev | Timing |
| Settings persist | Unit | R9 | 1 | Dev | localStorage |
| Wall hit | Unit | — | 1 | Dev | Detection |
| 3 laps + results | E2E | R7 | 1 | QA | Lap count |
| AI difficulties | E2E | R5 | 1 | QA | Balance |
| Pause countdown | E2E | — | 1 | QA | Resume |
| Tab auto-pause | E2E | — | 1 | QA | Visibility |
| Menu navigation | E2E | — | 1 | QA | Flow |
| Gamepad connect | E2E | R8 | 1 | QA | Disconnect |
| Settings reload | E2E | R9 | 1 | QA | Persistence |
| Leaderboard entry | E2E | — | 1 | QA | Post-race |

**Total P1**: 17 tests, ~25-40 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement | Test Level | Test Count | Owner | Notes |
|-------------|------------|------------|-------|-------|
| AI recovery | Unit | 1 | Dev | State transitions |
| HUD gauges | Unit | 1 | Dev | Calculations |
| Weather persist | Unit | 1 | Dev | localStorage |
| Camera FOV | Unit | 1 | Dev | Scaling |
| Audio freq | Unit | 1 | Dev | RPM scaling |
| Leaderboard sort | Unit | 1 | Dev | Retention |
| Demo timer | Unit | 1 | Dev | Idle trigger |
| Demo mode | E2E | 1 | QA | Activation |

**Total P2**: 8 tests, ~8-15 hours

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] Game loop runs (Unit, 5s)
- [ ] State machine transitions (Unit, 5s)
- [ ] NaN guard triggers (Unit, 5s)

**Total**: 3 scenarios

### P0 Tests (<10 min)

**Purpose**: Critical path validation

- [ ] Full race flow (E2E, 2min)
- [ ] Physics calculations (Unit, 1min)
- [ ] Checkpoint detection (Unit, 30s)

**Total**: 7 scenarios

### P1 Tests (<30 min)

**Purpose**: Important feature coverage

- [ ] AI difficulties (E2E, 3min)
- [ ] Menu navigation (E2E, 2min)
- [ ] Car physics (Unit, 2min)

**Total**: 17 scenarios

### P2/P3 Tests (<60 min)

**Purpose**: Full regression coverage

- [ ] Demo mode (E2E, 2min)
- [ ] Audio system (Unit, 1min)
- [ ] Camera views (Unit, 1min)

**Total**: 8 scenarios

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Hours/Test | Total Hours | Notes |
|----------|-------|------------|-------------|-------|
| P0 | 7 | 3.0 | ~21 | Complex physics, E2E setup |
| P1 | 17 | 1.5 | ~26 | Standard coverage |
| P2 | 8 | 1.0 | ~8 | Simple scenarios |
| **Total** | **32** | **-** | **~55** | **~7-11 days** |

### Prerequisites

**Test Data:**

- Car config fixtures (4 cars × parameters)
- Track config fixtures (6 tracks × parameters)
- AI difficulty profiles (4 levels)

**Tooling:**

- Vitest for unit tests
- Playwright for E2E tests
- Vite dev server for test environment

**Environment:**

- Browser (Chrome for primary E2E)
- Gamepad (optional, for gamepad tests)

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions)
- **P1 pass rate**: ≥95% (waivers required for failures)
- **P2 pass rate**: ≥90% (informational)
- **High-risk mitigations**: 100% complete or approved waivers

### Coverage Targets

- **Critical paths**: ≥80%
- **Business logic**: ≥70%
- **Edge cases**: ≥50%

### Non-Negotiable Requirements

- [ ] All P0 tests pass
- [ ] No high-risk (≥6) items unmitigated
- [ ] Performance targets met (PERF category)
- [ ] Planned NFR evidence exists

---

## Mitigation Plans

### R1: Physics NaN causes game crash (Score: 6)

**Mitigation Strategy:** Unit test NaN guard with edge cases (airborne, collision explosion, invalid inputs). Verify position/velocity reset to safe defaults.
**Owner:** Dev
**Timeline:** Sprint 1
**Status:** Planned
**Verification:** Unit tests pass for NaN edge cases

### R2: 60 FPS target missed on mid-range hardware (Score: 6)

**Mitigation Strategy:** Performance benchmarks during race scenarios. Profile draw calls, triangle count, texture memory. Optimize scene complexity.
**Owner:** Dev
**Timeline:** Sprint 1
**Status:** Planned
**Verification:** FPS metrics meet 60 FPS target

### R3: Draw calls exceed 200 limit (Score: 6)

**Mitigation Strategy:** Scene complexity audits. Use instancing for repeated objects (barriers, decorations). Monitor draw call count in debug mode.
**Owner:** Dev
**Timeline:** Sprint 1
**Status:** Planned
**Verification:** Draw call count < 200 in complex scenes

---

## Assumptions and Dependencies

### Assumptions

1. Vitest is the unit test framework (already configured)
2. Playwright will be used for E2E tests
3. Browser testing targets Chrome primarily
4. Gamepad testing is optional (manual if needed)

### Dependencies

1. Vitest configuration - Required before unit tests
2. Playwright setup - Required before E2E tests
3. Vite dev server - Required for E2E test environment

### Risks to Plan

- **Risk**: Playwright WebGL support may be limited
  - **Impact**: E2E tests may not render 3D scenes correctly
  - **Contingency**: Focus on unit tests for physics/logic, manual E2E for visual

---

## Follow-on Workflows (Manual)

- Run `*atdd` to generate failing P0 tests (separate workflow; not auto-run).
- Run `*automate` for broader coverage once implementation exists.

---

## Appendix

### Knowledge Base References

- `risk-governance.md` - Risk classification framework
- `probability-impact.md` - Risk scoring methodology
- `test-levels-framework.md` - Test level selection
- `test-priorities-matrix.md` - P0-P3 prioritization

### Related Documents

- Epic: `_bmad-output/planning-artifacts/epics.md`
- Sprint Status: `_bmad-output/implementation-artifacts/sprint-status.yaml`

---

**Generated by**: BMad TEA Agent - Test Architect Module
**Workflow**: `bmad-testarch-test-design`
**Version**: 4.0 (BMad v6)
