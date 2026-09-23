import { type MonthNumber } from '../domain/calendar.ts';
import { buildMonthRenderModel } from '../domain/renderModel.ts';
import { isMonthReady, type ProjectState } from '../domain/project.ts';
import { PRINT_DPI, PRINT_GEOMETRY, type ExportVariant } from '../domain/exportVariant.ts';
import type { TypographyPreset } from '../domain/typography.ts';
import { setPngDpi } from './pngMetadata.ts';

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10] as const;
export interface RenderedMonthPng { blob: Blob; fileName: string; month: MonthNumber }

function faceMatches(face: FontFace, family: string): boolean { return face.family.replaceAll('"', '') === family && face.status === 'loaded'; }
export async function ensurePresetFonts(preset: TypographyPreset): Promise<void> {
  const required = [
    { family: preset.monthFamily, weight: preset.monthWeight },
    { family: preset.detailFamily, weight: preset.detailWeight },
  ];
  for (const { family, weight } of required) {
    const loaded = await document.fonts.load(`${weight} 32px "${family}"`, 'January 2027 0123456789SMTWF');
    if (!loaded.some(face => faceMatches(face, family))) throw new Error(`字体 ${family} 未加载，已停止生成 PNG。`);
  }
}

async function decodeForCanvas(blob: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; dispose: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, dispose: () => bitmap.close() };
    } catch { /* Image element fallback is required on browsers without bitmap decode for this file. */ }
  }
  const url = URL.createObjectURL(blob);
  const image = new Image();
  try {
    image.src = url;
    await image.decode();
    return { source: image, width: image.naturalWidth, height: image.naturalHeight, dispose: () => URL.revokeObjectURL(url) };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw new Error(`照片无法解码：${error instanceof Error ? error.message : String(error)}`);
  }
}

function applyFont(ctx: CanvasRenderingContext2D, family: string, weight: number, size: number) {
  ctx.font = `${weight} ${size}px "${family}"`;
}
export function drawCalendarText(ctx: CanvasRenderingContext2D, model: ReturnType<typeof buildMonthRenderModel>): void {
  const { geometry, typography, scale, calendar, weekdays } = model;
  ctx.fillStyle = model.ink;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  applyFont(ctx, typography.monthFamily, typography.monthWeight, 76 * scale);
  ctx.fillText(calendar.name, geometry.monthTitle.x, geometry.monthTitle.y, 840);
  ctx.textAlign = 'right';
  applyFont(ctx, typography.detailFamily, typography.detailWeight, 44 * scale);
  ctx.fillText(String(calendar.year), geometry.year.x, geometry.year.y);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  applyFont(ctx, typography.detailFamily, typography.detailWeight, 35 * scale);
  weekdays.forEach((day, col) => ctx.fillText(day, geometry.weekdays.left + (col + 0.5) * geometry.weekdays.width / 7, geometry.weekdays.top + 21));
  applyFont(ctx, typography.detailFamily, typography.detailWeight, 38 * scale);
  calendar.cells.forEach((day, index) => {
    if (day === null) return;
    const col = index % 7, row = Math.floor(index / 7);
    const x = geometry.dates.left + (col + 0.5) * geometry.dates.width / 7;
    const y = geometry.dates.top + (row + 0.5) * geometry.dates.height / 6;
    ctx.fillText(String(day), x, y);
  });
}

export async function validatePng(blob: Blob, width: number, height: number): Promise<void> {
  if (blob.type !== 'image/png') throw new Error('浏览器未生成 PNG 格式。');
  const header = new Uint8Array(await blob.slice(0, 24).arrayBuffer());
  if (header.length < 24 || !PNG_SIGNATURE.every((byte, i) => header[i] === byte)) throw new Error('PNG 文件头无效。');
  const view = new DataView(header.buffer, header.byteOffset, header.byteLength);
  if (view.getUint32(16) !== width || view.getUint32(20) !== height) throw new Error('PNG 尺寸不正确。');
}

function drawArtwork(ctx: CanvasRenderingContext2D, decoded: CanvasImageSource, model: ReturnType<typeof buildMonthRenderModel>): void {
  const { geometry, photo } = model;
  if (!photo) return;
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, geometry.width, geometry.height);
  ctx.save();
  ctx.beginPath(); ctx.rect(geometry.photo.x, geometry.photo.y, geometry.photo.width, geometry.photo.height); ctx.clip();
  ctx.drawImage(decoded, geometry.photo.x + photo.resolved.x, geometry.photo.y + photo.resolved.y, photo.resolved.width, photo.resolved.height);
  ctx.restore();
  ctx.fillStyle = model.background; ctx.fillRect(geometry.calendar.x, geometry.calendar.y, geometry.calendar.width, geometry.calendar.height);
  drawCalendarText(ctx, model);
}

function addPrintBleed(trimmed: HTMLCanvasElement, decoded: CanvasImageSource, model: ReturnType<typeof buildMonthRenderModel>): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = PRINT_GEOMETRY.width; canvas.height = PRINT_GEOMETRY.height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx || !model.photo) throw new Error('此浏览器无法创建印刷画布。');
  const { x, y, width, height } = PRINT_GEOMETRY.trim;
  const { left, right, top, bottom } = PRINT_GEOMETRY.bleed;
  const sourceWidth = model.geometry.width, sourceHeight = model.geometry.height;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = model.background; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(trimmed, 0, 0, sourceWidth, sourceHeight, x, y, width, height);
  // Extend the exact trimmed edge into bleed. This remains covered even when
  // the selected source photo has no pixels outside the crop at zoom 1.
  ctx.drawImage(trimmed, 0, 0, sourceWidth, 1, x, 0, width, top);
  ctx.drawImage(trimmed, 0, sourceHeight - 1, sourceWidth, 1, x, y + height, width, bottom);
  ctx.drawImage(trimmed, 0, 0, 1, sourceHeight, 0, y, left, height);
  ctx.drawImage(trimmed, sourceWidth - 1, 0, 1, sourceHeight, x + width, y, right, height);
  ctx.drawImage(trimmed, 0, 0, 1, 1, 0, 0, left, top);
  ctx.drawImage(trimmed, sourceWidth - 1, 0, 1, 1, x + width, 0, right, top);
  ctx.drawImage(trimmed, 0, sourceHeight - 1, 1, 1, 0, y + height, left, bottom);
  ctx.drawImage(trimmed, sourceWidth - 1, sourceHeight - 1, 1, 1, x + width, y + height, right, bottom);
  // Use genuine source pixels in the photo bleed wherever the crop leaves them
  // available. The stretched edge underneath fills any uncovered remainder.
  const scaleX = width / sourceWidth, scaleY = height / sourceHeight;
  const photoBottom = y + model.geometry.photo.height * scaleY;
  const resolved = model.photo.resolved;
  for (const rect of [
    { x: 0, y: 0, width: canvas.width, height: top },
    { x: 0, y: top, width: left, height: photoBottom - top },
    { x: x + width, y: top, width: right, height: photoBottom - top },
  ]) {
    ctx.save();
    ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.width, rect.height); ctx.clip();
    ctx.drawImage(decoded, x + resolved.x * scaleX, y + resolved.y * scaleY, resolved.width * scaleX, resolved.height * scaleY);
    ctx.restore();
  }
  return canvas;
}

export async function renderMonthPng(state: ProjectState, month: MonthNumber, variant: ExportVariant = 'digital'): Promise<RenderedMonthPng> {
  if (!isMonthReady(state, month)) throw new Error(`${month} 月缺少可读取的照片，无法生成 PNG。`);
  const model = buildMonthRenderModel(month, state);
  if (!model.photo) throw new Error(`${month} 月照片不可用。`);
  const asset = state.assets[model.photo.assetId];
  await ensurePresetFonts(model.typography);
  const decoded = await decodeForCanvas(asset.blob);
  const { geometry, photo } = model;
  if (decoded.width !== photo.width || decoded.height !== photo.height) {
    decoded.dispose();
    throw new Error('照片解码尺寸已变化，请重新选择该照片。');
  }
  const trimmed = document.createElement('canvas');
  trimmed.width = geometry.width; trimmed.height = geometry.height;
  let output: HTMLCanvasElement | null = null;
  try {
    const ctx = trimmed.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('此浏览器无法创建 PNG 画布。');
    drawArtwork(ctx, decoded.source, model);
    output = variant === 'print' ? addPrintBleed(trimmed, decoded.source, model) : trimmed;
    const raw = await new Promise<Blob>((resolve, reject) => output!.toBlob(result => result ? resolve(result) : reject(Error('浏览器未能生成 PNG。')), 'image/png'));
    const blob = variant === 'print' ? await setPngDpi(raw, PRINT_DPI) : raw;
    await validatePng(blob, output.width, output.height);
    const suffix = variant === 'print' ? '-Print-106x156mm' : '';
    return { blob, fileName: `${String(month).padStart(2, '0')}-${model.calendar.name}-${model.calendar.year}${suffix}.png`, month };
  } finally { decoded.dispose(); trimmed.width = 0; trimmed.height = 0; if (output && output !== trimmed) { output.width = 0; output.height = 0; } }
}
