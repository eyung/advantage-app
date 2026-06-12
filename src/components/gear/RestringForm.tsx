import { useState } from 'react';
import { useGearStore, validateRestringInput, type NewRestring } from '../../store/gearStore';
import { getTodayISO } from '../../utils/dateUtils';

const label: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--fg-secondary)',
  marginBottom: 6,
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--border-default)',
  background: 'var(--bg-surface)',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: 'var(--fg-primary)',
};

interface Props {
  racketId: string;
  onDone: () => void;
  onCancel: () => void;
}

export function RestringForm({ racketId, onDone, onCancel }: Props) {
  const addRestring = useGearStore((s) => s.addRestring);
  const [date, setDate] = useState(getTodayISO());
  const [mainString, setMainString] = useState('');
  const [mainTension, setMainTension] = useState('');
  const [hybrid, setHybrid] = useState(false);
  const [crossString, setCrossString] = useState('');
  const [crossTension, setCrossTension] = useState('');
  const [stringer, setStringer] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: NewRestring = {
      racketId,
      date,
      mainString,
      mainTensionLbs: Number(mainTension),
      crossString: hybrid && crossString ? crossString : undefined,
      crossTensionLbs: hybrid && crossTension ? Number(crossTension) : undefined,
      stringer: stringer || undefined,
      costDollars: cost ? Number(cost) : undefined,
      notes: notes || undefined,
    };
    const err = validateRestringInput(payload, getTodayISO());
    if (err) {
      setError(err);
      return;
    }
    addRestring(payload);
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-surface-2)',
        borderRadius: 14,
        padding: 16,
        border: '1px solid var(--border-hairline)',
      }}
    >
      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 12 }}>
        <div>
          <label style={label} htmlFor="rs-date">Date *</label>
          <input id="rs-date" style={input} type="date" max={getTodayISO()} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label style={label} htmlFor="rs-stringer">Strung by</label>
          <input id="rs-stringer" style={input} value={stringer} onChange={(e) => setStringer(e.target.value)} placeholder="Pro shop" />
        </div>
        <div>
          <label style={label} htmlFor="rs-main">{hybrid ? 'Main string *' : 'String *'}</label>
          <input id="rs-main" style={input} value={mainString} onChange={(e) => setMainString(e.target.value)} placeholder="Luxilon ALU Power 1.25" />
        </div>
        <div>
          <label style={label} htmlFor="rs-main-t">{hybrid ? 'Main tension (lbs) *' : 'Tension (lbs) *'}</label>
          <input id="rs-main-t" style={input} type="number" inputMode="numeric" value={mainTension} onChange={(e) => setMainTension(e.target.value)} placeholder="52" />
        </div>
        {hybrid && (
          <>
            <div>
              <label style={label} htmlFor="rs-cross">Cross string</label>
              <input id="rs-cross" style={input} value={crossString} onChange={(e) => setCrossString(e.target.value)} placeholder="Babolat VS Touch" />
            </div>
            <div>
              <label style={label} htmlFor="rs-cross-t">Cross tension (lbs)</label>
              <input id="rs-cross-t" style={input} type="number" inputMode="numeric" value={crossTension} onChange={(e) => setCrossTension(e.target.value)} placeholder="55" />
            </div>
          </>
        )}
        <div>
          <label style={label} htmlFor="rs-cost">Cost ($)</label>
          <input id="rs-cost" style={input} type="number" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="40" />
        </div>
        <div>
          <label style={label} htmlFor="rs-notes">Notes</label>
          <input id="rs-notes" style={input} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Felt crisp" />
        </div>
      </div>

      <label
        className="flex items-center gap-2"
        style={{ marginBottom: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-secondary)' }}
      >
        <input type="checkbox" checked={hybrid} onChange={(e) => setHybrid(e.target.checked)} />
        Hybrid setup (different cross string)
      </label>

      {error && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: '#b3402a', margin: '0 0 10px' }}>
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          style={{
            padding: '9px 16px',
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
          Save restring
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '9px 16px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--bg-recessed)',
            color: 'var(--fg-secondary)',
            fontFamily: 'var(--font-sans)',
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
