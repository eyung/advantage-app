import { useMemo } from 'react';
import { useEquipmentStore } from '../store/equipmentStore';
import { getCurrentWeekPlan } from '../engine/planGenerator';
import type { WeeklyPlan } from '../types';

export function useWeekPlan(): WeeklyPlan | null {
  const profile = useEquipmentStore((s) => s.profile);
  const configVersion = profile?.configVersion ?? 0;

  return useMemo(() => {
    if (!profile || profile.dumbbellWeights.length === 0 || profile.trainingDays.length < 3) {
      return null;
    }
    return getCurrentWeekPlan(profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configVersion]);
}
