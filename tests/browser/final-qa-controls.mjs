import assert from 'node:assert/strict';

const origin = 'http://127.0.0.1:4173';
const port = process.env.CDP_PORT ?? '9230';
const info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
async function connect(url) {
  const ws = new WebSocket(url);
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
  return { ws, errors, call: (method, params = {}) => new Promise((resolve, reject) => { const id = sequence++; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); }) };
}
const browser = await connect(info.webSocketDebuggerUrl);
const context = await browser.call('Target.createBrowserContext');
let page;
try {
  const target = await browser.call('Target.createTarget', { url: origin + '/', browserContextId: context.browserContextId });
  let tab;
  for (let i = 0; i < 50; i++) { tab = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(item => item.id === target.targetId); if (tab?.webSocketDebuggerUrl) break; await new Promise(r => setTimeout(r, 100)); }
  assert.ok(tab?.webSocketDebuggerUrl);
  page = await connect(tab.webSocketDebuggerUrl);
  const call = page.call;
  await call('Page.enable'); await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  async function run(fn, ...args) {
    const result = await call('Runtime.evaluate', { expression: `(${fn.toString()})(${args.map(JSON.stringify).join(',')})`, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result.value;
  }
  async function until(fn, label, ...args) { for (let i = 0; i < 160; i++) { if (await run(fn, ...args)) return; await new Promise(r => setTimeout(r, 100)); } throw Error('Timed out: ' + label); }
  async function click(selector, text = '') { await run((selector, text) => { const item = [...document.querySelectorAll(selector)].find(node => !text || node.textContent.includes(text) || node.getAttribute('aria-label')?.includes(text)); if (!item) throw Error('Missing ' + selector + ' ' + text); item.click(); }, selector, text); }
  async function type(selector, value) { await run(selector => { const input = document.querySelector(selector); input.focus(); input.select(); }, selector); await call('Input.insertText', { text: value }); await run(selector => document.querySelector(selector).blur(), selector); }
  const proof = () => document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-background');
  await call('Page.navigate', { url: origin + '/' });
  await until(() => !!document.querySelector('.entry-page input[type=file]'), 'Entry');
  await run(async () => { const c = document.createElement('canvas'); c.width = 720; c.height = 850; const x = c.getContext('2d'); x.fillStyle = '#CDAF9F'; x.fillRect(0,0,720,850); x.fillStyle = '#487CA6'; x.fillRect(0,0,200,850); x.fillStyle = '#A34C56'; x.fillRect(500,0,220,850); const b = await new Promise(r => c.toBlob(r,'image/png')); const dt = new DataTransfer(); for (let m = 1; m <= 12; m++) dt.items.add(new File([b], `qa-${m}.png`, { type:'image/png' })); const input = document.querySelector('.entry-page input[type=file]'); input.files = dt.files; input.dispatchEvent(new Event('change',{bubbles:true})); });
  await until(() => !!document.querySelector('.month-grid'), 'Assign');
  await click('.desktop-nav button', '编辑月份');
  await until(() => document.querySelectorAll('.monthly-photo-colors__grid button').length === 3, 'Editor recommendations');
  const recommendations = await run(() => [...document.querySelectorAll('.monthly-photo-colors__grid button')].map(b => b.dataset.tooltip));
  assert.deepEqual(recommendations.map(item => item.split(' · ')[0]), ['主色','搭配色','点缀色']);
  for (let i = 0; i < 3; i++) {
    await run(i => document.querySelectorAll('.monthly-photo-colors__grid button')[i].click(), i);
    await until(color => document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-background') === color, 'recommendation '+i, recommendations[i].split(' · ')[1]);
  }
  const common = await run(() => [...document.querySelectorAll('.quick-colors button')].map(b => b.dataset.tooltip.split(' · ')[1]));
  assert.deepEqual(common, ['#F7F4EE','#E6EBE8','#E9E1D3','#CFE8D6','#BFD1C3','#B7D7F2','#95A8C7','#F3EEA4','#F4C7C3','#D9C7EB']);
  for (let i = 0; i < common.length; i++) {
    await run(i => document.querySelectorAll('.quick-colors button')[i].click(), i);
    await until(color => document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-background') === color, 'common '+i, common[i]);
    assert.equal(await run(i => document.querySelectorAll('.quick-colors button')[i].getAttribute('aria-pressed'), i), 'true');
  }
  await click('.palette-custom-toggle', '精确调色');
  await type('input[aria-label="背景色 HEX"]', '#12AB34');
  await until(() => document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-background') === '#12AB34', 'valid HEX');
  for (const invalid of ['#12', '#GGGGGG']) {
    await type('input[aria-label="背景色 HEX"]', invalid);
    assert.equal(await run(proof), '#12AB34');
    assert.equal(await run(() => document.querySelector('input[aria-label="背景色 HEX"]').value), '#12AB34');
  }
  await type('input[aria-label="背景色 R"]', '0');
  await type('input[aria-label="背景色 G"]', '255');
  await type('input[aria-label="背景色 B"]', '0');
  await until(() => document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-background') === '#00FF00', 'RGB boundary');
  await type('input[aria-label="背景色 R"]', '256');
  assert.equal(await run(proof), '#00FF00');
  await type('input[aria-label="背景色 HEX"]', '#FFFFFF');
  await until(() => document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-background') === '#FFFFFF', 'white background');
  await click('.text-color-controls button', '自定义');
  await type('input[aria-label="文字颜色 HEX"]', '#FFFFFF');
  await until(() => !!document.querySelector('.contrast-warning'), 'contrast warning');
  await click('.text-color-controls button', '自动');
  assert.equal(await run(() => !!document.querySelector('.contrast-warning') || !!document.querySelector('input[aria-label="文字颜色 HEX"]')), false);

  await run(() => {
    const create=URL.createObjectURL.bind(URL);
    window.__qaBlobs=new Map();window.__qaDownloads=[];
    URL.createObjectURL=blob=>{const url=create(blob);window.__qaBlobs.set(url,blob);return url;};
    HTMLAnchorElement.prototype.click=function(){window.__qaDownloads.push({name:this.download,url:this.href});};
  });
  async function exportTexture(label) {
    await click('.month-export__trigger','导出本月');
    await click('.month-export__menu button',label);
    await until(()=>document.querySelector('.month-export-status')?.textContent.includes('已尝试下载'),'texture export '+label);
    const result=await run(async()=>{
      const item=window.__qaDownloads.at(-1),blob=window.__qaBlobs.get(item?.url);
      if(!blob)throw Error('Missing texture export file');
      const bitmap=await createImageBitmap(blob),canvas=document.createElement('canvas');
      canvas.width=bitmap.width;canvas.height=bitmap.height;
      const x=canvas.getContext('2d',{willReadFrequently:true});x.drawImage(bitmap,0,0);bitmap.close();
      function hash(px,py,w,h){const data=x.getImageData(px,py,w,h).data;let value=2166136261;for(let i=0;i<data.length;i++)value=Math.imul(value^data[i],16777619)>>>0;return value;}
      return {name:item.name,type:blob.type,width:canvas.width,height:canvas.height,photo:hash(200,200,80,80),calendar:hash(500,1500,100,100)};
    });
    await click('.month-export-status button','关闭');
    return result;
  }
  const exportChoices=['印刷版 · PNG','印刷版 · JPG','屏幕版 · PNG','屏幕版 · JPG'];
  const textureBaseline={};
  for(const choice of exportChoices)textureBaseline[choice]=await exportTexture(choice);  const textureLabels = ['细横线','浅网格','波浪格','波点','纸张肌理','硫酸纸'];
  const textureIds = [];
  for (const label of textureLabels) {
    await click('.texture-options button.texture-thumb', label);
    const info = await run(() => ({ id: document.querySelector('.calendar-proof__dates').dataset.texture, image: getComputedStyle(document.querySelector('.calendar-proof__dates')).backgroundImage, photo: getComputedStyle(document.querySelector('.calendar-proof__photo')).backgroundImage, selected: [...document.querySelectorAll('.texture-options button[aria-pressed="true"]')].map(b => b.getAttribute('aria-label')) }));
    assert.ok(info.image.startsWith('url('), label);
    assert.equal(info.selected.length, 1, label);
    assert.ok(info.selected[0].includes(label), label);
    textureIds.push(info.id);
    for(const choice of exportChoices){
      const file=await exportTexture(choice),base=textureBaseline[choice];
      assert.equal(file.type,base.type);assert.deepEqual([file.width,file.height],[base.width,base.height]);
      assert.equal(file.photo,base.photo,'photo changed under '+label+' '+choice);
      assert.notEqual(file.calendar,base.calendar,'texture absent from '+label+' '+choice);
    }
  }
  assert.equal(new Set(textureIds).size, 6);
  await click('.texture-clear', '清除');
  assert.equal(await run(() => document.querySelector('.calendar-proof__dates').dataset.texture), 'none');

  const fontData = [];
  for (const name of ['经典','简约','手写','复古']) {
    await click('.font-options button', name);
    await until(() => document.querySelector('.font-status')?.textContent.includes('字体已加载'), 'font '+name);
    for (const scale of ['小','标准','大']) {
      await click('.scale-options button', scale);
      const item = await run(() => ({ font: [...document.querySelectorAll('.font-options button')].find(b => b.getAttribute('aria-pressed') === 'true')?.querySelector('span')?.textContent, scale: [...document.querySelectorAll('.scale-options button')].find(b => b.getAttribute('aria-pressed') === 'true')?.querySelector('span')?.textContent, titleFont: getComputedStyle(document.querySelector('.calendar-proof__title strong')).fontFamily, titleRight: document.querySelector('.calendar-proof__title strong').getBoundingClientRect().right, yearLeft: document.querySelector('.calendar-proof__title span').getBoundingClientRect().left }));
      assert.equal(item.font, name); assert.equal(item.scale, scale); assert.ok(item.titleRight + 4 <= item.yearLeft, JSON.stringify(item)); fontData.push({ font:name, scale, family:item.titleFont });
    }
  }
  await click('.desktop-nav button', '预览与导出');
  await until(() => document.querySelectorAll('.review-card').length === 12, 'Review');
  const review = await run(() => ({ texture:document.querySelector('.review-card[data-month="1"] .calendar-proof__dates')?.dataset.texture, font:getComputedStyle(document.querySelector('.review-card[data-month="1"] .calendar-proof__title strong')).fontFamily }));
  assert.equal(review.texture, 'none'); assert.ok(review.font.includes('Fraunces'));
  await new Promise(r => setTimeout(r, 850)); await call('Page.reload');
  await until(() => !!document.querySelector('.entry-page button'), 'reload');
  await click('.entry-page button', '继续编辑日历');
  await until(() => !!document.querySelector('.review-page'), 'restored Review');
  const restored = await run(() => ({ font:getComputedStyle(document.querySelector('.review-card[data-month="1"] .calendar-proof__title strong')).fontFamily, background:document.querySelector('.review-card[data-month="1"] .calendar-proof').style.getPropertyValue('--proof-background') }));
  assert.ok(restored.font.includes('Fraunces')); assert.equal(restored.background, '#FFFFFF');
  await click('.set-color-panel button', '为全部月份推荐配色');
  await until(() => document.querySelectorAll('.set-color-sheet .set-color-row').length === 12, 'twelve palette proposals');
  assert.equal(await run(() => document.querySelector('.set-color-sheet')?.contains(document.activeElement)), true);
  await call('Input.dispatchKeyEvent', { type:'keyDown', key:'Tab', code:'Tab', windowsVirtualKeyCode:9, modifiers:8 });
  await call('Input.dispatchKeyEvent', { type:'keyUp', key:'Tab', code:'Tab', windowsVirtualKeyCode:9, modifiers:8 });
  assert.equal(await run(() => document.querySelector('.set-color-sheet')?.contains(document.activeElement)), true);
  await call('Input.dispatchKeyEvent', { type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
  await call('Input.dispatchKeyEvent', { type:'keyUp', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
  await until(() => !document.querySelector('.set-color-sheet'), 'palette Escape close');
  assert.equal(await run(() => document.activeElement?.textContent.includes("为全部月份推荐配色")), true);
  await click('.set-color-panel button', '为全部月份推荐配色');
  await until(() => document.querySelectorAll('.set-color-sheet .set-color-row').length === 12, 'palette reopen');  const paletteBefore = await run(() => ({ color:document.querySelector('.set-color-row__hex')?.textContent.trim(), count:document.querySelector('.set-color-sheet .confirm-actions .button--primary')?.textContent.trim() }));
  assert.ok(paletteBefore.color?.startsWith('#'));
  await click('.set-color-preview button', '去编辑 1 月');
  await until(() => !!document.querySelector('.editor-page'), 'January Editor from palette');
  await click('.palette-custom-toggle', '精确调色');
  await type('input[aria-label="背景色 HEX"]', paletteBefore.color);
  await until(color => document.querySelector('.month-proof-layer--current .calendar-proof')?.style.getPropertyValue('--proof-background') === color, 'matching January recommendation', paletteBefore.color);
  await click('.desktop-nav button', '预览与导出');
  await until(() => !!document.querySelector('.review-page'), 'Review after color edit');
  await click('.set-color-panel button', '为全部月份推荐配色');
  await until(() => document.querySelectorAll('.set-color-sheet .set-color-row').length === 12, 'updated palette proposals');
  const paletteAfter = await run(() => ({ count:document.querySelector('.set-color-sheet .confirm-actions .button--primary')?.textContent.trim(), note:document.querySelector('.set-color-sheet__note')?.textContent.trim() }));
  assert.ok(paletteAfter.count?.includes('11 个月'), JSON.stringify(paletteAfter));
  assert.ok(paletteAfter.note?.includes('1 个月的推荐背景与当前相同'), JSON.stringify(paletteAfter));
  await click('.set-color-sheet .confirm-actions button', '应用推荐配色');
  await until(() => !document.querySelector('.set-color-sheet'), 'palette applied');
  await until(() => !![...document.querySelectorAll('.set-color-panel button')].find(b => b.textContent.includes('撤销本次配色')), 'palette undo offered');
  const applied = await run(() => document.querySelector('.review-card[data-month="1"] .calendar-proof')?.style.getPropertyValue('--proof-background'));
  assert.equal(applied, paletteBefore.color);
  await click('.set-color-panel button', '撤销本次配色');
  await until(() => ![...document.querySelectorAll('.set-color-panel button')].some(b => b.textContent.includes('撤销本次配色')), 'palette undone');  await click('.page-actions button', '生成整套 12');
  await until(() => !!document.querySelector('.export-sheet'), 'export dialog');
  await call('Input.dispatchKeyEvent', { type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
  await call('Input.dispatchKeyEvent', { type:'keyUp', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
  await until(() => !document.querySelector('.export-sheet'), 'export Escape close');
  assert.equal(await run(() => document.querySelectorAll('.review-card').length), 12);  await call('Emulation.setDeviceMetricsOverride', { width:390, height:844, deviceScaleFactor:1, mobile:true });
  await click('.mobile-menu > button', '菜单');
  await until(() => !!document.querySelector('#mobile-nav'), 'mobile navigation');
  await click('#mobile-nav button', '编辑月份');
  await until(() => !!document.querySelector('.editor-page'), 'mobile Editor');
  await click('.phone-month-select__current');
  await until(() => !!document.querySelector('[role="dialog"][aria-label="选择月份"]'), 'month selector dialog');
  await call('Input.dispatchKeyEvent', { type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
  await call('Input.dispatchKeyEvent', { type:'keyUp', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
  await until(() => !document.querySelector('[role="dialog"][aria-label="选择月份"]'), 'month selector Escape close');
  await click('.mobile-style-trigger', '背景色与推荐色');
  await until(() => !!document.querySelector('[role="dialog"][aria-label="背景色与推荐色"]'), 'background dialog');
  await call('Input.dispatchKeyEvent', { type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
  await call('Input.dispatchKeyEvent', { type:'keyUp', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
  await until(() => !document.querySelector('[role="dialog"][aria-label="背景色与推荐色"]'), 'background Escape close');
  await click('.mobile-crop-trigger', '照片与裁切');
  await until(() => !!document.querySelector('[role="dialog"][aria-label="照片与裁切"]'), 'crop dialog');
  await call('Input.dispatchKeyEvent', { type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
  await call('Input.dispatchKeyEvent', { type:'keyUp', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
  await until(() => !document.querySelector('[role="dialog"][aria-label="照片与裁切"]'), 'crop Escape close');  await click('.brand', 'Calendar');
  await until(() => !!document.querySelector('.entry-page'), 'return to Entry');
  await click('.entry-page button', '新建日历');
  await until(() => !!document.querySelector('[role="dialog"][aria-label="新建日历确认"]'), 'replace confirmation');
  await call('Input.dispatchKeyEvent', { type:'keyDown', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
  await call('Input.dispatchKeyEvent', { type:'keyUp', key:'Escape', code:'Escape', windowsVirtualKeyCode:27 });
  await until(() => !document.querySelector('[role="dialog"][aria-label="新建日历确认"]'), 'replace confirmation Escape close');
  assert.equal(await run(() => document.activeElement?.textContent.includes("新建日历")), true);  assert.deepEqual(page.errors, []);
  console.log(JSON.stringify({ port, recommendations, common, textures:textureIds, fonts:fontData, review, restored, paletteBefore, paletteAfter, errors:page.errors }));
} finally {
  page?.ws.close(); await browser.call('Target.disposeBrowserContext', { browserContextId:context.browserContextId }); browser.ws.close();
}
