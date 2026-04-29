import { useEffect, useMemo } from 'react';
import { useEquipmentStore } from '../store/equipmentStore';
import { usePlanStore } from '../store/planStore';
import { useCustomisationStore } from '../store/customisationStore';
import { useCompletionStore } from '../store/completionStore';
import { useSessionEquipmentStore } from '../store/sessionEquipmentStore';
import { getCurrentISOWeek, getWeekDates } from '../utils/dateUtils';
import type { WeeklyPlan, EquipmentType } from '../types';

export function useWeekPlan(): WeeklyPlan | null {
  const profile = useEquipmentStore((s) => s.profile);
  const plan = usePlanStore((s) => s.plan);
  const generateFresh = usePlanStore((s) => s.generateFresh);
  const applyCustomisation = usePlanStore((s) => s.applyCustomisation);

  const customisationProfile = useCustomisationStore((s) => s.getProfile());
  const customExercises = useCustomisationStore((s) => s.customExercises);
  const customisationVersion = useCustomisationStore((s) => s.customisationVersion);

  const completions = useCompletionStore((s) => s.completions);

  const getAvailable = useSessionEquipmentStore((s) => s.getAvailable);
  const sessionAvailableTypes = useSessionEquipmentStore((s) => s.availableTypes);
  const sessionDate = useSessionEquipmentStore((s) => s.date);

  const weekISO = getCurrentISOWeek();
  const weekDates = useMemo(() => getWeekDates(new Date()), [weekISO]);

  useEffect(() => {
    if (!profile || profile.dumbbellWeights.length === 0 || profile.trainingDays.length < 3) {
      return;
    }

    const defaultTypes: EquipmentType[] = profile.defaultEquipmentTypes ?? ['dumbbells', 'bodyweight'];
    const availableEquipmentTypes = getAvailable(defaultTypes);

    const isStale =
      plan === null ||
      plan.weekISO !== weekISO ||
      plan.configVersion !== profile.configVersion;

    if (isStale) {
      generateFresh(profile, customisationProfile, customExercises, availableEquipmentTypes);
    } else {
      applyCustomisation(
        profile,
        customisationProfile,
        customExercises,
        completions,
        weekDates,
        availableEquipmentTypes
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.configVersion, customisationVersion, weekISO, sessionAvailableTypes, sessionDate]);

  if (!profile || profile.dumbbellWeights.length === 0 || profile.trainingDays.length < 3) {
    return null;
  }

  return plan;
}
