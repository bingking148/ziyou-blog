---
title: 'MySQL 第 1 篇：建库建表，把便条搬进数据库'
weight: 1
cover: /images/covers/mysql-ddl-dml-cover.jpg
date: 2026-11-14T09:00:00+08:00
updatedDate: 2026-11-25T14:35:00+08:00
categories: ['人工智能', '数据库']
tags: ['Python', '编程基础', 'MySQL', 'SQL']
description: '便条接口一重启就丢数据。这一篇建一个 db_note 库和一张 note 表，把那四张便条搬进 MySQL：建库、建表、插入、更新、删除。'
math: false
mermaid: false
comments: true
toc: true
---

[FastAPI 那一篇](/post/python-fastapi-api/)结尾留了一句警告：四张便条待在内存里，服务一关，POST 进去的「快照」就没了。这一篇把这句话解决掉——给便条找一个关机也还在的地方。

这个地方就是数据库。你之前用字典存便条，字典活在 Python 进程里，进程结束它就结束。数据库是另一个一直跑着的程序，专门替你看管表格，数据落在它自己的磁盘文件里。你的 Python 脚本、命令行、以后的接口，都隔着网络跟它说话，说的话叫 SQL。

这一篇用的数据库是 MySQL。先装好它：去 MySQL 官网下 Windows 的安装器，装的时候选 Server only 就够，中途让你给 root 用户设一个密码，**记住这个密码，后面每一篇都要用**。装完在终端里登录：

```bash
mysql -u root -p
```

回车后它问你要密码，输入时屏幕不显示字符，是正常的。看到 `mysql>` 提示符，就是连上了。下面所有 SQL 都在这个提示符后面敲，分号结尾，回车执行。

## 1. 先建一个库

MySQL 里可以放很多个库，一个库装一组相关的表。便条这一组，建一个叫 `db_note` 的库：

```sql
CREATE DATABASE IF NOT EXISTS db_note CHARSET utf8mb4;
SHOW DATABASES;
USE db_note;
SELECT database();
```

四句话各干一件事：建库、看有哪些库、走进这个库、确认自己站在哪个库里。`IF NOT EXISTS` 是「已经有了就别报错」，重复执行不心慌。`utf8mb4` 是字符集，指定它，中文便条才不会存成乱码。

`SHOW DATABASES` 的列表里会有 `mysql`、`sys` 这些库，那是 MySQL 自己用的，别动。

## 2. 建表：给便条一个固定的形状

字典里的便条想加什么键加什么键。表不行，表先规定好每一列叫什么、是什么类型、能不能空。便条表定成这样：

| 列 | 类型 | 约束 | 存什么 |
|---|---|---|---|
| id | INT | 主键 | 编号，1、2、3、4 |
| title | VARCHAR(50) | 非空 | 标题 |
| text | VARCHAR(255) | 可空 | 正文 |
| book | VARCHAR(20) | 非空，默认 '学习' | 属于哪一本 |
| created_at | DATETIME | 默认当前时间 | 什么时候写的 |

写成建表语句：

```sql
CREATE TABLE IF NOT EXISTS note (
    id INT PRIMARY KEY COMMENT '编号',
    title VARCHAR(50) NOT NULL COMMENT '标题',
    text VARCHAR(255) COMMENT '正文',
    book VARCHAR(20) NOT NULL DEFAULT '学习' COMMENT '属于哪一本',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '写下的时间'
) COMMENT '便条表';
```

几个词先认一下：

- `INT` 整数，`VARCHAR(50)` 最长 50 个字符的字符串，`DATETIME` 日期加时间。长文章用 `TEXT`，只记年月日用 `DATE`。
- `PRIMARY KEY` 主键：这一列的值全表唯一，而且不能空。靠它找某一行，就像靠编号找某张便条。
- `NOT NULL` 不许空着。`DEFAULT` 是「你不给，就用这个」。
- `COMMENT` 是写给人看的注释，MySQL 替你存着，以后忘了列的意思可以查。

建完看两眼：

```sql
SHOW TABLES;
DESC note;
```

`DESC` 把每一列的类型、能不能空、默认值、是不是主键摆成一张表。想看自己刚才那条建表语句的完整样子，`SHOW CREATE TABLE note;`。

## 3. 把四张便条搬进去

还是那四张，编号也对上：

```sql
INSERT INTO note (id, title, text, book) VALUES
    (1, '协程', '网页在转圈时，先去看下一页', '学习'),
    (2, '接口', '给函数一个浏览器打得开的地址', '学习'),
    (3, '虚拟机', 'Linux 装在一块虚拟磁盘上', '学习'),
    (4, '快照', '装好就拍一张', '学习');
```

`INSERT INTO 表 (列...) VALUES (值...), (值...)`，一条语句插多行，逗号隔开。列名写出来是个好习惯：值的顺序跟列名一一对应，以后表加了列，这条语句也不会错位。`created_at` 没给，默认值自己填上当前时间。

搬完查一眼：

```sql
SELECT * FROM note;
```

`*` 是所有列。四行都在，编号、标题、正文、本子、时间，整整齐齐。这一步在命令行里看到的表，就是以后接口返回的那份数据。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-mysql-store" viewBox="0 0 680 330" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>内存里的字典重启就空，MySQL 的表重启还在</title>
  <style>
    .diag-mysql-store { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-mysql-store { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-gray:#2a2d33; }
  </style>
  <rect x="40" y="20" width="280" height="120" rx="14" fill="var(--fill-gray)" stroke="currentColor" stroke-width="1.5"/>
  <text x="180" y="52" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">Python 进程里的字典</text>
  <text x="180" y="84" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">notes = {...}</text>
  <text x="180" y="114" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--red)">服务一关，没了</text>
  <rect x="360" y="20" width="280" height="120" rx="14" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="500" y="52" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">MySQL 的 note 表</text>
  <text x="500" y="84" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">数据在磁盘文件里</text>
  <text x="500" y="114" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--green)">关机重启，还在</text>
  <line x1="180" y1="140" x2="180" y2="184" stroke="var(--gray)" stroke-width="1.6" stroke-linecap="round"/><path d="M180,192 L175,184 L185,184 Z" fill="var(--gray)"/>
  <line x1="500" y1="140" x2="500" y2="184" stroke="var(--gray)" stroke-width="1.6" stroke-linecap="round"/><path d="M500,192 L495,184 L505,184 Z" fill="var(--gray)"/>
  <rect x="40" y="196" width="280" height="100" rx="14" fill="var(--fill-gray)" stroke="currentColor" stroke-width="1.5"/>
  <text x="180" y="230" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">重启之后</text>
  <text x="180" y="262" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--red)">只剩代码里写死的那几张</text>
  <rect x="360" y="196" width="280" height="100" rx="14" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="500" y="230" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">重启之后</text>
  <text x="500" y="262" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">SELECT 一下，四张都在</text>
</svg>
</figure>

左边是上一篇的存法，右边是这一篇的存法。差别不在语法，在数据活在哪里。

## 4. 改一张，删一张

「快照」那句正文太短，补一点：

```sql
UPDATE note SET text = '装好就拍一张，出问题能退回去' WHERE id = 4;
SELECT * FROM note WHERE id = 4;
```

`UPDATE 表 SET 列 = 新值 WHERE 条件`。`WHERE id = 4` 圈定只改编号 4 这一行。

再插一张试验用的，然后删掉它：

```sql
INSERT INTO note (id, title, text, book) VALUES (99, '试验', '马上删', '学习');
DELETE FROM note WHERE id = 99;
```

`DELETE FROM 表 WHERE 条件`，删的是行，表还在。

> [!WARNING]
> `UPDATE` 和 `DELETE` 不写 `WHERE`，作用的就是全表每一行。`DELETE FROM note;` 一下清空四张便条，没有回收站。敲这两句之前，先确认 `WHERE` 在后面。

还有一个 `TRUNCATE TABLE note;`，也是清空全表，但它把整张表的数据直接推倒重建，比逐行删快，也不走逐行的日志。练习库里可以用，`note` 表上别用——你还要靠它往下写。

## 5. 小项目：把这一篇连起来跑

从登录开始，按顺序执行。跑完 `note` 表里是四张便条：

```sql
CREATE DATABASE IF NOT EXISTS db_note CHARSET utf8mb4;
USE db_note;
CREATE TABLE IF NOT EXISTS note (
    id INT PRIMARY KEY COMMENT '编号',
    title VARCHAR(50) NOT NULL COMMENT '标题',
    text VARCHAR(255) COMMENT '正文',
    book VARCHAR(20) NOT NULL DEFAULT '学习' COMMENT '属于哪一本',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '写下的时间'
) COMMENT '便条表';
INSERT INTO note (id, title, text, book) VALUES
    (1, '协程', '网页在转圈时，先去看下一页', '学习'),
    (2, '接口', '给函数一个浏览器打得开的地址', '学习'),
    (3, '虚拟机', 'Linux 装在一块虚拟磁盘上', '学习'),
    (4, '快照', '装好就拍一张，出问题能退回去', '学习');
SELECT * FROM note;
```

把这段存成一个 `note.sql` 文件放着。后面 Docker 那一篇要把它喂给容器里的 MySQL，不用重敲。

## 6. 课后小项目

**练习一：不给标题试试（必做）**

`INSERT INTO note (id, text) VALUES (5, '没有标题');` 看它报什么错。报错里会提到 `title`，对照 `DESC note` 里那一列的 `Null` 是 `NO`。

**练习二：默认值在哪生效**

`INSERT INTO note (id, title) VALUES (5, '默认');` 成功后 `SELECT * FROM note WHERE id = 5;`，看 `book` 和 `created_at` 两列是谁填的。看完把 5 号删掉。

**练习三：改错一行再改回来**

把 2 号的 `book` 改成 '随手'，`SELECT` 确认，再改回 '学习'。两次 `UPDATE` 都带 `WHERE id = 2`。

## 7. 小结

库是文件夹，表是文件夹里那张规定好列的表格。`CREATE DATABASE` 和 `CREATE TABLE` 定形状，`INSERT` 放数据，`UPDATE` 和 `DELETE` 改和删，后两句永远带 `WHERE`。四张便条这次落在磁盘上，重启也在。

表里现在只有四行，随便一眼就看全。等便条多了，就要学怎么挑：[MySQL 第 2 篇：查询，从一堆便条里挑出要的那张](/post/mysql-dql/)。