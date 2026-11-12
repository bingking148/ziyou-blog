---
title: '函数进阶 第 1 篇：闭包与装饰器，给函数装上外挂'
weight: 1
cover: /images/covers/python-closures-decorators-cover.jpg
date: 2026-11-01T15:00:00+08:00
updatedDate: 2026-11-12T20:30:00+08:00
categories: ['人工智能', 'Python', 'Python函数进阶']
tags: ['Python', '编程基础', '闭包', '装饰器']
description: '函数调用完，变量就没了？闭包能把变量「关」进函数里带走；装饰器更进一步——不改一行原代码，给函数加上登录检查、日志、计时。从嵌套函数一路写到 @ 装饰器。'
math: false
mermaid: false
comments: true
toc: true
---

[《Python 基础》第 6 篇](/post/python-functions-in-depth/)讲函数时留下两个别扭的地方，一直没解决：

1. 函数调用完，里面的变量就销毁了。有时你就是想让一个变量跟着函数一起活下去——比如一个只属于某个函数的计数器、一组模型参数。return 只能把值交出去，变量本身留不住；
2. 同一个功能想加给一堆函数。十个函数都要加「先检查登录」、都要打印日志，难道把同样的代码复制十遍？以后改一处就得改十处。

这两个问题的答案是同一个东西：闭包，以及它在真实项目里的化身——装饰器。

## 1. 函数的「失忆症」

先看清问题。函数里的局部变量，寿命和函数调用一样长。

```python
def outer():
    x = 10
    print(f'x = {x}')

outer()          # x = 10
print(f'x = {x}')   # NameError: name 'x' is not defined
```

`outer()` 一结束，函数内部的所有变量就销毁了，外面想拿也拿不到。[《Python 基础》第 6 篇](/post/python-functions-in-depth/)讲过，这是局部变量的本分——隔离，防污染。

想留住变量，[《Python 基础》第 6 篇](/post/python-functions-in-depth/)给的方案是 return：

```python
def func():
    number = 10
    return number

num = func()     # 把值交出去
print(num)       # 10
print(num + 1)   # 11
```

但交出去的只是值，`func` 里的 `number` 本体照样销毁。`num` 和 `number` 是两个变量，改 `num` 影响不到函数内部。

有没有办法让变量本体跟着函数一起活下来？先看一个前置知识。

## 2. 嵌套函数

Python 里函数定义可以嵌套——函数里面再定义一个函数。

```python
def outer():
    x = 10

    def inner():                    # 内部函数
        print(f'我看到了 x = {x}')   # 内部函数能读到外部函数的变量

    inner()

outer()   # 我看到了 x = 10
```

`inner` 能直接读 `outer` 的变量 `x`，这跟「函数能读全局变量」是同一个查找规则：自己没有，就往外一层找。

重点在下一步：函数也是对象（[《Python 基础》第 7 篇](/post/python-lambda-modules/)说过，函数能当参数传），所以函数也能当返回值。把 `inner` 返回出去，会怎样？

## 3. 闭包

```python
def fn_outer(number1: int):
    # 外部函数的参数

    def fn_inner(number2: int):
        # 内部函数使用了外部函数的变量 number1
        sum_result = number1 + number2
        print(f'求和结果：{sum_result}')

    return fn_inner     # 返回内部函数，不带括号，返回的是函数本身
```

```python
f1 = fn_outer(10)
print(f'外部函数返回值类型：{type(f1)}')   # <class 'function'>
print(f1)                                # <function fn_outer.<locals>.fn_inner at 0x...>

f1(1)      # 求和结果：11
f1(10)     # 求和结果：20
f1(100)    # 求和结果：110
```

盯着这段代码看三件事：

1. `fn_outer(10)` 执行完，返回的是 `fn_inner` 这个函数——`type` 显示 `function`；
2. `f1(1)` 调用的是内部函数，可它算出 `10 + 1`——外部函数早就执行完了，`number1 = 10` 居然还活着，被内部函数记住了；
3. 再造一个：`f2 = fn_outer(50)`，那 `f2` 记住的是 50，和 `f1` 的 10 互不干扰。每次调用外部函数，都开一个独立的记忆空间。

这就是闭包（Closure）。闭包 = 函数 + 被它记住的变量。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-closure-two-memories" viewBox="0 0 680 360" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>外部函数返回之后，f1 和 f2 各自记住一块互不干扰的变量</title>
  <style>
    .diag-closure-two-memories { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-closure-two-memories { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <line x1="40" y1="36" x2="632" y2="36" stroke="var(--gray)" stroke-width="1.5" stroke-linecap="round"/><path d="M640,36 L632,32.8 L632,39.2 Z" fill="var(--gray)"/>
  <text x="40" y="22" font-size="14" text-anchor="start" dominant-baseline="central" fill="var(--gray)">时间</text>
  <path d="M48,69.4 Q115.1,70 182,70.9 Q190,70.1 190.4,78 Q189.5,97.9 190.2,118 Q190.1,125.9 182,125.5 Q114.5,127 48,127 Q40.3,126.3 39.4,118 Q40.6,97.7 40.6,78 Q39.9,70.1 48,69.4 Z" fill="var(--fill-gray)" stroke="var(--gray)" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="7 5" opacity="0.85"/>
  <text x="115" y="90" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">fn_outer(10)</text>
  <text x="115" y="110" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">执行完后消失</text>
  <line x1="190" y1="98" x2="223" y2="98" stroke="var(--gray)" stroke-width="1.4" stroke-linecap="round"/><path d="M230,98 L223,95.2 L223,100.8 Z" fill="var(--gray)"/>
  <path d="M368,69.9 Q434.6,69 502,71 Q510.2,69.9 510.7,78 Q510.6,98.3 510.2,118 Q510.4,126.2 502,125.5 Q434.7,125.3 368,125.9 Q360,126.2 359.5,118 Q359.1,97.7 359.2,78 Q359.7,70.1 368,69.9 Z" fill="var(--fill-gray)" stroke="var(--gray)" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="7 5" opacity="0.85"/>
  <text x="435" y="90" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">fn_outer(50)</text>
  <text x="435" y="110" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">执行完后消失</text>
  <line x1="510" y1="98" x2="543" y2="98" stroke="var(--gray)" stroke-width="1.4" stroke-linecap="round"/><path d="M550,98 L543,95.2 L543,100.8 Z" fill="var(--gray)"/>
  <path d="M240,149.6 Q280,149.7 320,150.1 Q330,150.2 329.7,160 Q329,175.1 329.4,190 Q330.4,199.9 320,200.9 Q279.6,199.6 240,200.6 Q229.7,200.3 230.1,190 Q231,175.3 229.4,160 Q230.4,149.8 240,149.6 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="280" y="175" font-size="20" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">f1</text>
  <path d="M240,230.5 Q300.6,230.8 360,230.7 Q370.3,230 369.8,240 Q370.6,258.3 370.2,276 Q369.9,286.1 360,285.2 Q300.3,285 240,285.9 Q230.1,285.9 230,276 Q230.2,258.2 229.5,240 Q229.7,230.2 240,230.5 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="300" y="258" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">number1 = 10</text>
  <line x1="280" y1="200" x2="280" y2="230" stroke="var(--purple)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="360" y="258" font-size="14" text-anchor="start" dominant-baseline="central" fill="var(--purple)">记忆</text>
  <path d="M560,150.3 Q600.1,150 640,150.4 Q649.9,150 649.6,160 Q650.5,175.5 650.8,190 Q649.6,199.9 640,200.8 Q599.5,200.5 560,200.3 Q550,199.7 550.2,190 Q550.9,175.6 549.9,160 Q549.7,149.7 560,150.3 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="600" y="175" font-size="20" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">f2</text>
  <path d="M540,230.6 Q599.8,230 660,230 Q669.8,230.1 669.6,240 Q671,257.7 670.4,276 Q670,285.8 660,286.3 Q599.4,286.9 540,286.6 Q529.9,286.1 529.8,276 Q530.7,258 529.4,240 Q530,229.7 540,230.6 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="600" y="258" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">number1 = 50</text>
  <line x1="600" y1="200" x2="600" y2="230" stroke="var(--teal)" stroke-width="1.7" stroke-linecap="round"/>
  <text x="520" y="258" font-size="14" text-anchor="end" dominant-baseline="central" fill="var(--teal)">记忆</text>
  <path d="M50,151 Q90.2,149.9 130,150.1 Q139.7,150.3 139.4,160 Q140.2,174.4 139.8,190 Q140.1,199.7 130,201 Q90.4,200.1 50,199.1 Q40.1,200.1 39,190 Q39.6,174.6 40.1,160 Q40,150.1 50,151 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="90" y="175" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor">f1(1)</text>
  <line x1="140" y1="175" x2="221" y2="175" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round"/><path d="M230,175 L221,171.4 L221,178.6 Z" fill="var(--amber)"/>
  <path d="M90,229.4 Q129.8,229.2 170,229.9 Q179.7,230 180.1,240 Q180.3,255.1 179,270 Q180.1,280.3 170,279 Q130,280.6 90,280.1 Q80.3,280 80.7,270 Q79,255.3 79.9,240 Q80.4,229.8 90,229.4 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="130" y="255" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">10 + 1</text>
  <path d="M280,230 Q200,220 180,255" fill="none" stroke="var(--amber)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M180,255 L185.9,250.3 L181,247.5 Z" fill="var(--amber)"/>
  <text x="340" y="330" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">记住的是变量本身，不是复制一份冻结的数</text>
</svg>
</figure>


判断一个函数是不是闭包，看三条，缺一不可：

1. 有嵌套——外部函数里嵌套定义了内部函数；
2. 有引用——内部函数用到了外部函数的变量（含参数）；
3. 有返回——外部函数返回了内部函数。

少第三条（不返回），内部函数出不了外部函数的门；少第二条（不引用外部变量），返回的只是普通嵌套函数，没有「记忆」。

写法上还有个顺手的变体——链式调用，`fn_outer(100)(100)` 直接在返回的函数上再传参，两步并作一步，结果是 200。读别人代码时见到连着两个括号的，就是在调闭包。

## 4. nonlocal：在闭包里改外部变量

闭包里的内部函数默认只能读外部变量，想改，得声明一下。

```python
def fn_outer():
    a = 100

    def fn_inner():
        nonlocal a       # 声明：这里的 a 是外部函数的那个 a
        a = a + 1
        print(f'a = {a}')

    return fn_inner

f1 = fn_outer()
f1()    # a = 101
f1()    # a = 102
f1()    # a = 103
```

`nonlocal` 和[《Python 基础》第 6 篇](/post/python-functions-in-depth/)的 `global` 是一对：`global` 声明的是全局变量，`nonlocal` 声明的是外部函数的变量。

不加 `nonlocal` 直接 `a = a + 1` 会怎样？Python 会认为你在内部函数里新建了一个局部变量 `a`，但赋值右边又要先读它——自己读自己还没建好的变量，直接 `UnboundLocalError`。跟[《Python 基础》第 6 篇](/post/python-functions-in-depth/) `global` 那处是同一个毛病。

`f1()` 每调一次加一，101、102、103——被闭包记住的 `a` 是活的，会一直变化。这就是闭包版计数器：状态藏在函数里，全局命名空间干干净净。还记得[《Python 基础》第 6 篇](/post/python-functions-in-depth/)说 `global` 能不用就不用吗？闭包就是更体面的替代品之一。

## 5. 闭包实战：线性回归的雏形

来一个 AI 味的案例。机器学习最先接触的算法是线性回归：`y = k * x + b`。训练过程就是不断调整 `k` 和 `b`；每调整一轮，都要用固定的 k、b 去算一遍所有样本的 y。

```python
def linear(k: float, b: float):
    # 外部函数接收 k、b——相当于模型的参数

    def inner(x: float) -> float:
        # 内部函数使用外部的 k 和 b
        return k * x + b

    return inner


x_list = [100, 121, 124, 135, 150, 97]

f1 = linear(k=10, b=20)
y1_list = [f1(x_item) for x_item in x_list]
print(y1_list)    # [1020, 1230, 1260, 1370, 1520, 990]

f2 = linear(k=8.5, b=11.3)
y2_list = [f2(x_item) for x_item in x_list]
print(y2_list)
```

`linear(k=10, b=20)` 造出了一个「专用模型」`f1`——它记住了自己的 k 和 b，之后反复调用只管代入 x。`f2` 是另一组参数下的另一个模型，两个模型各记各的参数。

闭包记住的变量，本质上就是模型的参数。以后你调 `model.eval()` 时传入的权重，概念上就是被某个函数记住的 `k` 和 `b`，只是规模大了几亿倍。

## 6. 装饰器：闭包的杀手级应用

闭包会写了，看它在真实项目里的头号用法。

需求：电商程序里，下单、支付、发表评论——每个操作前都得先检查登录。原始写法是把检查逻辑复制进每个函数：

```python
def comment():
    print('检查登录.....登录成功.......')    # 复制粘贴第一遍
    print('发表评论..................')

def payment():
    print('检查登录.....登录成功.......')    # 复制粘贴第二遍
    print('支付商品...................')
```

检查逻辑和业务逻辑搅在一起，十几个函数就要复制十几遍。

换个思路：写一个接收函数、返回增强版函数的闭包。

```python
# 装饰器：给原函数加上登录检查，不改动原函数一行代码
def check_login(fn):          # 外部函数：参数是被装饰的函数
    def fn_inner():           # 内部函数
        print('检查登录.....登录成功.......')   # 额外功能
        fn()                  # 调用原函数

    return fn_inner


def comment():
    print('发表评论..................')

def payment():
    print('支付商品...................')

# 传统写法：手动装饰
f1 = check_login(comment)
f1()    # 检查登录...登录成功...  发表评论...
```

`check_login(comment)` 返回了一个「先检查登录、再评论」的新函数。原函数 `comment` 一行没动，检查逻辑只写了一遍，谁要就给谁套上。这就是装饰器：本质上依然是闭包，只是外部函数的参数从数字换成了函数。

Python 还给了个语法糖。手动装饰再赋值太啰嗦，允许直接在函数定义上方写 `@装饰器名`：

```python
@check_login
def order():
    print('正在下单...................')

order()   # 检查登录...登录成功...  正在下单...
```

`@check_login` 完全等价于 `order = check_login(order)`。实际项目一律用 `@`，理解原理时想想手动版就够了。

## 7. 有参有返回的装饰器

第 6 节的装饰器只能装饰「无参无返回」的函数。可真实的函数千姿百态——比如一整个计算器模块。

```python
from typing import Callable

def operator_decorator(func: Callable[[float, float], float]) -> Callable[[float, float], float]:
    # 外部函数：参数是函数，返回值也是函数

    def fn_inner(x: float, y: float) -> float:
        print('正在努力计算中................')   # 额外功能
        return func(x, y)                        # 调用原函数，返回它的结果

    return fn_inner


@operator_decorator
def plus_operator(num1: float, num2: float) -> float:
    return num1 + num2

@operator_decorator
def minus_operator(num1: float, num2: float) -> float:
    return num1 - num2


print(plus_operator(10, 20))    # 正在努力计算中...  30
print(minus_operator(10, 20))   # 正在努力计算中...  -10
```

和第 6 节比，只改了两处，但都是关键：

1. `fn_inner(x, y)` 收下参数——装饰后的函数被调用时，参数先到内部函数手里，内部函数转手 `func(x, y)` 传给原函数。原函数要什么参数，内部函数就收什么、传什么；
2. `return func(x, y)` 把结果带回去——原函数的返回值经内部函数原样返回。少写这个 `return`，所有被装饰的函数永远返回 `None`。

装饰器的完整心智模型：内部函数是原函数的「代理人」——参数由它转交，结果由它转达，额外功能插在中间。

那行 `Callable[[float, float], float]` 也解释一下：`Callable` 表示「可调用对象（函数）」，方括号里是 `[参数类型列表, 返回值类型]`。[《Python 基础》第 6 篇](/post/python-functions-in-depth/)你只注解过普通参数，这里第一次注解函数参数。

五个函数加、减、除、取余全挂同一个装饰器——日志、计时、权限检查、重试这些横切功能，以后全用这一招加。

## 8. 几个容易写错的地方

1. 忘了 `return fn_inner`——外部函数返回 `None`，一调用就 `'NoneType' object is not callable`。三条判断里的「有返回」，忘得最多；
2. 返回时带了括号——`return fn_inner()` 是「调用并返回结果」，`return fn_inner` 才是「返回函数本身」；
3. 以为闭包复制了变量——闭包记住的是变量本身。`nonlocal` 改一次，所有引用它的地方都变了；多个内部函数共享同一份外部变量，不是各存一份；
4. 只读不改却加了 `nonlocal`——只在内部函数里读外部变量，不需要 `nonlocal`；要赋值才需要；
5. 装饰后函数名变了——`order.__name__` 已经是 `fn_inner`。本阶段知道即可，真实项目用 `@functools.wraps(func)` 保住原函数的名字和文档；
6. 以为装饰器每次调用都执行——`@` 那一行在函数定义时执行一次（包一层），之后每次调用执行的只是内部函数。别在装饰器本体里写「每次调用都要做的事」，那些代码属于内部函数。

## 9. 课后小项目

**练习一：计数器闭包（必做）**

写 `make_counter()`：每次调用返回的函数，调用一次打印的数就加一（1、2、3……）。要求两个计数器互不干扰。

**练习二：计时装饰器**

写 `@timer`：装饰任意函数，调用时打印「函数名 耗时 x.xx 秒」。掐表用 `from time import time`，调用前后各取一次相减。拿它去量[《Python 文件与数据》第 1 篇](/post/python-file-operations/)练习四的语料统计器跑多久。

**练习三：重试装饰器**

写 `@retry`：装饰一个「调 API」函数（用 `random.randint(1, 3)` 模拟返回结果，1 当成功），调用失败自动重试，最多 3 次，每次打印第几次尝试。内部函数里写 `for` 循环加 `try/except`。

**练习四：给日记本装上外挂**

[《Python 文件与数据》第 1 篇](/post/python-file-operations/)练习一的日记本，这次升级：写一个 `@log_action` 装饰器，每次执行写日记函数前，往 `app.log` 文件里追加一行「时间 + 执行了什么」。文件操作、装饰器和闭包碰到一起。

## 10. 小结

闭包就是「函数 + 它记住的变量」，判定看三样：有嵌套、有引用、有返回。装饰器是闭包换个参数的写法——外部函数接收的不再是数字，而是函数，用来给函数加功能而不改它本身。

装饰器的基本用法你会了。下一篇把一层装饰器叠成多层，并让装饰器自己带上参数——[函数进阶 第 2 篇：多装饰器与带参数的装饰器](/post/python-decorator-advanced/)。
