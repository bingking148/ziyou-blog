---
title: 'AI 第 3 篇：Transformer 与注意力机制——用小例子看懂大模型地基'
weight: 3
date: 2026-10-19T10:00:00+08:00
updatedDate: 2026-10-29T15:08:45+08:00
cover: /images/covers/transformer-attention-basics-cover.jpg
categories: ['人工智能', '人工智能学习']
tags: ['Transformer', '注意力机制', '大模型', 'Python']
description: '用生活类比和一段可运行的 Python 代码，讲清 Transformer、Q/K/V、注意力权重和现代大模型基础架构之间的关系。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇说过，LLM 的核心能力是「根据上文预测下一个词」。这句话里藏着一个没展开的环节：模型凭什么知道下一个词该是哪个。

2017 年 Google 发表了《Attention Is All You Need》，提出了 Transformer 架构，答案就在里面。后来很多大语言模型，包括 GPT、DeepSeek、Kimi、GLM 等，都在这条路线或它的变体上继续发展。论文里的公式不用一开始就全看懂，先抓住一件事：**Transformer 的核心能力，是让模型在处理一个词时，能够动态关注上下文里其他重要的词。**

## 1. 为什么注意力很重要

看这句话：

> 小明把书递给小红，因为她想读它。

人类很容易知道：

- “她”大概率指“小红”；
- “它”大概率指“书”。

早期循环神经网络按顺序读句子，信息传到后面时，前面远距离的词容易被稀释。注意力机制的做法不同：模型可以回头看整个序列，并根据当前任务计算“我应该多关注每个位置”。

你可以把它想成开会时做记录。会议里有很多话，但你在写“下一步行动”时，不会平均记住每一句，而是重点关注负责人、时间、交付物这些关键信息。

## 2. Transformer 的三个关键词

| 关键词 | 通俗解释 | 在模型里的作用 |
|---|---|---|
| Token | 文本被切分后的最小单位 | 一个字、词、子词或符号 |
| Embedding | 把 token 变成向量 | 让文字变成计算机可计算的形式 |
| Attention | 让不同 token 互相建立联系 | 捕捉上下文依赖 |

### Token：模型看到的不是字，是编号

模型读不了文字，读的是编号。切分也不是简单按字或按词：主流做法叫子词切分（BPE 是最常见的算法），高频词保留成整体，低频词拆成碎片。英文 `unhappiness` 可能被切成 `un` + `happiness`；中文的“人工智能”可能是一个 token，也可能拆成“人工”+“智能”，取决于训练时词表学到了什么。这么折中是因为词表不能无限大，但又必须能拼出任何没见过的新词。

你平时关心的“上下文长度”，单位就是 token。同样的内容，中文和英文折算出的 token 数不一样，API 按 token 计费时这一点要留意。

### Embedding：给每个编号配一串数字

光有编号还不够。“猫”是 5 号、“狗”是 830 号，编号本身不携带任何含义。Embedding 做的事，是给每个 token 配一串很长的数字，也就是向量，常见几百到几千维。这串数字是训练学出来的，效果是：**意思相近的词，向量也挨得近**。“猫”和“狗”的向量距离，会远小于“猫”和“资产负债表”的距离。经典的类比“国王 − 男人 + 女人 ≈ 女王”，说的就是这种向量空间的性质。有了向量，“词和词有多相关”才能变成一道数学题。

现代大模型常见的是 **decoder-only Transformer**：模型根据前文预测下一个 token。它并不是“数据库里查答案”，而是学会语言的统计结构和推理模式后，逐个 token 生成回答。具体生成过程第 5 节展开。

## 3. Q、K、V：查询、键、值

注意力里有三个向量：

- **Q（Query，查询）**：当前 token 想找什么？
- **K（Key，键）**：每个 token 能提供什么标签？
- **V（Value，值）**：每个 token 真正携带的信息。

一个常见类比是去图书馆：

1. 你带着一个问题去查资料，这就是 Q；
2. 书脊上的标签是 K；
3. 书里的内容是 V；
4. 你会根据问题和书脊标签的相关程度，决定从哪些书里取多少内容。

那“相关程度”具体怎么算？用点积。两个向量的点积，是把对应位置的数字两两相乘再全部求和：方向越一致，结果越大；互相垂直，结果为零。所以 Q 和 K 的点积大，就说明“当前词想找的信息”和“某个词能提供的标签”对上了。这个计算没有玄机，只有乘法和加法，算完得到一个分数。

注意力的计算流程可以概括成：

> Q 和 K 计算相似度 → 相似度变成权重 → 权重加权 V → 得到融合上下文后的新表示。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-qkv-four-steps" viewBox="0 0 680 500" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>四个 token 各自带上 Q、K、V，再经过四步得到融合上下文后的新表示</title>
  <style>
    .diag-qkv-four-steps { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-qkv-four-steps { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M50,27 Q90.3,27.2 130,27.4 Q139.9,27.7 140.8,38 Q139,49.9 139.5,62 Q139.9,72.1 130,71.3 Q89.7,71.9 50,71 Q40,72.1 39.4,62 Q39.6,50.3 40.7,38 Q39.7,27.7 50,27 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="90" y="50" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">小猫</text>
  <line x1="62" y1="72" x2="62" y2="96" stroke="var(--blue)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="62" y="110" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--blue)" font-weight="bold">Q</text>
  <line x1="90" y1="72" x2="90" y2="96" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="90" y="110" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)" font-weight="bold">K</text>
  <line x1="118" y1="72" x2="118" y2="96" stroke="var(--green)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="118" y="110" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--green)" font-weight="bold">V</text>
  <path d="M216,27.1 Q255.4,27.5 296,27.6 Q306.2,27.8 306.5,38 Q305.9,50.3 306.4,62 Q305.8,71.8 296,71.9 Q256.1,71.2 216,72.8 Q205.8,71.7 206.1,62 Q206.1,49.6 206,38 Q206.2,28.1 216,27.1 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="256" y="50" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">追</text>
  <line x1="228" y1="72" x2="228" y2="96" stroke="var(--blue)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="228" y="110" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--blue)" font-weight="bold">Q</text>
  <line x1="256" y1="72" x2="256" y2="96" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="256" y="110" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)" font-weight="bold">K</text>
  <line x1="284" y1="72" x2="284" y2="96" stroke="var(--green)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="284" y="110" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--green)" font-weight="bold">V</text>
  <path d="M382,28.6 Q421.9,27.4 462,28.3 Q471.9,27.7 472.4,38 Q471.8,50.4 473,62 Q472,72.2 462,71 Q421.6,72 382,72.1 Q372.2,71.6 372.2,62 Q372,50.5 372.7,38 Q371.8,27.8 382,28.6 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="422" y="50" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">毛线</text>
  <line x1="394" y1="72" x2="394" y2="96" stroke="var(--blue)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="394" y="110" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--blue)" font-weight="bold">Q</text>
  <line x1="422" y1="72" x2="422" y2="96" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="422" y="110" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)" font-weight="bold">K</text>
  <line x1="450" y1="72" x2="450" y2="96" stroke="var(--green)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="450" y="110" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--green)" font-weight="bold">V</text>
  <path d="M548,27.1 Q588.1,27.4 628,28.7 Q637.9,27.8 638.6,38 Q638.7,50.1 638.2,62 Q637.9,71.8 628,72.5 Q587.8,71.2 548,72.6 Q538.2,71.8 538.8,62 Q538.1,50.6 537.2,38 Q537.7,28.1 548,27.1 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="588" y="50" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">球</text>
  <line x1="560" y1="72" x2="560" y2="96" stroke="var(--blue)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="560" y="110" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--blue)" font-weight="bold">Q</text>
  <line x1="588" y1="72" x2="588" y2="96" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="588" y="110" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)" font-weight="bold">K</text>
  <line x1="616" y1="72" x2="616" y2="96" stroke="var(--green)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="616" y="110" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--green)" font-weight="bold">V</text>
  <text x="340" y="140" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">注意力的四步</text>
  <path d="M46,155.8 Q110.3,155.8 174,156.4 Q183.7,156.2 183.3,166 Q183.6,184.4 183,204 Q184.1,214.4 174,213.2 Q110,214.7 46,214.1 Q35.8,214.4 35.2,204 Q35.2,184.9 35.1,166 Q35.9,156.2 46,155.8 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="110" y="175.1" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">Q 和 K 点积</text><text x="110" y="194.9" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">得相似度</text>
  <line x1="184" y1="185" x2="188" y2="185" stroke="var(--purple)" stroke-width="1.6" stroke-linecap="round"/><path d="M196,185 L188,181.8 L188,188.2 Z" fill="var(--purple)"/>
  <path d="M206,156.1 Q269.4,156.8 334,156.5 Q344.1,156.3 344.3,166 Q344.7,184.8 344.3,204 Q343.7,213.7 334,214.6 Q269.5,214.4 206,214.4 Q196.1,214.1 196.2,204 Q196.7,185.2 196.7,166 Q196.4,156.2 206,156.1 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="270" y="185" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">除以 √d</text>
  <line x1="344" y1="185" x2="348" y2="185" stroke="var(--purple)" stroke-width="1.6" stroke-linecap="round"/><path d="M356,185 L348,181.8 L348,188.2 Z" fill="var(--purple)"/>
  <path d="M366,155.8 Q430.3,155.1 494,157 Q503.7,156 504.1,166 Q503,185.4 503.3,204 Q503.6,213.8 494,215 Q430.2,213.2 366,214 Q355.9,214 355.1,204 Q355.1,185.3 355.6,166 Q355.8,156 366,155.8 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="430" y="175.1" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">softmax</text><text x="430" y="194.9" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">变成权重</text>
  <line x1="504" y1="185" x2="508" y2="185" stroke="var(--purple)" stroke-width="1.6" stroke-linecap="round"/><path d="M516,185 L508,181.8 L508,188.2 Z" fill="var(--purple)"/>
  <path d="M526,155.3 Q589.4,155.8 654,155.4 Q663.8,156.2 664,166 Q663.7,185 663.6,204 Q664.2,213.9 654,213.4 Q590.1,213.9 526,213.7 Q515.8,214 516.6,204 Q516.4,185.1 516.6,166 Q515.9,155.9 526,155.3 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="590" y="175.1" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">权重加权 V</text><text x="590" y="194.9" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">得到新表示</text>
  <text x="340" y="232" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">权重表：一行是当前 token，看向四个被看的 token</text>
  <text x="102" y="372" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">当前 token</text>
  <text x="324" y="256" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">被看的 token</text>
  <text x="216" y="276" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">小猫</text>
  <text x="288" y="276" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">追</text>
  <text x="360" y="276" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">毛线</text>
  <text x="432" y="276" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">球</text>
  <text x="168" y="309" font-size="14" text-anchor="end" dominant-baseline="central" fill="currentColor" font-weight="bold">小猫</text>
  <rect x="180" y="288" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="2.2" stroke-linejoin="round"/>
  <text x="214" y="307" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.45</text>
  <rect x="252" y="288" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="2.2" stroke-linejoin="round"/>
  <text x="286" y="307" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.25</text>
  <rect x="324" y="288" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="2.2" stroke-linejoin="round"/>
  <text x="358" y="307" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.15</text>
  <rect x="396" y="288" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="2.2" stroke-linejoin="round"/>
  <text x="430" y="307" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.15</text>
  <line x1="470" y1="309" x2="483" y2="309" stroke="var(--blue)" stroke-width="1.6" stroke-linecap="round"/><path d="M490,309 L483,306.2 L483,311.8 Z" fill="var(--blue)"/>
  <text x="554" y="309" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--blue)" font-weight="bold">接近 1</text>
  <text x="168" y="351" font-size="14" text-anchor="end" dominant-baseline="central" fill="currentColor" font-weight="bold">追</text>
  <rect x="180" y="330" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="214" y="349" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.35</text>
  <rect x="252" y="330" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="286" y="349" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.15</text>
  <rect x="324" y="330" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="358" y="349" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.20</text>
  <rect x="396" y="330" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="430" y="349" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.30</text>
  <text x="168" y="393" font-size="14" text-anchor="end" dominant-baseline="central" fill="currentColor" font-weight="bold">毛线</text>
  <rect x="180" y="372" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="214" y="391" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.10</text>
  <rect x="252" y="372" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="286" y="391" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.15</text>
  <rect x="324" y="372" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="358" y="391" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.50</text>
  <rect x="396" y="372" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="430" y="391" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.25</text>
  <text x="168" y="435" font-size="14" text-anchor="end" dominant-baseline="central" fill="currentColor" font-weight="bold">球</text>
  <rect x="180" y="414" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="214" y="433" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.10</text>
  <rect x="252" y="414" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="286" y="433" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.25</text>
  <rect x="324" y="414" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="358" y="433" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.20</text>
  <rect x="396" y="414" width="68" height="38" rx="6" fill="var(--fill-blue)" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <text x="430" y="433" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">0.45</text>
  <text x="340" y="478" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">演示里 Q、K、V 来自同一个 X；真实模型是三个不同的线性变换。</text>
</svg>
</figure>


## 4. 用 Python 写一个最小注意力示例

下面这段代码只演示单头注意力的核心计算，不追求模型训练效果。

```python
import numpy as np

def softmax(x, axis=-1):
    # 为了数值稳定，先减去最大值
    x = x - np.max(x, axis=axis, keepdims=True)
    exp_x = np.exp(x)
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)

def attention(Q, K, V):
    d = Q.shape[-1]

    # 1. Q 和 K 做点积，表示“查询”和“键”的相关程度
    scores = Q @ K.T

    # 2. 除以 sqrt(d)，避免数值过大导致 softmax 后权重过于集中
    scores = scores / np.sqrt(d)

    # 3. 变成每个位置的概率权重
    weights = softmax(scores)

    # 4. 用权重加权 V，得到融合上下文后的表示
    output = weights @ V

    return weights, output


tokens = ["小猫", "追", "毛线", "球"]
embedding_dim = 4

np.random.seed(42)
X = np.random.randn(len(tokens), embedding_dim)

# 这里用同一个 X 生成 Q/K/V，只是为了演示
Q = X
K = X
V = X

weights, output = attention(Q, K, V)

np.set_printoptions(precision=2, suppress=True)
print("tokens:", tokens)
print("attention weights:")
print(weights)
print("output:")
print(output)
```

运行后你会看到两个结果：

- `weights` 是每个 token 对其他 token 的关注程度，每一行加起来接近 1；
- `output` 是每个 token 融合上下文后的新向量。

对照代码把四步串起来：

1. `scores = Q @ K.T`：每个 token 的 Q 和所有 token 的 K 做点积，得到一张“相关程度”打分表；
2. `scores / np.sqrt(d)`：给打分表整体降温，这一步下面单独讲；
3. `softmax(scores)`：把每一行打分变成加和为 1 的权重，分数高的拿大头；
4. `weights @ V`：按权重把所有 token 的 V 混在一起，作为当前 token 的新表示。

**softmax 做了什么？** 它把任意一组数字变成一组总和为 1 的正数，可以当成概率看。指数函数会放大差距，所以分数高的 token 拿到的权重会远高于分数低的。这就是为什么权重矩阵每一行加起来是 1。

**为什么要除以 √d？** 向量维度 d 越大，点积要累加的项越多，数值天然越大，大致按 √d 的量级增长。分数一大，softmax 会把差距拉到极端，权重几乎全押在一个 token 上，变成“非它不可”，训练时反而学不到东西。除以 √d 相当于把分数拉回正常量级，让权重“有侧重但不极端”。论文里 Scaled Dot-Product Attention（缩放点积注意力）中的 scaled，指的就是这一步。演示代码维度只有 4，影响不明显；真实模型动辄几十上百维，这一步不能省。

另外注意，演示代码里 Q、K、V 直接用了同一个 `X`，纯粹为了少写几行。真实模型里，每个 token 的向量会先经过三个不同的线性变换（各自带一组可训练参数），得到不同的 Q、K、V，再进入上面的流程。

## 5. 逐 token 生成：回答是怎么写出来的

前面讲的都是“理解”这一侧，生成这一侧靠的是同一套机制的循环使用。模型拿到你的问题后，先算出下一个 token 的概率分布，从中挑一个接上；然后把“已有内容 + 刚挑的 token”当作新的上文，再算下一个，直到模型给出结束信号。聊天界面里的打字机效果，本质就是模型在一轮一轮地“预测、拼接、再预测”。

这也解释了两件事：

1. 模型不是在数据库里查答案，而是靠学到的语言统计结构，把回答一个字一个字“续写”出来；
2. 回答越长，后面每一步要处理的上文越多，生成越慢，token 费用也越高。

## 6. 多头注意力：从不同角度看句子

单头注意力只能捕捉一种关系。真实 Transformer 通常使用多头注意力：

```text
头 1：关注语法关系
头 2：关注代词指向
头 3：关注时间顺序
头 4：关注因果结构
...
```

实现上不是真的并排摆几十套独立计算，而是把向量切段：比如 4096 维切成 32 段，每段 128 维就是一个头的小空间，各算各的注意力，最后把 32 份结果拼接融合。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-multi-head-split" viewBox="0 0 680 380" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>多头注意力是把 4096 维切成 32 段各算各的，再拼接回一根向量</title>
  <style>
    .diag-multi-head-split { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-multi-head-split { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M48,39.2 Q340.3,40.2 632,40.7 Q639.9,40.2 639.5,48 Q639.5,62.1 640.9,76 Q639.7,83.9 632,84.2 Q339.4,85 48,84.9 Q40,84.3 40.4,76 Q39.6,62.1 40.2,48 Q40.1,40.3 48,39.2 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="340" y="62" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">4096 维</text>
  <line x1="340" y1="84" x2="340" y2="103" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M340,110 L342.8,103 L337.2,103 Z" fill="currentColor"/>
  <text x="430" y="104" font-size="15" text-anchor="start" dominant-baseline="central" fill="var(--gray)">切成 32 段</text>
  <path d="M46,119.6 Q340.1,121 634,119.8 Q639.8,120.3 641,126 Q641,138.4 639.6,150 Q640,155.6 634,155.1 Q340.1,156.5 46,156.2 Q40,155.8 40.5,150 Q39,137.5 39.8,126 Q40.3,120.2 46,119.6 Z" fill="var(--fill-gray)" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
  <line x1="58.8" y1="123" x2="58.8" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="77.5" y1="123" x2="77.5" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="96.2" y1="123" x2="96.2" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="115" y1="123" x2="115" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="133.8" y1="123" x2="133.8" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="152.5" y1="123" x2="152.5" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="171.2" y1="123" x2="171.2" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="190" y1="123" x2="190" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="208.8" y1="123" x2="208.8" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="227.5" y1="123" x2="227.5" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="246.2" y1="123" x2="246.2" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="265" y1="123" x2="265" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="283.8" y1="123" x2="283.8" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="302.5" y1="123" x2="302.5" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="321.2" y1="123" x2="321.2" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="340" y1="123" x2="340" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="358.8" y1="123" x2="358.8" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="377.5" y1="123" x2="377.5" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="396.2" y1="123" x2="396.2" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="415" y1="123" x2="415" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="433.8" y1="123" x2="433.8" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="452.5" y1="123" x2="452.5" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="471.2" y1="123" x2="471.2" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="490" y1="123" x2="490" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="508.8" y1="123" x2="508.8" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="527.5" y1="123" x2="527.5" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="546.2" y1="123" x2="546.2" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="565" y1="123" x2="565" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="583.8" y1="123" x2="583.8" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="602.5" y1="123" x2="602.5" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <line x1="621.2" y1="123" x2="621.2" y2="153" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.45"/>
  <text x="340" y="178" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">每段 128 维 / 一个头</text>
  <path d="M60,199.2 Q120.3,199.5 180,201 Q189.8,199.7 190.1,210 Q189.9,235.1 190.4,260 Q189.9,270.2 180,270.5 Q120.6,269.6 60,269.9 Q49.8,270.1 49.7,260 Q49.6,235.3 49.2,210 Q50.2,199.8 60,199.2 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="120" y="216.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">头 1</text><text x="120" y="235" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">各自做注意力</text><text x="120" y="253.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">指代</text>
  <line x1="120" y1="156" x2="120" y2="193" stroke="var(--purple)" stroke-width="1.4" stroke-linecap="round"/><path d="M120,200 L122.8,193 L117.2,193 Z" fill="var(--purple)"/>
  <path d="M240,199 Q300.3,199.2 360,200.8 Q369.8,200.1 369.4,210 Q369.6,234.9 370.2,260 Q369.6,269.7 360,270.5 Q300,271 240,271 Q230.1,270.3 229.1,260 Q229.7,235.5 231,210 Q229.7,199.9 240,199 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="300" y="216.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">头 2</text><text x="300" y="235" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">各自做注意力</text><text x="300" y="253.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">相邻词</text>
  <line x1="300" y1="156" x2="300" y2="193" stroke="var(--purple)" stroke-width="1.4" stroke-linecap="round"/><path d="M300,200 L302.8,193 L297.2,193 Z" fill="var(--purple)"/>
  <path d="M500,199.6 Q560.4,199.2 620,200.5 Q630,199.7 630.8,210 Q630,234.7 630.5,260 Q630.3,270 620,270 Q560.5,270 500,270.5 Q489.9,270 490.3,260 Q489.6,234.7 490.9,210 Q490.2,200.2 500,199.6 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="560" y="216.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">头 3</text><text x="560" y="235" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">各自做注意力</text><text x="560" y="253.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">……</text>
  <line x1="560" y1="156" x2="560" y2="193" stroke="var(--purple)" stroke-width="1.4" stroke-linecap="round"/><path d="M560,200 L562.8,193 L557.2,193 Z" fill="var(--purple)"/>
  <text x="430" y="236" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">其余 29 个头</text>
  <line x1="120" y1="270" x2="273.1" y2="298.7" stroke="var(--green)" stroke-width="1.5" stroke-linecap="round"/><path d="M280,300 L273.6,296 L272.6,301.5 Z" fill="var(--green)"/>
  <line x1="300" y1="270" x2="334.4" y2="295.8" stroke="var(--green)" stroke-width="1.5" stroke-linecap="round"/><path d="M340,300 L336.1,293.6 L332.7,298 Z" fill="var(--green)"/>
  <line x1="560" y1="270" x2="406.9" y2="298.7" stroke="var(--green)" stroke-width="1.5" stroke-linecap="round"/><path d="M400,300 L407.4,301.5 L406.4,296 Z" fill="var(--green)"/>
  <path d="M48,310.9 Q340.1,310.1 632,309.6 Q640.3,310.3 640.7,318 Q640.5,332.4 639.9,346 Q640.3,354.3 632,354.2 Q339.9,354.5 48,353.5 Q40.1,354.3 39.5,346 Q40.1,332.4 39.5,318 Q39.9,310.3 48,310.9 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="340" y="332" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">拼接融合  ·  还是 4096 维</text>
</svg>
</figure>
这样模型可以同时追踪多种上下文关系，参数量和计算量仍然可控。可解释性研究确实发现过“专职”的头：有的专门盯指代，有的专门盯相邻词。

## 7. 位置信息为什么要额外加入

注意力本身不看词的先后位置，只看向量之间的关系。但语言顺序很重要，“猫追狗”和“狗追猫”意思不同。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-position-added" viewBox="0 0 680 460" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>注意力只看向量关系，不管词序；「猫追狗」和「狗追猫」要靠额外加入的位置标记区分</title>
  <style>
    .diag-position-added { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-position-added { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <text x="170" y="30" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">注意力只看向量关系</text>
  <circle cx="170" cy="160" r="110" fill="none" stroke="var(--gray)" stroke-width="1.4" stroke-dasharray="6 5"/>
  <path d="M102,100.1 Q120,101 138,99.1 Q148,99.8 148.9,110 Q147,120.3 148,130 Q147.7,139.7 138,140.3 Q120.2,139.4 102,140.2 Q92.1,140 91.1,130 Q91.6,120.2 91.1,110 Q91.8,100.4 102,100.1 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="120" y="120" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">猫</text>
  <path d="M202,120 Q220.2,120.3 238,121 Q247.9,119.9 247.3,130 Q247,140 248.9,150 Q248.1,160.1 238,160.7 Q219.7,159.8 202,160.4 Q192.3,160 191.8,150 Q192.8,140 191.4,130 Q192.1,119.6 202,120 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="220" y="140" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">追</text>
  <path d="M142,190.2 Q160.1,190.8 178,189.9 Q188.2,189.7 188.8,200 Q187.4,209.6 187.4,220 Q188,229.9 178,229.1 Q160.3,230.3 142,230.6 Q131.9,229.7 132.2,220 Q132.7,209.5 132.3,200 Q131.6,189.7 142,190.2 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="160" y="210" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">狗</text>
  <line x1="140" y1="120" x2="200" y2="140" stroke="var(--blue)" stroke-width="1.3" stroke-linecap="round" opacity="0.8"/>
  <line x1="120" y1="140" x2="160" y2="190" stroke="var(--blue)" stroke-width="1.3" stroke-linecap="round" opacity="0.8"/>
  <line x1="220" y1="160" x2="180" y2="210" stroke="var(--blue)" stroke-width="1.3" stroke-linecap="round" opacity="0.8"/>
  <text x="500" y="30" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">位置必须额外加入</text>
  <text x="330" y="94" font-size="15" text-anchor="end" dominant-baseline="central" fill="currentColor" font-weight="bold">猫追狗</text><path d="M370,69.6 Q402.4,70.1 434,69.5 Q443.6,69.8 444.6,80 Q444.9,94.4 443.9,108 Q444.2,117.6 434,118.1 Q401.7,117.4 370,118.9 Q359.8,117.8 360.8,108 Q360.6,94.3 360.9,80 Q360.3,69.8 370,69.6 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="402" y="94" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">猫</text><text x="402" y="136" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">第 1 个</text><path d="M470,70 Q502.4,70.6 534,69.8 Q544,69.6 544.6,80 Q545,93.6 543.8,108 Q544.1,118.4 534,118.6 Q501.6,118.9 470,118.4 Q460.3,117.8 460.4,108 Q460.5,94.2 459.1,80 Q460.1,69.7 470,70 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="502" y="94" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">追</text><text x="502" y="136" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">第 2 个</text><path d="M570,70.7 Q602.2,69.8 634,69.2 Q644,70.3 644.1,80 Q643.8,94.2 643.8,108 Q644.2,118 634,118.7 Q602.3,118.3 570,117.3 Q559.7,117.8 560,108 Q560.5,94.2 560.4,80 Q559.8,69.9 570,70.7 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="602" y="94" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">狗</text><text x="602" y="136" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">第 3 个</text>
  <text x="330" y="194" font-size="15" text-anchor="end" dominant-baseline="central" fill="currentColor" font-weight="bold">狗追猫</text><path d="M370,169.3 Q401.4,169.6 434,171 Q444,170.2 445,180 Q443.9,193.6 444.4,208 Q444.4,218.3 434,217.3 Q402.5,218.7 370,217.1 Q359.9,217.6 360.4,208 Q359.3,194.1 359.2,180 Q360.3,169.7 370,169.3 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="402" y="194" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">狗</text><text x="402" y="236" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">第 1 个</text><path d="M470,169.4 Q502.1,169.4 534,169.6 Q544.2,170.2 544.8,180 Q543.4,193.4 543.8,208 Q544.2,218.1 534,218.9 Q502.4,218.6 470,218.4 Q459.6,218.2 460.5,208 Q460.8,194.1 459.4,180 Q460.1,170 470,169.4 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="502" y="194" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">追</text><text x="502" y="236" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">第 2 个</text><path d="M570,169.6 Q601.4,171 634,170.4 Q643.9,170.3 643.2,180 Q643.4,194 643.4,208 Q643.9,218.1 634,217.1 Q601.8,218.9 570,218.4 Q559.8,218.4 560,208 Q559.6,194.3 560.3,180 Q560.2,169.9 570,169.6 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="602" y="194" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">猫</text><text x="602" y="236" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">第 3 个</text>
  <text x="500" y="260" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">位置标记对调，意思就反了</text>
  <line x1="40" y1="340" x2="640" y2="340" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-dasharray="6 5" opacity="0.45"/>
  <text x="340" y="366" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">两种常见做法</text>
  <path d="M90,383 Q199.7,383.2 310,384.6 Q319.8,383.7 320.3,394 Q319,407.8 320.3,422 Q319.7,431.8 310,433 Q200.3,431.2 90,431 Q79.7,432.1 79.6,422 Q79.2,408.5 79.9,394 Q79.8,383.6 90,383 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="200" y="408" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">正弦位置编码</text>
  <path d="M370,384.3 Q480.5,384 590,384.2 Q600,384 600,394 Q600.7,407.9 599.6,422 Q599.9,432.1 590,432.2 Q479.5,432.9 370,431.7 Q359.6,431.9 359,422 Q360.3,408.4 360.6,394 Q360.3,383.8 370,384.3 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="480" y="408" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">旋转位置编码 RoPE</text>
</svg>
</figure>


所以 Transformer 必须用某种方式把位置信息加进向量，让模型知道：

- 哪个 token 在前；
- 哪个 token 在后；
- 哪些 token 距离较近。

原论文用的是固定的正弦位置编码，直接叠进词向量；后来的模型换了更精细的方案，比如现在主流的旋转位置编码 RoPE，DeepSeek、Qwen 都在用。原理可以以后再深究，先记住结论：注意力自己不管顺序，位置必须额外喂给它。

## 8. 学完后你应该能回答

1. Transformer 提出自哪一年、哪篇论文？
2. Token 是怎么切分的？为什么用子词而不是整词？
3. 注意力中的 Q、K、V 分别表示什么？
4. softmax 在注意力里负责什么？
5. 为什么 scores 要除以向量维度的平方根？
6. 为什么模型还需要位置信息？
7. 为什么大模型经常被称为“预测下一个 token”的系统？

## 延伸阅读

- 原论文：[Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- 相关文章：[AI 大模型概念网络](/post/ai-llm-concept-network/)

---

原理到此为止。[第 4 篇：Ollama 本地部署](/post/ollama-local-llm-deploy/) 开始动手，在自己电脑上装一个开源模型跑起来。
