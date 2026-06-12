import { Icon } from '../ui/Icon';
import { NAV_ITEMS, type AppArea } from './nav';

interface Props {
  active: AppArea;
  onNavigate: (area: AppArea) => void;
}

export function BottomTabBar({ active, onNavigate }: Props) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex nav-safe-bottom"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-hairline)',
      }}
    >
      {NAV_ITEMS.map(({ id, label, icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className="flex-1 flex flex-col items-center justify-center gap-1"
            style={{
              height: 64,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Icon name={icon} size={22} style={{ opacity: isActive ? 1 : 0.45 }} />
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                color: isActive ? 'var(--brand)' : 'var(--fg-tertiary)',
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
