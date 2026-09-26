import assert from 'node:assert/strict';

const port = process.env.CDP_PORT ?? '9230';
const tabs = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
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
const expression = '(' + (async function () {
  const { createEmptyProject } = await import('/src/domain/project.ts');
  const { renderMonthImage } = await import('/src/export/canvasRenderer.ts');
  const { analyzePhotoEdgeRisk } = await import('/src/export/photoEdgeRisk.ts');
  async function source(withMargin) {
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1044;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#BE342F'; ctx.fillRect(0, 0, 1200, 1044);
    if (withMargin) { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 1200, 50); }
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    canvas.width = 0; canvas.height = 0;
    return blob;
  }
  const solid = await source(false), margin = await source(true);
  const crop = { zoom: 1, offsetX: 0, offsetY: 0 };
  const clean = await analyzePhotoEdgeRisk(solid, 1200, 1044, crop);
  const initial = await analyzePhotoEdgeRisk(margin, 1200, 1044, crop);
  const afterZoom = await analyzePhotoEdgeRisk(margin, 1200, 1044, { ...crop, zoom: 1.3 });
  const printMargin = await analyzePhotoEdgeRisk(margin, 1200, 1044, crop, 'print');
  const state = createEmptyProject('edge-regression');
  state.assets.a = { id: 'a', blob: solid, mime: 'image/png', fileName: 'solid.png', byteSize: solid.size,
    decodedWidth: 1200, decodedHeight: 1044, importedAt: '' };
  state.project.photoItems.i = { id: 'i', assetId: 'a', createdAt: '' };
  state.project.months[1].photoItemId = 'i'; state.project.months[1].crop = crop;
  const outputs = [];
  for (const variant of ['digital', 'print']) for (const format of ['png', 'jpg']) {
    const rendered = await renderMonthImage(state, 1, variant, format);
    const url = URL.createObjectURL(rendered.blob), image = new Image();
    image.src = url; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0);
    const points = variant === 'print' ? [[0, 500], [20, 500], [35, 500], [1215, 500], [1230, 500], [1251, 500], [625, 0], [625, 35], [0, 0], [1251, 0]] : [[0, 500], [1, 500], [1198, 500], [1199, 500], [600, 0], [600, 1]];
    outputs.push({ variant, format, dimensions: [canvas.width, canvas.height],
      samples: points.map(([x, y]) => ({ x, y, rgb: [...ctx.getImageData(x, y, 1, 1).data].slice(0, 3) })) });
    canvas.width = 0; canvas.height = 0; URL.revokeObjectURL(url);
  }
  const gradientCanvas = document.createElement('canvas'); gradientCanvas.width = 1200; gradientCanvas.height = 1044;
  const gradientContext = gradientCanvas.getContext('2d');
  gradientContext.fillStyle = '#800000'; gradientContext.fillRect(0, 0, 1200, 1044);
  for (let x = 1100; x < 1200; x++) {
    gradientContext.fillStyle = 'rgb(' + Math.round(128 + (x - 1100) * 127 / 99) + ',0,0)';
    gradientContext.fillRect(x, 0, 1, 1044);
  }
  const gradientBlob = await new Promise(resolve => gradientCanvas.toBlob(resolve, 'image/png'));
  gradientCanvas.width = 0; gradientCanvas.height = 0;
  state.assets.a.blob = gradientBlob;
  const gradientOutput = await renderMonthImage(state, 1, 'print', 'png');
  const gradientUrl = URL.createObjectURL(gradientOutput.blob), gradientImage = new Image();
  gradientImage.src = gradientUrl; await gradientImage.decode();
  const gradientPrint = document.createElement('canvas'); gradientPrint.width = 1252; gradientPrint.height = 1843;
  const gradientPrintContext = gradientPrint.getContext('2d', { willReadFrequently: true });
  gradientPrintContext.drawImage(gradientImage, 0, 0);
  const gradient = [1214, 1215, 1216, 1230, 1251].map(x => ({ x, rgb: [...gradientPrintContext.getImageData(x, 500, 1, 1).data].slice(0, 3) }));
  gradientPrint.width = 0; gradientPrint.height = 0; URL.revokeObjectURL(gradientUrl);
  const markedCanvas = document.createElement('canvas'); markedCanvas.width = 1200; markedCanvas.height = 1044;
  const markedContext = markedCanvas.getContext('2d');
  markedContext.fillStyle = '#BE342F'; markedContext.fillRect(0, 0, 1200, 1044);
  markedContext.fillStyle = '#101010'; markedContext.fillRect(0, 20, 1200, 20);
  const markedBlob = await new Promise(resolve => markedCanvas.toBlob(resolve, 'image/png'));
  markedCanvas.width = 0; markedCanvas.height = 0;
  state.assets.a.blob = markedBlob;
  const markedOutput = await renderMonthImage(state, 1, 'print', 'png');
  const markedUrl = URL.createObjectURL(markedOutput.blob), markedImage = new Image();
  markedImage.src = markedUrl; await markedImage.decode();
  const markedPrint = document.createElement('canvas'); markedPrint.width = 1252; markedPrint.height = 1843;
  const markedPrintContext = markedPrint.getContext('2d', { willReadFrequently: true });
  markedPrintContext.drawImage(markedImage, 0, 0);
  const genuineTop = [0, 10, 35, 45].map(y => ({ y, rgb: [...markedPrintContext.getImageData(625, y, 1, 1).data].slice(0, 3) }));
  markedPrint.width = 0; markedPrint.height = 0; URL.revokeObjectURL(markedUrl);
  return { clean, initial, afterZoom, printMargin, outputs, gradient, genuineTop };
}).toString() + ')()';
const response = await call('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression });
if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
const result = response.result.value;
assert.deepEqual(result.clean, []);
assert.ok(result.initial.includes('top'), JSON.stringify(result.initial));
assert.deepEqual(result.afterZoom, []);
assert.deepEqual(result.printMargin, []);
for (const output of result.outputs) {
  for (const sample of output.samples) {
    const expected = [190, 52, 47], tolerance = output.format === 'jpg' ? 20 : 3;
    assert.ok(sample.rgb.every((channel, i) => Math.abs(channel - expected[i]) <= tolerance), JSON.stringify(output));
  }
}
assert.ok(result.gradient[4].rgb[0] > result.gradient[2].rgb[0] + 10, JSON.stringify(result.gradient));
assert.ok(result.gradient.every(item => item.rgb[1] < 10 && item.rgb[2] < 10), JSON.stringify(result.gradient));
assert.ok(result.genuineTop[0].rgb.every(channel => channel < 35), JSON.stringify(result.genuineTop));
assert.ok(result.genuineTop[2].rgb[0] > 170, JSON.stringify(result.genuineTop));
console.log(JSON.stringify({ gradient: result.gradient, genuineTop: result.genuineTop, warnings: { clean: result.clean, whiteTop: result.initial, zoomed: result.afterZoom, printSafetyZoom: result.printMargin },
  outputs: result.outputs.map(output => ({ variant: output.variant, format: output.format, dimensions: output.dimensions, edgeSamples: output.samples })) }, null, 2));
ws.close();

