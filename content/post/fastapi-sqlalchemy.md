---
title: 'SQLAlchemy 第 2 篇：接上 FastAPI，便条这次真的存住了'
weight: 5
cover: /images/covers/fastapi-sqlalchemy-cover.jpg
date: 2026-11-19T09:00:00+08:00
lastmod: 2026-11-25T15:30:21+08:00
categories: ['人工智能', '数据库']
tags: ['Python', '编程基础', 'FastAPI', 'SQLAlchemy', 'MySQL']
description: '用 Depends 按请求提供 Session，以 Pydantic 分隔输入输出模型，完成查询、新增、删除，并重启服务验证数据仍在。'
math: false
mermaid: false
comments: true
toc: true
---

[FastAPI 那一篇](/post/python-fastapi-api/)留下的问题，现在终于有条件解决：MySQL 表已经稳定，SQLAlchemy 模型也已跑通。这一篇把接口里的字典全部撤掉，让每次请求都真正读写数据库。

改造后会有四个接口：查询列表、按编号查询、新增、删除。最后用一次“新增后重启服务”的测试，确认数据不再依赖 Python 进程。

## 1. 目录和各文件的职责

继续上一篇的 `E:\notes-service`：

```text
E:\notes-service\
├── database.py    # 连接池、Session 工厂、按请求提供 Session
├── models.py      # Book 和 Note：数据库表结构
├── schema.py      # NoteIn 和 NoteOut：网络输入输出结构
└── main.py        # FastAPI 路由
```

`database.py` 和 `models.py` 保留上一篇的内容。`schema.py` 是新增文件，`main.py` 则改写成接口入口。

确认依赖齐全：

```powershell
python -m pip install fastapi "uvicorn[standard]" sqlalchemy pymysql cryptography
```

如果激活过虚拟环境，先确认 `python -m pip show fastapi` 能找到版本，避免把依赖装进另一个 Python。

## 2. 给每个请求一条独立 Session

上一篇的脚本只处理一次任务，用一个 Session 就够了。Web 服务会同时接待多个请求，不能让所有人共用同一条事务。

在 `database.py` 末尾追加：

```python
from sqlalchemy.orm import Session


def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
```

`yield session` 把 Session 交给路由使用；请求处理结束后，FastAPI 会回到这个生成器，执行 `finally` 中的 `close()`。

因此，每次请求遵循同一条路径：创建 Session → 路由读写 → 请求结束 → 关闭 Session。某个请求失败时，也不会把未提交的数据留给下一个请求。

## 3. schema.py：网络数据和数据库模型分开

新建 `schema.py`：

```python
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NoteIn(BaseModel):
    title: str = Field(min_length=1, max_length=50)
    text: str | None = Field(default=None, max_length=255)
    book_id: int


class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    text: str | None
    book_id: int | None
    created_at: datetime
```

`NoteIn` 只接受客户端有权提供的字段：标题、正文和本子编号。`id` 由 MySQL 自增，`created_at` 由数据库生成，因此都不能从请求体传入。

`Field(min_length=1, max_length=50)` 在进入路由前检查标题长度。请求不符合规则时，FastAPI 自动返回 422，不必在路由里写一串 `if`。

`NoteOut` 规定响应结构。`from_attributes=True` 让 Pydantic 能读取 `note.id`、`note.title` 这样的 ORM 属性；没有它，直接返回 `Note` 对象时会因为无法按普通字典解析而报错。

输入输出分开还有一个实际好处：以后表里增加内部字段，不会因为返回 ORM 对象就不小心暴露给客户端。

## 4. main.py：完成四个接口

把 `main.py` 改成：

```python
from fastapi import Depends, FastAPI, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import Book, Note
from schema import NoteIn, NoteOut


app = FastAPI(title='便条接口')


@app.get('/notes', response_model=list[NoteOut])
def list_notes(
    book_id: int | None = None,
    session: Session = Depends(get_db),
):
    statement = select(Note)
    if book_id is not None:
        statement = statement.where(Note.book_id == book_id)

    statement = statement.order_by(Note.id)
    return session.scalars(statement).all()


@app.get('/notes/{note_id}', response_model=NoteOut)
def read_note(note_id: int, session: Session = Depends(get_db)):
    note = session.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail='便条不存在')
    return note


@app.post('/notes', response_model=NoteOut, status_code=201)
def add_note(note: NoteIn, session: Session = Depends(get_db)):
    if session.get(Book, note.book_id) is None:
        raise HTTPException(status_code=400, detail='本子不存在')

    new_note = Note(
        title=note.title,
        text=note.text,
        book_id=note.book_id,
    )
    session.add(new_note)
    session.commit()
    session.refresh(new_note)
    return new_note


@app.delete('/notes/{note_id}', status_code=204)
def delete_note(note_id: int, session: Session = Depends(get_db)):
    note = session.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail='便条不存在')

    session.delete(note)
    session.commit()
    return Response(status_code=204)
```

逐个看数据库动作：

- `GET /notes` 构造 `SELECT`。传入 `/notes?book_id=2` 时增加 `WHERE book_id = 2`，不传则查询全部。
- `GET /notes/{note_id}` 用 `session.get()` 按主键查询。查不到时返回 404，而不是 `null` 加 200。
- `POST /notes` 先检查本子是否存在，再 `add → commit → refresh`。状态码 201 表示资源创建成功，返回体包含数据库生成的编号和时间。
- `DELETE /notes/{note_id}` 删除后提交，204 表示成功且响应无正文。再次查询同一编号应得到 404。

`Depends(get_db)` 是这些路由共享的关键。它表示“`session` 参数不由客户端传递，而由 FastAPI 调用 `get_db` 提供”，所以路由不需要重复写连接和关闭代码。

启动服务：

```powershell
uvicorn main:app --reload
```

看到 `Uvicorn running on http://127.0.0.1:8000` 后，终端保持打开。若 SQLAlchemy 的 `echo=True` 仍开着，访问接口时还能在这里看到每次请求对应的 SQL。

## 5. 在 /docs 里按顺序验收

打开 <http://127.0.0.1:8000/docs>，不要只确认页面能打开，按下面顺序实际操作。

### 第一步：确认能读到已有数据

展开 `GET /notes`，点击 **Try it out → Execute**。应得到 200 和便条数组。

再测试筛选：在 `book_id` 中填 `2`，重新执行。返回项的 `book_id` 应全部为 2；如果当前没有“随手”便条，空数组也是合法的 200 响应。

### 第二步：新增一张便条

展开 `POST /notes`，请求体使用：

```json
{
  "title": "重启验证",
  "text": "这条数据应该保存在 MySQL，而不是 Python 内存里",
  "book_id": 1
}
```

执行后应返回 201，并带有 `id`、`created_at`。**记下返回的 `id`，后面以它为准。**不要假定一定是 13 或其他固定值；之前的新增、删除和失败插入都可能影响自增编号。

把 `book_id` 改成 99 再执行一次，应得到 400 和“本子不存在”。这条请求由接口提前拦截，没有向数据库写入无效数据。

### 第三步：重启服务，再查同一张便条

1. 回终端按 `Ctrl + C` 停掉 Uvicorn。
2. 再运行 `uvicorn main:app --reload`。
3. 在 `GET /notes/{note_id}` 中填入刚才记下的 `id`，执行。
4. 应返回同一张“重启验证”便条。

这次启动创建了新的 Python 进程，原来的字典和变量都已经消失。数据仍能查到，说明它确实来自 MySQL。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-fastapi-db" viewBox="0 0 680 380" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>一次 POST 的路线：会话用完就关，数据留在数据库</title>
  <style>
    .diag-fastapi-db { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-fastapi-db { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; }
  </style>
  <rect x="70" y="14" width="540" height="64" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="340" y="46" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">浏览器 POST /notes：标题、正文、book_id</text>
  <line x1="340" y1="78" x2="340" y2="92" stroke="var(--gray)" stroke-width="1.6"/><path d="M340,100 L335,92 L345,92 Z" fill="var(--gray)"/>
  <rect x="70" y="102" width="540" height="64" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="340" y="134" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">Depends(get_db)：本次请求取得独立 Session</text>
  <line x1="340" y1="166" x2="340" y2="180" stroke="var(--gray)" stroke-width="1.6"/><path d="M340,188 L335,180 L345,180 Z" fill="var(--gray)"/>
  <rect x="70" y="190" width="540" height="64" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="340" y="222" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">add → commit → refresh：写入后回读编号和时间</text>
  <line x1="340" y1="254" x2="340" y2="268" stroke="var(--gray)" stroke-width="1.6"/><path d="M340,276 L335,268 L345,268 Z" fill="var(--gray)"/>
  <rect x="70" y="278" width="540" height="80" rx="12" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="340" y="306" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">MySQL：新便条持久保存</text>
  <text x="340" y="336" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">请求结束后 Session 关闭；服务重启不影响表中数据</text>
</svg>
</figure>

### 第四步：删除测试便条，清理现场

在 `DELETE /notes/{note_id}` 中填入同一编号，执行后应得到 204。再用 `GET /notes/{note_id}` 查一次，应得到 404。

这样既能验证删除接口，也不会在后续 Docker 示例里混入多张同名测试数据。

## 6. 状态码能帮你快速定位问题

- **422**：请求形状不符合 `NoteIn`，检查 JSON 是否缺标题、字段名是否写错、`book_id` 是否为整数。
- **404**：路由存在，但指定编号的便条不存在；先 `GET /notes` 查看当前真实编号。
- **400**：这里用于本子不存在等可理解的业务错误。
- **500**：服务端异常。回 Uvicorn 终端看异常最底部的错误行，常见原因是 MySQL 没启动、密码错误或模型与表结构不一致。

到此，便条项目完成了从内存字典到数据库的迁移。不过 MySQL 和 Python 依赖仍安装在当前电脑上，换一台机器还得重复配置。下一步先用 Docker 把 MySQL 跑起来：[Docker 第 1 篇：把 MySQL 装进容器](/post/docker-basics/)。
