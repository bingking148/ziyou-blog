---
title: 'SQLAlchemy 第 1 篇：把表写成类，增删改查不再拼 SQL'
weight: 4
cover: /images/covers/sqlalchemy-orm-cover.jpg
date: 2026-11-18T09:00:00+08:00
updatedDate: 2026-11-25T14:35:00+08:00
categories: ['人工智能', '数据库']
tags: ['Python', '编程基础', 'SQLAlchemy', 'ORM', 'MySQL']
description: 'note 表和 book 表写成两个 Python 类：一行就是一个对象，session.add 是插入、改属性是更新、session.delete 是删除，SQL 由框架替你拼。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇的脚本里，SQL 是一整段字符串。列名拼错一个字母，要等运行到那一行才报错；表加一列，所有字符串都要翻出来改。这一篇换一种写法：表写成类，行写成对象，SQL 让框架去拼。

干这件事的框架叫 SQLAlchemy，思路有个名字：ORM，对象关系映射。关系是表，对象是类实例，映射就是两者之间的对应规则。你操作对象，它翻译成 SQL。

```bash
pip install sqlalchemy
```

`pymysql` 上一篇装过，SQLAlchemy 连 MySQL 时底层还是用它。

## 1. 引擎和会话

新建一个目录放这一篇的代码。第一个文件 `database.py`，只管「怎么连」：

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = 'mysql+pymysql://root:123456@127.0.0.1:3306/db_note?charset=utf8mb4'

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False)
```

那串地址把上一篇 `connect` 的参数串成了一行：`mysql+pymysql` 是「用 pymysql 这个驱动连 mysql」，后面依次是用户、密码、地址、端口、库名。密码换成你自己的。

`engine` 引擎管连接池：连接建好放着复用，不是每次查询都重新拨号。`echo=True` 让它把每次真正发出去的 SQL 打在终端上——**学习阶段开着它，你能看见对象操作被翻译成了什么**，学会之后再关。

`SessionLocal` 是会话工厂。会话 `session` 是你这一次操作的草稿本：加进来的对象、改过的属性先记在本子上，`commit` 才一起写进数据库。和上一篇 PyMySQL 的事务是同一回事，只是本子替你管了。

## 2. 模型：一张表一个类

第二个文件 `models.py`，把两张表写成两个类：

```python
import datetime
from typing import Optional

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
    text: Mapped[Optional[str]] = mapped_column(String(255))
    book_id: Mapped[Optional[int]] = mapped_column(ForeignKey('book.id'))
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, server_default=text('CURRENT_TIMESTAMP')
    )

    book: Mapped[Optional['Book']] = relationship(back_populates='notes')
```

对照着读：

- `__tablename__` 指定这个类对应哪张表。类名可以叫 `Note`，表名还是 `note`。
- 每个类属性对应一列。`Mapped[int]` 是类型注解，告诉读代码的人这一列是整数；`mapped_column(...)` 里才是给数据库的交代：类型、主键、自增、非空、默认值。和第一篇建表语句里的词一一对得上。
- `Optional[str]` 表示这列可以是 `NULL`，对应 `text` 和 `book_id`。
- `ForeignKey('book.id')` 就是外键：这一列的值必须能在 `book.id` 里找到。上一篇靠自觉维护的指向，这次写进了表结构。
- `relationship` 不是列，是给你用的捷径：`note.book` 直接拿到本子对象，`book.notes` 直接拿到这个本子的便条列表。框架背地里替你发那条连接查询。

`Base` 是所有模型的基类，它记着「有哪些类、各对应哪张表」。一句 `Base.metadata.create_all(engine)` 会把这些类对应的表在库里建出来——已经存在的表跳过不动。我们的表早就建好了，所以这句现在跑一下什么都不会发生；换个空库跑，表就按类长出来。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-orm-map" viewBox="0 0 680 330" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>类与表对应，对象与行对应</title>
  <style>
    .diag-orm-map { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-orm-map { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; }
  </style>
  <rect x="40" y="20" width="280" height="150" rx="14" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8"/>
  <text x="180" y="50" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">Python 类 Note</text>
  <text x="180" y="84" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">title / text / book_id</text>
  <text x="180" y="116" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">一个对象 = 一张便条</text>
  <text x="180" y="146" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">改属性就是改这一行</text>
  <rect x="360" y="20" width="280" height="150" rx="14" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="500" y="50" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">MySQL 表 note</text>
  <text x="500" y="84" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">title / text / book_id 列</text>
  <text x="500" y="116" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">一行 = 一张便条</text>
  <text x="500" y="146" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">INSERT / UPDATE / DELETE</text>
  <line x1="320" y1="70" x2="352" y2="70" stroke="var(--gray)" stroke-width="1.6"/><path d="M360,70 L352,65 L352,75 Z" fill="var(--gray)"/>
  <line x1="360" y1="120" x2="328" y2="120" stroke="var(--gray)" stroke-width="1.6"/><path d="M320,120 L328,115 L328,125 Z" fill="var(--gray)"/>
  <rect x="140" y="210" width="400" height="80" rx="14" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="340" y="240" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">session 在中间翻译：add → INSERT，改属性 → UPDATE</text>
  <text x="340" y="268" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">commit 时一起发出去，echo=True 能看见原文</text>
</svg>
</figure>

## 3. 增删改查，全是对象操作

第三个文件 `main.py`，把会话用起来：

```python
from database import SessionLocal
from models import Note

session = SessionLocal()

# 增：造一个对象，放进会话，提交
n = Note(title='映射', text='表是类，行是对象', book_id=1)
session.add(n)
session.commit()
session.refresh(n)
print(n.id, n.created_at)

# 查：按条件捞一批
study = session.query(Note).filter(Note.book_id == 1).all()
for note in study:
    print(note.id, note.title, note.book.name)

# 查：按主键拿一个
one = session.get(Note, 1)
print(one.title)

# 改：改属性，提交
one.text = '网页在转圈时，先去看下一页（改过）'
session.commit()

# 删：删对象，提交
session.delete(n)
session.commit()

session.close()
```

逐段对照上一篇：

- `session.add(n)` 加 `commit` 就是 `INSERT`。`refresh` 是提交后回库里把这一行重新读一遍，把数据库填的 `id` 和 `created_at` 补回对象上——自增编号和默认时间都是数据库给的，对象刚造出来时还没有。
- `query(Note).filter(...).all()` 就是 `SELECT ... WHERE ...`。条件写成 `Note.book_id == 1` 这样的表达式，列名拼错在这里就报属性错误，不用等运行到 SQL。
- `session.get(Note, 1)` 是按主键查一行，相当于 `WHERE id = 1`。
- 改不用写 `UPDATE`：对象属性赋值，会话记下来，`commit` 时翻译成 `UPDATE`。删同理。
- `note.book.name` 那一下没写连接查询，`relationship` 替你发了。终端里 `echo` 打出来的 SQL 能看到它。

跑的时候盯着终端：每一段对象操作下面都跟着一段真正的 SQL。对象是面子，SQL 是里子，里子没变，只是不用你手写了。

## 4. 反过来：从表生成类

表已经存在、类还没写的时候，有个工具能照着表结构把类代码生成出来：

```bash
pip install sqlacodegen
python -m sqlacodegen "mysql+pymysql://root:123456@127.0.0.1:3306/db_note?charset=utf8mb4" --outfile models_gen.py
```

打开 `models_gen.py`，`Book` 和 `Note` 都在，列、类型、外键、默认值照表抄好。接手别人留下的库时，这一步省掉对着 `DESC` 手抄类的功夫。生成出来的代码可以再改：类名、`relationship` 的命名，按你的习惯调。

## 5. 小项目：三个文件跑一遍

目录里就三个文件：`database.py`、`models.py`、`main.py`。跑 `main.py`，终端先刷 SQL 再刷结果：新增的「映射」拿到编号和创建时间，学习本下的便条连本子名一起打出来，1 号正文被改，「映射」被删。去命令行 `SELECT * FROM note;` 对一眼，和对象操作的结果一致。

## 6. 课后小项目

**练习一：看见 UPDATE（必做）**

只留「改」那一段，跑之前先猜终端会打出什么 SQL，跑完对答案。`WHERE` 后面跟的是哪一列？

**练习二：用 relationship 反着走**

`session.get(Book, 1)` 拿到本子对象，直接 `for note in book.notes` 打标题。不写任何连接查询，看 `echo` 里替你发了几条 SQL。

**练习三：外键拦一次**

`Note(title='野便条', book_id=99)`  add 并 commit，看报什么错。报错里提到外键约束。再把 `book_id` 改成 3 重试。

## 7. 小结

表写成类、行写成对象：`mapped_column` 交代列，`relationship` 交代两张表的关系，`session` 是草稿本，`commit` 才落库。增是 `add`，查是 `query` 和 `get`，改是赋属性，删是 `delete`。`echo=True` 随时给你看翻译出来的 SQL，`sqlacodegen` 能反向从表生成类。

对象这套写法接下来接回接口：便条服务换成从数据库读写，重启不再丢。[SQLAlchemy 第 2 篇：接上 FastAPI，便条这次真的存住了](/post/fastapi-sqlalchemy/)。