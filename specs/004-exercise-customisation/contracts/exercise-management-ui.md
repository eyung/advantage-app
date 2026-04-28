# Contract: ExerciseManagement UI Components

## Components

- `src/components/settings/ExerciseManagement.tsx`
- `src/components/settings/AddExerciseForm.tsx`

---

## ExerciseManagement

### Props

```typescript
interface Props {
  onBack: () => void;
}
```

### Sections

1. **Category sections** (one per `TennisCategory`, in display order: Lateral Agility, Rotational Power, Shoulder Stability, HIIT Stamina, General Strength):
   - Header row: category label (Fraunces font, eyebrow style) + block/unblock toggle
   - When blocked: section is muted (`var(--fg-tertiary)`); exercises list is hidden (collapsed)
   - When unblocked: exercise list is shown

2. **Exercise rows** (within each unblocked category section):
   - Exercise name
   - `[Custom]` badge in `var(--brand-soft)` bg if `CustomExercise`
   - Exclude/include toggle: `<Icon name="x" size={16}>` to exclude; `<Icon name="plus" size={16}>` to re-include; colour `var(--fg-tertiary)` / `var(--brand)` respectively
   - Delete button (`<Icon name="x" size={14}>` in destructive red) — shown only for custom exercises

3. **Add Exercise** button at bottom of each category section or global bottom:
   - Label: "Add exercise"
   - Icon: `<Icon name="plus" size={16}>`
   - Tapping opens `AddExerciseForm` with the category pre-selected

4. **Empty state**: if all 5 categories are blocked, show a warning banner: "No exercises available. Unblock at least one category to generate workouts."

### Design Tokens Used

- `var(--bg-surface)` card bg
- `var(--shadow-card)` card shadow
- `var(--brand)` active toggles
- `var(--fg-tertiary)` muted labels
- `var(--brand-soft)` custom badge bg
- `var(--font-display)` category headers
- `var(--font-mono)` exercise count badges

---

## AddExerciseForm

### Props

```typescript
interface Props {
  initialCategory?: TennisCategory;
  onSave: (name: string, category: TennisCategory) => void;
  onCancel: () => void;
}
```

### Fields

- **Name input**: text input, placeholder "Exercise name", max 60 chars. Required.
- **Category selector**: button group showing all 5 categories (single-select). Pre-selected to `initialCategory` if provided, otherwise user must select.

### Validation (on submit)

- Name is empty → show inline error "Name is required"
- Name matches existing exercise in same category (case-insensitive, built-in + custom) → show "An exercise with this name already exists in this category"
- Category not selected → show "Select a category"

### Behaviour

- `onSave(name, category)` called only when validation passes
- `onCancel()` called without any store mutation
- Caller is responsible for calling `customisationStore.addCustomExercise(name, category)`

---

## Inline Quick-Exclude on ExerciseCard

### ExerciseCard contract extension

Added prop: none (reads from `useCustomisationStore` directly)

### Visual specification

- A small secondary action in the top-right area of each exercise card (next to `CompletionBadge`)
- Default (not excluded) state: `<Icon name="x" size={14}>` in `var(--fg-tertiary)`; `aria-label="Exclude exercise"`
- Excluded state: card receives a muted overlay (`opacity: 0.5` on the content area); top-right shows `<Icon name="plus" size={14}>` in `var(--brand)`; `aria-label="Re-include exercise"`
- Button has no background (ghost style) — no filled circle or border
- Minimum tap target: 32×32 px via padding

### Interaction

- Tap quick-exclude → calls `customisationStore.excludeExercise(exerciseId)` → `planStore.applyCustomisation` is triggered via `useWeekPlan` effect
- Tap re-include → calls `customisationStore.includeExercise(exerciseId)` → same trigger
- While excluded, the card remains visible on the current rendered day (it was already planned); the regeneration takes effect on the *next* render cycle triggered by `customisationVersion` change
