import assert from 'node:assert/strict';
import { mkdir, readdir, readFile, unlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { unzipSync } from 'fflate';

const origin = 'http://127.0.0.1:5173';
const cdpPort = process.env.CDP_PORT ?? '9230';
const tabs = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json();
const tab = tabs.find(item => item.type === 'page' && item.url.startsWith(origin));
assert.ok(tab, 'isolated Chrome tab missing');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
let sequence = 1;
const pending = new Map();
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data), job = pending.get(message.id);
  if (!job) return;
  pending.delete(message.id);
  message.error ? job.reject(Error(message.error.message)) : job.resolve(message.result);
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = sequence++;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
async function evaluate(expression) {
  const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const downloads = path.join(os.tmpdir(), `calendar-studio-session08-downloads-${cdpPort}`);
await mkdir(downloads, { recursive: true });
await unlink(path.join(downloads, 'Calendar-Design-Studio-2027-Print-106x156mm.zip')).catch(error => { if (error.code !== 'ENOENT') throw error; });
await call('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
await call('Storage.clearDataForOrigin', { origin, storageTypes: 'indexeddb' });
await call('Page.navigate', { url: origin + '/' });
await pause(700);

const partial = await evaluate(`(async () => {
  const pause = ms => new Promise(r => setTimeout(r, ms));
  const makeFiles = async count => {
    const transfer = new DataTransfer();
    for (let i = 0; i < count; i++) {
      const canvas = document.createElement('canvas'); canvas.width = 360; canvas.height = 240;
      const ctx = canvas.getContext('2d'); ctx.fillStyle = i % 2 ? '#1C76A6' : '#B85B37'; ctx.fillRect(0, 0, 360, 240);
      ctx.fillStyle = '#E4DCB6'; ctx.fillRect(0, 0, 28 + i * 8, 240);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      transfer.items.add(new File([blob], 'photo-' + (i + 1) + '.png', { type: 'image/png' }));
    }
    return transfer.files;
  };
  const picker = document.querySelector('.entry-page input[type=file]');
  picker.files = await makeFiles(2); picker.dispatchEvent(new Event('change', { bubbles: true }));
  await pause(900);
  const { loadProject } = await import('/src/persistence/indexedDb.ts');
  const saved = await loadProject();
  const result = { screen: location.pathname, ready: Object.values(saved.project.months).filter(m => m.photoItemId).length,
    january: saved.project.months[1].photoItemId, february: saved.project.months[2].photoItemId,
    missing: document.querySelector('.month-grid')?.querySelectorAll('.month-card').length,
    revision: saved.project.revision };
  document.querySelector('.month-card').click(); await pause(50);
  [...document.querySelectorAll('.action-sheet button')].find(b => b.textContent.includes('编辑这个月')).click();
  await pause(80);
  const bad = new DataTransfer(); bad.items.add(new File(['not an image'], 'unreadable.heic', { type: 'image/heic' }));
  const replace = document.querySelector('.editor-page input[type=file]'); replace.files = bad.files;
  replace.dispatchEvent(new Event('change', { bubbles: true })); await pause(400);
  const afterBad = await loadProject();
  result.unreadablePreserved = afterBad.project.months[1].photoItemId === saved.project.months[1].photoItemId;
  result.unreadableMessage = document.querySelector('.feedback')?.textContent ?? '';
  return result;
})()`);
assert.equal(partial.screen, '/assign');
assert.equal(partial.ready, 2);
assert.equal(partial.missing, 12);
assert.ok(partial.revision >= 1);
assert.equal(partial.unreadablePreserved, true);
assert.ok(partial.unreadableMessage.includes('无法读取'));

await call('Page.navigate', { url: origin + '/' }); await pause(650);
const restored = await evaluate(`(async () => {
  const { loadProject } = await import('/src/persistence/indexedDb.ts');
  const project = await loadProject();
  const resume = [...document.querySelectorAll('.entry-page button')].find(b => b.textContent.includes('继续编辑'));
  resume.click(); await new Promise(r => setTimeout(r, 100));
  return { route: location.pathname, ready: Object.values(project.project.months).filter(m => m.photoItemId).length,
    assets: Object.keys(project.assets).length, revision: project.project.revision };
})()`);
assert.equal(restored.ready, 2);
assert.equal(restored.assets, 2);
assert.ok(restored.route.startsWith('/editor/'));

await call('Storage.clearDataForOrigin', { origin, storageTypes: 'indexeddb' });
await call('Page.navigate', { url: origin + '/' }); await pause(700);
const complete = await evaluate(`(async () => {
  const pause = ms => new Promise(r => setTimeout(r, ms));
  const transfer = new DataTransfer();
  for (let i = 0; i < 12; i++) {
    const canvas = document.createElement('canvas'); canvas.width = 400 + i * 10; canvas.height = 280 + i * 5;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = 'hsl(' + (i * 30) + ' 65% 50%)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#F8EBD0'; ctx.fillRect(i * 5, 0, 18, canvas.height);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    transfer.items.add(new File([blob], String(i + 1).padStart(2, '0') + '.png', { type: 'image/png' }));
  }
  const picker = document.querySelector('.entry-page input[type=file]'); picker.files = transfer.files;
  picker.dispatchEvent(new Event('change', { bubbles: true })); await pause(1000);
  const { loadProject } = await import('/src/persistence/indexedDb.ts');
  const state = await loadProject();
  const order = Array.from({ length: 12 }, (_, index) => {
    const item = state.project.photoItems[state.project.months[index + 1].photoItemId];
    return state.assets[item.assetId].fileName;
  });
  [...document.querySelectorAll('.page-actions button')].find(b => b.textContent.includes('继续编辑')).click();
  await pause(100);
  [...document.querySelectorAll('.desktop-nav button')].find(b => b.textContent.includes('预览与导出')).click();
  await pause(100);
  const previews = [...document.querySelectorAll('.review-card')].map(card => ({
    name: card.querySelector('.calendar-proof__title strong')?.textContent,
    cells: [...card.querySelectorAll('.calendar-proof__grid span')].map(span => span.textContent.trim()),
  }));
  return { order, ready: Object.values(state.project.months).filter(m => m.photoItemId).length,
    previews, defaultPrint: document.querySelector('input[name=review-export-variant][value=print]')?.checked,
    fullEnabled: ![...document.querySelectorAll('.page-actions button')].find(b => b.textContent.includes('生成整套 12')).disabled };
})()`);
assert.equal(complete.ready, 12);
assert.equal(complete.fullEnabled, true);
assert.equal(complete.defaultPrint, true);
assert.deepEqual(complete.order, Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0') + '.png'));
assert.equal(complete.previews.length, 12);
for (let month = 1; month <= 12; month++) {
  const first = new Date(Date.UTC(2027, month - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(2027, month, 0)).getUTCDate();
  const expected = Array.from({ length: 42 }, (_, index) => {
    const day = index - first + 1;
    return day >= 1 && day <= days ? String(day) : '';
  });
  assert.deepEqual(complete.previews[month - 1].cells, expected, `preview month ${month}`);
}

const digital = await evaluate(`(async () => {
  const { loadProject } = await import('/src/persistence/indexedDb.ts');
  const { renderMonthPng } = await import('/src/export/canvasRenderer.ts');
  const { OUTPUT_GEOMETRY } = await import('/src/domain/geometry.ts');
  const state = await loadProject(); const results = [];
  for (let month = 1; month <= 12; month++) {
    const rendered = await renderMonthPng(state, month, 'digital');
    const bitmap = await createImageBitmap(rendered.blob);
    const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(bitmap, 0, 0); bitmap.close();
    const first = new Date(Date.UTC(2027, month - 1, 1)).getUTCDay();
    const days = new Date(Date.UTC(2027, month, 0)).getUTCDate();
    const textCells = [];
    for (let index = 0; index < 42; index++) {
      const col = index % 7, row = Math.floor(index / 7);
      const x = Math.floor(OUTPUT_GEOMETRY.dates.left + (col + .5) * OUTPUT_GEOMETRY.dates.width / 7);
      const y = Math.floor(OUTPUT_GEOMETRY.dates.top + (row + .5) * OUTPUT_GEOMETRY.dates.height / 6);
      const pixels = ctx.getImageData(x - 25, y - 25, 50, 50).data;
      let dark = 0; for (let i = 0; i < pixels.length; i += 4) if (pixels[i] < 100 && pixels[i + 1] < 100 && pixels[i + 2] < 100) dark++;
      textCells.push(dark > 4);
    }
    const expected = Array.from({ length: 42 }, (_, index) => index >= first && index < first + days);
    results.push({ month, width: canvas.width, height: canvas.height, fileName: rendered.fileName,
      datesMatch: textCells.every((value, index) => value === expected[index]),
      photoEdges: [0, 1199].map(x => [...ctx.getImageData(x, 500, 1, 1).data]),
      bytes: rendered.blob.size });
    canvas.width = 0; canvas.height = 0;
  }
  return results;
})()`);
assert.equal(digital.length, 12);
for (const result of digital) {
  assert.equal(result.width, 1200);
  assert.equal(result.height, 1800);
  assert.equal(result.datesMatch, true, `PNG date occupancy month ${result.month}`);
  assert.ok(result.photoEdges.every(pixel => pixel[3] === 255));
}

await evaluate("[...document.querySelectorAll('.page-actions button')].find(b => b.textContent.includes('生成整套 12')).click()");
for (let i = 0; i < 30; i++) {
  await pause(400);
  if (await evaluate("!![...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('仍然生成'))")) await evaluate("[...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('仍然生成')).click()");
  if (await evaluate("!![...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('下载 ZIP'))")) break;
}
assert.equal(await evaluate("!![...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('下载 ZIP'))"), true);
await evaluate("[...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('下载 ZIP')).click()");
let archivePath;
for (let i = 0; i < 30; i++) {
  await pause(200);
  const names = await readdir(downloads);
  const found = names.find(name => name === 'Calendar-Design-Studio-2027-Print-106x156mm.zip');
  if (found) { archivePath = path.join(downloads, found); break; }
}
assert.ok(archivePath, 'print ZIP download missing');
const archive = unzipSync(new Uint8Array(await readFile(archivePath)));
const entries = Object.entries(archive);
assert.equal(entries.length, 12);
const print = entries.map(([name, bytes], index) => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  assert.ok(name.startsWith(String(index + 1).padStart(2, '0') + '-'));
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(view.getUint32(16), 1252); assert.equal(view.getUint32(20), 1843);
  assert.equal(String.fromCharCode(...bytes.subarray(37, 41)), 'pHYs');
  assert.equal(view.getUint32(41), 11811); assert.equal(view.getUint32(45), 11811);
  return { name, bytes: bytes.length, width: 1252, height: 1843, sha256: createHash('sha256').update(bytes).digest('hex') };
});
assert.equal(new Set(print.map(file => file.sha256)).size, 12);
console.log(JSON.stringify({ browser: await evaluate('navigator.userAgent'), partial, restored, previewMonths: complete.previews.length,
  digital, print, archivePath }, null, 2));
ws.close();
