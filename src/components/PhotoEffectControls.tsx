import { CropSurface } from '../features/crop/CropSurface.tsx';
import { DEFAULT_PHOTO_EFFECT, DUOTONE_PRESETS, PHOTO_EFFECTS, type PhotoEffect } from '../domain/photoEffect.ts';
import type { CropState } from '../domain/project.ts';

interface Props {
  blob?: Blob;
  width?: number;
  height?: number;
  crop?: CropState | null;
  value?: PhotoEffect;
  onChange: (value: PhotoEffect) => void;
}
export function PhotoEffectControls({ blob, width, height, crop, value = DEFAULT_PHOTO_EFFECT, onChange }: Props) {
  return <div className="photo-effect-controls">
    <h3>照片效果</h3>
    <div className="photo-effect-controls__options" role="group" aria-label="当前月份照片效果">
      {PHOTO_EFFECTS.map(option => {
        const next: PhotoEffect = { id: option.id, duotone: value.duotone, swapped: value.swapped };
        return <button key={option.id} type="button" className="photo-effect-controls__option"
          aria-pressed={value.id === option.id} onClick={() => onChange(next)}>
          <span className="photo-effect-controls__thumbnail" aria-hidden="true">
            {blob && width && height && crop
              ? <CropSurface blob={blob} width={width} height={height} crop={crop} variant="print" effect={next} effectPreviewWidth={96} />
              : <span className="photo-effect-controls__empty" />}
          </span>
          <span>{option.label}</span>
        </button>;
      })}
    </div>
    {value.id === 'duotone' && <div className="photo-effect-controls__presets" role="group" aria-label="双色映射色组">
      {DUOTONE_PRESETS.map(preset => <button key={preset.id} type="button" aria-pressed={value.duotone === preset.id}
        onClick={() => onChange({ id: 'duotone', duotone: preset.id, swapped: value.swapped })}>
        <span className="photo-effect-controls__pair" style={{ background: `linear-gradient(90deg,rgb(${(value.swapped ? preset.light : preset.dark).join(',')}) 50%,rgb(${(value.swapped ? preset.dark : preset.light).join(',')}) 50%)` }} aria-hidden="true" />
        {value.swapped ? preset.label.split(' × ').reverse().join(' × ') : preset.label}
      </button>)}
      <button type="button" className="photo-effect-controls__swap" aria-pressed={!!value.swapped} aria-label="交换双色映射的暗部与亮部颜色" onClick={() => onChange({ ...value, swapped: !value.swapped })}>⇄ 交换</button>
    </div>}
  </div>;
}
