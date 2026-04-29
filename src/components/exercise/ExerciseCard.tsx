import { Icon } from '../ui/Icon';
import type { PlannedExercise, TennisCategory } from '../../types';
import { exerciseMap } from '../../data/exercises';
import { useCustomisationStore } from '../../store/customisationStore';

const CATEGORY_META: Record<TennisCategory, { label: string; color: string }> = {
  'lateral-agility':    { label: 'Lateral Agility',    color: '#3e7d56' },
  'rotational-power':   { label: 'Rotational Power',   color: '#c98a2b' },
  'shoulder-stability': { label: 'Shoulder Stability', color: '#3f5d8c' },
  'hiit-stamina':       { label: 'HIIT Stamina',       color: '#a23a3a' },
  'general-strength':   { label: 'General Strength',   color: '#6e4e8c' },
};

interface Props {
  exercise: PlannedExercise;
  completed: boolean;
  onToggle: () => void;
}

export function ExerciseCard({ exercise, completed, onToggle }: Props) {
  const allExercises = useCustomisationStore((s) => s.customExercises);
  const isExcluded = useCustomisationStore((s) => s.isExcluded);
  const excludeExercise = useCustomisationStore((s) => s.excludeExercise);
  const includeExercise = useCustomisationStore((s) => s.includeExercise);

  const builtIn = exerciseMap[exercise.exerciseId];
  const custom = allExercises.find((e) => e.id === exercise.exerciseId);
  const name = builtIn?.name ?? custom?.name ?? exercise.exerciseId;

  const cat = CATEGORY_META[exercise.category];
  const isBand = builtIn?.equipment === 'resistance-band';
  const weightLabel =
    exercise.weightKg === 0
      ? 'Bodyweight'
      : isBand
      ? `${exercise.weightKg} kg (band)`
      : `${exercise.weightKg} kg`;
  const excluded = isExcluded(exercise.exerciseId);

  function handleExcludeToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (excluded) {
      includeExercise(exercise.exerciseId);
    } else {
      excludeExercise(exercise.exerciseId);
    }
  }

  return (
    <div
      style={{
        background: completed ? 'var(--color-forest-100)' : 'var(--bg-surface)',
        borderRadius: 18,
        padding: 18,
        boxShadow: completed
          ? 'var(--shadow-card), inset 3px 0 0 var(--brand)'
          : 'var(--shadow-card)',
        transition: 'all 200ms cubic-bezier(0.2,0,0,1)',
        opacity: excluded && !completed ? 0.6 : 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.25,
              color: completed ? 'var(--color-slate-400)' : 'var(--fg-primary)',
              textDecoration: completed ? 'line-through' : 'none',
            }}
          >
            {name}
          </div>
          {excluded && !completed && (
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                color: 'var(--fg-tertiary)',
                marginTop: 2,
              }}
            >
              Excluded — won't appear next time
            </div>
          )}
          <div style={{ marginTop: 6 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: 999,
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                border: `1px solid ${cat.color}`,
                color: cat.color,
                background: 'transparent',
              }}
            >
              {cat.label}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleExcludeToggle}
            aria-label={excluded ? 'Re-include exercise' : 'Exclude exercise'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              border: 'none',
              borderRadius: '50%',
              background: 'transparent',
              cursor: 'pointer',
              color: excluded ? 'var(--brand)' : 'var(--fg-tertiary)',
              padding: 0,
            }}
          >
            <Icon name={excluded ? 'plus' : 'x'} size={14} />
          </button>

          {completed && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 9px',
                borderRadius: 999,
                background: 'var(--color-success)',
                color: 'white',
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <Icon name="check" size={12} style={{ filter: 'brightness(0) invert(1)' }} />
              Done
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--fg-secondary)',
            minWidth: 0,
          }}
        >
          <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            <b style={{ color: 'var(--fg-primary)', fontWeight: 600 }}>{exercise.sets}</b> sets
          </span>
          <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            <b style={{ color: 'var(--fg-primary)', fontWeight: 600 }}>{exercise.reps}</b> reps
          </span>
          <span
            style={{
              display: 'inline-flex',
              padding: '3px 9px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              background: 'var(--brand-soft)',
              color: 'var(--color-forest-800)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {weightLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 600,
            padding: '7px 14px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            background: completed ? 'var(--bg-recessed)' : 'var(--brand)',
            color: completed ? 'var(--fg-secondary)' : 'white',
            transition: 'all 200ms cubic-bezier(0.2,0,0,1)',
            flexShrink: 0,
          }}
        >
          {completed ? 'Undo' : 'Complete'}
        </button>
      </div>
    </div>
  );
}
