# Quickstart: Manual Verification — Tennis Hub Redesign

**Feature**: 008-tennis-hub-redesign  
Run `npm run dev` and verify in a real browser (constitution: type-checking alone is not sufficient for UI).

## Scenario A — Shell & Navigation (US1)

1. Open at 375px width: bottom tab bar shows Dashboard / Training / Gear / Settings with the active tab highlighted.
2. Resize to 1280px: bottom bar disappears, left sidebar appears; content centres under ~1100px max-width.
3. Visit every tab; confirm each renders and the active state tracks.
4. In Training: switch days, toggle session equipment, complete an exercise, view progress — all pre-redesign flows work.
5. In Settings: change a weight, save, confirm plan regenerates as before.
6. Confirm no colours outside the forest/bone palette appear.

## Scenario B — Existing Data Survives (US1 / FR-004)

1. With a profile that has history from the previous version, load the app.
2. Confirm: plan intact, completion history intact, custom exercises intact, equipment config intact.
3. DevTools → Application → localStorage: `advantage_schema_version` is `4`; `advantage_gear` exists with empty arrays; all other keys unmodified.

## Scenario C — Dashboard (US2)

1. With history present: dashboard shows (a) 8-week consistency chart, (b) today's progress with CTA that lands on Training, (c) streak stat, (d) gear panel.
2. Tap/click the Today CTA → arrives in Training on today's routine (≤ 2 interactions, SC-001).
3. At 1280px the panels form a 2-column grid; at 375px they stack single-column with nothing clipped.
4. Fresh profile (clear storage, redo setup): every panel shows a designed empty state with a call-to-action — no blank charts, no errors (SC-006).

## Scenario D — Gear Locker (US3)

1. Gear tab → "Add racket" → enter brand/model (+ optional specs) → racket appears as active. Under 60s including first restring (SC-002).
2. Open racket → "Record restring" → date, mains + tension; save. Detail shows it as current setup.
3. Record a second restring with a *hybrid* (different cross string/tension) → it becomes current; previous moves to history, newest first.
4. Backfill: add a restring dated before the others → it sorts by date, does **not** become current.
5. Retire a racket → leaves active list, history still viewable. Reactivate works.
6. Delete a racket → warning mentions history loss; after confirm, racket and history gone.
7. Dashboard gear panel reflects the active racket's days-since-restring (SC-003: answerable in < 10s from open).

## Scenario E — Offline & Performance

1. Load once, then go offline (DevTools → Network → Offline): full app remains usable (SC-007).
2. With a year of seeded history and 30+ restrings, dashboard paints in ~< 1s (SC-008).

## Regression Checklist (SC-005)

- [ ] Setup wizard completes for a fresh user
- [ ] Weekly plan generates and regenerates on config change
- [ ] Day tabs navigate; "· Today" only on the actual today
- [ ] Exercise completion persists across reload
- [ ] Session equipment toggle swaps exercises
- [ ] Exercise management (exclude / block category / custom exercise) works
- [ ] Progress: consistency chart + personal bests render
- [ ] `npm run test` green; `npx tsc --noEmit` clean
