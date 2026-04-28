import { PersonalBestList } from './PersonalBestList';
import { ConsistencyChart } from './ConsistencyChart';
import { useCompletionStore } from '../../store/completionStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { getCurrentISOWeek } from '../../utils/dateUtils';

export function ProgressView() {
  const allCompletions = useCompletionStore((s) => s.completions);
  const profile = useEquipmentStore((s) => s.profile);

  const weekISO = getCurrentISOWeek();
  const thisWeekCompletions = allCompletions.filter((c) => c.weekISO === weekISO);
  const completedThisWeek = new Set(thisWeekCompletions.map((c) => c.date)).size;
  const plannedThisWeek = profile?.trainingDays.length ?? 0;

  const isEmpty = allCompletions.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
        <div className="text-6xl">🎾</div>
        <h2 className="text-xl font-bold text-gray-800">No history yet</h2>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          Complete your first training session and your progress will start tracking here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* This week summary */}
      <div className="bg-white rounded-2xl shadow-card p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">This Week</p>
          <p className="text-2xl font-bold text-gray-900">
            {completedThisWeek}
            <span className="text-base font-normal text-gray-400"> / {plannedThisWeek} sessions</span>
          </p>
        </div>
        <div className="text-3xl">{completedThisWeek >= plannedThisWeek && plannedThisWeek > 0 ? '🏆' : '💪'}</div>
      </div>

      {/* Consistency chart */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-700 px-1">Weekly Consistency</h3>
        <div className="bg-white rounded-2xl shadow-card p-4">
          <ConsistencyChart />
        </div>
      </section>

      {/* Personal bests */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-700 px-1">Personal Bests</h3>
        <PersonalBestList />
      </section>
    </div>
  );
}
