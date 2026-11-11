---
title: 'AI Agent 发展史第 7 篇：Gen 5——Work 化，Agent 走向每一个坐在电脑前的人'
weight: 7
date: 2026-11-06T10:00:00+08:00
cover: /images/covers/ai-agent-gen5-work-cover.jpg
categories: ['人工智能', 'AI Agent 发展史']
tags: ['AI Agent', '智能体', 'Cowork', 'Harness Engineering', 'Vibe Coding']
description: '第五代叫「Work 化」：编程 Agent 的架构被原样搬进办公场景，Cowork、ChatGPT Work、百 Work 大战接连上演。Harness Engineering 成为新词，GUI 与 CLI 之争走向合流，而真正的壁垒不在 Harness 本身，在轨迹数据。'
math: false
mermaid: false
comments: true
toc: true
---

第五代，我把它称作「Work 化」。从 2025 年 1 月到 9 月，Agent 从程序员的终端，走向了所有坐在电脑前工作的人。

它不只是帮人写信、帮人写代码，还能以桌面应用的形式直接操作你的文件、浏览器和企业系统，一次跑几分钟到几个小时，直到交付一个成品。也就在这个时代，Harness 从一个工程术语，变成了行业的通用说法。

## 从 Claude Code 到 Cowork

第五代的起点是一个非常朴素的事实：Claude Code 能读写文件、执行命令、在循环里自查，还能用技能和连接器来编码；而 Cowork 作为桌面应用给所有人的，也是同一套东西——只是换成了桌面界面，不需要终端、也不碰代码。

Anthropic 的帮助文档写得很明白：Cowork 用的就是 Claude Code 的同一套 Agent 架构。

所以，编程 Agent 的架构是通用的，它自然而然能覆盖以文件和网页为载体的大部分白领工作。之前那些第三代的 Agent 和 Harness，能够原模原样地平移到办公场景里。

推动这件事落地的有两股力量：第一，模型能稳定工作的时间变得非常长；第二，编程 Agent 已经证明用户愿意为「把事情做完」付费，而知识工作者比程序员多得多。

至于这个商业逻辑能不能跑通、这些 Work 产品能不能盈利、谁是赢家，我个人持悲观态度——现在的状态其实还是靠补贴换增长。

## Cowork 是怎么运作的

Cowork 是 Work 产品里最有代表性的。比如给它下指令：「把这四张发票截图整理成一张报销表，按月份汇总」。它能识别发票内容，发现重复的标出来，生成 Excel；碰到它认为需要你确认的，会停下来，给你两个按钮去选。

注意最后一步——这是这一代 Agent 出现的一个新能力：**它不再追求全自动**。这是「反馈验证」部件，在本代长程任务里展现出的一个非常独特的能力。

Cowork 的功能也扩得非常快：1 月底出 Preview 版，2 月加定时任务和连接器，4 月推 Design 功能，8 月把浏览器内置了进去。

## SaaS 末日

这个阶段还出现了一个标志性事件——「SaaS 末日」。软件股疯狂下跌，这场抛售影响深远。

从 1 月 12 日到 2 月 23 日，因为 Claude Cowork 的出现，软件股指数跌了 25%。投资者怕的是一种新模式取代现有 SaaS：SaaS 按席位收费，用的人越少、买的席位就越少；而 Agent 把活直接干完，还能绕开软件界面直接产出结果，按人头收费的模式就被掏空了。

这就是「SaaS 末日」。不过按现在的视角看，这个判断还缺少足够的数据支撑，它反映的是资本市场在押注「AI Agent 会吞掉应用价值」这个预言。

我个人的观点是：不会。SaaS 还是会有的，「Agent 包办一切」不会发生——肯定还有一些场景需要人深度介入，并且高度非 Agent 化。

## OpenAI 的同一路线

这期间 OpenAI 也有动作，走的是同一条路：把编程 Agent Codex 一步步扩展成通用的协作工具。

2 月发布 Codex 桌面应用，有了一个管辖多个并行 Agent 的窗口；然后推出 Frontier GPT-5.4，Codex 月活快速增长；再到 7 月 9 号发布 ChatGPT Work——那是 ChatGPT 和 Codex 合体之后的产物。

两家公司从编程出发，殊途同归，走到了同样的产品形态上。

## Cursor 3：编辑器公司把编辑器放到了次要位置

另一个有意思的角度是 Cursor 3。

Cursor 靠改造 VS Code 起家，核心界面一直是代码编辑器。但 2026 年 4 月，Cursor 3 从零做了一个以 Agent 为中心的新界面，同一个窗口里调度多个 Agent，有的干 A、有的干 B——编辑器视图还在，但已经退到了次要位置。

后来会发现，国内的 Trae、Qoder、CodeBuddy 走的也是同一条路：把编辑器视图去掉或者放到很次要的位置，以 Agent 视图为主视图。一家做编辑器的公司，主动把编辑器放到了次要位置。

它的年化收入在 16 个月里涨了 40 倍，从 1 亿到 40 亿美元。这说明程序员自己的工作方式也在变——从写代码，变成调度和审阅代码。

## 国内的「百 Work 大战」

国内这轮跟风产品，我把它叫做「百 Work 大战」，对应 2023 年的「百模大战」。

腾讯的 WorkBuddy、阿里的悟空（后来收拢成千问办公）、字节的 Trae Work、Kimi 推的 Kimi Work，还有 DeepSeek Harness——DeepSeek Harness 不是办公软件，是 Coding 软件，但也是受这波影响做起来的。

6 月份的一份数据：WorkBuddy 有 2000 多万次访问，超过第二、三名之和，这一堆产品加起来总共 6000 万次访问。与此同时淘汰也开始了：QCloud 12 月宣布停运，阿里把内部几个产品先收拢成了一个。

节奏和百模大战几乎一模一样：先是大量涌入，然后半年内快速收缩。

## 办公 Agent 长得越来越像了

办公 Agent 有一个点最值得想清楚：它们长得越来越像了——都是一个桌面应用，加上一堆本地文件、一个浏览器、一堆技能和连接器，最后交付文档、表格和幻灯片。

这套模式 2025 年 Manus 第一次展示出来，到了 2026 年已经是谁都能做的公用模板，产品本身拉不开差距。

那真正的竞争点在哪？我认为有三点：

**第一，参赛者必须是入口的主人**。WorkBuddy 掌握的是微信和企业微信，千问办公背后是钉钉，字节背后是飞书和豆包，海外对应的是 Office 和 ChatGPT。它们不需要另外获取用户，因为 Agent 只是在已有入口上新加了一个功能。这就是为什么 Work 类产品是创业公司坚决不能碰的死穴——你接不进那样的生态。

**第二，办公 Agent 是模型公司卖 Token 的出口**。模型公司对此乐见其成。对又有模型又有云的大厂来说，用户多跑一个任务就多消耗一份自家模型的调用和算力，办公 Agent 可以长期亏损，因为钱从模型和云上赚回来了。独立的 Agent 公司没有这层缓冲，要向别人买 Token，每一单都得过自己的账。说得直接一点：独立公司是大厂账上的一个成本，所以创业公司做不了办公 Agent。

**第三，订阅价和执行成本是脱钩的**。聊天产品的成本比较平均，一个人一天最多聊不到 100 万 Token；但 Agent 的成本随任务长短剧烈波动——一个重度用户跑一晚上的长任务，算力可能是轻度用户一个月的上千倍。固定订阅价很难覆盖这种差异。所以后来大家都改成了按量或用量额度，这个办法最早也是 Manus 用的——你看得到，Manus 看得比谁都远。

所以，现有的所有 Work 产品，与其说是在抄 OpenClaw，不如说是在复刻 Manus。

## Harness Engineering：一个新词的出现

第五代的另一个流行概念是 Harness Engineering——Harness 工程。

Agent 一跑就是几个小时，大家关心的就不再是提示词怎么写，而是整个运行环境。2026 年 2 月，有人提出一个观点：Agent 每犯一个错，就花时间设计一个办法让它不再犯。这就是 Harness Engineering 的定义。

后来 OpenAI 也发了一份叫 Harness Engineering 的文档，说内部团队最主要的工作已经从写代码变成了设计 Agent 的工作环境——仓库结构、文档、约束规则、反馈回路等等。Karpathy 也提了 Agent Engineering 的相关概念：从接受结果，到编排 Agent、监督结果。DeepSeek 更直接，发了一个产品就叫 DeepSeek Harness。

一个工程术语，半年之内变成了产品名。与此同时，OpenClaw 的热度彻底消退了。

这两件事是什么关系？从 2023 年的提示词工程，到 2025 年的上下文工程，再到 2026 年的 Agent 工程、Harness 工程（或者叫 Loop Engineering），实际上是一步步扩展的：提示词工程关心怎么把一个请求说清楚，上下文工程关心在有限窗口里放什么信息，而 2026 年这些工程关心的是 Agent 在什么环境和反馈下能连续工作很长时间。它们一层套一层，不是谁取代谁。

效果也很直接：有没有 Harness，跑分完全是两个样子。

## 删掉工具反而更好

这时有一些特别有意思的实践。比如 Vercel 把 80% 的工具删掉，只让模型用 grep、cat 和 ls 翻文件，其他乱七八糟的工具全删——结果 Agent 的工程能力和交付质量反而提升了一整个档次。

这很有意思，它和第二代的教训是同一回事：模型越来越强之后，原先为它精心设计的专用工具，反而成了限制。好的 Harness 不一定是更多的 Harness。

## Harness 能成为护城河吗？

有一个尴尬的问题：Harness 到底能不能成为竞争壁垒？

有句话很流行：「模型是商品，Harness 才是护城河」。我认为这句话肯定不对。

Harness 里能写成文字的部分——怎么提高缓存命中率、怎么用待办清单防止跑偏、怎么用文件系统当记忆——一旦写成博客分享出来，整个行业全学会了。Manus 就是例子，它那篇上下文工程的文章后来成了全行业的教材。

学不走的，反而是写不进博客的那部分：真实任务留下的执行记录（业内叫轨迹数据），以及用这些轨迹数据让模型和 Harness 一起迭代的能力。

所以我对 Manus 的概括是：它闭源了代码，但是开源了思想。真正的壁垒不在 Harness 本身，而在跑 Harness 的规模——你有没有足够的轨迹数据。从这个角度讲，Manus 起步早、轨迹数据多，在这个领域迭代的位次反而可能比后发者靠前。

## 终端才是 Agent 的正确形态？

这期间还有一些争论。有个流行的说法是「终端才是 Agent 的正确形态」，理由很充分：模型读过海量的命令行文本，生成命令非常准；文字便于组合、写脚本和审计，比截图省 Token。

但结果是，这一年几乎所有厂商都推出或加强了自己的图形界面——Codex 的 Desktop App、Claude Code 的桌面板和前端界面、Cursor 3、ChatGPT Work、Kimi Desktop、DeepSeek Harness 的桌面板。大家最优先交付的还是 GUI。

原因很简单：一个人要同时监督十几个 Agent，一个终端窗口绝对装不下；用户从程序员变成了知识工作者，你不可能要求一群不懂代码的白领从零学 CLI。第三，Agent 的出现让做图形界面变得非常便宜了，产品方能够提供非常好用、非常精致的 GUI。

所以我的理解是：当时很多资方和项目追逐 CLI，是因为混淆了两件事。第一件是 Agent 自己调工具的接口——在这一层，命令行、API 和 MCP 的优势实实在在；第二件是人监督和验收 Agent 的面板——任务看板、改动对比、成品预览、审批、叫停——在这一层，图形界面的优势也非常明显。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-tool-interface-vs-review-ui" viewBox="0 0 680 460" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>命令行和 MCP 是 Agent 调工具的接口，图形面板才是人监督验收的一层</title>
  <style>
    .diag-tool-interface-vs-review-ui { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-tool-interface-vs-review-ui { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M34,36.9 Q340.4,35.5 646,35.8 Q659.9,36.1 660,50 Q660.1,110.5 659.5,172 Q660.1,185.8 646,185.8 Q339.4,186.7 34,185.6 Q19.9,186 20.9,172 Q20.3,111 19.3,50 Q20.4,36.3 34,36.9 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" opacity="0.55"/>
  <text x="340" y="58" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">人监督和验收的面板</text>
  <circle cx="70" cy="97.6" r="11.2" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.7"/><path d="M54.6,114.8 Q70,108.8 85.4,114.8 L80.8,146.6 Q70,149.6 59.2,146.6 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="70" y="168" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">人</text>
  <path d="M140,84.7 Q178.6,84 216,83.4 Q226.3,83.9 225.8,94 Q225.3,118.6 226.2,144 Q226.2,153.9 216,153.8 Q178.2,153.8 140,153.4 Q130.2,153.8 129.8,144 Q129.4,119.3 129.5,94 Q130.1,83.9 140,84.7 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="178" y="119" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">任务看板</text>
  <path d="M244,84 Q282.2,84.4 320,84.3 Q330.3,83.7 330.8,94 Q329.3,118.6 330.5,144 Q330,153.9 320,153.9 Q282.6,154.5 244,153.8 Q234.1,153.8 233.9,144 Q233.4,119.1 233.7,94 Q233.7,84.1 244,84 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="282" y="119" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">改动对比</text>
  <path d="M348,83 Q386.3,83 424,84.8 Q434.2,83.6 434.1,94 Q434.8,119.4 433.5,144 Q433.9,154.4 424,153.6 Q386,153.5 348,154.2 Q338.2,154.1 337.9,144 Q337.9,119.6 337.8,94 Q338.1,84.1 348,83 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="386" y="119" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">成品预览</text>
  <path d="M452,83.5 Q490.2,83.5 528,83.2 Q538,83.7 538.3,94 Q539,119.2 537.3,144 Q538.2,154.4 528,153.6 Q490.4,154.8 452,153.1 Q441.8,153.9 441.7,144 Q443,119.5 441.2,94 Q442.3,84.2 452,83.5 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="490" y="119" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">审批</text>
  <path d="M556,84.8 Q593.5,83.2 632,83.4 Q642.4,84.2 642.5,94 Q643,119.2 642.8,144 Q642.1,153.7 632,154.3 Q594,154.1 556,154.4 Q546.3,154 545.3,144 Q546.8,119.4 545,94 Q546.3,84.2 556,84.8 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="594" y="119" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">叫停</text>
  <line x1="96" y1="120" x2="118" y2="120" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round"/><path d="M126,120 L118,116.8 L118,123.2 Z" fill="var(--amber)"/>
  <path d="M275,206 Q340.6,206.3 405,205.3 Q414.8,205.8 415.2,216 Q414.1,232.4 415.9,248 Q415,258 405,257.4 Q339.8,258.5 275,257.5 Q264.7,257.8 265.9,248 Q264.6,231.5 265.4,216 Q265.3,206.2 275,206 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="340" y="232" font-size="20" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">Agent</text>
  <line x1="340" y1="186" x2="340" y2="197" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round"/><path d="M340,206 L343.6,197 L336.4,197 Z" fill="var(--amber)"/>
  <text x="400" y="198" font-size="14" text-anchor="start" dominant-baseline="central" fill="var(--amber)">监督、验收</text>
  <path d="M34,279.1 Q339.9,280.9 646,280.2 Q659.9,280.3 660.2,294 Q660.9,344.7 660,396 Q660.2,410 646,410.7 Q340.2,411 34,409.8 Q19.8,409.9 20.6,396 Q20.6,344.4 20.2,294 Q19.9,279.7 34,279.1 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" opacity="0.4"/>
  <text x="40" y="304" font-size="16" text-anchor="start" dominant-baseline="central" fill="currentColor" font-weight="bold">Agent 自己调工具的接口</text>
  <path d="M170,326 Q224.8,326.9 280,326.2 Q289.7,325.9 290.5,336 Q289.9,355.4 290.5,374 Q290.2,384 280,384.5 Q224.5,383.9 170,384.2 Q159.9,384.4 161,374 Q159.7,355.2 160.1,336 Q160,326 170,326 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="225" y="355" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor">命令行</text>
  <line x1="340" y1="258" x2="231.9" y2="321.9" stroke="var(--blue)" stroke-width="1.6" stroke-linecap="round"/><path d="M225,326 L233.5,324.7 L230.3,319.2 Z" fill="var(--blue)"/>
  <path d="M330,325.1 Q384.9,325.2 440,325.1 Q450.1,325.7 450.8,336 Q450.1,354.8 449,374 Q449.9,384 440,384.7 Q384.8,383.7 330,383.3 Q320.3,383.7 319.5,374 Q319.9,354.5 319,336 Q319.7,326.2 330,325.1 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="385" y="355" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor">API</text>
  <line x1="340" y1="258" x2="380.6" y2="319.3" stroke="var(--blue)" stroke-width="1.6" stroke-linecap="round"/><path d="M385,326 L383.3,317.6 L377.9,321.1 Z" fill="var(--blue)"/>
  <path d="M490,327 Q544.6,327 600,326.1 Q609.7,325.8 609.8,336 Q609,354.6 610.6,374 Q610.3,383.9 600,385 Q544.4,383.9 490,384.7 Q479.8,383.9 479.8,374 Q479.2,354.8 479.4,336 Q479.7,326.3 490,327 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="545" y="355" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor">MCP</text>
  <line x1="340" y1="258" x2="537.4" y2="323.5" stroke="var(--blue)" stroke-width="1.6" stroke-linecap="round"/><path d="M545,326 L538.4,320.4 L536.4,326.5 Z" fill="var(--blue)"/>
  <text x="340" y="436" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">图形界面的外壳，命令行和工程师用的内核</text>
</svg>
</figure>


不能用第一层的优势去否认第二层的需要，那样一定会得出错误结论。现在的主流形态就是：图形界面的外壳，命令行和工程师用的内核。

GUI 和 CLI 的争论到现在我觉得已经接近尾声了：两者都需要，不是谁赢了，而是各司其职。

## FDE：驻厂工程师

下一个话题是 OpenAI 和 Anthropic 的驻厂服务，也就是 FDE。这个词没有什么深刻的含义，就是派驻工程师到企业辅助落地。

到 2026 年，AI 使用的瓶颈根本不在大模型，而在怎么快速把模型接进每家企业不同的数据系统。FDE 就是干这个的岗位，概念的提出者是 Palantir。

2026 年 5 月 4 号，OpenAI 和 Anthropic 在同一天宣布了几乎一样的举措：OpenAI 成立了叫 Deploy 的服务团队，Anthropic 联合黑石等平台成立了面向中型企业的服务公司。他们做的事一模一样——都认识到光卖模型和订阅，企业用不起来，必须把散在员工脑子里的业务规则整理成 Agent 能读的东西，也就是 Harness 的指令和上下文。

这呼应了第零代的结论：把任务说清楚这件事一直是有分量的，只不过现在要提取的信息越来越多——要把员工脑子里的技能整体提取出来。

但这里有个矛盾：多派人，收入靠人力，毛利率就向咨询公司靠拢，最后你变成一家挂着产品牌子的咨询公司；不派人，把企业的技能沉淀成插件让客户自己装，标准化技能又很快触到天花板，企业流程不会自己适应 AI。

这里的张力在于：做得太重就成了外包；不去做，AI 又在企业里落不了地。

## METR 任务时间跨度：一把量尺

下一把量模型能力的尺子，叫 METR 任务时间跨度。它说的是：一类任务，如果人类专家要做 X 小时，模型有 50% 的把握独立做完，那它的时间跨度就是 X 小时。

这个定义读起来有点绕，不清楚的可以去查原始报告。OPUS 4.6 的时间跨度大概是 12 小时；更强的模型，METR 干脆标了「不太可靠」，9 月起不再更新那个数字——因为它已经没有参考意义了。这本身就说明问题：最强模型能做的任务已经长到现有测试题不够用了，Agent 能执行的长周期任务，长度已经难以估量。

当然，这里又回到第一代提过的那个问题：任务越长，累积的错误越多，对 Harness 里「存档回退」的要求也越高。

2026 年 2 月到 9 月的模型发布就不逐个展开了，只说两点：第一，Anthropic 在 OPUS 上多了 Mysos 和 Fable 两条线，Mysos 只给网络安全机构用，Fable 面向公众、执行特别长的任务，目前还是受限开放；第二，国内以开源开放权重的方式发了很多模型，年中有望在性价比上赶超国外，但目前看还是遇到了瓶颈。

值得一提的还有 Google 的 Astra，主要卖点是操作电脑，它驱动的就是第六代要讲的个人助理 DOS。

## 财务数据：Anthropic 的收入爆发

看一则财报消息。Anthropic 的年化收入，2025 年底还只有 90 亿美元，到 2026 年 7 月到了 650 亿，不到一年涨了 7 倍多；再过半年到年底，可能就是千亿以上，而且已经超过了 OpenAI。

根据报道，OpenAI 9 月的年化大概是 500 亿，比外界原来的印象少了不少。彭博也指出两家的收入口径不太一样，直接比大小要谨慎，只能说各家有各家的趋势。

## 第五代总结：夹在模型和入口之间的困境

第五代 AI Agent 的竞争焦点，是谁的 Harness 好、谁占据用户每天工作的界面。

Agent 的 Harness 几乎被原样搬进了所有知识工作，真正拉开差距的是三个地方：第一，能不能用用户的文件、账号和企业系统；第二，能不能在长任务里可靠地自查和纠错；第三，能不能通过已有的入口触达用户。

Harness 本身构不成长期壁垒。夹在模型和入口中间，两样都不掌握的话，Agent 公司处处被动——你必须在入口或模型上有所作为。

微软是个证据：Office 是关键入口，但它要把 Copilot 的 Cowork 交给 Anthropic 的模型来驱动——入口和模型方各取所需。如果你只做中间的 Harness 层，很难完全做成。

那谁能做成？Manus 算一个。夹在中间的独立 Agent 公司里，目前最典型的只有它——既没有模型，也没有足够的入口，它的优势在于数据。但我觉得它的命运还是非常坎坷的。

说到 Manus，我们就进入第一个专题。
