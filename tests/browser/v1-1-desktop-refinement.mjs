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

for (const width of [1280, 1440, 1920]) {
  await call('Emulation.setDeviceMetricsOverride', { width, height:800, deviceScaleFactor:1, mobile:false });
  await run(() => window.scrollTo(0,0));
  await pause(260);
  const m = await run(() => {
    const q = s => document.querySelector(s);
    const rect = s => { const r=q(s).getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; };
    const style = s => getComputedStyle(q(s));
    const nav = rect('.month-nav'), rail=rect('.properties-panel--quick'), canvas=rect('.proof-workspace'), art=rect('.month-proof-stage'), exportCard=rect('.editor-deep-section--export');
    const common=q('.properties-panel--quick .quick-colors'), swatch=common.querySelector('button'), texture=q('.texture-options'), tile=texture.querySelector('button.texture-thumb');
    return {
      viewport:innerWidth, documentWidth:document.documentElement.scrollWidth, nav, rail, canvas, art, exportCard, caption:rect('.proof-caption'), photoSection:rect('.photo-controls-desktop'),
      pagePadding:parseFloat(style('.editor-page').paddingLeft),
      proofSticky:style('.editor-preview-column').position,
      proofTop:style('.editor-preview-column').top,
      canvasPadding:parseFloat(style('.proof-workspace').paddingLeft),
      canvasBackground:style('.proof-workspace').backgroundColor,
      canvasBorder:style('.proof-workspace').borderWidth,
      canvasShadow:style('.proof-workspace').boxShadow,
      artShadow:style('.calendar-proof').boxShadow,
      artBorder:style('.calendar-proof').borderWidth,
      gridImage:style('.proof-workspace').backgroundImage,
      gridSize:style('.proof-workspace').backgroundSize,
      gridOverlay:getComputedStyle(q('.proof-workspace'),'::before').content,
      captionOutside:!q('.proof-workspace').contains(q('.proof-caption')),
      captionBelow:rect('.proof-caption').y >= canvas.y+canvas.height,
      railSections:[...q('.properties-panel--quick').querySelectorAll(':scope > section h3')].map(item=>item.textContent.trim()),
      commonWrap:getComputedStyle(common).flexWrap, commonScroll:common.scrollWidth>common.clientWidth,
      swatchSize:swatch.getBoundingClientRect().width,
      textureHeaderClear:!!q('.texture-field-header .texture-clear'),
      textureCount:texture.querySelectorAll('button.texture-thumb').length,
      desktopMobileClearHidden:getComputedStyle(texture.querySelector('.texture-clear--mobile')).display==='none',
      textureSize:tile.getBoundingClientRect().width,
      fontHeight:q('.font-options button').getBoundingClientRect().height,
      scaleHeight:q('.scale-options button').getBoundingClientRect().height,
      dateSize:q('.important-controls__grid button').getBoundingClientRect().width,
      exportRightWidth:rect('.editor-set-palette-link').width,
      exportTitleSize:parseFloat(style('.editor-deep-section__head h2').fontSize),
      exportShadow:style('.editor-deep-section--export').boxShadow,
      selectedMonthBackground:style('.month-nav button.is-current').backgroundColor,
      selectedMonthShadow:style('.month-nav button.is-current').boxShadow,
      selectedFontBackground:style('.font-options button.is-current').backgroundColor,
      selectedExportBackground:style('.export-variants label.is-current').backgroundColor,
      primaryText:style('.editor-export-button').color,
      primaryBackground:style('.editor-export-button').backgroundColor,
      firstSectionVisible:rect('.photo-controls-desktop').y < innerHeight
    };
  });
  assert.equal(m.documentWidth<=m.viewport,true,'horizontal overflow at '+width);
  assert.equal(m.nav.height,56);
  assert.equal(m.rail.width,320);
  assert.equal(m.pagePadding,24);
  assert.equal(m.proofSticky,'sticky');
  assert.equal(m.proofTop,'24px');
  assert.equal(m.canvasPadding,48);
  assert.equal(m.canvasBackground,'rgb(247, 249, 252)');
  assert.equal(m.canvasBorder,'0px');
  assert.equal(m.canvasShadow,'none');
  assert.notEqual(m.artShadow,'none');
  assert.equal(m.artBorder,'1px');
  assert.equal(m.gridSize,'24px 24px, 24px 24px');
  assert.ok(m.gridImage.includes('rgba(108, 132, 164, 0.055)'));
  assert.equal(m.gridOverlay,'none');
  assert.equal(m.captionOutside,true);
  assert.equal(m.captionBelow,true);
  assert.ok(Math.abs(m.art.height-576)<2,'artwork height at '+width+': '+m.art.height);
  assert.deepEqual(m.railSections,['照片与颜色','背景色','文字颜色 · 当前月份','样式设置','日期设置']);
  assert.equal(m.commonWrap,'wrap');
  assert.equal(m.commonScroll,false);
  assert.equal(m.swatchSize,28);
  assert.equal(m.textureHeaderClear,true);
  assert.equal(m.textureCount,5);
  assert.equal(m.desktopMobileClearHidden,true);
  assert.equal(m.textureSize,40);
  assert.equal(m.fontHeight,64);
  assert.equal(m.scaleHeight,56);
  assert.equal(m.dateSize,32);
  assert.equal(m.exportRightWidth,360);
  assert.equal(m.exportShadow,'none');
  assert.equal(m.selectedMonthBackground,'rgb(234, 243, 255)');
  assert.equal(m.selectedMonthShadow,'none');
  assert.equal(m.selectedFontBackground,'rgb(234, 243, 255)');
  assert.equal(m.selectedExportBackground,'rgb(234, 243, 255)');
  assert.equal(m.primaryText,'rgb(255, 255, 255)');
  assert.equal(m.primaryBackground,'rgb(23, 50, 74)');
  assert.equal(m.firstSectionVisible,true);
  console.log('DESKTOP_GEOMETRY',JSON.stringify({width,nav:m.nav.height,rail:m.rail.width,canvas:m.canvas,art:m.art,exportRight:m.exportRightWidth}));
}
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:800,deviceScaleFactor:1,mobile:false});
await run(() => window.scrollTo(0,500));
await pause(100);
const stickyTop=await run(() => Math.round(document.querySelector('.editor-preview-column').getBoundingClientRect().top));
assert.equal(stickyTop,24);
const crop=await run(() => {const r=document.querySelector('.crop-surface--editable').getBoundingClientRect();return {x:r.x+r.width*.5,y:r.y+r.height*.5};});
const gridBeforeDrag=await run(() => getComputedStyle(document.querySelector('.proof-workspace')).backgroundImage);
await call('Input.dispatchMouseEvent',{type:'mousePressed',x:crop.x,y:crop.y,button:'left',clickCount:1});
await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:crop.x+12,y:crop.y-10,button:'left',buttons:1});
await pause(240);
assert.equal(await run(() => getComputedStyle(document.querySelector('.proof-workspace')).backgroundImage),gridBeforeDrag);
await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:crop.x+12,y:crop.y-10,button:'left',clickCount:1});
await pause(240);
assert.equal(await run(() => getComputedStyle(document.querySelector('.proof-workspace')).backgroundImage),gridBeforeDrag);
if(port==='9230'){
  const capture=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  await writeFile('qa/v1-1-desktop-refinement-editor.png',Buffer.from(capture.data,'base64'));
}
await run(() => document.querySelector('.editor-deep-section--export').scrollIntoView({block:'center'}));
await pause(100);
assert.equal(await run(() => document.querySelector('.editor-deep-section--export').getBoundingClientRect().top<innerHeight),true);
if(port==='9230'){
  const capture=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  await writeFile('qa/v1-1-desktop-refinement-export.png',Buffer.from(capture.data,'base64'));
}
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
const mobileTexture=await run(() => ({ header:getComputedStyle(document.querySelector('.texture-field-header')).display, clear:getComputedStyle(document.querySelector('.texture-options .texture-clear--mobile')).display, count:document.querySelectorAll('.texture-options button').length, overflow:document.documentElement.scrollWidth>innerWidth, workspace:getComputedStyle(document.querySelector('.proof-workspace')).backgroundColor, grid:getComputedStyle(document.querySelector('.proof-workspace')).backgroundSize, artBorder:getComputedStyle(document.querySelector('.calendar-proof')).borderWidth }));
assert.equal(mobileTexture.header,'none');
assert.notEqual(mobileTexture.clear,'none');
assert.equal(mobileTexture.count,6);
assert.equal(mobileTexture.overflow,false);
assert.equal(mobileTexture.workspace,'rgb(247, 249, 252)');
assert.equal(mobileTexture.grid,'24px 24px, 24px 24px');
assert.equal(mobileTexture.artBorder,'1px');
assert.deepEqual(errors,[]);
console.log('DESKTOP_REFINEMENT_PASS',JSON.stringify({port,stickyTop,grid: gridBeforeDrag,errors}));
ws.close();
