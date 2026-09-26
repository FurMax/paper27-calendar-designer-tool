import type { MonthNumber } from './calendar.ts';
import { canonicalHex } from './color.ts';
import type { CalendarProject, HexColor } from './project.ts';

export function applyColorBatch(project: CalendarProject, colors: Partial<Record<MonthNumber, HexColor>>): CalendarProject {
  const months = { ...project.months };
  const previous: Partial<Record<MonthNumber, HexColor>> = {};
  for (const [key, input] of Object.entries(colors)) {
    const month = Number(key) as MonthNumber;
    const color = input && canonicalHex(input);
    if (!color || !months[month] || months[month].style.background === color) continue;
    previous[month] = months[month].style.background;
    months[month] = { ...months[month], style: { ...months[month].style, background: color } };
  }
  return Object.keys(previous).length ? { ...project, months, colorBatchUndo: previous } : project;
}
export function restoreColorBatch(project: CalendarProject): CalendarProject {
  if (!project.colorBatchUndo) return project;
  const months = { ...project.months };
  for (const [key, color] of Object.entries(project.colorBatchUndo)) {
    const month = Number(key) as MonthNumber;
    if (color && months[month]) months[month] = { ...months[month], style: { ...months[month].style, background: color } };
  }
  return { ...project, months, colorBatchUndo: undefined };
}
