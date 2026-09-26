// Production-preview regression: user-visible UI and downloaded files only.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { unzipSync } from 'fflate';

const origin = process.env.PREVIEW_ORIGIN ?? 'http://127.0.0.1:4173';
const port = process.env.CDP_PORT ?? '9230';
const tab = await (await fetch('http://127.0.0.1:' + port + '/json/new?' + encodeURIComponent(origin + '/'), { method: 'PUT' })).json();
assert.ok(tab.webSocketDebuggerUrl, 'CDP preview tab missing');
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
async function run(fn, ...args) { return evaluate('(' + fn.toString() + ')(' + args.map(JSON.stringify).join(',') + ')'); }
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, label, args = [], limit = 150) {
  for (let i = 0; i < limit; i++) {
    if (await run(fn, ...args)) return;
    await pause(100);
  }
  throw Error('Timed out: ' + label);
}
async function click(selector, text = '') {
  return run((selector, text) => {
    const element = [...document.querySelectorAll(selector)].find(item => !text || item.textContent.includes(text));
    if (!element) throw Error('Missing click target: ' + selector + ' ' + text);
    element.click();
    return element.textContent.trim();
  }, selector, text);
}
async function saved() {
  return run(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('calendar-design-studio-v1');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result, tx = db.transaction(['project', 'assets'], 'readonly');
      const project = tx.objectStore('project').get('active');
      const assets = tx.objectStore('assets').getAll();
      tx.oncomplete = () => {
        db.close();
        resolve({ project: project.result ?? null, assets: assets.result.map(item => ({ id: item.id, fileName: item.fileName, size: item.blob.size })) });
      };
      tx.onerror = () => reject(tx.error);
    };
  }));
}
async function importSynthetic(selector, count, start = 0, label = 'photo') {
  return run(async (selector, count, start, label) => {
    const input = document.querySelector(selector);
    if (!input) throw Error('Picker missing');
    const transfer = new DataTransfer();
    for (let i = 0; i < count; i++) {
      const n = i + start, canvas = document.createElement('canvas');
      canvas.width = 720; canvas.height = 850;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'hsl(' + ((n * 31 + 20) % 360) + ' 72% 48%)';
      ctx.fillRect(0, 0, 720, 850);
      ctx.fillStyle = 'hsl(' + ((n * 31 + 130) % 360) + ' 55% 38%)';
      ctx.fillRect(0, 0, 160, 850);
      ctx.fillStyle = 'hsl(' + ((n * 31 + 230) % 360) + ' 60% 56%)';
      ctx.fillRect(560, 0, 160, 850);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      transfer.items.add(new File([blob], label + '-' + String(n + 1).padStart(2, '0') + '.png', { type: 'image/png' }));
    }
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return transfer.files.length;
  }, selector, count, start, label);
}
function pngInfo(bytes) {
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let dpi = null;
  for (let offset = 8; offset + 12 <= bytes.length; ) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    if (offset + 12 + length > bytes.length) break;
    if (type === 'pHYs' && length >= 9) { dpi = view.getUint32(offset + 8); break; }
    if (type === 'IEND') break;
    offset += length + 12;
  }
  return { width: view.getUint32(16), height: view.getUint32(20), dpi };
}
function jpgInfo(bytes) {
  assert.deepEqual([...bytes.subarray(0, 2)], [255, 216]);
  let width = 0, height = 0;
  for (let i = 2; i < bytes.length - 9; ) {
    if (bytes[i] !== 255) break;
    const marker = bytes[i + 1], length = (bytes[i + 2] << 8) | bytes[i + 3];
    if ([0xC0, 0xC1, 0xC2].includes(marker)) { height = (bytes[i + 5] << 8) | bytes[i + 6]; width = (bytes[i + 7] << 8) | bytes[i + 8]; break; }
    i += 2 + length;
  }
  return { width, height, dpi: bytes[13] === 1 ? (bytes[14] << 8) | bytes[15] : null };
}
const downloads = path.join(os.tmpdir(), 'calendar-pre-release-' + port + '-' + Date.now());
async function screenshot(name) { const result=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false}); await writeFile(path.join('qa','v1-pre-release-'+name+'.png'),Buffer.from(result.data,'base64')); }
await mkdir(downloads, { recursive: true });
await call('Page.enable');
await call('Runtime.enable');
await call('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
await call('Storage.clearDataForOrigin', { origin, storageTypes: 'indexeddb' });
await call('Page.navigate', { url: origin + '/' });
await until(() => !!document.querySelector('.entry-page input[type=file]'), 'entry');
const built = await run(() => ({ scripts: [...document.scripts].map(item => item.src), url: location.href, userAgent: navigator.userAgent }));
assert.ok(built.scripts.some(script => script.includes('/assets/')), 'not a production bundle');
assert.ok(!built.scripts.some(script => script.includes('/src/')), 'development script loaded');
const summary = { browser: built.userAgent, origin, build: 'production assets', checks: {} };
console.log('PREVIEW', JSON.stringify({ port, ...built }));

await run(() => {
  const input = document.querySelector('.entry-page input[type=file]');
  input.files = new DataTransfer().files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
assert.equal((await saved()).project, null);
await run(() => {
  const input = document.querySelector('.entry-page input[type=file]');
  const transfer = new DataTransfer();
  transfer.items.add(new File(['unreadable'], 'bad.png', { type: 'image/png' }));
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
await until(() => document.querySelector('.feedback')?.textContent.includes('无法读取'), 'unreadable notice');
assert.equal((await saved()).project, null);
await importSynthetic('.entry-page input[type=file]', 2);
await until(() => !!document.querySelector('.month-grid'), 'assignment after two photos');
await pause(850);
const partial = await saved();
assert.equal(partial.assets.length, 2);
assert.equal(Object.values(partial.project.months).filter(slot => slot.photoItemId).length, 2);
await click('.page-actions button', '预览与导出');
await until(() => !!document.querySelector('.review-grid'), 'partial review');
const missingExport = await run(() => ({ disabled: [...document.querySelectorAll('.page-actions button')].find(item => item.textContent.includes('生成整套'))?.disabled, missing: document.body.textContent.includes('缺少照片') }));
assert.equal(missingExport.disabled, true);
summary.checks.partial = { ready: 2, missingExport, pickerCancel: true, unreadablePreserved: true };
await click('.page-header button', '分配照片');
await until(() => !!document.querySelector('.month-grid'), 'assignment return');
const beforeReplace = (await saved()).project.months[1].photoItemId;
await run(() => document.querySelector('.month-card').click());
await click('.sheet-options button', '选择新照片替换');
await importSynthetic('.page--assignment input[type=file]', 1, 20, 'replacement');
await pause(850);
const replaced = await saved();
assert.notEqual(replaced.project.months[1].photoItemId, beforeReplace);
assert.ok(replaced.assets.some(asset => asset.fileName === 'replacement-21.png'));
summary.checks.replacement = { replaced: true, unassigned: Object.keys(replaced.project.photoItems).length - 2 };
await click('.desktop-nav button', '编辑月份');
await until(() => !!document.querySelector('.editor-page .crop-surface--editable'), 'editor');
const startCrop = await run(() => {
  const surface = document.querySelector('.editor-page .crop-surface--editable'); surface.scrollIntoView({ block: 'center' });
  return { zoom: Number(surface.dataset.cropZoom), x: Number(surface.dataset.cropOffsetX), y: Number(surface.dataset.cropOffsetY), covered: surface.dataset.cropCovered, rect: (() => { const r = surface.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })() };
});
assert.equal(startCrop.covered, 'true');
await run(() => { const surface = document.querySelector('.crop-surface--editable'); window.__cropPointerEvents = []; for (const type of ['pointerdown','pointermove','pointerup']) surface.addEventListener(type, event => window.__cropPointerEvents.push({type, x:event.clientX, y:event.clientY, pointerId:event.pointerId}), { capture:true }); });
await call('Input.dispatchMouseEvent', { type: 'mousePressed', x: startCrop.rect.x + startCrop.rect.width * .5, y: startCrop.rect.y + startCrop.rect.height * .5, button: 'left', clickCount: 1 });
await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: startCrop.rect.x + startCrop.rect.width * .67, y: startCrop.rect.y + startCrop.rect.height * .25, button: 'left', buttons: 1 });
await call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: startCrop.rect.x + startCrop.rect.width * .67, y: startCrop.rect.y + startCrop.rect.height * .25, button: 'left', clickCount: 1 });
await pause(180);
const dragged = await run(() => {
  const surface = document.querySelector('.editor-page .crop-surface--editable'); surface.scrollIntoView({ block: 'center' });
  return { x: Number(surface.dataset.cropOffsetX), y: Number(surface.dataset.cropOffsetY), covered: surface.dataset.cropCovered };
});
assert.equal(dragged.covered, 'true');
assert.ok(dragged.x !== startCrop.x || dragged.y !== startCrop.y, 'desktop drag did not move crop: ' + JSON.stringify({ startCrop, dragged, events: await run(() => window.__cropPointerEvents), hit: await run(() => { const r=document.querySelector('.crop-surface--editable').getBoundingClientRect(); return document.elementFromPoint(r.x+r.width*.5,r.y+r.height*.5)?.className; }) }));
await run(() => {
  const input = document.querySelector('#crop-zoom-desktop');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(input, '1.4');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
await until(() => Number(document.querySelector('.crop-surface--editable')?.dataset.cropZoom) >= 1.39, 'zoom slider');
await click('.crop-action-row button', '重置裁切');
await until(() => Number(document.querySelector('.crop-surface--editable')?.dataset.cropZoom) === 1, 'crop reset');
summary.checks.desktopCrop = { dragged, zoomed: true, reset: true, covered: await run(() => document.querySelector('.crop-surface--editable')?.dataset.cropCovered) };
await run(() => { const input=document.querySelector('#crop-zoom-desktop'); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; setter.call(input,'1.23'); input.dispatchEvent(new Event('input',{bubbles:true})); input.dispatchEvent(new Event('change',{bubbles:true})); });
await until(() => Number(document.querySelector('.crop-surface--editable')?.dataset.cropZoom) >= 1.22, 'nondefault crop before persistence');
console.log('PARTIAL_AND_CROP', JSON.stringify(summary.checks));


await until(() => document.querySelectorAll('.background-controls .monthly-photo-colors__grid button').length === 3, 'three photo suggestions');
const suggestions = await run(() => [...document.querySelectorAll('.background-controls .monthly-photo-colors__grid button')].map(item => ({ label: item.dataset.tooltip.split(' · ')[0], color: item.dataset.tooltip.split(' · ')[1] })));
assert.equal(new Set(suggestions.map(item => item.color)).size, 3);
assert.deepEqual(suggestions.map(item => item.label), ['主色', '搭配色', '点缀色']);
await run(() => document.querySelector('.background-controls .monthly-photo-colors__grid button').click());
await until(() => document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-background') === document.querySelector('.monthly-photo-colors__grid button')?.dataset.tooltip.split(' · ')[1], 'recommendation applied');
const recommended = await run(() => ({ color: document.querySelector('.monthly-photo-colors__grid button').dataset.tooltip.split(' · ')[1], preview: document.querySelector('.month-proof-layer--current .calendar-proof').style.getPropertyValue('--proof-background') }));
assert.equal(recommended.color, recommended.preview);
await click('.background-controls .palette-custom-toggle');
await run(() => {
  const input = document.querySelector('.background-controls input[aria-label="背景色 HEX"]');
  input.scrollIntoView({ block: 'center' });
  input.focus();
  input.select();
});
await call('Input.insertText', { text: '#274C65' });
await run(() => document.querySelector('.background-controls input[aria-label="背景色 HEX"]').blur());
await until(() => document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-background') === '#274C65', 'manual HEX');
const autoInk = await run(() => document.querySelector('.month-proof-layer--current .calendar-proof').style.getPropertyValue('--proof-ink'));
const fonts = [];
for (const label of ['经典', '简约', '手写']) {
  await click('.font-options button', label);
  fonts.push(await run(() => ({ selected: document.querySelector('.font-options button[aria-pressed="true"]')?.textContent, family: document.querySelector('.calendar-proof__title strong') ? getComputedStyle(document.querySelector('.calendar-proof__title strong')).fontFamily : '' })));
}
const scales = [];
for (const label of ['小', '标准', '大']) {
  await click('.scale-options button', label);
  scales.push(await run(() => ({ selected: document.querySelector('.scale-options button[aria-pressed="true"] span')?.textContent, scale: document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-scale') })));
}
assert.equal(new Set(fonts.map(item => item.family)).size, 3);
assert.equal(new Set(scales.map(item => item.scale)).size, 3);
await click('.editor-deep-section--dates .rail-section-toggle', '日期设置');
await run(() => document.querySelector('.important-controls button[aria-label^="1 月 15 日"]').click());
assert.equal(await run(() => document.querySelector('.important-controls button[aria-label^="1 月 15 日"]')?.getAttribute('aria-pressed')), 'true');
assert.equal(await run(() => !!document.querySelector('.month-proof-layer--current .calendar-proof__grid span[aria-label="January 15 重要日期"]')), true);
await run(() => document.querySelector('.important-controls button[aria-label^="1 月 15 日"]').click());
assert.equal(await run(() => document.querySelector('.important-controls button[aria-label^="1 月 15 日"]')?.getAttribute('aria-pressed')), 'false');
await run(() => document.querySelector('.important-controls button[aria-label^="1 月 21 日"]').click());
await pause(850);
const edited = await saved();
assert.equal(edited.project.months[1].style.background, '#274C65');
assert.deepEqual(edited.project.months[1].importantDays, [21]);
assert.ok(edited.project.months[1].crop.zoom >= 1.22);
summary.checks.editor = { suggestions, recommended, autoInk, fonts, scales, importantDays: edited.project.months[1].importantDays };
await call('Page.reload', { ignoreCache: true });
await until(() => !!document.querySelector('.entry-page'), 'returning Entry');
await click('.entry-page button', '继续编辑');
await until(() => !!document.querySelector('.editor-page'), 'resumed editor');
const restored = await saved();
assert.equal(restored.project.months[1].style.background, '#274C65');
assert.deepEqual(restored.project.months[1].importantDays, [21]);
assert.ok(restored.project.months[1].crop.zoom >= 1.22);
assert.equal(restored.assets.length, 3);
assert.equal(restored.project.lastLocation.screen, 'editor');
summary.checks.returning = { restored: true, location: restored.project.lastLocation, assets: restored.assets.length };
console.log('EDITOR_AND_RETURNING', JSON.stringify({ editor: summary.checks.editor, returning: summary.checks.returning }));

await click('.brand');
await until(() => !!document.querySelector('.entry-page'), 'entry before Start New');
await click('.entry-page button', '新建日历');
assert.equal(await run(() => !!document.querySelector('[role=dialog][aria-label="新建日历确认"]')), true);
await click('.confirm-actions button', '保留当前日历');
assert.equal((await saved()).project.id, restored.project.id);
await click('.entry-page button', '新建日历');
await click('.confirm-actions button', '新建日历');
await pause(600);
assert.equal((await saved()).project, null);
await importSynthetic('.entry-page input[type=file]', 12, 0, 'full');
await until(() => !!document.querySelector('.month-grid'), 'twelve-photo assignment');
await pause(850);
const complete = await saved();
assert.equal(complete.assets.length, 12);
assert.equal(Object.values(complete.project.months).filter(slot => slot.photoItemId).length, 12);
const assignmentOrder = Array.from({ length: 12 }, (_, index) => {
  const item = complete.project.photoItems[complete.project.months[index + 1].photoItemId];
  return complete.assets.find(asset => asset.id === item.assetId).fileName;
});
assert.deepEqual(assignmentOrder, Array.from({ length: 12 }, (_, index) => 'full-' + String(index + 1).padStart(2, '0') + '.png'));
summary.checks.startNew = { cancellationPreserved: true, confirmationCleared: true, ready: 12, assignmentOrder };
await click('.page-actions button', '预览与导出');
await until(() => document.querySelectorAll('.review-card').length === 12, 'twelve review proofs');
const reviewEntry = await run(() => ({action:document.querySelector('.review-page .page-header button')?.textContent.trim(),cards:[...document.querySelectorAll('.review-card')].map(card=>card.getAttribute('aria-label')),selected:document.querySelectorAll('.review-card[aria-selected=true],.review-card.is-current').length,primary:document.querySelector('.review-page .page-actions .button--primary')?.textContent.trim()}));
assert.equal(reviewEntry.action,'编辑月份');assert.equal(reviewEntry.cards.length,12);assert.ok(reviewEntry.cards[3].includes('去编辑 4 月'));assert.equal(reviewEntry.selected,0);assert.equal(reviewEntry.primary,'生成整套 12 张');
const focusedCard = await run(() => {const card=document.querySelector('.review-card[data-month="4"]');card.focus();return {outline:getComputedStyle(card).outlineWidth,hint:getComputedStyle(card.querySelector('.review-card__edit-hint')).opacity};});assert.equal(focusedCard.outline,'2px');assert.equal(focusedCard.hint,'1');
await run(() => document.querySelector('.review-card[data-month="4"]').click());await until(() => document.querySelector('.month-nav [aria-current="page"]')?.textContent.includes('4 月'),'direct April edit');
await click('.desktop-nav button','预览与导出');await until(() => !!document.querySelector('.review-page'),'Review after direct edit');
await click('.review-page .page-header button','编辑月份');await until(() => document.querySelector('.month-nav [aria-current="page"]')?.textContent.includes('1 月'),'header Editor');
await click('.desktop-nav button','预览与导出');await until(() => !!document.querySelector('.review-page'),'Review after header edit');
const previews = await run(() => [...document.querySelectorAll('.review-card')].map(card => ({
  month: Number(card.dataset.month),
  title: card.querySelector('.calendar-proof__title strong')?.textContent,
  weekdays: [...card.querySelectorAll('.calendar-proof__weekdays span')].map(span => span.textContent.trim()),
  cells: [...card.querySelectorAll('.calendar-proof__grid span')].map(span => span.textContent.trim()),
  covered: card.querySelector('.crop-surface')?.dataset.cropCovered,
  printScale: Number(card.querySelector('.crop-surface')?.dataset.printBleedScale),
  titleFits: (() => { const title = card.querySelector('.calendar-proof__title strong'), proof = card.querySelector('.calendar-proof'); const a = title?.getBoundingClientRect(), b = proof?.getBoundingClientRect(); return !!a && !!b && a.right <= b.right + 1; })(),
})));
assert.equal(previews.length, 12);
for (let month = 1; month <= 12; month++) {
  const preview = previews[month - 1];
  const first = new Date(Date.UTC(2027, month - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(2027, month, 0)).getUTCDate();
  const expected = Array.from({ length: 42 }, (_, index) => {
    const day = index - first + 1;
    return day >= 1 && day <= days ? String(day) : '';
  });
  assert.equal(preview.month, month);
  assert.deepEqual(preview.weekdays, ['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  assert.deepEqual(preview.cells, expected, '2027 preview calendar ' + month);
  assert.equal(preview.covered, 'true');
  assert.ok(preview.printScale >= 1);
  if ([9, 11, 12].includes(month)) assert.equal(preview.titleFits, true, 'long month overflow ' + month);
}
summary.checks.calendarPreview = { months: 12, dateCells: 504, sundayFirst: true, longMonthsFit: true, printCropCovered: true };
if (port === '9230') { await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }); await pause(120); await screenshot('review-desktop'); }
const beforePalette = (await saved()).project.months;
await click('.set-color-panel__actions button', '为全部月份推荐配色');
await until(() => document.querySelectorAll('.set-color-row').length === 12, 'twelve palette recommendations', [], 200);
assert.equal((await saved()).project.months[1].style.background, beforePalette[1].style.background);
const paletteRows = await run(() => [...document.querySelectorAll('.set-color-row')].map(item => ({ label: item.querySelector('.set-color-row__month')?.textContent, color: item.querySelector('.set-color-row__hex')?.textContent })));
const colorCopy = await run(() => ({preview:document.querySelector('.set-color-preview__copy')?.textContent, note:document.querySelector('.set-color-sheet__note')?.textContent, cancel:document.querySelector('.set-color-sheet .confirm-actions .button--quiet')?.textContent.trim(),apply:document.querySelector('.set-color-sheet .confirm-actions .button--primary')?.textContent.trim()}));
assert.ok(colorCopy.preview.includes('当前背景')&&colorCopy.preview.includes('推荐背景'));assert.equal(colorCopy.cancel,'取消');
const updateCount=Number(colorCopy.apply.match(/(\d+) 个月/)?.[1]);const unchangedCount=Number(colorCopy.note.match(/(\d+) 个月的推荐背景与当前相同/)?.[1]??0);assert.equal(updateCount+unchangedCount,12);assert.ok(colorCopy.note.includes(`将更新 ${updateCount} 个月`));
await run(() => document.querySelectorAll('.set-color-row')[6].click());await until(() => document.querySelector('.set-color-preview__copy .button')?.textContent.includes('7 月'),'dynamic edit CTA');
await click('.set-color-sheet .confirm-actions button', '取消');
await until(() => !document.querySelector('.set-color-sheet'), 'palette close');
await click('.set-color-panel__actions button', '为全部月份推荐配色');
await until(() => document.querySelectorAll('.set-color-row').length === 12, 'second palette recommendations', [], 200);
await click('.set-color-sheet .confirm-actions button', '应用推荐配色');
await pause(850);
const applied = await saved();
assert.ok(Object.values(applied.project.months).some((slot, index) => slot.style.background !== beforePalette[index + 1]?.style.background));
assert.ok(applied.project.colorBatchUndo);
await call('Page.reload', { ignoreCache: true });
await until(() => !!document.querySelector('.entry-page'), 'reload after palette');
await click('.entry-page button', '继续编辑');
await until(() => !!document.querySelector('.review-page'), 'resume Review after palette');
assert.equal(await run(() => !![...document.querySelectorAll('.set-color-panel__actions button')].find(item => item.textContent.includes('撤销本次配色'))), true);
await click('.set-color-panel__actions button', '撤销本次配色');
await pause(750);
const paletteRestored = await saved();
for (let month = 1; month <= 12; month++) assert.equal(paletteRestored.project.months[month].style.background, beforePalette[month].style.background);
assert.equal(paletteRestored.project.colorBatchUndo, undefined);
summary.checks.palette = { rows: paletteRows.length, distinct: new Set(paletteRows.map(item => item.color)).size, unchangedBeforeApply: true, appliedAfterRepeat: true, restoredAfterReload: true };
console.log('TWELVE_PREVIEW_AND_PALETTE', JSON.stringify({ calendar: summary.checks.calendarPreview, palette: summary.checks.palette }));

function decodePngPixels(bytes) {
  const info = pngInfo(bytes);
  let offset = 8, depth = 0, colorType = 0;
  const chunks = [];
  while (offset < bytes.length) {
    const length = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0);
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') { depth = data[8]; colorType = data[9]; }
    if (type === 'IDAT') chunks.push(data);
    offset += length + 12;
    if (type === 'IEND') break;
  }
  assert.equal(depth, 8);
  assert.ok([2, 6].includes(colorType), 'unsupported PNG color type ' + colorType);
  const channels = colorType === 6 ? 4 : 3, stride = info.width * channels;
  const inflated = inflateSync(Buffer.concat(chunks));
  const pixels = Buffer.alloc(info.height * stride);
  for (let y = 0; y < info.height; y++) {
    const input = y * (stride + 1), filter = inflated[input], row = y * stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? pixels[row + x - channels] : 0;
      const up = y ? pixels[row + x - stride] : 0;
      const upperLeft = y && x >= channels ? pixels[row + x - stride - channels] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upperLeft;
        const a = Math.abs(p - left), b = Math.abs(p - up), c = Math.abs(p - upperLeft);
        predictor = a <= b && a <= c ? left : b <= c ? up : upperLeft;
      } else assert.equal(filter, 0, 'PNG filter');
      pixels[row + x] = (inflated[input + 1 + x] + predictor) & 255;
    }
  }
  const sample = (x, y) => {
    const at = (Math.floor(y) * info.width + Math.floor(x)) * channels;
    return [...pixels.subarray(at, at + channels)].slice(0, 3);
  };
  const cellInk = (month, index) => {
    const col = index % 7, row = Math.floor(index / 7);
    const sx = info.width === 1252 ? 1181 / 1200 : 1, sy = info.height === 1843 ? 1772 / 1800 : 1;
    const ox = info.width === 1252 ? 35 : 0, oy = info.height === 1843 ? 35 : 0;
    const cx = ox + (96 + (col + .5) * 1008 / 7) * sx;
    const cy = oy + (1370 + (row + .5) * 360 / 6) * sy;
    let ink = 0, important = 0;
    for (let y = Math.floor(cy - 22 * sy); y <= cy + 22 * sy; y += 2) {
      for (let x = Math.floor(cx - 26 * sx); x <= cx + 26 * sx; x += 2) {
        const [r, g, b] = sample(x, y);
        if (r < 220 || g < 220 || b < 220) ink++;
        if (r > 100 && r < 210 && g < 100 && b < 100) important++;
      }
    }
    return { ink, important };
  };
  return { ...info, sample, cellInk };
}
async function fullSet(variant, format) {
  await run((variant, format) => {
    document.querySelector('input[name=review-export-variant][value=' + variant + ']').click();
    document.querySelector('input[name=review-export-format][value=' + format + ']').click();
  }, variant, format);
  await click('.page-actions button', '生成整套 12');
  const seen = new Set();
  for (let i = 0; i < 450; i++) {
    const phase = await run(() => {
      const sheet = document.querySelector('.export-sheet');
      return { text: sheet?.textContent ?? '', completed: sheet?.querySelectorAll('.export-month-progress .is-complete').length ?? 0, warning: !![...sheet?.querySelectorAll('button') ?? []].find(button => button.textContent.includes('仍然生成')) };
    });
    seen.add(phase.completed);
    if (phase.warning) await click('.export-sheet button', '仍然生成');
    if (phase.text.includes('下载 ZIP')) break;
    if (phase.text.includes('整套文件暂时无法生成')) throw Error('Full-set export failed: ' + phase.text);
    await pause(100);
  }
  assert.equal(await run(() => !![...document.querySelectorAll('.export-sheet button')].find(button => button.textContent.includes('下载 ZIP'))), true, 'ZIP not ready');
  await click('.export-sheet button', '下载 ZIP');
  const name = 'Calendar-Design-Studio-2027' + (variant === 'print' ? '-Print-106x156mm' : '') + (format === 'jpg' ? '-JPG' : '') + '.zip';
  let archive;
  for (let i = 0; i < 100; i++) {
    if ((await readdir(downloads)).includes(name)) { archive = await readFile(path.join(downloads, name)); break; }
    await pause(100);
  }
  assert.ok(archive, 'ZIP download missing: ' + name);
  const entries = Object.entries(unzipSync(new Uint8Array(archive)));
  assert.equal(entries.length, 12);
  await click('.export-sheet button', '返回预览');
  return { name, entries, progress: [...seen].sort((a, b) => a - b), bytes: archive.length };
}
await run(() => document.querySelector('.review-card[data-month="1"]').click());
await until(() => !!document.querySelector('.editor-page'), 'January editor before output');
await run(() => { const input=document.querySelector('#crop-zoom-desktop'); const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; setter.call(input,'1.45'); input.dispatchEvent(new Event('input',{bubbles:true})); input.dispatchEvent(new Event('change',{bubbles:true})); });
await until(() => Number(document.querySelector('.crop-surface--editable')?.dataset.cropZoom) >= 1.44, 'custom crop before export');
await click('.editor-deep-section--dates .rail-section-toggle', '日期设置');
await run(() => document.querySelector('.important-controls button[aria-label^="1 月 21 日"]').click());
await click('.font-options button', '手写');
await click('.scale-options button', '大');
await click('.desktop-nav button', '预览与导出');
await until(() => !!document.querySelector('.review-page'), 'review for output');
await pause(800);
assert.equal((await saved()).project.months[1].importantDays[0], 21);
const januaryMark = await run(() => !!document.querySelector('.review-card[data-month="1"] .calendar-proof__grid span[aria-label="January 21 重要日期"]'));
assert.equal(januaryMark, true);
await click('.page-actions button', '生成整套 12');
await until(() => !!document.querySelector('.export-sheet'), 'cancelable export');
await click('.export-sheet button', '取消');
await until(() => !document.querySelector('.export-sheet'), 'cancelled export');
assert.equal((await saved()).project.months[1].importantDays[0], 21);
summary.checks.cancel = { closed: true, savedProjectPreserved: true };
const printPng = await fullSet('print', 'png');
const printPngFiles = [];
for (let month = 1; month <= 12; month++) {
  const [name, bytes] = printPng.entries[month - 1];
  assert.ok(name.startsWith(String(month).padStart(2, '0') + '-'));
  assert.ok(name.endsWith('-Print-106x156mm.png'));
  const decoded = decodePngPixels(bytes);
  assert.equal(decoded.width, 1252); assert.equal(decoded.height, 1843); assert.equal(decoded.dpi, 11811);
  const first = new Date(Date.UTC(2027, month - 1, 1)).getUTCDay(), days = new Date(Date.UTC(2027, month, 0)).getUTCDate();
  let matched = 0, importantPixels = 0;
  for (let index = 0; index < 42; index++) {
    const expected = index >= first && index < first + days;
    const cell = decoded.cellInk(month, index);
    if ((cell.ink > 4) === expected) matched++;
    if (month === 1 && index === first + 20) importantPixels = cell.important;
  }
  assert.equal(matched, 42, 'printed dates month ' + month);
  if (month === 1) assert.ok(importantPixels > 4, 'Important Date color absent from January PNG');
  for (const [x, y] of [[0, 500], [1251, 500], [400, 0]]) assert.ok(decoded.sample(x, y).some(value => value < 225), 'photo bleed blank ' + month + ' ' + x + ',' + y);
  printPngFiles.push({ month, name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), importantPixels });
}
assert.equal(new Set(printPngFiles.map(file => file.sha256)).size, 12);
summary.checks.printPng = { zipBytes: printPng.bytes, progress: printPng.progress, files: printPngFiles.map(({ month, bytes, importantPixels }) => ({ month, bytes, importantPixels })) };
console.log('PRINT_PNG', JSON.stringify(summary.checks.printPng));
await rm(path.join(downloads, printPng.name));
const repeatedPrintPng = await fullSet('print', 'png');
assert.equal(repeatedPrintPng.entries.length, 12);
for (let index = 0; index < 12; index++) {
  assert.equal(repeatedPrintPng.entries[index][0], printPng.entries[index][0]);
  assert.equal(createHash('sha256').update(repeatedPrintPng.entries[index][1]).digest('hex'), printPngFiles[index].sha256, 'repeat print PNG month ' + (index + 1));
}
summary.checks.repeatPrintPng = { files: repeatedPrintPng.entries.length, identical: true, progress: repeatedPrintPng.progress };
console.log('REPEAT_PRINT_PNG', JSON.stringify(summary.checks.repeatPrintPng));

async function waitFile(name) { for (let i = 0; i < 100; i++) { if ((await readdir(downloads)).includes(name)) return path.join(downloads, name); await pause(100); } throw Error('Download missing: ' + name); }
const digitalPng = await fullSet('digital', 'png');
const digitalPngFiles = [];
for (let month = 1; month <= 12; month++) {
  const [name, bytes] = digitalPng.entries[month - 1];
  assert.ok(name.startsWith(String(month).padStart(2, '0') + '-'));
  assert.ok(name.endsWith('-2027.png'));
  const decoded = decodePngPixels(bytes);
  assert.equal(decoded.width, 1200); assert.equal(decoded.height, 1800);
  const first = new Date(Date.UTC(2027, month - 1, 1)).getUTCDay(), days = new Date(Date.UTC(2027, month, 0)).getUTCDate();
  let matched = 0;
  for (let index = 0; index < 42; index++) {
    const expected = index >= first && index < first + days;
    if ((decoded.cellInk(month, index).ink > 4) === expected) matched++;
  }
  assert.equal(matched, 42, 'digital dates month ' + month);
  for (const x of [0, 1199]) assert.ok(decoded.sample(x, 500).some(value => value < 225), 'digital photo edge blank ' + month);
  digitalPngFiles.push({ month, name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
assert.equal(new Set(digitalPngFiles.map(file => file.sha256)).size, 12);
summary.checks.digitalPng = { zipBytes: digitalPng.bytes, files: 12, dateCells: 504, fullBleed: true };
const printJpg = await fullSet('print', 'jpg');
const printJpgFiles = [];
for (let month = 1; month <= 12; month++) {
  const [name, bytes] = printJpg.entries[month - 1];
  assert.ok(name.startsWith(String(month).padStart(2, '0') + '-'));
  assert.ok(name.endsWith('-Print-106x156mm.jpg'));
  const info = jpgInfo(bytes);
  assert.deepEqual([info.width, info.height, info.dpi], [1252, 1843, 300]);
  assert.deepEqual([...bytes.subarray(-2)], [255, 217]);
  printJpgFiles.push({ month, name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
assert.equal(new Set(printJpgFiles.map(file => file.sha256)).size, 12);
const jpgEdges = await run(async (encoded) => {
  const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
  const image = await createImageBitmap(new Blob([bytes], { type: 'image/jpeg' }));
  const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
  const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0); image.close();
  const pixel = (x, y) => [...ctx.getImageData(x, y, 1, 1).data].slice(0, 3);
  return [pixel(0, 500), pixel(1251, 500), pixel(400, 0)];
}, Buffer.from(printJpg.entries[0][1]).toString('base64'));
assert.ok(jpgEdges.every(pixel => pixel.some(value => value < 225)), 'JPG photo bleed blank');
summary.checks.printJpg = { zipBytes: printJpg.bytes, files: 12, dpi: 300, photoEdges: jpgEdges };
await run(() => document.querySelector('.review-card[data-month="1"]').click());
await until(() => !!document.querySelector('.editor-page'), 'single export editor');
await click('.month-export__trigger', '导出本月');
await click('.month-export__menu button', '印刷版 · PNG');
await until(() => document.querySelector('.month-export-status')?.textContent.includes('已尝试下载'), 'single print PNG handoff');
const singlePrintName = '01-January-2027-Print-106x156mm.png';
await waitFile(singlePrintName);
const singlePrint = decodePngPixels(new Uint8Array(await readFile(path.join(downloads, singlePrintName))));
assert.deepEqual([singlePrint.width, singlePrint.height, singlePrint.dpi], [1252, 1843, 11811]);
const dateIndex = new Date(Date.UTC(2027, 0, 1)).getUTCDay() + 20;
assert.ok(singlePrint.cellInk(1, dateIndex).important > 4, 'single print PNG Important Date absent');
await click('.month-export-status button', '关闭');
await click('.month-export__trigger', '导出本月');
await click('.month-export__menu button', '屏幕版 · JPG');
await until(() => document.querySelector('.month-export-status')?.textContent.includes('已尝试下载'), 'single digital JPG handoff');
const singleDigitalName = '01-January-2027.jpg';
await waitFile(singleDigitalName);
const singleDigitalBytes = new Uint8Array(await readFile(path.join(downloads, singleDigitalName)));
assert.deepEqual([jpgInfo(singleDigitalBytes).width, jpgInfo(singleDigitalBytes).height], [1200, 1800]);
summary.checks.single = { printPng: singlePrintName, digitalJpg: singleDigitalName, importantDateInPng: true };
console.log('OTHER_EXPORTS', JSON.stringify({ digitalPng: summary.checks.digitalPng, printJpg: summary.checks.printJpg, single: summary.checks.single }));

await click('.month-export-status button', '关闭');
const beforeSaveFailure = await saved();
await run(() => {
  const original = IDBDatabase.prototype.transaction;
  IDBDatabase.prototype.transaction = function(stores, mode, ...rest) {
    if (mode === 'readwrite') {
      IDBDatabase.prototype.transaction = original;
      throw Error('QA injected save failure');
    }
    return original.call(this, stores, mode, ...rest);
  };
});
await click('.background-controls .quick-colors button[data-tooltip^="鼠尾草绿"]');
await until(() => !!document.querySelector('.feedback--error'), 'save failure feedback');
const afterFailedSave = await saved();
assert.equal(afterFailedSave.project.months[1].style.background, beforeSaveFailure.project.months[1].style.background);
await click('.feedback--error button', '重试保存');
await until(() => !document.querySelector('.feedback--error'), 'save retry');
await pause(500);
const afterSaveRetry = await saved();
assert.notEqual(afterSaveRetry.project.months[1].style.background, beforeSaveFailure.project.months[1].style.background);
summary.checks.saveFailure = { priorRevision: beforeSaveFailure.project.revision, failedRevision: afterFailedSave.project.revision, retryRevision: afterSaveRetry.project.revision, priorDataPreserved: true };
await click('.desktop-nav button', '预览与导出');
await until(() => !!document.querySelector('.review-page'), 'review before export failure');
await run(() => {
  document.querySelector('input[name=review-export-variant][value=digital]').click();
  document.querySelector('input[name=review-export-format][value=jpg]').click();
  window.__originalFontLoad = document.fonts.load.bind(document.fonts);
  document.fonts.load = async () => { throw Error('QA injected font failure'); };
});
await click('.page-actions button', '生成整套 12');
await until(() => !!document.querySelector('.export-sheet'), 'export failure sheet');
for (let i = 0; i < 100; i++) {
  const phase = await run(() => ({ warning: !![...document.querySelectorAll('.export-sheet button')].find(button => button.textContent.includes('仍然生成')), error: document.querySelector('.export-sheet')?.textContent.includes('整套文件暂时无法生成') }));
  if (phase.warning) await click('.export-sheet button', '仍然生成');
  if (phase.error) break;
  await pause(100);
}
assert.equal(await run(() => document.querySelector('.export-sheet')?.textContent.includes('整套文件暂时无法生成')), true);
assert.equal((await saved()).project.revision, afterSaveRetry.project.revision);
await run(() => { document.fonts.load = window.__originalFontLoad; });
await click('.export-sheet button', '重试');
await until(() => !![...document.querySelectorAll('.export-sheet button')].find(button => button.textContent.includes('下载 ZIP')), 'export retry ready', [], 300);
await click('.export-sheet button', '下载 ZIP');
const retryName = 'Calendar-Design-Studio-2027-JPG.zip';
await waitFile(retryName);
const retryArchive = unzipSync(new Uint8Array(await readFile(path.join(downloads, retryName))));
const retryEntries = Object.entries(retryArchive);
assert.equal(retryEntries.length, 12);
for (const [name, bytes] of retryEntries) {
  assert.ok(name.endsWith('.jpg'));
  assert.deepEqual([jpgInfo(bytes).width, jpgInfo(bytes).height], [1200, 1800]);
}
await click('.export-sheet button', '返回预览');
summary.checks.exportFailure = { errorShown: true, savedProjectPreserved: true, retryFiles: retryEntries.length, variant: 'digital JPG' };
console.log('FAILURE_RECOVERY', JSON.stringify({ save: summary.checks.saveFailure, export: summary.checks.exportFailure }));


await run(() => document.querySelector('.review-card[data-month="9"]').click());
await until(() => !!document.querySelector('.editor-page'), 'long-month type editor');
const longType = [];
for (const font of ['经典', '简约', '手写']) {
  for (const scale of ['小', '标准', '大']) {
    await click('.font-options button', font);
    await click('.scale-options button', scale);
    await click('.desktop-nav button', '预览与导出');
    await until(() => !!document.querySelector('.review-page'), 'long-month review');
    const fit = await run(() => [9, 11, 12].map(month => {
      const card = document.querySelector('.review-card[data-month="' + month + '"]');
      const title = card.querySelector('.calendar-proof__title strong').getBoundingClientRect();
      const proof = card.querySelector('.calendar-proof').getBoundingClientRect();
      return { month, withinProof: title.left >= proof.left - 1 && title.right <= proof.right + 1 };
    }));
    assert.ok(fit.every(item => item.withinProof), 'long-month title overflow ' + font + ' / ' + scale);
    longType.push({ font, scale, months: fit });
    await run(() => document.querySelector('.review-card[data-month="9"]').click());
    await until(() => !!document.querySelector('.editor-page'), 'long-month editor return');
  }
}
summary.checks.longTypography = { combinations: longType.length, months: [9, 11, 12], allFit: true };
await click('.desktop-nav button', '预览与导出');
await until(() => !!document.querySelector('.review-page'), 'review after long-month type');
await run(() => document.querySelector('.review-card[data-month="1"]').click());
await until(() => !!document.querySelector('.editor-page'), 'GSAP editor');
await pause(350);
await run(() => {
  window.__qaMonthFrames = [];
  const start = performance.now();
  const tick = () => {
    const old = document.querySelector('.month-proof-layer--outgoing');
    const current = document.querySelector('.month-proof-layer--current');
    const image = current?.querySelector('.crop-surface img');
    window.__qaMonthFrames.push({ old: old ? Number(getComputedStyle(old).opacity) : 1, oldLoaded: !!old?.querySelector('img')?.complete, current: current ? Number(getComputedStyle(current).opacity) : 0, imageLoaded: !!image?.complete && !!image?.naturalWidth });
    if (performance.now() - start < 380) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  document.querySelectorAll('.month-nav button')[1].click();
});
await pause(450);
const monthFrames = await run(() => window.__qaMonthFrames);
assert.ok(monthFrames.length > 8);
assert.equal(monthFrames[0].oldLoaded, true);
assert.ok(monthFrames.every(frame => 1 - (1 - frame.old) * (1 - frame.current) > .99), 'workspace flash in production preview');
assert.ok(monthFrames.every(frame => frame.current < .02 || frame.imageLoaded), 'incoming photo revealed early');
for (const index of [0, 1, 2, 3]) { await run(index => document.querySelectorAll('.month-nav button')[index].click(), index); await pause(45); }
await until(() => document.querySelector('.properties-panel__head h2')?.textContent.includes('4 月'), 'rapid switch April');
await pause(550);
assert.equal(await run(() => document.querySelector('.month-proof-layer--current .calendar-proof')?.getAttribute('aria-label')), 'April 2027 日历预览');
assert.equal(await run(() => !!document.querySelector('.month-proof-layer--outgoing')), false);
await until(() => document.querySelectorAll('.background-controls .monthly-photo-colors__grid button').length === 3, 'April photo swatches');
const swatches = await run(() => [...document.querySelectorAll('.background-controls .monthly-photo-colors__grid button')].map(item => item.dataset.tooltip.split(' · ')[1]));
for (const index of [0, 1, 2, 0, 2]) await run(index => document.querySelectorAll('.background-controls .monthly-photo-colors__grid button')[index].click(), index);
await pause(600);
assert.equal(await run(() => document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-background')), swatches[2]);
summary.checks.gsap = { frameCount: monthFrames.length, minCoverage: Math.min(...monthFrames.map(frame => 1 - (1 - frame.old) * (1 - frame.current))), latestMonth: 4, repeatedPhotoColorFinal: swatches[2] };
await click('.brand');
await until(() => !!document.querySelector('.entry-art'), 'Landing stack');
await pause(1450);
const landing = await run(() => [...document.querySelectorAll('.entry-art__sheet')].map(item => ({ opacity: getComputedStyle(item).opacity, transform: getComputedStyle(item).transform })));
assert.equal(landing.length, 3);
assert.ok(landing.every(item => item.opacity === '1'));
assert.equal(new Set(landing.map(item => item.transform)).size, 3);
summary.checks.gsap.landingFinal = true;
if (port === '9230') await screenshot('entry-desktop');
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await click('.entry-page button', '继续编辑');
await until(() => !!document.querySelector('.editor-page'), 'mobile editor');
if (port === '9230') await screenshot('editor-phone');
const mobileRect = await run(() => {
  const surface = document.querySelector('.editor-page .crop-surface--editable');
  surface.scrollIntoView({ block: 'center' });
  const rect = surface.getBoundingClientRect();
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, before: { zoom: Number(surface.dataset.cropZoom), y: Number(surface.dataset.cropOffsetY) }, hit: document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.className };
});
const cx = mobileRect.x + mobileRect.width / 2, cy = mobileRect.y + mobileRect.height / 2;
await call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 1 }] });
await call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx, y: cy - 55, id: 1 }] });
await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await pause(180);
const mobileDragged = await run(() => ({ y: Number(document.querySelector('.crop-surface--editable')?.dataset.cropOffsetY), covered: document.querySelector('.crop-surface--editable')?.dataset.cropCovered }));
assert.notEqual(mobileDragged.y, mobileRect.before.y, 'single-finger crop drag did not move');
await call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx - 30, y: cy, id: 1 }, { x: cx + 30, y: cy, id: 2 }] });
await call('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - 76, y: cy, id: 1 }, { x: cx + 76, y: cy, id: 2 }] });
await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await pause(200);
const mobilePinched = await run(() => ({ zoom: Number(document.querySelector('.crop-surface--editable')?.dataset.cropZoom), covered: document.querySelector('.crop-surface--editable')?.dataset.cropCovered }));
assert.ok(mobilePinched.zoom > mobileRect.before.zoom, 'pinch zoom did not grow');
assert.equal(mobilePinched.covered, 'true');
await click('.mobile-crop-trigger');
await click('.action-sheet .crop-action-row button', '重置裁切');
await click('.action-sheet .sheet-cancel', '完成');
await until(() => Number(document.querySelector('.crop-surface--editable')?.dataset.cropZoom) === 1, 'mobile crop reset');
const layouts = [];
for (const [width, height] of [[390, 844], [844, 390], [320, 700], [1440, 900], [1000, 800]]) {
  await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: width <= 390 ? 3 : 1, mobile: width <= 844 });
  await pause(120);
  const layout = await run(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth, dock: (() => { const item = document.querySelector('.month-dock'); return item && getComputedStyle(item).position; })(), cropHit: (() => { const item = document.querySelector('.crop-surface--editable'); if (!item) return false; item.scrollIntoView({ block: 'center' }); const r = item.getBoundingClientRect(); return !!document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('.crop-surface--editable'); })() }));
  assert.ok(layout.documentWidth <= layout.width + 1, 'horizontal overflow ' + width + 'x' + height);
  assert.equal(layout.cropHit, true);
  layouts.push({ requested: width + 'x' + height, ...layout });
}
summary.checks.mobile = { singleFinger: mobileDragged, pinch: mobilePinched, reset: true, layouts };
console.log('GSAP_MOBILE', JSON.stringify({ gsap: summary.checks.gsap, mobile: summary.checks.mobile }));

await call('Emulation.setTouchEmulationEnabled', { enabled: false });
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await click('.brand');
await until(() => !!document.querySelector('.entry-art__sheet'), 'reduced Landing');
const reducedLanding = await run(() => [...document.querySelectorAll('.entry-art__sheet')].map(item => ({ opacity: getComputedStyle(item).opacity, inlineTransform: item.style.transform, animation: getComputedStyle(item).animationName })));
assert.ok(reducedLanding.every(item => item.opacity === '1' && !item.inlineTransform && item.animation === 'none'));
await click('.entry-page button', '继续编辑');
await until(() => !!document.querySelector('.editor-page'), 'reduced Editor');
await run(() => document.querySelectorAll('.month-nav button')[1].click());
await until(() => document.querySelector('.properties-panel__head h2')?.textContent.includes('2 月'), 'reduced February');
await pause(80);
assert.equal(await run(() => !!document.querySelector('.month-proof-layer--outgoing')), false);
assert.equal(await run(() => document.querySelector('.month-proof-layer--current .calendar-proof')?.getAttribute('aria-label')), 'February 2027 日历预览');
await click('.desktop-nav button', '预览与导出');
await until(() => !!document.querySelector('.review-page'), 'reduced Review');
await click('.set-color-panel__actions button', '为全部月份推荐配色');
await until(() => document.querySelectorAll('.set-color-row').length === 12, 'reduced palette', [], 200);
const reducedPalette = await run(() => [...document.querySelectorAll('.set-color-row')].map(item => ({ opacity: getComputedStyle(item).opacity, transform: item.style.transform })));
assert.ok(reducedPalette.every(item => item.opacity === '1' && !item.transform));
await click('.set-color-sheet .confirm-actions button', '取消');
await click('.page-actions button', '生成整套 12');
await until(() => !!document.querySelector('.export-sheet [role=status]'), 'reduced export status');
const reducedExportStatus = await run(() => document.querySelector('.export-sheet [role=status]')?.textContent);
assert.ok(reducedExportStatus);
await click('.export-sheet button', '取消');
await until(() => !document.querySelector('.export-sheet'), 'reduced export cancel');
summary.checks.reducedMotion = { landingFinal: true, monthFinal: true, paletteFinal: true, exportStatus: reducedExportStatus };
await pause(900);
const beforeConflict = await saved();
const second = await (await fetch('http://127.0.0.1:' + port + '/json/new?' + encodeURIComponent(origin + '/'), { method: 'PUT' })).json();
const ws2 = new WebSocket(second.webSocketDebuggerUrl);
await new Promise(resolve => ws2.addEventListener('open', resolve, { once: true }));
let next2 = 1;
const jobs2 = new Map();
ws2.addEventListener('message', event => {
  const result = JSON.parse(event.data), job = jobs2.get(result.id);
  if (!job) return;
  jobs2.delete(result.id);
  result.error ? job.reject(Error(result.error.message)) : job.resolve(result.result);
});
const call2 = (method, params = {}) => new Promise((resolve, reject) => {
  const id = next2++;
  jobs2.set(id, { resolve, reject });
  ws2.send(JSON.stringify({ id, method, params }));
});
const run2 = async (fn, ...args) => {
  const result = await call2('Runtime.evaluate', { expression: '(' + fn.toString() + ')(' + args.map(JSON.stringify).join(',') + ')', awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
};
await call2('Runtime.enable');
for (let i = 0; i < 80 && !(await run2(() => !!document.querySelector('.entry-page button'))); i++) await pause(100);
await run2(() => [...document.querySelectorAll('.entry-page button')].find(item => item.textContent.includes('继续编辑')).click());
await run2(() => { if (!document.querySelector('.editor-page')) [...document.querySelectorAll('.desktop-nav button')].find(item => item.textContent.includes('编辑月份')).click(); });
for (let i = 0; i < 80 && !(await run2(() => !!document.querySelector('.editor-page'))); i++) await pause(100);
await run2(() => {
  const buttons = [...document.querySelectorAll('.background-controls .quick-colors button')];
  const choice = buttons.find(item => item.getAttribute('aria-pressed') === 'false');
  if (!choice) throw Error('No alternate quick color');
  choice.click();
});
await until(() => !!document.querySelector('[role=alertdialog][aria-label="较新标签页冲突"]'), 'two-tab conflict', [], 120);
const afterConflict = await saved();
assert.ok(afterConflict.project.revision > beforeConflict.project.revision);
assert.ok(await run(() => document.querySelector('[role=alertdialog]')?.textContent.includes('停止编辑和保存')));
summary.checks.twoTab = { olderRevision: beforeConflict.project.revision, newerRevision: afterConflict.project.revision, staleTabBlocked: true };
ws2.close();
const nav = await run(() => {
  const entry = performance.getEntriesByType('navigation')[0];
  return { type: entry?.type, domContentLoadedMs: Math.round(entry?.domContentLoadedEventEnd ?? 0), loadMs: Math.round(entry?.loadEventEnd ?? 0), heapBytes: performance.memory?.usedJSHeapSize ?? null, resourceCount: performance.getEntriesByType('resource').length };
});
summary.checks.performance = nav;
summary.errors = errors;
assert.deepEqual(errors, [], 'browser runtime exceptions');
await writeFile(path.join('qa', 'v1-pre-release-' + port + '.json'), JSON.stringify(summary, null, 2) + '\n');
console.log('REDUCED_CONFLICT_PERF', JSON.stringify({ reduced: summary.checks.reducedMotion, twoTab: summary.checks.twoTab, performance: nav, errors }));
ws.close();
