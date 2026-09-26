import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { unzipSync } from 'fflate';
import { setJpegDpi, validateJpeg } from '../../src/export/jpegMetadata.ts';
import { packageImageZip } from '../../src/export/zip.ts';

test('JPG print density inserts one JFIF header and preserves SOF dimensions', async () => {
  const fixture = await readFile(new URL('../../spikes/browser-lab/results/orientation6.jpg', import.meta.url));
  const original = new Blob([fixture], { type: 'image/jpeg' });
  await validateJpeg(original, 1920, 1200);
  const at300 = await setJpegDpi(original, 300);
  const bytes = new Uint8Array(await at300.arrayBuffer());
  assert.deepEqual([...bytes.subarray(0, 6)], [255, 216, 255, 224, 0, 16]);
  assert.equal(Buffer.from(bytes).toString('latin1').match(/JFIF/g)?.length, 1);
  assert.deepEqual([...bytes.subarray(11, 18)], [1, 1, 1, 1, 44, 1, 44]);
  await validateJpeg(at300, 1920, 1200);
  const at240 = new Uint8Array(await (await setJpegDpi(at300, 240)).arrayBuffer());
  assert.equal(Buffer.from(at240).toString('latin1').match(/JFIF/g)?.length, 1);
  assert.deepEqual([...at240.subarray(11, 18)], [1, 1, 1, 0, 240, 0, 240]);
  await assert.rejects(validateJpeg(at300, 1200, 1920), /尺寸/);
  await assert.rejects(validateJpeg(new Blob([fixture], { type: 'image/png' }), 1920, 1200), /格式/);
});

test('JPG full-set ZIP contains only twelve ordered JPG entries', async () => {
  const files = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    fileName: String(i + 1).padStart(2, '0') + '-Month-2027.jpg',
    blob: new Blob([new Uint8Array([255, 216, i, 255, 217])], { type: 'image/jpeg' }),
  }));
  const zip = unzipSync(new Uint8Array(await (await packageImageZip(files, 'jpg')).arrayBuffer()));
  assert.deepEqual(Object.keys(zip), files.map(file => file.fileName));
  assert.equal(zip['12-Month-2027.jpg'][2], 11);
  await assert.rejects(packageImageZip([{ ...files[0], fileName: '01-Month-2027.png' }, ...files.slice(1)], 'jpg'), /JPG/);
});
