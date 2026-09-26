import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const origin='http://127.0.0.1:4173',port=process.env.CDP_PORT??'9230';
async function connect(url){const ws=new WebSocket(url);await new Promise((ok,no)=>{ws.addEventListener('open',ok,{once:true});ws.addEventListener('error',no,{once:true});});let seq=1;const jobs=new Map();ws.addEventListener('message',event=>{const m=JSON.parse(event.data),j=jobs.get(m.id);if(!j)return;jobs.delete(m.id);m.error?j.no(Error(m.error.message)):j.ok(m.result);});return{ws,call:(method,params={})=>new Promise((ok,no)=>{const id=seq++;jobs.set(id,{ok,no});ws.send(JSON.stringify({id,method,params}));})};}
const info=await(await fetch(`http://127.0.0.1:${port}/json/version`)).json(),browser=await connect(info.webSocketDebuggerUrl),context=await browser.call('Target.createBrowserContext');let page;
try{
const target=await browser.call('Target.createTarget',{url:origin+'/',browserContextId:context.browserContextId});let tab;for(let i=0;i<50;i++){tab=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(x=>x.id===target.targetId);if(tab?.webSocketDebuggerUrl)break;await new Promise(r=>setTimeout(r,100));}assert.ok(tab?.webSocketDebuggerUrl);page=await connect(tab.webSocketDebuggerUrl);const call=page.call;await call('Page.enable');await call('Runtime.enable');await call('Emulation.setDeviceMetricsOverride',{width:Number(process.env.VIEWPORT??1440),height:Number(process.env.HEIGHT??1264),deviceScaleFactor:1,mobile:false});
async function run(fn,...args){const r=await call('Runtime.evaluate',{expression:`(${fn.toString()})(${args.map(JSON.stringify).join(',')})`,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result.value;}
async function until(fn,label){for(let i=0;i<160;i++){if(await run(fn))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timed out: '+label);}
async function click(selector,label){await run((selector,label)=>{const b=[...document.querySelectorAll(selector)].find(x=>x.textContent.includes(label));if(!b)throw Error('Missing '+label);b.click();},selector,label);}
await call('Page.navigate',{url:origin+'/'});await until(()=>!!document.querySelector('.entry-page input[type=file]'),'Entry');await run(async()=>{const c=document.createElement('canvas');c.width=720;c.height=850;const x=c.getContext('2d');x.fillStyle='#CBA99D';x.fillRect(0,0,720,850);const blob=await new Promise(r=>c.toBlob(r,'image/png'));const files=new DataTransfer();for(let i=1;i<=12;i++)files.items.add(new File([blob],`photo-${i}.png`,{type:'image/png'}));const input=document.querySelector('.entry-page input[type=file]');input.files=files.files;input.dispatchEvent(new Event('change',{bubbles:true}));});await until(()=>!!document.querySelector('.month-grid'),'Assign');await click('.desktop-nav button','编辑月份');await until(()=>!!document.querySelector('.editor-page .font-options'),'Editor');await click('.font-options button','手写');await click('.scale-options button','大');await run(()=>document.querySelectorAll('.month-nav button')[9].click());await until(()=>document.querySelector('.proof-workspace .calendar-proof')?.getAttribute('aria-label')?.includes('October'),'October');await new Promise(r=>setTimeout(r,600));
const data=await run(()=>{const proof=document.querySelector('.proof-workspace .calendar-proof'),dates=proof.querySelector('.calendar-proof__dates'),title=dates.querySelector('.calendar-proof__title'),wd=dates.querySelector('.calendar-proof__weekdays'),grid=dates.querySelector('.calendar-proof__grid'),cells=[...grid.children];const rect=e=>{const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom,height:r.height}};return{proof:rect(proof),dates:rect(dates),title:rect(title),weekdays:rect(wd),grid:rect(grid),firstDate:rect(cells.find(x=>x.textContent==='1')),lastDate:rect(cells.find(x=>x.textContent==='31')),padding:getComputedStyle(dates).padding,gridStyle:{height:getComputedStyle(grid).height,gridRows:getComputedStyle(grid).gridTemplateRows,font:getComputedStyle(grid).font,lineHeight:getComputedStyle(grid).lineHeight},month:proof.getAttribute('aria-label')};});console.log(JSON.stringify({viewport:'desktop',...data}));
for (const [index, name] of [[0,'January'],[4,'May'],[9,'October']]) {
  await run(index=>document.querySelectorAll('.month-nav button')[index].click(),index);
  await until(()=>document.querySelector('.proof-workspace .calendar-proof')?.getAttribute('aria-label')?.includes(name),name);
  await new Promise(r=>setTimeout(r,350));
  const fit=await run(()=>{const proof=document.querySelector('.proof-workspace .calendar-proof'),last=[...proof.querySelectorAll('.calendar-proof__grid>span')].find(x=>x.textContent==='31');return{month:proof.getAttribute('aria-label'),flag:proof.dataset.sixRowHandwrittenLarge,clearance:proof.getBoundingClientRect().bottom-last.getBoundingClientRect().bottom};});
  assert.equal(fit.flag,'true');assert.ok(fit.clearance>20,JSON.stringify(fit));console.log(JSON.stringify({viewport:'desktop',...fit}));
}
if (port==='9230') {
  const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
  await writeFile('qa/v1-1-six-row-handwritten-large-october.png',Buffer.from(shot.data,'base64'));
}
for (const width of [390,320]) {
  await call('Emulation.setDeviceMetricsOverride',{width,height:700,deviceScaleFactor:1,mobile:true});
  await new Promise(r=>setTimeout(r,120));
  const narrow=await run(()=>{const proof=document.querySelector('.proof-workspace .calendar-proof'),dates=proof.querySelector('.calendar-proof__dates'),grid=proof.querySelector('.calendar-proof__grid'),cells=[...grid.children],last=cells.find(x=>x.textContent==='31');const rect=e=>{const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom,height:r.height}};return{proof:rect(proof),dates:rect(dates),grid:rect(grid),lastDate:rect(last),flag:proof.dataset.sixRowHandwrittenLarge,overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.equal(narrow.flag,'true');
  assert.equal(narrow.overflow,false);
  assert.ok(narrow.lastDate.bottom < narrow.proof.bottom - 8,JSON.stringify(narrow));
  console.log(JSON.stringify({viewport:width,...narrow}));
}
}finally{page?.ws.close();await browser.call('Target.disposeBrowserContext',{browserContextId:context.browserContextId});browser.ws.close();}
