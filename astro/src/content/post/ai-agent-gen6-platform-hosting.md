---
title: 'AI Agent 发展史第 9 篇：Gen 6——平台托管与个人代理，Agent 回到云端'
weight: 9
date: 2026-11-06T12:00:00+08:00
cover: /images/covers/ai-agent-gen6-platform-hosting-cover.jpg
categories: ['人工智能', 'AI Agent 发展史']
tags: ['AI Agent', '智能体', '个人助理', '平台托管', '豆包手机']
description: '第六代：平台在云端给每个 Agent 配一台虚拟电脑，凭证由平台保管，你只需授权。Meta 的 Muse、OpenAI 的 DOS、苹果的 Siri AI 同场竞技；豆包手机被超级应用封控，暴露了 Harness 最外层不由开发者说了算。'
math: false
mermaid: false
comments: true
toc: true
---

第六代 Agent 由大平台换了一种方式来实现。最大的变化在 **Agent 的运行位置**——Agent 不再跑在你自己的电脑上，平台在云端给每个 Agent 分配一台虚拟电脑和浏览器，账号凭证也由平台保管，你只需要授权。

严肃来说，这一代开始于 2026 年的 9 月、10 月，也就是最近的几周。最早的产品其实是 2026 年 5 月发布的 Gemini 3 Spark，它跑在云端的虚拟机上，你的电脑和手机关了它也能继续跑。6 月苹果推出 Siri AI，Grok Bot 在 8 月 11 号发布。真正引爆全球流量的是 Meta 的 Muse——他们的 GTM 做得真的很好。然后 OpenAI 及时跟进，再到 Manus 发布了 Q。

这些产品目前高度同质化，差别只在归属哪家巨头、哪个生态。它们都想成为你的私人助理，帮你完成生活中繁杂琐碎的任务——这是这一代 Agent 的使命，也是它比 OpenClaw 走得远的地方。OpenClaw 的本体跑在你的电脑上：电脑一关它就停了，你在手机上想指挥它都够不着；而且跑在电脑上，它能碰到的数据也有限。

## 六款产品的运行方式对比

把这几款产品放在一起看运行方式：六款里有五款把代理放在平台的电脑上，只有苹果在尝试设备端运行加一个私有云。

这个选择其实是意料之中：个人 Agent 的价值在于全天在线——你走开之后它还能继续干活；它用的材料也大多在你的网上账户里，而不是你电脑的文件夹里。这两个条件都指向云端。唯一的例外是苹果——它有自己的手机、一整套 iOS 生态，不用的话它浑身难受。

## 什么被继承，什么变了

把 OpenClaw 和平台托管代理放在一起对比，看看这半年发生了什么。

被继承下来的：

- 全天在线、主动执行的心跳机制
- 聊天式界面交互，而不是命令行
- 长期记忆
- 用技能和连接器扩展能力

变的是这套 Harness 的运行位置——从你自己的 Mac mini，搬到了平台的云端虚拟机。你电脑里的文件默认隔离，主动连接才能接入；密码写在配置文件里、由平台托管，不会随便交给模型；维护和安全以前要你自己安装、自己更新、自己处理冲突，现在这些责任全归平台。

最后是费用：OpenClaw 是你自带 API Key 付 Token，个人 Agent 则打包进了订阅，甚至有免费的。这正好印证了第四代的那个教训——对大多数人来说，「有人替我维护 Harness」比「数据在我自己手里」更重要、更有效用。OpenClaw 证明了大众对这件事有需求，但只有 Harness 被打包成一个方便使用、方便维护的产品，它才能真正走向大众。

## OpenAI 的 DOS

举一个代表性的例子：OpenAI 的 DOS。

它的用法很简单：像发短信一样跟它说「我要做什么」，它就一步步执行——试着去用酒店的积分、用会员账号，付款之前停下来让你确认。另外它配了一台云端电脑，随时可以打开看它干了什么。

最关键的一点：登录密码模型是看不到的，因为凭证单独保存——这是这一代 Agent 的安全设计。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-credential-out-of-context" viewBox="0 0 680 450" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>登录密码保存在上下文之外的保险柜里，不经过模型</title>
  <style>
    .diag-credential-out-of-context { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-credential-out-of-context { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <circle cx="80" cy="134.4" r="12.8" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.7"/><path d="M62.4,153.2 Q80,147.2 97.6,153.2 L92.3,190.4 Q80,193.4 67.7,190.4 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="80" y="214" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">用户</text>
  <line x1="110" y1="150" x2="159" y2="150" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M168,150 L159,146.4 L159,153.6 Z" fill="currentColor"/>
  <path d="M184,40 Q310.3,40.6 436,39.5 Q449.9,39.9 450.3,54 Q449.5,179.8 449,306 Q450.4,319.9 436,321 Q310,320.4 184,320.3 Q169.6,320.3 169.2,306 Q170.3,179.6 170.4,54 Q170.3,39.9 184,40 Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="310" y="62" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">云端电脑上的 Agent</text>
  <text x="310" y="82" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--teal)">电脑默认隔离</text>
  <path d="M200,99.6 Q309.5,99.6 420,100.6 Q429.8,99.6 429.8,110 Q429.7,175.1 430.8,240 Q429.7,250 420,249.2 Q310.3,250.1 200,249.3 Q190.1,250.2 190.5,240 Q190,174.6 189.9,110 Q190.1,100.3 200,99.6 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="310" y="122" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--blue)" font-weight="bold">上下文</text>
  <path d="M220,143.8 Q310.5,144.8 400,143.8 Q410.2,144.3 409.6,154 Q411,164.4 410.7,174 Q410.3,184.3 400,183 Q309.7,184.6 220,185 Q210.1,184 209.3,174 Q209.8,164.2 210.2,154 Q210.2,144.1 220,143.8 Z" fill="none" stroke="var(--blue)" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/><text x="310" y="164" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">任务</text>
  <path d="M220,192 Q310.3,192.6 400,192 Q409.7,191.8 409.7,202 Q410.3,212.3 410.1,222 Q409.7,231.6 400,232.9 Q310.5,232.3 220,232.5 Q210.2,231.9 209.5,222 Q209,212 209.6,202 Q210.1,192.3 220,192 Z" fill="none" stroke="var(--blue)" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/><text x="310" y="212" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">页面内容</text>
  <text x="310" y="268" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--green)">这里没有密码</text>
  <path d="M510,200 Q575.6,200.9 640,199.4 Q650,200.2 650.5,210 Q649,245.3 650.7,280 Q650.2,289.8 640,289.2 Q575,289.5 510,289.8 Q500.3,290.2 500.1,280 Q499,244.7 499.9,210 Q500.2,199.8 510,200 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="575" y="233.1" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">保险柜</text><text x="575" y="256.9" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">凭证</text>
  <text x="575" y="188" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--purple)">平台保管</text>
  <path d="M510,40.4 Q575.1,40 640,40.3 Q649.8,39.6 650.7,50 Q649.5,68.1 649.2,86 Q649.8,95.8 640,95.3 Q574.8,96.7 510,96.3 Q500,96.4 499.5,86 Q500.9,67.7 500.7,50 Q499.8,40.2 510,40.4 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="575" y="68" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor">网站</text>
  <line x1="575" y1="200" x2="575" y2="105" stroke="var(--teal)" stroke-width="1.8" stroke-linecap="round"/><path d="M575,96 L571.4,105 L578.6,105 Z" fill="var(--teal)"/>
  <text x="620" y="140" font-size="15" text-anchor="start" dominant-baseline="central" fill="var(--teal)">登录</text>
  <path d="M500,245 C430,310 360,310 310,250" fill="none" stroke="var(--red)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="6 5"/><path d="M310,250 L312.7,258.2 L317.6,254.1 Z" fill="var(--red)"/>
  <text x="400" y="328" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--red)">密码写进上下文</text>
  <line x1="250" y1="250" x2="205.8" y2="303.1" stroke="var(--red)" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="6 5"/><path d="M200,310 L208.5,305.4 L203,300.8 Z" fill="var(--red)"/>
  <text x="200" y="348" font-size="14" text-anchor="start" dominant-baseline="central" fill="var(--red)">模型可能把它发出去</text>
  <circle cx="370" cy="348" r="12" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.5"/><line x1="361.6" y1="339.6" x2="378.4" y2="356.4" stroke="var(--red)" stroke-width="2.2" stroke-linecap="round"/><line x1="378.4" y1="339.6" x2="361.6" y2="356.4" stroke="var(--red)" stroke-width="2.2" stroke-linecap="round"/>
  <rect x="20" y="390" width="400" height="40" rx="8" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.4" stroke-linejoin="round"/>
  <text x="220" y="410" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">高风险动作先询问（付款前停下来确认）</text>
</svg>
</figure>


回想前面的问题：如果把密码直接暴露给 Agent，它一进上下文，你就控制不了它会把这玩意发到哪里。再加上电脑默认隔离、高风险动作先询问——这些都是前面几代的事故换来的教训。所以它其实比你想象的要安全。

## 分发渠道：只有大厂在做

最后说分发。个人 Agent 这一代最关键的竞争点其实就是分发，而且只有大厂在做。

Muse 用的是 Meta 自身的分发渠道和冷启动经验，迅速引爆社交媒体讨论，靠免费覆盖了大量社交用户，登上榜首；苹果的 Siri 直接装进系统，手机就是分发渠道；OpenAI 的 DOS 内置在 ChatGPT 里，背后是 9 亿周活的入口。

年初只有硅谷尝鲜者在折腾的 OpenClaw，现在已经开始被大多数普通人使用。Muse 就是把一个黑框框变成了手机上的 App——从极客玩具走向市场的典范。

靠的不是技术突破，靠的是你能不能找到入口、触达用户，并且让用户用得舒服。

## 豆包手机：国内的风控困境

还有一件有意思的事——豆包手机。按理说它不属于我们现在讨论的个人 Agent，但我必须提它。

它很早就在做个人 Agent 这件事。国内的路线是想做超级应用和手机：千问 App 接了淘宝、高德这些阿里系服务；字节更直接，和努比亚做了豆包手机。豆包手机刚上线就售罄，它能做屏幕点击、读屏幕、帮你比价。

但很快问题来了：微信不让登，淘宝和银行的 App 触发封控，豆包只好收缩深度操作，后来部分 App 干脆不允许豆包手机访问。豆包还得主动限制场景，一直在拦。操作手机这个功能后来降格成了辅助功能，一些操作需要人手工确认。

这说明一个问题：Agent 用的是你本人的登录状态、跑在你自己的手机上，App 照样能拦你。你的 Harness 最外层，可能不是由 Agent 的开发者说了算的。如果你要做类似的 Agent，风控逻辑必须提前想清楚——如果因为风控导致能力大幅缩水，你怎么留住用户。

随之而来的是豆包推出的一个协议，叫 SAEP（屏幕自动化操作协议）：App 在公示期内声明允许还是拒绝被豆包操作，不回复也不拒绝就默认开放。这个设计挺幽默，类似爬虫时代的 robots.txt——网站告诉爬虫哪里可以抓，没有强制，纯靠自觉。

所以很多人在追问：如果超级应用只开放查询、开放交易，手机 Agent 能自动办的事还剩多少？美国也有类似的争议，比如亚马逊起诉 Perplexity 的 Comet 替用户下单，后面还会讲到。

## 生成式界面：被忽视的第七个部件

第六代还有一个被很多人忽视、但我认为很有价值的突破——生成式界面。

Harness 的第七个部件是交付界面。很多人可能不觉得这是 Harness 的一部分，但我认为它很重要。

10 月 7 号，GPT-6 发布了一个叫 Intelligent UI 的功能。GPT 的回答不再只是文字，而是图表、按钮、表单和可交互的小工具。比如你问「贷款 100 万 30 年月供是多少」，它会给你一根可以拖动的滑杆，拖一下数字就变了。它的回复不再是静态的，而是动态的。

这件事早期就有人在做——Artifacts、Canvas 这些功能，就是给模型留一块面板，让它决定往里填什么。但 Artifacts 和 Canvas 比较固化：模板是定死的，Agent 往里填内容。Intelligent UI 是把「用什么界面来回答」这件事也交给模型自己定。

从七个部件来看，这是最后一个部件——交互界面——开始被训练进模型，变成模型自带的默认功能。它和当年思维链变成推理模型、操作电脑变成模型原生能力，是同一类过程。虽然它仍然是大模型输出的东西，但它已经成了 ChatGPT 网页端和绝大多数用户入口的默认配置。

## 第六代小结

第六代 AI Agent 的核心：运行环境回到平台托管，交付界面开始被训练进模型。

到这里会发现，七个 Harness 部件全都走过了一遍「从外挂到被沉淀进模型」的循环。新的问题往往出在 Harness 的最外层，而且已经超出了 Agent 开发者单方面能决定的范围：代理以谁的名义访问网站、凭证支付邮箱电话由谁保管、出了错由谁负责、网站放不放行——这些乱七八糟的问题，在 2026 年 10 月还没有一个特别成熟的答案。

下面进入下一个专题：Agent 运行在本地还是云端。
