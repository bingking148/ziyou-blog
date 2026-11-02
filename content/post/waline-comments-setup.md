---
title: '接上评论区：Waline 从部署到第一个留言'
cover: /images/covers/waline-comments-setup-cover.jpg
weight: 4
date: 2026-11-01T10:30:00+08:00
lastmod: 2026-11-01T10:30:00+08:00
categories: [建站]
tags: [Waline, Vercel, LeanCloud, 评论系统, 建站]
description: '静态博客没有后端，评论得单独找一个。LeanCloud 存数据，Vercel 跑服务，挂到自己的 comment 子域名上，再把评论框接进文章页，最后进后台认领管理员。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇结束时站有了域名，但它只能读。读者想指出一个错别字，除了发邮件没别的办法。

静态博客没有后端进程，评论要单独挂一个服务。这篇用 Waline 3.x（服务端 `@waline/vercel` 1.43，客户端 `@waline/client` 3.16）：评论存在 LeanCloud，服务部署在 Vercel，前端是文章页里的一小段脚本。三样都在免费额度内，个人博客用不到上限。

这篇的配置项比前三篇加起来还多，建议一次做完。中间停下来第二天再接着，多半会忘了哪个密钥填到了哪里。

## 1. 三块拼起来

| 部分 | 干什么 | 放哪 |
|---|---|---|
| 数据存储 | 存评论、用户、阅读数 | LeanCloud 开发版 |
| 服务端 | 收发评论、校验、发通知 | Vercel |
| 前端 | 在文章页渲染评论框 | 你的 Astro 站点 |

服务端用 LeanCloud 的三个密钥读写数据，前端用服务端地址提交评论。任何一处接错，表现都是评论框转圈或者提交失败。

### 为什么不用 Giscus

Giscus 把评论存在 GitHub Discussions 里，不用数据库，配置也少。代价是读者必须用 GitHub 账号登录。看技术博客的人有这个账号的比例不低，但也不是人人都有，想留句话先得注册一个账号，多数人就直接不说了。

Twikoo 也是部署在 Vercel，比 Waline 轻一点，但没有独立的管理后台，评论多了只能在前端一页页翻。

Waline 允许游客直接留言，登录可选。后台能看全部评论、回复、删除、标记垃圾，还能按文章过滤。多配一个数据库换这些，值。

## 2. 建一个 LeanCloud 应用

打开 <https://console.leancloud.app/> 注册国际版。LeanCloud 从 2019 年起国内外分成两套独立账号，国际版在 `leancloud.app`，国内版在 `leancloud.cn`。国内版按监管要求必须绑定已备案的域名，你的站托管在境外、没有备案，走国内版会在这一步停住。

注册完点创建应用，名字随意，类型选开发版。

开发版的额度足够存评论。有一点要知道：连续 30 天没有 API 请求的开发版应用会被自动归档，归档后存储不可用。可以去后台手动恢复，数据不会丢。博客只要还有人访问就碰不到这条。

### 三个密钥和服务器地址

进应用，点 **设置 → 应用凭证**，页面上的值里要记三个：

| 页面上叫 | 环境变量名 |
|---|---|
| AppID | `LEAN_ID` |
| AppKey | `LEAN_KEY` |
| MasterKey | `LEAN_MASTER_KEY` |

同一页还有 **服务器地址**（REST API 服务器）。国内版这一项是你自己绑定的域名，必须填进 `LEAN_SERVER`；国际版不填也能连，填上更稳，以后换环境不会连错节点。格式形如：

```
https://xxxxxxxx.api.lncldglobal.com
```

国际版是 `lncldglobal.com` 结尾，国内版是 `lncld.net`。看到后缀不对，说明账号建错了地方。

MasterKey 权限最高，拿到它等于把数据库交给别人。它只放在 Vercel 的环境变量里，不要写进前端，也不要提交到仓库。

## 3. 部署服务端

用官方的一键部署，别自己 fork 主仓库再部署。主仓库有完整源码，构建时的目录不对，会直接失败。

```
https://vercel.com/new/clone?repository-url=https://github.com/walinejs/waline/tree/main/example
```

登录 Vercel（用 GitHub 账号最快），填个仓库名，比如 `my-waline`，点 Create。它会在你的 GitHub 下建一个只含 `example/` 目录的仓库，然后开始构建。

一两分钟结束，拿到一个 `my-waline-xxxx.vercel.app` 的地址。

### 填环境变量

进项目 **Settings → Environment Variables**，加这四条：

| Name | Value |
|---|---|
| `LEAN_ID` | AppID |
| `LEAN_KEY` | AppKey |
| `LEAN_MASTER_KEY` | MasterKey |
| `LEAN_SERVER` | `https://xxxxxxxx.api.lncldglobal.com` |

Environment 选 Production 就够。

加完要到 **Deployments** 里点最新那条右侧的三个点，选 **Redeploy**。环境变量只在构建时注入，不重新部署，服务端读到的还是空值，接口一律 500。这一步漏掉的人不少。

再加两条可选的，邮件通知和评论 RSS 会用到：

| Name | Value |
|---|---|
| `SITE_NAME` | 你的站名 |
| `SITE_URL` | `https://yourname.com` |

### 验证服务端

打开 `https://my-waline-xxxx.vercel.app`。这个首页是服务端自带的示例页，下面就是一个能用的评论框。控制台里能看到 `@waline/server v1.43.4` 的日志，评论框能加载出来，说明服务和数据库都通了。

后台在 `/ui`，第一次要先注册：

```
https://my-waline-xxxx.vercel.app/ui/register
```

第一个注册的账号自动成为管理员，之后所有管理操作都用它。管理界面是另外打包的前端资源，默认从 unpkg 加载，第一次打开慢几秒是正常的。

页面空白或者接口全部 500，回 Settings 看那四条变量，先检查 `LEAN_SERVER` 有没有漏。

## 4. 给评论服务绑域名

`*.vercel.app` 在国内访问时好时坏。评论服务打不开，文章页的评论框就一直转圈，读者以为你的站坏了。

Vercel 项目 **Settings → Domains**，输入 `comment.你的域名.com`，点 Add。Vercel 会提示配一条 CNAME，指向 `cname.vercel-dns.com`。

回 Cloudflare 的 **DNS → Records** 加记录：

| 类型 | 名称 | 内容 | 代理状态 |
|---|---|---|---|
| CNAME | `comment` | `cname.vercel-dns.com` | 仅 DNS（灰色云朵） |

这里的代理要关掉。开着橙色云朵也能用，但 Cloudflare 到 Vercel 那一段必须是 Full (strict) 加密，不然两边互相重定向，或者直接报 525。评论的流量很小，套不套 CDN 没区别，灰色云朵直接透传省事。

几分钟后回 Vercel 的 Domains，域名变成 Valid 就能用了。打开 `https://comment.你的域名.com/ui` 确认一下。

## 5. 接进文章页

在项目目录装客户端：

```bash
npm install @waline/client
```

装它是为了拿到两个文件。把 `node_modules/@waline/client/dist/` 下的 `waline.css` 和 `waline.mjs` 复制到 `public/`，之后浏览器从你自己的域名加载，不经过公共 CDN。第一篇里说 CDN 在国内时好时坏，评论框加载失败的状况你多半看不到——你自己浏览器里有缓存，别人打开就是空的。

复制完 `@waline/client` 可以从 `package.json` 里删掉，留着也行，以后升级时方便比对版本。

然后在 `src/components/` 下新建 `Comments.astro`：

```astro
---
const { serverURL = 'https://comment.你的域名.com' } = Astro.props;
---

<link rel="stylesheet" href="/waline.css" />
<div id="waline"></div>

<script type="module" define:vars={{ serverURL }}>
  import { init } from '/waline.mjs';

  init({
    el: '#waline',
    serverURL,
    path: window.location.pathname,
    lang: 'zh-CN',
    dark: 'auto',
    meta: ['nick', 'mail', 'link'],
    requiredMeta: ['nick'],
    pageSize: 10,
    pageview: true,
  });
</script>
```

`path` 是这条评论属于哪个页面。默认取当前路径，别改，改了这一页以前的评论就找不回来了。

`meta` 是读者能填的资料，`link` 是个人主页，不填也正常。`requiredMeta` 只要求昵称，其余留空能发。

`pageview` 顺带统计阅读数，后台看得到。

### 放进模板

打开 `src/pages/blog/[...slug].astro`，模板自带的路径可能不同。在渲染正文的地方下面加：

```astro
---
import Comments from '../../components/Comments.astro';
---

<article>...</article>
<Comments />
```

`npm run dev`，打开任意一篇文章拉到最底下，评论框应该在。

站里如果用了 Astro 的视图过渡（`<ClientRouter />`），换页时评论框会停在上一篇的状态。脚本里加一段销毁重建：

```js
let instance = null;

function mount() {
  instance?.destroy();
  instance = init({ /* 参数同上 */ });
}

document.addEventListener('astro:page-load', mount);
```

## 6. 后台

打开 `https://comment.你的域名.com/ui`，用第 3 节注册的账号登录。

新评论默认是待审核，只有你能看见。Vercel 环境变量里加一条 `COMMENT_AUDIT`，值随便写，比如 `true`，审核就打开；删掉这条变量就是直接显示。先开着，有人留言了再决定要不要关。

每条评论下面有回复和删除。删除是软删除，数据还在，能恢复。

想调颜色，改 CSS 变量就行：

```css
#waline {
  --waline-theme-color: var(--red-1);
  --waline-bg-color: transparent;
}
```

邮件通知要单独配。SMTP 的几个变量（`SMTP_SERVICE`、`SMTP_USER`、`SMTP_PASS`、`AUTHOR_EMAIL`）填进 Vercel，用哪个邮箱服务就在环境变量里写对应名字，官方文档有支持的列表。

## 7. 卡住的时候

| 现象 | 原因 | 处理 |
|---|---|---|
| 评论框不显示 | 组件没引入，或者脚本报错 | 控制台看有没有 404 和 JS 报错 |
| 提交后接口 500 | 环境变量没生效 | 改完变量有没有 Redeploy |
| 提交后一直转圈 | `*.vercel.app` 在国内不通 | 按第 4 节绑域名 |
| 换文章评论还在 | `path` 写成了固定值 | 确认是 `window.location.pathname` |
| 评论发出去看不到 | 开了审核 | 去 `/ui` 里通过 |
| 邮件收不到 | 没配 SMTP | 按第 6 节补变量 |
| 后台一片空白 | 管理界面从 unpkg 加载，被挡了或者超时 | 多刷几次，或按文档指定 `WALINE_ADMIN_MODULE_ASSET_URL` |
| 后台进去是空的 | 登了非管理员账号 | 只有第一个注册的是管理员 |

## 8. 最后检查

- [ ] LeanCloud 是国际版，四条环境变量都填了，改完重新部署过
- [ ] 打开评论服务首页，评论框能加载
- [ ] `comment.你的域名.com` 在 Cloudflare 是灰色云朵，Vercel 显示 Valid
- [ ] 注册了管理员账号，能进 `/ui`
- [ ] 文章页有评论框，发一条能成功（开了审核记得去后台通过）
- [ ] 换一篇文章，评论是空的，说明 `path` 生效
- [ ] 用线上地址再发一条，评论同样出现

## 9. 专栏到这里

四篇走完，域名是自己的，push 之后自动发布，读者能留言。一年支出是一笔域名续费。

后面能做的还有不少：换主题、加阅读数和目录、让搜索引擎收到站点。这些各自都是独立话题，本站其他专栏里零散写过一点，但不会再串成一条线。

评论服务平时不用管，只有两件事值得记着。LeanCloud 开发版连续 30 天没有请求会归档，博客有人看就不会碰到，真碰到了去后台恢复。Vercel 免费账号长期不登录会收到提醒，长期不活动的项目会被暂停，服务本身照常响应，只是新提交不再自动构建，一年上去点一次就够。
