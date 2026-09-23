import { newId } from '../../domain/id.ts';
import type { PhotoAsset } from '../../domain/project.ts';

export interface ImportDiagnostic { fileName: string; mime: string; byteSize: number; reason: string }
export interface ImportResult { assets: PhotoAsset[]; unreadable: string[]; diagnostics?: ImportDiagnostic[] }

function errorName(error: unknown): string {
  return error instanceof Error ? `${error.name}${error.message ? `: ${error.message}` : ''}` : String(error);
}

async function decodeDimensions(file: File): Promise<{ width: number; height: number }> {
  let bitmapError = '不可用';
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dimensions;
    } catch (error) { bitmapError = errorName(error); }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  } catch (error) {
    throw new Error(`位图解码 ${bitmapError}；图片解码 ${errorName(error)}`);
  } finally { URL.revokeObjectURL(url); }
}

export async function decodePhotoSelection(files: FileList | readonly File[]): Promise<ImportResult> {
  const selected = Array.from(files);
  if (selected.length > 12) throw new Error('一次最多选择 12 张照片。请重新选择。');
  const assets: PhotoAsset[] = [];
  const unreadable: string[] = [];
  const diagnostics: ImportDiagnostic[] = [];
  for (const file of selected) {
    let dimensions: { width: number; height: number };
    try {
      dimensions = await decodeDimensions(file);
      if (dimensions.width <= 0 || dimensions.height <= 0) throw new Error('解码尺寸为零');
    } catch (error) {
      unreadable.push(file.name);
      diagnostics.push({ fileName: file.name, mime: file.type || '类型未知', byteSize: file.size, reason: errorName(error) });
      continue;
    }
    // ID generation is intentionally outside the decode catch: an environment
    // failure must never be reported as an unreadable photo.
    assets.push({ id: newId(), blob: file, mime: file.type || 'application/octet-stream', fileName: file.name,
      byteSize: file.size, decodedWidth: dimensions.width, decodedHeight: dimensions.height, importedAt: new Date().toISOString() });
  }
  return diagnostics.length ? { assets, unreadable, diagnostics } : { assets, unreadable };
}
