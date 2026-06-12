import { Icon } from '../ui/Icon';
import { EmptyPanel } from './EmptyPanel';
import { useGearStore, currentSetupFor, stringAgeDays } from '../../store/gearStore';
import { getTodayISO } from '../../utils/dateUtils';
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

function ageLabel(days: number | null): string {
  if (days === null) return 'Never strung';
  if (days === 0) return 'Restrung today';
  if (days === 1) return '1 day since restring';
  return `${days} days since restring`;
}

interface Props {
  onNavigate: (area: AppArea) => void;
}

export function GearPanel({ onNavigate }: Props) {
  const rackets = useGearStore((s) => s.rackets);
  const restrings = useGearStore((s) => s.restrings);
  const active = rackets.filter((r) => r.status === 'active');
  const todayISO = getTodayISO();

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 24,
        padding: 20,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: active.length > 0 ? 4 : 0 }}>
        <p style={{ ...eyebrow, margin: 0 }}>Gear</p>
        {active.length > 0 && (
          <button
            type="button"
            onClick={() => onNavigate('gear')}
            className="flex items-center gap-1"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              fontFamily: 'var(--font-sans)',
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--brand)',
            }}
          >
            All gear
            <Icon name="chevron-right" size={14} />
          </button>
        )}
      </div>

      {active.length === 0 ? (
        <EmptyPanel
          icon="racket"
          message="Track your rackets and string setups to always know when a restring is due."
          actionLabel="Add your first racket"
          onAction={() => onNavigate('gear')}
        />
      ) : (
        <div className="flex flex-col" style={{ gap: 10, marginTop: 8 }}>
          {active.slice(0, 3).map((racket) => {
            const setup = currentSetupFor(restrings, racket.id);
            const age = stringAgeDays(restrings, racket.id, todayISO);
            return (
              <button
                key={racket.id}
                type="button"
                onClick={() => onNavigate('gear')}
                className="flex items-center justify-between text-left w-full"
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '1px solid var(--border-hairline)',
                  background: 'var(--bg-surface-2)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--fg-primary)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {racket.brand} {racket.model}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12,
                      color: 'var(--fg-tertiary)',
                      margin: '2px 0 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {setup ? `${setup.mainString} @ ${setup.mainTensionLbs} lbs` : 'No string setup yet'}
                  </p>
                </div>
                <span
                  className="flex-shrink-0"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: age !== null && age >= 60 ? 'var(--color-forest-800)' : 'var(--fg-tertiary)',
                    marginLeft: 12,
                  }}
                >
                  {ageLabel(age)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
