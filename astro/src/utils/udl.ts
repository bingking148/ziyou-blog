/**
 * UDL 阅读数据整理：
 * - flatten: 跨页段落（cont 标记）合并回前一段
 * - splitByHeadings: 标题流切成小节
 * - buildSections: 中英小节一一对应，块流顺序配对（body/note 两侧各显，
 *   figure/equation 合并为一个跨栏块），类型不匹配时单独成块
 */
export interface Pair {
  kind: string; // body | note | figure | equation
  en?: any;
  zh?: any;
}

export interface ReaderSection {
  id: string;
  zhTitle?: string;
  enTitle?: string;
  level: number;
  pairs: Pair[];
}

function flatten(blocks: any[]): any[] {
  const out: any[] = [];
  for (const b of blocks) {
    const prev = out[out.length - 1];
    if (b.cont && prev && prev.type === 'body' && b.type === 'body') {
      prev.text = (prev.text ?? '').replace(/\s+$/, '') + ' ' + (b.text ?? '').replace(/^\s+/, '');
      continue;
    }
    out.push(b);
  }
  return out;
}

function isHeading(b: any) {
  return ['h1', 'h2', 'h3'].includes(b.type);
}

/** 按标题切流：返回 [{title, level, blocks}]，标题前的前言归入首节（title 空） */
function splitByHeadings(stream: any[]): { title: string; level: number; blocks: any[] }[] {
  const out: { title: string; level: number; blocks: any[] }[] = [];
  let cur: { title: string; level: number; blocks: any[] } | null = null;
  for (const b of stream) {
    if (isHeading(b)) {
      if (cur) out.push(cur);
      cur = { title: b.text ?? '', level: Number(b.type[1]), blocks: [] };
    } else {
      if (!cur) cur = { title: '', level: 2, blocks: [] };
      cur.blocks.push(b);
    }
  }
  if (cur) out.push(cur);
  return out;
}

const FUSE = ['figure', 'equation', 'eqimg'];

/** 两股块流按顺序配对：figure/equation 是锚点，跨侧寻找同类配对（避免同图双渲染）；
 *  body/note 类型相同时配对，其余单独成块 */
function pairStreams(en: any[], zh: any[]): Pair[] {
  const pairs: Pair[] = [];
  let i = 0, j = 0;
  const findFrom = (arr: any[], from: number, type: string) => {
    for (let k = from; k < arr.length; k++) if (arr[k].type === type) return k;
    return -1;
  };
  while (i < en.length || j < zh.length) {
    const e = en[i], z = zh[j];
    if (!z) { pairs.push({ kind: e.type, en: e }); i++; continue; }
    if (!e) { pairs.push({ kind: z.type, zh: z }); j++; continue; }
    if (e.type === z.type) {
      pairs.push({ kind: e.type, en: e, zh: z });
      i++; j++;
    } else if (FUSE.includes(e.type)) {
      const k = findFrom(zh, j, e.type);
      if (k === -1) { pairs.push({ kind: e.type, en: e }); i++; }
      else { for (let m = j; m < k; m++) pairs.push({ kind: zh[m].type, zh: zh[m] }); j = k; }
    } else if (FUSE.includes(z.type)) {
      const k = findFrom(en, i, z.type);
      if (k === -1) { pairs.push({ kind: z.type, zh: z }); j++; }
      else { for (let m = i; m < k; m++) pairs.push({ kind: en[m].type, en: en[m] }); i = k; }
    } else {
      pairs.push({ kind: e.type, en: e }); i++;
      pairs.push({ kind: z.type, zh: z }); j++;
    }
  }
  return pairs;
}

export function buildSections(ch: any): ReaderSection[] {
  const enAll = flatten(ch.pages.flatMap((p: any) => p.en));
  const zhAll = flatten(ch.pages.flatMap((p: any) => p.zh));
  const enSecs = splitByHeadings(enAll);
  const zhSecs = splitByHeadings(zhAll);

  const sections: ReaderSection[] = [];
  const n = Math.max(enSecs.length, zhSecs.length);
  for (let k = 0; k < n; k++) {
    const e = enSecs[k] ?? { title: '', level: 2, blocks: [] };
    const z = zhSecs[k] ?? { title: '', level: 2, blocks: [] };
    sections.push({
      id: `sec-${k}`,
      zhTitle: z.title || undefined,
      enTitle: e.title || undefined,
      level: z.level,
      pairs: pairStreams(e.blocks, z.blocks),
    });
  }
  return sections.filter((s) => s.pairs.length);
}

/** 第一个含中文正文段的小节下标（用于首字下沉） */
export function firstProseIndex(sections: ReaderSection[]): number {
  const i = sections.findIndex((s) => s.pairs.some((p) => p.kind === 'body' && p.zh));
  return i < 0 ? 0 : i;
}
