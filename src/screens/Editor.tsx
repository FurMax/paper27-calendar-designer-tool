import { useEffect, useRef, useState } from 'react';
import { ALL_MONTHS, type MonthNumber } from '../domain/calendar.ts';
import type { Location } from '../app/navigation.ts';
import { useProject } from '../app/ProjectContext.tsx';
import { isMonthReady, type CropState } from '../domain/project.ts';
import { resetCrop, setCropZoom } from '../domain/crop.ts';
import { CalendarProof } from '../components/CalendarProof.tsx';
import { BackgroundControls, TypographyControls } from '../components/StyleControls.tsx';
import { renderMonthPng } from '../export/canvasRenderer.ts';

export function Editor({ month, navigate, onImport }: { month: MonthNumber; navigate: (location: Location) => void; onImport: (files: FileList, target?: MonthNumber) => void }) {
  const { state, dispatch } = useProject();
  const picker = useRef<HTMLInputElement>(null);
  const [cropSheetOpen, setCropSheetOpen] = useState(false);
  const [monthSheetOpen, setMonthSheetOpen] = useState(false);
  const [backgroundSheetOpen, setBackgroundSheetOpen] = useState(false);
  const [typographySheetOpen, setTypographySheetOpen] = useState(false);
  const [singleExport, setSingleExport] = useState<{ phase: 'idle' | 'preparing' | 'ready' | 'sent' | 'error'; fileName?: string; message?: string }>({ phase: 'idle' });
  const exportUrl = useRef<string | null>(null);
  const exportGeneration = useRef(0);
  useEffect(() => () => { exportGeneration.current++; if (exportUrl.current) URL.revokeObjectURL(exportUrl.current); }, []);
  useEffect(() => { exportGeneration.current++; if (exportUrl.current) URL.revokeObjectURL(exportUrl.current); exportUrl.current = null; setSingleExport({ phase: 'idle' }); }, [month]);
  const slot = state?.project.months[month];
  const item = slot?.photoItemId ? state?.project.photoItems[slot.photoItemId] : null;
  const asset = item ? state?.assets[item.assetId] : null;
  const ready = state ? isMonthReady(state, month) : false;
  function changeCrop(crop: CropState) { dispatch({ type: 'set-crop', month, crop }); }
  async function prepareSinglePng() {
    if (!state || !ready || singleExport.phase === 'preparing') return;
    if (exportUrl.current) { URL.revokeObjectURL(exportUrl.current); exportUrl.current = null; }
    const generation = ++exportGeneration.current;
    setSingleExport({ phase: 'preparing' });
    try {
      const rendered = await renderMonthPng(structuredClone(state), month);
      if (generation !== exportGeneration.current) return;
      exportUrl.current = URL.createObjectURL(rendered.blob);
      setSingleExport({ phase: 'ready', fileName: rendered.fileName });
    } catch (error) { if (generation === exportGeneration.current) setSingleExport({ phase: 'error', message: error instanceof Error ? error.message : 'PNG 生成失败，请重试。' }); }
  }
  function handoffSinglePng() {
    if (!exportUrl.current || !singleExport.fileName) return;
    const link = document.createElement('a'); link.href = exportUrl.current; link.download = singleExport.fileName;
    document.body.append(link); link.click(); link.remove();
    setSingleExport({ phase: 'sent', fileName: singleExport.fileName });
  }
  function closeSinglePng() { exportGeneration.current++; if (exportUrl.current) URL.revokeObjectURL(exportUrl.current); exportUrl.current = null; setSingleExport({ phase: 'idle' }); }
  function cropControls(controlId: string) {
    if (!asset || !slot?.crop) return <p>为这个月添加一张照片。</p>;
    return <><p>拖动照片调整位置；在照片上双指缩放，或使用下方滑块。</p><label className="zoom-label" htmlFor={controlId}>缩放 <output>{slot.crop.zoom.toFixed(2)}×</output></label><input id={controlId} className="zoom-range" type="range" min="1" max="3" step="0.01" value={slot.crop.zoom} onChange={event => changeCrop(setCropZoom(slot.crop!, { width: asset.decodedWidth, height: asset.decodedHeight }, Number(event.target.value)))} /><div className="crop-action-row"><button className="button button--quiet" onClick={() => changeCrop(resetCrop())}>重置裁切</button><button className="button button--quiet" onClick={() => { setCropSheetOpen(false); picker.current?.click(); }}>替换照片</button></div></>;
  }
  return <main className="page editor-page">
    <div className="editor-head"><div><span className="eyebrow">02 / 03 · 2027</span><h1>编辑月份</h1></div><button className="button button--quiet" onClick={() => navigate({ screen: 'review' })}>预览与导出</button></div>
    <nav className="month-nav" aria-label="选择月份">{ALL_MONTHS.map(item => <button key={item} className={item === month ? 'is-current' : ''} aria-current={item === month ? 'page' : undefined} onClick={() => navigate({ screen: 'editor', month: item })}>{item} 月</button>)}</nav>
    <div className="phone-month-select"><button className="phone-month-select__current" onClick={() => setMonthSheetOpen(true)} aria-haspopup="dialog">{month} 月 · 2027 ▾</button><span>{ready ? '已就绪' : '缺少照片'}</span><button className="phone-month-select__review" onClick={() => navigate({ screen: 'review' })}>预览</button></div>
    <div className="editor-layout"><div className="proof-workspace"><CalendarProof month={month} state={state} onCropChange={ready ? changeCrop : undefined} /></div><aside className="properties-panel"><div className="properties-panel__head"><span className="eyebrow">月份预览</span><h2>{month} 月 <span>2027</span></h2><span className="status-pill">{ready ? '已就绪' : '缺少照片'}</span></div><section className="photo-controls-desktop"><h3>照片</h3>{ready ? cropControls('crop-zoom-desktop') : <><p>为这个月添加一张照片。</p><button className="button button--quiet" onClick={() => picker.current?.click()}>添加照片</button></>}<input ref={picker} className="visually-hidden" type="file" accept="image/*" onChange={event => { if (event.target.files) onImport(event.target.files, month); event.target.value = ''; }} /></section><button className="button button--quiet mobile-crop-trigger" onClick={() => setCropSheetOpen(true)}>{ready ? '照片与裁切' : '添加照片'}</button><section className="style-section-desktop"><h3>背景色</h3>{slot && <BackgroundControls color={slot.style.background} onChange={color => dispatch({ type: 'set-background', month, color })} />}</section><button className="button button--quiet mobile-style-trigger" onClick={() => setBackgroundSheetOpen(true)}>背景色</button><section className="style-section-desktop"><h3>日历文字</h3>{slot && state && <TypographyControls presetId={state.project.typography.presetId} scale={state.project.typography.scale} style={slot.style} onPreset={presetId => dispatch({ type: 'set-typography', presetId })} onScale={scale => dispatch({ type: 'set-typography', scale })} onInk={(mode, color) => dispatch({ type: 'set-ink', month, mode, color })} />}</section><button className="button button--quiet mobile-style-trigger" onClick={() => setTypographySheetOpen(true)}>日历文字：字体、大小、颜色</button><section><h3>导出</h3><p>1200 × 1800 px PNG</p><button className="button button--quiet" disabled={!ready || singleExport.phase === 'preparing'} onClick={() => void prepareSinglePng()}>生成本月 PNG</button>{singleExport.phase !== 'idle' && <div className="single-export-status" role="status">{singleExport.phase === 'preparing' && <p>正在准备 {month} 月 PNG…</p>}{singleExport.phase === 'ready' && <><p>{month} 月 PNG 已准备好。请点击下载交给浏览器处理。</p><button className="button button--primary" onClick={handoffSinglePng}>下载 PNG</button></>}{singleExport.phase === 'sent' && <p>已向浏览器发起下载。请在浏览器中确认文件去向。</p>}{singleExport.phase === 'error' && <><p>生成失败：{singleExport.message}</p><button className="button button--quiet" onClick={() => void prepareSinglePng()}>重试生成</button></>}{singleExport.phase !== 'preparing' && <button className="button button--quiet" onClick={closeSinglePng}>关闭</button>}</div>}</section></aside></div>
    <div className="month-dock"><button disabled={month === 1} onClick={() => navigate({ screen: 'editor', month: (month - 1) as MonthNumber })}>← 上个月</button><span>{month} / 12</span><button disabled={month === 12} onClick={() => navigate({ screen: 'editor', month: (month + 1) as MonthNumber })}>下个月 →</button></div>
    {monthSheetOpen && <div className="sheet-backdrop" onClick={() => setMonthSheetOpen(false)}><section className="action-sheet" role="dialog" aria-modal="true" aria-label="选择月份" onClick={event => event.stopPropagation()}><div className="sheet-heading"><h2>选择月份 · 2027</h2><button onClick={() => setMonthSheetOpen(false)} aria-label="关闭">×</button></div><div className="month-switch-grid">{ALL_MONTHS.map(item => <button key={item} className={item === month ? 'is-current' : ''} onClick={() => { setMonthSheetOpen(false); navigate({ screen: 'editor', month: item }); }}><strong>{item} 月</strong><small>{state && isMonthReady(state, item) ? '已就绪' : '缺少照片'}</small></button>)}</div></section></div>}
    {backgroundSheetOpen && <div className="sheet-backdrop" onClick={() => setBackgroundSheetOpen(false)}><section className="action-sheet" role="dialog" aria-modal="true" aria-label="背景色" onClick={event => event.stopPropagation()}><div className="sheet-heading"><h2>背景色</h2><button onClick={() => setBackgroundSheetOpen(false)} aria-label="关闭">×</button></div>{slot && <BackgroundControls color={slot.style.background} onChange={color => dispatch({ type: 'set-background', month, color })} />}<button className="button button--quiet sheet-cancel" onClick={() => setBackgroundSheetOpen(false)}>完成</button></section></div>}
    {typographySheetOpen && <div className="sheet-backdrop" onClick={() => setTypographySheetOpen(false)}><section className="action-sheet" role="dialog" aria-modal="true" aria-label="日历文字" onClick={event => event.stopPropagation()}><div className="sheet-heading"><h2>字体、大小与文字颜色</h2><button onClick={() => setTypographySheetOpen(false)} aria-label="关闭">×</button></div>{slot && state && <TypographyControls presetId={state.project.typography.presetId} scale={state.project.typography.scale} style={slot.style} onPreset={presetId => dispatch({ type: 'set-typography', presetId })} onScale={scale => dispatch({ type: 'set-typography', scale })} onInk={(mode, color) => dispatch({ type: 'set-ink', month, mode, color })} />}<button className="button button--quiet sheet-cancel" onClick={() => setTypographySheetOpen(false)}>完成</button></section></div>}
    {cropSheetOpen && <div className="sheet-backdrop" onClick={() => setCropSheetOpen(false)}><section className="action-sheet" role="dialog" aria-modal="true" aria-label="照片与裁切" onClick={event => event.stopPropagation()}><div className="sheet-heading"><h2>照片与裁切</h2><button onClick={() => setCropSheetOpen(false)} aria-label="关闭">×</button></div>{ready ? cropControls('crop-zoom-mobile') : <><p>为这个月添加一张照片。</p><button className="button button--primary" onClick={() => { setCropSheetOpen(false); picker.current?.click(); }}>添加照片</button></>}<button className="button button--quiet sheet-cancel" onClick={() => setCropSheetOpen(false)}>完成</button></section></div>}
  </main>;
}
