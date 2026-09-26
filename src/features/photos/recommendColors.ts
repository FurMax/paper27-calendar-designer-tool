import { resolveCrop } from '../../domain/crop.ts';
import { resolvePrintPhotoCrop } from '../../domain/printPhotoCrop.ts';
import { OUTPUT_GEOMETRY } from '../../domain/geometry.ts';
import { recommendPhotoPalette, type PhotoPalette } from '../../domain/photoPalette.ts';
import type { CropState } from '../../domain/project.ts';
import type { ExportVariant } from '../../domain/exportVariant.ts';

export async function analyzePhotoPalette(blob: Blob, width: number, height: number, crop: CropState, variant: ExportVariant = 'digital'): Promise<PhotoPalette> {
  let source: ImageBitmap | HTMLImageElement;
  let release: () => void;
  if (typeof createImageBitmap === 'function') {
    try { const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' }); source = bitmap; release = () => bitmap.close(); }
    catch { const url = URL.createObjectURL(blob); const image = new Image(); try { image.src = url; await image.decode(); source = image; release = () => URL.revokeObjectURL(url); } catch (error) { URL.revokeObjectURL(url); throw error; } }
  } else {
    const url = URL.createObjectURL(blob); const image = new Image();
    try { image.src = url; await image.decode(); source = image; release = () => URL.revokeObjectURL(url); }
    catch (error) { URL.revokeObjectURL(url); throw error; }
  }
  try {
    const decodedWidth = 'naturalWidth' in source ? source.naturalWidth : source.width;
    const decodedHeight = 'naturalHeight' in source ? source.naturalHeight : source.height;
    if (decodedWidth !== width || decodedHeight !== height) throw new Error('照片尺寸已变化');
    const canvas = document.createElement('canvas'); canvas.width = 48; canvas.height = 42;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('无法读取照片颜色');
    const base = resolveCrop({ width, height }, crop);
    const selected = variant === 'print' ? resolvePrintPhotoCrop(base) : base;
    ctx.drawImage(source, selected.x / OUTPUT_GEOMETRY.photo.width * canvas.width,
      selected.y / OUTPUT_GEOMETRY.photo.height * canvas.height,
      selected.width / OUTPUT_GEOMETRY.photo.width * canvas.width,
      selected.height / OUTPUT_GEOMETRY.photo.height * canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const pixels: [number, number, number][] = [];
    for (let i = 0; i < data.length; i += 4) if (data[i + 3] >= 250) pixels.push([data[i], data[i + 1], data[i + 2]]);
    return recommendPhotoPalette(pixels);
  } finally { release(); }
}
