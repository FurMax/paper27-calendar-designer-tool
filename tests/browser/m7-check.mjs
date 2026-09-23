import assert from 'node:assert/strict';
import { mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
const base='http://127.0.0.1:5173/';
const target=(await (await fetch('http://127.0.0.1:9227/json/list')).json()).find(x=>x.type==='page'&&x.url.startsWith(base));assert.ok(target);
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
let id=1;const jobs=new Map();ws.addEventListener('message',event=>{const data=JSON.parse(event.data),job=jobs.get(data.id);if(!job)return;jobs.delete(data.id);data.error?job.reject(Error(data.error.message)):job.resolve(data.result);});
const call=(method,params={})=>new Promise((resolve,reject)=>{const key=id++;jobs.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
async function evaluate(expression){const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);return result.result.value;}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const downloadDir=path.join(process.env.TEMP??'.','calendar-studio-m7-downloads');await mkdir(downloadDir,{recursive:true});
const zipName='Calendar-Design-Studio-2027.zip';await unlink(path.join(downloadDir,zipName)).catch(error=>{if(error.code!=='ENOENT')throw error;});
await call('Page.setDownloadBehavior',{behavior:'allow',downloadPath:downloadDir});
await call('Storage.clearDataForOrigin',{origin:'http://127.0.0.1:5173',storageTypes:'indexeddb'});
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:base});await pause(700);
const incomplete=await evaluate(`(async()=>{[...document.querySelectorAll('.entry-page button')].find(x=>x.textContent.includes('逐月添加照片')).click();await new Promise(r=>setTimeout(r,70));[...document.querySelectorAll('.desktop-nav button')].find(x=>x.textContent.includes('预览与导出')).click();await new Promise(r=>setTimeout(r,70));return {disabled:document.querySelector('.page-actions button').disabled,links:document.querySelectorAll('.review-missing button').length};})()`);
console.log('incomplete',incomplete);assert.equal(incomplete.disabled,true);assert.equal(incomplete.links,12);
const seeded=await evaluate(`(async()=>{const {createEmptyProject}=await import('/src/domain/project.ts');const {commitProject}=await import('/src/persistence/indexedDb.ts');
  const canvas=document.createElement('canvas');canvas.width=600;canvas.height=900;const ctx=canvas.getContext('2d');ctx.fillStyle='#2EBE70';ctx.fillRect(0,0,600,900);const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));
  const state=createEmptyProject('m7-browser');state.assets.a={id:'a',blob,mime:'image/png',fileName:'same-source.png',byteSize:blob.size,decodedWidth:600,decodedHeight:900,importedAt:''};
  for(let month=1;month<=12;month++){const id='i'+month;state.project.photoItems[id]={id,assetId:'a',createdAt:''};state.project.months[month].photoItemId=id;state.project.months[month].crop={zoom:month===2?1.4:1,offsetX:0,offsetY:0};state.project.months[month].style.background=month===12?'#123456':'#FFFFFF';}
  await commitProject(state,null);return blob.size;})()`);
console.log('seed asset bytes',seeded);await call('Page.navigate',{url:base});await pause(700);await evaluate("(()=>{[...document.querySelectorAll('.entry-page button')].find(x=>x.textContent.includes('继续编辑日历')).click();return true;})()");await pause(100);await evaluate("(()=>{[...document.querySelectorAll('.desktop-nav button')].find(x=>x.textContent.includes('预览与导出')).click();return true;})()");await pause(100);
const ready=await evaluate(`({enabled:!document.querySelector('.page-actions button').disabled,count:document.querySelector('.page-header p')?.textContent})`);console.log('ready',ready);assert.equal(ready.enabled,true);assert.ok(ready.count.includes('12 / 12'));await pause(500);const baseline=await evaluate("(async()=>{const s=await (await import('/src/persistence/indexedDb.ts')).loadProject();return JSON.stringify({project:s.project,assets:Object.keys(s.assets).sort().map(id=>[id,s.assets[id].blob.size])});})()");
const cancelled=await evaluate(`(async()=>{const pause=ms=>new Promise(r=>setTimeout(r,ms));const original=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(callback,...args){setTimeout(()=>original.call(this,callback,...args),50);};document.querySelector('.page-actions button').click();await pause(130);const progress=document.querySelector('.export-sheet')?.textContent;[...document.querySelectorAll('.export-sheet button')].find(x=>x.textContent.includes('取消生成')).click();await pause(400);HTMLCanvasElement.prototype.toBlob=original;return {progress,closed:!document.querySelector('.export-sheet')};})()`);
console.log('cancelled',cancelled);assert.ok(cancelled.progress.includes('正在生成'));assert.equal(cancelled.closed,true);
const failed=await evaluate(`(async()=>{const pause=ms=>new Promise(r=>setTimeout(r,ms));const original=document.fonts.load.bind(document.fonts);document.fonts.load=async()=>[];document.querySelector('.page-actions button').click();await pause(250);const error=document.querySelector('.export-sheet')?.textContent;document.fonts.load=original;[...document.querySelectorAll('.export-sheet button')].find(x=>x.textContent.includes('重试')).click();for(let i=0;i<40&&!document.querySelector('.export-sheet')?.textContent.includes('下载 ZIP');i++)await pause(200);return {error,ready:document.querySelector('.export-sheet')?.textContent};})()`);
console.log('failure/retry',failed.error,failed.ready?.slice(0,130));assert.ok(failed.error.includes('1 月 PNG 生成失败'));assert.ok(failed.ready.includes('12 张独立 PNG 已准备好'));
await evaluate(`(()=>{[...document.querySelectorAll('.export-sheet button')].find(x=>x.textContent.includes('下载 ZIP')).click();return true;})()`);
let downloaded=false;for(let attempt=0;attempt<30;attempt++){if((await readdir(downloadDir)).includes(zipName)){downloaded=true;break;}await pause(200);}assert.equal(downloaded,true);
console.log('download',path.join(downloadDir,zipName));
const after=await evaluate(`({message:document.querySelector('.export-sheet')?.textContent,url:location.pathname})`);assert.ok(after.message.includes('已向浏览器发起 ZIP 下载'));assert.equal(after.url,'/review');const finalState=await evaluate("(async()=>{const s=await (await import('/src/persistence/indexedDb.ts')).loadProject();return JSON.stringify({project:s.project,assets:Object.keys(s.assets).sort().map(id=>[id,s.assets[id].blob.size])});})()");assert.equal(finalState,baseline);
ws.close();


