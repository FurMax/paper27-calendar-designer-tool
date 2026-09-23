const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10] as const;

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export async function setPngDpi(blob: Blob, dpi: number): Promise<Blob> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes.length < 45 || !SIGNATURE.every((byte, index) => bytes[index] === byte)) throw new Error('PNG 文件头无效。');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(8) !== 13 || String.fromCharCode(...bytes.subarray(12, 16)) !== 'IHDR') throw new Error('PNG 结构无效。');
  const ppm = Math.round(dpi / 0.0254);
  const chunk = new Uint8Array(21);
  const chunkView = new DataView(chunk.buffer);
  chunkView.setUint32(0, 9);
  chunk.set([112, 72, 89, 115], 4); // pHYs
  chunkView.setUint32(8, ppm);
  chunkView.setUint32(12, ppm);
  chunk[16] = 1; // metres
  chunkView.setUint32(17, crc32(chunk.subarray(4, 17)));
  const parts: BlobPart[] = [bytes.subarray(0, 33), chunk];
  let offset = 33;
  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) throw new Error('PNG 数据不完整。');
    const length = view.getUint32(offset);
    const end = offset + 12 + length;
    if (end > bytes.length) throw new Error('PNG 数据不完整。');
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    if (type !== 'pHYs') parts.push(bytes.subarray(offset, end));
    offset = end;
  }
  return new Blob(parts, { type: 'image/png' });
}
