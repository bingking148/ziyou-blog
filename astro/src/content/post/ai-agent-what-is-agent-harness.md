---
title: 'AI Agent 发展史第 1 篇：什么是 AI Agent——一个围绕"模型之外的一切"展开的故事'
weight: 1
date: 2026-11-03T09:00:00+08:00
cover: /images/covers/ai-agent-history-cover.jpg
categories: ['人工智能', 'AI Agent 发展史']
tags: ['AI Agent', '智能体', 'Harness', '大模型', 'AI 发展史']
description: 'AI Agent 不是聊天机器人，差别全在「循环」上。用「模型 + Harness」两分法拆开 Agent：模型提供智能，Harness 是模型之外的一切——七个部件，加上一条贯穿四年的沉淀规律。'
math: false
mermaid: false
comments: true
toc: true
---

先说清楚，我要讲的是 AI Agent 从 2022 年到 2026 年这四年是怎么一步步长成今天这个样子的。这不是一个简单的功能列表，而是一段有起有落的历史——我用"世代"来划分它。

在正式进入历史之前，得先问一个基础问题：**什么是 AI Agent？**

## 定义本身就在变

不同时期对这个词有不同定义。放在 2026 年 11 月这个时间点，我给出的定义是：

> 以大模型为决策核心，能够在一个循环里不断执行、决定下一步、调用外部工具、改变世界、再根据结果调整，最终把目标完成的软件系统。

它和聊天机器人的差别，全在这个"循环"上。聊天机器人说完就结束了，执行还得靠人来接；而 Agent 是"想做、看结果、再想"，一直循环到任务真正结束。

## Agent = 模型 + Harness

Agent 的构成其实很简单，就两部分：**模型**和 **Harness**。

模型大家都知道，就是基座模型、底层模型，负责提供智能。但基座模型本身没有任何执行能力，它只会不断预测下一个词。

真正负责执行的是 Harness。这个词来自英语里的马具、缰绳、车架——就是那些套在马身上、让人能驾驭马的器械。模型是那匹有力量的马，可要是没有 Harness，马跑得再快，人也拿它做不了多少事。

在 Agent 的场景里，Harness 指代的是"模型之外的一切"。具体拆开，我梳理出七个构成部分：

1. 指令，也就是 Prompt
2. 上下文和记忆
3. 工具和行动
4. 循环与编排
5. 反馈和验证
6. 运行环境与权限
7. 交付界面

第七个是很多人还没意识到、但最近正在发生的变革——交付界面。

这七个部件的形态如何演进，本身就是 AI Agent 的整个发展史。后面每一代 Agent，你都会看到它们各自的变化。

## 一条贯穿始终的规律

Harness 有一个通用的演变规律，这是全篇最重要的一条规律，后面每一代都会印证它：

> 新问题刚出现时，人们先用一个外部补丁把它补上，作为外挂。补丁用久了、做法成熟了、能说清楚了，它就会沉淀下来——要么写成开放标准（比如 Function Calling 的格式、MCP、AGENTS.md 上下文、Agent Skills），要么干脆被训练进模型（思维链后来直接成了推理模型的一部分，操作电脑也成了模型近乎原生的能力）。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-sedimentation-cycle" viewBox="0 0 680 460" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>外挂沉淀成开放标准或训练进模型，随后又长出新的外挂</title>
  <style>
    .diag-sedimentation-cycle { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-sedimentation-cycle { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <circle cx="340" cy="210" r="50" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="2"/>
  <text x="340" y="210" font-size="20" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">模型</text>
  <path d="M46,69.9 Q91.5,69.9 136,70.1 Q146.4,70.4 146,80 Q145.3,93 146.2,106 Q146.1,116.1 136,116.3 Q90.5,115.6 46,116.6 Q35.7,115.6 35.1,106 Q36.4,92.4 36.7,80 Q36,69.6 46,69.9 Z" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="91" y="93" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor">新问题</text>
  <line x1="91" y1="116" x2="91" y2="167" stroke="var(--red)" stroke-width="1.8" stroke-linecap="round"/><path d="M91,176 L94.6,167 L87.4,167 Z" fill="var(--red)"/>
  <path d="M46,179.9 Q91.2,179.2 136,180.3 Q145.6,180.3 145,190 Q145.5,206.4 145.7,222 Q145.7,232.1 136,232.4 Q91.1,232.3 46,232.2 Q35.9,231.9 35.3,222 Q35.3,206.5 35.9,190 Q36.3,179.6 46,179.9 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="91" y="206" font-size="20" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">外挂</text>
  <path d="M412,43.5 Q520.2,44.7 628,44.4 Q639.6,43.8 639.3,56 Q639.3,118.7 639.4,182 Q639.7,194.3 628,194.5 Q520,193.4 412,193.2 Q400.2,194.2 399.6,182 Q400.7,119.1 399.9,56 Q400.3,44.2 412,43.5 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="520" y="70" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">写成开放标准</text>
  <line x1="418" y1="88" x2="622" y2="88" stroke="var(--green)" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
  <rect x="410" y="100" width="108" height="36" rx="8" fill="#fff0" stroke="var(--green)" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="464" y="118" font-size="13" text-anchor="middle" dominant-baseline="central" fill="currentColor">Function Calling</text>
  <rect x="526" y="100" width="102" height="36" rx="8" fill="#fff0" stroke="var(--green)" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="577" y="118" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">MCP</text>
  <rect x="410" y="144" width="108" height="36" rx="8" fill="#fff0" stroke="var(--green)" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="464" y="162" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">AGENTS.md</text>
  <rect x="526" y="144" width="102" height="36" rx="8" fill="#fff0" stroke="var(--green)" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="577" y="162" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">Agent Skills</text>
  <path d="M412,229.2 Q520.2,230.9 628,230.4 Q639.8,230.2 639.5,242 Q640.5,285.2 639.5,328 Q640.1,339.7 628,339.6 Q519.9,340.6 412,340.4 Q400,340.1 399.2,328 Q400.8,284.8 399.4,242 Q399.7,230.1 412,229.2 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="520" y="256" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">训练进模型</text>
  <line x1="418" y1="274" x2="622" y2="274" stroke="var(--purple)" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
  <rect x="418" y="286" width="96" height="36" rx="8" fill="#fff0" stroke="var(--purple)" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="466" y="304" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">思维链</text>
  <rect x="526" y="286" width="100" height="36" rx="8" fill="#fff0" stroke="var(--purple)" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="576" y="304" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">操作电脑</text>
  <path d="M146,196 Q260,120 400,110" fill="none" stroke="var(--green)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M400,110 L390.8,107.1 L391.3,114.2 Z" fill="var(--green)"/>
  <path d="M146,220 Q260,280 400,280" fill="none" stroke="var(--purple)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M400,280 L391,276.4 L391,283.6 Z" fill="var(--purple)"/>
  <path d="M410,371 Q520.3,369.3 630,369 Q640.3,370.3 641,380 Q640.8,394.2 639,408 Q640.2,417.8 630,418.8 Q519.7,417.7 410,419 Q400.3,418 400.4,408 Q399.5,393.7 399.5,380 Q399.8,370 410,371 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="520" y="394" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">又出现新的外挂</text>
  <path d="M640,118 Q668,250 640,394" fill="none" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M640,394 L645.3,385.9 L638.2,384.5 Z" fill="var(--amber)"/>
  <line x1="520" y1="340" x2="520" y2="361" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round"/><path d="M520,370 L523.6,361 L516.4,361 Z" fill="var(--amber)"/>
  <path d="M400,394 C200,450 20,360 36,232" fill="none" stroke="var(--amber)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M36,232 L30.8,241.4 L38.7,242.4 Z" fill="var(--amber)"/>
  <text x="200" y="430" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)" font-style="italic">Harness 不会消失，只是向外搬</text>
</svg>
</figure>


原来的问题解决之后，外部又会出现新的部件，新的部件又成为新的外挂。Agent 因此能做更多、更长的事情。

这条规律有两个推论：

**第一，Harness 不会因为模型变强而消失，它只是在不断向外搬。** 那些认为"模型强了 Harness 就没用了"的想法，被反复打脸。

**第二，做外挂一定要小心。** 你今天摸索出来的东西，明天可能就被纳入了模型之内，或者被沉淀成了一个开放标准。这个残酷的循环，后面的每一代里都会上演。

## 每一代的突破，只发生在个别部件上

关于 Harness 七个部件在每个世代里新增了什么，我做了一张表格，按零到六代、七个部件划分，正好七七四十九个格子：

| 部件 | 管什么 | 最初 | 随后 | 2026 年 |
|---|---|---|---|---|
| ① 指令 | 让模型做什么、按什么规矩做 | 提示词、自定义指令 | CLAUDE.md、AGENTS.md 等项目说明 | SKILL.md 按需加载；SOUL.md 写明性格和语气 |
| ② 上下文与记忆 | 每一步给模型看什么，跨会话记住什么 | RAG 与向量数据库 | 长上下文、上下文压缩、把文件当作外部记忆 | MEMORY.md；用过的做法自动整理成技能 |
| ③ 工具与行动 | 模型能用什么去改变外部世界 | 插件、Function Calling | MCP、Computer Use | 内置浏览器、插件与连接器 |
| ④ 循环与编排 | 由谁推动下一步，多个 Agent 怎样分工 | 人工复制粘贴；AutoGPT 式一路做到底 | ReAct 式边做边看、工作流、多智能体 | 心跳机制自主启动；多个 Agent 并行 |
| ⑤ 反馈与验证 | 怎样判断做得对不对，错了怎样退回 | 把代码报错交还给模型 | 自动测试与评测基准 | 长任务中自查、存档、回退，知道何时停下来问人 |
| ⑥ 运行环境与权限 | Agent 在哪台电脑上运行，能动哪些东西 | 隔离的代码沙盒 | 用户本地的终端和代码库、云端虚拟机 | 平台为每个代理托管一台云电脑，并保管账号凭证 |
| ⑦ 交付界面 | 人怎样查看、监督和验收 | 聊天框 | Artifacts、编辑器、终端界面 | 多 Agent 管理窗口、桌面 Work 应用、模型自己生成的界面 |

这里有两个观察值得先记住：

- 每一代的突破，往往集中在其中一两个部件上，而不是全面开花。
- 不同形态的 Agent，隔一代才会在某个 Harness 部件层面有一次显著升级。

这也是为什么"世代"这个划分方式讲得通——每一代都有一个明确的主题。

## 前史：ChatGPT 之前的三条路线

正式进入历史前，先看前史——2022 年 11 月 ChatGPT 发布之前，那些"类似 Agent"的实体。

第一类是 Siri 这样的语音助手。你可以让它定闹钟、查天气、放音乐、打电话、讲故事，但一旦你说"帮我把这周报销处理一下"，它就听不明白了。它的原理是识别意图、调用预设技能，功能范围非常有限。

第二类是企业里的 RPA（机器人流程自动化）。做法是把固定操作录成脚本——复制表格、填进系统、发邮件——人做一遍，脚本照着执行。可前端界面稍微一变，流程就断了，极其缺乏可复现性和稳定性。

第三类是早期的人工智能，比如 AlphaGo 这种下围棋的。它本质是强化学习，能在规则明确、奖励明确的系统里超过人类，但没法完成我们今天认为 AI 该做的复杂操作。

这三条路线看着很不一样，可卡住它们的其实是同一件事：**世界必须先被人分割成意图、步骤和奖励，然后按程序执行。** 换句话说，当时整个系统几乎全是 Harness，缺的是一个能接住开放指令的模型核心。

而后来补上这个核心的，是大语言模型、Transformer 模型——模型自身的智能更通用、更泛化，软件第一次能承接开放指令，自己拆解步骤。

不过这个核心本身也不是特别可靠。后面四年的工程，本质就是围绕它，给它搭起一整套脚手架。

## 那些被低估的积累期

在 OpenAI 发布 ChatGPT 之前的几年，是一个关键的积累期。AI 和大模型还没进入公众视野，但很多关键零件已经在攒了：

- Transformer 架构，2017 年发布
- GPT-3，以及最早的 Codex 代码模型——注意，这个 Codex 是当时一个模型的名称，不是我们今天说的 Codex Agent，它是 Copilot 预览版里的那个模型
- 思维链，2022 年 1 月就发明了，而不是在大模型之后
- ReAct，在 ChatGPT 发布前一个月就发布了，同样不是在大模型之后
- LangChain，2022 年 10 月发布

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-prehistory-red-dots" viewBox="0 0 680 300" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>2017 到 2022 秋的技术前史，红点落在工具行动与循环编排</title>
  <style>
    .diag-prehistory-red-dots { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-prehistory-red-dots { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <line x1="30" y1="168" x2="620" y2="168" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <line x1="620" y1="168" x2="664" y2="168" stroke="var(--gray)" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="6 5"/><path d="M672,168 L664,164.8 L664,171.2 Z" fill="var(--gray)"/>
  <text x="668" y="230" font-size="14" text-anchor="end" dominant-baseline="central" fill="var(--gray)">还缺一个</text>
  <text x="668" y="248" font-size="14" text-anchor="end" dominant-baseline="central" fill="var(--gray)">够强的通用模型</text>
  <line x1="60" y1="160" x2="60" y2="176" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <text x="60" y="190" font-size="12" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">2017</text>
  <path d="M7.3,90.9 Q60.3,90.8 112.7,90.4 Q122.5,89.9 122.2,100 Q123.6,108.5 123,116 Q123,125.9 112.7,126.2 Q59.9,127 7.3,125.3 Q-2.8,126.1 -3.6,116 Q-1.8,107.9 -3.1,100 Q-2.5,90 7.3,90.9 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/><text x="60" y="108" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">Transformer</text>
  <line x1="60" y1="126" x2="60" y2="160" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="175" y1="160" x2="175" y2="176" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <text x="175" y="190" font-size="12" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">2020–2021</text>
  <path d="M107.9,219.3 Q175.2,220 242.1,220.4 Q251.9,219.6 251.5,230 Q252.8,238 252.7,246 Q252.5,256.2 242.1,256 Q174.4,255.7 107.9,255.4 Q98.2,256.1 98.1,246 Q98.5,237.7 97,230 Q97.5,219.9 107.9,219.3 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/><text x="175" y="238" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">GPT-3 与 Codex</text>
  <line x1="175" y1="220" x2="175" y2="176" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="300" y1="160" x2="300" y2="176" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <text x="300" y="190" font-size="12" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">2022 年 1 月</text>
  <path d="M267,91 Q299.4,91 333,89.2 Q343.2,89.6 342.3,100 Q343.3,107.8 342.2,116 Q343.3,126.1 333,126.8 Q300.6,125.6 267,125.4 Q256.8,125.8 257.2,116 Q257.4,108.5 257.9,100 Q257.3,90.1 267,91 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/><text x="300" y="108" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">思维链</text>
  <line x1="300" y1="126" x2="300" y2="160" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="415" y1="160" x2="415" y2="176" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <text x="415" y="190" font-size="12" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">2022 年 10 月</text>
  <path d="M382,90.9 Q415.5,89.1 448,90.9 Q458,90.2 458.2,100 Q458.1,107.5 457.8,116 Q457.9,125.6 448,125.4 Q414.6,125.9 382,125.9 Q372.2,126.1 371,116 Q372.4,107.9 371.1,100 Q372.1,90.1 382,90.9 Z" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="415" y="108" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">ReAct</text>
  <line x1="415" y1="126" x2="415" y2="160" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="500" y1="160" x2="500" y2="176" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <text x="500" y="190" font-size="12" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">2022 年 10 月</text>
  <path d="M455.3,220.4 Q499.6,221 544.7,220.7 Q554.7,220.4 554.1,230 Q553.9,238.3 555.1,246 Q554.9,256 544.7,255.3 Q500.3,256.6 455.3,256.4 Q445.1,256.4 445.2,246 Q446.3,237.5 446,230 Q444.9,220.2 455.3,220.4 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/><text x="500" y="238" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">LangChain</text>
  <line x1="500" y1="220" x2="500" y2="176" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="585" y1="160" x2="585" y2="176" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <text x="585" y="190" font-size="12" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">2022 年 11 月</text>
  <path d="M547,89.7 Q585.4,89.4 623,90.9 Q633.2,90.1 633.8,100 Q632,108.6 633.3,116 Q633.3,125.7 623,125.5 Q584.9,126.2 547,125.6 Q536.9,126 536.2,116 Q537.7,108 537.4,100 Q536.7,90.4 547,89.7 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/><text x="585" y="108" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">ChatGPT</text>
  <line x1="585" y1="126" x2="585" y2="160" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  <circle cx="384" cy="36" r="5" fill="var(--red)" stroke="var(--red)" stroke-width="1"/>
  <text x="394" y="36" font-size="14" text-anchor="start" dominant-baseline="central" fill="var(--red)" font-weight="bold">工具行动</text>
  <circle cx="384" cy="58" r="5" fill="var(--red)" stroke="var(--red)" stroke-width="1"/>
  <text x="394" y="58" font-size="14" text-anchor="start" dominant-baseline="central" fill="var(--red)" font-weight="bold">循环编排</text>
  <line x1="415" y1="70" x2="415" y2="88" stroke="var(--red)" stroke-width="1.3" stroke-linecap="round"/>
</svg>
</figure>


所以你会发现，在 ChatGPT 发布之前，Agent 的技术前身其实已经差不多凑齐了。图上带红点的这些关键零件，就是今天我们理解的 Harness 部件雏形，主要集中在工具行动和循环编排这两个领域。

其中最值得关注的是 ReAct。它非常有意思——这是第一次有人提出让大模型"先想、后做、再看、再进入循环"的框架范式。它是 2022 年 10 月由普林斯顿大学和谷歌联合提出的，后面所有 Agent 的骨架里都有它的影子，虽然早期模型并没有把它整合进去。

到 2022 年秋天，状态是：技术组件已经具备，但还缺一个足够强大、足够通用的模型，来打入 C 端市场，让企业愿意允许它构建智能应用。

缺的这一环，很快就要被补上了。
