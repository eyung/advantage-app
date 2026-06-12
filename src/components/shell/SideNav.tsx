import { Icon } from '../ui/Icon';
import { NAV_ITEMS, type AppArea } from './nav';

interface Props {
  active: AppArea;
  onNavigate: (area: AppArea) => void;
}

export function SideNav({ active, onNavigate }: Props) {
  return (
    <aside
      className="hidden md:flex flex-col flex-shrink-0 sticky top-0"
      style={{
        width: 240,
        height: '100dvh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-hairline)',
        padding: '24px 12px',
      }}
    >
      <div className="flex items-center gap-2.5" style={{ padding: '0 12px', marginBottom: 28 }}>
        <img src="/logo-mark.svg" alt="" width={28} height={28} />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--fg-primary)',
          }}
        >
          Advantage
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ id, label, icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={isActive ? 'page' : undefined}
              className="flex items-center gap-3 w-full text-left"
              style={{
                padding: '11px 12px',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'var(--brand-soft)' : 'transparent',
                transition: 'background 150ms var(--ease-standard)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon name={icon} size={20} style={{ opacity: isActive ? 1 : 0.5 }} />
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: isActive ? 'var(--color-forest-800)' : 'var(--fg-secondary)',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
