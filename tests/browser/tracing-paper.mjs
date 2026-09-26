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
await run(()=>{const original=URL.createObjectURL.bind(URL);window.__retroBlobs=new Map();window.__retroClicks=[];URL.createObjectURL=blob=>{const url=original(blob);window.__retroBlobs.set(url,blob);return url;};HTMLAnchorElement.prototype.click=function(){window.__retroClicks.push({name:this.download,url:this.href});};});
async function exportPrint(){await click('.month-export__trigger','导出本月');await click('.month-export__menu button','印刷版 · PNG');await until(()=>document.querySelector('.month-export-status')?.textContent.includes('已尝试下载'),'PNG');const result=await run(async()=>{const handoff=window.__retroClicks.at(-1);const blob=window.__retroBlobs.get(handoff?.url);if(!blob)throw Error('PNG missing');const bitmap=await createImageBitmap(blob);const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0);bitmap.close();function hash(x,y,w,h){const data=ctx.getImageData(x,y,w,h).data;let value=2166136261;for(let i=0;i<data.length;i++)value=Math.imul(value^data[i],16777619)>>>0;return value;}return{width:canvas.width,height:canvas.height,photo:hash(220,200,100,100),calendar:hash(600,1200,200,100),title:hash(100,1120,600,100),blank:[...ctx.getImageData(1100,1450,1,1).data],font:[...document.fonts].filter(face=>face.family.includes('Fraunces')).map(face=>face.status)};});await click('.month-export-status button','关闭');return result;}
const baseline=await exportPrint();
await click('.font-options button','复古');
await until(()=>[...document.fonts].some(face=>face.family.includes('Fraunces')&&face.status==='loaded'),'Fraunces loaded');
const retroProof=await run(()=>({selected:[...document.querySelectorAll('.font-options button')].find(item=>item.getAttribute('aria-pressed')==='true')?.textContent,family:getComputedStyle(document.querySelector('.calendar-proof__title strong')).fontFamily,overflow:document.querySelector('.font-options').scrollWidth>document.querySelector('.font-options').clientWidth}));
assert.ok(retroProof.selected.includes('复古'));assert.ok(retroProof.family.includes('Fraunces'));assert.equal(retroProof.overflow,false);
const retro=await exportPrint();assert.deepEqual([retro.width,retro.height],[1252,1843]);assert.notEqual(retro.title,baseline.title);assert.equal(retro.photo,baseline.photo);
await click('.texture-options button.texture-thumb','硫酸纸');
const textureProof=await run(()=>({texture:document.querySelector('.calendar-proof__dates').dataset.texture,imagePresent:getComputedStyle(document.querySelector('.calendar-proof__dates')).backgroundImage.startsWith('url('),photoImage:getComputedStyle(document.querySelector('.calendar-proof__photo')).backgroundImage,selected:[...document.querySelectorAll('.texture-options button.texture-thumb')].filter(item=>item.getAttribute('aria-pressed')==='true').map(item=>item.getAttribute('aria-label'))}));
assert.equal(textureProof.texture,'vellum');assert.equal(textureProof.imagePresent,true);assert.equal(textureProof.selected.length,1);assert.ok(!textureProof.photoImage.includes('data:image'));
const vellum=await exportPrint();assert.deepEqual([vellum.width,vellum.height],[1252,1843]);assert.equal(vellum.photo,retro.photo);assert.notEqual(vellum.calendar,retro.calendar);
if(port==='9230'){const image=await run(async()=>{const handoff=window.__retroClicks.at(-1),blob=window.__retroBlobs.get(handoff.url);return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});});await writeFile('qa/v1-1-tracing-paper-print.png',Buffer.from(image.split(',')[1],'base64'));}
await click('.palette-custom-toggle','精确调色');
await run(()=>{const input=document.querySelector('input[aria-label="背景色 HEX"]');input.focus();input.select();});
await call('Input.insertText',{text:'#555555'});
await run(()=>document.querySelector('input[aria-label="背景色 HEX"]').blur());
await until(()=>document.querySelector('.calendar-proof')?.style.getPropertyValue('--proof-background')==='#555555','dark background');
const dark=await exportPrint();assert.equal(dark.photo,vellum.photo);assert.ok(Math.max(...dark.blank.slice(0,3))<130,JSON.stringify(dark.blank));
const trigger=await run(()=>{const button=document.querySelector('.month-export__trigger'),span=button.querySelector('span'),box=button.getBoundingClientRect(),icon=span.getBoundingClientRect();return{buttonCenter:box.top+box.height/2,iconCenter:icon.top+icon.height/2,buttonWidth:box.width,iconHeight:icon.height};});assert.ok(Math.abs(trigger.buttonCenter-trigger.iconCenter)<1);
const mobile=[];for(const width of [390,360,320]){await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});await pause(100);const result=await run(()=>({viewport:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,fonts:[...document.querySelectorAll('.font-options button')].map(item=>item.getBoundingClientRect().width),textures:[...document.querySelectorAll('.texture-options button.texture-thumb')].map(item=>item.getAttribute('aria-label'))}));assert.equal(result.overflow,false);assert.ok(result.textures.some(item=>item.includes('硫酸纸')));mobile.push(result);}
await click('.scale-options button','大');
const monthWidths=[];
for(let month=1;month<=12;month++){
  await run(month=>document.querySelectorAll('.month-nav button')[month-1].click(),month);
  await until(month=>document.querySelector('.month-nav [aria-current="page"]')?.textContent.includes(month+' 月')&&document.querySelectorAll('.month-proof-layer').length===1,'month '+month,month);
  const width=await run(()=>{const title=document.querySelector('.calendar-proof__title'),name=title.querySelector('strong').getBoundingClientRect(),year=title.querySelector('span').getBoundingClientRect();return{month:title.textContent,nameRight:name.right,yearLeft:year.left,overflow:title.scrollWidth>title.clientWidth};});
  assert.equal(width.overflow,false,JSON.stringify(width));assert.ok(width.nameRight+4<=width.yearLeft,JSON.stringify(width));monthWidths.push(width);
}
assert.deepEqual(errors,[]);
console.log(JSON.stringify({port,retroProof,textureProof,baseline,retro,vellum,dark,trigger,mobile,monthWidths,errors}));
ws.close();
