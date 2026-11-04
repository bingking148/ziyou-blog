---
title: 'Python 第 17 篇：进程与线程，让程序同时干几件事'
weight: 17
cover: /images/covers/python-process-thread-cover.jpg
date: 2026-11-03T15:00:00+08:00
lastmod: 2026-11-04T09:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '多线程', '多进程']
description: '程序还在一件一件做事？这篇让它同时干好几件：进程怎么开、线程怎么开、它们共享不共享变量、多线程抢数据会出什么乱子、怎么用锁守住数据，最后看清死锁是怎么来的。'
math: false
mermaid: false
comments: true
toc: true
---

前面写的程序都是「一条道走到黑」：一句执行完才执行下一句。可有些场景这样不行——边下载边显示进度、边听歌边写代码、服务器同时接待好几个客户端。

「同时干好几件事」这件事，Python 有两个工具：**进程**和**线程**。这篇把它们讲清楚，顺便拆掉并发里最出名的两个坑：抢数据和死锁。

## 1. 先看串行的憋屈

写代码和听音乐，串行做是这样的：代码写完三行，再听三段音乐，一共六步挨着来。

```python
import multiprocessing
import time

def coding():
    for idx in range(3):
        print('写代码............')
        time.sleep(0.5)

def music():
    for idx in range(3):
        print('听音乐...............')
        time.sleep(0.5)

coding()
music()
```

输出是「写代码」三遍，然后「听音乐」三遍。想让它们**同时**进行，就得开进程：

```python
p1 = multiprocessing.Process(target=coding)   # 进程一：敲代码
p2 = multiprocessing.Process(target=music)    # 进程二：听音乐

p1.start()   # 启动
p2.start()

p1.join()    # 等两个进程都跑完
p2.join()
```

这次「写代码」和「听音乐」混着出来——两个进程同时跑。`target` 指定进程要执行的函数，`start()` 启动，`join()` 是「等它跑完再继续」。

## 2. 进程：独立的小房间

进程可以理解成一个独立的小房间，每个房间有自己的内存。用 `multiprocessing.Process` 开一个：

```python
import multiprocessing
import os

def show_pid():
    print(f'子进程 pid = {os.getpid()}')
    print(f'父进程 ppid = {os.getppid()}')

print(f'主进程 pid = {os.getpid()}')
p = multiprocessing.Process(target=show_pid)
p.start()
p.join()
```

`os.getpid()` 拿当前进程的编号，`os.getppid()` 拿父进程编号。每个进程都有独立编号，就像每个房间有独立门牌。

给进程传参数，用 `args`（元组）或 `kwargs`（字典）：

```python
def coding(num: int, name: str):
    for idx in range(1, num + 1):
        print(f'{name}写了第{idx}代码............')
        time.sleep(0.5)

p1 = multiprocessing.Process(target=coding, args=(5, '张三'))
p2 = multiprocessing.Process(target=coding, kwargs={'num': 10, 'name': '李四'})
```

### 2.1 进程不共享全局变量

「独立小房间」意味着：一个进程改了全局变量，别的进程看不到。

```python
import multiprocessing

global_list = []

def write_data():
    for idx in range(1, 5):
        global_list.append(idx)
    print(f'子进程：{global_list}')      # [1, 2, 3, 4]

p = multiprocessing.Process(target=write_data)
p.start()
p.join()

print(f'主进程：{global_list}')          # []，还是空的！
```

子进程里 `global_list` 加到了 `[1, 2, 3, 4]`，但主进程打印出来还是 `[]`。因为进程是各自独立的内存，子进程里那份 `global_list` 是复制过去的一份，改了不影响主进程的。

那进程之间怎么通信？靠一个专门的「通道」——队列。

### 2.2 进程间通信：Queue

```python
from multiprocessing import Queue, Process

def put_data(queue):
    for data in range(1, 5):
        queue.put(data)
        print(f'Queue放入数据：{data}')
    queue.put('END')   # 放一个结束标志

def get_data(queue):
    while True:
        data = queue.get()
        if data == 'END':
            break
        print(f'从队列获取数据：{data}')

data_queue = Queue()
p1 = Process(target=put_data, args=(data_queue,))
p2 = Process(target=get_data, kwargs={'queue': data_queue})
p1.start(); p2.start()
p1.join(); p2.join()
```

一个进程 `put` 数据进队列，另一个进程 `get` 取出来。队列是进程之间的公共通道，这是进程共享数据的正规方式。`'END'` 这种结束标志，用来告诉接收方「数据放完了」。

### 2.3 进程池：一批任务交给几个工人

开太多进程也费资源，用进程池固定几个「工人」轮流干活：

```python
import multiprocessing
import time

def work(x):
    time.sleep(0.2)
    return x * x

start_time = time.time()
with multiprocessing.Pool(4) as pool:      # 4 个工人的池子
    result = pool.map(work, range(1, 9))
end_time = time.time()
print(f'耗时：{end_time - start_time}')
print(result)   # [1, 4, 9, 16, 25, 36, 49, 64]
```

`Pool(4)` 造一个四个工人的池子，`pool.map(work, range(1, 9))` 把 1 到 8 这八个数分给四个工人算平方，结果按顺序收回来。8 个任务 4 个工人，比一个工人挨个算快得多。

## 3. 线程：同一房间里的几个人

线程比进程轻。进程是独立的小房间，线程是同一个房间里的几个人——**共享同一份内存**。

```python
import threading

def work(number):
    for idx in range(1, number + 1):
        print(idx)

t = threading.Thread(target=work, args=(10,))
t.start()
t.join()
```

用法和进程几乎一模一样，只是 `multiprocessing.Process` 换成 `threading.Thread`。

关键区别在共享上：进程不共享全局变量，**线程共享**。

```python
import threading

global_list = []

def write_data():
    for idx in range(1, 6):
        global_list.append(idx)
    print(f'写线程：{global_list}')

t1 = threading.Thread(target=write_data)
t1.start()
t1.join()

print(f'主线程：{global_list}')   # [1, 2, 3, 4, 5]，线程改了主线程能看到
```

线程共享全局变量，所以写线程往里加的数据，主线程能看到。这既是线程的优点（通信方便），也是麻烦的源头。

## 4. 抢数据：多线程的坑

共享内存是双刃剑。多个线程同时改同一个变量，会乱：

```python
import threading
import time

global_counter = 0

def increment_counter(times: int):
    global global_counter
    for _ in range(times):
        temp = global_counter           # 1-读出来
        time.sleep(0.0001)              # 模拟一点耗时
        global_counter = temp + 1       # 2-算完写回去

t1 = threading.Thread(target=increment_counter, args=(20,), name='t1')
t2 = threading.Thread(target=increment_counter, args=(20,), name='t2')
t1.start(); t2.start()
t1.join(); t2.join()

print(global_counter)   # 结果不是 40！可能只有 20 出头
```

两个线程各加 20 次，结果应该是 40，但实际打印出来常常不到 40。原因在 `time.sleep(0.0001)` 这个停顿：两个线程都读到了同样的值，各自加一写回去，其中一次就白加了。

```
t1: 读 0 → 算 1
t2: 读 0 → 算 1      ← 两个都读到了 0
t1: 写 1
t2: 写 1             ← 覆盖了，本该是 2
```

这种「多个线程同时读写同一份数据、结果取决于谁先谁后」的情况，叫竞态条件。`sleep` 只是把这种本来就会发生的错放大到肉眼可见。

## 5. 锁：一次只放一个人进去

解决抢数据，用锁。锁就是一个门闩：谁进去就把门锁上，别人在外面等，出来才开锁。

```python
import threading
import time

global_counter = 0
mutex = threading.Lock()    # 造一把锁

def increment_counter(times: int):
    global global_counter
    mutex.acquire()          # 上锁：别人进不来
    for _ in range(times):
        time.sleep(0.0001)
        global_counter += 1
    mutex.release()          # 开锁：让下一个人进去

t1 = threading.Thread(target=increment_counter, args=(20,), name='t1')
t2 = threading.Thread(target=increment_counter, args=(20,), name='t2')
t1.start(); t2.start()
t1.join(); t2.join()

print(global_counter)   # 40，对了
```

`acquire()` 上锁，`release()` 开锁。一个线程 `acquire` 之后、`release` 之前，另一个线程的 `acquire` 会卡住等。这样「读—改—写」三步变成了原子操作，别人插不进来。

上锁还有一种更稳的写法，用 `with`——第 11 篇学过的上下文管理器，锁也支持：

```python
with mutex:                 # 进入自动上锁，退出自动开锁
    for _ in range(times):
        time.sleep(0.0001)
        global_counter += 1
```

`with` 比手动 `acquire/release` 好在：中间代码万一报错，锁也会被释放。手动写法一旦中间抛异常、没执行到 `release`，锁就永远锁着，别的线程全卡死。要手动写，就得用 `try/finally` 保证释放：

```python
mutex.acquire()
try:
    for _ in range(times):
        time.sleep(0.0001)
        global_counter += 1
finally:
    mutex.release()      # 不管成没成功，都要开锁
```

## 6. 死锁：两把锁互相等

锁用不好，还有更隐蔽的坑：死锁。两个线程各自拿着一把锁，又都在等对方手里的另一把锁，谁都动不了。

```python
import threading
import time

lock_a = threading.Lock()
lock_b = threading.Lock()

def task1():
    with lock_a:
        time.sleep(0.1)
        with lock_b:          # 等 lock_b
            print('task1 干活')

def task2():
    with lock_b:
        time.sleep(0.1)
        with lock_a:          # 等 lock_a
            print('task2干活')

t1 = threading.Thread(target=task1)
t2 = threading.Thread(target=task2)
t1.start(); t2.start()
t1.join(); t2.join()
```

`task1` 先拿 `lock_a`、再等 `lock_b`；`task2` 先拿 `lock_b`、再等 `lock_a`。两边各拿一把、各等对方那把，就僵住了——程序不报错，但永远停在那里不退出。避免死锁的通用办法：**所有线程按同样的顺序拿锁**。上面把 `task2` 也改成先 `lock_a` 后 `lock_b`，死锁就解开了。

## 7. 进程还是线程？

| 维度 | 进程 | 线程 |
|---|---|---|
| 内存 | 各自独立，不共享 | 共享同一份 |
| 开销 | 大（要复制内存） | 小 |
| 通信 | 要借助 Queue | 直接用全局变量 |
| 适合 | CPU 密集（算得多） | IO 密集（等待多） |

一句话：要「算得多」用进程，要「等得多」用线程。爬网页、调 API 这类大部分时间在等网络响应的活，用线程；真正要榨干 CPU 的计算，用进程。

## 8. 常见坑

1. 忘了 `join()`——主进程先跑完了，子进程被强杀，看起来「没效果」。要 `join()` 等它们结束；
2. 进程里改全局变量以为主进程能看到——进程不共享内存，改的是复制的那份。要通信用 `Queue`；
3. 多线程改同一变量不上锁——结果时对时错，随机性 bug 最难查。共享可变数据，加锁；
4. 上锁后忘了释放——中间抛异常没执行到 `release`，别的线程全卡死。用 `with` 锁，或 `try/finally`；
5. 两把锁交叉拿——死锁，程序不报错但永远停住。锁的获取顺序要全程序统一；
6. 线程开太多——线程也占资源，不是越多越快。IO 密集几十个够用，别一开上千。

## 9. 课后小项目

**练习一：并发计数器（必做）**

写两个线程各给 `global_counter` 加 1000 次，先不上锁跑一遍看结果是不是 2000，再加锁跑一遍对比。亲眼看到竞态条件和锁的作用。

**练习二：边下载边显示进度**

用两个线程模拟：一个线程循环打印「正在下载…」，另一个线程 `time.sleep(3)` 模拟下载完成后改一个全局标志。第一个线程读到标志就停。体会线程共享全局变量带来的方便。

**练习三：多线程爬虫（综合）**

写一个「模拟调 API」的函数 `fetch(url)`，`time.sleep` 模拟耗时后返回 `f'{url} 已返回'`。用 5 个线程并发 `fetch` 5 个不同的 URL，对比串行和并发的总耗时。

**练习四：进程池算一批数**

用 `multiprocessing.Pool(4)` 算 1 到 100000 的平方和，对比单线程的耗时。体会进程池对 CPU 密集任务的加速。

## 10. 本篇小结

进程是独立的小房间（不共享内存、靠 Queue 通信），线程是同一房间里的几个人（共享内存、要防抢数据）。多线程改共享变量要加锁，`with mutex` 最省心；两把锁交叉拿就是死锁，统一获取顺序能避免。算得多用进程，等得多用线程。

到这里，程序能并发干活了。最后一篇讲两个处理数据的利器：正则表达式和生成器——一个管「从杂乱的文本里挖出想要的」，一个管「用很小的内存处理超大的数据」——[第 18 篇：正则与生成器](/post/python-regex-generator/)。
