import type { TextScale, TypographyPresetId } from './project.ts';

export interface TypographyPreset {
  id: TypographyPresetId;
  label: string;
  monthFamily: string;
  detailFamily: string;
  monthWeight: number;
  detailWeight: number;
  letterSpacing: string;
}

export const TYPOGRAPHY_PRESETS: Record<TypographyPresetId, TypographyPreset> = {
  classic: { id: 'classic', label: '经典', monthFamily: 'Instrument Serif', detailFamily: 'Instrument Sans', monthWeight: 400, detailWeight: 500, letterSpacing: '0em' },
  minimal: { id: 'minimal', label: '简约', monthFamily: 'Instrument Sans', detailFamily: 'Instrument Sans', monthWeight: 600, detailWeight: 400, letterSpacing: '-0.025em' },
  handwritten: { id: 'handwritten', label: '手写', monthFamily: 'Patrick Hand', detailFamily: 'Patrick Hand', monthWeight: 400, detailWeight: 400, letterSpacing: '0.01em' },
};
export const SCALE_MULTIPLIERS: Record<TextScale, number> = { small: 0.8, standard: 1, large: 1.2 };
export const SCALE_LABELS: Record<TextScale, string> = { small: '小', standard: '标准', large: '大' };

export function expectedFontFamilies(presetId: TypographyPresetId): string[] {
  const preset = TYPOGRAPHY_PRESETS[presetId];
  return [...new Set([preset.monthFamily, preset.detailFamily])];
}
