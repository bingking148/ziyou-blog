---
title: '网络与并发 第 2 篇：进程与线程，让程序同时干几件事'
weight: 2
cover: /images/covers/python-process-thread-cover.jpg
date: 2026-11-03T15:00:00+08:00
lastmod: 2026-11-12T20:30:00+08:00
categories: ['人工智能', 'Python', 'Python网络与并发']
tags: ['Python', '编程基础', '多线程', '多进程']
description: '程序还在一件一件做事？这篇让它同时干好几件：进程怎么开、线程怎么开、它们共享不共享变量、多线程抢数据会出什么乱子、怎么用锁守住数据，最后看清死锁是怎么来的。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇的程序能隔着网络收发了，但一句执行完才执行下一句。边下载边显示进度、服务器同时接待好几个客户端，就得同时干好几件事。

「同时干好几件事」这件事，Python 有两个工具：**进程**和**线程**。这篇把它们讲清楚，顺便把并发里最容易出问题的两件事讲清楚：抢数据和死锁。

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

进程可以理解成一个独立的小房间，每个房间有自己的内存。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-process-vs-thread-memory" viewBox="0 0 680 420" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>进程各有一份内存，线程住在同一间房里共享同一份列表</title>
  <style>
    .diag-process-vs-thread-memory { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-process-vs-thread-memory { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <text x="180" y="28" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">进程：独立的小房间</text>
  <path d="M32,47.6 Q105.5,48.3 178,48.3 Q190.3,48.1 189.5,60 Q190.1,128.3 190.1,196 Q190,207.9 178,208 Q105.6,208.3 32,208.3 Q19.8,207.8 20.5,196 Q20.3,128.5 19.9,60 Q20,47.6 32,47.6 Z" fill="none" stroke="var(--blue)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="105" y="70" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--blue)" font-weight="bold">子进程</text>
  <path d="M50,95 Q104.9,96.9 160,95.5 Q169.6,96 170.6,106 Q169,131.1 170.5,156 Q169.9,166 160,165.5 Q104.5,165 50,165.3 Q40.3,166.1 40.5,156 Q40.6,130.9 39.2,106 Q39.8,96.1 50,95 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="105" y="121.8" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">global_list</text><text x="105" y="140.2" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">[1, 2, 3, 4]</text>
  <path d="M222,48.4 Q295,48.8 368,48.9 Q380.2,47.7 380.4,60 Q379.3,127.4 381,196 Q380.2,208.2 368,207.6 Q295.4,208.3 222,208 Q209.9,207.9 209.9,196 Q210.2,127.5 210.3,60 Q209.8,47.9 222,48.4 Z" fill="none" stroke="var(--teal)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="295" y="70" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--teal)" font-weight="bold">主进程</text>
  <path d="M240,96.5 Q295,95.5 350,95.2 Q359.9,96 360.7,106 Q360.3,130.9 361,156 Q359.8,165.9 350,166.4 Q295.6,165.4 240,165.3 Q229.8,165.9 230.5,156 Q229.3,131.5 230.1,106 Q230.4,95.8 240,96.5 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="295" y="121.8" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">global_list</text><text x="295" y="140.2" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">[]</text>
  <path d="M90,229 Q199.5,229.9 310,229.5 Q330.3,230.3 330.7,250 Q329.9,254.6 330.7,260 Q329.9,280.2 310,279.6 Q199.4,280.3 90,280.7 Q70.2,280 69.4,260 Q70,254.7 70.4,250 Q70.3,230.3 90,229 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="200" y="255" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">Queue</text>
  <text x="90" y="255" font-size="14" text-anchor="start" dominant-baseline="central" fill="var(--amber)">put</text>
  <text x="310" y="255" font-size="14" text-anchor="end" dominant-baseline="central" fill="var(--amber)">get</text>
  <line x1="105" y1="208" x2="105" y2="223" stroke="var(--amber)" stroke-width="1.5" stroke-linecap="round"/><path d="M105,230 L107.8,223 L102.2,223 Z" fill="var(--amber)"/>
  <line x1="295" y1="230" x2="295" y2="215" stroke="var(--amber)" stroke-width="1.5" stroke-linecap="round"/><path d="M295,208 L292.2,215 L297.8,215 Z" fill="var(--amber)"/>
  <text x="200" y="300" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">两边各一份列表，要通信得另走管道</text>
  <text x="530" y="28" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">线程：同一间房里的人</text>
  <path d="M414,48.2 Q530.1,47.1 646,47.8 Q660.2,48.3 659.7,62 Q659.1,198 660.8,334 Q660.2,348.2 646,347.3 Q530.2,347.5 414,348.3 Q399.8,348.4 400.8,334 Q400.5,198 399.2,62 Q399.9,48.2 414,48.2 Z" fill="none" stroke="var(--purple)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M450,200 Q529.5,200.4 610,199.6 Q620.1,200.2 619.8,210 Q620.1,239.8 620.8,270 Q620.3,279.7 610,280.5 Q529.5,281 450,280.3 Q439.6,280.1 441,270 Q439.3,239.7 439.2,210 Q439.6,199.6 450,200 Z" fill="var(--fill-purple)" stroke="var(--purple)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="530" y="229.4" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">global_list</text><text x="530" y="250.6" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">[1, 2, 3, 4, 5]</text>
  <circle cx="470" cy="97.6" r="11.2" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.7"/><path d="M454.6,114.8 Q470,108.8 485.4,114.8 L480.8,146.6 Q470,149.6 459.2,146.6 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="470" y="168" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">写线程</text>
  <circle cx="590" cy="97.6" r="11.2" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.7"/><path d="M574.6,114.8 Q590,108.8 605.4,114.8 L600.8,146.6 Q590,149.6 579.2,146.6 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="590" y="168" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--blue)">主线程</text>
  <line x1="470" y1="176" x2="494.5" y2="195.6" stroke="var(--amber)" stroke-width="1.6" stroke-linecap="round"/><path d="M500,200 L496.3,193.4 L492.8,197.8 Z" fill="var(--amber)"/>
  <line x1="590" y1="176" x2="565.5" y2="195.6" stroke="var(--blue)" stroke-width="1.6" stroke-linecap="round"/><path d="M560,200 L567.2,197.8 L563.7,193.4 Z" fill="var(--blue)"/>
  <text x="530" y="320" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--purple)">共享同一份内存</text>
</svg>
</figure>
用 `multiprocessing.Process` 开一个：

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

## 4. 抢数据

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

上锁还有一种更稳的写法，用 `with`——[《Python 文件与数据》第 1 篇](/post/python-file-operations/)学过的上下文管理器，锁也支持：

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

锁用不好，还有更隐蔽的问题：死锁。两个线程各自拿着一把锁，又都在等对方手里的另一把锁，谁都动不了。

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

`task1` 先拿 `lock_a`、再等 `lock_b`；`task2` 先拿 `lock_b`、再等 `lock_a`。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-deadlock-two-locks" viewBox="0 0 680 400" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>两个任务各拿一把锁、再等对方那把，就形成死锁</title>
  <style>
    .diag-deadlock-two-locks { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-deadlock-two-locks { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M50,80.1 Q105,79 160,79.7 Q169.8,80.3 169.5,90 Q169.2,114.5 170.2,140 Q170.1,150.1 160,150.4 Q105.1,149.8 50,150.3 Q40.3,149.8 39.9,140 Q39.2,115 39,90 Q39.8,79.8 50,80.1 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="105" y="115" font-size="20" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">task1</text>
  <path d="M520,80.3 Q575.6,80.7 630,80.5 Q639.7,80.3 639.8,90 Q640,115.3 640.3,140 Q640.3,150.4 630,149.5 Q574.7,150.9 520,150.6 Q509.8,150.2 510.8,140 Q509.5,114.9 510.4,90 Q509.9,80.4 520,80.3 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="575" y="115" font-size="20" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">task2</text>
  <path d="M90,200.6 Q139.6,200.7 190,200.6 Q199.7,200.1 199.4,210 Q200.2,227.8 200.9,246 Q200,255.7 190,256.7 Q139.9,256.3 90,256.9 Q80.4,256.1 79.2,246 Q80.1,228 80.2,210 Q79.8,199.9 90,200.6 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="140" y="228" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">lock_a</text>
  <text x="140" y="270" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--blue)">task1 握着</text>
  <line x1="105" y1="150" x2="120" y2="200" stroke="var(--blue)" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M490,200 Q540,199.8 590,199.2 Q600.2,199.7 599.9,210 Q600.6,228.3 600.2,246 Q599.9,255.8 590,255.4 Q539.6,256 490,256.6 Q479.9,256.3 480.3,246 Q480,227.4 480.4,210 Q480.2,200.4 490,200 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="540" y="228" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">lock_b</text>
  <text x="540" y="270" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">task2 握着</text>
  <line x1="575" y1="150" x2="560" y2="200" stroke="var(--amber)" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M200,220 Q340,180 480,220" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M480,220 L471.5,213.4 L469.3,221.1 Z" fill="var(--red)"/>
  <text x="340" y="168" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--red)" font-weight="bold">等</text>
  <path d="M480,240 Q340,300 200,240" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M200,240 L207.6,247.6 L210.8,240.3 Z" fill="var(--red)"/>
  <text x="340" y="318" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--red)" font-weight="bold">等</text>
  <text x="340" y="40" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--red)" font-weight="bold">两边各拿一把、各等对方那把</text>
  <line x1="30" y1="345" x2="650" y2="345" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-dasharray="6 5" opacity="0.5"/>
  <text x="340" y="364" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">解开的办法：所有线程按同样的顺序拿锁</text>
  <text x="340" y="386" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--green)">task1、task2 都是先 lock_a，后 lock_b</text>
</svg>
</figure>
两边各拿一把、各等对方那把，就僵住了——程序不报错，但永远停在那里不退出。避免死锁的通用办法：**所有线程按同样的顺序拿锁**。上面把 `task2` 也改成先 `lock_a` 后 `lock_b`，死锁就解开了。

## 7. 进程还是线程？

| 维度 | 进程 | 线程 |
|---|---|---|
| 内存 | 各自独立，不共享 | 共享同一份 |
| 开销 | 大（要复制内存） | 小 |
| 通信 | 要借助 Queue | 直接用全局变量 |
| 适合 | CPU 密集（算得多） | IO 密集（等待多） |

要「算得多」用进程，要「等得多」用线程。爬网页、调 API 这类大部分时间在等网络响应的活，用线程；真正要榨干 CPU 的计算，用进程。

## 8. 几个容易写错的地方

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

用两个线程模拟：一个线程循环打印「正在下载…」，另一个线程 `time.sleep(3)` 模拟下载完成后改一个全局标志。第一个线程读到标志就停。看看线程共享全局变量有多方便。

**练习三：多线程爬虫（综合）**

写一个「模拟调 API」的函数 `fetch(url)`，`time.sleep` 模拟耗时后返回 `f'{url} 已返回'`。用 5 个线程并发 `fetch` 5 个不同的 URL，对比串行和并发的总耗时。

**练习四：进程池算一批数**

用 `multiprocessing.Pool(4)` 算 1 到 100000 的平方和，对比单线程的耗时。看看进程池对 CPU 密集任务的加速。

## 10. 小结

进程是独立的小房间（不共享内存、靠 Queue 通信），线程是同一房间里的几个人（共享内存、要防抢数据）。多线程改共享变量要加锁，`with mutex` 最省心；两把锁交叉拿就是死锁，统一获取顺序能避免。算得多用进程，等得多用线程。

程序能并发干活了。下一篇换一种等法：网页在转圈的时候，不要干站着——[网络与并发 第 3 篇：协程](/post/python-asyncio-coroutine/)。
