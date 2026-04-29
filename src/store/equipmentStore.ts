import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EquipmentProfile, DayOfWeek, ResistanceBandLevel, EquipmentType } from '../types';

interface EquipmentState {
  profile: EquipmentProfile | null;
  saveConfig: (
    weights: number[],
    kettlebellWeights: number[],
    resistanceBandLevels: ResistanceBandLevel[],
    days: DayOfWeek[],
    aestheticsDays: DayOfWeek[],
    defaultEquipmentTypes: EquipmentType[]
  ) => void;
  saveDefaultEquipment: (types: EquipmentType[]) => void;
  isConfigured: () => boolean;
}

export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      profile: null,

      saveConfig(weights, kettlebellWeights, resistanceBandLevels, days, aestheticsDays, defaultEquipmentTypes) {
        const current = get().profile;
        const sorted = [...weights].sort((a, b) => a - b);
        const sortedKb = [...kettlebellWeights].sort((a, b) => a - b);
        set({
          profile: {
            dumbbellWeights: sorted,
            kettlebellWeights: sortedKb,
            resistanceBandLevels,
            trainingDays: days,
            aestheticsDays,
            defaultEquipmentTypes,
            configVersion: (current?.configVersion ?? 0) + 1,
            savedAt: new Date().toISOString(),
          },
        });
      },

      saveDefaultEquipment(types) {
        const current = get().profile;
        if (!current) return;
        set({
          profile: {
            ...current,
            defaultEquipmentTypes: types,
            configVersion: current.configVersion + 1,
            savedAt: new Date().toISOString(),
          },
        });
      },

      isConfigured() {
        const p = get().profile;
        return (
          p !== null &&
          p.dumbbellWeights.length >= 1 &&
          p.trainingDays.length >= 3 &&
          p.trainingDays.length <= 6
        );
      },
    }),
    { name: 'advantage_equipment' }
  )
);
