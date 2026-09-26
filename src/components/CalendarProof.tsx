import { buildMonthRenderModel } from '../domain/renderModel.ts';
import type { MonthNumber } from '../domain/calendar.ts';
import type { ExportVariant } from '../domain/exportVariant.ts';
import type { CropState, ProjectState } from '../domain/project.ts';
import type { CSSProperties } from 'react';
import { CropSurface } from '../features/crop/CropSurface.tsx';
import { textureCssImage, textureTileSize } from '../domain/texture.ts';

export function CalendarProof({ month, compact = false, state, onCropChange, variant = 'digital' }: { month: MonthNumber; compact?: boolean; state?: ProjectState | null; onCropChange?: (crop: CropState) => void; variant?: ExportVariant }) {
  const model = buildMonthRenderModel(month, state || undefined);
  const photo = model.photo;
  const blob = photo && state?.assets[photo.assetId].blob;
  return (
    <div className={`calendar-proof${compact ? ' calendar-proof--compact' : ''}`}
      data-important-mark-style={model.importantMarkStyle}
      data-six-row-handwritten-large={model.typography.id === 'handwritten' && model.scale > 1 && model.calendar.cells.slice(35).some(day => day !== null) ? 'true' : undefined}
      style={{ '--proof-background': model.background, '--proof-ink': model.ink, '--proof-important-ink': model.importantInk, '--proof-month-font': `\"${model.typography.monthFamily}\", Georgia, serif`, '--proof-detail-font': `\"${model.typography.detailFamily}\", Arial, sans-serif`, '--proof-scale': model.scale, '--proof-month-weight': model.typography.monthWeight, '--proof-detail-weight': model.typography.detailWeight, '--proof-letter-spacing': model.typography.letterSpacing, '--photo-height': `${100 * model.geometry.photo.height / model.geometry.height}%`, '--calendar-height': `${100 * model.geometry.calendar.height / model.geometry.height}%` } as CSSProperties}
      aria-label={`${model.calendar.name} ${model.calendar.year} 日历预览`}>
      <div className="calendar-proof__photo">{photo && blob ? <CropSurface blob={blob} width={photo.width} height={photo.height} crop={photo.crop} variant={variant} effect={model.photoEffect} onChange={onCropChange} /> : <span>添加照片</span>}</div>
      <div className="calendar-proof__dates" data-texture={model.texture} style={{ backgroundImage: textureCssImage(model.texture, model.background), backgroundSize: `${100 * textureTileSize(model.texture) / model.geometry.width}% auto` }}>
        <div className="calendar-proof__title"><strong>{model.calendar.name}</strong><span>{model.calendar.year}</span></div>
        <div className="calendar-proof__weekdays" aria-hidden="true">{model.weekdays.map((day, i) => <span key={i}>{day}</span>)}</div>
        <div className="calendar-proof__grid">
          {model.calendar.cells.map((day, i) => <span key={i} className={day && model.importantDays.includes(day) ? 'is-important' : undefined} aria-label={day ? `${model.calendar.name} ${day}${model.importantDays.includes(day) ? ' 重要日期' : ''}` : undefined}>{day}</span>)}
        </div>
      </div>
    </div>
  );
}
