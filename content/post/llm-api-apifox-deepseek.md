---
title: '大模型 API 与 Apifox：DeepSeek 云端调用入门'
weight: 9
date: 2026-10-19T10:10:00+08:00
lastmod: 2026-10-19T10:10:00+08:00
cover: /images/covers/llm-api-apifox-deepseek-cover.jpg
categories: ['人工智能', '人工智能学习']
tags: ['大模型', 'API', 'DeepSeek', 'Apifox', 'OpenAI SDK']
description: '从 API Key、base_url 到 Apifox 调试和 Python 代码调用，讲清云端大模型 API 的完整流程，并对比本地 Ollama 的差异。'
math: false
mermaid: false
comments: true
toc: true
---

调用大模型服务时，本质上是在向一个 HTTP 接口发送 JSON 数据。很多服务都兼容 OpenAI Chat Completions 的格式，所以学会一次，后面迁移到其他模型会比较容易。这篇讲三件事：API 是什么、怎么用 Apifox 调试、怎么用 Python 正式调用 DeepSeek。

## 1. 先分清 API、SDK、IDE

| 名称 | 全称或含义 | 作用 |
|---|---|---|
| API | Application Programming Interface | 程序之间约定的调用接口 |
| SDK | Software Development Kit | 软件开发工具包，帮你封装 HTTP、JSON、重试等细节 |
| IDE | Integrated Development Environment | 集成开发环境，例如 PyCharm、VS Code |

你写的 Python 代码会通过 SDK 发送请求；PyCharm 是写代码的 IDE，不是 Python 解释器，也不是 SDK。

## 2. API Key 是什么

API Key 是你调用云端模型时的身份凭证，类似于一张带额度的门禁卡。服务商通过它判断：

1. 请求来自哪个账号；
2. 账号是否有权限；
3. 用量应该计入哪个账户。

安全原则只有一条：**不要把 API Key 写进公开代码仓库，也不要发给别人。**

推荐放在 `.env` 文件里，并把它加入 `.gitignore`：

```text
DEEPSEEK_API_KEY=你的APIKey
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

`.gitignore` 里加上：

```gitignore
.env
```

示例代码里只写 `你的APIKey` 占位符。真实 Key 只应该存在于本机环境变量或 `.env` 文件中。

## 3. 请求里最重要的几个字段

OpenAI 兼容接口常见字段如下：

| 字段 | 含义 |
|---|---|
| `base_url` | 服务地址，例如 DeepSeek 官方 API 地址 |
| `api_key` | 身份凭证 |
| `model` | 模型名称 |
| `messages` | 对话内容，包含角色和文本 |
| `temperature` | 控制随机性，值越高越发散，越低越稳定 |

`messages` 常见角色有三种：

```json
[
  { "role": "system", "content": "你是一个严谨的 Python 老师。" },
  { "role": "user", "content": "请用 100 字解释 while 循环。" }
]
```

## 4. 用 Apifox 调试接口

Apifox 主要用来调试接口：发送请求、查看响应、保存请求模板。调用云端大模型时，流程如下：

1. 在 DeepSeek 平台创建 API Key；
2. 新建接口请求，方法选择 `POST`；
3. 填入 DeepSeek Chat Completions 接口地址，通常是：

```text
https://api.deepseek.com/chat/completions
```

4. 添加请求头：
5. 添加请求头：

```http
Authorization: Bearer 你的APIKey
Content-Type: application/json
```

6. Body 选择 JSON，写入：

```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "你是一个简洁的 Python 老师。"
    },
    {
      "role": "user",
      "content": "用 100 字解释 Python 的 while 循环。"
    }
  ]
}
```

7. 点击发送，查看状态码和响应体；
8. 正常情况下，响应里会包含模型回答、token 用量等字段。

如果返回 `401`，通常是 API Key 错误或格式不对；返回 `429`，通常是触发限流；返回 `400`，通常是 JSON 格式或参数有问题。

## 5. Python 调用 DeepSeek

先安装依赖：

```bash
pip install openai python-dotenv
```

保存为 `deepseek_api.py`：

```python
import os

from dotenv import load_dotenv
from openai import OpenAI, OpenAIError


load_dotenv()

api_key = os.getenv("DEEPSEEK_API_KEY")
base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

if not api_key:
    raise RuntimeError(
        "没有找到 DEEPSEEK_API_KEY。请创建 .env 文件，"
        "并写入 DEEPSEEK_API_KEY=你的APIKey"
    )

client = OpenAI(
    api_key=api_key,
    base_url=base_url,
)


def ask_deepseek(question: str) -> str:
    messages = [
        {
            "role": "system",
            "content": "你是一个简洁、严谨的 Python 老师，回答控制在 200 字以内。",
        },
        {
            "role": "user",
            "content": question,
        },
    ]

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.2,
    )

    return response.choices[0].message.content


if __name__ == "__main__":
    try:
        answer = ask_deepseek("请解释 Python 中的 while 循环。")
        print(answer)
    except OpenAIError as exc:
        print("调用大模型 API 失败：", exc)
```

运行：

```bash
python deepseek_api.py
```

代码里的 `base_url` 指向 DeepSeek 官方 API。模型名称以你所用服务商当前文档为准。

## 6. 云端 API 和本地 Ollama 的区别

本地 Ollama 的 OpenAI 兼容地址通常是：

```text
http://127.0.0.1:11434/v1
```

两者差异如下：

| 对比点 | DeepSeek 官方 API | 本地 Ollama |
|---|---|---|
| 是否需要 API Key | 需要 | 一般不需要 |
| `base_url` | 服务商地址 | `http://127.0.0.1:11434/v1` |
| 是否联网 | 需要联网 | 下载模型后可离线运行 |
| 费用 | 按量计费 | 本机资源消耗为主 |
| 数据位置 | 请求发送到云端 | 数据留在本机 |
| 性能 | 通常受服务商算力支持 | 受本机 CPU/GPU 和内存限制 |

Ollama 的详细部署可以看这篇文章：[Ollama 本地部署大模型](/post/ollama-local-llm-deploy/)。

## 7. 项目里的安全检查清单

1. `.env` 是否已经加入 `.gitignore`；
2. 代码里是否只剩占位符，没有真实 Key；
3. 是否使用了环境变量读取 Key；
4. 是否捕获了网络异常和认证异常；
5. 提交前是否搜索过真实 Key 片段。

## 8. 你应该掌握的判断题

1. API Key 是调用云端模型的身份凭证。
2. PyCharm 是 IDE，不是 Python 解释器。
3. Apifox 主要用于调试 HTTP 接口。
4. 本地 Ollama 下载模型后，不一定必须一直联网。
5. API Key 绝不能提交到公开仓库。
