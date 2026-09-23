import { getCalendarMonth, type CalendarMonth, type MonthNumber, WEEKDAY_INITIALS } from './calendar.ts';
import { OUTPUT_GEOMETRY } from './geometry.ts';
import { resolveCrop, type ResolvedCrop } from './crop.ts';
import type { CropState, ProjectState } from './project.ts';
import { autoInk, customContrastWarning } from './color.ts';
import { SCALE_MULTIPLIERS, TYPOGRAPHY_PRESETS } from './typography.ts';

export interface MonthRenderModel {
  readonly calendar: CalendarMonth;
  readonly weekdays: typeof WEEKDAY_INITIALS;
  readonly geometry: typeof OUTPUT_GEOMETRY;
  readonly background: string;
  readonly ink: string;
  readonly customContrastWarning: boolean;
  readonly typography: typeof TYPOGRAPHY_PRESETS.classic;
  readonly scale: number;
  readonly photo: null | { assetId: string; crop: CropState; width: number; height: number; resolved: ResolvedCrop };
}

export function buildMonthRenderModel(month: MonthNumber, state?: ProjectState): MonthRenderModel {
  const slot = state?.project.months[month];
  const item = slot?.photoItemId ? state?.project.photoItems[slot.photoItemId] : null;
  const asset = item ? state?.assets[item.assetId] : null;
  const photo = asset && slot?.crop ? {
    assetId: asset.id, crop: slot.crop, width: asset.decodedWidth, height: asset.decodedHeight,
    resolved: resolveCrop({ width: asset.decodedWidth, height: asset.decodedHeight }, slot.crop),
  } : null;
  const background = slot?.style.background ?? '#FFFFFF';
  const text = slot?.style.text ?? { mode: 'auto' as const };
  const ink = text.mode === 'auto' ? autoInk(background) : text.color;
  const typography = state?.project.typography ?? { presetId: 'classic' as const, scale: 'standard' as const };
  return { calendar: getCalendarMonth(month), weekdays: WEEKDAY_INITIALS, geometry: OUTPUT_GEOMETRY,
    background, ink, customContrastWarning: text.mode === 'custom' && customContrastWarning(background, ink),
    typography: TYPOGRAPHY_PRESETS[typography.presetId], scale: SCALE_MULTIPLIERS[typography.scale], photo };
}
