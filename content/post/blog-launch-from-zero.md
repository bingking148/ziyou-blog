---
title: '从零到上线：十分钟拿到自己的博客地址'
cover: /images/covers/blog-launch-from-zero-cover.jpg
weight: 2
date: 2026-10-31T16:30:00+08:00
lastmod: 2026-10-31T16:30:00+08:00
categories: [建站]
tags: [GitHub, Cloudflare Pages, 建站, 新手教程]
description: '从注册 GitHub 账号开始，装好 Node，用官方模板生成一个博客，push 到仓库，再连上 Cloudflare Pages，最后拿到一个免费的 xxx.pages.dev 地址。每一步都写清了点哪里、填什么、失败了怎么查。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇把整套架构摊开讲了：GitHub 存文件，Cloudflare Pages 负责构建和托管，push 一次更新一次。这一篇开始动手，目标很具体——**用一个免费子域名打开你自己的站**。

全程不需要写代码，也不用懂前端。要做的事只有三件：注册两个账号、在终端敲几行命令、在网页后台填两个输入框。

开始之前准备三样东西：

- 一个邮箱，能正常收验证码；
- 一台电脑，装 Git 和 Node.js（第 3 节给下载地址）；
- 二十分钟不被打断的时间。

域名绑定和评论不在这篇里，先把站跑起来，剩下的后面几篇接着写。

## 1. 注册 GitHub

GitHub 是存代码的地方，也是整条流水线的起点。Cloudflare 需要从一个仓库里读文件，所以这个账号绕不开。

打开 <https://github.com>，点 Sign up，依次填邮箱、密码、用户名。用户名会出现在你的仓库地址里（`github.com/用户名/...`），取一个正式点的，以后贴出来不尴尬。

注册过程中会引导你开启两步验证。用手机装一个验证器 App（Microsoft Authenticator、Google Authenticator 都行），扫一下页面上的二维码，存下几组恢复码，一两分钟的事。GitHub 现在对提交代码的账号强制要求这个，躲不开，早点开完省心。

## 2. 建一个空仓库

仓库（repository）就是一个能记录每次修改的文件夹。

浏览器直接访问 <https://github.com/new>，或者登录后在右上角点 **+** → **New repository**。填三个地方：

| 字段 | 填什么 |
|---|---|
| Repository name | `my-blog`（名字随便取，会成为默认的项目名） |
| 可见性 | 选 **Public** |
| Initialize this repository with | **什么都不要勾** |

最后一行的 README、.gitignore、License 三个选项全部留空。本地马上就会生成这些文件，仓库里先有内容的话，第一次推送会撞上「远程有本地没有的提交」，多一道要处理的麻烦。

点 Create repository，页面会停在一个满是命令行的说明页上——先别管它，第 6 节回来照着敲。

## 3. 装好 Node.js

Node.js 是让 Astro 这个构建工具跑起来的运行环境。文章是你写的 Markdown，Node 负责把它们变成浏览器能显示的 HTML。

去 <https://nodejs.org> 下载 **LTS** 版本，Windows 上是一个 `.msi` 安装包，双击一路下一步，不需要改任何选项。macOS 用 `pkg` 安装包，同样一路默认。

装完后打开终端验证。Windows 按 `Win + R`，输入 `powershell` 回车；macOS 在启动台搜「终端」。

```bash
node -v
npm -v
```

两条命令各打印一个版本号就说明装好了，比如：

```
v24.12.0
11.x.x
```

只要第一行是 22 以上就行。这篇文章写作时，Astro 官方模板在 `package.json` 里写的最低要求是 `>=22.23.4`，低于这个版本，后面 `npm run dev` 会直接报错退出。装了旧版本的话，回官网下载新的覆盖安装一遍即可。

## 4. 生成一个博客

官方有一个现成的博客模板，包含首页、文章列表、文章详情、RSS 和 sitemap。先用它把整条流程走通，样式以后再改。第一次建站真正麻烦的地方从来不是页面丑，而是中途报错却看不出是哪一步出的问题。

在终端里进到你放项目的目录（比如 `D:\code`），执行：

```bash
npm create astro@latest my-blog -- --template blog
```

`my-blog` 是新项目的文件夹名，`--template blog` 指定用官方博客模板。

命令会依次问几个问题：要不要安装依赖、要不要初始化 Git 仓库、要不要装 TypeScript 严格模式。全部选 yes 也没关系，选 no 也不会影响后面的步骤——手动补同样快。

国内的网络下载 npm 包常常很慢，卡在 `npm install` 上超过两三分钟的话，先换镜像源再重来：

```bash
npm config set registry https://registry.npmmirror.com
```

这条命令改的是全局配置，以后所有项目都走这个源，只改一次。

模板拉下来之后，进目录、装依赖、启动本地预览：

```bash
cd my-blog
npm install
npm run dev
```

最后一条会打印一行地址：

```
┃ Local    http://localhost:4321/
```

浏览器打开这个地址，能看到模板自带的示例博客，就说明从 Node、npm 到 Astro 这整条工具链是通的。

顺手把生产构建也跑一次，确认它能正常生成文件：

```bash
npm run build
```

正常的话结尾是这样：

```
[build] 8 page(s) built in 1.28s
[build] Complete!
```

这行 `8 page(s)` 就是你要发布出去的东西。构建产物全部在 `dist/` 目录里，`dist/index.html` 是首页——这个目录名待会儿在 Cloudflare 后台要填。

### 目录长什么样

只列你之后会碰到的：

```
my-blog/
├── public/                 # 图片、图标等原样发布的文件
├── src/
│   ├── content/blog/       # 文章，一篇一个 .md 文件
│   ├── layouts/            # 页面骨架
│   ├── pages/              # 路由，文件路径就是网址
│   ├── consts.ts           # 站名、站点描述
│   └── content.config.ts   # frontmatter 的校验规则
├── astro.config.mjs        # 站点地址等全局配置
└── package.json            # 依赖清单和命令
```

## 5. 改成你自己的

模板里现在都是作者的示例内容。改三个地方，它就变成你的站。

### 5.1 站名和描述

打开 `src/consts.ts`：

```ts
export const SITE_TITLE = 'Astro Blog';
export const SITE_DESCRIPTION = 'Welcome to my website!';
```

换成你自己的。这两个值会出现在浏览器标签页、首页大标题和部分搜索引擎结果里。

### 5.2 站点地址

打开 `astro.config.mjs`，第一行配置就是：

```js
site: 'https://example.com',
```

这里填你将来站点的完整地址。现在还没有域名，先按第 7 节的规则猜一个：Cloudflare 默认用仓库名当项目名，所以大概率是 `https://my-blog.pages.dev`。猜错了也不要紧，上线后看到真实地址，回来改这一行就行。

这个值不是装饰，RSS 和 sitemap 里的链接都是拿它拼的，填错了读者订阅到的地址就是错的。

### 5.3 删示例文章，写第一篇

`src/content/blog/` 下有五个模板自带的文件，全部删掉。新建一个 `hello.md`：

```markdown
---
title: '第一篇'
description: '这是我的第一篇文章'
pubDate: '2026-10-31'
---

今天我把博客搭起来了。
```

三个字段各管一件事：`title` 是文章标题，`description` 会出现在首页列表和搜索结果里，`pubDate` 是发布时间。模板的校验规则写在 `src/content.config.ts`，这几个字段缺一个，构建就会失败并指出是哪个文件的哪一行——这是内容集合最实用的地方，格式错误在本地就暴露，不会等到线上才发现。

`pubDate` 写成 `2026-10-31` 这样的字符串也能通过，因为规则里用的是 `z.coerce.date()`，常见日期格式都收。但建议统一按 `YYYY-MM-DD` 写，混着写迟早看错。

改完保存，本地预览会自动刷新。看到自己的标题出现在首页，这一步就成了。

## 6. 推到 GitHub

回到终端，在 `my-blog` 目录下依次执行五条命令：

```bash
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/你的用户名/my-blog.git
git push -u origin main
```

第三行把分支名固定成 `main`，第四行把本地目录和刚才建的远程仓库连起来——`你的用户名` 换成第 1 节注册的那个。

第一次推送会弹一个浏览器窗口让你登录 GitHub，点授权即可。如果弹出的不是浏览器，而是在终端里问你要用户名和密码，**别输账号密码**，GitHub 从 2021 年就停用了密码推送，输多少次都是这个结果：

```
remote: Support for password authentication was removed on August 13, 2021.
```

正确做法二选一：

- 装 [GitHub Desktop](https://desktop.github.com/)，在里面登录一次账号，凭证会自动存好，之后终端里的推送直接放行。对第一次用 Git 的人来说这个最省事。
- 或者用 GitHub 官方的命令行工具 `gh`，装完执行 `gh auth login`，选 GitHub.com、选 HTTPS、浏览器授权。

推送成功后刷新仓库页面，能看到 `src`、`public`、`package.json` 这些文件躺在里面。

### 顺手检查一下 .gitignore

模板自带的 `.gitignore` 里已经忽略了两个目录：

```
dist/
node_modules/
```

第一个是构建产物，每次构建重新生成，不该进仓库；第二个是依赖，`npm install` 会自己按 `package.json` 装回来，进仓库会让体积暴涨十倍以上。这两条要是被误删了，推送会卡很久甚至失败，所以第一次推之前看一眼。

## 7. 连上 Cloudflare Pages

打开 <https://dash.cloudflare.com> 注册。用邮箱注册即可，不需要信用卡，也不用绑支付方式。

登录后按这个顺序点：

1. 左侧菜单 **Workers & Pages**；
2. **Create application**；
3. 上方切到 **Pages** 标签；
4. **Connect to Git**。

第一次会要求授权 GitHub，点授权、选只给你自己这个仓库的权限即可。然后在列表里选中 `my-blog`，点 **Begin setup**。

### 构建配置

这是整篇最关键的一张表，照填：

| 字段 | 填什么 |
|---|---|
| Project name | `my-blog`（决定免费子域名） |
| Production branch | `main` |
| Framework preset | **Astro** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | 留空 |

选了 **Astro** 预设之后，中间两行会自动填好，对着表检查一遍就行。`dist` 就是第 4 节 `npm run build` 生成的那个目录。

Root directory 留空，是因为仓库根目录就是项目根目录。我自己的站这里填的是 `astro`——那个仓库里同时留着旧版 Hugo 站，站点在子目录里。你从零开始建，不会遇到这种情况。

### 加一个环境变量

往下找到 **Environment variables**，加一条：

| Variable name | Value |
|---|---|
| `NODE_VERSION` | `22` |

Cloudflare 默认的 Node 版本不一定满足 Astro 的要求。不设这一条，第一次构建有可能直接失败，日志里写着 Node 版本不受支持。设成 `22` 表示取最新的 22.x，正好覆盖第 3 节的版本下限。

### 部署

点 **Save and Deploy**。页面会跳到构建日志，实时刷出它在做什么：拉代码、识别出 Node 版本、装依赖、执行 `npm run build`、上传产物。

我用官方的博客模板从零跑过一遍，日志里关键的两行是：

```
Detected the following tools from environment: nodejs@22.23.4
Executing user command: npm run build
```

构建完成，页面顶部会出现一个 `https://my-blog.pages.dev` 的地址——点开它，你的站就在互联网上了。

这个地址可以随便发给别人，国内、国外都能打开。

## 8. 以后怎么更新

站上线之后，写文章就是「改文件、推代码」两步。本地在 `src/content/blog/` 新建一个 `.md`，写完执行三条命令：

```bash
git add .
git commit -m "新增一篇文章"
git push
```

Cloudflare 监测到 `main` 分支有新提交，自动重新构建，两三分钟上线，中间的步骤全自动。

如果哪天想改样式或者调结构，可以先新建一个分支推上去，Pages 会给每个分支和一个 PR 单独生成预览地址，确认没问题再合并到 `main`。这样线上始终是稳定版本，折腾坏了也只是预览地址打不开。

免费额度够不够用，看数字：

| 项目 | 免费额度 | 你的用量 |
|---|---|---|
| 每月构建次数 | 500 次 | 一天更新三篇也就 90 次 |
| 同时构建 | 1 个 | 个人站不会排队 |
| 带宽与请求数 | 不限 | — |
| 每个站文件数 | 20000 个 | 几百个 |

个人博客的量级离上限很远。

## 9. 卡住了先查这几条

按第一次部署时出现的先后排，越靠前越常见：

| 现象 | 原因 | 处理 |
|---|---|---|
| 构建失败，线上还能打开 | 正常的：失败的部署不会替换线上版本 | 看构建日志的最后二十行，改完点 Retry |
| 日志里 `npm ERR!` 说找不到 `package.json` | Root directory 填错了 | 项目在仓库根目录就留空 |
| 直接 404 | Build output directory 不是 `dist` | 改成 `dist`，它必须正好是 `index.html` 所在的目录 |
| 报 Node 版本不受支持 | 没设 `NODE_VERSION` | 加上环境变量后重新部署 |
| 推送时报权限错误 | 用了账号密码验证 | 装 GitHub Desktop 登录，或 `gh auth login` |
| push 了但 Pages 没反应 | 推到了别的分支 | 确认推的是 `main` 分支 |
| 页面出来了，但没有样式 | `site` 配错导致资源路径异常 | 把 `astro.config.mjs` 里的 `site` 改成真实地址 |

还有一条值得单独说：**构建失败不代表网站挂了**。Cloudflare 会保留上一次成功的部署，线上照常访问，所以偶尔看到「新文章没更新上去」时，八成是构建报错，去日志里找原因就行，不用慌。

## 10. 下一篇

到这里，你已经有一个能打开、能更新、完全免费的站了。地址是 `xxx.pages.dev`，功能齐全，唯一的缺点是不像自己的东西。

下一篇绑定自己的域名：在哪里买、DNS 服务器怎么换到 Cloudflare、加哪一条记录、证书什么时候下发，以及 `www.` 开头和不带 `www.` 的两个地址为什么要统一成其中一个。

哪一步过不去，把构建日志贴到评论区，我帮你看。
