---
title: '水稻的耐寒记忆：DNA 甲基化如何让后天经历传给下一代'
date: 2026-06-03T00:15:42+08:00
updatedDate: 2026-10-30T16:00:00+08:00
cover: /images/covers/natural-selection-cover-new.jpg
categories: ['科学']
tags: ['进化论', '表观遗传学', 'DNA甲基化', '水稻']
description: '水稻经过多代低温胁迫后能获得可遗传的耐寒性，而 DNA 序列没有改变，靠的是启动子区甲基化状态的改变。这类表观遗传机制如何工作，以及它和自然选择是什么关系。'
math: false
mermaid: false
comments: true
toc: true
---

一株水稻被冻过，它的后代没被冻过，却比同类更耐寒。这件事如果只靠 DNA 序列突变来解释，需要的时间长得多。

2025 年 5 月发表在《细胞》（Cell）上的一项研究给出了另一条路径：中国科学院遗传与发育生物学研究所曹晓风团队发现，水稻经过连续多代低温胁迫筛选后，能获得稳定遗传的耐寒性，而这个过程里 DNA 序列没有发生改变。

改变的是另一层东西。

## 1. 先分清两层信息

理解这项研究，得先意识到 DNA 上存着两类不同的信息。

**第一层是序列本身**：A、T、C、G 的排列顺序。这是传统遗传学的核心对象。序列变了，叫突变。

**第二层是序列上的化学修饰**：序列一个字没改，但某些位置被贴上了甲基（$-CH_3$）。这些标记不改变「写的是什么」，只改变「这段内容能不能被读出来」。

第二层就是表观遗传（epigenetics）。epi- 这个前缀的意思是「在……之上」，指的是在序列之上、不改变序列的调控层。

这个区别很实用。把细胞想象成图书馆：

- DNA 序列是书里的正文，所有细胞的书都一样；
- 甲基化标记是贴在书页上的封条。

贴了封条的那一页，字还在，但读不到——对应到细胞里，就是这个基因不表达。同一本"书"，在不同组织里被封住不同的页，肝脏细胞和神经细胞就这么分化的。

<figure style="text-align:center;margin:2rem 0;">
<svg class="rice-dna-svg" viewBox="0 0 600 340" style="max-width:100%;height:auto;">
  <style>
    .rice-dna-svg { color: #333; --dna-red: #e74c3c; --dna-blue: #3498db; --dna-green: #27ae60; --dna-amber: #f39c12; --dna-purple: #9b59b6; }
    [data-theme="dark"] .rice-dna-svg { color: #b6c1d3; --dna-red: #ff6b6b; --dna-blue: #74b9ff; --dna-green: #55efc4; --dna-amber: #ffeaa7; --dna-purple: #a29bfe; }
  </style>
  <defs>
    <filter id="glow1">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect x="10" y="10" width="580" height="320" rx="16" fill="rgba(128,128,128,0.06)" stroke="currentColor" stroke-width="1" stroke-opacity="0.15"/>
  <text x="300" y="36" text-anchor="middle" font-size="15" font-weight="bold" fill="currentColor">DNA甲基化：从"封条"到"解封"</text>
  <g transform="translate(110, 75)">
    <path d="M0,20 Q30,0 60,20 T120,20 T180,20 T240,20" fill="none" stroke="var(--dna-blue)" stroke-width="3" stroke-linecap="round">
      <animate attributeName="d" values="M0,20 Q30,0 60,20 T120,20 T180,20 T240,20;M0,20 Q30,40 60,20 T120,20 T180,20 T240,20;M0,20 Q30,0 60,20 T120,20 T180,20 T240,20" dur="4s" repeatCount="indefinite"/>
    </path>
    <path d="M0,100 Q30,80 60,100 T120,100 T180,100 T240,100" fill="none" stroke="var(--dna-purple)" stroke-width="3" stroke-linecap="round">
      <animate attributeName="d" values="M0,100 Q30,80 60,100 T120,100 T180,100 T240,100;M0,100 Q30,120 60,100 T120,100 T180,100 T240,100;M0,100 Q30,80 60,100 T120,100 T180,100 T240,100" dur="4s" repeatCount="indefinite"/>
    </path>
    <line x1="15" y1="26" x2="15" y2="94" stroke="currentColor" stroke-width="2" stroke-opacity="0.3">
      <animate attributeName="y1" values="26;34;26" dur="4s" repeatCount="indefinite"/>
      <animate attributeName="y2" values="94;86;94" dur="4s" repeatCount="indefinite"/>
    </line>
    <line x1="75" y1="26" x2="75" y2="94" stroke="currentColor" stroke-width="2" stroke-opacity="0.3">
      <animate attributeName="y1" values="26;34;26" dur="4s" repeatCount="indefinite" begin="1s"/>
      <animate attributeName="y2" values="94;86;94" dur="4s" repeatCount="indefinite" begin="1s"/>
    </line>
    <line x1="135" y1="26" x2="135" y2="94" stroke="currentColor" stroke-width="2" stroke-opacity="0.3">
      <animate attributeName="y1" values="26;34;26" dur="4s" repeatCount="indefinite" begin="2s"/>
      <animate attributeName="y2" values="94;86;94" dur="4s" repeatCount="indefinite" begin="2s"/>
    </line>
    <line x1="195" y1="26" x2="195" y2="94" stroke="currentColor" stroke-width="2" stroke-opacity="0.3">
      <animate attributeName="y1" values="26;34;26" dur="4s" repeatCount="indefinite" begin="3s"/>
      <animate attributeName="y2" values="94;86;94" dur="4s" repeatCount="indefinite" begin="3s"/>
    </line>
    <g>
      <rect x="5" y="48" width="22" height="22" rx="4" fill="var(--dna-red)" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.9;0" keyTimes="0;0.6;1" dur="8s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="scale" values="1;1;0" keyTimes="0;0.6;1" dur="8s" repeatCount="indefinite" additive="sum"/>
      </rect>
      <text x="16" y="63" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">
        CH<tspan font-size="8" dy="2">3</tspan>
        <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.6;1" dur="8s" repeatCount="indefinite"/>
      </text>
    </g>
    <g transform="translate(60,0)">
      <rect x="5" y="48" width="22" height="22" rx="4" fill="var(--dna-red)" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.9;0" keyTimes="0;0.65;1" dur="8s" repeatCount="indefinite" begin="0.3s"/>
        <animateTransform attributeName="transform" type="scale" values="1;1;0" keyTimes="0;0.65;1" dur="8s" repeatCount="indefinite" additive="sum" begin="0.3s"/>
      </rect>
      <text x="16" y="63" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">
        CH<tspan font-size="8" dy="2">3</tspan>
        <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.65;1" dur="8s" repeatCount="indefinite" begin="0.3s"/>
      </text>
    </g>
    <g transform="translate(120,0)">
      <rect x="5" y="48" width="22" height="22" rx="4" fill="var(--dna-red)" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.9;0" keyTimes="0;0.7;1" dur="8s" repeatCount="indefinite" begin="0.6s"/>
        <animateTransform attributeName="transform" type="scale" values="1;1;0" keyTimes="0;0.7;1" dur="8s" repeatCount="indefinite" additive="sum" begin="0.6s"/>
      </rect>
      <text x="16" y="63" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">
        CH<tspan font-size="8" dy="2">3</tspan>
        <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.7;1" dur="8s" repeatCount="indefinite" begin="0.6s"/>
      </text>
    </g>
    <g transform="translate(180,0)">
      <rect x="5" y="48" width="22" height="22" rx="4" fill="var(--dna-red)" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.9;0" keyTimes="0;0.75;1" dur="8s" repeatCount="indefinite" begin="0.9s"/>
        <animateTransform attributeName="transform" type="scale" values="1;1;0" keyTimes="0;0.75;1" dur="8s" repeatCount="indefinite" additive="sum" begin="0.9s"/>
      </rect>
      <text x="16" y="63" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">
        CH<tspan font-size="8" dy="2">3</tspan>
        <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.75;1" dur="8s" repeatCount="indefinite" begin="0.9s"/>
      </text>
    </g>
  </g>
  <g transform="translate(380, 100)">
    <circle cx="20" cy="15" r="14" fill="var(--dna-amber)">
      <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.5;0.6" dur="8s" repeatCount="indefinite"/>
    </circle>
    <text x="20" y="19" text-anchor="middle" font-size="9" fill="#fff" font-weight="bold">
      <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.5;0.6" dur="8s" repeatCount="indefinite"/>
      MET1b
    </text>
    <path d="M34,15 L52,25" stroke="var(--dna-amber)" stroke-width="2" stroke-linecap="round">
      <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.5;0.6" dur="8s" repeatCount="indefinite"/>
    </path>
    <line x1="50" y1="25" x2="56" y2="22" stroke="var(--dna-amber)" stroke-width="2" stroke-linecap="round">
      <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.5;0.6" dur="8s" repeatCount="indefinite"/>
    </line>
    <animateTransform attributeName="transform" type="translate" values="380,100; 380,98; 380,102; 380,100" dur="0.3s" repeatCount="indefinite" begin="0s" end="4s"/>
    <animateTransform attributeName="transform" type="translate" values="380,100; 380,100" dur="0.1s" repeatCount="indefinite" begin="4s"/>
  </g>
  <g>
    <text x="30" y="80" font-size="20" fill="var(--dna-blue)">❄
      <animate attributeName="y" values="30;80" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.3;0.8;1" dur="2s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="rotate" values="0 30 80; 45 30 80" dur="2s" repeatCount="indefinite"/>
    </text>
    <text x="55" y="100" font-size="16" fill="var(--dna-blue)">❄
      <animate attributeName="y" values="40;100" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.3;0.8;1" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
    </text>
    <text x="45" y="120" font-size="14" fill="var(--dna-blue)">❄
      <animate attributeName="y" values="50;120" dur="3s" repeatCount="indefinite" begin="1s"/>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.3;0.8;1" dur="3s" repeatCount="indefinite" begin="1s"/>
    </text>
  </g>
  <text x="100" y="210" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.7">ACT1启动子区</text>
  <path d="M100,216 L100,232 M94,226 L100,232 L106,226" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.5"/>
  <g transform="translate(60, 245)">
    <path d="M0,10 Q20,0 40,10 T80,10 T120,10" fill="none" stroke="var(--dna-green)" stroke-width="3" stroke-linecap="round" filter="url(#glow1)">
      <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.6;0.75;0.95;1" dur="8s" repeatCount="indefinite"/>
    </path>
    <text x="60" y="35" text-anchor="middle" font-size="12" fill="var(--dna-green)" font-weight="bold">
      mRNA转录激活
      <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.6;0.75;0.95;1" dur="8s" repeatCount="indefinite"/>
    </text>
  </g>
  <g transform="translate(380, 200)">
    <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.65;0.8;0.95;1" dur="8s" repeatCount="indefinite"/>
    <path d="M30,60 L30,20 Q20,5 10,15 M30,20 Q40,5 50,15 M30,30 Q18,18 12,25 M30,30 Q42,18 48,25 M30,40 Q20,30 15,35 M30,40 Q40,30 45,35" stroke="var(--dna-green)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <line x1="30" y1="60" x2="30" y2="90" stroke="var(--dna-green)" stroke-width="3" stroke-linecap="round"/>
    <path d="M30,75 Q10,65 5,80 Q15,85 30,78" fill="var(--dna-green)" opacity="0.6"/>
    <path d="M30,70 Q50,60 55,75 Q45,80 30,73" fill="var(--dna-green)" opacity="0.6"/>
    <text x="5" y="15" font-size="12" fill="var(--dna-blue)" opacity="0.6">❄</text>
    <text x="50" y="10" font-size="10" fill="var(--dna-blue)" opacity="0.5">❄</text>
    <text x="55" y="85" font-size="11" fill="var(--dna-blue)" opacity="0.4">❄</text>
    <text x="5" y="95" font-size="9" fill="var(--dna-blue)" opacity="0.5">❄</text>
    <text x="30" y="110" text-anchor="middle" font-size="12" fill="var(--dna-green)" font-weight="bold">耐寒水稻</text>
  </g>
  <text x="300" y="322" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.5">循环演示：低温 → MET1b抑制 → 去甲基化 → 基因表达 → 耐寒表型</text>
</svg>
</figure>

## 2. 水稻实验的核心机制

曹晓风团队的做法是：选取对低温敏感的水稻品种，在最脆弱的减数分裂期施加冷胁迫，然后连续筛选几代。

结果是有耐寒性的株系出现了，而且这种改变能遗传——撤掉低温胁迫、在常温下繁殖若干代之后，耐寒性依然保持。论文中报告的关键位点是 *ACT1* 基因的启动子区，这个区域出现了 DNA 甲基化水平的下降。

启动子是基因前面那段负责「开关」的序列。它被甲基化封住时，转录因子结合不上，基因沉默；甲基化被移除后，转录因子能结合，基因开始表达。

所以这条链路可以拆成：

<figure style="text-align:center;margin:2rem 0;">
<svg class="cascade-svg" viewBox="0 0 700 190" style="max-width:100%;height:auto;">
  <style>
    .cascade-svg { color: #333; --c-cold: #3498db; --c-met1b: #e67e22; --c-dna: #e74c3c; --c-dof1: #9b59b6; --c-act1: #27ae60; --c-rice: #16a085; }
    [data-theme="dark"] .cascade-svg { color: #b6c1d3; --c-cold: #74b9ff; --c-met1b: #fdcb6e; --c-dna: #ff6b6b; --c-dof1: #a29bfe; --c-act1: #55efc4; --c-rice: #00b894; }
  </style>
  <defs>
    <marker id="cascadeArrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L8,3 z" fill="currentColor" opacity="0.5"/>
    </marker>
  </defs>
  <rect x="10" y="10" width="680" height="170" rx="12" fill="rgba(128,128,128,0.05)" stroke="currentColor" stroke-width="1" stroke-opacity="0.12"/>
  <text x="350" y="33" text-anchor="middle" font-size="14" font-weight="bold" fill="currentColor">调控级联：从环境信号到适应性表型</text>
  <g stroke="currentColor" stroke-width="1.5" stroke-opacity="0.25" fill="none" marker-end="url(#cascadeArrow)">
    <line x1="66" y1="88" x2="130" y2="88"/>
    <line x1="186" y1="88" x2="250" y2="88"/>
    <line x1="306" y1="88" x2="370" y2="88"/>
    <line x1="426" y1="88" x2="490" y2="88"/>
    <line x1="546" y1="88" x2="610" y2="88"/>
  </g>
  <g transform="translate(42, 88)">
    <circle cx="0" cy="0" r="22" fill="var(--c-cold)" opacity="0.15">
      <animate attributeName="r" values="22;27;22" dur="2.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2.4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="0" cy="0" r="18" fill="var(--c-cold)"/>
    <text x="0" y="5" text-anchor="middle" font-size="16" fill="#fff">❄</text>
    <text x="0" y="40" text-anchor="middle" font-size="11" fill="currentColor" font-weight="bold">低温胁迫</text>
  </g>
  <g transform="translate(162, 88)">
    <circle cx="0" cy="0" r="22" fill="var(--c-met1b)" opacity="0.15">
      <animate attributeName="r" values="22;27;22" dur="2.4s" repeatCount="indefinite" begin="0.4s"/>
      <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2.4s" repeatCount="indefinite" begin="0.4s"/>
    </circle>
    <circle cx="0" cy="0" r="18" fill="var(--c-met1b)"/>
    <text x="0" y="4" text-anchor="middle" font-size="9.5" fill="#fff" font-weight="bold">MET1b</text>
    <text x="0" y="40" text-anchor="middle" font-size="11" fill="currentColor" font-weight="bold">表达下调 ↓</text>
  </g>
  <g transform="translate(282, 88)">
    <circle cx="0" cy="0" r="22" fill="var(--c-dna)" opacity="0.15">
      <animate attributeName="r" values="22;27;22" dur="2.4s" repeatCount="indefinite" begin="0.8s"/>
      <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2.4s" repeatCount="indefinite" begin="0.8s"/>
    </circle>
    <circle cx="0" cy="0" r="18" fill="var(--c-dna)"/>
    <text x="0" y="-1" text-anchor="middle" font-size="9" fill="#fff" font-weight="bold">ACT1</text>
    <text x="0" y="9" text-anchor="middle" font-size="8" fill="#fff">去甲基化</text>
    <text x="0" y="40" text-anchor="middle" font-size="11" fill="currentColor" font-weight="bold">启动子解封</text>
  </g>
  <g transform="translate(402, 88)">
    <circle cx="0" cy="0" r="22" fill="var(--c-dof1)" opacity="0.15">
      <animate attributeName="r" values="22;27;22" dur="2.4s" repeatCount="indefinite" begin="1.2s"/>
      <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2.4s" repeatCount="indefinite" begin="1.2s"/>
    </circle>
    <circle cx="0" cy="0" r="18" fill="var(--c-dof1)"/>
    <text x="0" y="4" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">Dof1</text>
    <text x="0" y="40" text-anchor="middle" font-size="11" fill="currentColor" font-weight="bold">结合增强</text>
  </g>
  <g transform="translate(522, 88)">
    <circle cx="0" cy="0" r="22" fill="var(--c-act1)" opacity="0.15">
      <animate attributeName="r" values="22;27;22" dur="2.4s" repeatCount="indefinite" begin="1.6s"/>
      <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2.4s" repeatCount="indefinite" begin="1.6s"/>
    </circle>
    <circle cx="0" cy="0" r="18" fill="var(--c-act1)"/>
    <text x="0" y="4" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">ACT1</text>
    <text x="0" y="40" text-anchor="middle" font-size="11" fill="currentColor" font-weight="bold">表达激活</text>
  </g>
  <g transform="translate(642, 88)">
    <circle cx="0" cy="0" r="22" fill="var(--c-rice)" opacity="0.15">
      <animate attributeName="r" values="22;27;22" dur="2.4s" repeatCount="indefinite" begin="2s"/>
      <animate attributeName="opacity" values="0.15;0.35;0.15" dur="2.4s" repeatCount="indefinite" begin="2s"/>
    </circle>
    <circle cx="0" cy="0" r="18" fill="var(--c-rice)"/>
    <text x="0" y="5" text-anchor="middle" font-size="14" fill="#fff">🌾</text>
    <text x="0" y="40" text-anchor="middle" font-size="11" fill="currentColor" font-weight="bold">获得耐冷性</text>
  </g>
  <circle r="3.5" fill="var(--c-cold)">
    <animateMotion path="M66,88 L130,88" dur="1.2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="1;0.8;0" keyTimes="0;0.7;1" dur="1.2s" repeatCount="indefinite"/>
  </circle>
  <circle r="3.5" fill="var(--c-met1b)">
    <animateMotion path="M186,88 L250,88" dur="1.2s" repeatCount="indefinite" begin="0.4s"/>
    <animate attributeName="opacity" values="1;0.8;0" keyTimes="0;0.7;1" dur="1.2s" repeatCount="indefinite" begin="0.4s"/>
  </circle>
  <circle r="3.5" fill="var(--c-dna)">
    <animateMotion path="M306,88 L370,88" dur="1.2s" repeatCount="indefinite" begin="0.8s"/>
    <animate attributeName="opacity" values="1;0.8;0" keyTimes="0;0.7;1" dur="1.2s" repeatCount="indefinite" begin="0.8s"/>
  </circle>
  <circle r="3.5" fill="var(--c-dof1)">
    <animateMotion path="M426,88 L490,88" dur="1.2s" repeatCount="indefinite" begin="1.2s"/>
    <animate attributeName="opacity" values="1;0.8;0" keyTimes="0;0.7;1" dur="1.2s" repeatCount="indefinite" begin="1.2s"/>
  </circle>
  <circle r="3.5" fill="var(--c-act1)">
    <animateMotion path="M546,88 L610,88" dur="1.2s" repeatCount="indefinite" begin="1.6s"/>
    <animate attributeName="opacity" values="1;0.8;0" keyTimes="0;0.7;1" dur="1.2s" repeatCount="indefinite" begin="1.6s"/>
  </circle>
  <text x="350" y="168" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.5">信号沿通路逐级传递，光点依次点亮每个环节</text>
</svg>
</figure>

> 低温胁迫 → 甲基转移酶 MET1b 表达下调 → *ACT1* 启动子甲基化维持受阻 → 转录因子结合增强 → *ACT1* 表达上升 → 耐寒性提高

其中 MET1b 的角色值得单独说。它的正常工作是在 DNA 复制时把甲基化标记复制到新链上，保证每次细胞分裂后封条位置不变。一旦它的表达被抑制，下一代细胞就"忘了"该在哪里贴封条，甲基化模式在分裂中逐代丢失。

这个细节说明了为什么表观遗传状态通常很稳定、却又可以被环境打破：它的维持依赖一套持续的酶活性，而酶是会被调控的。

## 3. 这项研究说明了什么，没说明什么

这里要谨慎，因为这项研究在传播过程中被套上了不少超出实验本身的解读。

**它说明了**：在特定条件下，环境诱导的表观遗传改变可以在多代之内稳定下来，并且这种改变影响表型（耐寒性），且有明确的分子通路。

**它没有说明的**，至少包括这几点：

**第一，这不等于「拉马克被证实」。** 拉马克的获得性遗传主张是一个普遍原则：生物一生中因使用或废弃而获得的改变会传给后代。这项研究展示的是一个具体的、被精确定位的分子机制在特定作物上的作用。两者不是一回事——前者是十九世纪的宏观假说，后者是二十一世纪的分子实验。用一个案例去宣布一个百年理论"被证实"，在证据等级上跳了好几级。

**第二，这不意味着 DNA 序列突变不重要。** 表观遗传标记能遗传，但它的稳定性远不如序列。序列突变一旦固定就永久保留，甲基化标记则依赖维持机制，可能在不施加选择压的情况下逐渐丢失。这两者的可靠程度不同，在进化上的权重也不同。

**第三，实验室条件与自然条件的差别。** 连续多代、受控的冷胁迫筛选，在自然界里并不常见。野外环境波动大、强度不稳定，能否产生同等强度的定向甲基化变化，需要更多野外观测支持。有意思的是论文里确实报告了地理梯度数据——不同稻区的农家种之间，*ACT1* 甲基化水平存在与气候相关的差异，这为自然条件下的作用提供了一定支持，但仍然是相关性证据。

> [!NOTE]
> 判断一项研究的意义，有个简单的问法：**它的对照组是什么？效应量多大？能不能在别的物种、别的环境里复现？** 这三个问题的答案，比新闻稿里的形容词可靠得多。

## 4. 表观遗传和自然选择是什么关系

把两者对立起来，是这类报道里最常见的问题。

实际上它们作用于不同层次，而且往往串联在一起：

- 表观遗传提供**快速响应**的手段。环境变化时，种群不必等待一个恰好合适的随机突变出现，甲基化状态的调整可能在一两代内就产生表型变化。这个时间尺度对突变来说太快了。
- 自然选择负责**筛选和固定**。不是所有甲基化改变都对生存有利，哪些留下来，仍然由存活和繁殖决定。一个降低耐寒性的甲基化改变，即使由寒冷诱导产生，也会被淘汰。

所以更准确的说法是：**表观遗传扩大了可供选择的范围，自然选择决定哪些进入下一代。** 前者是变异来源之一，后者是筛选机制，两者不构成互相替代。

这也解释了为什么"表观遗传学推翻了达尔文"这类说法站不住：达尔文理论的核心是「变异 + 差异繁殖」，表观遗传改变只是补充了变异来源的那一半，没有触动另一半。

## 5. 为什么这件事在农业上重要

传统育种改良抗逆性，走的是「找突变、做杂交、多代选育」的路子，周期通常以年计。

如果表观遗传性状可以被定向诱导并稳定遗传，理论上就多了一条路：不用等自然出现的有利突变，而是通过控制环境条件诱导出需要的表观状态，再筛选、固定。

这条路目前还不成熟，存在明显的不确定性——诱导的稳定性、是否可逆、在不同遗传背景下能否复现，都是待解的问题。但它提供了一种不同的思路：**与其改造基因序列，不如调控基因的读取方式。**

在气候变化导致极端天气频发的背景下，这个方向的研究价值在于它可能缩短育种周期。这不是已经实现的技术，而是正在探索的可能性。

## 6. 留给读者的问题

这项研究最值得注意的地方，不是它"推翻"了什么，而是它提醒了一件事：

**遗传不只是序列的复制。** 一个生物体经历过的环境，可能通过化学修饰在自己的基因组上留下痕迹，并影响后代。

这个图景和二十世纪的基因中心论有实质差别。基因中心论把 DNA 序列看作唯一的信息载体，表观遗传学指出还存在第二套可遗传的信息层，且它对环境敏感。

但这不意味着序列不重要，也不意味着获得性遗传在所有情形下都成立。它只意味着，在「基因决定一切」和「环境决定一切」这两个极端之间，还有相当大的空间值得研究——而这个空间里，每一个论断都需要具体的实验支撑，而不是靠一个漂亮的类比。

---

**参考资料**

- 曹晓风团队，*Inheritance of acquired adaptive cold tolerance in rice through DNA methylation*，《Cell》，2025 年 5 月 22 日
- 关于表观遗传与进化关系的综述性讨论，可检索 "transgenerational epigenetic inheritance" 相关文献
