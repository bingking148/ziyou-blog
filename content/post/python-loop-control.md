---
title: 'Python 循环控制：for、range、嵌套循环与登录实战'
weight: 5
date: 2026-10-20T09:00:00+08:00
lastmod: 2026-10-21T10:00:00+08:00
cover: /images/covers/python-loop-control-cover.jpg
categories: ['人工智能', '人工智能学习']
tags: ['Python', '编程基础', '循环', '流程控制']
description: '深入 Python 流程控制第二部分：for 与 while 的选择、range 数字序列、嵌套循环、break/continue，并通过登录验证和猜数字游戏写出可运行的小项目。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇 [Python 控制流与函数](/post/python-control-flow-functions/) 已经写过 `if`、`while`、`for` 和函数的基本用法。这一篇继续把“循环”这一块补深：什么时候用 `while`，什么时候用 `for`；`range()` 怎么生成数字序列；嵌套循环怎么控制行和列；`break`、`continue` 如何改变循环的执行路线。

循环看起来是语法问题，实际是程序设计问题。大模型应用里也经常用到它：批量处理一组提示词、遍历 API 返回的多条消息、重试失败请求、给一组文档做切分和检索，都离不开循环。

## 1. 先分清 while 和 for

`while` 关心的是**条件**：只要条件成立，就一直执行。

```python
count = 0

while count < 3:
    print("当前次数：", count)
    count += 1
```

`for` 关心的是**遍历对象**：从字符串、列表、`range()` 等数据集中逐个取出元素。

```python
message = "AI"

for char in message:
    print(char)
```

两者可以这样选：

| 场景 | 更自然的写法 | 原因 |
|---|---|---|
| 不知道要循环多少次，只知道继续条件 | `while` | 例如一直等待用户输入，直到密码正确 |
| 遍历列表、字符串、字典、文件行 | `for` | 数据集已经存在 |
| 已知循环次数 | `for + range()` | 次数明确，代码更短 |
| 请求失败后重试，最多重试 3 次 | `for + range()` 或 `while + 计数器` | 有上限，也有条件 |

新手更容易误用 `while` 写计数循环，例如：

```python
i = 0
while i < 5:
    print(i)
    i += 1
```

能运行，但要自己维护初始值、条件和更新语句。等价写法更简洁：

```python
for i in range(5):
    print(i)
```

## 2. for 循环的完整结构

`for` 的基本语法是：

```python
for 元素 in 待处理数据集:
    对元素做处理
```

例如遍历字符串：

```python
message = "Hello-Python"

for char in message:
    print(char)
else:
    print("循环结束")
```

`else` 是可选的。它有一点特殊：**循环正常结束时执行；如果被 `break` 提前打断，则不执行**。

```python
for n in [3, 7, 9]:
    if n % 2 == 0:
        print("发现偶数，提前结束")
        break
else:
    print("没有发现偶数")
```

这个写法常用于“查找型循环”：找遍了都没找到，才走 `else`。

## 3. range：生成数字序列

`range()` 不是列表，而是一个按需生成数字的对象。它有三个常用形式。

### 形式一：range(end)

从 0 开始，到 `end` 前面一个数结束。

```python
for i in range(5):
    print(i)
```

输出：

```text
0
1
2
3
4
```

注意：**不包含 5**。

### 形式二：range(start, end)

从 `start` 开始，到 `end` 前面一个数结束。

```python
for i in range(2, 8):
    print(i)
```

输出：`2, 3, 4, 5, 6, 7`。

### 形式三：range(start, end, step)

`step` 是步长，也就是每次增加多少。

```python
for i in range(0, 10, 2):
    print(i)
```

输出：

```text
0
2
4
6
8
```

步长也可以是负数，用于倒序：

```python
for i in range(5, 0, -1):
    print(i)
```

输出：`5, 4, 3, 2, 1`。

### range 的三条记忆规则

1. 开始位置默认是 `0`；
2. 结束位置永远取不到；
3. 步长默认是 `1`，正数递增，负数递减。

## 4. 案例：用 for 和 range 做数值统计

### 案例 1：计算 1~100 所有奇数之和

要包含 100，结束位置必须写 `101`。

```python
total = 0

for n in range(1, 101):
    if n % 2 == 1:
        total += n

print("1~100 的奇数和：", total)
```

也可以直接让步长为 2：

```python
total = 0

for n in range(1, 101, 2):
    total += n

print("1~100 的奇数和：", total)
```

第二种更好，因为它少做了一半无意义的判断。

### 案例 2：计算 100~500 之间所有 3 的倍数之和

```python
total = 0

for n in range(102, 501, 3):
    total += n

print("100~500 之间 3 的倍数之和：", total)
```

这里从 `102` 开始，因为 102 是 100 之后第一个 3 的倍数。写成下面这样也可以：

```python
total = 0

for n in range(100, 501):
    if n % 3 == 0:
        total += n

print(total)
```

区别在于：第一种直接生成需要的数字，第二种生成所有数字再筛选。数据量小没有明显差别，数据量大时第一种更高效。

## 5. 嵌套循环：外层控制行，内层控制列

嵌套循环是“循环里面再套循环”。常见结构：

```python
for 外层元素 in 外层数据集:
    做外层的事
    for 内层元素 in 内层数据集:
        做内层的事
```

最容易踩的坑是缩进。写在 `for` 里面的代码才会被重复执行；写在外面，就只执行一次。

### 案例：打印 3 行 4 列星号

```python
for row in range(1, 4):
    for col in range(1, 5):
        print("*", end="")
    print()
```

输出：

```text
****
****
****
```

理解方式：

- 外层循环执行 3 次，对应 3 行；
- 每执行一行，内层循环打印 4 个星号；
- 内层结束后，`print()` 换行。

### 案例：九九乘法表

```python
for row in range(1, 10):
    for col in range(1, row + 1):
        print(f"{col}*{row}={row * col}", end="\t")
    print()
```

这里 `row` 表示第二个乘数，`col` 表示第一个乘数。第一行只有 `1*1`，第二行有 `1*2`、`2*2`，所以内层范围是 `range(1, row + 1)`。

### 嵌套循环练习

以下三个练习建议自己写一遍：

1. 输入直角边长度，打印等腰直角三角形；
2. 输入层数，打印数字金字塔；
3. 打印 8×8 国际象棋棋盘，交替输出黑白格。

它们训练的都是同一种能力：**把二维图形拆成行和列的循环关系**。

## 6. break 和 continue

`break` 用于结束整个循环：

```python
for n in range(1, 11):
    if n == 8:
        break
    print(n)
```

输出到 7 就停止。

`continue` 只跳过本轮循环，继续下一轮：

```python
for n in range(1, 11):
    if n == 4:
        continue
    if n == 8:
        break
    print(n)
```

输出：

```text
1
2
3
5
6
7
```

可以这么记：

- `break`：我不玩了，直接结束；
- `continue`：这轮跳过，下一轮继续；
- `return`：如果写在函数里，直接结束函数。

它们只能出现在循环里，不能单独写在外面。

## 7. 实战：限制 5 次机会的登录验证

需求：

1. 正确账号有 `admin/666888`、`zhangsan/123456`、`taoge/888666`；
2. 用户最多输入 5 次；
3. 用户名和密码不能为空；
4. 登录成功输出欢迎语；
5. 5 次都失败则锁定本次操作。

```python
accounts = {
    "admin": "666888",
    "zhangsan": "123456",
    "taoge": "888666",
}

for attempt in range(1, 6):
    username = input("请输入用户名：").strip()
    password = input("请输入密码：").strip()

    if not username or not password:
        print("用户名和密码不能为空。")
        print(f"剩余机会：{5 - attempt}")
        continue

    if accounts.get(username) == password:
        print(f"登录成功，欢迎你，{username}！")
        break

    print("用户名或密码错误，请重新输入！")
    print(f"剩余机会：{5 - attempt}")
else:
    print("错误次数过多，暂时不允许继续操作。")
```

这里用到四个知识点：

1. `for + range(1, 6)` 控制最多 5 次；
2. `continue` 处理空输入，不消耗正常登录判断；
3. `break` 在登录成功后退出；
4. `for...else` 在没有被 `break` 打断时输出锁定提示。

注意：这里使用 `accounts.get(username) == password`，比先取 `accounts[username]` 再比较更安全。因为用户名不存在时，`get()` 返回 `None`，不会抛出 `KeyError`。

## 8. 实战：猜数字游戏

需求：

1. 系统随机生成一个数字；
2. 用户不断输入猜测值；
3. 猜大、猜小都给出提示；
4. 猜对后结束游戏。

```python
import random

answer = random.randint(1, 100)
count = 0

while True:
    raw = input("请输入 1~100 之间的整数：")

    if not raw:
        print("输入不能为空。")
        continue

    try:
        guess = int(raw)
    except ValueError:
        print("请输入有效整数。")
        continue

    if guess < 1 or guess > 100:
        print("数字必须在 1~100 之间。")
        continue

    count += 1

    if guess < answer:
        print("猜小了。")
    elif guess > answer:
        print("猜大了。")
    else:
        print(f"猜对了！答案是 {answer}，你用了 {count} 次。")
        break
```

这个例子使用 `while True`，因为程序不知道用户会猜多少次。退出条件不是固定次数，而是“猜对”。

## 9. 循环在 AI 应用里的典型场景

### 场景 1：批量发送提示词

```python
questions = [
    "用一句话解释 Transformer。",
    "用比喻解释注意力机制。",
    "总结 Python 循环的用法。",
]

for i, question in enumerate(questions, start=1):
    print(f"任务 {i}：{question}")
```

### 场景 2：遍历多轮对话历史

```python
messages = [
    {"role": "system", "content": "你是一个耐心的 Python 老师。"},
    {"role": "user", "content": "for 和 while 有什么区别？"},
    {"role": "assistant", "content": "for 适合遍历，while 适合条件循环。"},
]

for message in messages:
    print(message["role"], ":", message["content"])
```

### 场景 3：失败重试

```python
for attempt in range(1, 4):
    print(f"第 {attempt} 次请求模型接口")

    # 这里放真实请求逻辑
    # 如果成功，用 break 结束
    # 如果失败，继续下一轮
```

真正的 API 项目还会加入等待时间、异常捕获和日志，但主干仍然是循环。

## 10. 常见错误清单

### 1. while 条件永远成立

```python
i = 1
while i < 5:
    print(i)
```

缺少 `i += 1`，程序会一直执行。开发中可按 `Ctrl + C` 中断。

### 2. range 结束值写错

```python
for i in range(1, 100):
    print(i)
```

这段代码不包含 100。要包含 100，应写 `range(1, 101)`。

### 3. 嵌套循环缩进错误

```python
for row in range(3):
    for col in range(4):
        print("*", end="")
print()
```

`print()` 写在了外层循环外，只会换行一次，无法得到三行。

### 4. 混淆 break 和 continue

`break` 结束整个循环；`continue` 只结束当前这一轮。

### 5. for...else 被误解

`for...else` 的 `else` 不是“循环失败”，而是“循环没有被 `break` 打断，正常走完了”。

## 11. 课后练习

1. 计算 1~1000 之间所有 5 的倍数之和；
2. 统计字符串 `"akiwksjakdiklowiqaamnvbamvaxnsjdsjkaaxkjd"` 中字母 `a` 和 `k` 的数量；
3. 打印九九乘法表；
4. 写一个限制 5 次机会的登录程序；
5. 写一个猜数字游戏，并统计用户猜测次数。

## 12. 学习检查表

读完这篇，你应该能清楚回答：

1. `while` 和 `for` 分别适合什么场景？
2. `range(1, 101)` 会生成哪些数字？
3. 嵌套循环中，外层和内层分别控制什么？
4. `break`、`continue`、`return` 有什么区别？
5. `for...else` 什么时候执行？

下一篇 [Python 数据容器](/post/python-data-containers/) 会把数据组织方式补上。你会看到列表、字符串、元组、集合和字典如何配合循环处理批量数据，这也是读写 API 返回 JSON 的前置知识。
