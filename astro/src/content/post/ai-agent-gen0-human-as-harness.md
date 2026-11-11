---
title: 'AI Agent 发展史第 2 篇：Gen 0——当"人"自己就是 Harness'
weight: 2
date: 2026-11-03T15:00:00+08:00
cover: /images/covers/ai-agent-gen0-human-as-harness-cover.jpg
categories: ['人工智能', 'AI Agent 发展史']
tags: ['AI Agent', '智能体', 'ChatGPT', '提示词工程', '大模型']
description: 'ChatGPT 发布、五天破百万用户，但它算不上真正的 Agent：复制粘贴的是人，推动循环的是人，管记忆的还是人——第零代，人就是 Harness。以及第一个泡沫：提示词工程师。'
math: false
mermaid: false
comments: true
toc: true
---

ChatGPT 是 2022 年 11 月 30 号发布的。那一天，可能很多人没意识到人类历史的转折点来了，但现在回头看，那个时间点确实值得被记住——如果你当时抓住了机会，有好几轮周期可以造富。

它的扩散速度大家应该都经历过：五天破百万用户，两个月月活破一亿。直到现在，我还没见过什么产品能把冷启动做得这么成功。

## 那几个仓促的跟随者

2023 年 2 月，很多用不上 ChatGPT 的人知道了 Bing Chat。它在今天看做的是一件很简单的事：搜索时让大模型帮你联网搜索作答。但它的上下文窗口非常短，好像只有 4K，多聊几轮就开始犯蠢，在长对话里冒出各种奇奇怪怪的幻觉。不过，这确实是很多人接触 AI 的启蒙。

后来 Google 仓促发布了一个叫 Bard 的模型——那时还没有 Gemini。Bard 延续了"发布即翻车"的传统，在发布会上直接演示出错，导致 Google 母公司市值一天蒸发 1000 亿美元。

2023 年 3 月，GPT-4 发布，一个令人震惊的时间点。同月 16 日，国产大模型文心一言发布，标志着中国"百模大战"启动。ChatGPT 的插件也随之发布——这就是第零代 Agent。

## 为什么它是"第零代"

你可能会问：这是 AI Agent 吗？当然不是。为什么？因为它没有 Harness。

那 Harness 是谁？**是你。** 人，就是那个 Harness。

你在网页上让它"帮我写个脚本"，AI 给出代码，你得把代码复制出来、粘到自己电脑上运行，再把报错复制回去交给它改。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-human-loop" viewBox="0 0 680 440" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>第零代里，人自己把任务、复制、运行和报错循环转起来</title>
  <style>
    .diag-human-loop { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-human-loop { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M235,36 Q339.9,37.4 445,36.2 Q454.7,36.6 454.2,47 Q454.4,64.3 454.2,81 Q455.4,90.9 445,90.3 Q340.2,90.2 235,91.5 Q224.8,90.9 225.1,81 Q224.8,64.6 224.9,47 Q224.9,37.4 235,36 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="340" y="64" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">网页里的 ChatGPT</text>
  <path d="M532,202.1 Q569.8,203.8 608,202.4 Q617.6,203.2 618,213 Q617.2,230 618.5,247 Q618.3,257.3 608,257.7 Q570.6,257.8 532,257 Q522.4,256.8 521.7,247 Q522.5,229.5 521,213 Q521.7,202.7 532,202.1 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="570" y="230" font-size="20" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">人</text>
  <path d="M265,363.1 Q340.4,362.5 415,363.3 Q424.8,362.8 425.3,373 Q425.9,389.6 425.8,407 Q425,416.6 415,417.3 Q340,418 265,417.2 Q255.1,417.2 255.1,407 Q255.9,390.2 254.9,373 Q254.9,363.3 265,363.1 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="340" y="390" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">自己的电脑</text>
  <path d="M70,203.1 Q110.4,203.8 150,203.2 Q159.7,202.6 160.8,213 Q160.9,229.9 159.7,247 Q159.8,257 150,256.6 Q110,256.3 70,256.1 Q60.3,257.2 59.5,247 Q60.6,230.3 60.2,213 Q60.3,203.1 70,203.1 Z" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="110" y="230" font-size="20" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">报错</text>
  <text x="340" y="230" font-size="18" text-anchor="middle" dominant-baseline="central" fill="var(--amber)" font-weight="bold">人 = Harness</text>
  <path d="M570,203 C600,120 500,40 455,37" fill="none" stroke="var(--amber)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M455,37 L463.7,41.2 L464.2,34 Z" fill="var(--amber)"/>
  <text x="590" y="88" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">把任务交给它</text>
  <path d="M450,91 Q500,150 522,203" fill="none" stroke="var(--blue)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M522,203 L521.9,193.3 L515.2,196.1 Z" fill="var(--blue)"/>
  <text x="508" y="148" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--blue)">给出代码</text>
  <path d="M522,257 Q500,330 425,363" fill="none" stroke="var(--amber)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M425,363 L434.7,362.7 L431.8,356.1 Z" fill="var(--amber)"/>
  <text x="530" y="330" font-size="13" text-anchor="start" dominant-baseline="central" fill="var(--amber)">复制到电脑上运行</text>
  <path d="M255,390 Q180,360 160,257" fill="none" stroke="var(--teal)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M160,257 L158.2,266.5 L165.2,265.1 Z" fill="var(--teal)"/>
  <text x="148" y="340" font-size="13" text-anchor="end" dominant-baseline="central" fill="var(--teal)">吐出报错</text>
  <path d="M110,203 C90,100 200,40 225,37" fill="none" stroke="var(--red)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M225,37 L215.6,34.5 L216.5,41.6 Z" fill="var(--red)"/>
  <text x="90" y="88" font-size="13" text-anchor="start" dominant-baseline="central" fill="var(--red)">把报错粘回去</text>
  <rect x="470" y="400" width="88" height="28" rx="6" fill="none" stroke="var(--gray)" stroke-width="1.3" stroke-linejoin="round" stroke-dasharray="7 5"/>
  <text x="514" y="414" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">没有手</text>
  <line x1="514" y1="400" x2="514" y2="384" stroke="var(--gray)" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="6 5"/>
  <line x1="500" y1="400" x2="528" y2="400" stroke="var(--gray)" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="6 5"/>
  <rect x="30" y="30" width="102" height="28" rx="6" fill="none" stroke="var(--gray)" stroke-width="1.3" stroke-linejoin="round" stroke-dasharray="7 5"/>
  <text x="81" y="44" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">知识截止</text>
  <line x1="81" y1="58" x2="81" y2="74" stroke="var(--gray)" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="6 5"/>
</svg>
</figure>
你会发现——复制粘贴的工具是人做的，粘贴报错的反馈也是人做的，来回几轮的循环是人在推动，记住之前聊过什么也很大程度上靠人来管理。

这个阶段，人就是 Harness。所以它算不上真正意义上的 AI Agent，我管它叫第零代。

第零代有两个最关键的局限：

第一，知识截止。它的知识截止在训练数据收集的那一天，超出这个范围的事，它可能一本正经地编——这就是幻觉问题。

第二，它没有手。它碰不到网站或本地工具，无法执行操作。另外上下文窗口只有 4K，一份长一点的合同都放不进去，更不用说今天随随便便一个 system prompt 就十几 K、二十 K。

## 提示词工程师：第一个泡沫，也是最短命的

当时如果你想让 AI Agent 成事，短期内没法扩大模型，只能去接外部系统。所以第一代 Agent 就是基于这两个痛点来研发 Harness 的。

这期间有一个著名概念——提示词工程（Prompt Engineering）。它是 AI Agent 史上的第一个泡沫，也是最短命的一个。

2023 年上半年，提示词工程师的薪资能开得很高，比如一则年薪 33.5 万美元的招聘被疯转；提示词模板开始明码标价，各种课程和认证层出不穷。它背后的假设是：跟大模型说话是一门不可替代的手艺。

不到一年，这个假设就被模型自身的进步瓦解了。"一步一步思考""你是一位资深专家"这类技巧，直接被训练进了模型；系统提示词和 Function Calling 也接管了对 AI Agent 运行的精细控制。这个头衔也就没人提了。

今天看来，这个概念相当滑稽——没人会再去学 Prompt Engineering，连 Vibe Coding 的人也不是特别在乎提示词写得对不对、好不好。

不过，头衔虽然消失了，这项技能并没有消失，它被内化成了一项基本功，后来改名叫**上下文工程**：把任务说清楚、把背景材料交给模型，这件事今天依然有价值，只是不是普通用户需要做的。到 2026 年，它成了 Harness Engineer 工作的一部分——企业部署 Agent 最耗时的工作之一，就是把散在员工脑子里的业务规则，变成 AI Agent 能读的文档。

被淘汰的，只是"把提示词当秘方来卖"的那门生意。当时各种卖提示词的平台和创业公司，短期内融到了钱，不到半年就死了。很滑稽，但这个循环在之后每一代都会重演：一旦有新能力出现，大量跟风产品涌进去做；等下一代基座模型或基础设施把它变成默认功能之后，它作为中间层就没有存在理由了。

## 第零代的一句话总结

提示词技巧靠的是人，但很快模型就把它内化了——这是"外挂被模型吸收"的第一个例子，之后会反复出现。

从这里开始，我们才真正进入第一代 AI Agent。
