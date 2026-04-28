# Data Model: Advantage Design System

No new data entities are introduced by this feature. The design system implementation is a pure visual layer change — the underlying TypeScript types, localStorage schema, and Zustand stores are unchanged.

## Existing entities (unchanged)

| Entity | Location | Notes |
|--------|----------|-------|
| `EquipmentProfile` | `src/types.ts` | `dumbbellWeights: number[]`, `trainingDays: DayOfWeek[]` |
| `PlannedExercise` | `src/types.ts` | `exerciseId`, `category`, `sets`, `reps`, `weightKg` |
| `WeeklyPlan` | `src/types.ts` | `days: Record<DayOfWeek, DayPlan>` |
| `DayPlan` | `src/types.ts` | `isTrainingDay: boolean`, `exercises: PlannedExercise[]` |
| `CompletionRecord` | `src/store/completionStore.ts` | `exerciseId`, `date`, `weekISO`, `weightKg`, `sets`, `reps` |

## New design-system entities

### Design Token (CSS custom property, not a TypeScript type)

Defined in `src/index.css`. Token families:

| Family | Variables | Example |
|--------|-----------|---------|
| Color — brand | `--brand`, `--brand-hover`, `--brand-soft` | `#245236` |
| Color — surface | `--bg-app`, `--bg-surface`, `--bg-recessed` | `#f7f5ee` |
| Color — text | `--fg-primary`, `--fg-secondary`, `--fg-tertiary`, `--fg-muted` | `#0e1f17` |
| Color — semantic | `--color-success`, `--color-forest-100/200/800/950`, `--color-slate-*` | — |
| Font | `--font-sans`, `--font-display`, `--font-mono` | `'Fraunces'` |
| Shadow | `--shadow-card`, `--shadow-card-hover`, `--shadow-sm` | — |
| Border | `--border-hairline`, `--border-default` | `#d8dee5` |

### Icon (static asset, not a TypeScript type)

15 SVG files in `public/icons/`. Consumed by `src/components/ui/Icon.tsx`.

| Name | Replaces |
|------|---------|
| `calendar.svg` | 📅 Today nav |
| `chart.svg` | 📊 Progress nav |
| `settings.svg` | ⚙️ Settings button |
| `moon.svg` | 😴 Rest day |
| `bolt.svg` | 💪 This week |
| `trophy.svg` | 🏆 Personal bests |
| `check.svg` | ✓ Done badge |
| `chevron-left.svg` | ← Back button |
| `x.svg` | × Remove weight tag |
| `activity`, `dumbbell`, `plus`, `spark`, `chevron-right`, `chevron-down` | General utility |
