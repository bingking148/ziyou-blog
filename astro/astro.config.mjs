import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { visit } from 'unist-util-visit';

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

export default defineConfig({
  site: 'https://ziyou814.top',
  // 与 Hugo 产物 URL 完全一致：/post/<slug>/ 带尾斜杠、目录式 index.html
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/search/'),
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeLoneMathBlocks, rehypeKatex],
    shikiConfig: {
      // 双主题走 CSS 变量（--shiki-light/--shiki-dark），暗色切换不需要 JS 重渲染
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
