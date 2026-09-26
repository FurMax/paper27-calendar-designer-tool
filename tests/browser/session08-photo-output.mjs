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
  const { createEmptyProject } = await import('/src/domain/project.ts');
  const { renderMonthPng } = await import('/src/export/canvasRenderer.ts');
  const { decodePhotoSelection } = await import('/src/features/photos/import.ts');
  const shapes = [[800,1200],[1200,800],[1000,1000],[4000,300],[300,4000]];
  const results = [];
  for (const [width,height] of shapes) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#00CC66'; ctx.fillRect(0,0,width,height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/png'));
    canvas.width=0; canvas.height=0;
    const state = createEmptyProject('shape-'+width+'x'+height);
    state.assets.a = { id:'a', blob, mime:'image/png', fileName:'shape.png', byteSize:blob.size,
      decodedWidth:width, decodedHeight:height, importedAt:'' };
    state.project.photoItems.i = { id:'i', assetId:'a', createdAt:'' };
    state.project.months[1].photoItemId = 'i'; state.project.months[1].crop = { zoom:2.5, offsetX:1, offsetY:-1 };
    const rendered = await renderMonthPng(state,1,'digital');
    const bitmap = await createImageBitmap(rendered.blob);
    const output = document.createElement('canvas'); output.width=bitmap.width; output.height=bitmap.height;
    const outputContext = output.getContext('2d',{willReadFrequently:true});outputContext.drawImage(bitmap,0,0);bitmap.close();
    const points = [[0,0],[1199,0],[0,1043],[1199,1043],[600,500]];
    results.push({ shape:width+'x'+height, bytes:rendered.blob.size,
      samples:points.map(([x,y])=>[...outputContext.getImageData(x,y,1,1).data]) });
    output.width=0; output.height=0;
  }
  const exifBlob=await (await fetch('/spikes/browser-lab/results/orientation6.jpg')).blob();
  const exifFile=new File([exifBlob],'orientation6.jpg',{type:'image/jpeg'});
  const decoded=await decodePhotoSelection([exifFile]);
  return { results, exif:{accepted:decoded.assets.length, width:decoded.assets[0]?.decodedWidth,
    height:decoded.assets[0]?.decodedHeight, unreadable:decoded.unreadable} };
})()` });
if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
const { results, exif } = response.result.value;
assert.equal(results.length, 5);
for (const result of results) {
  assert.ok(result.bytes > 0);
  assert.ok(result.samples.every(pixel => pixel[0] === 0 && pixel[1] === 204 && pixel[2] === 102 && pixel[3] === 255), result.shape);
}
assert.deepEqual(exif, { accepted: 1, width: 1200, height: 1920, unreadable: [] });
console.log(JSON.stringify({ shapes: results.map(item => item.shape), allEdgePixelsCovered: true, exif }, null, 2));
ws.close();
