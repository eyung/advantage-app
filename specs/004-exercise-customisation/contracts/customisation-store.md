# Contract: CustomisationStore

## Component

`src/store/customisationStore.ts`

## Interface

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TennisCategory } from '../types';
import type { CustomExercise } from '../types';

interface CustomisationState {
  // State
  excludedExerciseIds: string[];
  blockedCategories: TennisCategory[];
  customExercises: CustomExercise[];
  customisationVersion: number;

  // Queries
  getProfile: () => { excludedExerciseIds: string[]; blockedCategories: TennisCategory[]; customisationVersion: number };
  isExcluded: (id: string) => boolean;
  isCategoryBlocked: (cat: TennisCategory) => boolean;

  // Mutations (each bumps customisationVersion)
  excludeExercise: (id: string) => void;
  includeExercise: (id: string) => void;
  blockCategory: (cat: TennisCategory) => void;
  unblockCategory: (cat: TennisCategory) => void;
  addCustomExercise: (name: string, category: TennisCategory) => CustomExercise;
  deleteCustomExercise: (id: string) => void;
}
```

## Behaviour

- `excludeExercise(id)`: idempotent — does nothing if id already in list
- `includeExercise(id)`: idempotent — does nothing if id not in list
- `blockCategory(cat)`: idempotent
- `unblockCategory(cat)`: idempotent; does NOT automatically include exercises in that category that were individually excluded
- `addCustomExercise(name, category)`: creates a `CustomExercise` using category defaults (see data-model.md); returns the created entity; does not validate uniqueness (caller must validate before calling)
- `deleteCustomExercise(id)`: also removes the exercise from `excludedExerciseIds` if present (cleanup)
- All mutations bump `customisationVersion` by 1

## Persistence

- Zustand `persist` middleware
- localStorage key: `advantage_customisation`
- Migrated in schema v2

## Constraints

- `customisationVersion` is monotonically increasing only — never reset to 0 after initialization
- `excludedExerciseIds` may contain IDs for exercises that no longer exist (custom exercises that were deleted); these orphan IDs are harmless and filtered out at pool-construction time
