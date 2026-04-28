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
      saveConfig(weights, days);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-court-white flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl">🎾</div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Advantage</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Let's set up your weekly tennis training programme.
            Tell us what equipment you have and when you want to train.
          </p>
        </div>

        {/* Equipment */}
        <div className="bg-white rounded-2xl shadow-card p-5 space-y-1">
          <DumbbellInput weights={weights} onChange={setWeights} />
        </div>

        {/* Training days */}
        <div className="bg-white rounded-2xl shadow-card p-5 space-y-1">
          <DaySelector selected={days} onChange={setDays} />
        </div>

        {/* Save */}
        <button
          type="button"
          disabled={!canSave || saving}
          onClick={handleSave}
          className={`w-full rounded-xl py-4 text-base font-bold transition-all ${
            canSave
              ? 'bg-clay text-white shadow-sm hover:bg-clay-dark active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saving ? 'Generating your plan…' : 'Generate My Plan'}
        </button>

        {!canSave && (
          <p className="text-center text-xs text-gray-400">
            {weights.length === 0
              ? 'Add at least one dumbbell weight to continue'
              : 'Select 3–6 training days to continue'}
          </p>
        )}
      </div>
    </div>
  );
}
