---
title: 'Python 面向对象进阶与异常处理：类属性、多类协作与 try/except'
weight: 10
date: 2026-10-28T08:00:00+08:00
lastmod: 2026-10-28T08:00:00+08:00
cover: /images/covers/python-oop-advanced-exceptions-cover.jpg
categories: ['人工智能', '人工智能学习']
tags: ['Python', '编程基础', '面向对象', '异常处理']
description: 'Python 基础系列收官篇：类属性与实例属性的归属之争、教务系统与购物车两个多类协作案例，以及 try/except 异常处理的完整用法。'
math: false
mermaid: false
comments: true
toc: true
---

[上一篇](/post/python-oop-basics/)把类的入门三件事讲完了：定义类、`__init__` 设置属性、魔法方法。但写真实项目还会撞上三个问题：有些属性是「每辆车自己的」，有些是「全车系共享的」，怎么区分？稍微像样的系统都要管一堆对象，一个类扛不住，怎么拆成几个类协作？程序运行到一半出错了（用户输了字母、除数是 0、字典里没这个 key），怎么让程序不崩、把错误体面地接住？

这一篇就是 Python 基础系列的收官篇，回答这三个问题：**类属性与实例属性**、**多类协作的两个完整案例**、**try/except 异常处理**。学完它，变量、容器、循环、函数、模块、对象、异常七块拼图全部集齐。

## 1. 属性的两种归属：实例属性与类属性

上一篇所有属性都写在 `__init__` 里、挂在对象身上。但这种属性不是唯一形态。看这个车的例子：

```python
class Car:
    # 直接写在类里、不缩进到 __init__ 的变量：类属性
    wheel: int = 4          # 每辆车的轮胎数
    tax_rate: float = 0.1   # 购置税率

    def __init__(self, brand: str, name: str, price: float):
        # 写在 __init__ 里、通过 self. 挂到对象身上的属性：实例属性
        self.brand = brand
        self.name = name
        self.price = price

    def running(self):
        print(f"{self.brand} {self.name} 正在高速行驶....")
```

两种属性的归属完全不同：

- **实例属性**：属于每个具体对象。每辆车有自己的品牌、名称、价格——比亚迪汉是汉，Model Y 是 Model Y，各不相同；
- **类属性**：属于类本身，**所有实例共享**。不管生产多少辆车，轮胎都是 4 个、购置税率都是 0.1——这种「全体对象都一样」的值，写在类里一份就够了。

读它们的规则：**读实例属性用对象，读类属性用类名**（用对象也能读到类属性）：

```python
c1 = Car("BYD", "汉", 180000.0)
c2 = Car("Tesla", "Model Y", 260000.0)

print(c1.__dict__)     # {'brand': 'BYD', 'name': '汉', 'price': 180000.0}
print(c2.__dict__)     # {'brand': 'Tesla', 'name': 'Model Y', 'price': 260000.0}
print(Car.wheel)       # 4    类名.类属性
print(c1.wheel)        # 4    对象也能读到类属性
print(c1.brand)        # BYD  实例属性只能通过对象读
```

注意 `c1.__dict__` 的输出：只有 `brand、name、price` 三个实例属性，**没有** `wheel` 和 `tax_rate`——它们不在对象身上，而在类身上。对象读到 `c1.wheel` 是因为 Python 的查找顺序：先找实例属性，找不到就顺着去类里找。

### 1.1 遮蔽：给实例赋值会「盖住」类属性

查找顺序带来一个必须理解的现象——通过对象给属性赋值，创建的是实例属性，会遮住类属性：

```python
c1.wheel = 6        # 注意：这是给 c1 挂了一个实例属性，不是改类属性！
print(c1.wheel)     # 6   c1 被自己的实例属性遮住了
print(c2.wheel)     # 4   c2 没被动过
print(Car.wheel)    # 4   类属性原封不动

Car.wheel = 5       # 通过类名修改，才是真的改类属性
print(c1.wheel)     # 6   c1 还是被自己的 6 遮着
print(c2.wheel)     # 5   c2 跟着类走了
```

一句话总结：**改类属性用类名；用对象名赋值永远是给这个对象自己加属性**。这也解释了为什么上一篇文章里所有属性都写 `self.`——那就是在明确声明「这个属性属于对象自己」。

怎么选？经验法则是：每个对象都不同、跟着对象走的（姓名、价格、成绩），用实例属性；全体对象共享、只有一个值的（税率、默认配置、计数器），用类属性。这个分法跟函数篇里「局部变量管自己、全局变量大家用」的味道很像，只是主角从函数换成了类。

## 2. 综合案例（上）：教务管理系统，两个类协作

有了属性和方法的认知，可以写第一个像样的系统了。教务管理系统要管理学生的成绩信息，功能是增、改、删、查。课堂上的做法是先搭骨架再填肉，这里直接看搭好的结构：

```python
class Student:
    """学生类：一个对象对应一个学生，管好自己的数据"""

    def __init__(self, name: str, chinese: float, math: float, english: float):
        self.name = name
        self.chinese = chinese
        self.math = math
        self.english = english

    def __str__(self):
        total = self.chinese + self.math + self.english
        return (f"姓名：{self.name} | 语文：{self.chinese} | "
                f"数学：{self.math} | 英语：{self.english} | 总分：{total}")

    def update_score(self, chinese: float = None, math: float = None,
                     english: float = None):
        """只更新传了值的科目，没传的保持原样"""
        if chinese is not None:
            self.chinese = chinese
        if math is not None:
            self.math = math
        if english is not None:
            self.english = english


class EduManagement:
    """教务管理类：管一群 Student 对象"""

    def __init__(self):
        self.student_list = []      # 列表里存的是 Student 对象

    def add_student(self):
        name = input("请输入学生姓名：").strip()
        chinese = float(input("请输入语文成绩："))
        math = float(input("请输入数学成绩："))
        english = float(input("请输入英语成绩："))
        self.student_list.append(Student(name, chinese, math, english))
        print(f"学生【{name}】添加成功！")

    def query_student(self):
        name = input("请输入要查询的学生姓名：")
        for stu in self.student_list:
            if stu.name == name:
                print(stu)          # 触发 __str__，直接打印
                return
        print(f"没有找到学生【{name}】")

    def list_student(self):
        if not self.student_list:
            print("请先添加学生信息，再查询！")
            return
        for stu in self.student_list:
            print(stu)

    def run(self):
        print("欢迎使用教务管理系统")
        while True:
            print("\n1.添加  2.修改  3.删除  4.查指定  5.查所有  6.退出")
            choice = input("请选择操作（1-6）：")
            if choice == "1":
                self.add_student()
            elif choice == "2":
                self.update_student()
            elif choice == "3":
                self.delete_student()
            elif choice == "4":
                self.query_student()
            elif choice == "5":
                self.list_student()
            elif choice == "6":
                print("Bye ~")
                break
            else:
                print("输入错误，请选择 1-6！")


if __name__ == "__main__":
    EduManagement().run()
```

这个案例值得琢磨的是**类怎么分工**：

- `Student` 是**数据类**：一个对象就是一个学生，属性是三科成绩，`__str__` 负责把自己讲清楚，`update_score` 只管改自己的分。它不关心世界上有多少学生；
- `EduManagement` 是**管理类**：它自己几乎没有数据属性，唯一的属性是一个列表 `self.student_list`——但列表里装的不是数字、不是字符串，而是**一个个 Student 对象**。「对象的列表」是面向对象最常用的组合，把它想成「花名册」就对了；
- 两者的连接点是那个 `for stu in self.student_list: print(stu)`——管理类遍历列表，把每个对象打印出来，而「打印出来长什么样」由 Student 自己的 `__str__` 决定。数据的行为归数据类，集合的操作归管理类，这就是「封装」往大了一号的用法。

菜单循环 `while True + input + if/elif` 是上一篇控制流的老朋友，只是这次 `if` 分支里调的不是函数，而是 `self` 的方法。

## 3. 综合案例（下）：购物车系统的三层结构

教务系统是「一个数据类 + 一个管理类」，购物车案例把它再拆细一层。系统要管理商品（名称、价格、数量）的增改删查，课堂版本拆成了三个类：

```python
class Goods:
    """商品实体类：封装一条商品数据"""

    def __init__(self, name: str, price: float, count: int):
        self.name = name
        self.price = price
        self.count = count

    def __str__(self):
        return f"商品名称: {self.name}, 商品价格: {self.price}, 商品数量: {self.count}"


class ShoppingCart:
    """购物车类：负责管理所有商品对象"""

    def __init__(self):
        self.goods_list = []

    def __find_by_name(self, name: str) -> Goods | None:
        """内部工具方法：按名称查找商品，找不到返回 None"""
        for goods in self.goods_list:
            if goods.name == name:
                return goods
        return None

    def add_goods(self):
        name = input("请输入商品名称：").strip()
        if not name:
            print("商品名称不能为空！")
            return
        if self.__find_by_name(name):
            print(f"商品【{name}】已存在，请使用修改功能！")
            return
        price = float(input("请输入商品价格："))
        count = int(input("请输入商品数量："))
        if price < 0 or count < 0:
            print("价格和数量不能为负数！")
            return
        self.goods_list.append(Goods(name, price, count))
        print(f"商品【{name}】添加成功！")

    # modify_goods / delete_goods / query_goods 同理，都先用 __find_by_name 找人
    # ……


class CartSystem:
    """系统入口类：只负责菜单显示和用户交互"""

    def __init__(self):
        self.cart = ShoppingCart()

    def run(self):
        while True:
            print("==== 购物车管理系统 ====")
            choice = input("请选择功能（1-5）：").strip()
            if choice == "1":
                self.cart.add_goods()
            elif choice == "2":
                self.cart.modify_goods()
            elif choice == "3":
                self.cart.delete_goods()
            elif choice == "4":
                self.cart.query_goods()
            elif choice == "5":
                print("感谢使用，再见！")
                break
            else:
                print("输入有误！")
```

跟教务系统比，多了两样东西。

**第一是三层分工。**`Goods` 只管「一条商品长什么样」，`ShoppingCart` 管「一堆商品怎么增改删查」，`CartSystem` 只管「菜单和用户交互」，它持有 `self.cart = ShoppingCart()`，把用户的每一次选择转发给购物车。系统越大，「数据 → 管理 → 界面」分层的好处越明显：改菜单不影响购物逻辑，改存储结构不动界面代码。

**第二是私有方法。**`__find_by_name` 前面有两个下划线——这是 Python 的约定：**双下划线开头的方法是类内部用的，不打算给外部调用**。查重、修改、删除三个功能都要「按名字找人」，与其把循环复制三遍，不如抽成一个内部工具方法，三个功能各自调用。这跟函数篇「重复三遍就抽函数」是同一个直觉，只是这次函数住进了类里，并加上了私有的帽子。

两个案例合起来看，面向对象的套路其实很稳定：**先问系统里有哪几类「东西」（学生、商品），每类东西做成一个类；再问「东西」需要被怎么管理（增改删查），管理逻辑放进管理类；最后菜单循环把用户输入转发给管理类的方法。**课后练习的智能体管理系统，用的就是这套骨架。

## 4. 异常处理：程序出错时的安全网

前两个案例里藏着一批裸奔的代码：`float(input(...))` 遇到用户输入 `abc` 直接 `ValueError` 崩掉；`self.student_list` 里没有学生就查询，程序照常走完但不报错。程序出错不等于要崩——**异常处理（try/except）就是给危险代码垫的安全网**：

```python
scores = [89.0, 67.0, 99.0]
map = {"id": 1001, "name": "zhangsan"}

try:
    print(10 / 0)               # 除数是 0 → ZeroDivisionError
    print(scores[10])           # 索引越界 → IndexError
    print(map["age"])           # key 不存在 → KeyError
    int(input("请输入一个整数："))  # 输入 abc → ValueError
except ZeroDivisionError as e:
    print(f"除数不能为 0，错误信息：{e}")
except IndexError as e:
    print(f"索引下标越界，错误信息：{e}")
except KeyError as e:
    print(f"字典中 key 不存在，错误信息：{e}")
except ValueError as e:
    print(f"数据类型转换错误，错误信息：{e}")
except Exception as e:
    print(f"程序异常啦，具体信息：{e}")
finally:
    print("无论是否出现异常，我都会执行")
```

拆开看每个零件：

- `try:` 把「可能会出错」的代码圈进去。Python 从上往下执行，**一旦某行抛出异常，剩下的行直接跳过**——上面这段永远只会打印 `除数不能为 0`，因为第一行就炸了；
- `except 具体异常类型 as 变量:` 接住指定类型的错误，`as e` 把错误对象存进变量 `e`，打印 `e` 能看到出错原因。就像 `if/elif` 的分支匹配，Python 拿异常的类型逐个比对，**匹配哪个就执行哪个分支**；
- `except Exception as e:` 是**兜底分支**——`Exception` 是绝大多数异常的父类，前面列的都没接住时归它管。所以它必须写在最后：写在前面的话，所有异常都被它拦截，后面具体的 `except` 一个都轮不到；
- `finally:` 里的代码**无论是否发生异常都会执行**。适合放「无论如何都要做」的事：关闭文件、断开连接、恢复界面状态。

常见的异常类型先记这五个：`NameError`（变量没定义）、`ZeroDivisionError`（除零）、`IndexError`（下标越界）、`KeyError`（字典 key 不存在）、`ValueError`（类型转换失败）。它们全是你在容器和循环篇里见过报错的老熟人了——当时看到 Traceback 只能干瞪眼，现在可以把它们一个一个接住。

把异常处理加回购物车系统，`float(input(...))` 就安全了：

```python
def add_goods(self):
    name = input("请输入商品名称：").strip()
    try:
        price = float(input("请输入商品价格："))
        count = int(input("请输入商品数量："))
    except ValueError:
        print("价格必须是数字、数量必须是整数！")
        return
    if price < 0 or count < 0:
        print("价格和数量不能为负数！")
        return
    self.goods_list.append(Goods(name, price, count))
```

用户输入 `abc` 不再崩溃，而是收到一句提示，重新回到菜单。**try 的范围要收紧**：只圈真正可能出错的那几行，不要把整个函数体都塞进去——圈得越大，真正出错时越难定位。

## 5. 异常会层层传递

函数调用链上的异常有个重要脾气：**在哪一层抛出，就沿着调用链一路向上传递，直到被某个 try 接住；没人接住，程序才崩**。

```python
def f1():
    print("f1.....")
    f2()

def f2():
    print("f2.....")
    f3()

def f3():
    print("f3.....")
    print(my_data)      # my_data 没定义，NameError 在这里诞生

if __name__ == "__main__":
    try:
        f1()
    except NameError as e:
        print(f"接住了：{e}")
```

运行结果是：

```text
f1.....
f2.....
f3.....
接住了：name 'my_data' is not defined
```

`NameError` 诞生在最深处的 `f3`，但 `f1`、`f2` 里都没写 try/except，它就穿过两层函数一路冒到最外层的 try，被接住了。程序没有崩。

把 try 挪到 `f2` 里、或者干脆不放 try，程序的行为都会变——这就是「在哪一层处理异常」的设计问题。经验是：**谁能处理，谁就接**。底层函数（算账的、读文件的）通常不知道出错后该提示什么，让异常继续往上飘；最外层（菜单循环、主程序）离用户最近，由它统一接住、给出提示。你现在应该能看懂之前每次崩溃时那一长串 Traceback 了：它就是异常从出生地一路爬到顶层、无人接驾的完整路线图。

## 6. 异常处理在 AI 应用里的样子

调用大模型 API 的代码，几乎一定裹着 try/except——网络会抖、余额会尽、限流会触发：

```python
from openai import OpenAI

client = OpenAI(api_key="...")

try:
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "user", "content": "你好"}],
    )
    print(response.choices[0].message.content)
except RateLimitError:
    print("请求太频繁或额度不足，稍后再试")
except APITimeoutError:
    print("请求超时，请检查网络")
except Exception as e:
    print(f"调用失败：{e}")
```

套路和第 4 节一模一样：具体的异常（限流、超时）分别接住、给出针对性的提示，最后用 `Exception` 兜住其他意外。Streamlit 的聊天应用在 `except` 分支里把错误消息追加到 `st.session_state` 的消息列表，界面上就能显示一条「服务暂时不可用」——而不是让整个页面白屏。你在[函数篇](/post/python-functions-in-depth/)见过的那句「类型把关要靠 isinstance 或者异常处理」，现在后半句也兑现了。

## 7. 常见坑清单

1. **给对象赋值以为是改类属性**：`c1.wheel = 6` 是给 c1 自己挂实例属性，其他对象和类本身不受影响；想改共享值必须写 `Car.wheel = 6`；
2. **`except Exception` 放在最前**：它会吞掉所有异常，后面的具体分支永远执行不到。兜底分支永远放最后；
3. **try 圈太大**：把几十行都塞进 try，出错时根本不知道是哪行炸的。只圈可能出错的那几行；
4. **用 `if score:` 判断成绩是否传入**：`if 0:` 是 `False`，传 0 分会被当成「没传」而忽略。判断「有没有传」用 `is not None`，别用真值判断；
5. **私有方法在外部调用**：`cart.__find_by_name(...)` 报 `AttributeError`——双下划线方法就是设计给类内部用的，外部要用请走公开方法；
6. **只写 except 不给提示**：`except: pass` 把错误悄悄吞掉，程序「看起来正常」其实出了问题。至少打印错误信息，让错误可追踪。

## 8. 例题精讲：两道完整的题

### 8.1 Model 类：让对象能比较、能排序

> 定义 `Model` 类：`__init__` 接收 `name、score`；`__str__` 返回 `名字-分数`；`__eq__` 要求 name 和 score 都相等才算相等；`__lt__` 按 score 比大小。创建 `m1 = Model('A', 90)`、`m2 = Model('B', 75)`、`m3 = Model('A', 90)`，依次打印 `m1 == m3`、`m1 == m2`、`m1 < m2`，最后用 `sorted([m1, m2, m3])` 排序打印。

```python
class Model:
    def __init__(self, name: str, score: int):
        self.name = name
        self.score = score

    def __str__(self):
        return f"{self.name}-{self.score}"

    def __eq__(self, other):
        return self.name == other.name and self.score == other.score

    def __lt__(self, other):
        return self.score < other.score


m1 = Model("A", 90)
m2 = Model("B", 75)
m3 = Model("A", 90)

print(m1 == m3)     # True
print(m1 == m2)     # False
print(m1 < m2)      # False：90 不小于 75

for item in sorted([m1, m2, m3]):
    print(item)     # B-75 → A-90 → A-90
```

这题是[入门篇](/post/python-oop-basics/)魔法方法一节的直接应用：定义了 `__eq__`，`==` 就比内容而不比内存地址（所以 `m1 == m3` 是 `True`）；定义了 `__lt__`，`sorted()` 就有了排序依据——`sorted` 底层用的就是 `<`。三个对象按分数升序输出 `B-75、A-90、A-90`，两个相等的 A 保持原来的先后顺序。

### 8.2 ChatSession：用 *args 给类收不定长的初始数据

> 定义 `ChatSession` 类：`__init__(self, *messages)` 用 `*args` 接住任意条初始消息，存成列表属性；`add(msg)` 往末尾追加一条；`__str__` 返回 `共 N 条消息：消息1 | 消息2 | ...`。

```python
class ChatSession:
    def __init__(self, *messages: str):
        self.messages = list(messages)

    def add(self, msg: str):
        self.messages.append(msg)

    def __str__(self):
        return f"共 {len(self.messages)} 条消息：{' | '.join(self.messages)}"


chat = ChatSession("你好呀！", "介绍一下你自己")
print(chat)             # 共 2 条消息：你好呀！ | 介绍一下你自己
chat.add("帮我写个函数")
print(chat)             # 共 3 条消息：你好呀！ | 介绍一下你自己 | 帮我写个函数
print(chat.__dict__)    # {'messages': ['你好呀！', ...]}
```

考点是把[函数篇](/post/python-functions-in-depth/)的 `*args` 和容器篇的 `join` 拼进类里：`*messages` 把调用时传的任意条消息收集成元组，`list(messages)` 转成列表存起来——转成列表是为了后面能 `append`（元组不可变，直接存元组后面就没法加了）。`__str__` 里 `len()` 取条数、`' | '.join()` 拼消息，这正是大模型 `messages` 对话列表的雏形：每轮对话往列表里追加一条，上下文越聊越长。

两个小提醒：`__str__` 里那种「f-string 内层再嵌同类引号」的写法（`f'...{' | '.join(...)}'`）需要 Python 3.12+，旧版本会直接语法报错，稳妥起见像上面这样外层用双引号；另外 f-string 花括号里想输出字面 `{`，要写成 `{{`。

## 9. 课后练习

1. 给第 3 节的 `ShoppingCart` 补一个 `total_value()` 方法，遍历 `goods_list` 返回所有商品的「价格 × 数量」总和；再加一个类属性 `currency = "CNY"`，让 `query_goods` 的表头显示货币单位（练类属性 + 遍历对象列表）；
2. 定义 `Agent` 类：`__init__` 接收 `name、model、score`，实例方法 `info()` 打印「名字（模型）当前能力分：分数」，`boost(delta)` 把 score 加上 delta 并返回新分数（课堂原题变体：再给 Agent 加一个类属性 `species = "LLM Agent"`）；
3. 写一个 `read_int(prompt: str) -> int`：循环用 `input` 收输入，用 try/except 接住 `ValueError`，输入不合法就提示重输，合法就返回整数（练异常 + while）；
4. 给第 2 节的教务系统补全 `update_student` 和 `delete_student`：按姓名找到学生再操作，找不到给出提示（练「对象的列表」的查找与删除）；
5. 综合题：写 `calc_bill(*records, discount=0.0, points=0, express=0.0) -> float`——records 是若干条 `(模型名, 单价, 调用次数)` 三元组，总额 = 单价 × 次数之和；满 100 才能减优惠和积分（100 积分抵 1 元、整百抵扣），最后加手续费返回实付金额。用 `calc_bill(('GPT', 0.5, 100), ('Claude', 2.0, 30), discount=10.0, points=300, express=5.0)` 验证，正确结果是 `原始金额：110.00`、实付 `102.0`（练 *args + 关键字参数 + 推导式，参考答案在课堂代码里）。

## 10. 学习检查表

读完这篇，你应该能清楚回答：

1. 实例属性和类属性分别写在哪里？谁读谁改？
2. `c1.wheel = 6` 做了什么？之后 `Car.wheel = 5`，`c1.wheel` 是几、`c2.wheel` 是几？
3. 教务系统的 `student_list` 里装的是什么？`print(stu)` 打印的内容由谁决定？
4. 购物车案例为什么拆成 `Goods`、`ShoppingCart`、`CartSystem` 三个类？`__find_by_name` 的双下划线表示什么？
5. `except` 分支的匹配顺序有什么讲究？`Exception` 兜底分支为什么必须放最后？
6. 异常在 `f3` 抛出、`f1` 被捕获，中间发生了什么？「谁能处理谁接」是什么意思？

Python 基础系列到这里正式收官：变量、容器、循环、函数、模块、对象、异常七块拼图集齐了。下一篇 [Transformer 与注意力机制](/post/transformer-attention-basics/) 回到 AI 主线——从那一篇起，你学的不再是语法，而是大模型本身的工作原理。
