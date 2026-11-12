---
title: '网络与并发 第 4 篇：FastAPI，把函数变成别人能调用的接口'
weight: 4
cover: /images/covers/python-fastapi-api-cover.jpg
date: 2026-11-10T09:00:00+08:00
updatedDate: 2026-11-12T20:30:00+08:00
categories: ['人工智能', 'Python网络与并发']
tags: ['Python', '编程基础', 'FastAPI', 'API']
description: '做一本三张便条的笔记接口：浏览器打开 /notes/1 看到「协程」那条，用 ?short=true 只看标题，再 POST 加一张「快照」。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇的三页是你自己在脚本里打开的。这一篇换一件事：把三张学习便条放进一个小服务，让浏览器能按地址翻到。

三张便条从一开始就定好，后面只加不换：

| 编号 | 标题 | 正文 |
|---|---|---|
| 1 | 协程 | 网页在转圈时，先去看下一页 |
| 2 | 接口 | 给函数一个浏览器打得开的地址 |
| 3 | 虚拟机 | Linux 装在一块虚拟磁盘上 |

先装两个包，存成 `main.py` 的还是这一个文件：

```bash
pip install fastapi uvicorn
```

## 1. 浏览器先打开一句 JSON

文件先写成这样：

```python
from fastapi import FastAPI

app = FastAPI()

notes = {
    1: {"title": "协程", "text": "网页在转圈时，先去看下一页"},
    2: {"title": "接口", "text": "给函数一个浏览器打得开的地址"},
    3: {"title": "虚拟机", "text": "Linux 装在一块虚拟磁盘上"},
}

@app.get("/")
def home():
    return {"ok": True, "hint": "打开 /notes/1"}
```

`@app.get("/")` 的意思是：有人用浏览器访问这个服务的首页，就去跑 `home`。`return` 的字典会被收成 JSON。

在 `main.py` 所在的目录启动：

```bash
uvicorn main:app --reload
```

`main` 是文件名，`app` 是上面那个变量。`--reload` 是你一保存，服务自己重启。

浏览器打开：

<http://127.0.0.1:8000/>

你会看到 `{"ok":true,"hint":"打开 /notes/1"}`。`127.0.0.1` 就是你这台电脑，`8000` 是 uvicorn 听的端口。这一下通了，函数已经变成一个地址。

同一个服务还有一页现成的试接口页面：

<http://127.0.0.1:8000/docs>

后面加路径、加参数，都在这一页里点。不要另找一个别的网站来试。

## 2. 打开第 1 条：/notes/1

首页那句 JSON 只说明服务活着。便条在 `/notes/1`。在刚才的文件里接着写：

```python
@app.get("/notes/{note_id}")
def read_note(note_id: int, short: bool = False):
    note = notes.get(note_id)
    if note is None:
        return {"error": "没有这条笔记"}
    if short:
        return {"title": note["title"]}
    return note
```

`{note_id}` 是路径里的空位。地址写成 `/notes/1`，`note_id` 就是整数 `1`，函数去三张便条里拿第 1 条。

保存后浏览器打开：

<http://127.0.0.1:8000/notes/1>

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-note-call" viewBox="0 0 680 400" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>浏览器打开 /notes/1，read_note 返回协程那条笔记</title>
  <style>
    .diag-py-note-call { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-note-call { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; }
  </style>
  <rect x="70" y="16" width="540" height="84" rx="14" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8"/>
  <text x="340" y="44" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">浏览器打开</text>
  <text x="340" y="72" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">http://127.0.0.1:8000/notes/1</text>
  <line x1="340" y1="100" x2="340" y2="124" stroke="var(--gray)" stroke-width="1.6" stroke-linecap="round"/><path d="M340,132 L335,124 L345,124 Z" fill="var(--gray)"/>
  <rect x="70" y="136" width="540" height="84" rx="14" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8"/>
  <text x="340" y="164" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">跑 read_note(1)</text>
  <text x="340" y="192" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">在三张便条里拿第 1 条</text>
  <line x1="340" y1="220" x2="340" y2="244" stroke="var(--gray)" stroke-width="1.6" stroke-linecap="round"/><path d="M340,252 L335,244 L345,244 Z" fill="var(--gray)"/>
  <rect x="70" y="256" width="540" height="112" rx="14" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="340" y="288" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">浏览器收到</text>
  <text x="340" y="318" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">"title": "协程"</text>
  <text x="340" y="346" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">"text": "网页在转圈时，先去看下一页"</text>
</svg>
</figure>

按图从上往下：浏览器请求的地址是 `http://127.0.0.1:8000/notes/1`。末尾的 `1` 进了 `read_note`，函数在那三张便条里找到编号 1。返回的 JSON 就是标题「协程」和那句正文。把地址末尾改成 `2` 或 `3`，换的是同一本里的另一条，不是另一个服务。

`/notes/9` 不在表里，你会看到 `{"error":"没有这条笔记"}`。

## 3. 只要标题：?short=true

同一条地址，问号后面再加一个开关。浏览器打开：

<http://127.0.0.1:8000/notes/1?short=true>

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-note-short" viewBox="0 0 680 340" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>/notes/1 是第 1 条，问号后的 short=true 表示只要标题</title>
  <style>
    .diag-py-note-short { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-note-short { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-gray:#2a2d33; }
  </style>
  <rect x="50" y="20" width="580" height="88" rx="14" fill="var(--fill-gray)" stroke="currentColor" stroke-width="1.5"/>
  <text x="340" y="50" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">http://127.0.0.1:8000</text>
  <text x="340" y="78" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">/notes/1?short=true</text>
  <rect x="50" y="124" width="270" height="100" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="185" y="158" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">路径 /notes/1</text>
  <text x="185" y="188" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">第 1 条，标题是协程</text>
  <rect x="360" y="124" width="270" height="100" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="495" y="158" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">?short=true</text>
  <text x="495" y="188" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">只要标题，不要正文</text>
  <rect x="150" y="252" width="380" height="64" rx="12" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.6"/>
  <text x="340" y="284" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">得到 {"title": "协程"}</text>
</svg>
</figure>

斜杠后面的 `1` 负责「哪一条」，问号后面的 `short=true` 负责「要不要正文」。两个都在，函数走 `if short`，只返回 `{"title":"协程"}`。去掉问号，正文又回来了。

`short` 之所以不用写在路径里，是因为函数参数给了默认值 `False`。地址里不写它，就当不要缩短。

到 `/docs`，打开 `GET /notes/{note_id}`，`note_id` 填 `1`，`short` 点成 true，再点 Execute。看到的 JSON 和浏览器那次一样。

## 4. 再加一张「快照」

前三张写在代码里。新的一张从浏览器发一段 JSON 进来。文件末尾加上：

```python
from pydantic import BaseModel

class NewNote(BaseModel):
    title: str
    text: str

@app.post("/notes")
def add_note(note: NewNote):
    note_id = max(notes) + 1
    notes[note_id] = {"title": note.title, "text": note.text}
    return {"id": note_id, "title": note.title, "text": note.text}
```

`NewNote` 就是在说：发来的 JSON 里要有 `title` 和 `text`，两个都是字符串。对得上，才会进 `add_note`。

打开 `/docs`，找到 `POST /notes`，点 Try it out，请求体换成：

```json
{"title": "快照", "text": "装好就拍一张"}
```

点 Execute。返回里的 `id` 应该是 `4`。再在浏览器打开 <http://127.0.0.1:8000/notes/4>，标题就是「快照」。还是这一本笔记，不是另一个接口。

> [!WARNING]
> 这四张便条待在这次运行的内存里。服务一关，你 POST 的「快照」就没了。前三张还在，是因为它们写在 `notes = {...}` 里，下次启动会重新放回去。

## 5. 小项目：把这一本跑通

`main.py` 到这里是完整的。三张老便条、首页、按编号读、`short`、再加一张，都在这一个文件里：

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

notes = {
    1: {"title": "协程", "text": "网页在转圈时，先去看下一页"},
    2: {"title": "接口", "text": "给函数一个浏览器打得开的地址"},
    3: {"title": "虚拟机", "text": "Linux 装在一块虚拟磁盘上"},
}

class NewNote(BaseModel):
    title: str
    text: str

@app.get("/")
def home():
    return {"ok": True, "hint": "打开 /notes/1"}

@app.get("/notes/{note_id}")
def read_note(note_id: int, short: bool = False):
    note = notes.get(note_id)
    if note is None:
        return {"error": "没有这条笔记"}
    if short:
        return {"title": note["title"]}
    return note

@app.post("/notes")
def add_note(note: NewNote):
    note_id = max(notes) + 1
    notes[note_id] = {"title": note.title, "text": note.text}
    return {"id": note_id, "title": note.title, "text": note.text}
```

按这个顺序点一遍：

1. <http://127.0.0.1:8000/> 看到那句提示
2. <http://127.0.0.1:8000/notes/1> 看到「协程」和正文
3. <http://127.0.0.1:8000/notes/1?short=true> 只剩标题
4. `/docs` 里 POST 一张「快照」，再打开 `/notes/4`

## 6. 课后小项目

**练习一：把第 2 条也看短（必做）**

浏览器打开 `/notes/2` 和 `/notes/2?short=true`。确认标题都是「接口」，只有不加问号的那次带着正文。

**练习二：加一条自己的**

在 `/docs` 里再 POST 一条，标题用今天的日期，正文写一句你自己的话。用返回的 `id` 在浏览器里打开它。

**练习三：要一条不存在的**

打开 `/notes/9`。应该是 `{"error":"没有这条笔记"}`，而不是第 1 条的内容。

## 7. 小结

这一个服务、这一本三张便条：`/` 先证明它活着，`/notes/1` 用路径挑第 1 条，`?short=true` 只要标题，`POST /notes` 再加一张「快照」。试来试去都在 `http://127.0.0.1:8000/docs`。

本专栏到这里。想把这个接口放到一台 Linux 上，去看 [Linux 基础专栏](/categories/linux基础/)。
