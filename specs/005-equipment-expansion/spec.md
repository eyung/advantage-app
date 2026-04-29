# Feature Specification: Equipment Expansion

**Feature Branch**: `005-equipment-expansion`
**Created**: 2026-04-29
**Status**: Draft
**Input**: User description: "Equipment expansion — add resistance bands and kettlebells to workout routines; aesthetics-tagged exercises; per-session equipment availability; ~20 new built-in exercises; tennis, general health, and body aesthetics as primary goals."

## Clarifications

### Session 2026-04-29

- Q: Which equipment types beyond dumbbells should be supported? → A: Resistance bands + kettlebells
- Q: How should resistance band strength be represented? → A: Categorical levels: Light / Medium / Heavy / Extra-Heavy
- Q: Should new exercises be built-in or user-created? → A: ~10–12 built-in exercises for each equipment type; custom system remains available
- Q: How should the body aesthetics goal manifest? → A: Secondary "aesthetics" tag on exercises; plan incorporates tagged exercises on user-configured days
- Q: How should the plan mix multiple equipment types? → A: User marks which equipment is available per session (or sets a default); plan uses only available equipment for that day

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Configure Equipment Profile (Priority: P1)

The user opens the Setup Wizard or Settings and adds resistance bands and/or a kettlebell to their equipment profile. They select their band resistance level(s) (Light, Medium, Heavy, Extra-Heavy) and enter their kettlebell weight(s) in kg. The app immediately makes exercises requiring those equipment types eligible for future plan generation.

**Why this priority**: Equipment configuration is the foundation. Without it, no band or kettlebell exercises can appear in plans. This also unblocks all downstream stories.

**Independent Test**: Add a Medium resistance band and a 16 kg kettlebell in Settings. Open Today's workout. Confirm exercises using resistance bands and/or kettlebells can now appear in the generated plan.

**Acceptance Scenarios**:

1. **Given** the user has only dumbbells configured, **When** they add a "Heavy" resistance band in Settings, **Then** resistance band exercises become eligible for inclusion in future plan regenerations.
2. **Given** the user adds a 16 kg kettlebell, **When** the plan regenerates, **Then** kettlebell exercises may appear with weight shown as "16 kg".
3. **Given** the user owns multiple band levels (e.g., Light and Heavy), **When** the plan assigns a band exercise, **Then** the appropriate resistance level is shown based on the same muscle-group weight-assignment logic used for dumbbells.
4. **Given** the user removes a band level from their profile, **When** the plan regenerates, **Then** exercises requiring that band level no longer appear.

---

### User Story 2 — Per-Session Equipment Availability (Priority: P2)

Before starting a workout, the user can indicate which equipment they have available today (e.g., bands only during travel, full kit at home). The plan generator uses only the available equipment pool for that session. A saved default reduces friction on typical days.

**Why this priority**: Users don't always train with all their equipment. Without per-session availability, the plan might show kettlebell exercises on a travel day when only bands are packed. This story makes the plan reliably usable in real-life scenarios.

**Independent Test**: Set default equipment as "Dumbbells + Bands". On one session, switch availability to "Bands only". Confirm the generated plan for that session contains zero dumbbell and zero kettlebell exercises. Switch back to default; confirm all equipment types are eligible again.

**Acceptance Scenarios**:

1. **Given** the user has dumbbells, bands, and a kettlebell configured, **When** they set today's availability to "Bands only", **Then** only band exercises appear in today's plan.
2. **Given** the user has set a default equipment mix, **When** they open the app without changing availability, **Then** the default mix is used without requiring any action.
3. **Given** "Bands only" is selected and the plan has no eligible band exercises for a category, **Then** the plan falls back to bodyweight exercises for that slot (not exercises requiring unavailable equipment).
4. **Given** the user saves a new default mix, **When** they reopen the app, **Then** the saved default persists across sessions.

---

### User Story 3 — Body Aesthetics Training Days (Priority: P3)

The user opts in to aesthetics-focused training on designated days. On those days, the plan draws exercises tagged with an "aesthetics" secondary goal in addition to (or instead of) tennis-performance exercises. The user can configure which training days include aesthetics exercises.

**Why this priority**: Aesthetics is a secondary goal layered on top of tennis performance — it should not displace the primary categories but should appear on days the user designates. This keeps the app's tennis focus intact while expanding appeal.

**Independent Test**: Enable aesthetics training for Wednesday. Open Wednesday's plan. Confirm at least one exercise in the plan is tagged as an aesthetics exercise. Open Monday's plan (aesthetics not enabled). Confirm no aesthetics-only exercises appear.

**Acceptance Scenarios**:

1. **Given** the user enables aesthetics training for a specific day, **When** the plan generates for that day, **Then** one or more aesthetics-tagged exercises appear in the plan.
2. **Given** a training day does not have aesthetics enabled, **When** the plan generates, **Then** no aesthetics-only exercises appear on that day.
3. **Given** an aesthetics-tagged exercise also belongs to a standard tennis category, **When** aesthetics is disabled for a day, **Then** the exercise may still appear if selected for its tennis category.
4. **Given** the user disables aesthetics for all days, **When** the plan regenerates, **Then** the app behaves identically to the pre-aesthetics state.

---

### User Story 4 — New Built-In Exercise Library (Priority: P4)

The app ships with approximately 10–12 new built-in exercises for resistance bands and approximately 10–12 for kettlebells, distributed across the existing 5 tennis-performance categories. Each new exercise is tagged with relevant secondary goals (e.g., "aesthetics" for isolation/hypertrophy exercises, none for pure tennis-performance exercises).

**Why this priority**: Without new built-in exercises, adding band and kettlebell equipment yields no new workouts. This story delivers the actual content that makes equipment expansion valuable.

**Independent Test**: Configure a resistance band profile. Confirm at least one band exercise appears in a generated plan without the user having created any custom exercises. Repeat for kettlebell.

**Acceptance Scenarios**:

1. **Given** the user configures any resistance band level, **When** the plan generates, **Then** at least one built-in band exercise is eligible to appear.
2. **Given** the user configures a kettlebell weight, **When** the plan generates, **Then** at least one built-in kettlebell exercise is eligible to appear.
3. **Given** the user views Exercise Management, **Then** all built-in band and kettlebell exercises are visible in their respective category sections alongside existing exercises.
4. **Given** a band or kettlebell exercise is listed in Exercise Management, **Then** it can be individually excluded or included using the same controls as existing exercises.

---

### Edge Cases

- What happens when the user enables "Bands only" but has not added any bands to their profile? → Show a prompt explaining that no bands are configured and fall back to bodyweight for all slots.
- What happens when all equipment for a session is set to unavailable? → Same empty-pool warning as the existing exclusion system; plan falls back to bodyweight-only.
- What happens when a kettlebell exercise is generated but the user has no kettlebell weight configured? → Treat as ineligible; do not include in plan (same as an excluded exercise).
- What happens when an aesthetics-tagged exercise is also in the exclusion list? → Exclusion takes precedence; it does not appear regardless of aesthetics day status.
- What if the user adds a custom exercise and marks it as aesthetics? → Custom exercises can optionally be tagged as aesthetics at creation time; the plan respects this tag on aesthetics-enabled days.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to add resistance band levels (Light, Medium, Heavy, Extra-Heavy) to their equipment profile in Settings or the Setup Wizard.
- **FR-002**: Users MUST be able to add one or more kettlebell weights (in kg) to their equipment profile, using the same entry pattern as dumbbells.
- **FR-003**: The plan generator MUST select exercises compatible with the user's available equipment (resistance band levels and/or kettlebell weights) in addition to dumbbells and bodyweight.
- **FR-004**: Users MUST be able to mark which equipment is available for the current session (per-session availability) from a control accessible before or during a workout.
- **FR-005**: Users MUST be able to save a default equipment availability mix that applies automatically on future sessions without requiring manual selection.
- **FR-006**: The plan generator MUST use only exercises compatible with the session's available equipment; unavailable equipment types MUST be excluded from the eligible pool for that session.
- **FR-007**: When an equipment type is set as unavailable and no eligible exercises remain for a category slot, the plan MUST fall back to bodyweight exercises for that slot.
- **FR-008**: The app MUST ship with approximately 10–12 new built-in resistance band exercises and approximately 10–12 new built-in kettlebell exercises, distributed across the existing 5 tennis-performance categories.
- **FR-009**: Each built-in exercise MUST carry a primary equipment tag (`resistance-band`, `kettlebell`, `dumbbell`, or `bodyweight`) and optionally a secondary goal tag (`aesthetics`).
- **FR-010**: Users MUST be able to designate specific training days as "aesthetics days" in Settings.
- **FR-011**: On aesthetics days, the plan MUST include at least one aesthetics-tagged exercise in the day's routine.
- **FR-012**: On non-aesthetics days, aesthetics-only exercises MUST NOT appear in the plan.
- **FR-013**: An exercise tagged as both a tennis category exercise and an aesthetics exercise MAY appear on non-aesthetics days if selected for its primary tennis category role.
- **FR-014**: All new built-in exercises MUST be visible in Exercise Management and subject to the same per-exercise exclude/include controls as existing exercises.
- **FR-015**: Custom exercises added by the user MUST support an optional "aesthetics" tag at creation time.
- **FR-016**: Equipment profile data (band levels, kettlebell weights) and aesthetics day configuration MUST be persisted in local storage and survive app restarts.

### Key Entities

- **ResistanceBandProfile**: The set of resistance band levels the user owns; values are a subset of `{Light, Medium, Heavy, Extra-Heavy}`.
- **KettlebellProfile**: One or more kettlebell weights (numeric kg) owned by the user; same structure as the existing dumbbell weight array.
- **SessionEquipmentAvailability**: The equipment types available for the current session (`dumbbells`, `resistance-bands`, `kettlebells`, `bodyweight`); includes a saved default.
- **ExerciseGoalTag**: A secondary tag on an exercise indicating a non-primary goal; currently only `aesthetics` is defined; extensible for future goals.
- **AestheticsDayConfig**: The set of training days (by DayOfWeek) on which aesthetics exercises are included in the plan.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can add resistance bands or a kettlebell to their profile and have equipment-specific exercises appear in their plan within one plan regeneration cycle (no additional steps required).
- **SC-002**: Per-session equipment availability can be changed and applied to the current day's plan in 3 taps or fewer.
- **SC-003**: At least 20 new built-in exercises (across band and kettlebell) are available on first launch after the update, requiring zero custom exercise creation from the user.
- **SC-004**: On any aesthetics-enabled training day, at least 1 of the 5 planned exercises is aesthetics-tagged in 100% of plan generations.
- **SC-005**: Equipment profile data and aesthetics day preferences survive an app restart in 100% of cases.
- **SC-006**: When a user sets equipment availability to a single type (e.g., bands only), zero exercises requiring other equipment appear in that session's plan.

---

## Assumptions

- The existing dumbbell weight-assignment logic (`weightAssigner`) is reused for kettlebells (same numeric kg model). Resistance bands use a mapping from categorical level to approximate kg equivalent for internal weight-display purposes only.
- The four resistance band levels (Light / Medium / Heavy / Extra-Heavy) map approximately to 5 / 15 / 30 / 50 kg equivalent for weight-assignment calculations — these are display hints, not precise scientific values.
- "Aesthetics" is the only secondary goal tag introduced in this feature. Additional goal tags (e.g., "mobility", "recovery") are out of scope.
- Aesthetics-tagged exercises are a subset of the existing 5 categories — they are not a standalone 6th category. The category structure remains unchanged.
- Per-session equipment availability is stored ephemerally (reset to default on each new day) while the default preference is persisted.
- The custom exercise creation flow (from feature 004) is extended with an optional "aesthetics" checkbox — no other changes to that flow are required.
- All new built-in exercises follow the existing tennis-performance framing (they serve on-court performance, general health, or aesthetics goals that also support athleticism).
- Bodyweight is always considered "available" regardless of per-session availability settings — it requires no equipment and cannot be deselected.
