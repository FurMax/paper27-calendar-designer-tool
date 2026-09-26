import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const origin='http://127.0.0.1:5173',port=process.env.CDP_PORT??'9230';
const tab=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(item=>item.type==='page'&&item.url.startsWith(origin));assert.ok(tab);
const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let id=1;const pending=new Map();ws.addEventListener('message',event=>{const message=JSON.parse(event.data),job=pending.get(message.id);if(!job)return;pending.delete(message.id);message.error?job.reject(Error(message.error.message)):job.resolve(message.result);});
const call=(method,params={})=>new Promise((resolve,reject)=>{const next=id++;pending.set(next,{resolve,reject});ws.send(JSON.stringify({id:next,method,params}));});
async function evaluate(expression){const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);return result.result.value;}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(expression){for(let n=0;n<250;n++){if(await evaluate(expression))return;await pause(150);}throw Error('timeout '+expression);}
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:origin+'/'});await pause(500);
await evaluate("[...document.querySelectorAll('.entry-page button')].find(b=>b.textContent.includes('继续编辑日历')).click()");await until("!!document.querySelector('.desktop-nav')");
await evaluate("[...document.querySelectorAll('.desktop-nav button')].find(b=>b.textContent.includes('预览与导出')).click()");await until("!!document.querySelector('.review-grid')");
await evaluate("window.__monthSteps=[];window.__stepObserver=new MutationObserver(()=>{const e=document.querySelector('.export-month-progress');if(e){const n=e.querySelectorAll('.is-complete').length;if(window.__monthSteps.at(-1)!==n)window.__monthSteps.push(n)}});window.__stepObserver.observe(document.body,{subtree:true,childList:true,attributes:true,characterData:true})");
await evaluate("document.querySelector('.page-actions .button--primary').click()");await until("!!document.querySelector('.export-sheet')");
await until("['warning','working','ready','error'].some(x=>document.querySelector('.export-sheet')?.textContent.includes(x)) || !!document.querySelector('.edge-warning-months') || !!document.querySelector('.export-month-progress') || !!document.querySelector('.export-success')");
if(await evaluate("!!document.querySelector('.edge-warning-months')"))await evaluate("[...document.querySelectorAll('.export-sheet button')].find(b=>b.textContent.includes('仍然生成')).click()");
await until("!!document.querySelector('.export-success') || !!document.querySelector('.export-sheet [role=alert]')");
const result=await evaluate("({steps:window.__monthSteps,ready:!!document.querySelector('.export-success'),message:document.querySelector('.export-success')?.textContent,progressChips:document.querySelectorAll('.export-month-progress span').length})");
assert.equal(result.ready,true,JSON.stringify(result));assert.ok(result.steps.includes(12),JSON.stringify(result));assert.ok(result.steps.some(n=>n>0&&n<12),JSON.stringify(result));
const screenshot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile('qa/experience-polish/after-export-ready.png',Buffer.from(screenshot.data,'base64'));
await evaluate("window.__stepObserver.disconnect();document.querySelector('.export-sheet .sheet-heading button')?.click()");
await call('Emulation.clearDeviceMetricsOverride');ws.close();console.log(JSON.stringify(result));
