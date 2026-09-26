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
const evaluate = async expression => {
  const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
};
await call('Page.navigate', { url: 'http://127.0.0.1:5173/' });
await new Promise(resolve => setTimeout(resolve, 650));
const opened = await evaluate(`(async () => {
  const trigger = [...document.querySelectorAll('.entry-page button')].find(button => button.textContent.includes('新建日历'));
  trigger.focus(); trigger.click();
  await new Promise(resolve => setTimeout(resolve, 60));
  const dialog = document.querySelector('[role=dialog]');
  return { trigger: trigger.textContent, activeInside: dialog.contains(document.activeElement), activeLabel: document.activeElement?.getAttribute('aria-label') };
})()`);
assert.equal(opened.activeInside, true);
await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 });
await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 });
const wrapped = await evaluate(`(() => {
  const dialog = document.querySelector('[role=dialog]');
  const buttons = [...dialog.querySelectorAll('button:not(:disabled)')];
  return { inside: dialog.contains(document.activeElement), last: document.activeElement === buttons.at(-1) };
})()`);
assert.equal(wrapped.inside, true);
assert.equal(wrapped.last, true);
const closed = await evaluate(`(async () => {
  document.querySelector('[role=dialog] button[aria-label=关闭]').click();
  await new Promise(resolve => setTimeout(resolve, 60));
  return { dialogGone: !document.querySelector('[role=dialog]'), restored: document.activeElement?.textContent?.includes('新建日历') };
})()`);
assert.equal(closed.dialogGone, true);
assert.equal(closed.restored, true);
console.log({ opened, wrapped, closed });
ws.close();
