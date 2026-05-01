import { useState } from 'react';
import { DayTabBar } from './DayTabBar';
import { DayRoutineView } from './DayRoutineView';
import { SessionEquipmentBar } from './SessionEquipmentBar';
import { ProgressView } from '../progress/ProgressView';
import { SettingsView } from '../setup/SettingsView';
import { Icon } from '../ui/Icon';
import { useWeekPlan } from '../../hooks/useWeekPlan';
import { useCompletions } from '../../hooks/useCompletions';
import { useEquipmentStore } from '../../store/equipmentStore';
import type { DayOfWeek } from '../../types';

const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getTodayDayOfWeek(): DayOfWeek {
  const idx = (new Date().getDay() + 6) % 7;
  return ALL_DAYS[idx]!;
}

type Tab = 'today' | 'progress';

export function MainView() {
  const plan = useWeekPlan();
  const { isCompleted, toggleCompletion } = useCompletions();
  const profile = useEquipmentStore((s) => s.profile);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayDayOfWeek);
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [showSettings, setShowSettings] = useState(false);

  if (showSettings) {
    return <SettingsView onClose={() => setShowSettings(false)} />;
  }

  const completedCounts = ALL_DAYS.reduce((acc, day) => {
    if (!plan) { acc[day] = 0; return acc; }
    const exercises = plan.days[day].exercises;
    acc[day] = exercises.filter((e) => isCompleted(e.exerciseId)).length;
    return acc;
  }, {} as Record<DayOfWeek, number>);

  // 3-day window: prev / selected / next
  const selectedIdx = ALL_DAYS.indexOf(selectedDay);
  const visibleDays: DayOfWeek[] = [];
  if (selectedIdx > 0) visibleDays.push(ALL_DAYS[selectedIdx - 1]!);
  visibleDays.push(selectedDay);
  if (selectedIdx < ALL_DAYS.length - 1) visibleDays.push(ALL_DAYS[selectedIdx + 1]!);

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-app)' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{
          height: 56,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-hairline)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <img src="/logo-mark.svg" alt="" height={26} width={26} />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 19,
              fontWeight: 600,
              color: 'var(--fg-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Advantage
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          className="flex items-center justify-center rounded-full transition-colors"
          style={{ width: 40, height: 40, background: 'transparent', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon name="settings" size={20} />
        </button>
      </header>

      {activeTab === 'today' && plan && (
        <>
          <DayTabBar
            plan={plan}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            completedCounts={completedCounts}
          />
          <main className="flex-1 overflow-y-auto" style={{ padding: '14px 16px 24px' }}>
            {profile && <SessionEquipmentBar profile={profile} />}
            {visibleDays.map((day) => (
              <DayRoutineView
                key={day}
                dayPlan={plan.days[day]}
                dayLabel={day}
                focused={day === selectedDay}
                isToday={day === getTodayDayOfWeek()}
                isCompleted={(id) => isCompleted(id)}
                onToggle={(id, wkg, sets, reps) => toggleCompletion(id, wkg, sets, reps)}
              />
            ))}
          </main>
        </>
      )}

      {activeTab === 'progress' && (
        <main className="flex-1 overflow-y-auto" style={{ padding: '20px 16px 24px' }}>
          <ProgressView />
        </main>
      )}

      {/* Bottom nav */}
      <nav
        className="flex flex-shrink-0"
        style={{ borderTop: '1px solid var(--border-hairline)', background: 'var(--bg-surface)' }}
      >
        {(['today', 'progress'] as Tab[]).map((id) => {
          const icon = id === 'today' ? 'calendar' : 'chart';
          const label = id === 'today' ? 'Today' : 'Progress';
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className="flex-1 flex flex-col items-center gap-1"
              style={{
                padding: '10px 8px 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: active ? 'var(--brand)' : 'var(--fg-tertiary)',
              }}
            >
              <Icon name={icon} size={22} style={{ opacity: active ? 1 : 0.5 }} />
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: active ? 'var(--brand)' : 'var(--fg-tertiary)',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
