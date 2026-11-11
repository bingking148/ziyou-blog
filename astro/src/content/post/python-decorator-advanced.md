---
title: 'Python 第 15 篇：多装饰器与带参数的装饰器'
weight: 15
cover: /images/covers/python-decorator-advanced-cover.jpg
date: 2026-11-02T13:00:00+08:00
updatedDate: 2026-11-04T09:00:00+08:00
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

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-wrap-vs-call-order" viewBox="0 0 680 420" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>装饰器从下往上包裹，执行时从上往下：先检查登录，再校验验证码，再发表评论</title>
  <style>
    .diag-wrap-vs-call-order { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-wrap-vs-call-order { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M176,50.7 Q339.5,50.2 504,49.7 Q519.9,50.3 519.6,66 Q520.3,209.5 520.2,354 Q519.7,370.1 504,370.7 Q339.7,370.3 176,370 Q160.2,369.6 160.8,354 Q159.5,210.2 160,66 Q160.2,50.1 176,50.7 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="340" y="76" font-size="18" text-anchor="middle" dominant-baseline="central" fill="var(--blue)" font-weight="bold">check_login</text>
  <text x="340" y="98" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--blue)">检查用户名和密码登录信息</text>
  <path d="M224,116 Q340.2,115.7 456,115.7 Q469.9,115.7 470.1,130 Q470.7,215.5 470.4,302 Q470.2,316 456,316.6 Q339.9,316.5 224,315.2 Q210.3,316 209.2,302 Q209.7,215.9 210.8,130 Q210.3,116.2 224,116 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="340" y="140" font-size="18" text-anchor="middle" dominant-baseline="central" fill="var(--amber)" font-weight="bold">check_code</text>
  <text x="340" y="162" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">校验验证码</text>
  <path d="M260,216 Q340.2,215 420,214.7 Q430.2,215 429.7,225 Q429.5,250.1 430.4,275 Q430.4,285.1 420,285.9 Q340.4,284.3 260,286 Q250,285.2 250.6,275 Q249.4,249.5 249,225 Q250.2,214.7 260,216 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="340" y="238.8" font-size="17" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">comment</text><text x="340" y="261.2" font-size="17" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">发表评论</text>
  <text x="80" y="50" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--teal)" font-weight="bold">包裹：从下往上</text>
  <line x1="40" y1="330" x2="40" y2="90" stroke="var(--teal)" stroke-width="2" stroke-linecap="round"/><path d="M40,80 L36,90 L44,90 Z" fill="var(--teal)"/>
  <text x="88" y="200" font-size="14" text-anchor="start" dominant-baseline="central" fill="var(--teal)">先 check_code</text>
  <text x="88" y="222" font-size="14" text-anchor="start" dominant-baseline="central" fill="var(--teal)">再 check_login</text>
  <text x="600" y="80" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--red)" font-weight="bold">执行：从上往下</text>
  <line x1="600" y1="70" x2="600" y2="330" stroke="var(--red)" stroke-width="2" stroke-linecap="round"/><path d="M600,340 L604,330 L596,330 Z" fill="var(--red)"/>
  <text x="600" y="150" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--red)">① 检查登录</text>
  <text x="600" y="210" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--red)">② 校验验证码</text>
  <text x="600" y="280" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--red)">③ 发表评论</text>
</svg>
</figure>


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

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-three-layer-param" viewBox="0 0 680 440" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>带参数装饰器有三层：外层记住参数并必须返回中层装饰器，中层再包住原函数</title>
  <style>
    .diag-three-layer-param { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-three-layer-param { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M156,30.6 Q340.1,29.5 524,30.9 Q540,29.8 540.5,46 Q540.6,209.8 539.7,374 Q539.7,389.7 524,390.1 Q339.4,389.6 156,390.6 Q140.3,389.9 139.8,374 Q140.9,209.5 139.6,46 Q140.3,29.9 156,30.6 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" opacity="0.35"/>
  <text x="340" y="54" font-size="17" text-anchor="middle" dominant-baseline="central" fill="var(--blue)" font-weight="bold">外层收装饰器参数</text>
  <text x="340" y="76" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--blue)">flag = &#x27;+&#x27;    在 @ 时跑一次</text>
  <path d="M204,100.3 Q339.7,100.6 476,100.3 Q490,100.4 489.7,114 Q490.5,209.8 489.7,306 Q489.9,319.9 476,320.9 Q339.8,319 204,319.9 Q189.7,319.6 190.5,306 Q189.9,210.2 189.4,114 Q189.7,100.1 204,100.3 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="340" y="128" font-size="17" text-anchor="middle" dominant-baseline="central" fill="var(--amber)" font-weight="bold">中层 decorator 收函数</text>
  <path d="M242,160 Q339.8,160.6 438,159.3 Q450.2,159.8 450.4,172 Q450.8,225.5 449.3,278 Q450.3,290.1 438,289 Q339.8,289.1 242,290.3 Q230.1,289.6 229.6,278 Q229.2,224.8 230.3,172 Q229.7,160.1 242,160 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="340" y="199.4" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">内层 inner</text><text x="340" y="220.6" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">包装并调用原函数</text>
  <path d="M270,240.3 Q339.6,240.6 410,240.7 Q420.1,240.9 420.8,251 Q420.6,255.3 419,259 Q420.2,269.1 410,268 Q340.1,269.8 270,268 Q260,269.3 259.8,259 Q260.7,255.6 260.5,251 Q259.9,241.1 270,240.3 Z" fill="none" stroke="var(--green)" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/><text x="340" y="255" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">plus_operator</text>
  <path d="M20,49.9 Q70.4,50.5 120,50.1 Q130,49.7 129.4,60 Q130.5,78.2 129.3,96 Q130.3,105.9 120,106.2 Q70.1,105.6 20,107 Q9.6,106.2 9.6,96 Q10.6,77.9 9,60 Q10.2,49.7 20,49.9 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="70" y="68.8" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">logging(&#x27;+&#x27;)</text><text x="70" y="87.2" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">只跑外层</text>
  <line x1="130" y1="78" x2="132" y2="78" stroke="var(--blue)" stroke-width="1.7" stroke-linecap="round"/><path d="M140,78 L132,74.8 L132,81.2 Z" fill="var(--blue)"/>
  <path d="M140,200 Q80,200 80,130" fill="none" stroke="var(--blue)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="6 5"/><path d="M80,130 L77.2,137 L82.8,137 Z" fill="var(--blue)"/>
  <text x="70" y="170" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--blue)">返回中层</text>
  <path d="M20,247.3 Q69.7,248.4 120,248.7 Q130.3,247.8 129.6,258 Q130.3,284.4 130.6,312 Q129.6,321.8 120,323 Q69.9,322.1 20,322.7 Q9.8,322.2 10.5,312 Q10.7,285.6 10.5,258 Q10.2,248.4 20,247.3 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="70" y="266.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">decorator</text><text x="70" y="285" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">(plus_operator)</text><text x="70" y="303.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">才包住函数</text>
  <line x1="130" y1="280" x2="185.2" y2="206.4" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round"/><path d="M190,200 L182.6,204.5 L187.8,208.3 Z" fill="var(--amber)"/>
  <path d="M570,50.5 Q611.9,49.8 654,50 Q664.1,50.2 663.5,60 Q664.1,85.3 663.4,110 Q664.3,120.2 654,120.6 Q612.6,119.2 570,119.8 Q559.6,120.1 561,110 Q560.7,84.5 560.6,60 Q559.7,50.3 570,50.5 Z" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="612" y="66.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">没有</text><text x="612" y="85" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">return</text><text x="612" y="103.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">decorator</text>
  <line x1="560" y1="120" x2="560" y2="191" stroke="var(--red)" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="6 5"/><path d="M560,200 L563.6,191 L556.4,191 Z" fill="var(--red)"/>
  <path d="M540,200 Q595.6,200 650,200.2 Q659.7,199.8 659.5,210 Q660.9,225.2 659.7,240 Q660.3,249.9 650,250.8 Q595.3,250.9 540,249.7 Q529.8,250.1 529.2,240 Q530.9,225.6 530.7,210 Q529.9,199.9 540,200 Z" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="595" y="225" font-size="20" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">None</text>
  <circle cx="560" cy="270" r="14" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.5"/><line x1="550.2" y1="260.2" x2="569.8" y2="279.8" stroke="var(--red)" stroke-width="2.2" stroke-linecap="round"/><line x1="569.8" y1="260.2" x2="550.2" y2="279.8" stroke="var(--red)" stroke-width="2.2" stroke-linecap="round"/>
</svg>
</figure>


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

## 8. 本篇小结

装饰器最后两课补齐了：多装饰器叠用时从下往上包裹、从上往下执行；带参数装饰器三层嵌套，外层闭包记住参数、返回真正的装饰器。加上「用闭包封模型调用器」这个实战，装饰器到这里算毕业了。

但前面所有程序都还在一台电脑里自说自话。下一篇把程序连上网，让它能跟别的程序隔着网络收发数据——[第 16 篇：网络编程](/post/python-socket-network/)。
