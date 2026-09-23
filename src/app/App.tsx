import { newId } from '../domain/id.ts';
import { useEffect, useState } from 'react';
import { parseLocation, locationPath, type Location } from './navigation.ts';
import { Entry } from '../screens/Entry.tsx';
import { Assign } from '../screens/Assign.tsx';
import { Editor } from '../screens/Editor.tsx';
import { Review } from '../screens/Review.tsx';
import { ProjectProvider, useProject } from './ProjectContext.tsx';
import { decodePhotoSelection } from '../features/photos/import.ts';
import type { MonthNumber } from '../domain/calendar.ts';

export function App() {
  return <ProjectProvider><AppContent /></ProjectProvider>;
}

function AppContent() {
  const { state, dispatch, hydrated, restoreError, retryRestore, saveStatus, saveError, retrySave, replaceActive } = useProject();
  const [location, setLocation] = useState<Location>(() => parseLocation(window.location.pathname));
  const [assignOrigin, setAssignOrigin] = useState<Location | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirmNew, setConfirmNew] = useState(false);
  const [replacing, setReplacing] = useState(false);
  useEffect(() => {
    const onPopState = () => { setLocation(parseLocation(window.location.pathname)); setMenuOpen(false); };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  useEffect(() => { if (hydrated) { window.history.replaceState(null, '', '/'); setLocation({ screen: 'entry' }); } }, [hydrated]);
  function navigate(next: Location) {
    if (next.screen === 'assign' && location.screen !== 'assign' && location.screen !== 'entry') setAssignOrigin(location);
    const path = locationPath(next);
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
    setLocation(next);
    dispatch({ type: 'location', location: next });
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }
  function startEmpty() {
    dispatch({ type: 'start-empty', id: newId() });
    navigate({ screen: 'assign' });
  }
  async function importFiles(files: FileList, target?: MonthNumber) {
    if (files.length === 0) return;
    try {
      const result = await decodePhotoSelection(files);
      if (result.assets.length === 0) { const first = result.diagnostics?.[0]; setNotice(first ? `无法读取：${first.fileName}（${first.mime}，${Math.round(first.byteSize / 1024)} KB）。${first.reason}` : '无法读取所选照片，请换一张重试。'); return; }
      const itemIds = result.assets.map(() => newId());
      if (state) dispatch({ type: 'import', assets: result.assets, itemIds, target });
      else {
        dispatch({ type: 'start-import', id: newId(), assets: result.assets, itemIds });
        navigate({ screen: 'assign' });
      }
      setNotice(result.unreadable.length ? `无法读取：${result.unreadable.join('、')}。其他照片已加入。` : '照片已加入当前日历。');
    } catch (error) { setNotice(error instanceof Error ? error.message : '照片导入失败，请重试。'); }
  }
  async function confirmStartNew() {
    setReplacing(true);
    const replaced = await replaceActive();
    setReplacing(false);
    if (replaced) { setConfirmNew(false); navigate({ screen: 'entry' }); }
  }
  if (restoreError) return <main className="page recovery-page"><h1>无法读取已保存的日历</h1><p>{restoreError}</p><p>原项目不会被自动替换。请重试读取。</p><button className="button button--primary" onClick={retryRestore}>重试读取</button></main>;
  if (!hydrated) return <main className="page recovery-page"><p>正在读取当前浏览器中的日历…</p></main>;
  const resumeLocation: Location | undefined = !state ? undefined : state.project.lastLocation.screen === 'editor' ? { screen: 'editor', month: state.project.lastLocation.month ?? 1 } : state.project.lastLocation.screen === 'assign' ? { screen: 'assign' } : { screen: 'review' };
  const projectScreen = location.screen !== 'entry';
  return <div className="app-shell">
    <header className="site-header"><div className="site-header__inner"><button className="brand" onClick={() => navigate({ screen: 'entry' })}>2027 Calendar Designer <span>2027 年日历</span></button>{projectScreen && <><nav className="desktop-nav" aria-label="项目导航"><button className={location.screen === 'assign' ? 'active' : ''} onClick={() => navigate({ screen: 'assign' })}>分配照片</button><button className={location.screen === 'editor' ? 'active' : ''} onClick={() => navigate({ screen: 'editor', month: location.screen === 'editor' ? location.month : 1 })}>编辑月份</button><button className={location.screen === 'review' ? 'active' : ''} onClick={() => navigate({ screen: 'review' })}>预览与导出</button></nav><div className="mobile-menu"><button aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>菜单 · {location.screen === 'assign' ? '分配照片' : location.screen === 'editor' ? '编辑月份' : '预览与导出'}</button>{menuOpen && <nav id="mobile-nav" aria-label="项目导航"><button onClick={() => navigate({ screen: 'assign' })}>分配照片</button><button onClick={() => navigate({ screen: 'editor', month: location.screen === 'editor' ? location.month : 1 })}>编辑月份</button><button onClick={() => navigate({ screen: 'review' })}>预览与导出</button></nav>}</div></>}</div></header>
    {saveStatus === 'failed' && <div className="feedback feedback--error" role="alert"><strong>本地保存失败。</strong> {saveError} 当前修改仍在页面中；上次成功保存的版本没有被替换。<button className="button" onClick={retrySave}>重试保存</button></div>}
    {notice && <div className="feedback" role="status">{notice}<button onClick={() => setNotice('')} aria-label="关闭提示">×</button></div>}
    {location.screen === 'entry' && <Entry navigate={navigate} onStartEmpty={startEmpty} onImport={importFiles} hasProject={!!state} resumeLocation={resumeLocation} onStartNew={() => setConfirmNew(true)} />}
    {location.screen === 'assign' && <Assign navigate={navigate} onImport={importFiles} origin={assignOrigin} />}
    {location.screen === 'editor' && <Editor month={location.month} navigate={navigate} onImport={importFiles} />}
    {location.screen === 'review' && <Review navigate={navigate} />}
    {confirmNew && <div className="sheet-backdrop" onClick={() => !replacing && setConfirmNew(false)}><section className="action-sheet sheet-confirm" role="dialog" aria-modal="true" aria-label="新建日历确认" onClick={event => event.stopPropagation()}><div className="sheet-heading"><h2>新建日历？</h2><button disabled={replacing} onClick={() => setConfirmNew(false)} aria-label="关闭">×</button></div><p>当前日历和照片将从这个浏览器中移除。此操作无法撤销。</p><div className="confirm-actions"><button className="button button--quiet" disabled={replacing} onClick={() => setConfirmNew(false)}>保留当前日历</button><button className="button button--primary" disabled={replacing} onClick={() => void confirmStartNew()}>{replacing ? '正在新建…' : '新建日历'}</button></div></section></div>}
    {saveStatus === 'conflict' && <div className="sheet-backdrop"><section className="action-sheet sheet-confirm" role="alertdialog" aria-modal="true" aria-label="较新标签页冲突"><h2>日历已在其他标签页更新</h2><p>{saveError} 当前标签页已停止编辑和保存。</p><button className="button button--primary" onClick={() => window.location.reload()}>刷新并读取最新版本</button></section></div>}
  </div>;
}
