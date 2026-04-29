import { useSessionEquipmentStore } from '../../store/sessionEquipmentStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import type { EquipmentProfile, EquipmentType } from '../../types';

const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  dumbbells: 'Dumbbells',
  'resistance-bands': 'Bands',
  kettlebells: 'Kettlebells',
  bodyweight: 'Bodyweight',
};

interface Props {
  profile: EquipmentProfile;
}

export function SessionEquipmentBar({ profile }: Props) {
  const getAvailable = useSessionEquipmentStore((s) => s.getAvailable);
  const setAvailable = useSessionEquipmentStore((s) => s.setAvailable);
  const availableTypes = useSessionEquipmentStore((s) => s.availableTypes);
  const sessionDate = useSessionEquipmentStore((s) => s.date);
  const saveDefaultEquipment = useEquipmentStore((s) => s.saveDefaultEquipment);

  const defaultTypes: EquipmentType[] = profile.defaultEquipmentTypes ?? ['dumbbells', 'bodyweight'];
  const current = getAvailable(defaultTypes);

  const ownedOptions: EquipmentType[] = (['dumbbells', 'resistance-bands', 'kettlebells', 'bodyweight'] as EquipmentType[]).filter(
    (t) => {
      if (t === 'bodyweight') return true;
      if (t === 'dumbbells') return profile.dumbbellWeights.length > 0;
      if (t === 'resistance-bands') return (profile.resistanceBandLevels ?? []).length > 0;
      if (t === 'kettlebells') return (profile.kettlebellWeights ?? []).length > 0;
      return false;
    }
  );

  function toggle(type: EquipmentType) {
    if (type === 'bodyweight') return;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setAvailable(next);
  }

  const isDirty =
    JSON.stringify([...current].sort()) !== JSON.stringify([...defaultTypes].sort());

  void sessionDate;
  void availableTypes;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 14,
        padding: '10px 14px',
        marginBottom: 12,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <p
        style={{
          margin: '0 0 8px',
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--fg-tertiary)',
        }}
      >
        Today's equipment
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {ownedOptions.map((type) => {
          const isBodyweight = type === 'bodyweight';
          const active = current.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggle(type)}
              disabled={isBodyweight}
              style={{
                padding: '5px 12px',
                borderRadius: 999,
                border: active ? 'none' : '1px solid var(--border-hairline)',
                background: active ? 'var(--brand)' : 'var(--bg-recessed)',
                color: active ? 'white' : 'var(--fg-tertiary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 600,
                cursor: isBodyweight ? 'default' : 'pointer',
                opacity: isBodyweight ? 0.7 : 1,
                transition: 'all 150ms cubic-bezier(0.2,0,0,1)',
              }}
            >
              {EQUIPMENT_LABELS[type]}
            </button>
          );
        })}

        {isDirty && (
          <button
            type="button"
            onClick={() => saveDefaultEquipment(current)}
            style={{
              marginLeft: 4,
              padding: '5px 10px',
              borderRadius: 999,
              border: '1px solid var(--border-hairline)',
              background: 'transparent',
              color: 'var(--fg-secondary)',
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Save as default
          </button>
        )}
      </div>
    </div>
  );
}
