import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EquipmentProfile, DayOfWeek } from '../types';

interface EquipmentState {
  profile: EquipmentProfile | null;
  saveConfig: (weights: number[], days: DayOfWeek[]) => void;
  isConfigured: () => boolean;
}

export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      profile: null,

      saveConfig(weights, days) {
        const current = get().profile;
        const sorted = [...weights].sort((a, b) => a - b);
        set({
          profile: {
            dumbbellWeights: sorted,
            trainingDays: days,
            configVersion: (current?.configVersion ?? 0) + 1,
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
