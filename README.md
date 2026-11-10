# ZIYOU

个人博客，站名 ZIYOU（关于页印「自由」）。线上：<https://ziyou814.top/>（Cloudflare 默认域名 <https://ziyou-blog.pages.dev> 同样可开）。简介是「在键盘上写下又一行注释」。

Personal blog. The live site is the Astro app in `astro/`; an older Hugo tree is still in the repo as a frozen rollback.

## 现在用什么

线上版本是 `astro/` 里的 **Astro 5** 站点（2026-10-31 切站）。仓库根目录的 Hugo（`hugo.toml`、`content/`、`layouts/`、`themes/reimu/`、`static/`、`config/`）已经下线，源码留着作回滚备份，不再改功能。

还在的标签：

| 标签 | 含义 |
| --- | --- |
| `v1.0` | 切站前最后一版线上 Hugo |
| `v2.0` | Astro 上线后、首页开屏改版之前的 main |
| `v2.1` | 首页开屏（PR #2） |

`v2.1` 之后的 main 还有手机/平板、性能和不蒜子计数的修复，没有新标签。

## 本地开发

需要 Node.js 20 及以上。GitHub Actions 和 Cloudflare Pages 用的是 **22**。命令都在 `astro/` 下执行：

```bash
cd astro
npm ci              # 首次；日常也可用 npm install
npm run dev         # http://localhost:4321 （astro dev --host）
npm run build       # 生产构建，产物在 astro/dist/
npm run preview     # 预览 dist
```

`npm run dev` 和 `npm run build` 之前会自动跑 `predev` / `prebuild`：用 sharp 扫描 `astro/public/images/`，把 WebP 多宽版本写到 `astro/public/images/optimized/`，并生成 `astro/src/generated/images.json`。这两处在 `astro/.gitignore` 里，不入库。原图不覆盖。

可选：

```bash
cd astro && npm run test:ui     # Playwright。首次先 npx playwright install chromium
python -I scripts/verify_build.py astro/dist   # 在仓库根目录，检查构建产物里的站内链接
```

## 加内容

线上只读 Astro 这份。文章仍约定从 Hugo 侧写入，再用脚本同步，这样冻结备份不会悄悄漂移。

1. 在 `content/post/` 新建 `my-post.md`。frontmatter 用 YAML（不要用 `archetypes/default.md`，那是 Hugo 的 TOML 骨架，和现有文章不一致）：

```yaml
---
title: '标题'
date: 2026-11-10T14:22:18+08:00
lastmod: 2026-11-10T14:22:18+08:00
cover: /images/covers/my-post-cover.jpg
categories: ['某个专栏分类']
tags: ['标签']
description: '摘要，会进搜索和 og:description'
math: false
mermaid: false
comments: true
toc: true
weight: 1          # 仅专栏内篇号，从 1 起；0 会被排到最后
---
```

2. 同步到 Astro（`lastmod` 会改名为 `updatedDate`，其余照搬）：

```bash
python -I scripts/sync_post.py my-post.md    # 不带文件名 = 全部文章
python -I scripts/sync_post.py --reverse     # 只改了 astro/src/content/post/ 时写回
python -I scripts/sync_post.py --check       # 只检查两边是否漂移
```

3. 封面放宽不超过 1600px 的 JPEG，两边各一份（目前这两个目录里的图是同一批文件）：

- `astro/public/images/covers/`（线上用）
- `static/images/covers/`（Hugo 备份用）

路径写成 `/images/covers/文件名.jpg`。首页横幅是 `astro/public/images/hero-bg-{760,1280,1920}.jpg`。

4. 专栏定义在 `astro/src/content/columns/*.md`，`category` 必须和文章 `categories` 里的某一项完全一致。Hugo 侧对应 `content/categories/<名>/_index.md`（`column: true`）。同步脚本不处理专栏，改了要手改两边。

5. 关于、归档、搜索、专栏列表、友链、学习资料是 `astro/src/pages/` 里的页面，不是 markdown。友链数据在 `astro/src/data/friends.ts`（Hugo 旧副本是 `data/friends.yml`）。学习资料正文在 `astro/src/data/udl/`，图在 `astro/public/learning/udl/`。

Astro 目录里的 URL、字体和 CSS 变量约定见 [astro/README.md](astro/README.md)。

## 部署

Cloudflare Pages 项目 `ziyou-blog` 连接本仓库。推送到 `main` 后自动构建，绑定 `ziyou814.top`。构建配置在 Cloudflare 后台，不在仓库里：

- 根目录：`astro`
- 构建命令：`npm ci && npm run build`
- 输出目录：`dist`
- 环境变量：`NODE_VERSION=22`

[`.github/workflows/build.yml`](.github/workflows/build.yml) 只上传构建产物，不负责上线：`site` 是 Astro，`site-hugo-legacy` 是 Hugo 备份。回滚优先用 Pages 的部署历史。

## 目录

```
astro/                 线上站点
content/post/          文章写作入口（与 astro/src/content/post/ 双写）
scripts/sync_post.py   两边文章同步
scripts/verify_build.py
static/                Hugo 静态文件（封面、字体、头像、二维码）
config/ layouts/ themes/reimu/ hugo.toml
                       冻结的 Hugo 站
tools/udl2web/         把本地 PDF 转成学习资料的脚本，不参与站点构建
docs/superpowers/specs/  设计备忘
```
