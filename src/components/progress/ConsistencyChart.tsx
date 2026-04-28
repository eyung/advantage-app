import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
    const label = weekISO.replace(/\d{4}-/, '');
    return { week: label, Completed: completedDays, Planned: plannedPerWeek };
  });

  const hasData = data.some((d) => d.Completed > 0);

  if (!hasData) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--fg-tertiary)',
            margin: 0,
          }}
        >
          Your weekly consistency will appear here once you start logging
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--fg-tertiary)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--fg-tertiary)' }}
          axisLine={false}
          tickLine={false}
        />
        <Bar dataKey="Planned" fill="var(--color-forest-200)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Completed" fill="var(--brand)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
