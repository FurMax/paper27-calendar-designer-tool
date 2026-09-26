import { useEffect, useRef, useState } from 'react';
import { canonicalHex, COMMON_COLORS, customContrastWarning, hexToRgb, rgbToHex } from '../domain/color.ts';
import { expectedFontFamilies, SCALE_LABELS, TYPOGRAPHY_PRESETS } from '../domain/typography.ts';
import type { CalendarStyle, HexColor, TextScale, TypographyPresetId } from '../domain/project.ts';
import type { PhotoPalette } from '../domain/photoPalette.ts';

export function BackgroundControls({ color, onChange, onSample, photoPalette, paletteLoading, paletteError }: { color: HexColor; onChange: (color: HexColor) => void; onSample?: () => void; photoPalette?: PhotoPalette | null; paletteLoading?: boolean; paletteError?: boolean }) {
  const [hexDraft, setHexDraft] = useState<string>(color);
  const [rgbDraft, setRgbDraft] = useState<string[]>(hexToRgb(color).map(String));
  const [precisionOpen, setPrecisionOpen] = useState(false);
  const commonStrip = useRef<HTMLDivElement>(null);
  useEffect(() => { setHexDraft(color); setRgbDraft(hexToRgb(color).map(String)); }, [color]);
  useEffect(() => {
    const strip = commonStrip.current;
    const selected = strip?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
    if (!strip || !selected) return;
    const stripBox = strip.getBoundingClientRect();
    const selectedBox = selected.getBoundingClientRect();
    if (selectedBox.left < stripBox.left) strip.scrollLeft += selectedBox.left - stripBox.left - 3;
    else if (selectedBox.right > stripBox.right) strip.scrollLeft += selectedBox.right - stripBox.right + 3;
  }, [color]);
  function commitHex() { const value = canonicalHex(hexDraft); if (value) onChange(value); else setHexDraft(color); }
  function updateRgb(index: number, value: string) {
    const next = [...rgbDraft]; next[index] = value; setRgbDraft(next);
    if (next.every(part => /^\d{1,3}$/.test(part))) {
      const hex = rgbToHex(Number(next[0]), Number(next[1]), Number(next[2]));
      if (hex) onChange(hex);
    }
  }
  function togglePrecision() {
    if (!precisionOpen) { setHexDraft(color); setRgbDraft(hexToRgb(color).map(String)); }
    setPrecisionOpen(open => !open);
  }
  const paletteNote = paletteError || photoPalette?.fallback
    ? '照片分析失败，当前为固定备选色'
    : photoPalette?.suggestions.some(option => option.source === 'extension')
      ? '照片颜色较少，部分颜色由主色调整明暗得到'
      : '根据当前可见裁切提取';
  return <div className="style-controls background-controls background-controls--compact" aria-label="背景色色板">
    <div className="palette-row">
      <span className="palette-row__label" title={paletteNote}>推荐</span>
      <div className="palette-row__strip monthly-photo-colors" aria-live="polite">
        {photoPalette ? <div className="monthly-photo-colors__grid">{photoPalette.suggestions.map((option, index) =>
          <button key={index + '-' + option.color} type="button" className={option.color === color ? 'is-current' : ''} data-tooltip={option.label + ' · ' + option.color} title={option.label + ' · ' + option.color} aria-label={'使用本月' + option.label + ' ' + option.color} aria-pressed={option.color === color} onClick={() => onChange(option.color)}><span style={{ background: option.color }} /></button>
        )}</div> : <span className="palette-row__status" role="status">{paletteLoading ? '正在取色…' : '添加照片后推荐'}</span>}
        {onSample && <button type="button" className="palette-sample-trigger" data-tooltip="从照片精确取色" title="从照片精确取色" aria-label="从照片精确取色" onClick={onSample}>⌖</button>}
        {(paletteError || photoPalette?.fallback) && <span className="palette-row__fallback" title={paletteNote}>备选</span>}
      </div>
    </div>
    <div className="palette-row">
      <span className="palette-row__label">常用</span>
      <div ref={commonStrip} className="palette-row__strip quick-colors" aria-label="快捷颜色">{COMMON_COLORS.map(quick =>
        <button key={quick.color} type="button" className={quick.color === color ? 'is-current' : ''} data-tooltip={quick.label + ' · ' + quick.color} title={quick.label + ' · ' + quick.color} aria-label={'使用常用色 ' + quick.label + ' ' + quick.color} aria-pressed={quick.color === color} onClick={() => onChange(quick.color)}><span style={{ background: quick.color }} /></button>
      )}</div>
    </div>
    <div className="palette-row palette-row--precision">
      <button type="button" className="palette-custom-toggle" aria-expanded={precisionOpen} onClick={togglePrecision}>精确调色 <span aria-hidden="true">{precisionOpen ? '⌃' : '⌄'}</span></button>
    </div>
    {precisionOpen && <div className="palette-precision">
      <div className="color-main"><input aria-label="背景色系统调色器" type="color" value={color} onChange={event => onChange(event.target.value as HexColor)} /><label>HEX<input aria-label="背景色 HEX" value={hexDraft} onChange={event => setHexDraft(event.target.value)} onBlur={commitHex} onKeyDown={event => { if (event.key === 'Enter') { commitHex(); event.currentTarget.blur(); } }} /></label></div>
      <div className="rgb-inputs">{(['R', 'G', 'B'] as const).map((label, i) => <label key={label}>{label}<input aria-label={'背景色 ' + label} inputMode="numeric" value={rgbDraft[i]} onChange={event => updateRgb(i, event.target.value)} onBlur={() => setRgbDraft(hexToRgb(color).map(String))} /></label>)}</div>
    </div>}
  </div>;
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

export function TypographyControls({ presetId, scale, onPreset, onScale }: { presetId: TypographyPresetId; scale: TextScale; onPreset: (id: TypographyPresetId) => void; onScale: (scale: TextScale) => void }) {
  return <div className="style-controls"><div className="control-label">字体 · 应用于全部 12 个月</div><div className="font-options">{(Object.keys(TYPOGRAPHY_PRESETS) as TypographyPresetId[]).map(id => { const preset = TYPOGRAPHY_PRESETS[id]; return <button type="button" key={id} aria-pressed={presetId === id} className={presetId === id ? 'is-current' : ''} onClick={() => onPreset(id)}><span>{preset.label}</span><strong style={{ fontFamily: `"${preset.monthFamily}", Georgia, serif`, fontWeight: preset.monthWeight }}>January</strong></button>; })}</div><FontStatus presetId={presetId} /><div className="control-label">文字大小 · 应用于全部 12 个月</div><div className="scale-options">{(Object.keys(SCALE_LABELS) as TextScale[]).map(id => <button type="button" key={id} aria-pressed={scale === id} className={scale === id ? 'is-current' : ''} onClick={() => onScale(id)}><strong className={`scale-options__sample scale-options__sample--${id}`}>Aa</strong><span>{SCALE_LABELS[id]}</span><small>{id === 'small' ? '80%' : id === 'large' ? '120%' : '100%'}</small></button>)}</div></div>;
}

export function TextColorControls({ style, onInk }: { style: CalendarStyle; onInk: (mode: 'auto' | 'custom', color?: HexColor) => void }) {
  const [inkDraft, setInkDraft] = useState<string>(style.text.mode === 'custom' ? style.text.color : '#18201D');
  useEffect(() => { if (style.text.mode === 'custom') setInkDraft(style.text.color); }, [style.text]);
  const warning = style.text.mode === 'custom' && customContrastWarning(style.background, style.text.color);
  return <div className="style-controls text-color-controls"><div className="segmented"><button type="button" aria-pressed={style.text.mode === 'auto'} className={style.text.mode === 'auto' ? 'is-current' : ''} onClick={() => onInk('auto')}>自动</button><button type="button" aria-pressed={style.text.mode === 'custom'} className={style.text.mode === 'custom' ? 'is-current' : ''} onClick={() => onInk('custom', style.text.mode === 'custom' ? style.text.color : '#18201D')}>自定义</button></div>{style.text.mode === 'custom' && <div className="color-main"><input aria-label="文字颜色选择器" type="color" value={style.text.color} onChange={event => onInk('custom', event.target.value as HexColor)} /><label>HEX<input aria-label="文字颜色 HEX" value={inkDraft} onChange={event => setInkDraft(event.target.value)} onBlur={() => { const value = canonicalHex(inkDraft); if (value) onInk('custom', value); else setInkDraft(style.text.mode === 'custom' ? style.text.color : '#18201D'); }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} /></label></div>}{warning && <p className="contrast-warning" role="status">文字与背景对比度较低，可能影响阅读。仍可继续使用此颜色。</p>}</div>;
}
