export type PhotoEffectId = 'original' | 'film' | 'cool' | 'halftone' | 'duotone';
export type DuotonePresetId = 'navy-cream' | 'wine-pink' | 'forest-ivory' | 'mist-white' | 'violet-lilac' | 'coral-cream';
export interface PhotoEffect { id: PhotoEffectId; duotone: DuotonePresetId; swapped?: boolean }

export const DEFAULT_PHOTO_EFFECT: PhotoEffect = { id: 'original', duotone: 'navy-cream' };
export const PHOTO_EFFECTS: readonly { id: PhotoEffectId; label: string }[] = [
  { id: 'original', label: '原图' }, { id: 'film', label: '胶片' },
  { id: 'cool', label: '冷调' }, { id: 'halftone', label: '半调' },
  { id: 'duotone', label: '双色映射' },
];
export const DUOTONE_PRESETS: readonly { id: DuotonePresetId; label: string; dark: readonly [number, number, number]; light: readonly [number, number, number] }[] = [
  { id: 'navy-cream', label: '深蓝 × 奶白', dark: [38, 54, 74], light: [243, 238, 227] },
  { id: 'wine-pink', label: '酒红 × 浅粉', dark: [126, 57, 79], light: [232, 188, 200] },
  { id: 'forest-ivory', label: '墨绿 × 米白', dark: [41, 72, 63], light: [239, 232, 218] },
  { id: 'mist-white', label: '雾蓝 × 冷白', dark: [96, 122, 155], light: [237, 243, 247] },
  { id: 'violet-lilac', label: '蓝紫 × 浅紫灰', dark: [110, 100, 140], light: [232, 226, 240] },
  { id: 'coral-cream', label: '珊瑚 × 奶黄', dark: [200, 95, 84], light: [243, 230, 184] },
];
export function isPhotoEffect(value: unknown): value is PhotoEffect {
  if (!value || typeof value !== 'object') return false;
  const effect = value as Partial<PhotoEffect>;
  return PHOTO_EFFECTS.some(item => item.id === effect.id) && DUOTONE_PRESETS.some(item => item.id === effect.duotone) && (effect.swapped === undefined || typeof effect.swapped === 'boolean');
}

const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

/** Apply only inside an already-drawn photo rectangle. The same operation serves proofs and exports. */
export function applyPhotoEffect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, effect: PhotoEffect, logicalScale = 1, anchorX = x, anchorY = y): void {
  if (effect.id === 'original') return;
  const left = Math.max(0, Math.round(x)), top = Math.max(0, Math.round(y));
  const right = Math.min(ctx.canvas.width, Math.round(x + width)), bottom = Math.min(ctx.canvas.height, Math.round(y + height));
  if (right <= left || bottom <= top) return;
  const image = ctx.getImageData(left, top, right - left, bottom - top);
  const data = image.data;
  const duo = DUOTONE_PRESETS.find(item => item.id === effect.duotone) ?? DUOTONE_PRESETS[0];
  for (let index = 0; index < data.length; index += 4) {
    const r = data[index], g = data[index + 1], b = data[index + 2];
    const luminance = .2126 * r + .7152 * g + .0722 * b;
    if (effect.id === 'film') {
      data[index] = clamp((r * .88 + luminance * .12) * .95 + 21);
      data[index + 1] = clamp((g * .88 + luminance * .12) * .94 + 18);
      data[index + 2] = clamp((b * .88 + luminance * .12) * .88 + 20);
    } else if (effect.id === 'cool') {
      data[index] = clamp((r * .79 + luminance * .21) * .91 + 7);
      data[index + 1] = clamp((g * .79 + luminance * .21) * .96 + 9);
      data[index + 2] = clamp((b * .79 + luminance * .21) * .99 + 17);
    } else if (effect.id === 'duotone') {
      const t = Math.pow(luminance / 255, .94);
      const shadow = effect.swapped ? duo.light : duo.dark;
      const highlight = effect.swapped ? duo.dark : duo.light;
      for (let channel = 0; channel < 3; channel++) data[index + channel] = clamp(shadow[channel] * (1 - t) + highlight[channel] * t);
    } else {
      data[index] = clamp(r * .89 + luminance * .11);
      data[index + 1] = clamp(g * .89 + luminance * .11);
      data[index + 2] = clamp(b * .89 + luminance * .11);
    }
  }
  ctx.putImageData(image, left, top);
  if (effect.id !== 'halftone') return;
  // An understated ink screen over the photograph; the image remains readable.
  const pitch = Math.max(3, 9 * logicalScale);
  ctx.save(); ctx.fillStyle = 'rgba(22, 32, 42, .20)';
  for (let cy = anchorY + pitch / 2; cy < bottom; cy += pitch) {
    if (cy < top) continue;
    for (let cx = anchorX + pitch / 2; cx < right; cx += pitch) {
      if (cx < left) continue;
      const sx = Math.min(image.width - 1, Math.max(0, Math.floor(cx - left)));
      const sy = Math.min(image.height - 1, Math.max(0, Math.floor(cy - top)));
      const index = (sy * image.width + sx) * 4;
      const shade = 1 - (.2126 * data[index] + .7152 * data[index + 1] + .0722 * data[index + 2]) / 255;
      const radius = pitch * (.08 + .28 * shade);
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}
