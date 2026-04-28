import type { DayOfWeek } from '../../types';

const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  selected: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

export function DaySelector({ selected, onChange }: Props) {
  const selectedSet = new Set(selected);
  const count = selected.length;
  const valid = count >= 3 && count <= 6;

  function toggle(day: DayOfWeek) {
    if (selectedSet.has(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day]);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--fg-primary)',
          }}
        >
          Training days
        </label>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            color: valid ? 'var(--color-success)' : 'var(--fg-tertiary)',
          }}
        >
          {count} / 6{count < 3 ? ' · min 3' : ''}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 6,
        }}
      >
        {ALL_DAYS.map((day) => {
          const isOn = selectedSet.has(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              aria-pressed={isOn}
              style={{
                padding: '12px 0',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: isOn ? 'var(--brand)' : 'var(--bg-recessed)',
                color: isOn ? 'white' : 'var(--fg-secondary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 200ms cubic-bezier(0.2,0,0,1)',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {count > 6 && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: '#a23a3a',
            margin: 0,
          }}
        >
          Maximum 6 training days
        </p>
      )}
    </div>
  );
}
