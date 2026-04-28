import { useState } from 'react';
import { DumbbellInput } from './DumbbellInput';
import { DaySelector } from './DaySelector';
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
    <div className="min-h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 text-lg leading-none"
        >
          ←
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <DumbbellInput weights={weights} onChange={setWeights} />
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <DaySelector selected={days} onChange={setDays} />
        </div>

        <p className="text-xs text-gray-400 text-center px-2">
          Changing your configuration will regenerate your weekly plan. Your completion history is always preserved.
        </p>

        <button
          type="button"
          disabled={!canSave}
          onClick={handleSave}
          className={`w-full rounded-xl py-4 text-base font-bold transition-all ${
            saved
              ? 'bg-court-green text-white'
              : canSave
              ? 'bg-clay text-white hover:bg-clay-dark active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saved ? '✓ Plan regenerated!' : 'Save & Regenerate Plan'}
        </button>
      </div>
    </div>
  );
}
