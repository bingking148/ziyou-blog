---
title: '这个博客用了哪些服务，一年花多少钱'
weight: 1
cover: /images/covers/how-this-blog-is-built-cover.jpg
date: 2026-10-31T16:00:00+08:00
updatedDate: 2026-10-31T16:00:00+08:00
categories: [建站]
tags: [Astro, Cloudflare Pages, 建站, 静态博客]
description: '把整站拆开看：静态站怎么构建、push 之后 Cloudflare Pages 做了什么、评论和阅读数为什么绑在 URL 上、第三方资源为什么要放本地，以及一年总共花多少钱。'
math: false
mermaid: false
comments: true
toc: true
---

这个网站没有自己的服务器。每篇文章是一个 Markdown 文件，放在 GitHub 仓库里；改完 push，Cloudflare Pages 自动构建，两三分钟上线。一年下来唯一要交的钱是域名注册费。

下面按存储、构建、评论、资源四层拆开，最后算一年的开销。下一篇开始写具体操作，从注册 GitHub 账号做起，会打字就能搭出一个一样的。

## 1. 整站的组成

| 部分 | 用的什么 | 开销 |
|---|---|---|
| 存稿、版本管理 | GitHub | 免费 |
| 站点框架 | Astro 5 | 开源 |
| 构建和托管 | Cloudflare Pages | 免费额度内 |
| 评论后端 | Waline，跑在 Vercel | 免费额度内 |
| 域名 | 阿里云注册的 ziyou814.top | 每年几十块 |
| DNS | Cloudflare | 免费 |

域名是这个方案里唯一确定要花钱的地方，而且它跟建站方式没关系，换什么方案都得续费。不想花这笔钱也行：Cloudflare 会给一个 `xxx.pages.dev` 的免费子域名，功能一样，只是地址不像是自己的。

## 2. 静态站，和为什么选 Astro

静态博客的意思是：文章写成 Markdown，构建时整站生成一堆 HTML 文件，没有数据库，也没有常驻的后端进程，服务器上不需要装东西、打补丁。文件生成好之后放哪都能跑，也就不存在「服务器挂了」「数据库连不上」这类故障。

框架选 Astro，主要看中三点。

第一是内容集合。我在配置里定义了文章头部允许有哪些字段、分别是什么格式，标题漏写、日期写成 `2026/10/31` 而不是 ISO 格式，构建直接失败，报错精确到文件和行号。文章越多这一条越好用，格式错误不会留到线上才被读者发现。

第二是默认不往页面里塞 JavaScript。博客绝大多数页面就是文字，Astro 构建出来是 HTML 加一点必要脚本，不会有运行时框架跟着每篇文章一起下载。

第三是常用功能都有现成方案。RSS、sitemap、站内搜索、数学公式、代码高亮，装上就能用。

## 3. push 之后发生了什么

我在 Cloudflare Pages 后台把 GitHub 仓库连上，填了一条构建命令。之后每次 push，它会拉代码、装依赖、跑构建、把产物分发到全球节点，中间不需要我点任何东西。

构建日志里能看到它实际执行的命令：

```
Detected the following tools from environment: nodejs@22.23.4
Executing user command: cd astro && npm ci && npm run build
```

第一行是自动识别出的 Node 版本，第二行是我填的：进入站点目录，按 `package-lock.json` 干净地装一遍依赖，再构建全站。上一次构建生成 90 个页面，用时 24 秒，加上排队和分发，从 push 到线上大概两三分钟。

写这篇文章当天，我改构建命令时目录写错了，`npm ci` 找不到依赖清单，构建当场失败：

```
npm error The 'npm ci' command can only install with an
existing package-lock.json
```

好处是失败止步于构建，线上还是上一个能用的版本。把目录改回来点重试，一次就过了。配置写坏最坏的结果也就是新文章没更新上去，网站不会因此打不开。

回滚也简单，后台保留每一次部署的记录，哪次改动有问题，找到上一个正常版本点一下，几十秒恢复。

## 4. 评论和阅读数都绑在 URL 上

评论用 Waline。它需要一个常驻的后端接口，我把服务端部署在 Vercel 的免费额度上，评论数据存在自己配的存储里，不经过第三方评论平台。阅读数用不蒜子，同样按页面地址计数。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-url-is-the-key" viewBox="0 0 680 400" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>页面从 Cloudflare Pages 来，评论和阅读数都用同一条带尾斜杠的 URL 当钥匙</title>
  <style>
    .diag-url-is-the-key { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-url-is-the-key { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M30,40.4 Q90.3,39.8 150,40.1 Q160.2,40 160.6,50 Q160.8,75.5 159.3,100 Q159.9,110.1 150,110.3 Q89.6,110.5 30,110.1 Q19.7,110.2 20.8,100 Q19.8,74.7 21,50 Q20.3,39.9 30,40.4 Z" fill="var(--fill-gray)" stroke="var(--gray)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="90" y="64.4" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">GitHub</text><text x="90" y="85.6" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">仓库</text>
  <line x1="160" y1="75" x2="192" y2="75" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M200,75 L192,71.8 L192,78.2 Z" fill="currentColor"/>
  <path d="M210,29.2 Q299.7,30.5 390,29.2 Q399.6,30.3 399.4,40 Q400.7,74.5 399.5,110 Q400.2,120.4 390,120.1 Q299.8,119.1 210,120.7 Q200.1,120.2 199.1,110 Q199.8,74.5 200.6,40 Q200.1,29.9 210,29.2 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="300" y="47.3" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">Cloudflare Pages</text><text x="300" y="65.8" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">拉代码</text><text x="300" y="84.2" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">npm ci &amp;&amp; npm run build</text><text x="300" y="102.7" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">分发</text>
  <line x1="400" y1="75" x2="432" y2="75" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M440,75 L432,71.8 L432,78.2 Z" fill="currentColor"/>
  <path d="M450,39 Q549.8,39.8 650,39.9 Q660.3,39.7 660.9,50 Q659.3,74.7 659.8,100 Q660.3,110.1 650,109 Q550,109.8 450,110.5 Q439.6,109.7 440,100 Q440.8,74.7 440.4,50 Q439.8,40.2 450,39 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="550" y="75" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">浏览器打开</text>
  <path d="M90,159 Q340.1,160.3 590,159.2 Q600.3,160.1 600.2,170 Q601,194.4 599.6,220 Q599.7,229.6 590,230.4 Q340.2,230.9 90,230.6 Q79.7,229.8 80.1,220 Q81,194.8 80,170 Q79.7,159.8 90,159 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="340" y="184.4" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">https://ziyou814.top/post/&lt;slug&gt;/</text><text x="340" y="205.6" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">结尾带斜杠</text>
  <line x1="550" y1="110" x2="347.8" y2="158.1" stroke="var(--purple)" stroke-width="1.7" stroke-linecap="round"/><path d="M340,160 L348.5,161.3 L347,155 Z" fill="var(--purple)"/>
  <text x="600" y="140" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--purple)">同一条 URL</text>
  <line x1="240" y1="230" x2="186.7" y2="265.6" stroke="var(--green)" stroke-width="1.7" stroke-linecap="round"/><path d="M180,270 L188.4,268.2 L184.9,262.9 Z" fill="var(--green)"/>
  <path d="M50,269.7 Q169.6,269.8 290,270.3 Q299.8,269.9 300.3,280 Q300.1,309.8 299.9,340 Q299.9,350.3 290,349.6 Q169.4,350.4 50,350.7 Q40.4,350.2 39.2,340 Q39.7,309.8 40.7,280 Q40,270.3 50,269.7 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="170" y="290.2" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">Waline 评论</text><text x="170" y="310" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">服务在 Vercel</text><text x="170" y="329.8" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">数据在自己配的存储</text>
  <line x1="440" y1="230" x2="493.3" y2="265.6" stroke="var(--teal)" stroke-width="1.7" stroke-linecap="round"/><path d="M500,270 L495.1,262.9 L491.6,268.2 Z" fill="var(--teal)"/>
  <path d="M390,279.3 Q500.5,279.1 610,281 Q620.4,279.9 620.9,290 Q619.5,310.4 619.9,330 Q619.8,340.3 610,340.7 Q499.6,339.4 390,339 Q380.4,340 379.6,330 Q380.4,310.2 379.9,290 Q380.1,280.4 390,279.3 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="500" y="299.4" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">阅读数</text><text x="500" y="320.6" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">不蒜子</text>
</svg>
</figure>


这两个服务认的都是文章的 URL，地址一改，旧评论和阅读数就对不上了。所以本站在第一天就把地址规则固定下来：每篇文章是 `/post/slug/`，结尾带斜杠。中间从 Hugo 换到 Astro，地址规则原样保留，评论和计数一条没丢。

## 5. 第三方资源全部放在本地

静态站会碰到的一个现实问题：很多博客的字体、图标、公式渲染脚本是从公共 CDN 拉的。这在国内是隐患，我遇到过：有一阵子文章里的数学公式加载不出来，页面上全是乱码，查下来是那个 CDN 在本地网络里不可达。

之后我定了条规矩，所有第三方 JS、CSS、字体都下载进仓库，构建时跟着站点一起发布。浏览器只访问我自己的域名，不向任何公共 CDN 发请求。代价是仓库大了几 MB，换来的是在哪打开、渲染结果都一样。

Cloudflare 在国内的速度看线路，时快时慢，这一点没法美化。不过页面本身轻、资源都在自己的域名下，日常打开没有明显问题。

## 6. 一年的开销

| 项目 | 费用 |
|---|---|
| 域名（一年） | 几十块 |
| GitHub 托管 | 0 |
| Cloudflare Pages 构建和流量 | 0 |
| Vercel 评论后端 | 0 |

免费额度有多宽裕，可以看看实际用量：最近五天这个站部署了八次，页面九十多个，文章二十来篇，离额度上限还差得远。个人博客的量级，本来就在免费额度的覆盖范围内。

## 7. 下一篇

整套东西拆开，每一步单独看都不复杂，麻烦的是顺序：先注册哪个账号、仓库怎么建、构建命令填什么、域名在哪一步解析、评论什么时候接，中间有先后依赖。

下一篇从注册 GitHub 开始，目标是十分钟后你能用一个免费子域名打开自己的站。域名绑定和评论放到后面几篇。哪一步卡住了，可以直接在评论区问。
