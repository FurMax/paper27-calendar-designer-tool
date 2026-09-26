import { ALL_MONTHS, type MonthNumber } from '../domain/calendar.ts';
import { isMonthReady, type ProjectState } from '../domain/project.ts';
import { renderMonthPng, type RenderedMonthFile } from './canvasRenderer.ts';
import type { ExportFormat } from '../domain/exportFormat.ts';

export class ExportCancelledError extends Error { constructor() { super('已取消生成。'); this.name = 'ExportCancelledError'; } }
export interface ExportProgress { phase: 'rendering' | 'packaging'; completed: number; current?: MonthNumber }
export function missingExportMonths(state: ProjectState): MonthNumber[] { return ALL_MONTHS.filter(month => !isMonthReady(state, month)); }
export async function renderFullSet(state: ProjectState, onProgress: (progress: ExportProgress) => void, signal?: AbortSignal, render = renderMonthPng, format: ExportFormat = 'png'): Promise<RenderedMonthFile[]> {
  const missing = missingExportMonths(state);
  if (missing.length) throw new Error(`以下月份缺少可读取的照片：${missing.join('、')} 月。`);
  // Blob is immutable; cloning also freezes the project fields against edits during this attempt.
  const snapshot = structuredClone(state);
  const files: RenderedMonthFile[] = [];
  for (const month of ALL_MONTHS) {
    if (signal?.aborted) throw new ExportCancelledError();
    onProgress({ phase: 'rendering', completed: files.length, current: month });
    try { files.push(await render(snapshot, month)); }
    catch (error) { throw new Error(month + ' 月 ' + format.toUpperCase() + ' 生成失败：' + (error instanceof Error ? error.message : String(error))); }
    onProgress({ phase: 'rendering', completed: files.length, current: month });
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  }
  if (signal?.aborted) throw new ExportCancelledError();
  onProgress({ phase: 'packaging', completed: files.length });
  return files;
}
