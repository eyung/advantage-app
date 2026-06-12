import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { RacketForm } from './RacketForm';
import { RestringForm } from './RestringForm';
import { useGearStore, currentSetupFor, historyFor, stringAgeDays } from '../../store/gearStore';
import { getTodayISO, formatShortDate } from '../../utils/dateUtils';
import type { RestringRecord } from '../../types';

const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--fg-tertiary)',
  margin: '0 0 10px',
};

const card: React.CSSProperties = {
  background: 'var(--bg-surface)',
  borderRadius: 18,
  padding: 18,
  boxShadow: 'var(--shadow-card)',
  marginBottom: 14,
};

function setupLabel(r: RestringRecord): string {
  const mains = `${r.mainString} @ ${r.mainTensionLbs} lbs`;
  if (!r.crossString && r.crossTensionLbs === undefined) return mains;
  const cross = `${r.crossString ?? r.mainString} @ ${r.crossTensionLbs ?? r.mainTensionLbs} lbs`;
  return `${mains} / ${cross}`;
}

interface Props {
  racketId: string;
  onBack: () => void;
}

export function RacketDetail({ racketId, onBack }: Props) {
  const rackets = useGearStore((s) => s.rackets);
  const restrings = useGearStore((s) => s.restrings);
  const updateRacket = useGearStore((s) => s.updateRacket);
  const setRacketStatus = useGearStore((s) => s.setRacketStatus);
  const deleteRacket = useGearStore((s) => s.deleteRacket);

  const [editing, setEditing] = useState(false);
  const [restringing, setRestringing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const racket = rackets.find((r) => r.id === racketId);
  if (!racket) {
    onBack();
    return null;
  }

  const setup = currentSetupFor(restrings, racket.id);
  const history = historyFor(restrings, racket.id);
  const age = stringAgeDays(restrings, racket.id, getTodayISO());

  const specs = [
    racket.weightGrams ? `${racket.weightGrams} g` : null,
    racket.headSizeSqIn ? `${racket.headSizeSqIn} sq in` : null,
    racket.gripSize ? `Grip ${racket.gripSize}` : null,
  ].filter(Boolean);

  if (editing) {
    return (
      <RacketForm
        initial={racket}
        onSubmit={(input) => {
          updateRacket(racket.id, {
            brand: input.brand.trim(),
            model: input.model.trim(),
            weightGrams: input.weightGrams,
            headSizeSqIn: input.headSizeSqIn,
            gripSize: input.gripSize?.trim() || undefined,
            notes: input.notes?.trim() || undefined,
          });
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to gear"
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{ width: 36, height: 36, background: 'var(--bg-surface)', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
        >
          <Icon name="chevron-left" size={18} />
        </button>
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: 'var(--fg-primary)',
            }}
          >
            {racket.brand} {racket.model}
          </h2>
          {specs.length > 0 && (
            <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--fg-tertiary)' }}>
              {specs.join(' · ')}
              {racket.status === 'retired' ? ' · Retired' : ''}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{
            marginLeft: 'auto',
            padding: '8px 14px',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--bg-surface)',
            boxShadow: 'var(--shadow-sm)',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--fg-secondary)',
            flexShrink: 0,
          }}
        >
          Edit
        </button>
      </div>

      {/* Current setup */}
      <div style={card}>
        <p style={eyebrow}>Current strings</p>
        {setup ? (
          <>
            <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--fg-primary)' }}>
              {setupLabel(setup)}
            </p>
            <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'var(--fg-tertiary)' }}>
              Strung {formatShortDate(setup.date)}
              {age !== null ? ` — ${age === 0 ? 'today' : age === 1 ? '1 day ago' : `${age} days ago`}` : ''}
              {setup.stringer ? ` by ${setup.stringer}` : ''}
            </p>
          </>
        ) : (
          <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-tertiary)' }}>
            No string setup recorded yet.
          </p>
        )}

        <div style={{ marginTop: 14 }}>
          {restringing ? (
            <RestringForm
              racketId={racket.id}
              onDone={() => setRestringing(false)}
              onCancel={() => setRestringing(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setRestringing(true)}
              className="flex items-center gap-1.5"
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: 'var(--brand)',
                color: 'var(--fg-on-brand)',
                fontFamily: 'var(--font-sans)',
                fontSize: 13.5,
                fontWeight: 600,
              }}
            >
              <Icon name="plus" size={15} style={{ filter: 'invert(1)' }} />
              Record restring
            </button>
          )}
        </div>
      </div>

      {/* History */}
      <div style={card}>
        <p style={eyebrow}>Restring history</p>
        {history.length === 0 ? (
          <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-tertiary)' }}>
            Restrings you record will be listed here, newest first.
          </p>
        ) : (
          <div className="flex flex-col" style={{ gap: 10 }}>
            {history.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-hairline)',
                }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-primary)' }}>
                    {setupLabel(r)}
                  </p>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--fg-tertiary)', flexShrink: 0 }}>
                    {formatShortDate(r.date)}
                  </span>
                </div>
                {(r.stringer || r.costDollars !== undefined || r.notes) && (
                  <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-tertiary)' }}>
                    {[r.stringer, r.costDollars !== undefined ? `$${r.costDollars}` : null, r.notes]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manage */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRacketStatus(racket.id, racket.status === 'active' ? 'retired' : 'active')}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            border: '1px solid var(--border-hairline)',
            cursor: 'pointer',
            background: 'var(--bg-surface)',
            color: 'var(--fg-secondary)',
            fontFamily: 'var(--font-sans)',
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          {racket.status === 'active' ? 'Retire racket' : 'Reactivate racket'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!confirmingDelete) {
              setConfirmingDelete(true);
              return;
            }
            deleteRacket(racket.id);
            onBack();
          }}
          onBlur={() => setConfirmingDelete(false)}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            border: '1px solid ' + (confirmingDelete ? '#b3402a' : 'var(--border-hairline)'),
            cursor: 'pointer',
            background: confirmingDelete ? '#b3402a' : 'var(--bg-surface)',
            color: confirmingDelete ? '#fff' : '#b3402a',
            fontFamily: 'var(--font-sans)',
            fontSize: 13.5,
            fontWeight: 600,
            transition: 'all 150ms var(--ease-standard)',
          }}
        >
          {confirmingDelete ? 'Tap again — deletes restring history too' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
