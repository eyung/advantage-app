import type { DayOfWeek, WeeklyPlan } from '../../types';

const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  plan: WeeklyPlan;
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  completedCounts: Record<DayOfWeek, number>;
}

export function DayTabBar({ plan, selectedDay, onSelectDay, completedCounts }: Props) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 bg-white">
      {ALL_DAYS.map((day) => {
        const dayPlan = plan.days[day];
        const isTraining = dayPlan.isTrainingDay;
        const exerciseCount = dayPlan.exercises.length;
        const doneCount = completedCounts[day] ?? 0;
        const allDone = isTraining && exerciseCount > 0 && doneCount >= exerciseCount;
        const isSelected = day === selectedDay;

        return (
          <button
            key={day}
            type="button"
            onClick={() => onSelectDay(day)}
            className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-3 text-xs font-semibold transition-colors relative ${
              isSelected
                ? 'text-clay border-b-2 border-clay -mb-px'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>{day}</span>
            {isTraining ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  allDone
                    ? 'bg-court-green text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {allDone ? '✓' : exerciseCount}
              </span>
            ) : (
              <span className="text-[10px] text-gray-300">rest</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
