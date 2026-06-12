import { useState } from 'react';
import { DayTabBar } from '../main/DayTabBar';
import { DayRoutineView } from '../main/DayRoutineView';
import { SessionEquipmentBar } from '../main/SessionEquipmentBar';
import { ProgressView } from '../progress/ProgressView';
import { useWeekPlan } from '../../hooks/useWeekPlan';
import { useCompletions } from '../../hooks/useCompletions';
import { useEquipmentStore } from '../../store/equipmentStore';
import { getTodayDayOfWeek } from '../../utils/dateUtils';
import type { DayOfWeek } from '../../types';

const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Mode = 'plan' | 'progress';

export function TrainingView() {
  const plan = useWeekPlan();
  const { isCompleted, toggleCompletion } = useCompletions();
  const profile = useEquipmentStore((s) => s.profile);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayDayOfWeek);
  const [mode, setMode] = useState<Mode>('plan');

  const completedCounts = ALL_DAYS.reduce((acc, day) => {
    if (!plan) {
      acc[day] = 0;
      return acc;
    }
    const exercises = plan.days[day].exercises;
    acc[day] = exercises.filter((e) => isCompleted(e.exerciseId)).length;
    return acc;
  }, {} as Record<DayOfWeek, number>);

  // 3-day window: prev / selected / next
  const selectedIdx = ALL_DAYS.indexOf(selectedDay);
  const visibleDays: DayOfWeek[] = [];
  if (selectedIdx > 0) visibleDays.push(ALL_DAYS[selectedIdx - 1]!);
  visibleDays.push(selectedDay);
  if (selectedIdx < ALL_DAYS.length - 1) visibleDays.push(ALL_DAYS[selectedIdx + 1]!);

  return (
    <div className="mx-auto w-full" style={{ maxWidth: 640 }}>
      {/* Title + mode switch */}
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--fg-primary)',
          }}
        >
          Training
        </h1>
        <div
          className="flex"
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 999,
            padding: 3,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {(['plan', 'progress'] as Mode[]).map((m) => {
            const isActive = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  fontWeight: 600,
                  background: isActive ? 'var(--brand)' : 'transparent',
                  color: isActive ? 'var(--fg-on-brand)' : 'var(--fg-tertiary)',
                  transition: 'all 150ms var(--ease-standard)',
                }}
              >
                {m === 'plan' ? 'Week plan' : 'Progress'}
              </button>
            );
          })}
        </div>
      </div>

      {mode === 'plan' && plan && (
        <>
          <DayTabBar
            plan={plan}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            completedCounts={completedCounts}
          />
          <div style={{ paddingTop: 14 }}>
            {profile && <SessionEquipmentBar profile={profile} />}
            {visibleDays.map((day) => (
              <DayRoutineView
                key={day}
                dayPlan={plan.days[day]}
                dayLabel={day}
                focused={day === selectedDay}
                isToday={day === getTodayDayOfWeek()}
                isCompleted={(id) => isCompleted(id)}
                onToggle={(id, wkg, sets, reps) => toggleCompletion(id, wkg, sets, reps)}
              />
            ))}
          </div>
        </>
      )}

      {mode === 'progress' && (
        <div style={{ paddingTop: 4 }}>
          <ProgressView />
        </div>
      )}
    </div>
  );
}
