import { Icon } from '../ui/Icon';
import { useCompletionStore } from '../../store/completionStore';
import { exerciseMap } from '../../data/exercises';

export function PersonalBestList() {
  const completions = useCompletionStore((s) => s.completions);

  if (completions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Icon name="trophy" size={32} style={{ opacity: 0.2 }} />
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-tertiary)', margin: 0 }}>
          Complete exercises to see your personal bests here
        </p>
      </div>
    );
  }

  const bests = new Map<string, { maxWeight: number; date: string }>();
  for (const c of completions) {
    if (c.weightKg === 0) continue;
    const existing = bests.get(c.exerciseId);
    if (!existing || c.weightKg > existing.maxWeight) {
      bests.set(c.exerciseId, { maxWeight: c.weightKg, date: c.date });
    }
  }

  if (bests.size === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-tertiary)', margin: 0 }}>
          No weighted exercises logged yet
        </p>
      </div>
    );
  }

  const sorted = [...bests.entries()].sort((a, b) => b[1].maxWeight - a[1].maxWeight);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sorted.map(([id, { maxWeight, date }]) => {
        const name = exerciseMap[id]?.name ?? id;
        return (
          <div
            key={id}
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 14,
              padding: '14px 18px',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--fg-primary)', margin: 0 }}>
                {name}
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-tertiary)', margin: '2px 0 0' }}>
                {date}
              </p>
            </div>
            <span
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                background: 'var(--brand-soft)',
                color: 'var(--color-forest-800)',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 600,
                flexShrink: 0,
                marginLeft: 12,
              }}
            >
              {maxWeight} kg
            </span>
          </div>
        );
      })}
    </div>
  );
}
