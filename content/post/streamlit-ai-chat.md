---
title: 'Streamlit AI 聊天应用：一套代码兼容 DeepSeek 与 Ollama'
weight: 11
date: 2026-10-19T10:25:00+08:00
lastmod: 2026-10-21T10:00:00+08:00
cover: /images/covers/streamlit-ai-chat-cover.jpg
categories: ['人工智能', '人工智能学习']
tags: ['Streamlit', 'Python', '大模型', 'DeepSeek', 'Ollama']
description: '用 Streamlit 写一个可切换 DeepSeek 官方 API 和本地 Ollama 的 AI 聊天机器人，包含会话历史、加载提示和完整运行命令。'
math: false
mermaid: false
comments: true
toc: true
---

Streamlit 适合快速把 Python 脚本变成网页应用。做 AI 学习项目时，它很有用：不需要先系统学习 HTML、CSS 和 JavaScript，就能搭出一个聊天页面。这篇会写一个完整示例，支持两种模式：

1. **DeepSeek 官方 API**：联网，按量计费；
2. **本地 Ollama**：不依赖云端 API Key，使用本机模型。

## 1. 安装依赖

建议先创建虚拟环境：

```bash
python -m venv .venv
```

Windows PowerShell 激活：

```powershell
.venv\Scripts\Activate.ps1
```

安装库：

```bash
pip install streamlit openai python-dotenv
```

如果使用 DeepSeek 官方 API，在项目根目录创建 `.env`：

```text
DEEPSEEK_API_KEY=你的APIKey
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

并把 `.env` 加入 `.gitignore`：

```gitignore
.env
```

## 2. 完整代码：`app_ai_chat.py`

```python
import os

import streamlit as st
from dotenv import load_dotenv
from openai import OpenAI, OpenAIError


st.set_page_config(page_title="AI 智能聊天机器人", page_icon="🤖")
load_dotenv()


PROVIDERS = {
    "Ollama 本地模型": {
        "base_url": "http://127.0.0.1:11434/v1",
        "api_key": "ollama",
        "model": "qwen3.5:4b",
    },
    "DeepSeek 官方 API": {
        "base_url": os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com"),
        "api_key": os.getenv("DEEPSEEK_API_KEY", ""),
        "model": os.getenv("DEEPSEEK_MODEL", "deepseek-chat"),
    },
}


DEFAULT_MESSAGES = [
    {
        "role": "system",
        "content": "你是一个简洁、友好的 AI 学习助手，回答使用简体中文。",
    }
]


if "messages" not in st.session_state:
    st.session_state.messages = list(DEFAULT_MESSAGES)


st.title("AI 智能聊天机器人")
st.caption("用 Streamlit + OpenAI 兼容接口，快速搭建本地或云端聊天应用。")
st.divider()


provider_name = st.sidebar.selectbox(
    "选择模型服务",
    ["Ollama 本地模型", "DeepSeek 官方 API"],
)

temperature = st.sidebar.slider(
    "回答随机性 temperature",
    min_value=0.0,
    max_value=1.0,
    value=0.2,
    step=0.1,
)

if st.sidebar.button("清空对话"):
    st.session_state.messages = list(DEFAULT_MESSAGES)
    st.rerun()


config = PROVIDERS[provider_name]

if provider_name == "DeepSeek 官方 API" and not config["api_key"]:
    st.warning("没有检测到 DEEPSEEK_API_KEY，请先在本机 .env 文件中配置。")
    st.stop()


client = OpenAI(
    base_url=config["base_url"],
    api_key=config["api_key"],
)


def render_history() -> None:
    for message in st.session_state.messages:
        if message["role"] == "system":
            continue

        with st.chat_message(message["role"]):
            st.markdown(message["content"])


render_history()


prompt = st.chat_input("请输入你的问题：")

if prompt:
    st.session_state.messages.append(
        {
            "role": "user",
            "content": prompt,
        }
    )

    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        try:
            with st.spinner("AI 正在思考中..."):
                response = client.chat.completions.create(
                    model=config["model"],
                    messages=st.session_state.messages,
                    temperature=temperature,
                )

            answer = response.choices[0].message.content
            st.markdown(answer)

            st.session_state.messages.append(
                {
                    "role": "assistant",
                    "content": answer,
                }
            )
        except OpenAIError as exc:
            error_message = f"调用模型失败：{exc}"
            st.error(error_message)

            st.session_state.messages.append(
                {
                    "role": "assistant",
                    "content": error_message,
                }
            )
```

## 3. 运行应用

在项目根目录执行：

```bash
streamlit run app_ai_chat.py
```

默认浏览器会自动打开类似地址：

```text
http://localhost:8501
```

如果本地 Ollama 没有运行，可以先启动服务：

```bash
ollama serve
```

再确认模型已经下载：

```bash
ollama list
ollama run qwen3.5:4b
```

Ollama 的安装、模型存储路径和常见错误，可以看这篇文章：[Ollama 本地部署大模型](/post/ollama-local-llm-deploy/)。

## 4. 代码结构解释

| 代码 | 作用 |
|---|---|
| `st.title()` | 显示页面标题 |
| `st.divider()` | 显示分割线 |
| `st.sidebar.selectbox()` | 选择 DeepSeek 或 Ollama |
| `st.session_state.messages` | 保存当前会话历史 |
| `st.chat_message()` | 按角色渲染聊天气泡 |
| `st.chat_input()` | 创建聊天输入框 |
| `st.spinner()` | 等待模型返回时显示提示 |
| `client.chat.completions.create()` | 调用 OpenAI 兼容模型接口 |

重点是 `messages`。模型本身没有天然长期记忆，页面看起来“记得上文”，是因为每次请求都把历史消息一起发给了模型。

## 5. DeepSeek 和 Ollama 的参数差异

| 参数 | DeepSeek 官方 API | Ollama 本地模型 |
|---|---|---|
| `base_url` | `https://api.deepseek.com` | `http://127.0.0.1:11434/v1` |
| `api_key` | 真实 API Key | 通常写 `ollama` 即可 |
| 联网 | 需要联网 | 下载模型后可离线 |
| 费用 | 按量计费 | 消耗本机资源 |
| 隐私 | 请求发送到云端 | 数据留在本机 |

## 6. 常见问题

### 1. 页面打不开

检查终端是否有报错，确认端口没有被占用。也可以指定端口：

```bash
streamlit run app_ai_chat.py --server.port 8501
```

### 2. Ollama 连接失败

确认 Ollama 已经运行，并访问：

```text
http://127.0.0.1:11434
```

如果无法访问，说明本地服务没有启动或端口不对。

### 3. DeepSeek 提示未认证

检查 `.env` 是否存在，`DEEPSEEK_API_KEY` 是否正确，是否把真实 Key 写错或提交到了 Git。

### 4. 回答很慢

本地模型受设备性能影响很大。可以换更小的模型，或者关闭其他占用显存和内存的程序。

## 7. 可以继续扩展的功能

1. 增加系统提示词编辑框；
2. 限制最大历史轮数；
3. 导出聊天记录；
4. 上传文档并做简单 RAG；
5. 加 token 或字符数统计；
6. 保存多个会话。

学到这一步，你已经把 Python、模型 API、提示词和网页界面连成了一条完整链路。
