import { useState } from 'react';
import { DumbbellInput } from './DumbbellInput';
import { KettlebellInput } from './KettlebellInput';
import { ResistanceBandInput } from './ResistanceBandInput';
import { DaySelector } from './DaySelector';
import { AestheticsDaySelector } from './AestheticsDaySelector';
import { Icon } from '../ui/Icon';
import { ExerciseManagement } from '../settings/ExerciseManagement';
import { useEquipment } from '../../hooks/useEquipment';
import type { DayOfWeek, ResistanceBandLevel, EquipmentType } from '../../types';

const EQUIPMENT_OPTIONS: { type: EquipmentType; label: string }[] = [
  { type: 'dumbbells', label: 'Dumbbells' },
  { type: 'resistance-bands', label: 'Resistance Bands' },
  { type: 'kettlebells', label: 'Kettlebells' },
  { type: 'bodyweight', label: 'Bodyweight' },
];

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  borderRadius: 18,
  padding: 18,
  boxShadow: 'var(--shadow-card)',
  marginBottom: 14,
};

export function SettingsView() {
  const { profile, saveConfig } = useEquipment();
  const [weights, setWeights] = useState<number[]>(profile?.dumbbellWeights ?? []);
  const [kettlebellWeights, setKettlebellWeights] = useState<number[]>(profile?.kettlebellWeights ?? []);
  const [resistanceBandLevels, setResistanceBandLevels] = useState<ResistanceBandLevel[]>(
    profile?.resistanceBandLevels ?? []
  );
  const [days, setDays] = useState<DayOfWeek[]>(profile?.trainingDays ?? []);
  const [aestheticsDays, setAestheticsDays] = useState<DayOfWeek[]>(profile?.aestheticsDays ?? []);
  const [defaultEquipmentTypes, setDefaultEquipmentTypes] = useState<EquipmentType[]>(
    profile?.defaultEquipmentTypes ?? (['dumbbells', 'bodyweight'] as EquipmentType[])
  );
  const [saved, setSaved] = useState(false);
  const [showExerciseManagement, setShowExerciseManagement] = useState(false);

  const canSave = weights.length >= 1 && days.length >= 3 && days.length <= 6;

  function handleSave() {
    if (!canSave) return;
    // Ensure bodyweight is always in the default equipment types
    const effectiveDefault: EquipmentType[] = defaultEquipmentTypes.includes('bodyweight')
      ? defaultEquipmentTypes
      : [...defaultEquipmentTypes, 'bodyweight' as EquipmentType];
    saveConfig(weights, kettlebellWeights, resistanceBandLevels, days, aestheticsDays, effectiveDefault);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function toggleDefaultEquipment(type: EquipmentType) {
    if (type === 'bodyweight') return; // always active
    if (defaultEquipmentTypes.includes(type)) {
      setDefaultEquipmentTypes(defaultEquipmentTypes.filter((t) => t !== type));
    } else {
      setDefaultEquipmentTypes([...defaultEquipmentTypes, type]);
    }
  }

  function isEquipmentOwned(type: EquipmentType): boolean {
    if (type === 'bodyweight') return true;
    if (type === 'dumbbells') return weights.length > 0;
    if (type === 'resistance-bands') return resistanceBandLevels.length > 0;
    if (type === 'kettlebells') return kettlebellWeights.length > 0;
    return false;
  }

  if (showExerciseManagement) {
    return <ExerciseManagement onBack={() => setShowExerciseManagement(false)} />;
  }

  return (
    <div className="mx-auto w-full" style={{ maxWidth: 640 }}>
      <h1
        style={{
          margin: '0 0 16px',
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--fg-primary)',
        }}
      >
        Settings
      </h1>

      {/* Dumbbells */}
      <div style={cardStyle}>
        <DumbbellInput weights={weights} onChange={setWeights} />
      </div>

      {/* Resistance Bands */}
      <div style={cardStyle}>
        <ResistanceBandInput selected={resistanceBandLevels} onChange={setResistanceBandLevels} />
      </div>

      {/* Kettlebells */}
      <div style={cardStyle}>
        <KettlebellInput weights={kettlebellWeights} onChange={setKettlebellWeights} />
      </div>

      {/* Training Days */}
      <div style={cardStyle}>
        <DaySelector selected={days} onChange={setDays} />
      </div>

      {/* Aesthetics Days */}
      <div style={cardStyle}>
        <AestheticsDaySelector
          trainingDays={days}
          selected={aestheticsDays}
          onChange={setAestheticsDays}
        />
      </div>

      {/* Default Equipment for Sessions */}
      <div style={cardStyle}>
        <p
          style={{
            margin: '0 0 12px',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--fg-primary)',
          }}
        >
          Default Equipment for Sessions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {EQUIPMENT_OPTIONS.filter((opt) => isEquipmentOwned(opt.type)).map(({ type, label }) => {
            const isBodyweight = type === 'bodyweight';
            const active = isBodyweight || defaultEquipmentTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleDefaultEquipment(type)}
                disabled={isBodyweight}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border-hairline)',
                  background: active ? 'var(--brand-soft)' : 'var(--bg-recessed)',
                  cursor: isBodyweight ? 'default' : 'pointer',
                  opacity: isBodyweight ? 0.7 : 1,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    fontWeight: 500,
                    color: active ? 'var(--color-forest-800)' : 'var(--fg-tertiary)',
                  }}
                >
                  {label}
                </span>
                <Icon
                  name={active ? 'check' : 'x'}
                  size={14}
                  style={{ color: active ? 'var(--brand)' : 'var(--fg-tertiary)' }}
                />
              </button>
            );
          })}
        </div>
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

      {/* Exercise Management link */}
      <button
        type="button"
        onClick={() => setShowExerciseManagement(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '16px 18px',
          borderRadius: 18,
          border: 'none',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-card)',
          cursor: 'pointer',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="dumbbell" size={20} />
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--fg-primary)',
            }}
          >
            Exercise Management
          </span>
        </div>
        <Icon name="chevron-right" size={18} />
      </button>

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
  );
}
