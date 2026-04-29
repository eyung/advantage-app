import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EquipmentType } from '../types';
import { getTodayISO } from '../utils/dateUtils';

interface SessionEquipmentState {
  availableTypes: EquipmentType[];
  date: string;

  getAvailable: (defaultTypes: EquipmentType[]) => EquipmentType[];
  setAvailable: (types: EquipmentType[]) => void;
}

export const useSessionEquipmentStore = create<SessionEquipmentState>()(
  persist(
    (set, get) => ({
      availableTypes: ['dumbbells', 'bodyweight'],
      date: '',

      getAvailable(defaultTypes) {
        const { availableTypes, date } = get();
        const today = getTodayISO();
        if (date !== today) {
          set({ availableTypes: defaultTypes, date: today });
          return defaultTypes;
        }
        return availableTypes;
      },

      setAvailable(types) {
        const normalized: EquipmentType[] = types.includes('bodyweight')
          ? types
          : [...types, 'bodyweight'];
        set({ availableTypes: normalized, date: getTodayISO() });
      },
    }),
    { name: 'advantage_session_equipment' }
  )
);
