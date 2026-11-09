// 确认静态源码里、原文楷能画出来的字，都落在已提交的两份子集里。
// 漏字时构建失败，避免正文悄悄退回系统字体。
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const fontDir = path.join(root, 'public/resources/lxgw-wenkai-screen-webfont@1.1.0');
const original = readFileSync(path.join(fontDir, 'lxgwwenkaiscreen.css'), 'utf8');
const used = readFileSync(path.join(fontDir, 'lxgwwenkaiscreen-used.css'), 'utf8');
const absent = new Set(readFileSync(path.join(fontDir, 'wenkai-absent.txt'), 'utf8'));

function ranges(css) {
  const out = [];
  for (const match of css.matchAll(/unicode-range:\s*([^;}]+)/g)) {
    for (const part of match[1].split(',')) {
      const token = part.trim();
      if (!token.toUpperCase().startsWith('U+')) continue;
      const body = token.slice(2);
      if (body.includes('-')) {
        const [a, b] = body.split('-');
        out.push([parseInt(a, 16), parseInt(b, 16)]);
      } else {
        const n = parseInt(body, 16);
        out.push([n, n]);
      }
    }
  }
  return out;
}

function asSet(spans) {
  const set = new Set();
  for (const [a, b] of spans) {
    if (b - a > 8000) continue;
    for (let cp = a; cp <= b; cp++) set.add(cp);
  }
  return { set, wide: spans.filter(([a, b]) => b - a > 8000) };
}

function covers(index, cp) {
  if (index.set.has(cp)) return true;
  for (const [a, b] of index.wide) if (cp >= a && cp <= b) return true;
  return false;
}

function strip(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/(^|[^:\\])\/\/.*$/gm, '$1');
}

function walk(dir, acc) {
  for (const name of readdirSync(dir)) {
    if (name === 'generated' || name === 'node_modules') continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(?:astro|css|ts|mjs|md|json)$/i.test(name)) acc.push(full);
  }
  return acc;
}

const originalIndex = asSet(ranges(original));
const usedIndex = asSet(ranges(used));
if (!usedIndex.set.size) {
  console.error('lxgwwenkaiscreen-used.css 没有 unicode-range');
  process.exit(1);
}
const missing = new Set();
for (const file of walk(path.join(root, 'src'), [])) {
  const text = strip(readFileSync(file, 'utf8'));
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp < 128) continue;
    if (absent.has(ch)) continue;
    if (covers(originalIndex, cp) && !covers(usedIndex, cp)) missing.add(ch);
  }
}
if (missing.size) {
  const sample = [...missing].slice(0, 24).join('');
  console.error(`文楷子集缺了 ${missing.size} 个静态字符，例如「${sample}」。请在 astro/ 运行 python3 scripts/subset-wenkai.py`);
  process.exit(1);
}
console.log(`WenKai subset covers static text (${usedIndex.set.size} codepoints)`);
