import { type MonthNumber } from '../domain/calendar.ts';
import { buildMonthRenderModel } from '../domain/renderModel.ts';
import { isMonthReady, type ProjectState } from '../domain/project.ts';
import type { TypographyPreset } from '../domain/typography.ts';

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

export async function renderMonthPng(state: ProjectState, month: MonthNumber): Promise<RenderedMonthPng> {
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
  const canvas = document.createElement('canvas');
  canvas.width = geometry.width; canvas.height = geometry.height;
  try {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('此浏览器无法创建 PNG 画布。');
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, geometry.width, geometry.height);
    ctx.save();
    ctx.beginPath(); ctx.rect(geometry.photo.x, geometry.photo.y, geometry.photo.width, geometry.photo.height); ctx.clip();
    ctx.drawImage(decoded.source, geometry.photo.x + photo.resolved.x, geometry.photo.y + photo.resolved.y, photo.resolved.width, photo.resolved.height);
    ctx.restore();
    ctx.fillStyle = model.background; ctx.fillRect(geometry.calendar.x, geometry.calendar.y, geometry.calendar.width, geometry.calendar.height);
    drawCalendarText(ctx, model);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(Error('浏览器未能生成 PNG。')), 'image/png'));
    await validatePng(blob, geometry.width, geometry.height);
    return { blob, fileName: `${String(month).padStart(2, '0')}-${model.calendar.name}-${model.calendar.year}.png`, month };
  } finally { decoded.dispose(); canvas.width = 0; canvas.height = 0; }
}
