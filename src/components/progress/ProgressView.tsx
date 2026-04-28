import { PersonalBestList } from './PersonalBestList';
import { ConsistencyChart } from './ConsistencyChart';
import { Icon } from '../ui/Icon';
import { useCompletionStore } from '../../store/completionStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { getCurrentISOWeek } from '../../utils/dateUtils';

const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--fg-tertiary)',
  margin: '0 0 10px 4px',
};

export function ProgressView() {
  const allCompletions = useCompletionStore((s) => s.completions);
  const profile = useEquipmentStore((s) => s.profile);

  const weekISO = getCurrentISOWeek();
  const thisWeekCompletions = allCompletions.filter((c) => c.weekISO === weekISO);
  const completedThisWeek = new Set(thisWeekCompletions.map((c) => c.date)).size;
  const plannedThisWeek = profile?.trainingDays.length ?? 0;

  const isEmpty = allCompletions.length === 0;

  if (isEmpty) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          textAlign: 'center',
          gap: 16,
        }}
      >
        <Icon name="chart" size={48} style={{ opacity: 0.2 }} />
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--fg-tertiary)',
            maxWidth: 260,
            margin: 0,
          }}
        >
          Complete your first training session and your progress will start tracking here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* This week summary */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 24,
          padding: 20,
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ ...eyebrow, margin: 0, marginBottom: 6 }}>This week</div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 40,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--fg-primary)',
              lineHeight: 1,
            }}
          >
            {completedThisWeek}
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 400,
                color: 'var(--fg-tertiary)',
                marginLeft: 4,
              }}
            >
              / {plannedThisWeek} sessions
            </span>
          </div>
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--brand-soft)',
            borderRadius: '50%',
          }}
        >
          <Icon name="bolt" size={22} />
        </div>
      </div>

      {/* Consistency chart */}
      <section>
        <h3 style={eyebrow}>Weekly consistency</h3>
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 24,
            padding: 20,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <ConsistencyChart />
        </div>
      </section>

      {/* Personal bests */}
      <section>
        <h3 style={eyebrow}>Personal bests</h3>
        <PersonalBestList />
      </section>
    </div>
  );
}
