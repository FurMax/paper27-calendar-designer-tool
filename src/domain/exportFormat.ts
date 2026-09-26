export type ExportFormat = 'png' | 'jpg';

export const EXPORT_FORMATS: Record<ExportFormat, { label: string; detail: string; mime: string; extension: string }> = {
  png: { label: 'PNG', detail: '无损，保留精确像素', mime: 'image/png', extension: 'png' },
  jpg: { label: 'JPG', detail: '高画质压缩，适合接受 JPG 的印厂', mime: 'image/jpeg', extension: 'jpg' },
};
