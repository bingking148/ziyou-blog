---
title: 'Python 第 19 篇：协程，等网络的时候别干站着'
weight: 19
cover: /images/covers/python-asyncio-coroutine-cover.jpg
date: 2026-11-09T09:00:00+08:00
updatedDate: 2026-11-12T19:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '协程', 'asyncio']
description: '同时看百度、必应和示例页开没开。一个一个等，时间会加起来；一起等，只接近最慢的那一页。'
math: false
mermaid: false
comments: true
toc: true
---

你要先确认三个网页打得开，再开始干活：百度、必应，还有一个专门用来测试的示例页 `example.com`。三页都看一眼状态码就行，不用把页面读完。

一个打开完再开下一个，等待是加起来的。网页在转圈的时候程序没事可干，它可以先把下一页也发出去。这一篇就做这一件事。

先装库：

```bash
pip install aiohttp
```

三页的名字和地址先定死，后面不换：

```python
pages = [
    ("百度", "https://www.baidu.com"),
    ("必应", "https://www.bing.com"),
    ("示例页", "https://example.com"),
]
```

## 1. 一个一个等，时间会相加

打开一页，就是发一个请求，然后干等它回来。写成函数是这样：

```python
import aiohttp

async def open_page(session, name, url):
    async with session.get(url) as response:
        status = response.status
    print(name, status)
    return name, status
```

`async def` 表示这个函数里有「要等」的步骤。`await` 写在「等」的那一步上。这里的等藏在 `session.get` 里面：请求发出去了，响应还没到。

状态码要在 `async with` 里面读。走出来之后，这次响应就关了，再碰 `response.status` 会报错。

如果三页是这样叫的，它会老老实实排好队：

```python
async def main():
    async with aiohttp.ClientSession() as session:
        for name, url in pages:
            await open_page(session, name, url)
```

`await` 的意思是「这一页还没回来，这条可以先让开」。可循环写的是等完一个再发下一个，让开之后没有别的页可做，于是还是百度完了才轮到必应，必应完了才轮到示例页。

图上把三页收成好算的整数，方便看加法：百度 2 秒，必应 1 秒，示例页 3 秒。你自己跑的时候，秒数以终端里打印的那一行为准。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-three-pages" viewBox="0 0 680 470" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>百度、必应、示例页：一个一个等约 6 秒，一起等约 3 秒</title>
  <style>
    .diag-py-three-pages { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-three-pages { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; }
  </style>
  <text x="24" y="28" font-size="16" dominant-baseline="central" fill="currentColor" font-weight="bold">一个一个等</text>
  <text x="160" y="58" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">0</text>
  <text x="320" y="58" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">2秒</text>
  <text x="480" y="58" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">4秒</text>
  <text x="640" y="58" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">6秒</text>
  <text x="24" y="92" font-size="16" dominant-baseline="central" fill="currentColor">百度</text>
  <rect x="160" y="74" width="160" height="36" rx="8" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="240" y="92" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">等 2 秒</text>
  <text x="24" y="138" font-size="16" dominant-baseline="central" fill="currentColor">必应</text>
  <rect x="320" y="120" width="80" height="36" rx="8" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="360" y="138" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">1秒</text>
  <text x="24" y="184" font-size="16" dominant-baseline="central" fill="currentColor">示例页</text>
  <rect x="400" y="166" width="240" height="36" rx="8" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.6"/>
  <text x="520" y="184" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">等 3 秒</text>
  <text x="400" y="224" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--red)">一共约 6 秒</text>
  <text x="24" y="268" font-size="16" dominant-baseline="central" fill="currentColor" font-weight="bold">一起等</text>
  <text x="160" y="298" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">0</text>
  <text x="240" y="298" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">1秒</text>
  <text x="320" y="298" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">2秒</text>
  <text x="400" y="298" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">3秒</text>
  <text x="24" y="332" font-size="16" dominant-baseline="central" fill="currentColor">百度</text>
  <rect x="160" y="314" width="160" height="36" rx="8" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="240" y="332" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">等 2 秒</text>
  <text x="24" y="378" font-size="16" dominant-baseline="central" fill="currentColor">必应</text>
  <rect x="160" y="360" width="80" height="36" rx="8" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="200" y="378" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">1秒</text>
  <text x="24" y="424" font-size="16" dominant-baseline="central" fill="currentColor">示例页</text>
  <rect x="160" y="406" width="240" height="36" rx="8" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.6"/>
  <text x="280" y="424" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">等 3 秒</text>
  <text x="430" y="424" font-size="16" dominant-baseline="central" fill="currentColor">一共约 3 秒</text>
</svg>
</figure>

先看上半张。百度从 0 等到 2 秒。必应从第 2 秒才开始，再花 1 秒，到第 3 秒。示例页从第 3 秒开始，再花 3 秒，到第 6 秒。三页没有重叠，总时间是 2+1+3。

下半张是同一组页一起发出去。三根条都从 0 开始。必应 1 秒就回来了，百度 2 秒回来，示例页最慢，3 秒回来。最慢的那页结束时，另外两页早就好了，总时间约 3 秒，不是 6 秒。

## 2. 三页一起发出去

把上面的 `for` 换成「先都发出去，再一起等」：

```python
async def main():
    async with aiohttp.ClientSession() as session:
        tasks = [
            asyncio.create_task(open_page(session, name, url))
            for name, url in pages
        ]
        await asyncio.gather(*tasks)
```

`create_task` 是真的把这一页的请求发出去，不等它回来就去发下一页。`gather` 是三页都回来了，`main` 才继续往下走。

谁先回来谁先被接着做完。按图上的整数，顺序是必应、百度、示例页，不是列表里原来的顺序。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-page-loop" viewBox="0 0 680 300" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>三页一起等的时候，必应先回来，然后是百度，最后是示例页</title>
  <style>
    .diag-py-page-loop { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-page-loop { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-gray:#2a2d33; }
  </style>
  <rect x="36" y="28" width="180" height="78" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="126" y="54" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">百度</text>
  <text x="126" y="80" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">等 2 秒</text>
  <rect x="250" y="28" width="180" height="78" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="340" y="54" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">必应</text>
  <text x="340" y="80" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">等 1 秒</text>
  <rect x="464" y="28" width="180" height="78" rx="12" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.6"/>
  <text x="554" y="54" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">示例页</text>
  <text x="554" y="80" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">等 3 秒</text>
  <text x="340" y="140" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">三页都在等的时候，程序去看谁先回来</text>
  <rect x="36" y="176" width="608" height="92" rx="12" fill="var(--fill-gray)" stroke="currentColor" stroke-width="1.4"/>
  <text x="340" y="206" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">1 秒：必应回来，先打印必应</text>
  <text x="340" y="232" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">2 秒：百度回来。3 秒：示例页回来，三页才算完</text>
</svg>
</figure>

三页在第 0 秒一起发出去，然后都在等网络。第 1 秒必应到了，程序把它的状态码打印出来，百度及示例页继续等。第 2 秒轮到百度。第 3 秒示例页到了，`gather` 才放行。等必应的那 1 秒里，没有人干站着，另外两页的请求已经在路上了。

这种「自己记住等在哪、谁先回来先做谁」的写法，就是协程。程序自己在这三页之间倒腾，不用为每一页再请操作系统派一个人。

## 3. 点了却没等，单会被撤掉

三页都 `create_task` 了，如果 `main` 不 `await gather` 就结束，循环会把还在等的页面取消。三杯都点了，人没等就走，店员把单撤了。终端里往往一页都打印不出来。

```python
async def main():
    async with aiohttp.ClientSession() as session:
        for name, url in pages:
            asyncio.create_task(open_page(session, name, url))
        # 这里没有 await，函数马上返回
```

要结果，就留在店里等到三页都回来。上一节的 `gather` 就是在等。

还有一种假等。把 `open_page` 写成下面这样，三页就又排回队了：

```python
import time
import requests

def open_page_blocked(name, url):
    time.sleep(1)
    return requests.get(url).status_code
```

`time.sleep` 和 `requests.get` 会一直占着，中间不把人让出来。百度卡在这 1 秒里的时候，必应和示例页的请求根本发不出去。要干等，写 `await asyncio.sleep(1)`。要发请求，就用上面的 `session.get`。

> [!WARNING]
> 协程里不要调用 `time.sleep`，也不要调用普通的 `requests`。一处卡住，百度、必应、示例页三页一起停。

## 4. 小项目：看这三页开没开

把下面存成 `check_pages.py`。它就是这一篇的全部：同一组三页，一起发出去，打印状态码和总秒数。

```python
import asyncio
import time
import aiohttp

pages = [
    ("百度", "https://www.baidu.com"),
    ("必应", "https://www.bing.com"),
    ("示例页", "https://example.com"),
]

async def open_page(session, name, url):
    try:
        async with session.get(url) as response:
            status = response.status
    except Exception as exc:
        print(name, "没打开", type(exc).__name__)
        return name, None
    print(name, status)
    return name, status

async def main():
    start = time.perf_counter()
    timeout = aiohttp.ClientTimeout(total=10)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        tasks = [
            asyncio.create_task(open_page(session, name, url))
            for name, url in pages
        ]
        await asyncio.gather(*tasks)
    seconds = time.perf_counter() - start
    print(f"一起等，用了 {seconds:.1f} 秒")

asyncio.run(main())
```

某一页打不开，记下名字，另外两页继续。单页最多等 10 秒，免得一个网站把你挂住。

```bash
python check_pages.py
```

你会看到三行状态码，外加一行秒数。打印顺序是谁先回来谁在前。想看相加的那种慢法，把 `main` 里创建任务的那一段换成第 1 节的 `for` 循环，再跑一次，比这两行秒数。

## 5. 课后小项目

**练习一：记下三页的结果（必做）**

跑 `check_pages.py`。把三行状态码和最后那行秒数抄下来。状态码是 200，说明这一页打开了。

**练习二：改回一个一个等**

用第 1 节的 `for` + `await` 换掉 `gather` 那一段，三页的名单不要动。再跑一次，看秒数是不是变长了。

**练习三：故意不等**

留下 `create_task`，删掉 `await asyncio.gather(*tasks)`。跑一次，看三行状态码还在不在。把 `gather` 加回去，再跑，确认它们又出现了。

## 6. 小结

三页一个一个 `await`，时间相加。三页先 `create_task` 再 `gather`，时间接近最慢的那页。没 `await` 就退出，点了的单会被取消。`time.sleep` 和 `requests` 会把三页一起卡住。

下一篇给一个浏览器打得开的地址，把笔记放上去：[第 20 篇：FastAPI](/post/python-fastapi-api/)。
