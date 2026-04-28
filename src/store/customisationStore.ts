import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TennisCategory, CustomExercise, CustomisationProfile } from '../types';
import { CATEGORY_DEFAULTS } from '../data/exercises';

interface CustomisationState {
  excludedExerciseIds: string[];
  blockedCategories: TennisCategory[];
  customExercises: CustomExercise[];
  customisationVersion: number;

  getProfile: () => CustomisationProfile;
  isExcluded: (id: string) => boolean;
  isCategoryBlocked: (cat: TennisCategory) => boolean;

  excludeExercise: (id: string) => void;
  includeExercise: (id: string) => void;
  blockCategory: (cat: TennisCategory) => void;
  unblockCategory: (cat: TennisCategory) => void;
  addCustomExercise: (name: string, category: TennisCategory) => CustomExercise;
  deleteCustomExercise: (id: string) => void;
}

export const useCustomisationStore = create<CustomisationState>()(
  persist(
    (set, get) => ({
      excludedExerciseIds: [],
      blockedCategories: [],
      customExercises: [],
      customisationVersion: 0,

      getProfile() {
        const { excludedExerciseIds, blockedCategories, customisationVersion } = get();
        return { excludedExerciseIds, blockedCategories, customisationVersion };
      },

      isExcluded(id) {
        return get().excludedExerciseIds.includes(id);
      },

      isCategoryBlocked(cat) {
        return get().blockedCategories.includes(cat);
      },

      excludeExercise(id) {
        set((s) => {
          if (s.excludedExerciseIds.includes(id)) return s;
          return {
            excludedExerciseIds: [...s.excludedExerciseIds, id],
            customisationVersion: s.customisationVersion + 1,
          };
        });
      },

      includeExercise(id) {
        set((s) => ({
          excludedExerciseIds: s.excludedExerciseIds.filter((x) => x !== id),
          customisationVersion: s.customisationVersion + 1,
        }));
      },

      blockCategory(cat) {
        set((s) => {
          if (s.blockedCategories.includes(cat)) return s;
          return {
            blockedCategories: [...s.blockedCategories, cat],
            customisationVersion: s.customisationVersion + 1,
          };
        });
      },

      unblockCategory(cat) {
        set((s) => ({
          blockedCategories: s.blockedCategories.filter((c) => c !== cat),
          customisationVersion: s.customisationVersion + 1,
        }));
      },

      addCustomExercise(name, category) {
        const defaults = CATEGORY_DEFAULTS[category];
        const id = `custom-${crypto.randomUUID().slice(0, 8)}`;
        const exercise: CustomExercise = {
          id,
          name,
          category,
          equipment: defaults.equipment,
          primaryMuscleGroup: defaults.primaryMuscleGroup,
          defaultSets: defaults.defaultSets,
          defaultReps: defaults.defaultReps,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          customExercises: [...s.customExercises, exercise],
          customisationVersion: s.customisationVersion + 1,
        }));
        return exercise;
      },

      deleteCustomExercise(id) {
        set((s) => ({
          customExercises: s.customExercises.filter((e) => e.id !== id),
          excludedExerciseIds: s.excludedExerciseIds.filter((x) => x !== id),
          customisationVersion: s.customisationVersion + 1,
        }));
      },
    }),
    { name: 'advantage_customisation' }
  )
);
