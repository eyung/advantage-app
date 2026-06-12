import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { RacketForm } from './RacketForm';
import { RacketDetail } from './RacketDetail';
import { EmptyPanel } from '../dashboard/EmptyPanel';
import { useGearStore, currentSetupFor, stringAgeDays } from '../../store/gearStore';
import { getTodayISO } from '../../utils/dateUtils';
import type { Racket } from '../../types';

function ageLabel(days: number | null): string {
  if (days === null) return 'Never strung';
  if (days === 0) return 'Restrung today';
  if (days === 1) return '1 day old strings';
  return `${days} days old strings`;
}

function RacketCard({ racket, onOpen }: { racket: Racket; onOpen: () => void }) {
  const restrings = useGearStore((s) => s.restrings);
  const setup = currentSetupFor(restrings, racket.id);
  const age = stringAgeDays(restrings, racket.id, getTodayISO());

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center justify-between text-left w-full"
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 18,
        padding: 18,
        boxShadow: 'var(--shadow-card)',
        border: 'none',
        cursor: 'pointer',
        opacity: racket.status === 'retired' ? 0.65 : 1,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--fg-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {racket.brand} {racket.model}
        </p>
        <p
          style={{
            margin: '4px 0 0',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--fg-tertiary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {setup ? `${setup.mainString} @ ${setup.mainTensionLbs} lbs` : 'No strings recorded'}
          {' · '}
          {ageLabel(age)}
        </p>
      </div>
      <Icon name="chevron-right" size={18} className="flex-shrink-0" style={{ opacity: 0.4, marginLeft: 12 }} />
    </button>
  );
}

export function GearView() {
  const rackets = useGearStore((s) => s.rackets);
  const addRacket = useGearStore((s) => s.addRacket);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [showRetired, setShowRetired] = useState(false);

  const active = rackets.filter((r) => r.status === 'active');
  const retired = rackets.filter((r) => r.status === 'retired');
  const selected = selectedId ? rackets.find((r) => r.id === selectedId) : undefined;

  return (
    <div className="mx-auto w-full" style={{ maxWidth: 640 }}>
      {selected ? (
        <RacketDetail racketId={selected.id} onBack={() => setSelectedId(null)} />
      ) : (
        <>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: 'var(--fg-primary)',
              }}
            >
              Gear
            </h1>
            {!adding && (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex items-center gap-1.5"
                style={{
                  padding: '9px 16px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'var(--brand)',
                  color: 'var(--fg-on-brand)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13.5,
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Icon name="plus" size={15} style={{ filter: 'invert(1)' }} />
                Add racket
              </button>
            )}
          </div>

          {adding && (
            <div style={{ marginBottom: 14 }}>
              <RacketForm
                onSubmit={(input) => {
                  addRacket(input);
                  setAdding(false);
                }}
                onCancel={() => setAdding(false)}
              />
            </div>
          )}

          {active.length === 0 && retired.length === 0 && !adding ? (
            <div
              style={{
                background: 'var(--bg-surface)',
                borderRadius: 24,
                padding: '40px 20px',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <EmptyPanel
                icon="racket"
                message="Your racket bag is empty. Add a racket to start tracking its strings and restring history."
                actionLabel="Add your first racket"
                onAction={() => setAdding(true)}
              />
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: 12 }}>
              {active.map((racket) => (
                <RacketCard key={racket.id} racket={racket} onOpen={() => setSelectedId(racket.id)} />
              ))}

              {retired.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowRetired((v) => !v)}
                    className="flex items-center gap-1.5"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 2px',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'var(--fg-tertiary)',
                    }}
                  >
                    <Icon
                      name="chevron-down"
                      size={14}
                      style={{ opacity: 0.6, transform: showRetired ? 'none' : 'rotate(-90deg)' }}
                    />
                    Retired ({retired.length})
                  </button>
                  {showRetired && (
                    <div className="flex flex-col" style={{ gap: 12, marginTop: 8 }}>
                      {retired.map((racket) => (
                        <RacketCard key={racket.id} racket={racket} onOpen={() => setSelectedId(racket.id)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
