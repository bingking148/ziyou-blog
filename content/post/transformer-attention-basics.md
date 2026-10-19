---
title: 'Transformer 与注意力机制：用小例子看懂大模型地基'
weight: 5
date: 2026-10-19T10:00:00+08:00
lastmod: 2026-10-19T10:00:00+08:00
cover: /images/covers/transformer-attention-basics-cover.jpg
categories: ['人工智能', '人工智能学习']
tags: ['Transformer', '注意力机制', '大模型', 'Python']
description: '用生活类比和一段可运行的 Python 代码，讲清 Transformer、Q/K/V、注意力权重和现代大模型基础架构之间的关系。'
math: false
mermaid: false
comments: true
toc: true
---

2017 年 Google 发表了《Attention Is All You Need》，提出了 Transformer 架构。后来很多大语言模型，包括 GPT、DeepSeek、Kimi、GLM 等，都在这条路线或它的变体上继续发展。你不需要一开始就看懂论文里的每一个公式，但应该先抓住一件事：**Transformer 的核心能力，是让模型在处理一个词时，能够动态关注上下文里其他重要的词。**

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

现代大模型常见的是 **decoder-only Transformer**：模型根据前文预测下一个 token。它并不是“数据库里查答案”，而是学会语言的统计结构和推理模式后，逐个 token 生成回答。

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

注意力的计算流程可以概括成：

> Q 和 K 计算相似度 → 相似度变成权重 → 权重加权 V → 得到融合上下文后的新表示。

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

## 5. 多头注意力：从不同角度看句子

单头注意力只能捕捉一种关系。真实 Transformer 通常使用多头注意力：

```text
头 1：关注语法关系
头 2：关注代词指向
头 3：关注时间顺序
头 4：关注因果结构
...
```

每个头有自己的 Q、K、V 投影参数，最后把不同头的结果拼接或融合。这样模型可以同时学习多种上下文关系。

## 6. 位置信息为什么要额外加入

注意力本身不看词的先后位置，只看向量之间的关系。但语言顺序很重要，“猫追狗”和“狗追猫”意思不同。

所以 Transformer 通常会加入位置编码或位置表示，让模型知道：

- 哪个 token 在前；
- 哪个 token 在后；
- 哪些 token 距离较近。

## 7. 学完后你应该能回答

1. Transformer 提出自哪一年、哪篇论文？
2. 注意力中的 Q、K、V 分别表示什么？
3. 为什么 scores 要除以向量维度的平方根？
4. 为什么模型还需要位置信息？
5. 为什么大模型经常被称为“预测下一个 token”的系统？

## 延伸阅读

- 原论文：[Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- 相关文章：[AI 大模型概念网络](/post/ai-llm-concept-network/)
