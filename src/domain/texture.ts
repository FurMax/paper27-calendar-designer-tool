import type { HexColor } from './project.ts';
import { autoInk, contrastRatio, DARK_INK, LIGHT_INK } from './color.ts';

export const TEXTURE_OPTIONS = [
  { id: 'none', label: '无纹理' },
  { id: 'lines', label: '细横线' },
  { id: 'grid', label: '浅网格' },
  { id: 'waves', label: '波浪格' },
  { id: 'dots', label: '波点' },
  { id: 'paper', label: '纸张肌理' },
  { id: 'vellum', label: '硫酸纸' },
] as const;

export type TextureId = (typeof TEXTURE_OPTIONS)[number]['id'];

export function isTextureId(value: unknown): value is TextureId {
  return TEXTURE_OPTIONS.some(option => option.id === value);
}

export function textureTileSize(texture: TextureId): number {
  return texture === 'vellum' ? 512 : texture === 'dots' ? 288 : texture === 'paper' ? 96 : 48;
}

export function polkaDotAppearance(background: HexColor): { ink: HexColor; opacity: number } {
  const whiteContrast = contrastRatio(background, LIGHT_INK);
  // White-on-white nearly disappears, even at full opacity.
  if (whiteContrast < 1.25) return { ink: DARK_INK, opacity: 0.13 };
  return { ink: LIGHT_INK, opacity: whiteContrast < 1.8 ? 0.65 : 0.55 };
}

function textureAppearance(texture: Exclude<TextureId, 'none'>, background: HexColor): { ink: HexColor; opacity: number } {
  return texture === 'dots' ? polkaDotAppearance(background) : { ink: autoInk(background), opacity: 0 };
}

function textureCacheKey(texture: Exclude<TextureId, 'none'>, background: HexColor): string {
  const appearance = textureAppearance(texture, background);
  return `${texture}:${appearance.ink}:${appearance.opacity}`;
}

const tiles = new Map<string, HTMLCanvasElement>();
const cssImages = new Map<string, string>();

function makeTile(texture: Exclude<TextureId, 'none'>, ink: HexColor, dotOpacity: number): HTMLCanvasElement {
  const tile = document.createElement('canvas');
  tile.width = textureTileSize(texture);
  tile.height = texture === 'dots' ? 256 : tile.width;
  const ctx = tile.getContext('2d');
  if (!ctx) throw new Error('浏览器无法绘制日历纹理。');
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = 'round';

  if (texture === 'lines') {
    ctx.globalAlpha = 0.09;
    ctx.lineWidth = 0.85;
    for (const y of [12, 36]) {
      ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(48, y + 0.5); ctx.stroke();
    }
  } else if (texture === 'grid') {
    ctx.globalAlpha = 0.065;
    ctx.lineWidth = 0.8;
    for (const position of [0.5, 24.5]) {
      ctx.beginPath(); ctx.moveTo(position, 0); ctx.lineTo(position, 48); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, position); ctx.lineTo(48, position); ctx.stroke();
    }
  } else if (texture === 'waves') {
    ctx.globalAlpha = 0.09;
    ctx.lineWidth = 1.55;
    for (const y of [12, 36]) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(12, y - 10, 12, y + 10, 24, y);
      ctx.bezierCurveTo(36, y - 10, 36, y + 10, 48, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.055;
    ctx.lineWidth = 1.1;
    for (const x of [12, 36]) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 8, 12, x - 8, 12, x, 24);
      ctx.bezierCurveTo(x + 8, 36, x - 8, 36, x, 48);
      ctx.stroke();
    }
  } else if (texture === 'dots') {
    // A 288 x 256 staggered tile repeats at 128px row intervals. Across the
    // 1200 x 756 calendar, every circle stays whole and inset from each edge.
    ctx.globalAlpha = dotOpacity;
    for (const [x, y] of [[96, 60], [240, 188]] as const) {
      ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.fill();
    }
  } else if (texture === 'vellum') {
    // Smooth translucent/satin paper: periodic low-frequency haze avoids tile seams.
    // Dark backgrounds get a lighter, bounded wash to preserve white text contrast.
    const darkBase = ink === '#FFFFFF';
    const size = tile.width;
    const image = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const u = Math.PI * 2 * x / size, v = Math.PI * 2 * y / size;
      const haze = 0.46 * Math.sin(u) * Math.sin(v)
        + 0.23 * Math.sin(2 * u + v)
        + 0.19 * Math.cos(u - 2 * v)
        + 0.12 * Math.sin(3 * u - 2 * v);
      const amount = Math.min(1, Math.max(0, (haze + 0.9) / 1.8));
      const satin = 1.5 * Math.sin(27 * u + 12 * v);
      const offset = (y * size + x) * 4;
      image.data[offset] = darkBase ? 246 : 201;
      image.data[offset + 1] = darkBase ? 249 : 212;
      image.data[offset + 2] = darkBase ? 250 : 214;
      image.data[offset + 3] = Math.round((darkBase ? 6 + 12 * amount : 45 + 105 * amount) + satin);
    }
    ctx.putImageData(image, 0, 0);
  } else {
    ctx.globalAlpha = 0.095;
    ctx.lineWidth = 2.5;
    const fibers = [
      [6, 9, 16, 8], [32, 18, 39, 20], [65, 4, 73, 3], [87, 24, 90, 31],
      [16, 35, 25, 33], [50, 28, 56, 26], [78, 43, 86, 44],
      [3, 47, 12, 45], [36, 58, 44, 58], [68, 39, 74, 43], [87, 65, 94, 63],
      [18, 70, 25, 66], [49, 52, 57, 54], [74, 77, 81, 75],
      [7, 88, 13, 86], [36, 82, 41, 87], [65, 91, 72, 88], [87, 86, 93, 87],
    ] as const;
    for (const [x1, y1, x2, y2] of fibers) {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    for (const [x, y] of [[22, 14], [59, 34], [9, 69], [76, 82]] as const) {
      ctx.fillRect(x, y, 2, 2);
    }
  }
  return tile;
}

function textureTile(texture: Exclude<TextureId, 'none'>, background: HexColor): HTMLCanvasElement {
  const { ink, opacity } = textureAppearance(texture, background);
  const key = textureCacheKey(texture, background);
  let tile = tiles.get(key);
  if (!tile) { tile = makeTile(texture, ink, opacity); tiles.set(key, tile); }
  return tile;
}

export function textureCssImage(texture: TextureId, background: HexColor): string | undefined {
  if (texture === 'none') return undefined;
  const key = textureCacheKey(texture, background);
  let image = cssImages.get(key);
  if (!image) {
    image = 'url("' + textureTile(texture, background).toDataURL('image/png') + '")';
    cssImages.set(key, image);
  }
  return image;
}

export function drawCalendarTexture(
  ctx: CanvasRenderingContext2D,
  texture: TextureId,
  background: HexColor,
  x: number, y: number, width: number, height: number,
): void {
  if (texture === 'none') return;
  const pattern = ctx.createPattern(textureTile(texture, background), 'repeat');
  if (!pattern) throw new Error('浏览器无法绘制日历纹理。');
  ctx.save();
  ctx.fillStyle = pattern;
  // Polka dots align to the calendar area's local origin in both proof and export,
  // keeping the sparse rows between calendar text rather than beneath numerals.
  if (texture === 'dots') {
    ctx.translate(0, y);
    ctx.fillRect(x, 0, width, height);
  } else ctx.fillRect(x, y, width, height);
  if (texture === 'vellum') {
    const edge = ctx.createLinearGradient(0, y, 0, y + 12);
    edge.addColorStop(0, 'rgba(87,112,121,0.28)');
    edge.addColorStop(0.2, 'rgba(87,112,121,0.10)');
    edge.addColorStop(1, 'rgba(87,112,121,0)');
    ctx.fillStyle = edge;
    ctx.fillRect(x, y, width, Math.min(12, height));
  }
  ctx.restore();
}
