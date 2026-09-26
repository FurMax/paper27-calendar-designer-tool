import assert from 'node:assert/strict';

const tabs = await (await fetch('http://127.0.0.1:9230/json/list')).json();
const tab = tabs.find(item => item.type === 'page' && item.url.startsWith('http://127.0.0.1:5173'));
assert.ok(tab);
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let sequence = 1;
const jobs = new Map();
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data), job = jobs.get(message.id);
  if (!job) return;
  jobs.delete(message.id);
  message.error ? job.reject(Error(message.error.message)) : job.resolve(message.result);
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = sequence++; jobs.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }));
});
const response = await call('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: `(async () => {
  const { loadProject } = await import('/src/persistence/indexedDb.ts');
  const { renderMonthPng } = await import('/src/export/canvasRenderer.ts');
  const { buildMonthRenderModel } = await import('/src/domain/renderModel.ts');
  const { createEmptyProject } = await import('/src/domain/project.ts');
  const canvasSource = document.createElement('canvas'); canvasSource.width = 600; canvasSource.height = 900;
  const sourceContext = canvasSource.getContext('2d'); sourceContext.fillStyle = '#4A9175'; sourceContext.fillRect(0, 0, 600, 900);
  const blob = await new Promise(resolve => canvasSource.toBlob(resolve, 'image/png'));
  const state = createEmptyProject('session08-color');
  state.assets.a = { id:'a', blob, mime:'image/png', fileName:'color-fixture.png', byteSize:blob.size,
    decodedWidth:600, decodedHeight:900, importedAt:'' };
  state.project.photoItems.i = { id:'i', assetId:'a', createdAt:'' };
  state.project.months[1].photoItemId = 'i'; state.project.months[1].crop = { zoom:1, offsetX:0, offsetY:0 };
  const cases = [
    { background:'#FFFFFF', text:{mode:'auto'} },
    { background:'#000000', text:{mode:'auto'} },
    { background:'#777777', text:{mode:'auto'} },
    { background:'#FF0000', text:{mode:'auto'} },
    { background:'#00FF00', text:{mode:'auto'} },
    { background:'#0000FF', text:{mode:'auto'} },
    { background:'#FFFF00', text:{mode:'auto'} },
    { background:'#FFFFFF', text:{mode:'custom',color:'#FF0000'} },
    { background:'#232A3B', text:{mode:'custom',color:'#232A3B'} },
  ];
  const results=[];
  for (const item of cases) {
    state.project.months[1].style=item;
    const model=buildMonthRenderModel(1,state);
    const png=await renderMonthPng(state,1,'digital');
    const bitmap=await createImageBitmap(png.blob);
    const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0);bitmap.close();
    const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
    const ink=rgb(model.ink), background=rgb(item.background);
    const regions=[
      [96,1090,860,110], [990,1090,115,110], [96,1275,1008,65], [96,1370,1008,360]
    ];
    const roleInk=regions.map(([x,y,w,h])=>{
      const pixels=ctx.getImageData(x,y,w,h).data;let count=0;
      for(let i=0;i<pixels.length;i+=4) if(pixels[i]===ink[0]&&pixels[i+1]===ink[1]&&pixels[i+2]===ink[2])count++;
      return count;
    });
    const corner=[...ctx.getImageData(0,1799,1,1).data];
    results.push({background:item.background,mode:item.text.mode,ink:model.ink,
      warning:model.customContrastWarning,roleInk,corner,bytes:png.blob.size,
      cornerMatches:corner.slice(0,3).every((value,index)=>value===background[index])});
    canvas.width=0;canvas.height=0;
  }
  return results;
})()` });
if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
const results = response.result.value;
assert.equal(results.length, 9);
for (const item of results) {
  assert.ok(item.bytes > 0);
  assert.equal(item.cornerMatches, true);
  if (!(item.mode === 'custom' && item.background === item.ink)) assert.ok(item.roleInk.every(count => count > 0), JSON.stringify(item));
}
assert.equal(results.at(-1).warning, true);
assert.equal(results.at(-1).ink, '#232A3B');
console.log(JSON.stringify(results.map(({background,mode,ink,warning,roleInk})=>({background,mode,ink,warning,roleInk})),null,2));
ws.close();
