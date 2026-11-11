---
title: 'AI Agent 发展史第 4 篇：Gen 2——用流程换确定性'
weight: 4
date: 2026-11-05T20:00:00+08:00
cover: /images/covers/ai-agent-gen2-workflows-cover.jpg
categories: ['人工智能', 'AI Agent 发展史']
tags: ['AI Agent', '智能体', '工作流', '上下文工程', 'RAG']
description: '第二代的关键词是「用流程换确定性」：吴恩达的迭代工作流用 95.1% 打赢更强的模型，Anthropic 讲工程克制，RAG 与长上下文之争引出上下文工程，SWE-agent 重新设计工具接口——这一代也淘汰了一大批厚重结构。'
math: false
mermaid: false
comments: true
toc: true
---

第二代 Agent 的时间线，大约从 2023 年底到 2024 年一整年。

AutoGPT 虽然失败了，但它留下的教训被整个行业吸收了。这段时间大家的思路反了过来：Scaling Law 还没真正跑起来，模型远没到可靠的地步，那就不能让它一路做到底——**用人设计好流程，把步骤串起来，让每一步都检查上一步的结果**。

这一代的关键部件是循环编排和反馈验证。说白了，大家在尝试用「可信的确定结构」，去换 Agent 生成结果的可预期性。

## 吴恩达用数字证明了 Harness 的价值

吴恩达在 2024 年 3 月总结过迭代工作流的效果。他在一个编程基准上做了对比：

- GPT-3.5 直接回答，正确率只有 48%
- GPT-4 直接回答，正确率 67%
- 但把 GPT-3.5 放进一个迭代工作流里——写、检查、修改、再提交——正确率能到 **95.1%**

弱的模型配上好的流程，能打赢更强的模型。这组数字在当时影响非常大，因为它把大家的注意力从「模型有多聪明」拉到了「如何设计一个足够好的系统」上。这是第一次有人用数字证明 Harness 的关键价值。

吴恩达还总结了四种 AI Agent 设计模式：

1. **反思**：Agent 写完后，自己检查、批评、修改自己的输出
2. **工具使用**：搜索、执行代码、查数据库
3. **规划**：让 Agent 拆目标、逐步执行
4. **多 Agent**：不同角色分工和互审

这里有个细节：反思和规划是最早失效的两个——它们后来直接被收进了大模型的推理能力里。

## Anthropic 的工程克制

Anthropic 在 2024 年 12 月发过一篇被大量引用的文章《构建有效智能体》（Building Effective Agents）。

它把系统分成两类：**工作流**——路径是代码预先写好的，模型按路径走；**智能体**——流程和工具由模型自己决定。中间还列了几种常见结构，提示链、路由、并行编排、一个拆多个。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-workflow-to-agent-spectrum" viewBox="0 0 680 280" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>从工作流到智能体是一条谱：中间还有提示链、路由、并行编排、一个拆多个</title>
  <style>
    .diag-workflow-to-agent-spectrum { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-workflow-to-agent-spectrum { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <line x1="40" y1="150" x2="640" y2="150" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="640" y1="150" x2="650" y2="150" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M660,150 L650,146 L650,154 Z" fill="currentColor"/>
  <path d="M30,70.2 Q79.4,69.7 130,69.7 Q140.2,70.2 140.7,80 Q140.2,104.6 139.8,130 Q139.8,140.3 130,139.8 Q79.5,139.5 30,139.7 Q20,140.4 19.1,130 Q20,105 20.8,80 Q19.8,69.9 30,70.2 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="80" y="86.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">工作流</text><text x="80" y="105" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">路径由代码</text><text x="80" y="123.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">预先写好</text>
  <line x1="80" y1="140" x2="80" y2="150" stroke="var(--blue)" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M166,177.8 Q200,177.9 234,178.6 Q244.1,178.3 243.4,188 Q243.5,200.6 244.4,212 Q243.7,222.3 234,221.5 Q199.5,221.9 166,223 Q156.2,222.4 156.1,212 Q156.7,199.8 156.9,188 Q155.8,178.2 166,177.8 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="200" y="200" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">提示链</text>
  <line x1="200" y1="150" x2="200" y2="178" stroke="var(--teal)" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M276,179 Q310.1,177.9 344,178.1 Q354.4,178.1 353.3,188 Q353.8,200 353,212 Q354,222.3 344,222.6 Q310.6,221.2 276,221.7 Q266.4,221.9 266.3,212 Q265.4,199.5 265,188 Q266.3,177.8 276,179 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="310" y="200" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">路由</text>
  <line x1="310" y1="150" x2="310" y2="178" stroke="var(--teal)" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M386,177 Q419.6,179 454,179 Q463.9,178 464.9,188 Q464,199.9 463.5,212 Q464.3,222.3 454,221.8 Q420.4,221.5 386,222.6 Q376.1,221.8 376.1,212 Q376.2,199.5 376.4,188 Q376.4,177.8 386,177 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="420" y="200" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">并行编排</text>
  <line x1="420" y1="150" x2="420" y2="178" stroke="var(--teal)" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M491.8,177.2 Q530.4,177.9 568.2,177.8 Q578.2,178.1 577.7,188 Q577.8,200.1 578.6,212 Q578.6,222.4 568.2,221.4 Q529.4,221.6 491.8,222.5 Q481.6,222.2 482.7,212 Q481.5,199.6 480.9,188 Q481.7,177.7 491.8,177.2 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="530" y="200" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">一个拆多个</text>
  <line x1="530" y1="150" x2="530" y2="178" stroke="var(--teal)" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M550,40.1 Q604.7,39.6 660,39.3 Q670.1,39.7 670.2,50 Q670.1,80.4 670.8,110 Q670.2,120.3 660,119.6 Q605.3,120.7 550,119.8 Q540.4,120.1 539.3,110 Q539.2,79.6 539.6,50 Q540.1,39.8 550,40.1 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="605" y="61.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">智能体</text><text x="605" y="80" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">流程和工具</text><text x="605" y="98.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">由模型自己决定</text>
  <line x1="605" y1="120" x2="605" y2="150" stroke="var(--amber)" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="620" cy="36" r="12" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.5"/><line x1="611.6" y1="27.6" x2="628.4" y2="44.4" stroke="var(--red)" stroke-width="2.2" stroke-linecap="round"/><line x1="628.4" y1="27.6" x2="611.6" y2="44.4" stroke="var(--red)" stroke-width="2.2" stroke-linecap="round"/>
  <text x="500" y="36" font-size="14" text-anchor="end" dominant-baseline="central" fill="var(--red)">不要默认从这里开始</text>
</svg>
</figure>


给工程者的建议是从最简单的方案做起，确实需要灵活性时再往复杂走。这句话当时听是工程上的克制，今天看依然大半成立——就算大模型有了足够强的 Agentic 能力，也不能事事都交给它。跑一个简单脚本、从网页上抄一段信息，这种事还是该交给脚本工作流。

很多 Agent 项目失败，就失败在一上来就选了最右边的「完全 Agentic」做法。这不光今天看危险，放在 2024 年看更危险——那时候的模型还很拉胯。

## 可视化搭建平台：纯纯的小丑

从 2023 年底开始，市面上冒出一大批可视化搭建平台、低代码框架、Agent 开发框架：Dify、Coze、n8n，还有百度、腾讯、阿里各家的平台。用户像搭积木一样拖拽节点，把大模型、知识库、条件分支拼成一个智能体，发布到网页、飞书或微信。

程序员这边用的框架是 LangGraph、AutoGen、CrewAI，后来收拢成了 Agent SDK。

当时很多人不看程序员的框架，反而更相信可视化——现在回头看，这个判断相当离谱。不少非程序员觉得 AI 时代来了，自己也能参与了；不少资方也觉得这种拖拽式低代码平台有很强的发展预期。后来大家都知道了，这就是一场纯纯的小丑表演。

到了 Vibe Coding 的时代，没人在乎拖拽搭建了——模型已经强到能直接听懂一句话描述的流程，甚至直接生成代码，拖拽节点从「降低门槛」变成了多余的复杂度来源，这个范式不到一年就失效了。

这是个非常经典的例子：为了弥补模型弱点而搭的结构，在模型变强之后，就成了整个系统的负担。这个规律后面还会一次又一次出现。

## Multi-Agent 研究：热闹不代表能用

当时的另一个方向是 Multi-Agent，出了 ChatDev 和 MetaGPT 两个代表性项目。

ChatDev 是清华团队做的，想模拟一家软件公司——CEO、产品经理、程序员、测试员分工协作。MetaGPT 也是把软件公司的流程写成多角色分工。

演示非常热闹，但热闹不代表能用。放进生产环境有两个大问题：一是 Token 消耗特别高，当时模型推理普遍偏贵；二是上下文难以共享——大模型本身没有记忆，每个 Agent 的上下文各自累积，很容易超出当时的窗口限制。

Devin 的开发商 Cognition 后来写了篇著名的文章《不要构建多智能体》，理由是多 Agent 之间难以共享上下文，容易做出相互冲突的决定。几乎同时，Anthropic 也公开了自己的多智能体研究系统，并承认：在需要大范围并行搜索的任务上，多 Agent 确实更强，但代价是 Token 消耗大约是普通对话的 15 倍以上。

两份材料放在一起看，结论很清楚：**多 Agent 不是一个通用答案，它只是一个有适用范围的工具**。任务能干净地拆开、各自独立进行时，它有用；任务需要大量共享上下文、前后决策要一致时，一个 Agent 往往更稳。直到今天，大量 Agent 设计依然遵循这个结论。

## 长上下文 vs RAG

第二代还有一场关键的基础设施之争：长上下文窗口一路扩张，把 RAG 的去留也摆上了台面。

GPT-3.5 刚发布时只有 4K 上下文。到 2023 年 11 月，GPT-4 Turbo 把长度拉到 128K，随后 Claude 到 200K，Gemini 1.5 Pro 到 1M（100 万）。这个增速非常快。

于是当时冒出一种论调：「RAG 已死」——上下文窗口涨得这么快，还有必要做向量数据库吗？要是窗口能到 1 亿、10 亿，甚至一个月翻一倍，RAG 就没有存在价值了。

实际情况不是这样，RAG 没有死，原因有几条：

- 长上下文又贵又慢，多一个 Token 就多烧一份钱，窗口一长，首字延迟和输出速度都会掉
- 企业资料库的规模远超任何上下文窗口
- 企业数据要按权限过滤、要实时更新
- 模型容易忽略长文本中间的内容，当时的注意力还没有那么集中

最后是分工：今天在涉及企业的复杂系统里，RAG 负责在海量资料里找候选，长上下文负责在较大范围内做整体理解。

至于 Coding 场景，大家倒是纷纷把 RAG 扔了——检索出来的内容和关键词经常无关，向量库的更新和编辑又是重操作。所以 Cursor、Claude 这些平台都很快把 RAG 从编码系统里彻底摘了出去。

这场争论最后落在一个更一般的问题上：**每一步究竟让模型看到哪些信息、以什么形式看到？**

你可以把上下文窗口想象成一张大小有限的书桌。桌上要放系统指令、对话历史、检索到的资料、工具说明、上一步的结果、长期记忆，快满了还要压缩成摘要。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-context-desk" viewBox="0 0 680 420" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>上下文窗口像一张大小有限的书桌，六样东西和压缩摘要在抢同一块面积</title>
  <style>
    .diag-context-desk { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-context-desk { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M80,140 L600,140 Q640,150 640,190 L620,330 Q340,360 60,330 L40,190 Q40,150 80,140 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="340" y="122" font-size="17" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">上下文窗口，大小有限</text>
  <path d="M120,169.9 Q184.9,169.6 250,170.3 Q260.3,170.2 259.8,180 Q260,205.4 259.1,230 Q260.1,239.8 250,239.7 Q185.1,240 120,240.3 Q110.1,240.3 109.3,230 Q110,204.4 110,180 Q110,170.3 120,169.9 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="185" y="205" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">系统指令</text>
  <path d="M290,165.5 Q355.1,165.9 420,165.2 Q430.3,165.6 431,176 Q430.9,200.9 431,226 Q430.1,236.4 420,236.6 Q354.9,235.4 290,236.3 Q280,236.4 280.6,226 Q281,201.5 280.9,176 Q279.8,166.4 290,165.5 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="355" y="201" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">对话历史</text>
  <path d="M460,170.8 Q524.9,169.1 590,170.7 Q600,170.1 599.5,180 Q599.3,204.6 601,230 Q600.3,240.3 590,240.1 Q524.7,239.4 460,240.6 Q450,240.2 449.4,230 Q449.7,205.4 450.7,180 Q449.8,170.2 460,170.8 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="525" y="205" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">检索到的资料</text>
  <path d="M120,250.5 Q184.5,249.6 250,250.5 Q259.9,249.8 260.1,260 Q260.8,285.6 260.3,310 Q259.7,319.6 250,319.6 Q184.9,319.4 120,320.6 Q109.7,320 109,310 Q110.5,284.4 109.5,260 Q110.1,249.8 120,250.5 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="185" y="285" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">工具说明</text>
  <path d="M290,248.2 Q355.6,247.9 420,248.5 Q430.3,248 430.1,258 Q429.1,282.7 430.7,308 Q429.7,317.8 420,317.3 Q354.8,318.3 290,317.7 Q280.2,318.3 279.8,308 Q280.2,283.4 280.8,258 Q280.1,247.6 290,248.2 Z" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="355" y="283" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">上一步的结果</text>
  <path d="M460,250.1 Q524.5,250.9 590,249.2 Q600,249.8 600.3,260 Q600.9,284.7 599.3,310 Q599.6,320 590,320.4 Q524.5,320.2 460,321 Q449.8,319.8 450.8,310 Q449.2,285 450.9,260 Q449.9,249.9 460,250.1 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="525" y="285" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">长期记忆</text>
  <path d="M200,340 Q200,372 280,378" fill="none" stroke="var(--gray)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M280,378 L271.3,373.7 L270.8,380.9 Z" fill="var(--gray)"/>
  <path d="M300,358.9 Q355.5,357.8 410,358.2 Q420.1,357.6 419,368 Q419.7,376.5 420.2,384 Q419.6,394.3 410,394.3 Q354.5,393.1 300,394.7 Q290.2,394.2 290.6,384 Q290.7,375.4 289.5,368 Q289.8,358.1 300,358.9 Z" fill="var(--fill-gray)" stroke="var(--gray)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="355" y="376" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">压缩成摘要</text>
  <rect x="150" y="336" width="40" height="12" rx="2" fill="var(--fill-gray)" stroke="var(--gray)" stroke-width="1" stroke-linejoin="round" stroke-dasharray="7 5"/>
  <rect x="155" y="328" width="40" height="12" rx="2" fill="var(--fill-gray)" stroke="var(--gray)" stroke-width="1" stroke-linejoin="round" stroke-dasharray="7 5"/>
  <text x="340" y="408" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">什么能压、什么不能压、按什么顺序放？</text>
</svg>
</figure>
压缩时，什么能压、什么不能压、放什么不放什么、压到什么程度、按什么顺序放——这些直接决定模型能不能把这一步做对。

2025 年 6 月，Karpathy 给这类工作起了名字：**上下文工程**（Context Engineering），定义是「为下一步调用恰到好处地填满上下文窗口的艺术与科学」。前面讲的提示词，到这里变成了上下文工程的一部分，也就没人在单独讲 Prompt Engineering 了。

## AI 编程的起点：Devin 和 Claude 3.5 Sonnet

这个阶段，AI 编程工具开始冒头，Devin 和 Cursor 都出现在这时。

2024 年 3 月，Cognition 发布 Devin，号称「首位 AI 软件工程师」，在 SWE-bench 上独立解决了 13.86% 的问题——之前其他模型都只有 2% 左右的水平。宣传视频轰动一时，但后来不少开发者质疑它到底是不是真跑出来的。

真正把 AI 编程带进日常的，反而不是做编程工具的，而是模型——2024 年 6 月 20 日发布的 Claude 3.5 Sonnet。很多开发者就是从那时决定入坑 AI Coding 的。以它为主力模型的 Cursor 在那一年迅速走红，Composer 可以一次改多个文件，11 月又上了 Agent 模式。

模型和 Harness 的关系在这里看得很清楚：好的编辑器可能早就有了，但要等模型真正够用的那一刻，围绕它搭的产品才能起来。

同一时期国内也有一批蹭热度的 IDE，模型拉胯、Harness 设计不前沿、又没有用户，很快面临转型或者死亡。此外 Copilot、Replit、Bolt.new、Lovable 这些产品也一个接一个出来。

那时已经有人对 Vibe Coding 有很超前的设想，不过 Cursor 的 Agent 功能其实 2024 年 11 月才上线，不算早。当时的 IDE 长得还非常像 VS Code——主体是编辑器，左侧文件树，右侧挂一个 Agent 对话窗口。再往后，这种侧挂的 Agent Chat 才逐渐演变成今天 Codex、Claude Code 那种「以输入上下文和指令为驱动」的开发流程。

## SWE-agent：给模型重新设计工具

有个项目可能没多少人听过，但在我梳理的这段历史里，它对后来的影响非常大——SWE-agent，普林斯顿 2024 年 4 月发布。

它做的事情很简单：不换模型，**给模型重新设计工具接口**。

原来的命令行是给人用的：cat 一个文件，一口气把 5000 行全吐出来；用 sed 改代码，改坏了也没有任何提示。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-swe-agent-interface" viewBox="0 0 680 430" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>给人用的命令行一次吐整份文件；给模型的接口一次只展示 100 行，改坏了就撤回</title>
  <style>
    .diag-swe-agent-interface { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-swe-agent-interface { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M30,39.8 Q174,40.6 318,39.1 Q331.6,40 331.2,54 Q331.6,205.3 331.5,356 Q331.7,369.8 318,371 Q173.6,371 30,369.5 Q16,369.8 16.6,356 Q16.1,204.4 15.5,54 Q15.7,39.9 30,39.8 Z" fill="none" stroke="var(--gray)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="174" y="68" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">给人用的命令行</text>
  <path d="M46,96.2 Q173.6,95.1 302,96.1 Q312.1,96.1 312.7,106 Q311.1,146.3 311.5,186 Q312.1,195.8 302,195.9 Q173.6,195.1 46,196.9 Q35.7,196.2 36.8,186 Q36.6,146.4 35.8,106 Q35.7,96.3 46,96.2 Z" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="174" y="135.4" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">cat 一个文件</text><text x="174" y="156.6" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">一口气吐出 5000 行</text>
  <path d="M46,229.2 Q173.5,230 302,230.2 Q312.3,229.7 312.5,240 Q312,280.6 313,320 Q311.6,330.4 302,329 Q174.1,330.6 46,330 Q35.8,330.1 35,320 Q36.4,280.4 36.6,240 Q36.1,230.3 46,229.2 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="174" y="269.4" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">sed 改代码</text><text x="174" y="290.6" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">改坏了也没有任何提示</text>
  <path d="M362,39.3 Q506.5,39.9 650,40.5 Q664.2,40.2 663.1,54 Q663.8,204.7 664,356 Q664.1,370.3 650,369.3 Q506.3,369.4 362,369.3 Q348.2,369.6 347.1,356 Q348.1,205 347.5,54 Q348,39.7 362,39.3 Z" fill="none" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="506" y="68" font-size="18" text-anchor="middle" dominant-baseline="central" fill="var(--green)" font-weight="bold">给模型的接口</text>
  <path d="M378,89.7 Q506.5,90.9 634,89.2 Q644.2,90.1 644.9,100 Q644.2,116.8 644.4,134 Q643.7,143.6 634,143.8 Q505.7,144.1 378,144.4 Q367.9,144.4 367.8,134 Q367.7,117.3 367.4,100 Q368.2,90.2 378,89.7 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="506" y="117" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">一次只展示 100 行</text>
  <path d="M378,156.6 Q506.6,155.2 634,155 Q644,156.3 643.7,166 Q643.3,182.7 645,200 Q644.1,210.1 634,210.4 Q506.2,209.3 378,209.6 Q368.1,210.1 368.6,200 Q367.7,183.4 367.7,166 Q368,155.6 378,156.6 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="506" y="183" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">搜索命令标出第几行</text>
  <path d="M378,222.1 Q506.6,221.2 634,222.2 Q643.9,222.3 644.7,232 Q644.9,248.9 644.1,266 Q644.1,276 634,275.3 Q506.6,275.8 378,275.2 Q367.8,276 367.2,266 Q367,248.8 367.7,232 Q367.8,222 378,222.1 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="506" y="249" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">编辑后：语法检查</text>
  <path d="M590,276 Q640,310 506,330" fill="none" stroke="var(--red)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M506,330 L515.4,332.2 L514.4,325.1 Z" fill="var(--red)"/>
  <path d="M378,317.7 Q506.5,318 634,317.9 Q644.1,318.1 644.5,328 Q643.5,335.9 644.8,344 Q644.1,353.9 634,353 Q506.4,354.7 378,353 Q368,353.9 367.7,344 Q367.2,336 367.4,328 Q368.2,318.1 378,317.7 Z" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="506" y="336" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">撤回更改，让模型重试</text>
  <text x="340" y="400" font-size="17" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">Agent 计算机接口</text>
</svg>
</figure>
给模型设计的接口是这样的：打开文件每次只展示 100 行，有专门的搜索命令告诉你目标在第几行；每次编辑完系统自动做语法检查，有语法错误就立刻撤回更改，让模型重试。

结果发现，光改这一处工具设计，解决问题的成功率就明显上去了。

他们管这个叫「Agent 计算机接口」——给人设计的工具不一定适合模型，应该按大模型的特点重新设计工具。这个思路两年后有了个更大的名字：Harness Engineering。

## Benchmark 的转向

这个阶段还有一件很重要但不热闹的事：评测基准（Benchmark）的转向。

考题式的基准快被刷满了——模型性能涨得太快，你问什么它都能答上来。于是新基准开始考真实任务：SWE-bench 模拟修复真实的 GitHub issue，发布时很多模型成功率只有 2%；WebArena、GAIA、OSWorld 这些基准测的是仿真操作、搜索读文件、操作电脑。

这几个基准的意义很深远：**Harness 的好坏也可以被测量、被比较了，不再只看模型本身的性能**。后面两年的大部分进步，都是这些基准测出来、比出来的。

## AI 硬件：不成功的尝试

第二代还有一批谈不上成功的尝试——AI 硬件，代表是 Rabbit R1 和 Humane AI Pin。

它们想让大模型帮你操作手机上的各种应用。最后都没撑多久，很快停售停产。留下的教训很直接：模型能力不够，换个硬件形态也补不上；手机依然是最重要的日常入口。直到今天，我们也不认为 Personal Agent 能包办所有事。

## 第二代被淘汰的东西

第二代走到头，一些东西的淘汰命运已经能看出来了。

**第一，过度封装的框架**。LangChain 在 2024 年 6 月被一篇《我们为什么不再用 LangChain》刷屏，很多团队把它换成了直接调 API——去掉 LangChain 之后，效果反而更好。LangChain 后来拆成 LangGraph 和 LangSmith，活是活下来了，一直不温不火。真正被淘汰的是「用一套框架包办一切」的思路：大模型自己的 Agentic 能力变强之后，没必要再把它塞进一套流程编排系统里。

**第二，低代码平台陷入同质化竞争**。大量做出来的智能体没人用——企业不用，个人也不用。谁在用？自媒体博主：「我在这里搭了这么一条工作流」，发个视频，几十万播放，评论区一堆人要链接。这个阶段今天看非常滑稽。活下来的各有各的立足点：n8n 靠连接器，Dify 靠私有化，Coze 靠流量，但都是半死不活。

**第三，过早的「AI 替代人工」叙事**。瑞典的 Klarna 在 2024 年说「我们的 AI 客服能顶 700 人」，把客服全开掉了；2025 年又重新招人工客服，因为 AI 客服满足不了客户。

Agent 在这个阶段成了一个营销标签，后来有人专门批评「Agent Washing」——把聊天机器人和自动化脚本包装成 Agent 去卖，赶时髦。直到今天，还能看到大量国产项目在做的就是这件事。

## 第二代总结：Harness 不是越多越好

第二代真正留下来的东西有两个：一是以真实任务为基础的评测 Benchmark；二是行业达成的共识——**系统设计和模型能力同样重要**。

被淘汰的，主要是「为了弥补模型过弱而搭建的厚重结构」。

所以这一代给了一个和直觉相反的结论：Harness 不是越多越好。模型变强之后，一部分 Harness 会从帮手变成负担，得动手拆掉。后面讲 Harness 工程时，会看到一些「把工具拆掉反而更好」的实验，说的就是这个道理。
