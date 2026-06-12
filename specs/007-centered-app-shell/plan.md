# Implementation Plan: Centered App Shell Layout

**Branch**: `007-centered-app-shell` | **Date**: 2026-05-01 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `specs/007-centered-app-shell/spec.md`

## Summary

Constrain the entire app UI to a centred 430px-wide shell on desktop viewports. The page background outside the shell shifts to the existing `--bg-recessed` tone to create depth. On mobile (< 430px) no visual change occurs. Applies to: MainView, SettingsView, and the SetupWizard onboarding screen. Implementation is pure CSS/layout — no logic, state, or data changes.

## Technical Context

**Language/Version**: TypeScript 5.6 / React 18  
**Styling**: Tailwind CSS utility classes + Advantage Design System CSS custom properties (`src/index.css`). All colour tokens already defined — no new colours introduced.  
**Testing**: Manual browser verification (constitution requirement for UI changes). Vitest unit tests unaffected (no logic changes).  
**Target Platform**: Browser SPA (Vite 5 / static build)  
**Project Type**: Mobile-first single-page web app  
**Performance Goals**: Zero — pure layout change, no runtime cost  
**Constraints**: Must not break mobile layout (< 430px viewport); must stay within Advantage Design System palette  
**Scale/Scope**: 3 component files + 1 CSS file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Tennis-Performance-Led | ✅ PASS | Cosmetic only — no effect on workout content or training logic |
| II. Offline-First, Zero Backend | ✅ PASS | Pure CSS/layout, zero new dependencies, no network calls |
| III. Sensible Defaults | ✅ PASS | No new configuration; onboarding flow unchanged |
| IV. Visible Progress | ✅ PASS | Progress view remains fully visible within the shell |
| V. Simplicity Over Completeness | ✅ PASS | Minimal change, high visual value, no added complexity |

**All gates pass. No blockers.**

## Project Structure

### Documentation (this feature)

```text
specs/007-centered-app-shell/
├── plan.md              ← this file
├── research.md          ← Phase 0 (trivial — no unknowns)
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

No `data-model.md` or `contracts/` needed — feature is pure layout with no data or API surface.

### Source Code (files changed)

```text
src/
├── index.css                               # body background-color → --bg-recessed
└── components/
    ├── main/
    │   └── MainView.tsx                    # centering shell wrapper [ALREADY DONE]
    └── setup/
        ├── SettingsView.tsx                # centering shell wrapper [TODO]
        └── SetupWizard.tsx                 # review + align inner max-width [TODO]
```

## Implementation Plan

### Phase 0: Research

No technical unknowns. Single decision documented below.

**Decision**: max-width = 430px  
**Rationale**: Matches iPhone 14 Plus / 15 Plus logical width (430px), the modern de-facto standard for mobile-first PWAs displayed on desktop. Narrower than `max-w-md` (448px / Tailwind default) for a tighter app-like feel. Wider than strict iPhone 14 Pro (393px) to give content room to breathe.  
**Alternatives considered**: 390px (too tight for 3-card layouts), 480px (starts to feel more like a tablet shell), `max-w-md` (448px, Tailwind standard — acceptable but slightly loose).

**Decision**: Backdrop colour = `--bg-recessed` (`#efece2`)  
**Rationale**: Already in the design system. Warm, close to the app background — creates contrast without introducing a jarring dark chrome. Used elsewhere in the UI for recessed surfaces.

### Phase 1: Implementation Detail

#### T001 — `src/index.css` — body background (DONE)
Change `background-color: var(--bg-app)` → `background-color: var(--bg-recessed)` so the page backdrop outside the shell has the recessed tone.

#### T002 — `src/components/main/MainView.tsx` — centering shell (DONE)
Wrap the existing `min-h-dvh flex flex-col` root div in an outer `min-h-dvh flex justify-center` div with `background: var(--bg-recessed)`. The inner div gets `maxWidth: 430` and a subtle box-shadow for depth.

#### T003 — `src/components/setup/SettingsView.tsx` — centering shell (TODO)
SettingsView root is `min-h-dvh flex flex-col` with `background: var(--bg-app)`. Apply identical wrapping pattern as MainView: outer centering div + inner 430px shell with shadow. SettingsView renders as a full-screen replacement of MainView, so it must maintain visual consistency.

#### T004 — `src/components/setup/SetupWizard.tsx` — review (TODO)
SetupWizard already constrains its inner content with `max-w-md mx-auto` (448px). The outer is `fixed inset-0` (fills full viewport). Since SetupWizard is a one-time onboarding screen, a lighter touch suffices: change `max-w-md` to `max-w-[430px]` on the inner content div to align with the shell width. The fixed full-screen backdrop is intentional for onboarding — no outer shell wrapper needed.

### Phase 2: Acceptance Validation

Verify manually in browser after implementation:

- [ ] Desktop ≥ 900px: MainView cards centred, header and footer within 430px column, backdrop visible
- [ ] Desktop ≥ 900px: SettingsView centred with same shell width and shadow
- [ ] Mobile 375px: full-width layout, no gaps, no overflow
- [ ] SetupWizard content aligns to 430px inner width

## Complexity Tracking

| Dimension | Assessment |
|---|---|
| Logic changes | None |
| State changes | None |
| New dependencies | None |
| Schema changes | None |
| Files touched | 4 |
| Effort estimate | < 30 minutes |
