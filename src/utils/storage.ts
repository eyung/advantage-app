export const SCHEMA_VERSION = 1;

export const KEYS = {
  schemaVersion: 'advantage_schema_version',
  equipment: 'advantage_equipment',
  completions: 'advantage_completions',
} as const;

export function getStoredSchemaVersion(): number {
  const raw = localStorage.getItem(KEYS.schemaVersion);
  return raw ? parseInt(raw, 10) : 0;
}

export function setSchemaVersion(version: number): void {
  localStorage.setItem(KEYS.schemaVersion, String(version));
}

export function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function clearAll(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
