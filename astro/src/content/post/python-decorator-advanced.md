---
title: 'Python 第 15 篇：多装饰器与带参数的装饰器'
weight: 15
cover: /images/covers/python-decorator-advanced-cover.jpg
date: 2026-11-02T13:00:00+08:00
updatedDate: 2026-11-02T13:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '装饰器', '闭包']
description: '第 12 篇的装饰器只能一层、只接函数。这一篇补上最后两课：多个装饰器叠在一层怎么执行、装饰器自己怎么带参数，外加两个实战——统一调用日志、把模型调用器用闭包封好。'
math: false
mermaid: false
comments: true
toc: true
---

第 12 篇学会了「给函数加外挂」。但真到了项目里，有两个需求它还接不住：

1. **一个函数要挂多个外挂**——发表评论前，既要检查登录、又要校验验证码，两个装饰器怎么一起用？
2. **装饰器自己也要参数**——`@logging('+')` 加法和 `@logging('-')` 减法想打印不同的提示，装饰器怎么收这个参数？

这一篇把这两课补完，装饰器就算毕业了。

## 1. 温习：一个装饰器的结构

先快速过一遍第 12 篇的「无参装饰器」，它是后面一切的地基：

```python
def check_login(fn):
    def fn_inner(*args, **kwargs):
        print('检查登录.....')
        return fn(*args, **kwargs)     # 调用原函数，返回它的结果
    return fn_inner

@check_login
def comment():
    print('发表评论')

comment()
# 检查登录.....
# 发表评论
```

四步走：**外层函数收函数 → 内层函数加功能并调用原函数 → 返回内层 → `@` 那一行等价于 `comment = check_login(comment)`**。

## 2. 多装饰器：一层套一层

一个操作要过两道检查——先验证码、再登录。两个装饰器写好了，叠上去就行：

```python
from typing import Callable

def check_login(fn_name: Callable):
    def fn_inner(*args, **kwargs):
        print('检查用户名和密码登录信息...........')
        return fn_name(*args, **kwargs)
    return fn_inner

def check_code(fn_name: Callable):
    def fn_inner(*args, **kwargs):
        print('校验验证码...........')
        return fn_name(*args, **kwargs)
    return fn_inner

@check_login
@check_code
def comment():
    print('发表评论.....................')

comment()
```

输出顺序，注意看：

```text
检查用户名和密码登录信息...........
校验验证码...........
发表评论.....................
```

**登录在前，验证码在后**。为什么？记住等价关系：

```python
@check_login
@check_code
def comment():
    ...
```

完全等价于：

```python
comment = check_login(check_code(comment))
```

拆开看执行顺序：

1. 先算最里面：`check_code(comment)`，得到一个「先验证码、再评论」的新函数；
2. 再算外面：`check_login(那个新函数)`，得到一个「先登录、再（先验证码、再评论）」的函数。

所以装饰器**从下往上包裹**，执行时**从上往下**——最靠近函数的 `@check_code` 最后执行，最上面的 `@check_login` 最先执行。

记一条：**靠近函数的后执行，离函数远的先执行。** 记不住就写回「手动版」`check_login(check_code(comment))`，顺序一目了然。

## 3. 带参数的装饰器：三层嵌套

需求变了：同一个「打印日志」装饰器，加法和减法要打印不同的提示。装饰器要能收参数。

对比一下无参版和带参版的结构：

```python
# 无参：两层
def logging(fn):
    def inner(*args, **kwargs):
        print('正在计算.....')
        return fn(*args, **kwargs)
    return inner

# 带参：三层
def logging(flag: str):                 # 最外层收装饰器自己的参数
    def decorator(fn):                  # 中间层收被装饰的函数
        def inner(x: int, y: int):      # 最内层才是真正的包装
            if flag == '+':
                print('正在努力进行加法运算----------')
            elif flag == '-':
                print('正在努力进行减法运算----------')
            else:
                print('正在努力进行其他运算-----------')
            return fn(x, y)
        return inner
    return decorator
```

多了一层，但每层职责清晰：**外层收「装饰器参数」，中层收「函数」，内层干「包装的活」**。

用起来：

```python
@logging('+')
def plus_operator(number1: int, number2: int) -> int:
    return number1 + number2

@logging('-')
def minus_operator(number1: int, number2: int) -> int:
    return number1 - number2

print(plus_operator(99, 1))     # 正在努力进行加法运算----------  100
print(minus_operator(99, 1))    # 正在努力进行减法运算----------  98
```

`@logging('+')` 的等价关系，比无参版多一步：

```python
plus_operator = logging('+')(plus_operator)
```

先 `logging('+')`——最外层跑一次，`flag` 被记住（这就是第 12 篇的闭包），返回 `decorator`；再 `decorator(plus_operator)`——和普通装饰器一样，把函数包起来。

所以带参装饰器 = **外层闭包记住参数，返回一个真正的装饰器**。闭包和装饰器在这里首尾相接。

### 3.1 怎么记三层

写带参装饰器最容易漏一层。有个固定套路：

```python
def 装饰器名(装饰器参数):
    def decorator(fn):
        def inner(*args, **kwargs):
            # 这里能同时看到「装饰器参数」和「fn」
            # 加额外功能 → 调用 fn(*args, **kwargs) → 返回结果
            return fn(*args, **kwargs)
        return inner
    return decorator
```

三行 `return` 对应三层，一层都不能少。忘写最外层的 `return decorator`，`logging('+')` 返回 `None`，`@` 那一行就把 `None` 当装饰器用了，直接崩。

## 4. 实战一：调用日志装饰器（叠加文件操作）

现在把装饰器和第 11 篇的文件操作、本篇前两节串起来，做一个真实需求：

> 知识库里有「文档入库」和「向量检索」两个函数，统一记录调用情况：每次调用把「函数名 + 参数」追加写进 `calls.log`，长期累积、不能覆盖。

```python
from typing import Callable

LOG_PATH = 'calls.log'

def record_call(func: Callable):
    def inner(*args, **kwargs):
        with open(LOG_PATH, 'a', encoding='utf-8') as f:
            f.write(f"调用{func.__name__}函数，参数：({args}, {kwargs})\n")
        result = func(*args, **kwargs)
        return result
    return inner

@record_call
def add_doc(doc_id: str, content: str):
    print(f'文档 {doc_id} 已入库，长度：{len(content)}.')

@record_call
def search(query: str, top_k=3):
    print(f'检索：{query}，返回 {top_k} 条.')

add_doc('D-001', '智能体')
search(query='大模型智能体', top_k=3)
```

三个要点：

1. **`open(..., 'a')` 追加写**——第 11 篇说过 `'a'` 不会清空旧内容，日志一行行攒着，正好；
2. **`func.__name__` 拿函数名**——不用硬编码「add_doc」「search」，换别的函数自动跟着变；
3. **`result = func(...)` 再 `return result`**——原函数的返回值原样传回，装饰器不能把它「吃掉」。

这个例子覆盖了三篇的内容：装饰器（第 12/15 篇）+ 文件追加写（第 11 篇）+ 可变参数 `*args, **kwargs`（第 6 篇）。

## 5. 实战二：用闭包封一个模型调用器

再做一个「带状态」的封装。某个大模型服务的入口：**模型名和温度系数在初始化时定死，之后每次只传提示词**，并且每次返回要带上「这是第几次调用」。

```python
from typing import Callable

def make_caller(model_name: str, temperature: float) -> Callable:
    counter = 0                        # 外层记住的调用次数

    def call(prompt: str) -> str:
        nonlocal counter               # 要改外层变量，必须声明
        counter += 1
        return f'[{model_name} | {temperature}]第 {counter} 次调用：{prompt}'

    return call

deepseek = make_caller('deepseek', 0.8)
print(deepseek('你好呀！你是谁？'))
print(deepseek('一句话介绍什么是智能体？'))

qwen = make_caller('qwen', 0.3)
print(qwen('你是谁？'))
```

输出：

```text
[deepseek | 0.8]第 1 次调用：你好呀！你是谁？
[deepseek | 0.8]第 2 次调用：一句话介绍什么是智能体？
[qwen | 0.3]第 1 次调用：你是谁？
```

三点值得注意：

1. **`make_caller('deepseek', 0.8)` 造出一个「专用调用器」**——模型名和温度被闭包记住，之后只管传提示词。这和第 12 篇线性回归的 `linear(k, b)` 是同一个结构：**闭包记住的变量就是配置**；
2. **`nonlocal counter`**——`counter += 1` 是「改」外层变量，必须声明，否则 `UnboundLocalError`（第 12 篇讲过）；
3. **两个调用器各记各的次数**——`deepseek` 数到 2，`qwen` 从头数到 1。每次调外层函数，都开一块独立的记忆。

真实项目里，`call` 里面那行 `f'[...]'` 换成真的 `client.chat.completions.create(...)`，就是第 5 篇那个模型调用函数的前身。

## 6. 常见坑清单

1. **多装饰器顺序记反**——`@` 从下往上包裹、从上往下执行。写回 `a(b(fn))` 立刻清楚；
2. **带参装饰器少写一层 return**——三层结构三个 `return`，漏最外层的 `return decorator`，`@logging('+')` 拿到 `None`，一调用就崩；
3. **带参装饰器里 `flag` 和 `fn` 放错层**——装饰器参数在外层、函数在中层。想在内层用 `flag`？可以，闭包让内层能看到所有外层变量；
4. **日志用 `'w'` 写**——每次调用都清空重写，日志只剩最后一条。长期累积用 `'a'` 追加；
5. **装饰器里忘了 `return result`**——原函数返回值被吞，所有被装饰的函数都返回 `None`（第 12 篇的坑，这里再犯一次）；
6. **`func.__name__` 被包层后变 `inner`**——本阶段知道即可，真实项目用 `functools.wraps` 保住原名。

## 7. 课后小项目

**练习一：双保险（必做）**

给一个「下单」函数叠两个装饰器：`@check_login` 和 `@check_stock`（检查库存）。先猜输出顺序，再跑验证——谁先执行，为什么？

**练习二：分级日志装饰器**

写 `@log(level)`：`@log('info')` 打印 `[INFO] 函数名`，`@log('error')` 打印 `[ERROR] 函数名`。带参数的三层结构，比第 4 节实战一多收一个参数而已。

**练习三：调用计数器（综合）**

写 `@count_calls`：装饰任意函数，每次调用让计数器加一，并提供一个查询当前次数的方法（提示：把计数列表挂在函数属性上，比如 `func.calls`，或用一个 `nonlocal` 变量配合闭包返回）。拿去量一量第 6 篇成绩分析工具箱里「找最高分」被调了几次。

## 8. 系列收官

到这里，十五篇走完了。回看这条线：

| 篇 | 你做出了什么 |
|---|---|
| 1~2 | 能跑的程序、会算的 BMI 计算器 |
| 3~4 | 会判断、会循环的猜数字与石头剪刀布 |
| 5 | 一次处理一批数据的记账本 |
| 6~7 | 函数彻底用对、代码拆成模块 |
| 8~10 | 面向对象：聊天机器人、智能助手、助手家族 |
| 11 | 让程序记得住事的文件工具 |
| 12 | 闭包与装饰器：给函数装外挂 |
| 13 | 给数据立格式：CSV、TSV、JSON |
| 14 | 看清变量本质：赋值、浅拷贝、深拷贝 |
| 15 | 装饰器进阶：多装饰器与带参装饰器 |

第 12 篇说过，这系列前十二篇讲的是**语法**，真正让程序有价值的是**结构**。13、14、15 这三篇，恰好把「结构」又往上顶了一层：**数据要有格式、变量要看得见内存、功能要能优雅地叠加**。

再往后，Python 侧可以看虚拟环境、生成器、类型标注进阶；想走 AI 主线，[大模型概念网络](/post/ai-llm-concept-network/)、[Transformer 与注意力](/post/transformer-attention-basics/)、[Ollama 本地部署](/post/ollama-local-llm-deploy/)、[大模型 API 调用](/post/llm-api-apifox-deepseek/)、[提示词工程](/post/prompt-engineering-workflow/)、[Streamlit 聊天应用](/post/streamlit-ai-chat/)、[Agent 开发](/post/ai-agent-tool-memory-rag/) 这条线接着走。

十五篇里你写了十五个能跑的程序。语法会忘，但「从空文件到能跑起来」这段路，你已经走了十五遍——这比任何语法都值钱。
