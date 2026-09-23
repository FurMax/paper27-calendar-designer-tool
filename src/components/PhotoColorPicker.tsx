import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { rgbToHex } from '../domain/color.ts';
import { resolveCrop, type Point } from '../domain/crop.ts';
import { OUTPUT_GEOMETRY } from '../domain/geometry.ts';
import { sourcePixelAt } from '../domain/photoSampling.ts';
import type { CropState, HexColor } from '../domain/project.ts';

export function PhotoColorPicker({ blob, width, height, crop, onPick, onCancel }: {
  blob: Blob; width: number; height: number; crop: CropState;
  onPick: (color: HexColor) => void; onCancel: () => void;
}) {
  const [url, setUrl] = useState('');
  const [selected, setSelected] = useState<HexColor | null>(null);
  const [position, setPosition] = useState<Point>({ x: OUTPUT_GEOMETRY.photo.width / 2, y: OUTPUT_GEOMETRY.photo.height / 2 });
  const [error, setError] = useState('');
  const frame = useRef<HTMLDivElement>(null);
  const source = useRef<ImageBitmap | HTMLImageElement | null>(null);
  const dispose = useRef<(() => void) | null>(null);
  const tracking = useRef(false);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const resolved = resolveCrop({ width, height }, crop);

  useEffect(() => {
    let active = true;
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl); setSelected(null); setError('');
    async function load() {
      try {
        let decoded: ImageBitmap | HTMLImageElement;
        let release: () => void;
        if (typeof createImageBitmap === 'function') {
          try {
            decoded = await createImageBitmap(blob, { imageOrientation: 'from-image' });
            release = () => (decoded as ImageBitmap).close();
          } catch {
            const image = new Image(); image.src = objectUrl; await image.decode();
            decoded = image; release = () => {};
          }
        } else {
          const image = new Image(); image.src = objectUrl; await image.decode();
          decoded = image; release = () => {};
        }
        if (!active) { release(); return; }
        const decodedWidth = 'naturalWidth' in decoded ? decoded.naturalWidth : decoded.width;
        const decodedHeight = 'naturalHeight' in decoded ? decoded.naturalHeight : decoded.height;
        if (decodedWidth !== width || decodedHeight !== height) { release(); throw new Error('照片方向或尺寸已变化，请重新选择照片。'); }
        source.current = decoded;
        dispose.current = release;
        sample({ x: OUTPUT_GEOMETRY.photo.width / 2, y: OUTPUT_GEOMETRY.photo.height / 2 }, decoded);
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : '照片无法取色。'); }
    }
    void load();
    return () => { active = false; dispose.current?.(); dispose.current = null; source.current = null; URL.revokeObjectURL(objectUrl); };
  }, [blob, width, height, crop.zoom, crop.offsetX, crop.offsetY]);

  function sample(point: Point, decoded = source.current) {
    if (!decoded) return;
    const x = Math.max(0, Math.min(OUTPUT_GEOMETRY.photo.width - 1, point.x));
    const y = Math.max(0, Math.min(OUTPUT_GEOMETRY.photo.height - 1, point.y));
    const pixel = sourcePixelAt({ x, y }, resolved, width, height);
    const target = canvas.current ?? document.createElement('canvas');
    canvas.current = target; target.width = 1; target.height = 1;
    const ctx = target.getContext('2d', { willReadFrequently: true });
    if (!ctx) { setError('此浏览器无法读取照片颜色。'); return; }
    ctx.clearRect(0, 0, 1, 1);
    ctx.imageSmoothingEnabled = false;
    try {
      ctx.drawImage(decoded, pixel.x, pixel.y, 1, 1, 0, 0, 1, 1);
      const channels = ctx.getImageData(0, 0, 1, 1).data;
      const hex = rgbToHex(channels[0], channels[1], channels[2]);
      if (hex) { setPosition({ x, y }); setSelected(hex); setError(''); }
    } catch { setError('无法读取这个位置的颜色，请使用 HEX 或 RGB 输入。'); }
  }
  function fromPointer(event: PointerEvent<HTMLDivElement>) {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    sample({
      x: (event.clientX - rect.left) / rect.width * OUTPUT_GEOMETRY.photo.width,
      y: (event.clientY - rect.top) / rect.height * OUTPUT_GEOMETRY.photo.height,
    });
  }
  function onDown(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault(); tracking.current = true; frame.current?.setPointerCapture(event.pointerId); fromPointer(event);
  }
  function onMove(event: PointerEvent<HTMLDivElement>) { if (tracking.current) { event.preventDefault(); fromPointer(event); } }
  function onEnd(event: PointerEvent<HTMLDivElement>) {
    if (!tracking.current) return;
    fromPointer(event); tracking.current = false;
    if (frame.current?.hasPointerCapture(event.pointerId)) frame.current.releasePointerCapture(event.pointerId);
  }
  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 20 : 5;
    const delta = event.key === 'ArrowLeft' ? { x: -step, y: 0 } : event.key === 'ArrowRight' ? { x: step, y: 0 } :
      event.key === 'ArrowUp' ? { x: 0, y: -step } : event.key === 'ArrowDown' ? { x: 0, y: step } : null;
    if (delta) { event.preventDefault(); sample({ x: position.x + delta.x, y: position.y + delta.y }); }
    if (event.key === 'Enter' && selected) onPick(selected);
    if (event.key === 'Escape') onCancel();
  }
  return <div className="photo-sample">
    <p>在照片上轻触，或按住拖动到目标颜色；确认后只修改当前月份的背景色。</p>
    <div ref={frame} className="photo-sample__frame" role="button" tabIndex={0} aria-label="照片取色区域；拖动或用方向键调整位置，回车确认" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onEnd} onPointerCancel={onEnd} onKeyDown={onKey}>
      {url && <img src={url} alt="" draggable={false} style={{
        left: `${resolved.x / OUTPUT_GEOMETRY.photo.width * 100}%`, top: `${resolved.y / OUTPUT_GEOMETRY.photo.height * 100}%`,
        width: `${resolved.width / OUTPUT_GEOMETRY.photo.width * 100}%`, height: `${resolved.height / OUTPUT_GEOMETRY.photo.height * 100}%`,
      }} />}
      <span className="photo-sample__target" style={{ left: `${position.x / OUTPUT_GEOMETRY.photo.width * 100}%`, top: `${position.y / OUTPUT_GEOMETRY.photo.height * 100}%` }} />
    </div>
    <div className="photo-sample__result" aria-live="polite"><span className="photo-sample__swatch" style={{ background: selected ?? '#FFFFFF' }} /><div><strong>{selected ?? '正在读取照片…'}</strong><small>照片像素取色</small></div></div>
    {error && <p className="photo-sample__error" role="alert">{error}</p>}
    <div className="photo-sample__actions"><button type="button" className="button button--quiet" onClick={onCancel}>取消</button><button type="button" className="button button--primary" disabled={!selected} onClick={() => { if (selected) onPick(selected); }}>使用此颜色</button></div>
  </div>;
}
