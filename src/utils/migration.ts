import { SCHEMA_VERSION, KEYS, getStoredSchemaVersion, setSchemaVersion } from './storage';

type RawData = Record<string, string>;
type MigrationFn = (data: RawData) => RawData;

const migrations: Record<number, MigrationFn> = {
  1: (data) => {
    if (!data[KEYS.completions]) {
      data[KEYS.completions] = JSON.stringify([]);
    }
    return data;
  },
  2: (data) => {
    if (!data[KEYS.customisation]) {
      data[KEYS.customisation] = JSON.stringify({
        state: {
          excludedExerciseIds: [],
          blockedCategories: [],
          customExercises: [],
          customisationVersion: 0,
        },
        version: 0,
      });
    }
    return data;
  },
  3: (data) => {
    if (data[KEYS.equipment]) {
      try {
        const raw = JSON.parse(data[KEYS.equipment]) as Record<string, unknown>;
        const hasState = 'state' in raw && typeof raw['state'] === 'object' && raw['state'] !== null;
        const state = hasState ? (raw['state'] as Record<string, unknown>) : raw;
        if (!('kettlebellWeights' in state)) state['kettlebellWeights'] = [];
        if (!('resistanceBandLevels' in state)) state['resistanceBandLevels'] = [];
        if (!('aestheticsDays' in state)) state['aestheticsDays'] = [];
        if (!('defaultEquipmentTypes' in state)) state['defaultEquipmentTypes'] = ['dumbbells', 'bodyweight'];
        data[KEYS.equipment] = hasState
          ? JSON.stringify({ ...raw, state })
          : JSON.stringify(state);
      } catch {
        // leave as-is
      }
    }
    if (!data[KEYS.sessionEquipment]) {
      data[KEYS.sessionEquipment] = JSON.stringify({
        availableTypes: ['dumbbells', 'bodyweight'],
        date: '',
      });
    }
    return data;
  },
  4: (data) => {
    if (!data[KEYS.gear]) {
      data[KEYS.gear] = JSON.stringify({
        state: { rackets: [], restrings: [] },
        version: 0,
      });
    }
    return data;
  },
};

export function runMigrationsIfNeeded(): void {
  const stored = getStoredSchemaVersion();
  if (stored >= SCHEMA_VERSION) return;

  try {
    let data: RawData = {};
    for (const key of Object.values(KEYS)) {
      const val = localStorage.getItem(key);
      if (val !== null) data[key] = val;
    }

    for (let v = stored + 1; v <= SCHEMA_VERSION; v++) {
      const migrate = migrations[v];
      if (migrate) data = migrate(data);
    }

    for (const [key, val] of Object.entries(data)) {
      localStorage.setItem(key, val);
    }

    setSchemaVersion(SCHEMA_VERSION);
  } catch (err) {
    console.warn('[advantage] Migration failed — preserving original data', err);
  }
}
