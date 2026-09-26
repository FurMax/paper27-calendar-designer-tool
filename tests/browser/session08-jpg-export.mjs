import assert from 'node:assert/strict';
import { mkdir, readdir, readFile, unlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { unzipSync } from 'fflate';

function jpegDimensions(bytes) {
  let offset = 2;
  while (offset < bytes.length - 2) {
    if (bytes[offset] !== 255) throw Error('bad JPEG marker');
    while (bytes[offset] === 255) offset++;
    const marker = bytes[offset++];
    if (marker === 218) break;
    const length = (bytes[offset] << 8) | bytes[offset + 1];
    if ([192, 193, 194].includes(marker)) return [(bytes[offset + 5] << 8) | bytes[offset + 6], (bytes[offset + 3] << 8) | bytes[offset + 4]];
    offset += length;
  }
  throw Error('JPEG SOF missing');
}

const origin = 'http://127.0.0.1:5173';
const port = process.env.CDP_PORT ?? '9230';
const tabs = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
const tab = tabs.find(item => item.type === 'page' && item.url.startsWith(origin));
assert.ok(tab, 'isolated browser tab missing');
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
const downloads = path.join(os.tmpdir(), 'calendar-studio-jpg-downloads-' + port);
await mkdir(downloads, { recursive: true });
const zipName = 'Calendar-Design-Studio-2027-Print-106x156mm-JPG.zip';
const singleName = '01-January-2027.jpg';
for (const name of [zipName, singleName]) await unlink(path.join(downloads, name)).catch(error => { if (error.code !== 'ENOENT') throw error; });
await call('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
await call('Storage.clearDataForOrigin', { origin, storageTypes: 'indexeddb' });
await call('Page.navigate', { url: origin + '/' });
await pause(700);

const fixture = await evaluate('(' + (async function () {
  const { createEmptyProject } = await import('/src/domain/project.ts');
  const { commitProject } = await import('/src/persistence/indexedDb.ts');
  const canvas = document.createElement('canvas'); canvas.width = 600; canvas.height = 900;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#33AA77'; ctx.fillRect(0, 0, 600, 900);
  ctx.fillStyle = '#BBDD44'; ctx.fillRect(0, 0, 100, 900);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  canvas.width = 0; canvas.height = 0;
  const state = createEmptyProject('jpg-qa');
  state.assets.a = { id: 'a', blob, mime: 'image/png', fileName: 'jpg-source.png', byteSize: blob.size,
    decodedWidth: 600, decodedHeight: 900, importedAt: '' };
  for (let month = 1; month <= 12; month++) {
    const id = 'i' + month;
    state.project.photoItems[id] = { id, assetId: 'a', createdAt: '' };
    state.project.months[month].photoItemId = id;
    state.project.months[month].crop = { zoom: 1, offsetX: 0, offsetY: 0 };
  }
  await commitProject(state, null);
  return { ready: 12, sourceBytes: blob.size };
}).toString() + ')()');
assert.equal(fixture.ready, 12);
await call('Page.navigate', { url: origin + '/' });
await pause(800);
await evaluate("[...document.querySelectorAll('.entry-page button')].find(b => b.textContent.includes('继续编辑日历')).click()");
await pause(150);
await evaluate("[...document.querySelectorAll('.desktop-nav button')].find(b => b.textContent.includes('预览与导出')).click()");
await pause(150);
const selection = await evaluate('(' + (function () {
  const jpg = document.querySelector('input[name=review-export-format][value=jpg]');
  const png = document.querySelector('input[name=review-export-format][value=png]');
  const print = document.querySelector('input[name=review-export-variant][value=print]');
  if (!jpg || !png || !print) throw Error('format/variant selector missing: ' + JSON.stringify({ href: location.href, body: document.body.innerText.slice(0, 400), inputs: [...document.querySelectorAll('input')].map(input => input.name) }));
  if (!png.checked || !print.checked) throw Error('default selection changed');
  jpg.click();
  const button = [...document.querySelectorAll('.page-actions button')].find(item => item.textContent.includes('生成整套 12'));
  if (!jpg.checked || !button?.textContent.includes('JPG')) throw Error('JPG selection did not update full-set action');
  button.click();
  return { pngDefault: true, jpgSelected: jpg.checked, action: button.textContent };
}).toString() + ')()');
let warningObserved = false;
for (let i = 0; i < 80; i++) {
  await pause(400);
  if (await evaluate("!![...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('仍然生成'))")) { warningObserved = true; await evaluate("[...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('仍然生成')).click()"); }
  if (await evaluate("!![...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('下载 ZIP'))")) break;
}
assert.equal(await evaluate("!![...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('下载 ZIP'))"), true, 'JPG ZIP not ready');
assert.equal(await evaluate("document.querySelector('.export-sheet')?.textContent.includes('12 张印刷版 JPG')"), true);
await evaluate("[...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('下载 ZIP')).click()");
let archivePath;
for (let i = 0; i < 50; i++) {
  await pause(200);
  const names = await readdir(downloads);
  if (names.includes(zipName)) { archivePath = path.join(downloads, zipName); break; }
}
assert.ok(archivePath, 'JPG ZIP download missing');
const entries = Object.entries(unzipSync(new Uint8Array(await readFile(archivePath))));
assert.equal(entries.length, 12);
const hashes = new Set();
for (let index = 0; index < entries.length; index++) {
  const [name, bytes] = entries[index];
  assert.ok(name.startsWith(String(index + 1).padStart(2, '0') + '-'), name);
  assert.ok(name.endsWith('.jpg'), name);
  assert.deepEqual([...bytes.subarray(0, 4)], [255, 216, 255, 224]);
  assert.deepEqual([...bytes.subarray(6, 11)], [74, 70, 73, 70, 0]);
  assert.equal(bytes[13], 1);
  assert.equal((bytes[14] << 8) | bytes[15], 300);
  assert.equal((bytes[16] << 8) | bytes[17], 300);
  assert.deepEqual([...bytes.subarray(-2)], [255, 217]);
  assert.deepEqual(jpegDimensions(bytes), [1252, 1843]);
  hashes.add(createHash('sha256').update(bytes).digest('hex'));
}
assert.equal(hashes.size, 12);

await call('Page.navigate', { url: origin + '/' });
await pause(650);
await evaluate("[...document.querySelectorAll('.entry-page button')].find(b => b.textContent.includes('继续编辑日历')).click()");
await pause(150);
await evaluate("[...document.querySelectorAll('.desktop-nav button')].find(b => b.textContent.includes('编辑月份')).click()");
await pause(150);
const single = await evaluate('(' + (function () {
  const jpg = document.querySelector('input[name=editor-export-format][value=jpg]');
  const digital = document.querySelector('input[name=editor-export-variant][value=digital]');
  if (!jpg || !digital) throw Error('single export selectors missing');
  jpg.click(); digital.click();
  const generate = [...document.querySelectorAll('.properties-panel button')].find(button => button.textContent.includes('生成本月'));
  if (!generate?.textContent.includes('JPG')) throw Error('single JPG action missing');
  generate.click();
  return { jpg: jpg.checked, digital: digital.checked };
}).toString() + ')()');
for (let i = 0; i < 40; i++) {
  await pause(250);
  if (await evaluate("!![...document.querySelectorAll('.single-export-status button')].find(b => b.textContent.includes('下载 JPG'))")) break;
}
assert.equal(await evaluate("!![...document.querySelectorAll('.single-export-status button')].find(b => b.textContent.includes('下载 JPG'))"), true);
await evaluate("[...document.querySelectorAll('.single-export-status button')].find(b => b.textContent.includes('下载 JPG')).click()");
let singlePath;
for (let i = 0; i < 40; i++) {
  await pause(200);
  const names = await readdir(downloads);
  if (names.includes(singleName)) { singlePath = path.join(downloads, singleName); break; }
}
assert.ok(singlePath, 'single digital JPG download missing');
const singleBytes = new Uint8Array(await readFile(singlePath));
assert.deepEqual([...singleBytes.subarray(0, 2)], [255, 216]);
assert.deepEqual([...singleBytes.subarray(-2)], [255, 217]);
assert.deepEqual(jpegDimensions(singleBytes), [1200, 1800]);
const pixels = await evaluate('(' + (async function () {
  const { loadProject } = await import('/src/persistence/indexedDb.ts');
  const { renderMonthImage } = await import('/src/export/canvasRenderer.ts');
  const rendered = await renderMonthImage(await loadProject(), 1, 'print', 'jpg');
  const bitmap = await createImageBitmap(rendered.blob);
  const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(bitmap, 0, 0); bitmap.close();
  const sample = (x, y) => [...ctx.getImageData(x, y, 1, 1).data];
  const result = { leftPhoto: sample(0, 500), rightPhoto: sample(1251, 500), lowerBackground: sample(0, 1842) };
  canvas.width = 0; canvas.height = 0;
  return result;
}).toString() + ')()');
function near(actual, expected) { return actual.every((value, i) => Math.abs(value - expected[i]) <= (i === 3 ? 0 : 20)); }
assert.ok(near(pixels.leftPhoto, [187, 221, 68, 255]), JSON.stringify(pixels));
assert.ok(near(pixels.rightPhoto, [51, 170, 119, 255]), JSON.stringify(pixels));
assert.ok(near(pixels.lowerBackground, [255, 255, 255, 255]), JSON.stringify(pixels));

await call('Emulation.setDeviceMetricsOverride', { width: 320, height: 844, deviceScaleFactor: 3, mobile: true });
await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await pause(300);
const narrow = await evaluate("({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, formatWidth: document.querySelector('input[name=editor-export-format]')?.closest('fieldset')?.getBoundingClientRect().width, offenders: [...document.querySelectorAll('*')].map(el => ({ tag: el.tagName, cls: String(el.className).slice(0,50), right: Math.round(el.getBoundingClientRect().right), width: Math.round(el.getBoundingClientRect().width) })).filter(item => item.right > 321).slice(0,8) })");
assert.ok(narrow.width >= 320 && narrow.width <= 336);
assert.equal(narrow.scrollWidth, narrow.width);
assert.ok(narrow.formatWidth > 0 && narrow.formatWidth <= 320);
await call('Emulation.clearDeviceMetricsOverride');
await call('Emulation.setTouchEmulationEnabled', { enabled: false });

console.log(JSON.stringify({ browser: await evaluate('navigator.userAgent'), fixture, selection,
  pixels, narrow, fullSet: { entries: entries.length, uniqueHashes: hashes.size, dimensions: '1252x1843', jfifDpi: 300, zipBytes: (await readFile(archivePath)).length },
  single: { ...single, fileName: singleName, bytes: singleBytes.length } }, null, 2));
ws.close();
