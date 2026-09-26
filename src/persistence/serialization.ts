import { ALL_MONTHS, CALENDAR_YEAR, type MonthNumber } from '../domain/calendar.ts';
import { canonicalHex } from '../domain/color.ts';
import { assertProjectInvariants, type CalendarProject, type PhotoAsset, type ProjectState } from '../domain/project.ts';
import { isImportantMarkStyle, validImportantDays } from '../domain/importantDates.ts';
import { SCALE_MULTIPLIERS, TYPOGRAPHY_PRESETS } from '../domain/typography.ts';
import { isTextureId } from '../domain/texture.ts';
import { isPhotoEffect } from '../domain/photoEffect.ts';

export class InvalidSavedProjectError extends Error {
  constructor(detail: string) { super(`保存的项目数据无效：${detail}`); this.name = 'InvalidSavedProjectError'; }
}
function validMonth(value: unknown): value is MonthNumber { return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 12; }
export function normalizedResumeLocation(project: CalendarProject): CalendarProject['lastLocation'] {
  const location = project.lastLocation;
  if (location?.screen === 'assign' || location?.screen === 'review') return { screen: location.screen };
  if (location?.screen === 'editor' && validMonth(location.month)) return { screen: 'editor', month: location.month };
  return { screen: 'review' };
}
export function validateProjectState(value: ProjectState): ProjectState {
  try {
    if (!value || !value.project || !value.assets || typeof value.assets !== 'object') throw Error('missing project/assets');
    const project = value.project;
    if (project.schemaVersion !== 1 || project.year !== CALENDAR_YEAR || typeof project.id !== 'string' || !project.id) throw Error('schema, year or ID');
    if (!Number.isSafeInteger(project.revision) || project.revision < 0 || typeof project.updatedAt !== 'string') throw Error('revision or timestamp');
    if (!project.typography || !(project.typography.presetId in TYPOGRAPHY_PRESETS) || !(project.typography.scale in SCALE_MULTIPLIERS)) throw Error('typography');
    if (project.importantMarkStyle !== undefined && !isImportantMarkStyle(project.importantMarkStyle)) throw Error('important mark style');
    if (!project.months || Object.keys(project.months).length !== 12 || !ALL_MONTHS.every(month => Object.hasOwn(project.months, month))) throw Error('month keys');
    for (const month of ALL_MONTHS) {
      const slot = project.months[month];
      if (!slot?.style || canonicalHex(slot.style.background) !== slot.style.background) throw Error(`background ${month}`);
      if (slot.style.texture !== undefined && (slot.style.texture as string) !== 'linen' && !isTextureId(slot.style.texture)) throw Error(`texture ${month}`);
      if (slot.photoEffect !== undefined && !isPhotoEffect(slot.photoEffect)) throw Error(`photo effect ${month}`);
      const text = slot.style.text;
      if (!text || (text.mode !== 'auto' && text.mode !== 'custom') || (text.mode === 'custom' && canonicalHex(text.color) !== text.color)) throw Error(`text ${month}`);
      if (slot.importantDays !== undefined && !validImportantDays(month, slot.importantDays)) throw Error(`important days ${month}`);
      if (slot.crop && (![slot.crop.zoom, slot.crop.offsetX, slot.crop.offsetY].every(Number.isFinite) || slot.crop.zoom < 1 || slot.crop.zoom > 3 || Math.abs(slot.crop.offsetX) > 1 || Math.abs(slot.crop.offsetY) > 1)) throw Error(`crop ${month}`);
    }
    if (project.colorBatchUndo !== undefined) {
      if (!project.colorBatchUndo || typeof project.colorBatchUndo !== 'object') throw Error('color batch undo');
      for (const [key, color] of Object.entries(project.colorBatchUndo)) {
        if (!validMonth(Number(key)) || canonicalHex(color) !== color) throw Error('color batch undo');
      }
    }
    assertProjectInvariants(value);
    for (const item of Object.values(project.photoItems)) {
      if (typeof item.id !== 'string' || typeof item.assetId !== 'string') throw Error('photo item');
    }
    for (const [id, asset] of Object.entries(value.assets)) {
      if (!asset || asset.id !== id || !(asset.blob instanceof Blob) || !Number.isFinite(asset.decodedWidth) || asset.decodedWidth <= 0 || !Number.isFinite(asset.decodedHeight) || asset.decodedHeight <= 0 || asset.byteSize !== asset.blob.size) throw Error(`asset ${id}`);
    }
    // The retired V1.1 linen ID is mapped without mutating the saved input.
    const months = Object.fromEntries(ALL_MONTHS.map(month => {
      const slot = project.months[month];
      return [month, (slot.style.texture as string | undefined) === 'linen'
        ? { ...slot, style: { ...slot.style, texture: 'vellum' as const } }
        : slot];
    })) as CalendarProject['months'];
    return { project: { ...project, importantMarkStyle: project.importantMarkStyle ?? 'red', months, lastLocation: normalizedResumeLocation(project) }, assets: value.assets };
  } catch (error) { throw new InvalidSavedProjectError(error instanceof Error ? error.message : String(error)); }
}
export function referencedAssetIds(project: CalendarProject): Set<string> {
  return new Set(Object.values(project.photoItems).map(item => item.assetId));
}
export function savedAssets(state: ProjectState): PhotoAsset[] {
  const referenced = referencedAssetIds(state.project);
  return [...referenced].map(id => state.assets[id]);
}
