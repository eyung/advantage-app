import { TodayPanel } from './TodayPanel';
import { StreakPanel } from './StreakPanel';
import { ConsistencyPanel } from './ConsistencyPanel';
import { GearPanel } from './GearPanel';
import { getTodayISO, formatDisplayDate } from '../../utils/dateUtils';
import type { AppArea } from '../shell/nav';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

interface Props {
  onNavigate: (area: AppArea) => void;
}

export function DashboardView({ onNavigate }: Props) {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--fg-primary)',
          }}
        >
          {greeting()}
        </h1>
        <p
          style={{
            margin: '4px 0 0',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--fg-tertiary)',
          }}
        >
          {formatDisplayDate(getTodayISO())}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TodayPanel onNavigate={onNavigate} />
        <StreakPanel />
        <div className="lg:col-span-2">
          <ConsistencyPanel onNavigate={onNavigate} />
        </div>
        <div className="lg:col-span-2">
          <GearPanel onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
