---
title: 'Python 第 5 篇：五类数据容器，写一个记账本'
weight: 5
date: 2026-10-20T09:30:00+08:00
lastmod: 2026-10-30T10:00:00+08:00
cover: /images/covers/python-data-containers-cover.jpg
categories: ['人工智能', 'Python基础']
tags: ['Python', '数据容器', '列表', '字典', '入门教程']
description: '列表、字符串、元组、集合、字典该怎么选？用做一个记账本的方式，在真实需求里依次引入五类容器，附切片、推导式、嵌套字典与选择决策表。'
math: false
mermaid: false
comments: true
toc: true
---

前面三篇，我们的程序一次只能处理**一个**东西：算一个人的 BMI、猜一个数字、打一局游戏。

真实世界不是这样的。一个记账本要记几十笔账，一个聊天机器人要记住几十轮对话，一个 AI 应用要处理几百个文档切片。**一次处理一批数据**，是程序从"玩具"变成"工具"的分水岭。

Python 给了五种装数据的盒子，这一篇全讲完。但我不打算按「列表 → 字符串 → 元组」的顺序念一遍手册——那样你读完记不住。我们**先定一个项目，缺什么补什么**。

## 1. 目标：一个记账本

需求很简单：记下每一笔花销，能看总额、能分类统计、能查最大的一笔。

```text
===== 我的记账本 =====
1. 记一笔
2. 查看所有
3. 分类统计
4. 查看最大的一笔
5. 退出
请选择：
```

要做出来，需要五样东西：

| 需求 | 需要的容器 | 为什么 |
|---|---|---|
| 存一笔笔账（数量不定） | **列表** | 有序、能追加 |
| 每笔账的金额、分类、备注 | **字典** | 用名字取值，不用记位置 |
| 分类名不能重复 | **集合** | 自动去重 |
| 一笔账一旦记下不该被改 | **元组** | 不可变 |
| 显示金额、备注文字 | **字符串** | 文本处理 |

看着挺多，其实逐个引入就行。

## 2. 列表：为什么需要它

先看没有列表的世界。记三笔账：

```python
amount1 = 35.5
amount2 = 128.0
amount3 = 9.9

total = amount1 + amount2 + amount3
```

三笔还行。三十笔呢？三百笔呢？而且「求最大的一笔」「按分类统计」这类需求，散装变量根本没法做。

**列表（list）把一堆数据装进一个整体**：

```python
amounts = [35.5, 128.0, 9.9, 20.0, 66.6]
```

方括号，逗号分隔。就这么简单。

### 2.1 索引：按位置取

```python
amounts = [35.5, 128.0, 9.9, 20.0, 66.6]

print(amounts[0])     # 35.5    ← 第一个是 0，不是 1
print(amounts[1])     # 128.0
print(amounts[-1])    # 66.6    ← 倒数第一个
print(amounts[-2])    # 20.0    ← 倒数第二个
```

**为什么从 0 开始？** 因为索引表示的是"偏移量"——第一个元素从头往后走 0 步。不习惯是正常的，写两天就顺了。

负数索引是 Python 的贴心设计：`-1` 永远是最后一个，不用管列表多长。

越界会报错：

```python
amounts[10]      # IndexError: list index out of range
```

### 2.2 切片：一次取一段

```python
nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

print(nums[2:5])      # [2, 3, 4]      从 2 到 5，不含 5
print(nums[:3])       # [0, 1, 2]      从头开始，可省略
print(nums[7:])       # [7, 8, 9]      到末尾，可省略
print(nums[::2])      # [0, 2, 4, 6, 8]  隔一个取一个
print(nums[::-1])     # [9, 8, 7, ...]   倒序，超实用
```

规则和 `range` 一模一样：**左闭右开**。`nums[2:5]` 取的是索引 2、3、4。

> [!TIP]
> `nums[::-1]` 是反转列表最快的方法，比 `reverse()` 还常用——因为它**不修改原列表**，而是返回一个新的。

### 2.3 增删改

```python
cart = ["苹果", "香蕉"]

cart.append("橘子")        # 末尾追加 → ['苹果', '香蕉', '橘子']
cart.insert(0, "西瓜")     # 插到最前面 → ['西瓜', '苹果', '香蕉', '橘子']
cart.remove("香蕉")        # 删掉第一个匹配的值
last = cart.pop()          # 删除并返回最后一个 → '橘子'

cart[0] = "哈密瓜"          # 直接赋值修改
print(cart)                # ['哈密瓜', '苹果']
```

最常用的是 `append`——记账本每记一笔就 `append` 一次。

**一个高频陷阱**：`append` 和 `extend` 的区别。

```python
a = [1, 2]
a.append([3, 4])
print(a)          # [1, 2, [3, 4]]   ← 整个列表成了一个元素

b = [1, 2]
b.extend([3, 4])
print(b)          # [1, 2, 3, 4]     ← 拆开逐个加
```

记法：`append` 是「放进去一个东西」，`extend` 是「倒出来一堆东西」。

### 2.4 排序与统计

```python
amounts = [35.5, 128.0, 9.9, 20.0, 66.6]

print(sum(amounts))       # 260.0
print(max(amounts))       # 128.0
print(min(amounts))       # 9.9
print(len(amounts))       # 5

amounts.sort()                              # 原地升序，会改原列表
print(amounts)                              # [9.9, 20.0, 35.5, 66.6, 128.0]

print(sorted(amounts, reverse=True))        # 返回新列表，降序
```

**`sort()` 改自己，`sorted()` 返回新的**。这个区别很重要，别搞混。

### 2.5 遍历

```python
for amount in amounts:
    print(f"花了 {amount} 元")
```

需要同时拿到索引？用 `enumerate`：

```python
for i, amount in enumerate(amounts, start=1):
    print(f"第 {i} 笔：{amount} 元")
```

别写成 `for i in range(len(amounts))` 再去 `amounts[i]`——能跑，但不是 Python 的写法。

> [!WARNING]
> **不要边遍历边删元素。**
>
> ```python
> nums = [1, 2, 3, 4]
> for n in nums:
>     if n % 2 == 0:
>         nums.remove(n)    # 会漏删！
> ```
>
> 删掉一个元素后，后面的元素全部前移，遍历索引就对不上了。正确做法是**生成一个新列表**：
>
> ```python
> nums = [n for n in nums if n % 2 != 0]    # [1, 3]
> ```

### 2.6 列表推导式：一行生成列表

这是 Python 最受欢迎的特性之一，看到 `[表达式 for 变量 in 序列]` 就是它。

```python
# 普通写法
squares = []
for n in range(1, 6):
    squares.append(n ** 2)

# 推导式
squares = [n ** 2 for n in range(1, 6)]
print(squares)          # [1, 4, 9, 16, 25]
```

带筛选：

```python
amounts = [35.5, 128.0, 9.9, 20.0, 66.6]

big = [a for a in amounts if a > 30]
print(big)              # [35.5, 128.0, 66.6]
```

怎么读：**「收集 `a`，对每个 `amounts` 里的 `a`，但只收大于 30 的」**。从后往前读，最顺。

> [!NOTE]
> 推导式不是越用越好。如果逻辑超过一个 `if`，或者里面还要再套循环，就用普通 `for`——可读性比短更重要。

## 3. 字符串：不可变的字符序列

记账本里每一笔都有备注："午饭"、"打车"、"买书"。这些都是字符串。

字符串你已经在用了，这里补三个必须掌握的点。

### 3.1 字符串不可变

```python
s = "hello"
s[0] = "H"          # TypeError！字符串不能改
```

想改只能**造一个新的**：

```python
s = "h" + s[1:]     # "hello" → 得到 "hello" 没变，因为 h 本来就是 h
s = s.upper()       # "HELLO"，这是新字符串
```

`upper()`、`strip()`、`replace()` 这些方法**全部返回新字符串，原字符串一个字都不动**。这是新手最容易误解的一点：

```python
name = "  张三  "
name.strip()             # 这行什么效果都没有！
print(name)              # "  张三  "  ← 还是带空格

name = name.strip()      # 必须重新赋值
print(name)              # "张三"
```

> [!WARNING]
> **字符串方法几乎都不改变原字符串，必须接收返回值。** 和列表的 `append`、`sort` 正好相反——那两个是原地修改。这是 Python 里最不一致的一处设计，只能记。

### 3.2 最常用的六个方法

```python
s = "  Hello, Python World  "

s.strip()                  # 'Hello, Python World'   去两端空白
s.lower()                  # 全小写
s.upper()                  # 全大写
s.replace("World", "AI")   # 替换
s.split(",")               # 按逗号切成列表 ['  Hello', ' Python World  ']
",".join(["a", "b"])       # 用逗号拼起来 → 'a,b'
```

`split()` 和 `join()` 是一对，处理文本时天天用：

```python
line = "午饭,35.5,餐饮"
parts = line.split(",")
print(parts)              # ['午饭', '35.5', '餐饮']
print(parts[1])           # '35.5'  ← 注意是字符串，要用 float() 转
```

### 3.3 f-string 复习

```python
name = "午饭"
amount = 35.5
print(f"{name}：{amount:.2f} 元")     # 午饭：35.50 元
print(f"{name:>10}")                  # 右对齐占 10 格
print(f"{amount:.0%}")                # 转百分比
```

对齐在打印表格时特别好用，记账本的账单列表就靠它。

## 4. 元组：不想被改的列表

```python
point = (3, 5)
rgb = (255, 128, 0)
```

元组（tuple）和列表几乎一样，只有一个区别：**创建后不能修改**。

```python
t = (1, 2, 3)
t[0] = 99          # TypeError: 'tuple' object does not support item assignment
```

那你可能会问：既然不能改，要它干嘛？

### 4.1 三个真实用途

**用途一：表示"一个整体不能被拆散"的数据。**

坐标 `(3, 5)`、RGB 颜色 `(255, 128, 0)`、一年的月份——这些东西改了就没意义了。用元组是在**用类型表达意图**：告诉读代码的人「这个不该变」。

**用途二：函数返回多个值。**

```python
def min_max(nums):
    return min(nums), max(nums)

low, high = min_max([3, 8, 1, 9])
print(low, high)      # 1 9
```

`return min(nums), max(nums)` 其实是返回了一个元组 `(1, 9)`，左边用两个变量接住，这叫**解包**。第 6 篇会细讲。

**用途三：可以作为字典的键。**

```python
locations = {
    (39.9, 116.4): "北京",
    (31.2, 121.5): "上海",
}
print(locations[(39.9, 116.4)])    # 北京
```

列表做不了键，因为列表可变——**字典的键必须是不可变类型**。这就是下面第 6 节要讲的字典规则。

### 4.2 单元素元组的坑

```python
t = (5)        # 这是整数 5，不是元组！
t = (5,)       # 这才是元组，逗号是关键
```

## 5. 集合：自动去重 + 集合运算

记账本里有个需求：**看看我都用过哪些分类**。可能有重复，比如"餐饮"记了八十次。

用列表也能做，但要自己写去重逻辑：

```python
categories = ["餐饮", "交通", "餐饮", "购物", "交通"]
unique = []
for c in categories:
    if c not in unique:      # 每次都要遍历一遍，很慢
        unique.append(c)
```

集合一行搞定：

```python
unique = set(categories)
print(unique)      # {'餐饮', '交通', '购物'}
```

### 5.1 集合的三个特点

1. **自动去重**——重复的元素只留一个；
2. **无序**——不能索引，不能切片，打印顺序不保证；
3. **元素必须不可变**——列表不能放进去。

```python
s = {1, 2, 2, 3, 3, 3}
print(s)            # {1, 2, 3}

s[0]                # TypeError: 'set' object is not subscriptable
```

### 5.2 集合运算：这才是它的主场

两个集合可以做交、并、差，这在「对比两组数据」时无敌好用：

```python
python_group = {"小明", "小红", "小刚", "小李"}
ai_group = {"小红", "小李", "小王"}

print(python_group & ai_group)    # 交集：两边都参加 {'小红', '小李'}
print(python_group | ai_group)    # 并集：所有人
print(python_group - ai_group)    # 差集：只参加 python 的 {'小明', '小刚'}
print(python_group ^ ai_group)    # 对称差：只参加一个的
```

运算符不好记？用方法名更直白：

```python
a.intersection(b)    # 交集
a.union(b)           # 并集
a.difference(b)      # 差集
```

> [!TIP]
> 集合运算在 AI 场景里特别常见：对比两个智能体各自有哪些工具、找出两个知识库检索结果的交集、统计用户的兴趣标签重合度。比写循环快得多，也清楚得多。

### 5.3 空集合的坑

```python
s = {}          # 这是空字典，不是空集合！
s = set()       # 这才是空集合
```

因为 `{}` 被字典占了，空集合必须用 `set()`。

## 6. 字典：整个 Python 最重要的容器

到这里，记账本还差最核心的一块。

列表存的是「一堆值」，但一笔账不是单个值——它有三部分：

```python
记录 = [35.5, "餐饮", "午饭"]
```

用列表存，取的时候得记住位置：`记录[1]` 是分类。位置一变全完蛋。

**字典（dict）用名字取值，不用记位置**：

```python
expense = {
    "amount": 35.5,
    "category": "餐饮",
    "note": "午饭",
}

print(expense["category"])    # 餐饮  ← 名字一看就懂
```

这就是字典。**键值对（key-value）**，键是名字，值是内容。

### 6.1 增删改查

```python
expense = {"amount": 35.5, "category": "餐饮"}

expense["note"] = "午饭"         # 键不存在 → 新增
expense["amount"] = 40.0        # 键存在 → 修改
del expense["note"]             # 删除
note = expense.pop("note", "")  # 删除并返回（带默认值更安全）
```

访问时的一个关键区别：

```python
expense["note"]                 # 键不存在 → KeyError，程序崩
expense.get("note")             # 键不存在 → None，不崩
expense.get("note", "无备注")    # 键不存在 → "无备注"
```

> [!IMPORTANT]
> **不确定键一定存在时，永远用 `.get()`。** 这是 Python 里最常见的崩溃原因之一。记账本读用户输入的分类、读 API 返回的字段，都该用 `.get()`。

### 6.2 遍历字典

```python
expense = {"amount": 35.5, "category": "餐饮", "note": "午饭"}

for key in expense:                  # 遍历键
    print(key)

for value in expense.values():       # 遍历值
    print(value)

for key, value in expense.items():   # 同时遍历键和值 ← 最常用
    print(f"{key}: {value}")
```

### 6.3 字典的键有什么限制

- **必须唯一**——同一个键后面赋值会覆盖前面；
- **必须是不可变类型**——字符串、数字、元组可以，列表不行；
- 值可以是任何东西，包括另一个字典。

第三条很重要，因为它引出了下面这个。

### 6.4 嵌套：真实数据都长这样

真实世界的 JSON、API 响应、配置文件，全是嵌套字典。比如一本完整的账：

```python
expenses = [
    {"amount": 35.5, "category": "餐饮", "note": "午饭"},
    {"amount": 12.0, "category": "交通", "note": "地铁"},
    {"amount": 128.0, "category": "购物", "note": "书"},
]
```

**列表套字典**——这是 Python 里最经典的数据结构，没有之一。一行一笔账。

取值要一层层剥：

```python
print(expenses[0])                    # 第一笔账（整个字典）
print(expenses[0]["note"])            # 第一笔账的备注 → '午饭'
print(expenses[-1]["amount"])         # 最后一笔的金额 → 128.0
```

遍历统计：

```python
total = 0
for e in expenses:
    total += e["amount"]
print(f"共花了 {total:.2f} 元")       # 共花了 175.50 元
```

按分类汇总（这是记账本的核心功能）：

```python
by_category = {}

for e in expenses:
    cat = e["category"]
    by_category[cat] = by_category.get(cat, 0) + e["amount"]

print(by_category)    # {'餐饮': 35.5, '交通': 12.0, '购物': 128.0}
```

这一行 `by_category.get(cat, 0) + e["amount"]` 是精髓：

- 如果 `cat` 已经在字典里，取出旧值加上这笔；
- 如果还没有，`get` 返回 `0`，再加上这笔。

**没有这一招，你就得写 if-else 判断键存不存在。** 值得停下来多看两眼。

> [!TIP]
> 这个「用字典做计数器/累加器」的模式，在统计词频、按用户汇总、按模型统计调用量时反复出现。记住它。

## 7. 五种容器怎么选

学完了，最后给一张决策表。遇到问题对着查：

| 你想做的事 | 用什么 | 理由 |
|---|---|---|
| 存一串有顺序的数据，还要增删 | **列表** | 有序、可变、能索引 |
| 用名字而不是位置取数据 | **字典** | 键值映射，O(1) 查找 |
| 数据不该被修改 | **元组** | 不可变，表意清晰 |
| 去重 / 求交并差 | **集合** | 自动去重 + 集合运算 |
| 处理文本 | **字符串** | （它不是容器，但用法类似） |

再补三条经验：

1. **不确定就用列表**，它最灵活；
2. **能用字典就别用两个平行列表**——`{"name": score}` 比 `names[] + scores[]` 安全一百倍，因为不用担心两个列表长度不一致；
3. **需要快速判断"在不在里面"，用集合**。`x in list` 要遍历整个列表，`x in set` 是瞬间完成。数据量大时差别巨大。

## 8. 组装：完整的记账本

```python
def add_expense(expenses):
    """记一笔账"""
    note = input("备注：").strip()
    if not note:
        note = "无备注"

    while True:
        raw = input("金额：").strip()
        try:
            amount = float(raw)
            if amount <= 0:
                print("金额必须大于 0")
                continue
            break
        except ValueError:
            print("请输入数字，例如 35.5")

    category = input("分类（餐饮/交通/购物/其他）：").strip() or "其他"

    expenses.append({"amount": amount, "category": category, "note": note})
    print(f"已记录：{note} {amount:.2f} 元")


def show_all(expenses):
    """列出全部账目"""
    if not expenses:
        print("还没有任何记录。")
        return

    print()
    for i, e in enumerate(expenses, start=1):
        print(f"{i:>2}. {e['amount']:>8.2f} 元  [{e['category']}]  {e['note']}")
    print("-" * 40)
    print(f"合计：{sum(e['amount'] for e in expenses):.2f} 元")


def show_by_category(expenses):
    """按分类统计"""
    if not expenses:
        print("还没有任何记录。")
        return

    stats = {}
    for e in expenses:
        cat = e["category"]
        stats[cat] = stats.get(cat, 0) + e["amount"]

    total = sum(stats.values())
    print("\n分类统计：")
    for cat, amount in sorted(stats.items(), key=lambda kv: kv[1], reverse=True):
        pct = amount / total
        bar = "█" * int(pct * 20)
        print(f"{amount:>8.2f} 元  {pct:>5.1%}  {bar}  {cat}")


def show_max(expenses):
    """查看最大的一笔"""
    if not expenses:
        print("还没有任何记录。")
        return
    biggest = max(expenses, key=lambda e: e["amount"])
    print(f"\n最大的一笔：{biggest['note']}  {biggest['amount']:.2f} 元（{biggest['category']}）")


def main():
    expenses = []
    actions = {
        "1": ("记一笔", add_expense),
        "2": ("查看所有", show_all),
        "3": ("分类统计", show_by_category),
        "4": ("最大的一笔", show_max),
    }

    while True:
        print("\n===== 我的记账本 =====")
        for key, (label, _) in actions.items():
            print(f"{key}. {label}")
        print("5. 退出")

        choice = input("请选择：").strip()

        if choice == "5":
            print("再见！")
            break

        if choice in actions:
            actions[choice][1](expenses)
        else:
            print("没有这个选项，请重新输入。")


if __name__ == "__main__":
    main()
```

### 8.1 三个值得注意的设计

**第一，用字典 `actions` 存菜单项。**

```python
actions = {"1": ("记一笔", add_expense), ...}
actions[choice][1](expenses)     # 取出函数并调用
```

**函数可以存进字典、可以作为值传递**——这是 Python 很重要的一点，第 7 篇讲高阶函数时会展开。好处是加新功能只要往字典里加一行，不用改 `if-elif` 长链。

**第二，`sum(e['amount'] for e in expenses)` 这种写法。**

括号里不是列表推导式，是**生成器表达式**——不创建中间列表，直接求和，更省内存。看到这种「函数套一个没有方括号的推导式」，知道是同一个意思就行。

**第三，`sorted(stats.items(), key=lambda kv: kv[1], reverse=True)`。**

`sorted` 的 `key` 参数指定「按什么排序」。`lambda kv: kv[1]` 表示「取每个键值对的第二个元素（金额）」来比较。lambda 是第 7 篇的内容，这里先照抄，看到能明白意图即可。

### 8.2 一个你一定会撞上的显示问题

`show_all` 的输出没有用 `f"{'分类':<6}"` 去对齐中文。

原因值得单独说：`:<6` 补的是「6 个字符」，但一个汉字在终端里占**两个**字符宽。所以「餐饮」（2 个字符、4 格宽）加上 `:<6` 会补 4 个空格，实际占 8 格；而「购物」也一样补 4 个空格——看起来好像对得上，但只要分类名长短不一（「餐饮」vs「其他开销」），整个表格就歪了。

```text
序号        金额  分类    备注        ← 表头：中文占双宽
1      35.50  餐饮    午饭            ← 数据：对不齐
```

新手做命令行表格时大多会遇上这个问题。三种解法：

1. **别用多列对齐**——就像上面改成一行一条记录，最省事；
2. **手动算宽度**（麻烦，不推荐入门阶段折腾）；
3. **用 `unicodedata.east_asian_width` 判断字符宽度**（需要时再查）。

> [!TIP]
> 如果你确实要做漂亮的终端表格，装个第三方库 `rich` 或 `tabulate`，它们内部处理了中文宽度。但那是后面的事，现在知道有这回事就够。

## 9. 常见坑

1. **字符串方法忘了赋值**——`s.strip()` 不会改 `s`；
2. **`append` 和 `extend` 搞混**——前者塞一个，后者摊开；
3. **`{}` 当成空集合**——它是空字典，空集合是 `set()`；
4. **字典用 `[]` 取不存在的键**——用 `.get()`；
5. **拿列表当字典的键**——列表可变，不能做键；
6. **边遍历边删列表**——改用列表推导式生成新的；
7. **`sort()` 和 `sorted()` 弄混**——前者改自己，后者给新的；
8. **单元素元组忘了逗号**——`(5)` 是整数，`(5,)` 才是元组。

## 10. 课后小项目

**练习一：单词计数器（必做）**

给一段英文，统计每个单词出现几次，按次数从多到少输出。

```python
text = "the quick brown fox jumps over the lazy dog the fox"
```

提示：`text.split()` 得到列表，然后套用 6.4 节的累加模式 `counts[w] = counts.get(w, 0) + 1`，最后 `sorted(counts.items(), key=lambda kv: kv[1], reverse=True)`。

**练习二：给记账本加两个功能**

1. **按分类筛选**：输入「餐饮」，只显示餐饮的账；
2. **删除某一笔**：显示列表，输入序号删除（注意 `pop` 的索引是 0 开始，而你显示的序号是 1 开始）。

**练习三：两本账合并**

两个人各自记了账，找出两人都记过的分类（交集）、只有一个人记过的分类（对称差）、所有出现过的分类（并集）。

提示：把分类列表转成 `set()`，用 `&`、`^`、`|`。

## 11. 本篇小结

1. **列表**有序可变，`append` 增、索引取、切片段、推导式生成；
2. **字符串不可变**，所有方法都返回新字符串，必须赋值；
3. **元组**不可变，适合表意「不该改」的数据，也是字典键的唯一选择；
4. **集合**自动去重，交并差运算做数据对比无敌；
5. **字典**按键取值，是 Python 最重要的容器，`.get()` 能防崩溃；
6. **列表套字典**是最常见的数据结构，一笔账一个字典；
7. **`d[k] = d.get(k, 0) + x`** 是累加/计数的万能模式。

下一篇 [第 6 篇：函数详解](/post/python-functions-in-depth/) 会把函数彻底讲完——参数的五种形态、全局与局部变量、递归，以及为什么你写的函数应该只做一件事。
