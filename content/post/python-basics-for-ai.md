---
title: 'Python 基础：从字面量、变量到运算符，一篇讲清入门语法'
weight: 3
date: 2026-10-16T09:02:00+08:00
lastmod: 2026-10-16T09:02:00+08:00
cover: /images/covers/python-basics-for-ai-cover.jpg
categories: ['人工智能', '人工智能学习']
tags: ['Python', '编程基础', '大模型', '入门教程']
description: '一篇面向大模型应用入门的 Python 基础文章，讲清字面量、变量、数据类型、字符串、输入输出和运算符，并附完整示例与常见坑。'
math: false
mermaid: false
comments: true
toc: true
---
Python 是大模型应用开发里最常见的入门语言。原因很朴素：语法接近自然语言，写起来短；生态成熟，调 API、处理 JSON、写自动化脚本、搭智能体工具都很方便。这篇文章不追求把 Python 全部讲完，而是把入门阶段最核心的一块讲透：数据怎么写、变量怎么存、类型怎么判断、输入输出怎么做、运算符怎么用。

## 1. 先建立一个心智模型

程序本质上是在做三件事：

1. **接收数据**：比如用户输入年龄、读取配置、接收 API 响应。
2. **处理数据**：比如把字符串转成数字、计算余额、判断条件是否成立。
3. **输出结果**：比如打印到控制台、写入文件、返回模型回答。

所以 Python 基础语法的重点也可以概括成：

- 用**字面量**表示数据本身；
- 用**变量**给数据起名字；
- 用**数据类型**约束数据的性质；
- 用**运算符**处理数据；
- 用 `input()` 和 `print()` 完成最基础的人机交互。

## 2. 字面量：直接写进代码里的值

字面量（Literal）就是代码里直接书写的固定值。例如：

```python
10
3.14
True
"Python"
None
```

常见字面量有五类：

| 类型 | 写法示例 | 说明 |
|---|---|---|
| 整数 `int` | `10`、`18`、`-5`、`0` | 没有小数点 |
| 浮点数 `float` | `8.5`、`3.14`、`1.0`、`-3.5` | 带小数点 |
| 布尔 `bool` | `True`、`False` | 表示真假 |
| 字符串 `str` | `"人生苦短，我用Python"` | 引号包起来的文本 |
| 空值 `NoneType` | `None` | 表示“没有值” |

注意两个细节：

- Python 的布尔值首字母必须大写：`True`、`False`，不能写成 `true`、`false`。
- `None` 只有一个值，表示空。它不是 `0`，也不是空字符串。

布尔值还有一个容易被忽略的点：它们本质上可以当数字用。

```python
print(True + True)  # 2
```

因为参与数学运算时，`True` 会变成 `1`，`False` 会变成 `0`。

## 3. 变量：给数据起个名字

变量是程序里存放数据的容器。定义格式是：

```python
变量名 = 值
```

例如：

```python
num = 1114.1
print(num)

num = 1114.2
print(num)
```

这里的 `=` 不是数学里的“等于”，而是赋值号，表示把右边的值存进左边的变量。

### 变量的三条基本规则

1. **先赋值，再使用。**  
   下面这样会报错：

   ```python
   print(age)
   age = 18
   ```

2. **同一个变量同一时刻只保存一个值。**  
   重新赋值会覆盖旧值。

3. **可以连续赋值或多变量赋值。**

   ```python
   a, b = 1, "Python"
   ```

### Python 是动态类型语言

Python 变量本身没有固定类型，变量里存的数据才有类型。

```python
num = 10
print(type(num))  # <class 'int'>

num = "Python"
print(type(num))  # <class 'str'>
```

这句话很重要：**`type(变量)` 查看的是变量当前存储的数据的类型，而不是变量本身的类型。**

## 4. 标识符：变量、函数、类的名字怎么起

标识符就是程序员起的名字，比如变量名、函数名、类名。

### 硬规则

违反会直接报错：

1. 只能包含字母、数字、下划线。
2. 不能以数字开头。  
   `name6` 合法，`6name` 非法。
3. 不能使用 Python 关键字。  
   例如 `True`、`False`、`None`、`and`、`or`、`if`、`else`、`for`、`while`。
4. 严格区分大小写。  
   `age`、`Age`、`AGE` 是三个不同的名字。

### 软规范

不遵守不会报错，但会让代码难读：

- 见名知意：`user_age` 优于 `a`。
- 多个单词用下划线连接：`total_price`。
- 变量名通常全小写，这种风格叫蛇形命名法，也就是 `snake_case`。

Python 官方风格指南 PEP 8 推荐这种写法，地址是：<https://peps.python.org/pep-0008>

### 经典案例：交换两个变量

错误写法：

```python
a = 10
b = 20

a = b
b = a

print(a, b)  # 20 20
```

问题在于执行 `a = b` 后，`a` 原来的值 `10` 已经丢了。

正确写法一：使用临时变量。

```python
a = 10
b = 20

c = a
a = b
b = c

print(a, b)  # 20 10
```

正确写法二：Python 的多元赋值。

```python
a = 10
b = 20

a, b = b, a

print(a, b)  # 20 10
```

第二种写法更 Pythonic。可以理解为等号右边先整体求值，再分别赋给左边。

## 5. 数据类型：先掌握五种基础类型

入门阶段先掌握这五种：

| 类型名 | 含义 | 示例 |
|---|---|---|
| `int` | 整数 | `10`、`-5` |
| `float` | 浮点数 | `8.5`、`3.14` |
| `str` | 字符串 | `"Python"` |
| `bool` | 布尔 | `True`、`False` |
| `NoneType` | 空值 | `None` |

列表、元组、集合、字典属于后面的数据容器，入门阶段可以先不急着深入，但要知道它们的存在。

### 查类型：type()

```python
num = 5.0
print(type(num))  # <class 'float'>
```

### 判断类型：isinstance()

```python
num = 5.0
print(isinstance(num, int))   # False
print(isinstance(num, float)) # True
```

`type()` 用来查看类型，`isinstance()` 用来判断某个数据是不是某个类型。

一个新手高频坑：标点必须用英文符号。

```python
# 错误：中文逗号
print(isinstance(num，int))

# 正确：英文逗号
print(isinstance(num, int))
```

很多“代码看起来没错却跑不起来”的问题，最后都是中文括号、中文引号、中文逗号造成的。

## 6. 字符串：三种写法、转义和字符概念

字符串用来表示文本，有三种常见写法：

```python
s1 = "Hello"
s2 = 'Python'
s3 = """尊敬的客户:
    感谢您选择我们公司的产品。"""
```

单引号和双引号基本等效，项目里保持一种风格即可。三引号适合多行文本，会保留换行和缩进。

### 转义字符

当字符串内容和引号冲突时，可以用反斜杠转义：

```python
s = 'It\'s very interesting'
print(s)
```

常见转义字符：

| 写法 | 含义 |
|---|---|
| `\'` | 单引号 |
| `\"` | 双引号 |
| `\n` | 换行 |
| `\t` | 制表符，类似缩进 |

### 字符

字符是文本世界的基本单位。一个字母、一个数字、一个标点、一个汉字，都可以算一个字符。

```python
s = "Python"
print(s[0])  # P
print(s[-1]) # n
```

这里先建立直觉：字符串是有顺序的，可以通过下标访问字符。

## 7. 字符串拼接与格式化

### 用 + 拼接

```python
name = "涛哥"
age = 18

message = "大家好，我是" + name + "，今年" + str(age) + "岁"
print(message)
```

注意：字符串不能直接和非字符串拼接。

```python
# 错误
# message = "今年" + age

# 正确
message = "今年" + str(age)
```

这种写法的问题很明显：

- 拼接繁琐；
- 需要反复调用 `str()`；
- 引号太多，可读性差。

### 用 % 占位符

```python
name = "涛哥"
age = 18

print("大家好, 我是 %s , 今年 %s 岁" % (name, age))
```

`%s` 表示把变量转成字符串后填进去。占位符数量要和后面的变量数量一致。

### 用 f-string，推荐

```python
name = "涛哥"
age = 18

print(f"大家好, 我是 {name}, 今年 {age} 岁")
```

f-string 的优点是直观，花括号里可以直接放变量，甚至可以放表达式：

```python
price = 9.9
count = 3
print(f"总价：{price * count}")
```

大多数现代 Python 代码都优先使用 f-string。

## 8. input() 与 print()：最基础的人机交互

### input()

`input()` 用来获取键盘输入：

```python
name = input("请输入你的名字：")
print(f"你好，{name}")
```

最重要的规则是：

> **`input()` 得到的永远是字符串。**

即使你输入的是数字：

```python
age = input("请输入年龄：")
print(type(age))  # <class 'str'>
```

所以如果要做数学计算，必须先转换类型。

### print()

`print()` 把数据输出到控制台：

```python
print("Hello")
print(123)
print(f"1 + 2 = {1 + 2}")
```

也可以一次输出多个值：

```python
name = "Python"
version = 3.12
print(name, version)
```

## 9. 类型转换：字符串和数字之间怎么变

常见转换函数有四个：

| 函数 | 作用 | 示例 |
|---|---|---|
| `int()` | 转成整数 | `int("18")` 得到 `18` |
| `float()` | 转成浮点数 | `float("3.14")` 得到 `3.14` |
| `str()` | 转成字符串 | `str(18)` 得到 `"18"` |
| `bool()` | 转成布尔值 | `bool(0)` 得到 `False` |

### 典型场景：ATM 取款

```python
balance = 10000

password = input("请输入密码：")
amount = float(input("请输入取款金额："))

if amount <= balance:
    balance -= amount
    print(f"取款成功，当前余额：{balance}")
else:
    print("余额不足")
```

这里 `amount` 必须转成数字，否则无法和 `balance` 做大小比较和减法运算。

### 转换失败的常见报错

```python
age = int("abc")
```

会抛出：

```text
ValueError: invalid literal for int() with base 10: 'abc'
```

意思是 `"abc"` 不能被转换成整数。

## 10. 算术运算符

Python 常用算术运算符如下：

| 运算符 | 含义 | 示例 |
|---|---|---|
| `+` | 加法 | `1 + 5` |
| `-` | 减法 | `8 - 3` |
| `*` | 乘法 | `3 * 8` |
| `/` | 除法，结果是浮点数 | `10 / 5` 得 `2.0` |
| `//` | 整除，只保留整数部分 | `10 // 3` 得 `3` |
| `%` | 取余 | `10 % 3` 得 `1` |
| `**` | 幂运算 | `10 ** 3` 得 `1000` |

两个易混点：

1. `/` 的结果永远是浮点数。

   ```python
   print(10 / 5)      # 2.0
   print(10 // 5)     # 2
   ```

2. `%` 常用于判断倍数关系。

   ```python
   num = 10
   print(num % 2 == 0)  # True
   ```

### 浮点数精度问题

```python
print(0.1 + 0.2)          # 0.30000000000000004
print(0.1 + 0.2 == 0.3)   # False
```

这不是 Python 的 bug，而是计算机底层用二进制表示小数导致的。所有主流编程语言都有类似现象。涉及金额时，通常要用 Decimal 或整数分来处理。

## 11. 赋值运算符

基础赋值是 `=`：

```python
num = 10
```

复合赋值运算符是在旧值基础上更新：

| 写法 | 等价于 |
|---|---|
| `num += 2` | `num = num + 2` |
| `num -= 2` | `num = num - 2` |
| `num *= 2` | `num = num * 2` |
| `num /= 2` | `num = num / 2` |
| `num %= 2` | `num = num % 2` |
| `num //= 2` | `num = num // 2` |
| `num **= 2` | `num = num ** 2` |

例如：

```python
num = 10
num += 5
print(num)  # 15

num *= 2
print(num)  # 30
```

## 12. 比较运算符

比较运算符用来比较两个值，结果是布尔值：

| 运算符 | 含义 |
|---|---|
| `==` | 等于 |
| `!=` | 不等于 |
| `>` | 大于 |
| `>=` | 大于等于 |
| `<` | 小于 |
| `<=` | 小于等于 |

```python
print(10 == 10)   # True
print(10 != 9)    # True
print(10 > 20)    # False
print(10 >= 10)   # True
```

注意 `=` 是赋值，`==` 是判断相等。

```python
age = 18       # 赋值
print(age == 18) # 判断
```

几个常见业务判断：

```python
# 判断偶数
num % 2 == 0

# 判断余额是否足够
balance >= price

# 判断库存是否足够
stock >= count

# 筛选不超过 100 元的商品
price <= 100
```

## 13. 逻辑运算符：and、or、not

### and

两边都为 `True`，结果才是 `True`。

```python
username_ok = True
password_ok = True

print(username_ok and password_ok)  # True
```

账号密码登录通常用 `and`，因为用户名和密码都必须正确。

### or

只要一边为 `True`，结果就是 `True`。

```python
scan_ok = False
password_ok = True
sms_ok = False

print(scan_ok or password_ok or sms_ok)  # True
```

如果登录方式是扫码、密码、短信任选一种，它们之间就是 `or`。

### not

取反。

```python
is_vip = False
print(not is_vip)  # True
```

### 范围判断

判断一个数是否在 10 到 20 之间：

```python
num = 15

if 10 <= num and num <= 20:
    print("在范围内")
else:
    print("不在范围内")
```

## 14. 综合练习：写一个简单的成绩小工具

下面这个例子综合使用变量、输入、类型转换、算术运算符、比较运算符和 f-string：

```python
name = input("请输入学生姓名：")

chinese = float(input("请输入语文成绩："))
math = float(input("请输入数学成绩："))
english = float(input("请输入英语成绩："))

total = chinese + math + english
average = total / 3

print("\n----- 成绩单 -----")
print(f"姓名：{name}")
print(f"总分：{total}")
print(f"平均分：{average:.2f}")

if average >= 90:
    print("等级：优秀")
elif average >= 80:
    print("等级：良好")
elif average >= 60:
    print("等级：及格")
else:
    print("等级：不及格")
```

运行示例：

```text
请输入学生姓名：小明
请输入语文成绩：92
请输入数学成绩：88
请输入英语成绩：79

----- 成绩单 -----
姓名：小明
总分：259.0
平均分：86.33
等级：良好
```

## 15. 新手最容易踩的 8 个坑

1. **中文标点**  
   `,`、`"`、`'`、`()` 必须是英文符号。

2. **input 结果直接参与计算**  
   `input()` 得到字符串，要先 `int()` 或 `float()`。

3. **混淆 = 和 ==**  
   `=` 是赋值，`==` 是判断相等。

4. **变量没定义就使用**  
   Python 不会自动猜你要用什么变量。

5. **除法和整除混淆**  
   `/` 得浮点数，`//` 得整数部分。

6. **布尔值大小写错误**  
   必须写 `True`、`False`，不是 `true`、`false`。

7. **浮点数精度问题**  
   不要直接用 `==` 判断两个浮点数是否完全相等。

8. **变量命名太随意**  
   `a`、`b`、`c` 短期省事，长期维护很痛苦。

## 16. 学完这篇，你应该能回答这些问题

1. **字面量和变量有什么区别？**  
   字面量是数据本身，变量是给数据起的名字。

2. **Python 是动态类型语言是什么意思？**  
   变量可以在运行过程中指向不同类型的数据，类型跟着值走。

3. **为什么 input() 后经常要 int()？**  
   因为 `input()` 返回字符串，不能直接做数学计算。

4. **/ 和 // 有什么区别？**  
   `/` 是普通除法，结果是浮点数；`//` 是整除，只保留整数部分。

5. **and 和 or 怎么选？**  
   条件必须同时满足用 `and`，多个条件满足任意一个即可用 `or`。

掌握这些内容后，你已经能看懂大多数 Python 入门脚本，也能为后面调用大模型 API、处理 JSON、写多轮对话脚本打下基础。






