---
title: 'Python 数据容器：列表、字符串、元组、集合与字典'
weight: 4
date: 2026-10-20T09:30:00+08:00
lastmod: 2026-10-29T15:07:47+08:00
cover: /images/covers/python-data-containers-cover.jpg
categories: ['人工智能', 'Python基础']
tags: ['Python', '数据容器', '列表', '字典', '大模型']
description: '系统整理 Python 数据存储容器：列表、字符串、元组、集合、字典的定义、常用操作、差异对比和选择方法，并结合大模型消息、工具注册表和购物车系统练习。'
math: false
mermaid: false
comments: true
toc: true
---

学完 [Python 循环控制](/post/python-loop-control/) 后，你已经能让程序重复做事。但真实程序处理的不只是一个数字或一段文本，而是一批数据：10 个成绩、100 条日志、多轮对话、工具列表、文档切片、模型配置。这时候就需要**数据容器**。

Python 常用容器有五类：

- **字符串 `str`**：字符序列；
- **列表 `list`**：有序、可修改序列；
- **元组 `tuple`**：有序、不可修改序列；
- **集合 `set`**：无序、自动去重集合；
- **字典 `dict`**：键值对映射。

这篇文章会把五类容器放到同一个框架里理解，最后给出选择方法。

## 1. 为什么需要数据容器

先看一个直观例子。如果只使用普通变量，存储 5 个成绩要写 5 行：

```python
score1 = 695
score2 = 558
score3 = 622
score4 = 589
score5 = 645
```

数据量到 10 个、100 个时，这种写法会失控，也没办法方便地循环、排序、求平均。列表把多份数据放进一个整体：

```python
scores = [695, 558, 622, 589, 645]
```

容器里每一份数据叫**元素**。元素可以是数字、字符串、布尔值，也可以是另一个容器。

```python
mixed = ["AI", 42, True, {"model": "DeepSeek"}]
```

不过，实际开发中不建议随意混合太多类型。类型清晰，程序才容易维护。

## 2. 五类容器总览

| 容器 | 有序性 | 重复性 | 可变性 | 索引/切片 | 典型用途 |
|---|---|---|---|---|---|
| 字符串 `str` | 有序 | 字符可重复 | 不可变 | 支持 | 文本、提示词、模型回答 |
| 列表 `list` | 有序 | 允许重复 | 可变 | 支持 | 消息历史、任务队列、文档列表 |
| 元组 `tuple` | 有序 | 允许重复 | 不可变 | 支持 | 固定记录、函数多返回值 |
| 集合 `set` | 无序 | 不允许重复 | 可变 | 不支持 | 去重、交集、并集、差集 |
| 字典 `dict` | 插入有序 | key 不允许重复 | 可变 | 不支持数字索引 | 配置、JSON、工具注册表 |

这里的“有序”包含两层含义：

1. 元素有排列顺序；
2. 可以按位置访问。

Python 3.7+ 的字典会保持**插入顺序**，但它不是序列，不能通过 `d[0]` 取第一个键值对，要用 `d[key]` 访问。

## 3. 列表 list：最常用的有序容器

### 3.1 定义和索引

```python
scores = [54, 15, 75, 108, 23, 78, 75]

print(scores[0])    # 54
print(scores[-1])   # 75
```

列表支持不同类型元素：

```python
data = ["Alice", 18, True]
```

索引规则：

- 正向索引从 `0` 开始；
- 反向索引从 `-1` 开始；
- 索引越界会报错。

```python
print(scores[10])  # IndexError
```

### 3.2 查看、修改、删除

```python
data = ["A", "B", "C", "D"]

print(data[1])     # B
data[1] = "X"      # 修改
del data[2]        # 删除指定索引
print(data)        # ['A', 'X', 'D']
```

### 3.3 切片

序列切片语法是：

```python
序列[start:end:step]
```

`start` 默认为 0，`end` 默认到末尾，`step` 默认为 1。**end 位置取不到**。

```python
nums = [0, 1, 2, 3, 4, 5, 6]

print(nums[1:4])     # [1, 2, 3]
print(nums[:4])      # [0, 1, 2, 3]
print(nums[4:])      # [4, 5, 6]
print(nums[0:7:2])   # [0, 2, 4, 6]
print(nums[::-1])    # [6, 5, 4, 3, 2, 1, 0]
```

### 3.4 常用方法

| 方法 | 作用 | 示例 |
|---|---|---|
| `append(x)` | 末尾追加 | `nums.append(99)` |
| `insert(i, x)` | 在索引 `i` 前插入 | `nums.insert(0, 99)` |
| `remove(x)` | 删除第一个匹配值 | `nums.remove(99)` |
| `pop(i)` | 删除并返回指定位置元素 | `nums.pop(0)` |
| `sort()` | 原地升序排序 | `nums.sort()` |
| `reverse()` | 原地反转 | `nums.reverse()` |

注意 `append()` 和 `extend()` 的区别：

```python
a = [1, 2]
b = [3, 4]

a.append(b)
print(a)  # [1, 2, [3, 4]]

c = [1, 2]
c.extend(b)
print(c)  # [1, 2, 3, 4]
```

`append()` 把列表当作一个元素放进去；`extend()` 把另一个列表中的元素逐个加入。

### 3.5 统计、合并和成员判断

```python
nums = [19, 23, 54, 64, 87, 20, 109]

print(min(nums))   # 19
print(max(nums))   # 109
print(sum(nums))   # 376
print(len(nums))   # 7
```

合并两个列表：

```python
a = [1, 2, 3]
b = [3, 4, 5]

print(a + b)        # [1, 2, 3, 3, 4, 5]
print([*a, *b])     # [1, 2, 3, 3, 4, 5]
```

这里的 `*` 是解包，把列表拆成独立元素。

判断元素是否存在：

```python
fruits = ["apple", "banana", "cherry"]

print("apple" in fruits)   # True
print("pear" in fruits)    # False
```

### 3.6 去重

列表不会自动去重，可以使用集合：

```python
nums = [19, 23, 54, 64, 875, 20, 109, 232, 123, 54]
other = [55, 80, 72, 35, 60, 123, 54, 29, 91]

merged = nums + other
unique = list(set(merged))
unique.sort()

print(unique)
```

因为集合无序，转回列表后如果要稳定输出，应该再排序。

### 3.7 列表推导式

普通写法：

```python
squares = []
for n in range(1, 21):
    squares.append(n ** 2)
```

列表推导式：

```python
squares = [n ** 2 for n in range(1, 21)]
```

带筛选条件：

```python
nums = [19, 23, 54, 64, 87, 20, 109, 232, 123, 43, 26, 55, 72]

even_squares = [n ** 2 for n in nums if n % 2 == 0]
print(even_squares)
```

结构可以读成：

> 收集 `n ** 2`，其中 `n` 来自 `nums`，且必须满足 `n % 2 == 0`。

### 3.8 案例：输入 10 个数字并统计

```python
nums = []

for i in range(10):
    raw = input(f"请输入第 {i + 1} 个数字：")
    nums.append(float(raw))

print("最小值：", min(nums))
print("最大值：", max(nums))
print("平均值：", sum(nums) / len(nums))
```

如果想更健壮，可以把 `float(raw)` 放进 `try...except ValueError`，提示用户重新输入。

## 4. 字符串 str：不可变字符序列

### 4.1 索引和切片

```python
s = "Python"

print(s[0])      # P
print(s[-1])     # n
print(s[0:5])    # Pytho
print(s[0:5:2])  # Pto
print(s[::-1])   # nohtyP
```

字符串是序列，可以用 `for` 遍历：

```python
for char in "AI":
    print(char)
```

### 4.2 不可变是什么意思

不能修改字符串中的某个字符：

```python
s = "Python"
s[0] = "J"       # TypeError
```

但可以创建一个新字符串：

```python
s = "Python"
new_s = "J" + s[1:]
print(new_s)     # Jython
```

很多字符串方法也是返回新字符串，不修改原字符串：

```python
s = " python "
print(s.strip())  # python
print(s)          #  python
```

### 4.3 常用方法

| 方法 | 作用 |
|---|---|
| `find(sub)` | 查找子串位置，找不到返回 `-1` |
| `count(sub)` | 统计子串出现次数 |
| `upper()` | 转大写 |
| `lower()` | 转小写 |
| `split(sep)` | 按分隔符拆成列表 |
| `strip()` | 去掉两端空白或指定字符 |
| `replace(old, new)` | 替换子串 |
| `startswith(prefix)` | 判断开头 |

示例：

```python
text = " Python for AI "

print(text.strip())
print(text.lower())
print(text.replace("AI", "LLM"))
print(text.split())
print(text.startswith(" Python"))
```

### 4.4 案例一：统计字符

```python
text = "akiwksjakdiklowiqaamnvbamvaxnsjdsjkaaxkjd"

print("a:", text.count("a"))
print("k:", text.count("k"))
```

### 4.5 案例二：判断回文

```python
text = "上海自来水来自海上"

if text == text[::-1]:
    print("是回文")
else:
    print("不是回文")
```

### 4.6 案例三：简单邮箱校验

需求：包含一个 `@`，且 `@` 后至少有一个 `.`。

```python
email = input("请输入邮箱：").strip()

if (
    email.count("@") == 1
    and "." in email.split("@")[-1]
    and not email.startswith("@")
    and not email.endswith(".")
):
    print("邮箱格式正确")
else:
    print("邮箱格式错误")
```

这不是完整严格的邮箱正则校验，但足够演示字符串切分、成员判断和条件组合。

### 4.7 字符串和 AI 应用

大模型返回的内容首先是字符串。即使接口返回 JSON，落到 Python 后也经常需要处理文本：

```python
answer = "  Python 是一门适合 AI 开发的语言。\n"

clean_answer = answer.strip()
short_answer = clean_answer.replace("Python", "Python 语言")
keywords = clean_answer.split()
```

## 5. 元组 tuple：不可变序列

### 5.1 定义和特点

```python
point = (3, 5)
scores = (95, 88, 76)

print(point[0])
print(scores[-1])
print(scores[0:2])
```

元组支持索引、切片和遍历，但创建后不能修改：

```python
point = (3, 5)
point[0] = 10    # TypeError
```

定义单元素元组必须加逗号：

```python
a = (10,)   # 元组
b = (10)    # 整数
print(type(a), type(b))
```

空元组：

```python
empty = ()
empty = tuple()
```

### 5.2 常用方法

```python
nums = (5, 7, 9, 1, 2, 3, 10, 6, 4, 8, 12, 7, 5)

print(nums.count(7))
print(nums.index(9))
```

`index()` 找不到元素会报错，必要时先用 `in` 判断。

### 5.3 组包与解包

组包是把多个值放进一个容器：

```python
point = 3, 5
```

解包是把容器拆成多个变量：

```python
x, y = point
print(x, y)
```

星号解包可以收集剩余元素：

```python
nums = 5, 7, 9, 1

first, *middle, last = nums
print(first)   # 5
print(middle)  # [7, 9]
print(last)    # 1
```

注意：星号收集到的是**列表**。

### 5.4 交换变量

```python
a, b = 10, 20
a, b = b, a

print(a, b)  # 20 10
```

三个变量轮换：

```python
a, b, c = 100, 200, 300
a, b, c = c, a, b

print(a, b, c)  # 300 100 200
```

### 5.5 什么时候用元组

- 数据结构固定，不希望被修改；
- 表示一条记录，例如 `(name, age, score)`；
- 函数返回多个值；
- 字典 key 需要一个不可变序列。

例如：

```python
student = ("王林", 18, 695)
name, age, score = student
```

## 6. 集合 set：无序且自动去重

### 6.1 定义

```python
ids = {1001, 1002, 1003}
empty = set()
```

注意：`{}` 是空字典，不是空集合。

集合特点：

1. 无序；
2. 元素不重复；
3. 可以添加和删除；
4. 不支持下标索引。

```python
ids = {1001, 1002}
print(ids[0])   # TypeError
```

### 6.2 自动去重

```python
phones = ["13800000001", "13800000002", "13800000001"]

unique_phones = set(phones)
print(unique_phones)
print(len(unique_phones))
```

上传手机号、用户 ID、文档 ID 这类唯一性数据时，集合很合适。

### 6.3 常用操作

```python
a = {"Python", "AI", "LLM"}
b = {"Python", "Agent", "RAG"}

a.add("Transformer")
a.remove("AI")     # 元素不存在会报错
print(a)
```

| 方法 | 含义 |
|---|---|
| `add(x)` | 添加元素 |
| `remove(x)` | 删除指定元素，不存在时报错 |
| `discard(x)` | 删除指定元素，不存在时不报错 |
| `pop()` | 随机删除并返回一个元素 |
| `clear()` | 清空集合 |
| `union(other)` | 并集 |
| `intersection(other)` | 交集 |
| `difference(other)` | 差集 |

### 6.4 集合运算

```python
football = {"王林", "韩立", "厉飞雨", "紫灵"}
basketball = {"王林", "张铁", "韩立"}

both = football & basketball
either = football | basketball
only_football = football - basketball

print("同时选两门：", both)
print("至少选一门：", either)
print("只选足球：", only_football)
```

运算符和方法对应：

| 运算符 | 等价方法 | 含义 |
|---|---|---|
| `&` | `intersection()` | 交集 |
| `|` | `union()` | 并集 |
| `-` | `difference()` | 差集 |

### 6.5 集合推导式

```python
words = ["AI", "Python", "Agent", "ai", "RAG", "AI"]

normalized = {word.lower() for word in words}
print(normalized)
```

## 7. 字典 dict：键值对映射

### 7.1 为什么需要字典

用两个列表存姓名和成绩：

```python
names = ["王林", "韩立", "李慕婉"]
scores = [670, 556, 582]
```

查找“李慕婉”的成绩，要先找名字所在索引，再去另一个列表取值。字典直接建立映射：

```python
scores = {
    "王林": 670,
    "韩立": 556,
    "李慕婉": 582,
}

print(scores["李慕婉"])
```

### 7.2 定义和访问

```python
student = {
    "name": "王林",
    "age": 18,
    "score": 695,
}

print(student["name"])
```

字典由键值对组成：

- key 必须唯一；
- key 必须是不可变类型，例如字符串、数字、元组；
- value 可以是任意类型。

空字典：

```python
empty = {}
empty = dict()
```

### 7.3 增删改查

```python
scores = {"小智": 675, "李思": 608}

scores["韩立"] = 720       # key 不存在，新增
scores["小智"] = 690       # key 存在，修改
score = scores.pop("李思") # 删除并返回值
del scores["韩立"]         # 删除指定键值对
print(scores)
```

访问建议：

```python
scores = {"小智": 675}

print(scores.get("韩立"))           # None
print(scores.get("韩立", 0))        # 0
```

`d[key]` 找不到会抛 `KeyError`；`d.get(key)` 找不到可以返回默认值。

### 7.4 keys、values、items

```python
scores = {
    "王林": 670,
    "韩立": 556,
    "李慕婉": 582,
}

print(scores.keys())
print(scores.values())
print(scores.items())
```

遍历方式：

```python
for name in scores:
    print(name, scores[name])

for name, score in scores.items():
    print(f"{name}：{score}")

for score in scores.values():
    print(score)
```

第一种遍历得到的是 key；第二种最常用于同时取 key 和 value；第三种只在不需要 key 时使用。

### 7.5 嵌套容器

真实数据结构经常嵌套：

```python
students = [
    {"name": "王林", "scores": {"语文": 92, "数学": 88}},
    {"name": "韩立", "scores": {"语文": 85, "数学": 95}},
]

for student in students:
    total = sum(student["scores"].values())
    print(student["name"], "总分：", total)
```

这个结构非常接近大模型 API 返回的 JSON：

```python
response = {
    "model": "deepseek-chat",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "你好，我是 AI 助手。"
            }
        }
    ],
    "usage": {
        "prompt_tokens": 12,
        "completion_tokens": 30,
        "total_tokens": 42
    }
}

answer = response["choices"][0]["message"]["content"]
print(answer)
```

能读懂嵌套字典和列表，是调用大模型 API 的基础。

### 7.6 案例：购物车管理系统

需求：支持商品添加、修改、删除、查询和退出。

```python
shopping_cart = {}

while True:
    print("\n===== 购物车管理系统 =====")
    print("1. 添加购物车")
    print("2. 修改购物车")
    print("3. 删除购物车")
    print("4. 查询购物车")
    print("5. 退出")

    choice = input("请选择操作：").strip()

    if choice == "1":
        name = input("商品名称：").strip()
        if not name:
            print("商品名称不能为空。")
            continue
        price = float(input("商品价格："))
        count = int(input("商品数量："))
        shopping_cart[name] = {"price": price, "count": count}
        print("添加成功。")

    elif choice == "2":
        name = input("要修改的商品名称：").strip()
        if name not in shopping_cart:
            print("商品不存在。")
            continue
        price = float(input("新的商品价格："))
        count = int(input("新的商品数量："))
        shopping_cart[name] = {"price": price, "count": count}
        print("修改成功。")

    elif choice == "3":
        name = input("要删除的商品名称：").strip()
        if shopping_cart.pop(name, None) is None:
            print("商品不存在。")
        else:
            print("删除成功。")

    elif choice == "4":
        if not shopping_cart:
            print("购物车为空。")
        for name, item in shopping_cart.items():
            print(
                f"商品名称: {name}, "
                f"商品价格: {item['price']}, "
                f"商品数量: {item['count']}"
            )

    elif choice == "5":
        print("已退出购物车。")
        break

    else:
        print("请输入 1~5 之间的选项。")
```

这里选择的结构是：

```python
{
    "Meta80": {"price": 6999, "count": 2},
    "鼠标": {"price": 129, "count": 1}
}
```

商品名作为 key，可以快速定位；价格和数量组成嵌套字典，结构比两个平行列表更清楚。

## 8. 容器选择方法

遇到数据时，可以按下面顺序判断：

1. **是不是文本？**  
   用字符串。

2. **是不是一批有序数据，需要增删改？**  
   用列表。

3. **是不是固定记录，不允许修改？**  
   用元组。

4. **是不是需要唯一性，或者要做交并差？**  
   用集合。

5. **是不是一一对应关系，或者结构化配置？**  
   用字典。

用一张表对应 AI 场景：

| 数据 | 推荐容器 | 原因 |
|---|---|---|
| 多轮对话 `messages` | 列表 | 顺序重要，会追加 |
| 单条消息 | 字典 | role/content 是键值对 |
| 模型配置 | 字典 | 参数名和参数值对应 |
| 已处理文档 ID | 集合 | 自动去重，查询快 |
| 工具注册表 | 字典 | 工具名对应函数或说明 |
| 固定坐标 | 元组 | 结构固定，不应被修改 |
| 提示词模板 | 字符串 | 本质是文本 |

## 9. 常见坑

### 1. 空集合写成 {}

```python
s = {}       # 字典
s = set()    # 集合
```

### 2. 修改字符串

字符串不可变，要创建新字符串。

### 3. 单元素元组忘记逗号

```python
t = (10)   # int
t = (10,)  # tuple
```

### 4. 集合依赖顺序

集合无序，不要用下标访问，也不要依赖打印顺序。

### 5. 字典访问不存在的 key

优先使用 `get()`：

```python
# config 是已经存在的字典，例如 {"model": "qwen-max", "temperature": 0.7}
value = config.get("temperature", 0.7)
```

### 6. 浅拷贝误解

```python
a = [[1, 2], [3, 4]]
b = a.copy()

b[0].append(99)
print(a)  # [[1, 2, 99], [3, 4]]
```

`copy()` 是浅拷贝，嵌套对象仍然共享。确需完全独立时，可用：

```python
import copy
b = copy.deepcopy(a)
```

## 10. 综合练习：教务管理系统

尝试实现以下功能：

1. 添加学生：姓名、语文、数学、英语；
2. 修改学生成绩；
3. 删除学生；
4. 查询学生；
5. 列出所有学生；
6. 统计各科最高分、最低分、平均分；
7. 退出系统。

推荐数据结构：

```python
students = {
    "王林": {
        "chinese": 92,
        "math": 88,
        "english": 95,
    }
}
```

这个练习会同时用到字典、列表、循环、条件判断、输入输出和异常处理。写完它，你对 Python 基础语法的理解会从“知道语法”进入“能组织数据”。

### 10.1 加餐练习：三个 AI 场景

下面三个练习直接来自大模型开发里的真实场景，做完会发现集合和字典不是语法练习，是干活的家伙。

**练习一：智能体工具权限对比（集合运算）**

```python
planner_tools = {'web_search', 'calculator', 'code_interpreter', 'web_search'}
coder_tools = {'code_interpreter', 'file_write', 'web_search'}
```

用 `union()`、`intersection()`、`difference()` 完成：打印 planner 去重后的工具数量；两个智能体共同拥有的工具；planner 独有、coder 独有的工具；平台上出现过的全部工具（并集）。注意第一行里重复出现的 `web_search`——这正是集合自动去重派上用场的时刻。

**练习二：大模型调用日志分析（字典嵌套字典）**

```python
call_log = {
    'qwen-max': {'calls': 120, 'tokens': 480000},
    'llama-3':  {'calls': 60,  'tokens': 150000},
    'glm-4':    {'calls': 90,  'tokens': 270000},
}
```

遍历打印每条调用记录；统计总调用次数和总 token 数；计算平均每次调用的 token 数（保留 2 位小数）；最后新增一个模型 `deepseek`（40 次调用、100000 token）再打印模型总数。进阶写法：统计部分分别用普通循环和列表推导式各写一遍，对比哪种更清晰。

**练习三：AI 模型配置中心（字典 + while 菜单）**

```python
models = {
    'qwen-max': {'ctx': 32000, 'price': 0.02},
    'llama-3':  {'ctx': 8000,  'price': 0.004},
}
```

实现一个菜单系统：添加模型配置（已存在要提示）、修改配置、删除配置、用 `get()` 查询单个模型（不存在时给出提示而不是报错）、列出全部并统计总数与平均上下文长度、退出。非法编号统一提示重新输入。这道题就是练习一、二加上 [循环控制](/post/python-loop-control/) 里的菜单循环——三层结构嵌套着练，才算是真的掌握了字典。

## 11. 学习检查表

1. 列表、元组、集合、字典各自是否有序？
2. 哪些容器允许重复？
3. 哪些容器支持索引和切片？
4. 字符串方法为什么不会修改原字符串？
5. 空集合应该怎么定义？
6. 字典的 key 有什么限制？
7. 大模型 API 返回的嵌套 JSON 应该怎么逐层读取？

下一篇 [Python 函数详解](/post/python-functions-in-depth/) 把函数这块拼图补上：多种参数形态、变量作用域、`*args` 与 `**kwargs`，还有递归。调用大模型 API 时那些名目繁多的配置参数，答案都在那一篇里。
