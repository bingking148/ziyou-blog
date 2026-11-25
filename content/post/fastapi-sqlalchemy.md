---
title: 'SQLAlchemy 第 2 篇：接上 FastAPI，便条这次真的存住了'
weight: 5
cover: /images/covers/fastapi-sqlalchemy-cover.jpg
date: 2026-11-19T09:00:00+08:00
lastmod: 2026-11-25T16:09:02+08:00
categories: ['人工智能', '数据库']
tags: ['Python', '编程基础', 'FastAPI', 'SQLAlchemy', 'MySQL']
description: '用 Depends 按请求提供 Session，以 Pydantic 分隔输入输出模型，完成查询、新增、删除，并重启服务验证数据仍在。'
math: false
mermaid: false
comments: true
toc: true
---

模型已经能读写 MySQL，接下来把 FastAPI 里的字典换掉。改完后，接口地址几乎不变，前端不需要知道底下从字典换成了数据库。

文件还是放在 `E:\notes-service`：

```text
E:\notes-service\
├── database.py    # 上一篇的连接配置，再补一个 get_db
├── models.py      # 不动
├── schema.py      # 新增：请求和响应的数据结构
└── main.py        # 改成数据库版路由
```

先确认依赖：

```powershell
python -m pip install fastapi "uvicorn[standard]" sqlalchemy pymysql cryptography
```

## 1. 每个请求单独拿一个 Session

命令行脚本从开始到结束只用一个 Session，Web 服务不能这么写。多个请求共用一条 Session，事务和对象状态会互相干扰。

在 `database.py` 末尾加：

```python
def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
```

路由通过 `Depends(get_db)` 获取 Session。请求开始时，FastAPI 执行到 `yield`，把 Session 交给路由；请求结束后，再回到 `finally` 关闭它。

所以路由里不用重复写 `SessionLocal()` 和 `close()`，更不会有人忘了关。

## 2. 请求模型和响应模型分开

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

`NoteIn` 只接收客户端该传的三个字段。`id` 由 MySQL 自增，`created_at` 由数据库生成，都不该让请求体指定。

`Field(min_length=1, max_length=50)` 会在进入路由前检查标题。请求不合格时直接返回 422，路由里不用再写一遍长度判断。

`NoteOut` 控制返回给客户端的字段。`from_attributes=True` 让 Pydantic 能读取 `note.id`、`note.title` 这些 ORM 属性；少了它，返回 `Note` 对象时会在响应序列化阶段报错。

输入和输出分成两个类，还能避免以后把内部字段顺手暴露出去。

## 3. main.py：查询、新增、删除都走数据库

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

这里没有一句手写 SQL，但每个路由都能和上一篇的操作对上：

- 列表用 `select(Note)`；传入 `book_id` 时追加 `WHERE`，最后按编号排序。
- 单条查询用 `session.get()`。查不到要抛 404，返回 `null` 配 200 会让客户端误以为查询成功。
- 新增前先确认本子存在，然后 `add → commit → refresh`。201 表示创建成功，响应里带回数据库生成的编号和时间。
- 删除后提交，204 表示成功且没有响应正文。

启动：

```powershell
Set-Location E:\notes-service
uvicorn main:app --reload
```

看到 `Uvicorn running on http://127.0.0.1:8000` 后，终端别关。`echo=True` 还开着，每次访问接口都能在这里看到 SQL。

## 4. 用一次重启确认数据真的落库

打开 <http://127.0.0.1:8000/docs>。

先执行 `GET /notes`，应该看到已有的便条数组。再在 `book_id` 中填 `2`，结果里的 `book_id` 应全部为 2。

然后展开 `POST /notes`，请求体填：

```json
{
  "title": "重启验证",
  "text": "这条数据应该保存在 MySQL，而不是 Python 内存里",
  "book_id": 1
}
```

执行后应返回 201，并带有 `id` 和 `created_at`。把返回的 `id` 记下来，不要假定它是某个固定数字；之前的新增、删除和失败插入都会影响自增编号。

再把 `book_id` 改成 99 请求一次，应得到 400“本子不存在”。这条数据会在进入 `INSERT` 前被拦下。

接下来做最关键的一次测试：

1. 回终端按 `Ctrl + C` 停掉 Uvicorn。
2. 重新执行 `uvicorn main:app --reload`。
3. 在 `GET /notes/{note_id}` 中输入刚才记下的编号。
4. 仍能查到“重启验证”，才算迁移成功。

新的 Python 进程里，原来的字典早已不存在。数据还能回来，只能说明它是从 MySQL 读出来的。

测试完可以清理这张便条：调用 `DELETE /notes/{note_id}` 应返回 204，再查同一编号应返回 404。

如果看到的是 500，不要在 `/docs` 里反复点。回 Uvicorn 终端看异常最底部：MySQL 没启动、密码错误、模型与表结构不一致，都会在这里留下具体原因。422 则先检查 JSON 字段名和类型，不用查数据库。

到这里，数据已经能活过服务重启，但 MySQL 和 Python 环境仍绑在当前电脑上。下一篇先把 MySQL 搬进容器，顺便处理数据迁移：[Docker 与 MySQL](/post/docker-basics/)。
