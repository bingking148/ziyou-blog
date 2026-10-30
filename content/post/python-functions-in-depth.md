---
title: 'Python 第 6 篇：函数详解，写一个成绩分析工具箱'
weight: 6
date: 2026-10-24T10:00:00+08:00
lastmod: 2026-10-30T10:00:00+08:00
cover: /images/covers/python-functions-in-depth-cover.jpg
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '函数', '递归']
description: '把函数讲到能放心用的程度：参数的五种形态与默认参数陷阱、全局与局部变量、return 与 print 的本质区别、递归，最后组装成一个成绩分析工具箱。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇的记账本已经能用了，但它有个隐患：所有功能都堆在 `main` 旁边，靠 `input` 串起来。想改「金额怎么校验」，得在 300 行里找那一段；想复用「按分类统计」，只能复制粘贴。

第 3 篇你已经学过 `def`、`return`、默认参数了。这一篇讲的是**把函数真正用对**——那些「能跑但会埋雷」的地方：

- 参数为什么有五种写法，什么时候用哪种；
- 为什么 `side = []` 写在默认参数里会导致所有调用共用同一个列表（这个坑坑过所有人）；
- `print` 和 `return` 到底差在哪；
- 变量在函数里改了，外面为什么没变；
- 递归是什么，什么时候该用。

## 1. 目标：成绩分析工具箱

需求：录入一个班的成绩，能算平均分、找最高分、按等级分组、找出低于平均分的人。

但这次**不是写一个程序，是造一套工具箱**——每个功能一个函数，各自独立，能单独测试、单独复用。

```python
scores = [("张三", 92), ("李四", 78), ("王五", 55), ("赵六", 88)]

print(average(scores))            # 78.25
print(highest(scores))            # ('张三', 92)
print(group_by_level(scores))     # {'优秀': [...], '及格': [...]}
print(below_average(scores))      # [('李四', 78), ('王五', 55), ...]
```

为什么值得这样拆？因为下一个项目（聊天机器人）里，「按阈值分组」这个逻辑还会再用一次。**函数写好了，下次直接 import。**

## 2. 先把函数的结构看全

第 3 篇只讲了最小形态，完整的长这样：

```python
def average(scores: list[tuple[str, int]], precision: int = 2) -> float:
    """计算平均分。

    :param scores: 成绩列表，每项是 (姓名, 分数)
    :param precision: 保留几位小数，默认 2
    :return: 平均分
    """
    if not scores:
        return 0.0
    total = sum(s for _, s in scores)
    return round(total / len(scores), precision)
```

逐个部件：

| 部分 | 例子 | 作用 |
|---|---|---|
| `def` | 固定关键字 | 声明「这里是函数」 |
| 函数名 | `average` | 动词或名词，小写下划线 |
| 参数 | `scores, precision=2` | 外部传进来的数据入口 |
| `: list[...]` | 类型标注 | 给人看，也给编辑器看 |
| `-> float` | 返回类型标注 | 同上 |
| `"""..."""` | 文档字符串 | `help(average)` 时显示 |

### 2.1 类型标注是注释，不是强制

```python
def add(a: int, b: int) -> int:
    return a + b

print(add("你", "好"))     # 你好，不报错
```

Python **不会**因为你写了 `: int` 就阻止传字符串。标注的作用是：

1. 让读代码的人一眼知道该传什么；
2. VS Code 能据此给出补全和错误提示；
3. 配合 mypy 这类工具可以做静态检查。

写着不亏，养成习惯。

### 2.2 文档字符串

```python
def average(scores):
    """计算平均分。空列表返回 0.0。"""
    ...

help(average)     # 会显示这段说明
```

三引号包起来、写在函数体第一行。VS Code 里输入 `"""` 回车会自动生成模板。这不是形式主义——三个月后的你就是最需要它的人。

## 3. return 与 print：新手第一大混淆

这个必须彻底讲清楚，因为它决定了你能不能写出「可组合」的函数。

```python
def add_print(a, b):
    print(a + b)

def add_return(a, b):
    return a + b
```

区别：

```python
x = add_print(3, 5)      # 屏幕输出 8，但 x 是 None
y = add_return(3, 5)     # 屏幕没输出，但 y 是 8

print(x)                 # None
print(y + 10)            # 18
print(x + 10)            # TypeError: unsupported operand type(s) for +: 'NoneType' and 'int'
```

**核心一句**：`return` 是把结果**交回去**，`print` 是显示给人看。交回去的值能被继续使用，显示出来的东西只能被人眼看到。

### 3.1 什么时候用哪个

- **计算类函数**：用 `return`，让调用方决定怎么用；
- **展示类函数**：用 `print`，比如「打印菜单」；
- **不要混**：一个函数既 `print` 结果又 `return` 结果，通常是设计有问题。

```python
# 好：算和显示分开
def total(scores):
    return sum(s for _, s in scores)

def show_total(scores):
    print(f"总分：{total(scores)}")
```

这样 `total()` 可以被 `show_total` 用，也可以被别的计算用，还能单独测试。

### 3.2 没有 return 的函数返回 None

```python
def greet(name):
    print(f"你好，{name}")

r = greet("小明")     # 你好，小明
print(r)              # None
```

**Python 里所有函数都有返回值，没写 `return` 就等于 `return None`。** 没有例外。

## 4. 参数的五种形态

这是本篇最干的部分，但值得。看懂这五种，AI 框架的源码你就能读个大概了。

### 4.1 位置参数：按顺序对应

```python
def register(name, age, city):
    return {"name": name, "age": age, "city": city}

register("张三", 18, "北京")
```

最基础，也最容易出错：顺序错了不报错，只是数据错了。

```python
register("北京", "张三", 18)     # 不报错，但数据全乱了
```

### 4.2 关键字参数：按名字对应

```python
register(city="北京", name="张三", age=18)    # 顺序随便
```

读代码时一眼就知道每个值是什么。**参数超过 3 个，就该用关键字调用。**

混用规则：**位置参数在前，关键字参数在后。**

```python
register("张三", age=18, city="北京")     # ✓
register(name="张三", 18, "北京")          # ✗ SyntaxError
```

### 4.3 默认参数：不传就用默认值

```python
def register(name, age, city="北京", gender="未知"):
    ...

register("张三", 18)                        # city、gender 用默认
register("李四", 20, city="上海")            # 只改 city
register("王五", 22, "广州", "男")           # 全传
```

规则：**有默认值的参数必须放在没默认值的后面。**

```python
def f(a=1, b):      # ✗ SyntaxError: non-default argument follows default argument
    ...
```

为什么？因为调用 `f(10)` 时，Python 不知道该把 10 给 a 还是 b。

### 4.4 默认参数的大坑：可变对象

这个坑必须单独讲，因为它**不报错，只是静默地给出错误结果**，极难排查。

```python
def add_item(item, basket=[]):      # 危险！
    basket.append(item)
    return basket

print(add_item("苹果"))     # ['苹果']
print(add_item("香蕉"))     # ['苹果', '香蕉']   ← 苹果还在！
print(add_item("橘子"))     # ['苹果', '香蕉', '橘子']
```

**为什么？** 因为默认值 `[]` 只在**函数定义时创建一次**，之后每次调用都共用这一个列表。

正确写法：用 `None` 当哨兵。

```python
def add_item(item, basket=None):
    if basket is None:
        basket = []          # 每次调用都新建
    basket.append(item)
    return basket

print(add_item("苹果"))     # ['苹果']
print(add_item("香蕉"))     # ['香蕉']  ← 干净了
```

> [!WARNING]
> **默认参数永远不要写 `[]`、`{}`、`set()` 这类可变对象。** 用 `None` 代替，进函数再创建。
>
> 这条规则没有例外，记住就行。你以后读别人的代码，看到 `def f(x=[])` 就知道那里有 bug。

### 4.5 *args：接收任意个位置参数

```python
def total(*args):
    print(args)              # 元组
    return sum(args)

print(total(1, 2, 3))        # (1, 2, 3) → 6
print(total(1, 2, 3, 4, 5))  # 15
```

`args` 收到的是一个**元组**。名字叫 `args` 是惯例，叫别的也行，但大家都用 `args`。

### 4.6 **kwargs：接收任意个关键字参数

```python
def create_model(**kwargs):
    print(kwargs)            # 字典
    for k, v in kwargs.items():
        print(f"{k} = {v}")

create_model(model="deepseek-chat", temperature=0.7, max_tokens=1000)
# {'model': 'deepseek-chat', 'temperature': 0.7, 'max_tokens': 1000}
```

`kwargs` 收到的是一个**字典**。

### 4.7 五种形态的组合顺序

```python
def f(a, b=2, *args, **kwargs):
    ...
```

顺序固定：**位置参数 → 默认参数 → `*args` → `**kwargs`**。

> [!TIP]
> 你天天见的这行代码，现在能读懂了：
>
> ```python
> client.chat.completions.create(model="deepseek-chat", messages=[...], temperature=0.7)
> ```
>
> 这个方法的定义大致是 `def create(self, *, model, messages, temperature=1.0, **kwargs)`。`model` 和 `messages` 是你必须传的关键字参数，`temperature` 有默认值，其余任何模型参数都能通过 `**kwargs` 透传——所以各家大模型的接口才能共用一个客户端。

### 4.8 一个特殊符号：`*` 强制关键字

```python
def create(*, model, messages, temperature=1.0):
    ...

create(model="x", messages=[])        # ✓
create("x", [])                       # ✗ TypeError，必须是关键字
```

`*` 后面的参数**只能**用关键字传。API 设计者用它来防止你传错位置。看到 `def f(self, *, a, b)` 别懵，就是这个意思。

## 5. 作用域：变量住在哪

```python
x = 10                  # 全局变量

def show():
    x = 20              # 局部变量，和外面的 x 没关系
    print(x)            # 20

show()
print(x)                # 10  ← 没变
```

**函数内部创建的变量，出了函数就消失。** 这叫局部变量。函数外部的叫全局变量。

### 5.1 函数能读全局，不能改

```python
count = 0

def increment():
    count = count + 1     # ✗ UnboundLocalError

increment()
```

报错是因为：函数里一旦出现 `count = ...`，Python 就认为 `count` 是局部变量；但右边又用了 `count`，此时它还没被赋值。

想改全局变量，得显式声明：

```python
count = 0

def increment():
    global count
    count += 1

increment()
print(count)      # 1
```

> [!IMPORTANT]
> **`global` 能不用就不用。** 它让函数的输入输出变得不可预测——你调用一个函数，不知道它还偷偷改了哪些全局状态。第 9 篇讲面向对象时你会看到，更好的办法是把状态放进对象里。
>
> 什么时候真需要？模块级的计数器、配置开关。其余情况，用参数传进去、用 `return` 传出来。

### 5.2 一个容易误解的情况：修改可变对象

```python
def add_score(scores):
    scores.append(100)      # 没有赋值，所以不是重新绑定

my_scores = [60, 70]
add_score(my_scores)
print(my_scores)            # [60, 70, 100]  ← 变了！
```

区别在哪？

- **重新赋值**（`scores = [...]`）只改局部名字，外面不受影响；
- **原地修改**（`scores.append(...)`、`scores[0] = ...`）改的是同一个对象，外面看得见。

这不是 bug，是 Python 的引用语义。**如果不想让函数改到调用方的数据，就在函数里先 `copy()` 一份。**

## 6. 递归：函数调用自己

递归就是函数在自己内部调用自己。听起来危险，但在处理「结构嵌套」的数据时非常自然。

### 6.1 阶乘：经典的第一个例子

```python
def factorial(n):
    if n == 1:              # ① 出口：什么时候停
        return 1
    return n * factorial(n - 1)   # ② 递推：把问题变小

print(factorial(5))         # 120 = 5×4×3×2×1
```

执行过程：

```text
factorial(5)
= 5 * factorial(4)
= 5 * 4 * factorial(3)
= 5 * 4 * 3 * factorial(2)
= 5 * 4 * 3 * 2 * factorial(1)
= 5 * 4 * 3 * 2 * 1
= 120
```

**递归必须有两部分**：出口（否则无限调用直到 `RecursionError`）和递推（每次让问题规模变小）。

```python
def bad(n):
    return bad(n - 1)       # 没有出口 → RecursionError: maximum recursion depth exceeded
```

### 6.2 递归真正的用武之地

阶乘用循环更简单（`math.factorial` 也行），递归的价值在**处理天然嵌套的结构**。

比如遍历一个嵌套的目录树：

```python
def count_files(tree):
    """统计嵌套目录里一共多少个文件"""
    count = 0
    for node in tree:
        if isinstance(node, list):      # 是子目录，递归进去
            count += count_files(node)
        else:                            # 是文件，直接数
            count += 1
    return count

data = ["a.txt", ["b.txt", ["c.txt", "d.txt"]], "e.txt"]
print(count_files(data))     # 5
```

用循环写这个会非常别扭（需要自己维护栈），递归则几乎是把「怎么数」直接翻译成代码。

### 6.3 递归的代价

- 每次调用都占一层栈，Python 默认上限约 1000 层，超了报 `RecursionError`；
- 比循环慢。

所以：**能用循环就用循环，数据结构天然嵌套时才用递归。**

## 7. 组装：成绩分析工具箱

现在把一切用上。

```python
# ============ 基础计算 ============

def average(scores: list[tuple[str, int]]) -> float:
    """平均分，空列表返回 0.0"""
    if not scores:
        return 0.0
    return sum(s for _, s in scores) / len(scores)


def highest(scores: list[tuple[str, int]]) -> tuple[str, int] | None:
    """最高分的人和分数，空列表返回 None"""
    if not scores:
        return None
    return max(scores, key=lambda item: item[1])


def lowest(scores):
    if not scores:
        return None
    return min(scores, key=lambda item: item[1])


# ============ 分组与筛选 ============

def level_of(score: int) -> str:
    """单科分数 → 等级"""
    if score >= 90:
        return "优秀"
    elif score >= 75:
        return "良好"
    elif score >= 60:
        return "及格"
    return "不及格"


def group_by_level(scores, levels=("优秀", "良好", "及格", "不及格")):
    """按等级分组，返回字典，每组是一个列表"""
    groups = {lv: [] for lv in levels}
    for name, s in scores:
        groups[level_of(s)].append((name, s))
    return groups


def below_average(scores):
    """分数低于平均分的人"""
    if not scores:
        return []
    avg = average(scores)
    return [(n, s) for n, s in scores if s < avg]


# ============ 展示 ============

def report(scores):
    """打印完整报告"""
    if not scores:
        print("没有成绩数据。")
        return

    print(f"\n===== 成绩报告（{len(scores)} 人）=====")
    print(f"平均分：{average(scores):.2f}")
    print(f"最高分：{highest(scores)[0]} {highest(scores)[1]}")
    print(f"最低分：{lowest(scores)[0]} {lowest(scores)[1]}")

    print("\n等级分布：")
    for level, people in group_by_level(scores).items():
        if people:
            names = "、".join(n for n, _ in people)
            print(f"  {level}（{len(people)} 人）：{names}")

    low = below_average(scores)
    if low:
        print(f"\n低于平均分（{average(scores):.2f}）的同学：")
        for n, s in low:
            print(f"  {n} {s}")


if __name__ == "__main__":
    data = [("张三", 92), ("李四", 78), ("王五", 55), ("赵六", 88)]
    report(data)
```

输出：

```text
===== 成绩报告（4 人）=====
平均分：78.25
最高分：张三 92
最低分：王五 55

等级分布：
  优秀（1 人）：张三
  良好（2 人）：李四、赵六
  不及格（1 人）：王五

低于平均分（78.25）的同学：
  李四 78
  王五 55
```

### 7.1 这段代码里的四个设计决策

**第一，每个函数只做一件事。**

`average` 只算平均分，不管怎么显示。`report` 只负责显示，计算全交给别的函数。所以你想在别处用平均分，直接 `average(data)` 就行。

**第二，空列表的处理放在每个函数内部。**

`average([])` 返回 `0.0` 而不是崩溃，`highest([])` 返回 `None`。这叫**防御性编程**——函数要能扛住边界情况。

**第三，`s for _, s in scores` 里的下划线。**

```python
sum(s for _, s in scores)
```

`scores` 每项是 `(姓名, 分数)`，我们只关心分数。`_` 表示「这个值我不要」，是 Python 的惯例。写成 `name, s` 也行，但 `_` 更清楚地表达了意图。

**第四，`group_by_level` 的默认参数用了元组。**

```python
def group_by_level(scores, levels=("优秀", "良好", "及格", "不及格")):
```

用的是 `()` 不是 `[]`——因为**元组不可变**，不会被 4.4 节那个坑坑到。这是「默认参数不能是可变的」这条规则的正解之一：需要固定序列时用元组。

### 7.2 加一个功能试试

需求：算出每个等级的**人数占比**，并且支持自定义及格线（比如 60 分改成 70 分）。

提示：
- 占比 = 该等级人数 / 总人数，用 f-string 的 `:.0%`；
- 及格线通过参数传进 `level_of`：`def level_of(score, pass_line=60)`；
- 然后 `group_by_level` 也要把这个参数往下传。

改完你会发现一件事：**参数要一层层往下传**。这是函数式编程的一个痛点，第 8 篇的面向对象会给出另一种解法。

## 8. 常见坑清单

1. **`print` 当 `return` 用**——调用方拿到 `None`；
2. **默认参数写 `[]` 或 `{}`**——所有调用共用同一个对象；
3. **函数里改了全局变量却没声明 `global`**——`UnboundLocalError`；
4. **以为函数改了列表调用方看不到**——`append` 是原地修改，外面看得见；
5. **参数顺序传错**——不报错，数据错位；
6. **默认参数放在普通参数前面**——`SyntaxError`；
7. **递归忘了出口**——`RecursionError`；
8. **函数太长**——超过一屏就该拆了。

## 9. 课后小项目

**练习一：万能统计函数（必做）**

```python
def stats(numbers, precision=2):
    """返回 (个数, 总和, 平均, 最大, 最小)，空列表返回全 0"""
```

要求处理空列表、要求用 `return` 返回元组、要求写文档字符串。

**练习二：安全的除法**

```python
def safe_divide(a, b, default=0.0):
```

`b` 是 0 时返回 `default` 而不是崩溃。**不许用 try/except**（那是第 9 篇的内容），用 `if` 判断。

**练习三：给工具箱加递归功能**

写 `flatten(nested)`，把一个任意深度的嵌套列表压平成一维：

```python
flatten([1, [2, [3, 4]], 5])     # [1, 2, 3, 4, 5]
```

提示：遍历每个元素，是列表就递归调用自己并用 `extend` 接上，不是就直接 `append`。

**练习四（挑战）：自己实现 `max`**

不用内置 `max`，用循环写一个 `my_max(items, key=None)`，行为和内置的一致。这个练习会逼你真正理解「key 参数到底在干什么」。

## 10. 本篇小结

1. **`return` 交回值，`print` 只显示**——计算函数一律用 `return`；
2. **参数五种形态**：位置、关键字、默认、`*args`、`**kwargs`，顺序固定；
3. **默认参数绝不用可变对象**——用 `None` 当哨兵；
4. **函数内赋值是局部变量**，读全局可以，改要 `global`（但尽量别用）；
5. **原地修改 vs 重新赋值**——`append` 会改到外面，`=` 不会；
6. **递归 = 出口 + 递推**，适合处理嵌套结构，能用循环就别用；
7. **一个函数只做一件事**，这条比其余六条加起来都重要。

下一篇 [第 7 篇：lambda 与模块](/post/python-lambda-modules/) 会把代码组织起来——函数当成参数传、用 `lambda` 写一行小函数，再把工具箱拆成多个文件，让别人也能 `import` 你的代码。
