import type { HexColor } from '../domain/project.ts';
import { TEXTURE_OPTIONS, textureCssImage, type TextureId } from '../domain/texture.ts';

export function TextureControls({ value, color, onChange }: { value: TextureId; color: HexColor; onChange: (texture: TextureId) => void }) {
  return <div className="texture-controls">
    <div className="texture-field-header"><span>纹理</span><button type="button" className="texture-clear" aria-pressed={value === 'none'} aria-label="清除纹理（无纹理）" onClick={() => onChange('none')}>清除</button></div>
    <div className="texture-options" aria-label="日历纹理">
      <button type="button" className={"texture-clear texture-clear--mobile" + (value === "none" ? " is-current" : "")} aria-pressed={value === "none"} aria-label="清除纹理（无纹理）" onClick={() => onChange("none")}>清除</button>
      {TEXTURE_OPTIONS.filter(option => option.id !== 'none').map(option => <button
        key={option.id}
        type="button"
        className={'texture-thumb' + (option.id === value ? ' is-current' : '')}
        data-tooltip={option.label}
        title={option.label}
        aria-pressed={option.id === value}
        aria-label={'使用纹理 ' + option.label}
        onClick={() => onChange(option.id)}
      >
        <span className="texture-options__sample" style={{ backgroundColor: color, backgroundImage: textureCssImage(option.id, color), backgroundSize: option.id === 'vellum' ? '64px 64px' : option.id === 'dots' ? '72px 64px' : option.id === 'paper' ? '32px 32px' : '24px 24px' }} />
        <span className="visually-hidden">{option.label}</span>
      </button>)}
    </div>
  </div>;
}
