# Feature Specification: Tennis Hub Redesign — Dashboard & Gear

**Feature Branch**: `008-tennis-hub-redesign`  
**Created**: 2026-06-12  
**Status**: Draft  
**Input**: User description: "Complete rehaul of the design — keeping just the colour scheme. The current version is too clunky and unintuitive. Make the app very cool and modern. Include features to organize and manage tennis-related items — a view to list current rackets and their strings (with restring history), and other interesting items. Create a super cool dashboard as the homepage, with graphs and tennis-related things. Retrieve Apple Watch data (forehands/backhands, swing/ball speed, topspin vs flat) similar to the paid version of SwingVision."

## Vision

The app evolves from a single-purpose workout tracker into a personal **tennis hub**: one place to see training consistency, manage rackets and string setups, and stay on top of the week. The visual identity (forest/bone palette) is retained; everything else — layout, navigation, components, information hierarchy — is redesigned for a modern, fluid, app-like feel. The dashboard becomes the new homepage, and the layout becomes fully responsive: phone-style on mobile, a wider multi-column dashboard on desktop.

## Clarifications

### Session 2026-06-12

- Q: How should on-court session metrics (stroke counts, speeds, spin) enter the app, given a web app cannot read Apple Watch sensors? → A: Skipped for now — the user will build a native iOS app for watch capture later; session metrics are excluded from this feature entirely.
- Q: How deep should non-racket gear tracking go? → A: Rackets & strings only — no other gear items in this feature.
- Q: What should the desktop layout do, given feature 007's fixed 430px frame? → A: Fully responsive — single column on mobile, multi-column dashboard grid on desktop; supersedes the fixed 430px frame.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Redesigned Navigation & Modern Shell (Priority: P1)

As a player, I open the app and move between clearly separated areas — Dashboard (home), Training, Gear, and Settings — through an always-visible navigation. Every feature I use today (weekly plan, day cards, equipment selection, exercise management, settings) still exists, restyled to match the new design language, and is reachable in at most two taps.

**Why this priority**: The redesign is the vehicle for everything else. Navigation and shell must exist before the dashboard and gear areas have anywhere to live, and existing functionality must not regress.

**Independent Test**: Open the app, traverse all navigation destinations, and complete one full existing flow (view today's workout, toggle equipment, complete an exercise, change settings) entirely within the new design.

**Acceptance Scenarios**:

1. **Given** an existing user with saved training data, **When** they open the redesigned app, **Then** all previously saved data (plan, history, equipment, custom exercises) is intact and visible in the new UI.
2. **Given** the app is open, **When** the user looks at the screen, **Then** a persistent navigation reveals all top-level areas (Dashboard, Training, Gear, Settings) and indicates the current location.
3. **Given** any top-level area, **When** the user wants to reach any other feature, **Then** it is reachable within two taps/clicks.
4. **Given** the redesign, **When** colours are inspected, **Then** only the existing forest/bone palette tokens are used (no new colour families).
5. **Given** a phone-sized viewport, **When** the app is used, **Then** it presents a single-column, touch-first layout; **Given** a desktop viewport, **Then** the layout expands responsively rather than staying locked to a 430px frame.

---

### User Story 2 - Dashboard Homepage with Graphs (Priority: P1)

As a player, the first screen I see is a dashboard that makes me feel on top of my tennis life: a training-consistency graph (sessions completed per week), this week's plan progress, my current streak, and racket/string status at a glance (e.g., "Racket A — 32 days since restring"). On desktop the panels arrange into a multi-column grid; on mobile they stack. It looks great with data and degrades gracefully when an area is empty.

**Why this priority**: The user explicitly asked for the dashboard as the new homepage — it is the centrepiece of the redesign and the daily entry point.

**Independent Test**: Open the app with seeded history and verify at least three distinct visualisations render with correct numbers; open with a fresh profile and verify friendly empty states with calls-to-action instead of blank panels.

**Acceptance Scenarios**:

1. **Given** a user with workout history, **When** they open the app, **Then** the dashboard shows a weekly training-consistency visualisation covering at least the last 8 weeks.
2. **Given** today is a training day with an incomplete session, **When** the dashboard loads, **Then** today's plan progress is shown with a one-tap path into the workout.
3. **Given** the user has rackets recorded, **When** the dashboard loads, **Then** string freshness for the active racket(s) is summarised (time since last restring).
4. **Given** a brand-new user with no data, **When** the dashboard loads, **Then** each panel shows an inviting empty state with a clear action (e.g., "Add your first racket"), never an empty chart.
5. **Given** a desktop-width viewport, **When** the dashboard renders, **Then** panels lay out in a multi-column grid; **Given** a phone-width viewport, **Then** the same panels stack in a single column without loss of content.

---

### User Story 3 - Gear Locker: Rackets, Strings & Restring History (Priority: P2)

As a player, I keep a list of my rackets (brand, model, specs, active/retired). For each racket I record restrings: date, main/cross string, tension, who strung it, and notes. I can see the full restring history per racket and how long the current strings have been in play.

**Why this priority**: First concrete feature the user named. Independently valuable on its own, and it feeds the dashboard's gear panel.

**Independent Test**: Add two rackets, record three restrings across them, retire one racket — then verify the history list, current-string summary, and dashboard gear panel all reflect the data.

**Acceptance Scenarios**:

1. **Given** the Gear area, **When** the user adds a racket with brand, model, and optional specs, **Then** it appears in their racket list marked as active.
2. **Given** a racket, **When** the user records a restring (date, string(s), tension, optional stringer/notes), **Then** it becomes the racket's current string setup and the previous setup moves into history.
3. **Given** a racket with multiple restrings, **When** the user views it, **Then** the full restring history is listed in reverse-chronological order with all recorded details.
4. **Given** a racket the user no longer plays with, **When** they retire it, **Then** it moves out of the active list but its history remains viewable.

---

### Edge Cases

- Brand-new user with zero data in every area — dashboard and gear must present designed empty states.
- A user with a long history (e.g., 12+ months of workouts, 30+ restrings) — lists and charts must stay responsive and legible.
- A racket is retired or deleted while it has restring history — history must never be silently lost; deletion warns the user that its history goes with it.
- Restring recorded with a date in the past (backfilling old history) — ordering must follow the recorded date, not entry time.
- The existing training data from the current app version must survive the redesign unchanged — no migration that risks user history.
- Viewing on a phone-sized screen vs a wide desktop screen — the dashboard must remain usable and attractive at both extremes, including in-between (tablet) widths.

## Requirements *(mandatory)*

### Functional Requirements

**Redesign & Navigation**

- **FR-001**: The app MUST present a persistent top-level navigation with four areas — Dashboard, Training, Gear, and Settings — with the Dashboard as the default landing view.
- **FR-002**: All existing capabilities (weekly plan view, day navigation, exercise completion, per-session equipment, exercise management, equipment/day configuration) MUST remain available and functional within the new design.
- **FR-003**: The redesign MUST reuse only the existing colour palette; all other visual elements (typography scale, spacing, component shapes, iconography, layout) MAY change freely.
- **FR-004**: All existing user data MUST be preserved and readable by the redesigned app without loss.
- **FR-005**: The layout MUST be fully responsive: single-column, touch-first presentation on phone-sized viewports; progressively wider, multi-column presentation on desktop viewports (replacing the previous fixed 430px shell).

**Dashboard**

- **FR-006**: The dashboard MUST display a training-consistency visualisation derived from workout completion history (at minimum, completed sessions per week over the last 8 weeks).
- **FR-007**: The dashboard MUST display today's training status with a direct path into the day's workout when one is scheduled.
- **FR-008**: The dashboard MUST display a gear summary including time since the active racket(s) last restring, once at least one racket exists.
- **FR-009**: Every dashboard panel MUST have a designed empty state with a call-to-action when its underlying data is absent.

**Gear Locker**

- **FR-010**: Users MUST be able to create, edit, retire, and delete rackets with at least brand, model, and free-form notes; additional optional specs (weight, head size, grip size) MAY be recorded.
- **FR-011**: Users MUST be able to record a restring against a racket with date, string name(s), and tension, plus optional stringer and notes — supporting different main/cross strings (hybrid setups) and different main/cross tensions.
- **FR-012**: The system MUST maintain a complete restring history per racket, ordered by restring date, and identify the most recent restring as the current string setup.
- **FR-013**: The system MUST surface string freshness as elapsed time since each active racket's last restring.

**General**

- **FR-014**: All data MUST be stored on the user's device and remain fully usable offline, consistent with the product's existing zero-backend principle.

### Key Entities

- **Racket**: A racket the user owns — brand, model, optional specs (weight, head size, grip size), status (active/retired), notes. Has many restring records.
- **Restring Record**: One stringing event — racket reference, date, main string (name, tension), optional cross string and tension for hybrids, optional stringer and cost, notes. The most recent record per racket is its current setup.
- **Training History** (existing): Workout completion records already kept by the app; feeds the dashboard's consistency visualisation. Unchanged in meaning.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From the dashboard, any existing feature is reachable in at most 2 taps/clicks.
- **SC-002**: A user can add a racket and record its first restring in under 60 seconds.
- **SC-003**: A user can answer "when was this racket last strung, and with what?" in under 10 seconds from app open.
- **SC-004**: The dashboard presents at least 3 distinct data visualisations once corresponding data exists.
- **SC-005**: 100% of pre-redesign features remain usable (zero functional regressions), verified against a checklist of existing flows.
- **SC-006**: A brand-new user sees zero blank/broken panels — every empty area presents a designed empty state with a next action.
- **SC-007**: The app remains fully functional offline; no flow requires a network connection.
- **SC-008**: With a year of training history and 30+ restring records, the dashboard renders without perceptible delay (under ~1 second on a typical device).

## Out of Scope

- **On-court session metrics** (stroke counts, swing/ball speed, spin profile, SwingVision-style analytics): deferred entirely. The user plans a separate native iOS/watchOS app for Apple Watch capture; this web app may later grow a display surface for that data, but nothing in this feature builds toward it.
- **Non-racket gear items** (shoes, overgrips, dampeners, bags): excluded per clarification — gear tracking covers rackets and strings only.
- **Reminders/notifications** (e.g., "time to restring"): the dashboard surfaces string age passively; no notification system is introduced.

## Assumptions

- The product remains an offline-first, on-device web app with no accounts and no backend (per the project constitution); nothing in this feature introduces a server.
- The forest/bone colour palette and its tokens are kept verbatim; the recently added centred 430px shell, typography, component styles, and navigation patterns are all superseded by the responsive redesign.
- Existing training data structures keep their meaning; the redesign reads them as-is (no destructive migration).
- Charts are rendered on-device from local data; no analytics service is involved.
- "Modern and cool" is interpreted as: bottom tab navigation on small screens (side/top navigation on desktop), generous whitespace, a card-based modular dashboard grid, smooth micro-interactions, and strong empty states — refined during planning rather than specified pixel-by-pixel here.
