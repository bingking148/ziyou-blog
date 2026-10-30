---
title: 'AI 第 4 篇：Ollama 本地部署——从安装、选模型到 API 调用'
weight: 4
date: 2026-10-16T09:01:00+08:00
updatedDate: 2026-10-29T15:08:57+08:00
cover: /images/covers/ollama-local-llm-deploy-cover.jpg
categories: ['人工智能', '人工智能学习']
tags: ['Ollama', '本地大模型', '开源模型', 'Python', 'API']
description: '从安装 Ollama、选择本地模型、使用常用命令，到接入 Chatbox 和用 Python 调用 OpenAI 兼容接口的完整实战指南。'
math: false
mermaid: false
comments: true
toc: true
---
前三篇讲的是「模型是什么」，从这篇起开始动手。

开源模型免费，但普通人想在自己电脑上跑起来，得自己下权重、配推理环境、起服务，每一步都是坑。Ollama 把这些步骤收进一条命令：下载、加载、运行，顺带在本机开一个 API 端口。

## 1. Ollama 是什么

Ollama 是一个本地大模型运行器。你可以把它理解成：

> Docker 管容器，Ollama 管大模型。

没有 Ollama 时，你想在本地跑开源模型，通常要处理这些事情：

- 找模型权重文件；
- 配 Python 或 C++ 环境；
- 安装推理框架；
- 设置显存、内存、模型路径；
- 启动一个本地 API 服务。

有了 Ollama，你只需要访问官网，下载安装包，然后在终端执行：

```bash
ollama run qwen3.5
```

它会自动下载模型、加载模型并进入对话模式。

官网地址：

- 官网：<https://ollama.com/>
- 下载页：<https://ollama.com/download>
- Models 页可以理解为模型商店；
- Docs 是文档；
- Download 是安装包。

## 2. Ollama 凭什么值得用

Ollama 的核心优势可以概括成四点。

| 特点 | 一句话解释 |
|---|---|
| 数据隐私 | 模型跑在自己电脑上，对话数据不出本机，断网也能用 |
| 零成本 | 开源模型免费调用，没有 Token 账单 |
| 一行命令 | 下载、运行、对话三合一 |
| 生态兼容 | 自带 OpenAI 兼容接口，很多云端调用代码几乎原样可用 |

用一个类比：

- **云端 API** 像去饭店吃饭：算力由服务方提供，方便，但按 Token 或套餐付费。
- **本地模型** 像自己开火做饭：不用付餐费，但要自己出电费、硬件和运维成本。

Ollama 最有价值的地方不是“它一定比云端模型强”，而是它让你可以在本地低成本实验、调试提示词、学习 API 调用，而不必每次都消耗云端额度。

## 3. 安装 Ollama

### Windows 安装

下载页选择 Windows 版本。教学环境一般要求 Windows 10 及以上。安装方式很简单：

1. 下载安装包。
2. 双击运行。
3. 一路下一步。
4. 安装完成后，右下角任务栏出现羊驼图标，表示 Ollama 已在后台运行。

安装完成后，重新打开 PowerShell 或 CMD，执行：

```bash
ollama --version
```

如果能输出版本号，说明安装成功。

### 安装后第一件事：修改模型存储位置

这一步非常重要。Ollama 默认把模型放在 C 盘，而模型文件通常很大。

打开 Ollama 的 Settings，找到：

- **Model location**
- 默认路径通常在 C 盘
- 建议改成大容量数据盘，例如 `E:\models`

为什么要先改这里？因为模型文件动辄几个 GB，甚至几十 GB。常见估算如下：

| 模型规模 | 文件大小估算 |
|---|---|
| 2b | 约 1.5 GB |
| 4b | 约 2.5 GB |
| 9b | 约 5.5 GB |
| 27b | 约 16 GB |
| 35b | 约 20 GB |
| 122b | 60 GB 以上 |

所以正确顺序是：

```text
安装 Ollama → 修改模型存储位置 → 再下载模型
```

顺序反了，C 盘很快就会被塞满。

## 4. 挑模型：看懂 0.6b、2b、4b、9b 这些标签

打开 Ollama 官网的 Models 页，你会看到很多模型和参数规模标签，例如：

```text
0.6b
2b
4b
9b
27b
35b
122b
```

这里的 `b` 表示 `billion`，也就是十亿参数。

- `0.6b`：6 亿参数。
- `2b`：20 亿参数。
- `4b`：40 亿参数。
- `9b`：90 亿参数。
- `27b`：270 亿参数。
- `122b`：1220 亿参数。

参数量可以粗略理解成模型的“脑容量”。参数越多，模型通常越聪明，但也越吃显存、越慢、越占磁盘。

### 模型规模选择参考

下表的文件大小按常见量化格式估算，实际取决于量化位数、上下文长度和具体模型。

| 标签 | 参数量 | 文件约 | 适合场景 |
|---|---|---|---|
| 0.6b | 6 亿 | 小于 1 GB | 测试流程、低配设备 |
| 2b | 20 亿 | 约 1.5 GB | 普通办公本入门体验 |
| 4b | 40 亿 | 约 2.5 GB | 新手起步，速度和效果较平衡 |
| 9b | 90 亿 | 约 5.5 GB | 16GB 内存或较好独显设备 |
| 27b | 270 亿 | 约 16 GB | 大内存或中高端显卡 |
| 35b | 350 亿 | 约 20 GB | 高端显卡或工作站 |
| 122b | 1220 亿 | 60 GB 以上 | 服务器、多卡环境 |

选型口诀：

> 新手从 4b 到 9b 起步，先让它跑起来；卡了再降，闲了再升。

命令里可以指定规模标签：

```bash
ollama run qwen3.5:4b
```

如果不写标签，通常会下载默认版本。

## 5. 八条最常用命令

| 命令 | 作用 |
|---|---|
| `ollama --version` | 查看版本，验证安装是否成功 |
| `ollama run qwen3.5` | 没有就下载，然后进入对话 |
| `ollama pull qwen3.5` | 只下载模型，不进入对话 |
| `ollama list` | 列出本地已下载模型 |
| `ollama ps` | 查看当前正在运行的模型 |
| `ollama stop qwen3.5` | 停止运行中的模型，释放资源 |
| `ollama show qwen3.5` | 查看模型详情 |
| `ollama rm qwen3.5` | 删除本地模型，释放磁盘空间 |

### 常见工作流

```bash
ollama list
ollama run qwen3.5
```

进入对话后输入问题即可。退出对话用：

```text
/bye
```

退出后模型可能还会在后台驻留一段时间。想确认或释放资源：

```bash
ollama ps
ollama stop qwen3.5
```

### 删除模型前一定要确认名字

```bash
ollama list
ollama rm qwen3.5
```

`rm` 删除的是磁盘上的模型文件，不会进回收站。删除前最好用 `ollama list` 确认模型名和 tag。

## 6. 用 Chatbox 连接本地 Ollama

命令行聊天适合测试，日常使用还是图形界面更舒服。Chatbox 是一个常用的桌面 AI 客户端，个人使用免费。

下载地址：

- <https://chatboxai.app/zh#download>

Windows 桌面版一般选择 Windows 64 位。安装时也建议自定义目录，避免默认装进 C 盘。

### 连接步骤

1. 打开 Chatbox。
2. 进入设置。
3. 找到模型提供方。
4. 选择 Ollama。
5. API 主机会自动填成本机地址。
6. 点击“获取”模型列表。
7. 选择你已经在 Ollama 里下载好的模型。
8. 保存后即可聊天。

这里会再次看到本机地址：

```text
http://127.0.0.1:11434/v1/chat/completions
```

可以这么理解：

- Chatbox 是遥控器；
- Ollama 是模型主机；
- 两者都在你自己的电脑上。

### Chatbox 连不上的第一嫌疑

如果 Chatbox 报连接失败，先检查 Ollama 是否在后台运行。

方法一：看右下角有没有羊驼图标。

方法二：命令行执行：

```bash
ollama ps
```

如果命令正常返回，说明 Ollama 服务可用；如果提示命令不存在，可能是没重新打开终端或环境变量没生效。

## 7. OpenAI 兼容调用：只改三个参数

Ollama 启动后会在本机 11434 端口开一个服务，并提供 OpenAI 兼容接口：

```text
http://127.0.0.1:11434/v1/chat/completions
```

这意味着很多支持 OpenAI 格式的工具和代码，只要改三个参数，就可以从云端模型切换到本地模型。

### 安装 Python SDK

```bash
pip install openai
```

### 调用本地 Ollama

```python
from openai import OpenAI

client = OpenAI(
    api_key="ollama",
    base_url="http://127.0.0.1:11434/v1",
)

response = client.chat.completions.create(
    model="qwen3.5:latest",
    messages=[
        {"role": "system", "content": "你是一个简洁的助手，回答不超过三句话。"},
        {"role": "user", "content": "用一句话介绍你自己。"},
    ],
    temperature=0.7,
)

print(response.choices[0].message.content)
```

这里有三个关键点。

### 1. api_key 本地不验证，但不能空

```python
api_key="ollama"
```

本地 Ollama 不需要真实 API Key。但 OpenAI SDK 的调用格式通常要求这个字段有值，所以随便填一个字符串即可。

### 2. base_url 指向本机

```python
base_url="http://127.0.0.1:11434/v1"
```

云端调用时，这里可能是服务商地址；本地调用时，这里改成 Ollama 地址。

### 3. model 要和 ollama list 一致

```bash
ollama list
```

假设列表里显示：

```text
qwen3.5:latest
```

Python 代码里就写：

```python
model="qwen3.5:latest"
```

### 云端与本地参数对照

| 参数 | 调云端 DeepSeek | 调本地 Ollama |
|---|---|---|
| `api_key` | 真实 API Key | 随便填，例如 `"ollama"` |
| `base_url` | 服务商 API 地址 | `http://127.0.0.1:11434/v1` |
| `model` | 例如 `deepseek-chat` | 以 `ollama list` 显示为准 |

其他参数，例如 `messages`、`temperature`，基本保持一致。

## 8. 流式输出：实现打字机效果

想看到模型一个字一个字往外吐的效果，要加：

```python
stream=True
```

示例：

```python
from openai import OpenAI

client = OpenAI(
    api_key="ollama",
    base_url="http://127.0.0.1:11434/v1",
)

response = client.chat.completions.create(
    model="qwen3.5:latest",
    messages=[
        {"role": "system", "content": "你是一个简洁的助手。"},
        {"role": "user", "content": "介绍一下 Python 的优势。"},
    ],
    stream=True,
)

for chunk in response:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)

print()
```

`stream=True` 时，返回值不是一次性完整结果，而是一个逐块返回的生成器。每一段增量内容通常在：

```python
chunk.choices[0].delta.content
```

本地模型最大的好处是可以随便练这种流式输出，不用担心每次实验都产生费用。

## 9. 多轮对话：自己维护 messages

本地模型同样是无状态的。如果想让模型记住上文，需要把历史消息一起发过去。

```python
from openai import OpenAI

client = OpenAI(
    api_key="ollama",
    base_url="http://127.0.0.1:11434/v1",
)

messages = [
    {"role": "system", "content": "你是一个简洁的助手，回答不超过三句话。"}
]

while True:
    user_input = input("\n你：")
    if user_input.lower() in ["exit", "quit", "退出"]:
        break

    messages.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
        model="qwen3.5:latest",
        messages=messages,
        temperature=0.7,
    )

    answer = response.choices[0].message.content
    print(f"AI：{answer}")

    messages.append({"role": "assistant", "content": answer})
```

核心逻辑是：

```text
用户输入 → 追加到 messages → 调用模型 → 模型回复也追加到 messages → 下一轮继续携带
```

这就是所谓“会话历史滚雪球”。优点是模型有上下文，缺点是消息越长，token 消耗越多，本地显存或内存压力也越大。

## 10. 性能不行的判断和优化

Ollama 本地模型不一定快，速度取决于几个因素：

- 模型参数量；
- 量化格式；
- CPU 还是 GPU 推理；
- 显存大小；
- 内存大小和带宽；
- 上下文长度；
- 是否有其他程序占用资源。

### 常见慢的原因

| 现象 | 可能原因 | 处理方法 |
|---|---|---|
| 首次回答特别慢 | 正在加载模型 | 等待加载完成，或换小模型 |
| 回复很慢，风扇狂转 | 模型太大，CPU/内存吃紧 | 换 4b 或更小模型 |
| 系统卡顿 | 内存或显存不足 | 关闭其他程序，换小模型 |
| 长对话越来越慢 | 历史消息太长 | 截断上下文或开新会话 |
| 下载中断 | 网络不稳定 | 重试，Ollama 支持断点续传 |

### 优化顺序

建议按这个顺序排查：

```text
先换小模型 → 再看 ollama ps → 再看系统资源 → 再缩短上下文 → 最后再考虑换硬件
```

不要一上来就下载最大模型。先让流程跑通，再逐步提高模型规模。

## 11. 常见错误排查表

| 现象 | 原因 | 解决方法 |
|---|---|---|
| `ollama` 不是内部或外部命令 | 安装后没重开终端，环境变量未生效 | 关闭 PowerShell/CMD 后重开；还不行就重启电脑 |
| Chatbox 连接失败 | Ollama 没在后台运行 | 打开 Ollama，看任务栏羊驼图标，或执行 `ollama ps` |
| Chatbox 没有可用模型 | 本地没有下载模型，或没刷新列表 | 执行 `ollama list`，或点“获取”刷新 |
| `ollama pull` 很慢 | 模型源在境外或网络波动 | 换时段重试，或先下载小模型 |
| Python 报 model not found | `model` 参数和 `ollama list` 不一致 | 用 `ollama list` 里的完整名字 |
| C 盘空间减少 | 模型默认存储在 C 盘 | Settings 里修改 Model location |
| 回复乱码或异常截断 | 上下文长度不足或模型不合适 | 降低上下文长度，换模型，或减少输入内容 |

排查顺序建议：

```text
先看 Ollama 命令行 → 再看模型列表 → 再看本地服务地址 → 再看 Chatbox/Python 参数 → 最后看电脑资源
```

## 12. 一个可复用的本地调用模板

下面这个模板适合保存下来，改成自己的模型名和提示词即可使用。

```python
from openai import OpenAI

client = OpenAI(
    api_key="ollama",
    base_url="http://127.0.0.1:11434/v1",
)

SYSTEM_PROMPT = """你是一名严谨的中文学习助手。
要求：
1. 回答必须简洁；
2. 先给结论，再解释；
3. 不要编造不确定的信息；
4. 如果信息不足，请主动追问。"""

def ask(model, messages):
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.7,
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    model_name = "qwen3.5:latest"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": "用三句话解释什么是本地大模型。"},
    ]

    print(ask(model_name, messages))
```

你可以重点改三处：

1. `SYSTEM_PROMPT`：换成你自己的角色、任务和要求。
2. `model_name`：以 `ollama list` 为准。
3. 用户输入：换成你真正要解决的问题。

## 13. 实战检查清单

如果你想让 Ollama 稳定跑起来，按这个清单过一遍：

1. **确认安装成功**

   ```bash
   ollama --version
   ```

2. **修改模型存储位置**  
   不要等 C 盘满了再改。

3. **先下载小模型**

   ```bash
   ollama run qwen3.5:4b
   ```

4. **确认本地模型列表**

   ```bash
   ollama list
   ```

5. **确认服务状态**

   ```bash
   ollama ps
   ```

6. **用 Chatbox 测试图形界面聊天**

7. **用 Python 测试 OpenAI 兼容调用**

8. **测试流式输出**

9. **测试多轮对话**

10. **根据速度和资源占用调整模型规模**

## 14. 学完这篇，你应该能回答这些问题

1. **Ollama 和 ChatGPT 这类云端服务有什么区别？**  
   Ollama 把开源模型跑在你本地，数据不出本机；云端服务使用服务商算力，通常按 API 用量计费。

2. **模型标签里的 4b、9b 是什么意思？**  
   `b` 表示十亿参数，`9b` 就是 90 亿参数。参数越多，模型通常越强，但资源占用也更高。

3. **为什么要先改模型存储位置？**  
   因为模型文件很大，默认放在 C 盘容易占满系统盘。

4. **本地调用为什么还要填 api_key？**  
   因为 OpenAI SDK 格式通常要求这个字段存在；本地 Ollama 不验证真实 Key，随便填一个非空字符串即可。

5. **为什么本地模型也会“失忆”？**  
   因为模型服务是无状态的。多轮记忆要靠客户端把历史 messages 一起发送。

掌握这些内容后，你已经可以独立完成本地模型安装、模型选择、命令行对话、Chatbox 接入和 Python API 调用，也能用同一种结构去理解云端模型服务。

本地有本地的限制。[第 5 篇：大模型 API 与 Apifox](/post/llm-api-apifox-deepseek/) 把同样的调用搬到云端，顺带说说 API Key 为什么本身就是一道安全题。
