import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { dragCrop, resolveCrop, zoomCropAround, type Point } from '../../domain/crop.ts';
import { OUTPUT_GEOMETRY } from '../../domain/geometry.ts';
import { resolvePrintPhotoCrop } from '../../domain/printPhotoCrop.ts';
import type { ExportVariant } from '../../domain/exportVariant.ts';
import type { CropState } from '../../domain/project.ts';
import { applyPhotoEffect, DEFAULT_PHOTO_EFFECT, type PhotoEffect } from '../../domain/photoEffect.ts';

interface CropSurfaceProps {
  blob: Blob;
  width: number;
  height: number;
  crop: CropState;
  variant?: ExportVariant;
  onChange?: (crop: CropState) => void;
  effect?: PhotoEffect;
  effectPreviewWidth?: number;
}
interface PointerPosition { x: number; y: number }
interface PinchStart { crop: CropState; distance: number; center: Point }

export function CropSurface({ blob, width, height, crop, variant = 'digital', onChange, effect = DEFAULT_PHOTO_EFFECT, effectPreviewWidth = 600 }: CropSurfaceProps) {
  const [url, setUrl] = useState('');
  const surface = useRef<HTMLDivElement>(null);
  const sourceImage = useRef<HTMLImageElement>(null);
  const effectCanvas = useRef<HTMLCanvasElement>(null);
  const [imageReady, setImageReady] = useState(false);
  const pointers = useRef(new Map<number, PointerPosition>());
  const pinch = useRef<PinchStart | null>(null);
  const currentCrop = useRef(crop);
  useEffect(() => { currentCrop.current = crop; }, [crop]);
  useEffect(() => { const objectUrl = URL.createObjectURL(blob); setImageReady(false); setUrl(objectUrl); return () => URL.revokeObjectURL(objectUrl); }, [blob]);
  const dimensions = { width, height };
  const baseCrop = resolveCrop(dimensions, crop);
  const printCrop = variant === 'print' ? resolvePrintPhotoCrop(baseCrop) : null;
  const resolved = printCrop ?? baseCrop;
  useEffect(() => {
    if (effect.id === 'original' || !imageReady || !sourceImage.current || !effectCanvas.current) return;
    const frame = requestAnimationFrame(() => {
      const canvas = effectCanvas.current, image = sourceImage.current;
      if (!canvas || !image || !image.complete || !image.naturalWidth) return;
      const previewWidth = effectPreviewWidth;
      const previewHeight = Math.round(previewWidth * OUTPUT_GEOMETRY.photo.height / OUTPUT_GEOMETRY.photo.width);
      canvas.width = previewWidth; canvas.height = previewHeight;
      const ctx = canvas.getContext('2d', { alpha: false, colorSpace: 'srgb' });
      if (!ctx) return;
      const scale = previewWidth / OUTPUT_GEOMETRY.photo.width;
      ctx.drawImage(image, resolved.x * scale, resolved.y * scale, resolved.width * scale, resolved.height * scale);
      applyPhotoEffect(ctx, 0, 0, previewWidth, previewHeight, effect, scale);
    });
    return () => cancelAnimationFrame(frame);
  }, [imageReady, resolved.x, resolved.y, resolved.width, resolved.height, effect.id, effect.duotone, effect.swapped, effectPreviewWidth, url]);
  function outputPoint(position: PointerPosition): Point {
    const rect = surface.current!.getBoundingClientRect();
    return { x: (position.x - rect.left) * OUTPUT_GEOMETRY.photo.width / rect.width,
      y: (position.y - rect.top) * OUTPUT_GEOMETRY.photo.height / rect.height };
  }
  function metrics(values: PointerPosition[]) {
    const center = { x: (values[0].x + values[1].x) / 2, y: (values[0].y + values[1].y) / 2 };
    return { center: outputPoint(center), distance: Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y) };
  }
  function change(next: CropState) { currentCrop.current = next; onChange?.(next); }
  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!onChange || pointers.current.size >= 2) return;
    event.preventDefault();
    surface.current?.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const m = metrics([...pointers.current.values()]);
      pinch.current = { crop: currentCrop.current, distance: m.distance, center: m.center };
    }
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!onChange || !previous) return;
    event.preventDefault();
    const current = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, current);
    if (pointers.current.size === 1) {
      const a = outputPoint(previous), b = outputPoint(current);
      change(dragCrop(currentCrop.current, dimensions, { x: b.x - a.x, y: b.y - a.y }));
    } else if (pinch.current) {
      const m = metrics([...pointers.current.values()]);
      const nextZoom = pinch.current.crop.zoom * (m.distance / Math.max(pinch.current.distance, 1));
      change(zoomCropAround(pinch.current.crop, dimensions, nextZoom, pinch.current.center, m.center));
    }
  }
  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    pinch.current = null;
    if (surface.current?.hasPointerCapture(event.pointerId)) surface.current.releasePointerCapture(event.pointerId);
  }
  return <div ref={surface} className={`crop-surface${onChange ? ' crop-surface--editable' : ''}`}
    data-crop-zoom={crop.zoom} data-print-bleed-scale={printCrop?.bleedScale ?? 1} data-crop-offset-x={crop.offsetX} data-crop-offset-y={crop.offsetY}
    data-crop-covered={resolved.x <= 0.00001 && resolved.y <= 0.00001 && resolved.x + resolved.width >= OUTPUT_GEOMETRY.photo.width - 0.00001 && resolved.y + resolved.height >= OUTPUT_GEOMETRY.photo.height - 0.00001}
    aria-label={onChange ? '照片裁切区域；拖动移动，双指缩放' : '月份照片'}
    onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}>
    {url && <img ref={sourceImage} src={url} alt="" draggable={false} onLoad={() => setImageReady(true)} onDragStart={event => event.preventDefault()} style={{
      left: `${resolved.x / OUTPUT_GEOMETRY.photo.width * 100}%`, top: `${resolved.y / OUTPUT_GEOMETRY.photo.height * 100}%`,
      width: `${resolved.width / OUTPUT_GEOMETRY.photo.width * 100}%`, height: `${resolved.height / OUTPUT_GEOMETRY.photo.height * 100}%`,
    }} />}
    {effect.id !== 'original' && <canvas ref={effectCanvas} className="crop-surface__effect" aria-hidden="true" />}
  </div>;
}
