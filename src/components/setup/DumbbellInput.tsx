import { useState } from 'react';

interface Props {
  weights: number[];
  onChange: (weights: number[]) => void;
}

export function DumbbellInput({ weights, onChange }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  function handleAdd() {
    const val = parseFloat(inputValue.trim());
    if (isNaN(val) || val <= 0) {
      setError('Enter a positive number');
      return;
    }
    if (weights.includes(val)) {
      setError(`${val} kg is already in your list`);
      return;
    }
    const sorted = [...weights, val].sort((a, b) => a - b);
    onChange(sorted);
    setInputValue('');
    setError('');
  }

  function handleRemove(w: number) {
    onChange(weights.filter((x) => x !== w));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Available Dumbbell Weights (kg)
      </label>

      <div className="flex gap-2">
        <input
          type="number"
          min="0.5"
          step="0.5"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 10"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-court-green"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-court-green px-4 py-2 text-sm font-semibold text-white hover:bg-court-green-dark active:scale-95 transition-transform"
        >
          Add
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {weights.length === 0 ? (
        <p className="text-xs text-gray-400">No weights added yet — add at least one</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {weights.map((w) => (
            <span
              key={w}
              className="flex items-center gap-1 rounded-full bg-court-green-faint px-3 py-1 text-sm font-medium text-court-green-dark"
            >
              {w} kg
              <button
                type="button"
                onClick={() => handleRemove(w)}
                aria-label={`Remove ${w} kg`}
                className="ml-1 text-court-green-dark hover:text-red-500 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
