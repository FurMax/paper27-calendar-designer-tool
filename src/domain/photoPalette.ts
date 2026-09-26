import { rgbToHex } from './color.ts';
import type { HexColor } from './project.ts';

export interface PhotoColorSuggestion {
  label: string;
  color: HexColor;
  source: 'photo' | 'extension' | 'safe';
}
export interface PhotoPalette {
  suggestions: readonly [PhotoColorSuggestion, PhotoColorSuggestion, PhotoColorSuggestion];
  fallback: boolean;
}
type Rgb = readonly [number, number, number];
const SAFE: PhotoPalette['suggestions'] = [
  { label: '备选 1', color: '#DCE8E2', source: 'safe' },
  { label: '备选 2', color: '#E9D8BD', source: 'safe' },
  { label: '备选 3', color: '#344B56', source: 'safe' },
];
function hsl([red, green, blue]: Rgb): [number, number, number] {
  const r = red / 255, g = green / 255, b = blue / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  const light = (max + min) / 2;
  if (!delta) return [0, 0, light];
  const saturation = delta / (1 - Math.abs(2 * light - 1));
  const hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return [((hue * 60) + 360) % 360, saturation, light];
}
function rgb(hue: number, saturation: number, light: number): HexColor {
  const h = ((hue % 360) + 360) % 360, c = (1 - Math.abs(2 * light - 1)) * saturation;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const m = light - c / 2;
  return rgbToHex(Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255))!;
}
function colorDistance(a: Rgb, b: Rgb): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
function channels(hex: HexColor): Rgb {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}
export function recommendPhotoPalette(pixels: readonly Rgb[]): PhotoPalette {
  if (!pixels.length) return { suggestions: SAFE, fallback: true };
  // Each candidate is the mean of a small RGB bucket from the visible photo crop.
  // Keep neutral and dark pixels: they are often the most useful background colors.
  const buckets = new Map<string, { count: number; sum: [number, number, number] }>();
  for (const pixel of pixels) {
    const key = pixel.map(channel => Math.min(15, Math.floor(channel / 16))).join(',');
    const bucket = buckets.get(key) ?? { count: 0, sum: [0, 0, 0] as [number, number, number] };
    bucket.count++;
    for (let channel = 0; channel < 3; channel++) bucket.sum[channel] += pixel[channel];
    buckets.set(key, bucket);
  }
  const candidates = [...buckets.values()].map(bucket => ({
    count: bucket.count,
    color: bucket.sum.map(channel => Math.round(channel / bucket.count)) as [number, number, number],
  })).sort((a, b) => b.count - a.count);
  const chosen: typeof candidates = [candidates[0]];
  const minimumCount = Math.max(2, Math.ceil(pixels.length * 0.005));
  while (chosen.length < 3) {
    const next = candidates.filter(candidate => !chosen.includes(candidate) && candidate.count >= minimumCount)
      .map(candidate => ({ candidate, distance: Math.min(...chosen.map(item => colorDistance(candidate.color, item.color))) }))
      .filter(item => item.distance >= 35)
      .sort((a, b) => b.distance * Math.sqrt(b.candidate.count) - a.distance * Math.sqrt(a.candidate.count))[0];
    if (!next) break;
    chosen.push(next.candidate);
  }
  const suggestions: PhotoColorSuggestion[] = chosen.map((candidate, index) => ({
    label: ['主色', '搭配色', '点缀色'][index],
    color: rgbToHex(...candidate.color)!,
    source: 'photo',
  }));
  const [hue, saturation, light] = hsl(chosen[0].color);
  for (const targetLight of [light > 0.55 ? 0.28 : 0.83, light > 0.55 ? 0.76 : 0.28, 0.36, 0.90]) {
    if (suggestions.length === 3) break;
    const color = rgb(hue, saturation, targetLight);
    if (suggestions.every(option => colorDistance(channels(option.color), channels(color)) >= 35)) {
      suggestions.push({ label: targetLight >= 0.65 ? '延展浅色' : '延展深色', color, source: 'extension' });
    }
  }
  // Even a uniform black/white source should expose three distinct choices.
  for (const targetLight of [0.25, 0.55, 0.82]) {
    if (suggestions.length === 3) break;
    const color = rgb(hue, saturation, targetLight);
    if (!suggestions.some(option => option.color === color)) suggestions.push({ label: targetLight >= 0.65 ? '延展浅色' : '延展深色', color, source: 'extension' });
  }
  const [first, second, third] = suggestions;
  if (!first || !second || !third) throw new Error('Could not form a photo palette');
  return { suggestions: [first, second, third], fallback: false };
}
export interface CoordinatedColorChoice {
  color: HexColor;
  basisColor: HexColor;
  basisLabel: string;
  softened: boolean;
}

export function coordinatedSetColorChoice(palette: PhotoPalette): CoordinatedColorChoice {
  if (palette.fallback) return { color: SAFE[0].color, basisColor: SAFE[0].color, basisLabel: '固定备选色', softened: false };
  const dominant = palette.suggestions[0];
  const [dominantHue, dominantSaturation] = hsl(channels(dominant.color));
  const alternates = palette.suggestions.slice(1);
  const photoAlternates = alternates.filter(option => option.source === 'photo');
  const candidates = photoAlternates.length ? photoAlternates : alternates;
  const score = (option: PhotoColorSuggestion) => {
    const [hue, saturation, light] = hsl(channels(option.color));
    const gap = Math.abs(hue - dominantHue);
    const hueGap = Math.min(gap, 360 - gap);
    const contrast = saturation < 0.1 || dominantSaturation < 0.1 ? 55 : Math.abs(hueGap - 55);
    const darkPenalty = light < 0.55 ? (0.55 - light) * 80 : 0;
    const vividPenalty = saturation > 0.7 ? (saturation - 0.7) * 40 : 0;
    return contrast + darkPenalty + vividPenalty;
  };
  const basis = [...candidates].sort((a, b) => score(a) - score(b))[0] ?? dominant;
  const [hue, saturation, light] = hsl(channels(basis.color));
  const softened = light < 0.6 || light > 0.9 || saturation > 0.6;
  const color = softened
    ? rgb(hue, Math.min(saturation, 0.48), light < 0.6 ? 0.72 + light * 0.12 : Math.min(light, 0.88))
    : basis.color;
  return { color, basisColor: basis.color, basisLabel: basis.label, softened };
}

export function coordinatedSetColor(palette: PhotoPalette): HexColor {
  return coordinatedSetColorChoice(palette).color;
}
