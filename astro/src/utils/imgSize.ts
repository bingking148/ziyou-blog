import fs from 'node:fs';
import path from 'node:path';

/** 读本地位图宽高，给 UDL 图一个加载前的占位，避免先塌成小图标。 */
export function publicImageSize(src: string | undefined): { width?: number; height?: number } {
  if (!src || !src.startsWith('/') || src.includes('..')) return {};
  const file = path.join(process.cwd(), 'public', src.slice(1));
  let buf: Buffer;
  try { buf = fs.readFileSync(file); } catch { return {}; }
  const size = webp(buf) || png(buf) || jpeg(buf);
  return size ?? {};
}

function u24(buf: Buffer, o: number) {
  return buf[o] + (buf[o + 1] << 8) + (buf[o + 2] << 16);
}

function webp(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 30 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
  const kind = buf.toString('ascii', 12, 16);
  if (kind === 'VP8X' && buf.length >= 30) {
    return { width: u24(buf, 24) + 1, height: u24(buf, 27) + 1 };
  }
  if (kind === 'VP8 ' && buf.length >= 30) {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (kind === 'VP8L' && buf.length >= 25) {
    const b = buf.readUInt32LE(21);
    return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
  }
  return null;
}

function png(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpeg(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let o = 2;
  while (o + 8 < buf.length) {
    if (buf[o] !== 0xff) { o++; continue; }
    const mark = buf[o + 1];
    const len = buf.readUInt16BE(o + 2);
    if (mark >= 0xc0 && mark <= 0xc2) {
      return { height: buf.readUInt16BE(o + 5), width: buf.readUInt16BE(o + 7) };
    }
    o += 2 + len;
  }
  return null;
}
