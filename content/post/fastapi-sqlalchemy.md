---
title: 'SQLAlchemy 第 2 篇：接上 FastAPI，便条这次真的存住了'
weight: 5
cover: /images/covers/fastapi-sqlalchemy-cover.jpg
date: 2026-11-19T09:00:00+08:00
lastmod: 2026-11-25T14:35:00+08:00
categories: ['人工智能', '数据库']
tags: ['Python', '编程基础', 'FastAPI', 'SQLAlchemy', 'MySQL']
description: '把三张便条的接口改造成从 MySQL 读写：get_db 按请求发会话，Depends 送进接口，POST 进去的便条重启之后还在。'
math: false
mermaid: false
comments: true
toc: true
---

[FastAPI 那一篇](/post/python-fastapi-api/)的警告还挂在那儿：POST 进去的便条待在内存里，服务一关就没了。中间隔了四篇，库建好了、表拆好了、类写好了，这一篇把接口接上去，让那句话作废。

改造后的服务还是那几个地址：按编号读一张、按本子列一批、POST 加一张。区别只有一处：数据不再来自代码里的字典，来自 MySQL。

目录里四个文件，各管一件事：

| 文件 | 管什么 |
|---|---|
| database.py | 怎么连库，怎么按请求发会话 |
| models.py | 表写成类，上一篇原样拿来 |
| schema.py | 请求和响应该长什么形状 |
| main.py | 地址和函数 |

## 1. 会话按请求发：get_db

上一篇的会话是脚本开头建一个、结尾关一个。服务不一样：服务一直跑，请求一个个来，每个请求该用自己的一本草稿本，用完就还。在 `database.py` 末尾加：

```python
from sqlalchemy.orm import Session


def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
```

这是个生成器函数，[生成器那一篇](/post/python-regex-generator/)见过 `yield`：函数跑到 `yield` 把会话交出去，暂停；等外面用完了再回来走 `finally`。FastAPI 正是这么用它的——每个请求进来调一次 `get_db`，拿到交出来的会话塞进接口参数，响应发完再回到 `finally` 关会话。请求之间互不共用草稿本，一个请求失败也不会把别人的事务带脏。

## 2. 请求和响应的形状：schema.py

接口收的 JSON 和返回的 JSON，用 Pydantic 类定形状，和模型类分开：模型类对着表，schema 对着网络。

```python
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NoteIn(BaseModel):
    title: str
    text: Optional[str] = None
    book_id: int = 1


class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    text: Optional[str]
    book_id: Optional[int]
    created_at: datetime
```

`NoteIn` 是 POST 进来的形状：标题必填，正文可省，本子不给就进 1 号。编号和创建时间不收——那是数据库发的，客户端说了不算。

`NoteOut` 是返回的形状。`from_attributes=True` 是关键一句：ORM 对象不是字典，`note.title` 是属性不是键，开了这个开关 Pydantic 才肯从属性上读值。没有它，把 `Note` 对象直接返回会序列化失败。

## 3. 三个地址

`main.py`：

```python
from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Book, Note
from schema import NoteIn, NoteOut

app = FastAPI(title='便条接口')


@app.get('/notes/{note_id}', response_model=NoteOut)
def read_note(note_id: int, session: Session = Depends(get_db)):
    note = session.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail='没有这条笔记')
    return note


@app.get('/notes', response_model=list[NoteOut])
def list_notes(book_id: int | None = None, session: Session = Depends(get_db)):
    query = session.query(Note)
    if book_id is not None:
        query = query.filter(Note.book_id == book_id)
    return query.order_by(Note.id).all()


@app.post('/notes', response_model=NoteOut)
def add_note(note: NoteIn, session: Session = Depends(get_db)):
    new_note = Note(title=note.title, text=note.text, book_id=note.book_id)
    session.add(new_note)
    session.commit()
    session.refresh(new_note)
    return new_note
```

`Depends(get_db)` 是「这个参数由 FastAPI 替我准备」：它去调 `get_db`，把交出来的会话填进 `session`。接口函数里不再出现任何连接代码。

三个地址和第一篇的对应关系：`/notes/{note_id}` 还是按编号读，只是 `notes.get(...)` 换成了 `session.get(Note, ...)`；找不到时抛 `HTTPException` 404，比返回一个错误字典更合接口的规矩。`/notes` 带一个可选的 `book_id` 查询参数，就是第二篇的 `WHERE book_id = ...`，不传就全列。`POST /notes` 收 `NoteIn`、造 `Note`、add、commit、refresh，返回时数据库填的编号和时间已经在对象上。

启动：

```bash
uvicorn main:app --reload
```

## 4. 重启验证：警告作废

打开 <http://127.0.0.1:8000/docs>，按顺序点：

1. `GET /notes` 执行，返回库里的便条，编号到 12。
2. `GET /notes?book_id=2` 执行，只有随手本那几张。
3. `POST /notes` 执行，请求体：

```json
{"title": "快照二", "text": "重启也在", "book_id": 2}
```

返回里 `id` 是 13，`created_at` 有值。

4. 回终端 `Ctrl + C` 停掉服务，再 `uvicorn main:app --reload` 起回来。
5. 浏览器打开 <http://127.0.0.1:8000/notes/13>。

「快照二」还在。第一篇里字典做不到这件事，因为字典跟着进程死；现在便条在 MySQL 的磁盘文件里，进程只是每次来读它。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-fastapi-db" viewBox="0 0 680 380" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>一次 POST 的路线：会话用完就关，数据留在磁盘</title>
  <style>
    .diag-fastapi-db { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-fastapi-db { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; }
  </style>
  <rect x="70" y="14" width="540" height="64" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="340" y="46" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">浏览器 POST /notes：标题、正文、book_id</text>
  <line x1="340" y1="78" x2="340" y2="92" stroke="var(--gray)" stroke-width="1.6"/><path d="M340,100 L335,92 L345,92 Z" fill="var(--gray)"/>
  <rect x="70" y="102" width="540" height="64" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="340" y="134" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">add_note：Depends 送来一本新会话</text>
  <line x1="340" y1="166" x2="340" y2="180" stroke="var(--gray)" stroke-width="1.6"/><path d="M340,188 L335,180 L345,180 Z" fill="var(--gray)"/>
  <rect x="70" y="190" width="540" height="64" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="340" y="222" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">add → commit → refresh：INSERT 落库，编号时间补回</text>
  <line x1="340" y1="254" x2="340" y2="268" stroke="var(--gray)" stroke-width="1.6"/><path d="M340,276 L335,268 L345,268 Z" fill="var(--gray)"/>
  <rect x="70" y="278" width="540" height="80" rx="12" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="340" y="306" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">MySQL 磁盘：13 号便条住下</text>
  <text x="340" y="336" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">响应发完会话关闭；服务重启，数据不动</text>
</svg>
</figure>

会话是短命的，一个请求一本；数据是长命的，住在库里。把这两件事的寿命分开，就是这一篇全部的设计。

## 5. 小项目：四个文件跑通

`models.py` 从上一篇复制，其余三个文件照上面写。启动后把第 4 节五步点完，再补一刀：命令行里 `UPDATE book SET name = '功课' WHERE id = 1;`，回浏览器 `GET /notes/1`——返回的 `book_id` 还是 1，但去 `GET /notes?book_id=1` 列出来的便条一张没少。本子改名，便条不用动，第三篇拆表的红利在这里兑现。

## 6. 课后小项目

**练习一：自己留一张（必做）**

POST 一张标题是今天日期的便条，重启服务，按返回的编号打开它。确认还在。

**练习二：补一个删除地址**

写 `DELETE /notes/{note_id}`：`session.get` 拿到对象，没有就 404，有就 `session.delete` 加 `commit`，返回 `{"ok": True}`。在 `/docs` 里删掉练习一那张，再 GET 确认 404。

**练习三：拦下野本子**

POST 一张 `book_id` 为 99 的便条，看服务报什么错。然后在 `add_note` 开头加一句检查：`session.get(Book, note.book_id)` 是 `None` 就抛 400。外键在数据库层拦了一次，接口层再拦一次，报错才说得清人话。

## 7. 小结

`get_db` 用生成器按请求发会话、用完关闭，`Depends` 把它送进接口；schema 管网络上的形状，模型管表里的形状，`from_attributes` 让两者接得上。POST 的便条落进 MySQL，重启还在，第一篇的警告到此作废。

数据库专栏到这里。接下来换一个问题：这套东西——MySQL 加这个接口——怎么搬到另一台电脑上也一样能跑？[Docker 与 Git 专栏](/categories/docker与git/)从把 MySQL 装进容器开始。