---
title: 'Python 第 11 篇：文件操作，写一个文件备份工具'
weight: 11
cover: /images/covers/python-file-operations-cover.jpg
date: 2026-11-01T09:00:00+08:00
updatedDate: 2026-11-01T09:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '文件操作', 'os模块']
description: '程序一关，数据全没？这一篇让程序学会「记住」：open 三步走、读文件的四种姿势、os 与 shutil 管文件管目录、with 语句自动关文件，最后写出一个给任意文件做备份的小工具。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇的 [第 10 篇](/post/python-inheritance-polymorphism/) 组出了助手家族，OOP 的拼图到这里拼完了。但回头看看这十一篇写的所有程序，它们都有一个共同的软肋：

**程序一关，数据全没。**

BMI 算完就忘，猜数字的记录不留痕，助手家族的对话历史只在内存里活着。变量住在内存里，程序一结束，操作系统就把这块内存收走了。想让程序「记得住事」，就得把数据写到**文件**里——聊天记录、训练日志、模型配置，落到磁盘上的都是文件。

这一篇解决三个问题：

1. **数据怎么存成文件、怎么读回来**？（`open()` 三步走）
2. **文件多了怎么管**？重命名、删除、建目录、复制——总不能手动一个个点吧？（`os` 与 `shutil` 模块）
3. **文件不一定存在**，读一个不存在的文件程序就崩，第 9 篇的异常处理在这里派上真用场。

最后把这三样拼在一起，写一个**文件备份工具**。

## 1. 三步走：打开、写入、关闭

### 1.1 第一个写文件的程序

写文件固定三步：**打开 → 写入 → 关闭**。

```python
# 1.打开文件
f = open('python.txt', 'w', encoding='utf-8')

# 2.写入数据
f.write('人生苦短，我用Python!')

# 3.关闭文件
f.close()
```

跑完，当前目录里多了一个 `python.txt`，内容就是那行字。三个细节：

1. **文件不存在时，`w` 模式会自动创建**——不用先手动新建；存在时，**原有内容被清空**再写（这一点是新手事故高发区，后面细说）；
2. `'w'` 是打开模式：write，写；对应的还有 `'r'`（read，读）、`'a'`（append，追加）；
3. `encoding='utf-8'` 建议每次都写。不写的话 Windows 默认用 GBK 编码，中文文件换台电脑打开就是乱码。

`open()` 返回一个**文件对象**，起名叫 `f`，后面的 `f.write()`、`f.close()` 都是在操作它。

### 1.2 路径：告诉 Python 文件在哪

`open()` 的第一个参数是路径。路径分两种：

```python
f = open('python.txt', 'a', encoding='utf-8')   # 相对路径：在当前目录找

# f = open('./file.txt', 'a', encoding='utf-8')  # ./ 就是当前目录，跟不写一个意思
# f = open('../file.txt', 'a', encoding='utf-8') # .. 是上一级目录

# f = open('D:/ai-code-project/python.txt', 'a', encoding='utf-8')  # 绝对路径：从盘符写起
```

- **相对路径**：以程序运行时所在的目录（当前工作目录）为起点。`./` 是当前目录，`../` 是上一级；
- **绝对路径**：从盘符开始写全，谁在哪儿运行都能找到同一个文件。

新手推荐用相对路径，代码挪到别的电脑上不用改。

### 1.3 覆盖的 `w`，追加的 `a`

同样是写，两个模式行为完全不同：

```python
# 第一次运行：文件被创建，写入第一行
f = open('python.txt', 'a', encoding='utf-8')
f.write('人生苦短，我用Python!\n')
f.close()

# 再运行一次：文件还在，又多了一行
f = open('python.txt', 'a', encoding='utf-8')
f.write('人生苦短，我用Python!\n')
f.close()
```

运行两遍，`python.txt` 里有两行。把 `'a'` 换成 `'w'` 再跑一遍试试——文件里只剩一行，第一次写的内容**被覆盖掉了**。

| 模式 | 文件不存在 | 文件存在 |
|---|---|---|
| `'w'` | 创建新文件 | **清空后写入** |
| `'a'` | 创建新文件 | 在末尾**追加** |
| `'r'` | 报错 `FileNotFoundError` | 正常读取 |

记一句话：**追加用 `a`，重写用 `w`，拿不准就用 `a`**——最多内容重复，不会丢数据。

## 2. 读文件：四种姿势

写入会了，读回来。打开方式换成 `'r'`，读法有四种，按需选用：

```python
f = open('python.txt', 'r', encoding='utf-8')

# 姿势一：read() —— 一口气读完，返回整个字符串
contents = f.read()
print(contents)

# 姿势二：read(10) —— 只读 10 个字符
contents = f.read(10)
print(contents)

# 姿势三：readlines() —— 按行读完，装进一个列表
content_list = f.readlines()
for content in content_list:
    print(content, end='')

# 姿势四：readline() —— 一次读一行，配合循环读完整个文件
while True:
    data = f.readline()      # 读一行
    if not data:             # 读不到数据（到了文件末尾）就结束
        break
    print(data, end='')      # 行尾自带 \n，print 别再加换行

f.close()
```

四种姿势怎么选：

| 姿势 | 返回什么 | 什么时候用 |
|---|---|---|
| `read()` | 一整个字符串 | 小文件，一次性处理 |
| `read(n)` | n 个字符 | 大文件分块读，省内存 |
| `readlines()` | 字符串列表 | 想按行处理、行数不多 |
| `readline()` + 循环 | 一行 | **大文件逐行处理，最常用** |

姿势四的那个 `while True` 模式值得多看一眼：`readline()` 读到文件末尾会返回**空字符串** `''`，而 `if not data` 对空字符串判定为假——所以「读不到就停」这一行判断，就是整个循环的出口。这个套路后面写文件复制时还会用。

## 3. os 模块：重命名、删除、建目录

读写会了，接下来是「文件管理」。Python 自带的 `os` 模块就是操作系统的遥控器：

```python
import os
import time

# 1.重命名文件
os.rename('./python.txt', './hello.txt')

# 2.程序休眠 10 秒，留时间去看看文件夹
time.sleep(10)

# 3.删除文件
os.remove('./hello.txt')
```

`os.rename(旧名, 新名)` 不只改名——把新名写成别的目录下的路径，它还能顺手**移动**文件，一步顶两步。

管目录的函数也是一批：

```python
import os

# 1.创建目录（先判断，不存在才建——存在再建会报错）
if not os.path.exists('./test'):
    os.mkdir('./test')

# 2.查看当前工作目录
print(os.getcwd())

# 3.切换目录
os.chdir('./images')
print(os.getcwd())       # 已经在 images 里了

os.chdir('../')          # .. 回到上一级
print(os.getcwd())

# 4.列举当前目录所有内容（文件和目录都在列表里）
print(os.listdir('./'))

# 5.删除空目录
os.rmdir('./test')
```

注意 `os.rmdir` 只能删**空目录**——目录里还有一个文件它都会拒绝。这不是缺陷，是保护：目录里可能塞着你忘了的东西。

## 4. shutil 模块：干活更狠的帮手

`os` 管不了「复制文件」和「删非空目录」，这两件事归 `shutil`（shell utility 的缩写）管：

```python
import os
import shutil

# 1.建目录、写个文件进去
os.mkdir('./test')
f = open('./test/hello.txt', 'w', encoding='utf-8')
f.write('你好~\nhello\nhi！\n')
f.close()

# 2.复制文件：从 test 目录复制一份到当前目录
shutil.copy('./test/hello.txt', './python.txt')
print(os.listdir('./'))

# 3.删除整个目录——不管里面有多少东西
shutil.rmtree('./test')
print(os.listdir('./'))
```

两个模块的分工：

| 想干什么 | 用谁 |
|---|---|
| 重命名 / 移动 / 删除单个文件 | `os.rename` / `os.remove` |
| 创建 / 切换 / 列举 / 删除**空**目录 | `os.mkdir` / `os.chdir` / `os.listdir` / `os.rmdir` |
| 复制文件 | `shutil.copy` |
| 删除整个目录（连带内容） | `shutil.rmtree` |

`rmtree` 是这一篇里最危险的函数——它删东西**不进回收站**。写它之前先确认路径对不对。

## 5. 文件操作的意外：异常处理上岗

前几节的所有代码都有一个隐含前提：文件存在。删掉这个前提试试：

```python
f = open('./hello.txt', 'r', encoding='utf-8')   # 文件根本不存在
content = f.read()
print(content)
f.close()
```

```
FileNotFoundError: [Errno 2] No such file or directory: './hello.txt'
```

第 9 篇学的异常处理，在这里派上真用场了。文件操作是整个系列里**最容易出意外**的代码：文件可能不存在、可能被占用、可能没权限——这些都不是你代码写错了，而是「世界不配合」。所以文件操作几乎天生就该包在 `try` 里：

```python
f = None
try:
    # 可能出意外的那段：打开并读取
    f = open('./hello.txt', 'r', encoding='utf-8')
    content = f.read()
    print(content)
except FileNotFoundError as e:
    # 意外来了：文件不存在
    print(f'文件没有，请核实！错误信息：{e}')
finally:
    # 无论成没成功，都要做的收尾：关文件
    if f:
        f.close()
```

三个要点：

1. **`except FileNotFoundError` 精准捕获**——只接「文件不存在」这一种意外，其他意外该崩还得崩，别裸捕；
2. **`finally` 里关文件**——打开成功与否，清理逻辑都得跑，这正是 `finally` 的主场；
3. **`f = None` 先声明**——如果 `open` 那一行就炸了，`f` 根本没被创建，`finally` 里直接 `f.close()` 会再炸一次 `NameError`。先给 `None`，再用 `if f:` 判断，这段代码就无懈可击了。

这个「try + finally 关文件」的写法完全正确，但你会发现它啰嗦：为了关个文件，搭了三层结构。Python 给了个更优雅的答案。

## 6. with 语句：让 Python 替你关文件

```python
with open('./hello.txt', 'r', encoding='utf-8') as f:
    content = f.read()
    print(content)

# 出了 with 的缩进块，文件已经自动关闭了
```

`with` 叫**上下文管理器**：把 `open()` 交给它保管，缩进块里的代码正常执行也好、中途报错也好，**退出缩进块的那一刻文件一定被关闭**——正常关闭和异常关闭都算。

对比一下第 5 节的 try/finally 版本：同样的安全性，一半的代码量。以后写文件操作，**默认就用 `with`**，`f.close()` 手动三步走只用于理解原理。

`with` 还能一次管多个文件，用逗号排开即可：

```python
# 一个读、一个写，同时打开
with open('./python.txt', 'r', encoding='utf-8') as read_file, \
        open('./hello.txt', 'w', encoding='utf-8') as write_file:
    while True:
        line_content = read_file.readline()   # 一行一行读
        if len(line_content) == 0:            # 读到空字符串，说明读完了
            break
        write_file.write(line_content)        # 有数据就写进新文件
```

行尾的 `\` 是续行符——一行写不下两个 `open()`，断开接着写。这段代码就是一个完整的文件复制器。

## 7. 综合案例：三个文件小工具

### 7.1 内容反转器

按行读取文件，每行内容反转，写进新文件：

```python
# 1.读取文件内容
with open('./datas/a.txt', 'r', encoding='utf-8') as src_file:
    src_lines = src_file.readlines()          # 所有行装进列表

# 2.逐行反转
reversed_lines = []
for src_line in src_lines:
    content = src_line.rstrip('\n')           # 先去掉行尾的换行符
    reversed_content = content[::-1]          # 切片步长 -1：字符串反转
    reversed_lines.append(reversed_content + '\n')

# 3.整体写入新文件
with open('./datas/b.txt', 'w', encoding='utf-8') as dst_file:
    dst_file.writelines(reversed_lines)
```

这个案例把旧知识串了个遍：`rstrip` 是第 5 篇的字符串方法，`[::-1]` 是第 5 篇的切片步长，`writelines` 接一个列表一次写完——正好是 `readlines` 的反操作。

### 7.2 文件备份器（本篇主菜）

需求：给任意文件做备份，`python.txt` 备份成 `python-备份.txt`。难点在**拆文件名**——要把扩展名前的部分和扩展名分开：

```python
# 1.定义源文件路径
source_file = 'python.txt'

# 2.拆出前缀名和后缀名
# 思路：把文件名反转，找到第一个 '.' 的位置，再换算回正序的下标
# 'python.txt' 反转是 'txt.nohetyp'，'.' 在下标 3
index = -(source_file[::-1].index('.') + 1)

prefix_name = source_file[:index]        # 'python'
suffix_name = source_file[index + 1:]    # 'txt'

desc_file = f'{prefix_name}-备份.{suffix_name}'   # 'python-备份.txt'

# 3.边读边写
with open(source_file, 'r', encoding='utf-8') as src_file, \
        open(desc_file, 'w', encoding='utf-8') as desc_file:
    while True:
        line = src_file.readline()
        if line:
            desc_file.write(line)
        else:
            break
```

### 7.3 这段代码为什么值得看

1. **拆文件名那两行是纯字符串功夫**——`[::-1]` 反转、`.index()` 找位置、负数下标换算，全是第 5 篇的切片知识在真实场景里干活。为什么从右边找 `.`？因为文件名里可能有多个点（`my.file.v2.txt`），从右找才能拿到真正的扩展名；
2. **两个 `with` 排开，读和写各管一个文件**——上一节的复制作业直接长成了工具；
3. **`readline()` 循环在干「流式处理」**——不管源文件是 1KB 还是 1GB，内存里永远只有一行。第 2 节说它最常用，这里就是原因；
4. **变量复用**——`desc_file` 先当文件名字符串，再当写文件对象，Python 不在乎变量原来装的是什么，只在乎你现在要它干什么。

## 8. 常见坑清单

1. **忘了 `close()`（或没用 `with`）**——`write` 的内容可能还躺在缓冲区里没写进磁盘，文件是 0 KB，程序一崩数据全丢。这是文件操作 bug 榜第一名，用 `with` 直接根治；
2. **拿 `'w'` 当追加用**——`open` 的那一刻旧内容就被清空了，写多少遍文件里都只有最后一次的内容；
3. **读完又读**——`read()` 之后文件指针停在末尾，再 `read()` 是空字符串。要么重新 `open`，要么用 `f.seek(0)` 把指针拨回开头；
4. **Windows 路径里的反斜杠**——`'D:\test\new.txt'` 里的 `\t`、`\n` 是转义字符（第 2 篇讲过），路径会被读得面目全非。用正斜杠 `'D:/test/new.txt'`，或者在字符串前加 `r`：`r'D:\test\new.txt'`；
5. **`os.rmdir` 删不掉非空目录**——它只删空目录，要连锅端用 `shutil.rmtree`；
6. **`encoding='utf-8'` 忘了写**——Windows 上默认 GBK，写的时候没报错，换台机器或传给别人就乱码；
7. **打开只读文件不设防**——文件不存在时 `'r'` 直接 `FileNotFoundError`。要么 `os.path.exists()` 先判断，要么 `try/except` 接住，二选一。

## 9. 课后小项目

**练习一：日记本（必做）**

写一个能「记住」的日记程序：启动后先打印历史日记（读文件），然后让用户输入一句话，以「日期 + 内容」的格式**追加**保存。日期用 `from datetime import datetime` 拿 `datetime.now()`。要求全程用 `with`，读的部分要用 `try` 接住「第一次运行还没有日记文件」的情况。

**练习二：给备份器加时间戳**

改造 7.2 的备份器：`python.txt` 备份成 `python-20261101-备份.txt`。日期从 `datetime.now()` 拼：`f'{now.year}{now.month:02d}{now.day:02d}'`。同一文件一天可以备份多份，互不覆盖。

**练习三：批量重命名**

一个文件夹里有一堆 `.txt` 文件，把每个文件名前面都加上 `AI_` 前缀：用 `os.listdir` 拿到所有文件，字符串方法筛出 `.txt` 结尾的，逐个 `os.rename`。做完跑一遍，再想想：万一跑了两遍会怎样？加个判断让程序跳过已经改过名的。

**练习四：语料统计器（综合）**

把一段对话语料存进 `corpus.txt`，写程序统计每个词出现的次数，结果按次数从高到低写进 `result.txt`——读文件用第 2 节的姿势，统计用第 5 篇的字典，排序用第 5 篇的 `sorted` + `lambda`，写文件用本篇的 `with`。四个旧知识 + 一个新知识，一个都跑不掉。

## 10. 本篇小结

1. **文件操作三步走**——`open()`、读写、`close()`；`w` 覆盖、`a` 追加、`r` 只读，`encoding='utf-8'` 每次都写；
2. **读文件四种姿势**——`read()` 全读、`read(n)` 分块、`readlines()` 成列表、`readline()` 循环逐行（大文件首选）；
3. **`os` 管文件和空目录，`shutil` 管复制和非空目录**——`rmtree` 不进回收站，慎用；
4. **文件操作天生要配异常处理**——`FileNotFoundError` 精准捕获，`finally` 里收尾；
5. **`with` 是文件操作的默认姿势**——缩进结束自动关闭，出错也关，一次管多个文件用逗号排开。

到这里，程序终于「记得住事」了。但第 6 篇留过一个悬念还没还：函数是「一次定义，到处调用」的工具，可有些功能——日志、计时、登录检查——想**加给一堆函数**，难道要复制十遍？下一篇的**闭包与装饰器**就是答案，它也是整个系列最后一块拼图——[第 12 篇：闭包与装饰器](/post/python-closures-decorators/)。
