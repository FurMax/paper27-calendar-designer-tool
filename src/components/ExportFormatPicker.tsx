import { EXPORT_FORMATS, type ExportFormat } from '../domain/exportFormat.ts';

export function ExportFormatPicker({ value, onChange, disabled = false, name }: {
  value: ExportFormat; onChange: (format: ExportFormat) => void; disabled?: boolean; name: string;
}) {
  return <fieldset className="export-variants" disabled={disabled}>
    <legend>文件格式</legend>
    {(['png', 'jpg'] as const).map(format => <label key={format} className={value === format ? 'is-current' : ''}>
      <input type="radio" name={name} value={format} checked={value === format} onChange={() => onChange(format)} />
      <span><strong>{EXPORT_FORMATS[format].label}</strong><small>{EXPORT_FORMATS[format].detail}</small></span>
    </label>)}
    {value === 'jpg' && <p>JPG 为高画质 RGB 文件；印刷版附 300 PPI 信息。若印厂要求 CMYK，请先核对其交付规格。</p>}
  </fieldset>;
}
