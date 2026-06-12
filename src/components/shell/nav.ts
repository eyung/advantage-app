export type AppArea = 'dashboard' | 'training' | 'gear' | 'settings';

export const NAV_ITEMS: { id: AppArea; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'activity' },
  { id: 'training', label: 'Training', icon: 'dumbbell' },
  { id: 'gear', label: 'Gear', icon: 'racket' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];
