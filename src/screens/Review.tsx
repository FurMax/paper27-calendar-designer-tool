import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ALL_MONTHS, type MonthNumber } from '../domain/calendar.ts';
import type { Location } from '../app/navigation.ts';
import { useProject } from '../app/ProjectContext.tsx';
import { isMonthReady, type HexColor } from '../domain/project.ts';
import { analyzePhotoPalette } from '../features/photos/recommendColors.ts';
import { coordinatedSetColorChoice, recommendPhotoPalette } from '../domain/photoPalette.ts';
import { CalendarProof } from '../components/CalendarProof.tsx';
import { ExportCancelledError, missingExportMonths, renderFullSet, type ExportProgress } from '../export/exportController.ts';
import { packageImageZip } from '../export/zip.ts';
import { startBrowserDownload } from '../export/delivery.ts';
import { renderMonthImage, type RenderedMonthFile } from '../export/canvasRenderer.ts';
import { ExportVariantPicker } from '../components/ExportVariantPicker.tsx';
import { ExportFormatPicker } from '../components/ExportFormatPicker.tsx';
import type { ExportFormat } from '../domain/exportFormat.ts';
import type { ExportVariant } from '../domain/exportVariant.ts';
import { analyzePhotoEdgeRisk, PHOTO_EDGE_LABELS, type PhotoEdge } from '../export/photoEdgeRisk.ts';

type ColorProposal = { month: MonthNumber; before: HexColor; after: HexColor; fallback: boolean; basisColor: HexColor; basisLabel: string; softened: boolean };
type BatchState = { phase: 'idle' | 'checking' | 'warning' | 'working' | 'ready' | 'sent' | 'error'; progress?: ExportProgress; message?: string };
gsap.registerPlugin(useGSAP);

export function Review({ navigate }: { navigate: (location: Location) => void }) {
  const { state, dispatch } = useProject();
  const reviewRoot = useRef<HTMLElement>(null);
  const animatedColorProgress = useRef(0);
  const applyWaveSequence = useRef(0);
  const [applyWave, setApplyWave] = useState<{ id: number; months: MonthNumber[]; colors: ColorProposal[] } | null>(null);
  const missing = state ? missingExportMonths(state) : ALL_MONTHS;
  const count = 12 - missing.length;
  const [batch, setBatch] = useState<BatchState>({ phase: 'idle' });
  const [edgeWarnings, setEdgeWarnings] = useState<{ month: MonthNumber; edges: PhotoEdge[] }[]>([]);
  const [exportVariant, setExportVariant] = useState<ExportVariant>('print');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [colorSheet, setColorSheet] = useState<'idle' | 'loading' | 'preview'>('idle');
  const [colorProgress, setColorProgress] = useState(0);
  const [colorProposals, setColorProposals] = useState<ColorProposal[]>([]);
  const [previewMonth, setPreviewMonth] = useState<MonthNumber>(1);
  const colorChangeCount = colorProposals.filter(item => item.before !== item.after).length;
  const unchangedColorCount = colorProposals.length - colorChangeCount;
  const [colorNotice, setColorNotice] = useState('');
  const colorGeneration = useRef(0);

  useGSAP(() => {
    if (!reviewRoot.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (colorSheet === 'loading') {
      const from = animatedColorProgress.current;
      animatedColorProgress.current = colorProgress;
      if (reduced || colorProgress <= from) return;
      const items = Array.from(reviewRoot.current.querySelectorAll<HTMLElement>('.set-color-placeholder.is-ready'))
        .filter(item => Number(item.dataset.month) > from && Number(item.dataset.month) <= colorProgress);
      gsap.fromTo(items, { opacity: 0, y: 6, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.24, stagger: 0.045, ease: 'power2.out' });
    } else if (colorSheet === 'preview' && !reduced) {
      const rows = reviewRoot.current.querySelectorAll<HTMLElement>('.set-color-strip .set-color-row');
      gsap.fromTo(rows, { opacity: 0, y: 8, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.28, stagger: 0.04, ease: 'power2.out' });
    }
  }, { scope: reviewRoot, dependencies: [colorSheet, colorProgress], revertOnUpdate: true });
  useGSAP(() => {
    if (!applyWave || !reviewRoot.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cards = applyWave.months.map(month => reviewRoot.current?.querySelector<HTMLElement>(`.review-card[data-month="${month}"] .review-card__wave`)).filter((item): item is HTMLElement => !!item);
    const ribbon = reviewRoot.current.querySelectorAll<HTMLElement>('.set-color-applied-ribbon__item');
    gsap.timeline().fromTo(ribbon, { opacity: 0.25, y: 5, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.24, stagger: 0.035, ease: 'power2.out' }, 0)
      .to(cards, { y: -3, duration: 0.18, stagger: 0.035, ease: 'power2.out' }, 0.06)
      .to(cards, { y: 0, duration: 0.22, stagger: 0.035, ease: 'power2.inOut' }, 0.24);
  }, { scope: reviewRoot, dependencies: [applyWave], revertOnUpdate: true });
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const zipUrl = useRef<string | null>(null);
  const rendered = useRef<RenderedMonthFile[] | null>(null);
  const working = useRef(false);
  useEffect(() => () => { generation.current++; colorGeneration.current++; controller.current?.abort(); if (zipUrl.current) URL.revokeObjectURL(zipUrl.current); }, []);
  function clearPrepared() { if (zipUrl.current) URL.revokeObjectURL(zipUrl.current); zipUrl.current = null; rendered.current = null; }
  async function previewSetColors() {
    if (!state || missing.length || colorSheet !== 'idle') return;
    const id = ++colorGeneration.current;
    animatedColorProgress.current = 0; setColorNotice(''); setColorProgress(0); setColorProposals([]); setPreviewMonth(1); setColorSheet('loading');
    const proposals: ColorProposal[] = [];
    for (const month of ALL_MONTHS) {
      if (id !== colorGeneration.current) return;
      const slot = state.project.months[month];
      const item = state.project.photoItems[slot.photoItemId!];
      const asset = state.assets[item.assetId];
      let fallback = false;
      let palette;
      try { palette = await analyzePhotoPalette(asset.blob, asset.decodedWidth, asset.decodedHeight, slot.crop!, 'print'); }
      catch { palette = recommendPhotoPalette([]); fallback = true; }
      if (id !== colorGeneration.current) return;
      const choice = coordinatedSetColorChoice(palette);
      proposals.push({ month, before: slot.style.background, after: choice.color, fallback: fallback || palette.fallback, basisColor: choice.basisColor, basisLabel: choice.basisLabel, softened: choice.softened });
      setColorProgress(proposals.length); setColorProposals([...proposals]);
    }
    setColorProposals(proposals); setColorSheet('preview');
  }
  function closeColorSheet() { colorGeneration.current++; setColorSheet('idle'); setColorProposals([]); }
  function applySetColors() {
    if (!state || colorSheet !== 'preview') return;
    if (!colorChangeCount) { setColorNotice('推荐色与当前颜色相同，无需修改。'); closeColorSheet(); return; }
    const colors = Object.fromEntries(colorProposals.map(item => [item.month, item.after])) as Partial<Record<MonthNumber, HexColor>>;
    dispatch({ type: 'apply-color-batch', colors });
    setApplyWave({ id: ++applyWaveSequence.current, months: colorProposals.filter(item => item.before !== item.after).map(item => item.month), colors: colorProposals });
    clearPrepared(); setBatch({ phase: 'idle' });
    setColorNotice(`已应用整套推荐配色 · 更新 ${colorChangeCount} 个月。`);
    closeColorSheet();
  }
  function restoreSetColors() {
    dispatch({ type: 'restore-color-batch' });
    setApplyWave(null);
    clearPrepared(); setBatch({ phase: 'idle' });
    setColorNotice('已撤销本次配色，恢复应用前的背景。');
  }

  async function prepareFullSet(skipEdgeCheck = false) {
    if (!state || missing.length || working.current) return;
    clearPrepared(); working.current = true;
    const id = ++generation.current, abort = new AbortController(); controller.current = abort;
    setBatch({ phase: skipEdgeCheck ? 'working' : 'checking', progress: { phase: 'rendering', completed: 0, current: 1 } });
    try {
      if (!skipEdgeCheck) {
        const warnings: { month: MonthNumber; edges: PhotoEdge[] }[] = [];
        for (const month of ALL_MONTHS) {
          if (abort.signal.aborted || id !== generation.current) return;
          const slot = state.project.months[month];
          const item = state.project.photoItems[slot.photoItemId!];
          const asset = state.assets[item.assetId];
          try {
            const edges = await analyzePhotoEdgeRisk(asset.blob, asset.decodedWidth, asset.decodedHeight, slot.crop!, exportVariant);
            if (edges.length) warnings.push({ month, edges });
          } catch { warnings.push({ month, edges: [] }); }
        }
        if (abort.signal.aborted || id !== generation.current) return;
        if (warnings.length) {
          setEdgeWarnings(warnings);
          setBatch({ phase: 'warning' });
          return;
        }
        setEdgeWarnings([]);
        setBatch({ phase: 'working', progress: { phase: 'rendering', completed: 0, current: 1 } });
      }
      const files = await renderFullSet(state, progress => { if (id === generation.current) setBatch({ phase: 'working', progress }); }, abort.signal, (snapshot, month) => renderMonthImage(snapshot, month, exportVariant, exportFormat), exportFormat);
      if (id !== generation.current || abort.signal.aborted) return;
      rendered.current = files;
      const zip = await packageImageZip(files, exportFormat);
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
      const zip = await packageImageZip(rendered.current, exportFormat);
      if (id !== generation.current) return;
      zipUrl.current = URL.createObjectURL(zip);
      setBatch({ phase: 'ready', progress: { phase: 'packaging', completed: 12 } });
    } catch (error) { if (id === generation.current) setBatch({ phase: 'error', message: error instanceof Error ? error.message : 'ZIP 打包失败。' }); }
    finally { working.current = false; }
  }
  function cancel() { generation.current++; controller.current?.abort(); controller.current = null; working.current = false; clearPrepared(); setBatch({ phase: 'idle' }); }
  function download() { if (!zipUrl.current) return; const base = exportVariant === 'print' ? 'Calendar-Design-Studio-2027-Print-106x156mm' : 'Calendar-Design-Studio-2027'; startBrowserDownload(zipUrl.current, base + (exportFormat === 'jpg' ? '-JPG' : '') + '.zip'); setBatch({ phase: 'sent' }); }
  function changeVariant(next: ExportVariant) { if ((batch.phase === 'working' || batch.phase === 'checking')) return; clearPrepared(); setBatch({ phase: 'idle' }); setExportVariant(next); }
  function changeFormat(next: ExportFormat) { if ((batch.phase === 'working' || batch.phase === 'checking')) return; clearPrepared(); setBatch({ phase: 'idle' }); setExportFormat(next); }
  function close() { clearPrepared(); setBatch({ phase: 'idle' }); }
  useEffect(() => {
    if (colorSheet === 'idle' && batch.phase === 'idle') return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (colorSheet !== 'idle') closeColorSheet();
      else if (batch.phase === 'working' || batch.phase === 'checking') cancel();
      else close();
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [colorSheet, batch.phase]);
  const activeProposal = colorProposals.find(item => item.month === previewMonth) ?? colorProposals[0];
  const proposedState = state && activeProposal ? { ...state, project: { ...state.project, months: { ...state.project.months, [activeProposal.month]: { ...state.project.months[activeProposal.month], style: { ...state.project.months[activeProposal.month].style, background: activeProposal.after } } } } } : state;
  return <main ref={reviewRoot} className="page review-page"><header className="page-header"><div><span className="eyebrow">03 / 03</span><h1>预览与导出</h1><p className={`review-completion${count === 12 ? ' is-complete' : ''}`}><strong>{count} / 12</strong><span>{count === 12 ? '整套月历已就绪' : '个月已就绪'}</span></p></div><button className="button button--quiet" onClick={() => navigate(count === 12 ? { screen: 'editor', month: 1 } : { screen: 'assign' })}>{count === 12 ? '编辑月份' : '分配照片'}</button></header><p className="instruction">{count === 12 ? '检查月历与配色，然后选择用途和格式。' : '为每个月添加照片后，可生成 12 张独立的月历文件。'}</p><div className="review-grid">{ALL_MONTHS.map(month => <button type="button" className="review-card" data-month={month} key={month} aria-label={`去编辑 ${month} 月${state && isMonthReady(state, month) ? '，已就绪' : '，缺少照片'}`} onClick={() => navigate({ screen: 'editor', month })}><div className="review-card__wave"><CalendarProof month={month} compact state={state} variant={exportVariant} /><span className="review-card__caption"><strong>{month} 月</strong><small>{state && isMonthReady(state, month) ? '已就绪' : '缺少照片'}</small></span><span className="review-card__edit-hint" aria-hidden="true">编辑 {month} 月 ↗</span></div></button>)}</div>
    {missing.length > 0 && <div className="review-missing"><p>还需为以下月份添加照片，才能生成整套文件：</p><div>{missing.map(month => <button key={month} className="button button--quiet" onClick={() => navigate({ screen: 'editor', month })}>{month} 月 · 添加照片</button>)}</div></div>}
    <section className="set-color-panel" aria-label="整套配色"><div><h2>整套配色</h2><p>从每个月照片提取的推荐色里选择轻微撞色的背景；过深或过艳时柔和处理。应用前可逐月预览。</p></div><div className="set-color-panel__actions"><button className="button button--quiet" disabled={missing.length > 0 || batch.phase === 'working' || batch.phase === 'checking'} onClick={() => void previewSetColors()}>为全部月份推荐配色</button>{state?.project.colorBatchUndo && <button className="button button--quiet" onClick={restoreSetColors}>撤销本次配色</button>}</div></section>
    {applyWave && <div className="set-color-applied-ribbon" aria-hidden="true">{applyWave.colors.map(item => <span key={item.month} className="set-color-applied-ribbon__item"><small>{item.month} 月</small><i style={{ background: item.after }} /></span>)}</div>}
    {colorNotice && <p className="set-color-notice" role="status">{colorNotice}</p>}
    <div className="review-export-heading"><h2>导出整套月历</h2><p>选择用途与文件格式，再生成 12 张独立月历。</p></div>
    <div className="review-export-options"><ExportVariantPicker name="review-export-variant" value={exportVariant} onChange={changeVariant} disabled={(batch.phase === 'working' || batch.phase === 'checking')} /><ExportFormatPicker name="review-export-format" value={exportFormat} onChange={changeFormat} disabled={(batch.phase === 'working' || batch.phase === 'checking')} /></div>
    <div className="page-actions"><button className="button button--primary" disabled={missing.length > 0 || (batch.phase === 'working' || batch.phase === 'checking')} onClick={() => void prepareFullSet()}>生成整套 12 张</button></div>
    {colorSheet !== 'idle' && <div className="sheet-backdrop" onClick={colorSheet === 'preview' ? closeColorSheet : undefined}><section className="action-sheet set-color-sheet" role="dialog" aria-modal="true" aria-label="整套配色预览" onClick={event => event.stopPropagation()}><div className="sheet-heading"><h2>为全部月份推荐配色</h2><button onClick={closeColorSheet} aria-label="关闭">×</button></div>
      {colorSheet === 'loading' ? <><p role="status">正在分析 12 张照片 · {colorProgress} / 12</p><progress max={12} value={colorProgress} aria-label="照片配色分析进度" /><div className="set-color-strip set-color-strip--loading" aria-hidden="true">{ALL_MONTHS.map(month => { const proposal = colorProposals.find(item => item.month === month); return <span key={month} data-month={month} className={`set-color-placeholder${proposal ? ' is-ready' : ''}`}><small>{month} 月 {proposal ? '✓' : ''}</small><i style={{ background: proposal?.after ?? 'var(--desk)' }} /></span>; })}</div></> : <>
        <p className="set-color-sheet__intro">从每个月已提取的推荐色中选择搭配色。点选月份查看来源与效果；确认前不会更改日历。</p>
        <div className="set-color-strip" aria-label="十二个月推荐配色">{colorProposals.map(item => <button key={item.month} type="button" className={`set-color-row${activeProposal?.month === item.month ? ' is-current' : ''}`} aria-pressed={activeProposal?.month === item.month} aria-label={`${item.month} 月，推荐色 ${item.after}${item.fallback ? '，备选色' : ''}，查看预览`} onClick={() => setPreviewMonth(item.month)}><span className="set-color-row__month">{item.month} 月</span><span className="set-color-row__swatch" style={{ background: item.after }} /><span className="set-color-row__hex">{item.after}</span></button>)}</div>
        {activeProposal && <div className="set-color-preview"><div className="set-color-preview__proof"><CalendarProof month={activeProposal.month} compact state={proposedState} variant="print" /></div><div className="set-color-preview__copy"><strong>{activeProposal.month} 月预览</strong><p>当前背景 <span className="set-color-preview__swatch" style={{ background: activeProposal.before }} /> {activeProposal.before}</p><p>推荐背景 <span className="set-color-preview__swatch" style={{ background: activeProposal.after }} /> {activeProposal.after}</p><small>{activeProposal.fallback ? '照片暂时无法取色，当前为固定备选色。' : `来自本月照片「${activeProposal.basisLabel}」${activeProposal.basisColor}${activeProposal.softened ? '，已柔和处理以适合作为背景。' : '。'}`}</small><small>{activeProposal.before === activeProposal.after ? '与当前背景色相同。' : '预览中的月历尚未保存。'}</small><button type="button" className="button button--quiet" onClick={() => { closeColorSheet(); navigate({ screen: 'editor', month: activeProposal.month }); }}>去编辑 {activeProposal.month} 月</button></div></div>}
        <p className="set-color-sheet__note">{colorChangeCount ? `将更新 ${colorChangeCount} 个月${unchangedColorCount ? ` · ${unchangedColorCount} 个月的推荐背景与当前相同，无需变化` : ''}` : '12 个月的推荐背景都与当前相同，无需应用'}。照片、裁切和文字设置不变。</p><div className="confirm-actions"><button className="button button--quiet" onClick={closeColorSheet}>取消</button><button className="button button--primary" disabled={!colorChangeCount} onClick={applySetColors}>应用推荐配色 · {colorChangeCount} 个月</button></div>
      </>}
    </section></div>}
    {batch.phase !== 'idle' && <div className="sheet-backdrop"  onClick={(batch.phase === 'working' || batch.phase === 'checking') ? undefined : close}><section className="action-sheet export-sheet" role="dialog" aria-modal="true" aria-label="整套导出" onClick={event => event.stopPropagation()}><div className="sheet-heading"><h2>整套导出 · 2027</h2>{batch.phase !== 'working' && batch.phase !== 'checking' && <button onClick={close} aria-label="关闭">×</button>}</div>
      {batch.phase === 'checking' && <><p role="status">正在检查 12 个月的照片边缘…</p><button className="button button--quiet" onClick={cancel}>取消检查</button></>}
      {batch.phase === 'warning' && <><p role="status">以下月份的照片边缘偏白/偏浅或无法完成检查；导出后可能出现白边，请先确认四边：</p><div className="edge-warning-months">{edgeWarnings.map(({ month, edges }) => <button key={month} className="button button--quiet" onClick={() => { close(); navigate({ screen: 'editor', month }); }}>{month} 月 · {edges.length ? edges.map(edge => PHOTO_EDGE_LABELS[edge]).join('、') : '边缘检查不可用'} · 调整照片</button>)}</div><p>请放大或移动照片，直到编辑页提示消失；如果这是照片本身的浅色背景，也可继续生成。</p><button className="button button--primary" onClick={() => void prepareFullSet(true)}>仍然生成 12 张</button></>}
      {batch.phase === 'working' && <><p role="status">{batch.progress?.phase === 'packaging' ? '12 张 ' + exportFormat.toUpperCase() + ' 已生成，正在制作 ZIP 包…' : `正在生成 ${batch.progress?.current ?? 1} 月 ${exportFormat.toUpperCase()} · 已完成 ${batch.progress?.completed ?? 0} / 12`}</p><progress max={12} value={batch.progress?.completed ?? 0} /><div className="export-month-progress" aria-hidden="true">{ALL_MONTHS.map(month => <span key={month} className={(batch.progress?.completed ?? 0) >= month ? 'is-complete' : batch.progress?.phase === 'rendering' && batch.progress.current === month ? 'is-current' : ''}>{month} 月{(batch.progress?.completed ?? 0) >= month ? ' ✓' : ''}</span>)}</div><button className="button button--quiet" onClick={cancel}>取消生成</button></>}
      {batch.phase === 'ready' && <><p className="export-success" role="status">{exportVariant === 'print' ? '12 张印刷版 ' + exportFormat.toUpperCase() : '12 张屏幕版 ' + exportFormat.toUpperCase()} 已准备好，按 1–12 月命名并装入 ZIP。请点击下载交给浏览器处理。</p><button className="button button--primary" onClick={download}>下载 ZIP（12 张 {exportFormat.toUpperCase()}）</button><p className="export-note">下载后请在设备的下载位置打开或解压 ZIP，查看其中 12 张 {exportFormat.toUpperCase()}；不会自动存入“照片”。</p></>}
      {batch.phase === 'sent' && <><p role="status">已向浏览器发起 ZIP 下载。请在浏览器中确认保存位置。项目仍可继续编辑。</p><button className="button button--quiet" onClick={close}>返回预览</button></>}
      {batch.phase === 'error' && <><p role="alert">整套文件暂时无法生成。项目已保留，可以重试。</p>{batch.message && <details className="error-detail"><summary>查看错误详情</summary><p>{batch.message}</p></details>}<button className="button button--primary" onClick={() => void (rendered.current ? retryPackage() : prepareFullSet())}>重试</button><p>项目未改变，仍可在每个月的编辑页分别生成 {exportFormat.toUpperCase()}。</p><button className="button button--quiet" onClick={close}>返回预览</button></>}
    </section></div>}
  </main>;
}
