import { useState } from 'react';
import { DumbbellInput } from './DumbbellInput';
import { DaySelector } from './DaySelector';
import { Icon } from '../ui/Icon';
import { useEquipment } from '../../hooks/useEquipment';
import type { DayOfWeek } from '../../types';

interface Props {
  onClose: () => void;
}

export function SettingsView({ onClose }: Props) {
  const { profile, saveConfig } = useEquipment();
  const [weights, setWeights] = useState<number[]>(profile?.dumbbellWeights ?? []);
  const [days, setDays] = useState<DayOfWeek[]>(profile?.trainingDays ?? []);
  const [saved, setSaved] = useState(false);

  const canSave = weights.length >= 1 && days.length >= 3 && days.length <= 6;

  function handleSave() {
    if (!canSave) return;
    saveConfig(weights, days);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <header
        className="flex items-center gap-2 flex-shrink-0"
        style={{
          height: 56,
          padding: '0 8px 0 4px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-hairline)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="flex items-center justify-center rounded-full"
          style={{
            width: 40,
            height: 40,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--fg-secondary)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon name="chevron-left" size={20} />
        </button>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--fg-primary)',
          }}
        >
          Settings
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto" style={{ padding: 16 }}>
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 18,
            padding: 18,
            boxShadow: 'var(--shadow-card)',
            marginBottom: 14,
          }}
        >
          <DumbbellInput weights={weights} onChange={setWeights} />
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 18,
            padding: 18,
            boxShadow: 'var(--shadow-card)',
            marginBottom: 14,
          }}
        >
          <DaySelector selected={days} onChange={setDays} />
        </div>

        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--fg-tertiary)',
            margin: '8px 12px 16px',
          }}
        >
          Changing your configuration will regenerate your weekly plan. Your completion history is always preserved.
        </p>

        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '14px 0',
            borderRadius: 12,
            border: 'none',
            cursor: canSave ? 'pointer' : 'not-allowed',
            background: saved
              ? 'var(--color-success)'
              : canSave
              ? 'var(--brand)'
              : 'var(--color-slate-200)',
            color: canSave || saved ? 'white' : 'var(--color-slate-400)',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            fontWeight: 700,
            transition: 'all 200ms cubic-bezier(0.2,0,0,1)',
          }}
        >
          {saved ? 'Plan regenerated' : 'Save & regenerate plan'}
        </button>
      </div>
    </div>
  );
}
