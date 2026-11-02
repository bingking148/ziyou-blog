---
title: '绑定自己的域名：从 xxx.pages.dev 到你的名字'
cover: /images/covers/custom-domain-setup-cover.jpg
weight: 3
date: 2026-11-01T10:00:00+08:00
lastmod: 2026-11-01T10:00:00+08:00
categories: [建站]
tags: [域名, Cloudflare, DNS, 建站, 新手教程]
description: '上一篇拿到的是 xxx.pages.dev，这一篇换成自己的域名。在哪买、续费价怎么看、DNS 怎么交给 Cloudflare、Pages 里加哪条记录、证书什么时候下发，以及 www 和不带 www 的两个地址怎么合成一个。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇结束时，站跑在 `my-blog.pages.dev` 上。能打开，push 之后能更新，只是地址不像自己的，也不适合抄给别人。

这一篇换成自己的域名。顺序是买域名、把 DNS 交给 Cloudflare、在 Pages 里认领、等证书下发、处理 www。每一步都依赖上一步，跳过去会在后面的界面上卡住。

## 1. 这笔钱花在哪

pages.dev 给的子域名功能上不缺什么，能访问，有 HTTPS，也能绑定自己的目录结构。它缺的是好念。

`my-blog.pages.dev` 这种地址，别人听完要重复一遍才敢敲。域名可以短到三四个字母加后缀，说一次就记住。

另一个原因更实际：子域名是 Cloudflare 分配的，项目一改名地址就跟着变，以后想把站挪到别家托管也带不走。域名在你手上，解析指到哪，站就在哪。第一篇说「域名是唯一确定要花钱的地方」，买的就是这一点。

搜索引擎对独立域名会稍微客气一些，但这部分收益很小，当不了理由。

一年几十块，第一篇算过账，这是整套方案里唯一跑不掉的支出。

## 2. 挑一个域名

### 后缀

| 后缀 | 大致年费 | 适合 |
|---|---|---|
| `.com` | 七八十 | 通用，认知度最高，能注册到就别犹豫 |
| `.top` `.xyz` `.site` | 首年几块到几十，续费二三十 | 预算优先，本站用的就是 `.top` |
| `.me` `.dev` `.app` | 一百上下 | 个人色彩强，`.dev`、`.app` 强制 HTTPS |
| `.cn` | 三四十 | 国内业务，注册审核更严 |

表里的价格都是大概数，而且首年价和续费价差得远。注册页上大大的「9 元」是首年，续费价写在小字里，有时候差十倍。翻到续费价再决定，那才是以后每年要付的钱。

### 名字

几条经验：

- 短。三个音节以内，别人不用问怎么拼。
- 全小写，不加连字符。`my-blog` 说出去会被听成 `myblog`，又得解释一遍。
- 避开 `l` 和 `1`、`0` 和 `o`、`rn` 和 `m` 这种组合。
- 带上你的 ID 或常用笔名，以后换方向不用换域名。

### 在哪买

国内注册商（阿里云、腾讯云）流程最短，支付宝付款，中文界面，注册完按提示做实名认证，一般当天通过。国外注册商（Cloudflare Registrar、Namecheap、Porkbun）价格透明一些，续费不会突然翻倍，但要有外币卡，界面全是英文。

买哪边都行，和后面托管在哪没关系。

### 关于备案

备案这件事传得比实际复杂。规则只有一条：网站放在中国大陆的服务器上，才需要 ICP 备案。Cloudflare Pages 是境外托管，你的站不需要备案。

要办的是域名实名认证。这是国内注册商的要求，控制台里传一次身份证信息，和备案不是一回事。认证做完，域名照样解析到境外。

## 3. 把 DNS 交给 Cloudflare

域名买完，默认由注册商的 DNS 服务器解析。要换成 Cloudflare 的，因为后面 Pages 认领域名、下发证书、做跳转都靠它。

### 3.1 添加站点

登录 <https://dash.cloudflare.com>，就是上一篇注册的那个账号。点右上角 **Add a site**，输入域名，选 **Free** 计划。

Cloudflare 会扫一遍现有的解析记录，列出来让你核对。刚买的域名通常是空的，直接 Continue。

最后给你两个域名服务器地址，形如：

```
ada.ns.cloudflare.com
bob.ns.cloudflare.com
```

每次分配的不一样，以页面上显示的为准。

### 3.2 回注册商改 NS

回买域名的那个控制台，找「DNS 服务器」或「DNS 修改」这一页。阿里云在「域名列表 → 管理 → DNS 修改」，腾讯云位置差不多。把原来的两条换成 Cloudflare 给的两条。

改完在终端里查状态，Windows 和 macOS 都用这条：

```bash
nslookup -type=NS yourname.com
```

输出里出现两条 `ns.cloudflare.com` 结尾的地址就算生效：

```
yourname.com  nameserver = ada.ns.cloudflare.com
yourname.com  nameserver = bob.ns.cloudflare.com
```

没生效就等，几分钟到几小时都有，最长 24 小时。反复提交没有用，延迟在注册商那边。

### 3.3 在 Cloudflare 里点完成

回 Cloudflare，点 **Check nameservers**。状态从 Pending 变成 **Active**，这一步结束。

这时域名已经交给 Cloudflare 解析了，但还没指向任何地方，打开是一个 Cloudflare 的错误页。

## 4. 让 Pages 认领域名

进 **Workers & Pages**，选中上一篇建的 `my-blog` 项目，切到 **Custom domains**，点 **Set up a custom domain**。

输入 `yourname.com`，不带 `www`，继续。

域名和项目在同一个 Cloudflare 账号下的话，解析记录会自动加好，点 **Activate domain** 就行。如果域名在别处，这里会给你一条 CNAME，要自己回注册商或者 DNS 服务商那边加：

| 类型 | 名称 | 内容 | 代理状态 |
|---|---|---|---|
| CNAME | `@` | `my-blog.pages.dev` | 已代理（橙色云朵） |

`@` 表示域名本身。按标准 CNAME 不能挂在裸域上，Cloudflare 做了 flattening，写 `@` 可以。

等一两分钟，Custom domains 里域名旁边会变成 **Active**。

## 5. 等证书

激活的那一刻打开网站，多半是证书错误。证书还在签发，不是哪里配错了。

进 **SSL/TLS → Edge Certificates**，看 **Universal SSL**。状态是 Pending 就继续等，一般十几分钟，慢的话要几个小时。变成 Active 之后，`https://yourname.com` 就能正常打开。

等的这段时间可以改两处设置。**SSL/TLS → Overview** 里的加密模式改成 **Full (strict)**，默认的 Flexible 会让 Cloudflare 到源站那一段走明文。再把 **Always Use HTTPS** 打开，http 请求自动跳到 https。

### 卡住时的排查顺序

| 现象 | 大概率原因 | 处理 |
|---|---|---|
| 一直 Pending Validation | NS 还没生效 | 回第 3 节用 `nslookup` 确认 |
| 证书一直是 Pending | 后缀不在免费证书覆盖范围，或者已有 CAA 记录挡着 | 等 24 小时；还不行就检查 CAA |
| 访问显示 522 超时 | DNS 记录指错了地方 | 确认 CNAME 内容是 `my-blog.pages.dev` |
| 访问显示 1016 | 项目改过名，记录还指着旧地址 | 去 Custom domains 删掉再加一次 |
| 打开是 Cloudflare 默认页 | 域名只是 Active，还没被 Pages 认领 | 回第 4 节 |

## 6. www 和不带 www 的两个地址

`yourname.com` 和 `www.yourname.com` 是两个主机名。只配一个，另一个打不开；两个都配，搜索引擎会当成两份重复的页面。

挑一个当主地址，另一个 301 跳过去。用哪个都行。裸域短，本站用的是裸域；`www` 在解析上更灵活，以后要接 CDN 之类的东西会方便一点。

做法是先在 Custom domains 里把 `www.yourname.com` 也加进去，让它拿到证书。然后到 **Rules → Redirect Rules → Create rule**：

| 字段 | 填什么 |
|---|---|
| Rule name | `www to apex` |
| When incoming requests match | Custom filter expression，填 `http.host eq "www.yourname.com"` |
| Type | Static |
| URL | `https://yourname.com` |
| Status code | `301` |
| Preserve query string | 勾上 |

存好之后打开 `www.yourname.com/some-post/`，地址栏会变成 `yourname.com/some-post/`，路径保留。

别用 DNS 里的 `*` 通配记录代替这一步。加了之后 `abc.yourname.com` 这种随手敲的地址也能打开你的站，搜索引擎会把它们当成一堆重复内容。除了自己规划过的子域名（下一篇要用 `comment.`），这个口子别开。

## 7. 改站点地址

还有一处没改。`astro.config.mjs` 里的 `site` 还是上一篇猜的那个：

```js
site: 'https://yourname.com',
```

换成真实地址，推送：

```bash
git add .
git commit -m "配置正式域名"
git push
```

这一行决定 RSS 和 sitemap 里的链接怎么拼。不改的话，订阅你博客的人拿到的每一条链接都还指向 `pages.dev`，哪天那个地址不要了，历史订阅全断。

部署完打开 `yourname.com/sitemap-index.xml` 看一眼，里面的前缀应该是新的。

## 8. 上线前检查

- [ ] `nslookup -type=NS yourname.com` 返回 Cloudflare 的两条 NS
- [ ] `https://yourname.com` 打开正常，浏览器的锁图标是闭合的
- [ ] `https://www.yourname.com` 自动跳到不带 www 的地址
- [ ] 随便点进一篇文章，刷新后不会 404
- [ ] `astro.config.mjs` 的 `site` 已经是新域名
- [ ] `yourname.com/sitemap-index.xml` 里的链接前缀正确
- [ ] SSL/TLS 的加密模式是 Full (strict)
- [ ] Always Use HTTPS 已打开

## 9. 下一篇

地址有了，站还是只能看不能说话。

下一篇接 Waline 评论：数据存在 LeanCloud，服务跑在 Vercel。这是四篇里配置项最多的一步，时间基本会花在环境变量上，少填一条接口就全部 500。
