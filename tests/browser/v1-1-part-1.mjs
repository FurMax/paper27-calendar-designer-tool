import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const origin = 'http://127.0.0.1:4173';
const port = process.env.CDP_PORT ?? '9230';
const tab = await (await fetch('http://127.0.0.1:' + port + '/json/new?' + encodeURIComponent(origin + '/'), { method: 'PUT' })).json();
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
async function run(fn, ...args) { return evaluate('(' + fn.toString() + ')(' + args.map(JSON.stringify).join(',') + ')'); }
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, label, limit = 120) {
  for (let i = 0; i < limit; i++) {
    if (await run(fn)) return;
    await pause(100);
  }
  throw Error('Timed out: ' + label);
}
async function click(selector, text = '') {
  return run((selector, text) => {
    const target = [...document.querySelectorAll(selector)].find(item => !text || item.textContent.includes(text));
    if (!target) throw Error('Missing ' + selector + ' ' + text);
    target.click();
    return target.textContent.trim();
  }, selector, text);
}
async function snapshot(name) {
  if (port !== '9230') return;
  const capture = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile('qa/v1-1-' + name + '.png', Buffer.from(capture.data, 'base64'));
}
await call('Page.enable');
await call('Runtime.enable');
await call('Storage.clearDataForOrigin', { origin, storageTypes: 'indexeddb' });
await call('Page.navigate', { url: origin + '/' });
await until(() => !!document.querySelector('.entry-page input[type=file]'), 'Entry');
const asset = await run(async () => {
  const canvas = document.createElement('canvas');
  canvas.width = 720; canvas.height = 850;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#D2A7AB'; ctx.fillRect(0, 0, 720, 850);
  ctx.fillStyle = '#718B90'; ctx.fillRect(0, 0, 160, 850);
  ctx.fillStyle = '#E6BC7D'; ctx.fillRect(560, 0, 160, 850);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  const transfer = new DataTransfer();
  for (let month = 1; month <= 12; month++) transfer.items.add(new File([blob], 'texture-photo-' + month + '.png', { type: 'image/png' }));
  const input = document.querySelector('.entry-page input[type=file]');
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return blob.size;
});
await until(() => !!document.querySelector('.month-grid'), 'Assign');
await click('.desktop-nav button', '编辑月份');
await until(() => !!document.querySelector('.editor-page .background-controls'), 'Editor');
await until(() => document.querySelectorAll('.monthly-photo-colors__grid button').length === 3, 'photo colors');
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
const hierarchy = await run(() => {
  const rail = document.querySelector('.properties-panel--quick');
  const exportCard = document.querySelector('.editor-deep-section--export');
  const swatches = [...rail.querySelectorAll('.quick-colors button')];
  const railRect = rail.getBoundingClientRect(), proof = document.querySelector('.proof-workspace');
  const proofRect = proof.getBoundingClientRect(), exportRect = exportCard.getBoundingClientRect();
  return {
    railItems: [...rail.querySelectorAll(':scope > section h3')].map(item => item.textContent.trim()),
    rightOfProof: railRect.left >= proofRect.right,
    proofSticky: getComputedStyle(proof).position === 'sticky',
    proofMaxHeight: proofRect.height <= innerHeight - 48 + 1,
    railHasNoBottomGap: railRect.height >= proofRect.height,
    exportAfterRail: exportRect.top >= railRect.bottom,
    commonNoWrap: getComputedStyle(rail.querySelector('.quick-colors')).flexWrap === 'nowrap',
    commonScroll: rail.querySelector('.quick-colors').scrollWidth > rail.querySelector('.quick-colors').clientWidth,
    compactHeight: rail.querySelector('.background-controls--compact').getBoundingClientRect().height,
    swatches: swatches.length,
    visibleLabels: swatches.filter(item => !!item.querySelector('small')).length,
    tooltip: swatches[0].dataset.tooltip,
    roundSwatch: getComputedStyle(swatches[0]).borderRadius === '50%' && getComputedStyle(swatches[0].querySelector('span')).borderRadius === '50%' && Math.abs(swatches[0].getBoundingClientRect().width - swatches[0].getBoundingClientRect().height) < 1,
    roundPhoto: getComputedStyle(rail.querySelector('.monthly-photo-colors__grid button>span')).borderRadius === '50%',
    precisionInRail: !!rail.querySelector('input[aria-label="背景色 HEX"]'),
    customToggle: !!rail.querySelector('.palette-custom-toggle[aria-expanded="false"]'),
    currentCard: !!rail.querySelector('.color-current'),
    textColorInRail: !!rail.querySelector('.text-color-section .segmented'),
    styleInRail: !!rail.querySelector('.editor-deep-section--style'),
    datesInRail: !!rail.querySelector('.editor-deep-section--dates'),
    exportInRail: !!rail.querySelector('input[name="editor-export-format"]'),
    exportBelow: !!exportCard.querySelector('input[name="editor-export-format"]'),
    paletteEntryBelow: !!exportCard.querySelector('.editor-set-palette-link button'),
    oldLowerCards: !!document.querySelector('.editor-deep-upper'),
  };
});
assert.deepEqual(hierarchy.railItems, ['照片','背景色','文字颜色 · 当前月份','样式设置','日期设置']);
assert.equal(hierarchy.rightOfProof, true);
assert.equal(hierarchy.proofSticky, true);
assert.equal(hierarchy.proofMaxHeight, true);
assert.equal(hierarchy.railHasNoBottomGap, true);
assert.equal(hierarchy.exportAfterRail, true);
assert.equal(hierarchy.commonNoWrap, true);
assert.equal(hierarchy.commonScroll, true);
assert.ok(hierarchy.compactHeight <= 200);
assert.equal(hierarchy.swatches, 10);
assert.equal(hierarchy.visibleLabels, 0);
assert.equal(hierarchy.tooltip, '奶油白 · #F7F4EE');
assert.equal(hierarchy.roundSwatch, true);
assert.equal(hierarchy.roundPhoto, true);
assert.equal(hierarchy.precisionInRail, false);
assert.equal(hierarchy.customToggle, true);
assert.equal(hierarchy.currentCard, false);
assert.equal(hierarchy.textColorInRail, true);
assert.equal(hierarchy.styleInRail, true);
assert.equal(hierarchy.datesInRail, true);
assert.equal(hierarchy.exportInRail, false);
assert.equal(hierarchy.exportBelow, true);
assert.equal(hierarchy.paletteEntryBelow, true);
assert.equal(hierarchy.oldLowerCards, false);
await click('.properties-panel--quick .palette-sample-trigger');
await until(() => !!document.querySelector('.photo-sample-sheet'), 'precise photo sample');
await click('.photo-sample-sheet .sheet-heading button');
await until(() => !document.querySelector('.photo-sample-sheet'), 'photo sampler closed');
await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
const keyboardTooltip = await run(() => {
  const swatch = document.querySelector('.properties-panel--quick .quick-colors button');
  swatch.focus();
  return { focused: document.activeElement === swatch, focusVisible: swatch.matches(':focus-visible'), content: getComputedStyle(swatch, '::before').content };
});
assert.equal(keyboardTooltip.focused, true);
assert.equal(keyboardTooltip.focusVisible, true);
assert.ok(keyboardTooltip.content.includes('奶油白'));
await click('.properties-panel--quick .palette-custom-toggle');
assert.equal(await run(() => !!document.querySelector('.properties-panel--quick input[aria-label="背景色 HEX"]') && document.querySelector('.properties-panel--quick .palette-custom-toggle').getAttribute('aria-expanded') === 'true'), true);
await click('.properties-panel--quick .palette-custom-toggle');
assert.equal(await run(() => !document.querySelector('.properties-panel--quick input[aria-label="背景色 HEX"]') && document.querySelector('.properties-panel--quick .palette-custom-toggle').getAttribute('aria-expanded') === 'false'), true);
await snapshot('editor-hierarchy-first-screen');
await run(() => window.scrollTo(0, 450));
await pause(100);
assert.equal(await run(() => Math.round(document.querySelector('.proof-workspace').getBoundingClientRect().top)), 24);
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 600, deviceScaleFactor: 1, mobile: false });
assert.equal(await run(() => document.querySelector('.proof-workspace').getBoundingClientRect().height <= innerHeight - 48 + 1), true);
await call('Emulation.setDeviceMetricsOverride', { width: 1023, height: 900, deviceScaleFactor: 1, mobile: false });
const stacked = await run(() => {
  const proof = document.querySelector('.proof-workspace');
  const rail = document.querySelector('.properties-panel--quick');
  return { position: getComputedStyle(proof).position, railBelow: rail.getBoundingClientRect().top >= proof.getBoundingClientRect().bottom, order: [...rail.querySelectorAll(':scope > section h3')].map(item => item.textContent.trim()) };
});
assert.equal(stacked.position, 'static');
assert.equal(stacked.railBelow, true);
assert.deepEqual(stacked.order, hierarchy.railItems);
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await run(() => window.scrollTo(0, 0));
const colors = await run(() => [...document.querySelectorAll('.quick-colors button')].map(item => ({
  name: item.dataset.tooltip.split(' · ')[0], color: item.dataset.tooltip.split(' · ')[1],
})));
assert.deepEqual(colors.map(item => item.color), ['#F7F4EE','#E6EBE8','#E9E1D3','#CFE8D6','#BFD1C3','#B7D7F2','#95A8C7','#F3EEA4','#F4C7C3','#D9C7EB']);
assert.equal(new Set(colors.map(item => item.name)).size, 10);
await click('.quick-colors button[data-tooltip^="Baby Blue"]');
await until(() => document.querySelector('.calendar-proof')?.style.getPropertyValue('--proof-background') === '#B7D7F2', 'common color applied');
await until(() => {
  const strip = document.querySelector('.properties-panel--quick .quick-colors');
  const selected = strip?.querySelector('button[aria-pressed="true"]');
  if (!selected) return false;
  const area = strip.getBoundingClientRect(), item = selected.getBoundingClientRect();
  return item.left >= area.left - 1 && item.right <= area.right + 1;
}, 'selected common swatch visible');
const common = await run(() => ({
  color: document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-background'),
  ink: document.querySelector('.calendar-proof')?.style.getPropertyValue('--proof-ink'),
  pressed: document.querySelector('.quick-colors button[data-tooltip="Baby Blue · #B7D7F2"]')?.getAttribute('aria-pressed'),
}));
assert.equal(common.color, '#B7D7F2');
assert.equal(common.ink, '#18201D');
assert.equal(common.pressed, 'true');
await click('.text-color-section .segmented button', '自定义');
assert.equal(await run(() => !!document.querySelector('.text-color-section input[aria-label="文字颜色 HEX"]')), true);
await click('.properties-panel--quick .palette-custom-toggle');
await run(() => {
  const input = document.querySelector('.properties-panel--quick input[aria-label="背景色 HEX"]');
  input.focus();
  input.select();
});
await call('Input.insertText', { text: '#18201D' });
await pause(80);
await run(() => document.querySelector('.properties-panel--quick input[aria-label="背景色 HEX"]').blur());
await until(() => document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-background') === '#18201D', 'custom background applied');
await until(() => !!document.querySelector('.text-color-section .contrast-warning'), 'contrast warning after dark background');
assert.equal(await run(() => document.querySelector('.text-color-section').lastElementChild.classList.contains('text-color-controls') && document.querySelector('.text-color-section .contrast-warning')?.textContent.includes('对比度较低')), true);
await click('.quick-colors button[data-tooltip^="奶油白"]');
await until(() => !document.querySelector('.text-color-section .contrast-warning'), 'contrast warning removed after light background');
await click('.text-color-section .segmented button', '自动');
await click('.quick-colors button[data-tooltip^="Baby Blue"]');
await click('.properties-panel--quick .palette-custom-toggle');
const suggestions = await run(() => [...document.querySelectorAll('.monthly-photo-colors__grid button')].map(item => ({
  label: item.dataset.tooltip.split(' · ')[0], hex: item.dataset.tooltip.split(' · ')[1],
})));
assert.deepEqual(suggestions.map(item => item.label), ['主色','搭配色','点缀色']);
assert.equal(new Set(suggestions.map(item => item.hex)).size, 3);
await click('.monthly-photo-colors__grid button:nth-child(2)');
await until(() => document.querySelector('.monthly-photo-colors__grid button:nth-child(2)')?.getAttribute('aria-pressed') === 'true', 'photo recommendation selected');
await click('.quick-colors button[data-tooltip^="Baby Blue"]');
const options = await run(() => [...document.querySelectorAll('.editor-setting .texture-controls .texture-options button')].map(item => item.textContent.trim()));
assert.deepEqual(options, ['清除','细横线','浅网格','波浪格','细点阵','纸张肌理']);
const textureLayout = await run(() => {
  const strip = document.querySelector('.editor-setting .texture-options');
  const thumb = strip.querySelector('.texture-thumb');
  thumb.focus();
  return {
    noWrap: getComputedStyle(strip).flexWrap === 'nowrap',
    height: strip.getBoundingClientRect().height,
    thumbWidth: thumb.getBoundingClientRect().width,
    thumbHeight: thumb.getBoundingClientRect().height,
    tooltip: getComputedStyle(thumb, '::after').content,
    hiddenLabel: getComputedStyle(thumb.querySelector('.visually-hidden')).position === 'absolute',
  };
});
assert.equal(textureLayout.noWrap, true);
assert.ok(textureLayout.height <= 52);
assert.equal(textureLayout.thumbWidth, 40);
assert.equal(textureLayout.thumbHeight, 40);
assert.ok(textureLayout.tooltip.includes('细横线'));
assert.equal(textureLayout.hiddenLabel, true);
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await run(() => window.scrollTo(0, 520));
await pause(120);
await snapshot('editor-desktop');
await run(() => window.scrollTo(0, 1080));
await pause(120);
await snapshot('editor-deep-desktop');
await run(() => document.querySelector('.editor-deep-section--export').scrollIntoView({ block: 'center' }));
await pause(120);
await snapshot('editor-export-desktop');
await run(() => {
  const original = URL.createObjectURL.bind(URL);
  window.__v11Exports = [];
  URL.createObjectURL = blob => {
    if (blob.type === 'image/png' || blob.type === 'image/jpeg' || blob.type.includes('zip')) window.__v11Exports.push(blob);
    return original(blob);
  };
});
async function exportSingle(variant, format) {
  await run((variant, format) => {
    document.querySelector('input[name=editor-export-variant][value=' + variant + ']').click();
    document.querySelector('input[name=editor-export-format][value=' + format + ']').click();
  }, variant, format);
  await click('.editor-deep-section--export button', '生成本月 ' + format.toUpperCase());
  await until(() => document.querySelector('.single-export-status')?.textContent.includes('已准备好'), 'single export ready');
  const result = await run(async () => {
    let blob, image;
    for (const candidate of [...window.__v11Exports].reverse()) {
      const decoded = await createImageBitmap(candidate);
      if (decoded.width === 1200 || decoded.width === 1252) { blob = candidate; image = decoded; break; }
      decoded.close();
    }
    if (!blob || !image) throw Error('Rendered calendar Blob missing');
    const canvas = document.createElement('canvas');
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0); image.close();
    const hash = (x, y, w, h) => {
      const data = ctx.getImageData(x, y, w, h).data;
      let value = 2166136261;
      for (let i = 0; i < data.length; i++) value = Math.imul(value ^ data[i], 16777619) >>> 0;
      return value;
    };
    return {
      type: blob.type, size: blob.size, width: canvas.width, height: canvas.height,
      photoHash: hash(220, 200, 100, 100),
      calendarHash: hash(600, 1080, 200, 100),
      bottomBleedHash: canvas.height > 1800 ? hash(500, canvas.height - 30, 200, 20) : null,
      photoTopHash: hash(220, 0, 100, 20),
    };
  });
  await click('.single-export-status button', '关闭');
  return result;
}
const baseline = await exportSingle('digital', 'png');
const textureResults = {};
for (const name of ['细横线','浅网格','波浪格','细点阵','纸张肌理']) {
  await click('.editor-setting .texture-controls .texture-options button', name);
  const preview = await run(() => ({
    texture: document.querySelector('.month-proof-layer--current .calendar-proof__dates')?.dataset.texture,
    image: getComputedStyle(document.querySelector('.month-proof-layer--current .calendar-proof__dates')).backgroundImage,
    photoImage: getComputedStyle(document.querySelector('.month-proof-layer--current .calendar-proof__photo')).backgroundImage,
    selected: [...document.querySelectorAll('.editor-setting .texture-controls .texture-options button')].filter(item => item.getAttribute('aria-pressed') === 'true').length,
  }));
  assert.equal(preview.selected, 1);
  assert.ok(preview.image.startsWith('url('), name + ' missing preview tile');
  assert.ok(!preview.photoImage.includes('data:image'), name + ' overlaid the photo');
  const output = await exportSingle('digital', 'png');
  assert.equal(output.photoHash, baseline.photoHash, name + ' changed photo pixels');
  assert.notEqual(output.calendarHash, baseline.calendarHash, name + ' missing from export');
  textureResults[name] = { preview: preview.texture, calendarHash: output.calendarHash };
}
assert.equal(new Set(Object.values(textureResults).map(item => item.calendarHash)).size, 5);
const printPng = await exportSingle('print', 'png');
if (port === '9230') {
  const dataUrl = await run(async () => {
    for (const blob of [...window.__v11Exports].reverse()) {
      if (blob.type !== 'image/png') continue;
      const bitmap = await createImageBitmap(blob);
      const matches = bitmap.width === 1252;
      bitmap.close();
      if (!matches) continue;
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    }
    throw Error('Print PNG sample missing');
  });
  await writeFile('qa/v1-1-paper-print-sample.png', Buffer.from(dataUrl.split(',')[1], 'base64'));
}

assert.equal(printPng.width, 1252);
assert.equal(printPng.height, 1843);
const printJpg = await exportSingle('print', 'jpg');
assert.equal(printJpg.type, 'image/jpeg');
assert.equal(printJpg.width, 1252);
const digitalJpg = await exportSingle('digital', 'jpg');
assert.equal(digitalJpg.width, 1200);
assert.equal(digitalJpg.height, 1800);
await click('.editor-setting .texture-controls .texture-options button', '清除');
const plainPrint = await exportSingle('print', 'png');
assert.notEqual(printPng.bottomBleedHash, plainPrint.bottomBleedHash, 'print bleed lacks texture');
await click('.editor-setting .texture-controls .texture-options button', '纸张肌理');
await pause(800);
await call('Page.reload', { ignoreCache: false });
await until(() => !!document.querySelector('.entry-page button'), 'Entry after reload');
await click('.entry-page button', '继续编辑');
await until(() => !!document.querySelector('.editor-page .editor-setting .texture-controls'), 'restored editor');
const restored = await run(() => ({
  texture: document.querySelector('.month-proof-layer--current .calendar-proof__dates')?.dataset.texture,
  color: document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-background'),
  selected: [...document.querySelectorAll('.editor-setting .texture-controls .texture-options button')].find(item => item.getAttribute('aria-pressed') === 'true')?.textContent.trim(),
}));
assert.equal(restored.texture, 'paper');
assert.equal(restored.selected, '纸张肌理');
assert.equal(restored.color, '#B7D7F2');
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await until(() => getComputedStyle(document.querySelector('.mobile-style-trigger')).display !== 'none', 'phone UI');
await click('.mobile-style-trigger', '背景色与推荐色');
await until(() => !!document.querySelector('.action-sheet .quick-colors'), 'phone quick sheet');
const mobile = await run(() => ({
  colors: document.querySelectorAll('.action-sheet .quick-colors button').length,
  textures: document.querySelectorAll('.editor-setting .texture-controls .texture-options button').length,
  precisionInSheet: !!document.querySelector('.action-sheet input[aria-label="背景色 HEX"]'),
  customToggle: !!document.querySelector('.action-sheet .palette-custom-toggle[aria-expanded="false"]'),
  selected: [...document.querySelectorAll('.editor-setting .texture-controls .texture-options button')].find(item => item.getAttribute('aria-pressed') === 'true')?.textContent.trim(),
  overflow: document.documentElement.scrollWidth > innerWidth,
}));
assert.equal(mobile.colors, 10);
assert.equal(mobile.textures, 6);
assert.equal(mobile.precisionInSheet, false);
assert.equal(mobile.customToggle, true);
await click('.action-sheet .palette-custom-toggle');
assert.equal(await run(() => !!document.querySelector('.action-sheet input[aria-label="背景色 HEX"]')), true);
await click('.action-sheet .palette-custom-toggle');
assert.equal(await run(() => !!document.querySelector('.action-sheet input[aria-label="背景色 HEX"]')), false);
await click('.action-sheet .palette-custom-toggle');
await snapshot('editor-color-sheet-phone');
assert.equal(mobile.selected, '纸张肌理');
assert.equal(mobile.overflow, false);
const mobileRound = await run(() => {
  const circle = document.querySelector('.action-sheet .quick-colors button');
  return getComputedStyle(circle).borderRadius === '50%' && getComputedStyle(circle.querySelector('span')).borderRadius === '50%' && Math.abs(circle.getBoundingClientRect().width - circle.getBoundingClientRect().height) < 1;
});
assert.equal(mobileRound, true);
await call('Emulation.setDeviceMetricsOverride', { width: 320, height: 700, deviceScaleFactor: 1, mobile: true });
const mobileNarrow = await run(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, noWrap: getComputedStyle(document.querySelector('.action-sheet .quick-colors')).flexWrap === 'nowrap' }));
assert.equal(mobileNarrow.overflow, false);
assert.equal(mobileNarrow.noWrap, true);
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await click('.action-sheet .sheet-heading button', '');
await run(() => document.querySelector('.editor-deep-section--style').scrollIntoView());
await pause(120);
await snapshot('texture-phone');
await click('.phone-month-select__review', '预览');
await until(() => !!document.querySelector('.review-page .review-grid'), 'Review with texture');
const review = await run(() => ({
  completion: document.querySelector('.review-completion')?.textContent.trim(),
  firstTexture: document.querySelector('.review-card[data-month="1"] .calendar-proof__dates')?.dataset.texture,
}));
assert.ok(review.completion.includes('12 / 12'));
assert.equal(review.firstTexture, 'paper');
await run(() => {
  const original = URL.createObjectURL.bind(URL);
  window.__v11Exports = [];
  URL.createObjectURL = blob => {
    if (blob.type.includes('zip')) window.__v11Exports.push(blob);
    return original(blob);
  };
});

await click('.page-actions button', '生成整套 12 张');
await until(() => !!document.querySelector('.export-sheet .export-success'), 'textured full-set ZIP', 220);
const fullSet = await run(async () => {
  const blob = [...window.__v11Exports].reverse().find(item => item.type.includes('zip'));
  if (!blob) throw Error('Full-set ZIP Blob missing');
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer);
  const names = [];
  for (let i = 0; i < bytes.length - 46; i++) {
    if (view.getUint32(i, true) !== 0x02014b50) continue;
    const length = view.getUint16(i + 28, true);
    const extra = view.getUint16(i + 30, true);
    const comment = view.getUint16(i + 32, true);
    names.push(new TextDecoder().decode(bytes.subarray(i + 46, i + 46 + length)));
    i += 45 + length + extra + comment;
  }
  return { size: bytes.length, names };
});
assert.equal(fullSet.names.length, 12);
assert.equal(fullSet.names[0], '01-January-2027-Print-106x156mm.png');
assert.equal(fullSet.names[11], '12-December-2027-Print-106x156mm.png');
const summary = { port, assetBytes: asset, hierarchy, keyboardTooltip, textureLayout, mobileRound, mobileNarrow, colors, common, suggestions, options, baseline, textureResults, printPng, printJpg, digitalJpg, restored, mobile, review, fullSet, errors };
assert.deepEqual(errors, []);
await writeFile('qa/v1-1-part-1-' + port + '.json', JSON.stringify(summary, null, 2));
console.log('V1.1_PART1_PASS', JSON.stringify({ port, textures: Object.keys(textureResults), restored, mobile, errors }));
ws.close();
await fetch('http://127.0.0.1:' + port + '/json/close/' + tab.id);
