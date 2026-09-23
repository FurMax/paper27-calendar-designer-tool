import { ALL_MONTHS, MONTH_NAMES, type MonthNumber } from '../domain/calendar.ts';
import type { Location } from '../app/navigation.ts';
import { CalendarProof } from '../components/CalendarProof.tsx';

export function Editor({ month, navigate }: { month: MonthNumber; navigate: (location: Location) => void }) {
  return <main className="page editor-page">
    <div className="editor-head"><div><span className="eyebrow">02 / 03 · 2027</span><h1>编辑月份</h1></div><button className="button button--quiet" onClick={() => navigate({ screen: 'review' })}>预览与导出</button></div>
    <nav className="month-nav" aria-label="选择月份">{ALL_MONTHS.map(item => <button key={item} className={item === month ? 'is-current' : ''} aria-current={item === month ? 'page' : undefined} onClick={() => navigate({ screen: 'editor', month: item })}>{item} 月</button>)}</nav>
    <div className="phone-month-select"><label htmlFor="month-select">当前月份</label><select id="month-select" value={month} onChange={event => navigate({ screen: 'editor', month: Number(event.target.value) as MonthNumber })}>{ALL_MONTHS.map(item => <option key={item} value={item}>{item} 月 · 2027</option>)}</select><span>缺少照片</span></div>
    <div className="editor-layout"><div className="proof-workspace"><CalendarProof month={month} /></div><aside className="properties-panel"><div className="properties-panel__head"><span className="eyebrow">MONTH PROOF</span><h2>{MONTH_NAMES[month - 1]} <span>2027</span></h2><span className="status-pill">缺少照片</span></div><section><h3>照片</h3><p>为这个月添加一张照片。</p><button className="button button--quiet" disabled title="照片导入将在 M3 接入">添加照片</button></section><section><h3>背景色</h3><p>默认白色。颜色编辑将在 M4 接入。</p></section><section><h3>日历文字</h3><p>字体、大小和文字颜色将在 M4 接入。</p></section><section><h3>导出</h3><p>1200 × 1800 px PNG</p><button className="button button--quiet" disabled>下载本月 PNG</button></section></aside></div>
    <div className="month-dock"><button disabled={month === 1} onClick={() => navigate({ screen: 'editor', month: (month - 1) as MonthNumber })}>← 上个月</button><span>{month} / 12</span><button disabled={month === 12} onClick={() => navigate({ screen: 'editor', month: (month + 1) as MonthNumber })}>下个月 →</button></div>
  </main>;
}
