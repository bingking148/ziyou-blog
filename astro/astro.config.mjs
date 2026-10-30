import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      // 双主题走 CSS 变量（--shiki-light/--shiki-dark），暗色切换不需要 JS 重渲染
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
