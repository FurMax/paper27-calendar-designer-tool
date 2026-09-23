import { getCalendarMonth, type CalendarMonth, type MonthNumber, WEEKDAY_INITIALS } from './calendar.ts';
import { OUTPUT_GEOMETRY } from './geometry.ts';

export interface MonthRenderModel {
  readonly calendar: CalendarMonth;
  readonly weekdays: typeof WEEKDAY_INITIALS;
  readonly geometry: typeof OUTPUT_GEOMETRY;
  readonly background: string;
  readonly ink: string;
}

// M1 provides the fixed proof defaults. M3/M4 extend this input with crop and style state.
export function buildMonthRenderModel(month: MonthNumber): MonthRenderModel {
  return {
    calendar: getCalendarMonth(month),
    weekdays: WEEKDAY_INITIALS,
    geometry: OUTPUT_GEOMETRY,
    background: '#FFFFFF',
    ink: '#18201D',
  };
}
