export const CALENDAR_YEAR = 2027 as const;
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;
export const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
export type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type DateCell = number | null;

export interface CalendarMonth {
  readonly year: typeof CALENDAR_YEAR;
  readonly month: MonthNumber;
  readonly name: string;
  readonly firstWeekday: number;
  readonly dayCount: number;
  readonly cells: readonly DateCell[];
}

export function isMonthNumber(value: number): value is MonthNumber {
  return Number.isInteger(value) && value >= 1 && value <= 12;
}

export function getCalendarMonth(month: MonthNumber): CalendarMonth {
  const firstWeekday = new Date(Date.UTC(CALENDAR_YEAR, month - 1, 1)).getUTCDay();
  const dayCount = new Date(Date.UTC(CALENDAR_YEAR, month, 0)).getUTCDate();
  const cells: DateCell[] = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day >= 1 && day <= dayCount ? day : null;
  });
  return { year: CALENDAR_YEAR, month, name: MONTH_NAMES[month - 1], firstWeekday, dayCount, cells };
}

export const ALL_MONTHS: readonly MonthNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
