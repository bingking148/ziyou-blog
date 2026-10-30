---
title: 'Python 第 4 篇：range、嵌套循环与石头剪刀布'
weight: 4
date: 2026-10-20T09:00:00+08:00
updatedDate: 2026-10-30T10:00:00+08:00
cover: /images/covers/python-loop-control-cover.jpg
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '循环', '流程控制']
description: '把循环讲透：range 的三种形式与五个易错点、嵌套循环怎么控制行列、累加与计数两类经典循环模式，最后用它们写出石头剪刀布游戏。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇的猜数字游戏里，你已经会写 `while True` 和 `for i in range(3)` 了。那这一篇讲什么？

讲**那些"能跑但会写错"的地方**。

循环是入门阶段最容易出微妙 bug 的语法：`range(1, 100)` 少了 100、嵌套循环内外层变量搞混、累加器没初始化。这些错误不会报错，只会给你一个错误的结果——比报错更难发现。

所以这篇换个打法：先把循环的零件彻底拆清楚，再用它们造一个**石头剪刀布**。这个游戏正好需要四样东西：`range` 做回合、嵌套循环打印战绩表、累加器算胜率、`while` 做「再来一局」。

## 1. range：你以为懂了，但有五个坑

`range()` 生成一串数字。它有三个形式，全都记在下面这张表里：

| 写法 | 生成 | 例子 |
|---|---|---|
| `range(end)` | `0` 到 `end-1` | `range(3)` → `0 1 2` |
| `range(start, end)` | `start` 到 `end-1` | `range(2, 6)` → `2 3 4 5` |
| `range(start, end, step)` | 从 `start` 开始，每次加 `step` | `range(0, 10, 3)` → `0 3 6 9` |

三条记忆规则：

1. **开始位置默认 0**；
2. **结束位置永远取不到**（左闭右开）；
3. **步长默认 1**，可以是负数。

现在看五个真实的坑。

### 坑一：想包含 100，却写了 range(1, 100)

```python
for i in range(1, 100):
    pass
print(i)      # 99 ← 不是 100！
```

想包含 100 就得写 `range(1, 101)`。**这是入门阶段最高频的 off-by-one 错误。**

### 坑二：步长为负时，起止也要反过来

```python
for i in range(5, 0, -1):
    print(i)      # 5 4 3 2 1
```

如果你写成 `range(0, 5, -1)`，什么都不会输出——因为从 0 开始往负数走，永远到不了 5。**方向反了，range 直接给你空序列，不报错。**

### 坑三：range 不是列表

```python
print(range(5))          # range(0, 5)  ← 不是 [0,1,2,3,4]
print(list(range(5)))    # [0, 1, 2, 3, 4]
```

`range` 是一个「按需生成」的对象，你用 `for` 遍历它时才一个个算出来。好处是省内存——`range(100000000)` 几乎不占内存，但 `list(range(100000000))` 会直接把你电脑撑爆。

知道这一点就行，日常用 `for` 遍历不需要转换。

### 坑四：range 里只能是整数

```python
range(0, 1, 0.1)     # TypeError
```

想要小数序列，用列表推导式或 `while`：

```python
x = 0.0
while x < 1.0:
    print(round(x, 1))
    x += 0.1
```

（列表推导式在第 5 篇讲。）

### 坑五：循环里改了列表，range 不会跟着变

```python
items = [1, 2, 3, 4]
for i in range(len(items)):
    if items[i] % 2 == 0:
        items.pop(i)      # 边遍历边删，索引全乱套了
```

这是个经典陷阱，第 5 篇处理列表时会给出正确写法。现在只要记住：**遍历的时候不要修改正在遍历的东西**。

## 2. 两种经典循环模式

90% 的循环都在做这两件事之一：**累加**和**计数**。认清模式，写起来就不会漏东西。

### 2.1 累加模式：准备一个「桶」

```python
total = 0                    # ① 桶先清空
for n in range(1, 101):
    if n % 2 == 1:
        total += n           # ② 符合条件就往里倒
print(total)                 # 2500
```

三步不能少：**初始化 → 遍历 → 累加**。少了第一步会报 `NameError`。

还能更省事——既然只要奇数，直接让步长是 2，连 `if` 都省了：

```python
total = 0
for n in range(1, 101, 2):
    total += n
print(total)                 # 2500
```

**判断一个循环写得好不好，就看它有没有做无用功。** 上面第二种写法少跑 50 次循环、少做 50 次判断。

### 2.2 计数模式：满足条件就 +1

```python
scores = [88, 95, 61, 72, 59, 90]
pass_count = 0

for s in scores:
    if s >= 60:
        pass_count += 1

print(f"及格 {pass_count} 人，及格率 {pass_count / len(scores):.0%}")
```

`len(scores)` 是列表长度。`:0%` 是 f-string 的百分比格式，`0.667` 会显示成 `67%`。

### 2.3 找最大值：不用 max() 怎么写

这是计数模式的变体，面试常考，也最能检验你是否真的理解循环：

```python
scores = [88, 95, 61, 72, 59, 90]

biggest = scores[0]        # 先假设第一个最大
for s in scores:
    if s > biggest:        # 遇到更大的就更新
        biggest = s

print(biggest)             # 95
```

注意 `biggest` 千万别初始化成 `0`——如果全是负数，结果就错了。**初始化成第一个元素才是安全的。**

## 3. 嵌套循环：外层管行，内层管列

嵌套循环就是循环里再套一个循环。理解它的关键在于：**外层每转一圈，内层要完整转完一圈。**

```python
for i in range(1, 4):          # 外层：i = 1, 2, 3
    for j in range(1, 4):      # 内层：每次 j 从 1 到 3 跑一遍
        print(f"({i},{j})", end=" ")
    print()                    # 内层跑完，换行
```

输出：

```text
(1,1) (1,2) (1,3)
(2,1) (2,2) (2,3)
(3,1) (3,2) (3,3)
```

一共执行 3 × 3 = 9 次内层循环。**总次数是外层次数乘内层次数**，这一点在做大数据量处理时要留意——两层各 1000 次就是一百万次。

`print(..., end=" ")` 的作用是「打印后不换行，用空格结尾」。默认 `print` 打完会换行，加了 `end` 就能在同一行连续打。

### 3.1 经典练习：打印三角形

```python
for i in range(1, 6):
    for j in range(i):        # 内层次数跟着外层变
        print("*", end="")
    print()
```

输出：

```text
*
**
***
****
*****
```

内层写 `range(i)` 而不是 `range(5)`，这就是「外层控制行数，内层控制每行几个」。**内层的范围依赖外层的变量，是嵌套循环最核心的技巧。**

### 3.2 带缩进的三角形

```python
n = 5
for i in range(1, n + 1):
    for _ in range(n - i):       # 先打空格
        print(" ", end="")
    for _ in range(2 * i - 1):   # 再打星号
        print("*", end="")
    print()
```

```text
    *
   ***
  *****
 *******
*********
```

注意这里用了 `_` 作为循环变量。`_` 表示「这个变量我用不到，只是要循环这么多次」，是 Python 的惯用写法。

## 4. 组装：石头剪刀布

现在用上所有零件。需求：

1. 玩家和电脑各出石头/剪刀/布；
2. 每局判定胜负，累计比分；
3. 打满 5 局，输出战绩表；
4. 问要不要再来一局。

```python
import random

# 用数字代表手势：0=石头 1=剪刀 2=布
NAMES = {0: "石头", 1: "剪刀", 2: "布"}

# 规律：玩家赢的组合。石头(0)赢剪刀(1)，剪刀(1)赢布(2)，布(2)赢石头(0)
WIN_CASES = {(0, 1), (1, 2), (2, 0)}


def get_player_choice():
    """询问玩家，返回 0/1/2，输入不合法就重问"""
    while True:
        print("\n0=石头  1=剪刀  2=布")
        raw = input("请出手：").strip()
        if raw in ("0", "1", "2"):
            return int(raw)
        print("只能输入 0、1 或 2")


def judge(player, computer):
    """判定一局，返回 'win' / 'lose' / 'draw'"""
    if player == computer:
        return "draw"
    if (player, computer) in WIN_CASES:
        return "win"
    return "lose"


def play_round(round_no):
    """打一局，返回结果字符串"""
    player = get_player_choice()
    computer = random.randint(0, 2)

    print(f"你出 {NAMES[player]}，电脑出 {NAMES[computer]}")
    result = judge(player, computer)

    if result == "win":
        print(f"第 {round_no} 局：你赢了！")
    elif result == "lose":
        print(f"第 {round_no} 局：你输了")
    else:
        print(f"第 {round_no} 局：平局")

    return result


def main():
    wins = loses = draws = 0

    print("===== 石头剪刀布，五局三胜 =====")

    for r in range(1, 6):
        result = play_round(r)
        if result == "win":
            wins += 1
        elif result == "lose":
            loses += 1
        else:
            draws += 1
        print(f"当前比分  {wins} : {loses}  （平 {draws}）")

    # 战后总结
    print("\n===== 最终战绩 =====")
    print(f"胜 {wins} 局，负 {loses} 局，平 {draws} 局")
    print(f"胜率：{wins / 5:.0%}")

    if wins > loses:
        print("总体评价：你赢了 🎉")
    elif wins < loses:
        print("总体评价：电脑赢了，再来？")
    else:
        print("总体评价：势均力敌")


if __name__ == "__main__":
    main()
```

### 4.1 这段代码里的三个设计点

**第一，用字典 `NAMES` 把数字翻译成中文。**

```python
NAMES = {0: "石头", 1: "剪刀", 2: "布"}
NAMES[0]     # "石头"
```

否则你每处都要写 `if choice == 0: print("石头")`。这是「数据驱动」的思路，第 5 篇讲字典时会展开。

**第二，用集合 `WIN_CASES` 表达胜负规则。**

```python
WIN_CASES = {(0, 1), (1, 2), (2, 0)}
if (player, computer) in WIN_CASES:
```

如果不这样写，就得写一长串 `if`：

```python
if (player == 0 and computer == 1) or \
   (player == 1 and computer == 2) or \
   (player == 2 and computer == 0):
```

两相对比，集合写法一眼就能看出规则。**好的数据结构能让复杂的条件变简单。**

**第三，把「问输入」和「判胜负」拆成两个函数。**

`get_player_choice` 只管拿合法输入，`judge` 只管判断。这样你想换成「让用户输入文字『石头』」，只改第一个函数；想改规则，只改第二个。

### 4.2 三种改法，检验理解

**改法一：加一个「三局两胜」模式**

谁先赢两局就结束，不用打满五局。

提示：把 `for r in range(1, 6)` 换成 `while wins < 2 and loses < 2`，注意循环变量 `r` 要自己维护。

**改法二：加战绩表**

用嵌套循环打印最近 5 局的明细，一行一局：

```text
局次  你    电脑   结果
1     石头  布     输
2     剪刀  剪刀   平
...
```

提示：先把每局结果存进列表（第 5 篇的内容），再遍历打印。也可以直接在循环里用 `f"{r:<5}{...}"` 对齐——`:<5` 表示左对齐占 5 个字符宽。

**改法三：让电脑变聪明**

电脑不是纯随机，而是有 50% 概率学习你上一次出的手势然后出能赢它的那个。

提示：在 `main` 里记一个 `last_player`，传给 `play_round`。

## 5. 循环的性能直觉

循环是性能问题的高发区。现在不要求你优化，但要有两个直觉：

**直觉一：嵌套循环的代价是乘法级的。**

```python
for i in range(1000):
    for j in range(1000):
        ...
```

这是一百万次。再加一层就是十亿次，程序会直接卡死。以后看到三层嵌套循环要警觉。

**直觉二：能放在循环外的，别放在循环里。**

```python
# 慢
for item in items:
    total = len(items)        # 每次都重新算一遍长度
    ...

# 快
total = len(items)            # 只算一次
for item in items:
    ...
```

在 Python 里这个差别不明显（`len()` 很快），但换成「每次循环都读一次文件」「每次循环都请求一次网络」就是灾难了。

## 6. 常见错误清单

1. **`range(1, 100)` 以为包含 100**——不包含，要写 101；
2. **步长为负但起止没反过来**——`range(0, 5, -1)` 是空的；
3. **累加器没初始化**——`total += n` 前忘了 `total = 0`；
4. **找最大值初始化成 0**——全是负数时结果错误；
5. **嵌套循环内外层用了同一个变量名**——外层的值会被内层覆盖；
6. **边遍历边删列表元素**——索引会错乱；
7. **`while` 条件永远为真又没有 `break`**——死循环。

第 5 条特别隐蔽：

```python
for i in range(3):
    for i in range(2):     # 用了同一个 i！
        print(i)
    print("外层", i)        # 打印的不是 0/1/2，而是 1
```

内层循环跑完后，`i` 被改成了内层最后的值。**内外层一定要用不同的变量名。**

## 7. 本篇小结

1. **`range` 左闭右开**，三种形式记牢，五个坑至少踩过一次才算真懂；
2. **累加**和**计数**是两种最基础的循环模式，初始化那一步最容易被忘；
3. **嵌套循环**外层管行、内层管列，总次数是乘法关系；
4. **内层范围依赖外层变量**是嵌套的精髓，九九表、三角形都靠它；
5. **好的数据结构能让条件变简单**——石头剪刀布里那个 `WIN_CASES` 集合就是例子。

下一篇 [第 5 篇：五类数据容器](/post/python-data-containers/) 会解决一个循环解决不了的问题：**一次处理一批数据**。列表、字典这些容器，才是让程序真正能干活的东西。
