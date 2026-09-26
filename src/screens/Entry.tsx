import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { Location } from '../app/navigation.ts';
import { getCalendarMonth, WEEKDAY_INITIALS, type MonthNumber } from '../domain/calendar.ts';

gsap.registerPlugin(useGSAP);

export function Entry({ navigate, onStartEmpty, onImport, hasProject, resumeLocation, onStartNew }: { navigate: (location: Location) => void; onStartEmpty: () => void; onImport: (files: FileList) => void; hasProject: boolean; resumeLocation?: Location; onStartNew: () => void }) {
  const picker = useRef<HTMLInputElement>(null);
  const art = useRef<HTMLDivElement>(null);
  useGSAP((_, contextSafe) => {
    if (!art.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const duration = touch ? 0.70 : 0.74;
    const sheets = [
      { selector: '.entry-art__sheet--3', xPercent: -80, yPercent: -53, x: -28, y: 18, startRotation: -17, rotation: -10, at: 0 },
      { selector: '.entry-art__sheet--2', xPercent: -20, yPercent: -53, x: 26, y: 16, startRotation: 13, rotation: 7, at: touch ? 0.25 : 0.25 },
      { selector: '.entry-art__sheet--1', xPercent: -51, yPercent: -48, x: 0, y: 28, startRotation: -2, rotation: -3, at: touch ? 0.50 : 0.60 },
    ];
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    for (const sheet of sheets) {
      timeline.fromTo(sheet.selector,
        { xPercent: sheet.xPercent, yPercent: sheet.yPercent, x: sheet.x, y: sheet.y, rotation: sheet.startRotation, scale: 0.95, autoAlpha: 0 },
        { xPercent: sheet.xPercent, yPercent: sheet.yPercent, x: 0, y: 0, rotation: sheet.rotation, scale: 1, autoAlpha: 1, duration },
        sheet.at,
      );
    }
    if (touch || !contextSafe) return;
    const onEnter = contextSafe(() => {
      if (timeline.isActive()) return;
      gsap.to('.entry-art__sheet--3', { x: -4, rotation: -10.35, duration: 0.32, ease: 'power2.out', overwrite: 'auto' });
      gsap.to('.entry-art__sheet--2', { x: 4, rotation: 7.35, duration: 0.32, ease: 'power2.out', overwrite: 'auto' });
      gsap.to('.entry-art__sheet--1', { y: -2, duration: 0.32, ease: 'power2.out', overwrite: 'auto' });
    });
    const onLeave = contextSafe(() => {
      if (timeline.isActive()) return;
      gsap.to('.entry-art__sheet--3', { x: 0, rotation: -10, duration: 0.36, ease: 'power2.out', overwrite: 'auto' });
      gsap.to('.entry-art__sheet--2', { x: 0, rotation: 7, duration: 0.36, ease: 'power2.out', overwrite: 'auto' });
      gsap.to('.entry-art__sheet--1', { y: 0, duration: 0.36, ease: 'power2.out', overwrite: 'auto' });
    });
    art.current.addEventListener('pointerenter', onEnter);
    art.current.addEventListener('pointerleave', onLeave);
    const element = art.current;
    return () => { element.removeEventListener('pointerenter', onEnter); element.removeEventListener('pointerleave', onLeave); };
  }, { scope: art });
  return <main className="entry-page">
    <div className="entry-copy">
      <span className="eyebrow">Calendar Design Studio / 2027</span>
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
    <div ref={art} className="entry-art" aria-hidden="true">{([1, 5, 9] as MonthNumber[]).map((month, index) => { const page = getCalendarMonth(month); return <div key={month} className={`entry-art__sheet entry-art__sheet--${index + 1}`}><div className="entry-art__photo"><span className="entry-art__shape" /></div><div className="entry-art__calendar"><div className="entry-art__title"><strong>{page.name}</strong><span>2027</span></div><div className="entry-art__weekdays">{WEEKDAY_INITIALS.map((day, dayIndex) => <span key={dayIndex}>{day}</span>)}</div><div className="entry-art__dates">{page.cells.slice(0, 21).map((day, dayIndex) => <span key={dayIndex}>{day}</span>)}</div></div></div>; })}</div>
  </main>;
}
