---
title: 'AI 第 5 篇：大模型 API 与 Apifox——DeepSeek 云端调用入门'
weight: 5
date: 2026-10-19T10:10:00+08:00
lastmod: 2026-10-29T15:09:09+08:00
cover: /images/covers/llm-api-apifox-deepseek-cover.jpg
categories: ['人工智能', '人工智能学习']
tags: ['大模型', 'API', 'DeepSeek', 'Apifox', 'OpenAI SDK']
description: '从 API Key、base_url 到 Apifox 调试和 Python 代码调用，讲清云端大模型 API 的完整流程，并对比本地 Ollama 的差异。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇你在自己电脑上跑起了模型。它免费、离线、隐私好——但受你电脑的限制，能力跟云端旗舰差得远。

这一篇把调用方式搬到云端。**结构完全一样，只换两个参数。**

调用大模型服务，本质上是在向一个 HTTP 接口发送 JSON 数据。很多服务都兼容 OpenAI Chat Completions 的格式，学会一次，换一家模型基本不用重学。

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

先分清两层：`base_url` 和 `api_key` 是创建客户端时的**配置参数**，告诉 SDK 把请求发给谁、用什么身份发；`model`、`messages`、`temperature` 是放进**请求体**的字段，决定模型怎么回答。

| 字段 | 所在位置 | 含义 |
|---|---|---|
| `base_url` | SDK 客户端配置 | 服务地址，例如 DeepSeek 官方 API 地址 |
| `api_key` | SDK 客户端配置 | 身份凭证 |
| `model` | 请求体 | 模型名称 |
| `messages` | 请求体 | 对话内容，包含角色和文本 |
| `temperature` | 请求体 | 控制随机性，取值 0 到 2，默认 1.0；值越高越发散，越低越稳定 |

`temperature` 再多说一句：0 附近每次回答几乎一样，适合写程序要稳定结果的场景；调高则更有“创意”，代价是更容易跑偏。这个系列的文章里，做工具用低值（0.2 左右），做发散头脑风暴才用高值。

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

```http
Authorization: Bearer 你的APIKey
Content-Type: application/json
```

5. Body 选择 JSON，写入：

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

6. 点击发送，查看状态码和响应体；
7. 正常情况下，响应里会包含模型回答、token 用量等字段。

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

## 6. 同一个 SDK，换两个地址

上面的代码调的是云端 DeepSeek。把 `base_url` 和 `api_key` 换一换，同一份代码就能调本地模型——这正是上篇强调「OpenAI 兼容」的意义。

| 参数 | 调云端 DeepSeek | 调本地 Ollama |
|---|---|---|
| `base_url` | `https://api.deepseek.com` | `http://127.0.0.1:11434/v1` |
| `api_key` | 真实的 `sk-` 开头密钥 | 随便填个非空值，例如 `"ollama"` |
| `model` | 服务商文档里的模型名 | 以 `ollama list` 的输出为准 |

联网、计费、隐私、性能这些**非代码层面**的差异，[第 4 篇](/post/ollama-local-llm-deploy/)已经讲全了，这里不重复。

> [!TIP]
> 为什么本地也要填 `api_key`？因为 OpenAI 格式要求这个字段必须存在。Ollama 不校验它的真假，但**不能为空**，否则 SDK 会在发请求前就报错。

## 7. 项目里的安全检查清单

1. `.env` 是否已经加入 `.gitignore`；
2. 代码里是否只剩占位符，没有真实 Key；
3. 是否使用了环境变量读取 Key；
4. 是否捕获了网络异常和认证异常；
5. 提交前是否搜索过真实 Key 片段。

## 8. 学完这篇，你应该能回答

1. `base_url` 和 `model` 分别写在哪里？为什么一个在客户端、一个在请求体？
2. PyCharm、Python 解释器、openai 这个库，三者分别扮演什么角色？
3. Apifox 在开发流程里解决什么问题？
4. 本地 Ollama 和云端 API 各自的 `api_key`、`base_url` 怎么写？
5. 为什么 API Key 绝不能提交到公开仓库？泄露后第一件事应该做什么？

第 5 题补充一句实操：万一 Key 泄露，第一件事不是删代码，而是去服务商后台立刻吊销这把 Key，再生成新的。

接口通了，剩下的是内容问题。[第 6 篇：提示词工程实战](/post/prompt-engineering-workflow/) 讲怎么把需求说清楚——这一步没有代码可写，但效果差别比换模型大得多。
