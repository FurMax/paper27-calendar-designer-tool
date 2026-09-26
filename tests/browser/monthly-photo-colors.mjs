import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const port = process.env.CDP_PORT ?? '9230';
const origin = 'http://127.0.0.1:5173';
const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const tab = tabs.find(item => item.type === 'page' && item.url.startsWith(origin));
assert.ok(tab, 'isolated test tab missing');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once:true }));
let sequence = 1; const jobs = new Map();
ws.addEventListener('message', event => { const message=JSON.parse(event.data),job=jobs.get(message.id); if(!job)return; jobs.delete(message.id); message.error?job.reject(Error(message.error.message)):job.resolve(message.result); });
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=sequence++;jobs.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const result=await call('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);return result.result.value;}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function shot(file){const result=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(file,Buffer.from(result.data,'base64'));}
async function until(expression){for(let i=0;i<70;i++){if(await evaluate(expression))return;await pause(150);}throw Error('timeout: '+expression);}
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await call('Storage.clearDataForOrigin',{origin,storageTypes:'indexeddb'});
await call('Page.navigate',{url:origin+'/'});await pause(600);
await evaluate('('+(async function(){
  const {createEmptyProject}=await import('/src/domain/project.ts');
  const {commitProject}=await import('/src/persistence/indexedDb.ts');
  const state=createEmptyProject('inline-palette-qa');
  for(const [month,color] of [[1,'#D22832'],[2,'#1E5ABE']]){
    const canvas=document.createElement('canvas');canvas.width=600;canvas.height=900;
    const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,600,900);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    const id=`a${month}`,item=`i${month}`;
    state.assets[id]={id,blob,mime:'image/png',fileName:`month-${month}.png`,byteSize:blob.size,decodedWidth:600,decodedHeight:900,importedAt:''};
    state.project.photoItems[item]={id:item,assetId:id,createdAt:''};
    state.project.months[month].photoItemId=item;
    state.project.months[month].crop={zoom:1,offsetX:0,offsetY:0};
  }
  await commitProject(state,null);
}).toString()+')()');
await call('Page.navigate',{url:origin+'/'});await pause(500);
await evaluate("[...document.querySelectorAll('.entry-page button')].find(b=>b.textContent.includes('继续编辑日历')).click()");
await until("!!document.querySelector('.desktop-nav')");
await evaluate("[...document.querySelectorAll('.desktop-nav button')].find(b=>b.textContent.includes('编辑月份')).click()");
await until("document.querySelectorAll('.monthly-photo-colors__grid button').length===3");
const jan=await evaluate("[...document.querySelectorAll('.monthly-photo-colors__grid button b')].map(e=>e.textContent)");
assert.equal(jan[0],'#D22832');
assert.ok(await evaluate("document.querySelector('.background-controls')?.textContent.includes('固定常用色')"));
await evaluate("document.querySelector('.monthly-photo-colors').scrollIntoView({block:'center'})");await pause(120);await shot('qa/monthly-photo-colors-desktop.png');
await evaluate("[...document.querySelectorAll('.month-nav button')].find(b=>b.textContent.includes('2 月')).click()");
await until("document.querySelector('.monthly-photo-colors__grid button b')?.textContent==='#1E5ABE'");
const feb=await evaluate("[...document.querySelectorAll('.monthly-photo-colors__grid button b')].map(e=>e.textContent)");
assert.notDeepEqual(jan,feb);
await evaluate("document.querySelector('.monthly-photo-colors__grid button').click()");
await until("document.querySelector('.color-current strong')?.textContent==='#1E5ABE'");
await pause(700);
const saved=await evaluate('('+(async function(){const {loadProject}=await import('/src/persistence/indexedDb.ts');const state=await loadProject();return [state.project.months[1].style.background,state.project.months[2].style.background];}).toString()+')()');
assert.deepEqual(saved,['#FFFFFF','#1E5ABE']);
await call('Emulation.setDeviceMetricsOverride',{width:320,height:720,deviceScaleFactor:1,mobile:true});await pause(180);
await evaluate("[...document.querySelectorAll('.mobile-style-trigger')].find(b=>b.textContent==='背景色').click()");
await until("document.querySelectorAll('.action-sheet .monthly-photo-colors__grid button').length===3");
const phone=await evaluate("({colors:[...document.querySelectorAll('.action-sheet .monthly-photo-colors__grid button b')].map(e=>e.textContent),overflow:document.documentElement.scrollWidth>innerWidth})");
assert.deepEqual(phone.colors,feb);assert.equal(phone.overflow,false);await shot('qa/monthly-photo-colors-phone.png');
const cropColors=await evaluate('('+(async function(){
  const {analyzePhotoPalette}=await import('/src/features/photos/recommendColors.ts');
  const canvas=document.createElement('canvas');canvas.width=600;canvas.height=900;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#D22832';ctx.fillRect(0,0,300,900);
  ctx.fillStyle='#1E5ABE';ctx.fillRect(300,0,300,900);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  const red=await analyzePhotoPalette(blob,600,900,{zoom:2,offsetX:1,offsetY:0},'digital');
  const blue=await analyzePhotoPalette(blob,600,900,{zoom:2,offsetX:-1,offsetY:0},'digital');
  return [red.suggestions[0].color,blue.suggestions[0].color];
}).toString()+')()');
assert.deepEqual(cropColors,['#D22832','#1E5ABE']);
await call('Emulation.clearDeviceMetricsOverride');ws.close();
console.log(JSON.stringify({jan,feb,saved,phone,cropColors}));
