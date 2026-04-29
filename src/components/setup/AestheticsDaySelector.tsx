import type { DayOfWeek } from '../../types';

interface Props {
  trainingDays: DayOfWeek[];
  selected: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

export function AestheticsDaySelector({ trainingDays, selected, onChange }: Props) {
  function toggle(day: DayOfWeek) {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day]);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <p
          style={{
            margin: '0 0 4px',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--fg-primary)',
          }}
        >
          Aesthetics Days
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--fg-tertiary)',
          }}
        >
          On these days, one exercise is aesthetics-focused
        </p>
      </div>

      {trainingDays.length === 0 ? (
        <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)' }}>
          Configure training days first
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {trainingDays.map((day) => {
            const active = selected.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggle(day)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: active ? 'none' : '1px solid var(--border-hairline)',
                  background: active ? 'var(--brand)' : 'var(--bg-surface)',
                  color: active ? 'white' : 'var(--fg-secondary)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
