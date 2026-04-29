import type { ResistanceBandLevel } from '../../types';

const LEVELS: ResistanceBandLevel[] = ['Light', 'Medium', 'Heavy', 'Extra-Heavy'];

interface Props {
  selected: ResistanceBandLevel[];
  onChange: (levels: ResistanceBandLevel[]) => void;
}

export function ResistanceBandInput({ selected, onChange }: Props) {
  function toggle(level: ResistanceBandLevel) {
    if (selected.includes(level)) {
      onChange(selected.filter((l) => l !== level));
    } else {
      onChange([...selected, level]);
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
          Resistance Bands
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--fg-tertiary)',
          }}
        >
          Select the resistance levels you own
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {LEVELS.map((level) => {
          const active = selected.includes(level);
          return (
            <button
              key={level}
              type="button"
              onClick={() => toggle(level)}
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
              {level}
            </button>
          );
        })}
      </div>
    </div>
  );
}
