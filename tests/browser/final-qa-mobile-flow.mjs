import assert from 'node:assert/strict';

const origin = 'http://127.0.0.1:4173';
const port = process.env.CDP_PORT ?? '9230';
async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => { ws.addEventListener('open', resolve, { once:true }); ws.addEventListener('error', reject, { once:true }); });
  let sequence = 1; const jobs = new Map(); const errors = [];
  ws.addEventListener('message', event => { const data = JSON.parse(event.data); if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.exception?.description ?? data.params.exceptionDetails.text); const job = jobs.get(data.id); if (!job) return; jobs.delete(data.id); data.error ? job.reject(Error(data.error.message)) : job.resolve(data.result); });
  return { ws, errors, call:(method,params={}) => new Promise((resolve,reject) => { const id=sequence++; jobs.set(id,{resolve,reject}); ws.send(JSON.stringify({id,method,params})); }) };
}
const info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
const browser = await connect(info.webSocketDebuggerUrl); const context = await browser.call('Target.createBrowserContext'); let page;
try {
  const target = await browser.call('Target.createTarget', { url:origin+'/', browserContextId:context.browserContextId }); let tab;
  for(let i=0;i<50;i++){tab=(await(await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(item=>item.id===target.targetId);if(tab?.webSocketDebuggerUrl)break;await new Promise(r=>setTimeout(r,100));}
  assert.ok(tab?.webSocketDebuggerUrl); page=await connect(tab.webSocketDebuggerUrl); const call=page.call;
  await call('Page.enable'); await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});
  await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
  async function run(fn,...args){const data=await call('Runtime.evaluate',{expression:`(${fn.toString()})(${args.map(JSON.stringify).join(',')})`,awaitPromise:true,returnByValue:true});if(data.exceptionDetails)throw Error(data.exceptionDetails.exception?.description??data.exceptionDetails.text);return data.result.value;}
  async function until(fn,label,...args){for(let i=0;i<220;i++){if(await run(fn,...args))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timed out: '+label);}
  async function click(selector,text=''){await run((selector,text)=>{const item=[...document.querySelectorAll(selector)].find(node=>!text||node.textContent.includes(text)||node.getAttribute('aria-label')?.includes(text));if(!item)throw Error('Missing '+selector+' '+text);item.click();},selector,text);}
  const layout=()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,header:getComputedStyle(document.querySelector('.site-header')).position});
  await call('Page.navigate',{url:origin+'/'}); await until(()=>!!document.querySelector('.entry-page input[type=file]'),'fresh Entry');
  assert.equal(await run(()=>!!document.querySelector('.entry-page button')?.textContent.includes('选择照片')),true);
  await run(async()=>{const canvas=document.createElement('canvas');canvas.width=700;canvas.height=900;const x=canvas.getContext('2d');x.fillStyle='#B5CFDC';x.fillRect(0,0,700,900);x.fillStyle='#6A3859';x.fillRect(140,0,420,900);const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));const dt=new DataTransfer();for(let i=1;i<=12;i++)dt.items.add(new File([blob],`mobile-${i}.png`,{type:'image/png'}));const input=document.querySelector('.entry-page input[type=file]');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));});
  await until(()=>!!document.querySelector('.month-grid'),'mobile Assign');
  const assign=await run(layout);assert.equal(assign.width,390);assert.equal(assign.scrollWidth,390);assert.equal(assign.header,'sticky');
  await click('.page-actions button','继续编辑月份');
  await until(()=>!!document.querySelector('.editor-page'),'mobile Editor');
  const editor=await run(layout);assert.equal(editor.scrollWidth,390);assert.equal(editor.header,'sticky');
  await click('.phone-month-select__current');await until(()=>!!document.querySelector('.month-switch-grid'),'month chooser');
  await click('.month-switch-grid button','5 月');await until(()=>document.querySelector('.phone-month-select__current')?.textContent.includes('5 月'),'May');
  await click('.photo-effect-controls__option','胶片');
  await click('.photo-effect-controls__option','双色映射');
  await until(()=>!!document.querySelector('.photo-effect-controls__presets'),'duotone presets');
  await click('.photo-effect-controls__presets button','酒红');
  await click('.quick-colors button','Baby Blue');
  await click('.texture-options button.texture-thumb','波点');
  await until(()=>document.querySelector('.calendar-proof__dates')?.dataset.texture==='dots','polka applied');
  await click('.font-options button','复古');
  await click('.scale-options button','大');
  await click('.editor-deep-section--dates .rail-section-toggle','日期设置');
  await run(()=>document.querySelector('.important-controls__grid button[aria-label^="5 月 12 日"]').click());
  const marked=await run(()=>({summary:document.querySelector('.editor-deep-section--dates .rail-section-summary')?.textContent.trim(),texture:document.querySelector('.calendar-proof__dates').dataset.texture,effect:[...document.querySelectorAll('.photo-effect-controls__option')].find(b=>b.getAttribute('aria-pressed')==='true')?.textContent.trim(),layout:({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})}));
  assert.equal(marked.texture,'dots');assert.equal(marked.effect,'双色映射');assert.equal(marked.layout.scrollWidth,390);
  await click('.phone-month-select__review','预览');await until(()=>document.querySelectorAll('.review-card').length===12,'mobile Review');
  const review=await run(()=>({layout:({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}),font:getComputedStyle(document.querySelector('.review-card[data-month="5"] .calendar-proof__title strong')).fontFamily,texture:document.querySelector('.review-card[data-month="5"] .calendar-proof__dates').dataset.texture}));
  assert.equal(review.layout.scrollWidth,390);assert.ok(review.font.includes('Fraunces'));assert.equal(review.texture,'dots');
  await run(()=>history.back());await until(()=>!!document.querySelector('.editor-page'),'mobile browser Back');
  assert.equal(await run(()=>document.querySelector('.phone-month-select__current')?.textContent.includes('5 月')),true);
  await run(()=>history.forward());await until(()=>!!document.querySelector('.review-page'),'mobile browser Forward');  await click('.page-actions button','生成整套 12');await until(()=>!!document.querySelector('.export-sheet'),'mobile export');
  for(let i=0;i<450;i++){const state=await run(()=>({text:document.querySelector('.export-sheet')?.textContent??'',warning:!![...document.querySelectorAll('.export-sheet button')].find(b=>b.textContent.includes('仍然生成'))}));if(state.warning)await click('.export-sheet button','仍然生成');if(state.text.includes('下载 ZIP'))break;if(state.text.includes('整套文件暂时无法生成'))throw Error(state.text);await new Promise(r=>setTimeout(r,100));}
  assert.equal(await run(()=>!![...document.querySelectorAll('.export-sheet button')].find(b=>b.textContent.includes('下载 ZIP'))),true);
  await click('.export-sheet button','下载 ZIP');await until(()=>document.querySelector('.export-sheet')?.textContent.includes('已向浏览器发起 ZIP 下载'),'mobile ZIP handoff');
  await click('.export-sheet button','返回预览');
  await new Promise(r=>setTimeout(r,850));await call('Page.reload');await until(()=>!!document.querySelector('.entry-page button'),'mobile reload');
  await click('.entry-page button','继续编辑日历');await until(()=>!!document.querySelector('.review-page'),'mobile Resume');
  assert.equal(await run(()=>document.querySelector('.review-card[data-month="5"] .calendar-proof__dates').dataset.texture),'dots');
  assert.deepEqual(page.errors,[]);
  console.log(JSON.stringify({port,assign,editor,marked,review,mobileExport:'ZIP handoff',resume:true,errors:page.errors}));
}finally{page?.ws.close();await browser.call('Target.disposeBrowserContext',{browserContextId:context.browserContextId});browser.ws.close();}
