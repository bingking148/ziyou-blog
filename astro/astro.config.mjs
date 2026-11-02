import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { visit } from 'unist-util-visit';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// 构建时从 markdown frontmatter 读 date/updatedDate，给 sitemap serialize 用。
// 仅作轻量 YAML 行扫描，避免引入完整 frontmatter 解析依赖。
function readPostDates() {
  const dir = fileURLToPath(new URL('./src/content/post/', import.meta.url));
  const map = {};
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    const text = readFileSync(join(dir, name), 'utf8');
    const slug = name.replace(/\.md$/, '');
    const date = /^date:\s*(.+)$/m.exec(text)?.[1]?.trim();
    const updated = /^updatedDate:\s*(.+)$/m.exec(text)?.[1]?.trim();
    const norm = (s) => {
      if (!s) return undefined;
      // 去掉引号；仅保留合法 ISO 串
      const v = s.replace(/^['"]|['"]$/g, '');
      return isNaN(Date.parse(v)) ? undefined : new Date(v);
    };
    map[slug] = { date: norm(date), updated: norm(updated) };
  }
  return map;
}
const POST_DATES = readPostDates();

/**
 * remark-math 只把「$$ 换行 … 换行 $$」识别为块级公式；
 * 本站历史内容多为单行 $$…$$，会落成行内公式。
 * 这里把「整段只有一个公式」的节点改回 math-display，源文件无需改动。
 */
function rehypeLoneMathBlocks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'p') return;
      const meaningful = node.children.filter(
        (child) => child.type !== 'text' || child.value.trim()
      );
      if (meaningful.length !== 1) return;
      const math = meaningful[0];
      if (
        math.type !== 'element' ||
        !Array.isArray(math.properties.className) ||
        !math.properties.className.includes('math-inline')
      ) {
        return;
      }
      math.properties.className = math.properties.className.map((name) =>
        name === 'math-inline' ? 'math-display' : name
      );
    });
  };
}

/**
 * 给所有 <table> 套一层 .table-scroll 容器：
 * 让宽表格在自身容器里横向滚动而不是撑破整页。
 * 同时给容器加 tabindex/role/aria-label，键盘用户能 focus 后用方向键横滚。
 */
function rehypeTableScroll() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || typeof index !== 'number') return;
      // 已经在滚动容器里就跳过（例如手写 HTML 已包好）
      if (
        parent.type === 'element' &&
        Array.isArray(parent.properties?.className) &&
        parent.properties.className.includes('table-scroll')
      ) {
        return;
      }
      const wrapper = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['table-scroll'],
          tabindex: '0',
          role: 'region',
          'aria-label': '可横向滚动的表格',
        },
        children: [node],
      };
      parent.children[index] = wrapper;
    });
  };
}

export default defineConfig({
  site: 'https://ziyou814.top',
  // 与 Hugo 产物 URL 完全一致：/post/<slug>/ 带尾斜杠、目录式 index.html
  trailingSlash: 'always',
  build: { format: 'directory' },
  // 视口内的站内 <a> 自动 prefetch；只影响 a[data-astro-prefetch] 之外的默认行为，
  // 不在首页大图/背景链接上额外预取——大头带宽已经花在首屏资源上了。
  prefetch: { prefetchAll: false, defaultStrategy: 'viewport' },
  vite: {
    // 本地预览时关闭热更新自动刷新；要恢复就删掉这段 vite 配置
    server: { hmr: false },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/search/'),
      // 用正文真实的 date/updatedDate 给文章 lastmod，而不是构建时间——
      // 让搜索引擎区分「新文章」和「老文章新构建」。
      serialize(item) {
        const m = /^https?:\/\/[^/]+\/post\/([^/]+)\/$/.exec(item.url);
        if (m && POST_DATES[m[1]]) {
          const d = POST_DATES[m[1]];
          if (d.updated) item.lastmod = d.updated;
          else if (d.date) item.lastmod = d.date;
        }
        return item;
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeLoneMathBlocks, rehypeKatex, rehypeTableScroll],
    shikiConfig: {
      // 双主题走 CSS 变量（--shiki-light/--shiki-dark），暗色切换不需要 JS 重渲染
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
