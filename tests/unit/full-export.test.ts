import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createEmptyProject } from '../../src/domain/project.ts';
import { ALL_MONTHS, type MonthNumber } from '../../src/domain/calendar.ts';
import { ExportCancelledError, missingExportMonths, renderFullSet } from '../../src/export/exportController.ts';
import { packagePngZip } from '../../src/export/zip.ts';

function readyState() {
  const state = createEmptyProject('batch'); const blob = new Blob(['photo'], { type: 'image/png' });
  state.assets.a = { id: 'a', blob, mime: 'image/png', fileName: 'photo.png', byteSize: blob.size, decodedWidth: 100, decodedHeight: 100, importedAt: '' };
  for (const month of ALL_MONTHS) { const id = `i${month}`; state.project.photoItems[id] = { id, assetId: 'a', createdAt: '' }; state.project.months[month].photoItemId = id; state.project.months[month].crop = { zoom: 1, offsetX: 0, offsetY: 0 }; }
  return state;
}
test('full-set preflight, order, immutable snapshot and progress', async () => {
  const state = readyState(); const visited: number[] = [], progress: number[] = [];
  assert.deepEqual(missingExportMonths(state), []);
  const files = await renderFullSet(state, value => progress.push(value.completed), undefined, async (snapshot, month) => {
    visited.push(month); if (month === 1) state.project.months[12].style.background = '#123456';
    if (month === 12) assert.equal(snapshot.project.months[12].style.background, '#FFFFFF');
    return { month, fileName: `${String(month).padStart(2,'0')}-Month-2027.png`, blob: new Blob([String(month)], { type: 'image/png' }) };
  });
  assert.deepEqual(visited, ALL_MONTHS); assert.equal(files.length, 12); assert.equal(progress.at(-1), 12);
  const zip = new Uint8Array(await (await packagePngZip(files)).arrayBuffer());
  assert.equal(new DataView(zip.buffer).getUint32(0, true), 0x04034b50);
  assert.equal(new DataView(zip.buffer).getUint32(zip.length - 22, true), 0x06054b50);
  assert.equal(new DataView(zip.buffer).getUint16(zip.length - 12, true), 12);
});
test('missing month blocks start, cancellation stops between months, error identifies month', async () => {
  const state = readyState(); state.project.months[8].photoItemId = null; state.project.months[8].crop = null;
  await assert.rejects(renderFullSet(state, () => {}, undefined, async () => { throw Error('should not render'); }), /8 月/);
  const complete = readyState(), abort = new AbortController(); let calls = 0;
  await assert.rejects(renderFullSet(complete, progress => { if (progress.completed === 1) abort.abort(); }, abort.signal, async (_, month: MonthNumber) => { calls++; return { month, fileName: 'x.png', blob: new Blob([]) }; }), ExportCancelledError);
  assert.equal(calls, 1);
  await assert.rejects(renderFullSet(complete, () => {}, undefined, async (_, month) => { if (month === 3) throw Error('decode'); return { month, fileName: 'x.png', blob: new Blob([]) }; }), /3 月 PNG 生成失败：decode/);
});
