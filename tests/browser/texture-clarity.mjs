import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const origin = 'http://127.0.0.1:4173';
const port = process.env.CDP_PORT ?? '9230';
const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(origin + '/')}`, { method: 'PUT' })).json();
assert.ok(tab.webSocketDebuggerUrl);
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
let sequence = 1;
const pending = new Map();
const errors = [];
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
  const job = pending.get(message.id);
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
async function run(fn, ...args) { return evaluate(`(${fn.toString()})(${args.map(JSON.stringify).join(',')})`); }
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, label) {
  for (let i = 0; i < 120; i++) {
    if (await run(fn)) return;
    await pause(100);
  }
  throw Error(`Timed out: ${label}`);
}
async function click(selector, label) {
  await run((selector, label) => {
    const target = [...document.querySelectorAll(selector)].find(item => item.textContent.includes(label));
    if (!target) throw Error(`Missing ${selector}: ${label}`);
    target.click();
  }, selector, label);
}
await call('Page.enable');
await call('Runtime.enable');
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 800, deviceScaleFactor: 1, mobile: false });
await call('Storage.clearDataForOrigin', { origin, storageTypes: 'indexeddb' });
await call('Page.navigate', { url: origin + '/' });
await until(() => !!document.querySelector('.entry-page input[type=file]'), 'Entry');
await run(async () => {
  const canvas = document.createElement('canvas');
  canvas.width = 720; canvas.height = 850;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#D2A7AB'; ctx.fillRect(0, 0, 720, 850);
  ctx.fillStyle = '#718B90'; ctx.fillRect(0, 0, 160, 850);
  ctx.fillStyle = '#E6BC7D'; ctx.fillRect(560, 0, 160, 850);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const transfer = new DataTransfer();
  for (let month = 1; month <= 12; month++) transfer.items.add(new File([blob], `photo-${month}.png`, { type: 'image/png' }));
  const input = document.querySelector('.entry-page input[type=file]');
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
await until(() => !!document.querySelector('.month-grid'), 'Assign');
await click('.desktop-nav button', '编辑月份');
await until(() => !!document.querySelector('.editor-page .texture-controls'), 'Editor textures');
await run(() => {
  const original = URL.createObjectURL.bind(URL);
  window.__textureExports = [];
  URL.createObjectURL = blob => {
    if (blob.type === 'image/png') window.__textureExports.push(blob);
    return original(blob);
  };
});

async function exportPrint(name) {
  await run(() => {
    document.querySelector('input[name=editor-export-variant][value=print]').click();
    document.querySelector('input[name=editor-export-format][value=png]').click();
  });
  await click('.editor-deep-section--export button', '生成本月 PNG');
  await until(() => document.querySelector('.single-export-status')?.textContent.includes('已准备好'), 'print PNG ready');
  const result = await run(async () => {
    const blob = window.__textureExports.at(-1);
    if (!blob) throw Error('Exported PNG missing');
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0); bitmap.close();
    const hash = (x, y, w, h) => {
      const data = ctx.getImageData(x, y, w, h).data;
      let value = 2166136261;
      for (let i = 0; i < data.length; i++) value = Math.imul(value ^ data[i], 16777619) >>> 0;
      return value;
    };
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    return { width: canvas.width, height: canvas.height, photoHash: hash(220, 200, 100, 100), calendarHash: hash(600, 1200, 200, 100), bleedHash: hash(500, 1810, 200, 20), dataUrl };
  });
  if (port === '9230') await writeFile(`qa/v1-1-texture-${name}-print.png`, Buffer.from(result.dataUrl.split(',')[1], 'base64'));
  await click('.single-export-status button', '关闭');
  delete result.dataUrl;
  return result;
}

const baseline = await exportPrint('none');
const results = {};
for (const [id, label] of [['waves', '波浪格'], ['dots', '细点阵'], ['paper', '纸张肌理']]) {
  await click('.texture-options button.texture-thumb', label);
  const proof = await run(id => {
    const dates = document.querySelector('.month-proof-layer--current .calendar-proof__dates');
    const photo = document.querySelector('.month-proof-layer--current .calendar-proof__photo');
    return {
      id: dates.dataset.texture,
      image: getComputedStyle(dates).backgroundImage,
      photoImage: getComputedStyle(photo).backgroundImage,
      selected: document.querySelectorAll('.texture-options button[aria-pressed=true]').length,
    };
  }, id);
  assert.equal(proof.id, id);
  assert.ok(proof.image.startsWith('url('));
  assert.ok(!proof.photoImage.includes('data:image'));
  assert.equal(proof.selected, 1);
  if (port === '9230') {
    await run(() => document.querySelector('.editor-deep-section--style').scrollIntoView({ block: 'center' }));
    await pause(120);
    const capture = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(`qa/v1-1-texture-${id}-editor.png`, Buffer.from(capture.data, 'base64'));
  }
  const output = await exportPrint(id);
  assert.deepEqual([output.width, output.height], [1252, 1843]);
  assert.equal(output.photoHash, baseline.photoHash);
  assert.notEqual(output.calendarHash, baseline.calendarHash);
  assert.notEqual(output.bleedHash, baseline.bleedHash);
  results[id] = { calendarHash: output.calendarHash, bleedHash: output.bleedHash };
}
assert.equal(new Set(Object.values(results).map(item => item.calendarHash)).size, 3);
assert.deepEqual(errors, []);
console.log('TEXTURE_CLARITY_PASS', JSON.stringify({ port, results, errors }));
ws.close();
