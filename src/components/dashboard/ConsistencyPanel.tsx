import { ConsistencyChart } from '../progress/ConsistencyChart';
import { EmptyPanel } from './EmptyPanel';
import { useCompletionStore } from '../../store/completionStore';
import type { AppArea } from '../shell/nav';

const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--fg-tertiary)',
  margin: '0 0 10px',
};

interface Props {
  onNavigate: (area: AppArea) => void;
}

export function ConsistencyPanel({ onNavigate }: Props) {
  const completions = useCompletionStore((s) => s.completions);

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 24,
        padding: 20,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <p style={eyebrow}>Weekly consistency</p>
      {completions.length === 0 ? (
        <EmptyPanel
          icon="chart"
          message="Complete your first session and your consistency will start charting here."
          actionLabel="Go to training"
          onAction={() => onNavigate('training')}
        />
      ) : (
        <ConsistencyChart />
      )}
    </div>
  );
}
