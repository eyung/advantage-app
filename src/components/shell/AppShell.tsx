import { useState } from 'react';
import { SideNav } from './SideNav';
import { BottomTabBar } from './BottomTabBar';
import type { AppArea } from './nav';
import { TrainingView } from '../training/TrainingView';
import { SettingsView } from '../setup/SettingsView';
import { DashboardView } from '../dashboard/DashboardView';
import { GearView } from '../gear/GearView';

export function AppShell() {
  const [area, setArea] = useState<AppArea>('dashboard');

  return (
    <div className="min-h-dvh md:flex" style={{ background: 'var(--bg-recessed)' }}>
      <SideNav active={area} onNavigate={setArea} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top header */}
        <header
          className="md:hidden flex items-center gap-2.5 px-4 flex-shrink-0"
          style={{
            height: 56,
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-hairline)',
          }}
        >
          <img src="/logo-mark.svg" alt="" width={26} height={26} />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 19,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: 'var(--fg-primary)',
            }}
          >
            Advantage
          </span>
        </header>

        <main
          className="flex-1 w-full mx-auto px-4 pt-5 pb-24 md:px-8 md:pt-8 md:pb-12 lg:px-10"
          style={{ maxWidth: 1100 }}
        >
          {area === 'dashboard' && <DashboardView onNavigate={setArea} />}
          {area === 'training' && <TrainingView />}
          {area === 'gear' && <GearView />}
          {area === 'settings' && <SettingsView />}
        </main>
      </div>

      <BottomTabBar active={area} onNavigate={setArea} />
    </div>
  );
}
