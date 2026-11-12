---
title: 'Python 第 19 篇：协程，等网络的时候别干站着'
weight: 19
cover: /images/covers/python-asyncio-coroutine-cover.jpg
date: 2026-11-09T09:00:00+08:00
updatedDate: 2026-11-09T09:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '协程', 'asyncio']
description: '线程等网络时整个人都被挂住。协程是程序自己调度的轻量级线程：async def 定义，await 让出控制权，create_task 加 gather 才能并行。最后同时请求几个网址。'
math: false
mermaid: false
comments: true
toc: true
---

第 17 篇让程序同时干几件事，靠的是进程和线程。等网络的时候，线程的做法是：这个人站住不干活，操作系统再派另一个人上去。人多了，光换人就很贵。

协程换了个办法。它还是住在线程里面，但谁先跑、谁让开，由**程序自己**说了算，不麻烦操作系统。所以它又叫微线程：轻，而且能暂停、能接着跑。

这一篇的小项目是同时请求几个网址。先把「定义了却不跑」「串行等」「并行等」「主协程一走子任务被取消」这几件事看清楚，再去发请求。

## 1. 进程、线程、协程各管一层

三句话，用的都是它们各自的岗位：

- **进程**：操作系统进行资源分配和调度的基本单位，一个正在运行的程序实例。
- **线程**：操作系统调度的最小单位，是进程里的一个执行流。同一进程里的线程共享内存，所以第 17 篇才要加锁。
- **协程**：用户态的轻量级线程，由程序自己调度，不是操作系统调度。它可以暂停，也可以从暂停的地方恢复。

适用的场景很具体：大量网络等待、异步 IO。Python 里对应 `asyncio`，别的语言里你可能听过 Go 的 goroutine、Kotlin 的协程、JS 的 `async/await`。名字不同，都是「等 IO 的时候把人让出来」。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-coroutine-nest" viewBox="0 0 680 420" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>操作系统里是进程，进程里是线程，线程里是程序自己调度的协程</title>
  <style>
    .diag-py-coroutine-nest { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f8d6d8; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-coroutine-nest { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c2428; --fill-gray:#2a2d33; }
  </style>
  <text x="340" y="28" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">操作系统 OS</text>
  <rect x="36" y="52" width="290" height="340" rx="16" fill="none" stroke="var(--blue)" stroke-width="1.8"/>
  <rect x="354" y="52" width="290" height="340" rx="16" fill="none" stroke="var(--gray)" stroke-width="1.6" stroke-dasharray="6 4"/>
  <text x="181" y="80" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">进程 Process</text>
  <text x="499" y="80" font-size="18" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">进程 Process</text>
  <rect x="56" y="108" width="118" height="260" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <rect x="188" y="108" width="118" height="260" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="115" y="136" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">线程 Thread</text>
  <text x="247" y="136" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">线程</text>
  <rect x="70" y="164" width="90" height="186" rx="10" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="115" y="190" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">协程</text>
  <text x="115" y="214" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">可暂停</text>
  <text x="115" y="236" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">可恢复</text>
  <text x="247" y="200" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">协程</text>
  <text x="247" y="224" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">协程</text>
  <text x="499" y="200" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">……</text>
  <text x="340" y="412" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--red)">协程由程序自己调度，不是操作系统</text>
</svg>
</figure>

线程的不足，放在「同时等几千个网址」这种场面里就显出来了：换人要操作系统出面，开销大；大家共享内存，还得加锁；一个线程卡在网络上，人就挂在那儿。协程同一时刻只跑一个，不用为了共享数据互相抢锁，等 IO 时主动让开，切换只是一次函数调用那么轻。

## 2. async def：定义了，并不会马上跑

Python 3.5 之后，协程用 `async` 和 `await` 写。`async def` 定义的是**协程函数**。你调用它，拿到的不是结果，是一个协程对象。

```python
import asyncio


async def hello():
    print("Hello")
    await asyncio.sleep(1)   # 假装在等网络
    print("World")


coro = hello()
print(type(coro))            # <class 'coroutine'>
```

屏幕上还没有 Hello。函数体一行都没执行。

谁来跑它？**事件循环**。3.7 以后，入口就是 `asyncio.run()`：它建好事件循环，把你传进去的协程当成主任务跑完，再把循环关掉。

```python
asyncio.run(hello())
# Hello
# （大约 1 秒）
# World
```

> [!NOTE]
> `await` 只能写在协程函数里面。普通 `def` 里写 `await`，语法直接不过。

## 3. await：遇到等待，就把控制权交出去

`await` 等的是一个可等待对象，通常是另一个协程，或者一次 IO。

遇到 `await` 时，当前协程暂停，进入挂起。事件循环去看还有没有别的协程已经就绪。等的那件事完成了（比如睡眠到点、响应回来了），事件循环再把控制权还回来，从 `await` 的下一行继续。

所以协程不是「操作系统发现你卡住了把你换掉」，是你自己在 `await` 那一行说：我先让一让。

## 4. 串行：一个等完，才开始下一个

两个任务，如果写成连续两个 `await`，就是串行。前一个没完，后一个不会开始。

```python
import asyncio
import time


async def my_func(name: str, delay: int):
    print(f"任务【{name}】开始执行！")
    await asyncio.sleep(delay)
    print(f"任务【{name}】执行完成！")
    return f"任务【{name}】完成"


async def main_func():
    print("串行执行")
    await my_func("A", 2)
    await my_func("B", 1)


start = time.perf_counter()
asyncio.run(main_func())
print(f"耗时：{time.perf_counter() - start:.2f} 秒")
```

A 睡 2 秒，B 再睡 1 秒，总时间大约 3 秒。输出顺序是 A 开始、A 完成、B 开始、B 完成。

## 5. 并行：先注册成任务，再一起等结果

协程对象自己只是「可以暂停的函数」。要并发，得把它包成 **Task**，交给事件循环。`asyncio.create_task()` 一调用，任务就进队列，可以在后台被调度，调用方不必干等。

`asyncio.gather()` 用来等这一批都结束，并把结果按顺序收齐。这里的 `await` 是在等结果，任务本身早就开始跑了。

```python
async def main_func():
    print("并行执行")
    task1 = asyncio.create_task(my_func("C", 1))
    task2 = asyncio.create_task(my_func("D", 2))
    task3 = asyncio.create_task(my_func("E", 3))
    results = await asyncio.gather(task1, task2, task3)
    print(results)


asyncio.run(main_func())
```

三个人几乎同时打印「开始」。1 秒后 C 完成，2 秒后 D 完成，3 秒后 E 完成。总时间接近最慢的那一个，大约 3 秒，不是 1+2+3。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-await-switch" viewBox="0 0 680 300" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>串行是一个等完再下一个；并行是遇到 await 就让事件循环换人</title>
  <style>
    .diag-py-await-switch { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-await-switch { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-gray:#2a2d33; }
  </style>
  <text x="170" y="28" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">串行 await</text>
  <rect x="40" y="52" width="120" height="44" rx="10" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="100" y="74" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">A 开始</text>
  <rect x="168" y="52" width="120" height="44" rx="10" fill="var(--fill-gray)" stroke="var(--gray)" stroke-width="1.6"/>
  <text x="228" y="74" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">A 等待</text>
  <rect x="40" y="112" width="120" height="44" rx="10" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="100" y="134" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">B 开始</text>
  <text x="170" y="184" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">约 2 秒 + 1 秒</text>
  <text x="500" y="28" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">create_task + gather</text>
  <rect x="390" y="52" width="110" height="44" rx="10" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="445" y="74" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">C 开始</text>
  <rect x="510" y="52" width="130" height="44" rx="10" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="575" y="74" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">D 开始</text>
  <text x="500" y="124" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--red)">遇到 await，事件循环换人</text>
  <rect x="390" y="152" width="110" height="44" rx="10" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.6"/>
  <text x="445" y="174" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">C 完成</text>
  <rect x="510" y="208" width="130" height="44" rx="10" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.6"/>
  <text x="575" y="230" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">D 完成</text>
  <text x="500" y="272" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">总时间接近最慢的那个</text>
</svg>
</figure>

切换的顺序可以想成这样：C 打印开始，遇到 `await asyncio.sleep`，让出；事件循环转到 D，D 也打印开始然后让出；时间到了，先恢复睡得短的那个。`gather` 收齐结果后，主协程才往下走。

## 6. 主协程退出，子任务会被取消

如果只 `create_task`，不 `await gather`，主协程里没有任何等待，`asyncio.run()` 发现主任务已经结束，会把还在跑的子任务取消掉，然后关掉事件循环。

```python
async def main_func():
    asyncio.create_task(my_func("C", 1))
    asyncio.create_task(my_func("D", 2))
    # 没有 await


asyncio.run(main_func())
```

你多半只能看到两句「开始」，然后程序就退出了，耗时接近 0。「完成」来不及印。不是任务没创建，是主协程先走了，事件循环跟着收摊。

> [!WARNING]
> 创建了任务就要等它。要么 `await` 单个任务，要么 `await asyncio.gather(...)`。不等，就等于告诉循环：主线结束了，剩下的取消吧。

## 7. 协程里不要写会堵死的同步调用

协程跑在一个线程上。你要是在里面写 `time.sleep(2)`，或者用同步的 `requests.get()`，这一下会把整个事件循环堵住，别的协程都动不了。并发就名存实亡。

等一段时间，用 `await asyncio.sleep()`。等网络，用异步库，下一节的 `aiohttp` 就是干这个的。

## 8. 小项目：同时请求几个网址

每个网址一个协程。等响应的时候把控制权交出去，别的请求可以继续走。总耗时接近最慢的那一个，而不是相加。

先装库：

```bash
pip install aiohttp
```

```python
import asyncio
import time

import aiohttp


async def fetch_url(session: aiohttp.ClientSession, url: str) -> str:
    start = time.perf_counter()
    async with session.get(url) as response:
        await response.text()
        status = response.status
    elapsed = time.perf_counter() - start
    print(f"请求【{url}】耗时：{elapsed:.2f}s")
    return f"{url} → {status}"


async def main_func():
    urls = [
        "https://www.baidu.com",
        "https://www.bing.com",
        "https://example.com",
    ]
    async with aiohttp.ClientSession() as session:
        print("并发请求")
        start = time.perf_counter()
        tasks = [asyncio.create_task(fetch_url(session, url)) for url in urls]
        results = await asyncio.gather(*tasks)
        for line in results:
            print(line)
        print(f"并发总耗时：{time.perf_counter() - start:.2f}s")


if __name__ == "__main__":
    asyncio.run(main_func())
```

`async with` 也是在等：等连接建好、等用完再关掉。`await response.text()` 等正文的时候，别的网址的协程可以跑。

> [!NOTE]
> 个别网址超时或被拒绝，是网络的事，不是协程写错。把那个地址换成你打得开的站再跑一次。三个都失败时，先确认这台机器能上网。

## 9. 顺手分清 WSGI 和 ASGI

后面一篇要用 FastAPI。它靠的是 **ASGI**：服务器把请求当成事件交给应用，等数据库或模型的时候，事件循环可以去处理别的请求。Uvicorn 就是常见的 ASGI 服务器。

更早的 **WSGI** 是同步的。一个请求没处理完，这条线上就不能接下一个。Flask、老版本 Django 走的是这条。要 WebSocket、长连接，或者像 FastAPI 这样把异步用满，就用 ASGI。

## 10. 课后小项目

**练习一：把串行和并行的耗时打印出来（必做）**

用本节的 `my_func`，先连续 `await` 两个任务，再 `create_task` + `gather` 跑同样两个任务。两次耗时写在注释里。

**练习二：故意不等任务**

只 `create_task`，不 `gather`。看「完成」还打不打得出来。然后补上 `gather`，再跑一遍。

**练习三：换成你自己的三个网址**

把小项目里的 `urls` 换成三个你打得开的地址。确认总耗时不是三次相加。

## 11. 小结

协程是用户态的轻量级线程，程序自己调度，能暂停也能恢复。`async def` 调用出来的是协程对象，`asyncio.run()` 才真正跑。`await` 把控制权交给事件循环；连续 `await` 是串行，`create_task` 再 `gather` 才是并行。主协程不等人就退出，子任务会被取消。协程里面不要用 `time.sleep` 和同步的 `requests`。

下一篇把这种异步服务做成别人能调用的接口：[第 20 篇：FastAPI](/post/python-fastapi-api/)。
