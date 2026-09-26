export type ExportVariant = 'print' | 'digital';

// 100 × 150 mm trim, 3 mm on every side, 300 PPI. Integer pixels
// necessarily round the physical positions by less than 0.05 mm.
export const PRINT_DPI = 300;
export const PRINT_GEOMETRY = Object.freeze({
  width: 1252,
  height: 1843,
  trim: Object.freeze({ x: 35, y: 35, width: 1181, height: 1772 }),
  bleed: Object.freeze({ left: 35, top: 35, right: 36, bottom: 36 }),
  physical: Object.freeze({ trimWidthMm: 100, trimHeightMm: 150, widthMm: 106, heightMm: 156, bleedMm: 3 }),
});

export const EXPORT_VARIANTS: Record<ExportVariant, { label: string; detail: string }> = {
  print: { label: '印刷版', detail: '106 × 156 mm（含四边约 3 mm 出血） · 1252 × 1843 px · 300 PPI' },
  digital: { label: '屏幕版', detail: '1200 × 1800 px · PNG 或 JPG' },
};
