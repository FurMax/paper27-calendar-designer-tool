import { newId } from '../domain/id.ts';
import { useRef, useState } from 'react';
import { ALL_MONTHS, type MonthNumber } from '../domain/calendar.ts';
import { isMonthReady, readyCount, unassignedItems } from '../domain/project.ts';
import type { AssignmentCommand } from '../domain/assignment.ts';
import type { Location } from '../app/navigation.ts';
import { useProject } from '../app/ProjectContext.tsx';
import { PhotoImage } from '../components/PhotoImage.tsx';

type Selection = { kind: 'month'; month: MonthNumber } | { kind: 'unassigned'; itemId: string };
type Mode = 'actions' | 'destination-move' | 'destination-swap' | 'destination-reuse' | 'destination-assign' | 'choose-item' | 'confirm-replace' | 'confirm-swap' | 'confirm-delete';

export function Assign({ navigate, onImport, origin }: { navigate: (location: Location) => void; onImport: (files: FileList, target?: MonthNumber) => void; origin: Location | null }) {
  const { state, dispatch } = useProject();
  const picker = useRef<HTMLInputElement>(null);
  const [pickerTarget, setPickerTarget] = useState<MonthNumber>();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [mode, setMode] = useState<Mode>('actions');
  const [target, setTarget] = useState<MonthNumber>();
  const [summary, setSummary] = useState('');
  if (!state) return <main className="page"><h1>还没有日历项目</h1><button className="button" onClick={() => navigate({ screen: 'entry' })}>返回开始</button></main>;
  const unassigned = unassignedItems(state.project);
  const count = readyCount(state);
  const itemForMonth = (month: MonthNumber) => {
    const itemId = state.project.months[month].photoItemId;
    return itemId ? state.project.photoItems[itemId] : null;
  };
  const blobForItem = (itemId: string) => state.assets[state.project.photoItems[itemId].assetId].blob;
  function openPicker(month?: MonthNumber) { setPickerTarget(month); setSelection(null); if (picker.current) { picker.current.multiple = !month; picker.current.click(); } }
  function select(next: Selection) { setSelection(next); setMode('actions'); setTarget(undefined); }
  function close() { setSelection(null); setMode('actions'); setTarget(undefined); }
  function commit(command: AssignmentCommand, names: MonthNumber[]) {
    dispatch({ type: 'command', command });
    setSummary(`已更新 ${names.map(month => `${month} 月`).join('、')}；新照片的裁切已居中，月份颜色保留。`);
    close();
  }
  function chooseDestination(month: MonthNumber) {
    if (!selection || !state) return;
    setTarget(month);
    if (mode === 'destination-move' && selection.kind === 'month') commit({ type: 'move', source: selection.month, target: month }, [selection.month, month]);
    else if (mode === 'destination-swap') setMode('confirm-swap');
    else if (mode === 'destination-assign' && selection.kind === 'unassigned') {
      if (state.project.months[month].photoItemId) setMode('confirm-replace');
      else commit({ type: 'add', target: month, itemId: selection.itemId }, [month]);
    } else if (mode === 'destination-reuse' && selection.kind === 'month') {
      if (state.project.months[month].photoItemId) setMode('confirm-replace');
      else commit({ type: 'reuse', source: selection.month, target: month, newItemId: newId(), createdAt: new Date().toISOString(), replace: false }, [month]);
    }
  }
  const selectedMonth = selection?.kind === 'month' ? selection.month : undefined;
  const occupied = selectedMonth ? !!itemForMonth(selectedMonth) : false;
  const title = selection?.kind === 'unassigned' ? '未分配照片' : selectedMonth ? `${selectedMonth} 月 · ${occupied ? '已就绪' : '缺少照片'}` : '';
  const actionLabel = mode === 'destination-move' ? '移动到空月份' : mode === 'destination-swap' ? '与另一月份交换' : mode === 'destination-reuse' ? '在另一月份使用' : mode === 'destination-assign' ? '分配到月份' : '';
  function allowedDestination(month: MonthNumber) {
    if (month === selectedMonth) return false;
    if (mode === 'destination-move') return !itemForMonth(month);
    if (mode === 'destination-swap') return !!itemForMonth(month);
    return true;
  }
  return <main className="page page--assignment">
    <header className="page-header"><div><span className="eyebrow">01 / 03</span><h1>分配照片</h1><p>{count} / 12 个月已就绪</p></div>{count < 12 && <button className="button button--quiet" onClick={() => openPicker()}>添加照片</button>}</header>
    <p className="instruction">更换月份照片会将裁切恢复为居中填满；该月的背景色会保留。</p>
    {summary && <p className="assignment-summary" role="status">{summary}</p>}
    <input ref={picker} className="visually-hidden" type="file" accept="image/*" multiple={!pickerTarget} onChange={event => { if (event.target.files) onImport(event.target.files, pickerTarget); event.target.value = ''; }} />
    <div className="month-grid">{ALL_MONTHS.map(month => {
      const item = itemForMonth(month);
      return <button key={month} className="month-card" type="button" onClick={() => select({ kind: 'month', month })}>
        <span className="month-card__top"><strong>{month} 月</strong><small>{item ? '已就绪' : '缺少照片'}</small></span>
        <span className="month-card__placeholder">{item ? <PhotoImage blob={blobForItem(item.id)} /> : '＋'}</span>
        <span className="month-card__bottom">{item ? '照片操作' : '添加照片'} <span aria-hidden="true">↗</span></span>
      </button>;
    })}</div>
    {unassigned.length > 0 && <section className="unassigned-section"><h2>未分配照片 · {unassigned.length}</h2><p>只属于当前日历项目</p><div className="unassigned-grid">{unassigned.map(item => <button key={item.id} className="unassigned-card" onClick={() => select({ kind: 'unassigned', itemId: item.id })}><PhotoImage blob={blobForItem(item.id)} /><span>分配或移除照片</span></button>)}</div></section>}
    <div className="page-actions"><button className="button button--quiet" onClick={() => navigate({ screen: 'review' })}>预览与导出</button><button className="button button--primary" onClick={() => navigate(origin && origin.screen !== 'entry' ? origin : { screen: 'editor', month: (ALL_MONTHS.find(month => isMonthReady(state, month)) || 1) })}>{origin ? '完成' : '继续编辑月份'}</button></div>
    {selection && <div className="sheet-backdrop" onClick={close}><section className="action-sheet" role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}><div className="sheet-heading"><h2>{mode === 'actions' ? title : mode.startsWith('destination') ? actionLabel : mode === 'choose-item' ? '选择未分配照片' : mode === 'confirm-delete' ? '从项目中移除照片？' : mode === 'confirm-swap' ? '交换两个月份的照片？' : '替换现有照片？'}</h2><button onClick={close} aria-label="关闭">×</button></div>
      {mode === 'actions' && selectedMonth && !occupied && <div className="sheet-options"><button onClick={() => openPicker(selectedMonth)}>选择新照片</button>{unassigned.length > 0 && <button onClick={() => setMode('choose-item')}>使用未分配照片</button>}</div>}
      {mode === 'actions' && selectedMonth && occupied && <div className="sheet-options"><button onClick={() => { close(); navigate({ screen: 'editor', month: selectedMonth }); }}>编辑这个月</button><button onClick={() => openPicker(selectedMonth)}>选择新照片替换</button>{count < 12 && <button onClick={() => setMode('destination-move')}>移动到空月份</button>}{count > 1 && <button onClick={() => setMode('destination-swap')}>与另一月份交换</button>}<button onClick={() => commit({ type: 'remove', source: selectedMonth }, [selectedMonth])}>从这个月移除</button><button onClick={() => setMode('destination-reuse')}>在另一月份使用同一照片</button></div>}
      {mode === 'actions' && selection.kind === 'unassigned' && <div className="sheet-options"><button onClick={() => setMode('destination-assign')}>分配到月份</button><button className="danger" onClick={() => setMode('confirm-delete')}>从项目中删除照片…</button></div>}
      {mode === 'choose-item' && selectedMonth && <div className="sheet-options">{unassigned.map(item => <button key={item.id} onClick={() => commit({ type: 'add', target: selectedMonth, itemId: item.id }, [selectedMonth])}>{state.assets[item.assetId].fileName}</button>)}</div>}
      {mode.startsWith('destination') && <div className="destination-list">{ALL_MONTHS.map(month => <button key={month} disabled={!allowedDestination(month)} onClick={() => chooseDestination(month)}><span>{month} 月</span><small>{itemForMonth(month) ? '已就绪' : '缺少照片'}</small></button>)}</div>}
      {mode === 'confirm-swap' && selectedMonth && target && <div className="sheet-confirm"><p>交换 {selectedMonth} 月与 {target} 月的照片。两个月的裁切将恢复居中，背景色保留。</p><button className="button button--primary" onClick={() => commit({ type: 'swap', source: selectedMonth, target }, [selectedMonth, target])}>交换照片</button></div>}
      {mode === 'confirm-replace' && target && <div className="sheet-confirm"><p>{target} 月原有照片会进入未分配照片；新照片裁切恢复居中，背景色保留。</p><button className="button button--primary" onClick={() => { if (selection.kind === 'unassigned') commit({ type: 'replace', target, itemId: selection.itemId }, [target]); else commit({ type: 'reuse', source: selection.month, target, newItemId: newId(), createdAt: new Date().toISOString(), replace: true }, [target]); }}>替换照片</button></div>}
      {mode === 'confirm-delete' && selection.kind === 'unassigned' && <div className="sheet-confirm"><p>这张照片会从当前日历项目中移除。设备上的原始照片不会被删除。</p><button className="button danger" onClick={() => commit({ type: 'delete-unassigned', itemId: selection.itemId }, [])}>从项目中删除</button></div>}
      <button className="button button--quiet sheet-cancel" onClick={close}>取消</button>
    </section></div>}
  </main>;
}
