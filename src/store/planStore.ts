import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WeeklyPlan,
  EquipmentProfile,
  ExerciseCompletion,
  CustomisationProfile,
  CustomExercise,
  DayOfWeek,
} from '../types';
import {
  generateWeeklyPlan,
  buildEligiblePool,
  buildTrainingDayFromPool,
  buildSlotsFromPool,
} from '../engine/planGenerator';
import { getExerciseLibrary } from '../data/exercises';
import { getCurrentISOWeek } from '../utils/dateUtils';

const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let z = Math.imul(s ^ (s >>> 15), 1 | s);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

interface PlanState {
  plan: WeeklyPlan | null;

  generateFresh: (
    profile: EquipmentProfile,
    customisation: CustomisationProfile,
    customExercises: CustomExercise[]
  ) => void;

  applyCustomisation: (
    profile: EquipmentProfile,
    customisation: CustomisationProfile,
    customExercises: CustomExercise[],
    completions: ExerciseCompletion[],
    weekDates: string[]
  ) => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plan: null,

      generateFresh(profile, customisation, customExercises) {
        const weekISO = getCurrentISOWeek();
        const plan = generateWeeklyPlan(profile, weekISO, customisation, customExercises);
        set({ plan });
      },

      applyCustomisation(profile, customisation, customExercises, completions, weekDates) {
        const { plan } = get();
        const weekISO = getCurrentISOWeek();

        const isStale =
          plan === null ||
          plan.weekISO !== weekISO ||
          plan.configVersion !== profile.configVersion;

        if (isStale) {
          const freshPlan = generateWeeklyPlan(profile, weekISO, customisation, customExercises);
          set({ plan: freshPlan });
          return;
        }

        const allExercises = getExerciseLibrary(customExercises);
        const pool = buildEligiblePool(allExercises, customisation);

        const updatedDays = { ...plan.days };
        let changed = false;

        for (let dayIndex = 0; dayIndex < ALL_DAYS.length; dayIndex++) {
          const day = ALL_DAYS[dayIndex]!;
          const dayPlan = plan.days[day];

          if (!dayPlan.isTrainingDay || dayPlan.exercises.length === 0) continue;

          const dayDate = weekDates[dayIndex];
          if (!dayDate) continue;

          const completedIds = new Set(
            completions.filter((c) => c.date === dayDate).map((c) => c.exerciseId)
          );

          if (completedIds.size >= dayPlan.exercises.length) {
            // Fully complete — preserve as-is
            continue;
          }

          if (completedIds.size === 0) {
            // Fully incomplete — regenerate entirely
            const seed = (profile.configVersion * 10000 + dayIndex * 100 + customisation.customisationVersion) >>> 0;
            const rand = mulberry32(seed);
            updatedDays[day] = buildTrainingDayFromPool(rand, pool, profile);
            changed = true;
          } else {
            // Partially complete — keep completed, replace incomplete slots
            updatedDays[day] = buildSlotsFromPool(
              customisation.customisationVersion,
              dayIndex,
              pool,
              profile,
              dayPlan,
              completedIds
            );
            changed = true;
          }
        }

        if (changed) {
          set({ plan: { ...plan, days: updatedDays } });
        }
      },
    }),
    { name: 'advantage_plan' }
  )
);
