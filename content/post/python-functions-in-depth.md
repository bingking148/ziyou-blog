---
title: 'Python 函数详解：参数、作用域与递归'
weight: 5
date: 2026-10-24T10:00:00+08:00
lastmod: 2026-10-29T15:07:58+08:00
cover: /images/covers/python-functions-in-depth-cover.jpg
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '函数', '递归']
description: '系统讲透 Python 函数：定义与调用、多返回值解包、说明文档、类型标注、全局与局部变量、四种参数形态、*args 与 **kwargs，以及用递归实现阶乘，最后完成班级成绩统计案例。'
math: false
mermaid: false
comments: true
toc: true
---

前面在 [Python 控制流与函数](/post/python-control-flow-functions/) 里已经用过 `def` 和 `return`，但只停留在最小用法：一个参数、一个返回值、写在脚本里的几行函数。真实代码里的函数比这复杂得多——它可能接收好几个参数，返回好几个结果，甚至不确定要接收多少个参数。

这一篇把函数补完整。你会看到：参数有位置参数、关键字参数、默认参数、`*args` 和 `**kwargs` 五种形态；函数内外同名变量互不相干，除非用 `global` 显式声明；函数还能调用自己，这叫递归。文章最后用一个班级成绩统计案例，把容器、循环和函数串起来。

## 1. 函数定义的完整形态

先回顾定义语法，把每个部分的名字叫清楚：

```python
def 函数名称(参数1, 参数2, ...):
    函数体代码
    ...
    return 返回值
```

`def` 是关键字，函数名用小写字母加下划线。参数写在括号里，`return` 把结果交还给调用方。参数和返回值都可以省略：

```python
def out_line():
    print("-------------------------")


out_line()
```

这个函数没有参数、没有返回值，作用只是打印一条分隔线。判断要不要写函数，看的不是长短，而是这段逻辑会不会被重复使用、值不值得起一个名字。

带参数和返回值的版本：

```python
import math


def circle_area(radius):
    area = math.pi * radius * radius
    return area


print(f"半径为 5 的圆面积：{circle_area(5):.2f}")
```

`radius` 是形参（定义时的占位），调用时传入的 `5` 是实参（实际值）。函数体内部先算面积，再交给 `return`。定义函数时 `import` 也可以放在文件顶部，这是更常见的做法。

## 2. 返回多个值：本质是元组解包

一个函数经常需要同时交回多个结果，比如圆的面积和周长。Python 的写法非常直接——`return` 后面逗号隔开：

```python
import math


def circle_area_length(radius):
    area = math.pi * radius * radius
    length = 2 * math.pi * radius
    return area, length
```

调用它，先看返回值到底是什么类型：

```python
result = circle_area_length(5)
print(type(result))    # <class 'tuple'>
print(result)          # (78.53981633974483, 31.41592653589793)
```

多个返回值其实是**自动打包成了一个元组**。接收时可以用解包（Unpacking）语法，把元组拆给多个变量：

```python
radius = float(input("请输入圆的半径："))
area, length = circle_area_length(radius)
print(f"半径 {radius}，面积 {area:.2f}，周长 {length:.2f}")
```

变量个数要和返回值个数一致，多一个少一个都会报 `ValueError`。这个特性和 [数据容器](/post/python-data-containers/) 里元组的组包解包是同一件事。

## 3. 说明文档：写给未来的自己和 help()

函数写完不等于结束。三个月后回看，参数是什么含义、返回什么，很容易忘。标准做法是在函数体第一行写文档字符串（docstring）：

```python
import math  # 单独复制本块运行时需要；前文已导入过则可省略


def circle_area_len(radius):
    """
    根据圆的半径，计算圆的面积和圆的周长
    :param radius: 圆的半径
    :return: 圆的面积, 圆的周长
    """
    area = math.pi * radius ** 2
    length = 2 * math.pi * radius
    return area, length
```

三引号字符串按固定格式写：第一行概述功能，`:param` 逐个说明参数，`:return` 说明返回值。写好之后，Python 自带的 `help()` 能直接读它：

```python
help(circle_area_len)
```

控制台会打印出你写的说明。第三方库的文档之所以能用 `help()` 查，就是因为作者写了 docstring。把说明写进代码而不是单独放一个文档，两者才不会脱节。

## 4. 类型标注：给参数和返回值贴标签

定义函数时可以直接标注参数类型和返回值类型：函数标注从 Python 3.0 起就支持，3.5 起有了统一的类型提示规范；本文用到的 `list[int]`、`X | None` 写法分别需要 Python 3.9+ 和 3.10+。

```python
def calculate_math(first_number: int, second_number: int) -> tuple[int, int, int, float]:
    """
    对两个数字做加、减、乘、除计算
    :param first_number: 第 1 个计算数值
    :param second_number: 第 2 个计算数值
    :return: 加、减、乘、除四个结果
    """
    add_value = first_number + second_number
    subtract_value = first_number - second_number
    multiply_value = first_number * second_number
    divide_value = first_number / second_number
    return add_value, subtract_value, multiply_value, divide_value


print(calculate_math(99, 1))
```

语法是 `参数名: 类型`，返回值类型写在 `->` 后面。多个返回值标注成 `tuple[int, int, int, float]`，表示元组里有四个元素、各自什么类型。

有一个必须知道的限制：**类型标注只是提示，Python 运行时并不强制检查**。

```python
calculate_math(99.9, 1.1)   # 能运行，float 照样算
calculate_math("99", "1")   # TypeError！减法这关就过不去
```

传 float 进去确实照跑——标注不拦它。但传字符串并不是「随便什么类型都能算」：加法、乘法碰巧对字符串有定义（拼接、重复），减法没有，`"99" - "1"` 直接抛 `TypeError: unsupported operand type(s) for -: 'str' and 'str'`。所以更准确的说法是：标注不做运行时校验，能运算的类型放行，真正不兼容的类型会被运算符自己拦住。标注的价值在于：编辑器能据此做智能提示和静态检查，读代码的人能一眼看懂接口约定。真正的类型把关要靠 `isinstance()` 判断或者后面的异常处理。

## 5. 嵌套调用：函数里面调函数

函数体里可以调用另一个函数，这叫嵌套调用。看三个函数的连锁：

```python
def function_c():
    print("c...")


def function_b():
    print("b... before")
    function_c()
    print("b... after")


def function_a():
    print("a... before")
    function_b()
    print("a... after")


function_a()
```

输出是：

```text
a... before
b... before
c...
b... after
a... after
```

执行顺序像一条单行道：`a` 打印完进入 `b`，`b` 打印完进入 `c`，`c` 执行完回到 `b` 的下一行，`b` 结束再回到 `a`。任何复杂程序都是这样一层层调出来的——你在容器篇写的学生成绩管理，拆开看就是「输入函数、统计函数、打印函数」互相配合。

## 6. 全局变量与局部变量

变量定义的位置决定它能被谁访问：

- **全局变量**：定义在函数外面，整个文件都能用，通常写在文件顶部；
- **局部变量**：定义在函数内部，只在函数内有效，出了函数就不存在。

```python
num = 100        # 全局变量


def circle_area(r):
    pi = 3.14    # 局部变量
    return pi * r * r


print(circle_area(10))   # 314.0
print(num)               # 100，全局变量到处可用
print(pi)                # NameError！函数外的世界看不到 pi
```

最容易踩的一个坑：函数内外出现同名变量时，函数内的赋值会创建一个**新的局部变量**，并不会修改全局的那一个：

```python
num1 = 1              # 全局变量


def fun1():
    num1 = 100        # 这里创建的是局部变量 num1，与全局的 num1 无关
    print(num1)       # 100


fun1()
print(num1)           # 1，全局变量纹丝不动
```

这个设计是刻意的：函数内部的状态不影响外部，调用函数的人才不用关心函数内部用了什么变量名。理解了这一点，才理解下一个关键字为什么存在。

## 7. global 关键字：确实要改全局变量时才用

如果就是要在一个函数里修改全局变量，用 `global` 显式声明：

```python
num1 = 1


def fun1():
    global num1       # 告诉解释器：num1 是全局的那个
    num1 = 100
    print(num1)


fun1()
print(num1)           # 100，全局变量被改掉了
```

一个贴近开发的例子：程序里有一个调试模式开关，默认关闭，通过函数开关：

```python
debug_mode = False


def enable_debug_mode():
    global debug_mode
    debug_mode = True
    print("调试模式已开启！")


def disable_debug_mode():
    global debug_mode
    debug_mode = False
    print("调试模式已关闭！")
```

注意 `global` 的使用边界：它让函数可以悄悄改掉外部状态，调用方很难发现。能用参数传入、返回值传出的，就不要用全局变量。开关这类「全程序共享的少量配置」是合理场景；把数据传来传去都塞进全局变量，是坏味道。

## 8. 参数的五种形态

### 8.1 位置参数

按顺序一一对应传递，最基础的形态：

```python
def reg_stu(name: str, age: int, gender: str, city: str) -> dict:
    print(f"注册成功，姓名：{name}，年龄：{age}，性别：{gender}，城市：{city}")
    return {"name": name, "age": age, "gender": gender, "city": city}


stu = reg_stu("张三", 18, "男", "北京")
```

四个实参按位置配给四个形参。缺点很明显：调用处一堆 `"张三", 18, "男", "北京"`，不查定义根本不知道每个值是什么意思，顺序也不能乱。

### 8.2 关键字参数

调用时用 `参数名=值` 指定，顺序随意：

```python
stu2 = reg_stu(gender="女", name="赵晓芳", city="上海", age=23)
```

两种形态还能混用，规则是**位置参数在前，关键字参数在后**：

```python
stu3 = reg_stu("王二毛", 22, city="连云港", gender="男")
```

参数多的函数推荐用关键字参数调用，可读性完全不是一个量级。

### 8.3 默认参数

定义时直接给参数一个默认值，调用时不传就用默认的：

```python
def register_student(name: str, age: int, gender: str = "男", city: str = "北京") -> dict:
    print(f"注册成功，姓名：{name}，年龄：{age}，性别：{gender}，城市：{city}")
    return {"name": name, "age": age, "gender": gender, "city": city}


stu1 = register_student("张三", 23)                 # gender、city 用默认值
stu2 = register_student("李四", 22, city="上海")    # 只覆盖 city
stu3 = register_student("王五", 25, "女", "苏州")   # 按位置全部传齐也行
```

规则同样简单：**默认参数必须放在普通参数后面**。`def f(a=1, b)` 这种写法直接报语法错误——前面有了默认值，后面的 b 到底传不传就说不清了。

### 8.4 不定长参数 *args

事先不知道调用方会传几个值时，用 `*参数名` 接收，习惯命名为 `args`：

```python
def calculate_data(*args: int) -> tuple[int, int, float]:
    """
    接收任意个 int 数值，计算最大值、最小值和平均值
    :param args: 可变参数
    :return: (最大值, 最小值, 平均值)
    """
    print(f"args 类型：{type(args)}，内容：{args}")
    return max(args), min(args), sum(args) / len(args)


print(calculate_data(10, 20, 30, 40, 50))
print(calculate_data(100, 200, 300, 400, 500))
print(calculate_data(10))
```

输出里能看到，`args` 在函数内部是一个**元组**，所有位置参数都被收进去了。有了它，`print()` 这种「想传几个参数就传几个」的函数才写得出来。

### 8.5 关键字不定长参数 **kwargs

`**参数名`（习惯叫 `kwargs`）接收所有「多余的」关键字参数，函数内部拿到的是一个**字典**：

```python
from typing import Any


def cal_data(*args: int, **kwargs: Any) -> tuple[int, int, float]:
    """
    接收任意个 int 数值计算统计量，可用 round=2 控制平均值的小数位
    :param args: 可变位置参数
    :param kwargs: 可变关键字参数，如 round=2
    :return: (最大值, 最小值, 平均值)
    """
    print(f"args 类型：{type(args)}，内容：{args}")
    print(f"kwargs 类型：{type(kwargs)}，内容：{kwargs}")

    max_value = max(args)
    min_value = min(args)
    mean_value = sum(args) / len(args)

    # 从 kwargs 里找 round 参数，找到就按它保留小数位
    if kwargs.get("round"):
        mean_value = round(mean_value, kwargs["round"])

    return max_value, min_value, mean_value


print(cal_data(100, 200, 300, 400, round=2, count=0))
# args 类型：<class 'tuple'>，内容：(100, 200, 300, 400)
# kwargs 类型：<class 'dict'>，内容：{'round': 2, 'count': 0}
```

调用大模型 API 时到处是这种身影：`chat(model="qwen-max", temperature=0.7, stream=True)`——不同名目、不同数量的配置项，全靠 `**kwargs` 一类机制装进函数。现在你知道它内部发生了什么。

五种写法可以按固定顺序组合：`def f(位置参数, 默认参数=值, *args, **kwargs)`。把顺序记成「普通 → 默认 → 星号收集」：`**kwargs` 后面不能再跟任何参数（必报 `SyntaxError`）；`*args` 之后再写默认参数虽然合法，但那些参数会变成只能用关键字传递，初学阶段建议照标准顺序写。

## 9. 例题精讲：两个完整的函数

### 9.1 统计元音字母

```python
def count_vowels(text: str) -> int:
    """
    统计字符串中元音字母（a e i o u，含大小写）的个数
    :param text: 待统计的字符串
    :return: 元音字母个数
    """
    vowels = "aeiouAEIOU"
    counter = 0
    for letter in text:
        if letter in vowels:
            counter += 1
    return counter


print(count_vowels("Hello World"))        # 3
print(count_vowels("Python学习AEIOU"))    # 6
print(count_vowels("xyz"))                # 0
```

函数把「遍历 + 成员判断 + 计数」包成了一个可复用的查询接口。注意测试时特意传了带中文、全辅音的字符串——边界情况是例题的价值所在。

### 9.2 成绩列表统计分析

```python
def analyze_score(scores: list[int]) -> tuple[int, int, float] | None:
    """
    计算成绩列表的最高分、最低分、平均分
    :param scores: 成绩列表，如 [85, 92, 78, ...]
    :return: (最高分, 最低分, 平均分)；空列表返回 None
    """
    if not scores:
        return None

    highest = max(scores)
    lowest = min(scores)
    average = round(sum(scores) / len(scores), 1)
    return highest, lowest, average


student_scores = [88, 95, 76, 90, 84, 92, 79]
max_score, min_score, mean_score = analyze_score(student_scores)
print(f"最高分 = {max_score}，最低分 = {min_score}，平均分 = {mean_score}")
```

两个细节值得记住。第一，**空列表必须先挡掉**：`if not scores: return None`，否则空列表会让 `sum/len` 抛 `ZeroDivisionError`。第二，返回值类型标注用了 `tuple[int, int, float] | None`——竖线表示「或者是这个，或者是那个」，成功返回三元组、失败返回 `None`，调用方看签名就知道要判空。

## 10. 递归：函数调用自己

计算阶乘：`5! = 5 × 4 × 3 × 2 × 1`。用循环写毫无压力：

```python
def factorial_iter(n: int) -> int | None:
    """
    用循环计算 n 的阶乘
    :param n: 非负整数
    :return: n! 的结果；负数返回 None
    """
    if n < 0:
        return None
    result = 1
    for item in range(1, n + 1):
        result *= item
    return result


print(factorial_iter(8))    # 40320
```

换一个角度观察数学规律：`8! = 8 × 7!`，而 `7! = 7 × 6!`……一直到 `1! = 1`。也就是说 **n 的阶乘 = n 乘以 (n-1) 的阶乘**，公式 `f(n) = n × f(n-1)`。函数自己调用自己，就是递归：

```python
def factorial_rec(n: int) -> int | None:
    """
    用递归计算 n 的阶乘：f(n) = n * f(n - 1)
    :param n: 非负整数
    :return: n! 的结果；负数返回 None
    """
    if n < 0:
        return None
    if n == 0 or n == 1:
        return 1          # 递归出口
    return n * factorial_rec(n - 1)


print(factorial_rec(8))    # 40320
```

展开看 `factorial_rec(5)` 的计算过程：

```text
factorial_rec(5)
= 5 * factorial_rec(4)
= 5 * 4 * factorial_rec(3)
= 5 * 4 * 3 * factorial_rec(2)
= 5 * 4 * 3 * 2 * factorial_rec(1)
= 5 * 4 * 3 * 2 * 1
= 120
```

递归函数有两个不可缺少的部分：**出口**（`n == 1` 时直接返回 1，不再继续调用）和**递推**（`n * factorial_rec(n-1)`）。漏掉出口，函数会无限调用自己，直到报 `RecursionError`。阶乘这种问题用循环完全够用，递归的价值在于处理天然具有「大问题拆小问题」结构的数据，比如文件目录、组织架构、后面会遇到的嵌套 JSON——那些场景里递归往往是最自然的写法。

## 11. 综合案例：班级成绩分析

最后这个案例把前面所有东西串起来：类型标注、默认参数、容器、循环、多值返回。需求是传入班级名称和成绩列表，统计平均分、高于平均分和低于平均分的人数：

```python
def analyze_class(class_name: str, scores: list[int]) -> dict:
    """
    统计班级成绩
    :param class_name: 班级名称
    :param scores: 学生成绩列表，如 [88, 95, 76, ...]
    :return: 字典，包含班级名称、平均分、高于和低于平均分的人数
    """
    if not scores:
        return {
            "班级": class_name, "平均分": 0.0, "高于平均分人数": 0, "低于平均分人数": 0
        }

    average_score = sum(scores) / len(scores)
    upper_counter = 0
    lower_counter = 0
    for score in scores:
        if score > average_score:
            upper_counter += 1
        if score < average_score:
            lower_counter += 1

    return {
        "班级": class_name,
        "平均分": round(average_score, 2),
        "高于平均分人数": upper_counter,
        "低于平均分人数": lower_counter,
    }


result = analyze_class("AI大模型班级", [88, 95, 76, 90, 84, 92, 79])
print(result)
# {'班级': 'AI大模型班级', '平均分': 86.29, '高于平均分人数': 4, '低于平均分人数': 3}
```

设计上有两个选择值得体会：空列表时返回一个全 0 的字典而不是 `None`，让调用方永远能按同样的格式读取结果；返回字典而不是元组，因为四个结果的含义不同，字典的键就是自解释的标签。参数怎么设计、返回什么结构，比语法本身更能体现函数功底。

## 12. 函数在 AI 应用里的样子

到大模型应用里看，函数无处不在：

- **智能体的每个「工具」就是一个函数**：`web_search(query)`、`read_file(path)`。Agent 框架做的事，本质上是用代码解析模型的输出，再去调用对应函数；
- **调用模型 API 全是关键字参数**：`client.chat.completions.create(model=..., messages=..., temperature=...)`，你在第 8 节学的关键字参数和 `**kwargs` 就是它的语法基础；
- **消息处理管道是函数串联**：清洗输入 → 拼提示词 → 调模型 → 解析输出，每一环一个函数，像第 5 节的嵌套调用一样层层传递。

把函数写清楚（好的名字、诚实的类型标注、完整的 docstring），直接决定了 AI 代码的可维护性——包括你以后让大模型帮你改代码时，它能不能看懂你的接口。

## 13. 常见坑清单

1. **类型标注不挡错**：标注 `int` 却传 `99.9`，程序照跑；传 `"99"` 这类真正不兼容的值，还是会在运算符处抛 `TypeError`。标注是给人看、给编辑器看的，不是运行时校验；
2. **函数内同名赋值 ≠ 修改全局**：`fun1` 里写 `num1 = 100` 只是创建了局部变量，想改全局必须 `global num1`；
3. **`global` 满天飞**：能用参数和返回值解决的，不要动全局变量，否则函数行为取决于看不见的外部状态；
4. **默认参数没放在最后**：`def f(a=1, b)` 直接报 `SyntaxError`；
5. **`*args` 收到空元组**：函数里直接 `max(args)`，一次调用不传参就 `ValueError`，进函数先判空；
6. **解包个数不匹配**：`a, b = f()` 但 `f` 返回三个值，报 `ValueError: too many values to unpack`；
7. **递归没有出口**：少了终止条件，跑到解释器递归深度上限，报 `RecursionError: maximum recursion depth exceeded`。

## 14. 课后练习

1. 写函数 `triangle_area(base, height)`，根据底和高计算三角形面积，带类型标注和说明文档；
2. 写函数 `score_level(score)`：≥90 返回 `"A"`，≥75 返回 `"B"`，≥60 返回 `"C"`，其余返回 `"D"`；
3. 写函数 `is_palindrome(text)` 判断回文串，返回 `bool`（提示：`text[::-1]` 反转后比较，空字符串按 `False` 处理）；
4. 写函数 `convert_seconds(total_seconds)`，把总秒数换算成 `(小时, 分钟, 秒)` 三元组（提示：`//` 和 `%` 配合 3600、60）；
5. 写函数 `triangle_type(a, b, c)`，判定三边能构成等边、等腰、普通三角形，还是根本构不成三角形（提示：任意两边之和必须大于第三边）。

### 加餐练习：三个 AI 场景

**练习一：智能体 Token 用量统计（\*args 综合运用）**

写函数 `token_stats(*tokens)`，接收任意多个 token 数（整数），返回三项结果：总消耗、单次最大消耗、平均消耗（保留 1 位小数）。要求必须用 `*args` 接收；必须写 docstring 并给参数和返回值加类型注解；一次都不传时返回 `(0, 0, 0.0)` 不能报错；用两组以上数据测试，输出用 f-string 格式化。这道题同时踩中第 8 节的不定长参数、第 3 节的文档、第 4 节的标注和第 9 节的空值防御。

**练习二：智能体回复卡片构建（默认参数 + 切片）**

写函数 `build_agent_reply(text, style='简洁', max_len=50)`：`text` 是模型原始回复，超过 `max_len` 的部分截断并在末尾加 `...`（用切片）；返回字典 `{'内容': ..., '风格': ..., '原长度': ...}`，其中「原长度」是原始回复的字符数。分别用「只传 text」「传 text 和 style」「三个都传」三种方式各调用一次，体会第 8.3 节默认参数的三种传参形态。

**练习三：斐波那契数列（递归进阶）**

数列 `0, 1, 1, 2, 3, 5, 8, 13, ...` 满足 `f(0) = 0`，`f(1) = 1`，从第三项起 `f(n) = f(n-1) + f(n-2)`。写递归函数 `fib_rec(n)` 返回第 n 项（出口是 `n < 2` 时直接返回 `n`），测试 `fib_rec(7)` 应得 13。再思考：为什么 `fib_rec(900)` 会明显变慢？（提示：画出 `f(5)` 的展开树，数一数 `f(2)` 被重复计算了几次——这个问题的工程解法叫「记忆化」，留给以后的算法篇。）

## 15. 学习检查表

读完这篇，你应该能清楚回答：

1. 多返回值的本质是什么类型？怎么一次接住多个返回值？
2. docstring 写在哪里？`help()` 打印的内容来自哪？
3. 类型标注会强制检查传入的参数吗？
4. 函数内给同名变量赋值，全局变量会变吗？什么情况下必须用 `global`？
5. 位置参数、关键字参数、默认参数、`*args`、`**kwargs` 的定义顺序是什么？
6. `args` 和 `kwargs` 在函数内部分别是什么类型？
7. 递归函数必须包含哪两部分？漏掉会怎样？

下一篇 [Python 匿名函数与模块](/post/python-lambda-modules/) 继续函数的进阶之路：把函数当参数传（高阶函数）、用 `lambda` 一句话定义函数，以及代码多了怎么用模块和包组织——你天天写的 `from xxx import yyy` 就在那一篇里拆解。
