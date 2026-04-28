# Feature Specification: Rally — Tennis-Focused Personal Workout Tracker

**Feature Branch**: `001-tennis-workout-tracker`
**Created**: 2026-04-27
**Status**: Draft
**Input**: User description: Personal workout tracker app focused on tennis performance

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Configure Training Schedule (Priority: P1)

A new user opens Rally for the first time and wants to dial in their weekly routine. They
specify how many days per week they want to play tennis, lift weights, do cardio, and rest.
For each active day type they set how many hours they plan to train. They also enter their
current working weights for the main lifting exercises.

**Why this priority**: Without a configured schedule, the app cannot generate a relevant
workout plan. This is the foundation every other feature depends on. However, the app ships
with sensible defaults so a user can defer this and still get started immediately.

**Independent Test**: Can be fully tested by opening the settings screen, completing schedule
configuration, saving, and verifying the home screen reflects the new schedule.

**Acceptance Scenarios**:

1. **Given** the app is opened for the first time, **When** the user navigates to Settings,
   **Then** they see fields for days per week (tennis, lifting, cardio, rest), session
   duration per activity type, and current weights per lifting exercise.
2. **Given** the user has entered their schedule, **When** they save, **Then** the home
   screen updates to reflect the schedule for the current day.
3. **Given** the user has no prior configuration, **When** the app is opened,
   **Then** a default schedule is already applied so the user can start immediately.

---

### User Story 2 — View & Follow Today's Workout (Priority: P1)

The user opens the app on any given day and immediately sees the workout planned for today
— whether that is a tennis-focused session, a lifting session, a cardio session, or a rest
day. The workout is organised into exercises with prescribed sets, reps, and weights drawn
from their configuration.

**Why this priority**: This is the core daily interaction. If a user can open the app and
know exactly what to do in under 10 seconds, the app succeeds.

**Independent Test**: Can be fully tested with a configured schedule: open the app, confirm
today's workout matches the day type, and confirm all exercises are listed with sets/reps/weights.

**Acceptance Scenarios**:

1. **Given** a configured schedule, **When** the app is opened, **Then** the home screen
   shows today's workout type and a list of exercises with prescribed sets, reps, and weights.
2. **Given** it is a rest day, **When** the app is opened, **Then** the home screen shows a
   rest/recovery prompt with optional light mobility suggestions instead of a workout.
3. **Given** exercises are tennis-focused, **When** viewing a lifting session, **Then**
   exercises prioritise agility, explosiveness, and shoulder/core strength relevant to
   tennis performance.

---

### User Story 3 — Log a Workout Session (Priority: P2)

During a workout the user marks each exercise as complete and records the actual reps, sets,
and weights they performed. At the end of the session they finish and save it. For tennis
sessions they log the duration and optionally a short note.

**Why this priority**: Tracking actuals against plan is what separates a workout tracker from
a simple schedule. It enables progress analysis and accountability.

**Independent Test**: Can be fully tested by starting today's workout, completing two
exercises with actual values, finishing the session, and confirming the log appears in
workout history.

**Acceptance Scenarios**:

1. **Given** a workout is in progress, **When** the user taps an exercise,
   **Then** they can record actual reps, sets, and weight for that exercise in under 15 seconds.
2. **Given** an exercise is logged, **When** the user marks it complete, **Then** it is
   visually marked done and the next exercise is highlighted.
3. **Given** a tennis session day, **When** the user finishes their session,
   **Then** they can log duration and an optional note before saving.
4. **Given** a completed session, **When** the user closes the app and reopens it,
   **Then** the logged session still appears in history.

---

### User Story 4 — Track Progress Over Time (Priority: P3)

The user navigates to a progress screen and sees charts and summary statistics showing how
their training has evolved: session consistency, total volume lifted per week, weight
progression on key exercises, and number of tennis sessions played per week.

**Why this priority**: Visible progress reinforces motivation and helps the user adjust their
training intelligently. It is not needed to start using the app but becomes critical for
long-term retention.

**Independent Test**: Can be fully tested after logging at least 3 sessions: navigate to the
progress screen and confirm charts display historical data with correct totals.

**Acceptance Scenarios**:

1. **Given** at least one logged session, **When** the user opens the progress screen,
   **Then** they see a consistency chart showing sessions completed vs planned for the past
   4 weeks.
2. **Given** multiple lifting sessions, **When** viewing progress for a specific exercise,
   **Then** the user can see their weight trend over time.
3. **Given** no logged sessions yet, **When** the user opens the progress screen,
   **Then** they see an encouraging empty state with a prompt to complete their first workout.

---

### Edge Cases

- User has logged zero sessions — app shows an encouraging empty state and today's plan
  with a clear call to action.
- User changes their weekly schedule mid-week — previously logged sessions remain unchanged;
  future days reflect the new schedule.
- User skips a day — the skipped day is recorded as missed in progress stats; it does not
  cascade or shift subsequent days.
- User sets a day type to "rest" — the home screen shows a rest prompt; no exercises are
  listed.
- A lifting exercise has no weight configured — the app displays a suggested starting weight
  and prompts the user to confirm or adjust before the first session.
- User attempts to log a session that was already completed today — the app asks whether to
  update or append rather than silently overwriting.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST display the current day's scheduled workout on the home screen
  immediately upon opening.
- **FR-002**: Users MUST be able to configure the number of days per week allocated to
  tennis, weightlifting, cardio, and rest.
- **FR-003**: Users MUST be able to set planned session duration (in hours) for each
  activity type.
- **FR-004**: Users MUST be able to record current working weights for each weightlifting
  exercise prior to or during the first session.
- **FR-005**: The app MUST generate a complete weekly workout plan from the user's schedule
  settings, populated with exercises appropriate to each day type.
- **FR-006**: Generated lifting plans MUST include exercises that specifically improve tennis
  performance: agility, explosiveness, rotational power, shoulder stability, and core strength.
- **FR-007**: Users MUST be able to mark individual exercises as complete during a session.
- **FR-008**: Users MUST be able to log actual reps, sets, and weight for each exercise.
- **FR-009**: Users MUST be able to log a tennis session with at minimum a date and duration.
- **FR-010**: All workout history and settings MUST persist between app sessions without
  requiring an internet connection.
- **FR-011**: The app MUST display a progress screen with at least: weekly session consistency,
  weight progression per key exercise, and weekly tennis session count.
- **FR-012**: The app MUST apply a consistent tennis-themed visual design (colour palette,
  imagery, and style inspired by tennis courts and tennis balls) across all screens.
- **FR-013**: The app MUST function correctly on first open with no prior configuration,
  using sensible defaults for the schedule and exercise weights.
- **FR-014**: Rest days MUST display a rest or recovery prompt instead of a workout list.

### Key Entities *(include if feature involves data)*

- **TrainingProfile**: The user's weekly schedule — day types assigned to each day of the
  week, session durations per activity type, and current working weights per exercise.
- **WorkoutPlan**: The generated weekly plan derived from the TrainingProfile — maps each
  day to an ordered list of exercises with prescribed sets, reps, and weights.
- **Exercise**: A single movement in the workout plan — name, target muscle groups, tennis
  relevance category, and prescribed sets/reps/weight.
- **WorkoutSession**: A record of a completed training session — date, day type, list of
  logged exercise results, and total duration.
- **ExerciseLog**: The actual performance record for one exercise within a session — sets
  completed, reps per set, weight used, and completion status.
- **TennisSession**: A record of a completed tennis session — date, duration, and optional
  notes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The user can view today's workout and begin the first exercise within 10 seconds
  of opening the app (measured from home screen render to first exercise visible).
- **SC-002**: A new user can complete full schedule configuration (days, durations, weights)
  in under 3 minutes.
- **SC-003**: All logged workout sessions remain available after the browser is closed and
  reopened — zero data loss under normal usage.
- **SC-004**: The user can log a completed exercise (actual sets, reps, weight) in under
  15 seconds per exercise.
- **SC-005**: The progress screen displays data for all sessions logged in the past 12 weeks
  when available.
- **SC-006**: 100% of the workout plan exercises for a lifting day include at least one
  exercise explicitly tagged as tennis-performance-relevant.
- **SC-007**: The app is fully usable offline after the initial load — no features require
  an active internet connection during a session.

## Assumptions

- The app is used by a single person; no account, login, or multi-user functionality is
  needed in v1.
- Workout plans are generated from a curated built-in exercise library; users cannot
  add custom exercises in v1.
- Tennis session logging is manual (no GPS, sensor, or third-party sports-platform
  integration in v1).
- The user primarily accesses the app from a modern desktop or mobile browser.
- Exercise video demonstrations are out of scope for v1.
- Calorie tracking and nutrition guidance are out of scope for v1.
- The app does not send push notifications or reminders in v1 (user opens it voluntarily).
- Progress history is stored for up to 52 weeks before the oldest entries are eligible for
  archival (no hard deletion of recent data).
