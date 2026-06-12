import { Icon } from '../ui/Icon';
import { useWeekPlan } from '../../hooks/useWeekPlan';
import { useCompletions } from '../../hooks/useCompletions';
import { getTodayDayOfWeek } from '../../utils/dateUtils';
import type { AppArea } from '../shell/nav';

const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--fg-tertiary)',
  margin: '0 0 10px',
};

interface Props {
  onNavigate: (area: AppArea) => void;
}

export function TodayPanel({ onNavigate }: Props) {
  const plan = useWeekPlan();
  const { isCompleted } = useCompletions();
  const today = getTodayDayOfWeek();

  const dayPlan = plan?.days[today];
  const total = dayPlan?.exercises.length ?? 0;
  const done = dayPlan ? dayPlan.exercises.filter((e) => isCompleted(e.exerciseId)).length : 0;
  const allDone = total > 0 && done === total;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 24,
        padding: 20,
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <p style={eyebrow}>Today</p>

      {!dayPlan && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-tertiary)', margin: 0 }}>
          Preparing your plan…
        </p>
      )}

      {dayPlan && !dayPlan.isTrainingDay && (
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-recessed)' }}
          >
            <Icon name="moon" size={20} style={{ opacity: 0.6 }} />
          </div>
          <div>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 600,
                color: 'var(--fg-primary)',
                margin: 0,
              }}
            >
              Rest day
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-tertiary)', margin: '2px 0 0' }}>
              Recover well — your next session is waiting.
            </p>
          </div>
        </div>
      )}

      {dayPlan && dayPlan.isTrainingDay && (
        <>
          <div className="flex items-baseline gap-2" style={{ marginBottom: 12 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 38,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: 'var(--fg-primary)',
              }}
            >
              {done}
              <span style={{ fontSize: 18, fontWeight: 400, color: 'var(--fg-tertiary)' }}> / {total}</span>
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-tertiary)' }}>
              exercises done
            </span>
          </div>

          <div
            style={{
              height: 8,
              borderRadius: 999,
              background: 'var(--color-forest-100)',
              overflow: 'hidden',
              marginBottom: 16,
            }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                borderRadius: 999,
                background: allDone ? 'var(--color-success)' : 'var(--brand)',
                transition: 'width 300ms var(--ease-standard)',
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => onNavigate('training')}
            style={{
              alignSelf: 'flex-start',
              padding: '10px 18px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              background: allDone ? 'var(--brand-soft)' : 'var(--brand)',
              color: allDone ? 'var(--color-forest-800)' : 'var(--fg-on-brand)',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 600,
              boxShadow: allDone ? 'none' : 'var(--shadow-sm)',
            }}
          >
            {allDone ? 'Session complete — review' : done > 0 ? 'Continue session' : 'Start session'}
          </button>
        </>
      )}
    </div>
  );
}
