import { OUTPUT_GEOMETRY } from '../domain/geometry.ts';
import { PRINT_GEOMETRY } from '../domain/exportVariant.ts';
import { resolveCrop } from '../domain/crop.ts';
import { resolvePrintPhotoCrop } from '../domain/printPhotoCrop.ts';
import type { ExportVariant } from '../domain/exportVariant.ts';
import type { CropState } from '../domain/project.ts';

export type PhotoEdge = 'top' | 'right' | 'bottom' | 'left';
export const PHOTO_EDGE_LABELS: Record<PhotoEdge, string> = {
  top: '上方', right: '右侧', bottom: '下方', left: '左侧',
};

export async function analyzePhotoEdgeRisk(
  blob: Blob, width: number, height: number, crop: CropState, variant: ExportVariant = 'digital',
): Promise<PhotoEdge[]> {
  const url = URL.createObjectURL(blob);
  const image = new Image();
  try {
    image.src = url;
    await image.decode();
    if (image.naturalWidth !== width || image.naturalHeight !== height) throw new Error('照片检查的解码尺寸与已保存尺寸不一致。');
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    const printScale = canvas.width / PRINT_GEOMETRY.width;
    const trimScaleX = PRINT_GEOMETRY.trim.width / OUTPUT_GEOMETRY.width;
    const trimScaleY = PRINT_GEOMETRY.trim.height / OUTPUT_GEOMETRY.height;
    const printPhotoBottom = PRINT_GEOMETRY.trim.y + OUTPUT_GEOMETRY.photo.height * trimScaleY;
    canvas.height = variant === 'print'
      ? Math.ceil(printPhotoBottom * printScale)
      : Math.round(canvas.width * OUTPUT_GEOMETRY.photo.height / OUTPUT_GEOMETRY.photo.width);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('此浏览器无法检查照片边缘。');
    const baseCrop = resolveCrop({ width, height }, crop);
    const resolved = variant === 'print' ? resolvePrintPhotoCrop(baseCrop) : baseCrop;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (variant === 'print') {
      // Check the same full-bleed photo rectangle used by addPrintBleed.
      // A pale strip may be outside the trim preview yet visible in the PNG.
      ctx.drawImage(image,
        (PRINT_GEOMETRY.trim.x + resolved.x * trimScaleX) * printScale,
        (PRINT_GEOMETRY.trim.y + resolved.y * trimScaleY) * printScale,
        resolved.width * trimScaleX * printScale,
        resolved.height * trimScaleY * printScale);
    } else {
      const scale = canvas.width / OUTPUT_GEOMETRY.photo.width;
      ctx.drawImage(image, resolved.x * scale, resolved.y * scale, resolved.width * scale, resolved.height * scale);
    }
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const sample = (x: number, y: number): [number, number, number] => {
      const i = (y * canvas.width + x) * 4;
      return [data[i], data[i + 1], data[i + 2]];
    };
    const light = (rgb: number[]) => rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    const broadLightEdge = (side: PhotoEdge): boolean => {
      const horizontal = side === 'top' || side === 'bottom';
      const span = horizontal ? canvas.width : canvas.height;
      const depth = horizontal ? canvas.height : canvas.width;
      let suspicious = 0, checked = 0;
      for (let at = Math.ceil(span * 0.15); at < Math.floor(span * 0.85); at += 2) {
        const edgeDepth = side === 'top' || side === 'left' ? 2 : depth - 3;
        const innerDepth = side === 'top' || side === 'left' ? Math.round(depth * 0.13) : depth - 1 - Math.round(depth * 0.13);
        const edge = horizontal ? sample(at, edgeDepth) : sample(edgeDepth, at);
        const inner = horizontal ? sample(at, innerDepth) : sample(innerDepth, at);
        const edgeLight = light(edge), innerLight = light(inner);
        const difference = Math.max(...edge.map((value, i) => Math.abs(value - inner[i])));
        if ((edgeLight >= 175 && edgeLight - innerLight >= 28) || (edgeLight >= 238 && difference >= 35)) suspicious++;
        checked++;
      }
      return checked > 0 && suspicious / checked >= 0.62;
    };
    return (['top', 'right', 'bottom', 'left'] as const).filter(broadLightEdge);
  } finally {
    URL.revokeObjectURL(url);
  }
}

