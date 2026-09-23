import { ALL_MONTHS, MONTH_NAMES } from '../domain/calendar.ts';
import type { Location } from '../app/navigation.ts';

export function Assign({ navigate }: { navigate: (location: Location) => void }) {
  return <main className="page page--assignment">
    <header className="page-header"><div><span className="eyebrow">01 / 03</span><h1>分配照片</h1><p>0 / 12 个月已就绪</p></div><button className="button button--quiet" disabled title="照片导入将在 M3 接入">添加照片</button></header>
    <p className="instruction">更换月份照片会将裁切恢复为居中填满；该月的背景色会保留。</p>
    <div className="month-grid">
      {ALL_MONTHS.map(month => <button key={month} className="month-card" type="button" onClick={() => navigate({ screen: 'editor', month })}>
        <span className="month-card__top"><strong>{MONTH_NAMES[month - 1]}</strong><small>缺少照片</small></span>
        <span className="month-card__placeholder">＋</span><span className="month-card__bottom">打开 {month} 月 <span aria-hidden="true">↗</span></span>
      </button>)}
    </div>
    <div className="page-actions"><button className="button button--quiet" onClick={() => navigate({ screen: 'review' })}>预览与导出</button><button className="button button--primary" onClick={() => navigate({ screen: 'editor', month: 1 })}>继续编辑月份</button></div>
  </main>;
}
