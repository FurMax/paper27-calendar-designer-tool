import { useEffect, useState } from 'react';
import { canonicalHex, customContrastWarning, hexToRgb, QUICK_COLORS, rgbToHex } from '../domain/color.ts';
import { expectedFontFamilies, SCALE_LABELS, TYPOGRAPHY_PRESETS } from '../domain/typography.ts';
import type { CalendarStyle, HexColor, TextScale, TypographyPresetId } from '../domain/project.ts';

export function BackgroundControls({ color, onChange }: { color: HexColor; onChange: (color: HexColor) => void }) {
  const [hexDraft, setHexDraft] = useState<string>(color);
  const [rgbDraft, setRgbDraft] = useState<string[]>(hexToRgb(color).map(String));
  useEffect(() => { setHexDraft(color); setRgbDraft(hexToRgb(color).map(String)); }, [color]);
  function commitHex() { const value = canonicalHex(hexDraft); if (value) onChange(value); else setHexDraft(color); }
  function updateRgb(index: number, value: string) {
    const next = [...rgbDraft]; next[index] = value; setRgbDraft(next);
    if (next.every(part => /^\d{1,3}$/.test(part))) {
      const hex = rgbToHex(Number(next[0]), Number(next[1]), Number(next[2]));
      if (hex) onChange(hex);
    }
  }
  return <div className="style-controls"><div className="color-main"><input aria-label="背景色选择器" type="color" value={color} onChange={event => onChange(event.target.value as HexColor)} /><label>HEX<input aria-label="背景色 HEX" value={hexDraft} onChange={event => setHexDraft(event.target.value)} onBlur={commitHex} onKeyDown={event => { if (event.key === 'Enter') { commitHex(); event.currentTarget.blur(); } }} /></label></div><div className="rgb-inputs">{(['R', 'G', 'B'] as const).map((label, i) => <label key={label}>{label}<input aria-label={`背景色 ${label}`} inputMode="numeric" value={rgbDraft[i]} onChange={event => updateRgb(i, event.target.value)} onBlur={() => setRgbDraft(hexToRgb(color).map(String))} /></label>)}</div><div className="quick-colors" aria-label="快捷颜色">{QUICK_COLORS.map(quick => <button key={quick} type="button" className={quick === color ? 'is-current' : ''} title={quick} aria-label={`使用快捷颜色 ${quick}`} onClick={() => onChange(quick)} style={{ background: quick }} />)}</div><p className="color-precision-hint">需要精确颜色时，可输入 HEX 或 RGB。</p></div>;
}

function FontStatus({ presetId }: { presetId: TypographyPresetId }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'fallback'>('loading');
  useEffect(() => {
    let active = true;
    setStatus('loading');
    Promise.all(expectedFontFamilies(presetId).map(family => document.fonts.load(`16px "${family}"`)))
      .then(() => {
        if (!active) return;
        const families = expectedFontFamilies(presetId);
        const actual = [...document.fonts].filter(face => families.includes(face.family.replaceAll('"', '')));
        setStatus(families.every(family => actual.some(face => face.family.replaceAll('"', '') === family && face.status === 'loaded')) ? 'loaded' : 'fallback');
      }).catch(() => { if (active) setStatus('fallback'); });
    return () => { active = false; };
  }, [presetId]);
  return <p className={status === 'fallback' ? 'font-status font-status--warning' : 'font-status'} role="status">{status === 'loaded' ? '字体已加载' : status === 'fallback' ? '字体未加载，当前使用替代字体' : '正在加载字体…'}</p>;
}

export function TypographyControls({ presetId, scale, style, onPreset, onScale, onInk }: { presetId: TypographyPresetId; scale: TextScale; style: CalendarStyle; onPreset: (id: TypographyPresetId) => void; onScale: (scale: TextScale) => void; onInk: (mode: 'auto' | 'custom', color?: HexColor) => void }) {
  const [inkDraft, setInkDraft] = useState<string>(style.text.mode === 'custom' ? style.text.color : '#18201D');
  useEffect(() => { if (style.text.mode === 'custom') setInkDraft(style.text.color); }, [style.text]);
  const warning = style.text.mode === 'custom' && customContrastWarning(style.background, style.text.color);
  return <div className="style-controls"><div className="control-label">字体 · 应用于全部 12 个月</div><div className="font-options">{(Object.keys(TYPOGRAPHY_PRESETS) as TypographyPresetId[]).map(id => { const preset = TYPOGRAPHY_PRESETS[id]; return <button type="button" key={id} aria-pressed={presetId === id} className={presetId === id ? 'is-current' : ''} onClick={() => onPreset(id)}><span>{preset.label}</span><strong style={{ fontFamily: `"${preset.monthFamily}", Georgia, serif`, fontWeight: preset.monthWeight }}>January</strong></button>; })}</div><FontStatus presetId={presetId} /><div className="control-label">文字大小 · 应用于全部 12 个月</div><div className="segmented">{(Object.keys(SCALE_LABELS) as TextScale[]).map(id => <button type="button" key={id} aria-pressed={scale === id} className={scale === id ? 'is-current' : ''} onClick={() => onScale(id)}>{SCALE_LABELS[id]}</button>)}</div><div className="control-label">文字颜色 · 当前月份</div><p className="color-precision-hint">选择“自定义”后，可用色块或 HEX 精确调整。</p><div className="segmented"><button type="button" aria-pressed={style.text.mode === 'auto'} className={style.text.mode === 'auto' ? 'is-current' : ''} onClick={() => onInk('auto')}>自动</button><button type="button" aria-pressed={style.text.mode === 'custom'} className={style.text.mode === 'custom' ? 'is-current' : ''} onClick={() => onInk('custom', style.text.mode === 'custom' ? style.text.color : '#18201D')}>自定义</button></div>{style.text.mode === 'custom' && <div className="color-main"><input aria-label="文字颜色选择器" type="color" value={style.text.color} onChange={event => onInk('custom', event.target.value as HexColor)} /><label>HEX<input aria-label="文字颜色 HEX" value={inkDraft} onChange={event => setInkDraft(event.target.value)} onBlur={() => { const value = canonicalHex(inkDraft); if (value) onInk('custom', value); else setInkDraft(style.text.mode === 'custom' ? style.text.color : '#18201D'); }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} /></label></div>}{warning && <p className="contrast-warning" role="status">文字与背景对比度较低，可能影响阅读。仍可继续使用此颜色。</p>}</div>;
}
