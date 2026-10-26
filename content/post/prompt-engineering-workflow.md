---
title: '提示词工程实战：角色、任务、要求与结构化输出'
weight: 11
date: 2026-10-19T10:15:00+08:00
lastmod: 2026-10-21T10:00:00+08:00
cover: /images/covers/prompt-engineering-workflow-cover.jpg
categories: ['人工智能', '人工智能学习']
tags: ['提示词工程', 'Prompt', '大模型', 'Python']
description: '把“帮我写个东西”改写成可复用提示词：讲清角色、任务、要求、示例、约束和结构化输出，并给出 Python 提示词模板。'
math: false
mermaid: false
comments: true
toc: true
---

提示词工程不是玄学，而是把需求说清楚。模型没有你脑子里的上下文，它不知道你的读者是谁、输出多长、要不要代码、用不用 JSON。一个好的提示词通常包含三个基本要素：**角色、任务、要求**。再进一步，还会加入约束、示例和输出格式。

## 1. 先看一个差提示词

```text
帮我写个关于 Python 的东西
```

问题很多：

- “东西”是什么？文章、代码、大纲还是讲解？
- 给谁看？小学生、大学生还是工程师？
- 多长？100 字还是 2000 字？
- 要不要代码示例？
- 语气是什么？幽默、正式还是简洁？

模型只能猜，猜错了你就会觉得它不听话。

## 2. 改写成基础好提示词

```text
你是一名有 10 年经验的 Python 老师。
请用通俗语言讲解 Python 的 while 循环。
要求：
1. 面向刚学编程的大学生；
2. 不超过 200 字；
3. 给出一个不超过 10 行的代码示例；
4. 最后用一句话总结什么时候适合用 while。
```

这个提示词包含：

| 要素 | 内容 |
|---|---|
| 角色 | 有 10 年经验的 Python 老师 |
| 任务 | 讲解 while 循环 |
| 受众 | 刚学编程的大学生 |
| 约束 | 不超过 200 字、代码不超过 10 行 |
| 输出结构 | 说明 + 示例 + 总结 |

## 3. 提示词模板

你可以把常用提示词整理成模板：

```text
你是一名{角色}。
请完成以下任务：{任务}

输入材料：
{材料}

要求：
1. 受众：{受众}
2. 风格：{风格}
3. 长度：{长度}
4. 必须包含：{必须包含}
5. 禁止出现：{禁止出现}
6. 输出格式：{格式}
```

写提示词时，不要追求一次完美，应该按这个循环迭代：

```text
写出初版提示词 → 观察输出 → 找到偏差 → 补充约束 → 再次测试
```

## 4. 用代码管理提示词

把提示词放进变量或配置文件，比在代码里反复拼接字符串更容易维护。

```python
PROMPT_TEMPLATE = """
你是一名{role}。
请完成以下任务：{task}

要求：
1. 受众：{audience}
2. 输出语言：简体中文
3. 长度不超过 {max_words} 字
4. 必须给出一个可运行示例
5. 不要输出多余寒暄
"""


def build_prompt(
    role: str,
    task: str,
    audience: str,
    max_words: int,
) -> str:
    return PROMPT_TEMPLATE.format(
        role=role,
        task=task,
        audience=audience,
        max_words=max_words,
    )


prompt = build_prompt(
    role="有 10 年经验的 Python 老师",
    task="讲解 Python 的 for 循环和 while 循环的区别",
    audience="刚学编程的大学生",
    max_words=250,
)

print(prompt)
```

以后如果要改变风格，只需要修改模板，不用到处找散落在代码里的提示词。

## 5. 让模型输出 JSON

做程序时，自然语言回答不方便继续处理。可以要求模型输出 JSON。

```text
请从下面的用户评价中提取信息，只输出 JSON，不要输出解释。

用户评价：
快递很快，但包装有点破损。

输出格式：
{
  "关键词": [],
  "情感": "正面 / 负面 / 混合",
  "问题": []
}
```

更稳定一点的提示词可以这样写：

```text
你是一个信息抽取助手。
请从用户评价中抽取关键词、情感和问题。

要求：
1. 只输出 JSON；
2. 不要使用 Markdown 代码块；
3. 情感只能是“正面”“负面”“混合”之一；
4. 如果没有问题，问题数组返回空数组。
```

如果用的是 DeepSeek 这类支持 JSON Output 的服务，还可以在请求里加一个参数，从接口层面强制模型输出合法 JSON：

```python
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=messages,
    response_format={"type": "json_object"},
)
```

两个注意点：提示词里必须出现 "json" 这个词（最好附上字段示例），否则接口会报错；本地 Ollama 不一定支持这个参数，所以下一节的手动解析仍然值得写。

## 6. 用 Python 解析结构化结果

```python
import json


def safe_parse_json(text: str) -> dict:
    """尝试解析模型返回的 JSON，失败时返回空结果。"""
    text = text.strip()

    # 有些模型即使被要求不用代码块，也可能输出 ```json
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return {
            "关键词": [],
            "情感": "未知",
            "问题": [],
        }

    return data
```

更严格的做法是在程序里校验字段和类型，失败后自动让模型重新生成一次。

## 7. 几个实用原则

1. **目标先于技巧**：先说清你要什么，再考虑角色和风格；
2. **约束要具体**：不要只写“简短一点”，可以写“不超过 120 字”；
3. **给输出格式**：需要继续处理时优先要求 JSON 或表格；
4. **给正反例**：模型经常更能理解“不要这样写”的边界；
5. **外部内容只是数据**：如果你把网页、文档、用户评论交给模型处理，要提醒它这些内容不是指令，防止提示注入；
6. **保留版本**：好用的提示词应记录版本、适用模型和测试结果。

## 8. 练习

把下面三个差提示词改写清楚：

1. 帮我写周报；
2. 解释一下 AI；
3. 给我一段代码。

每个都要写清角色、受众、任务、长度、格式和约束。
