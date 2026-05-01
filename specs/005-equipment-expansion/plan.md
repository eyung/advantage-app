# Implementation Plan: Equipment Expansion

**Branch**: `005-equipment-expansion` | **Date**: 2026-04-30 | **Spec**: `specs/005-equipment-expansion/spec.md`
**Input**: Feature specification from `specs/005-equipment-expansion/spec.md`

## Summary

Extend the built-in exercise library with resistance bands and kettlebell exercises, add a body aesthetics day system, enable per-session equipment availability, and correct a structural imbalance in the exercise library (vertical pulls were entirely absent). New engine behaviours added in this feature: a soft pull-preference selection bias (FR-017), a consecutive-day muscle group guard (FR-018), and a `getSessionSummary` selector for Phase 2 adaptive scheduling (FR-019). Core equipment features (bands, kettlebells, aesthetics days, session equipment bar) were shipped in the initial branch commit; this plan covers the remaining delta work from the clarification session.

---

## Technical Context

**Language/Version**: TypeScript 5.6 / React 18 (browser SPA)
**Primary Dependencies**: Zustand 4 (persist middleware), Vite 5, Vitest 2
**Storage**: `localStorage` only — `SCHEMA_VERSION` currently `3`; no bump required (session history derived from existing completions, no new key)
**Testing**: Vitest — `npm test` runs all tests once; `npm run test:watch` for watch mode
**Target Platform**: Static SPA (Vercel / GitHub Pages / `npm run dev` locally)
**Project Type**: Mobile-first single-page React application
**Performance Goals**: Plan generation < 50 ms; exercise selection UI < 16 ms frame budget
**Constraints**: Offline-only (no network calls); localStorage schema migrations required when new keys are added; seeded RNG must remain deterministic (same seed → same plan)
**Scale/Scope**: Single user; ~80 exercises post-expansion; 3–6 training days per week

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. User-First, Tennis-Performance-Led | ✅ Pass | All new exercises serve tennis performance or explicitly approved secondary goals (aesthetics). Pull exercises directly improve shoulder health for tennis players. |
| II. Offline-First, Zero Backend | ✅ Pass | All changes are localStorage-only. Session history derived from existing completions — no new network calls or remote keys. |
| III. Sensible Defaults, Optional Configuration | ✅ Pass | Pull bias and consecutive-day guard are silent engine behaviours — zero new user-facing configuration required. |
| IV. Visible Progress | ✅ Pass | `getSessionSummary` enables future progress views. No regression in existing `ProgressView`. |
| V. Simplicity Over Completeness | ⚠️ Justified | Adding `movementPattern` to the `Exercise` type touches all 72 existing exercises. Justified: only correct way to implement engine bias without brittle hardcoded ID lists. See Complexity Tracking below. |

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| New required field on all 72 `Exercise` objects (`movementPattern`) | Engine needs movement pattern to implement pull-preference bias (FR-017) and consecutive-day guard (FR-018) | Hardcoded pull exercise ID lists break silently as exercises are added or renamed |
| `getSessionSummary` selector in `completionStore` | FR-019 requires session-level muscle group data; needed as Phase 2 data foundation | A dedicated new store and localStorage key would add schema complexity with no Phase 1 benefit — derivation from existing completions is sufficient |

---

## Project Structure

### Documentation (this feature)

```text
specs/005-equipment-expansion/
├── plan.md              # This file
├── research.md          # Phase 0: movement pattern taxonomy, pull exercise list, algorithm designs
├── data-model.md        # Phase 1: updated Exercise interface, SessionSummary type, engine API
├── contracts/
│   └── exercise-interface.md   # Updated Exercise interface contract
└── tasks.md             # Phase 2 output (/speckit-tasks — not yet generated)
```

### Source Code (repository root)

```text
src/
├── types.ts                         # + MovementPattern type; + movementPattern field on Exercise; + SessionSummary type
├── data/
│   └── exercises.ts                 # Tag all 72 exercises with movementPattern; add 7 new pull exercises
├── engine/
│   └── planGenerator.ts             # + pull-preference bias in buildTrainingDayFromPool;
│                                    #   + consecutive-day guard in generateWeeklyPlan
├── store/
│   └── completionStore.ts           # + getSessionSummary(date) selector
└── utils/
    └── storage.ts                   # No change (SCHEMA_VERSION stays at 3)

tests/
└── engine/
    ├── planGenerator.test.ts        # + pull-bias tests; + consecutive-day guard tests
    └── pullBalance.test.ts          # New: statistical test for SC-007 (≥80% plans meet pull ≥ push)
```

> Files already implemented on this branch (no further changes required): `SessionEquipmentBar.tsx`, `ResistanceBandInput.tsx`, `KettlebellInput.tsx`, `AestheticsDaySelector.tsx`, `equipmentStore.ts`, `sessionEquipmentStore.ts`, `migration.ts` (v3), `planStore.ts`.

---

## Implementation Phases

### Phase 0 → research.md ✅

See `specs/005-equipment-expansion/research.md` for:
- Movement pattern taxonomy for all 72 existing exercises
- 7 new pull exercises with complete field definitions
- Pull-preference bias algorithm design
- Consecutive-day guard algorithm design
- Session summary derivation approach

### Phase 1 → data-model.md, contracts/ ✅

See `specs/005-equipment-expansion/data-model.md` and `specs/005-equipment-expansion/contracts/exercise-interface.md` for:
- Updated `Exercise` interface with `movementPattern`
- `MovementPattern` union type
- `SessionSummary` derived type
- Updated public signatures for `buildEligiblePool`, `buildTrainingDayFromPool`, `generateWeeklyPlan`

### Phase 2 → tasks.md (pending `/speckit-tasks`)

Implementation tasks to be broken down:

1. **T1** — Add `MovementPattern` type and `movementPattern` field to `Exercise` in `types.ts`
2. **T2** — Tag all 72 existing exercises in `exercises.ts` with `movementPattern`
3. **T3** — Add 7 new pull exercises to `exercises.ts` (see `research.md` for definitions)
4. **T4** — Add `SessionSummary` type and `getSessionSummary(date)` to `completionStore.ts` (FR-019)
5. **T5** — Implement pull-preference bias in `buildTrainingDayFromPool` (FR-017)
6. **T6** — Implement consecutive-day muscle group guard in `generateWeeklyPlan` (FR-018)
7. **T7** — Write Vitest tests for pull bias, consecutive-day guard, and session summary
8. **T8** — Browser smoke-test: verify plans are balanced; verify no consecutive same-muscle-group days

---

## Acceptance Validation Checklist

- [ ] SC-007: Pull count ≥ push count in ≥ 80% of 10 sampled plans (full equipment pool)
- [ ] SC-008: Consecutive training days have different dominant muscle groups in 100% of generated plans
- [ ] SC-009: `getSessionSummary(date)` returns non-empty result after marking exercises complete on that date
- [ ] FR-008: At least 7 new pull exercises visible in Exercise Management (Band Lat Pulldown, Band Straight-Arm Pulldown, Inverted Row, Dumbbell Bent-Over Row, KB Single-Arm Row, Band Seated Row, Dumbbell Chest-Supported Row)
- [ ] FR-017: Pull bias does not cause plan generation to fail on bands-only equipment pool
- [ ] FR-018: Guard gracefully falls back to full pool when no non-conflicting exercises exist
