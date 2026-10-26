---
title: 'Python 面向对象入门：类、对象与魔法方法'
weight: 9
date: 2026-10-26T11:00:00+08:00
lastmod: 2026-10-26T11:00:00+08:00
cover: /images/covers/python-oop-basics-cover.jpg
categories: ['人工智能', '人工智能学习']
tags: ['Python', '编程基础', '面向对象', '类']
description: 'Python 基础最后一块拼图：类与对象、__init__ 初始化属性、self 与实例方法，以及 __str__、__eq__、__lt__ 魔法方法，看懂 client.chat.completions.create 这类面向对象写法。'
math: false
mermaid: false
comments: true
toc: true
---

到这里，你已经掌握了变量、容器、循环、函数、模块（见 [Python 匿名函数与模块](/post/python-lambda-modules/)）。但有一类代码你天天见却一直没拆开过：`client.chat.completions.create(model="...")`——这个「对象.属性.方法」的链条到底是什么？

答案就是**面向对象编程（OOP）**。这一篇讲它的入门三件事：怎么用 `class` 定义类、怎么创建对象并设置属性、那些双下划线开头的**魔法方法**怎么让对象获得打印、比较的能力。学完这篇，Python 基础语法的主干就完整了。

## 1. 从「一堆散装变量」到「一个对象」

先看没有类的世界。要描述三辆车，只能用散装变量：

```python
brand1, name1, price1 = "BMW", "X5", 500000.0
brand2, name2, price2 = "BYD", "秦", 300000.0
brand3, name3, price3 = "TSL", "Model Y", 250000.0
```

三辆车就要九个变量，一百辆车呢？而且「brand 属于哪辆车」这个关系只能靠变量名的后缀维持，函数接到这堆变量也没法统一处理。

面向对象的思路是：把「品牌、名称、价格」这三样**绑在一起**，打包成一种新的数据类型。这种自定义类型就叫**类（class）**，按类生产出来的每一个具体实例叫**对象（object）**。

## 2. 定义类与创建对象

用 `class` 关键字定义一个最简单的类：

```python
class Car:
    pass    # 暂时不写内容，用 pass 占位
```

`Car` 就是一种新的类型。像调用函数一样调用它，就能「生产」一个对象：

```python
car1 = Car()          # 创建对象（实例化）

car1.brand = "BMW"    # 给对象挂属性
car1.name = "X5"
car1.price = 500000.0

print(car1.__dict__)   # {'brand': 'BMW', 'name': 'X5', 'price': 500000.0}
print(car1.price)      # 500000.0
```

两个要点：

- 属性（attribute）就是「挂在对象身上的变量」，用 `对象.属性名` 赋值和读取；
- `__dict__` 是每个对象自带的字典，列出对象的所有属性——调试时非常好用。

但这样一辆辆手工挂属性太原始了：容易漏挂、写错，也没法保证每辆车都有同样的三个属性。这就要请出第一个魔法方法。

## 3. __init__：对象的出厂设置

`__init__` 是类的**初始化方法**，创建对象时自动执行，专门用来设置属性：

```python
class Car:
    def __init__(self, brand: str, name: str, price: float):
        self.brand = brand
        self.name = name
        self.price = price
```

现在创建对象时直接传参：

```python
baoma = Car("BMW", "X5", 500000.0)
biyadi = Car("BYD", "秦", 300000.0)
tesila = Car("TSL", "Model Y", 250000.0)

print(baoma.__dict__)    # {'brand': 'BMW', 'name': 'X5', 'price': 500000.0}
print(biyadi.price)      # 300000.0
```

拆开看这段代码的机制：

1. `Car("BMW", "X5", 500000.0)` 触发 `__init__` 执行；
2. 参数 `("BMW", "X5", 500000.0)` 按位置传给 `brand, name, price`；
3. `self.brand = brand` 把参数存到**这个对象自己身上**。

**`self` 就是「当前这个对象」**——`baoma = Car(...)` 时，`self` 指向 `baoma`；`biyadi = Car(...)` 时，`self` 指向 `biyadi`。所以 `self.brand = brand` 的意思是「把收到的 brand 参数存到我自己身上」。每个对象的属性各自独立、互不干扰，这就是 `__init__` 里永远要写 `self.` 的原因。

一个实践惯例：`__init__` 的参数名直接用属性名（而不是 `c_brand` 这类前缀），`self.brand = brand` 一行对齐，读起来最清爽。

## 4. 实例方法：对象的行为

光有数据没有行为还不够。**实例方法**就是定义在类里、和对象绑定的函数——车的功能是「跑」和「算落地价」：

```python
class Car:
    def __init__(self, brand: str, name: str, price: float):
        self.brand = brand
        self.name = name
        self.price = price

    def running(self):
        print(f"{self.brand} {self.name} 正在高速行驶....")

    def total_cost(self, discount: float, rate: float) -> float:
        """落地价 = 裸车价 × 折扣 + 裸车价 × 购置税率"""
        return self.price * discount + self.price * rate
```

调用：

```python
c1 = Car("BMW", "X5", 500000.0)

c1.running()                    # BMW X5 正在高速行驶....
cost = c1.total_cost(0.9, 0.05)
print(f"提车总价：{cost:.2f}")   # 475000.00
```

实例方法和普通函数只差一点：**第一个参数永远是 `self`**，但调用时不用传——`c1.running()` 里 Python 自动把 `c1` 填进 `self`。方法内部通过 `self.price` 读写「调用它的那个对象」的属性。

到这里类的骨架就齐了：**属性放 `__init__`，行为写成实例方法，数据和行为封在同一个类里**——这就是「封装」这个词最直白的含义。

## 5. 魔法方法：让对象「讲人话」

### 5.1 问题：打印对象是一串地址

```python
c1 = Car("BMW", "X5", 500000.0)
c2 = Car("BMW", "X5", 500000.0)

print(c1)        # <__main__.Car object at 0x0000018AF1895970>
print(c1 == c2)  # False
```

两辆配置完全相同的车，打印出来是一串内存地址，比较相等返回 `False`——因为 `print` 和 `==` 不知道怎么「对待」Car 对象，只能用默认行为：打印地址、比较地址。而地址必然不同。

### 5.2 __str__：自定义打印

在类里定义 `__str__`，返回一个字符串，`print(对象)` 时就会用它：

```python
class Car:
    def __init__(self, brand: str, name: str, price: float):
        self.brand = brand
        self.name = name
        self.price = price

    def __str__(self):
        return f"{self.brand}-{self.name}-{self.price}"


c1 = Car("BMW", "X5", 500000.0)
print(c1)    # BMW-X5-500000.0
```

### 5.3 __eq__ 与 __lt__：自定义比较

`__eq__` 决定 `==` 怎么比，`__lt__` 决定 `<` 怎么比：

```python
class Car:
    def __init__(self, brand: str, name: str, price: float):
        self.brand = brand
        self.name = name
        self.price = price

    def __str__(self):
        return f"{self.brand}-{self.name}-{self.price}"

    def __eq__(self, other):
        # 三个属性都相同才算同一辆车
        return (self.brand == other.brand
                and self.name == other.name
                and self.price == other.price)

    def __lt__(self, other):
        # 按价格比较大小
        return self.price < other.price


c1 = Car("BMW", "X5", 500000.0)
c2 = Car("BMW", "X5", 500000.0)
c3 = Car("BYD", "秦", 300000.0)

print(c1)         # BMW-X5-500000.0
print(c1 == c2)   # True：属性全相同
print(c1 < c3)    # False：50 万不比 30 万便宜
print(c3 < c1)    # True
```

这类双下划线包围的方法统称**魔法方法（magic methods）**：你**不直接调用**它们，Python 在特定时机自动触发——`print()` 触发 `__str__`，`==` 触发 `__eq__`，`<` 触发 `__lt__`，创建对象触发 `__init__`（所以它也是魔法方法，第一个遇到的）。你已经认识四个了，后面还会遇到 `__len__`、`__iter__` 等——它们是 Python 「语法糖」背后的机关。

定义了 `__lt__` 之后，`max()`、`sort()` 对 Car 对象也能用了——因为它们底层用的就是 `<` 比较。魔法方法打通的是整个语言的内建能力。

## 6. 面向对象在 AI 应用里的样子

OOP 不是练习题，是大模型生态的通用语言：

```python
from openai import OpenAI

client = OpenAI(api_key="...")
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "你好"}],
)
print(response.choices[0].message.content)
```

逐段翻译这段「天书」：

- `OpenAI(api_key=...)` 调用类的 `__init__` 创建客户端对象，api_key 存到了 `client` 对象身上（`self.api_key = ...`）；
- `client.chat.completions` 是对象属性的链式访问——client 身上挂着 chat 对象，chat 身上挂着 completions 对象；
- `.create(...)` 是调用实例方法，方法内部用 `self` 拿到当初存的 api_key 去发请求；
- `response` 也是一个对象，`response.choices[0].message.content` 就是一层层取属性。

再看 LangChain 的 `PromptTemplate`、Hugging Face 的 `AutoModel`、Streamlit 的 `st.session_state`——全部是这套「类 → 对象 → 属性/方法」的模式。**看懂了类，你看任何 AI 框架文档的 quickstart 都不再是在看天书。**

## 7. 常见坑清单

1. **`__init__` 里忘了写 `self.`**：`brand = brand` 只是局部变量，出了 `__init__` 就消失，对象身上根本没挂上属性，访问 `c1.brand` 报 `AttributeError`；
2. **调用方法时手动传 self**：`c1.running(c1)` 是错的，`self` 由 Python 自动传递，写 `c1.running()` 即可；
3. **`__init__` 手动调用**：`Car.__init__(...)` 不是常规操作，创建对象走 `Car(...)`，初始化自动执行；
4. **以为 `__str__` 返回值会被打印两次**：`__str__` 只负责返回字符串，`print` 负责打印，方法体里不要再 `print`；
5. **拿 `==` 比对象却不定义 `__eq__`**：默认比较内存地址，两个内容相同的对象也是 `False`；
6. **类名小写**：约定类名用大驼峰（`Car`、`ChatClient`），变量和函数才是小写下划线。

## 8. 课后练习

1. 定义 `Student` 类：属性有姓名、语文、数学、英语三科成绩（在 `__init__` 里设置），实例方法 `average()` 返回三科平均分；
2. 给 `Student` 加 `__str__`，让 `print` 输出 `张三-92.0`（姓名-平均分）格式；
3. 给 `Student` 加 `__eq__`（姓名和三科成绩全相同算同一个人）和 `__lt__`（按平均分比较），然后用一个学生列表测试 `max()` 和 `sort()`；
4. 定义 `Message` 类：属性有 `role`（"user"/"assistant"）和 `content`，方法 `token_count()` 返回 `len(content)`（简化版 token 估计）；创建三条消息放进列表，统计总 token 和 assistant 消息条数（练习 [容器](/post/python-data-containers/) 的遍历 + 本篇的对象）；
5. 综合题：定义 `Agent` 类——属性 `name` 和 `tools`（工具名列表）；方法 `add_tool(tool_name)` 添加工具、`has_tool(tool_name)` 返回 bool；`__str__` 输出 `Agent(name=..., tools=[...])`。

## 9. 学习检查表

读完这篇，你应该能清楚回答：

1. 类和对象是什么关系？`car1 = Car()` 这行代码做了什么？
2. `__init__` 什么时候执行？`self` 指向谁？
3. 实例方法和普通函数差在哪？调用时 `self` 需要手动传吗？
4. `print(对象)`、`a == b`、`a < b` 分别触发哪个魔法方法？
5. 为什么两个属性完全相同的对象默认 `==` 是 `False`？
6. `client.chat.completions.create(...)` 里每一层点号分别在访问什么？

Python 基础系列到这里收尾。下一篇 [Transformer 与注意力机制](/post/transformer-attention-basics/) 回到 AI 主线——变量、容器、循环、函数、模块、对象六块拼图集齐之后，后面的模型代码你都能自己跑起来了。
