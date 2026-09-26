import { getCalendarMonth, type CalendarMonth, type MonthNumber, WEEKDAY_INITIALS } from './calendar.ts';
import { OUTPUT_GEOMETRY } from './geometry.ts';
import { resolveCrop, type ResolvedCrop } from './crop.ts';
import type { CropState, HexColor, ImportantMarkStyle, ProjectState } from './project.ts';
import { autoInk, contrastRatio, customContrastWarning } from './color.ts';
import { SCALE_MULTIPLIERS, TYPOGRAPHY_PRESETS } from './typography.ts';
import type { TextureId } from './texture.ts';
import { DEFAULT_PHOTO_EFFECT, type PhotoEffect } from './photoEffect.ts';

export interface MonthRenderModel {
  readonly calendar: CalendarMonth;
  readonly weekdays: typeof WEEKDAY_INITIALS;
  readonly geometry: typeof OUTPUT_GEOMETRY;
  readonly background: HexColor;
  readonly texture: TextureId;
  readonly ink: string;
  readonly importantDays: readonly number[];
  readonly importantMarkStyle: ImportantMarkStyle;
  readonly importantInk: string;
  readonly customContrastWarning: boolean;
  readonly typography: typeof TYPOGRAPHY_PRESETS.classic;
  readonly scale: number;
  readonly photoEffect: PhotoEffect;
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
    background, texture: slot?.style.texture ?? 'none', ink, importantDays: slot?.importantDays ?? [], importantMarkStyle: state?.project.importantMarkStyle ?? 'red',
    importantInk: contrastRatio(background, '#9D2727') >= contrastRatio(background, '#FFE1DB') ? '#9D2727' : '#FFE1DB',
    customContrastWarning: text.mode === 'custom' && customContrastWarning(background, ink),
    typography: TYPOGRAPHY_PRESETS[typography.presetId], scale: SCALE_MULTIPLIERS[typography.scale], photoEffect: slot?.photoEffect ?? DEFAULT_PHOTO_EFFECT, photo };
}
