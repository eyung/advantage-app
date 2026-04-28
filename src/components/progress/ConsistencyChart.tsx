import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useCompletionStore } from '../../store/completionStore';
import { useEquipmentStore } from '../../store/equipmentStore';
import { getPastISOWeeks } from '../../utils/dateUtils';

export function ConsistencyChart() {
  const completions = useCompletionStore((s) => s.completions);
  const profile = useEquipmentStore((s) => s.profile);

  const weeks = getPastISOWeeks(8);
  const plannedPerWeek = profile?.trainingDays.length ?? 0;

  const data = weeks.map((weekISO) => {
    const completedDays = new Set(
      completions.filter((c) => c.weekISO === weekISO).map((c) => c.date)
    ).size;
    const label = weekISO.replace(/\d{4}-/, ''); // show "W17"
    return { week: label, Completed: completedDays, Planned: plannedPerWeek };
  });

  const hasData = data.some((d) => d.Completed > 0);

  if (!hasData) {
    return (
      <div className="text-center py-8 space-y-2">
        <div className="text-4xl">📊</div>
        <p className="text-sm text-gray-500">Your weekly consistency will appear here once you start logging</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="Planned" fill="#E8F5E9" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Completed" fill="#4CAF50" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
