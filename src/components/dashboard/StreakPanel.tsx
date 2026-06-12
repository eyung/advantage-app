import { Icon } from '../ui/Icon';
import { useCompletionStore } from '../../store/completionStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { currentStreak } from '../../utils/streak';

const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--fg-tertiary)',
  margin: '0 0 10px',
};

export function StreakPanel() {
  const completions = useCompletionStore((s) => s.completions);
  const profile = useEquipmentStore((s) => s.profile);

  const streak = currentStreak(completions, profile?.trainingDays ?? [], new Date());

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 24,
        padding: 20,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <p style={eyebrow}>Streak</p>
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: streak > 0 ? 'var(--brand-soft)' : 'var(--bg-recessed)',
          }}
        >
          <Icon name="bolt" size={20} style={{ opacity: streak > 0 ? 1 : 0.4 }} />
        </div>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 30,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: 'var(--fg-primary)',
              margin: 0,
            }}
          >
            {streak}
            <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--fg-tertiary)' }}>
              {' '}
              {streak === 1 ? 'session' : 'sessions'}
            </span>
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12.5,
              color: 'var(--fg-tertiary)',
              margin: '3px 0 0',
            }}
          >
            {streak > 0
              ? 'Scheduled days in a row — keep it rolling.'
              : "Complete today's session to start a streak."}
          </p>
        </div>
      </div>
    </div>
  );
}
