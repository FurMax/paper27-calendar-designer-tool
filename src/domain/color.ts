import type { HexColor } from './project.ts';

export const COMMON_COLORS = [
  { label: '奶油白', color: '#F7F4EE' },
  { label: '浅雾灰', color: '#E6EBE8' },
  { label: '暖米色', color: '#E9E1D3' },
  { label: '薄荷奶绿', color: '#CFE8D6' },
  { label: '鼠尾草绿', color: '#BFD1C3' },
  { label: 'Baby Blue', color: '#B7D7F2' },
  { label: '雾霾蓝', color: '#95A8C7' },
  { label: '淡柠檬黄', color: '#F3EEA4' },
  { label: '软桃粉', color: '#F4C7C3' },
  { label: '浅丁香紫', color: '#D9C7EB' },
] as const satisfies readonly { label: string; color: HexColor }[];

export const DARK_INK: HexColor = '#18201D';
export const LIGHT_INK: HexColor = '#FFFFFF';
// Technical candidate for the M4 warning; final threshold remains open for device QA.
export const CUSTOM_WARNING_RATIO = 4.5;

export function canonicalHex(value: string): HexColor | null {
  const trimmed = value.trim();
  const short = /^#?([0-9a-f]{3})$/i.exec(trimmed);
  if (short) return ('#' + [...short[1]].map(c => c + c).join('').toUpperCase()) as HexColor;
  const full = /^#?([0-9a-f]{6})$/i.exec(trimmed);
  return full ? ('#' + full[1].toUpperCase()) as HexColor : null;
}

export function rgbToHex(red: number, green: number, blue: number): HexColor | null {
  if (![red, green, blue].every(n => Number.isInteger(n) && n >= 0 && n <= 255)) return null;
  return ('#' + [red, green, blue].map(n => n.toString(16).padStart(2, '0')).join('').toUpperCase()) as HexColor;
}

export function hexToRgb(hex: HexColor): [number, number, number] {
  const normalized = canonicalHex(hex);
  if (!normalized) throw new Error('Invalid hex color');
  return [1, 3, 5].map(i => parseInt(normalized.slice(i, i + 2), 16)) as [number, number, number];
}

function luminance(hex: HexColor): number {
  const [r, g, b] = hexToRgb(hex).map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: HexColor, b: HexColor): number {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function autoInk(background: HexColor): HexColor {
  return contrastRatio(background, DARK_INK) >= contrastRatio(background, LIGHT_INK) ? DARK_INK : LIGHT_INK;
}

export function customContrastWarning(background: HexColor, ink: HexColor): boolean {
  return contrastRatio(background, ink) < CUSTOM_WARNING_RATIO;
}
