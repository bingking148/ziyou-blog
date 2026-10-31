---
title: 'Python 第 9 篇：类属性、多类协作与异常处理'
weight: 9
date: 2026-10-28T08:00:00+08:00
updatedDate: 2026-10-31T15:30:00+08:00
cover: /images/covers/python-oop-advanced-exceptions-cover.jpg
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '面向对象', '异常处理']
description: '类属性与实例属性的归属之争、继承入门与多类协作、try/except 完整用法与自定义异常，最后把整个系列的成果拼成一个智能助手——面向对象的主体在这篇齐活。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇的 `ChatBot` 已经能对话了，但它还缺三样东西，而这三样是真实项目绕不过去的：

1. **它没有任何「所有机器人共享」的配置**——比如总调用次数、默认模型。这类数据该放在哪？（类属性）
2. **它只有一个类，复杂一点就得拆开协作**——谁来管历史、谁来管工具调用？（多类协作）
3. **用户输入 `abc`，程序直接崩溃**——上次那个 `abc` 还欠着没还。（异常处理）

三件事讲完，OOP 的主体就齐了——最后一篇把继承、封装、多态、抽象类补完，给整个系列收官。

## 1. 类属性 vs 实例属性：这道题会纠缠你很久

### 1.1 两种属性

先看这段代码，猜猜输出什么：

```python
class Car:
    wheels = 4                  # 类属性：写在类里，不在 __init__ 里

    def __init__(self, brand):
        self.brand = brand      # 实例属性：写在 __init__ 里，挂在 self 上

c1 = Car("BMW")
c2 = Car("BYD")

print(c1.wheels, c2.wheels)     # 4 4
print(c1.brand, c2.brand)       # BMW BYD
```

**实例属性**：每个对象各有一份，互不影响（`c1.brand` 和 `c2.brand` 不同）。

**类属性**：类本身拥有的一份数据，所有对象**共享**。

```python
Car.wheels          # 4，直接通过类访问
c1.wheels           # 4，通过对象也能访问（但读的是类的那一份）
```

### 1.2 关键区别：读共享，写分家

这是最容易搞混的地方。看：

```python
class Car:
    wheels = 4

c1 = Car()
c2 = Car()

c1.wheels = 6        # 注意：这是给 c1 新建了一个实例属性！
print(c1.wheels)     # 6
print(c2.wheels)     # 4  ← 没变
print(Car.wheels)    # 4  ← 类属性也没变
```

`c1.wheels = 6` 不是「修改类属性」，而是**在 c1 身上新建了一个同名实例属性，把类属性遮住了**。

验证一下：

```python
print(c1.__dict__)   # {'wheels': 6}   ← c1 自己有了 wheels
print(c2.__dict__)   # {}              ← c2 没有，还是读类的
print(Car.__dict__)  # {'wheels': 4, ...}  ← 类属性还在
```

**属性查找顺序**：先在对象自己身上找，找不到再去类里找。

### 1.3 真正修改类属性

```python
Car.wheels = 6       # 通过类名赋值，这才是改类属性
print(c1.wheels)     # 6
print(c2.wheels)     # 6
```

### 1.4 什么时候用类属性

**适合放**：所有实例共享的常量、配置、计数器。

```python
class ChatBot:
    total_calls = 0            # 所有机器人一共调用了多少次
    DEFAULT_MODEL = "deepseek-chat"

    def __init__(self, name):
        self.name = name
        self.model = self.DEFAULT_MODEL

    def send(self, text):
        ChatBot.total_calls += 1     # 通过类名修改，别用 self
        return f"{self.name} 收到：{text}"


b1 = ChatBot("小爱")
b2 = ChatBot("Alice")
b1.send("你好")
b2.send("hi")
print(ChatBot.total_calls)      # 2
```

**不适合放**：每个对象各自的数据。比如 `history`——如果写成类属性：

```python
class BadBot:
    history = []          # ✗ 所有机器人共用这一个列表！

    def send(self, text):
        self.history.append(text)     # 通过 self 读，读到的是类属性

b1, b2 = BadBot(), BadBot()
b1.send("A")
print(b2.history)         # ['A']  ← 串味了！
```

这和第 6 篇 `def f(x=[])` 那个坑**本质上是同一个问题**：可变对象被共享了。

> [!IMPORTANT]
> **规则：可变对象（列表、字典、集合）永远放在 `__init__` 里用 `self.xxx = []` 创建。**
>
> 类属性只放不可变的常量（数字、字符串、元组）。

### 1.5 改成 `self.total_calls += 1` 会怎样

```python
def send(self, text):
    self.total_calls += 1     # 危险写法
```

这行等价于 `self.total_calls = self.total_calls + 1`——**有赋值，所以会在对象身上新建一个实例属性**，类属性反而没变。

```python
b1.send("x")
print(b1.total_calls)     # 1  ← 是 b1 自己的
print(ChatBot.total_calls) # 0  ← 类属性根本没动
```

**要改类属性，就写 `ChatBot.total_calls += 1`，把类名写清楚。**

## 2. 继承：站在别人的类上

先解决一个小问题：`ChatBot` 和「带工具调用的 Agent」有很多共同点（名字、历史、send 方法）。复制粘贴？不。

**继承**让一个类自动拥有另一个类的全部能力：

```python
class ChatBot:
    def __init__(self, name):
        self.name = name
        self.history = []

    def send(self, text):
        self.history.append(text)
        return f"{self.name}：我收到了「{text}」"

    def __str__(self):
        return f"{type(self).__name__}({self.name})"


class ToolBot(ChatBot):                    # 括号里写父类
    def __init__(self, name, tools):
        super().__init__(name)             # 先让父类把基础属性建好
        self.tools = tools                 # 再加自己的

    def use_tool(self, tool, **kwargs):
        if tool not in self.tools:
            return f"没有工具 {tool}"
        return f"[调用 {tool}] 参数 {kwargs}"
```

用起来：

```python
tb = ToolBot("工具人", ["search", "calc"])
print(tb.send("你好"))              # ToolBot 也能 send，继承自 ChatBot
print(tb.use_tool("search", q="天气"))   # [调用 search] 参数 {'q': '天气'}
print(tb.use_tool("weather"))       # 没有工具 weather
print(tb)                           # ToolBot(工具人)
```

三个要点：

1. **`class ToolBot(ChatBot)`** 表示 ToolBot 继承 ChatBot；
2. **`super().__init__(name)`** 调用父类的初始化，把 `name`、`history` 建好——**不写这行，`self.history` 就不存在**；
3. `ToolBot` 自动拥有 `send` 和 `__str__`，不用重写。

> [!NOTE]
> `type(self).__name__` 会返回对象所属类**真实**的名字，所以 `ToolBot` 打印出 `ToolBot` 而不是 `ChatBot`。这是个小技巧，比硬编码类名好。

## 3. 组装：一个像样的智能助手

现在把类属性、继承、多类协作全用上，做一个分层的小系统：

```text
Assistant     ← 大脑：管对话流程
  ├─ Memory   ← 记忆：管历史、管 token 预算
  └─ ToolBox  ← 工具：注册和调用
```

### 3.1 Memory：只管记忆

```python
class Memory:
    """对话记忆：存历史、估算 token、超预算时丢最早的"""

    def __init__(self, max_tokens=2000):
        self.messages = []
        self.max_tokens = max_tokens

    def add(self, role, content):
        self.messages.append({"role": role, "content": content})

    def token_count(self):
        """粗略估算：1 个字符 ≈ 1 token"""
        return sum(len(m["content"]) for m in self.messages)

    def _trim(self):
        """超预算时，从头开始丢，但至少保留最近 2 条"""
        while self.token_count() > self.max_tokens and len(self.messages) > 2:
            self.messages.pop(0)

    def build_context(self):
        """整理成能发给模型的列表"""
        self._trim()
        return list(self.messages)

    def clear(self):
        self.messages.clear()
```

### 3.2 ToolBox：只管工具

```python
class ToolBox:
    """工具注册表：注册、查询、调用"""

    def __init__(self):
        self.tools = {}

    def register(self, name, func, description=""):
        self.tools[name] = {"func": func, "desc": description}

    def has(self, name):
        return name in self.tools

    def call(self, name, **kwargs):
        if not self.has(name):
            raise KeyError(f"未注册的工具：{name}")
        return self.tools[name]["func"](**kwargs)

    def list_tools(self):
        return [f"{n}（{t['desc']}）" for n, t in self.tools.items()]
```

注意 `register` 接收一个**函数**作为参数，存进字典——这就是第 7 篇讲的高阶函数的实际用法。

### 3.3 Assistant：协调两个部件

```python
class Assistant:
    """智能助手：协调 Memory 和 ToolBox"""

    version = "1.0"          # 类属性：所有助手的版本号

    def __init__(self, name, max_tokens=2000):
        self.name = name
        self.memory = Memory(max_tokens)
        self.toolbox = ToolBox()

    def __str__(self):
        return f"{self.name} v{self.version}（{len(self.memory.messages)} 条消息，{len(self.toolbox.tools)} 个工具）"

    def chat(self, text):
        """处理一条用户消息"""
        self.memory.add("user", text)

        # 1. 先看是不是在调用工具
        if text.startswith("/"):
            reply = self._handle_command(text)
        else:
            reply = self._generate(text)

        self.memory.add("assistant", reply)
        return reply

    def _handle_command(self, text):
        """处理 /tool 开头的指令"""
        parts = text[1:].split(maxsplit=1)
        tool_name = parts[0]
        arg = parts[1] if len(parts) > 1 else ""

        try:
            result = self.toolbox.call(tool_name, text=arg)
            return f"[{tool_name}] {result}"
        except KeyError:
            available = "、".join(self.toolbox.tools) or "（无）"
            return f"没有这个工具。可用：{available}"

    def _generate(self, text):
        """生成回复（简化版规则）"""
        if "历史" in text:
            return f"当前有 {len(self.memory.messages)} 条消息，约 {self.memory.token_count()} token"
        return f"收到：「{text}」"
```

### 3.4 跑起来

```python
def search(text):
    return f"搜索「{text}」的结果：3 条"

def calc(text):
    try:
        return f"计算结果：{eval(text)}"
    except Exception:
        return "表达式看不懂"


def main():
    a = Assistant("小助手")

    a.toolbox.register("search", search, "联网搜索")
    a.toolbox.register("calc", calc, "算数")

    print(a)
    print(a.chat("你好"))
    print(a.chat("/search Python 装饰器"))
    print(a.chat("/calc 12 * 8"))
    print(a.chat("/weather 北京"))
    print(a.chat("历史"))
    print(a)


if __name__ == "__main__":
    main()
```

输出：

```text
小助手 v1.0（0 条消息，2 个工具）
收到：「你好」
[search] 搜索「Python 装饰器」的结果：3 条
[calc] 计算结果：96
没有这个工具。可用：search、calc
当前有 9 条消息，约 117 token
小助手 v1.0（10 条消息，2 个工具）
```

注意两个数字差 1：问「历史」时，这一条 user 消息**已经存进 memory 了**，但它的回复还没生成，所以数是 9；`print(a)` 时一整轮已经结束，所以是 10。这类「差一」在调试时很常见，看到数字不对先查时序。

### 3.5 这段代码为什么值得看

**第一，单一职责。** `Memory` 只管记忆，`ToolBox` 只管工具，`Assistant` 只管协调。想换一种记忆策略？只改 `Memory`，`Assistant` 一行不用动。

**第二，通过组合而不是继承来复用。**

`Assistant` **持有**一个 `Memory`（`self.memory = Memory(...)`），而不是继承它。这叫**组合**。

> [!TIP]
> **优先用组合，谨慎用继承。** 继承表达「是一种」（ToolBot 是一种 ChatBot），组合表达「有一个」（Assistant 有一个 Memory）。
>
> 大多数时候你会想表达「有一个」——那就用组合。继承层次超过三层，基本说明设计该重构了。

**第三，`raise KeyError` 把错误交给调用方处理。**

`ToolBox.call` 发现自己没有这个工具时，不是自己 print 一句就算了，而是**抛出异常**，让 `Assistant` 决定怎么处理。这样 `ToolBox` 不需要知道「用户看到的提示长什么样」。

这就引出了最后一节。

## 4. 异常处理：程序的安全网

回到文章开头那个欠账：用户输入 `abc`，程序崩了。

### 4.1 没有异常处理的世界

```python
age = int(input("年龄："))
```

输入 `abc`：

```text
ValueError: invalid literal for int() with base 10: 'abc'
```

程序**整个终止**，后面所有代码都不执行。对一个命令行小工具，这只意味着重跑一次；对一个跑了三小时的批处理，意味着三小时白费。

### 4.2 try / except

```python
try:
    age = int(input("年龄："))
    print(f"明年你 {age + 1} 岁")
except ValueError:
    print("请输入数字")
```

规则：**try 里的代码一旦出错，立刻跳到 except，try 里剩下的代码不再执行。**

```python
try:
    a = int("abc")        # 这里出错
    print("这行不会执行")   # 跳过了
except ValueError:
    print("转换失败")      # 执行这个
```

### 4.3 完整的四段结构

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("除数不能为 0")
else:
    print(f"结果是 {result}")     # try 没出错才执行
finally:
    print("无论如何都执行")        # 一定执行
```

- `else`：try 顺利完成后执行（放「成功后的处理」）；
- `finally`：无论成功失败都执行（放「清理工作」，比如关文件）。

日常用得最多的是 `try/except`，`else` 和 `finally` 知道有就行。

### 4.4 捕获多种异常

```python
try:
    value = int(input("请输入一个数："))
    result = 100 / value
except ValueError:
    print("这根本不是数字")
except ZeroDivisionError:
    print("不能除以 0")
```

一个 `except` 接多个：

```python
except (ValueError, ZeroDivisionError):
    print("输入有问题")
```

### 4.5 别裸捕：`except:` 和 `except Exception:`

```python
try:
    do_something()
except:                # ✗ 连 Ctrl+C 都给你吞掉
    pass
```

**这是最糟糕的写法。** 它有三个问题：

1. 吞掉了所有错误，包括你程序里的 bug（`NameError`、`TypeError`）；
2. 出错时什么都不说，排查时毫无线索；
3. 连用户按 `Ctrl+C` 想中断都拦下来了。

正确姿势：**捕获你预期的、具体的异常**。

```python
try:
    value = int(raw)
except ValueError:            # ✓ 我知道这里只可能出错在转换
    print("请输入数字")
```

> [!WARNING]
> **`except: pass` 是事故的温床。** 它让程序「看起来正常」地带着错误数据继续跑，问题会在很远的地方爆发，到那时已经查不出来了。
>
> 至少要 `print` 或记录日志。

### 4.6 自己抛异常：raise

```python
def withdraw(amount):
    if amount <= 0:
        raise ValueError("取款金额必须大于 0")
    if amount > 1000:
        raise ValueError("单次最多取 1000")
    return amount
```

`raise` 抛出的异常，会和内置异常一样，被上层的 `except` 捕获。

**什么时候该 raise 而不是打印提示？**

> 当一个函数**没有能力决定怎么处理**这个错误时，就抛出去，让调用方决定。

`ToolBox` 不知道用户想看什么提示，所以抛 `KeyError`；`Assistant` 知道，所以捕获它并转成友好文案。

### 4.7 自定义异常

项目大了，需要区分「我的业务错误」和「Python 的意外错误」：

```python
class ToolNotFoundError(Exception):
    """工具未注册"""
    pass


class TokenLimitError(Exception):
    """超出 token 预算"""
    def __init__(self, used, limit):
        super().__init__(f"已用 {used} token，超过上限 {limit}")
        self.used = used
        self.limit = limit
```

用法：

```python
try:
    toolbox.call("weather")
except ToolNotFoundError as e:
    print(f"工具问题：{e}")
```

`as e` 让你能拿到异常对象本身，读出里面的信息。

### 4.8 EAFP：Python 的风格

Python 社区推崇一种叫 **EAFP**（Easier to Ask Forgiveness than Permission）的风格：**先干，出错了再处理**。

```python
# LBYL（先检查再干）—— 其他语言的常见风格
if key in my_dict:
    value = my_dict[key]
else:
    value = None

# EAFP（先干，出错再处理）—— Python 风格
try:
    value = my_dict[key]
except KeyError:
    value = None
```

不过这个场景有更简单的写法：

```python
value = my_dict.get(key)
```

**EAFP 适用的场景**：检查本身有成本、或者检查完到使用之间状态可能变化（比如文件、网络、并发）。日常写代码，能在 API 层面解决就别用 try。

## 5. 一个完整的容错改造

把前面那个 `abc` 问题彻底解决。原来：

```python
age = int(input("年龄："))
```

改造：

```python
def read_int(prompt, minimum=None, maximum=None):
    """读一个整数，失败就一直重问"""
    while True:
        raw = input(prompt).strip()
        try:
            value = int(raw)
        except ValueError:
            print("  这不是一个整数，请重新输入")
            continue

        if minimum is not None and value < minimum:
            print(f"  不能小于 {minimum}")
            continue
        if maximum is not None and value > maximum:
            print(f"  不能大于 {maximum}")
            continue

        return value


age = read_int("请输入年龄：", minimum=0, maximum=150)
```

这个函数的三个设计点：

1. **`while True` + `continue`**：输入不合法就一直问，不合法时不返回；
2. **`try` 只包住可能出错的那一行**（`int(raw)`），不要包住整个函数体——包太大就分不清哪行出的错；
3. **`minimum`/`maximum` 用 `None` 当默认**——又一次避开可变默认值和「0 是有效值」的坑。

> [!TIP]
> **这个模式值得背下来。** 任何需要用户输入合法内容的场景，都是这个结构：`while True` 问 → `try` 转换 → 校验范围 → 不合法就 `continue` → 合法就 `return`。

## 6. 常见坑清单

1. **类属性放可变对象**——所有实例共享，串味；
2. **`self.attr += 1` 想改类属性**——实际创建了实例属性，类属性没动；
3. **继承忘了 `super().__init__()`**——父类的属性根本没建；
4. **`except: pass`**——吞掉一切错误，最糟的写法；
5. **`try` 包太大**——不知道哪行出的错；
6. **异常捕获了但不给提示**——用户一脸懵；
7. **用异常做流程控制**——能用 `if` 判断的就别 `try`；
8. **自定义异常不继承 `Exception`**——必须继承它（或它的子类）才能被正常 raise。

## 7. 课后小项目

**练习一：给 ChatBot 加容错（必做）**

1. 加 `max_tokens` 限制，超了就丢最早的对话；
2. 加 `send` 的空输入检查（空字符串要拒绝）；
3. 用自定义异常 `EmptyMessageError` 表示空消息。

**练习二：多类协作**

照着 3.1~3.3 的结构，写一个 `TodoList` 系统：
- `Task` 类：标题、截止日期、是否完成；
- `TodoList` 类：持有 `Task` 列表，能增删改查；
- `TaskNotFoundError` 自定义异常。

**练习三：健壮的计算器**

写 `safe_eval(expr)`，能算 `"1+2*3"`，但：
- 表达式非法 → 返回 `"表达式有误"`，不崩溃；
- 除零 → 返回 `"不能除以 0"`；
- 不安全的字符（`import`、`__`）→ 拒绝执行。

最后这条很重要：`eval` 是危险的，真实项目里永远不要直接 eval 用户输入。

## 8. 本篇小结

1. **类属性全家共享，实例属性各家自管**——读共享，写分家；
2. **继承让子类白拿父类的全部能力**，`super().__init__()` 是重写 `__init__` 时第一行该写的代码；
3. **复杂系统拆成单一职责的小类**，再用一个协调者把它们串起来——组合优于继承；
4. **异常处理四段结构**——`try` 包住可能出错的、`except` 精准捕获、`else` 放成功后的处理、`finally` 放清理；
5. **处理不了就 `raise`**——函数没能力决定的错误，抛给调用方；自定义异常继承 `Exception`。

OOP 还剩最后几块拼图：**方法重写与 super 的完整用法、封装、多态、抽象类**。下一篇把它们补完，组一个助手家族，给整个系列收官——[第 10 篇：继承、封装与多态](/post/python-inheritance-polymorphism/)。
