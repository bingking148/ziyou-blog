---
title: 'Python 第 18 篇：正则与生成器，处理文本和超大文件'
weight: 18
cover: /images/covers/python-regex-generator-cover.jpg
date: 2026-11-04T09:00:00+08:00
updatedDate: 2026-11-04T09:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '正则表达式', '生成器']
description: '最后两个处理数据的利器：正则表达式负责从杂乱文本里挖出想要的字段，生成器负责用很小的内存处理超大数据。从 match/search/findall 一路写到 yield 分批读文件，末尾回看整个系列。'
math: false
mermaid: false
comments: true
toc: true
---

前面的程序要么自己造数据，要么读规整的文件。可真实世界的文本是乱的：一段日志里混着时间、用户名、IP、耗时，一篇文章里要找出所有手机号。怎么从这一堆字符里精准挖出想要的那部分？用正则表达式。

另一个麻烦是「大」。第 11 篇读文件时 `readlines()` 会把整个文件装进内存，几百万行的文件这么读，内存直接爆。怎么用很小的内存处理超大文件？用生成器。

这两个都是「处理数据」的利器，一篇讲完，顺便给整个系列收个尾。

## 1. 正则表达式：给字符串定「长相」

正则表达式（re）是一套描述「字符串长什么样」的语言。你给它一个模式，它就能在文本里找到符合这个模式的所有片段。

先看最基础的三个查找方法：

```python
import re

text = 'order_id=8801, user_id=8802, item_id=8803'

m1 = re.match(r'\d+', text)
print(f'match匹配结果：{m1}')       # None

s1 = re.search(r'\d+', text)
print(f'search匹配结果：{s1}')      # <re.Match object; span=(9, 13), match='8801'>

f1 = re.findall(r'\d+', text)
print(f'findall匹配结果：{f1}')     # ['8801', '8802', '8803']
```

`\d` 表示「一个数字」，`\d+` 表示「一个或多个数字」。三个方法的区别：

| 方法 | 干什么 | 返回 |
|---|---|---|
| `match` | 从字符串**开头**匹配 | 不匹配开头就返回 None |
| `search` | 在字符串里**找到第一个** | 一个 Match 对象 |
| `findall` | 找到**所有** | 一个列表 |

上面 `match` 返回 None，因为 `text` 开头是 `order_id`，不是数字；`search` 找到第一个数字串 `8801`；`findall` 把三个数字串全挖出来了。

拿到 Match 对象后，用 `.group()` 取出匹配到的内容：

```python
result = re.search(r'\d+', text)
print(result.group())   # 8801
```

注意匹配不上时返回 None，`None.group()` 会报错。所以要先判断：

```python
result = re.search(r'teacher', 'dasima is a teacher')
if result:
    print(result.group())
```

## 2. 替换和整串匹配

除了查找，还有两个常用的。

`sub` 做替换，比如去掉语气词、给手机号打码：

```python
sentence = '车主说：你的刹车片应该更换了啊，嘿嘿'
new_sentence = re.sub(r'[呢吧哈啊啦嘿]', '', sentence)
print(new_sentence)   # 车主说：你的刹车片应该更换了，

raw_telephone = '联系 13812345678 或 12998765432'
safe = re.sub(r'(\d{3})\d{4}(\d{4})', r'\1****\2', raw_telephone)
print(safe)   # 联系 138****5678 或 129****5432
```

第二个例子值得拆一下：`(\d{3})\d{4}(\d{4})` 里的小括号是「捕获组」，把号码分成三段——前 3 位、中间 4 位、后 4 位。替换的目标 `r'\1****\2'` 里的 `\1`、`\2` 指代第一、第二个捕获组，中间 4 位换成 `****`。

`fullmatch` 做「整串必须完全符合」，比如校验手机号：

```python
pattern = r'1[3-9]\d{9}'
for phone in ['13812345678', '1381234567', '138123456789', '23412345678']:
    result = re.fullmatch(pattern, phone)
    print(f'{phone}: {result}')
```

`1[3-9]\d{9}` 拆开读：`1` 开头，第二位是 3 到 9 之间的数字，后面 9 位任意数字，一共 11 位。`fullmatch` 要求整串匹配，所以多一位、少一位、开头不对的，全返回 None。

## 3. 数量词：说清「出现几次」

`\d` 是「一个数字」，可「连续几个数字」就要靠数量词：

```python
import re

text = 'abc123def'

print(re.search(r'\d*', text))      # *   0 个或多个
print(re.search(r'\d+', text))      # +   1 个或多个
print(re.search(r'\d?', text))      # ?   0 个或 1 个
print(re.search(r'\d{2,3}', text))  # {2,3}  2 到 3 个
```

四个数量词：

| 符号 | 含义 |
|---|---|
| `*` | 0 个或多个 |
| `+` | 1 个或多个 |
| `?` | 0 个或 1 个 |
| `{m,n}` | m 到 n 个 |

`\d{2,3}` 在 `abc123def` 里匹配到 `123`（最多 3 个就停）。

## 4. 贪婪与非贪婪

有个容易踩的坑：默认的匹配是「贪婪」的，能多拿就多拿。

```python
html = '<h1>标题</h1><p>正文</p>'

r1 = re.search(r'<.+>', html)
print(r1)   # 匹配了整个 '<h1>标题</h1><p>正文</p>'

r2 = re.search(r'<.+?>', html)
print(r2)   # 只匹配了 '<h1>'
```

`<.+>` 里的 `.` 是「任意字符」，`+` 是「一个或多个」。贪婪模式下它从第一个 `<` 一路吃到最后一个 `>`，把整串都吞了。加个 `?` 变成 `.+?`，就是非贪婪——能少拿就少拿，匹配到第一个 `>` 就停。

想「从标签里抽内容」这类需求，几乎都要用非贪婪，不然一抓一大串。

## 5. 实战：解析一段日志

把这些拼起来，解析一段真实的日志。假设有这么几行：

```python
import re

log_data = """2026-11-04 09:12:31 INFO  user=alice ip=192.168.1.20 path=/api/login  status=200 cost=12ms
2026-11-04 09:12:35 ERROR user=bob   ip=10.0.0.8     path=/api/pay    status=502 cost=3012ms
2026-11-04 09:12:41 INFO  user=carol ip=172.16.5.9   path=/api/list   status=200 cost=35ms"""

# 提取所有 IP 地址
ip_list = re.findall(r'\b\d{1,3}(?:\.\d{1,3}){3}\b', log_data)
print(f'ip 地址：{ip_list}')

# 提取所有用户名
username_list = re.findall(r'user=(\w+)', log_data)
print(f'用户名：{username_list}')

# 提取所有耗时
cost_list = re.findall(r'cost=([1-9]\d*)ms', log_data)
print(f'耗时：{cost_list}')
```

三行代码，把日志里的 IP、用户名、耗时全挖出来了。几个新面孔：

1. `\b` 是「单词边界」，防止匹配到 `192.168.1.20` 这种格式之外多余的数字；
2. `(?:...)` 是「非捕获组」——括号只是为了分组（`\.\d{1,3}` 重复 3 次），但不单独捕获。IP 地址的模式就是「1 到 3 位数字，后面跟 `.数字` 重复 3 次」；
3. `\w` 是「字母、数字、下划线」；
4. `user=(\w+)` 里的括号是**捕获组**，`findall` 遇到捕获组时，返回的是捕获组里的内容，不是整个匹配。所以拿到的是 `alice`、`bob` 而不是 `user=alice`。

## 6. 生成器：一次只算一个

正则解决「挖数据」，生成器解决「大数据」。先看问题：把一个数乘 2，列表推导式会一次性把结果全算出来、全存进内存：

```python
number = 1000000
data = [item * 2 for item in range(1, number + 1)]   # 内存里立刻有 100 万个数的列表
result = sum(data)
```

换成生成器表达式——把方括号换成圆括号：

```python
data_gen = (item * 2 for item in range(1, number + 1))   # 一个生成器对象，啥都还没算
result = sum(data_gen)
```

`data_gen` 不是列表，是一个生成器对象。它**没算任何东西**，只是记住了「怎么算」。等到 `sum` 真正要用的时候，才一个接一个地现算。好处是内存：列表要同时装下 100 万个数，生成器任何时候只保留一个。

## 7. yield：函数也能变成生成器

生成器表达式只能表达「一行就能写完」的逻辑，复杂一点的用 `yield` 写生成器函数。

```python
def worker():
    print('跑到函数第一行了............')
    yield 1

    print('跑到函数第三行了............')
    yield 2

    print('跑到函数第五行了.............')

gen = worker()
print(type(gen))          # <class 'generator'>

print(next(gen))          # 跑到函数第一行...  1
print(next(gen))          # 跑到函数第三行...  2
print(next(gen))          # 跑到函数第五行...
```

函数里一旦出现 `yield`，这个函数就不再是普通函数了：调用它**不执行函数体**，而是返回一个生成器。每 `next()` 一次，函数才往下跑，跑到下一个 `yield` 就停下来、把 `yield` 后面的值交出去。这就是「惰性求值」——不催就不算，催一次算一点。

## 8. 实战：分批读超大文件

生成器最经典的用途，就是分批读文件。第 11 篇的 `readlines()` 会把整个文件装进内存，改成生成器，一次只读一批：

```python
import math

def batch_loader(path: str, batch_size: int):
    with open(path, 'r', encoding='utf-8') as f:
        datas = f.readlines()       # 这里先全读进来，实际项目可改成流式

    batches = math.ceil(len(datas) / batch_size)   # 算分几批

    for batch_idx in range(1, batches + 1):
        batch_data = datas[(batch_idx - 1) * batch_size: batch_idx * batch_size]
        yield batch_data           # 一次交出一批

for data_list in batch_loader('./nlp_data.txt', 4):
    print(data_list)
```

`batch_loader` 是个生成器：每次 `yield` 一批数据，`for` 循环一批一批地拿。14 行文件、每批 4 行，就分 4 次吐出。真实项目里把「先 `readlines()` 全读进来」换成「边读边吐」，就能用固定的小内存处理任意大的文件。

生成器和大模型场景也直接相关：训练数据几百万条，不可能一次全读进内存，都是这样一批一批喂给模型的。

## 9. 系列收官

到这里，十八篇走完了。回看这条线：

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
| 16 | 网络编程：让程序隔空说话 |
| 17 | 进程线程：让程序同时干活 |
| 18 | 正则与生成器：挖数据、扛大数据 |

前十二篇铺的是语法，后六篇补的是几块「真功夫」：数据要有格式、变量要看得见内存、功能要能优雅叠加、程序要能跨网络、能并发、能扛大数据。

**想继续 Python 的深度**：虚拟环境（`venv`、`pip` 隔离依赖）、迭代器协议（生成器背后的原理）、类型标注进阶（`typing`、泛型）。

**想走 AI 主线**（这个专栏的初衷）：

- [大模型概念网络](/post/ai-llm-concept-network/)——先搞清楚那些名词都是什么；
- [Transformer 与注意力机制](/post/transformer-attention-basics/)——模型内部怎么运作；
- [Ollama 本地部署](/post/ollama-local-llm-deploy/)——在自己电脑上跑一个大模型；
- [大模型 API 调用](/post/llm-api-apifox-deepseek/)——用 Python 调 DeepSeek；
- [提示词工程](/post/prompt-engineering-workflow/)——怎么把话说清楚；
- [Streamlit 聊天应用](/post/streamlit-ai-chat/)——做出能给别人用的界面；
- [Agent 开发](/post/ai-agent-tool-memory-rag/)——工具、记忆、RAG。

十八篇里你写了十八个能跑的程序。它们都很小，但每一个都是完整的。语法早晚会忘，「从空文件到能跑起来」这段路你已经走了十八遍——这才是真正带走的东西。
