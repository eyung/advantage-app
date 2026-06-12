import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Racket, RestringRecord } from '../types';
import { KEYS } from '../utils/storage';

export const TENSION_MIN_LBS = 30;
export const TENSION_MAX_LBS = 80;

export interface NewRacket {
  brand: string;
  model: string;
  weightGrams?: number;
  headSizeSqIn?: number;
  gripSize?: string;
  notes?: string;
}

export interface NewRestring {
  racketId: string;
  date: string;
  mainString: string;
  mainTensionLbs: number;
  crossString?: string;
  crossTensionLbs?: number;
  stringer?: string;
  costDollars?: number;
  notes?: string;
}

export function validateRacketInput(input: NewRacket): string | null {
  if (!input.brand.trim()) return 'Brand is required';
  if (!input.model.trim()) return 'Model is required';
  return null;
}

export function validateRestringInput(input: NewRestring, todayISO: string): string | null {
  if (!input.mainString.trim()) return 'String name is required';
  if (
    !Number.isFinite(input.mainTensionLbs) ||
    input.mainTensionLbs < TENSION_MIN_LBS ||
    input.mainTensionLbs > TENSION_MAX_LBS
  ) {
    return `Tension must be between ${TENSION_MIN_LBS} and ${TENSION_MAX_LBS} lbs`;
  }
  if (
    input.crossTensionLbs !== undefined &&
    (!Number.isFinite(input.crossTensionLbs) ||
      input.crossTensionLbs < TENSION_MIN_LBS ||
      input.crossTensionLbs > TENSION_MAX_LBS)
  ) {
    return `Cross tension must be between ${TENSION_MIN_LBS} and ${TENSION_MAX_LBS} lbs`;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(new Date(input.date + 'T00:00:00').getTime())) {
    return 'Enter a valid date';
  }
  if (input.date > todayISO) return 'Restring date cannot be in the future';
  return null;
}

/** Latest restring for a racket — greatest date, ties broken by most recent entry. */
export function currentSetupFor(
  restrings: RestringRecord[],
  racketId: string
): RestringRecord | undefined {
  let best: RestringRecord | undefined;
  for (const r of restrings) {
    if (r.racketId !== racketId) continue;
    if (!best || r.date.localeCompare(best.date) >= 0) best = r;
  }
  return best;
}

/** Full restring history for a racket, newest first. */
export function historyFor(restrings: RestringRecord[], racketId: string): RestringRecord[] {
  return restrings
    .filter((r) => r.racketId === racketId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Whole days since the racket's current setup, or null if never strung. */
export function stringAgeDays(
  restrings: RestringRecord[],
  racketId: string,
  todayISO: string
): number | null {
  const current = currentSetupFor(restrings, racketId);
  if (!current) return null;
  const ms =
    new Date(todayISO + 'T00:00:00').getTime() - new Date(current.date + 'T00:00:00').getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

interface GearState {
  rackets: Racket[];
  restrings: RestringRecord[];
  addRacket: (input: NewRacket) => void;
  updateRacket: (id: string, patch: Partial<Omit<Racket, 'id' | 'createdAt'>>) => void;
  setRacketStatus: (id: string, status: Racket['status']) => void;
  deleteRacket: (id: string) => void;
  addRestring: (input: NewRestring) => void;
  deleteRestring: (id: string) => void;
}

export const useGearStore = create<GearState>()(
  persist(
    (set) => ({
      rackets: [],
      restrings: [],

      addRacket(input) {
        const racket: Racket = {
          id: uuidv4(),
          brand: input.brand.trim(),
          model: input.model.trim(),
          weightGrams: input.weightGrams,
          headSizeSqIn: input.headSizeSqIn,
          gripSize: input.gripSize?.trim() || undefined,
          notes: input.notes?.trim() || undefined,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ rackets: [...s.rackets, racket] }));
      },

      updateRacket(id, patch) {
        set((s) => ({
          rackets: s.rackets.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        }));
      },

      setRacketStatus(id, status) {
        set((s) => ({
          rackets: s.rackets.map((r) => (r.id === id ? { ...r, status } : r)),
        }));
      },

      deleteRacket(id) {
        set((s) => ({
          rackets: s.rackets.filter((r) => r.id !== id),
          restrings: s.restrings.filter((r) => r.racketId !== id),
        }));
      },

      addRestring(input) {
        const record: RestringRecord = {
          id: uuidv4(),
          racketId: input.racketId,
          date: input.date,
          mainString: input.mainString.trim(),
          mainTensionLbs: input.mainTensionLbs,
          crossString: input.crossString?.trim() || undefined,
          crossTensionLbs: input.crossTensionLbs,
          stringer: input.stringer?.trim() || undefined,
          costDollars: input.costDollars,
          notes: input.notes?.trim() || undefined,
        };
        set((s) => ({ restrings: [...s.restrings, record] }));
      },

      deleteRestring(id) {
        set((s) => ({ restrings: s.restrings.filter((r) => r.id !== id) }));
      },
    }),
    { name: KEYS.gear }
  )
);
