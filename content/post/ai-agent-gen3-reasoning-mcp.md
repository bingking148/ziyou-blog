---
title: 'AI Agent 发展史第 5 篇：Gen 3——推理模型、MCP 与 Computer Use'
weight: 5
date: 2026-11-05T21:00:00+08:00
cover: /images/covers/ai-agent-gen3-reasoning-mcp-cover.jpg
categories: ['人工智能', 'AI Agent 发展史']
tags: ['AI Agent', '智能体', 'MCP', '推理模型', 'Claude Code']
description: '第三代的三块基石：推理模型让规划被收进模型内部，MCP 把 N×M 的接口题变成一道加法题，Computer Use 让模型直接操作屏幕。Deep Research、Claude Code、Vibe Coding 与删库事故，也都发生在这一代。'
math: false
mermaid: false
comments: true
toc: true
---

第三代主要落在 2024 年第四季度到 2025 年。这个阶段发生了两件事：一些旧的 Agent Harness 部件被直接写成了标准，或者干脆被训练进了模型；同时，Agent 能碰的范围进一步扩展到了难以想象的地步。

这一代最底层的技术有三样：推理模型、MCP、Computer Use。三样叠在一起，才把 2025 年推成了中外媒体口中的「AI Agent 元年」。

## 推理模型：从 OpenAI o1 到 DeepSeek R1

最早的推理模型是 2024 年 9 月 12 号发布的 OpenAI o1。它用强化学习练出了非常长的内部推理，能做很复杂的数学和编程题。

当时 o1 的价格是多少？输入每百万 Token 100 美元，输出 600 美元。你敢想象吗？要不是后来梁文锋发布了 DeepSeek R1，我都不敢想象 o1 能收割多少钱。

2025 年 1 月 20 号，DeepSeek 发布 R1：权重开放，推理能力几乎和 o1 平齐，成本低得多。一周之后，英伟达跌了 17%，市值蒸发接近 6000 亿美元。

不过对 AI 行业来说，DeepSeek R1 最重要的意义不在英伟达的股价，而在它把一种方法摊开在了所有人面前：**只要任务有能自动判断对错的标准**（数学答案对不对、代码能不能通过测试），光靠强化学习就能教会模型做长链推理。记住这句话，它后面能解释很多事。

当然，如果对错不好自动判（比如创意写作），目前还没找到特别好的办法让性能持续往上走。

推理模型为什么如此重要？对比一下就很清楚。第二代的时候，规划写在模型外面的工程流里——专门的规划节点、反思节点、拆解提示、检查清单。到了第三代，这些东西全被收进了模型内部，外面很多节点就不需要了。这是继提示词技巧之后，又一次「外挂部件被大模型吸收」。

更深远的影响在训练方法上：既然能用自动判分的任务做强化学习，这套方式就成了后来训练大模型的主流——让模型在成千上万个任务里反复练、修 Bug、跑测试、完成操作。模型在多步调用上的快速进步，就来自这种训练。

哪里有便宜的分数判定，哪里的 Agent 能力就长得快。

## MCP：把乘法题变成加法题

第二个关键基础设施是 MCP——Model Context Protocol，模型上下文协议，2024 年 11 月 25 日由 Anthropic 发布。它要解决的事，是把「乘法题」变成「加法题」。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-mcp-nm-to-n-plus-m" viewBox="0 0 680 560" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>四个 AI 应用接五个工具：两两对接要 20 份接口，经 MCP 变成加法</title>
  <style>
    .diag-mcp-nm-to-n-plus-m { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-mcp-nm-to-n-plus-m { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <text x="340" y="28" font-size="18" text-anchor="middle" dominant-baseline="central" fill="var(--red)" font-weight="bold">4 × 5 = 20 份接口</text>
  <line x1="160" y1="82" x2="520" y2="74" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="82" x2="520" y2="118" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="82" x2="520" y2="162" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="82" x2="520" y2="206" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="82" x2="520" y2="250" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="130" x2="520" y2="74" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="130" x2="520" y2="118" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="130" x2="520" y2="162" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="130" x2="520" y2="206" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="130" x2="520" y2="250" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="178" x2="520" y2="74" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="178" x2="520" y2="118" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="178" x2="520" y2="162" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="178" x2="520" y2="206" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="178" x2="520" y2="250" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="226" x2="520" y2="74" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="226" x2="520" y2="118" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="226" x2="520" y2="162" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="226" x2="520" y2="206" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <line x1="160" y1="226" x2="520" y2="250" stroke="var(--red)" stroke-width="0.9" stroke-linecap="round" opacity="0.45"/>
  <path d="M50,64 Q100.2,63.5 150,63.5 Q159.9,64.1 159.9,74 Q159.1,81.8 161,90 Q160.1,100.1 150,100.4 Q99.6,100.7 50,99.1 Q40.3,100.4 41,90 Q39.3,82.6 39.6,74 Q40.2,64.3 50,64 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="100" y="82" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">AI 应用</text>
  <path d="M50,111.5 Q99.6,112.7 150,112 Q160.4,112.3 159.4,122 Q160.9,129.9 160.1,138 Q159.6,147.8 150,149 Q100.1,148.3 50,148.5 Q40,148.3 40.2,138 Q41,129.9 39.7,122 Q39.7,112.1 50,111.5 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="100" y="130" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">AI 应用</text>
  <path d="M50,161 Q100.3,160 150,159.1 Q159.7,159.7 160.9,170 Q160.9,177.6 159.8,186 Q159.8,195.8 150,197 Q99.6,195.7 50,195.8 Q40.2,195.9 40.3,186 Q39.8,177.4 39,170 Q40.3,160.3 50,161 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="100" y="178" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">AI 应用</text>
  <path d="M50,208.2 Q99.9,208.4 150,208.8 Q159.9,208 160.9,218 Q160.5,226.3 160,234 Q159.8,243.7 150,244.8 Q99.6,245 50,243 Q40,244.1 40.5,234 Q40.5,225.6 39.5,218 Q39.9,208.1 50,208.2 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="100" y="226" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">AI 应用</text>
  <path d="M530,55.6 Q579.7,56.6 630,56.2 Q639.7,55.8 639.9,66 Q640.8,74.4 639.6,82 Q640.1,92.1 630,92.8 Q579.6,91.8 530,92.3 Q520,92 519.5,82 Q519,74.4 520.6,66 Q520.1,56.1 530,55.6 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="580" y="74" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">工具</text>
  <path d="M530,100 Q580.4,99.6 630,100.1 Q639.9,99.7 639.6,110 Q640,117.8 640.4,126 Q640.2,135.8 630,135.8 Q579.6,136.3 530,135.6 Q519.8,136.4 520.8,126 Q520.3,117.8 520.4,110 Q519.9,100.4 530,100 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="580" y="118" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">工具</text>
  <path d="M530,144.9 Q580.6,143.5 630,143.3 Q639.9,144.1 639.9,154 Q639.7,162 640.8,170 Q639.7,179.8 630,179.3 Q580.6,179.3 530,181 Q519.7,180 519.2,170 Q520,162.3 519.9,154 Q520.1,144.1 530,144.9 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="580" y="162" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">工具</text>
  <path d="M530,187.9 Q580.5,188 630,187.6 Q639.8,188.1 639.1,198 Q639.1,205.6 640.5,214 Q640.4,224.3 630,223.1 Q580.4,224.2 530,224.3 Q520.3,224.2 519.4,214 Q520.8,205.8 520.7,198 Q519.8,188.1 530,187.9 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="580" y="206" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">工具</text>
  <path d="M530,231.9 Q579.9,232.9 630,232.3 Q639.7,232.1 639,242 Q640.4,250.4 641,258 Q639.6,267.7 630,268.6 Q580.4,268.3 530,267.4 Q519.7,267.6 519.3,258 Q519.9,250.3 520.8,242 Q520.1,231.8 530,231.9 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="580" y="250" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">工具</text>
  <line x1="40" y1="286" x2="640" y2="286" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="6 5" opacity="0.55"/>
  <text x="340" y="314" font-size="18" text-anchor="middle" dominant-baseline="central" fill="var(--green)" font-weight="bold">4 + 5</text>
  <path d="M295,398.9 Q339.9,397.2 385,397.6 Q395,397.7 396,408 Q395.4,430.1 394.3,452 Q394.6,461.9 385,462.5 Q339.8,461.8 295,461.8 Q285.4,461.6 284.1,452 Q284.5,430.4 284.6,408 Q285,398.2 295,398.9 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="340" y="430" font-size="22" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">MCP</text>
  <path d="M50,347.6 Q99.4,349 150,348.3 Q159.7,347.9 160.7,358 Q159.5,365.6 161,374 Q159.6,384.1 150,383.1 Q99.4,384.4 50,383.4 Q39.8,383.7 39.7,374 Q40.5,365.8 40.7,358 Q40.3,347.9 50,347.6 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="100" y="366" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">AI 应用</text>
  <line x1="160" y1="366" x2="278.8" y2="426.8" stroke="var(--green)" stroke-width="1.4" stroke-linecap="round"/><path d="M285,430 L280,424.3 L277.5,429.3 Z" fill="var(--green)"/>
  <path d="M50,399.1 Q100.6,399.7 150,400.2 Q160.2,400 160.1,410 Q160.5,418.2 159.7,426 Q160.2,435.7 150,436.2 Q100.3,435.7 50,437 Q39.9,435.6 39.7,426 Q40.4,417.6 40.3,410 Q39.9,399.8 50,399.1 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="100" y="418" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">AI 应用</text>
  <line x1="160" y1="418" x2="278" y2="429.3" stroke="var(--green)" stroke-width="1.4" stroke-linecap="round"/><path d="M285,430 L278.3,426.5 L277.8,432.1 Z" fill="var(--green)"/>
  <path d="M50,451.5 Q100.1,451.9 150,452 Q160.3,452.3 160.2,462 Q160,469.6 160,478 Q160.1,487.8 150,487.2 Q100.4,487 50,487.5 Q40.3,488.3 39.7,478 Q40.1,469.9 39.8,462 Q40,452.2 50,451.5 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="100" y="470" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">AI 应用</text>
  <line x1="160" y1="470" x2="278.3" y2="432.1" stroke="var(--green)" stroke-width="1.4" stroke-linecap="round"/><path d="M285,430 L277.5,429.5 L279.2,434.8 Z" fill="var(--green)"/>
  <path d="M50,504.8 Q99.5,503.2 150,504 Q159.7,504.3 159.6,514 Q160.9,521.8 160.8,530 Q160,540.4 150,539.9 Q100.5,539.9 50,539.9 Q39.9,539.8 39.6,530 Q39,522 40,514 Q40.4,504.3 50,504.8 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="100" y="522" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">AI 应用</text>
  <line x1="160" y1="522" x2="279.4" y2="434.1" stroke="var(--green)" stroke-width="1.4" stroke-linecap="round"/><path d="M285,430 L277.7,431.9 L281,436.4 Z" fill="var(--green)"/>
  <path d="M530,340 Q580.1,339.8 630,339.9 Q639.8,340.1 640.7,350 Q639.9,358.3 639.3,366 Q640.4,376.4 630,376.2 Q579.7,375.7 530,376.9 Q520.2,375.9 519.6,366 Q519.1,358 519.2,350 Q519.9,340.3 530,340 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="580" y="358" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">工具</text>
  <line x1="395" y1="430" x2="513.9" y2="361.5" stroke="var(--green)" stroke-width="1.4" stroke-linecap="round"/><path d="M520,358 L512.5,359.1 L515.3,363.9 Z" fill="var(--green)"/>
  <path d="M530,387.3 Q580,389 630,388 Q639.9,387.9 640.7,398 Q640.4,405.6 640.6,414 Q640,424 630,424.9 Q580.1,423.2 530,423.9 Q519.7,423.6 519.6,414 Q519.2,405.5 520.7,398 Q519.9,387.8 530,387.3 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="580" y="406" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">工具</text>
  <line x1="395" y1="430" x2="513.1" y2="407.3" stroke="var(--green)" stroke-width="1.4" stroke-linecap="round"/><path d="M520,406 L512.6,404.6 L513.7,410.1 Z" fill="var(--green)"/>
  <path d="M530,436 Q579.5,435.7 630,436.7 Q639.8,436 639.1,446 Q639.3,453.8 640.3,462 Q639.7,472.2 630,472.7 Q579.6,471.6 530,471.1 Q519.6,472.2 520.7,462 Q520.3,454.5 519.9,446 Q519.9,436.1 530,436 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="580" y="454" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">工具</text>
  <line x1="395" y1="430" x2="513.1" y2="452.7" stroke="var(--green)" stroke-width="1.4" stroke-linecap="round"/><path d="M520,454 L513.7,449.9 L512.6,455.4 Z" fill="var(--green)"/>
  <path d="M530,484.5 Q579.4,483 630,484.9 Q640.2,484.1 641,494 Q639.4,502 639.6,510 Q639.7,520.4 630,520.1 Q580.1,520.1 530,520.5 Q519.6,520.2 520.5,510 Q519.9,502.5 519.5,494 Q519.7,484 530,484.5 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="580" y="502" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">工具</text>
  <line x1="395" y1="430" x2="513.9" y2="498.5" stroke="var(--green)" stroke-width="1.4" stroke-linecap="round"/><path d="M520,502 L515.3,496.1 L512.5,500.9 Z" fill="var(--green)"/>
  <path d="M530,527.4 Q579.5,528.9 630,528.2 Q639.9,527.6 639.4,538 Q640.6,546.5 639.9,554 Q640,563.9 630,564.2 Q580,564.7 530,564.4 Q520.1,564 519.4,554 Q520.2,546 520.4,538 Q520.3,528.1 530,527.4 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="580" y="546" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">工具</text>
  <line x1="395" y1="430" x2="514.9" y2="541.2" stroke="var(--green)" stroke-width="1.4" stroke-linecap="round"/><path d="M520,546 L516.8,539.2 L513,543.3 Z" fill="var(--green)"/>
</svg>
</figure>


比如 4 个 AI 应用要接 5 个工具，每一对都得单独写接口，加起来就是 20 份。MCP 规定了一个统一接口——工具协议只需要对接一次，彼此就能互相调用。

这件事最能说明问题的，是各家跟进的速度：Anthropic 发布之后，OpenAI 宣布支持，Google 宣布跟进，微软说 Windows 要原生支持。一家公司提的协议，被竞争对手在几个月内全部跟进。为什么？原因很简单：每家都在重复写同样的对接，每个人都想省掉。既然有了协议，大家就都来遵守。

此外这个生态里还有一些别的协议，比如管 Agent 之间互访的 A2A、ACP，还有管支付的——Agent 连工具、连数据、连别的 Agent、连钱，每一类问题都有对应的协议。

## Computer Use：让模型「看屏幕、点鼠标」

第三样关键能力是 Computer Use，2024 年 10 月由 Anthropic 推出。

设想一个场景：一个非常老旧、没有任何 API 的报销系统，怎么让大模型操作它？Anthropic 给出的做法是：截图，把图喂给模型，让模型判断该点哪里、移动鼠标、点击；然后再截图看结果，再决定下一步。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-computer-use-loop" viewBox="0 0 680 420" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>Computer Use 是截图、判断该点哪里、点击，再截图看结果的循环</title>
  <style>
    .diag-computer-use-loop { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-computer-use-loop { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M290,33.8 Q339.9,33.4 390,33.6 Q400.3,33.3 400.3,43 Q400.5,59.6 401,77 Q400,87 390,87.2 Q340.6,87 290,87.4 Q280,87.1 279.4,77 Q279.6,59.9 280.5,43 Q279.9,33.2 290,33.8 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="340" y="60" font-size="20" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">截图</text>
  <path d="M460,165.8 Q539.8,164.5 620,165.2 Q629.9,165.3 631,175 Q629.9,199.6 629.6,225 Q630,234.7 620,234.9 Q540.3,235.3 460,234.4 Q449.6,234.9 450.7,225 Q450.9,200.3 450.5,175 Q449.8,165 460,165.8 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="540" y="188.8" font-size="17" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">模型判断</text><text x="540" y="211.2" font-size="17" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">该点哪里</text>
  <path d="M260,305.8 Q339.4,306 420,304.3 Q429.7,304.8 429.2,315 Q429.9,339.6 431,365 Q429.7,375 420,374.6 Q339.5,374.3 260,375.5 Q250.3,375 249.3,365 Q249.8,340.1 249.6,315 Q249.7,305.2 260,305.8 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="340" y="328.8" font-size="17" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">移动鼠标</text><text x="340" y="351.2" font-size="17" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">点击</text>
  <path d="M400,70 Q500,80 540,165" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M540,165 L539.4,155.3 L532.9,158.4 Z" fill="currentColor"/>
  <text x="520" y="110" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">喂给模型</text>
  <path d="M540,235 Q500,300 430,330" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M430,330 L439.7,329.8 L436.9,323.1 Z" fill="currentColor"/>
  <path d="M250,340 Q160,200 280,80" fill="none" stroke="var(--blue)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M280,80 L271.1,83.8 L276.2,88.9 Z" fill="var(--blue)"/>
  <text x="160" y="200" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--blue)" font-weight="bold">再截图</text>
  <path d="M30,69.2 Q90.3,70.2 150,69.7 Q159.9,70.2 159.8,80 Q160.2,119.9 159.2,160 Q160.3,170.4 150,170.4 Q90.6,169.4 30,170.6 Q20,169.8 19.6,160 Q19.7,120.3 19.6,80 Q20.1,70 30,69.2 Z" fill="var(--fill-gray)" stroke="var(--gray)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="90" y="98.8" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">老旧报销系统</text><text x="90" y="117.2" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">没有任何 API</text>
  <rect x="50" y="140" width="80" height="20" rx="3" fill="none" stroke="var(--gray)" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M130,90 Q200,50 280,60" fill="none" stroke="var(--gray)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="6 5"/><path d="M280,60 L271.5,55.3 L270.6,62.5 Z" fill="var(--gray)"/>
  <text x="200" y="44" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">只有屏幕</text>
</svg>
</figure>


本质上还是「一边想、一边做、一边看」的循环，只是「做」变成了操作屏幕。

刚发布时，它的成绩和人类比非常难看。但分数不是重点，重点是它证明了一件事：通用模型可以直接操作给人用的界面。没有 API 的古老系统、只能手工点的网页，从此都进入了 AI Agent 的行动范围。往后 OpenAI 的 Operator、ChatGPT Agent，还有 Comet、Atlas 这些 AI 浏览器，都是沿着这条线来的。

## Agent 安全成为显著问题

这个阶段，Agent 安全也随之成为绕不开的问题。

比如，把恶意指令藏进 MCP 的说明文字里，模型读到就照做，能把你虚拟货币钱包里的钱直接转走；再比如，利用一个公开 GitHub issue 里的隐藏指令，能让 AI Agent 把原仓库的内容泄露出去。

如果一个 Agent 既能接触私有数据，又会读到不可信内容，还能进行通信，那数据资产就可能被偷走。

第 1 篇里的那个框架在这里派上了用场，它给出了根本原因：**模型分不清它读到的文字，是外部资料，还是指令**。这个问题直到今天也没在模型层彻底解决，只能靠安全对齐和强化来缓解。

## Deep Research：最先被白领接受的 Agent

第三代里，最早被普通知识工作者广泛接受的 Agent，不是通用 Agent，而是深度调研（Deep Research）。

你提一个问题，它跑 5 到 30 分钟甚至更久，读几十上百个网页，写出一份带引用的报告。它为什么能成？原因很朴素：

1. 任务价值高——它替你读 100 个网页，比人工省下不少时间
2. 调研任务等十几分钟、半小时甚至一小时，都可以接受
3. 每句话带引用，可以核查
4. 就算做错了，也只是产出一份报告，代价低，不会把整个系统带崩

这四个条件，比任何技术指标都更能预示一个 AI Agent 应用场景能不能落地。

当时 Gemini Deep Research 给我留下的印象最深——跑出来的研报可能有几万字，直接导出到 Google Docs。我 2025 年很多繁复的工作都是它做的。

## Manus：另一条轨道

这里有一个重磅角色——Manus。不管你对 Manus 的看法如何，它给整个 AI 行业带来的震撼和影响是实打实的。

Manus 是「通用 Agent 产品」这条轨道的代表，2025 年 3 月发布。演示里它在云端的虚拟机上打开浏览器、用终端和文件系统，自己操作——筛简历、分析股票、搭网站。每个任务还能生成回放，回放能被转发，别人能看到它一步步操作的全过程。这个回放本身成了传播极广的素材，邀请码一度被炒到上万元。

关于 Manus，后面有整整一个专题来拆解，这里先按下不表。

## 编程 Agent：为什么编程最先跑通？

另一条轨道是编程 Agent，也就是编程垂类的 Agent。它为什么能率先走向成熟？为什么偏偏是编程最先跑通？

答案在于，代码自带验证器：改完代码，编译过不过、测试过不过，机器自己就能判断，立刻给出一个明确的对或错。

这一点在两个地方起了作用：Agent 运行时能自己发现错误、自己改；训练时，同样的任务可以拿来做强化学习。

但如果是在开放的网页上替人下单，这种操作往往没有自动判分，出错的代价又高，落地就非常慢。

这条线能解答很多事：一个领域里 Agent 能不能先成熟起来，基本取决于那里有没有便宜、可靠的验证手段。后面讲第五代 Work 化时，为什么大家先做的是文档、表格、幻灯片？原因也一样——这些文件有结果、能看到、改得了。

## Claude Code 的完整形态

第一个标志性产品是 Claude Code，2025 年 2 月发布预览版，5 月正式发布。

Claude Code 是一个终端产品。让它修一个登录页时区的 Bug，看它怎么跑：先读 CLAUDE.md，再读相关代码，改两个文件，跑测试，失败，修正，再跑，通过，提交。

开头说的七个部件，它已经凑齐了：CLAUDE.md 是项目说明（指令），代码库是记忆，读写文件、执行命令是工具，自己决定下一步是循环，测试自动判分，再加上你本机的终端和执行权限。至于交付界面，就是 CLI——那时还没什么前端交付可谈，CLI 是最简单的执行方式。

9 月，Anthropic 把背后的运行框架开源成了 Claude Agent SDK。意思很明确：这套结构不只用来写代码，还要给后来的所有 Agent 框架当底座。到 2025 年底，Claude Code 的年化收入突破了 10 亿美元，是 Anthropic 的重要聚宝盆。

同场竞技的还有：OpenAI 的 Codex CLI 和 Codex 客户端，Google 的 Jules——不过 Jules 很快变成 Gemini CLI，后来又快速转向 Antigravity。Cursor 在这个阶段依然大放异彩，推出 background agents，年化收入快速增长。

这一阶段还有个小插曲：Windsurf。7 月 OpenAI 收购它没能成功，接着 Google 授权了它的技术、挖走了它的 CEO，剩下的公司归了 Cognition，Windsurf 后来就并进了 Devin。

国内那一年也冒出一大堆跟风的 IDE，比如 Trae、Qoder、CodeBuddy；模型方面 Kimi K2、千问 3、GLM-4.5、DeepSeek V3.1、MiniMax M2，都把工具调用和代码生成当主要卖点。很多厂商还出了专门兼容 Anthropic 接口的低价套餐，让开发者把国产模型接进 Claude Code——也就是说，Claude Code 这个 Harness 反倒成了国产模型的分发渠道，这是件非常有意思的事。

## GUI vs CLI：那个被过度争论的问题

这个阶段还有个争议：GUI 和 CLI 到底哪个好？

编程 Agent 长出了两种界面。GUI 的代表是 Cursor——长在编辑器里，改动逐行显示，适合精细修改。CLI 路线以 Claude Code 和 Gemini CLI 为代表，跑在终端里，哪里有终端哪里就能跑，也能跑在无头浏览器、无头虚拟机里，适合大范围修改，还能被当脚本调用。

当时不少资深开发者其实是混着用的：用 Claude Code 这类 CLI 做长周期开发，再用 GUI 做代码审查。

但后来有资方放话「CLI 才是 Agent 的正确形态，不应该再投资 GUI 思维的软件公司」。那篇文章我到现在还留着，今天看过于极端，已经成了笑柄。

逐项比下来，到 2026 年，两条路线开始合流——CLI 工具纷纷推出桌面版，Cursor 3 也改成以 Agent 窗口为中心，原本做 GUI 的产品也要出自己的 CLI 套件。到头来各家是两个都要，谁也不做取舍。

## Vibe Coding：从新词到年度词汇

接下来是 Vibe Coding。这个词由 Karpathy 提出，2025 年年中开始爆火。

意思大致是：完全沉浸在氛围里，接受 AI 的一切修改，甚至忘了代码的存在。这个词后来被收录进词典，成了 2025 年的年度词汇。

这类产品里最典型的是 Lovable，8 个月做到 1 亿美元收入，速度和 Manus 相当。YC 2025 那一批公司里，有四分之一的代码是 AI 生成的。

不过，不是所有 AI 辅助编程都叫 Vibe Coding——只有当你不再审查 AI 写的代码、全部 Accept 的时候，才算真正的 Vibe Coding。

接下来要说的几起事故就和这个有关。最典型的是 METR 做的随机对照实验：让资深开发者用 AI 编程，他们自觉得快了 20%，实际效率反而降了 19%。当时看，Vibe Coding 不一定能带来效率提升；今天再看，「AI 编程到底提不提效」已经有了更清楚的答案，只是 2025 年那会儿，很多人还在犹豫。

## 删库事故与最小权限原则

下面是删库事故。目前记载里比较早、影响也大的一起，是 Replit 的删库事故，当时 CEO 还出来公开道歉了。

效果层面也有人做过调查——AI 生成的代码不是都能用的：95% 的企业在用 AI，但财务回报是负的；直到今天，很多人在 AI 上投的钱还是远多于赚回来的。不过我觉得这未必是坏事——任何行业的早期、一个人的早期，都是要花学费的。

还有 Kiro 的事故：一位亚马逊工程师用 Kiro 干活时把所有权限都放了出去，结果 Kiro 删库跑路，导致 AWS 一项服务中断了 13 个小时，全球不少服务跟着出问题。根源是人给它的权限太宽了。

要知道，权限本身就是 Harness 的一部分。给 AI Agent 和资深工程师一样的权限，它就有能力造成同等规模的破坏——出了事，你都分不清该怪人还是怪 AI。

从这些事故里，行业提炼出了一些共识：最小权限原则、破坏性操作必须经人确认。但说实话，没几个人真的遵守——你还是开着完全权限，整天使唤它跑任务，它哪天把你的机器搞成砖了你都不知道。可也没办法，你总不可能盯着它的每一步操作。

所谓安全原则，坦白讲，没几个人真会照做。我们能做的，只有祈祷模型别出幻觉，别把机器 rm -rf 全删了。

## 标准化：AGENTS.md 与 AAIF

这个阶段还有一个关键议题：标准化。

编程 Agent 普及之后，每家代码仓库里都有自己的记忆文件：Claude 用 CLAUDE.md，Cursor 用 .cursor-rules（后来改名 .cursor），Gemini CLI 用 GEMINI.md。各家 Agent 的上下文记忆互不相通，你得挨个维护。

2025 年 8 月，OpenAI 联合几家公司推出统一的 AGENTS.md——相当于给 Agent 看的 README，很快得到了其他 AI 公司的默许和共同遵守。

12 月 9 号，一个很重要的基金会成立——AAIF，挂在 Linux 旗下。各家公司把协议捐了进来：Anthropic 捐了 MCP，OpenAI 捐了 AGENTS.md，还有其他几个协议。最重要的几个协议从此交给中立机构管理，大家也不再争这到底是谁家的协议了。

## 第三代总结：向内收，也向外扩

第三代 AI Agent 最典型的特征，是「向内收，也向外扩」：向内，一些重要功能被收进模型或标准——规划被训练进了模型，工具接口收敛成 MCP 和 AGENTS.md；向外，模型的操作范围扩大了——它能操作你的整个图形界面、本机终端、测试和文件系统。

到这里，AI Agent 已经能在你的电脑上干活了，但还得你叫它，它才动。

下一步很自然：能不能不要人唤醒才操作？能不能让 Agent 常驻你的电脑、自己主动跑起来？

这就进入了第四代。
