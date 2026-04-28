# Research: Exercise Customisation

**Feature**: 004-exercise-customisation  
**Date**: 2026-04-28

## Decision Log

### R-001: Plan Storage — Persist vs. Recompute

**Decision**: Persist the weekly plan in a new Zustand `planStore` under `advantage_plan`.

**Rationale**: The existing plan is recomputed from a deterministic seed on every render — this is fine as long as the plan never changes mid-week. Once we support selective regeneration (incomplete days only), we must remember which days have already been completed so we can freeze those day plans. Without persisting the plan, a refresh would recompute the entire week from scratch and show different exercises for completed days — violating FR-005 (completed days unchanged) and SC-004 (100% preservation guarantee). Persisting the plan is the only correct approach.

**Alternatives considered**:
- *Derive frozen days from completions only*: Would require mapping exerciseIds back to their original DayOfWeek position — fragile when exercises are reordered by the plan generator.
- *Add "frozen" flag to completion records*: Adds complexity to completionStore without clean separation.

---

### R-002: PRNG Isolation for Partial Regeneration

**Decision**: Partial-regen slots use a dedicated seed formula: `customisationVersion * 100000 + dayIndex * 1000 + slotIndex`. This is independent of the full-week seed.

**Rationale**: The existing Mulberry32 PRNG generates the full week as a single sequential stream. Re-entering this stream at a mid-point to generate only specific slots would require advancing through preceding calls first — coupling the regeneration to the exact original call order. A slot-indexed seed produces deterministic picks per slot per `customisationVersion` without coupling. The trade-off: partial-regen picks are different from what full-regen would have chosen for the same slot, but this is acceptable since the user explicitly changed the eligible pool.

**Alternatives considered**:
- *Replay full PRNG stream, extract specific positions*: Correct but tightly coupled to generator internals; breaks if the plan structure changes.
- *Non-deterministic (Math.random)*: Rejected — existing app is deterministic by design.

---

### R-003: Custom Exercise Weight Assignment

**Decision**: Reuse `weightAssigner.ts` unchanged. Custom exercises receive default `equipment: 'dumbbell'` and a category-derived `primaryMuscleGroup` (see plan.md Decision 3 table). This means custom exercises get a weight assigned exactly like built-in exercises.

**Rationale**: `assignWeight(exercise, availableWeights)` only needs `exercise.equipment` and `exercise.primaryMuscleGroup` — both provided via category defaults. Zero changes to weightAssigner.ts. Zero UI needed for weight configuration.

**Alternatives considered**:
- *Let user set weight fraction*: Adds complexity, violates Principle V (simplicity over completeness).
- *Always bodyweight for custom exercises*: Misses dumbbell exercises that users most want to add.

---

### R-004: Eligible Pool Construction Order

**Decision**: Pool is built at plan-generation time, not stored. Order of filtering:
1. Merge built-in exercises + custom exercises into a single array via `getExerciseLibrary(customExercises)`.
2. Remove exercises whose IDs are in `excludedExerciseIds`.
3. Remove exercises whose categories are in `blockedCategories`.
4. Split remaining into per-category buckets.
5. For any category slot where its bucket is empty: pull from the "overflow" bucket = union of all non-empty non-blocked categories.

**Rationale**: The pool is small (≤ 50 built-in + N custom) — filtering on every generation is negligible cost. Storing the pool would create a derived-state caching problem.

---

### R-005: Zustand Store Pattern for New Stores

**Decision**: Both `customisationStore` and `planStore` follow the exact same pattern as `equipmentStore` and `completionStore`: `create<State>()(persist(fn, { name: 'advantage_key' }))`.

**Rationale**: Consistency with existing patterns. No new abstractions needed. Zustand 5's `persist` middleware handles serialisation and hydration automatically.

---

### R-006: Duplicate Exercise Name Validation

**Decision**: Case-insensitive string comparison against the full exercise library (built-in + existing custom) filtered to the same category. Applied at form submission time, not on keystroke.

**Rationale**: Prevents silent duplicates in the eligible pool, which could skew PRNG picks. Per-category scope means "Goblet Squat" in `general-strength` and "Goblet Squat" in `shoulder-stability` are treated as different (unusual but valid). Case-insensitive to prevent trivial bypasses.

---

### R-007: Schema Version Bump

**Decision**: `SCHEMA_VERSION` bumped from `1` to `2`. Migration v2 adds an empty `advantage_customisation` entry. Migration is non-destructive — existing equipment and completion data is unchanged.

**Rationale**: Constitution §Offline-First requires a migration helper whenever the localStorage schema changes. The new `advantage_plan` key is omitted from migration because an absent plan triggers fresh generation on first render — no data loss.
