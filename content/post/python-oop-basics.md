---
title: 'Python 第 8 篇：面向对象入门，写一个聊天机器人'
weight: 8
date: 2026-10-26T11:00:00+08:00
lastmod: 2026-10-31T15:30:00+08:00
cover: /images/covers/python-oop-basics-cover.jpg
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '面向对象', '类']
description: '从函数式写法走不通的地方出发，讲清类与对象、__init__、self、实例方法和魔法方法，用它们实现一个记住上下文的聊天机器人，看懂 client.chat.completions.create。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇你把工具箱拆成了模块，代码已经相当整洁了。

但现在有个新问题：**做一个聊天机器人。**

它要记住对话历史，要能清空历史、切换模型、统计用了多少 token。用函数写会变成这样：

```python
history = []
model = "deepseek-chat"
total_tokens = 0

def chat(text):
    global history, total_tokens
    history.append({"role": "user", "content": text})
    ...
```

全局变量越堆越多，函数签名越来越长，而且**如果你想同时开两个机器人**（一个中文、一个英文），全局变量直接打架。

这就是面向对象要解决的问题：**把「数据」和「操作这些数据的函数」打包在一起，成为一个独立的个体。**

## 1. 从散装变量到对象

先看没有类的世界。描述三辆车需要九个变量：

```python
brand1, name1, price1 = "BMW", "X5", 500000.0
brand2, name2, price2 = "BYD", "秦", 300000.0
brand3, name3, price3 = "TSL", "Model Y", 250000.0
```

问题很明显：

- 变量数量随着对象数量线性膨胀；
- 「品牌属于哪辆车」只能靠变量名的数字后缀维持，编译器完全不知道；
- 想写一个「算所有车总价」的函数，得挨个把参数传进去。

**面向对象的思路**：把「品牌、名称、价格」这三样**绑在一起**，做成一种新的数据类型。

这种自定义类型叫**类（class）**，按类生产出来的每个具体实例叫**对象（object）**。

用一句话概括：

> **类 = 图纸，对象 = 按图纸造出来的东西。**

## 2. 定义类与创建对象

```python
class Car:
    pass          # 暂时空着，用 pass 占位
```

`class` 后面跟类名，**类名用大驼峰**（每个单词首字母大写，如 `ChatBot`、`UserProfile`）。

有了图纸，就能造东西：

```python
car1 = Car()          # 创建对象，也叫「实例化」

car1.brand = "BMW"    # 给对象挂属性
car1.name = "X5"
car1.price = 500000.0

print(car1.price)     # 500000.0
print(car1.__dict__)  # {'brand': 'BMW', 'name': 'X5', 'price': 500000.0}
```

两个概念：

- **属性（attribute）**：挂在对象身上的变量，用 `对象.属性名` 读写；
- **`__dict__`**：每个对象自带的字典，列出它所有属性——调试时非常好用。

但这样一辆辆手工挂属性太原始了：容易漏、容易写错，而且没法保证每辆车都有这三个属性。这就要请出 `__init__`。

## 3. `__init__`：对象的出厂设置

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

print(baoma.price)      # 500000.0
print(biyadi.price)     # 300000.0
```

### 3.1 拆解执行过程

`Car("BMW", "X5", 500000.0)` 这一行做了三件事：

1. 创建一个空对象；
2. 调用 `__init__`，把这个空对象作为第一个参数传进去（就是 `self`）；
3. 参数 `"BMW", "X5", 500000.0` 按位置传给 `brand, name, price`；
4. `self.brand = brand` 把参数存到**这个对象自己身上**；
5. 返回这个对象。

### 3.2 self 到底是什么

**`self` 就是「当前这个对象」。**

```python
baoma = Car("BMW", "X5", 500000.0)     # self 指向 baoma
biyadi = Car("BYD", "秦", 300000.0)     # self 指向 biyadi
```

所以 `self.brand = brand` 的意思是「**把收到的 brand 参数存到我自己身上**」。两个对象的属性各自独立、互不干扰。

这就是为什么 `__init__` 里每个属性都要写 `self.`：

```python
class Bad:
    def __init__(self, brand):
        brand = brand        # ✗ 只是局部变量，出了 __init__ 就没了

b = Bad("BMW")
print(b.brand)               # AttributeError: 'Bad' object has no attribute 'brand'
```

> [!WARNING]
> **`self.` 漏写是面向对象第一坑。** 而且它不一定报错——如果你只是读，会报 `AttributeError`；但如果你在 `__init__` 里漏了，等到后面用的时候才发现，排查起来更麻烦。

### 3.3 一个实践惯例

`__init__` 的参数名直接和属性名同名：

```python
def __init__(self, brand, name, price):
    self.brand = brand        # 一行对齐，读起来清爽
    self.name = name
    self.price = price
```

别写成 `c_brand` 这种前缀，没必要。

## 4. 实例方法：对象能做什么

光有数据不够，对象还得有行为。**实例方法**就是定义在类里的函数：

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
print(c1.total_cost(0.9, 0.05)) # 475000.0
```

### 4.1 实例方法和普通函数差在哪

**只差一点：第一个参数永远是 `self`，但调用时不用传。**

```python
c1.running()          # ✓ self 被自动填成 c1
c1.running(c1)        # ✗ TypeError，多传了一个
```

方法内部通过 `self.price` 读写「调用它的那个对象」的属性。所以同一个 `running` 方法，`c1` 调用打印 BMW，`c2` 调用打印 BYD。

到这里类的骨架就齐了：

> **属性放 `__init__`，行为写成实例方法，数据和行为封在同一个类里。**

这就是「封装」最直白的含义。

## 5. 魔法方法：让对象「讲人话」

### 5.1 问题：print 一个对象是串地址

```python
c1 = Car("BMW", "X5", 500000.0)
c2 = Car("BMW", "X5", 500000.0)

print(c1)          # <__main__.Car object at 0x0000018AF1895970>
print(c1 == c2)    # False
```

两辆配置完全相同的车，打印出来是内存地址，比较相等却是 `False`。

原因：`print` 和 `==` 不知道怎么「对待」Car 对象，只能用默认行为——**打印地址、比较地址**。而两个对象地址必然不同。

### 5.2 `__str__`：自定义打印

```python
class Car:
    def __init__(self, brand, name, price):
        self.brand, self.name, self.price = brand, name, price

    def __str__(self):
        return f"{self.brand}-{self.name}-{self.price}"

print(Car("BMW", "X5", 500000.0))     # BMW-X5-500000.0
```

`__str__` 必须返回字符串，`print` 会用它来显示对象。

> [!WARNING]
> **`__str__` 里不要 `print`。** 它只负责「返回」字符串，打印是 `print` 的事。在里面 print 会导致内容打印两次。

### 5.3 `__eq__` 与 `__lt__`：自定义比较

```python
class Car:
    def __init__(self, brand, name, price):
        self.brand, self.name, self.price = brand, name, price

    def __str__(self):
        return f"{self.brand}-{self.name}-{self.price}"

    def __eq__(self, other):
        """三个属性都相同才算同一辆车"""
        return (self.brand == other.brand
                and self.name == other.name
                and self.price == other.price)

    def __lt__(self, other):
        """按价格比大小"""
        return self.price < other.price


c1 = Car("BMW", "X5", 500000.0)
c2 = Car("BMW", "X5", 500000.0)
c3 = Car("BYD", "秦", 300000.0)

print(c1 == c2)    # True
print(c1 < c3)     # False
print(c3 < c1)     # True
```

### 5.4 魔法方法是什么

这类双下划线包起来的方法，统称**魔法方法（magic methods）**。特点是：

> **你不直接调用它们，Python 在特定时机自动触发。**

| 你写的代码 | 触发的方法 |
|---|---|
| `Car(...)` | `__init__` |
| `print(obj)` | `__str__` |
| `obj == other` | `__eq__` |
| `obj < other` | `__lt__` |
| `len(obj)` | `__len__` |
| `for x in obj` | `__iter__` |

定义了 `__lt__` 之后，`max()`、`sort()` 对 Car 对象也能用了——因为它们底层就是靠 `<` 比较的。

**魔法方法打通的是整个语言的内建能力。** 你写一个类，只要实现了对应的魔法方法，它就能像内置类型一样用 `sorted()`、`len()`、`for` 循环。

## 6. 组装：聊天机器人

现在用上所有东西。

### 6.1 第一版：能对话

```python
class ChatBot:
    """一个最小的聊天机器人（用规则模拟，不调真实 API）"""

    def __init__(self, name="小助手", model="deepseek-chat"):
        self.name = name
        self.model = model
        self.history = []          # 对话历史，每项是一个字典

    def __str__(self):
        return f"ChatBot({self.name}, model={self.model}, {len(self.history)} 条消息)"

    def send(self, text):
        """发一条消息，返回机器人的回复"""
        self.history.append({"role": "user", "content": text})

        reply = self._generate_reply(text)
        self.history.append({"role": "assistant", "content": reply})
        return reply

    def _generate_reply(self, text):
        """生成回复（这里是简化版规则）"""
        if text in ("你好", "hi", "hello"):
            return f"你好，我是{self.name}"
        elif "名字" in text:
            return f"我叫{self.name}"
        elif "历史" in text:
            return f"我们聊了 {len(self.history)} 条消息"
        return f"你说的是「{text}」"

    def reset(self):
        """清空历史"""
        self.history.clear()

    def token_count(self):
        """粗略估算 token（按字符数）"""
        return sum(len(m["content"]) for m in self.history)
```

用起来：

```python
bot = ChatBot("小爱")

print(bot.send("你好"))        # 你好，我是小爱
print(bot.send("你叫什么名字")) # 我叫小爱
print(bot.send("历史"))        # 我们聊了 5 条消息  ← 当前这条 user 已经进历史了
print(bot)                     # ChatBot(小爱, model=deepseek-chat, 6 条消息)

bot.reset()
print(bot)                     # ChatBot(小爱, model=deepseek-chat, 0 条消息)
```

### 6.2 关键：为什么这次不用全局变量了

对比文章开头那个版本：

```python
# 全局版本：两个机器人会打架
history = []
def chat(text): ...

# 对象版本：各自独立
bot1 = ChatBot("小爱")
bot2 = ChatBot("Alice")
bot1.send("你好")      # bot2.history 完全不受影响
```

**每个对象自带一份 `history`。** 想开几个机器人就开几个，互不干扰。

这就是面向对象最核心的收益——**让状态跟着对象走，而不是跟着整个程序走**。

### 6.3 三个设计点

**第一，`self.history` 在 `__init__` 里创建。**

```python
def __init__(self, ...):
    self.history = []        # 每个对象一份，独立的列表
```

如果写成类属性（下一节讲），所有机器人会共用同一个列表——和第 6 篇那个 `def f(x=[])` 的坑一模一样。

**第二，`_generate_reply` 前面有下划线。**

```python
def _generate_reply(self, text):
```

这是告诉别人「这是内部方法，别直接调」。用的时候调 `send()` 就够了。

**第三，`send` 既改了状态又返回了结果。**

```python
def send(self, text):
    self.history.append(...)      # 改状态
    return reply                   # 返回结果
```

这个设计是合理的——发消息本来就该「记下来 + 给你回复」两件事一起做。但要注意：**调用 `send` 会改变对象的状态**，这一点让方法调用和普通函数有了本质区别。

## 7. 面向对象在 AI 应用里的样子

现在可以回答那个悬着的问题了：`client.chat.completions.create(...)` 到底是什么？

真实项目里调用大模型的核心就这几行（以 DeepSeek 为例，密钥从环境变量读，**不要写死在代码里**）：

```python
import os
from openai import OpenAI          # pip install openai

client = OpenAI(
    api_key=os.environ["DEEPSEEK_API_KEY"],
    base_url="https://api.deepseek.com",
)
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": "你是一个AI智能助手，上知天文下知地理。"},
        {"role": "user", "content": "你好"},
    ],
)
print(response.choices[0].message.content)
```

逐段翻译：

| 代码 | 含义 |
|---|---|
| `OpenAI(api_key=..., base_url=...)` | 调用 `__init__`，创建客户端对象，参数都存进对象里 |
| `client.chat` | 访问 client 对象的 `chat` 属性（它也是个对象） |
| `.completions` | chat 对象的 `completions` 属性 |
| `.create(...)` | 调用实例方法，方法内部用 `self` 拿到当初存的 api_key |
| `response.choices[0].message.content` | 一层层剥属性取值 |

**这就是「对象.属性.方法」链式调用的本质。**`response.choices[0].message.content` 这一长串，就是一路「剥」下去：`response` 是对象 → `choices` 是列表 → `[0]` 取第一个 → `message` 又是对象 → `content` 是它的属性。`messages` 那个「列表套字典」的结构，正是第 5 篇练过的容器组合。

本地跑模型用的是另一套库 `ollama`，写法几乎一模一样：

```python
from ollama import chat            # pip install ollama，本机要先跑着 Ollama 服务

response = chat(
    model="deepseek-r1:1.5b",
    messages=[{"role": "user", "content": "你是谁？"}],
)
print(response.message.content)    # 照样一层层剥到正文
```

两套 SDK 长一个样不是巧合——写它们的作者都懂面向对象，`response` 都是响应对象，取正文都是「对象.属性.属性」。

再看几个你以后一定会遇到的：

- **LangChain 的 `PromptTemplate`、`ChatOpenAI`**——全是类；
- **Hugging Face 的 `AutoModel.from_pretrained(...)`**——类方法；
- **Streamlit 的 `st.session_state`**——一个跨次运行保持状态的全局对象；
- **你写的 `ChatBot`**——结构上和它们一模一样，只是简单。

**看懂了类，你看任何 AI 框架的 quickstart 都不再是天书。**

> [!TIP]
> 下次读框架文档时，试着给每个 `xxx.yyy.zzz()` 标注一下：`xxx` 是对象，`yyy` 是它的属性，`zzz` 是它调用的方法。标完你会发现，大部分 SDK 的结构都极其相似。

## 8. 常见坑清单

1. **`__init__` 里忘了 `self.`**——属性根本没挂上，后面报 `AttributeError`；
2. **手动传 `self`**——`c1.running(c1)` 是错的，写 `c1.running()`；
3. **手动调 `__init__`**——用 `Car(...)`，不要 `Car.__init__(...)`；
4. **`__str__` 里 return 前又 print**——内容会打印两次；
5. **不定义 `__eq__` 就拿 `==` 比对象**——比的是内存地址，永远 `False`；
6. **类名小写**——类名用大驼峰 `ChatBot`，变量和函数才用小写下划线；
7. **忘了 `self` 参数**——`def running():` 会报「不接受参数但传了 1 个」。

## 9. 课后小项目

**练习一：Student 类（必做）**

属性：姓名、语文、数学、英语。方法：`average()` 返回平均分，`__str__` 输出 `张三-85.33`。

然后用一个学生列表测试 `sorted(students)`——需要先实现 `__lt__`。

**练习二：给 ChatBot 加功能**

1. 加一个 `switch_model(new_model)` 方法，切换模型并返回一句提示；
2. 加 `export()` 方法，把 `history` 转成 JSON 字符串（用 `import json`）；
3. 加一个 `max_rounds` 参数，超过轮数自动丢弃最早的对话（提示：`self.history = self.history[2:]` 每次删掉一问一答）。

**练习三：BankAccount 类**

属性：`owner`、`balance`。方法：`deposit(amount)`、`withdraw(amount)`（余额不足要拒绝）、`__str__`。

要求：金额不能为负，`deposit(-100)` 要拒绝而不是把余额变少。

**练习四：让两个 ChatBot 对话**

创建两个 ChatBot，让它们互相发消息 5 轮，每次打印谁说了什么。

提示：`reply = bot_a.send("你好")`，然后 `bot_b.send(reply)`。

## 10. 本篇小结

1. **类 = 图纸，对象 = 按图纸造出来的实例**；
2. **`__init__` 在创建对象时自动执行**，用来设置属性；`self` 指向当前对象；
3. **实例方法的第一个参数永远是 `self`**，但调用时不传；
4. **`print(obj)` 触发 `__str__`，`a == b` 触发 `__eq__`，`a < b` 触发 `__lt__`**；
5. **对象把状态和方法绑在一起**，多个实例互不干扰——这是它最大的价值；
6. **`client.chat.completions.create(...)` 就是链式的「对象.属性.方法」**。

下一篇 [第 9 篇：类属性、多类协作与异常处理](/post/python-oop-advanced-exceptions/) 是这个系列的收官。会讲清「类属性和实例属性到底怎么区分」（这是面试高频题，也是真 bug 高发区），然后做一个多类协作的完整项目，最后给程序套上异常处理这张安全网。
