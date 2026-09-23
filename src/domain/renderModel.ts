import { getCalendarMonth, type CalendarMonth, type MonthNumber, WEEKDAY_INITIALS } from './calendar.ts';
import { OUTPUT_GEOMETRY } from './geometry.ts';
import { resolveCrop, type ResolvedCrop } from './crop.ts';
import type { CropState, ProjectState } from './project.ts';

export interface MonthRenderModel {
  readonly calendar: CalendarMonth;
  readonly weekdays: typeof WEEKDAY_INITIALS;
  readonly geometry: typeof OUTPUT_GEOMETRY;
  readonly background: string;
  readonly ink: string;
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
  return { calendar: getCalendarMonth(month), weekdays: WEEKDAY_INITIALS, geometry: OUTPUT_GEOMETRY,
    background: slot?.style.background || '#FFFFFF', ink: '#18201D', photo };
}
