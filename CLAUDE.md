# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Hugo static blog** using the `hugo-theme-reimu` theme. Chinese language (zh-CN), deployed to https://ziyou814.top/.

**仓库结构要点（历史文档曾写过 `pblog/` 前缀，已过时）：**

- 站点根目录就是仓库根目录（`hugo.toml` 在根下），没有 `pblog/` 这一层。
- `themes/reimu/` **不是 git submodule**，是直接 vendor 进主仓库的普通目录；修改主题文件直接改，但要意识到升级主题时会产生冲突。
- 站点级覆盖放在根目录 `layouts/`（如 `layouts/partials/header.html`、`layouts/columns/section.html`），优先级高于主题。

## Common Development Commands

```bash
# 开发
hugo server

# 生产构建（部署必须用这个，不要部署 hugo server 的产物）
hugo --minify --gc --cleanDestinationDir

# 新文章
hugo new content post/my-new-post.md

# 构建产物体检：扫全部页面的站内引用是否有 404、远程依赖、关键功能点
python scripts/verify_build.py
```

`--minify` 不只是压缩 HTML：主题的 CSS 管线（`helpers/scss.html`）以 `hugo.IsProduction` 为开关做 minify + fingerprint，`hugo server` 产物里是未压缩 CSS、livereload 脚本和 localhost URL，绝不能上线。

## CI

`.github/workflows/build.yml`：push 到 main 自动构建（Hugo 版本已钉死，升级本地 Hugo 后同步修改），产出 `site` artifact 供下载部署。GitHub Pages 自动部署的 job 已写好但注释着。

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
