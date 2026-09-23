import type { ResolvedCrop, Point } from './crop.ts';

const clamp = (value: number, high: number) => Math.min(high, Math.max(0, value));

export function sourcePixelAt(outputPoint: Point, crop: ResolvedCrop, width: number, height: number): { x: number; y: number } {
  return {
    x: clamp(Math.floor((outputPoint.x - crop.x) / crop.width * width), width - 1),
    y: clamp(Math.floor((outputPoint.y - crop.y) / crop.height * height), height - 1),
  };
}
