---
title: '人工智能学习专栏'
description: '从 AI 七十年与大模型概念网络讲起，经 Transformer 原理、Ollama 本地部署、DeepSeek API、提示词工程、Streamlit 应用，到 Agent 开发收官，八篇按顺序排列。'
column: true
column_order: 1
cover: /images/covers/ai-seventy-years-cover.jpg
---

收录于[专栏](/columns/)。

前两篇讲概念，从第三篇起每篇都有能跑起来的代码。八篇的最后，你手上会有一个网页版聊天应用和一个能调用工具的 Agent。

| 篇目 | 内容 |
|---|---|
| [第 1 篇：人工智能七十年](/post/ai-seventy-years/) | 图灵之问、两次寒冬、深度学习革命，2023 年之后的五条主线 |
| [第 2 篇：大模型概念网络](/post/ai-llm-concept-network/) | AI、LLM、Agent 的包含关系，messages 的三种角色 |
| [第 3 篇：Transformer 与注意力](/post/transformer-attention-basics/) | Token、Embedding、Q/K/V、softmax、多头注意力 |
| [第 4 篇：Ollama 本地部署](/post/ollama-local-llm-deploy/) | 装 Ollama、看懂 4b/9b 标签、常用命令、流式输出 |
| [第 5 篇：大模型 API 调用](/post/llm-api-apifox-deepseek/) | API 与 SDK 的区别、Key 管理、Apifox 调试 |
| [第 6 篇：提示词工程](/post/prompt-engineering-workflow/) | 角色/任务/要求、结构化输出、提示注入 |
| [第 7 篇：Streamlit 聊天应用](/post/streamlit-ai-chat/) | session_state、聊天组件、双服务切换 |
| [第 8 篇：Agent 开发入门](/post/ai-agent-tool-memory-rag/) | 工具调用、记忆设计、最小 RAG、安全边界 |

## 前置要求

第 1 到第 3 篇不涉及写代码。

从第 4 篇起需要 Python 基础：变量、函数、字典、`for` 循环、类。不熟的话先看 [Python 基础专栏](/categories/python基础/)。

## 也可以不按顺序

只想搞懂概念，读 1、2、3 就够。

想尽快做出东西，1 → 2 → 4 → 7 这条路能略过原理，直接得到一个能用的聊天应用，之后再回来补 3、5、6。

第 8 篇依赖前面大部分内容，放在最后。
