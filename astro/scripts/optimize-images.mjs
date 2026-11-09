import sharp from 'sharp';
import { readdir, readFile, writeFile, mkdir, unlink, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceDir = path.join(root, 'public/images');
const outputDir = path.join(sourceDir, 'optimized');
const widths = [480, 768, 1280, 1600, 1920];
const maxWidth = 1920;
const manifest = {};
await mkdir(outputDir, { recursive: true });
await mkdir(path.join(root, 'src/generated'), { recursive: true });
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'optimized') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (/\.(?:jpe?g|png)$/i.test(entry.name)) files.push(full);
  }
  return files;
}
for (const file of await walk(sourceDir)) {
  const src = '/' + path.relative(path.join(root, 'public'), file).replaceAll(path.sep, '/');
  const input = await readFile(file);
  const image = sharp(input, { limitInputPixels: 40_000_000 });
  const meta = await image.metadata();
  const basename = path.basename(file).replace(/\.(?:jpe?g|png)$/i, '');
  const hash = createHash('sha256').update(input).digest('hex').slice(0, 10);
  const prefix = `/images/optimized/${basename}-${hash}-q80`;
  const variants = [];
  async function saveVariant(url, width) {
    const dest = path.join(root, 'public', url.slice(1));
    let valid = false;
    try {
      const existing = await sharp(await readFile(dest)).metadata();
      valid = existing.width === width && existing.format === 'webp';
    } catch { /* 首次生成或损坏文件 */ }
    if (!valid) {
      await image.clone().resize({ width, withoutEnlargement: true }).webp({
        quality: 80,
        effort: 6,
        smartSubsample: true,
      }).toFile(dest);
    }
    variants.push({ src: url, width });
  }
  const capped = Math.min(meta.width ?? 0, maxWidth);
  for (const width of widths.filter((w) => w < (meta.width ?? 0) && w < capped)) {
    await saveVariant(`${prefix}-${width}.webp`, width);
  }
  if (capped > 0 && !variants.some((variant) => variant.width === capped)) {
    await saveVariant(`${prefix}-${capped}.webp`, capped);
  }
  manifest[src] = { width: meta.width, height: meta.height, variants };
}
manifest['/images/hero-bg-1920.jpg'] = {
  width: 1920,
  height: 1280,
  variants: [
    { src: '/images/hero-bg-760.jpg', width: 760 },
    { src: '/images/hero-bg-1280.jpg', width: 1280 },
    { src: '/images/hero-bg-1920.jpg', width: 1920 },
  ],
};
await writeFile(path.join(root, 'src/generated/images.json'), JSON.stringify(manifest, null, 2) + '\n');
// 只清理本工具生成的旧哈希文件；用户原图从不删除。
const current = new Set(Object.values(manifest).flatMap((info) => info.variants.map((v) => path.basename(v.src))));
for (const name of await readdir(outputDir)) {
  if (name.endsWith('.webp') && !current.has(name)) await unlink(path.join(outputDir, name));
}
console.log(`Optimized ${Object.keys(manifest).length - 1} images; responsive variants in public/images/optimized/`);
