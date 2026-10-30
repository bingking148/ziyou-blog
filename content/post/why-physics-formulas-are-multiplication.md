---
title: '物理公式里为什么乘法这么多：耦合、量纲和守恒'
date: 2026-06-04T10:12:00+08:00
lastmod: 2026-10-30T16:00:00+08:00
cover: /images/covers/physics-formula-cover.jpg
categories: ['科学']
tags: ['物理', '量纲分析', '数学', '学习方法']
description: '从量纲相乘、耦合关系和守恒律三个角度解释物理公式里的乘法和加法各自负责什么，附几个常见误读的澄清。'
math: true
mermaid: false
comments: true
toc: true
---

翻物理书会发现一个现象：牛顿第二定律、万有引力、库仑定律、质能方程、理想气体状态方程，形式几乎都是乘除。

$$F = ma, \quad F = G\frac{Mm}{r^2}, \quad E = mc^2, \quad PV = nRT$$

但只看到这一层会得出错误结论。物理里同样到处都是加法：

$$E = E_k + E_p, \quad F = F_1 + F_2 + \cdots + F_n, \quad \sum p_i = \text{const}$$

同一个学科，一边几乎全是乘法，另一边几乎全是加法。这不是巧合，两类公式在回答不同的问题。

## 1. 乘法在这里干什么

### 1.1 量纲相乘，才能得到新单位

最基础的原因跟物理无关，是单位制的规矩。

同一量纲的量可以相加：$3\,\text{m} + 5\,\text{m} = 8\,\text{m}$，结果还是米。但**不同量纲不能相加**，$3\,\text{kg} + 2\,\text{m/s}$ 是没有意义的表达式。

要得到一个从未出现过的新物理量，就只能让不同量纲相乘：

- 长度 × 长度 = 面积（$\text{m}^2$）
- 长度 × 面积 = 体积（$\text{m}^3$）
- 力 × 距离 = 功（$\text{N}\cdot\text{m} = \text{J}$）
- 电压 × 电流 = 功率（$\text{V}\cdot\text{A} = \text{W}$）

$PV = nRT$ 是最好的例子。左边是压强乘体积，$\text{Pa}\cdot\text{m}^3 = \text{J}$，单位是能量；右边摩尔数乘温度乘常数，量纲也恰是能量。**两边能画等号，前提是量纲一致，而这里的一致靠乘法凑出来。**

加法做不到这件事。无论加多少次米，得到的还是米。

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

> [!NOTE]
> 反过来说，这个约束也提供了检验公式的工具。看到一个式子，先算两边的量纲，对不上就一定错了——量纲分析能在不推导的情况下排除大量错误。

### 1.2 乘法表达「共同决定」，加法表达「各自独立」

$F = ma$ 里两个量是乘的，含义是：质量为零、或者加速度为零，力就是零。两个条件缺一不可。

写成 $F = m + a$ 会怎样？那意味着质量大的物体即使静止不动也在施力，加速度大的物体即使没有质量也在施力——显然不对。更要紧的是，量纲对不上，这个式子从单位制上就不成立。

物理里凡是形如「A 由 B 和 C 共同决定」的关系，写出来就是乘法。势能 $mgh$、动能 $\frac12 mv^2$、电功率 $UI$、电阻的 $I^2R$，都是这个模式。

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

而加法出现的地方，通常是**同一类量在累加**：几个力合成、几段路程相加、几部分能量求和。加法的每个加项都是独立的，改一个不影响另一个。

$$F_{\text{合}} = F_1 + F_2$$

两个力各自作用，合成时才相加。每个力本身不受另一个力影响——这是加法的语义。

### 1.3 速度为什么是平方

动能 $E_k = \frac12 mv^2$ 里速度是二次的，这个细节比公式本身更有信息量。

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

同样的动能增量，速度翻倍和翻四倍的差别，就来自这个平方。

## 2. 加法在物理里不是配角

如果只讲乘法，会漏掉物理学一半的结构。

**守恒律几乎都是加法的形式。** 能量守恒说总能量不变，而总能量是各部分的**和**。动量守恒、电荷守恒、角动量守恒，全部是「加总之后不变」。这类定律的地位不比 $F=ma$ 低，它甚至是更基本的——诺特定理指出，每一种连续对称性都对应一个守恒量，而守恒量天然是加起来的标量。

**叠加原理也是加法。** 力的合成、电场叠加、波的干涉，都是把各部分的贡献直接相加。为什么可以简单相加？因为这些系统是线性的，各部分互不干扰。这个"互不干扰"正是加法的适用条件。

**热力学第一定律**：$\Delta U = Q - W$。内能变化等于吸收的热减去对外做的功，纯加减。

所以更准确的说法不是"宇宙偏爱乘法"，而是：

> **耦合关系写成乘法，独立叠加写成加法。**

这两条规则各自覆盖一大类物理情形，没有谁更基本。

## 3. 一个容易被忽略的细节：量纲不等于规律

有人从「乘法能创造新量纲」推出「乘法更本质」，这个推理跳了一步。

量纲分析告诉你的只是**形式上可能成立**，不告诉你**实际成立的系数**。$F = ma$ 和 $F = 2ma$ 量纲都对，是实验判定前者正确。同理，$E = mc^2$ 里的那个 $c^2$ 也不是从量纲推出来的：量纲只要求它是速度的平方，具体是 $c^2$ 还是 $(2c)^2$，只能靠实验或理论推导确定。

这也是物理公式背不下来的真实原因——**记住符号没有用，得记住每一项在物理上代表什么约束**。

## 4. 用这个视角重新看几个公式

**$F = G\frac{Mm}{r^2}$**

分子上两个质量相乘：引力由双方共同决定，任何一方质量为零就没有引力。分母上距离平方：随距离衰减，且是平方衰减而不是线性，这一点牛顿从开普勒第三定律和向心加速度推出来的，不是猜的。

**$PV = nRT$**

压强乘体积等于物质的量乘温度乘常数。可以改写成 $P = \frac{nRT}{V}$——压强与温度成正比、与体积成反比。理想气体模型的核心假设是分子间无相互作用，正因为无相互作用，各分子对压强的贡献才能简单叠加，状态方程才会这么简洁。

**$E_k = \frac12 mv^2$**

那个 $\frac12$ 来自积分：$\int_0^v mv'\,dv' = \frac12 mv^2$。它是从 $F=ma$ 出发、对位移积分得到的必然结果，不是凑出来的系数。

## 5. 记公式的一点方法

背不住的公式，通常是因为只记住了符号串。换成问三个问题：

**一、这个式子里，哪些量是耦合的？** 相乘的量之间是「共同决定」的关系。看到 $m$ 和 $a$ 相乘，就知道没有加速度就没有力，这比背字母顺序有用。

**二、量纲对不对？** 两边单位凑不出来的式子一定是错的，这一条能挡住大部分记忆错误。

**三、它从哪来？** 是定义，是守恒律的推论，还是实验拟合？来源决定了它的适用范围。$PV = nRT$ 在高压缩比下失效，是因为"分子间无相互作用"这个前提破了，不是因为公式写错了。

三个问题答得出来，公式基本就记住了——不是背下来的，是理解了它为什么长这样。
