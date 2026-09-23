import { useRef } from 'react';
import type { Location } from '../app/navigation.ts';

export function Entry({ navigate, onStartEmpty, onImport, hasProject, resumeLocation, onStartNew }: { navigate: (location: Location) => void; onStartEmpty: () => void; onImport: (files: FileList) => void; hasProject: boolean; resumeLocation?: Location; onStartNew: () => void }) {
  const picker = useRef<HTMLInputElement>(null);
  return <main className="entry-page">
    <div className="entry-copy">
      <span className="eyebrow">2027 Calendar Designer / 2027</span>
      <h1>2027 年日历</h1>
      <p className="lead">把喜欢的照片，放进 2027 的每个月。</p>
      <p className="muted">一次可选最多 12 张照片。接下来可以调整月份，也可以逐月添加。</p>
      <div className="action-row">
        {hasProject ? <button className="button button--primary" type="button" onClick={() => navigate(resumeLocation ?? { screen: 'review' })}>继续编辑日历</button> : <button className="button button--primary" type="button" onClick={() => picker.current?.click()}>选择照片</button>}
        {hasProject ? <button className="button button--quiet" type="button" onClick={onStartNew}>新建日历</button> : <button className="button button--quiet" type="button" onClick={onStartEmpty}>逐月添加照片</button>}
      </div>
      <input ref={picker} className="visually-hidden" type="file" accept="image/*" multiple onChange={event => { if (event.target.files) onImport(event.target.files); event.target.value = ''; }} />
      <p className="local-note">项目只保存在当前设备的浏览器中，不会同步到云端。</p>
    </div>
    <div className="entry-art" aria-hidden="true"><div className="entry-art__paper"><span>JANUARY</span><b>2027</b><div className="entry-art__block" /></div></div>
  </main>;
}
