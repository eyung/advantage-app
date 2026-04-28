# Feature Specification: Exercise Customisation

**Feature Branch**: `004-exercise-customisation`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: User description: "Exercise customisation: per-exercise disable toggle, per-category blocks, add custom exercises (name + category), inline card quick-exclude, fill empty category slots from unblocked pool, regenerate only incomplete days when exclusions change"

## Clarifications

### Session 2026-04-28

- Q: What granularity of exercise exclusion is needed? → A: Both per-exercise toggle AND per-category block (D)
- Q: What information is required to define a custom exercise? → A: Name + category only; sets/reps assigned using existing defaults (B)
- Q: When the user changes exclusions, what portion of the plan regenerates? → A: Only incomplete (not-yet-done) days are regenerated (C)
- Q: Where does the user access exercise management controls? → A: Inline quick-exclude on exercise cards + full management in Settings (D)
- Q: When exclusions thin a category below required slots, how does the plan fill gaps? → A: Pull replacement from another non-blocked category (B)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Per-Exercise Disable & Inline Quick-Exclude (Priority: P1)

The user is doing a workout and realises an exercise aggravates an injury or they simply can't do it today. They tap a quick-exclude button on the exercise card to remove it from future generated plans. The exercise card shows the exclusion state immediately. Excluded exercises also appear in Settings where the user can re-enable them.

**Why this priority**: The most common customisation need is removing an exercise that doesn't suit the user. Inline access on the card is the fastest path and delivers immediate value without any navigation overhead.

**Independent Test**: Mark any exercise card as excluded; verify the card shows its excluded state; regenerate the plan (or trigger day regeneration); confirm excluded exercise does not appear in any future incomplete day. Re-enable in Settings; confirm exercise returns on subsequent regeneration.

**Acceptance Scenarios**:

1. **Given** an exercise card is visible on the Today tab, **When** the user taps the quick-exclude action, **Then** the card updates visually to indicate it is excluded and the exercise is persisted in the exclusion list.
2. **Given** an exercise is in the exclusion list, **When** the plan regenerates incomplete days, **Then** the excluded exercise does not appear in any regenerated day.
3. **Given** one or more exercises are excluded, **When** the user opens Settings → Exercise Management, **Then** they see the full list of excluded exercises with toggle controls to re-enable them.
4. **Given** a previously excluded exercise is re-enabled in Settings, **When** the plan next regenerates an incomplete day, **Then** the exercise becomes eligible to appear again.

---

### User Story 2 - Per-Category Block (Priority: P2)

The user wants to skip an entire category of exercises (e.g., "Legs" after a knee injury). They open Settings → Exercise Management and toggle off the entire "Legs" category. All exercises in that category are treated as excluded in bulk. Future plan regeneration for incomplete days pulls replacement exercises from other non-blocked categories to fill any gaps.

**Why this priority**: Category-level blocks save time compared to disabling exercises one by one. Valuable when a whole muscle group is unavailable (injury, equipment missing, preference).

**Independent Test**: Block an entire category; regenerate a day that previously contained exercises from that category; confirm zero exercises from the blocked category appear; confirm total exercise count per day is preserved by replacements from other categories.

**Acceptance Scenarios**:

1. **Given** the user opens Exercise Management in Settings, **When** they toggle off an entire category, **Then** all exercises in that category are marked as excluded and the category block state is persisted.
2. **Given** a category is blocked and a day has incomplete exercises from that category, **When** the day regenerates, **Then** no blocked-category exercises appear; replacement exercises are drawn from non-blocked categories.
3. **Given** a category is blocked, **When** the user toggles it back on, **Then** all exercises in that category become eligible again for future regenerations.
4. **Given** all categories except one are blocked and a day must be filled, **When** the day regenerates, **Then** the plan fills slots from the only non-blocked category (even if that means repeating exercises across slots).

---

### User Story 3 - Add Custom Exercises (Priority: P3)

The user wants to add a new exercise not in the default library — for example, "Bulgarian Split Squat". They open Settings → Exercise Management, tap "Add exercise", enter a name and select a category. The custom exercise is saved and immediately eligible to appear in future incomplete-day regenerations alongside the built-in library.

**Why this priority**: Custom exercises extend the library without requiring a product update. They use existing weight-assignment and sets/reps defaults so no extra configuration is needed.

**Independent Test**: Add a custom exercise with a name and a category; trigger plan regeneration for an incomplete day; confirm the custom exercise can appear in generated workouts. Delete the custom exercise; confirm it no longer appears.

**Acceptance Scenarios**:

1. **Given** the user is on the Add Exercise screen, **When** they enter a name and select a category and confirm, **Then** the custom exercise is saved and appears in the exercise library alongside built-in exercises.
2. **Given** a custom exercise exists, **When** the plan regenerates an incomplete day, **Then** the custom exercise is eligible to be selected (subject to normal category and exclusion rules).
3. **Given** a custom exercise exists, **When** the user deletes it from Exercise Management, **Then** it is removed from the library and future regenerations.
4. **Given** the user attempts to add a custom exercise with an empty name, **When** they confirm, **Then** the form rejects the submission with a validation message.

---

### User Story 4 - Regenerate Only Incomplete Days (Priority: P4)

When the user's exclusion list changes (via inline quick-exclude or Settings), only the days in the current week that have not yet been completed are regenerated. Days that are fully completed are preserved exactly as logged.

**Why this priority**: Protecting completed workout history is a core trust concern. Users should never see a day they already finished change retroactively. This story defines the scope and safety of plan regeneration.

**Independent Test**: Complete Monday's workout; exclude an exercise; confirm Monday's completed workout log is unchanged; confirm other incomplete days are regenerated to respect the exclusion.

**Acceptance Scenarios**:

1. **Given** Monday is fully completed and Tuesday is not, **When** an exclusion changes, **Then** Monday's plan and completion log remain unchanged; Tuesday's plan is regenerated without the excluded exercise.
2. **Given** all days in the week are completed, **When** an exclusion changes, **Then** no day is regenerated; the exclusion takes effect starting from the next week's plan.
3. **Given** a day is partially completed (some exercises done, some not), **When** an exclusion changes, **Then** the completed exercises in that day remain; only the remaining incomplete portion is regenerated.

---

### Edge Cases

- What happens when every exercise in the library is excluded? The plan generator displays an error/empty-state message and does not crash; it prompts the user to re-enable at least one category.
- What happens when a custom exercise is excluded? It follows the same exclusion rules as built-in exercises.
- What happens when the same exercise name is added twice as a custom exercise? The system prevents duplicates (case-insensitive match against existing names in the same category) and shows a validation message.
- How does the system handle a partially completed day when only some incomplete slots need new exercises? Completed exercises are locked; only unfilled slots are drawn from the eligible pool.
- What happens when a replacement exercise from another category cannot be found (e.g., all other categories are also blocked)? The plan inserts a rest placeholder for that slot and notifies the user that no eligible exercise could be placed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to exclude individual exercises via an inline action directly on the exercise card without navigating away from the workout view.
- **FR-002**: Users MUST be able to re-enable excluded exercises from the Exercise Management section in Settings.
- **FR-003**: Users MUST be able to block an entire exercise category from the Exercise Management section in Settings, which excludes all exercises in that category in bulk.
- **FR-004**: Users MUST be able to unblock a category from Settings, restoring all exercises in that category to eligible status.
- **FR-005**: When exclusions change, the plan generator MUST regenerate only days in the current week that are not fully completed; fully completed days MUST remain unchanged.
- **FR-006**: A partially completed day MUST preserve completed exercises and regenerate only the incomplete slots.
- **FR-007**: When a regenerated day's exercise slot cannot be filled from the user's expected category (because all exercises in that category are excluded), the generator MUST substitute an exercise from another non-blocked category.
- **FR-008**: If no eligible exercise can be found for a slot across all non-blocked categories, the generator MUST insert a "no exercise available" placeholder for that slot and surface a notification to the user.
- **FR-009**: Users MUST be able to add a custom exercise by providing a name and selecting a category; sets, reps, and weight MUST be assigned using the same defaults as built-in exercises.
- **FR-010**: Custom exercises MUST be immediately eligible to appear in plan regenerations for incomplete days.
- **FR-011**: Users MUST be able to delete custom exercises from Exercise Management; deleted exercises MUST not appear in future regenerations.
- **FR-012**: The system MUST prevent adding a custom exercise with a blank name.
- **FR-013**: The system MUST prevent adding a custom exercise with a name that duplicates an existing exercise in the same category (case-insensitive).
- **FR-014**: Exclusion state (per-exercise toggles, category blocks) and custom exercises MUST be persisted in localStorage so they survive app restart.

### Key Entities

- **ExerciseExclusion**: A record that marks a built-in or custom exercise as excluded; contains the exercise identifier and the timestamp of exclusion.
- **CategoryBlock**: A record that marks an entire category as blocked; contains the category identifier.
- **CustomExercise**: A user-defined exercise with a name, a category, and a unique identifier; reuses existing sets/reps/weight-assignment logic.
- **ExerciseLibrary**: The combined pool of built-in exercises plus custom exercises, minus any excluded or blocked entries, used by the plan generator.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can exclude an exercise from an inline card action in 2 taps or fewer.
- **SC-002**: After any exclusion or block change, the regenerated plan for incomplete days is displayed within the same time the original plan generation takes (no perceptible additional delay).
- **SC-003**: Adding a custom exercise (name + category selection + confirm) completes in under 60 seconds on first use.
- **SC-004**: Completed workout logs remain unchanged after exclusion changes in 100% of cases (zero retroactive modification of completed days).
- **SC-005**: The plan fills exercise slots from non-blocked categories in all cases where at least one non-blocked exercise exists in the library.
- **SC-006**: All exclusion, block, and custom-exercise data survives an app restart without loss.

## Assumptions

- Existing sets/reps defaults and weight-assignment logic (weightAssigner.ts) are reused unchanged for custom exercises; no new weight-configuration UI is needed.
- The plan generator already supports seeded randomisation (Mulberry32 PRNG); regenerating only incomplete days means re-running generation with the same seed but filtering the eligible exercise pool.
- "Completed" means all exercises in a day have been marked done via the existing completion toggle; a day with zero completions is treated as incomplete.
- Custom exercises live in localStorage under the existing `advantage-equipment` store schema extension or a new key; no backend migration is needed.
- The exclusion and block state is global (not per-week); changes apply to all future regenerations.
- The inline quick-exclude action on an exercise card is a secondary action (not the primary complete/undo button) to avoid accidental activation.
- Category identifiers used for blocking match the existing category labels in exercises.ts (e.g., "Strength", "Cardio", "Mobility", "Core", "Power").
