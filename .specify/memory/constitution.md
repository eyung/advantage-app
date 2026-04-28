<!--
SYNC IMPACT REPORT
==================
Version change: (unversioned template) → 1.0.0
Modified principles: N/A (initial adoption)
Added sections:
  - Core Principles (5 principles)
  - Technology Constraints
  - Development Workflow
  - Governance
Removed sections: N/A
Templates reviewed:
  - .specify/templates/plan-template.md      ✅ compatible (Constitution Check section present)
  - .specify/templates/spec-template.md      ✅ compatible (no principle conflicts)
  - .specify/templates/tasks-template.md     ✅ compatible (phase structure aligns)
Follow-up TODOs: None — all placeholders resolved.
-->

# Rally Constitution

## Core Principles

### I. User-First, Tennis-Performance-Led

Every feature, screen, and default setting MUST trace directly to the user's goal: improving
tennis performance and general health. When a design decision is ambiguous, the choice that
most directly serves on-court performance wins. General fitness is a supporting concern, not
a peer concern.

### II. Offline-First, Zero Backend

All data MUST be stored in the browser (localStorage). The app MUST function fully without a
network connection after initial load. No server, no user account, no cloud dependency is
permitted. This is non-negotiable — it keeps the app deployable to any static host and
eliminates maintenance burden.

### III. Sensible Defaults, Optional Configuration

A new user MUST be able to start a workout within 60 seconds of opening the app without
configuring anything. All settings — weekly schedule, session duration, weights — MUST have
working defaults. Configuration is opt-in, not required. Features that force upfront setup
before delivering value violate this principle.

### IV. Visible Progress

The app MUST surface progress clearly and frequently. Completed sessions, personal bests,
and consistency streaks MUST be shown without the user having to navigate to a dedicated
stats view. A workout tracker that hides progress is not a motivator — it MUST celebrate
consistency visibly.

### V. Simplicity Over Completeness

The app MUST do fewer things excellently rather than many things adequately. Features that
add configuration complexity, UI clutter, or maintenance cost without proportional user value
MUST be deferred or rejected. YAGNI applies to all scope decisions. If it doesn't help the
user hit harder or stay healthy, it probably doesn't belong in v1.

## Technology Constraints

The app MUST be a single-page React application (SPA) built for static hosting. The following
constraints are non-negotiable for this project:

- **Runtime**: React (browser-based SPA; no server-side rendering required for v1)
- **Persistence**: `localStorage` only — no IndexedDB, no remote storage in v1
- **Hosting**: Output MUST be a static build deployable to Vercel, GitHub Pages, or served
  locally with a single command (e.g., `npm run dev`)
- **Dependencies**: Prefer well-maintained, small-footprint libraries. No dependency that
  requires a build-time or runtime server is permitted
- **Styling**: Tennis-themed design system (court green `#4CAF50` / `#2E7D32`, clay orange
  `#E65100` / `#FF6F00`, bright white `#FAFAFA`) MUST be applied consistently across all screens
- **No authentication**: There is one user (the owner). Login screens, accounts, and
  multi-user features are out of scope

## Development Workflow

This is a solo project. The workflow is intentionally lightweight:

- Each feature MUST be spec'd before implementation (use `/speckit-specify` → `/speckit-plan`
  → `/speckit-tasks` → `/speckit-implement`)
- UI changes MUST be visually tested in a browser before marking complete — type-checking
  alone is not sufficient verification
- The app MUST remain runnable locally at all times; no broken build states should be committed
- Deployments to Vercel or GitHub Pages are manual and triggered by the developer
- If the localStorage schema changes, a migration helper MUST be provided so existing workout
  history is not silently lost

## Governance

This constitution supersedes all other development guidance for the Rally project. Amendments
require:

1. A clear rationale linked to user value or a technical constraint change
2. A version bump following semantic versioning:
   - **MAJOR**: A principle is removed, renamed, or fundamentally redefined
   - **MINOR**: A new principle or section is added; existing guidance materially expanded
   - **PATCH**: Clarifications, wording improvements, typo fixes
3. All dependent templates reviewed for consistency after any amendment

All implementation plans MUST include a Constitution Check gate before Phase 0 research.

**Version**: 1.0.0 | **Ratified**: 2026-04-27 | **Last Amended**: 2026-04-27
