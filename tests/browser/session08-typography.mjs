import assert from 'node:assert/strict';

const port = process.env.CDP_PORT ?? '9230';
const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const tab = tabs.find(item => item.type === 'page' && item.url.startsWith('http://127.0.0.1:5173'));
assert.ok(tab);
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let nextId = 1;
const waiting = new Map();
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data), job = waiting.get(message.id);
  if (!job) return;
  waiting.delete(message.id);
  message.error ? job.reject(Error(message.error.message)) : job.resolve(message.result);
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId++; waiting.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }));
});
const response = await call('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: `(async () => {
  const { loadProject } = await import('/src/persistence/indexedDb.ts');
  const { renderMonthPng, ensurePresetFonts } = await import('/src/export/canvasRenderer.ts');
  const { TYPOGRAPHY_PRESETS, SCALE_MULTIPLIERS } = await import('/src/domain/typography.ts');
  const { buildMonthRenderModel } = await import('/src/domain/renderModel.ts');
  const { createEmptyProject } = await import('/src/domain/project.ts');
  const canvasSource = document.createElement('canvas'); canvasSource.width = 600; canvasSource.height = 900;
  const sourceContext = canvasSource.getContext('2d'); sourceContext.fillStyle = '#4A9175'; sourceContext.fillRect(0, 0, 600, 900);
  const blob = await new Promise(resolve => canvasSource.toBlob(resolve, 'image/png'));
  const state = createEmptyProject('session08-typography');
  state.assets.a = { id:'a', blob, mime:'image/png', fileName:'type-fixture.png', byteSize:blob.size,
    decodedWidth:600, decodedHeight:900, importedAt:'' };
  for (let month = 1; month <= 12; month++) {
    const id = 'i' + month; state.project.photoItems[id] = { id, assetId:'a', createdAt:'' };
    state.project.months[month].photoItemId = id; state.project.months[month].crop = { zoom:1, offsetX:0, offsetY:0 };
  }
  const results = [];
  for (const presetId of Object.keys(TYPOGRAPHY_PRESETS)) {
    await ensurePresetFonts(TYPOGRAPHY_PRESETS[presetId]);
    for (const scale of Object.keys(SCALE_MULTIPLIERS)) {
      state.project.typography = { presetId, scale };
      for (let month = 1; month <= 12; month++) {
        const model = buildMonthRenderModel(month, state);
        const rendered = await renderMonthPng(state, month, 'digital');
        const bitmap = await createImageBitmap(rendered.blob);
        const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1800;
        const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(bitmap, 0, 0); bitmap.close();
        const title = ctx.getImageData(96, 1065, 860, 130).data;
        let inkPixels = 0; for (let i = 0; i < title.length; i += 4) if (title[i] < 100 && title[i + 1] < 100 && title[i + 2] < 100) inkPixels++;
        results.push({ presetId, scale, month, bytes: rendered.blob.size, titleInkPixels: inkPixels,
          expectedFamily: model.typography.monthFamily, width: canvas.width, height: canvas.height });
        canvas.width = 0; canvas.height = 0;
      }
    }
  }
  return { results, fonts: [...document.fonts].map(face => ({ family: face.family, status: face.status })) };
})()` });
if (response.exceptionDetails) throw Error(response.exceptionDetails.exception?.description ?? response.exceptionDetails.text);
const { results, fonts } = response.result.value;
assert.equal(results.length, 108);
assert.ok(results.every(item => item.width === 1200 && item.height === 1800 && item.bytes > 0 && item.titleInkPixels > 100));
for (const family of ['Instrument Serif', 'Instrument Sans', 'Patrick Hand']) {
  assert.ok(fonts.some(face => face.family.replaceAll('"', '') === family && face.status === 'loaded'), family);
}
console.log(JSON.stringify({ rendered: results.length, minimumBytes: Math.min(...results.map(item => item.bytes)),
  minimumTitleInkPixels: Math.min(...results.map(item => item.titleInkPixels)), fonts }, null, 2));
ws.close();
