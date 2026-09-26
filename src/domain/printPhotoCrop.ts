import { PRINT_GEOMETRY } from './exportVariant.ts';
import { OUTPUT_GEOMETRY } from './geometry.ts';
import type { ResolvedCrop } from './crop.ts';

export interface PrintPhotoCrop {
  x: number;
  y: number;
  width: number;
  height: number;
  bleedScale: number;
}

/**
 * Preserve the saved crop's focus while allowing actual source pixels to cover
 * the whole print photo, including top and side bleed. The photo/calendar
 * boundary is the vertical anchor, so the print crop does not expose a gap.
 */
export function resolvePrintPhotoCrop(resolved: ResolvedCrop): PrintPhotoCrop {
  const photo = OUTPUT_GEOMETRY.photo;
  const scaleX = PRINT_GEOMETRY.trim.width / OUTPUT_GEOMETRY.width;
  const scaleY = PRINT_GEOMETRY.trim.height / OUTPUT_GEOMETRY.height;
  // One output pixel of overscan avoids fractional Canvas edge sampling.
  const left = (PRINT_GEOMETRY.bleed.left + 1) / scaleX;
  const right = (PRINT_GEOMETRY.bleed.right + 1) / scaleX;
  const top = (PRINT_GEOMETRY.bleed.top + 1) / scaleY;
  const centerX = photo.width / 2;
  const bottomY = photo.height;
  const factor = Math.max(
    1,
    (centerX + left) / (centerX - resolved.x),
    (centerX + right) / (resolved.x + resolved.width - centerX),
    (bottomY + top) / (bottomY - resolved.y),
  );
  return {
    x: centerX + factor * (resolved.x - centerX),
    y: bottomY + factor * (resolved.y - bottomY),
    width: factor * resolved.width,
    height: factor * resolved.height,
    bleedScale: factor,
  };
}

