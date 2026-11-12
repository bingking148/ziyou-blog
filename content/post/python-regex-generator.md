---
title: '文件与数据 第 4 篇：正则与生成器，处理文本和超大文件'
weight: 4
cover: /images/covers/python-regex-generator-cover.jpg
date: 2026-11-04T09:00:00+08:00
lastmod: 2026-11-12T20:30:00+08:00
categories: ['人工智能', 'Python文件与数据']
tags: ['Python', '编程基础', '正则表达式', '生成器']
description: '从杂乱文本里挖出想要的字段，再用生成器分批读超大文件。这一篇是文件与数据专栏的最后一篇。'
math: false
mermaid: false
comments: true
toc: true
---

本专栏前三篇把数据写进了文件、给了格式，也看清了拷贝。可真实世界的文本是乱的：一段日志里混着时间、用户名、IP、耗时，一篇文章里要找出所有手机号。怎么从这一堆字符里精准挖出想要的那部分？用正则表达式。

另一个麻烦是「大」。第 1 篇读文件时 `readlines()` 会把整个文件装进内存，几百万行的文件这么读，内存直接爆。怎么用很小的内存处理超大文件？用生成器。

这两个都是处理数据的办法，这一篇讲完。

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

第二个例子拆开看：`(\d{3})\d{4}(\d{4})` 里的小括号是「捕获组」，把号码分成三段——前 3 位、中间 4 位、后 4 位。替换的目标 `r'\1****\2'` 里的 `\1`、`\2` 指代第一、第二个捕获组，中间 4 位换成 `****`。

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

有个容易忽略的地方：默认的匹配是「贪婪」的，能多拿就多拿。

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

函数里一旦出现 `yield`，这个函数就不再是普通函数了：调用它**不执行函数体**，而是返回一个生成器。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-yield-pause" viewBox="0 0 680 420" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>调用带 yield 的函数不执行函数体；每次 next 才跑到下一个 yield 并交出值</title>
  <style>
    .diag-yield-pause { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-yield-pause { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M312,39.8 Q474.7,40.3 638,40.7 Q649.8,39.7 649.9,52 Q650.9,189.8 650.5,328 Q649.9,340.2 638,339.1 Q475.6,339.2 312,340.7 Q300.3,340.2 299.5,328 Q301,189.8 299.2,52 Q299.9,40.1 312,39.8 Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="475" y="66" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">函数体</text>
  <text x="320" y="110" font-size="15" text-anchor="start" dominant-baseline="central" fill="currentColor">跑到函数第一行了</text>
  <path d="M530,88.4 Q574.9,87.2 620,87.9 Q630.4,87.6 630.3,98 Q629.4,107.5 629.9,118 Q630,127.7 620,127.5 Q574.5,127.5 530,128.6 Q519.7,127.7 519.6,118 Q519.5,107.6 520.7,98 Q519.8,88.2 530,88.4 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="575" y="108" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">yield 1</text>
  <text x="320" y="190" font-size="15" text-anchor="start" dominant-baseline="central" fill="currentColor">跑到函数第三行了</text>
  <path d="M530,168 Q574.9,168.7 620,167.6 Q629.9,167.9 630.1,178 Q630.1,188.5 630.3,198 Q630.1,207.9 620,207.5 Q574.7,208.5 530,208.8 Q520.1,208.1 519.1,198 Q519,188.1 520,178 Q520.1,168.2 530,168 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="575" y="188" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">yield 2</text>
  <text x="320" y="270" font-size="15" text-anchor="start" dominant-baseline="central" fill="currentColor">跑到函数第五行了</text>
  <path d="M530,248.1 Q574.8,247.1 620,248.6 Q630.2,248.3 629,258 Q630.2,267.8 631,278 Q630.2,288.2 620,287.4 Q574.5,288 530,288.4 Q519.9,288.3 519.2,278 Q519.5,268.3 519.2,258 Q519.7,248.3 530,248.1 Z" fill="var(--fill-gray)" stroke="var(--gray)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="575" y="268" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">没有 yield</text>
  <path d="M40,50.8 Q105,50.1 170,49.9 Q179.7,50.2 180.7,60 Q180.8,77.7 180.5,96 Q180.1,105.7 170,105.5 Q104.8,105.8 40,106.8 Q30.1,106.3 30.9,96 Q29.9,77.4 29.9,60 Q29.9,49.9 40,50.8 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="105" y="78" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">worker()</text>
  <line x1="180" y1="78" x2="252" y2="78" stroke="var(--gray)" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="6 5"/><path d="M260,78 L252,74.8 L252,81.2 Z" fill="var(--gray)"/>
  <circle cx="230" cy="58" r="10" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.5"/><line x1="223" y1="51" x2="237" y2="65" stroke="var(--red)" stroke-width="2.2" stroke-linecap="round"/><line x1="237" y1="51" x2="223" y2="65" stroke="var(--red)" stroke-width="2.2" stroke-linecap="round"/>
  <text x="105" y="130" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">不执行，只返回生成器</text>
  <path d="M40,170 Q90.4,170.2 140,169.8 Q149.7,169.7 150.2,180 Q149.3,190.4 150.1,200 Q150.3,210.3 140,209.5 Q89.7,210.7 40,210.8 Q30.1,210.3 29.1,200 Q29.7,190 31,180 Q29.6,169.8 40,170 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="90" y="190" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">next ①</text>
  <path d="M150,190 Q250,150 300,110" fill="none" stroke="var(--blue)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M300,110 L290.7,112.8 L295.2,118.4 Z" fill="var(--blue)"/>
  <text x="248" y="148" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--blue)">交出 1，停住</text>
  <path d="M40,230.6 Q90.5,230.9 140,230.6 Q149.8,230.2 149,240 Q149.3,249.6 150.3,260 Q149.6,270.3 140,269.2 Q90.5,269.5 40,270.3 Q29.8,270.1 30,260 Q31,249.7 31,240 Q30,229.9 40,230.6 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="90" y="250" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">next ②</text>
  <path d="M150,250 Q240,210 300,190" fill="none" stroke="var(--blue)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M300,190 L290.3,189.4 L292.6,196.3 Z" fill="var(--blue)"/>
  <text x="200" y="230" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--blue)">从上次停下处</text>
  <text x="200" y="248" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--blue)">进到 yield 2</text>
  <path d="M40,300.8 Q90.6,299.6 140,300.4 Q149.9,300.1 149.5,310 Q150.2,319.8 150,330 Q149.7,339.8 140,340 Q90.6,341 40,340.3 Q29.8,339.6 30.3,330 Q30.9,320 29.6,310 Q29.6,300 40,300.8 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="90" y="320" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">next ③</text>
  <path d="M150,320 Q240,300 300,270" fill="none" stroke="var(--purple)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M300,270 L290.3,270.8 L293.6,277.2 Z" fill="var(--purple)"/>
  <text x="200" y="336" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--purple)">跑到第五行，结束</text>
</svg>
</figure>
每 `next()` 一次，函数才往下跑，跑到下一个 `yield` 就停下来、把 `yield` 后面的值交出去。这就是「惰性求值」——不催就不算，催一次算一点。

## 8. 实战：分批读超大文件

生成器最经典的用途，就是分批读文件。第 1 篇的 `readlines()` 会把整个文件装进内存，改成生成器，一次只读一批：

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

## 9. 本专栏到这里

四篇走完：文件能备份，数据有了 CSV 和 JSON，赋值和拷贝不再串台，正则和生成器能对付乱文本和超大文件。

想给函数装外挂，去看 [Python 函数进阶专栏](/categories/python函数进阶/)。想让程序上网或同时干活，去看 [Python 网络与并发专栏](/categories/python网络与并发/)。

**想接着看人工智能：**

- [大模型概念网络](/post/ai-llm-concept-network/)——先搞清楚那些名词都是什么；
- [Transformer 与注意力机制](/post/transformer-attention-basics/)——模型内部怎么运作；
- [Ollama 本地部署](/post/ollama-local-llm-deploy/)——在自己电脑上跑一个大模型；
- [大模型 API 调用](/post/llm-api-apifox-deepseek/)——用 Python 调 DeepSeek；
- [提示词工程](/post/prompt-engineering-workflow/)——怎么把话说清楚；
- [Streamlit 聊天应用](/post/streamlit-ai-chat/)——做出能给别人用的界面；
- [Agent 开发](/post/ai-agent-tool-memory-rag/)——工具、记忆、RAG。
