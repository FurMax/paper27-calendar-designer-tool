import assert from 'node:assert/strict';
const port = process.env.CDP_PORT ?? '9230';
const origin = 'http://127.0.0.1:5173';
const tabs = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
const tab = tabs.find(item => item.type === 'page' && item.url.startsWith(origin));
assert.ok(tab);
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let sequence = 1;
const jobs = new Map();
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data), job = jobs.get(message.id);
  if (!job) return;
  jobs.delete(message.id);
  message.error ? job.reject(Error(message.error.message)) : job.resolve(message.result);
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = sequence++; jobs.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }));
});
async function evaluate(expression) {
  const response = await call('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression });
  if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
  return response.result.value;
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
await call('Storage.clearDataForOrigin', { origin, storageTypes: 'indexeddb' });
await call('Page.navigate', { url: origin + '/' });
await pause(500);
await evaluate('(' + (async function () {
  const { createEmptyProject } = await import('/src/domain/project.ts');
  const { commitProject } = await import('/src/persistence/indexedDb.ts');
  const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1044;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = '#BE342F'; ctx.fillRect(0, 0, 1200, 1044);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 1200, 120);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  canvas.width = 0; canvas.height = 0;
  const state = createEmptyProject('edge-ui-qa');
  state.assets.a = { id: 'a', blob, mime: 'image/png', fileName: 'white-margin.png', byteSize: blob.size,
    decodedWidth: 1200, decodedHeight: 1044, importedAt: '' };
  for (let month = 1; month <= 12; month++) {
    const id = 'i' + month;
    state.project.photoItems[id] = { id, assetId: 'a', createdAt: '' };
    state.project.months[month].photoItemId = id;
    state.project.months[month].crop = { zoom: 1, offsetX: 0, offsetY: 0 };
  }
  await commitProject(state, null);
}).toString() + ')()');
await call('Page.navigate', { url: origin + '/' });
await pause(600);
await evaluate("[...document.querySelectorAll('.entry-page button')].find(b => b.textContent.includes('继续编辑日历')).click()");
await pause(120);
await evaluate("[...document.querySelectorAll('.desktop-nav button')].find(b => b.textContent.includes('预览与导出')).click()");
await pause(120);
await evaluate("[...document.querySelectorAll('.page-actions button')].find(b => b.textContent.includes('生成整套 12')).click()");
let warning = '';
for (let i = 0; i < 30; i++) {
  await pause(250);
  warning = await evaluate("document.querySelector('.export-sheet')?.innerText ?? ''");
  if (warning.includes('可能出现白边')) break;
}
assert.ok(warning.includes('1 月 · 上方'), warning);
assert.ok(warning.includes('12 月 · 上方'), warning);
assert.ok(warning.includes('仍然生成 12 张'), warning);
await evaluate("[...document.querySelectorAll('.edge-warning-months button')][0].click()");
await pause(500);
let editorWarning = await evaluate("document.querySelector('.proof-workspace .photo-edge-warning')?.innerText ?? ''");
assert.ok(editorWarning.includes('上方'), editorWarning);
const proof = await evaluate('(' + (async function () {
  const { resolveCrop } = await import('/src/domain/crop.ts');
  const { resolvePrintPhotoCrop } = await import('/src/domain/printPhotoCrop.ts');
  const saved = resolveCrop({ width: 1200, height: 1044 }, { zoom: 1, offsetX: 0, offsetY: 0 });
  const expected = resolvePrintPhotoCrop(saved);
  const surface = document.querySelector('.proof-workspace .crop-surface');
  const image = surface.querySelector('img');
  return { scale: Number(surface.dataset.printBleedScale), expectedScale: expected.bleedScale,
    left: parseFloat(image.style.left), expectedLeft: expected.x / 1200 * 100,
    top: parseFloat(image.style.top), expectedTop: expected.y / 1044 * 100 };
}).toString() + ')()');
assert.ok(Math.abs(proof.scale - proof.expectedScale) < 0.00001, JSON.stringify(proof));
assert.ok(Math.abs(proof.left - proof.expectedLeft) < 0.001, JSON.stringify(proof));
assert.ok(Math.abs(proof.top - proof.expectedTop) < 0.001, JSON.stringify(proof));
await evaluate("const slider=document.querySelector('#crop-zoom-desktop'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(slider,'1.3'); slider.dispatchEvent(new Event('input',{bubbles:true}))");
await pause(700);
const afterZoom = await evaluate("({ zoom: document.querySelector('#crop-zoom-desktop')?.value, warning: document.querySelector('.proof-workspace .photo-edge-warning')?.innerText ?? '' })");
assert.equal(afterZoom.warning, '');
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
const touchBefore = await evaluate("(() => { const el=document.querySelector('.proof-workspace .crop-surface'); el.scrollIntoView({block:'center'}); const rect=el.getBoundingClientRect(); return {rect:rect.toJSON(),x:Number(el.dataset.cropOffsetX),y:Number(el.dataset.cropOffsetY)}; })()");
const centerX = Math.round(touchBefore.rect.left + touchBefore.rect.width / 2);
const centerY = Math.round(touchBefore.rect.top + touchBefore.rect.height / 2);
const point = (x, y) => [{ id: 1, x, y, radiusX: 1, radiusY: 1, force: 1 }];
await call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(centerX, centerY) });
for (const distance of [12, 28, 45]) {
  await pause(70);
  await call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(centerX - distance, centerY - distance) });
}
await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await pause(200);
const touchAfter = await evaluate("(() => { const el=document.querySelector('.proof-workspace .crop-surface'); return {x:Number(el.dataset.cropOffsetX),y:Number(el.dataset.cropOffsetY)}; })()");
assert.ok(touchAfter.x !== touchBefore.x || touchAfter.y !== touchBefore.y, JSON.stringify({ touchBefore, touchAfter }));
await call('Emulation.setTouchEmulationEnabled', { enabled: false });
await call('Emulation.clearDeviceMetricsOverride');
await evaluate("[...document.querySelectorAll('.desktop-nav button')].find(b => b.textContent.includes('预览与导出')).click()");
await pause(120);
await evaluate("[...document.querySelectorAll('.page-actions button')].find(b => b.textContent.includes('生成整套 12')).click()");
for (let i = 0; i < 30; i++) {
  await pause(250);
  if (await evaluate("!![...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('仍然生成'))")) break;
}
const afterEditWarning = await evaluate("document.querySelector('.export-sheet')?.innerText ?? ''");
assert.ok(!afterEditWarning.split('\n').some(line => line.startsWith('1 月 ·')), afterEditWarning);
assert.ok(afterEditWarning.includes('2 月 · 上方'), afterEditWarning);
await call('Emulation.setDeviceMetricsOverride', { width: 320, height: 700, deviceScaleFactor: 1, mobile: true });
await pause(100);
const narrow = await evaluate("({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, sheetWidth: Math.round(document.querySelector('.export-sheet').getBoundingClientRect().width), listScroll: document.querySelector('.edge-warning-months').scrollHeight > document.querySelector('.edge-warning-months').clientHeight })");
assert.ok(narrow.scrollWidth <= narrow.width && narrow.sheetWidth <= narrow.width && narrow.listScroll, JSON.stringify(narrow));
await call('Emulation.clearDeviceMetricsOverride');
await evaluate("[...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('仍然生成')).click()");
for (let i = 0; i < 60; i++) {
  await pause(250);
  if (await evaluate("!![...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('下载 ZIP'))")) break;
}
assert.equal(await evaluate("!![...document.querySelectorAll('.export-sheet button')].find(b => b.textContent.includes('下载 ZIP'))"), true);
console.log(JSON.stringify({ fullSetWarning: warning.slice(0, 160), editorWarning, proof, afterZoom, touchBefore: {x:touchBefore.x,y:touchBefore.y}, touchAfter, afterEditWarning: afterEditWarning.slice(0, 130), narrow, continued: true }, null, 2));
ws.close();

