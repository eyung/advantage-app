import { useCompletionStore } from '../../store/completionStore';
import { exerciseMap } from '../../data/exercises';

export function PersonalBestList() {
  const completions = useCompletionStore((s) => s.completions);

  if (completions.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <div className="text-4xl">🏆</div>
        <p className="text-sm text-gray-500">Complete exercises to see your personal bests here</p>
      </div>
    );
  }

  // Group by exerciseId, find max weight
  const bests = new Map<string, { maxWeight: number; date: string }>();
  for (const c of completions) {
    if (c.weightKg === 0) continue; // skip bodyweight
    const existing = bests.get(c.exerciseId);
    if (!existing || c.weightKg > existing.maxWeight) {
      bests.set(c.exerciseId, { maxWeight: c.weightKg, date: c.date });
    }
  }

  if (bests.size === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No weighted exercises logged yet</p>
      </div>
    );
  }

  const sorted = [...bests.entries()].sort((a, b) => b[1].maxWeight - a[1].maxWeight);

  return (
    <div className="space-y-2">
      {sorted.map(([id, { maxWeight, date }]) => {
        const name = exerciseMap[id]?.name ?? id;
        return (
          <div key={id} className="flex items-center justify-between rounded-xl bg-white shadow-card px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
              <p className="text-xs text-gray-400">{date}</p>
            </div>
            <span className="ml-3 flex-shrink-0 rounded-full bg-clay/10 px-3 py-1 text-sm font-bold text-clay">
              {maxWeight} kg
            </span>
          </div>
        );
      })}
    </div>
  );
}
