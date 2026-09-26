const JFIF = [74, 70, 73, 70, 0] as const;
const SOF = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

interface Headers { jfifUnitsOffset: number | null; width: number | null; height: number | null }

function parseHeaders(bytes: Uint8Array): Headers {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) throw new Error('JPG 文件头或结尾无效。');
  let offset = 2;
  let jfifUnitsOffset: number | null = null;
  let width: number | null = null, height: number | null = null;
  while (offset < bytes.length - 2) {
    if (bytes[offset] !== 0xff) throw new Error('JPG 标记结构无效。');
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > bytes.length) throw new Error('JPG 数据不完整。');
    const length = (bytes[offset] << 8) | bytes[offset + 1];
    if (length < 2 || offset + length > bytes.length) throw new Error('JPG 数据不完整。');
    const payload = offset + 2;
    if (marker === 0xe0 && length >= 16 && JFIF.every((byte, i) => bytes[payload + i] === byte)) jfifUnitsOffset = payload + 7;
    if (SOF.has(marker)) {
      if (length < 7) throw new Error('JPG 尺寸信息无效。');
      height = (bytes[payload + 1] << 8) | bytes[payload + 2];
      width = (bytes[payload + 3] << 8) | bytes[payload + 4];
    }
    offset += length;
  }
  return { jfifUnitsOffset, width, height };
}

export async function validateJpeg(blob: Blob, width: number, height: number): Promise<void> {
  if (blob.type !== 'image/jpeg') throw new Error('浏览器未生成 JPG 格式。');
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const headers = parseHeaders(bytes);
  if (headers.width !== width || headers.height !== height) throw new Error('JPG 尺寸不正确。');
}

export async function setJpegDpi(blob: Blob, dpi: number): Promise<Blob> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const headers = parseHeaders(bytes);
  if (!headers.width || !headers.height || !Number.isInteger(dpi) || dpi < 1 || dpi > 65535) throw new Error('JPG 分辨率信息无效。');
  const densityHi = dpi >>> 8, densityLo = dpi & 255;
  if (headers.jfifUnitsOffset !== null) {
    const result = bytes.slice();
    const offset = headers.jfifUnitsOffset;
    result[offset] = 1;
    result[offset + 1] = densityHi; result[offset + 2] = densityLo;
    result[offset + 3] = densityHi; result[offset + 4] = densityLo;
    return new Blob([result], { type: 'image/jpeg' });
  }
  const app0 = new Uint8Array([0xff, 0xe0, 0x00, 0x10, 74, 70, 73, 70, 0, 1, 1, 1, densityHi, densityLo, densityHi, densityLo, 0, 0]);
  return new Blob([bytes.subarray(0, 2), app0, bytes.subarray(2)], { type: 'image/jpeg' });
}
