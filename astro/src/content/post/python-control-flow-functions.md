---
title: 'Python 第 3 篇：if、循环与函数，写一个猜数字游戏'
weight: 3
date: 2026-10-19T10:05:00+08:00
updatedDate: 2026-10-30T10:00:00+08:00
cover: /images/covers/python-control-flow-functions-cover.jpg
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '函数', '循环']
description: '用做一个猜数字游戏的方式学会 if 判断、while/for 循环和函数封装：每一步都因为需求才引入语法，最后得到能反复玩的完整程序。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇我们做出了 BMI 计算器，但它有个毛病：**算完一次就结束了**。想再算一个人，得重新运行一遍程序。

这一篇解决三件事：让程序**会判断**（猜对了吗？）、**会重复**（再猜一次）、**会复用**（把逻辑打包，随时调用）。

方法还是老一套：先立一个目标，缺什么补什么。这次的目标是——**一个猜数字游戏**。

## 1. 目标：猜数字游戏

规则很简单：程序心里想一个 1 到 100 的数，你猜，它告诉你「大了」还是「小了」，直到猜中。

最终效果：

```text
我想好了一个 1~100 的数，你来猜！
请输入你猜的数字：50
小了！往大了猜
请输入你猜的数字：75
大了！往小了猜
请输入你猜的数字：63
恭喜！你猜对了，一共猜了 3 次
```

要做出来，需要四块积木：判断大小、重复询问、生成随机数、把逻辑打包成函数。我们一块块来。

## 2. 第一块积木：if，让程序会判断

上个程序的 BMI 里我让你照抄了一段 `if`，现在把它拆开讲透。

### 2.1 最基本的形态

```python
guess = 50
answer = 63

if guess > answer:
    print("大了")
```

语法有三个必须记住的细节：

1. `if` 后面跟**条件**，条件后面跟**英文冒号** `:`；
2. 属于这个分支的代码**必须缩进**（通常是 4 个空格）；
3. 缩进结束，就表示这个分支结束了。

缩进不是排版讲究，是**语法**。Python 靠缩进来判断「哪几行属于 if」。

```python
if guess > answer:
    print("这句在 if 里面")
    print("这句也在 if 里面")
print("这句在外面，无论如何都执行")
```

> [!WARNING]
> 不要混用空格和 Tab。看上去一样，Python 会报 `TabError`。VS Code 默认会把 Tab 自动转成 4 个空格，所以尽量在编辑器里敲，别在记事本里写。

### 2.2 加上 elif 和 else

猜数字要三种结果：大了、小了、猜对。用 `elif`（else if 的缩写）：

```python
guess = 50
answer = 63

if guess == answer:
    print("猜对了")
elif guess > answer:
    print("大了")
else:
    print("小了")
```

**执行顺序是关键**：从上往下，**一旦命中一个分支，后面的全部跳过**。所以顺序会影响结果——如果你把 `guess > answer` 写在最前面，猜对时也会被它拦走吗？不会，因为猜对时 `guess == answer`，`guess > answer` 本来就为假。但换个场景就会出问题：

```python
score = 95

if score >= 60:
    print("及格")        # 命中这个就停了
elif score >= 90:
    print("优秀")        # 永远走不到
```

这就是条件顺序的重要性。**范围窄的条件要写在前面**。

### 2.3 真值判断：Python 的偷懒写法

Python 里几乎所有东西都能当条件用。空的东西算假，非空的东西算真：

```python
if []:            # 假
if "":            # 假
if 0:             # 假
if None:          # 假
if [1, 2]:        # 真
if "hello":       # 真
```

所以判断一个列表是不是空的，不用写 `if len(items) == 0`，直接 `if not items:` 更地道。第 5 篇处理数据时会大量用到。

## 3. 第二块积木：循环，让程序会重复

猜数字的核心是「猜错了就再问一次」。这就是循环。

### 3.1 while：只要条件成立就一直转

```python
count = 0

while count < 3:
    print(f"第 {count + 1} 次")
    count += 1
```

`while` 后面跟条件，条件为真就执行下面缩进的代码块，执行完再回来检查条件。

写 `while` 必须想清楚三件事，缺一个就死循环：

1. **初始值**：`count = 0`
2. **继续的条件**：`count < 3`
3. **让条件最终不成立的变化**：`count += 1`

第三点最容易忘。忘了会怎样？

```python
count = 0
while count < 3:
    print("救命")
    # 忘了 count += 1
```

屏幕会疯狂刷「救命」，直到你按 `Ctrl + C` 强行中断。别慌，这是新手必经之路。

> [!TIP]
> `Ctrl + C` 是中断程序的通用快捷键。任何程序卡住、死循环、跑太久，都可以用它。

### 3.2 for：遍历一个已知的集合

如果明确知道要循环几次、或者要挨个处理一堆东西，用 `for` 更自然：

```python
for i in range(3):
    print(f"第 {i + 1} 次")
```

`range(3)` 生成 `0, 1, 2`——**从 0 开始，不包含 3**。这个「左闭右开」是 Python 的惯例，一开始会不习惯，写多了就顺了。

遍历列表（第 5 篇会细讲列表）：

```python
names = ["小明", "小红", "小刚"]
for name in names:
    print(f"你好，{name}")
```

遍历字符串：

```python
for char in "Python":
    print(char)      # 一个字母一行
```

### 3.3 while 和 for 怎么选

一句话：**知道次数用 `for`，只知道条件用 `while`。**

| 场景 | 用哪个 | 为什么 |
|---|---|---|
| 猜数字，猜中才停 | `while` | 不知道要猜几次 |
| 打印 1 到 100 | `for` | 次数明确 |
| 遍历一个列表 | `for` | 数据已经在那儿了 |
| 等待用户输入密码 | `while` | 直到输对为止 |
| 重试请求最多 3 次 | `for` 或 `while` | 有上限，两种都行 |

新手常犯的错是拿 `while` 写计数循环：

```python
i = 0
while i < 5:        # 能用，但要自己管初始值、条件、自增
    print(i)
    i += 1

for i in range(5):  # 同样的效果，少写两行，也不会忘 i += 1
    print(i)
```

### 3.4 break 和 continue：中途改变路线

- `break`：**立刻跳出整个循环**；
- `continue`：**跳过本轮剩下的代码，直接进入下一轮**。

```python
for n in range(1, 11):
    if n == 4:
        continue     # 跳过 4，继续 5
    if n == 8:
        break        # 到 8 就整个结束
    print(n)
```

输出：`1 2 3 5 6 7`。

在猜数字里，`break` 正好用来「猜中就跳出」：

```python
while True:          # 条件永远为真，靠 break 退出
    guess = int(input("猜："))
    if guess == answer:
        print("对了")
        break
```

`while True` 看着像死循环，但里面有 `break` 兜底，这是很常见的写法。只要你能保证循环里一定有一条路能 `break` 出去，就不算死循环。

## 4. 第三块积木：随机数

猜数字得有个「答案」。答案每次都得不一样，所以要用随机数。

Python 的随机数在 `random` 模块里。用之前要先 `import`：

```python
import random

answer = random.randint(1, 100)    # 1 到 100 之间，两端都包含
print(answer)
```

> [!NOTE]
> `import` 的意思是「把别人写好的工具箱拿过来用」。`random` 是 Python 自带的，不用安装。第 7 篇会专门讲模块。

注意 `randint(1, 100)` 和 `range(1, 100)` 的区别：**`randint` 两端都包含，`range` 不包含右端**。这个不一致确实容易混，记住即可。

## 5. 第四块积木：函数，把逻辑打包

现在四个部分都齐了，但把它们全堆在一个文件里从上往下写，会有两个问题：

1. 想改「提示语」得在几千行里找；
2. 这段逻辑别的地方想用，只能复制粘贴。

函数解决这个：**把一段逻辑打包，起个名字，以后叫名字就能用。**

### 5.1 定义和调用

```python
def greet(name):
    print(f"你好，{name}")

greet("小明")     # 输出：你好，小明
```

拆开看：

- `def` 是 define 的缩写，告诉 Python「我要定义一个函数」；
- `greet` 是函数名，规则和变量名一样；
- `name` 是**参数**，是外面传进来的数据的入口；
- 函数体要缩进；
- 调用时写 `greet("小明")`，括号里的 `"小明"` 会传给 `name`。

### 5.2 return：把结果带出来

`print` 只是显示，`return` 才是**把结果交回给调用者**：

```python
def add(a, b):
    return a + b

result = add(3, 5)
print(result)          # 8
print(add(1, 2) * 10)  # 30，返回值可以继续参与运算
```

这是新手最容易模糊的一点：

| | `print` | `return` |
|---|---|---|
| 作用 | 显示到屏幕 | 把值交回去 |
| 之后还能用吗 | 不能 | 能 |
| 函数里有它就算有返回值吗 | 不算 | 算 |

只 `print` 不 `return` 的函数，返回值是 `None`：

```python
def add(a, b):
    print(a + b)

x = add(3, 5)     # 屏幕输出 8
print(x)          # None ← 拿不到值！
```

### 5.3 一个函数只做一件事

好的函数短小、名字说明用途、只干一件事。对比：

```python
# 不好：什么都干
def do_stuff():
    name = input("名字：")
    print(f"你好{name}")
    a = int(input("数1："))
    b = int(input("数2："))
    print(a + b)

# 好：拆成三个各司其职的小函数
def ask_name():
    return input("名字：")

def greet(name):
    print(f"你好，{name}")

def add():
    return int(input("数1：")) + int(input("数2："))
```

拆开之后，每个函数都能单独测试、单独复用、单独修改。这是「函数」这个词真正的价值，不只是少写几行。

### 5.4 默认参数

```python
def power(base, exponent=2):
    return base ** exponent

print(power(5))       # 25，用了默认的 2
print(power(2, 10))   # 1024
```

参数的完整玩法（`*args`、`**kwargs`、作用域、递归）在第 6 篇单独讲。这里知道「能设默认值」就够了。

## 6. 组装：完整的猜数字游戏

现在把四块积木拼起来。

```python
import random


def play_game():
    """玩一局猜数字，返回猜的次数"""
    answer = random.randint(1, 100)
    count = 0

    print("我想好了一个 1~100 的数，你来猜！")

    while True:
        raw = input("请输入你猜的数字：")

        # 先检查输入是不是数字，不是就重来
        if not raw.isdigit():
            print("请输入一个整数！")
            continue

        guess = int(raw)
        count += 1

        if guess == answer:
            print(f"恭喜！你猜对了，一共猜了 {count} 次")
            return count
        elif guess > answer:
            print("大了！往小了猜")
        else:
            print("小了！往大了猜")


if __name__ == "__main__":
    play_game()
```

运行：

```bash
python guess.py
```

### 6.1 逐段拆解

**`raw.isdigit()`** 是字符串的方法，判断这个字符串是不是全由数字组成。这一步很关键——如果用户输入 `abc`，直接 `int()` 会崩。先用 `isdigit()` 拦一道，程序就稳了。

**`continue`** 在这里的作用是：输入不合法就跳过本轮，重新问，`count` 也不会被错误地加一。

**`while True` + `return`**：猜中时 `return` 直接把整个函数结束掉，比 `break` 更干脆。

**`if __name__ == "__main__":`** 是个固定套路，现在照抄就行，第 7 篇讲模块时会解释清楚它为什么存在。

### 6.2 一段代码，三种改法

程序能跑之后，别急着读下一篇。试着改这三个地方，感受一下「改代码」是什么感觉：

**改法一：加次数限制**

猜了 10 次还没中，就告诉用户答案是几。

提示：在 `while True` 里加一个 `if count >= 10:`，输出答案后 `return`。

**改法二：加难度选择**

开局让用户选「简单（1~50）」还是「困难（1~100）」。

提示：`random.randint(1, 上限)`，上限从一个 `if` 里决定。

**改法三：能连续玩**

一局结束后问「再来一局吗？(y/n)」，输入 `y` 就再玩。

提示：外面再套一个 `while`，只有输入 `n` 才 `break`。

这三个改法正好对应本篇学的三样东西：判断、循环、函数。**能改出来，这篇就算真学会了。**

## 7. 常见坑

1. **`if` 后面忘写冒号**——`SyntaxError`；
2. **缩进混用 Tab 和空格**——`TabError`；
3. **`while` 忘了让条件变化**——死循环，`Ctrl + C` 救命；
4. **`range(1, 100)` 不包含 100**——想包含就用 `range(1, 101)` 或 `randint(1, 100)`；
5. **函数只 `print` 没 `return`**——调用方拿到的是 `None`；
6. **`input()` 没转类型就比大小**——字符串比大小是按字典序，`"9" > "10"` 是 `True`（因为 `"9"` 大于 `"1"`）。

最后这条值得单独说：`"9" > "10"` 返回 `True`，因为字符串是一个字符一个字符比的，`"9"` 的第一个字符就比 `"1"` 大。**只要涉及数字比较，一定先转成 `int` 或 `float`。**

## 8. 课后小项目

**练习一：乘法口诀表（必做）**

用两层嵌套循环打印九九乘法表：

```text
1×1=1
1×2=2  2×2=4
1×3=3  2×3=6  3×3=9
...
```

提示：外层 `for i in range(1, 10)`，内层 `for j in range(1, i + 1)`。内层为什么是 `i + 1`？想清楚这个，嵌套循环就懂了。

**练习二：.password 检查器**

写一个函数 `check_password(pwd)`，返回 `True` 或 `False`：长度至少 8 位、必须含数字、必须含字母。然后用一个 `while` 循环，让用户一直输，直到输入合格的密码。

**练习三：斐波那契数列**

打印前 20 项：`1 1 2 3 5 8 13 ...`。

提示：`a, b = b, a + b`，第 2 篇学过的多元赋值在这里特别好用。

## 9. 本篇小结

1. **`if / elif / else`** 让程序会判断，从上往下命中即停，范围窄的条件写前面；
2. **`while`** 适合「不知道几次」，必须保证条件会变；**`for`** 适合「遍历已知集合」；
3. **`break`** 跳出整个循环，**`continue`** 跳过本轮；
4. **函数** 用 `def` 定义，`return` 交回结果，一个函数只做一件事；
5. **`print` 和 `return` 不是一回事**，只 print 的函数返回 `None`。

下一篇 [第 4 篇：range、嵌套循环与石头剪刀布](/post/python-loop-control/) 会把循环再挖深一层——`range` 的完整用法、嵌套循环怎么控制行列，最后用它们写出一个石头剪刀布。
