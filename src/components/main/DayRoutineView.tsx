import { ExerciseCard } from '../exercise/ExerciseCard';
import { Icon } from '../ui/Icon';
import type { DayPlan } from '../../types';

interface Props {
  dayPlan: DayPlan;
  dayLabel: string;
  focused: boolean;
  isCompleted: (exerciseId: string) => boolean;
  onToggle: (exerciseId: string, weightKg: number, sets: number, reps: number) => void;
}

export function DayRoutineView({ dayPlan, dayLabel, focused, isCompleted, onToggle }: Props) {
  const opacity = focused ? 1 : 0.5;
  const transition = 'opacity 200ms cubic-bezier(0.2,0,0,1)';

  if (!dayPlan.isTrainingDay) {
    return (
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 24,
          padding: 24,
          marginBottom: 14,
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center',
          opacity,
          transition,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--fg-tertiary)',
            }}
          >
            {dayLabel}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--fg-muted)',
            }}
          >
            Rest day
          </span>
        </div>
        <div
          style={{
            padding: '20px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon name="moon" size={28} style={{ color: 'var(--fg-tertiary)', opacity: 0.6 }} />
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--fg-tertiary)',
              maxWidth: 240,
            }}
          >
            Recover well — your next session will be stronger for it.
          </p>
        </div>
      </div>
    );
  }

  // Empty pool state: training day has no exercises due to exclusions/blocks (FR-008)
  if (dayPlan.exercises.length === 0) {
    return (
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 24,
          padding: 24,
          marginBottom: 14,
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center',
          opacity,
          transition,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: focused ? 'var(--brand)' : 'var(--fg-tertiary)',
            }}
          >
            {dayLabel}{focused ? ' · Today' : ''}
          </span>
        </div>
        <div
          style={{
            padding: '20px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon name="spark" size={28} style={{ opacity: 0.5 }} />
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--fg-primary)',
            }}
          >
            No exercises available
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--fg-tertiary)',
              maxWidth: 260,
            }}
          >
            All exercises are excluded. Visit Settings → Exercise Management to restore some.
          </p>
        </div>
      </div>
    );
  }

  const total = dayPlan.exercises.length;
  const done = dayPlan.exercises.filter((e) => isCompleted(e.exerciseId)).length;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 24,
        padding: 20,
        marginBottom: 14,
        boxShadow: 'var(--shadow-card)',
        opacity,
        transition,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: focused ? 'var(--brand)' : 'var(--fg-tertiary)',
          }}
        >
          {dayLabel}{focused ? ' · Today' : ''}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 600,
            color: done >= total ? 'var(--color-success)' : 'var(--fg-tertiary)',
          }}
        >
          {done} / {total} done
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {dayPlan.exercises.map((ex) => (
          <ExerciseCard
            key={ex.exerciseId}
            exercise={ex}
            completed={isCompleted(ex.exerciseId)}
            onToggle={() => onToggle(ex.exerciseId, ex.weightKg, ex.sets, ex.reps)}
          />
        ))}
      </div>
    </div>
  );
}
