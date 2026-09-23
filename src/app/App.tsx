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
  const { state, dispatch } = useProject();
  const [location, setLocation] = useState<Location>(() => parseLocation(window.location.pathname));
  const [assignOrigin, setAssignOrigin] = useState<Location | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const onPopState = () => { setLocation(parseLocation(window.location.pathname)); setMenuOpen(false); };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
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
    dispatch({ type: 'start-empty', id: crypto.randomUUID() });
    navigate({ screen: 'assign' });
  }
  async function importFiles(files: FileList, target?: MonthNumber) {
    if (files.length === 0) return;
    try {
      const result = await decodePhotoSelection(files);
      if (result.assets.length === 0) { setNotice('无法读取所选照片，请换一张重试。'); return; }
      const itemIds = result.assets.map(() => crypto.randomUUID());
      if (state) dispatch({ type: 'import', assets: result.assets, itemIds, target });
      else {
        dispatch({ type: 'start-import', id: crypto.randomUUID(), assets: result.assets, itemIds });
        navigate({ screen: 'assign' });
      }
      setNotice(result.unreadable.length ? `无法读取：${result.unreadable.join('、')}。其他照片已加入。` : '照片已加入当前日历。');
    } catch (error) { setNotice(error instanceof Error ? error.message : '照片导入失败，请重试。'); }
  }
  const projectScreen = location.screen !== 'entry';
  return <div className="app-shell">
    <header className="site-header"><div className="site-header__inner"><button className="brand" onClick={() => navigate({ screen: 'entry' })}>Calendar Design Studio <span>2027 年日历</span></button>{projectScreen && <><nav className="desktop-nav" aria-label="项目导航"><button className={location.screen === 'assign' ? 'active' : ''} onClick={() => navigate({ screen: 'assign' })}>分配照片</button><button className={location.screen === 'editor' ? 'active' : ''} onClick={() => navigate({ screen: 'editor', month: location.screen === 'editor' ? location.month : 1 })}>编辑月份</button><button className={location.screen === 'review' ? 'active' : ''} onClick={() => navigate({ screen: 'review' })}>预览与导出</button></nav><div className="mobile-menu"><button aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>菜单 · {location.screen === 'assign' ? '分配照片' : location.screen === 'editor' ? '编辑月份' : '预览与导出'}</button>{menuOpen && <nav id="mobile-nav" aria-label="项目导航"><button onClick={() => navigate({ screen: 'assign' })}>分配照片</button><button onClick={() => navigate({ screen: 'editor', month: location.screen === 'editor' ? location.month : 1 })}>编辑月份</button><button onClick={() => navigate({ screen: 'review' })}>预览与导出</button></nav>}</div></>}</div></header>
    {notice && <div className="feedback" role="status">{notice}<button onClick={() => setNotice('')} aria-label="关闭提示">×</button></div>}
    {location.screen === 'entry' && <Entry navigate={navigate} onStartEmpty={startEmpty} onImport={importFiles} hasProject={!!state} />}
    {location.screen === 'assign' && <Assign navigate={navigate} onImport={importFiles} origin={assignOrigin} />}
    {location.screen === 'editor' && <Editor month={location.month} navigate={navigate} onImport={importFiles} />}
    {location.screen === 'review' && <Review navigate={navigate} />}
  </div>;
}
