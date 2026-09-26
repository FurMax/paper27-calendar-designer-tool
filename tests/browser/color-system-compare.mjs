import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const port = process.env.CDP_PORT ?? '9230';
const origin = 'http://127.0.0.1:5173';
const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const tab = tabs.find(item => item.type === 'page' && item.url.startsWith(origin));
assert.ok(tab, 'isolated test tab missing');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let sequence = 1;
const jobs = new Map();
ws.addEventListener('message', event => { const message = JSON.parse(event.data), job = jobs.get(message.id); if (!job) return; jobs.delete(message.id); message.error ? job.reject(Error(message.error.message)) : job.resolve(message.result); });
const call = (method, params = {}) => new Promise((resolve, reject) => { const id = sequence++; jobs.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
async function evaluate(expression) { const result = await call('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression }); if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text); return result.result.value; }
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression) { for (let i = 0; i < 50; i++) { if (await evaluate(expression)) return; await pause(150); } throw Error('timeout: '+expression); }
async function shot(name) { const result = await call('Page.captureScreenshot', { format:'png', captureBeyondViewport:false }); await writeFile(`qa/color-system-comparison/${name}.png`, Buffer.from(result.data,'base64')); }
async function editor() { await evaluate("[...document.querySelectorAll('.desktop-nav button')].find(b => b.textContent.includes('编辑月份'))?.click()"); await until("!!document.querySelector('.editor-layout')"); await evaluate('scrollTo(0,0)'); await pause(180); }
async function review() { await evaluate("[...document.querySelectorAll('.desktop-nav button')].find(b => b.textContent.includes('预览与导出'))?.click()"); await until("!!document.querySelector('.review-grid')"); await evaluate('scrollTo(0,0)'); await pause(180); }
await call('Emulation.setDeviceMetricsOverride', { width:1440,height:900,deviceScaleFactor:1,mobile:false });
await editor(); await shot('editor-ink-teal');
await review(); await shot('review-ink-teal');
const css = await readFile('qa/color-system-comparison/candidate.css','utf8');
await evaluate(`(() => { const old=document.getElementById('baby-blue-preview'); if(old) old.remove(); const style=document.createElement('style'); style.id='baby-blue-preview'; style.textContent=${JSON.stringify(css)}; document.head.append(style); return true; })()`);
await editor(); await shot('editor-baby-blue-mint');
const editorStyles = await evaluate(`(() => { const read=s=>{const e=document.querySelector(s),c=getComputedStyle(e);return {background:c.backgroundColor,color:c.color,border:c.borderColor}}; return {primary:read('.editor-head .button'),month:read('.month-nav .is-current'),workspace:read('.proof-workspace'),panel:read('.properties-panel'),photoAction:read('.sample-color-trigger')}; })()`);
await evaluate("document.querySelector('.sample-color-trigger')?.scrollIntoView({block:'center'})"); await pause(160); await shot('editor-controls-baby-blue-mint');
await evaluate("document.querySelector('.sample-color-trigger')?.click()"); await until("document.querySelectorAll('.photo-recommendations__item').length===3"); await shot('photo-recommendations-baby-blue-mint');
await evaluate("document.querySelector('.photo-sample-sheet .sheet-heading button')?.click()");
await review(); await shot('review-baby-blue-mint');
await evaluate("document.querySelector('.set-color-panel')?.scrollIntoView({block:'center'})"); await pause(160); await shot('review-actions-baby-blue-mint');
await evaluate("document.querySelector('.page-actions .button--primary')?.scrollIntoView({block:'center'})"); await pause(160); await shot('review-export-cta-baby-blue-mint');
const exportStyles = await evaluate("(() => { const b=document.querySelector('.page-actions .button--primary'),c=getComputedStyle(b); return {background:c.backgroundColor,color:c.color,opacity:c.opacity}; })()");
await evaluate("[...document.querySelectorAll('.set-color-panel button')].find(b=>b.textContent.includes('推荐配色'))?.click()"); await until("document.querySelectorAll('.set-color-row').length===12"); await shot('color-dialog-baby-blue-mint');
await evaluate("document.querySelector('.set-color-sheet .sheet-heading button')?.click()");
await editor();
await call('Emulation.setDeviceMetricsOverride', { width:320,height:720,deviceScaleFactor:1,mobile:true }); await pause(180); await shot('editor-phone-baby-blue-mint');
const mobile = await evaluate("({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})");
await evaluate("[...document.querySelectorAll('.mobile-style-trigger')].find(b=>b.textContent==='背景色')?.click()"); await until("!!document.querySelector('.action-sheet .sample-color-trigger')");
await evaluate("document.querySelector('.action-sheet .sample-color-trigger')?.click()"); await until("document.querySelectorAll('.photo-recommendations__item').length===3"); await shot('photo-recommendations-phone-baby-blue-mint');
await evaluate("document.querySelector('.photo-sample-sheet .sheet-heading button')?.click()");
await evaluate("document.getElementById('baby-blue-preview')?.remove()");
await call('Emulation.clearDeviceMetricsOverride'); ws.close();
console.log(JSON.stringify({editorStyles,exportStyles,mobile}));
