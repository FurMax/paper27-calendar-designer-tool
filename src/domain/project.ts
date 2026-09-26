import { ALL_MONTHS, CALENDAR_YEAR, type MonthNumber } from './calendar.ts';
import type { TextureId } from './texture.ts';
import type { PhotoEffect } from './photoEffect.ts';

export type HexColor = `#${string}`;
export type TypographyPresetId = 'classic' | 'minimal' | 'handwritten' | 'retro';
export type TextScale = 'small' | 'standard' | 'large';
export type ImportantMarkStyle = 'red' | 'circle' | 'dot';
export interface CropState { zoom: number; offsetX: number; offsetY: number }
export interface CalendarStyle {
  background: HexColor;
  texture?: TextureId;
  text: { mode: 'auto' } | { mode: 'custom'; color: HexColor };
}
export interface MonthState {
  month: MonthNumber;
  photoItemId: string | null;
  crop: CropState | null;
  photoEffect?: PhotoEffect;
  style: CalendarStyle;
  importantDays?: number[];
}
export interface ProjectPhotoItem { id: string; assetId: string; createdAt: string }
export interface PhotoAsset {
  id: string;
  blob: Blob;
  mime: string;
  fileName: string;
  byteSize: number;
  decodedWidth: number;
  decodedHeight: number;
  importedAt: string;
}
export interface CalendarProject {
  schemaVersion: 1;
  id: string;
  revision: number;
  updatedAt: string;
  year: typeof CALENDAR_YEAR;
  typography: { presetId: TypographyPresetId; scale: TextScale };
  importantMarkStyle: ImportantMarkStyle;
  months: Record<MonthNumber, MonthState>;
  photoItems: Record<string, ProjectPhotoItem>;
  colorBatchUndo?: Partial<Record<MonthNumber, HexColor>>;
  lastLocation: { screen: 'assign' | 'editor' | 'review'; month?: MonthNumber };
}
export interface ProjectState { project: CalendarProject; assets: Record<string, PhotoAsset> }
export const DEFAULT_CROP: Readonly<CropState> = Object.freeze({ zoom: 1, offsetX: 0, offsetY: 0 });

export function createEmptyProject(id: string): ProjectState {
  const months = Object.fromEntries(ALL_MONTHS.map(month => [month, {
    month, photoItemId: null, crop: null,
    style: { background: '#FFFFFF', text: { mode: 'auto' } },
  }])) as unknown as Record<MonthNumber, MonthState>;
  return {
    project: { schemaVersion: 1, id, revision: 0, updatedAt: '', year: CALENDAR_YEAR,
      typography: { presetId: 'classic', scale: 'standard' }, importantMarkStyle: 'red', months, photoItems: {}, lastLocation: { screen: 'assign' } },
    assets: {},
  };
}

export function unassignedItems(project: CalendarProject): ProjectPhotoItem[] {
  const assigned = new Set(ALL_MONTHS.map(month => project.months[month].photoItemId).filter((id): id is string => id !== null));
  return Object.values(project.photoItems).filter(item => !assigned.has(item.id)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function isMonthReady(state: ProjectState, month: MonthNumber): boolean {
  const itemId = state.project.months[month].photoItemId;
  if (!itemId) return false;
  const item = state.project.photoItems[itemId];
  const asset = item && state.assets[item.assetId];
  return !!asset && asset.decodedWidth > 0 && asset.decodedHeight > 0 && !!state.project.months[month].crop;
}

export function readyCount(state: ProjectState): number {
  return ALL_MONTHS.filter(month => isMonthReady(state, month)).length;
}

export function assertProjectInvariants(state: ProjectState): void {
  const { project, assets } = state;
  if (project.schemaVersion !== 1 || project.year !== CALENDAR_YEAR || Object.keys(project.months).length !== 12) throw new Error('Invalid project shape');
  const seen = new Set<string>();
  for (const month of ALL_MONTHS) {
    const slot = project.months[month];
    if (!slot || slot.month !== month || (slot.crop === null) !== (slot.photoItemId === null)) throw new Error(`Invalid month ${month}`);
    if (slot.photoItemId) {
      if (seen.has(slot.photoItemId) || !project.photoItems[slot.photoItemId]) throw new Error(`Invalid item for month ${month}`);
      seen.add(slot.photoItemId);
    }
  }
  for (const item of Object.values(project.photoItems)) if (!assets[item.assetId]) throw new Error(`Missing asset ${item.assetId}`);
}
