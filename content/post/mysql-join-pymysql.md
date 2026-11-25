---
title: 'MySQL 第 3 篇：两张表连起来查，再让 Python 接手'
weight: 3
cover: /images/covers/mysql-join-pymysql-cover.jpg
date: 2026-11-17T09:00:00+08:00
lastmod: 2026-11-25T16:09:02+08:00
categories: ['人工智能', '数据库']
tags: ['Python', '编程基础', 'MySQL', 'SQL', 'PyMySQL']
description: '把本子拆成 book 表，用 JOIN 查清关联结果，再用一份完整 PyMySQL 脚本查询和新增，最后让数据库自己守住外键约束。'
math: false
mermaid: false
comments: true
toc: true
---

现在每张便条都把本子名存了一遍。“学习”出现八次，想改成“功课”就得更新八行；哪次少改一行，统计时还会被当成两个本子。

这次把本子名单独拿出来。改完后，`book` 表保存“学习、随手、工作”，`note` 表只保存一个 `book_id`。随后用 Python 读写这两张表，不再一直待在 MySQL 客户端里。

开始前先确认：

```sql
USE db_note;
SELECT COUNT(*) FROM note;
```

结果应为 10。

## 1. 拆表时，先搬数据，再删旧列

新建 `E:\notes-service\sql\03_add_books.sql`：

```sql
USE db_note;

CREATE TABLE book (
  id INT PRIMARY KEY COMMENT '本子编号',
  name VARCHAR(20) NOT NULL UNIQUE COMMENT '本子名称'
) COMMENT '本子表';

INSERT INTO book (id, name) VALUES
  (1, '学习'),
  (2, '随手'),
  (3, '工作');

ALTER TABLE note
  ADD COLUMN book_id INT NULL COMMENT '对应 book.id';

UPDATE note SET book_id = 1 WHERE book = '学习';
UPDATE note SET book_id = 2 WHERE book = '随手';

SELECT id, title, book, book_id
FROM note
ORDER BY id;
```

执行：

```sql
SOURCE E:/notes-service/sql/03_add_books.sql;
```

最后的查询很关键：旧 `book` 和新 `book_id` 必须对应，学习是 1，随手是 2，而且十行都要有值。这里先别偷懒删旧列，数据没核对完就删，出了问题连对照都没有。

确认无误后再执行：

```sql
SELECT n.id, n.title, n.book_id
FROM note AS n
LEFT JOIN book AS b ON n.book_id = b.id
WHERE n.book_id IS NOT NULL AND b.id IS NULL;
```

这条是在找“便条写了本子编号，但本子表里根本没有这个编号”的脏数据。结果必须为空，才能加外键：

```sql
ALTER TABLE note DROP COLUMN book;

ALTER TABLE note
  ADD CONSTRAINT fk_note_book
  FOREIGN KEY (book_id) REFERENCES book(id);

SHOW CREATE TABLE note;
```

最后一段输出里应出现 `CONSTRAINT fk_note_book FOREIGN KEY`。有了这个约束，不管从 MySQL 客户端还是 Python 插入数据，`book_id = 99` 都会被拒绝。规则放在数据库里，就不必指望每个入口都记得检查。

`book.name` 上的 `UNIQUE` 也有用：它防止创建两个同名本子。主键负责标识一行，`UNIQUE` 负责表达业务上的“不许重名”。

## 2. JOIN：按 book_id 把名字接回来

旧列删掉后，单查 `note` 只能看到 `book_id`，看不到“学习”两个字。用 `INNER JOIN` 把本子名接回来：

```sql
SELECT n.id, n.title, n.text, b.name AS book_name
FROM note AS n
INNER JOIN book AS b ON n.book_id = b.id
ORDER BY n.id;
```

`n` 和 `b` 是表别名。两张表都有 `id`，所以写 `n.id`、`b.id`，不要让 MySQL 替你猜。`ON n.book_id = b.id` 是两张表的配对条件。

现在十张便条都有有效本子，所以结果是十行。`INNER JOIN` 只保留两边能配上的数据；如果便条指向一个不存在的本子，它就不会出现在结果里。

再看另一个需求：列出所有本子，包括一张便条都没有的“工作”。

```sql
SELECT b.name, COUNT(n.id) AS total
FROM book AS b
LEFT JOIN note AS n ON b.id = n.book_id
GROUP BY b.id, b.name
ORDER BY b.id;
```

结果应是：

```text
学习    8
随手    2
工作    0
```

`LEFT JOIN` 会保住左边的 `book`。工作没有对应便条，连接结果里仍有一行，只是 `n.id` 为 `NULL`。

所以这里必须写 `COUNT(n.id)`，不能写 `COUNT(*)`。后者会把“工作”那行连接结果也数进去，得到 1；前者遇到 `NULL` 不计数，才是正确的 0。

日常查询用 `INNER JOIN` 和 `LEFT JOIN` 就够。`RIGHT JOIN` 只是换一边保留数据，把表顺序换一下也能写出来，没必要让项目里同时存在两种阅读习惯。

## 3. 安装 PyMySQL，让 Python 连上来

打开之前使用的 Python 虚拟环境，安装：

```powershell
python -m pip install pymysql cryptography
```

`PyMySQL` 是数据库驱动，`cryptography` 用来处理 MySQL 8 常见的认证加密。一起装上，免得换一台机器后才遇到认证报错。

在 `E:\notes-service` 新建 `note_db.py`：

```python
import pymysql
from pymysql.cursors import DictCursor


DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': '123456',  # 改成你的 MySQL 密码
    'database': 'db_note',
    'charset': 'utf8mb4',
    'cursorclass': DictCursor,
    'autocommit': False,
}


def get_connection():
    return pymysql.connect(**DB_CONFIG)


def list_notes(conn):
    sql = '''
        SELECT n.id, n.title, n.text, b.name AS book_name
        FROM note AS n
        INNER JOIN book AS b ON n.book_id = b.id
        ORDER BY n.id
    '''
    with conn.cursor() as cursor:
        cursor.execute(sql)
        return cursor.fetchall()


def find_note(conn, note_id):
    sql = '''
        SELECT n.id, n.title, n.text, b.name AS book_name
        FROM note AS n
        INNER JOIN book AS b ON n.book_id = b.id
        WHERE n.id = %s
    '''
    with conn.cursor() as cursor:
        cursor.execute(sql, (note_id,))
        return cursor.fetchone()


def add_note(conn, title, text, book_id):
    sql = 'INSERT INTO note (title, text, book_id) VALUES (%s, %s, %s)'
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, (title, text, book_id))
            new_id = cursor.lastrowid
        conn.commit()
        return new_id
    except Exception:
        conn.rollback()
        raise


if __name__ == '__main__':
    conn = get_connection()
    try:
        notes = list_notes(conn)
        print(f'当前有 {len(notes)} 张便条')
        for note in notes:
            print(note)

        new_id = add_note(conn, '连接数据库', '值通过占位符传入', 1)
        print('刚新增的便条：', find_note(conn, new_id))
    finally:
        conn.close()
```

运行：

```powershell
Set-Location E:\notes-service
python note_db.py
```

第一次运行会先打印十张便条，再插入“连接数据库”。`DictCursor` 让每行以字典返回，`note['title']` 就能取标题，不用记元组里第几个位置是什么。

代码里有几个地方不要随手改掉：

- `execute(sql, (title, text, book_id))` 是参数化查询。`%s` 由驱动处理，不是 Python 的字符串格式化。
- 新增后调用 `commit()`，事务才真正落库；异常时 `rollback()`，避免留下半次写入。
- `lastrowid` 能拿到刚生成的自增编号，再用 `find_note()` 查回来，不必猜编号。
- 连接最后要 `close()`，所以放在 `finally` 里。查询中途报错也会执行。

> [!WARNING]
> 不要把标题写成 `f"INSERT INTO note VALUES ('{title}')"`。用户输入里有引号时会直接破坏 SQL，恶意输入还可能改变语句含义。值一律走 `execute()` 的第二个参数。

这个脚本每运行一次都会新增一行，这是它的功能，不是重复执行出错。自增编号也不要求连续；删除数据和失败插入都可能留下空号。

## 4. 连接失败时，先分清是哪一层

- **`Access denied`**：用户名或密码不对，先回 MySQL 客户端用同一组账号验证。
- **`Unknown database 'db_note'`**：库不存在，检查是否执行了前两篇的初始化脚本。
- **`Cannot connect to MySQL server`**：服务没启动、端口不对，或者本机防火墙拦了连接。
- **`foreign key constraint fails`**：传入的 `book_id` 在 `book` 表里不存在，先查 `SELECT * FROM book;`。

到这里，SQL 和 Python 已经各自跑通。不过列表查询、参数和结果字典仍要手写，表一多就会重复。下一篇用 SQLAlchemy 把表映射成类，保留数据库能力，少写这些样板代码：[ORM 模型与 Session](/post/sqlalchemy-orm/)。
