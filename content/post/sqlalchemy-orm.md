---
title: 'SQLAlchemy 第 1 篇：把表写成类，用对象完成增删改查'
weight: 4
cover: /images/covers/sqlalchemy-orm-cover.jpg
date: 2026-11-18T09:00:00+08:00
lastmod: 2026-11-25T16:09:02+08:00
categories: ['人工智能', '数据库']
tags: ['Python', '编程基础', 'SQLAlchemy', 'ORM', 'MySQL']
description: '用 SQLAlchemy 2.x 定义 Book 和 Note 模型，跑通 Session 的增删改查，并从 echo 日志看清 ORM 发出的真实 SQL。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇的 PyMySQL 代码完全能用，但每张表都要重复写连接、SQL 字符串和结果转换。表少时还能接受，项目一多，真正费时间的是这些样板代码。

这次换成 SQLAlchemy。表还是原来的 `book` 和 `note`，数据也不重建，只在 Python 里加一层对象映射。你写 `session.add(note)`，它负责生成 `INSERT`；你改 `note.text`，它负责生成 `UPDATE`。

先看终端里的 SQL，再决定要不要相信 ORM。学习阶段把 `echo=True` 打开，它做了什么一目了然。

## 1. 准备三个文件

继续 `E:\notes-service`：

```text
E:\notes-service\
├── database.py
├── models.py
├── main.py
└── note_db.py       # 上一篇的 PyMySQL 版本，留着对照
```

安装依赖：

```powershell
python -m pip install sqlalchemy pymysql cryptography
```

SQLAlchemy 是 ORM，PyMySQL 仍然是它底下使用的 MySQL 驱动。两者不是替代关系，少了驱动照样连不上。

## 2. database.py：连接只配置一次

```python
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import sessionmaker


DATABASE_URL = URL.create(
    'mysql+pymysql',
    username='root',
    password='123456',  # 改成你的 MySQL 密码
    host='127.0.0.1',
    port=3306,
    database='db_note',
    query={'charset': 'utf8mb4'},
)

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
```

`mysql+pymysql` 指明了数据库和驱动。`URL.create()` 比手拼 URL 稳，密码里即使含有 `@`、`/` 这样的字符，也不会把地址弄坏。

`engine` 管连接池。程序不必每次查询都重新建立连接，用完的连接可以放回池里复用。`pool_pre_ping=True` 会在取出旧连接前先确认它还能用。

`SessionLocal` 是 Session 工厂。每次调用 `SessionLocal()`，都会拿到一条独立会话，用来查询对象、记录修改、提交事务。下一篇接 FastAPI 时，每个请求会使用自己的 Session。

## 3. models.py：把已有表描述清楚

```python
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Book(Base):
    __tablename__ = 'book'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)

    notes: Mapped[list['Note']] = relationship(back_populates='book')


class Note(Base):
    __tablename__ = 'note'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(50), nullable=False)
    text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    book_id: Mapped[int | None] = mapped_column(
        ForeignKey('book.id'),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=text('CURRENT_TIMESTAMP'),
    )

    book: Mapped[Book | None] = relationship(back_populates='notes')
```

模型要和数据库对照着读：

- `__tablename__` 对应真实表名。
- `Mapped[str | None]` 表示 Python 属性可以是字符串或 `None`。
- `String(50)`、`nullable=False` 等参数对应列定义。
- `server_default=text('CURRENT_TIMESTAMP')` 表示创建时间由 MySQL 填，不由 Python 填。
- `ForeignKey('book.id')` 对应上一篇加好的 `fk_note_book`。

`relationship()` 不是新列。有了它，可以直接写 `note.book.name`，也可以从 `book.notes` 取一个本子的便条列表。第一次访问这些属性时，SQLAlchemy 通常会补发一条查询，终端的 `echo` 日志能看到。

这里有个常见误会：**改模型不会自动改已有表。**即使调用 `Base.metadata.create_all(engine)`，它也只会创建缺失的表，不会给旧表补列、改类型、补外键。所以上一篇要先把真实表结构改好。

## 4. main.py：把增删改查各做一次

```python
from sqlalchemy import select

from database import SessionLocal
from models import Note


with SessionLocal() as session:
    statement = (
        select(Note)
        .where(Note.book_id == 1)
        .order_by(Note.id)
    )
    notes = session.scalars(statement).all()

    print('学习本：')
    for item in notes:
        print(item.id, item.title, item.book.name)

    draft = Note(title='ORM 草稿', text='运行结束前会删除', book_id=1)
    session.add(draft)
    session.commit()
    session.refresh(draft)
    print('新增：', draft.id, draft.title, draft.created_at)

    one = session.get(Note, 1)
    if one is None:
        raise RuntimeError('没有找到 id = 1 的便条，请检查初始化数据')

    one.text = '等待网页时，可以先处理别的任务（由 ORM 更新）'
    session.commit()
    print('修改：', one.id, one.text)

    session.delete(draft)
    session.commit()
    print('草稿已删除')
```

运行：

```powershell
Set-Location E:\notes-service
python main.py
```

先别只看最后的 Python 输出，往上看 SQL 日志，你会找到几次关键操作：

- `session.scalars(statement).all()` 对应一条带 `WHERE` 和 `ORDER BY` 的 `SELECT`。
- `session.add(draft)` 只是登记新对象，`commit()` 时才出现 `INSERT`。
- `refresh(draft)` 再查一次，把 MySQL 生成的 `id` 和 `created_at` 读回对象。
- 修改 `one.text` 后提交，日志里出现 `UPDATE`。
- `session.delete(draft)` 后提交，对应 `DELETE`。

`with SessionLocal() as session` 会在代码块结束时关闭 Session。中途报错时，尚未提交的事务不会自动保存；如果捕获异常后还要继续复用 Session，先执行 `session.rollback()`，把失败事务清干净。

### relationship 很方便，但 SQL 不会凭空消失

循环里读取 `item.book.name` 时，SQLAlchemy 可能额外查询本子。数据少时无所谓，列表有几百行、每行都单独查一次，就会产生几百条额外 SQL。

所以 `echo=True` 不只是为了学习语法。以后接口突然变慢，先看它发了多少条 SQL，往往比盯着 Python 代码猜更快。

如果运行后提示找不到 1 号便条，回第一篇恢复基础数据；如果报外键错误，先查 `SELECT * FROM book;`，看你传入的 `book_id` 是否真的存在。

现在数据库访问已经可以复用了。下一篇保留 `database.py` 和 `models.py`，把原来操作字典的 FastAPI 路由改成真正的数据库接口：[接入 FastAPI](/post/fastapi-sqlalchemy/)。
