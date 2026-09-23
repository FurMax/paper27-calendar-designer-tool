import assert from 'node:assert/strict';
import test from 'node:test';
import { decodePhotoSelection } from '../../src/features/photos/import.ts';

const original = globalThis.createImageBitmap;

test('cancel is a no-op and over-limit rejects the whole picker result', async () => {
  assert.deepEqual(await decodePhotoSelection([]), { assets: [], unreadable: [] });
  const many = Array.from({ length: 13 }, (_, i) => new File(['x'], `photo-${i}.jpg`, { type: 'image/jpeg' }));
  await assert.rejects(decodePhotoSelection(many), /12/);
});

test('decode before commit preserves returned order and reports unreadable files', async () => {
  globalThis.createImageBitmap = (async (file: Blob) => {
    if ((file as File).name === 'bad.jpg') throw new Error('invalid');
    return { width: 600, height: 400, close() {} } as ImageBitmap;
  }) as typeof createImageBitmap;
  try {
    const input = [new File(['a'], 'first.jpg', { type: 'image/jpeg' }), new File(['b'], 'bad.jpg', { type: 'image/jpeg' }), new File(['c'], 'last.png', { type: 'image/png' })];
    const result = await decodePhotoSelection(input);
    assert.deepEqual(result.assets.map(asset => asset.fileName), ['first.jpg', 'last.png']);
    assert.deepEqual(result.unreadable, ['bad.jpg']);
    assert.equal(result.diagnostics?.[0].mime, 'image/jpeg');
    assert.match(result.diagnostics?.[0].reason || '', /位图解码/);
    assert.ok(result.assets.every(asset => asset.decodedWidth === 600 && asset.decodedHeight === 400));
  } finally { globalThis.createImageBitmap = original; }
});
