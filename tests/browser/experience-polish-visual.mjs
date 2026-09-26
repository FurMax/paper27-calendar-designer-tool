import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const tag = process.argv[2] ?? 'before';
const port = process.env.CDP_PORT ?? '9230';
const origin = 'http://127.0.0.1:5173';
const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const tab = tabs.find(item => item.type === 'page' && item.url.startsWith(origin));
assert.ok(tab, 'isolated test tab missing');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once:true }));
let sequence=1;const jobs=new Map();
ws.addEventListener('message',event=>{const message=JSON.parse(event.data),job=jobs.get(message.id);if(!job)return;jobs.delete(message.id);message.error?job.reject(Error(message.error.message)):job.resolve(message.result);});
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=sequence++;jobs.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const result=await call('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);return result.result.value;}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(expression){for(let i=0;i<70;i++){if(await evaluate(expression))return;await pause(150);}throw Error('timeout '+expression);}
await mkdir('qa/experience-polish',{recursive:true});
async function shot(name){const result=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(`qa/experience-polish/${tag}-${name}.png`,Buffer.from(result.data,'base64'));}
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:origin+'/'});await pause(550);await shot('entry');
await evaluate("[...document.querySelectorAll('.entry-page button')].find(b=>b.textContent.includes('继续编辑日历'))?.click()");
await until("!!document.querySelector('.desktop-nav')");
await evaluate("[...document.querySelectorAll('.desktop-nav button')].find(b=>b.textContent.includes('编辑月份'))?.click()");
await until("!!document.querySelector('.editor-layout')");await evaluate('scrollTo(0,0)');await pause(250);await shot('editor');
await evaluate("document.querySelector('.monthly-photo-colors')?.scrollIntoView({block:'center'})");await pause(150);await shot('panel-recommendation');
await evaluate("[...document.querySelectorAll('.desktop-nav button')].find(b=>b.textContent.includes('预览与导出'))?.click()");
await until("!!document.querySelector('.review-grid')");await evaluate('scrollTo(0,0)');await pause(180);await shot('review');
await evaluate("document.querySelector('.set-color-panel')?.scrollIntoView({block:'center'})");await pause(130);await shot('review-actions');
await evaluate("[...document.querySelectorAll('.set-color-panel button')].find(b=>b.textContent.includes('推荐配色'))?.click()");
await until("document.querySelectorAll('.set-color-row').length===12");await shot('palette-sheet');
await evaluate("document.querySelector('.set-color-sheet .sheet-heading button')?.click()");
await evaluate("[...document.querySelectorAll('.desktop-nav button')].find(b=>b.textContent.includes('编辑月份'))?.click()");await until("!!document.querySelector('.editor-layout')");
await call('Emulation.setDeviceMetricsOverride',{width:320,height:720,deviceScaleFactor:1,mobile:true});await pause(160);await evaluate('scrollTo(0,0)');await shot('mobile-editor');
await evaluate("[...document.querySelectorAll('.mobile-style-trigger')].find(b=>b.textContent==='背景色')?.click()");await until("!!document.querySelector('.action-sheet .monthly-photo-colors')");await shot('mobile-background');
const overflow=await evaluate('document.documentElement.scrollWidth>innerWidth');assert.equal(overflow,false);
await call('Emulation.clearDeviceMetricsOverride');ws.close();
console.log(JSON.stringify({tag,overflow}));
