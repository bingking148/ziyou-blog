---
title: 'Python 第 13 篇：CSV、TSV 与 JSON，给数据立个固定格式'
weight: 13
cover: /images/covers/python-file-formats-cover.jpg
date: 2026-11-02T09:00:00+08:00
lastmod: 2026-11-02T09:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '文件操作', 'CSV', 'JSON']
description: '纯文本读写都会了，可数据一多就成了乱麻。这一篇给数据立规矩：CSV/TSV 一行一条、逗号分隔，JSON 直接存字典——csv 模块的 reader/writer、json 的 load/dump，最后让一份学生成绩在三种格式之间流转。'
math: false
mermaid: false
comments: true
toc: true
---

第 11 篇让程序「记得住事」了，但回想一下当时存的东西：`python.txt` 里是随手拼的一行字，日记本里是「日期 + 内容」的一段话。能记住，可记得**没个规矩**。

真实世界的数据不是这样的。Excel 里的表格一行一个人、一列一个字段；大模型接口返回的是一串 JSON；训练词表是一行一个词。**有格式的数据才能和别人交换**——你读得懂别人给的，你写出去的别人也读得懂。

这一篇给数据立三种最常见的规矩：

1. **CSV / TSV**：表格类数据，一行一条记录，字段用符号隔开；
2. **JSON**：字典直接存进文件，能表达嵌套结构，是模型世界的通用语。

每种格式 Python 都备好了模块，不用自己造轮子。

## 1. 三种格式长什么样

先看同一批学生成绩，用三种格式写出来是什么样。

**CSV**（Comma-Separated Values，逗号分隔值）：

```text
name,chinese,math,english
张三,90,85,77
李四,80,88,92
王五,95,91,89
```

第一行是表头，后面每行一条记录，字段用**逗号**隔开。Excel 双击就能打开。

**TSV**（Tab-Separated Values，制表符分隔值）：

```text
name	chinese	math	english
张三	90	85	77
李四	80	88	92
```

字段用**制表符 `\t`** 隔开。什么时候选它？当字段内容里本身就有逗号（比如一句带逗号的留言），用逗号当分隔符就乱了，换成制表符就干净了。

**JSON**（JavaScript Object Notation）：

```json
[
  {"name": "张三", "chinese": 90, "math": 85, "english": 77},
  {"name": "李四", "chinese": 80, "math": 88, "english": 92}
]
```

它跟 Python 的列表套字典几乎一模一样。能表达嵌套（字典里套列表、列表里套字典），所以模型接口、配置文件、API 返回，清一色用它。

三种格式一句话概括：**CSV/TSV 管表格，JSON 管结构。**

## 2. csv 模块：reader 读、writer 写

第 11 篇读文件，读到的是**一整行字符串**，想拆字段得自己 `split(',')`。csv 模块替你把这件事做了。

### 2.1 读 CSV

```python
import csv

with open('students.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)          # 拿到读取器
    for row in reader:              # 遍历每一行
        print(row)
```

输出：

```text
['name', 'chinese', 'math', 'english']
['张三', '90', '85', '77']
['李四', '80', '88', '92']
```

`csv.reader(f)` 把文件交给一个**读取器**，`for` 循环每走一步，`row` 就是已经拆好的**字符串列表**——分隔符被它吞掉了，字段整整齐齐。

注意拆出来的数字还是字符串 `'90'`，要算分得先 `int(row[1])` 转一下。

### 2.2 写 CSV

```python
import csv

rows = [
    ['赵六', 88, 92, 79],
    ['钱七', 76, 81, 90],
]

with open('new_students.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['name', 'chinese', 'math', 'english'])   # 先写表头
    writer.writerows(rows)                                     # 再批量写数据
```

两个容易漏的点：

1. **`newline=''` 必须写**——Windows 上不写它，每行之间会多出一个空行。这是 csv 写文件的头号事故，先记住结论，原因在文末坑清单里；
2. `writerow`（单行）和 `writerows`（多行）就差一个 s，和第 11 篇 `readline` / `readlines` 一个套路。

### 2.3 换成 TSV，只改一个参数

```python
import csv

with open('students.tsv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')   # 告诉它：这次用制表符分隔
    for row in reader:
        print(row)
```

同一个 `csv.reader`，`delimiter` 参数决定了按什么符号切字段。默认逗号，改成 `'\t'` 就是 TSV。**CSV 和 TSV 是同一个模块的两种用法**，不是两套工具。

## 3. json 模块：load 读、dump 写

CSV 只能表达扁平的表格，一遇到「字典套列表」就抓瞎。JSON 专治这个。

### 3.1 load：JSON 变成字典

```python
import json

with open('students.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(type(data))     # <class 'list'>
print(data)
```

`json.load(f)` 一步把文件里的 JSON 文本变成 Python 对象：`[...]` 变成列表，`{...}` 变成字典，字符串还是字符串。读进来就能直接 `data[0]['name']` 这样用。

### 3.2 dump：字典变成 JSON

```python
import json

config = {'model': 'qwen-chat', 'temperature': 0.7, 'stream': True}

with open('config.json', 'w', encoding='utf-8') as f:
    json.dump(config, f, ensure_ascii=False, indent=4)
```

写出来的 `config.json`：

```json
{
    "model": "qwen-chat",
    "temperature": 0.7,
    "stream": true
}
```

三个参数各司其职：

- `ensure_ascii=False`：不写它，中文会被转成 `模型` 这种转义码，文件没法直接看；
- `indent=4`：缩进 4 格，写出来才像人看的 JSON；不写就是挤成一行的压缩版（省空间，机器读没问题，人读费眼）；
- 记住 `dump`（写）和 `load`（读）没有 s；`dumps` / `loads` 带 s 的是跟**字符串**打交道，这里碰文件，用不带 s 的。

### 3.3 为什么模型世界清一色 JSON

你现在调 DeepSeek、调 Ollama，传进去的 `messages` 是「列表套字典」，返回的内容里也全是 JSON。原因就在上面：**JSON 和 Python 的容器天然对得上**——列表对列表、字典对字典、字符串对字符串，`json.load` 一下就回到 Python 手里，`json.dump` 一下就能发给别人。这是数据交换的「普通话」。

## 4. 综合案例：一份成绩，三种格式流转

把这一篇和第 11 篇串起来，做一个真实小任务：

> 教务系统把学生成绩存成了 CSV，读进来算平均分，再把结果导出成 JSON 存盘。

```python
import csv
import json

# 第一步：CSV 读进来
rows = []
with open('students.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader)                      # 跳过表头
    for row in reader:
        name, chinese, math, english = row
        rows.append({
            'name': name,
            'chinese': int(chinese),
            'math': int(math),
            'english': int(english),
        })

# 第二步：算每个人的总分和平均分
for stu in rows:
    stu['total'] = stu['chinese'] + stu['math'] + stu['english']
    stu['avg'] = round(stu['total'] / 3, 1)

# 第三步：导出成 JSON
with open('students_result.json', 'w', encoding='utf-8') as f:
    json.dump(rows, f, ensure_ascii=False, indent=4)
```

几个值得留意的细节：

1. **`next(reader)` 跳过表头**——表头不是数据，读进来得先跳过去，不然 `int('chinese')` 直接崩；
2. **字符串转数字**——CSV 读出来全是字符串，`int(chinese)` 在第 2 篇就学过，这里终于用上了；
3. **「读 → 算 → 写」三段**——和第 11 篇的备份工具同款节奏，只是这次读写的是**有格式**的数据。

这个流程再长一步，就是你在 exam 里见过的「教务管理系统把学生成绩存进 `stus.json`」——本质一模一样：内存里的对象 `json.dump` 落盘，下次启动 `json.load` 读回来。

## 5. 什么时候用哪个

| 数据长什么样 | 用哪个 | 模块 |
|---|---|---|
| 表格，每行一条记录，字段简单 | CSV | `csv` |
| 表格，字段里含逗号 | TSV | `csv` + `delimiter='\t'` |
| 嵌套结构（字典套列表）、要发给别人 / 发给模型 | JSON | `json` |
| 就是随手记几句、没有固定字段 | 纯文本 | 第 11 篇的 `open` |

选哪个一句话就能定：**有表头、有行列，用 CSV/TSV；要表达「结构」，用 JSON；啥也没有，回第 11 篇。**

## 6. 常见坑清单

1. **写 CSV 忘了 `newline=''`**——Windows 上会每行之间多一个空行。原因：`open` 默认把 `\n` 转成 `\r\n`，而 `csv.writer` 自己也会加换行，两拨换行叠一起就空了。加上 `newline=''` 告诉 Python「换行我自己管」；
2. **`ensure_ascii=False` 忘了写**——中文存进去变 `\uXXXX`，文件打开一片码。写了它才存原样的中文；
3. **读 CSV 出来的数字当数字用**——`row[1]` 是字符串 `'90'`，不 `int()` 直接算分，要么拼接出错要么排序全乱；
4. **`json.load` 读空文件**——空文件不是合法 JSON，直接 `JSONDecodeError`。第一次运行文件还没生成时，先用第 9 篇的 `try/except` 接住，或第 11 篇的 `os.path.exists` 先判断；
5. **`dump` 和 `dumps` 分不清**——带 s 的是跟字符串打交道（`json.dumps(obj)` 返回字符串），碰文件用不带 s 的（`json.dump(obj, f)`）。

## 7. 课后小项目

**练习一：词表生成器（必做）**

分词器训练前要从语料整理一份词表。写 `build_vocab(words)`：先把 `vocab` 目录建好（不存在就建），再把每个词占一行写进 `vocab/vocab.txt`，写完后重新打开数一数有多少行，打印出来。目录操作用第 11 篇的 `os.makedirs`。

**练习二：学生名单筛选**

读 `students.csv`，把数学低于 90 分的挑出来，写成 `weak_math.csv`。注意表头也要写进新文件。

**练习三：配置读写（综合）**

写一个程序：启动时 `json.load` 读 `config.json`（没有就新建一个默认配置），让用户改一个值，改完 `json.dump` 存回去。这基本就是你以后调模型前改 `temperature`、改 `model` 那套动作的雏形。

## 8. 本篇小结

1. **CSV/TSV 管表格，JSON 管结构**——一行一条用 CSV，字段含逗号换 TSV，要嵌套、要发模型用 JSON；
2. **`csv.reader` / `csv.writer` 拆好字段**——写文件记得 `newline=''`，切字段靠 `delimiter`；
3. **`json.load` 读、`json.dump` 写**——`ensure_ascii=False` 保中文，`indent=4` 让人能看；
4. **读进来要 `int()` 转换**——CSV 里的数字是字符串，别直接算；
5. **有格式的数据才能流转**——读 CSV、算分、写 JSON，一条流水线就这么搭起来了。

到这里，数据「怎么存、怎么读、怎么交换」就全通了。但这一篇埋了个雷还没拆：上面案例里 `rows.append(...)` 这种操作，如果哪天写 `b = a` 再改 `b`，`a` 也会跟着变——为什么？下一篇把「变量到底指什么」这件事讲到底——[第 14 篇：赋值、浅拷贝与深拷贝](/post/python-shallow-deep-copy/)。
