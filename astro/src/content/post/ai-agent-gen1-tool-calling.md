---
title: 'AI Agent 发展史第 3 篇：Gen 1——工具调用，和那个唯一活下来的遗产'
weight: 3
date: 2026-11-03T16:00:00+08:00
cover: /images/covers/ai-agent-gen1-tool-calling-cover.jpg
categories: ['人工智能', 'AI Agent 发展史']
tags: ['AI Agent', '智能体', 'Function Calling', 'RAG', 'AutoGPT']
description: '第一代 Agent 长出了插件、Function Calling、Code Interpreter、RAG、AutoGPT，但真正活下来的只有一个不起眼的接口格式——热度和价值在这个行业里经常不是一回事。'
math: false
mermaid: false
comments: true
toc: true
---

第一代 Agent 的核心关键词是**工具调用**。这一代 Agent 身上长出了好几个新部件：插件、Function Calling、RAG、向量数据库、Code Interpreter，还有一些特别早期的多 Agent 框架。我们一个个看，哪些活下来了，哪些被时代抛弃。

## 插件：第一个失败的实验

最早的实践是 ChatGPT 官方推出的插件，2023 年 3 月 23 号上线。首期有 Zapier、Wolfram 这类合作方，用户可以在对话里让模型查航班、做精确计算。

但实际用起来问题很多：你得先去商店挑插件，一次最多只能开三个；模型什么时候调这些工具是不确定的，你不明确让它调，它可能根本不会调用；商店里有几百个插件，高频使用的没几个。

2024 年 4 月，这个功能下线了，被一个叫 GPTs 的功能取代。后来 GPTs 又被内置的联网、代码和文件能力边缘化了。

插件本身走向了失败，但它第一次回答了一个问题：**模型能不能自己决定什么时候用工具？** 答案是可以。只是这个阶段的工具接口还是太粗糙了。

## Function Calling：外挂沉淀成标准的第一个例子

什么样的工具接口才能长期留存？是 Function Calling，也就是函数调用，2023 年 6 月 13 号发布。

在此之前，如果开发者想让模型去调一个接口，只能用一段话描述"我想查一下上海明天的天气"，然后用正则表达式从输出里抠出对应的参数和温度。只要模型的输出格式稍微一变，整个调用就失败，而且每家都得自己写一套。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-function-calling-loop" viewBox="0 0 680 440" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>正则从自然语言里抠参数容易断，Function Calling 让模型出结构、程序去执行</title>
  <style>
    .diag-function-calling-loop { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-function-calling-loop { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M32,39.8 Q170.6,40.9 310,39.4 Q324.2,39.7 324.2,54 Q324.1,231.9 324.4,410 Q324.1,424.1 310,424.5 Q171.4,424.3 32,424.2 Q17.6,424.2 18.7,410 Q17.3,231.6 17.9,54 Q17.6,40.3 32,39.8 Z" fill="none" stroke="var(--gray)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M370,40.3 Q508.7,39.4 648,39 Q661.8,40.1 662.5,54 Q662.8,231.5 662.4,410 Q662.2,423.6 648,423.8 Q508.6,424 370,423 Q356.2,424.2 355,410 Q356.3,232.1 355.4,54 Q355.9,39.7 370,40.3 Z" fill="none" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="171" y="66" font-size="18" text-anchor="middle" dominant-baseline="central" fill="var(--gray)" font-weight="bold">正则抠参数</text>
  <text x="509" y="66" font-size="18" text-anchor="middle" dominant-baseline="central" fill="var(--blue)" font-weight="bold">Function Calling</text>
  <path d="M58,95 Q170.6,95.9 284,96.4 Q294.3,96.3 294.4,106 Q293.9,131 294.6,156 Q293.9,165.7 284,165 Q170.8,166.7 58,165.9 Q48,166 48.1,156 Q47.9,130.6 48.5,106 Q48.2,96.1 58,95 Z" fill="var(--fill-gray)" stroke="var(--gray)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="171" y="120.4" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">模型吐出</text><text x="171" y="141.6" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">一段自然语言</text>
  <line x1="171" y1="166" x2="171" y2="187" stroke="var(--gray)" stroke-width="1.7" stroke-linecap="round"/><path d="M171,196 L174.6,187 L167.4,187 Z" fill="var(--gray)"/>
  <path d="M58,195.8 Q171.5,195.3 284,196.1 Q293.7,196.3 293.4,206 Q293.2,222.4 293,240 Q294.1,249.7 284,249.3 Q171.6,250.4 58,250 Q47.7,249.7 47.7,240 Q48.4,222.8 47.8,206 Q48.4,195.7 58,195.8 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="171" y="223" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">正则去抠参数</text>
  <line x1="171" y1="250" x2="171" y2="277" stroke="var(--red)" stroke-width="1.7" stroke-linecap="round"/><path d="M171,286 L174.6,277 L167.4,277 Z" fill="var(--red)"/>
  <path d="M58,285.5 Q170.5,285.7 284,286 Q294.3,286.2 293.1,296 Q293.5,320.5 293,346 Q293.7,355.9 284,355.6 Q170.4,356.3 58,356.5 Q48.2,356.3 47.2,346 Q48.5,320.6 48.6,296 Q47.7,285.8 58,285.5 Z" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="171" y="310.4" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">格式稍一变</text><text x="171" y="331.6" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">整个调用就失败</text>
  <circle cx="171" cy="378" r="14" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.5"/><line x1="161.2" y1="368.2" x2="180.8" y2="387.8" stroke="var(--red)" stroke-width="2.2" stroke-linecap="round"/><line x1="180.8" y1="368.2" x2="161.2" y2="387.8" stroke="var(--red)" stroke-width="2.2" stroke-linecap="round"/>
  <text x="200" y="378" font-size="15" text-anchor="start" dominant-baseline="central" fill="var(--red)" font-weight="bold">容易断</text>
  <path d="M396,96.8 Q509.1,96.8 622,95.8 Q632.4,96.3 631.4,106 Q632.2,131.6 632,156 Q631.7,166.4 622,165 Q508.8,166.7 396,165.1 Q386,165.7 386.7,156 Q386.9,131 385.2,106 Q386,95.7 396,96.8 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="509" y="120.4" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">声明 JSON Schema</text><text x="509" y="141.6" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">函数名、参数</text>
  <text x="509" y="178" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--green)">声明</text>
  <line x1="509" y1="166" x2="509" y2="187" stroke="var(--green)" stroke-width="1.7" stroke-linecap="round"/><path d="M509,196 L512.6,187 L505.4,187 Z" fill="var(--green)"/>
  <path d="M396,195.7 Q508.9,195.7 622,195.9 Q632.1,195.8 632,206 Q631,222.9 631.8,240 Q632,249.9 622,249 Q508.7,251 396,249.2 Q386.4,249.6 386,240 Q386.9,223.5 386.1,206 Q385.9,196.2 396,195.7 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="509" y="223" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">模型输出结构化调用</text>
  <text x="509" y="262" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--blue)">结构化调用</text>
  <line x1="509" y1="250" x2="509" y2="271" stroke="var(--blue)" stroke-width="1.7" stroke-linecap="round"/><path d="M509,280 L512.6,271 L505.4,271 Z" fill="var(--blue)"/>
  <path d="M396,280.1 Q509.3,279.6 622,279.2 Q631.8,279.7 632.9,290 Q632.6,306.6 631.4,324 Q631.7,334 622,335 Q508.5,334.3 396,334.8 Q385.7,333.7 385.4,324 Q386.7,306.6 386,290 Q386.2,279.8 396,280.1 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="509" y="307" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">程序执行</text>
  <text x="509" y="346" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--teal)">执行</text>
  <line x1="509" y1="334" x2="509" y2="351" stroke="var(--teal)" stroke-width="1.7" stroke-linecap="round"/><path d="M509,360 L512.6,351 L505.4,351 Z" fill="var(--teal)"/>
  <path d="M396,359.1 Q508.5,360.5 622,359.8 Q631.8,359.7 632,370 Q631,384.3 631.1,398 Q631.9,407.9 622,407.3 Q509.2,408 396,408.5 Q386.2,407.8 386.7,398 Q386.2,383.9 386.2,370 Q385.9,360.4 396,359.1 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="509" y="384" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">结果交还模型</text>
  <path d="M632,384 C670,260 670,140 632,131" fill="none" stroke="var(--purple)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M632,131 L639.9,136.6 L641.6,129.6 Z" fill="var(--purple)"/>
  <text x="658" y="250" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--purple)">交还</text>
</svg>
</figure>


有了 Function Calling 之后，输出结构被标准化了：可以用一个 JSON Schema 声明有哪些函数、需要什么参数，模型需要时直接输出这一段结构化调用，程序去执行，再把结果交还给模型。

这件事在今天看平平无奇，但它是把"模型决定做什么"和"程序真正去做"之间的接口给确定了下来。各家模型很快跟进同样的格式，它成了 Harness 里第一个被所有人一起采用的通用部件。直到今天，所有 Agent 能动手，靠的底层能力还是 Function Calling。

## Code Interpreter：第一次"自己跑代码"

还有一个功能是 Code Interpreter，也是 ChatGPT 发布的，影响深远。

用户可以上传一份 Excel，模型在隔离的沙盒里写代码、运行、看到报错、自己改代码、再跑，最后把图表画出来。这其实是把第零代里"人工复制粘贴"的循环，由模型自己完成了——第一次实现了一个自己跑起代码、完成任务的循环，报错不需要人类复制回去。

七个部件里的"运行环境"（一个虚拟沙箱）第一次出现了，"反馈和验证"这个部件也有了最早期的雏形。

## RAG：没死的那个

这个阶段另一个关键关键词是 RAG（检索增强生成）和向量数据库，本质上是同一个东西，用来应对大模型知识滞后和幻觉的问题。

RAG 在 2023 年成为企业大模型的标准做法：企业把文档切成很多小段，变成向量存进数据库；用户提问时，先检索与关键词最近的几段，把相关素材一起交给模型。这个领域当时融了很多钱，大量跟风资本进来，比如 Pinecone 在 4 月融了 1 亿美元。当时大量应用就是"和你的 PDF 聊天"。

后来发生的事很诡异：上下文窗口快速从 4K 扩展到几十万、上百万 Token，主流数据库也加上了向量检索功能，独立的向量数据库赛道很快就降温了。但 RAG 本身没死，它现在是上下文工程的一部分。

## 插件生态的完整葬礼

OpenAI 在插件这条线上的产品演变，就是这一代的标本：从插件到 GPTs 再到 GPT Store，最后三个全死了，联网、文件、代码能力全部变成内置功能。

虽然 OpenAI 推出 Marketplace 后，有大量人去创建实例或商品，但绝大多数只是一份提示词加几份文件，很容易被复制，一年之后没人再提。再往后，联网、文件、代码都变成 GPT 的内置功能。

这里能看出一个早期端倪，之后会一次次应验：**谁掌握了底层平台，谁就能在下一次更新里，把上一轮的外挂功能变成内置的默认功能。**

## AutoGPT：让"Agent"这个词第一次出圈

这个阶段还有 AutoGPT，它是让"Agent"这个词第一次出圈的产品，2023 年 3 月发布。

你只需要给它一个目标，比如"调研中国咖啡市场并写报告"，GPT-4 就自己去拆解任务、搜索网页、写文件、生成新任务，一直循环。几周之内它的 GitHub 星标就超过了 10 万。

但实际跑起来，常见的结局是 AI Agent 陷入原地打转——反复搜同一个东西，或者跑了几十轮然后宣布任务完成，打开一看报告是空的。而且当时 GPT-4 非常贵，每次跑任务要花几美元到几十美元，几个月后新鲜感就过去了。

AutoGPT 最核心的问题在于**多步任务的错误累积**。当时模型能力很差，假设每一步做对的概率是 95%，20 步累积下来，全对的概率就只有 35% 左右了。这些小小的错误会不断累积。这笔账今天依然要算，我们后面讲长程任务时还会用到它——模型的每一步就算再可靠，任务一长总会出错，区别只在于有没有人或机制去发现这个错误。

AutoGPT 本质是一个开环系统：让大模型自己计划、然后做、再做、最后结束。而下一阶段，AI 决策中会引入一个非常关键的检查环节。

## 记忆与技能：早有原型

记忆和技能在这个阶段也有一些早期研究。

2023 年 4 月，斯坦福做了一个实验，把 25 个角色放在一个虚拟小镇里，它们各自有记忆流、反思、计划的结构，还会自发组织派对。

2023 年 5 月，有个博主尝试让 AI 在《我的世界》里自己写代码，把成功的做法存进技能库，以后直接复用。

你会发现，这其实就是 memory.md 和 Agent Skills 的早期原型——前者的记忆和反思，后者的技能库，后来都成了产品的标准配置。

## 第一代总结：热度和价值不是一回事

回头看第一代 AI Agent，Function Calling 是唯一留存下来的遗产。其他的——AutoGPT 这样的 Agent 系统、GPT-4 的技能库、"和 PDF 聊天"、向量库的估值——本质上都被历史的洪流抛弃了。

当年最热闹的东西都没留下来，留下来的反而是一个不起眼的接口格式。**热度和价值在这个行业里经常不是一回事**。
