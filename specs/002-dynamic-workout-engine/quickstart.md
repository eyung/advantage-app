# Quickstart: Dynamic Workout Engine — Dumbbell-Scaled Tennis Routines

**Generated**: 2026-04-27

---

## Prerequisites

- Node.js 20+
- npm 10+
- Existing project with Vite 5, React 18, TypeScript 5, Tailwind CSS 3, Zustand 4

---

## Run the Development Server

```bash
npm run dev
```

Expected: Vite dev server starts at `http://localhost:5173` (or next available port).

---

## First-Time User Flow

1. Open the app in a browser.
2. **Setup Wizard** appears full-screen (no navigation until saved).
3. Enter at least one dumbbell weight (e.g., `15`) and press **Add**.
4. Toggle 3–6 days of the week as training days.
5. Press **Save** — the wizard closes and the main weekly view appears.
6. The current day's tab is selected and exercises are listed.
7. Tap **Complete** on any exercise card — the card turns green and the state persists.

---

## Reconfigure Equipment

1. From the main view, tap the **Settings** gear icon.
2. Add a new weight or toggle training days.
3. Press **Save** — the plan regenerates immediately using the new config.
4. Navigate to **Progress** — all previously logged completions are still present.

---

## Production Build

```bash
npm run build
```

Output in `dist/`. Serve with any static file host (Vercel, GitHub Pages, `npx serve dist`).

---

## Validation Checklist

After running `npm run dev`, verify:

- [ ] App opens to SetupWizard on a fresh localStorage (open in a private tab to test)
- [ ] Wizard cannot be dismissed without entering ≥1 weight and selecting 3–6 days
- [ ] After saving, weekly view shows today's tab selected
- [ ] Training days show exercise cards; rest days show recovery message
- [ ] Tapping "Complete" marks the card done; reload the page and it stays done
- [ ] Changing equipment in Settings (add a weight) regenerates the plan
- [ ] Completions logged before the config change are visible in Progress

---

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `rally_equipment` | Equipment profile (dumbbells + training days) |
| `rally_completions` | All historical exercise completions |
| `rally_schema_version` | Migration sentinel |

To reset to first-time-user state for testing:

```javascript
// Run in browser devtools console
localStorage.removeItem('rally_equipment');
localStorage.removeItem('rally_completions');
location.reload();
```
