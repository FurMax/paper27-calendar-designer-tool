import { useEffect, useState } from 'react';
import { parseLocation, locationPath, type Location } from './navigation.ts';
import { Entry } from '../screens/Entry.tsx';
import { Assign } from '../screens/Assign.tsx';
import { Editor } from '../screens/Editor.tsx';
import { Review } from '../screens/Review.tsx';

export function App() {
  const [location, setLocation] = useState<Location>(() => parseLocation(window.location.pathname));
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onPopState = () => { setLocation(parseLocation(window.location.pathname)); setMenuOpen(false); };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  function navigate(next: Location) {
    const path = locationPath(next);
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
    setLocation(next);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }
  const projectScreen = location.screen !== 'entry';
  return <div className="app-shell">
    <header className="site-header"><div className="site-header__inner"><button className="brand" onClick={() => navigate({ screen: 'entry' })}>Calendar Design Studio <span>2027 年日历</span></button>{projectScreen && <><nav className="desktop-nav" aria-label="项目导航"><button className={location.screen === 'assign' ? 'active' : ''} onClick={() => navigate({ screen: 'assign' })}>分配照片</button><button className={location.screen === 'editor' ? 'active' : ''} onClick={() => navigate({ screen: 'editor', month: location.screen === 'editor' ? location.month : 1 })}>编辑月份</button><button className={location.screen === 'review' ? 'active' : ''} onClick={() => navigate({ screen: 'review' })}>预览与导出</button></nav><div className="mobile-menu"><button aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>菜单 · {location.screen === 'assign' ? '分配照片' : location.screen === 'editor' ? '编辑月份' : '预览与导出'}</button>{menuOpen && <nav id="mobile-nav" aria-label="项目导航"><button onClick={() => navigate({ screen: 'assign' })}>分配照片</button><button onClick={() => navigate({ screen: 'editor', month: location.screen === 'editor' ? location.month : 1 })}>编辑月份</button><button onClick={() => navigate({ screen: 'review' })}>预览与导出</button></nav>}</div></>}</div></header>
    {location.screen === 'entry' && <Entry navigate={navigate} />}
    {location.screen === 'assign' && <Assign navigate={navigate} />}
    {location.screen === 'editor' && <Editor month={location.month} navigate={navigate} />}
    {location.screen === 'review' && <Review navigate={navigate} />}
  </div>;
}
