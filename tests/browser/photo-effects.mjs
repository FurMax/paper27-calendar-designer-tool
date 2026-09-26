import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const origin='http://127.0.0.1:4173',port=process.env.CDP_PORT??'9230';
async function connect(url){const ws=new WebSocket(url);await new Promise((ok,no)=>{ws.addEventListener('open',ok,{once:true});ws.addEventListener('error',no,{once:true});});let seq=1;const jobs=new Map(),errors=[];ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description??m.params.exceptionDetails.text);const j=jobs.get(m.id);if(!j)return;jobs.delete(m.id);m.error?j.no(Error(m.error.message)):j.ok(m.result);});return{ws,errors,call:(method,params={})=>new Promise((ok,no)=>{const id=seq++;jobs.set(id,{ok,no});ws.send(JSON.stringify({id,method,params}));})};}
const info=await(await fetch(`http://127.0.0.1:${port}/json/version`)).json(),browser=await connect(info.webSocketDebuggerUrl),context=await browser.call('Target.createBrowserContext');let page;
try{
const target=await browser.call('Target.createTarget',{url:origin+'/',browserContextId:context.browserContextId});let tab;for(let i=0;i<50;i++){tab=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(x=>x.id===target.targetId);if(tab?.webSocketDebuggerUrl)break;await new Promise(r=>setTimeout(r,100));}assert.ok(tab?.webSocketDebuggerUrl);page=await connect(tab.webSocketDebuggerUrl);const call=page.call;await call('Page.enable');await call('Runtime.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
async function run(fn,...args){const r=await call('Runtime.evaluate',{expression:`(${fn.toString()})(${args.map(JSON.stringify).join(',')})`,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;}
async function until(fn,label){for(let i=0;i<160;i++){if(await run(fn))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timed out: '+label);}
async function click(selector,label){await run((selector,label)=>{const b=[...document.querySelectorAll(selector)].find(x=>x.textContent.includes(label));if(!b)throw Error('Missing '+label);b.click();},selector,label);}
await call('Page.navigate',{url:origin+'/'});await until(()=>!!document.querySelector('.entry-page input[type=file]'),'Entry');
await run(async()=>{const c=document.createElement('canvas');c.width=720;c.height=850;const x=c.getContext('2d');x.fillStyle='#D0A483';x.fillRect(0,0,720,850);x.fillStyle='#385C87';x.fillRect(0,0,360,850);x.fillStyle='#A73D55';x.fillRect(400,100,220,400);const blob=await new Promise(r=>c.toBlob(r,'image/png'));const files=new DataTransfer();for(let i=1;i<=12;i++)files.items.add(new File([blob],`photo-${i}.png`,{type:'image/png'}));const input=document.querySelector('.entry-page input[type=file]');input.files=files.files;input.dispatchEvent(new Event('change',{bubbles:true}));});
await until(()=>!!document.querySelector('.month-grid'),'Assign');await click('.desktop-nav button','编辑月份');await until(()=>!!document.querySelector('.editor-page .photo-effect-controls'),'Editor');
const initialRail=await run(()=>({
  fine:document.querySelector('.editor-deep-section--style .rail-section-toggle')?.getAttribute('aria-expanded'),
  mark:document.querySelector('.editor-deep-section--dates .rail-section-toggle')?.getAttribute('aria-expanded'),
  summary:document.querySelector('.editor-deep-section--dates .rail-section-summary')?.textContent.trim(),
  textColor:!!document.querySelector('.typography-ink'),
  exact:document.querySelector('.palette-custom-toggle')?.textContent.trim(),
  exactExpanded:document.querySelector('.palette-custom-toggle')?.getAttribute('aria-expanded')
}));assert.equal(initialRail.fine,'true');assert.equal(initialRail.mark,'false');assert.equal(initialRail.summary,'未标记');assert.equal(initialRail.textColor,true);assert.ok(initialRail.exact.includes('精确调色'));assert.equal(initialRail.exactExpanded,'false');
await click('.palette-custom-toggle','精确调色');assert.equal(await run(()=>!!document.querySelector('input[aria-label="背景色 HEX"]')),true);
await click('.editor-deep-section--style .rail-section-toggle','样式设置');assert.equal(await run(()=>!!document.querySelector('.typography-ink')),false);assert.equal(await run(()=>document.querySelector('.editor-deep-section--style .rail-section-summary')?.textContent.trim()),'无纹理 / 经典 / 标准');
await click('.editor-deep-section--style .rail-section-toggle','样式设置');
await click('.editor-deep-section--dates .rail-section-toggle','日期设置');
const desktopTarget=await run(()=>{const b=document.querySelector('.important-controls button[aria-label^="1 月 14 日"]');const r=b.getBoundingClientRect();return {width:r.width,height:r.height,background:getComputedStyle(b).backgroundColor};});assert.ok(desktopTarget.width>=36&&desktopTarget.height>=36&&desktopTarget.height<=40,JSON.stringify(desktopTarget));assert.equal(desktopTarget.background,'rgba(0, 0, 0, 0)');assert.equal(await run(()=>!!document.querySelector('.important-controls small')),false);await run(()=>document.querySelector('.important-controls button[aria-label^="1 月 14 日"]').click());
await click('.important-controls__styles button','圈记');assert.equal(await run(()=>document.querySelector('.editor-deep-section--dates .rail-section-summary')?.textContent.trim()),'已标记 1 天 · 圈记');await click('.important-controls__styles button','红字');
const focusOutline=await run(()=>{const b=document.querySelector('.important-controls__grid button');b.focus();return getComputedStyle(b).outlineWidth;});assert.equal(focusOutline,'2px');
await click('.editor-deep-section--dates .rail-section-toggle','日期设置');
assert.equal(await run(()=>document.querySelector('.editor-deep-section--dates .rail-section-summary')?.textContent.trim()),'已标记 1 天 · 红字');
assert.equal(await run(()=>!!document.querySelector('.important-controls__grid')),false);
assert.equal(await run(()=>document.querySelector('.text-color-controls button[aria-pressed="true"]')?.textContent.trim()),'自动');
await click('.text-color-controls button','自定义');
assert.equal(await run(()=>!!document.querySelector('input[aria-label="文字颜色 HEX"]')),true);
await run(()=>{const input=document.querySelector('input[aria-label="文字颜色 HEX"]');input.focus();input.select();});
await call('Input.insertText',{text:'#FFFFFF'});
await run(()=>document.querySelector('input[aria-label="文字颜色 HEX"]').blur());
await until(()=>!!document.querySelector('.typography-ink .contrast-warning'),'contrast warning');
await click('.text-color-controls button','自动');
assert.equal(await run(()=>!!document.querySelector('input[aria-label="文字颜色 HEX"]')),false);
await run(()=>{const create=URL.createObjectURL.bind(URL);window.__fxBlobs=new Map();window.__fxClicks=[];URL.createObjectURL=blob=>{const url=create(blob);window.__fxBlobs.set(url,blob);return url;};HTMLAnchorElement.prototype.click=function(){window.__fxClicks.push({name:this.download,url:this.href});};});
async function exportImage(label){await click('.month-export__trigger','导出本月');await click('.month-export__menu button',label);await until(()=>document.querySelector('.month-export-status')?.textContent.includes('已尝试下载'),'download '+label);const r=await run(async()=>{const item=window.__fxClicks.at(-1),blob=window.__fxBlobs.get(item?.url);if(!blob)throw Error('Missing export blob');const bitmap=await createImageBitmap(blob),c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(bitmap,0,0);bitmap.close();return{name:item.name,type:blob.type,width:c.width,height:c.height,photo:[...x.getImageData(560,400,1,1).data],calendar:[...x.getImageData(600,1250,1,1).data]};});await click('.month-export-status button','关闭');return r;}
const results={};
for(const label of ['原图','胶片','冷调','半调','双色映射']){
 await click('.photo-effect-controls__option',label);
 await until(()=>!!document.querySelector('.proof-workspace .crop-surface__effect')||!!document.querySelector('.photo-effect-controls__option[aria-pressed="true"]:first-child'),'proof');
 await new Promise(r=>setTimeout(r,180));
 results[label]={selected:await run(()=>document.querySelector('.photo-effect-controls__option[aria-pressed="true"]')?.textContent.trim()),
  preview:await run(()=>{const canvas=document.querySelector('.proof-workspace .crop-surface__effect');return canvas?[...canvas.getContext('2d',{willReadFrequently:true}).getImageData(280,200,1,1).data]:null;}),
  file:await exportImage('屏幕版 · PNG')};
 assert.equal(results[label].selected,label);
 if(label!=='原图') { assert.ok(results[label].preview,label+' preview canvas'); for(let c=0;c<3;c++) assert.ok(Math.abs(results[label].preview[c]-results[label].file.photo[c])<8,JSON.stringify(results[label])); }
}
assert.deepEqual([results['原图'].file.width,results['原图'].file.height],[1200,1800]);
assert.notDeepEqual(results['原图'].file.photo,results['胶片'].file.photo);
assert.notDeepEqual(results['胶片'].file.photo,results['冷调'].file.photo);
assert.notDeepEqual(results['冷调'].file.photo,results['半调'].file.photo);
assert.notDeepEqual(results['半调'].file.photo,results['双色映射'].file.photo);
for(const label of ['胶片','冷调','半调','双色映射'])assert.deepEqual(results[label].file.calendar,results['原图'].file.calendar);
if(port==='9230'){const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile('qa/v1-1-photo-effects-editor.png',Buffer.from(shot.data,'base64'));}
const duo={};for(const preset of ['深蓝','酒红','墨绿','雾蓝','蓝紫','珊瑚']){await click('.photo-effect-controls__presets button',preset);duo[preset]=await exportImage('屏幕版 · PNG');}assert.equal(Object.keys(duo).length,6);
assert.equal(new Set(Object.values(duo).map(item=>item.photo.slice(0,3).join(','))).size,6);
await click('.photo-effect-controls__swap','交换');
const swapped=await exportImage('屏幕版 · PNG');
assert.notDeepEqual(swapped.photo,duo['珊瑚'].photo);
assert.equal(await run(()=>[...document.querySelectorAll('.photo-effect-controls__presets button')].find(x=>x.getAttribute('aria-pressed')==='true')?.textContent.trim()),'奶黄 × 珊瑚');

const print=await exportImage('印刷版 · JPG');assert.deepEqual([print.width,print.height],[1252,1843]);
const printPng=await exportImage('印刷版 · PNG');assert.deepEqual([printPng.width,printPng.height],[1252,1843]);
const digitalJpg=await exportImage('屏幕版 · JPG');assert.deepEqual([digitalJpg.width,digitalJpg.height],[1200,1800]);
await click('.month-nav button','2 月');await until(()=>document.querySelector('.month-nav [aria-current="page"]')?.textContent.includes('2 月')&&document.querySelectorAll('.month-proof-layer').length===1,'February');
const feb=await run(()=>document.querySelector('.photo-effect-controls__option[aria-pressed="true"]')?.textContent.trim());assert.equal(feb,'原图');
assert.equal(await run(()=>document.querySelector('.editor-deep-section--dates .rail-section-toggle')?.getAttribute('aria-expanded')),'false');
assert.equal(await run(()=>document.querySelector('.editor-deep-section--style .rail-section-toggle')?.getAttribute('aria-expanded')),'true');
await click('.month-nav button','1 月');await until(()=>document.querySelector('.month-nav [aria-current="page"]')?.textContent.includes('1 月')&&document.querySelectorAll('.month-proof-layer').length===1,'January');
assert.equal(await run(()=>document.querySelector('.photo-effect-controls__option[aria-pressed="true"]')?.textContent.trim()),'双色映射');
assert.equal(await run(()=>document.querySelector('.photo-effect-controls__swap')?.getAttribute('aria-pressed')),'true');
assert.equal(await run(()=>document.querySelector('.palette-custom-toggle')?.getAttribute('aria-expanded')),'true');
await click('.desktop-nav button','预览与导出');await until(()=>!!document.querySelector('.review-page .review-card'),'Review');
await until(()=>{const c=document.querySelector('.review-page .review-card[data-month="1"] .crop-surface__effect');return c?.getContext('2d',{willReadFrequently:true}).getImageData(280,200,1,1).data[3]===255;},'Review effect painted');
const reviewPixel=await run(()=>{const c=document.querySelector('.review-page .review-card[data-month="1"] .crop-surface__effect');return [...c.getContext('2d',{willReadFrequently:true}).getImageData(280,200,1,1).data];});
for(let i=0;i<3;i++)assert.ok(Math.abs(reviewPixel[i]-swapped.photo[i])<8,JSON.stringify({reviewPixel,swapped:swapped.photo}));
await new Promise(r=>setTimeout(r,800));await call('Page.reload');await until(()=>!!document.querySelector('.entry-page button'),'reload');await click('.entry-page button','继续编辑日历');await until(()=>!!document.querySelector('.review-page'),'restored Review');
await until(()=>{const c=document.querySelector('.review-page .review-card[data-month="1"] .crop-surface__effect');return c?.getContext('2d',{willReadFrequently:true}).getImageData(280,200,1,1).data[3]===255;},'restored effect painted');
const restoredPixel=await run(()=>{const c=document.querySelector('.review-page .review-card[data-month="1"] .crop-surface__effect');return [...c.getContext('2d',{willReadFrequently:true}).getImageData(280,200,1,1).data];});
assert.deepEqual(restoredPixel,reviewPixel);
await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});const mobile=await run(()=>({overflow:document.documentElement.scrollWidth>innerWidth,reviewEffect:!!document.querySelector('.review-page .review-card[data-month="1"] .crop-surface__effect')}));assert.equal(mobile.overflow,false);assert.equal(mobile.reviewEffect,true);
await click('.mobile-menu>button','预览与导出');await until(()=>!!document.querySelector('#mobile-nav'),'mobile menu');await click('#mobile-nav button','编辑月份');await until(()=>!!document.querySelector('.editor-page .photo-effect-controls'),'mobile Editor');
mobile.editorOverflow=await run(()=>document.documentElement.scrollWidth>innerWidth);mobile.selected=await run(()=>document.querySelector('.photo-effect-controls__option[aria-pressed="true"]')?.textContent.trim());assert.equal(mobile.editorOverflow,false);assert.equal(mobile.selected,'双色映射');
await click('.editor-deep-section--dates .rail-section-toggle','日期设置');mobile.dateTarget=await run(()=>{const r=document.querySelector('.important-controls__grid button').getBoundingClientRect();return {width:r.width,height:r.height,overflow:document.documentElement.scrollWidth>innerWidth};});assert.ok(mobile.dateTarget.width>=44&&mobile.dateTarget.height>=44&&!mobile.dateTarget.overflow,JSON.stringify(mobile.dateTarget));
await call('Emulation.setDeviceMetricsOverride',{width:320,height:760,deviceScaleFactor:1,mobile:true});mobile.narrowDateTarget=await run(()=>{const r=document.querySelector('.important-controls__grid button').getBoundingClientRect();return {width:r.width,height:r.height,overflow:document.documentElement.scrollWidth>innerWidth};});assert.ok(mobile.narrowDateTarget.width>=44&&mobile.narrowDateTarget.height>=44&&!mobile.narrowDateTarget.overflow,JSON.stringify(mobile.narrowDateTarget));
assert.deepEqual(page.errors,[]);console.log(JSON.stringify({port,initialRail,results,duo,swapped,print,feb,mobile,errors:page.errors}));
}finally{page?.ws.close();await browser.call('Target.disposeBrowserContext',{browserContextId:context.browserContextId});browser.ws.close();}
