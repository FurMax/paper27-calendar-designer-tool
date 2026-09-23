import assert from 'node:assert/strict';

const base = 'http://127.0.0.1:5173/';
const targets = await (await fetch('http://127.0.0.1:9225/json/list')).json();
const target = targets.find(item => item.type === 'page' && item.url.startsWith(base));
assert.ok(target, 'local app tab');
async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
  let id = 1;
  const pending = new Map();
  ws.addEventListener('message', event => { const data = JSON.parse(event.data); const job = pending.get(data.id); if (!job) return; pending.delete(data.id); data.error ? job.reject(Error(data.error.message)) : job.resolve(data.result); });
  const call = (method, params = {}) => new Promise((resolve, reject) => { const key = id++; pending.set(key, { resolve, reject }); ws.send(JSON.stringify({ id: key, method, params })); });
  const evaluate = async expression => { const output = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (output.exceptionDetails) throw Error(output.exceptionDetails.exception?.description ?? output.exceptionDetails.text); return output.result.value; };
  return { ws, call, evaluate };
}
const tab = await connect(target.webSocketDebuggerUrl);
await tab.call('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:5173', storageTypes: 'indexeddb' });
await tab.call('Page.navigate', { url: base });
await new Promise(resolve => setTimeout(resolve, 700));
const saved = await tab.evaluate(`(async()=>{
  const pause=ms=>new Promise(r=>setTimeout(r,ms));
  const click=(selector,text)=>{const el=[...document.querySelectorAll(selector)].find(x=>x.textContent.includes(text));if(!el)throw Error('missing '+selector+' '+text);el.click();};
  click('.entry-page button','逐月添加照片'); await pause(80);
  click('.desktop-nav button','编辑月份'); await pause(80);
  document.querySelectorAll('.month-nav button')[2].click(); await pause(50);
  document.querySelector('.quick-colors button[title="#1E3933"]').click();
  click('.font-options button','手写'); click('.segmented button','大'); click('.segmented button','自定义'); await pause(80);
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=48;const c=canvas.getContext('2d');c.fillStyle='#3457d5';c.fillRect(0,0,64,48);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  const file=new File([blob],'m5-fixture.png',{type:'image/png'});
  const transfer=new DataTransfer();transfer.items.add(file);
  const input=document.querySelector('.editor-page input[type=file]');input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
  await pause(100);
  const zoom=document.querySelector('#crop-zoom-desktop');zoom.focus();Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(zoom,'1.5');zoom.dispatchEvent(new Event('input',{bubbles:true}));zoom.dispatchEvent(new Event('change',{bubbles:true}));zoom.blur();await pause(60);
  click('.desktop-nav button','分配照片');await pause(60);document.querySelectorAll('.month-card')[2].click();await pause(30);click('.sheet-options button','在另一月份使用同一照片');await pause(30);document.querySelectorAll('.destination-list button')[3].click();await pause(60);click('.desktop-nav button','编辑月份');await pause(60);document.querySelectorAll('.month-nav button')[2].click();
  await pause(1000);
  const module=await import('/src/persistence/indexedDb.ts');const state=await module.loadProject();
  return {url:location.pathname,ready:document.querySelector('.status-pill')?.textContent,revision:state?.project.revision,location:state?.project.lastLocation,background:state?.project.months[3].style.background,preset:state?.project.typography.presetId,scale:state?.project.typography.scale,textMode:state?.project.months[3].style.text.mode,cropZoom:state?.project.months[3].crop?.zoom,month4Ready:!!state?.project.months[4].photoItemId,itemCount:Object.keys(state?.project.photoItems??{}).length,assets:Object.keys(state?.assets??{}).length,blobBytes:Object.values(state?.assets??{})[0]?.blob.size};
})()`);
console.log('saved', saved);
assert.equal(saved.url, '/editor/3');
assert.equal(saved.ready, '已就绪');
assert.ok(saved.revision >= 1);
assert.deepEqual(saved.location, { screen: 'editor', month: 3 });
assert.equal(saved.background, '#1E3933');
assert.equal(saved.preset, 'handwritten');
assert.equal(saved.scale, 'large');
assert.equal(saved.textMode, 'custom');
assert.equal(saved.cropZoom, 1.5);
assert.equal(saved.month4Ready, true);
assert.equal(saved.itemCount, 2);
assert.equal(saved.assets, 1);
assert.ok(saved.blobBytes > 0);

const abort = await tab.evaluate(`(async()=>{
  const module=await import('/src/persistence/indexedDb.ts');
  const before=await module.loadProject();
  const changed=structuredClone(before);changed.project.months[3].style.background='#ABCDEF';
  let error='';try{await module.commitProject(changed,{id:before.project.id,revision:before.project.revision},{injectAbort:true});}catch(e){error=e.name;}
  const after=await module.loadProject();
  return {error,beforeRevision:before.project.revision,afterRevision:after.project.revision,afterColor:after.project.months[3].style.background,assets:Object.keys(after.assets).length};
})()`);
console.log('abort', abort);
assert.ok(abort.error);
assert.equal(abort.afterRevision, abort.beforeRevision);
assert.equal(abort.afterColor, '#1E3933');
assert.equal(abort.assets, 1);

await tab.call('Page.reload', { ignoreCache: true });
await new Promise(resolve => setTimeout(resolve, 650));
const restored = await tab.evaluate(`(async()=>{await new Promise(r=>setTimeout(r,100));const resume=[...document.querySelectorAll('.entry-page button')].find(x=>x.textContent.includes('继续编辑日历'));if(!resume)throw Error('resume missing');resume.click();await new Promise(r=>setTimeout(r,100));return {url:location.pathname,ready:document.querySelector('.status-pill')?.textContent,background:getComputedStyle(document.querySelector('.calendar-proof')).backgroundColor,font:getComputedStyle(document.querySelector('.calendar-proof__title strong')).fontFamily,zoom:(await (await import('/src/persistence/indexedDb.ts')).loadProject()).project.months[3].crop.zoom};})()`);
console.log('restored', restored);
assert.equal(restored.url, '/editor/3');
assert.equal(restored.ready, '已就绪');
assert.ok(restored.font.includes('Patrick Hand'));
assert.equal(restored.zoom, 1.5);

const stale = await tab.evaluate(`(async()=>{
  const module=await import('/src/persistence/indexedDb.ts');const before=await module.loadProject();
  const first=structuredClone(before);first.project.months[1].style.background='#123456';
  const committed=await module.commitProject(first,{id:before.project.id,revision:before.project.revision});
  let staleName='';try{await module.commitProject(before,{id:before.project.id,revision:before.project.revision});}catch(e){staleName=e.name;}
  const after=await module.loadProject();return {staleName,revision:after.project.revision,color:after.project.months[1].style.background,expected:committed.revision};
})()`);
console.log('stale', stale);
assert.equal(stale.staleName, 'StaleProjectError');
assert.equal(stale.revision, stale.expected);
assert.equal(stale.color, '#123456');

const replacementAbort = await tab.evaluate(`(async()=>{const m=await import('/src/persistence/indexedDb.ts');const before=await m.loadProject();let name='';try{await m.replaceProject({id:before.project.id,revision:before.project.revision},{injectAbort:true});}catch(e){name=e.name;}const after=await m.loadProject();return {name,sameId:after.project.id===before.project.id,revision:after.project.revision,assets:Object.keys(after.assets).length};})()`);
console.log('replace abort', replacementAbort);
assert.ok(replacementAbort.name);
assert.equal(replacementAbort.sameId, true);
assert.equal(replacementAbort.assets, 1);
const conflict = await tab.evaluate(`(async()=>{document.querySelector('.quick-colors button[title="#E8EDE9"]').click();await new Promise(r=>setTimeout(r,800));return {dialog:document.querySelector('[role=alertdialog]')?.textContent,stored:(await (await import('/src/persistence/indexedDb.ts')).loadProject()).project.months[3].style.background};})()`);
console.log('UI conflict', conflict);
assert.ok(conflict.dialog?.includes('其他标签页更新'));
assert.equal(conflict.stored, '#1E3933');
await tab.call('Page.reload', { ignoreCache: true });
await new Promise(resolve => setTimeout(resolve, 600));
const failure = await tab.evaluate(`(async()=>{
  const resume=[...document.querySelectorAll('.entry-page button')].find(x=>x.textContent.includes('继续编辑日历'));resume.click();await new Promise(r=>setTimeout(r,80));
  const original=IDBObjectStore.prototype.put;let injected=false;
  IDBObjectStore.prototype.put=function(...args){if(!injected&&this.name==='project'){injected=true;this.transaction.abort();return {};}return original.apply(this,args);};
  document.querySelector('.quick-colors button[title="#E6DDD1"]').click();await new Promise(r=>setTimeout(r,800));
  IDBObjectStore.prototype.put=original;
  const banner=document.querySelector('.feedback--error')?.textContent;
  const before=(await (await import('/src/persistence/indexedDb.ts')).loadProject()).project.months[3].style.background;
  document.querySelector('.feedback--error button').click();await new Promise(r=>setTimeout(r,700));
  const after=(await (await import('/src/persistence/indexedDb.ts')).loadProject()).project.months[3].style.background;
  return {injected,banner,before,after,bannerGone:!document.querySelector('.feedback--error')};
})()`);
console.log('UI failure/retry', failure);
assert.equal(failure.injected, true);
assert.ok(failure.banner?.includes('本地保存失败'));
assert.equal(failure.before, '#1E3933');
assert.equal(failure.after, '#E6DDD1');
assert.equal(failure.bannerGone, true);

const browserInfo = await (await fetch('http://127.0.0.1:9225/json/version')).json();
const browser = await connect(browserInfo.webSocketDebuggerUrl);
const created = await browser.call('Target.createTarget', { url: base });
await new Promise(resolve => setTimeout(resolve, 500));
const targets2 = await (await fetch('http://127.0.0.1:9225/json/list')).json();
const other = targets2.find(item => item.id === created.targetId);
assert.ok(other, 'second tab');
const tab2 = await connect(other.webSocketDebuggerUrl);
const tab2Ready = await tab2.evaluate(`(async()=>{await new Promise(r=>setTimeout(r,300));const resume=[...document.querySelectorAll('.entry-page button')].find(x=>x.textContent.includes('继续编辑日历'));return !!resume;})()`);
assert.equal(tab2Ready, true);
const replaced = await tab.evaluate(`(async()=>{
  document.querySelector('.brand').click();await new Promise(r=>setTimeout(r,60));
  [...document.querySelectorAll('.entry-page button')].find(x=>x.textContent.includes('新建日历')).click();await new Promise(r=>setTimeout(r,30));
  const confirmation=!!document.querySelector('[role=dialog][aria-label="新建日历确认"]');
  [...document.querySelectorAll('[role=dialog] button')].find(x=>x.textContent==='新建日历').click();await new Promise(r=>setTimeout(r,650));
  const state=await (await import('/src/persistence/indexedDb.ts')).loadProject();
  return {confirmation,empty:state===null,entry:!!document.querySelector('.entry-page button'),error:document.querySelector('.feedback--error')?.textContent};
})()`);
console.log('Start New', replaced);
assert.equal(replaced.confirmation, true);
assert.equal(replaced.empty, true);
assert.equal(replaced.entry, true);
const otherConflict = await tab2.evaluate(`(async()=>{await new Promise(r=>setTimeout(r,300));return document.querySelector('[role=alertdialog]')?.textContent??'';})()`);
console.log('second tab conflict', otherConflict);
assert.ok(otherConflict.includes('其他标签页更新'));
const corruptWritten = await tab.evaluate(`(async()=>{const request=indexedDB.open('calendar-design-studio-v1',1);const db=await new Promise((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});await new Promise((resolve,reject)=>{const tx=db.transaction('project','readwrite');tx.objectStore('project').put({schemaVersion:99,id:'corrupt',revision:1},'active');tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});db.close();return true;})()`);
assert.equal(corruptWritten, true);
await tab.call('Page.reload', { ignoreCache: true });
await new Promise(resolve => setTimeout(resolve, 600));
const corruptUI = await tab.evaluate(`({message:document.querySelector('.recovery-page h1')?.textContent,retry:document.querySelector('.recovery-page button')?.textContent})`);
console.log('corrupt restore', corruptUI);
assert.equal(corruptUI.message, '无法读取已保存的日历');
assert.equal(corruptUI.retry, '重试读取');
tab2.ws.close();
browser.ws.close();
tab.ws.close();
