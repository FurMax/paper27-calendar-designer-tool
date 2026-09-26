import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PRINT_DPI, PRINT_GEOMETRY } from '../../src/domain/exportVariant.ts';
import { resolveCrop } from '../../src/domain/crop.ts';
import { resolvePrintPhotoCrop } from '../../src/domain/printPhotoCrop.ts';
import { sourcePixelAt } from '../../src/domain/photoSampling.ts';
import { SCALE_MULTIPLIERS } from '../../src/domain/typography.ts';
import { setPngDpi, tagCanvasPngSrgb } from '../../src/export/pngMetadata.ts';

test('print canvas rounds a 100 × 150 mm trim and 3 mm bleed at 300 PPI', () => {
  const { width, height, trim, bleed } = PRINT_GEOMETRY;
  assert.equal(width, trim.width + bleed.left + bleed.right);
  assert.equal(height, trim.height + bleed.top + bleed.bottom);
  const mm = (pixels: number) => pixels * 25.4 / PRINT_DPI;
  assert.ok(Math.abs(mm(width) - 106) < 0.05);
  assert.ok(Math.abs(mm(height) - 156) < 0.05);
  assert.ok(Math.abs(mm(trim.width) - 100) < 0.05);
  assert.ok(Math.abs(mm(trim.height) - 150) < 0.05);
  for (const edge of Object.values(bleed)) assert.ok(Math.abs(mm(edge) - 3) < 0.05);
});

test('PNG print metadata is 300 PPI and repeated insertion replaces the old pHYs chunk', async () => {
  const tiny = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9O8XcAAAAASUVORK5CYII=', 'base64');
  const output = new Uint8Array(await (await setPngDpi(new Blob([tiny], { type: 'image/png' }), 300)).arrayBuffer());
  const twice = new Uint8Array(await (await setPngDpi(new Blob([output], { type: 'image/png' }), 300)).arrayBuffer());
  assert.deepEqual([...output.subarray(37, 41)], [112, 72, 89, 115]);
  const view = new DataView(output.buffer);
  assert.equal(view.getUint32(41), 11811);
  assert.equal(view.getUint32(45), 11811);
  assert.equal(output[49], 1);
  assert.equal(Buffer.from(twice).toString('latin1').match(/pHYs/g)?.length, 1);
});

test('canvas PNG gets explicit sRGB and gamma tags without changing image data or print DPI', async () => {
  const tiny = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9O8XcAAAAASUVORK5CYII=', 'base64');
  const print = await setPngDpi(new Blob([tiny], { type: 'image/png' }), 300);
  const tagged = new Uint8Array(await (await tagCanvasPngSrgb(print)).arrayBuffer());
  const repeat = new Uint8Array(await (await tagCanvasPngSrgb(new Blob([tagged], { type: 'image/png' }))).arrayBuffer());
  const chunks = (bytes: Uint8Array) => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const result: { type: string; data: Uint8Array }[] = [];
    for (let offset = 8; offset < bytes.length;) {
      const length = view.getUint32(offset);
      const type = Buffer.from(bytes.subarray(offset + 4, offset + 8)).toString('ascii');
      result.push({ type, data: bytes.subarray(offset + 8, offset + 8 + length) });
      offset += length + 12;
    }
    return result;
  };
  const original = chunks(new Uint8Array(await print.arrayBuffer()));
  const result = chunks(tagged);
  assert.deepEqual(result.map(item => item.type), ['IHDR', 'sRGB', 'gAMA', 'pHYs', 'IDAT', 'IEND']);
  assert.equal(result.find(item => item.type === 'sRGB')!.data[0], 0);
  assert.equal(new DataView(result.find(item => item.type === 'gAMA')!.data.buffer, result.find(item => item.type === 'gAMA')!.data.byteOffset).getUint32(0), 45455);
  assert.deepEqual(result.find(item => item.type === 'pHYs')!.data, original.find(item => item.type === 'pHYs')!.data);
  assert.deepEqual(result.find(item => item.type === 'IDAT')!.data, original.find(item => item.type === 'IDAT')!.data);
  assert.deepEqual(repeat, tagged);
});

test('photo sampling maps the visible crop center to the source pixel', () => {
  const resolved = resolveCrop({ width: 400, height: 400 }, { zoom: 1, offsetX: 0, offsetY: 0 });
  assert.deepEqual(sourcePixelAt({ x: 600, y: 522 }, resolved, 400, 400), { x: 200, y: 200 });
  const edge = sourcePixelAt({ x: 0, y: 0 }, resolved, 400, 400);
  assert.ok(edge.x >= 0 && edge.x < 400 && edge.y >= 0 && edge.y < 400);
});

test('three text-size presets are visibly spaced around Standard', () => {
  assert.deepEqual(SCALE_MULTIPLIERS, { small: 0.8, standard: 1, large: 1.2 });
});

test('print photo crop covers top and side bleed with genuine source pixels', () => {
  const scaleX = PRINT_GEOMETRY.trim.width / 1200;
  const scaleY = PRINT_GEOMETRY.trim.height / 1800;
  for (const [width, height] of [[1200, 1044], [800, 1200], [1920, 1200], [300, 4000], [4000, 300]]) {
    for (const offsetX of [-1, 0, 1]) for (const offsetY of [-1, 0, 1]) {
      const saved = resolveCrop({ width, height }, { zoom: 1, offsetX, offsetY });
      const print = resolvePrintPhotoCrop(saved);
      assert.ok(print.bleedScale >= 1 && print.bleedScale < 1.09);
      assert.ok(PRINT_GEOMETRY.trim.x + print.x * scaleX <= -0.5);
      assert.ok(PRINT_GEOMETRY.trim.x + (print.x + print.width) * scaleX >= PRINT_GEOMETRY.width + 0.5);
      assert.ok(PRINT_GEOMETRY.trim.y + print.y * scaleY <= -0.5);
      assert.ok(print.y + print.height >= 1044 - 0.00001);
    }
  }
});
