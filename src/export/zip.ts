import { Zip, ZipPassThrough } from 'fflate';
import type { RenderedMonthPng } from './canvasRenderer.ts';

/** PNG bytes are already compressed; ZIP stores each independent PNG unchanged. */
export async function packagePngZip(files: RenderedMonthPng[]): Promise<Blob> {
  if (files.length !== 12 || files.some((file, i) => file.month !== i + 1 || !file.fileName.startsWith(`${String(i + 1).padStart(2, '0')}-`))) throw new Error('ZIP 需要按 1–12 月排序的 12 张 PNG。');
  return new Promise<Blob>((resolve, reject) => {
    const parts: BlobPart[] = [];
    const archive = new Zip((error, chunk, final) => {
      if (error) { reject(error); return; }
      parts.push(chunk as BlobPart);
      if (final) resolve(new Blob(parts, { type: 'application/zip' }));
    });
    void (async () => {
      let bytes = 0;
      for (const file of files) {
        bytes += file.blob.size;
        if (bytes > 0xffffffff) throw new Error('ZIP 超过 4 GiB 容量。');
        const entry = new ZipPassThrough(file.fileName);
        archive.add(entry);
        entry.push(new Uint8Array(await file.blob.arrayBuffer()), true);
      }
      archive.end();
    })().catch(reject);
  });
}
