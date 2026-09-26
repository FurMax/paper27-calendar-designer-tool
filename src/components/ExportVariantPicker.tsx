import { EXPORT_VARIANTS, type ExportVariant } from '../domain/exportVariant.ts';

export function ExportVariantPicker({ value, onChange, disabled = false, name }: {
  value: ExportVariant; onChange: (variant: ExportVariant) => void; disabled?: boolean; name: string;
}) {
  return <fieldset className="export-variants" disabled={disabled}>
    <legend>导出用途</legend>
    {(['print', 'digital'] as const).map(variant => <label key={variant} className={value === variant ? 'is-current' : ''}>
      <input type="radio" name={name} value={variant} checked={value === variant} onChange={() => onChange(variant)} />
      <span><strong>{EXPORT_VARIANTS[variant].label}</strong><small>{EXPORT_VARIANTS[variant].detail}</small></span>
    </label>)}
    {value === 'print' && <p>印刷版预览显示实际 100 × 150 mm 裁切；照片可能为覆盖出血而略微放大。导出文件四边另含约 3 mm 出血；交付前请核对印厂规格。</p>}
  </fieldset>;
}
