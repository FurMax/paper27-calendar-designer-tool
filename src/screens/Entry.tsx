import type { Location } from '../app/navigation.ts';

export function Entry({ navigate }: { navigate: (location: Location) => void }) {
  return <main className="entry-page">
    <div className="entry-copy">
      <span className="eyebrow">Calendar Design Studio / 2027</span>
      <h1>2027 年日历</h1>
      <p className="lead">把喜欢的照片，放进 2027 的每个月。</p>
      <p className="muted">一次可选最多 12 张照片。接下来可以调整月份，也可以逐月添加。</p>
      <div className="action-row">
        <button className="button button--primary" type="button" disabled title="照片选择将在 M3 接入">选择照片</button>
        <button className="button button--quiet" type="button" onClick={() => navigate({ screen: 'assign' })}>逐月添加照片</button>
      </div>
      <p className="local-note">项目只保存在当前设备的浏览器中，不会同步到云端。</p>
    </div>
    <div className="entry-art" aria-hidden="true"><div className="entry-art__paper"><span>JANUARY</span><b>2027</b><div className="entry-art__block" /></div></div>
  </main>;
}
