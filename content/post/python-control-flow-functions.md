---
title: 'Python 控制流与函数：从 if/while 到可复用小工具'
weight: 4
date: 2026-10-19T10:05:00+08:00
lastmod: 2026-10-19T10:05:00+08:00
cover: /images/covers/python-control-flow-functions-cover.jpg
categories: ['人工智能', '人工智能学习']
tags: ['Python', '编程基础', '函数', '循环']
description: '补齐 Python 基础之后的控制流知识：if 分支、while/for 循环、函数封装、异常处理，并写一个可运行的成绩统计小工具。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇 [Python 基础](/post/python-basics-for-ai/) 讲了字面量、变量、数据类型和运算符。这一篇继续往前走：程序怎么分支、怎么循环、怎么把重复逻辑封装成函数、怎么处理异常。掌握这些，你才能写出真正能维护的小工具，而不是一长串从上到下执行的代码。

## 1. 条件分支：让程序会判断

Python 用 `if`、`elif`、`else` 表示分支。注意两个规则：

1. 条件后面必须有冒号 `:`；
2. 属于某个分支的代码必须缩进，通常缩进 4 个空格。

```python
score = 78

if score >= 90:
    print("优秀")
elif score >= 75:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

执行顺序是从上到下：只要命中一个分支，后面的分支就不会再判断。

## 2. while 循环：重复执行直到条件不成立

`while` 有三个关键要素：

1. 初始值；
2. 继续执行的条件；
3. 让条件逐渐不成立的变化。

```python
i = 1
total = 0

while i <= 100:
    if i % 2 == 1:
        total += i
    i += 1

print("1~100 之间所有奇数的和是：", total)
```

如果忘记写 `i += 1`，条件永远成立，就会形成死循环：

```python
i = 1
while i < 5:
    print(i)
    # 这里漏了 i += 1，会一直打印
```

死循环不一定全是坏事。服务器会一直等待请求，聊天界面也会反复等待输入，但学习阶段如果控制台意外卡住，可以用 `Ctrl + C` 中断程序。

## 3. for 循环：遍历已知集合

当你明确知道要遍历一个列表、字符串或范围时，用 `for` 通常比 `while` 更自然。

```python
names = ["Alice", "Bob", "Carol"]

for name in names:
    print(f"你好，{name}")

for i in range(1, 4):
    print(i)
```

`range(1, 4)` 包含 1、2、3，不包含 4。

## 4. break 和 continue

`break` 表示提前结束循环，`continue` 表示跳过本轮剩余代码，进入下一轮。

```python
for n in range(1, 11):
    if n == 4:
        continue
    if n == 8:
        break
    print(n)
```

输出会跳过 4，遇到 8 停止，所以打印：

```text
1
2
3
5
6
7
```

## 5. 函数：把逻辑装进可复用的盒子里

函数用 `def` 定义。函数名建议使用小写字母和下划线，尽量让名字说明用途。

```python
def classify_score(score):
    if score >= 90:
        return "优秀"
    elif score >= 75:
        return "良好"
    elif score >= 60:
        return "及格"
    else:
        return "不及格"


print(classify_score(95))
print(classify_score(73))
```

函数的好处是：

- 同一段逻辑不用反复复制；
- 出错时只需要修一处；
- 名字可以帮助别人理解代码意图。

## 6. 类型提示和默认参数

Python 不强制写类型提示，但写出来更易读。

```python
def average(scores: list[float], precision: int = 2) -> float:
    if not scores:
        return 0.0
    return round(sum(scores) / len(scores), precision)


print(average([88, 92, 79]))
print(average([88, 92, 79], precision=1))
```

这里的 `scores: list[float]` 说明参数应该是浮点数列表，`precision: int = 2` 表示精度默认是 2。

## 7. 异常处理：不让小错误压垮程序

用户输入很可能不是你期待的数字。用 `try/except` 处理可预期的错误。

```python
def read_positive_int(prompt: str) -> int:
    while True:
        raw = input(prompt)
        try:
            value = int(raw)
            if value <= 0:
                print("请输入大于 0 的整数。")
                continue
            return value
        except ValueError:
            print("输入必须是整数，例如：18")


age = read_positive_int("请输入年龄：")
print(f"你输入的年龄是：{age}")
```

这里不要捕获所有异常后什么都不做。应该捕获具体错误，并给用户明确的提示。

## 8. 综合示例：成绩统计小工具

下面是一个可以直接保存成 `score_tool.py` 运行的完整示例。

```python
def classify_score(score: float) -> str:
    if score >= 90:
        return "优秀"
    elif score >= 75:
        return "良好"
    elif score >= 60:
        return "及格"
    return "不及格"


def read_score(prompt: str) -> float:
    while True:
        raw = input(prompt)
        try:
            score = float(raw)
            if 0 <= score <= 100:
                return score
            print("成绩范围是 0~100。")
        except ValueError:
            print("请输入数字，例如：86")


def print_report(scores: list[float]) -> None:
    print("\n===== 成绩报告 =====")
    if not scores:
        print("没有输入任何成绩。")
        return

    print(f"人数：{len(scores)}")
    print(f"平均分：{sum(scores) / len(scores):.2f}")
    print(f"最高分：{max(scores):.2f}")
    print(f"最低分：{min(scores):.2f}")

    for score in scores:
        print(f"{score:.2f} -> {classify_score(score)}")


def read_positive_int(prompt: str) -> int:
    while True:
        raw = input(prompt)
        try:
            value = int(raw)
            if value > 0:
                return value
            print("人数必须大于 0。")
        except ValueError:
            print("请输入整数。")


def main():
    count = read_positive_int("请输入要统计的人数：")
    scores = []

    for i in range(count):
        score = read_score(f"请输入第 {i + 1} 个成绩：")
        scores.append(score)

    print_report(scores)


if __name__ == "__main__":
    main()
```

运行方式：

```bash
python score_tool.py
```

## 9. 容易踩的 5 个坑

1. `if` 后面忘记冒号；
2. 缩进混用空格和 Tab；
3. `while` 循环忘记更新条件变量；
4. `input()` 返回的是字符串，直接参与数学运算会报错；
5. 函数里使用了未定义的变量。

## 10. 练习

1. 输入一个年份，判断闰年；
2. 输入体重和身高，计算 BMI；
3. 用 `while` 计算阶乘；
4. 写一个函数，接收字符串，返回其中数字字符的数量。

写完后重点检查：函数是否只做一件事？变量名是否能表达含义？异常是否给用户清晰提示？
