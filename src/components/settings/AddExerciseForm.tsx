import { useState } from 'react';
import type { TennisCategory, Exercise } from '../../types';

const CATEGORY_ORDER: TennisCategory[] = [
  'lateral-agility',
  'rotational-power',
  'shoulder-stability',
  'hiit-stamina',
  'general-strength',
];

const CATEGORY_LABELS: Record<TennisCategory, string> = {
  'lateral-agility':    'Lateral Agility',
  'rotational-power':   'Rotational Power',
  'shoulder-stability': 'Shoulder Stability',
  'hiit-stamina':       'HIIT Stamina',
  'general-strength':   'General Strength',
};

interface Props {
  initialCategory?: TennisCategory;
  existingExercises: Exercise[];
  onSave: (name: string, category: TennisCategory) => void;
  onCancel: () => void;
}

export function AddExerciseForm({ initialCategory, existingExercises, onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TennisCategory | null>(initialCategory ?? null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required');
      return;
    }
    if (!category) {
      setError('Select a category');
      return;
    }
    const duplicate = existingExercises.some(
      (e) => e.category === category && e.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setError('An exercise with this name already exists in this category');
      return;
    }
    onSave(trimmed, category);
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--fg-primary)',
          margin: '0 0 16px',
        }}
      >
        Add Exercise
      </h2>

      {/* Name input */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--fg-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 6,
          }}
        >
          Exercise name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(null); }}
          maxLength={60}
          placeholder="e.g. Bulgarian Split Squat"
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid var(--border-hairline)',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            color: 'var(--fg-primary)',
            background: 'var(--bg-app)',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </div>

      {/* Category selector */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--fg-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 8,
          }}
        >
          Category
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => { setCategory(cat); setError(null); }}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                border: `1px solid ${category === cat ? 'var(--brand)' : 'var(--border-hairline)'}`,
                background: category === cat ? 'var(--brand-soft)' : 'transparent',
                color: category === cat ? 'var(--brand)' : 'var(--fg-secondary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: category === cat ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: '#a23a3a',
            marginBottom: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={handleSubmit}
          style={{
            flex: 1,
            padding: '11px 0',
            borderRadius: 12,
            border: 'none',
            background: 'var(--brand)',
            color: 'white',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '11px 0',
            borderRadius: 12,
            border: '1px solid var(--border-hairline)',
            background: 'transparent',
            color: 'var(--fg-secondary)',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
