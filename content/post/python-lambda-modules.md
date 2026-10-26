---
title: 'Python 匿名函数与模块：lambda、高阶函数和代码组织'
weight: 8
date: 2026-10-26T10:00:00+08:00
lastmod: 2026-10-26T10:00:00+08:00
cover: /images/covers/python-lambda-modules-cover.jpg
categories: ['人工智能', '人工智能学习']
tags: ['Python', '编程基础', 'lambda', '模块']
description: '从函数进阶到代码组织：高阶函数、lambda 匿名函数、变量类型注解，以及模块与包的导入方式（import、from、as、__all__、__name__），并结合排序、随机点名和自定义工具库练习。'
math: false
mermaid: false
comments: true
toc: true
---

[Python 函数详解](/post/python-functions-in-depth/) 把函数的参数、作用域和递归讲完了。这一篇继续往前走两步：一是**函数本身还能怎么玩**——函数可以作为参数传给另一个函数（高阶函数），可以用 `lambda` 一句话定义（匿名函数）；二是**代码多了怎么组织**——一个 `.py` 文件就是一个模块，一个带 `__init__.py` 的目录就是一个包，`import` 的几种姿势各有适用场景。

这两块内容在 AI 应用里出现频率极高：`messages.sort(key=lambda m: m["role"])` 这类写法到处都是，而任何一个像样的大模型项目都是十几个模块组织起来的。学完这一篇，你就能读懂项目仓库里那些 `from xxx import yyy` 了。

## 1. 高阶函数：函数也能当参数传

先回忆一个事实：[数据容器](/post/python-data-containers/) 里列表能存数字、字符串、字典——容器里可以装任何对象。而**函数本身也是对象**，所以函数也能存进变量、也能作为参数传给另一个函数。

看一个计算器的例子。先定义四个普通运算函数：

```python
def add(x: int, y: int) -> int:
    return x + y


def subtract(x: int, y: int) -> int:
    return x - y


def multiply(x: int, y: int) -> int:
    return x * y


def divide(x: int, y: int) -> float:
    return x / y
```

再定义一个「调度」函数，第三个参数接收的不是数字，而是**上面某个函数**：

```python
from typing import Callable


def calculate(x: int, y: int, operator: Callable[[int, int], int | float]):
    """
    对两个整数进行数学运算（加、减、乘、除）
    :param x: 第一个数字
    :param y: 第二个数字
    :param operator: 数学运算函数
    :return: 数学运算结果
    """
    print(f"operator 类型：{type(operator)}")
    return operator(x, y)


print(calculate(99, 1, add))     # 100
print(calculate(99, 1, subtract))  # 98
```

把函数名 `add`（不带括号！）传进去，`calculate` 内部再调用它。这种「接收函数作为参数」或「返回函数」的函数，叫**高阶函数（higher-order function）**。

类型标注上，`Callable` 来自标准库 `typing`，`Callable[[int, int], int | float]` 读作：接收两个 int 参数、返回 int 或 float 的可调用对象。

## 2. lambda：一句话的匿名函数

### 2.1 从对比开始

先用 `def` 写一个最简单的函数：

```python
def plus_number(x: int, y: int) -> int:
    return x + y
```

这个函数小到只有一句话。Python 为这种场景提供了更轻的写法——**匿名函数 `lambda`**：

```python
add_operator = lambda x, y: x + y

print(add_operator(99, 1))    # 100
```

语法是 `lambda 参数1, 参数2, ...: 表达式`。注意三点：

- 没有 `def`，没有函数名，所以叫**匿名**函数；
- 冒号后只能跟**一个表达式**，表达式的值就是返回值，不能写 `return`，也不能写多行逻辑；
- 通常赋给一个变量（或者直接作为参数传出去），用变量调用时和普通函数没有区别。

再比如打印分隔线：

```python
print_line = lambda: print("=" * 40)
print_line()
```

### 2.2 lambda 的主战场：作为参数传递

lambda 单独用没什么优势，它的价值在于**临时定义、当场传参**。把第 1 节的高阶函数和 lambda 结合：

```python
shang = calculate(245, 32, lambda num1, num2: num1 / num2)
print(f"两数相除：{shang}")

mode = calculate(1985, 400, lambda n1, n2: n1 % n2)
print(f"两数取余：{mode}")
```

不需要先 `def` 一个只用一次的函数，lambda 在调用现场直接表达「我要做什么运算」。判断标准很简单：**逻辑一行能写完且只用一次，用 lambda；要复用、要多行，用 def**。

### 2.3 内置函数里的 key 参数

lambda 最常见的出场地点，是内置函数 `sort()` / `max()` / `min()` 的 `key` 参数——「按什么规则排序/比较」本身就是一个函数。

按字符串长度给语言列表排序：

```python
str_list = ["C++", "C", "C#", "Java", "Python", "Ruby", "PHP", "Go"]
str_list.sort(key=lambda s: len(s))
print(str_list)
# ['C', 'C#', 'Go', 'C++', 'Java', 'Ruby', 'PHP', 'Python']
```

`key=lambda s: len(s)` 的意思是：排序时别按字典序，先把每个元素送进这个函数，按返回值（长度）排。

从「(姓名, 总分)」元组列表里找最高分和最低分：

```python
score_list = [
    ("张三", 598), ("李四", 218), ("王五", 688),
    ("田七", 489), ("赵六", 589), ("清北", 724),
]

max_score = max(score_list, key=lambda t: t[1])
min_score = min(score_list, key=lambda score: score[1])
print(f"最高：{max_score}")   # ('清北', 724)
print(f"最低：{min_score}")   # ('李四', 218)
```

不加 `key` 时 `max` 比较的是元组本身（先比姓名字符串），加了 `key=lambda t: t[1]` 才是比较分数。处理 API 返回的消息列表、模型列表时，这个写法几乎天天见。

## 3. 变量类型注解

[函数详解](/post/python-functions-in-depth/) 里给函数参数和返回值加过类型标注。Python 3.6+ 其实也支持给**变量**直接标注：

```python
from typing import Any

a: int = 695
score: float = 98.5
hobby: str = "Python"
flag: bool = False
pic: int | None = None        # 可以为 int，也可以为 None

names: list[str] = ["A", "B", "C"]
phones: set[str] = {"18623450988", "15689073214"}
options: dict[str, Any] = {"count": 0, "total": 99.9, "isComplete": True}
goods: tuple[str, float, int] = ("手机", 5999.99, 1)
```

容器类型的标注格式是 `list[str]`、`dict[str, Any]`——元素类型写在方括号里，`Any` 表示任意类型。老规矩：**标注不强制**，传错了 Python 不会拦，但编辑器的智能提示和静态检查全靠它。看大模型 SDK 的源码时，满眼都是这种写法，读懂标注就读懂了数据结构的形状。

## 4. 模块：一个 py 文件就是一个模块

### 4.1 为什么需要模块

到目前为止，所有代码都写在一个文件里。代码一多，问题就来了：几千行挤在一个文件里没法维护；两个人没法同时改；常用工具（比如算圆面积的函数）每个项目都要复制一遍。

Python 的答案朴素而有效：**一个 `.py` 文件就是一个模块（module）**，文件里可以定义变量、函数、类。想用别的文件里的东西，`import` 进来就行。

比如把圆周率和两个函数存进 `circle_utils.py`：

```python
# circle_utils.py
PI = 3.141592653589793


def circle_area(radius: float) -> float:
    return PI * radius ** 2


def circle_length(radius: float) -> float:
    return PI * radius * 2
```

在另一个文件里导入使用：

```python
# main.py
import circle_utils

r = float(input("请输入圆形的半径："))
area = circle_utils.circle_area(r)
length = circle_utils.circle_length(r)
print(f"半径 {r}，面积 {area:.2f}，周长 {length:.2f}")
print(f"用到的常量：{circle_utils.PI}")
```

`import circle_utils` 之后，用 `模块名.变量` / `模块名.函数()` 访问里面的内容。这就是「模块使用 Python 程序的基本组织单位」的含义——你调用的 `random`、`math`、`json`，本质都是别人写好的 py 文件。

### 4.2 import 的四种姿势（以系统模块 random 为例）

```python
# 姿势一：导入整个模块，用 模块名.功能 访问（最稳妥，推荐）
import random
print(random.choice(["张三", "李四", "王五"]))   # 随机点名

# 姿势二：模块名太长，用 as 起别名
import random as rdm
print(rdm.randint(10, 100))

# 姿势三：只导入模块里的某个功能，用的时候不用加模块名前缀
from random import randint
print(randint(1, 10))

# 姿势三变体：导入的功能也起别名
from random import randint as rdi
print(rdi(1000, 1050))
```

还有一种「导入全部」的写法 `from random import *`，用起来确实省事（所有功能直接可用），但**不推荐**：一旦导入多个模块，你分不清某个名字来自哪里，还容易发生同名覆盖。写清楚来源的代码才好维护。

### 4.3 自定义模块与 __all__

自己写的 `my_module.py` 同样能被导入：

```python
# my_module.py
__all__ = ["PI", "log_separator1", "log_separator2", "log_separator3"]

PI = 3.141592653589793
SCHOOL_NAME = "大司码"


def log_separator1():
    print("-" * 30)


def log_separator2():
    print("+" * 30)


def log_separator3():
    print("#" * 30)


def log_separator4():
    print("*" * 40)
```

导入方：

```python
from my_module import *

print(PI)
log_separator1()
log_separator2()
log_separator3()

# print(SCHOOL_NAME)    # NameError！
```

`__all__` 是模块级特殊变量，列出「`import *` 时允许导出的名字」。`SCHOOL_NAME` 和 `log_separator4` 不在名单里，所以 `import *` 拿不到它们——这是模块作者控制对外接口的方式：**对外只暴露想暴露的，内部实现细节藏起来**。

### 4.4 __name__：模块的身份证

每个模块都有一个内置变量 `__name__`：

```python
# 直接运行这个文件时
print(__name__)    # __main__

# 被别的文件 import 时，打印的是模块名（比如 my_module）
```

这个机制衍生出 Python 最经典的入口写法：

```python
if __name__ == "__main__":
    # 只有直接运行本文件才会执行；被导入时不执行
    main()
```

它解决的问题是：模块里既有可复用的函数，又有测试代码。没有这行判断，别人一 `import` 你的模块，测试代码就跟着跑一遍。后面看任何开源项目的入口文件，几乎都能看到这句。

## 5. 包：用目录组织模块

模块多了，又出现新问题：几十个 py 文件平铺在一个目录里还是乱。**包（package）**就是解法——一个包含 `__init__.py` 的目录，里面装一组相关的模块。

```
my_package/
├── __init__.py      # 包的标志文件，可以为空
├── my_config.py     # llm_name = 'DeepSeek'
├── my_func.py       # print_line() / print_star()
└── my_var.py        # CIRCLE_PI / NATURE_CONSTANT
```

导入包里的模块，用点号表达层级：

```python
# 方式一：import 整条路径，调用时也要带全路径
import my_package.my_func
my_package.my_func.print_line()

# 方式二（推荐）：from 方式，导入后直接用
from my_package.my_var import NATURE_CONSTANT
from my_package.my_func import print_star

print(NATURE_CONSTANT)
print_star()
```

`from` 方式用起来干净，是更常见的选择。至此代码组织的三层结构就齐了：**变量和函数装进模块，模块装进包，包就是项目里的目录**。你 clone 下来的大模型项目，`app/api/routes.py` 这种路径，对应的就是 `from app.api import routes`。

## 6. 综合案例：订单金额计算

把本篇和函数篇的知识拧在一起。需求：传入任意多个商品（名称、价格、数量），支持优惠券、积分抵扣、运费，计算订单实付金额：

1. 优惠券：商品总额满 5000 可用，抵扣不超过商品总价；
2. 积分抵扣：满 5000 可用，100 积分抵 1 元，只能整百抵扣；
3. 最后加上运费。

```python
def calculate_order_cost(
    *args: tuple[str, float, int],
    coupon: float = 0.0,
    score: int = 0,
    express: float = 0.0,
) -> float:
    """
    根据商品、优惠和运费计算订单实付金额
    :param args: 商品元组（名称, 单价, 数量），任意多个
    :param coupon: 优惠券金额，满 5000 可用
    :param score: 积分，满 5000 可用，100 积分抵 1 元
    :param express: 运费
    :return: 实付金额
    """
    if len(args) < 1:
        return 0.0

    # 1. 商品总金额：列表推导式逐个算小计再求和
    goods_cost_list = [price * number for _, price, number in args]
    total_cost = sum(goods_cost_list)
    print(f"商品原始金额：{total_cost:.2f}")

    # 2. 优惠券抵扣（满 5000 且不超过总价）
    if total_cost >= 5000 and coupon <= total_cost:
        total_cost -= coupon
        print(f"优惠券扣减后：{total_cost:.2f}")

    # 3. 积分抵扣（满 5000，整百积分才生效：score // 100）
    if total_cost >= 5000 and score // 100 <= total_cost:
        total_cost -= score // 100
        print(f"积分扣减后：{total_cost:.2f}")

    # 4. 加运费
    total_cost += express
    return total_cost


print(calculate_order_cost(("手机", 6888.88, 1), ("耳机", 399.99, 1),
                           coupon=200, score=1209, express=0.01))
```

一眼扫过去，这篇和前几篇的知识全在：`*args` 接收任意多商品（函数篇）、`coupon=0.0` 默认参数（函数篇）、列表推导式（容器篇）、`score // 100` 整除实现「整百抵扣」（运算符篇）。三个调用案例里特意放了一个不满 5000 的订单（优惠全部失效）、一个刚好触发两种优惠的订单——**用边界数据验证规则**，是从「会写」到「写对」的分水岭。

## 7. 模块化在 AI 项目里的样子

打开任何一个大模型应用的仓库，你都会看到这套组织的实战版：

- 依赖的第三方库就是别人发布的模块：`from openai import OpenAI`、`import streamlit as st`（`as` 别名的典型用法，社区约定俗成）；
- 项目自身按功能分包：`prompts/`（提示词模板）、`tools/`（智能体的工具函数）、`memory/`（对话历史）……每个目录一个包，每个包里若干模块；
- lambda 出现在数据处理管线里：`sorted(chunks, key=lambda c: c["score"])` 给检索到的文档片段按相关度排序——这就是 RAG 的日常代码。

## 8. 常见坑清单

1. **传函数带了括号**：`calculate(99, 1, add)` 传的是函数本身；`calculate(99, 1, add())` 是先调用 add 再把结果传进去，含义完全不同；
2. **lambda 里写语句**：`lambda x: if x > 0: return x` 直接报语法错误，lambda 只能放一个表达式；
3. **滥用 `from module import *`**：多个模块同名函数互相覆盖，出了 bug 找不到来源；
4. **`__all__` 拦不住显式导入**：`import *` 拿不到 `SCHOOL_NAME`，但 `from my_module import SCHOOL_NAME` 依然可以——`__all__` 管的是 `*`，不是访问控制；
5. **模块名撞车标准库**：自己的文件起名 `random.py`、`json.py`，`import random` 导入的是你自己——标准库名字别用；
6. **`score // 100` 与 `score / 100`**：积分整百抵扣必须用整除 `//`，用 `/` 会算出小数元，账就错了。

## 9. 课后练习

1. 写高阶函数 `apply_twice(func, value)`，把 `func` 连续应用两次：`apply_twice(lambda x: x * 2, 5)` 应返回 20；
2. 给列表 `[("qwen-max", 120), ("glm-4", 90), ("llama-3", 60)]`（模型名、调用次数）分别按调用次数升序、降序排序（提示：`sort(key=..., reverse=...)`）；
3. 建一个 `string_utils.py` 模块：定义 `reverse_text(s)`、`count_words(s)` 两个函数和常量 `VERSION`，在另一个文件里分别用 `import` 和 `from ... import` 两种方式使用它们；
4. 给上一步的模块加上 `__all__`（只导出两个函数），再在模块底部写 `if __name__ == "__main__":` 的自测代码；
5. 把 5 个字符串工具函数按「文本处理」「格式化」分成两个包目录，用 `from my_package.xxx import ...` 调用。

## 10. 学习检查表

读完这篇，你应该能清楚回答：

1. 什么是高阶函数？函数作为参数时，类型标注用什么表示？
2. `lambda x, y: x + y` 和等价的 `def` 写法差在哪？lambda 不能做什么？
3. `sort(key=lambda s: len(s))` 里的 key 起什么作用？
4. `import m`、`import m as x`、`from m import f` 三种方式下，调用 `f` 的写法有什么不同？
5. `__all__` 影响哪种导入方式？能阻止显式导入吗？
6. `__name__` 在直接运行和被导入时分别是什么值？`if __name__ == "__main__"` 解决什么问题？
7. 模块和包的关系是什么？`__init__.py` 的作用是什么？

下一篇 [Python 面向对象入门](/post/python-oop-basics/) 是 Python 基础语法的最后一块大拼图：类、对象、`__init__` 和魔法方法。看懂了它，`OpenAI` 客户端那种 `client.chat.completions.create(...)` 的链式写法就不再神秘。
