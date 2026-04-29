# Quickstart: Equipment Expansion

Manual browser validation scenarios. Run `npm run dev` and walk through each scenario.

---

## Scenario 1 — Configure Resistance Bands and Confirm Exercise Eligibility

1. Open Settings (gear icon).
2. In the "Resistance Bands" section, select "Medium" and "Heavy".
3. In the "Kettlebells" section, add 16 kg.
4. Tap "Save & regenerate plan".
5. Navigate to an incomplete training day.

**Expected**:
- At least one exercise in the plan uses resistance bands or a kettlebell.
- Band exercises show a weight like "15 kg (band)" or "30 kg (band)".
- Kettlebell exercises show "16 kg".
- No emoji anywhere on screen.

---

## Scenario 2 — Per-Session Equipment Override

1. Ensure dumbbells, Medium band, and 16 kg kettlebell are configured.
2. In the workout view, locate the "Today's equipment" bar.
3. Tap "Dumbbells" pill to deselect it. Tap "Kettlebell" pill to deselect it (bands + bodyweight only).
4. Observe the plan regenerate for today.

**Expected**:
- All exercises use only resistance band or bodyweight equipment.
- No dumbbell or kettlebell exercises appear.
- "Save as default" button appears.

5. Tap "Save as default". Reload the page.

**Expected**:
- "Today's equipment" bar still shows Bands + Bodyweight as active.
- Plan retains only band/bodyweight exercises.

---

## Scenario 3 — Aesthetics Day

1. Open Settings. In "Aesthetics Days", enable Wednesday.
2. Save.
3. Navigate to Wednesday's plan (or change device date to a Wednesday).

**Expected**:
- At least 1 of the 5 exercises has an aesthetics purpose (e.g., Band Bicep Curl, KB Goblet Squat, Band Squat, KB Press).
- On Tuesday (no aesthetics enabled), no aesthetics-exclusive exercises appear.

---

## Scenario 4 — Exercise Management Shows New Exercises

1. Open Settings → Exercise Management.
2. Expand each of the 5 category sections.

**Expected**:
- Band exercises (e.g., "Band Lateral Walk", "Band Pull-Apart") appear in their respective categories.
- Kettlebell exercises (e.g., "Kettlebell Swing", "Kettlebell Deadlift") appear in their categories.
- Each new exercise has a working exclude/include toggle.

---

## Scenario 5 — Custom Exercise with Aesthetics Tag

1. Open Settings → Exercise Management.
2. Under "General Strength", tap "Add exercise".
3. Enter name "Concentration Curl", category "General Strength".
4. Check "Aesthetics exercise".
5. Tap Save.

**Expected**:
- "Concentration Curl" appears in General Strength with a `[Custom]` badge.
- On an aesthetics-enabled day, "Concentration Curl" is eligible to appear in the plan.

---

## Scenario 6 — Bands-Only with No Bands Configured

1. Remove all resistance band levels from Settings (or use a fresh profile).
2. In the "Today's equipment" bar, try to select "Resistance Bands" only (deselect dumbbells + kettlebells).

**Expected**:
- If no bands configured: a prompt appears explaining "No resistance bands configured. Visit Settings to add band levels." 
- Plan falls back to bodyweight exercises.
- No crash or empty screen.

---

## Scenario 7 — Equipment Removal Removes Exercises from Plan

1. Configure a 24 kg kettlebell. Regenerate the plan. Observe a kettlebell exercise.
2. Open Settings, remove the 24 kg kettlebell (all kettlebell weights), save.

**Expected**:
- Kettlebell exercises no longer appear in the regenerated plan.
- If the session equipment bar had kettlebells active, it auto-hides that option.
