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
await call('Page.navigate',{url:origin+'/'});await until(()=>!!document.querySelector('.entry-page input[type=file]'),'Entry');await run(async()=>{const c=document.createElement('canvas');c.width=720;c.height=850;const x=c.getContext('2d');x.fillStyle='#CBA99D';x.fillRect(0,0,720,850);const blob=await new Promise(r=>c.toBlob(r,'image/png'));const files=new DataTransfer();for(let i=1;i<=12;i++)files.items.add(new File([blob],`photo-${i}.png`,{type:'image/png'}));const input=document.querySelector('.entry-page input[type=file]');input.files=files.files;input.dispatchEvent(new Event('change',{bubbles:true}));});await until(()=>!!document.querySelector('.month-grid'),'Assign');await click('.desktop-nav button','编辑月份');await until(()=>!!document.querySelector('.editor-page .font-options'),'Editor');for (const preset of ['经典','手写']) {
 await click('.font-options button',preset);await click('.scale-options button','大');
 for (const width of [390,320]) {
  await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
  for (const [index,name] of [[0,'January'],[4,'May'],[7,'August'],[9,'October']]) {
   await run(index=>document.querySelectorAll('.month-nav button')[index].click(),index);
   await until(()=>document.querySelector('.proof-workspace .calendar-proof')?.getAttribute('aria-label')?.includes(name),name);
   await new Promise(r=>setTimeout(r,280));
   const m=await run(()=>{const p=document.querySelector('.proof-workspace .calendar-proof'),d=p.querySelector('.calendar-proof__dates'),t=d.querySelector('.calendar-proof__title'),w=d.querySelector('.calendar-proof__weekdays'),g=d.querySelector('.calendar-proof__grid'),last=[...g.children].filter(x=>x.textContent.trim()).at(-1),r=e=>e.getBoundingClientRect();return{titleWeek:r(w).top-r(t).bottom,weekGrid:r(g).top-r(w).bottom,lastEdge:r(p).bottom-r(last).bottom,topPad:getComputedStyle(d).paddingTop,gridHeight:r(g).height,proofWidth:r(p).width,overflow:document.documentElement.scrollWidth>innerWidth};});
   assert.ok(m.titleWeek >= (width===390 ? 8 : 3),JSON.stringify({preset,width,name,...m}));assert.ok(m.lastEdge > 8,JSON.stringify({preset,width,name,...m}));assert.equal(m.overflow,false);console.log(JSON.stringify({preset,width,name,...m}));
  }
 }
}
}finally{page?.ws.close();await browser.call('Target.disposeBrowserContext',{browserContextId:context.browserContextId});browser.ws.close();}
