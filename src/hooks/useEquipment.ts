import { useEquipmentStore } from '../store/equipmentStore';
import type { DayOfWeek, ResistanceBandLevel, EquipmentType } from '../types';

export function useEquipment() {
  const profile = useEquipmentStore((s) => s.profile);
  const saveConfig = useEquipmentStore((s) => s.saveConfig);
  const saveDefaultEquipment = useEquipmentStore((s) => s.saveDefaultEquipment);
  const isConfigured = useEquipmentStore((s) => s.isConfigured)();

  function save(
    weights: number[],
    kettlebellWeights: number[],
    resistanceBandLevels: ResistanceBandLevel[],
    days: DayOfWeek[],
    aestheticsDays: DayOfWeek[],
    defaultEquipmentTypes: EquipmentType[]
  ) {
    if (weights.length === 0) throw new Error('At least one dumbbell weight required');
    if (days.length < 3 || days.length > 6) throw new Error('Select 3–6 training days');
    saveConfig(weights, kettlebellWeights, resistanceBandLevels, days, aestheticsDays, defaultEquipmentTypes);
  }

  return {
    profile,
    isConfigured,
    saveConfig: save,
    saveDefaultEquipment,
  };
}
