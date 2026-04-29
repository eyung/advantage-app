# Research: Equipment Expansion

## 1. Resistance Band Weight Representation

**Decision**: Map categorical levels to numeric kg equivalents for internal weight display: Light→5 kg, Medium→15 kg, Heavy→30 kg, Extra-Heavy→50 kg. Display suffix "(band)" distinguishes from dumbbell weights.

**Rationale**: The existing `assignWeight(exercise, availableWeights[])` function takes a numeric array and applies the BANDS fraction table. By converting band levels to this array, the same function handles band weight selection without modification. The kg values are display hints only (per spec assumption §Assumptions), not physiological targets.

**Alternatives considered**:
- Separate band weight selector function — rejected (duplication; BANDS table already encodes muscle-group-appropriate fractions)
- Storing only the categorical label in PlannedExercise — rejected (breaks the existing numeric `weightKg` contract on PlannedExercise; UI would need special-casing everywhere)

## 2. Kettlebell Weight Assignment

**Decision**: Reuse `assignWeight(exercise, profile.kettlebellWeights)` exactly as dumbbells. The `BANDS` fraction table applies identically since kettlebell exercises target the same muscle groups.

**Rationale**: Kettlebells are numeric kg (same model as dumbbells per spec). The `assignWeight` function is equipment-agnostic — it only cares about the weight array and muscle group. No changes required.

**Alternatives considered**: None — the symmetry with dumbbells is explicit in the spec.

## 3. Equipment Filter in `buildEligiblePool`

**Decision**: Add `availableEquipmentTypes: EquipmentType[]` parameter to `buildEligiblePool`. Inside: build a `Set<Exercise['equipment']>` from the parameter. Bodyweight is always in the set. Filter condition: `e.equipment === 'bodyweight' || equipmentSet.has(e.equipment)`.

**Mapping** (`EquipmentType` → `Exercise['equipment']`):
- `'dumbbells'` → `'dumbbell'`
- `'resistance-bands'` → `'resistance-band'`
- `'kettlebells'` → `'kettlebell'`
- `'bodyweight'` → always present (cannot be deselected)

**Rationale**: This is a pure additive constraint alongside the existing `excludedExerciseIds` and `blockedCategories` filters. The overflow fallback (fill empty buckets from non-empty ones) remains unchanged — if a category has no eligible exercises after equipment filtering, it uses the overflow pool (which may still have bodyweight exercises).

## 4. Aesthetics Day Guarantee

**Decision**: After `buildTrainingDayFromPool` produces the 5-exercise plan for a day, apply a post-process if the day is in `profile.aestheticsDays`:
1. Check if any `plannedExercise.exerciseId` maps to an exercise with `goalTags.includes('aesthetics')`.
2. If none do, collect all aesthetics-tagged exercises from the eligible pool (across all categories).
3. Seed a PRNG with `(configVersion * 10000 + weekNum * 100 + dayIndex * 10)` and pick one.
4. Swap the last slot with this exercise.

**Rationale**: Separating the guarantee from the selection loop keeps `buildTrainingDayFromPool` simple. The swap only fires when needed. The dedicated seed formula ensures the swap is deterministic without interfering with the main day PRNG stream.

**Alternative rejected**: Reserving a fixed "aesthetics slot" in the category order — would break the existing category-rotation logic and force aesthetics exercises into one category.

## 5. Session Equipment Availability — Daily Reset Pattern

**Decision**: `sessionEquipmentStore` stores `{ availableTypes: EquipmentType[], date: string }` in `advantage_session_equipment`. A `getAvailable(defaultTypes: EquipmentType[]): EquipmentType[]` selector compares `date` to `todayISO()`: if stale, returns `defaultTypes` (and resets the stored value); otherwise returns `availableTypes`.

**Rationale**: This implements the spec requirement "Per-session availability resets to default on each new day" without a background timer. The check is lazy (on-read), which is safe for a single-user browser app — the user cannot be mid-session across a calendar day boundary in a meaningful way.

**Alternatives considered**:
- React `useEffect` with a daily-reset timer — over-engineered for a single-user SPA; unnecessary complexity
- Storing session availability in component state only — would lose the selection if the user navigates away

## 6. `CustomExercise` — Aesthetics Tag Only

**Decision**: Add `goalTags?: ('aesthetics')[]` to `CustomExercise`. `addCustomExercise` gains an optional `goalTags` parameter. No new equipment types for custom exercises.

**Rationale**: Spec assumption explicitly limits the custom exercise form change to an aesthetics checkbox. Allowing custom band/kettlebell exercises would require the session equipment filter to also check profile ownership (does the user have bands configured?), adding complexity that the spec defers.

## 7. Schema Migration v3

**Decision**: Migration step v3 updates the persisted `EquipmentProfile` in `advantage_equipment` to add missing fields: `resistanceBandLevels: []`, `kettlebellWeights: []`, `aestheticsDays: []`, `defaultEquipmentTypes: ['dumbbells', 'bodyweight']`. Also initialises `advantage_session_equipment` if absent.

**Rationale**: Non-destructive migration preserves existing user weights and training days. The defaults give existing users the pre-feature behavior (dumbbell + bodyweight only) without requiring reconfiguration.
