import { useEffect, useRef, useState } from 'react';
import { ALL_MONTHS } from '../domain/calendar.ts';
import type { Location } from '../app/navigation.ts';
import { useProject } from '../app/ProjectContext.tsx';
import { isMonthReady } from '../domain/project.ts';
import { CalendarProof } from '../components/CalendarProof.tsx';
import { ExportCancelledError, missingExportMonths, renderFullSet, type ExportProgress } from '../export/exportController.ts';
import { packagePngZip } from '../export/zip.ts';
import { startBrowserDownload } from '../export/delivery.ts';
import type { RenderedMonthPng } from '../export/canvasRenderer.ts';

type BatchState = { phase: 'idle' | 'working' | 'ready' | 'sent' | 'error'; progress?: ExportProgress; message?: string };
export function Review({ navigate }: { navigate: (location: Location) => void }) {
  const { state } = useProject();
  const missing = state ? missingExportMonths(state) : ALL_MONTHS;
  const count = 12 - missing.length;
  const [batch, setBatch] = useState<BatchState>({ phase: 'idle' });
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const zipUrl = useRef<string | null>(null);
  const rendered = useRef<RenderedMonthPng[] | null>(null);
  const working = useRef(false);
  useEffect(() => () => { generation.current++; controller.current?.abort(); if (zipUrl.current) URL.revokeObjectURL(zipUrl.current); }, []);
  function clearPrepared() { if (zipUrl.current) URL.revokeObjectURL(zipUrl.current); zipUrl.current = null; rendered.current = null; }
  async function prepareFullSet() {
    if (!state || missing.length || working.current) return;
    clearPrepared(); working.current = true;
    const id = ++generation.current, abort = new AbortController(); controller.current = abort;
    setBatch({ phase: 'working', progress: { phase: 'rendering', completed: 0, current: 1 } });
    try {
      const files = await renderFullSet(state, progress => { if (id === generation.current) setBatch({ phase: 'working', progress }); }, abort.signal);
      if (id !== generation.current || abort.signal.aborted) return;
      rendered.current = files;
      const zip = await packagePngZip(files);
      if (id !== generation.current || abort.signal.aborted) return;
      zipUrl.current = URL.createObjectURL(zip);
      setBatch({ phase: 'ready', progress: { phase: 'packaging', completed: 12 } });
    } catch (error) {
      if (id === generation.current) setBatch(error instanceof ExportCancelledError || abort.signal.aborted ? { phase: 'idle' } : { phase: 'error', message: error instanceof Error ? error.message : '生成失败，请重试。' });
    } finally { working.current = false; if (controller.current === abort) controller.current = null; }
  }
  async function retryPackage() {
    if (!rendered.current || working.current) { void prepareFullSet(); return; }
    working.current = true; const id = ++generation.current;
    setBatch({ phase: 'working', progress: { phase: 'packaging', completed: 12 } });
    try {
      const zip = await packagePngZip(rendered.current);
      if (id !== generation.current) return;
      zipUrl.current = URL.createObjectURL(zip);
      setBatch({ phase: 'ready', progress: { phase: 'packaging', completed: 12 } });
    } catch (error) { if (id === generation.current) setBatch({ phase: 'error', message: error instanceof Error ? error.message : 'ZIP 打包失败。' }); }
    finally { working.current = false; }
  }
  function cancel() { generation.current++; controller.current?.abort(); controller.current = null; working.current = false; clearPrepared(); setBatch({ phase: 'idle' }); }
  function download() { if (!zipUrl.current) return; startBrowserDownload(zipUrl.current, 'Calendar-Design-Studio-2027.zip'); setBatch({ phase: 'sent' }); }
  function close() { clearPrepared(); setBatch({ phase: 'idle' }); }
  return <main className="page review-page"><header className="page-header"><div><span className="eyebrow">03 / 03</span><h1>预览与导出</h1><p>{count} / 12 个月已就绪</p></div><button className="button button--quiet" onClick={() => navigate({ screen: 'assign' })}>分配照片</button></header><p className="instruction">为每个月添加照片后，可生成 12 张独立的月历 PNG。</p><div className="review-grid">{ALL_MONTHS.map(month => <button className="review-card" key={month} onClick={() => navigate({ screen: 'editor', month })}><CalendarProof month={month} compact state={state} /><span className="review-card__caption"><strong>{month} 月</strong><small>{state && isMonthReady(state, month) ? '已就绪' : '缺少照片'}</small></span></button>)}</div>
    {missing.length > 0 && <div className="review-missing"><p>还需为以下月份添加照片，才能生成整套文件：</p><div>{missing.map(month => <button key={month} className="button button--quiet" onClick={() => navigate({ screen: 'editor', month })}>{month} 月 · 添加照片</button>)}</div></div>}
    <div className="page-actions"><button className="button button--primary" disabled={missing.length > 0 || batch.phase === 'working'} onClick={() => void prepareFullSet()}>生成 12 个月 PNG</button></div>
    {batch.phase !== 'idle' && <div className="sheet-backdrop" onClick={batch.phase === 'working' ? undefined : close}><section className="action-sheet export-sheet" role="dialog" aria-modal="true" aria-label="整套导出" onClick={event => event.stopPropagation()}><div className="sheet-heading"><h2>整套导出 · 2027</h2>{batch.phase !== 'working' && <button onClick={close} aria-label="关闭">×</button>}</div>
      {batch.phase === 'working' && <><p role="status">{batch.progress?.phase === 'packaging' ? '12 张 PNG 已生成，正在制作 ZIP 包…' : `正在生成 ${batch.progress?.current ?? 1} 月 PNG · 已完成 ${batch.progress?.completed ?? 0} / 12`}</p><progress max={12} value={batch.progress?.completed ?? 0} /><button className="button button--quiet" onClick={cancel}>取消生成</button></>}
      {batch.phase === 'ready' && <><p role="status">12 张独立 PNG 已准备好，按 1–12 月命名并装入 ZIP。请点击下载交给浏览器处理。</p><button className="button button--primary" onClick={download}>下载 ZIP（12 张 PNG）</button><p className="export-note">手机浏览器下载 ZIP 后，仍需在设备上打开或保存其中的 PNG；此操作不表示已存入“照片”。</p></>}
      {batch.phase === 'sent' && <><p role="status">已向浏览器发起 ZIP 下载。请在浏览器中确认保存位置。项目仍可继续编辑。</p><button className="button button--quiet" onClick={close}>返回预览</button></>}
      {batch.phase === 'error' && <><p role="alert">导出失败：{batch.message}</p><button className="button button--primary" onClick={() => void (rendered.current ? retryPackage() : prepareFullSet())}>重试</button><p>项目未改变，仍可在每个月的编辑页分别生成 PNG。</p><button className="button button--quiet" onClick={close}>返回预览</button></>}
    </section></div>}
  </main>;
}
