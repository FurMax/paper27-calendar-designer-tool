import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const base = 'http://127.0.0.1:5173/';
const targets = await (await fetch('http://127.0.0.1:9227/json/list')).json();
const target = targets.find(item => item.type === 'page' && item.url.startsWith('http://127.0.0.1:5173'));
assert.ok(target, 'isolated Chrome tab missing');
const ws = new WebSocket(target.webSocketDebuggerUrl);
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
  const id = sequence++; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const response = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
  return response.result.value;
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

await call('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:5173', storageTypes: 'indexeddb' });
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await call('Page.navigate', { url: base });
await pause(700);
await evaluate("(()=>{[...document.querySelectorAll('.entry-page button')].find(x=>x.textContent.includes('逐月添加照片')).click();return true;})()");
await pause(200);
await evaluate("(()=>{[...document.querySelectorAll('.desktop-nav button')].find(x=>x.textContent.includes('编辑月份')).click();return true;})()");
await pause(650);
const imported = await evaluate(`(async()=>{
  const canvas=document.createElement('canvas');canvas.width=400;canvas.height=400;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#FF0000';ctx.fillRect(0,0,200,400);
  ctx.fillStyle='#0000FF';ctx.fillRect(200,0,200,400);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  const dt=new DataTransfer();dt.items.add(new File([blob],'sample-blocks.png',{type:'image/png'}));
  const input=document.querySelector('.editor-page input[type=file]');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));
  await new Promise(resolve=>setTimeout(resolve,600));
  return {ready:document.querySelector('.status-pill')?.textContent,route:location.pathname};
})()`);
assert.equal(imported.ready, '已就绪');
const defaultVariant = await evaluate("(()=>({print:document.querySelector('input[name=editor-export-variant][value=print]')?.checked,detail:document.querySelector('.export-variants')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth}))()");
assert.equal(defaultVariant.print, true);
assert.ok(defaultVariant.detail.includes('106 × 156 mm'));
assert.equal(defaultVariant.overflow, false);
await evaluate("(()=>{[...document.querySelectorAll('.mobile-style-trigger')].find(x=>x.textContent.trim()==='背景色').click();return true;})()");
await pause(100);
const sampleButton = await evaluate("(()=>{const b=document.querySelector('.action-sheet .sample-color-trigger');return {label:b?.textContent,rect:b?.getBoundingClientRect().toJSON()};})()");
assert.ok(sampleButton.label.includes('从照片取色'));
await evaluate("(()=>{document.querySelector('.action-sheet .sample-color-trigger').click();return true;})()");
await pause(350);
const frame = await evaluate("(()=>{const f=document.querySelector('.photo-sample__frame'),r=f.getBoundingClientRect();return {rect:r.toJSON(),sheet:document.querySelector('.photo-sample-sheet').getBoundingClientRect().toJSON(),overflow:document.documentElement.scrollWidth>innerWidth};})()");
assert.equal(frame.overflow, false);
assert.ok(frame.sheet.left >= 0 && frame.sheet.right <= 390);
assert.ok(frame.rect.width > 200);
const touchX = Math.round(frame.rect.left + frame.rect.width * 0.25);
const touchY = Math.round(frame.rect.top + frame.rect.height * 0.5);
await call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: touchX, y: touchY, id: 1 }] });
await call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await pause(80);
const sampled = await evaluate("document.querySelector('.photo-sample__result strong')?.textContent");
assert.equal(sampled, '#FF0000');
const samplerShot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await writeFile('qa/session07-photo-sample-mobile.png', Buffer.from(samplerShot.data, 'base64'));
await evaluate("(()=>{[...document.querySelectorAll('.photo-sample__actions button')].find(x=>x.textContent.includes('使用此颜色')).click();return true;})()");
await pause(80);
const applied = await evaluate("(()=>({color:document.querySelector('.action-sheet .color-current strong')?.textContent,proof:document.querySelector('.calendar-proof')?.style.getPropertyValue('--proof-background')}))()");
assert.equal(applied.color, '#FF0000');
assert.equal(applied.proof, '#FF0000');
await evaluate("(()=>{document.querySelector('.action-sheet .sheet-cancel').click();return true;})()");

await pause(650);
const exported = await evaluate(`(async()=>{
  const state=await (await import('/src/persistence/indexedDb.ts')).loadProject();
  const {renderMonthPng}=await import('/src/export/canvasRenderer.ts');
  const digital=await renderMonthPng(state,1,'digital');
  const print=await renderMonthPng(state,1,'print');
  const bytes=new Uint8Array(await print.blob.arrayBuffer());
  const view=new DataView(bytes.buffer);
  const bitmap=await createImageBitmap(print.blob);
  const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0);bitmap.close();
  const sample=(x,y)=>[...ctx.getImageData(x,y,1,1).data];
  return {digital:{name:digital.fileName,bytes:digital.blob.size,head:[...new Uint8Array(await digital.blob.slice(16,24).arrayBuffer())]},
    print:{name:print.fileName,bytes:print.blob.size,width:view.getUint32(16),height:view.getUint32(20),chunk:String.fromCharCode(...bytes.subarray(37,41)),ppm:view.getUint32(41),
      corners:[sample(0,0),sample(1251,0),sample(0,1842),sample(1251,1842)],photoLeft:sample(0,500),photoRight:sample(1251,500),trimLeft:sample(35,500),calendar:sample(600,1800)}};
})()`);
assert.deepEqual(exported.digital.head, [0, 0, 4, 176, 0, 0, 7, 8]);
assert.equal(exported.print.width, 1252);
assert.equal(exported.print.height, 1843);
assert.equal(exported.print.chunk, 'pHYs');
assert.equal(exported.print.ppm, 11811);
for (const color of exported.print.corners) assert.equal(color[3], 255);
assert.deepEqual(exported.print.photoLeft, [255, 0, 0, 255]);
assert.deepEqual(exported.print.photoRight, [0, 0, 255, 255]);
assert.deepEqual(exported.print.calendar, [255, 0, 0, 255]);

const batch = await evaluate("(async()=>{const project=await import('/src/domain/project.ts');const renderer=await import('/src/export/canvasRenderer.ts');const controller=await import('/src/export/exportController.ts');const zipper=await import('/src/export/zip.ts');const canvas=document.createElement('canvas');canvas.width=400;canvas.height=400;const ctx=canvas.getContext('2d');ctx.fillStyle='#3457D5';ctx.fillRect(0,0,400,400);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));const state=project.createEmptyProject('print-batch');state.assets.a={id:'a',blob,mime:'image/png',fileName:'flat.png',byteSize:blob.size,decodedWidth:400,decodedHeight:400,importedAt:''};for(let month=1;month<=12;month++){const id='i'+month;state.project.photoItems[id]={id,assetId:'a',createdAt:''};state.project.months[month].photoItemId=id;state.project.months[month].crop={zoom:1,offsetX:0,offsetY:0};}const files=await controller.renderFullSet(state,()=>{},undefined,(snapshot,month)=>renderer.renderMonthPng(snapshot,month,'print'));const details=await Promise.all(files.map(async file=>{const head=new Uint8Array(await file.blob.slice(0,54).arrayBuffer());const view=new DataView(head.buffer);return {name:file.fileName,width:view.getUint32(16),height:view.getUint32(20),phys:String.fromCharCode(...head.subarray(37,41))};}));const zip=new Uint8Array(await (await zipper.packagePngZip(files)).arrayBuffer());return {details,zipEntries:new DataView(zip.buffer).getUint16(zip.length-12,true),zipBytes:zip.length};})()");
assert.equal(batch.details.length, 12);
assert.equal(batch.zipEntries, 12);
assert.ok(batch.details.every((file, index) => file.name.startsWith(String(index + 1).padStart(2, '0') + '-') && file.width === 1252 && file.height === 1843 && file.phys === 'pHYs'));
console.log('print batch', { entries: batch.zipEntries, bytes: batch.zipBytes });
for (const width of [390, 320]) {
  await call('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 3, mobile: true });
  await pause(80);
  const layout = await evaluate("(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,proof:document.querySelector('.calendar-proof').getBoundingClientRect().toJSON(),print:document.querySelector('.export-variants').getBoundingClientRect().toJSON()}))()");
  assert.equal(layout.scroll, width);
  assert.ok(layout.proof.right <= width && layout.proof.left >= 0);
  await evaluate("(()=>{[...document.querySelectorAll('.mobile-style-trigger')].find(x=>x.textContent.includes('日历文字')).click();return true;})()");
  await pause(70);
  const sizes = [];
  for (const label of ['小', '标准', '大']) {
    await evaluate("(()=>{[...document.querySelectorAll('.action-sheet .scale-options button')].find(x=>x.querySelector('span')?.textContent===" + JSON.stringify(label) + ").click();return true;})()");
    await pause(80);
    sizes.push(await evaluate("parseFloat(getComputedStyle(document.querySelector('.calendar-proof__title')).fontSize)"));
    await pause(40);
  }
  assert.ok(sizes[0] < sizes[1] && sizes[1] < sizes[2]);
  assert.ok(sizes[2] / sizes[0] > 1.4);
  if (width === 390) { const typeShot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); await writeFile('qa/session07-type-scale-mobile.png', Buffer.from(typeShot.data, 'base64')); }
  await evaluate("(()=>{document.querySelector('.action-sheet .sheet-cancel').click();return true;})()");
  console.log('mobile', width, layout, sizes);
}
for (const width of [390, 320]) {
  await call('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 3, mobile: true });
  const matrix = await evaluate("(async()=>{const pause=ms=>new Promise(r=>setTimeout(r,ms));const errors=[];[...document.querySelectorAll('.mobile-style-trigger')].find(b=>b.textContent.includes('日历文字')).click();await pause(20);for(const preset of ['经典','简约','手写']){[...document.querySelectorAll('[role=dialog] .font-options button')].find(b=>b.textContent.includes(preset)).click();await document.fonts.ready;await pause(25);for(const scale of ['小','标准','大']){[...document.querySelectorAll('[role=dialog] .scale-options button')].find(b=>b.querySelector('span')?.textContent===scale).click();await pause(15);document.querySelector('[role=dialog] .sheet-cancel').click();await pause(15);for(let month=1;month<=12;month++){document.querySelectorAll('.month-nav button')[month-1].click();await pause(12);const proof=document.querySelector('.editor-page .calendar-proof'),dates=proof.querySelector('.calendar-proof__dates'),title=proof.querySelector('.calendar-proof__title');if(dates.scrollHeight>dates.clientHeight+1||title.scrollWidth>title.clientWidth+1)errors.push({preset,scale,month,dates:[dates.scrollHeight,dates.clientHeight],title:[title.scrollWidth,title.clientWidth]})}[...document.querySelectorAll('.mobile-style-trigger')].find(b=>b.textContent.includes('日历文字')).click();await pause(15)}}document.querySelector('[role=dialog] .sheet-cancel').click();return errors})()");
  assert.deepEqual(matrix, [], 'typography overflow at ' + width + 'px');
  console.log('typography matrix', width, '3 families x 3 scales x 12 months passed');
}
await evaluate("(()=>{[...document.querySelectorAll('.desktop-nav button')].find(b=>b.textContent.includes('预览与导出')).click();return true})()");
await pause(70);
const reviewVariant = await evaluate("(()=>{const print=document.querySelector('input[name=review-export-variant][value=print]'),digital=document.querySelector('input[name=review-export-variant][value=digital]');const initial=print?.checked;digital?.click();return {initial,digital:digital?.checked,print:print?.checked,detail:document.querySelector('.review-export-options')?.textContent}})()");
assert.equal(reviewVariant.initial, true);
assert.equal(reviewVariant.digital, true);
assert.equal(reviewVariant.print, false);
assert.ok(reviewVariant.detail.includes('1200 × 1800 px'));
console.log('review variant selection', reviewVariant);
console.log('sampled', sampled, 'exported', exported);
ws.close();
