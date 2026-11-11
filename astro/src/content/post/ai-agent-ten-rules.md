---
title: 'AI Agent 发展史第 10 篇：本地还是云端，与十条规律'
weight: 10
date: 2026-11-06T13:00:00+08:00
cover: /images/covers/ai-agent-ten-rules-cover.jpg
categories: ['人工智能', 'AI Agent 发展史']
tags: ['AI Agent', '智能体', '发展规律', '本地部署', '云计算']
description: '系列的第二个专题与收官：Agent 到底跑在本地还是云端？这个问题反复摇摆了四年，因为大家把三个问题混在了一起。最后是十条规律——基座决定形态、验证是最难的部件、能被描述的都会公有化。'
math: false
mermaid: false
comments: true
toc: true
---

最后一个专题：Agent 运行在本地还是云端，以及我对整段 AI Agent 发展史的核心规律总结。

## 先厘清一个前提

先说明一点：这里的「本地」和「云端」，指的是 Agent **执行动作**的地方。绝大多数本地 Agent 背后的模型还是在云端的，不是拿本地模型跑 Agent——它在你本机读文件、敲命令，但每一步怎么想，还是要交给云端的模型。

过去几年，这个问题反复摇摆了好几次：

- 从 AutoGPT 的本地脚本，到 ChatGPT 的 Code Interpreter 云端沙箱
- 从 Codex 的本地编辑器，到 Devin 的云端 AI 工程师
- 从 Claude Code 的本地终端，再到 Manus 的云端虚拟机
- 然后是本地的 Work 产品、千问 Work 的多合一，再到个人 Agent 的云上电脑

每一年，几乎所有产品都会把这个问题重新试一遍——Agent 到底该放在云端还是本地，Harness 到底放在哪里。

## 决定因素：来回拉扯的几股力量

先看倾向本地的力量：

1. 材料和登录状态在你自己的电脑或手机上
2. 隐私和合规——你不想让数据经过云上平台
3. 想用自己的机器、自己的算力
4. 如果你有自己的模型，那只能用本地模型，用不了云端 Harness

再看倾向云端的力量：

1. 出错会伤到真实系统的，放云端更稳妥
2. 关机之后还要继续跑的，必须放云端
3. Harness 的维护交给专业的人，而不是你自己接工具、配技能
4. 一次开上百个任务，这种事肯定在云端

其中最关键的是两点：材料和登录状态不在电脑上的问题；以及你离开之后、任务要不要继续的问题。

云端 Agent 想用你的东西，就得上传文件、重新登录、过验证码，还常常被网站当机器人拒之门外；本地 Agent 在你合上电脑的那一刻就停了。所以到目前为止，还没有一个特别完美的方案。

## 三个被混在一起的问题

这个问题之所以掰扯不清，是因为大家把三个问题混在了一起：

1. **模型推理在哪**？毫无疑问，全在云端
2. **动作在哪执行**？Claude Code 是纯本地，Cowork 是本地加虚拟机，DOS 是放在云端
3. **数据凭证在哪**？Claude Code 在本地，Cowork 也在本地，DOS 是平台托管

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-three-local-cloud-questions" viewBox="0 0 680 400" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>本地还是云端其实是三层：模型推理、动作执行、数据凭证</title>
  <style>
    .diag-three-local-cloud-questions { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-three-local-cloud-questions { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <text x="235" y="44" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">Claude Code</text>
  <text x="401" y="44" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">Cowork</text>
  <text x="567" y="44" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">DOS</text>
  <text x="80" y="106" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">模型推理</text>
  <path d="M170,69.2 Q234.6,70.2 300,69.7 Q310,70.3 310.4,80 Q310.1,106.4 310,132 Q310.2,142.4 300,142.5 Q234.7,141.2 170,141.9 Q160.4,142.1 159,132 Q159.8,106 159.1,80 Q159.6,70.1 170,69.2 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="235" y="106" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">云端</text>
  <path d="M336,70 Q400.7,70.8 466,70.1 Q476.2,70.3 476.3,80 Q476.5,106.3 476,132 Q476.3,142.2 466,142.8 Q400.4,142.4 336,142 Q326,142.4 326,132 Q325.1,106 326.3,80 Q326.3,70.3 336,70 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="401" y="106" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">云端</text>
  <path d="M502,69.1 Q566.6,69.4 632,70.8 Q642.2,69.8 642,80 Q643,105.7 642.2,132 Q641.7,142 632,141.9 Q566.9,141.6 502,141.3 Q492.4,142.3 492.9,132 Q492.2,106.2 491.1,80 Q492.3,70.4 502,69.1 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="567" y="106" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">云端</text>
  <text x="80" y="194" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">动作执行</text>
  <path d="M170,158.1 Q235.1,158 300,157.9 Q309.7,158 310.8,168 Q309.7,193.8 309.5,220 Q310.1,229.8 300,229.2 Q234.4,229.1 170,229.3 Q159.7,230 159.3,220 Q160.5,194.4 161,168 Q160.1,157.7 170,158.1 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="235" y="194" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">纯本地</text>
  <path d="M336,157.2 Q401.6,157.9 466,157.6 Q476.3,157.7 476.2,168 Q475.8,193.4 475.2,220 Q475.7,229.9 466,230.8 Q401.4,229.6 336,229.3 Q326.2,229.8 325.2,220 Q326.9,194.3 325.9,168 Q325.6,157.9 336,157.2 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="401" y="194" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">本地 + 虚拟机</text>
  <path d="M502,157 Q567.5,157.1 632,159 Q642.4,157.6 641.4,168 Q642.8,194.2 641.3,220 Q641.9,230 632,229.6 Q567.4,229.4 502,230 Q492.1,229.7 492.4,220 Q491.2,194.4 492.6,168 Q492.1,158.3 502,157 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="567" y="194" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">云端</text>
  <text x="80" y="282" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">数据凭证</text>
  <path d="M170,245.3 Q234.9,245.6 300,246.2 Q309.7,246.1 309,256 Q310.9,281.7 310.5,308 Q309.8,318.1 300,318.6 Q235.3,318 170,318.9 Q159.7,318 159.2,308 Q159.8,281.4 160.7,256 Q159.8,246 170,245.3 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="235" y="282" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">本地</text>
  <path d="M336,245.4 Q400.9,247 466,245.1 Q476.2,245.6 476.6,256 Q476.7,282 476.5,308 Q476,317.8 466,318.9 Q401,318.9 336,318.2 Q325.7,318.3 325.1,308 Q325.1,281.8 326.4,256 Q325.6,246 336,245.4 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="401" y="282" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">本地</text>
  <path d="M502,246.5 Q566.8,245.4 632,246 Q642.4,245.9 641.3,256 Q642,282.3 642.8,308 Q642.4,318.4 632,318.2 Q567.2,317.2 502,318.8 Q491.8,317.6 492.8,308 Q491.7,281.8 491.8,256 Q491.8,246.1 502,246.5 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="567" y="282" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">平台托管</text>
  <text x="340" y="370" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">说本地 Agent 或云端 Agent 时，要问是哪一层。</text>
</svg>
</figure>


主要的争论其实发生在执行这一层。推理在云端，数据凭证很可能主要在本地。所以下次再有人跟你说「我们在做一个本地 Agent」或「云端 Agent」，你有必要问一句：你的「本地」和「云端」，指的是哪一层、哪个步骤。

## 我的倾向

目前看来，我倾向的做法是：用户的电脑为主，云端的电脑兜底。

Agent 在你自己的电脑上干活，因为它需要材料、需要登录态、需要你的注意力；但如果任务要长时间跑、你离开后还要继续，或者要大量并行、要和真实系统交互，就交给云端。

一个更一般的说法：电脑要放在任务材料所在的地方，也要放在「用户离开后任务还能接着跑」的地方。当这两个条件指向不同位置的时候，就得提供两台电脑。

所以 Work 类产品是本地优先，个人代理是云端优先，顺序正好相反，其实是同一条规律。至于 Manus，它猜对了「Agent 需要一台电脑」，但还没猜对这台电脑应该放在哪里。

## 十条规律

进入总结之前，先回头看一下我年初做的几个预测：

- **预测一：AI Agent 必须继续加上闭环**。部分兑现——Harness 工程有较大进展，时间闭环也有进展，能持续执行几天的任务了；但通用的验证和回滚框架还没出现，评测工具跟不上了。
- **预测二：内在记忆，把记忆放到模型外**。没发生——文件系统作为记忆才是默认做法。可能是基础研究没跟上，这条路线一直推不通。
- **预测三：世界模型**。钱非常多，大量资方在投杨立昆、李飞飞他们，但主要做物理世界和机器人，不是真正的 Agent。
- **预测四：具身智能**。争议非常大，模型和硬件都在推进，但反馈很不好——比如某家上市公司上市首日之后一路腰斩，到现在也不知道跌到哪里去了。

还有几个问题目前没有答案：独立 Agent 公司能不能存在；Agent 的电脑应该放在哪里；代理的身份和访问权是什么；收入和估值口径是什么；SaaS 会不会被 Agent 完全取代（我倾向不会彻底取代，但会有很大一部分 SaaS 死掉）；界面会不会被生成式取代。

下面正式讲十条规律。

**第一条：基座模型的能力决定 Agent 的形态**。上下文变长了才能有多步工作流，推理增强了才能做逻辑长任务，视觉成熟了才能操作电脑，能连续工作几小时才会有成块的知识工作。但补一句：模型决定 Agent 能做什么，而能不能可靠地做到，很大程度上取决于 Harness；最后以什么形态、通过谁交付到你手里，则是渠道、规则和分发的事。这三层相互交织——前面几代主要比模型，中间几代主要比 Harness，到 2026 年，我们竞争的是入口和规则。

**第二条：Harness 部件的演变路径**。一条核心铁律——新的部件先以外挂形式出现，成熟之后、被验证是刚需，就写成标准或训练进模型。七个部件全走了这条路。只有一个例外——**验证**。验证这件事很尴尬：测试、截图比对目前还在模型外面，还需要人类给它反馈「做得好不好」，工作才能真正推进。不然你一直不盯、不验证、不给反馈，两天后回来一看它交付的东西，就是一坨屎。所以接下来，Harness 里最有价值的部分就是验证。如果你想搞点什么事，可以想想怎么让验证这个行为变得更顺畅。

**第三条：开放协议**。2025 年年底，MCP、Skills、AGENTS.md 这些东西交给了中立机构，很多人就说「有了开放协议，模型变成可以随便替换的引擎，技能和工作流才是真正的护城河」，这种说法一度甚嚣尘上。前半句是对的——所有模型厂商都接入标准，接入成本大幅下降；后半句错了——最强的模型是受限开放的，不能随便替换。Anthropic 年化收入不到一年从 90 亿涨到 600 多亿，模型公司还直接做了 Cowork、ChatGPT Work。技能文件容易携带，也就容易复制。所以开放协议降低了接入成本，但价值依然在向少数头部模型和掌握入口的平台集中。这和很多人的直觉相反：标准越是开放，中间层就越难赚到钱。

**第四条：Harness 的适用范围在不断扩大**。从提示词到接口、多步流程，再到屏幕和代码，再到无人看管的全天运行，再到一整块工作，再到正在推进的凭证、支付、身份。每扩展一次，就会冒出一堆事故，然后很多人来修补，修好了再继续扩大。最新的变化是：最外面这一层，已经不由 Agent 单方面决定了——网站和超级应用有能力拒绝它。所以 Harness 的范围还能继续扩大吗？扩大之后怎么做？还有哪些东西应该被纳入 Harness？这是需要思考的问题，暂时没有固定结论。

**第五条：标准是怎么来的**。过去主要靠事故倒逼——出了一件事，技能文件就有了来源审核和权限隔离。但越来越多的规则开始来自企业间的协商：Skill 交给中立机构托管，豆包提的 SAEP 协议是在向国内各家大厂发起协商，Cloudflare 推出的 Agent 身份认证也是想让功能在上线之前先做到安全。

**第六条：炒作周期反复出现**。光今年就有三轮：OpenClaw 冲到顶，然后 QCloud 停运；一人公司被补贴炒起来，然后 OPC 社区闲置；办公 Work 的竞争不到半年就开始收缩，补贴也没了。淘汰一类产品的机制有三条：模型升级之后中间层被彻底吞掉；出现更低的交互门槛，上一代降低的门槛反而成了负担（比如拖拽节点、在聊天软件里遥控 Agent）；跟风者把短暂的先发优势当成长期优势。OpenClaw 三条全占了。

**第七条：公开方法的宿命**。能被描述的东西都会被公有化——上下文工程经验、技能文件、MCP 工具、Harness 技巧、提示词模板、工作流，最后都沦为行业的公共知识。那真正的壁垒是什么？只有这几个：分发渠道、真实任务累积的数据、能承担风险的主体资格。这里还有一个推论：先驱者的做法越通用，就越容易被人学走，留给自己的空间就越小。Manus 就是例子。如果你在做 Agent 产品，最值得想的问题是：你手里的东西，有多少是能写进一篇博客、然后被公开出来的？如果有，你就不能完全依赖它当核心竞争力，因为它最终都会公有化。

最后三条是新总结的：

**第八条：主权风险一定要算进成本里**。开公司的时候，注册地可以改，研发地、数据所在地和团队来源改不掉。从第一天起就要想清楚你做哪个市场、怎么管理主权风险。

**第九条：分发的入口决定普及的速度**。成功的产品，分发都做得非常好。Muse 是我认为分发做得最强的案例，Siri 类似；WorkBuddy 能接微信，但豆包手机因为超级应用的封锁而收缩。硬件不是一个好的分发渠道——贵、重、需要一整个生态，普及很慢；纯软件的推广，只要找对渠道、用对推广方法，增长可以爆发式扩张。技术领先的团队能开创一个品类，但能把产品送到用户手里的公司，往往才是最后的赢家。

**第十条：落地瓶颈从技术转向组织**。模型几个月就换代一次，但企业的流程、权限和习惯不会自己适应。这就是 FDE 走红的核心原因。

## 结尾：下一代 Agent

下一代 Agent，就是把刚才提到的四个问题解决掉。回到最开始的订机票场景——现在我们还是没法特别顺畅地订完一张机票，就是因为那几个问题还没有妥善的答案。

你会发现，那几个问题没有一个跟模型本身有关，它们全落在 Harness 的最外层。

四年时间，Harness 从一句提示词长成了一整套系统；接下来，它要开始和平台、网络、法律、组织打交道。这些问题和答案，会决定下一代 AI Agent 的样子。

我也就不做特别大胆的预测了。四年看完，规律就这十条——剩下的，交给下一代 Agent 去回答。
