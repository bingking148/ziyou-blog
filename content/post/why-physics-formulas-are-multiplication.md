---
title: '为什么伟大的物理公式，大多是乘法，很少是加法？'
date: 2026-05-27T14:22:18+08:00
lastmod: 2026-10-27T12:00:00+08:00
cover: /images/covers/physics-formula-cover.jpg
categories: ['随笔']
tags: ['物理', '数学', '思考']
description: '牛顿第二定律、万有引力、质能方程……伟大的物理公式内核几乎全是乘法。因为乘法代表因果耦合、维度相乘与共同贡献，而加法只是同类叠加。看懂这一点，公式就不用背了。'
math: true
mermaid: false
comments: true
toc: true
---

> **乘法代表"因果耦合、共同贡献、维度相乘"，加法只代表"同类叠加、简单堆砌"，而宇宙底层规律是不同物理量互相影响、耦合生效，不是简单堆在一起。**

你有没有想过，翻开任何一本物理教材，那些刻在人类文明丰碑上的公式——牛顿第二定律、万有引力、质能方程、库仑定律、理想气体状态方程……它们的内核几乎全是乘法。

$$F = ma, \quad E = mc^2, \quad F = G\frac{Mm}{r^2}$$

为什么？为什么宇宙不爱用加法，偏偏钟情乘法？

这背后藏着一个关于"世界如何运转"的深层秘密。

## 一、加法：只是"同类东西堆数量"

加法的本质极其朴素：同维度、同性质的量，简单累加。

1 个苹果 + 2 个苹果 = 3 个苹果。三岁小孩都懂。

在物理世界里，加法确实也有它的位置：几个力的合力叠加、系统总能量的求和、分段路程相加……但这些场景有一个共同特征——**彼此独立、互不影响**。你加进去一个力，它不会让这个力本身变强或变弱；你把两段路程拼起来，第二段路不会因为第一段路的存在而改变性质。

加法只是在说："东西变多了。"

但宇宙底层的法则，从来都不是"东西变多了"这么简单。如果世界的终极规律只是加法，那物理学就成了一门记账学——左边一堆量，右边一堆量，两边对一对，齐活。

显然不是。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="addmul-svg" viewBox="0 0 680 264" style="max-width:100%;height:auto;">
  <style>
    .addmul-svg { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; }
    [data-theme="dark"] .addmul-svg { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; }
    .addmul-svg .serif { font-family: Georgia, 'Times New Roman', serif; font-style: italic; }
  </style>
  <defs>
    <clipPath id="amClip"><rect x="46" y="56" width="272" height="152"/></clipPath>
  </defs>
  <line x1="340" y1="24" x2="340" y2="240" stroke="currentColor" stroke-width="1" opacity="0.14"/>
  <text x="182" y="34" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.5" letter-spacing="3">加法 · 各自独立</text>
  <text x="498" y="34" text-anchor="middle" font-size="11" fill="currentColor" opacity="0.5" letter-spacing="3">乘法 · 互相耦合</text>
  <g clip-path="url(#amClip)">
    <path d="M-84,132 Q-64,68 -44,132 Q-24,196 -4,132 Q16,68 36,132 Q56,196 76,132 Q96,68 116,132 Q136,196 156,132 Q176,68 196,132 Q216,196 236,132 Q256,68 276,132 Q296,196 316,132 Q336,68 356,132" fill="none" stroke="var(--blue)" stroke-width="2.4" opacity="0.85">
      <animateTransform attributeName="transform" type="translate" values="0,0;80,0" dur="6.2s" repeatCount="indefinite"/>
    </path>
    <path d="M-84,132 Q-64,88 -44,132 Q-24,176 -4,132 Q16,88 36,132 Q56,176 76,132 Q96,88 116,132 Q136,176 156,132 Q176,88 196,132 Q216,176 236,132 Q256,88 276,132 Q296,176 316,132 Q336,88 356,132" fill="none" stroke="var(--amber)" stroke-width="2.4" opacity="0.85">
      <animateTransform attributeName="transform" type="translate" values="0,0;80,0" dur="9.7s" repeatCount="indefinite"/>
    </path>
  </g>
  <text x="52" y="74" class="serif" font-size="12" fill="var(--blue)">x&#8321;(t)</text>
  <text x="52" y="92" class="serif" font-size="12" fill="var(--amber)">x&#8322;(t)</text>
  <g transform="translate(452,146)">
    <g>
      <animateTransform attributeName="transform" type="rotate" values="0;360" dur="7.5s" repeatCount="indefinite"/>
      <circle r="30" fill="none" stroke="currentColor" stroke-width="8" pathLength="100" stroke-dasharray="5.6 4.4" opacity="0.75"/>
      <circle r="17" fill="currentColor" opacity="0.06"/>
      <line x1="0" y1="-17" x2="0" y2="17" stroke="currentColor" stroke-width="1.4" opacity="0.22"/>
      <line x1="-17" y1="0" x2="17" y2="0" stroke="currentColor" stroke-width="1.4" opacity="0.22"/>
      <circle cx="0" cy="-30" r="3.2" fill="var(--blue)"/>
    </g>
    <circle r="5" fill="currentColor" opacity="0.5"/>
  </g>
  <g transform="translate(503,146)">
    <g>
      <animateTransform attributeName="transform" type="rotate" values="0;-360" dur="5s" repeatCount="indefinite"/>
      <circle r="20" fill="none" stroke="currentColor" stroke-width="7" pathLength="100" stroke-dasharray="5.6 4.4" opacity="0.75"/>
      <circle cx="0" cy="-20" r="3" fill="var(--amber)"/>
    </g>
    <circle r="4" fill="currentColor" opacity="0.5"/>
  </g>
  <text x="182" y="254" text-anchor="middle" font-size="10.5" fill="currentColor" opacity="0.5">两列波各走各的，永远不合拍</text>
  <text x="498" y="254" text-anchor="middle" font-size="10.5" fill="currentColor" opacity="0.5">一个转，另一个必须跟着转</text>
</svg>
</figure>

## 二、乘法：不同维度的"互相作用、绑定因果"

乘法的物理本质，至少有三层。而所有伟大的公式，至少占了其中一层，往往三层全占。

### ① 两个因素"共同决定"一个结果

牛顿第二定律：$F = ma$

力由"质量"和"加速度"共同乘积决定。不是 $F = m + a$。为什么？

因为如果你写成加法，质量和加速度就成了两个互不相干的贡献者：既拼不出量纲（千克加上米每秒没有意义），也表达不出“缺一不可”的绑定关系。一个物体的惯性（质量）和它运动状态的变化率（加速度）必须共同决定结果，只有乘法才能表达这种“共同贡献、耦合生效”的关系。

再看动能公式：$E_k = \frac{1}{2}mv^2$

质量和速度耦合决定动能。一辆卡车以 10 km/h 行驶，和一颗子弹以 1000 m/s 飞行，它们的动能不是"质量加上速度"那么简单，而是速度以平方的形式与质量耦合放大。

加法的世界里，一个变量变了，另一个岿然不动；乘法的世界里，双方一起放大效果，一荣俱荣，一损俱损。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="fma-svg" viewBox="0 0 680 336" style="max-width:100%;height:auto;">
  <style>
    .fma-svg { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; }
    [data-theme="dark"] .fma-svg { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; }
    .fma-svg .serif { font-family: Georgia, 'Times New Roman', serif; font-style: italic; }
  </style>
  <defs>
    <marker id="faArrow" markerWidth="8" markerHeight="8" refX="6.5" refY="3" orient="auto" markerUnits="userSpaceOnUse">
      <path d="M0,0 L7,3 L0,6 Z" fill="var(--blue)"/>
    </marker>
  </defs>
  <text x="24" y="32" font-size="11" fill="currentColor" opacity="0.5" letter-spacing="3">零测试 · 缺一不可</text>
  <text x="340" y="66" text-anchor="middle" class="serif" font-size="21" fill="currentColor"><tspan fill="var(--blue)">F</tspan> = <tspan fill="var(--amber)">m</tspan> · <tspan fill="var(--blue)">a</tspan></text>
  <text x="175" y="128" text-anchor="middle" class="serif" font-size="17" fill="var(--amber)">m</text>
  <rect x="110" y="142" width="130" height="13" rx="6.5" fill="var(--amber)" opacity="0.85"/>
  <text x="281" y="154" text-anchor="middle" font-size="15" fill="currentColor" opacity="0.6">&#215;</text>
  <text x="385" y="128" text-anchor="middle" class="serif" font-size="17" fill="var(--blue)">a</text>
  <line x1="315" y1="148.5" x2="455" y2="148.5" stroke="var(--blue)" stroke-width="3.5" stroke-linecap="round" marker-end="url(#faArrow)">
    <animate attributeName="x2" values="455;455;322;322;455;455" keyTimes="0;0.3;0.4;0.62;0.72;1" dur="8s" repeatCount="indefinite"/>
  </line>
  <text x="490" y="154" text-anchor="middle" font-size="15" fill="currentColor" opacity="0.6">=</text>
  <text x="587" y="128" text-anchor="middle" class="serif" font-size="17" fill="var(--blue)">F</text>
  <rect x="522" y="142" width="130" height="13" rx="6.5" fill="var(--blue)">
    <animate attributeName="width" values="130;130;3;3;130;130" keyTimes="0;0.3;0.4;0.62;0.72;1" dur="8s" repeatCount="indefinite"/>
  </rect>
  <g opacity="0">
    <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.4;0.46;0.6;0.66;1" dur="8s" repeatCount="indefinite"/>
    <line x1="322" y1="156" x2="322" y2="196" stroke="var(--green)" stroke-width="1" stroke-dasharray="3,4" opacity="0.6"/>
    <text x="340" y="220" text-anchor="middle" class="serif" font-size="14.5" fill="var(--green)">a &#8594; 0 &#8658; F &#8594; 0</text>
    <text x="340" y="242" text-anchor="middle" font-size="10.5" fill="currentColor" opacity="0.55">任一因子归零，乘积立刻归零</text>
    <line x1="587" y1="158" x2="587" y2="286" stroke="var(--red)" stroke-width="1" stroke-dasharray="3,4" opacity="0.5"/>
  </g>
  <g opacity="0">
    <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.42;0.48;0.6;0.66;1" dur="8s" repeatCount="indefinite"/>
    <rect x="522" y="292" width="130" height="9" rx="4.5" fill="var(--red)" opacity="0.5"/>
    <text x="587" y="316" text-anchor="middle" font-size="10.5" fill="var(--red)">若 F = m + a，力会残留</text>
  </g>
  <text x="120" y="296" font-size="10.5" fill="currentColor" opacity="0.45">加法：两个量各管各的，</text>
  <text x="120" y="314" font-size="10.5" fill="currentColor" opacity="0.45">写不出这种绑定关系</text>
</svg>
</figure>

### ② 维度相乘，诞生全新的物理概念

这是乘法最迷人的地方：它能跨维度创造新意义。

- 长度 × 长度 = 面积
- 长度 × 面积 = 体积
- 力 × 距离 = 功
- 电压 × 电流 = 功率

加法永远在同一个维度里打转：长度加长度还是长度，能量加能量还是能量。它无法凭空创造出一个全新的物理量。

但乘法可以。它像一种炼金术，把两个不同性质的量放在一起，相互作用，诞生出一个前所未有的新概念。面积不是"更长的长度"，功不是"更大的力"，它们是全新的存在。

宇宙之所以丰富，不是因为同类东西堆得多，而是因为不同属性互相碰撞、耦合、涌现出新的层次。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="dim-svg" viewBox="0 0 680 300" style="max-width:100%;height:auto;">
  <style>
    .dim-svg { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; }
    [data-theme="dark"] .dim-svg { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; }
    .dim-svg .serif { font-family: Georgia, 'Times New Roman', serif; font-style: italic; }
  </style>
  <text x="24" y="32" font-size="11" fill="currentColor" opacity="0.5" letter-spacing="3">维度相乘</text>
  <line x1="48" y1="64" x2="82" y2="64" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.28"/>
  <text x="92" y="68" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.4">+</text>
  <line x1="102" y1="64" x2="136" y2="64" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.28"/>
  <text x="146" y="68" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.4">=</text>
  <line x1="156" y1="64" x2="226" y2="64" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.45"/>
  <text x="137" y="88" text-anchor="middle" font-size="9.5" fill="currentColor" opacity="0.4">L + L：仍是一维</text>
  <line x1="150" y1="236" x2="530" y2="236" stroke="currentColor" stroke-width="1" opacity="0.16"/>
  <line x1="200" y1="233" x2="440" y2="233" stroke="var(--blue)" stroke-width="6" stroke-linecap="round"/>
  <text x="454" y="238" class="serif" font-size="16" fill="var(--blue)">L</text>
  <line x1="197" y1="96" x2="197" y2="230" stroke="var(--amber)" stroke-width="6" stroke-linecap="round"/>
  <text x="186" y="88" text-anchor="end" class="serif" font-size="16" fill="var(--amber)">W</text>
  <rect x="203" y="232" width="234" height="4" fill="var(--blue)" opacity="0.1">
    <animate attributeName="y" values="232;232;102;102;232" keyTimes="0;0.12;0.52;0.85;0.86" dur="8s" repeatCount="indefinite"/>
    <animate attributeName="height" values="4;4;134;134;4" keyTimes="0;0.12;0.52;0.85;0.86" dur="8s" repeatCount="indefinite"/>
  </rect>
  <rect x="196" y="230.5" width="248" height="3.5" rx="1.75" fill="var(--blue)" opacity="0.9">
    <animateTransform attributeName="transform" type="translate" values="0,0;0,0;0,-130;0,-130;0,0" keyTimes="0;0.12;0.52;0.85;0.86" dur="8s" repeatCount="indefinite"/>
  </rect>
  <g opacity="0">
    <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.52;0.58;0.82;0.88;1" dur="8s" repeatCount="indefinite"/>
    <text x="320" y="166" text-anchor="middle" class="serif" font-size="18" fill="currentColor">S = L &#183; W</text>
    <text x="320" y="190" text-anchor="middle" font-size="10.5" fill="currentColor" opacity="0.5">面积：一个全新维度</text>
  </g>
  <text x="340" y="278" text-anchor="middle" font-size="10.5" fill="currentColor" opacity="0.5">一条线扫过另一条线，二维就此诞生 —— 功、功率、磁通，皆是如此</text>
</svg>
</figure>

### ③ 正比关系："你大，我也跟着大"

宇宙大量规律都是正比例关系，而正比例在数学上天然就是乘法。

- 万有引力：$F = G\frac{Mm}{r^2}$——两个质量相乘
- 库仑力：$F = k\frac{q_1q_2}{r^2}$——两个电荷相乘
- 质能方程：$E = mc^2$——质量乘光速平方

这些公式都在说同一件事：一个量翻倍，整体就跟着翻倍（或按平方翻倍）。这是因果关系的直接体现。太阳的质量越大，地球的引力就越强；电荷越多，作用力就越猛。

加法做不到这种"联动响应"。乘法才是因果的数学语言。

## 三、为什么"加法型公式"这么少见

加法能干什么？说白了就三件小事：

- 几个力往同一方向推，合力是多少
- 系统总能量，各部分加起来
- 路程一段一段量，最后加起来

这些都是**事后算账，不是规律本身**。

真正决定世界怎么运转的，从来不是"堆在一起"。引力要两个质量互相拉扯，电磁力要两个电荷互相作用，动能要质量和速度绑在一起。这种"你中有我、我中有你"的关系，加法写不出来，只有乘法能写。

## 四、补充：除法、平方，本质上都是乘法

$a / b$ 是 $a$ 乘以 $b$ 的倒数；$v^2$ 是 $v \times v$。

所以你看：

- 万有引力公式里的 $r^2$ 在分母？本质是乘了 $r^{-2}$。
- 动能公式里的 $v^2$？本质是 $v \times v$。
- 电功率公式 $P = UI$、熵的统计定义、理想气体状态方程 $PV = nRT$……

内核全是乘法逻辑。

## 五、给记公式困难的人一点启发

如果你总觉得物理公式记不住、背了就忘，问题可能不在记忆力，而在你没看懂公式在说什么。

试着换个思路——不要死记符号，先问自己：**这几个量之间是什么关系？**

- 是"各管各的，最后加起来"？那大概是加法。
- 是"互相牵扯，一个变另一个跟着变"？那肯定是乘法。

比如看到 $F = ma$，别急着背字母顺序。想想：力是质量和加速度"绑在一起"才产生的，质量再大、加速度为零，力也是零；加速度再高、质量为零，力也是零。两个条件缺一不可，这就是乘法的直觉。

再看 $E_k = \frac{1}{2}mv^2$，动能不是质量"加上"速度，而是质量"碰上"速度、速度还平方了——说明速度的影响比质量更猛。一颗子弹能穿透钢板，靠的不是质量，是速度。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="ke-svg" viewBox="0 0 680 348" style="max-width:100%;height:auto;">
  <style>
    .ke-svg { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; }
    [data-theme="dark"] .ke-svg { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; }
    .ke-svg .serif { font-family: Georgia, 'Times New Roman', serif; font-style: italic; }
  </style>
  <text x="24" y="32" font-size="11" fill="currentColor" opacity="0.5" letter-spacing="3">每千克动能 · E/m = &#189;v&#178;</text>
  <text x="56" y="66" font-size="11" fill="currentColor" opacity="0.65">卡车 &#183; 5 t &#183; 54 km/h</text>
  <line x1="40" y1="120" x2="540" y2="120" stroke="currentColor" stroke-width="1" opacity="0.16"/>
  <g transform="translate(70,111)">
    <animateTransform attributeName="transform" type="translate" values="70,111;150,111;70,111" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" dur="9s" repeatCount="indefinite"/>
    <rect x="0" y="-30" width="78" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M78,-30 h12 a6,6 0 0 1 6,6 v16 h-18 z" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="83" y1="-26" x2="92" y2="-26" stroke="currentColor" stroke-width="1.4" opacity="0.5"/>
    <circle cx="18" cy="0" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="18" cy="0" r="2" fill="currentColor" opacity="0.6"/>
    <circle cx="78" cy="0" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="78" cy="0" r="2" fill="currentColor" opacity="0.6"/>
    <line x1="-12" y1="-18" x2="-34" y2="-18" stroke="currentColor" stroke-width="1.5" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.05;0.3" dur="1.6s" repeatCount="indefinite"/>
    </line>
    <line x1="-12" y1="-8" x2="-28" y2="-8" stroke="currentColor" stroke-width="1.5" opacity="0.3">
      <animate attributeName="opacity" values="0.05;0.3;0.05" dur="1.6s" repeatCount="indefinite"/>
    </line>
  </g>
  <text x="56" y="186" font-size="11" fill="currentColor" opacity="0.65">子弹 &#183; 10 g &#183; 900 m/s</text>
  <line x1="40" y1="242" x2="540" y2="242" stroke="currentColor" stroke-width="1" opacity="0.16"/>
  <line x1="506" y1="196" x2="506" y2="242" stroke="currentColor" stroke-width="3"/>
  <line x1="512" y1="200" x2="512" y2="242" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
  <g transform="translate(60,220)">
    <animateTransform attributeName="transform" type="translate" values="60,220;468,220;468,220" keyTimes="0;0.36;1" dur="3s" repeatCount="indefinite"/>
    <ellipse cx="12" cy="0" rx="17" ry="4.5" fill="currentColor"/>
    <line x1="-10" y1="0" x2="-30" y2="0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="-16" y1="-7" x2="-40" y2="-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <animate attributeName="opacity" values="1;0.1;1" dur="0.24s" repeatCount="indefinite"/>
    </line>
    <line x1="-16" y1="7" x2="-38" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
      <animate attributeName="opacity" values="0.1;1;0.1" dur="0.24s" repeatCount="indefinite"/>
    </line>
    <animate attributeName="opacity" values="1;1;1;0;0;1" keyTimes="0;0.36;0.4;0.52;0.94;1" dur="3s" repeatCount="indefinite"/>
  </g>
  <g opacity="0">
    <animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;0.35;0.4;0.62;1" dur="3s" repeatCount="indefinite"/>
    <line x1="506" y1="220" x2="524" y2="208" stroke="var(--amber)" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="506" y1="220" x2="528" y2="220" stroke="var(--amber)" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="506" y1="220" x2="522" y2="233" stroke="var(--amber)" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="506" y1="220" x2="510" y2="203" stroke="var(--amber)" stroke-width="2" stroke-linecap="round"/>
  </g>
  <text x="300" y="152" text-anchor="middle" class="serif" font-weight="bold" font-size="19" fill="currentColor">&#215;3600</text>
  <text x="300" y="172" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.5">速度 &#215;60 &#8658; 动能 &#215;60&#178;</text>
  <text x="626" y="58" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.5" letter-spacing="1">E / m</text>
  <line x1="612" y1="72" x2="612" y2="292" stroke="currentColor" stroke-width="1" opacity="0.16"/>
  <rect x="618" y="278" width="7" height="4" rx="2" fill="var(--blue)">
    <animate attributeName="opacity" values="0.9;0.5;0.9" dur="3s" repeatCount="indefinite"/>
  </rect>
  <rect x="632" y="282" width="7" height="0" rx="2" fill="var(--amber)">
    <animate attributeName="y" values="282;282;82;82;282" keyTimes="0;0.38;0.52;0.92;0.97" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="height" values="0;0;200;200;0" keyTimes="0;0.38;0.52;0.92;0.97" dur="3s" repeatCount="indefinite"/>
  </rect>
  <text x="621" y="304" text-anchor="middle" font-size="9.5" fill="var(--blue)">112</text>
  <text x="643" y="304" text-anchor="middle" font-size="9.5" fill="var(--amber)">405 000</text>
  <text x="626" y="322" text-anchor="middle" font-size="8.5" fill="currentColor" opacity="0.4">焦/千克</text>
  <text x="280" y="334" text-anchor="middle" font-size="10.5" fill="currentColor" opacity="0.5">动能按速度的平方放大 —— 质量小如子弹，也能击穿钢板</text>
</svg>
</figure>

**记住这个规律：公式里谁在乘谁，就是在说"谁离不开谁"。**

搞懂了这层关系，公式自然刻在脑子里。不是背下来的，是想明白的。
