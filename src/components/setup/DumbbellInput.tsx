import { useState } from 'react';
import { Icon } from '../ui/Icon';

interface Props {
  weights: number[];
  onChange: (weights: number[]) => void;
}

export function DumbbellInput({ weights, onChange }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  function handleAdd() {
    const val = parseFloat(inputValue.trim());
    if (isNaN(val) || val <= 0) {
      setError('Enter a positive number');
      return;
    }
    if (weights.includes(val)) {
      setError(`${val} kg is already in your list`);
      return;
    }
    onChange([...weights, val].sort((a, b) => a - b));
    setInputValue('');
    setError('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--fg-primary)',
        }}
      >
        Available dumbbell weights (kg)
      </label>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="number"
          min="0.5"
          step="0.5"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 10"
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid var(--border-default)',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            outline: 'none',
            background: 'var(--bg-surface)',
            color: 'var(--fg-primary)',
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          style={{
            padding: '10px 18px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--brand)',
            color: 'white',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            fontWeight: 600,
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 200ms cubic-bezier(0.2,0,0,1)',
          }}
        >
          Add
        </button>
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#a23a3a', margin: 0 }}>
          {error}
        </p>
      )}

      {weights.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', margin: 0 }}>
          No weights added yet — add at least one
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {weights.map((w) => (
            <span
              key={w}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 999,
                background: 'var(--brand-soft)',
                color: 'var(--color-forest-800)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {w} kg
              <button
                type="button"
                onClick={() => onChange(weights.filter((x) => x !== w))}
                aria-label={`Remove ${w} kg`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  marginLeft: 2,
                  color: 'var(--color-forest-800)',
                  display: 'inline-flex',
                }}
              >
                <Icon name="x" size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
