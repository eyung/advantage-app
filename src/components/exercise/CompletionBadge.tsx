import { Icon } from '../ui/Icon';

interface Props {
  completed: boolean;
}

export function CompletionBadge({ completed }: Props) {
  if (!completed) return null;
  return (
    <span
      aria-label="Completed"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 9px',
        borderRadius: 999,
        background: 'var(--color-success)',
        color: 'white',
        fontFamily: 'var(--font-sans)',
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      <Icon name="check" size={12} style={{ filter: 'brightness(0) invert(1)' }} />
      Done
    </span>
  );
}
