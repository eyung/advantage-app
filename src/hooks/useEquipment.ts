import { useEquipmentStore } from '../store/equipmentStore';
import type { DayOfWeek } from '../types';

export function useEquipment() {
  const profile = useEquipmentStore((s) => s.profile);
  const saveConfig = useEquipmentStore((s) => s.saveConfig);
  const isConfigured = useEquipmentStore((s) => s.isConfigured)();

  function save(weights: number[], days: DayOfWeek[]) {
    if (weights.length === 0) throw new Error('At least one dumbbell weight required');
    if (days.length < 3 || days.length > 6) throw new Error('Select 3–6 training days');
    saveConfig(weights, days);
  }

  return { profile, isConfigured, saveConfig: save };
}
