import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { ExerciseCompletion, SessionSummary } from '../types';
import { getTodayISO, getCurrentISOWeek } from '../utils/dateUtils';
import { exerciseMap } from '../data/exercises';

interface CompletionState {
  completions: ExerciseCompletion[];
  addCompletion: (
    exerciseId: string,
    weightKg: number,
    setsCompleted: number,
    repsPerSet: number[]
  ) => void;
  removeCompletion: (exerciseId: string, date: string) => void;
  getCompletionsForWeek: (weekISO: string) => ExerciseCompletion[];
  getCompletionHistory: (exerciseId: string) => ExerciseCompletion[];
  getSessionSummary: (date: string) => SessionSummary;
}

export const useCompletionStore = create<CompletionState>()(
  persist(
    (set, get) => ({
      completions: [],

      addCompletion(exerciseId, weightKg, setsCompleted, repsPerSet) {
        const date = getTodayISO();
        const weekISO = getCurrentISOWeek();
        const record: ExerciseCompletion = {
          id: uuidv4(),
          exerciseId,
          date,
          weekISO,
          weightKg,
          setsCompleted,
          repsPerSet,
          completedAt: new Date().toISOString(),
        };
        set((s) => ({ completions: [...s.completions, record] }));
      },

      removeCompletion(exerciseId, date) {
        set((s) => ({
          completions: s.completions.filter(
            (c) => !(c.exerciseId === exerciseId && c.date === date)
          ),
        }));
      },

      getCompletionsForWeek(weekISO) {
        return get().completions.filter((c) => c.weekISO === weekISO);
      },

      getCompletionHistory(exerciseId) {
        return get()
          .completions.filter((c) => c.exerciseId === exerciseId)
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getSessionSummary(date) {
        const dayCompletions = get().completions.filter((c) => c.date === date);
        const exerciseIds = dayCompletions.map((c) => c.exerciseId);
        const muscleGroups = [
          ...new Set(
            exerciseIds
              .map((id) => exerciseMap[id]?.primaryMuscleGroup)
              .filter((g): g is NonNullable<typeof g> => g !== undefined)
          ),
        ];
        return { date, exerciseIds, muscleGroups };
      },
    }),
    { name: 'advantage_completions' }
  )
);
