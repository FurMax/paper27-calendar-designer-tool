import { OUTPUT_GEOMETRY } from './geometry.ts';
import type { CropState, ProjectState } from './project.ts';
import type { MonthNumber } from './calendar.ts';

export interface PhotoDimensions { width: number; height: number }
export interface Point { x: number; y: number }
export interface ResolvedCrop {
  x: number; y: number; width: number; height: number;
  travelX: number; travelY: number; scale: number;
}
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
const REGION_WIDTH = OUTPUT_GEOMETRY.photo.width;
const REGION_HEIGHT = OUTPUT_GEOMETRY.photo.height;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function normalizeCrop(crop: CropState): CropState {
  return { zoom: clamp(Number.isFinite(crop.zoom) ? crop.zoom : 1, MIN_ZOOM, MAX_ZOOM),
    offsetX: clamp(Number.isFinite(crop.offsetX) ? crop.offsetX : 0, -1, 1),
    offsetY: clamp(Number.isFinite(crop.offsetY) ? crop.offsetY : 0, -1, 1) };
}

export function resolveCrop(dimensions: PhotoDimensions, requested: CropState): ResolvedCrop {
  if (!(dimensions.width > 0 && dimensions.height > 0)) throw new Error('Invalid decoded dimensions');
  const crop = normalizeCrop(requested);
  const scale = Math.max(REGION_WIDTH / dimensions.width, REGION_HEIGHT / dimensions.height) * crop.zoom;
  const width = dimensions.width * scale;
  const height = dimensions.height * scale;
  const travelX = Math.max(0, (width - REGION_WIDTH) / 2);
  const travelY = Math.max(0, (height - REGION_HEIGHT) / 2);
  return { x: -travelX + crop.offsetX * travelX, y: -travelY + crop.offsetY * travelY,
    width, height, travelX, travelY, scale };
}

export function dragCrop(crop: CropState, dimensions: PhotoDimensions, delta: Point): CropState {
  const resolved = resolveCrop(dimensions, crop);
  return { zoom: normalizeCrop(crop).zoom,
    offsetX: resolved.travelX > 0 ? clamp(crop.offsetX + delta.x / resolved.travelX, -1, 1) : 0,
    offsetY: resolved.travelY > 0 ? clamp(crop.offsetY + delta.y / resolved.travelY, -1, 1) : 0 };
}

export function zoomCropAround(crop: CropState, dimensions: PhotoDimensions, requestedZoom: number, from: Point, to: Point = from): CropState {
  const before = resolveCrop(dimensions, crop);
  const zoom = clamp(requestedZoom, MIN_ZOOM, MAX_ZOOM);
  const after = resolveCrop(dimensions, { zoom, offsetX: 0, offsetY: 0 });
  const imageX = (from.x - before.x) / before.width;
  const imageY = (from.y - before.y) / before.height;
  const wantedX = to.x - imageX * after.width;
  const wantedY = to.y - imageY * after.height;
  return { zoom,
    offsetX: after.travelX > 0 ? clamp((wantedX + after.travelX) / after.travelX, -1, 1) : 0,
    offsetY: after.travelY > 0 ? clamp((wantedY + after.travelY) / after.travelY, -1, 1) : 0 };
}

export function setCropZoom(crop: CropState, dimensions: PhotoDimensions, zoom: number): CropState {
  return zoomCropAround(crop, dimensions, zoom, { x: REGION_WIDTH / 2, y: REGION_HEIGHT / 2 });
}

export function resetCrop(): CropState { return { zoom: 1, offsetX: 0, offsetY: 0 }; }

export function coversPhotoRegion(resolved: ResolvedCrop, epsilon = 0.000001): boolean {
  return resolved.x <= epsilon && resolved.y <= epsilon && resolved.x + resolved.width >= REGION_WIDTH - epsilon && resolved.y + resolved.height >= REGION_HEIGHT - epsilon;
}

export function updateMonthCrop(state: ProjectState, month: MonthNumber, requested: CropState): ProjectState {
  const slot = state.project.months[month];
  if (!slot.photoItemId || !slot.crop) throw new Error('Cannot crop a missing photo');
  const item = state.project.photoItems[slot.photoItemId];
  const asset = state.assets[item.assetId];
  const crop = normalizeCrop(requested);
  const resolved = resolveCrop({ width: asset.decodedWidth, height: asset.decodedHeight }, crop);
  return { ...state, project: { ...state.project, months: { ...state.project.months,
    [month]: { ...slot, crop: { zoom: crop.zoom, offsetX: resolved.travelX ? crop.offsetX : 0, offsetY: resolved.travelY ? crop.offsetY : 0 } } } } };
}
