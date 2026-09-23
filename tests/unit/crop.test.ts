import assert from 'node:assert/strict';
import test from 'node:test';
import { coversPhotoRegion, dragCrop, resetCrop, resolveCrop, setCropZoom, zoomCropAround } from '../../src/domain/crop.ts';
import { OUTPUT_GEOMETRY } from '../../src/domain/geometry.ts';

const shapes = [
  { width: 800, height: 1200 },
  { width: 1920, height: 1200 },
  { width: 1000, height: 1000 },
  { width: 4000, height: 300 },
  { width: 300, height: 4000 },
];

for (const image of shapes) test(`cover never exposes blank space for ${image.width}×${image.height}`, () => {
  for (const zoom of [1, 1.5, 3]) for (const offsetX of [-1, 0, 1]) for (const offsetY of [-1, 0, 1]) {
    const crop = resolveCrop(image, { zoom, offsetX, offsetY });
    assert.ok(coversPhotoRegion(crop));
    assert.ok(crop.width >= OUTPUT_GEOMETRY.photo.width);
    assert.ok(crop.height >= OUTPUT_GEOMETRY.photo.height);
  }
});

test('drag changes offset on an overflowing axis and clamps at edges', () => {
  const image = { width: 1920, height: 1200 };
  const start = { zoom: 1.5, offsetX: 0, offsetY: 0 };
  const moved = dragCrop(start, image, { x: 120, y: -80 });
  assert.ok(moved.offsetX > 0 && moved.offsetY < 0);
  const edge = dragCrop(start, image, { x: 99999, y: -99999 });
  assert.equal(edge.offsetX, 1);
  assert.equal(edge.offsetY, -1);
  assert.ok(coversPhotoRegion(resolveCrop(image, edge)));
});

test('zero-travel axis stays centered until zoom creates overflow', () => {
  const image = { width: 1920, height: 1200 };
  const atFill = resolveCrop(image, resetCrop());
  assert.equal(atFill.travelY, 0);
  assert.equal(dragCrop(resetCrop(), image, { x: 0, y: 100 }).offsetY, 0);
  assert.ok(dragCrop({ zoom: 1.5, offsetX: 0, offsetY: 0 }, image, { x: 0, y: 100 }).offsetY > 0);
});

test('pinch keeps the image point under a moving centroid until clamped', () => {
  const image = { width: 1920, height: 1200 };
  const before = { zoom: 1.2, offsetX: 0, offsetY: 0 };
  const from = { x: 600, y: 522 };
  const to = { x: 640, y: 490 };
  const after = zoomCropAround(before, image, 2, from, to);
  const a = resolveCrop(image, before);
  const b = resolveCrop(image, after);
  const imageX = (from.x - a.x) / a.width;
  const imageY = (from.y - a.y) / a.height;
  assert.ok(Math.abs((b.x + imageX * b.width) - to.x) < .0001);
  assert.ok(Math.abs((b.y + imageY * b.height) - to.y) < .0001);
  assert.ok(coversPhotoRegion(b));
});

test('explicit zoom and Reset share the same bounds', () => {
  const image = { width: 800, height: 1200 };
  const enlarged = setCropZoom(resetCrop(), image, 99);
  assert.equal(enlarged.zoom, 3);
  assert.deepEqual(resetCrop(), { zoom: 1, offsetX: 0, offsetY: 0 });
  assert.ok(coversPhotoRegion(resolveCrop(image, resetCrop())));
});
