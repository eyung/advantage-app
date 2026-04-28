import type { DayOfWeek } from '../../types';

const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  selected: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

export function DaySelector({ selected, onChange }: Props) {
  const selectedSet = new Set(selected);
  const count = selected.length;
  const valid = count >= 3 && count <= 6;

  function toggle(day: DayOfWeek) {
    if (selectedSet.has(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day]);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          Training Days
        </label>
        <span className={`text-xs font-medium ${valid ? 'text-court-green-dark' : 'text-clay'}`}>
          {count} / 6 days selected {count < 3 && '(min 3)'}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {ALL_DAYS.map((day) => {
          const isOn = selectedSet.has(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              aria-pressed={isOn}
              className={`rounded-lg py-3 text-xs font-semibold transition-colors ${
                isOn
                  ? 'bg-clay text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {count > 6 && (
        <p className="text-xs text-red-500">Maximum 6 training days</p>
      )}
    </div>
  );
}
