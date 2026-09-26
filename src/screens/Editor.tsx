import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ALL_MONTHS, type MonthNumber } from '../domain/calendar.ts';
import type { Location } from '../app/navigation.ts';
import { useProject } from '../app/ProjectContext.tsx';
import { isMonthReady, type CropState } from '../domain/project.ts';
import { resetCrop, setCropZoom } from '../domain/crop.ts';
import { CalendarProof } from '../components/CalendarProof.tsx';
import { PhotoEffectControls } from '../components/PhotoEffectControls.tsx';
import { TextureControls } from '../components/TextureControls.tsx';
import { BackgroundControls, TextColorControls, TypographyControls } from '../components/StyleControls.tsx';
import { PhotoColorPicker } from '../components/PhotoColorPicker.tsx';
import { analyzePhotoPalette } from '../features/photos/recommendColors.ts';
import { recommendPhotoPalette, type PhotoPalette } from '../domain/photoPalette.ts';
import { ImportantDateControls } from '../components/ImportantDateControls.tsx';
import { IMPORTANT_MARK_STYLES } from '../domain/importantDates.ts';
import { TEXTURE_OPTIONS } from '../domain/texture.ts';
import { SCALE_LABELS, TYPOGRAPHY_PRESETS } from '../domain/typography.ts';
import type { ExportFormat } from '../domain/exportFormat.ts';
import type { ExportVariant } from '../domain/exportVariant.ts';
import type { HexColor } from '../domain/project.ts';
import { renderMonthImage } from '../export/canvasRenderer.ts';
import { analyzePhotoEdgeRisk, PHOTO_EDGE_LABELS, type PhotoEdge } from '../export/photoEdgeRisk.ts';

gsap.registerPlugin(useGSAP);

type MonthExportRequest = { month: MonthNumber; variant: ExportVariant; format: ExportFormat };
type MonthExportStatus = { phase: 'idle' | 'preparing' | 'ready' | 'sent' | 'error'; request?: MonthExportRequest; fileName?: string; message?: string };
const MONTH_EXPORT_CHOICES: { variant: ExportVariant; format: ExportFormat; label: string; detail: string }[] = [
  { variant: 'print', format: 'png', label: '印刷版 · PNG', detail: '1252 × 1843 px · 300 PPI' },
  { variant: 'print', format: 'jpg', label: '印刷版 · JPG', detail: '1252 × 1843 px · 300 PPI' },
  { variant: 'digital', format: 'png', label: '屏幕版 · PNG', detail: '1200 × 1800 px' },
  { variant: 'digital', format: 'jpg', label: '屏幕版 · JPG', detail: '1200 × 1800 px' },
];

export function Editor({ month, navigate, onImport }: { month: MonthNumber; navigate: (location: Location) => void; onImport: (files: FileList, target?: MonthNumber) => void }) {
  const { state, dispatch } = useProject();
  const picker = useRef<HTMLInputElement>(null);
  const editorRoot = useRef<HTMLElement>(null);
  const [monthMotion, setMonthMotion] = useState<{ base: MonthNumber; target: MonthNumber | null }>({ base: month, target: null });
  if (month !== (monthMotion.target ?? monthMotion.base)) {
    setMonthMotion(current => ({ base: current.base, target: month === current.base ? null : month }));
  }
  useGSAP((_, contextSafe) => {
    if (!monthMotion.target || !editorRoot.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMonthMotion(current => current.target === month ? { base: month, target: null } : current);
      return;
    }
    const incoming = editorRoot.current.querySelector<HTMLElement>('.month-proof-layer--current.is-incoming');
    if (!incoming || !contextSafe) return;
    let active = true;
    let started = false;
    let image: HTMLImageElement | null = null;
    const startReveal = contextSafe(() => {
      if (!active || started) return;
      started = true;
      gsap.timeline({ onComplete: () => setMonthMotion(current => current.target === month ? { base: month, target: null } : current) })
        .fromTo(incoming, { autoAlpha: 0, y: 6, scale: 0.995 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.18, ease: 'power2.out' });
    });
    const decodeAndReveal = () => {
      if (!active || !image) return;
      if (image.naturalWidth === 0) { startReveal(); return; }
      if (image.decode) void image.decode().then(startReveal, startReveal);
      else startReveal();
    };
    const observer = new MutationObserver(() => {
      if (!active || image) return;
      image = incoming.querySelector<HTMLImageElement>('.crop-surface img');
      if (!image) return;
      observer.disconnect();
      if (image.complete) decodeAndReveal();
      else { image.addEventListener('load', decodeAndReveal, { once: true }); image.addEventListener('error', startReveal, { once: true }); }
    });
    if (!incoming.querySelector('.crop-surface')) startReveal();
    else { observer.observe(incoming, { childList: true, subtree: true }); observer.takeRecords(); image = incoming.querySelector<HTMLImageElement>('.crop-surface img'); if (image) { observer.disconnect(); if (image.complete) decodeAndReveal(); else { image.addEventListener('load', decodeAndReveal, { once: true }); image.addEventListener('error', startReveal, { once: true }); } } }
    const fallback = window.setTimeout(() => { if (!image || image.complete) startReveal(); }, 1200);
    return () => { active = false; observer.disconnect(); window.clearTimeout(fallback); image?.removeEventListener('load', decodeAndReveal); image?.removeEventListener('error', startReveal); };
  }, { scope: editorRoot, dependencies: [monthMotion.base, monthMotion.target], revertOnUpdate: true });
  const [cropSheetOpen, setCropSheetOpen] = useState(false);
  const [fineTuneOpen, setFineTuneOpen] = useState(true);
  const [markOpen, setMarkOpen] = useState(false);
  const [monthSheetOpen, setMonthSheetOpen] = useState(false);
  const [backgroundSheetOpen, setBackgroundSheetOpen] = useState(false);
  const [sampleSheetOpen, setSampleSheetOpen] = useState(false);
  const sampleReturnToBackground = useRef(false);
  const exportVariant: ExportVariant = 'print';
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenu = useRef<HTMLDivElement>(null);
  const exportTrigger = useRef<HTMLButtonElement>(null);
  const [edgeRisk, setEdgeRisk] = useState<PhotoEdge[]>([]);
  const [edgeScanError, setEdgeScanError] = useState(false);
  const [monthlyPalette, setMonthlyPalette] = useState<{ key: string; value: PhotoPalette; error: boolean } | null>(null);
  const [singleExport, setSingleExport] = useState<MonthExportStatus>({ phase: 'idle' });
  const exportUrl = useRef<string | null>(null);
  const exportGeneration = useRef(0);
  useEffect(() => () => { exportGeneration.current++; if (exportUrl.current) URL.revokeObjectURL(exportUrl.current); }, []);
  useEffect(() => { exportGeneration.current++; if (exportUrl.current) URL.revokeObjectURL(exportUrl.current); exportUrl.current = null; setSingleExport({ phase: 'idle' }); setExportMenuOpen(false); }, [state?.project.months[month], state?.project.typography, state?.assets, month]);
  useEffect(() => {
    if (!exportMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => { if (!exportMenu.current?.contains(event.target as Node)) setExportMenuOpen(false); };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { setExportMenuOpen(false); exportTrigger.current?.focus(); } };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onKeyDown); };
  }, [exportMenuOpen]);
  useEffect(() => {
    if (!monthSheetOpen && !backgroundSheetOpen && !cropSheetOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      if (monthSheetOpen) setMonthSheetOpen(false);
      else if (backgroundSheetOpen) setBackgroundSheetOpen(false);
      else setCropSheetOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [monthSheetOpen, backgroundSheetOpen, cropSheetOpen]);
  useEffect(() => { setSampleSheetOpen(false); }, [month]);
  const slot = state?.project.months[month];
  const styleSummary = slot && state ? [
    TEXTURE_OPTIONS.find(option => option.id === (slot.style.texture ?? 'none'))?.label ?? '无纹理',
    TYPOGRAPHY_PRESETS[state.project.typography.presetId].label,
    SCALE_LABELS[state.project.typography.scale],
  ].join(' / ') : '';
  const markedCount = slot?.importantDays?.length ?? 0;
  const markStyleLabel = IMPORTANT_MARK_STYLES.find(option => option.id === (state?.project.importantMarkStyle ?? 'red'))?.label ?? '红字';
  const dateSummary = markedCount ? `已标记 ${markedCount} 天 · ${markStyleLabel}` : '未标记';
  const item = slot?.photoItemId ? state?.project.photoItems[slot.photoItemId] : null;
  const asset = item ? state?.assets[item.assetId] : null;
  const ready = state ? isMonthReady(state, month) : false;
  const paletteKey = asset && slot?.crop ? `${asset.id}|${slot.crop.zoom}|${slot.crop.offsetX}|${slot.crop.offsetY}|${exportVariant}` : null;
  const activePalette = monthlyPalette?.key === paletteKey ? monthlyPalette : null;
  useEffect(() => {
    if (!asset || !slot?.crop || !paletteKey) return;
    let active = true;
    const timer = window.setTimeout(() => {
      void analyzePhotoPalette(asset.blob, asset.decodedWidth, asset.decodedHeight, slot.crop!, exportVariant)
        .then(value => { if (active) setMonthlyPalette({ key: paletteKey, value, error: false }); })
        .catch(() => { if (active) setMonthlyPalette({ key: paletteKey, value: recommendPhotoPalette([]), error: true }); });
    }, 160);
    return () => { active = false; window.clearTimeout(timer); };
  }, [paletteKey, asset?.blob]);
  useEffect(() => {
    if (!asset || !slot?.crop) { setEdgeRisk([]); setEdgeScanError(false); return; }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void analyzePhotoEdgeRisk(asset.blob, asset.decodedWidth, asset.decodedHeight, slot.crop!, exportVariant)
        .then(edges => { if (!cancelled) { setEdgeRisk(edges); setEdgeScanError(false); } })
        .catch(() => { if (!cancelled) { setEdgeRisk([]); setEdgeScanError(true); } });
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [asset?.blob, asset?.decodedWidth, asset?.decodedHeight, slot?.crop, exportVariant]);
  const edgeNotice = edgeRisk.length
    ? <p className="photo-edge-warning" role="status">照片{edgeRisk.map(edge => PHOTO_EDGE_LABELS[edge]).join('、')}边缘（含预览外的印刷出血区）偏白或偏浅，导出后可能出现白边。请放大或移动照片，直到提示消失。</p>
    : edgeScanError ? <p className="photo-edge-warning" role="status">暂时无法检查照片边缘；导出前请放大预览，确认四边没有白边。</p> : null;
  function changeCrop(crop: CropState) { dispatch({ type: 'set-crop', month, crop }); }
  function openPhotoSample(fromBackgroundSheet: boolean) { sampleReturnToBackground.current = fromBackgroundSheet; setBackgroundSheetOpen(false); setSampleSheetOpen(true); }
  function closePhotoSample(color?: HexColor) { if (color) dispatch({ type: 'set-background', month, color }); setSampleSheetOpen(false); if (sampleReturnToBackground.current) setBackgroundSheetOpen(true); }
  function handoffSingleImage(fileName: string, request: MonthExportRequest) {
    if (!exportUrl.current) return;
    const link = document.createElement('a'); link.href = exportUrl.current; link.download = fileName;
    document.body.append(link);
    try { link.click(); setSingleExport({ phase: 'sent', request, fileName }); }
    catch { setSingleExport({ phase: 'ready', request, fileName }); }
    finally { link.remove(); }
  }
  async function prepareSingleImage(variant: ExportVariant, format: ExportFormat) {
    if (!state || !ready || singleExport.phase === 'preparing') return;
    setExportMenuOpen(false);
    if (exportUrl.current) { URL.revokeObjectURL(exportUrl.current); exportUrl.current = null; }
    const request: MonthExportRequest = { month, variant, format };
    const generation = ++exportGeneration.current;
    setSingleExport({ phase: 'preparing', request });
    try {
      const rendered = await renderMonthImage(structuredClone(state), request.month, variant, format);
      if (generation !== exportGeneration.current) return;
      exportUrl.current = URL.createObjectURL(rendered.blob);
      handoffSingleImage(rendered.fileName, request);
    } catch (error) { if (generation === exportGeneration.current) setSingleExport({ phase: 'error', request, message: error instanceof Error ? error.message : '文件生成失败，请重试。' }); }
  }
  function closeSingleImage() { exportGeneration.current++; if (exportUrl.current) URL.revokeObjectURL(exportUrl.current); exportUrl.current = null; setSingleExport({ phase: 'idle' }); }
  function onExportMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); items[(index + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); items[event.key === 'Home' ? 0 : items.length - 1]?.focus();
    }
  }
  function cropControls(controlId: string) {
    if (!asset || !slot?.crop) return <p>为这个月添加一张照片。</p>;
    return <><p>{controlId === 'crop-zoom-mobile' ? '拖动调整位置；双指或滑块缩放。' : '拖动调整位置，滚轮或滑块缩放。'}</p><label className="zoom-label" htmlFor={controlId}>缩放 <output>{slot.crop.zoom.toFixed(2)}×</output></label><input id={controlId} className="zoom-range" type="range" style={{ '--range-progress': `${(slot.crop.zoom - 1) * 50}%` } as CSSProperties} min="1" max="3" step="0.01" value={slot.crop.zoom} onChange={event => changeCrop(setCropZoom(slot.crop!, { width: asset.decodedWidth, height: asset.decodedHeight }, Number(event.target.value)))} />{edgeNotice}<div className="crop-action-row"><button className="button button--quiet" onClick={() => changeCrop(resetCrop())}>重置裁切</button><button className="button button--quiet" onClick={() => { setCropSheetOpen(false); picker.current?.click(); }}>替换照片</button></div></>;
  }
  return <main ref={editorRoot} className="page editor-page">
    <div className="editor-head"><div><span className="eyebrow">02 / 03 · 2027</span><h1>编辑月份</h1></div>
      <div className="editor-head-actions">
        <div className="month-export" ref={exportMenu} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setExportMenuOpen(false); }}>
          <button ref={exportTrigger} type="button" className="button button--quiet month-export__trigger" disabled={!ready || singleExport.phase === 'preparing'} aria-haspopup="menu" aria-expanded={exportMenuOpen} aria-controls={exportMenuOpen ? 'month-export-menu' : undefined} onClick={() => setExportMenuOpen(open => !open)}>导出本月 <span aria-hidden="true">⌄</span></button>
          {exportMenuOpen && <div id="month-export-menu" className="month-export__menu" role="menu" aria-label="导出当前月份" onKeyDown={onExportMenuKeyDown}>
            <div className="month-export__heading">导出本月</div>
            {MONTH_EXPORT_CHOICES.map(choice => <button key={`${choice.variant}-${choice.format}`} type="button" role="menuitem" onClick={() => void prepareSingleImage(choice.variant, choice.format)}><strong>{choice.label}</strong><small>{choice.detail}</small></button>)}
          </div>}
        </div>
        <button className="button button--primary editor-review-action" onClick={() => navigate({ screen: 'review' })}>预览与导出</button>
      </div>
      {singleExport.phase !== 'idle' && !exportMenuOpen && <div className="month-export-status" role="status">
        {singleExport.phase === 'preparing' && <p>正在生成 {singleExport.request?.month} 月 {singleExport.request?.format.toUpperCase()}…</p>}
        {singleExport.phase === 'sent' && <p>已尝试下载 {singleExport.fileName}。请确认浏览器下载；若未开始，可再点下载。</p>}
        {singleExport.phase === 'ready' && <p>{singleExport.fileName} 已准备好，请点下载。</p>}
        {singleExport.phase === 'error' && <p>生成失败：{singleExport.message}</p>}
        {singleExport.phase !== 'preparing' && <div className="month-export-status__actions">
          {(singleExport.phase === 'sent' || singleExport.phase === 'ready') && singleExport.fileName && singleExport.request && <button type="button" onClick={() => handoffSingleImage(singleExport.fileName!, singleExport.request!)}>再次下载</button>}
          {singleExport.phase === 'error' && singleExport.request && <button type="button" onClick={() => void prepareSingleImage(singleExport.request!.variant, singleExport.request!.format)}>重试生成</button>}
          <button type="button" onClick={closeSingleImage}>关闭</button>
        </div>}
      </div>}
    </div>
    <nav className="month-nav" aria-label="选择月份">{ALL_MONTHS.map(item => <button key={item} className={item === month ? 'is-current' : ''} aria-current={item === month ? 'page' : undefined} onClick={() => navigate({ screen: 'editor', month: item })}>{item} 月</button>)}</nav>
    <div className="phone-month-select"><button className="phone-month-select__current" onClick={() => setMonthSheetOpen(true)} aria-haspopup="dialog">{month} 月 · 2027 ▾</button><span>{ready ? '已就绪' : '缺少照片'}</span><button className="phone-month-select__review" onClick={() => navigate({ screen: 'review' })}>预览</button></div>
    <div className="editor-layout">
      <div className="editor-preview-column">
      <div className="proof-workspace">
        <div className="month-proof-stage">{(monthMotion.target ? [monthMotion.base, monthMotion.target] : [monthMotion.base]).map(layerMonth => {
          const incoming = layerMonth === monthMotion.target;
          return <div key={layerMonth} className={'month-proof-layer ' + (incoming || !monthMotion.target ? 'month-proof-layer--current' : 'month-proof-layer--outgoing') + (incoming ? ' is-incoming' : '')} aria-hidden={incoming ? undefined : !!monthMotion.target}><CalendarProof month={layerMonth} state={state} variant={exportVariant} onCropChange={layerMonth === month && ready ? changeCrop : undefined} /></div>;
        })}</div>
        {edgeNotice}
      </div>
      <p className="proof-caption">{exportVariant === 'print' ? '印刷版预览包含出血裁切，请确认照片四边。' : '屏幕版预览显示导出裁切。'}</p>
      </div>
      <aside className="properties-panel properties-panel--quick" aria-label="当前月份快捷控制">
        <div className="properties-panel__head"><span className="eyebrow">月份预览</span><h2>{month} 月 <span>2027</span></h2><span className="status-pill">{ready ? '已就绪' : '缺少照片'}</span></div>
        <section className="photo-controls-desktop"><div className="rail-section-head"><span className="eyebrow">01 · EDIT</span><h3>照片与颜色</h3></div>{ready ? cropControls('crop-zoom-desktop') : <><p>为这个月添加一张照片。</p><button className="button button--quiet" onClick={() => picker.current?.click()}>添加照片</button></>}<input ref={picker} className="visually-hidden" type="file" accept="image/*" onChange={event => { if (event.target.files) onImport(event.target.files, month); event.target.value = ''; }} /></section>
        <section className="photo-effect-section"><PhotoEffectControls blob={asset?.blob} width={asset?.decodedWidth} height={asset?.decodedHeight} crop={slot?.crop} value={slot?.photoEffect} onChange={effect => dispatch({ type: 'set-photo-effect', month, effect })} /></section>
        <button className="button button--quiet mobile-crop-trigger" onClick={() => setCropSheetOpen(true)}>{ready ? '照片与裁切' : '添加照片'}</button>
        <section className="quick-background-section"><h3>背景色</h3>{slot && <BackgroundControls color={slot.style.background} onChange={color => dispatch({ type: 'set-background', month, color })} onSample={asset && slot.crop ? () => openPhotoSample(false) : undefined} photoPalette={activePalette?.value} paletteLoading={!!asset && !activePalette} paletteError={activePalette?.error} />}<button className="button button--quiet mobile-style-trigger" onClick={() => setBackgroundSheetOpen(true)}>背景色与推荐色</button></section>
        <section className="rail-setting-section editor-deep-section--style" aria-labelledby="editor-style-heading">
          <button type="button" className="rail-section-toggle" aria-expanded={fineTuneOpen} aria-controls="editor-style-content" onClick={() => setFineTuneOpen(open => !open)}>
            <span className="rail-section-head"><span className="eyebrow">02 · FINE TUNE</span><h3 id="editor-style-heading">样式设置</h3>{!fineTuneOpen && <span className="rail-section-summary">{styleSummary}</span>}</span>
            <span className="rail-section-toggle__chevron" aria-hidden="true">{fineTuneOpen ? '⌃' : '⌄'}</span>
          </button>
          {fineTuneOpen && <div id="editor-style-content" className="editor-style-grid">
            <div className="editor-setting">{slot && <TextureControls value={slot.style.texture ?? 'none'} color={slot.style.background} onChange={texture => dispatch({ type: 'set-texture', month, texture })} />}</div>
            <div className="editor-setting"><h4>日历文字</h4>{slot && state && <TypographyControls presetId={state.project.typography.presetId} scale={state.project.typography.scale} onPreset={presetId => dispatch({ type: 'set-typography', presetId })} onScale={scale => dispatch({ type: 'set-typography', scale })} />}
              {slot && <div className="typography-ink"><h4>文字颜色 · 当前月份</h4><TextColorControls style={slot.style} onInk={(mode, color) => dispatch({ type: 'set-ink', month, mode, color })} /></div>}
            </div>
          </div>}
        </section>
        <section className="rail-setting-section editor-deep-section--dates" aria-labelledby="editor-dates-heading">
          <button type="button" className="rail-section-toggle" aria-expanded={markOpen} aria-controls="editor-dates-content" onClick={() => setMarkOpen(open => !open)}>
            <span className="rail-section-head"><span className="eyebrow">03 · MARK</span><h3 id="editor-dates-heading">日期设置</h3><span className="rail-section-summary">{dateSummary}</span></span>
            <span className="rail-section-toggle__chevron" aria-hidden="true">{markOpen ? '⌃' : '⌄'}</span>
          </button>
          {markOpen && <div id="editor-dates-content">{slot && <ImportantDateControls month={month} days={slot.importantDays ?? []} markStyle={state?.project.importantMarkStyle ?? 'red'} onStyleChange={style => dispatch({ type: 'set-important-mark-style', style })} onToggle={day => dispatch({ type: 'toggle-important-day', month, day })} />}</div>}
        </section>
      </aside>
    </div>
    <div className="month-dock"><button disabled={month === 1} onClick={() => navigate({ screen: 'editor', month: (month - 1) as MonthNumber })}>← 上个月</button><span>{month} / 12</span><button disabled={month === 12} onClick={() => navigate({ screen: 'editor', month: (month + 1) as MonthNumber })}>下个月 →</button></div>
    {monthSheetOpen && <div className="sheet-backdrop" onClick={() => setMonthSheetOpen(false)}><section className="action-sheet" role="dialog" aria-modal="true" aria-label="选择月份" onClick={event => event.stopPropagation()}><div className="sheet-heading"><h2>选择月份 · 2027</h2><button onClick={() => setMonthSheetOpen(false)} aria-label="关闭">×</button></div><div className="month-switch-grid">{ALL_MONTHS.map(item => <button key={item} className={item === month ? 'is-current' : ''} onClick={() => { setMonthSheetOpen(false); navigate({ screen: 'editor', month: item }); }}><strong>{item} 月</strong><small>{state && isMonthReady(state, item) ? '已就绪' : '缺少照片'}</small></button>)}</div></section></div>}
    {backgroundSheetOpen && <div className="sheet-backdrop" onClick={() => setBackgroundSheetOpen(false)}><section className="action-sheet" role="dialog" aria-modal="true" aria-label="背景色与推荐色" onClick={event => event.stopPropagation()}><div className="sheet-heading"><h2>背景色与推荐色</h2><button onClick={() => setBackgroundSheetOpen(false)} aria-label="关闭">×</button></div>{slot && <BackgroundControls color={slot.style.background} onChange={color => dispatch({ type: 'set-background', month, color })} onSample={asset && slot.crop ? () => openPhotoSample(true) : undefined} photoPalette={activePalette?.value} paletteLoading={!!asset && !activePalette} paletteError={activePalette?.error} />}<button className="button button--quiet sheet-cancel" onClick={() => setBackgroundSheetOpen(false)}>完成</button></section></div>}
    {sampleSheetOpen && asset && slot?.crop && <div className="sheet-backdrop" onClick={() => closePhotoSample()}><section className="action-sheet photo-sample-sheet" role="dialog" aria-modal="true" aria-label="从照片取色" onClick={event => event.stopPropagation()}><div className="sheet-heading"><h2>从照片取色</h2><button onClick={() => closePhotoSample()} aria-label="关闭">×</button></div><PhotoColorPicker blob={asset.blob} width={asset.decodedWidth} height={asset.decodedHeight} crop={slot.crop} variant={exportVariant} onPick={color => closePhotoSample(color)} onCancel={() => closePhotoSample()} /></section></div>}    {cropSheetOpen && <div className="sheet-backdrop" onClick={() => setCropSheetOpen(false)}><section className="action-sheet" role="dialog" aria-modal="true" aria-label="照片与裁切" onClick={event => event.stopPropagation()}><div className="sheet-heading"><h2>照片与裁切</h2><button onClick={() => setCropSheetOpen(false)} aria-label="关闭">×</button></div>{ready ? cropControls('crop-zoom-mobile') : <><p>为这个月添加一张照片。</p><button className="button button--primary" onClick={() => { setCropSheetOpen(false); picker.current?.click(); }}>添加照片</button></>}<button className="button button--quiet sheet-cancel" onClick={() => setCropSheetOpen(false)}>完成</button></section></div>}
  </main>;
}
