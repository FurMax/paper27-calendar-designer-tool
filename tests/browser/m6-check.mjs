import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';

const base = 'http://127.0.0.1:5173/';
const target = (await (await fetch('http://127.0.0.1:9226/json/list')).json()).find(item => item.type === 'page' && item.url.startsWith(base));
assert.ok(target);
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
let id=1;const pending=new Map();
ws.addEventListener('message',event=>{const data=JSON.parse(event.data);const job=pending.get(data.id);if(!job)return;pending.delete(data.id);data.error?job.reject(Error(data.error.message)):job.resolve(data.result);});
const call=(method,params={})=>new Promise((resolve,reject)=>{const key=id++;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});
async function evaluate(expression){const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);return result.result.value;}
const downloadDir=path.join(process.env.TEMP ?? process.env.TMP ?? '.', 'calendar-studio-m6-downloads');
await mkdir(downloadDir,{recursive:true});
await unlink(path.join(downloadDir,'01-January-2027.png')).catch(error=>{if(error.code!=='ENOENT')throw error;});
await call('Page.setDownloadBehavior',{behavior:'allow',downloadPath:downloadDir});
await call('Storage.clearDataForOrigin',{origin:'http://127.0.0.1:5173',storageTypes:'indexeddb'});
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:base});await new Promise(r=>setTimeout(r,900));
const ready = await evaluate(`(async()=>{
  const pause=ms=>new Promise(r=>setTimeout(r,ms));
  [...document.querySelectorAll('.entry-page button')].find(x=>x.textContent.includes('逐月添加照片')).click();await pause(60);
  [...document.querySelectorAll('.desktop-nav button')].find(x=>x.textContent.includes('编辑月份')).click();await pause(60);
  const canvas=document.createElement('canvas');canvas.width=320;canvas.height=220;const ctx=canvas.getContext('2d');
  const gradient=ctx.createLinearGradient(0,0,320,220);gradient.addColorStop(0,'#EB4F42');gradient.addColorStop(0.5,'#38B56D');gradient.addColorStop(1,'#3457D5');ctx.fillStyle=gradient;ctx.fillRect(0,0,320,220);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  const file=new File([blob],'m6-gradient.png',{type:'image/png'});const dt=new DataTransfer();dt.items.add(file);
  const input=document.querySelector('.editor-page input[type=file]');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));await pause(600);
  document.querySelector('.quick-colors button[title="#1E3933"]').click();
  [...document.querySelectorAll('.font-options button')].find(x=>x.textContent.includes('经典')).click();
  [...document.querySelectorAll('.segmented button')].find(x=>x.textContent.trim()==='大').click();
  const zoom=document.querySelector('#crop-zoom-desktop');zoom.focus();Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(zoom,'1.5');zoom.dispatchEvent(new Event('input',{bubbles:true}));zoom.dispatchEvent(new Event('change',{bubbles:true}));zoom.blur();
  await pause(700);
  return {ready:document.querySelector('.status-pill')?.textContent,exportEnabled:![...document.querySelectorAll('.properties-panel button')].find(x=>x.textContent.includes('生成本月 PNG')).disabled,missingDisabled:[...document.querySelectorAll('.month-nav button')][1].textContent};
})()`);
console.log('ready',ready);assert.equal(ready.ready,'已就绪');assert.equal(ready.exportEnabled,true);
const previewShot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
await writeFile('qa/m6-preview.png',Buffer.from(previewShot.data,'base64'));
const synthetic = await evaluate(`(async()=>{
  const project=(await import('/src/domain/project.ts'));const renderer=(await import('/src/export/canvasRenderer.ts'));
  const cases=[];
  for(const [width,height,preset,scale] of [[300,450,'classic','small'],[450,300,'minimal','standard'],[400,400,'handwritten','large']]){
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle='#00CC66';ctx.fillRect(0,0,width,height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    const state=project.createEmptyProject('synthetic');state.assets.a={id:'a',blob,mime:'image/png',fileName:'sample.png',byteSize:blob.size,decodedWidth:width,decodedHeight:height,importedAt:''};
    state.project.photoItems.i={id:'i',assetId:'a',createdAt:''};state.project.months[1].photoItemId='i';state.project.months[1].crop={zoom:1.7,offsetX:0.6,offsetY:-0.4};
    state.project.months[1].style={background:'#123456',text:{mode:'custom',color:'#FFFFFF'}};state.project.typography={presetId:preset,scale};
    const png=await renderer.renderMonthPng(state,1);const bitmap=await createImageBitmap(png.blob);const output=document.createElement('canvas');output.width=1200;output.height=1800;const out=output.getContext('2d');out.drawImage(bitmap,0,0);bitmap.close();
    const sample=(x,y)=>[...out.getImageData(x,y,1,1).data];
    cases.push({width,height,preset,scale,bytes:png.blob.size,filename:png.fileName,left:sample(0,500),right:sample(1199,500),top:sample(600,0),calendarLeft:sample(0,1044),calendarBottom:sample(1199,1799)});
  }
  let missingError='';try{await renderer.renderMonthPng(project.createEmptyProject('missing'),2);}catch(e){missingError=e.message;}
  return {cases,missingError};
})()`);
console.log('synthetic',synthetic);
for(const item of synthetic.cases){assert.equal(item.filename,'01-January-2027.png');assert.deepEqual(item.left,[0,204,102,255]);assert.deepEqual(item.right,[0,204,102,255]);assert.deepEqual(item.top,[0,204,102,255]);assert.deepEqual(item.calendarLeft,[18,52,86,255]);assert.deepEqual(item.calendarBottom,[18,52,86,255]);}
assert.ok(synthetic.missingError.includes('缺少'));
const sampleBase64=await evaluate(`(async()=>{const state=await (await import('/src/persistence/indexedDb.ts')).loadProject();const png=await (await import('/src/export/canvasRenderer.ts')).renderMonthPng(state,1);return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(png.blob);});})()`);
await writeFile('qa/m6-sample.png',Buffer.from(sampleBase64,'base64'));
const file=await readFile('qa/m6-sample.png');assert.deepEqual([...file.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(file.readUInt32BE(16),1200);assert.equal(file.readUInt32BE(20),1800);
console.log('sample PNG bytes',file.length);
const failure=await evaluate(`(async()=>{const pause=ms=>new Promise(r=>setTimeout(r,ms));const original=document.fonts.load.bind(document.fonts);document.fonts.load=async()=>[];[...document.querySelectorAll('.properties-panel button')].find(x=>x.textContent.includes('生成本月 PNG')).click();await pause(200);const error=document.querySelector('.single-export-status')?.textContent;document.fonts.load=original;[...document.querySelectorAll('.single-export-status button')].find(x=>x.textContent.includes('重试生成')).click();await pause(500);return {error,ready:document.querySelector('.single-export-status')?.textContent};})()`);
console.log('font failure/retry',failure);assert.ok(failure.error.includes('字体'));assert.ok(failure.ready.includes('已准备好'));
await evaluate(`(()=>{[...document.querySelectorAll('.single-export-status button')].find(x=>x.textContent.includes('下载 PNG')).click();return true;})()`);
let downloaded=false;
for(let attempt=0;attempt<20;attempt++){const names=await readdir(downloadDir);if(names.includes('01-January-2027.png')){downloaded=true;break;}await new Promise(r=>setTimeout(r,200));}
assert.equal(downloaded,true);
const downloadedPng=await readFile(path.join(downloadDir,'01-January-2027.png'));
assert.deepEqual([...downloadedPng.subarray(0,8)],[137,80,78,71,13,10,26,10]);
assert.equal(downloadedPng.readUInt32BE(16),1200);assert.equal(downloadedPng.readUInt32BE(20),1800);
console.log('download bytes',downloadedPng.length);
const monthSwitch = await evaluate(`(async()=>{const pause=ms=>new Promise(r=>setTimeout(r,ms));[...document.querySelectorAll('.single-export-status button')].find(x=>x.textContent.includes('关闭')).click();const original=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(callback,...args){setTimeout(()=>original.call(this,callback,...args),300);};[...document.querySelectorAll('.properties-panel button')].find(x=>x.textContent.includes('生成本月 PNG')).click();document.querySelectorAll('.month-nav button')[1].click();await pause(700);HTMLCanvasElement.prototype.toBlob=original;return {url:location.pathname,staleStatus:!!document.querySelector('.single-export-status'),missingDisabled:[...document.querySelectorAll('.properties-panel button')].find(x=>x.textContent.includes('生成本月 PNG')).disabled};})()`);
console.log('month switch during render',monthSwitch);
assert.equal(monthSwitch.url,'/editor/2');assert.equal(monthSwitch.staleStatus,false);assert.equal(monthSwitch.missingDisabled,true);
ws.close();
