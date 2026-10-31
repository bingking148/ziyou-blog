# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog at https://ziyou814.top/，中文（zh-CN）。**线上版本是 `astro/` 下的 Astro 5 站点**（2026-10-31 完成切站上线）；仓库根的 Hugo 站（`hugo-theme-reimu` 主题）已下线，源码保留作回滚备份。

**仓库结构要点（历史文档曾写过 `pblog/` 前缀，已过时）：**

- 站点根目录就是仓库根目录（`hugo.toml` 在根下），没有 `pblog/` 这一层。
- **`astro/` 子目录是线上版本**（Astro 5 迁移 2026-10-30 启动、2026-10-31 完成切站，详见下方「Astro 站点」一节与 `astro/README.md`）。Hugo 已下线：配置/主题/布局冻结不动，只作回滚备份；新功能与样式一律改 Astro 侧。
- `themes/reimu/` **不是 git submodule**，是直接 vendor 进主仓库的普通目录；修改主题文件直接改，但要意识到升级主题时会产生冲突。
- 站点级覆盖放在根目录 `layouts/`（如 `layouts/partials/header.html`、`layouts/columns/section.html`），优先级高于主题。
- `layouts/partials/post/nav.html` 覆盖主题的文章底部前后篇导航：主题原版 `.PrevInSection/.NextInSection` 的方向与「按 weight 排序的专栏」相反；覆盖版让所属分类 term 标了 `column: true` 的文章只在专栏内按 weight 顺序导航，非专栏文章回退到 section 默认排序。匹配用 `.Data.Term`（不能用 term 页的 `title`，专栏 `_index.md` 的 title 带「专栏」后缀会对不上）。
- 设计文档放 `docs/superpowers/specs/`（按日期命名，如首页闪卡效果设计）。

## Astro 站点（astro/，线上版本）

细节见 `astro/README.md`，要点：

- **切站已完成（2026-10-31）**：Hugo 的配置/主题/布局（`config/`、`themes/`、`layouts/`）冻结不动，仅作回滚备份；**文章内容继续双写**——`content/post/` 与 `astro/src/content/post/` 同步增改，用 `python -I scripts/sync_post.py` 一键同步（`--check` 查漂移、`--reverse` 反向）。
- **URL 必须与 Hugo 完全一致**（`/post/<slug>/` 带尾斜杠、CJK 分类目录名小写化规则），否则 Waline 评论线程与不蒜子计数脱钩。`astro.config.mjs` 的 `trailingSlash: 'always'` + `build.format: 'directory'` 就是为此；分类/标签 slug 用 `src/utils/columns.ts` 的 `slugifyTaxonomy` 对齐 Hugo URLize。
- **`--red-*` CSS 变量名不可改**：封面取色与氛围旋钮脚本都写这组变量；localStorage 键 `yzrt-mood-hue`、`theme` 与旧站共享。
- 内容集合在 `src/content.config.ts`：frontmatter 同 Hugo，仅 `lastmod` → `updatedDate`；专栏内篇号用 `weight`（从 1 起，0 会被排到最后，和 Hugo 同款坑）。专栏定义在 `src/content/columns/*.md`，`category` 字段与文章 categories 项精确匹配。
- 站点常量（菜单、Waline、打字机文案）移植在 `src/consts.ts`；Hugo `data/*.yml` 对应 `src/data/*.ts`（如 `friends.ts`）。
- `PostNav.astro` 移植了 Hugo 侧前后篇导航的逻辑：专栏文章按 weight、非专栏按日期。
- 全部第三方资源 vendored 在 `astro/public/resources/`，零公共 CDN（Waline 表情包 unpkg 按需加载除外）。
- **线上部署 = Cloudflare Pages 自动部署**：Pages 项目 `ziyou-blog` 连接本仓库，绑定 ziyou814.top 与 ziyou-blog.pages.dev，push main 自动构建上线。构建配置存在 CF 后台（根目录 `astro`、构建命令 `npm ci && npm run build`、输出 `dist`、环境变量 `NODE_VERSION=22`）。回滚优先用 Pages 部署历史一键回退；GitHub Actions 仍产出 `site`（Astro）与 `site-hugo-legacy`（Hugo）artifact 作手动备份。

## Common Development Commands

```bash
# 开发（Astro，线上站；在 astro/ 目录下执行，首次先 npm install）
npm run dev       # http://localhost:4321
npm run build     # 生产构建，产物 → astro/dist/
npm run preview

# 新文章：先写在 Hugo 侧（archetype 入口），再一键同步到 Astro
hugo new content post/my-new-post.md
python -I scripts/sync_post.py my-new-post.md   # 不带参数 = 同步全部文章
python -I scripts/sync_post.py --check          # 只检查两边是否漂移，不写文件

# 构建产物体检：扫全部页面的站内引用是否有 404、远程依赖、关键功能点
python -I scripts/verify_build.py astro/dist   # Astro 产物（线上）
python -I scripts/verify_build.py              # Hugo 产物（回滚备份用）
```

`--minify` 不只是压缩 HTML：主题的 CSS 管线（`helpers/scss.html`）以 `hugo.IsProduction` 为开关做 minify + fingerprint，`hugo server` 产物里是未压缩 CSS、livereload 脚本和 localhost URL，绝不能上线。

## CI

`.github/workflows/build.yml`：push 到 main 自动构建（Hugo 版本已钉死，升级本地 Hugo 后同步修改），产出 `site`（Astro）和 `site-hugo-legacy`（Hugo）两个 artifact。**真正的上线在 Cloudflare Pages 自动部署**（见上节），这里 artifact 仅作手动备份；GitHub Pages 自动部署 job 仍注释着未启用。

## 资源本地化（重要约定）

所有第三方 JS/CSS/字体走 `data/vendor.yml` 的 `local|` 前缀指向 `static/resources/`，**不依赖任何公共 CDN**（国内可达性原因）。机制见主题 `layouts/partials/helpers/{vendorCdn,cdnJs,cdnCss}.html`——`local|` 资源自动跳过 integrity 校验。

- 主题自带一批：`themes/reimu/static/resources/`（aplayer、meting、pace、busuanzi、quicklink、photoswipe、waline、clipboard、lazysizes、mermaid、mathjax 等）。
- 站点自补的：`static/resources/` 下 `typed.js@2.1.0/`、`@reimujs/aos@0.1.2/`、`fuse.js@7.1.0/`、`lxgw-wenkai-screen-webfont@1.1.0/`、`mulish/`（@fontsource 子集）。
- 新增依赖时：文件放 `static/resources/<pkg>@<ver>/...`，`data/vendor.yml` 里写 `src: local|<pkg>@<ver>/path`。
- 仍然外链的（有意保留）：alicdn 图标字体（国内 CDN，快）；Waline 表情包 `unpkg.com/@waline/emojis`（仅打开表情面板时按需加载）。

## 图片约定

- 封面统一为宽 ≤1600px 的 JPEG（q80 渐进式）。2026-10 批量压缩过一次（34MB → 3MB），原图备份在仓库外 `E:/blog_image_backup/`，脚本见 `scripts/optimize_images.py`。新封面不要直接扔相机原图。
- 首页横幅 `hero-bg-{760,1280,1920}.jpg` 三档 srcset（`params.yml` 的 `banner_srcset`），手机只下 23KB 的小图。

## 站内搜索

无后端方案：`content/search.md`（`layout: search` + `outputs: [html, json]`，`build.list: never` 不进列表和 RSS）→ `layouts/search.html`（页面 + UI）+ `layouts/search.json`（索引）→ 本地 fuse.js 兜底英文模糊匹配，中文走子串匹配。入口在导航菜单「搜索」。

## Key Configuration

- `config/_default/params.yml`：主题参数主文件，体量很大，其中 `injector.head_end/body_end/sidebar_end` 内联了大量定制 CSS/JS（导航胶囊、氛围旋钮、封面取色等），改动要小心它们是**每页注入**的。
- 评论系统 Waline（自建 `https://comment.ziyou814.top` + Cloudflare）；giscus 配置保留未启用。
- 音乐播放器 Meting 的 `meting_api` 指向社区公共 API `https://meting.qjqq.cn/api`，失效时改回空串回退默认。

## Content Frontmatter

```yaml
---
title: 'Post Title'
date: 2026-04-13T00:00:00+08:00
lastmod: 2026-04-13T00:00:00+08:00
cover: /images/covers/xxx-cover.jpg
categories: [Category1, Category2]
tags: [tag1, tag2]
description: 'Post description'   # 会进 og:description 和搜索索引
math: false        # true 时才加载 KaTeX JS
mermaid: false
comments: true     # Waline
toc: true
---
```

专栏分区：`content/categories/<name>/_index.md` 里 `column: true` + `column_order`，由 `layouts/columns/section.html` 按权重渲染篇目列表。

## Known Quirks

- `/post/` 列表页 404 是主题历史行为（主题没有 section 模板），文章列表在首页和归档页，菜单也没链接它，别当 bug 修。
- 构建时的 WARN（.Site.Languages deprecated、covers.yml override）是主题自身/数据覆盖的正常现象。
