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
  for (const raw of blocks) {
    // 浅拷贝：后面的拼接会改 text。JSON 模块在 dev 里是单例，原地改会一次请求叠一层。
    const b = { ...raw };
    // cont 表示这一段接着上一页的正文。中间若插了图或公式，仍并回最近的正文，
    // 避免同一句在图前、图后各出现一次。
    if (b.cont && b.type === 'body') {
      let prev: any = null;
      for (let i = out.length - 1; i >= 0; i--) {
        if (out[i].type === 'h1' || out[i].type === 'h2' || out[i].type === 'h3') break;
        if (out[i].type === 'body') { prev = out[i]; break; }
      }
      if (prev) {
        const left = plain(prev.text || '');
        const right = plain(b.text || '');
        const gap = /[\u4e00-\u9fff]$/.test(left) || /^[\u4e00-\u9fff]/.test(right) ? '' : ' ';
        prev.text = (prev.text ?? '').replace(/\s+$/, '') + gap + (b.text ?? '').replace(/^\s+/, '');
        continue;
      }
    }
    out.push(b);
  }
  return out;
}

function plain(text: string) {
  return (text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function isHeading(b: any) {
  if (!['h1', 'h2', 'h3'].includes(b.type)) return false;
  // 单字母不是标题。第 15 章中文栏有一处孤立的 “n”，被标成 h2 后把 15.3 整节中文拆走。
  if (/^[A-Za-z]$/.test(plain(b.text || ''))) return false;
  return true;
}

/** 按标题切流：返回 [{title, level, page, y, blocks}]，标题前的前言归入首节 */
function splitByHeadings(stream: any[]): { title: string; level: number; page: number; y: number; blocks: any[] }[] {
  const out: { title: string; level: number; page: number; y: number; blocks: any[] }[] = [];
  let cur: { title: string; level: number; page: number; y: number; blocks: any[] } | null = null;
  for (const b of stream) {
    if (['h1', 'h2', 'h3'].includes(b.type) && !isHeading(b)) continue;
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

/** 无编号、且不是「注释/习题」这类结构标题的单侧节，并回上一节。
 *  第 12 章英文有 h1 “Transformers”，中文对应标题落在正文里，两栏因此被拆开。 */
function foldOrphanTitles(items: { en?: any; zh?: any }[]) {
  const numbered = (t: string) => /^([A-Z](?:\.\d+)+|\d+(?:\.\d+)*)\b/.test(plain(t));
  const structural = (t: string) => /^(Notes|Problems|Summary|Appendix|Notation|References|注释|习题|问题|小结|总结|附录|符号)\b/i.test(plain(t));
  const out: { en?: any; zh?: any }[] = [];
  for (const it of items) {
    const prev = out[out.length - 1];
    const title = it.zh?.title || it.en?.title || '';
    const onlyEn = !!it.en && !it.zh;
    const onlyZh = !!it.zh && !it.en;
    if (prev && (onlyEn || onlyZh) && !numbered(title) && !structural(title)) {
      if (onlyEn && prev.en) {
        prev.en.blocks.push({ type: 'body', text: it.en.title, page: it.en.page }, ...it.en.blocks);
        continue;
      }
      if (onlyZh && prev.zh) {
        prev.zh.blocks.push({ type: 'body', text: it.zh.title, page: it.zh.page }, ...it.zh.blocks);
        continue;
      }
    }
    out.push(it);
  }
  return out;
}

/** 边注插进未完句时，把前后正文接回；「背｜景数学」这类残片并回原词。 */
function repairStream(blocks: any[]): any[] {
  const out: any[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const a = blocks[i];
    const note = blocks[i + 1];
    const b = blocks[i + 2];
    if (a?.type === 'body' && note?.type === 'note' && b?.type === 'body') {
      const at = plain(a.text || '');
      const bt = plain(b.text || '');
      const continues = /(?:是|为|的|and|the|of|is|are|a|an)$/i.test(at);
      if (at && bt && continues && !/[.。！？!?：:]$/.test(at) && bt.length < 100) {
        const gap = /[\u4e00-\u9fff]$/.test(at) || /^[\u4e00-\u9fff]/.test(bt) ? '' : ' ';
        a.text = (a.text || '').replace(/\s+$/, '') + gap + (b.text || '').replace(/^\s+/, '');
        out.push(a, note);
        i += 2;
        continue;
      }
    }
    out.push(a);
  }
  for (let i = 0; i < out.length; i++) {
    const frag = plain(out[i].text || '');
    if (out[i].type !== 'note' || !/^[\u4e00-\u9fff]{1,4}$/.test(frag)) continue;
    let prev = i - 1;
    while (prev >= 0 && out[prev].type !== 'note') prev--;
    if (prev < 0) continue;
    const pt = plain(out[prev].text || '');
    const nearby = out.slice(Math.max(0, i - 4), Math.min(out.length, i + 4))
      .filter((b) => b.type === 'body').map((b) => plain(b.text || '')).join('');
    for (let k = 1; k <= 2; k++) {
      const tail = pt.slice(-k);
      if (!/^[\u4e00-\u9fff]+$/.test(tail) || !nearby.includes(tail + frag)) continue;
      const chars = [...out[prev].text];
      let left = k;
      for (let c = chars.length - 1; c >= 0 && left > 0; c--) {
        if (/[\u4e00-\u9fff]/.test(chars[c])) { chars.splice(c, 1); left--; }
      }
      out[prev].text = chars.join('');
      out.splice(i, 1);
      i--;
      break;
    }
  }
  return out;
}

function figKey(b: any): string | undefined {
  const m = plain(b?.text || '').match(/(?:Figure|图)\s*(\d+\.\d+)/i);
  return m?.[1];
}
function eqKey(b: any): string {
  return String(b?.latex || '').replace(/\s+/g, '');
}

/** 图按图号跨节对齐，公式按清洗后的 LaTeX 在节内对齐。正文分组不动。 */
function realignAnchors(sections: ReaderSection[]) {
  const enFigs: any[] = [];
  const zhFigs: any[] = [];
  for (const s of sections) for (const p of s.pairs) {
    for (const b of p.en || []) if (b.type === 'figure') enFigs.push(b);
    for (const b of p.zh || []) if (b.type === 'figure') zhFigs.push(b);
  }
  const usedFig = new Set<any>();
  const figMate = new Map<any, any>();
  for (const e of enFigs) {
    const k = figKey(e);
    if (!k) continue;
    const z = zhFigs.find((b) => !usedFig.has(b) && figKey(b) === k);
    if (z) { usedFig.add(z); figMate.set(e, z); }
  }
  const movedFig = new Set(figMate.values());

  for (const s of sections) {
    const enEq: any[] = [];
    const zhEq: any[] = [];
    for (const p of s.pairs) {
      for (const b of p.en || []) if (b.type === 'equation' || b.type === 'eqimg') enEq.push(b);
      for (const b of p.zh || []) if (b.type === 'equation' || b.type === 'eqimg') zhEq.push(b);
    }
    const usedEq = new Set<any>();
    const eqMate = new Map<any, any>();
    for (const e of enEq) {
      const k = eqKey(e);
      if (k.length < 12) continue;
      const z = zhEq.find((b) => !usedEq.has(b) && eqKey(b) === k);
      if (z) { usedEq.add(z); eqMate.set(e, z); }
    }
    const movedEq = new Set(eqMate.values());
    const out: Pair[] = [];
    for (const p of s.pairs) {
      const enKeep: any[] = [];
      const zhKeep: any[] = [];
      const anchors: any[] = [];
      for (const b of p.en || []) {
        if (b.type === 'figure' && figMate.has(b)) { anchors.push(b); continue; }
        if ((b.type === 'equation' || b.type === 'eqimg') && eqMate.has(b)) { anchors.push(b); continue; }
        enKeep.push(b);
      }
      for (const b of p.zh || []) {
        if (b.type === 'figure' && movedFig.has(b)) continue;
        if ((b.type === 'equation' || b.type === 'eqimg') && movedEq.has(b)) continue;
        zhKeep.push(b);
      }
      if (enKeep.length || zhKeep.length) {
        const only = enKeep.length + zhKeep.length === 1 ? (enKeep[0] || zhKeep[0]) : null;
        const bothSame = enKeep.length === 1 && zhKeep.length === 1 && enKeep[0].type === zhKeep[0].type && FUSE.includes(enKeep[0].type);
        const kind = bothSame ? enKeep[0].type : only && FUSE.includes(only.type) ? only.type : 'body';
        out.push({ kind, en: enKeep.length ? enKeep : undefined, zh: zhKeep.length ? zhKeep : undefined });
      }
      for (const b of anchors) {
        const mate = b.type === 'figure' ? figMate.get(b) : eqMate.get(b);
        out.push({ kind: b.type, en: [b], zh: mate ? [mate] : undefined });
      }
    }
    s.pairs = out;
  }
}

const PHRASES: [string, string][] = [
  ['learning rate', '学习率'],
  ['minimum', '最小值'],
  ['flat', '平坦'],
  ['loss is small', '损失很小'],
  ['indirect', '间接'],
  ['architecture', '架构'],
  ['variational', '变分'],
  ['binomial', '二项式'],
  ['gradient descent', '梯度下降'],
];

function phraseHits(en: string, zh: string) {
  const e = en.toLowerCase();
  let n = 0;
  for (const [a, b] of PHRASES) if (e.includes(a) && zh.includes(b)) n++;
  return n;
}

/** 整句中文落在下一节开头、上一节英文明显偏长时，把这句挪回去。 */
function stitchDangling(sections: ReaderSection[]) {
  for (let i = 1; i < sections.length; i++) {
    const first = sections[i].pairs[0];
    if (!first?.zh?.length) continue;
    const curEn = (first.en || []).map((b) => b.text || '').join(' ');
    for (const block of [...first.zh]) {
      const bt = plain(block.text || '');
      if (bt.length < 40) continue;
      const here = phraseHits(curEn, bt);
      for (let back = 1; back <= 2 && i - back >= 0; back++) {
        const prev = sections[i - back];
        const last = [...prev.pairs].reverse().find((p) => plain((p.en || []).map((b) => b.text || '').join(' ')).length > 120);
        if (!last) continue;
        const lastEn = (last.en || []).map((b) => b.text || '').join(' ');
        const enL = plain(lastEn).length;
        const zhL = plain((last.zh || []).map((b) => b.text || '').join(' ')).length;
        if (!enL || zhL > enL * 0.4) continue;
        if (phraseHits(lastEn, bt) <= here) continue;
        first.zh = first.zh!.filter((b) => b !== block);
        if (!first.zh.length) delete first.zh;
        last.zh = [...(last.zh || []), block];
        break;
      }
    }
  }
  for (const s of sections) s.pairs = s.pairs.filter((p) => (p.en && p.en.length) || (p.zh && p.zh.length));
}

/** 一句中文的关键词更像后面那条还没配上的英文时，把这句移过去。 */
function relocateProse(sections: ReaderSection[]) {
  for (const s of sections) {
    for (let i = 0; i < s.pairs.length; i++) {
      const zhBlocks = (s.pairs[i].zh || []).filter((b) => b.type === 'body' || b.type === 'note');
      const enText = (s.pairs[i].en || []).map((b) => b.text || '').join(' ');
      for (const block of [...zhBlocks]) {
        const bt = plain(block.text || '');
        if (bt.length < 40) continue;
        const here = phraseHits(enText, bt);
        if (here > 0) continue;
        let best = -1;
        let bestH = 0;
        for (let k = -3; k <= 3; k++) {
          if (k === 0 || i + k < 0 || i + k >= s.pairs.length) continue;
          const nxt = s.pairs[i + k];
          const nxtEn = (nxt.en || []).map((b) => b.text || '').join(' ');
          const nxtZh = plain((nxt.zh || []).map((b) => b.text || '').join(' '));
          if (nxtZh.length > 60 || plain(nxtEn).length < 80) continue;
          const h = phraseHits(nxtEn, bt);
          if (h > bestH) { bestH = h; best = i + k; }
        }
        if (best < 0) continue;
        s.pairs[i].zh = (s.pairs[i].zh || []).filter((b) => b !== block);
        if (!s.pairs[i].zh!.length) delete s.pairs[i].zh;
        const dest = s.pairs[best];
        dest.zh = [...(dest.zh || []), block];
      }
    }
    s.pairs = s.pairs.filter((p) => (p.en && p.en.length) || (p.zh && p.zh.length));
  }
}

export function buildSections(ch: any): ReaderSection[] {
  const enAll = repairStream(flatten(ch.pages.flatMap((p: any) => p.en)));
  const zhAll = repairStream(flatten(ch.pages.flatMap((p: any) => p.zh)));
  const enSecs = splitByHeadings(enAll);
  const zhSecs = splitByHeadings(zhAll);
  const items = foldOrphanTitles(alignSections(enSecs, zhSecs));
  const sections = items
    .map((it, k) => ({
      id: `sec-${k}`,
      zhTitle: it.zh?.title || undefined,
      enTitle: it.en?.title || undefined,
      level: it.zh?.level ?? it.en?.level ?? 2,
      pairs: pairStreams(it.en?.blocks ?? [], it.zh?.blocks ?? []),
    }))
    .filter((s) => s.pairs.length);
  realignAnchors(sections);
  stitchDangling(sections);
  relocateProse(sections);
  return sections;
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
