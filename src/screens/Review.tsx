import { ALL_MONTHS, MONTH_NAMES } from '../domain/calendar.ts';
import type { Location } from '../app/navigation.ts';
import { useProject } from '../app/ProjectContext.tsx';
import { isMonthReady, readyCount } from '../domain/project.ts';
import { CalendarProof } from '../components/CalendarProof.tsx';

export function Review({ navigate }: { navigate: (location: Location) => void }) {
  const { state } = useProject();
  const count = state ? readyCount(state) : 0;
  return <main className="page review-page"><header className="page-header"><div><span className="eyebrow">03 / 03</span><h1>预览与导出</h1><p>{count} / 12 个月已就绪</p></div><button className="button button--quiet" onClick={() => navigate({ screen: 'assign' })}>分配照片</button></header><p className="instruction">为每个月添加照片后，可生成 12 张独立的月历 PNG。</p><div className="review-grid">{ALL_MONTHS.map(month => { return <button className="review-card" key={month} onClick={() => navigate({ screen: 'editor', month })}><CalendarProof month={month} compact state={state} /><span className="review-card__caption"><strong>{MONTH_NAMES[month - 1]}</strong><small>{state && isMonthReady(state, month) ? '已就绪' : '缺少照片'}</small></span></button>; })}</div><div className="page-actions"><button className="button button--primary" disabled>生成 12 个月 PNG</button></div></main>;
}
