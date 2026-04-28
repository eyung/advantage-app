# Quickstart: Exercise Customisation

## Prerequisites

Same as existing app:

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Feature Scenarios

### Scenario 1: Inline Quick-Exclude

1. Open the app with a configured profile (equipment + training days set up).
2. Navigate to Today's workout tab.
3. On any exercise card, tap the `×` icon in the top-right area.
4. The exercise card visually dims (excluded state).
5. The remaining incomplete days should refresh within the same render cycle to show a replacement exercise in place of the excluded one.
6. Open Settings → Exercise Management; confirm the exercise appears with a "+" restore icon.
7. Tap the restore icon; confirm the exercise can appear again in future plans.

**Expected**: Completed exercises on today (if any were marked done) are not displaced. Only incomplete exercise slots change.

---

### Scenario 2: Per-Category Block

1. Open Settings → Exercise Management.
2. Toggle off the "HIIT Stamina" category.
3. Navigate back to Today's workout.
4. Confirm no HIIT Stamina exercises appear in today's incomplete workout.
5. All exercise slots are still filled (replacements from other categories).
6. Toggle HIIT Stamina back on; confirm exercises from that category can reappear.

---

### Scenario 3: Add Custom Exercise

1. Open Settings → Exercise Management.
2. Tap "Add exercise" (or the + button within a category section).
3. Enter name "Bulgarian Split Squat" and select "Lateral Agility" category.
4. Tap Save.
5. Confirm "Bulgarian Split Squat" appears in the Lateral Agility section.
6. Navigate to Today's workout; wait for regeneration of incomplete days.
7. Confirm "Bulgarian Split Squat" can appear in future lateral agility slots.

**Validation test**: Try to add another exercise named "bulgarian split squat" in Lateral Agility — expect a duplicate-name error message.

---

### Scenario 4: Completed Day Preserved

1. Mark all exercises on today's training day as complete.
2. Open Settings → Exercise Management and exclude one of the exercises you just completed.
3. Navigate back to Today's workout.
4. Confirm today's workout is unchanged (the exercise you excluded is still shown as completed).
5. Navigate to another incomplete training day; confirm the excluded exercise does not appear there.

---

### Scenario 5: Partial Day Preservation

1. Mark 2 of 5 exercises as complete on today's training day.
2. Exclude one of the remaining incomplete exercises.
3. Confirm the 2 completed exercises remain unchanged.
4. Confirm the excluded exercise is replaced by a different exercise in one of the incomplete slots.

---

## Key Design Tokens for New UI

```css
--brand:          #245236   /* active toggles, re-include icons */
--brand-soft:     #ebf1ed   /* [Custom] badge background */
--fg-tertiary:    #6f7a87   /* inactive icons, muted state */
--bg-surface:     #ffffff   /* card background */
--shadow-card:    ...       /* card shadow */
--font-display:   'Fraunces'  /* category headers */
--font-mono:      'JetBrains Mono'  /* count badges */
```

## Schema Version

This feature bumps the localStorage schema version from **1** to **2**. The migration runs automatically on first app load after updating. Existing equipment and completion data is preserved.

## TypeScript Verification

```bash
npx tsc --noEmit   # must pass with zero errors
npm run build      # must produce clean production build
```
