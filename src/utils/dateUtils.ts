export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]!;
}

export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getISOYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
}

export function getISOWeekForDate(date: Date): string {
  const week = getISOWeekNumber(date);
  const year = getISOYear(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function getCurrentISOWeek(): string {
  return getISOWeekForDate(new Date());
}

/** 0 = Monday … 6 = Sunday */
export function getDayOfWeekIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function getTodayDayOfWeek(): (typeof DAY_ORDER)[number] {
  return DAY_ORDER[getDayOfWeekIndex(new Date())]!;
}

export function formatDisplayDate(iso: string): string {
  const date = new Date(iso + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getWeekStartISO(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0]!;
}

/** Returns ISO dates for the 7 days of the week containing `date`, Mon–Sun */
export function getWeekDates(date: Date): string[] {
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0]!;
  });
}

/** Past N weeks including the current one, most recent last */
export function getPastWeekStarts(n: number): string[] {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (n - 1 - i) * 7);
    return getWeekStartISO(d);
  });
}

/**
 * Returns the ISO date string (YYYY-MM-DD) for a given DayOfWeek within a weekISO string.
 * DayOfWeek index: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
 */
export function getWeekDayISO(weekISO: string, dayIndex: number): string {
  // Parse year and week number from e.g. "2026-W18"
  const match = weekISO.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return '';
  const year = parseInt(match[1]!, 10);
  const week = parseInt(match[2]!, 10);
  // ISO week 1 Monday: Jan 4 always falls in week 1; find Monday of week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const mondayOfWeek1 = new Date(jan4);
  mondayOfWeek1.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));
  // Add weeks and days
  const target = new Date(mondayOfWeek1);
  target.setUTCDate(mondayOfWeek1.getUTCDate() + (week - 1) * 7 + dayIndex);
  return target.toISOString().split('T')[0]!;
}

/** Past N ISO week strings including current week, oldest first */
export function getPastISOWeeks(n: number): string[] {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (n - 1 - i) * 7);
    return getISOWeekForDate(d);
  });
}
