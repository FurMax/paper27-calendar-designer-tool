import assert from 'node:assert/strict';

const tabs = await (await fetch('http://127.0.0.1:9230/json/list')).json();
const tab = tabs.find(item => item.type === 'page' && item.url.startsWith('http://127.0.0.1:5173'));
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
await call('Storage.clearDataForOrigin', { origin: 'http://127.0.0.1:5173', storageTypes: 'indexeddb' });
await call('Page.navigate', { url: 'http://127.0.0.1:5173/' });
await new Promise(resolve => setTimeout(resolve, 650));
const response = await call('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: `(async () => {
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  const click = (selector, text) => {
    const button = [...document.querySelectorAll(selector)].find(item => item.textContent.includes(text));
    if (!button) throw Error('missing button: ' + selector + ' / ' + text);
    button.click();
  };
  const snapshot = async () => {
    await pause(480);
    const state = await (await import('/src/persistence/indexedDb.ts')).loadProject();
    return { months: Array.from({ length: 12 }, (_, i) => state.project.months[i + 1].photoItemId),
      assets: Object.keys(state.assets), items: state.project.photoItems,
      crops: Array.from({ length: 12 }, (_, i) => state.project.months[i + 1].crop),
      ready: document.querySelector('.page-header p')?.textContent,
      unassigned: document.querySelectorAll('.unassigned-card').length };
  };
  const transfer = new DataTransfer();
  for (const [index, color] of ['#FF0000', '#0000FF'].entries()) {
    const canvas = document.createElement('canvas'); canvas.width = 120; canvas.height = 100;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = color; ctx.fillRect(0,0,120,100);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    transfer.items.add(new File([blob], index ? 'blue.png' : 'red.png', { type:'image/png' }));
  }
  const picker = document.querySelector('.entry-page input[type=file]'); picker.files = transfer.files;
  picker.dispatchEvent(new Event('change', { bubbles:true })); await pause(550);
  const initial = await snapshot();
  document.querySelectorAll('.month-card')[0].click(); await pause(30);
  click('.sheet-options button', '移动到空月份'); await pause(30);
  document.querySelectorAll('.destination-list button')[2].click();
  const moved = await snapshot();
  document.querySelectorAll('.month-card')[2].click(); await pause(30);
  click('.sheet-options button', '与另一月份交换'); await pause(30);
  document.querySelectorAll('.destination-list button')[1].click(); await pause(30);
  click('.sheet-confirm button', '交换照片');
  const swapped = await snapshot();
  document.querySelectorAll('.month-card')[1].click(); await pause(30);
  click('.sheet-options button', '从这个月移除');
  const removed = await snapshot();
  document.querySelector('.unassigned-card').click(); await pause(30);
  click('.sheet-options button', '分配到月份'); await pause(30);
  document.querySelectorAll('.destination-list button')[2].click(); await pause(30);
  click('.sheet-confirm button', '替换照片');
  const replaced = await snapshot();
  document.querySelectorAll('.month-card')[2].click(); await pause(30);
  click('.sheet-options button', '在另一月份使用同一照片'); await pause(30);
  document.querySelectorAll('.destination-list button')[3].click();
  const reused = await snapshot();
  document.querySelector('.unassigned-card').click(); await pause(30);
  click('.sheet-options button', '从项目中删除照片'); await pause(30);
  click('.sheet-confirm button', '从项目中删除');
  const deleted = await snapshot();
  return { initial, moved, swapped, removed, replaced, reused, deleted };
})()` });
if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
const result = response.result.value;
const a = result.initial.months[0], b = result.initial.months[1];
assert.ok(a && b && a !== b);
assert.equal(result.moved.months[0], null); assert.equal(result.moved.months[2], a);
assert.equal(result.swapped.months[1], a); assert.equal(result.swapped.months[2], b);
assert.equal(result.removed.months[1], null); assert.equal(result.removed.unassigned, 1);
assert.equal(result.replaced.months[2], a); assert.equal(result.replaced.unassigned, 1);
assert.equal(result.reused.months[2], a); assert.ok(result.reused.months[3]);
assert.notEqual(result.reused.months[3], a);
assert.equal(result.reused.items[a].assetId, result.reused.items[result.reused.months[3]].assetId);
assert.equal(result.deleted.unassigned, 0); assert.equal(result.deleted.assets.length, 1);
assert.equal(result.deleted.months[2], a); assert.ok(result.deleted.months[3]);
assert.ok(result.deleted.crops[2] && result.deleted.crops[3]);
console.log(JSON.stringify({ firstTwo: [a,b], move: true, swap: true, remove: true,
  replace: true, reuseIndependentItem: true, deletePreservedSharedAsset: true,
  finalReady: result.deleted.ready, finalAssets: result.deleted.assets.length }, null, 2));
ws.close();
