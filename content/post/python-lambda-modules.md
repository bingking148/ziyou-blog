---
title: 'Python 第 7 篇：lambda 与模块，把代码拆成文件'
weight: 7
date: 2026-10-26T10:00:00+08:00
lastmod: 2026-10-30T10:00:00+08:00
cover: /images/covers/python-lambda-modules-cover.jpg
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', 'lambda', '模块']
description: '函数当参数传、lambda 一行写完、模块与包的导入方式，最后把前几篇的工具函数拆成自己的工具箱模块，并讲透 __name__ 和 __all__ 到底干什么用。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇的成绩分析工具箱已经是一堆漂亮的函数了。但它还躺在一个 `.py` 文件里。

现在的问题是：**下个项目想用它，怎么办？** 复制粘贴？那以后改了 bug 要改两处。

这一篇解决两件事：

1. **函数本身还能怎么用**——把函数当参数传给另一个函数（这在大模型代码里到处都是）；
2. **代码多了怎么组织**——把工具箱拆成模块，别人 `import` 一下就能用。

## 1. 函数也是对象

先接受一个事实：在 Python 里，**函数和数字、字符串一样，是可以被赋值、被传递、被放进容器的普通对象**。

```python
def shout(text):
    return text.upper() + "!"

def whisper(text):
    return text.lower() + "..."

f = shout               # 注意：没有括号！只是把函数本身赋给 f
print(f("你好"))        # 你好!
print(shout("你好"))     # 你好!

print(type(shout))      # <class 'function'>
```

`shout` 是函数对象，`shout()` 是**调用**它。少了括号就是「函数本身」，这是理解后面一切的关键。

既然函数是对象，它就能：

```python
# 放进列表
actions = [shout, whisper]
for fn in actions:
    print(fn("Hello"))

# 放进字典
handlers = {"big": shout, "small": whisper}
print(handlers["big"]("Hello"))

# 当参数传
def apply(fn, text):
    return fn(text)

print(apply(shout, "hello"))     # HELLO!
```

## 2. 高阶函数：函数当参数

**接收函数作为参数的函数，叫高阶函数。** Python 内置了三个最常用的：`map`、`filter`、`sorted`。

### 2.1 sorted 的 key 参数

你已经在用了：

```python
students = [("张三", 92), ("李四", 78), ("王五", 55)]

# 按分数排序
print(sorted(students, key=lambda x: x[1]))
# [('王五', 55), ('李四', 78), ('张三', 92)]

# 按姓名排序
print(sorted(students, key=lambda x: x[0]))
```

`key` 接收的是一个函数，`sorted` 会对每个元素调用它，用返回值来比较大小。

### 2.2 map：对每个元素做同一个变换

```python
nums = [1, 2, 3, 4]

result = map(lambda x: x ** 2, nums)
print(list(result))          # [1, 4, 9, 16]
```

但说实话，**现代 Python 更推荐列表推导式**：

```python
print([x ** 2 for x in nums])     # 一样的，而且更好读
```

那 `map` 什么时候用？当变换函数已经有现成的名字时：

```python
names = ["  张三  ", " 李四 "]
print(list(map(str.strip, names)))    # ['张三', '李四']
```

比 `[n.strip() for n in names]` 稍短一点。差别不大，看你习惯。

### 2.3 filter：按条件筛选

```python
nums = [1, 2, 3, 4, 5, 6]
evens = filter(lambda x: x % 2 == 0, nums)
print(list(evens))           # [2, 4, 6]
```

同样可以用推导式代替：

```python
print([x for x in nums if x % 2 == 0])
```

> [!TIP]
> **经验法则**：能用推导式就用推导式。`map`/`filter` 的可读性通常更差，只有在传入现成函数（如 `str.strip`、`int`）时才略占优势。

## 3. lambda：一句话的匿名函数

`lambda` 用来定义一个**没有名字的小函数**，语法：

```python
lambda 参数: 返回值
```

对比一下：

```python
# 普通函数
def add_one(x):
    return x + 1

# lambda
add_one = lambda x: x + 1
```

两者完全等价。那为什么还要 lambda？

**因为它可以就地写、不用起名字**，特别适合「用完就扔」的场景：

```python
# 不用 lambda
def by_score(item):
    return item[1]

print(sorted(students, key=by_score))

# 用 lambda
print(sorted(students, key=lambda item: item[1]))
```

第二种把「按什么排序」直接写在了调用处，读代码的人不用跳去找 `by_score` 的定义。

### 3.1 lambda 的边界

lambda **只能是一个表达式**，不能有语句。所以：

```python
# ✗ 不能写 if 语句
lambda x: if x > 0: return x

# ✓ 但可以用三元表达式（这是一个表达式）
lambda x: x if x > 0 else 0
```

也不能有多行、不能有 `return` 关键字、不能 `print` 完再返回。

> [!WARNING]
> **lambda 只适合一行能写完的简单逻辑。**
>
> 如果你发现自己在 lambda 里嵌套三元表达式、或者写了 `lambda a, b: a if ... else (b if ... else ...)`，立刻改回 `def`。**可读性永远优先于短。**

### 3.2 lambda 在真实代码里长什么样

大模型相关的代码里，lambda 几乎只出现在这几个位置：

```python
# 1. 排序键
messages.sort(key=lambda m: m["role"])

# 2. 取最大值/最小值
best = max(models, key=lambda m: m["score"])

# 3. 简单的字段提取
names = list(map(lambda u: u["name"], users))

# 4. GUI 回调
button.clicked.connect(lambda: self.save())
```

看到这四种，你就能顺畅读懂。**别的地方基本不该出现 lambda。**

## 4. 模块：一个 .py 文件就是一个模块

现在进入第二部分：组织代码。

你写的任何 `.py` 文件，本身就是一个**模块（module）**。文件名去掉 `.py` 就是模块名。

假设你有个 `tools.py`：

```python
# tools.py
PI = 3.14159

def circle_area(r):
    return PI * r ** 2

def greet(name):
    return f"你好，{name}"
```

在**同一个目录**下新建 `main.py`，就可以用：

```python
# main.py
import tools

print(tools.circle_area(2))      # 12.56636
print(tools.greet("张三"))
print(tools.PI)
```

`import tools` 之后，用 `tools.xxx` 访问里面的一切。**加模块名前缀是好事**——一眼就知道这个函数是从哪来的。

### 4.1 四种导入方式

```python
# 1. 导入整个模块（推荐）
import tools
tools.greet("张三")

# 2. 导入特定成员
from tools import greet, circle_area
greet("张三")

# 3. 导入并起别名
import tools as t
t.greet("张三")

# 4. 导入全部（不推荐）
from tools import *
greet("张三")          # 谁都能看出来 greet 是外来的吗？看不出来
```

> [!WARNING]
> **不要用 `from module import *`。**
>
> 它会把模块里所有名字倒进你的命名空间，可能覆盖你自己的变量，而且读代码时完全看不出某个函数是从哪来的。只有在交互式环境里图省事才用它。

### 4.2 导入时发生了什么

`import tools` 会**执行 tools.py 的全部代码**。这一点很重要：

```python
# tools.py
print("tools 被导入了")     # 顶层代码，导入时就会跑

def greet(name):
    return f"你好，{name}"
```

```python
# main.py
import tools              # 输出：tools 被导入了
import tools              # 什么都不输出——第二次不会重复执行
```

Python 会缓存已导入的模块，同一个进程里只执行一次。

## 5. `if __name__ == "__main__"` 到底在干嘛

前几篇一直让你照抄这一行，现在解释清楚。

每个模块都有一个内置变量 `__name__`：

- **直接运行这个文件时**（`python tools.py`），`__name__` 的值是 `"__main__"`；
- **被别的文件 import 时**，`__name__` 的值是模块名，也就是 `"tools"`。

所以：

```python
# tools.py

def greet(name):
    return f"你好，{name}"


if __name__ == "__main__":
    # 只有直接运行 tools.py 时才执行
    print(greet("测试"))
    print(circle_area(1))
```

效果：

```bash
python tools.py       # 输出测试结果
```

```python
# main.py
import tools          # 什么都不输出，测试代码被跳过了
```

**它的作用是：让文件既能当脚本直接跑（自带测试），又能被 import 复用而不产生副作用。**

> [!NOTE]
> 为什么必须有它？因为如果没有这层保护，`import tools` 时那段测试代码也会执行——别人只是借用你的函数，却被你的 `print` 刷了一屏。这是模块设计的基本礼貌。

## 6. 包：用文件夹组织模块

模块多了，总不能全堆在一个目录。**包（package）就是装模块的文件夹**。

```text
myproject/
├── main.py
└── mytools/
    ├── __init__.py
    ├── math_utils.py
    └── text_utils.py
```

`mytools/` 目录里有 `__init__.py`，它就是一个包。`__init__.py` 可以是空文件（Python 3.3+ 其实可以不要，但显式写出来更清楚，也方便放包的初始化代码）。

导入：

```python
from mytools import math_utils, text_utils
print(math_utils.circle_area(2))

# 或者
from mytools.math_utils import circle_area
```

### 6.1 `__init__.py` 能干什么

它决定「从这个包导入时，默认暴露什么」。常见的写法是**把常用的东西提上来**：

```python
# mytools/__init__.py
from .math_utils import circle_area
from .text_utils import greet

__all__ = ["circle_area", "greet"]
```

这样别人就能：

```python
from mytools import circle_area     # 不用写到具体模块
```

### 6.2 `__all__` 是什么

`__all__` 是一个列表，规定 `from mytools import *` 时**到底导出哪些名字**。

```python
# tools.py
__all__ = ["greet"]

def greet(name): ...
def _internal_helper(): ...      # 下划线开头表示「内部使用」
```

- 有 `__all__`：`import *` 只导入列表里的；
- 没有 `__all__`：`import *` 会导入所有不以 `_` 开头的名字。

> [!TIP]
> **下划线开头的名字是 Python 的「内部约定」**：`_helper()` 表示「这是我自己用的，你别依赖它」。Python 不会强制阻止你调用，但这是整个社区的默契。看到 `_` 开头，就别在外部用。

## 7. 组装：把自己的工具箱做成模块

现在把第 6 篇的成绩工具箱真正拆成模块。

### 7.1 目录结构

```text
score_tools/
├── __init__.py
├── calc.py          # 计算类函数
├── grouping.py      # 分组筛选
└── report.py        # 展示
main.py
```

### 7.2 calc.py

```python
"""基础计算：平均分、最高分、最低分"""

__all__ = ["average", "highest", "lowest"]


def average(scores):
    """平均分，空列表返回 0.0"""
    if not scores:
        return 0.0
    return sum(s for _, s in scores) / len(scores)


def highest(scores):
    """(姓名, 分数) 元组，空列表返回 None"""
    return max(scores, key=lambda item: item[1]) if scores else None


def lowest(scores):
    return min(scores, key=lambda item: item[1]) if scores else None
```

### 7.3 grouping.py

```python
"""分组与筛选"""

__all__ = ["level_of", "group_by_level", "below_average"]

from .calc import average        # 包内相对导入


def level_of(score, pass_line=60):
    if score >= 90:
        return "优秀"
    elif score >= 75:
        return "良好"
    elif score >= pass_line:
        return "及格"
    return "不及格"


def group_by_level(scores):
    groups = {"优秀": [], "良好": [], "及格": [], "不及格": []}
    for name, s in scores:
        groups[level_of(s)].append((name, s))
    return groups


def below_average(scores):
    if not scores:
        return []
    avg = average(scores)
    return [(n, s) for n, s in scores if s < avg]
```

注意 `from .calc import average` 前面那个**点**——表示「当前包里的 calc 模块」，这叫相对导入。

### 7.4 __init__.py：统一出口

```python
"""成绩分析工具箱"""

from .calc import average, highest, lowest
from .grouping import level_of, group_by_level, below_average

__all__ = [
    "average", "highest", "lowest",
    "level_of", "group_by_level", "below_average",
]
```

### 7.5 main.py：使用

```python
from score_tools import average, highest, group_by_level


def main():
    data = [("张三", 92), ("李四", 78), ("王五", 55), ("赵六", 88)]

    print(f"平均分：{average(data):.2f}")
    print(f"最高分：{highest(data)}")

    for level, people in group_by_level(data).items():
        if people:
            print(f"{level}：{'、'.join(n for n, _ in people)}")


if __name__ == "__main__":
    main()
```

`main.py` 干净得不像话——它只负责「把东西串起来」，所有逻辑都在包里。**这就是模块化的价值。**

> [!IMPORTANT]
> 一个经验判断：**如果你的 `main.py` 超过 100 行，大概率该拆包了。**

## 8. 标准库和第三方库

Python 之所以好用，很大程度上是因为有海量的现成模块。

- **标准库**：Python 自带，`import` 即用，不用装。常用的有 `random`（随机数）、`json`（JSON 处理）、`os`/`pathlib`（文件路径）、`datetime`（时间）、`re`（正则）、`math`（数学）；
- **第三方库**：需要 `pip install` 安装，比如 `requests`（HTTP）、`openai`（大模型 API）、`streamlit`（做网页）。

```python
import json

data = {"name": "张三", "age": 18}
text = json.dumps(data, ensure_ascii=False)     # 转成 JSON 字符串
print(text)                                      # {"name": "张三", "age": 18}

back = json.loads(text)                          # 转回字典
print(back["name"])                              # 张三
```

`json` 这两行你很快就会天天用——**所有大模型 API 的请求和响应都是 JSON**。

安装第三方库：

```bash
pip install requests
```

> [!NOTE]
> 国内安装慢的话加个镜像源：
>
> ```bash
> pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple
> ```

## 9. 常见坑清单

1. **`f` 和 `f()` 搞混**——前者是函数本身，后者是调用结果；
2. **lambda 里塞复杂逻辑**——该用 `def` 了；
3. **`from module import *`**——污染命名空间，禁止；
4. **循环导入**——a.py 导入 b.py，b.py 又导入 a.py，会报错。解法是把公共部分抽到第三个模块；
5. **模块名和标准库重名**——自己建个 `random.py`，然后 `import random` 就导入到你自己了，会疯掉。**别用标准库的名字当文件名**；
6. **改了模块但没生效**——Python 有缓存，重启解释器；Jupyter 里要重启内核；
7. **`__name__` 判断写反**——写的是 `if __name__ == "__main__":`，不是 `"__main__" == __name__`（虽然等价但没人这么写），也别写成 `__main__` 少了引号。

第 5 条特别坑人，我见过不止一次：

```text
新建 random.py
→ import random
→ 导入了自己的 random.py
→ random.randint 不存在
→ 报错 AttributeError
```

**新建文件前，先想想这个名字是不是标准库的。**

## 10. 课后小项目

**练习一：写一个 `mytools` 包（必做）**

把前面几篇写过的函数收进来：
- `calc.py`：BMI 计算、汇率换算；
- `text.py`：统计字符串里数字的个数、判断密码强度；
- `random_utils.py`：生成随机密码（用 `random.choice` 从字符集里挑）。

然后写一个 `main.py`，从包里导入使用，并确认 `import` 时不会打印任何东西。

**练习二：给工具包加一个命令行入口**

让 `python -m score_tools` 能直接跑（提示：在 `__init__.py` 里加 `if __name__ == "__main__":` 不行，要在包里放 `__main__.py`）。

**练习三：用 lambda 重写排序**

给成绩工具箱加一个函数 `rank(scores, by="score")`，`by` 可以是 `"score"`（按分数降序）或 `"name"`（按姓名升序）。

提示：

```python
keys = {"score": lambda x: -x[1], "name": lambda x: x[0]}
return sorted(scores, key=keys[by])
```

## 11. 本篇小结

1. **函数是对象**——能赋值、能进容器、能当参数；
2. **`f` 是函数，`f()` 是调用**，别搞混；
3. **`lambda 参数: 表达式`** 只能写一行，适合排序键和简单回调；
4. **一个 `.py` 文件就是模块**，用 `import 模块名` 使用，尽量别用 `import *`；
5. **`if __name__ == "__main__"`** 让文件既能当脚本跑、又能被安全 import；
6. **包是带 `__init__.py` 的文件夹**，`__init__.py` 决定对外暴露什么；
7. **别用标准库的名字命名自己的文件**。

下一篇 [第 8 篇：面向对象入门](/post/python-oop-basics/) 会换一种组织代码的方式——把「数据」和「操作数据的函数」打包在一起，变成一个「对象」。你会第一次看懂 `client.chat.completions.create(...)` 这串东西到底在干什么。
