# Feature Specification: Dynamic Workout Engine — Dumbbell-Scaled Tennis Routines

**Feature Branch**: `002-dynamic-workout-engine`
**Created**: 2026-04-27
**Status**: Draft
**Input**: User description: Redesign Rally as a one-page app with auto-generated, dumbbell-scaled,
tennis-performance weekly routines with inline completion tracking

## User Scenarios & Testing *(mandatory)*

### User Story 1 — First-Time Setup: Define Equipment & Training Days (Priority: P1)

A new user opens the app and is guided to configure two things: (1) the set of dumbbell
weights they own (e.g. a pair of 10 kg, 15 kg, and 20 kg), and (2) how many training days
per week they want (3 to 6). Once saved, the app immediately generates a full weekly
routine using only the equipment they specified.

**Why this priority**: Without knowing available equipment and training frequency, the engine
cannot generate any routine. This is the entry gate to all other functionality.

**Independent Test**: Can be fully tested by opening the app fresh, entering dumbbells
[8 kg, 12 kg, 16 kg] and 4 training days, confirming the generated week shows exactly 4
active training days using only those weights.

**Acceptance Scenarios**:

1. **Given** the app has no prior configuration, **When** the user opens it,
   **Then** a dedicated full-screen setup wizard is shown before any weekly view. The
   wizard collects dumbbell weights and training day selection and cannot be dismissed
   until both are saved. It never appears again after initial setup is complete.
2. **Given** the user enters dumbbell weights and training days and saves,
   **When** the setup is saved, **Then** the main weekly view appears immediately with a
   generated routine.
3. **Given** a valid configuration, **When** the routine is generated,
   **Then** every weighted exercise uses only a weight from the user's available dumbbells.
4. **Given** the user toggles specific days (e.g. Mon, Wed, Fri, Sat) as training days,
   **When** viewing the week, **Then** exactly those days show a training routine and
   the remaining days show a rest message.

---

### User Story 2 — View Week at a Glance and Log Completions (Priority: P1)

The main screen of the app shows the current day's routine by default. A row of day tabs
(Mon, Tue, Wed, Thu, Fri, Sat, Sun) runs across the top — the current day is highlighted.
Tapping any tab shows that day's routine below. Each exercise is displayed as a card showing
the exercise name, sets × reps, weight, and tennis-performance category. A "Complete" button
on each card lets the user mark it done instantly. Completed exercises are visually
distinguished.

**Why this priority**: This is the daily interaction loop — the screen the user will
open every day. Speed and clarity are critical.

**Independent Test**: Can be fully tested with a generated routine: open the app on a
training day, verify today's tab is selected and exercises are listed, tap "Complete" on two
exercises, verify they are visually marked done and the completion is retained after
navigating away and returning.

**Acceptance Scenarios**:

1. **Given** a generated routine, **When** the app opens,
   **Then** the current day's tab is selected and its routine is shown without any
   additional navigation required.
2. **Given** the user is on a training day, **When** they view the day tab,
   **Then** they see a list of exercise cards with name, sets × reps, weight, and
   tennis-performance category label.
3. **Given** the user is on a rest day, **When** they view that day tab,
   **Then** the tab shows a rest/recovery message rather than exercises.
4. **Given** an exercise card, **When** the user taps "Complete",
   **Then** the card is visually marked as done within 1 second and the state persists
   across app reloads.
5. **Given** the user navigates from Monday to Thursday and back,
   **When** they return to Monday, **Then** all previously marked completions are still shown.

---

### User Story 3 — Reconfigure Without Losing History (Priority: P2)

The user buys a new pair of 22.5 kg dumbbells, or decides to increase their training days
from 4 to 5. They update their configuration. The engine regenerates the weekly plan using
the new settings. All previously logged exercise completions remain intact and visible in
the progress history.

**Why this priority**: This is what separates the app from a static spreadsheet. The
engine/data separation is a core architectural promise.

**Independent Test**: Can be fully tested by: logging completions for Monday and Tuesday,
changing training days from 4 to 5, confirming the plan updates, then opening the progress
view and confirming Monday and Tuesday completions are still shown.

**Acceptance Scenarios**:

1. **Given** the user has logged completions on prior days, **When** they change their
   dumbbell set or training days and save, **Then** the weekly plan regenerates using
   the new settings.
2. **Given** a plan regeneration, **When** the user views progress history,
   **Then** all completions logged before the configuration change are still present.
3. **Given** a new dumbbell weight is added that is heavier than all existing ones,
   **When** the plan regenerates, **Then** exercises that previously used the heaviest
   available weight now progress to the new heavier weight where appropriate.

---

### User Story 4 — Progress Dashboard: Personal Bests and Consistency (Priority: P3)

The user navigates to the Progress section and sees a summary of their training. The
dashboard shows: (1) personal best weight per exercise, (2) weekly consistency over the
past 8 weeks, and (3) a count of completed sessions this week vs planned.

**Why this priority**: Visible progress motivates continued use but is not needed to start
using the app.

**Independent Test**: Can be fully tested after logging completions across at least 3
different weeks: open Progress and confirm personal bests are shown for exercises with
logged data, and the consistency chart reflects actual logged weeks.

**Acceptance Scenarios**:

1. **Given** the user has logged completions, **When** they open the Progress section,
   **Then** they see a list of personal bests (heaviest weight per exercise) drawn from
   historical completion logs.
2. **Given** at least 1 week of history, **When** viewing Progress,
   **Then** a consistency chart shows sessions completed vs sessions planned per week
   for up to 8 weeks.
3. **Given** no completion history, **When** the user opens Progress,
   **Then** they see an encouraging empty state with a prompt to complete their first session.

---

### Edge Cases

- User enters only one dumbbell weight — app generates a valid routine using that single
  weight for all weighted exercises, supplemented with bodyweight exercises.
- User selects 3 training days (minimum) — 4 rest days are shown; no exercises are shown
  on rest-day tabs.
- User marks all exercises complete on a day — the day tab shows a "complete" badge.
- User completes exercises in a week, then the plan regenerates (new config) — completions
  are preserved even if the exercise appears in a different slot or not at all in the new plan.
- User opens the app on a rest day — rest tab is selected by default, with a recovery message.
- User closes the app mid-way through first-time setup before saving — the setup wizard
  reappears on next open; no partial configuration is persisted.
- New week begins — all exercise cards start unchecked; completions from prior weeks are
  archived to Progress history and no longer appear as checked in the weekly view.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to specify their available dumbbell weights as an ordered
  list (minimum 1 weight, no upper limit).
- **FR-002**: Users MUST be able to select which specific days of the week are training days
  by toggling individual days on or off. A minimum of 3 and maximum of 6 days may be
  selected as training days.
- **FR-003**: The system MUST generate a complete weekly routine immediately after
  configuration is saved.
- **FR-004**: All weighted exercises in generated routines MUST use only weights from the
  user's available dumbbell list.
- **FR-005**: Generated routines MUST include exercises from at least 3 of the following
  tennis-performance categories on every training day: lateral agility, rotational power,
  shoulder stability, HIIT stamina, and general strength.
- **FR-006**: The system MUST intelligently assign exercise weights from available dumbbells
  based on each exercise's target muscle group and the user's heaviest available weight
  (used as a proxy for current strength level). The plan is fixed per configuration in v1;
  it only changes when the user explicitly updates their dumbbell list or training days.
- **FR-006a**: The engine architecture MUST be designed so that a future progressive overload
  module can read ExerciseCompletion history (actual weight, sets, and reps per set) and
  automatically increase volume or weight prescription week over week. ExerciseCompletion
  records MUST therefore store actual reps per set (not only set count) to support this
  future capability.
- **FR-007**: The main screen MUST display a tab row with one tab per day of the week
  (Mon–Sun), with the current day selected by default.
- **FR-008**: Each day tab MUST show that day's complete routine or a rest-day message,
  depending on the configuration.
- **FR-009**: Each exercise card MUST display: exercise name, tennis-performance category,
  prescribed sets, reps, and weight.
- **FR-010**: Users MUST be able to mark any exercise as complete with a single interaction,
  and MUST be able to undo that completion with a second tap (toggle behaviour). Completion
  state MUST persist across sessions within the current ISO week.
- **FR-011**: Changing dumbbell weights or training days MUST regenerate the weekly plan
  without deleting any historically logged exercise completions.
- **FR-012**: The Progress section MUST display a personal-best record (highest weight used)
  for each exercise that has been completed at least once.
- **FR-013**: The Progress section MUST display a weekly consistency chart covering up to
  8 weeks.
- **FR-014**: All data MUST be stored locally and function without an internet connection.

### Key Entities *(include if feature involves data)*

- **EquipmentProfile**: The user's current configuration — list of available dumbbell
  weights (kg) and number of training days per week. Versioned so the system knows when
  a recalculation is needed.
- **WeeklyPlan**: The generated routine for one week — maps each day (Mon–Sun) to either
  a training day (with exercises) or a rest day. Derived from the engine; regenerated when
  EquipmentProfile changes.
- **PlannedExercise**: One exercise within a training day — exercise reference, prescribed
  sets, reps, and weight (in kg, from available dumbbells).
- **ExerciseCompletion**: A record that the user completed a specific exercise on a specific
  date — exercise ID, date, weight used (kg), sets completed, reps per set, and timestamp.
  Stores full performance detail (not just a boolean) so a future progressive overload engine
  can read history and adjust prescriptions automatically. Never deleted on plan regeneration.
  Completions are scoped to their calendar week: the weekly view shows checkmarks only for
  the current ISO week, while all past completions feed Progress history.
- **PersonalBest**: The highest weight a user has used for a given exercise, derived from
  ExerciseCompletion records at query time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete first-time setup (enter dumbbells + training days) and
  see a generated routine in under 2 minutes.
- **SC-002**: Tapping "Complete" on an exercise card visually confirms the action within
  1 second.
- **SC-003**: 100% of weighted exercises in the generated routine use a weight from the
  user's configured dumbbell list.
- **SC-004**: 100% of exercises in the generated routine carry a tennis-performance category
  label.
- **SC-005**: Changing training days or dumbbell configuration generates an updated plan in
  under 3 seconds while preserving all historical completions.
- **SC-006**: The Progress dashboard displays at least 8 weeks of history when sufficient
  data is available.
- **SC-007**: The user can view, complete exercises, and navigate between days without any
  loading delay (all operations feel instantaneous on a modern phone).

## Assumptions

- The user trains exclusively with dumbbells for weighted exercises; no barbell, cable, or
  machine exercises are generated.
- Bodyweight exercises (e.g. push-ups, planks, lateral shuffles) are always available
  regardless of dumbbell configuration.
- "Training days" refers to strength/conditioning sessions; tennis court time is managed
  separately and is not tracked by this feature.
- The user explicitly selects which days of the week are training days; the engine generates
  a routine for each selected day and a rest message for all others.
- The user's strength level is estimated by their heaviest available dumbbell: ≤10 kg =
  beginner, 11–20 kg = intermediate, >20 kg = advanced.
- The weekly plan is regenerated from scratch on every configuration change; the plan is
  deterministic (same config always produces the same plan for a given week).
- Historical completions reference exercise IDs that may or may not appear in the new plan;
  they are never deleted, only orphaned from the active plan if an exercise is removed.
- The app supports a single user with no account system.

## Clarifications

### Session 2026-04-27

- Q: When a new week starts, do exercise completion checkmarks reset or persist visually? → A: Completions reset each new ISO week. Cards start unchecked on Monday. Previous completions are preserved in Progress history only.
- Q: Does the user pick which specific days are training days, or does the engine auto-assign them? → A: User explicitly toggles which days (Mon–Sun) are training days; count must be 3–6.
- Q: Can the user undo a "Complete" mark on an exercise? → A: Yes, completion is a toggle — tapping again removes it within the current week.
- Q: Does the engine automatically increase difficulty week over week (progressive overload)? → A: No in v1 — plan is fixed until the user manually reconfigures. Architecture must be designed to support auto-progression in a future version once completion history is rich enough to inform it.
- Q: On first open with no config, does the user see a setup wizard or the main screen with an empty state? → A: Dedicated full-screen setup wizard that cannot be dismissed until both dumbbell weights and training days are saved.
