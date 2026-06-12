import { Icon } from '../ui/Icon';

interface Props {
  icon: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyPanel({ icon, message, actionLabel, onAction }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ padding: '20px 16px', gap: 10 }}
    >
      <Icon name={icon} size={28} style={{ opacity: 0.25 }} />
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          color: 'var(--fg-tertiary)',
          margin: 0,
          maxWidth: 260,
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            marginTop: 2,
            padding: '8px 16px',
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--brand-soft)',
            color: 'var(--color-forest-800)',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
