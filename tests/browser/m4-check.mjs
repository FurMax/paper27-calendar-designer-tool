import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const targets = await (await fetch('http://127.0.0.1:9224/json/list')).json();
const target = targets.find(item => item.type === 'page' && item.url.startsWith('http://127.0.0.1:5173'));
assert.ok(target, 'local app tab');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once: true }); ws.addEventListener('error', reject, { once: true }); });
let nextId = 1;
const pending = new Map();
ws.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  if (!data.id) return;
  const job = pending.get(data.id);
  if (!job) return;
  pending.delete(data.id);
  if (data.error) job.reject(Error(data.error.message)); else job.resolve(data.result);
});
function call(method, params = {}) { return new Promise((resolve, reject) => { const id = nextId++; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); }); }
async function evaluate(expression) { const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw Error(result.exceptionDetails.text + ' ' + result.exceptionDetails.exception?.description); return result.result.value; }
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await call('Page.navigate', { url: 'http://127.0.0.1:5173/' });
await new Promise(resolve => setTimeout(resolve, 1000));
const result = await evaluate(`(async () => {
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  const clickText = (selector, text) => { const el = [...document.querySelectorAll(selector)].find(item => item.textContent.includes(text)); if (!el) throw Error('missing ' + selector + ':' + text); el.click(); };
  clickText('.entry-page button', '逐月添加照片'); await pause(100);
  clickText('.desktop-nav button', '编辑月份'); await pause(100);
  const proof = () => document.querySelector('.editor-page .calendar-proof');
  if (document.title !== 'Calendar Design Studio · 2027' || !document.querySelector('.brand').textContent.includes('Calendar Design Studio · 2027')) throw Error('site name mismatch');
  if (!document.querySelector('.properties-panel__head').textContent.includes('月份预览') || proof().querySelector('.calendar-proof__title strong').textContent !== 'January') throw Error('UI/output language mismatch');
  const styles = [];
  for (const [name, family] of [['经典','Instrument Serif'],['简约','Instrument Sans'],['手写','Patrick Hand']]) {
    clickText('.font-options button', name); await document.fonts.ready; await pause(200);
    styles.push({name, family: getComputedStyle(proof().querySelector('.calendar-proof__title strong')).fontFamily, status: document.querySelector('.font-status').textContent});
    if (!styles.at(-1).family.includes(family) || styles.at(-1).status !== '字体已加载') throw Error('font failed: ' + JSON.stringify(styles.at(-1)));
  }
  const overflow = [];
  for (const scale of ['小','标准','大']) {
    clickText('.segmented button', scale); await pause(50);
    for (const month of document.querySelectorAll('.month-nav button')) {
      month.click(); await pause(20);
      const dates = proof().querySelector('.calendar-proof__dates');
      const title = proof().querySelector('.calendar-proof__title');
      if (dates.scrollHeight > dates.clientHeight + 1 || title.scrollWidth > title.clientWidth + 1) overflow.push({scale, month: month.textContent});
    }
  }
  document.querySelector('.quick-colors button[title="#1E3933"]').click(); await pause(30);
  clickText('.segmented button', '自定义'); await pause(30);
  const warning = !!document.querySelector('.contrast-warning');
  clickText('.segmented button', '自动'); await pause(30);
  const autoInk = getComputedStyle(proof()).color;
  document.querySelector('.quick-colors button[title="#FFFFFF"]').click(); await pause(30);
  const setInput = async (selector, value) => {
    const input = document.querySelector(selector);
    if (!input) throw Error('missing input ' + selector);
    input.focus();
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await pause(20); input.blur(); await pause(40);
  };
  await setInput('input[aria-label="背景色 HEX"]', '#123456');
  const hexColor = getComputedStyle(proof()).backgroundColor;
  await setInput('input[aria-label="背景色 R"]', '100');
  const rgbColor = getComputedStyle(proof()).backgroundColor;
  await setInput('input[aria-label="背景色选择器"]', '#abcdef');
  const pickerColor = getComputedStyle(proof()).backgroundColor;
  document.querySelector('.quick-colors button[title="#FFFFFF"]').click(); await pause(30);
  const reviewOverflow = [];
  for (const scale of ['小','标准','大']) {
    clickText('.segmented button', scale); await pause(30);
    clickText('.desktop-nav button', '预览与导出'); await pause(70);
    if (document.querySelector('.review-card__caption strong').textContent !== '1 月') throw Error('Review month UI language mismatch');
    for (const card of document.querySelectorAll('.review-card')) { const p=card.querySelector('.calendar-proof'); const dates=p.querySelector('.calendar-proof__dates'); const title=p.querySelector('.calendar-proof__title'); if(dates.scrollHeight>dates.clientHeight+1||title.scrollWidth>title.clientWidth+1) reviewOverflow.push({scale, month:card.textContent.slice(0,10)}); }
    clickText('.desktop-nav button', '编辑月份'); await pause(70);
  }
  clickText('.desktop-nav button', '分配照片'); await pause(50);
  if (document.querySelector('.month-card__top strong').textContent !== '1 月') throw Error('Assign month UI language mismatch');
  clickText('.desktop-nav button', '编辑月份'); await pause(50);
  return {styles, overflow, reviewOverflow, warning, autoInk, hexColor, rgbColor, pickerColor, monthCount: document.querySelectorAll('.month-nav button').length, background: getComputedStyle(proof()).backgroundColor};
})()`);
console.log(JSON.stringify(result, null, 2));
assert.equal(result.overflow.length, 0);
assert.equal(result.warning, true);
assert.equal(result.reviewOverflow.length, 0);
assert.equal(result.monthCount, 12);
assert.equal(result.hexColor, 'rgb(18, 52, 86)');
assert.equal(result.rgbColor, 'rgb(100, 52, 86)');
assert.equal(result.pickerColor, 'rgb(171, 205, 239)');
const desktopShot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await writeFile('qa/m4-desktop.png', Buffer.from(desktopShot.data, 'base64'));
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
const phone = await evaluate(`(async()=>{await new Promise(r=>setTimeout(r,100)); const select = document.querySelector('.phone-month-select'); const proof = document.querySelector('.editor-page .calendar-proof'); const docOverflow = document.documentElement.scrollWidth > innerWidth; const trigger = [...document.querySelectorAll('.mobile-style-trigger')].find(x=>x.textContent.includes('日历文字')); trigger.click(); await new Promise(r=>setTimeout(r,100)); return {selectVisible:getComputedStyle(select).display !== 'none', sheet:document.querySelector('[role=dialog]')?.getAttribute('aria-label'), fontStatus:document.querySelector('[role=dialog] .font-status')?.textContent, proofWidth:proof.getBoundingClientRect().width, docOverflow};})()`);
console.log(JSON.stringify(phone, null, 2));
assert.equal(phone.selectVisible, true);
assert.equal(phone.sheet, '日历文字');
assert.equal(phone.docOverflow, false);
const phoneShot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await writeFile('qa/m4-phone.png', Buffer.from(phoneShot.data, 'base64'));
const phoneCheckExpression = `(async () => {
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  const errors = [];
  for (const presetLabel of ['经典', '简约', '手写']) {
    const preset = [...document.querySelectorAll('[role=dialog] .font-options button')].find(button => button.textContent.includes(presetLabel));
    if (!preset) throw Error('missing phone preset ' + presetLabel);
    preset.click(); await document.fonts.ready; await pause(60);
    if (document.querySelector('[role=dialog] .font-status').textContent !== '字体已加载') errors.push({preset: presetLabel, fontStatus: 'fallback'});
    for (const scaleLabel of ['小', '标准', '大']) {
      const scale = [...document.querySelectorAll('[role=dialog] .segmented button')].find(button => button.textContent.trim() === scaleLabel);
      if (!scale) throw Error('missing phone scale ' + scaleLabel);
      scale.click(); await pause(20);
      document.querySelector('[role=dialog] .sheet-cancel').click(); await pause(20);
      for (let month = 1; month <= 12; month++) {
        document.querySelector('.phone-month-select__current').click(); await pause(12);
        document.querySelectorAll('.month-switch-grid button')[month - 1].click(); await pause(16);
        const proof = document.querySelector('.editor-page .calendar-proof');
        const dates = proof.querySelector('.calendar-proof__dates');
        const title = proof.querySelector('.calendar-proof__title');
        if (dates.scrollHeight > dates.clientHeight + 1 || title.scrollWidth > title.clientWidth + 1) errors.push({preset: presetLabel, scale: scaleLabel, month, dates: [dates.scrollHeight, dates.clientHeight], title: [title.scrollWidth, title.clientWidth]});
      }
      [...document.querySelectorAll('.mobile-style-trigger')].find(button => button.textContent.includes('日历文字')).click(); await pause(20);
    }
  }
  return errors;
})()`;
const phoneOverflow = await evaluate(phoneCheckExpression);
console.log('phone overflow', JSON.stringify(phoneOverflow));
assert.equal(phoneOverflow.length, 0);
await call('Emulation.setDeviceMetricsOverride', { width: 320, height: 760, deviceScaleFactor: 1, mobile: true });
const narrowOverflow = await evaluate(phoneCheckExpression);
console.log('320px overflow', JSON.stringify(narrowOverflow));
assert.equal(narrowOverflow.length, 0);
await evaluate("document.querySelector('[role=dialog] .sheet-cancel').click()");
const narrowProofShot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await writeFile('qa/m4-narrow-proof.png', Buffer.from(narrowProofShot.data, 'base64'));
ws.close();
