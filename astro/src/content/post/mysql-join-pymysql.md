---
title: 'MySQL 第 3 篇：两张表连起来查，再让 Python 接手'
weight: 3
cover: /images/covers/mysql-join-pymysql-cover.jpg
date: 2026-11-17T09:00:00+08:00
updatedDate: 2026-11-25T14:35:00+08:00
categories: ['人工智能', '数据库']
tags: ['Python', '编程基础', 'MySQL', 'SQL', 'PyMySQL']
description: '本子名单独成一张 book 表，便条只留一个 book_id：内连接、左连接、右连接各留下哪些行，再用 PyMySQL 让 Python 脚本连上数据库读写。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇结尾留了个问题：「学习」这个本子名写在每张便条上，改一次名要改八行。这一篇把本子名单独放一张表，便条上只留一个编号指着它。两张表各管各的，查的时候再连起来。

连起来查叫关联查询。查完再把命令行换成 Python：以后接口里的数据，就是脚本这样读出来的。

## 1. 建本子表，给便条搬家

先建 `book` 表，三个本子，其中「工作」先空着，后面看连接时有用：

```sql
USE db_note;
CREATE TABLE IF NOT EXISTS book (
    id INT PRIMARY KEY COMMENT '本子编号',
    name VARCHAR(20) NOT NULL UNIQUE COMMENT '本子名'
) COMMENT '本子表';
INSERT INTO book (id, name) VALUES (1, '学习'), (2, '随手'), (3, '工作');
```

`UNIQUE` 是另一种约束：这一列不许重复，但和主键不同，一张表只能有一个主键，`UNIQUE` 可以加在别的列上。本子名不该重名，加它合适。

再给 `note` 表加一列 `book_id`，把字符串翻译编号：

```sql
ALTER TABLE note ADD book_id INT COMMENT '属于哪本，指 book.id';
UPDATE note SET book_id = 1 WHERE book = '学习';
UPDATE note SET book_id = 2 WHERE book = '随手';
```

故意留一张没本子的散页，编号 11，`book_id` 给 4——`book` 表里没有 4 号：

```sql
INSERT INTO note (id, title, text, book_id) VALUES (11, '散页', '本子还没想好', 4);
```

搬家完成，旧列可以拆了：

```sql
ALTER TABLE note DROP COLUMN book;
```

从现在起，便条上只有 `book_id` 这个整数。本子改名只改 `book` 表一行，十一张便条一张都不用动。**这就是拆表的全部理由：一个事实只存一处。**

## 2. 内连接：两边都有的才留下

想知道每张便条属于哪个本子，把两张表按 `book_id = id` 拼起来：

```sql
SELECT n.id, n.title, b.name AS book_name
FROM note AS n
    JOIN book AS b ON n.book_id = b.id;
```

`JOIN`（写全了是 `INNER JOIN`）是内连接，`ON` 后面是拼接条件：便条的 `book_id` 等于本子的 `id`，这两行就拼成一行返回。`AS n`、`AS b` 是给表起的短名，后面列名前缀用它。

结果是 10 行。11 号散页不在里面：它的 `book_id` 是 4，`book` 表里找不到 4 号，拼不上，内连接直接不要它。

## 3. 左连接、右连接：有一边要全留

换个问法：每个本子各有几张便条，**一张都没有的本子也要列出来**。这时以 `book` 表为准，它每一行都留，拼不上的便条位置填 `NULL`：

```sql
SELECT b.name AS book_name, n.id, n.title
FROM book AS b
    LEFT JOIN note AS n ON b.id = n.book_id;
```

`LEFT JOIN` 左外连接：左表（`FROM` 后面那张）全留。结果 11 行，「工作」那一行的 `id` 和 `title` 都是 `NULL`。

再换问法：每张便条都要列出来，**包括没本子的散页**。这时以 `note` 表为准：

```sql
SELECT b.name AS book_name, n.id, n.title
FROM book AS b
    RIGHT JOIN note AS n ON b.id = n.book_id;
```

`RIGHT JOIN` 右外连接：右表全留。也是 11 行，但多出来的是 11 号散页，它的 `book_name` 是 `NULL`。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-mysql-join" viewBox="0 0 680 360" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>三种连接各留下哪些行</title>
  <style>
    .diag-mysql-join { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-mysql-join { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; }
  </style>
  <rect x="40" y="16" width="600" height="76" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="340" y="42" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">JOIN 内连接：10 行</text>
  <text x="340" y="70" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">拼得上的才要：散页出局，空本子不出现在结果里</text>
  <rect x="40" y="112" width="600" height="76" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="340" y="138" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">LEFT JOIN：11 行，本子全留</text>
  <text x="340" y="166" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">「工作」没有便条，也占一行，便条那几列是 NULL</text>
  <rect x="40" y="208" width="600" height="76" rx="12" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="340" y="234" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">RIGHT JOIN：11 行，便条全留</text>
  <text x="340" y="262" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">11 号散页没有本子，也占一行，本子名是 NULL</text>
  <text x="340" y="322" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">左右是相对 FROM 和 JOIN 的位置说的，换位置就换名字</text>
</svg>
</figure>

记法只有一句：外连接里，`LEFT` 保左表、`RIGHT` 保右表，保的那边一行不丢，另一边拼不上就填 `NULL`。

想要「两边都全留」的全外连接，MySQL 没有 `FULL JOIN` 这个词，用 `UNION` 把左连接和右连接的结果合起来、去掉重复行：

```sql
(SELECT b.name AS book_name, n.id, n.title
 FROM book AS b LEFT JOIN note AS n ON b.id = n.book_id)
UNION
(SELECT b.name AS book_name, n.id, n.title
 FROM book AS b RIGHT JOIN note AS n ON b.id = n.book_id);
```

12 行：10 行拼得上的，加「工作」空行，加散页行。

## 4. Python 接手：连接和游标

命令行里能查了，脚本里也要能。装一个库：

```bash
pip install pymysql
```

连接就是上一篇登录时那几样信息：地址、端口、用户、密码、库名。存成 `note_db.py`：

```python
import pymysql


def get_conn():
    return pymysql.connect(
        host='127.0.0.1',
        port=3306,
        user='root',
        password='123456',   # 换成你自己设的密码
        database='db_note',
        charset='utf8mb4',
    )


def list_notes(conn):
    cur = conn.cursor()
    cur.execute('''
        SELECT n.id, n.title, b.name
        FROM note AS n JOIN book AS b ON n.book_id = b.id
    ''')
    rows = cur.fetchall()
    cur.close()
    return rows


if __name__ == '__main__':
    conn = get_conn()
    try:
        for row in list_notes(conn):
            print(row)
    finally:
        conn.close()
```

三个角色认一下：`connect` 返回的连接 `conn` 是那根电话线；`conn.cursor()` 拿到的游标 `cur` 是话筒，SQL 从它嘴里说出去；`fetchall()` 把结果全部收回来，是一个元组的列表，一行一个元组。

跑一下，打出 10 行 `(1, '协程', '学习')` 这样的元组。`finally` 保证不管中途报什么错，连接都会关掉——连接是资源，借了要还。

## 5. 写入要 commit

查不用提交，改要。加一个插入函数，接在同一个文件里：

```python
def add_note(conn, title, text, book_id):
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO note (title, text, book_id) VALUES (%s, %s, %s)',
        (title, text, book_id),
    )
    conn.commit()
    cur.close()
```

两个细节：

- `%s` 是占位符，值从第二个参数按顺序填进去。**不要自己用 f-string 把值拼进 SQL**：值里带一个引号就能把语句拼坏，被人故意拼坏就是 SQL 注入。占位符交给 PyMySQL 去转义。
- `conn.commit()` 是提交。PyMySQL 默认开了事务：你执行的插入先记在本次会话里，`commit` 之后别的连接才看得见。不提交就关连接，这次插入等于没发生。

在主程序里 `add_note(conn, '连接', '借了要还', 1)`，再跑 `list_notes`，12 号在里面。去命令行 `SELECT` 也能看到——同一个库，谁连上都一样。

收结果还有两个小口：`fetchone()` 只拿下一行，`fetchmany(3)` 拿接下来三行。结果很大、不想一次全收进内存时用它们。

## 6. 小项目：一个能读能写的脚本

把上面三段合成完整的 `note_db.py` 跑一遍：连接、列出 10 行、插入 12 号、再列出 11 行、关闭。然后去命令行确认 12 号也在。两边看到的是同一份数据，这就是数据库和字典的根本区别。

## 7. 课后小项目

**练习一：散页现形（必做）**

用右连接查全部便条和本子名，找出 `book_name` 为 `NULL` 的那行。再把它 `UPDATE` 到 3 号「工作」本下，重跑内连接，看它回来没有。

**练习二：空本子计数**

左连接之后按 `b.name` 分组 `COUNT(n.id)`。注意数的是 `n.id` 不是 `*`：「工作」那一行 `n.id` 是 `NULL`，`COUNT(n.id)` 给它 0，`COUNT(*)` 会给它 1。两个都跑一次看差别。

**练习三：不提交的插入**

把 `add_note` 里的 `conn.commit()` 注释掉，插入 13 号，脚本里 `fetchall` 能看到吗？命令行里能看到吗？想清楚再恢复那行。

## 8. 小结

一个事实存一处：本子名进 `book` 表，便条留 `book_id`。内连接只留拼得上的，左连接保左表、右连接保右表，全外连接用 `UNION` 拼。Python 侧三步：`connect` 拿连接、`cursor` 执行 SQL、`fetchall` 收结果；写入多一步 `commit`，值走 `%s` 占位符。

脚本里现在还是手写 SQL 字符串。表一多，这些字符串会越长越难维护。下一篇换一种写法：把表写成 Python 类，增删改查变成操作对象：[SQLAlchemy 第 1 篇：把表写成类](/post/sqlalchemy-orm/)。