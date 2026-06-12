import { useState } from 'react';
import { validateRacketInput, type NewRacket } from '../../store/gearStore';
import type { Racket } from '../../types';

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
  initial?: Racket;
  onSubmit: (input: NewRacket) => void;
  onCancel: () => void;
}

export function RacketForm({ initial, onSubmit, onCancel }: Props) {
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [weightGrams, setWeightGrams] = useState(initial?.weightGrams?.toString() ?? '');
  const [headSizeSqIn, setHeadSizeSqIn] = useState(initial?.headSizeSqIn?.toString() ?? '');
  const [gripSize, setGripSize] = useState(initial?.gripSize ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: NewRacket = {
      brand,
      model,
      weightGrams: weightGrams ? Number(weightGrams) : undefined,
      headSizeSqIn: headSizeSqIn ? Number(headSizeSqIn) : undefined,
      gripSize: gripSize || undefined,
      notes: notes || undefined,
    };
    const err = validateRacketInput(payload);
    if (err) {
      setError(err);
      return;
    }
    onSubmit(payload);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 18,
        padding: 18,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <p
        style={{
          margin: '0 0 14px',
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--fg-primary)',
        }}
      >
        {initial ? 'Edit racket' : 'Add racket'}
      </p>

      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 12 }}>
        <div>
          <label style={label} htmlFor="racket-brand">Brand *</label>
          <input id="racket-brand" style={input} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Yonex" />
        </div>
        <div>
          <label style={label} htmlFor="racket-model">Model *</label>
          <input id="racket-model" style={input} value={model} onChange={(e) => setModel(e.target.value)} placeholder="EZONE 98" />
        </div>
        <div>
          <label style={label} htmlFor="racket-weight">Weight (g)</label>
          <input id="racket-weight" style={input} type="number" inputMode="numeric" value={weightGrams} onChange={(e) => setWeightGrams(e.target.value)} placeholder="305" />
        </div>
        <div>
          <label style={label} htmlFor="racket-head">Head size (sq in)</label>
          <input id="racket-head" style={input} type="number" inputMode="numeric" value={headSizeSqIn} onChange={(e) => setHeadSizeSqIn(e.target.value)} placeholder="98" />
        </div>
        <div className="col-span-2">
          <label style={label} htmlFor="racket-grip">Grip size</label>
          <input id="racket-grip" style={input} value={gripSize} onChange={(e) => setGripSize(e.target.value)} placeholder="4 3/8" />
        </div>
        <div className="col-span-2">
          <label style={label} htmlFor="racket-notes">Notes</label>
          <textarea id="racket-notes" style={{ ...input, minHeight: 60, resize: 'vertical' }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Lead tape at 3 & 9…" />
        </div>
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: '#b3402a', margin: '0 0 10px' }}>
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          style={{
            padding: '10px 18px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--brand)',
            color: 'var(--fg-on-brand)',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {initial ? 'Save changes' : 'Add racket'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 18px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--bg-recessed)',
            color: 'var(--fg-secondary)',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
