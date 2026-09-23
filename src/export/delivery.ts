export function startBrowserDownload(url: string, fileName: string): void {
  const link = document.createElement('a'); link.href = url; link.download = fileName;
  document.body.append(link); link.click(); link.remove();
}
export function canShareFiles(files: File[]): boolean {
  return window.isSecureContext && typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files });
}
export async function shareFiles(files: File[]): Promise<void> {
  await navigator.share({ files, title: '2027 年日历 · 12 张 PNG' });
}
