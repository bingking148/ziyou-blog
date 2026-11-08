/**
 * UDL 阅读数据整理：
 * - flatten: 跨页段落（cont 标记）合并回前一段
 * - splitByHeadings: 标题流切成小节
 * - buildSections: 中英小节一一对应，块流顺序配对（body/note 两侧各显，
 *   figure/equation 合并为一个跨栏块），类型不匹配时单独成块
 */
export interface Pair {
  kind: string; // body | note | figure | equation
  en?: any[];
  zh?: any[];
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

/** 按标题切流：返回 [{title, level, page, y, blocks}]，标题前的前言归入首节 */
function splitByHeadings(stream: any[]): { title: string; level: number; page: number; y: number; blocks: any[] }[] {
  const out: { title: string; level: number; page: number; y: number; blocks: any[] }[] = [];
  let cur: { title: string; level: number; page: number; y: number; blocks: any[] } | null = null;
  for (const b of stream) {
    if (isHeading(b)) {
      if (cur) out.push(cur);
      cur = { title: b.text ?? '', level: Number(b.type[1]), page: b.page ?? 0, y: b.y ?? 0, blocks: [] };
    } else {
      if (!cur) cur = { title: '', level: 2, page: 0, y: 0, blocks: [] };
      cur.blocks.push(b);
    }
  }
  if (cur) out.push(cur);
  return out;
}

/** 中英标题流按 (page, y) 锚点对齐：
 * 对照排版里同一 PDF 页上英文标题（左半）与中文标题（右半）y 几乎相同。
 * 匹配上的成对；单侧的独立成节（另一侧空标题），保证后续不再错位。 */
function alignSections(enSecs: any[], zhSecs: any[]) {
  const usedEn = new Set<number>();
  const result: { en?: any; zh?: any }[] = [];
  const zhMatched = new Array(zhSecs.length).fill(-1);
  // 为每个 zh 标题找 en 锚点
  zhSecs.forEach((z, zi) => {
    let best = -1, bestDy = 1e9;
    enSecs.forEach((e, ei) => {
      if (usedEn.has(ei)) return;
      if (e.page !== z.page) return;
      const dy = Math.abs((e.y ?? 0) - (z.y ?? 0));
      if (dy < 30 && dy < bestDy) { bestDy = dy; best = ei; }
    });
    zhMatched[zi] = best;
    if (best >= 0) usedEn.add(best);
  });
  // 按全局阅读顺序（page, y）合并输出
  const items: { key: number; en?: any; zh?: any }[] = [];
  zhSecs.forEach((z, zi) => {
    const m = zhMatched[zi] >= 0 ? enSecs[zhMatched[zi]] : undefined;
    items.push({ key: z.page * 100000 + z.y, zh: z, en: m });
  });
  enSecs.forEach((e, ei) => {
    if (!usedEn.has(ei)) items.push({ key: e.page * 100000 + e.y, en: e });
  });
  items.sort((a, b) => a.key - b.key);
  return items;
}

export function buildSections(ch: any): ReaderSection[] {
  const enAll = flatten(ch.pages.flatMap((p: any) => p.en));
  const zhAll = flatten(ch.pages.flatMap((p: any) => p.zh));
  const enSecs = splitByHeadings(enAll);
  const zhSecs = splitByHeadings(zhAll);
  const items = alignSections(enSecs, zhSecs);
  return items
    .map((it, k) => ({
      id: `sec-${k}`,
      zhTitle: it.zh?.title || undefined,
      enTitle: it.en?.title || undefined,
      level: it.zh?.level ?? it.en?.level ?? 2,
      pairs: pairStreams(it.en?.blocks ?? [], it.zh?.blocks ?? []),
    }))
    .filter((s) => s.pairs.length);
}

const FUSE = ['figure', 'equation', 'eqimg'];

/** 段落特征：数字集合（翻译保留数字，是强锚点）+ 纯文本长度 */
function bodyFeat(t: string) {
  const plain = (t || '').replace(/<[^>]+>/g, ' ');
  return {
    nums: new Set((plain.match(/\d+(?:\.\d+)?/g) || []).filter((n) => n.length > 0)),
    len: plain.replace(/\s+/g, '').length,
  };
}

/** 对齐一组 en 段落与 zh 段落的成本：数字 IoU 为主，长度比为辅 */
function groupCost(E: any[], Z: any[]): number {
  const numU = new Set<string>();
  let hit = 0;
  const zhNums = new Set<string>();
  Z.forEach((z) => z.nums.forEach((n: string) => { zhNums.add(n); numU.add(n); }));
  E.forEach((e) => e.nums.forEach((n: string) => { if (zhNums.has(n)) hit++; numU.add(n); }));
  const iou = numU.size ? hit / numU.size : 0.5; // 都没数字时给中性分
  const enLen = E.reduce((s, e) => s + e.len, 0);
  const zhLen = Z.reduce((s, z) => s + z.len, 0);
  const ratio = enLen && zhLen ? Math.min(enLen, zhLen) / Math.max(enLen, zhLen) : 0.5;
  // 中文约 0.45~0.75 倍英文字符数；用宽松比例评分
  const expect = zhLen / Math.max(enLen, 1);
  const ratioScore = expect >= 0.3 && expect <= 1.1 ? 1 : ratio;
  return (1 - iou) * 1.2 + (1 - ratioScore) * 0.8;
}

/** DP 段落对齐：把 en/zh 两串 body 块切成对齐组（允许 1:N / N:1 / N:M）
 *  翻译常合并/拆分段落，顺序 1:1 配对会错开内容，这里按数字锚点+长度做全局最优对齐 */
function alignBodyRun(en: any[], zh: any[]): { en: any[]; zh: any[] }[] {
  const n = en.length, m = zh.length;
  if (!n || !m) {
    const out: { en: any[]; zh: any[] }[] = [];
    if (n) out.push({ en, zh: [] });
    if (m) out.push({ en: [], zh });
    return out;
  }
  const E = en.map((b) => bodyFeat(b.text || ''));
  const Z = zh.map((b) => bodyFeat(b.text || ''));
  const INF = 1e18;
  const f: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(INF));
  const back: (number[] | null)[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(null));
  f[0][0] = 0;
  // 组合枚举：en 侧 1-3 段、zh 侧 1-2 段（中译常见多并一）
  const steps: [number, number][] = [[1, 1], [2, 1], [3, 1], [1, 2], [2, 2], [1, 3]];
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      if (f[i][j] >= INF) continue;
      for (const [a, b] of steps) {
        const ni = i + a, nj = j + b;
        if (ni > n || nj > m) continue;
        // 尾部不足时允许剩余全并（如 en 还剩 1 段但 zh 没了）
        const c = f[i][j] + groupCost(E.slice(i, ni), Z.slice(j, nj)) + a * 0.05 + b * 0.05;
        if (c < f[ni][nj]) { f[ni][nj] = c; back[ni][nj] = [i, j]; }
      }
    }
  }
  // 回溯（f[n][m] 一定可达）
  const groups: { en: any[]; zh: any[] }[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    const prev = back[i][j];
    if (!prev) break;
    const [pi, pj] = prev;
    groups.unshift({ en: en.slice(pi, i), zh: zh.slice(pj, j) });
    i = pi; j = pj;
  }
  return groups;
}

/** 全流 DP 对齐：锚点（figure/equation/eqimg）与锚点配对、正文 run 与 run 配对（1:N/M），
 *  全局最小成本，天然处理两侧锚点交错的情况 */
function pairStreams(en: any[], zh: any[]): Pair[] {
  const n = en.length, m = zh.length;
  if (!n && !m) return [];
  const INF = 1e18;
  // f[i][j] = 前 i 个 en 块与前 j 个 zh 块的最小成本
  const f: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(INF));
  const back: { i: number; j: number; ei: number[]; zi: number[] }[][] =
    Array.from({ length: n + 1 }, () => Array.from({ length: m + 1 }, () => null as any));
  f[0][0] = 0;
  const isAnchor = (b: any) => FUSE.includes(b.type);
  // 组成本：锚点同类型=0 侧空=0.6 run=groupCost；跨类型禁止
  const stepCost = (eg: any[], zg: any[]): number | null => {
    if (!eg.length && !zg.length) return null;
    if (!eg.length || !zg.length) return 0.6 * Math.max(eg.length, zg.length); // 单侧残留
    const ea = eg.every(isAnchor), za = zg.every(isAnchor);
    if (ea && za) {
      if (eg.length === 1 && zg.length === 1 && eg[0].type === zg[0].type) return 0; // 锚点配对
      return null; // 多锚点组不合并
    }
    if (ea || za) return null; // 锚点不能配正文
    return groupCost(eg.map((b) => bodyFeat(b.text || '')), zg.map((b) => bodyFeat(b.text || '')));
  };
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j <= m; j++) {
      if (f[i][j] >= INF) continue;
      // 枚举转移：每侧推进 0~3 块（至少一侧推进）
      const maxA = Math.min(3, n - i), maxB = Math.min(3, m - j);
      for (let a = 0; a <= maxA; a++) {
        for (let b = 0; b <= maxB; b++) {
          if (a === 0 && b === 0) continue;
          const eg = en.slice(i, i + a), zg = zh.slice(j, j + b);
          const c = stepCost(eg, zg);
          if (c === null) continue;
          const total = f[i][j] + c + (a + b) * 0.02;
          if (total < f[i + a][j + b]) {
            f[i + a][j + b] = total;
            back[i + a][j + b] = { i, j, ei: eg, zi: zg };
          }
        }
      }
    }
  }
  // 回溯
  const out: Pair[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    const bk = back[i][j];
    if (!bk) break;
    const { ei, zi } = bk;
    if (ei.length === 1 && zi.length === 1 && isAnchor(ei[0]) && ei[0].type === zi[0].type) {
      out.unshift({ kind: ei[0].type, en: ei, zh: zi });
    } else if (ei.length && zi.length) {
      out.unshift({ kind: 'body', en: ei, zh: zi });
    } else if (ei.length) {
      out.unshift({ kind: isAnchor(ei[0]) ? ei[0].type : 'body', en: ei });
    } else {
      out.unshift({ kind: isAnchor(zi[0]) ? zi[0].type : 'body', zh: zi });
    }
    i = bk.i; j = bk.j;
  }
  return out;
}

/** 第一个含中文正文段的小节下标（用于首字下沉） */
export function firstProseIndex(sections: ReaderSection[]): number {
  const i = sections.findIndex((s) => s.pairs.some((p) => p.kind === 'body' && p.zh?.length));
  return i < 0 ? 0 : i;
}
