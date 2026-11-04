---
title: 'Python 第 11 篇：文件操作，写一个文件备份工具'
weight: 11
cover: /images/covers/python-file-operations-cover.jpg
date: 2026-11-01T09:00:00+08:00
lastmod: 2026-11-04T09:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '文件操作', 'os模块']
description: '程序一关，数据全没？这篇让程序学会把数据写进文件、再读回来：open 的三种打开方式、读文件的几种姿势、用 os 和 shutil 管文件管目录，最后拼一个文件备份工具。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇组出了助手家族，OOP 到这里就讲完了。但这十几篇写的程序都有个共同的毛病：程序一关，数据全没。

BMI 算完就忘，猜数字不留记录，助手家族的对话历史只活在内存里。变量住在内存里，程序一结束，操作系统就把这块内存收回去。想让程序「记得住事」，只能把数据写到文件里——聊天记录、训练日志、模型配置，落到磁盘上的都是文件。

这篇讲三件事：数据怎么存成文件、怎么读回来；文件多了怎么管（改名、删除、建目录、复制）；文件不存在时程序别崩。最后拼成一个文件备份工具。

## 1. 打开、写入、关闭

写文件就三步：打开、写入、关闭。

```python
# 1.打开文件
f = open('python.txt', 'w', encoding='utf-8')

# 2.写入数据
f.write('人生苦短，我用Python!')

# 3.关闭文件
f.close()
```

跑完，当前目录多了一个 `python.txt`，内容就是那行字。几个容易忽略的点：

1. 文件不存在时，`w` 模式会自动创建；存在时，原有内容会被清空再写。这个「清空」是新手事故高发区，后面单独说；
2. `'w'` 是 write，写；对应的还有 `'r'`（read，读）、`'a'`（append，追加）；
3. `encoding='utf-8'` 建议每次都写。不写的话 Windows 默认用 GBK，中文文件换台电脑打开就是乱码。

`open()` 返回一个文件对象，起名叫 `f`，后面的 `f.write()`、`f.close()` 都是在操作它。

## 2. 路径

`open()` 的第一个参数是路径，分两种。

```python
f = open('python.txt', 'a', encoding='utf-8')   # 相对路径：在当前目录找

# f = open('./file.txt', 'a', encoding='utf-8')  # ./ 就是当前目录，跟不写一个意思
# f = open('../file.txt', 'a', encoding='utf-8') # .. 是上一级目录

# f = open('D:/ai-code-project/python.txt', 'a', encoding='utf-8')  # 绝对路径：从盘符写起
```

相对路径以程序运行时的目录为起点，`./` 是当前目录，`../` 是上一级；绝对路径从盘符写全。新手建议用相对路径，代码挪到别的电脑上不用改。

## 3. 覆盖的 w，追加的 a

同样是写，两个模式行为完全不同。

```python
# 第一次运行：文件被创建，写入一行
f = open('python.txt', 'a', encoding='utf-8')
f.write('人生苦短，我用Python!\n')
f.close()

# 再运行一次：文件还在，又多了一行
f = open('python.txt', 'a', encoding='utf-8')
f.write('人生苦短，我用Python!\n')
f.close()
```

跑两遍，`python.txt` 里有两行。把 `'a'` 换成 `'w'` 再跑一遍试试——文件里只剩一行，第一次写的内容被覆盖掉了。

| 模式 | 文件不存在 | 文件存在 |
|---|---|---|
| `'w'` | 创建新文件 | 清空后写入 |
| `'a'` | 创建新文件 | 在末尾追加 |
| `'r'` | 报错 `FileNotFoundError` | 正常读取 |

拿不准就用 `a`，最多内容重复，不会丢数据。

## 4. 读文件

写入会了，读回来。打开方式换成 `'r'`，读法有几种，按需选。

```python
f = open('python.txt', 'r', encoding='utf-8')

# 一口气读完，返回整个字符串
contents = f.read()
print(contents)

# 只读 10 个字符
contents = f.read(10)
print(contents)

# 按行读完，装进一个列表
content_list = f.readlines()
for content in content_list:
    print(content, end='')

# 一次读一行，配合循环读完整个文件
while True:
    data = f.readline()      # 读一行
    if not data:             # 读不到数据（到文件末尾）就结束
        break
    print(data, end='')      # 行尾自带 \n，print 别再加换行

f.close()
```

最后那个 `while True` 值得多看一眼：`readline()` 读到文件末尾会返回空字符串 `''`，`if not data` 对空字符串判定为假，所以「读不到就停」就是整个循环的出口。后面写文件复制时还会用这个套路。

| 姿势 | 返回什么 | 什么时候用 |
|---|---|---|
| `read()` | 一整个字符串 | 小文件，一次处理 |
| `read(n)` | n 个字符 | 大文件分块读，省内存 |
| `readlines()` | 字符串列表 | 按行处理、行数不多 |
| `readline()` + 循环 | 一行 | 大文件逐行处理，最常用 |

## 5. os 模块

读写会了，接着是文件管理。Python 自带的 `os` 模块是操作系统的遥控器。

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

`os.rename(旧名, 新名)` 不只改名——把新名写成别的目录下的路径，它还能顺手移动文件。

管目录的函数也是一批：

```python
import os

# 1.创建目录（先判断，不存在才建）
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

`os.rmdir` 只能删空目录，目录里有一个文件它都拒绝。这不是缺陷，是保护。

## 6. shutil 模块

`os` 管不了「复制文件」和「删非空目录」，这两件事归 `shutil`。

```python
import os
import shutil

# 1.建目录、写个文件进去
os.mkdir('./test')
f = open('./test/hello.txt', 'w', encoding='utf-8')
f.write('你好~\nhello\nhi！\n')
f.close()

# 2.复制文件
shutil.copy('./test/hello.txt', './python.txt')
print(os.listdir('./'))

# 3.删除整个目录，不管里面有多少东西
shutil.rmtree('./test')
print(os.listdir('./'))
```

分工记一下：

| 想干什么 | 用谁 |
|---|---|
| 重命名 / 移动 / 删除单个文件 | `os.rename` / `os.remove` |
| 创建 / 切换 / 列举 / 删空目录 | `os.mkdir` / `os.chdir` / `os.listdir` / `os.rmdir` |
| 复制文件 | `shutil.copy` |
| 删除整个目录 | `shutil.rmtree` |

`rmtree` 删东西不进回收站，写之前先确认路径对不对。

## 7. 文件操作里的异常

前面几节的代码都默认文件存在。删掉这个前提试试：

```python
f = open('./hello.txt', 'r', encoding='utf-8')   # 文件根本不存在
content = f.read()
print(content)
f.close()
```

```
FileNotFoundError: [Errno 2] No such file or directory: './hello.txt'
```

第 9 篇学的异常处理，这里派上用场了。文件操作是整个系列里最容易出意外的代码：文件可能不存在、可能被占用、可能没权限，这些都不是你代码写错了，是「世界不配合」。所以文件操作天生该包在 `try` 里：

```python
f = None
try:
    f = open('./hello.txt', 'r', encoding='utf-8')
    content = f.read()
    print(content)
except FileNotFoundError as e:
    print(f'文件没有，请核实！错误信息：{e}')
finally:
    if f:
        f.close()
```

三个要点：

1. `except FileNotFoundError` 只接「文件不存在」这一种意外，其他意外该崩还得崩，别裸捕；
2. `finally` 里关文件——打开成功与否，清理都得跑；
3. `f = None` 先声明——如果 `open` 那行就炸了，`f` 根本没被创建，`finally` 里直接 `f.close()` 会再炸一次 `NameError`。先给 `None`，再用 `if f:` 判断。

这个写法完全正确，但啰嗦。为了关个文件搭了三层结构，Python 给了个更省事的答案。

## 8. with 语句

```python
with open('./hello.txt', 'r', encoding='utf-8') as f:
    content = f.read()
    print(content)

# 出了 with 的缩进块，文件已经自动关闭了
```

`with` 把 `open()` 交给它保管，缩进块里的代码正常跑也好、中途报错也好，退出缩进块的那一刻文件一定被关闭。跟第 7 节的 try/finally 版本比，安全性一样，代码量少一半。以后写文件操作默认就用 `with`，手动 `close()` 只用来理解原理。

`with` 还能一次管多个文件，逗号排开：

```python
with open('./python.txt', 'r', encoding='utf-8') as read_file, \
        open('./hello.txt', 'w', encoding='utf-8') as write_file:
    while True:
        line_content = read_file.readline()   # 一行一行读
        if len(line_content) == 0:            # 读到空字符串，读完了
            break
        write_file.write(line_content)        # 有数据就写进新文件
```

行尾的 `\` 是续行符。这段代码就是一个完整的文件复制器。

## 9. 三个文件小工具

### 9.1 内容反转器

按行读取文件，每行内容反转，写进新文件：

```python
# 1.读取文件内容
with open('./datas/a.txt', 'r', encoding='utf-8') as src_file:
    src_lines = src_file.readlines()

# 2.逐行反转
reversed_lines = []
for src_line in src_lines:
    content = src_line.rstrip('\n')           # 去掉行尾换行符
    reversed_content = content[::-1]          # 步长 -1：字符串反转
    reversed_lines.append(reversed_content + '\n')

# 3.整体写入新文件
with open('./datas/b.txt', 'w', encoding='utf-8') as dst_file:
    dst_file.writelines(reversed_lines)
```

`rstrip` 是第 5 篇的字符串方法，`[::-1]` 是切片步长，`writelines` 接一个列表一次写完，正好是 `readlines` 的反操作。

### 9.2 文件备份器

需求：给任意文件做备份，`python.txt` 备份成 `python-备份.txt`。难点在拆文件名——要把扩展名前后的部分分开。

```python
# 1.定义源文件路径
source_file = 'python.txt'

# 2.拆出前缀名和后缀名
# 把文件名反转，找第一个 '.' 的位置，再换算回正序的下标
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

拆文件名那两行是纯字符串功夫。为什么从右边找 `.`？因为文件名里可能有多个点（`my.file.v2.txt`），从右找才能拿到真正的扩展名。

## 10. 常见坑

1. 忘了 `close()`（或没用 `with`）——`write` 的内容可能还躺在缓冲区里没落盘，文件是 0KB，程序一崩数据全丢。这是文件操作 bug 榜第一名，用 `with` 直接根治；
2. 拿 `'w'` 当追加用——`open` 的那一刻旧内容就清空了，写多少遍文件里都只有最后一次的内容；
3. 读完又读——`read()` 之后指针停在末尾，再 `read()` 是空字符串。要么重新 `open`，要么 `f.seek(0)` 拨回开头；
4. Windows 路径的反斜杠——`'D:\test\new.txt'` 里的 `\t`、`\n` 是转义字符，路径会被读得面目全非。用正斜杠，或在字符串前加 `r`；
5. `os.rmdir` 删不掉非空目录，要连锅端用 `shutil.rmtree`；
6. `encoding='utf-8'` 忘了写，Windows 上默认 GBK，换台机器就乱码；
7. 打开只读文件不设防——文件不存在时 `'r'` 直接 `FileNotFoundError`，要么 `os.path.exists()` 先判断，要么 `try/except` 接住。

## 11. 课后小项目

**练习一：日记本（必做）**

写一个能「记住」的日记程序：启动后先打印历史日记（读文件），再让用户输入一句话，以「日期 + 内容」的格式追加保存。日期用 `from datetime import datetime` 拿 `datetime.now()`。全程用 `with`，读的部分用 `try` 接住「第一次运行还没有文件」的情况。

**练习二：给备份器加时间戳**

改造 9.2 的备份器：`python.txt` 备份成 `python-20261101-备份.txt`。日期从 `datetime.now()` 拼，同一天可以备份多份，互不覆盖。

**练习三：批量重命名**

一个文件夹里有一堆 `.txt` 文件，把每个文件名前面都加上 `AI_` 前缀：用 `os.listdir` 拿所有文件，筛出 `.txt` 结尾的，逐个 `os.rename`。做完再想想：跑两遍会怎样？加个判断跳过已经改过名的。

**练习四：语料统计器**

把一段对话语料存进 `corpus.txt`，统计每个词出现的次数，按次数从高到低写进 `result.txt`——读文件用第 4 节，统计用第 5 篇的字典，排序用 `sorted` + `lambda`，写文件用 `with`。四样旧知识加一个新知识。

## 12. 本篇小结

程序终于能「记得住事」了。文件操作记住三件事就够：打开用 `with`、写用 `a` 追加别乱覆盖、读用 `readline()` 逐行处理大文件。路径优先用相对路径，编码每次都写 `utf-8`。

到这里，程序能存数据了，但第 6 篇留过一个尾巴：有些功能——日志、计时、登录检查——想加给一堆函数，总不能复制十遍。下一篇的闭包和装饰器就是答案——[第 12 篇：闭包与装饰器](/post/python-closures-decorators/)。
