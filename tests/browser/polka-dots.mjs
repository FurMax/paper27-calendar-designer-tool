import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const origin = 'http://127.0.0.1:4173';
const port = process.env.CDP_PORT ?? '9230';
const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(origin + '/')}`, { method:'PUT' })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve,reject) => { ws.addEventListener('open',resolve,{once:true}); ws.addEventListener('error',reject,{once:true}); });
let sequence=1; const pending=new Map(); const errors=[];
ws.addEventListener('message', event => { const message=JSON.parse(event.data); if(message.method==='Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text); const job=pending.get(message.id); if(!job)return; pending.delete(message.id); message.error?job.reject(Error(message.error.message)):job.resolve(message.result); });
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=sequence++;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);return result.result.value;}
async function run(fn,...args){return evaluate(`(${fn.toString()})(${args.map(JSON.stringify).join(',')})`);}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(fn,label,...args){for(let i=0;i<120;i++){if(await run(fn,...args))return;await pause(100);}throw Error('Timed out: '+label);}
async function click(selector,label){await run((selector,label)=>{const target=[...document.querySelectorAll(selector)].find(item=>item.textContent.includes(label)||item.getAttribute('aria-label')?.includes(label));if(!target)throw Error('Missing '+selector+' '+label);target.click();},selector,label);}
await call('Page.enable'); await call('Runtime.enable');
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await call('Storage.clearDataForOrigin',{origin,storageTypes:'indexeddb'});
await call('Page.navigate',{url:origin+'/'}); await until(()=>!!document.querySelector('.entry-page input[type=file]'),'Entry');
await run(async()=>{const canvas=document.createElement('canvas');canvas.width=720;canvas.height=850;const ctx=canvas.getContext('2d');ctx.fillStyle='#CBA99D';ctx.fillRect(0,0,720,850);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));const transfer=new DataTransfer();for(let month=1;month<=12;month++)transfer.items.add(new File([blob],`photo-${month}.png`,{type:'image/png'}));const input=document.querySelector('.entry-page input[type=file]');input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));});
await until(()=>!!document.querySelector('.month-grid'),'Assign'); await click('.desktop-nav button','编辑月份'); await until(()=>!!document.querySelector('.editor-page .texture-controls'),'Editor');
await run(()=>{const original=URL.createObjectURL.bind(URL);window.__polkaBlobs=new Map();window.__polkaClicks=[];URL.createObjectURL=blob=>{const url=original(blob);window.__polkaBlobs.set(url,blob);return url;};HTMLAnchorElement.prototype.click=function(){window.__polkaClicks.push({name:this.download,url:this.href});};});
async function exportPrint(){await click('.month-export__trigger','导出本月');await click('.month-export__menu button','印刷版 · PNG');await until(()=>document.querySelector('.month-export-status')?.textContent.includes('已尝试下载'),'PNG');const result=await run(async()=>{const handoff=window.__polkaClicks.at(-1);const blob=window.__polkaBlobs.get(handoff?.url);if(!blob)throw Error('PNG missing');const bitmap=await createImageBitmap(blob);const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0);bitmap.close();function hash(x,y,w,h){const data=ctx.getImageData(x,y,w,h).data;let value=2166136261;for(let i=0;i<data.length;i++)value=Math.imul(value^data[i],16777619)>>>0;return value;}return{width:canvas.width,height:canvas.height,photo:hash(220,200,100,100),calendar:hash(600,1200,300,150),edges:[hash(0,1063,35,780),hash(1216,1063,36,780),hash(0,1807,1252,36),hash(35,1063,35,744),hash(1181,1063,35,744),hash(35,1063,1181,35),hash(35,1772,1181,35)],title:hash(100,1120,600,100),blank:[...ctx.getImageData(1100,1450,1,1).data],dot:[...ctx.getImageData(130,1122,1,1).data],space:[...ctx.getImageData(160,1122,1,1).data],font:[...document.fonts].filter(face=>face.family.includes('Fraunces')).map(face=>face.status)};});await click('.month-export-status button','关闭');return result;}
const baseline=await exportPrint();
await click('.texture-options button.texture-thumb','波点');
const proof=await run(()=>({texture:document.querySelector('.calendar-proof__dates').dataset.texture,selected:[...document.querySelectorAll('.texture-options button.texture-thumb')].filter(item=>item.getAttribute('aria-pressed')==='true').map(item=>item.getAttribute('aria-label')),image:getComputedStyle(document.querySelector('.calendar-proof__dates')).backgroundImage.startsWith('url(')}));
assert.equal(proof.texture,'dots');assert.deepEqual(proof.selected,['使用纹理 波点']);assert.equal(proof.image,true);
const dotted=await exportPrint();assert.deepEqual([dotted.width,dotted.height],[1252,1843]);assert.equal(dotted.photo,baseline.photo);assert.notEqual(dotted.calendar,baseline.calendar);assert.deepEqual(dotted.edges,baseline.edges);
const pixels=await run(async()=>{const handoff=window.__polkaClicks.at(-1),blob=window.__polkaBlobs.get(handoff.url),bitmap=await createImageBitmap(blob),canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0);bitmap.close();const at=(x,y)=>[...ctx.getImageData(x,y,1,1).data];const url=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});return{dot:at(130,1122),space:at(160,1122),url};});
assert.ok(pixels.dot[0]<pixels.space[0]-15,JSON.stringify({dot:pixels.dot,space:pixels.space}));
if(port==='9230')await writeFile('qa/v1-1-polka-dots-print.png',Buffer.from(pixels.url.split(',')[1],'base64'));
const colorChecks=[];
await click('.palette-custom-toggle','精确调色');
for (const [color, mode] of [['#C8324D','white'],['#477B66','white'],['#376FAE','white'],['#F7F4EE','dark']]) {
  await run(color=>{const input=document.querySelector('input[aria-label="背景色系统调色器"]');const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(input,color);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));},color);
  await until(color=>document.querySelector('.proof-workspace .calendar-proof')?.style.getPropertyValue('--proof-background')===color,'background '+color,color);
  const rendered=await exportPrint();
  const direction=rendered.dot[0]-rendered.space[0];
  assert.ok(mode==='white'?direction>8:direction< -8,JSON.stringify({color,mode,dot:rendered.dot,space:rendered.space}));
  colorChecks.push({color,mode,dot:rendered.dot,space:rendered.space});
  if (port==='9230' && color==='#C8324D') {
    const data=await run(async()=>{const handoff=window.__polkaClicks.at(-1),blob=window.__polkaBlobs.get(handoff.url);return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});});
    await writeFile('qa/v1-1-polka-white-red-print.png',Buffer.from(data.split(',')[1],'base64'));
  }
}

delete pixels.url;
const mobile=[];for(const width of [390,320]){await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});await pause(100);const result=await run(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,option:[...document.querySelectorAll('.texture-options button.texture-thumb')].find(item=>item.getAttribute('aria-label')?.includes('波点'))?.getAttribute('aria-label')}));assert.equal(result.overflow,false);assert.equal(result.option,'使用纹理 波点');mobile.push(result);}
assert.deepEqual(errors,[]);
console.log(JSON.stringify({port,proof,baseline,dotted,pixels,colorChecks,mobile,errors}));ws.close();
