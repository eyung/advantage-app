import { useState } from 'react';
import { DumbbellInput } from './DumbbellInput';
import { DaySelector } from './DaySelector';
import { useEquipment } from '../../hooks/useEquipment';
import type { DayOfWeek } from '../../types';

export function SetupWizard() {
  const { saveConfig } = useEquipment();
  const [weights, setWeights] = useState<number[]>([]);
  const [days, setDays] = useState<DayOfWeek[]>([]);
  const [saving, setSaving] = useState(false);

  const canSave = weights.length >= 1 && days.length >= 3 && days.length <= 6;

  function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      saveConfig(weights, [], [], days, [], ['dumbbells', 'bodyweight']);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-y-auto"
      style={{ background: 'var(--bg-recessed)' }}
    >
      <div className="flex-1 flex flex-col max-w-[430px] mx-auto w-full px-6 py-10 space-y-6">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: 8 }}>
          <img src="/logo-mark.svg" alt="" height={56} width={56} className="mx-auto mb-4" />
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: 'var(--fg-primary)',
              margin: 0,
            }}
          >
            Welcome to Advantage
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              color: 'var(--fg-tertiary)',
              margin: '8px 0 0',
              lineHeight: 1.5,
            }}
          >
            Let's set up your weekly tennis training programme. Tell us what equipment you have and when you want to train.
          </p>
        </div>

        {/* Equipment */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 24,
            padding: 20,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <DumbbellInput weights={weights} onChange={setWeights} />
        </div>

        {/* Training days */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 24,
            padding: 20,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <DaySelector selected={days} onChange={setDays} />
        </div>

        {/* CTA */}
        <button
          type="button"
          disabled={!canSave || saving}
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '14px 0',
            borderRadius: 12,
            border: 'none',
            cursor: canSave ? 'pointer' : 'not-allowed',
            background: canSave ? 'var(--brand)' : 'var(--color-slate-200)',
            color: canSave ? 'white' : 'var(--color-slate-400)',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            fontWeight: 700,
            transition: 'all 200ms cubic-bezier(0.2,0,0,1)',
            boxShadow: canSave ? 'var(--shadow-sm)' : 'none',
          }}
        >
          {saving ? 'Generating your plan…' : 'Generate my plan'}
        </button>

        {!canSave && (
          <p
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              color: 'var(--fg-tertiary)',
              margin: 0,
            }}
          >
            {weights.length === 0
              ? 'Add at least one dumbbell weight to continue'
              : 'Select 3–6 training days to continue'}
          </p>
        )}
      </div>
    </div>
  );
}
