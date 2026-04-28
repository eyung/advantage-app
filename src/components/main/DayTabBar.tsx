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
    <div
      className="grid flex-shrink-0"
      style={{
        gridTemplateColumns: 'repeat(7, 1fr)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-hairline)',
      }}
    >
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
            className="flex flex-col items-center"
            style={{
              padding: '12px 4px 10px',
              gap: 3,
              background: 'transparent',
              border: 'none',
              borderBottom: isSelected ? '2px solid var(--brand)' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 600,
                color: isSelected ? 'var(--fg-primary)' : 'var(--fg-tertiary)',
              }}
            >
              {day}
            </span>
            {isTraining ? (
              <span
                style={{
                  minWidth: 20,
                  height: 18,
                  padding: '0 6px',
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: allDone ? 'var(--color-success)' : 'var(--color-slate-100)',
                  color: allDone ? 'white' : 'var(--fg-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                {allDone ? '✓' : exerciseCount}
              </span>
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 10,
                  color: 'var(--fg-muted)',
                  fontStyle: 'italic',
                }}
              >
                rest
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
