import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const origin = 'http://127.0.0.1:4173';
const port = process.env.CDP_PORT ?? '9230';
const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(origin + '/')}`, { method: 'PUT' })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let sequence = 1;
const pending = new Map();
const exceptions = [];
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
  const job = pending.get(message.id);
  if (!job) return;
  pending.delete(message.id);
  message.error ? job.reject(Error(message.error.message)) : job.resolve(message.result);
});
const call = (method, params = {}) => new Promise((resolve, reject) => { const id = sequence++; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
async function evaluate(expression) {
  const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
const run = (fn, ...args) => evaluate(`(${fn.toString()})(${args.map(JSON.stringify).join(',')})`);
async function until(fn, label) {
  for (let i = 0; i < 150; i++) { if (await run(fn)) return; await new Promise(resolve => setTimeout(resolve, 100)); }
  throw Error(`Timed out: ${label}`);
}
async function click(selector, label) {
  await run((selector, label) => { const element = [...document.querySelectorAll(selector)].find(item => item.textContent.includes(label)); if (!element) throw Error(`Missing ${selector}: ${label}`); element.click(); }, selector, label);
}
try {
  await call('Page.enable'); await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await call('Storage.clearDataForOrigin', { origin, storageTypes: 'indexeddb' });
  await call('Page.navigate', { url: origin + '/' });
  await until(() => !!document.querySelector('.entry-page input[type=file]'), 'entry');
  await run(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 720; canvas.height = 850;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#8BAEC4'; ctx.fillRect(0, 0, 720, 850);
    ctx.fillStyle = '#C05568'; ctx.fillRect(80, 140, 560, 550);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const transfer = new DataTransfer();
    for (let month = 1; month <= 12; month++) transfer.items.add(new File([blob], `photo-${month}.png`, { type: 'image/png' }));
    const input = document.querySelector('.entry-page input[type=file]'); input.files = transfer.files; input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await until(() => !!document.querySelector('.month-grid'), 'assignment');
  await click('.desktop-nav button', '编辑月份');
  await until(() => !!document.querySelector('.editor-page .month-export__trigger'), 'editor');
  await run(() => { const nav = [...document.querySelectorAll('.month-nav button')].find(item => item.textContent.includes('4 月')); nav.click(); });
  await until(() => document.querySelector('.month-nav [aria-current="page"]')?.textContent.includes('4 月'), 'April');
  await until(() => document.querySelectorAll('.month-proof-layer').length === 1, 'April reveal complete');
  assert.equal(await run(() => document.querySelectorAll('.editor-deep-section--export').length), 0);
  assert.equal(await run(() => document.body.textContent.includes('04 · FINISH')), false);
  assert.equal(await run(() => document.querySelectorAll('.editor-set-palette-link').length), 0);
  const positions = await run(() => {
    const title = document.querySelector('.editor-head h1').getBoundingClientRect();
    const exportButton = document.querySelector('.month-export__trigger').getBoundingClientRect();
    const reviewButton = document.querySelector('.editor-review-action').getBoundingClientRect();
    return { titleRight: title.right, exportLeft: exportButton.left, exportRight: exportButton.right, reviewLeft: reviewButton.left, buttonWidth: exportButton.width };
  });
  assert.ok(positions.titleRight < positions.exportLeft && positions.exportRight < positions.reviewLeft && positions.buttonWidth < 150, JSON.stringify(positions));
  const before = await run(() => ({ height: document.documentElement.scrollHeight, navTop: document.querySelector('.month-nav').getBoundingClientRect().top, proofTop: document.querySelector('.proof-workspace').getBoundingClientRect().top }));
  await click('.month-export__trigger', '导出本月');
  assert.equal(await run(() => document.querySelectorAll('[role="menuitem"]').length), 4);
  const keyboard = await run(() => {
    const items = [...document.querySelectorAll('[role="menuitem"]')];
    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    return { nextFocused: document.activeElement === items[1], outline: getComputedStyle(items[1]).outlineStyle };
  });
  assert.equal(keyboard.nextFocused, true); assert.notEqual(keyboard.outline, 'none');
  const during = await run(() => ({ height: document.documentElement.scrollHeight, navTop: document.querySelector('.month-nav').getBoundingClientRect().top, proofTop: document.querySelector('.proof-workspace').getBoundingClientRect().top }));
  assert.deepEqual(during, before);
  const screenshot = await call('Page.captureScreenshot', { format: 'png' });
  if (port === '9230') await writeFile('qa/v1-1-month-export-menu-desktop.png', Buffer.from(screenshot.data, 'base64'));
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
  assert.equal(await run(() => !!document.querySelector('[role="menu"]')), false);
  await click('.month-export__trigger', '导出本月');
  await click('.month-export__trigger', '导出本月');
  assert.equal(await run(() => !!document.querySelector('[role="menu"]')), false);
  await click('.month-export__trigger', '导出本月');
  await run(() => document.querySelector('.month-nav').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
  await until(() => !document.querySelector('[role="menu"]'), 'outside pointer closes menu');
  await run(() => {
    window.__monthExportBlobs = new Map(); window.__monthExportClicks = [];
    const create = URL.createObjectURL.bind(URL); URL.createObjectURL = blob => { const url = create(blob); window.__monthExportBlobs.set(url, blob); return url; };
    HTMLAnchorElement.prototype.click = function () { window.__monthExportClicks.push({ name: this.download, url: this.href }); };
  });
  const combinations = [
    ['印刷版 · PNG', 'png', 1252, 1843, true],
    ['印刷版 · JPG', 'jpeg', 1252, 1843, false],
    ['屏幕版 · PNG', 'png', 1200, 1800, false],
    ['屏幕版 · JPG', 'jpeg', 1200, 1800, false],
  ];
  const results = [];
  for (const [label, mime, width, height, printPng] of combinations) {
    await click('.month-export__trigger', '导出本月');
    await click('[role="menuitem"]', label);
    await until(() => document.querySelector('.month-export-status')?.textContent.includes('已尝试下载'), label + ' handoff');
    assert.equal(await run(() => !!document.querySelector('[role="menu"]')), false);
    const result = await run(async () => {
      const click = window.__monthExportClicks.at(-1);
      const blob = window.__monthExportBlobs.get(click.url);
      const bitmap = await createImageBitmap(blob); const output = { name: click.name, type: blob.type, width: bitmap.width, height: bitmap.height, bytes: blob.size };
      bitmap.close();
      const bytes = new Uint8Array(await blob.slice(0, 256).arrayBuffer());
      output.hasPngDpi = [...bytes].map((value, index) => value === 112 && String.fromCharCode(...bytes.subarray(index, index + 4)) === 'pHYs').includes(true);
      return output;
    });
    assert.ok(result.name.startsWith('04-April-2027'), result.name);
    assert.ok(result.name.endsWith(mime === 'jpeg' ? '.jpg' : '.png'), result.name);
    assert.equal(result.type, `image/${mime}`); assert.equal(result.width, width); assert.equal(result.height, height);
    if (printPng) assert.equal(result.hasPngDpi, true);
    results.push(result);
  }
  await run(() => { const nav = [...document.querySelectorAll('.month-nav button')].find(item => item.textContent.includes('7 月')); nav.click(); });
  await until(() => document.querySelector('.month-nav [aria-current="page"]')?.textContent.includes('7 月'), 'July');
  await click('.month-export__trigger', '导出本月'); await click('[role="menuitem"]', '印刷版 · PNG');
  await until(() => document.querySelector('.month-export-status')?.textContent.includes('已尝试下载'), 'July handoff');
  const julyName = await run(() => window.__monthExportClicks.at(-1).name);
  assert.ok(julyName.startsWith('07-July-2027'), julyName);
  await run(() => window.scrollTo(0, 500));
  const sticky = await run(() => ({ top: document.querySelector('.editor-preview-column').getBoundingClientRect().top, position: getComputedStyle(document.querySelector('.editor-preview-column')).position }));
  assert.equal(sticky.position, 'sticky'); assert.ok(sticky.top >= 64 && sticky.top <= 84, JSON.stringify(sticky));
  await click('.month-export-status button', '关闭');
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await run(() => window.scrollTo(0, 0));
  await click('.month-export__trigger', '导出本月');
  const phone = await run(() => {
    const trigger = document.querySelector('.month-export__trigger').getBoundingClientRect();
    const menu = document.querySelector('.month-export__menu').getBoundingClientRect();
    const review = document.querySelector('.editor-review-action').getBoundingClientRect();
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, trigger: { x: trigger.x, right: trigger.right, y: trigger.y }, menu: { x: menu.x, right: menu.right, y: menu.y }, review: { x: review.x, y: review.y } };
  });
  assert.ok(phone.menu.x >= 0 && phone.menu.right <= phone.width && phone.scrollWidth <= phone.width, JSON.stringify(phone));
  await call('Emulation.setDeviceMetricsOverride', { width: 320, height: 720, deviceScaleFactor: 1, mobile: true });
  const narrow = await run(() => {
    const menu = document.querySelector('.month-export__menu').getBoundingClientRect();
    const trigger = document.querySelector('.month-export__trigger').getBoundingClientRect();
    const review = document.querySelector('.editor-review-action').getBoundingClientRect();
    return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, menu: { x: menu.x, right: menu.right }, trigger: { x: trigger.x, y: trigger.y }, review: { x: review.x, y: review.y } };
  });
  assert.ok(narrow.menu.x >= 0 && narrow.menu.right <= narrow.width && narrow.scrollWidth <= narrow.width, JSON.stringify(narrow));
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  if (port === '9230') { const screenshot = await call('Page.captureScreenshot', { format: 'png' }); await writeFile('qa/v1-1-month-export-menu-phone.png', Buffer.from(screenshot.data, 'base64')); }
  assert.deepEqual(exceptions, []);
  console.log(JSON.stringify({ port, positions, menuLayoutStable: true, exports: results, julyName, sticky, phone, narrow, exceptions }, null, 2));
} finally {
  ws.close(); await fetch(`http://127.0.0.1:${port}/json/close/${tab.id}`);
}
