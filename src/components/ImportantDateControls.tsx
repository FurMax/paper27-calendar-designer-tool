import { getCalendarMonth, type MonthNumber } from '../domain/calendar.ts';
import { IMPORTANT_MARK_STYLES } from '../domain/importantDates.ts';
import type { ImportantMarkStyle } from '../domain/project.ts';

export function ImportantDateControls({ month, days, markStyle, onToggle, onStyleChange }: { month: MonthNumber; days: readonly number[]; markStyle: ImportantMarkStyle; onToggle: (day: number) => void; onStyleChange: (style: ImportantMarkStyle) => void }) {
  const count = getCalendarMonth(month).dayCount;
  return <div className="important-controls"><p>轻点日期标记为重要。标记会显示在预览和导出图片中。</p><span className="important-controls__style-label">整套标记样式</span><div className="important-controls__styles" role="group" aria-label="整套重要日期样式">{IMPORTANT_MARK_STYLES.map(option => <button key={option.id} type="button" aria-pressed={markStyle === option.id} onClick={() => onStyleChange(option.id)}>{option.label}</button>)}</div><div className="important-controls__grid" aria-label={`${month} 月重要日期`}>{Array.from({ length: count }, (_, index) => index + 1).map(day => <button key={day} type="button" aria-pressed={days.includes(day)} aria-label={`${month} 月 ${day} 日${days.includes(day) ? '，已标记，点击移除' : '，点击标记'}`} className={days.includes(day) ? 'is-important' : ''} onClick={() => onToggle(day)}>{day}</button>)}</div></div>;
}
