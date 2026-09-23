import type { PhotoAsset } from '../../domain/project.ts';

export interface ImportResult { assets: PhotoAsset[]; unreadable: string[] }

async function decodeDimensions(file: File): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  } finally { URL.revokeObjectURL(url); }
}

export async function decodePhotoSelection(files: FileList | readonly File[]): Promise<ImportResult> {
  const selected = Array.from(files);
  if (selected.length > 12) throw new Error('一次最多选择 12 张照片。请重新选择。');
  const assets: PhotoAsset[] = [];
  const unreadable: string[] = [];
  for (const file of selected) {
    try {
      const dimensions = await decodeDimensions(file);
      if (dimensions.width <= 0 || dimensions.height <= 0) throw new Error('Empty image');
      assets.push({ id: crypto.randomUUID(), blob: file, mime: file.type || 'application/octet-stream', fileName: file.name,
        byteSize: file.size, decodedWidth: dimensions.width, decodedHeight: dimensions.height, importedAt: new Date().toISOString() });
    } catch { unreadable.push(file.name); }
  }
  return { assets, unreadable };
}
