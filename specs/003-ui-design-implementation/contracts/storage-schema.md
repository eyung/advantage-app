# Contract: Storage Schema

## Status

**Unchanged.** This feature makes no modifications to the localStorage schema.

## Existing keys (for reference)

| Key | Store | Schema version |
|-----|-------|----------------|
| `advantage-equipment` | `equipmentStore` | v1 — `{ profile: { dumbbellWeights: number[], trainingDays: DayOfWeek[] } }` |
| `advantage-completions` | `completionStore` | v1 — `{ completions: CompletionRecord[] }` |

## Migration

No migration required. If a future feature changes either schema, `src/utils/migration.ts` must be updated per the constitution's migration helper requirement.
