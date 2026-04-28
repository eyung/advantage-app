import { useState } from 'react';
import { DayTabBar } from './DayTabBar';
import { DayRoutineView } from './DayRoutineView';
import { ProgressView } from '../progress/ProgressView';
import { SettingsView } from '../setup/SettingsView';
import { useWeekPlan } from '../../hooks/useWeekPlan';
import { useCompletions } from '../../hooks/useCompletions';
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

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎾</span>
          <span className="font-bold text-gray-900 text-lg">Advantage</span>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 text-xl"
        >
          ⚙️
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
          <main className="flex-1 overflow-y-auto p-4">
            <DayRoutineView
              dayPlan={plan.days[selectedDay]}
              dayLabel={selectedDay}
              isCompleted={(id) => isCompleted(id)}
              onToggle={(id, wkg, sets, reps) => toggleCompletion(id, wkg, sets, reps)}
            />
          </main>
        </>
      )}

      {activeTab === 'progress' && (
        <main className="flex-1 overflow-y-auto p-4">
          <ProgressView />
        </main>
      )}

      {/* Bottom nav */}
      <nav className="bg-white border-t border-gray-100 flex">
        <button
          type="button"
          onClick={() => setActiveTab('today')}
          className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-semibold transition-colors ${
            activeTab === 'today' ? 'text-clay' : 'text-gray-400'
          }`}
        >
          <span className="text-xl">📅</span>
          <span>Today</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-semibold transition-colors ${
            activeTab === 'progress' ? 'text-clay' : 'text-gray-400'
          }`}
        >
          <span className="text-xl">📊</span>
          <span>Progress</span>
        </button>
      </nav>
    </div>
  );
}
