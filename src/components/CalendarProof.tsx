import { buildMonthRenderModel } from '../domain/renderModel.ts';
import type { MonthNumber } from '../domain/calendar.ts';
import type { CSSProperties } from 'react';

export function CalendarProof({ month, compact = false }: { month: MonthNumber; compact?: boolean }) {
  const model = buildMonthRenderModel(month);
  return (
    <div className={`calendar-proof${compact ? ' calendar-proof--compact' : ''}`}
      style={{ '--proof-background': model.background, '--proof-ink': model.ink, '--photo-height': `${100 * model.geometry.photo.height / model.geometry.height}%`, '--calendar-height': `${100 * model.geometry.calendar.height / model.geometry.height}%` } as CSSProperties}
      aria-label={`${model.calendar.name} ${model.calendar.year} 日历预览`}>
      <div className="calendar-proof__photo"><span>添加照片</span></div>
      <div className="calendar-proof__dates">
        <div className="calendar-proof__title"><strong>{model.calendar.name}</strong><span>{model.calendar.year}</span></div>
        <div className="calendar-proof__weekdays" aria-hidden="true">{model.weekdays.map((day, i) => <span key={i}>{day}</span>)}</div>
        <div className="calendar-proof__grid">
          {model.calendar.cells.map((day, i) => <span key={i} aria-label={day ? `${model.calendar.name} ${day}` : undefined}>{day}</span>)}
        </div>
      </div>
    </div>
  );
}
