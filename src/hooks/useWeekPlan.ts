import { useEffect, useMemo } from 'react';
import { useEquipmentStore } from '../store/equipmentStore';
import { usePlanStore } from '../store/planStore';
import { useCustomisationStore } from '../store/customisationStore';
import { useCompletionStore } from '../store/completionStore';
import { getCurrentISOWeek, getWeekDates } from '../utils/dateUtils';
import type { WeeklyPlan } from '../types';

export function useWeekPlan(): WeeklyPlan | null {
  const profile = useEquipmentStore((s) => s.profile);
  const plan = usePlanStore((s) => s.plan);
  const generateFresh = usePlanStore((s) => s.generateFresh);
  const applyCustomisation = usePlanStore((s) => s.applyCustomisation);

  const customisationProfile = useCustomisationStore((s) => s.getProfile());
  const customExercises = useCustomisationStore((s) => s.customExercises);
  const customisationVersion = useCustomisationStore((s) => s.customisationVersion);

  const completions = useCompletionStore((s) => s.completions);

  const weekISO = getCurrentISOWeek();
  const weekDates = useMemo(() => getWeekDates(new Date()), [weekISO]);

  useEffect(() => {
    if (!profile || profile.dumbbellWeights.length === 0 || profile.trainingDays.length < 3) {
      return;
    }

    const isStale =
      plan === null ||
      plan.weekISO !== weekISO ||
      plan.configVersion !== profile.configVersion;

    if (isStale) {
      generateFresh(profile, customisationProfile, customExercises);
    } else {
      applyCustomisation(profile, customisationProfile, customExercises, completions, weekDates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.configVersion, customisationVersion, weekISO]);

  if (!profile || profile.dumbbellWeights.length === 0 || profile.trainingDays.length < 3) {
    return null;
  }

  return plan;
}
