import { getCalendarMonth, type MonthNumber } from './calendar.ts';
import type { ImportantMarkStyle, MonthState } from './project.ts';

export const IMPORTANT_MARK_STYLES: ReadonlyArray<{ id: ImportantMarkStyle; label: string }> = [
  { id: 'red', label: '红字' },
  { id: 'circle', label: '圈记' },
  { id: 'dot', label: '星号' },
];
export function isImportantMarkStyle(value: unknown): value is ImportantMarkStyle {
  return IMPORTANT_MARK_STYLES.some(option => option.id === value);
}

export function validImportantDays(month: MonthNumber, days: unknown): days is number[] {
  if (!Array.isArray(days)) return false;
  const max = getCalendarMonth(month).dayCount;
  return days.every(day => Number.isInteger(day) && day >= 1 && day <= max) && new Set(days).size === days.length;
}
export function toggleImportantDay(slot: MonthState, day: number): MonthState {
  if (!Number.isInteger(day) || day < 1 || day > getCalendarMonth(slot.month).dayCount) return slot;
  const current = slot.importantDays ?? [];
  const next = current.includes(day) ? current.filter(item => item !== day) : [...current, day].sort((a, b) => a - b);
  return { ...slot, importantDays: next };
}
