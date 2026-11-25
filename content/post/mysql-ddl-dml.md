---
title: 'MySQL 第 1 篇：建库建表，把便条搬进数据库'
weight: 1
cover: /images/covers/mysql-ddl-dml-cover.jpg
date: 2026-11-14T09:00:00+08:00
lastmod: 2026-11-25T16:09:02+08:00
categories: ['人工智能', '数据库']
tags: ['Python', '编程基础', 'MySQL', 'SQL']
description: '从安装和登录开始，建好 db_note 与 note 表，亲手完成插入、修改和删除，并用 SELECT 验证每一步。'
math: false
mermaid: false
comments: true
toc: true
---

用字典做便条接口，新增、修改都没问题，唯一的硬伤是重启后全没了。我们先把这个问题解决，Python 代码暂时一行不动：装好 MySQL，建一张 `note` 表，把便条写进去，再试着改一张、删一张。

数据库能连、表能建、数据能查，后面接 Python 才有意义。否则报错时，你根本分不清是 SQL 写错了，还是连接代码写错了。

## 1. 先把 MySQL 跑起来

Windows 下安装 MySQL 官方的 Installer，组件不用全选，装上 **MySQL Server** 和命令行客户端就够。安装过程中会要求设置 `root` 密码，`root` 是数据库管理员，这个密码和 Windows 登录密码没有关系。

装完打开 PowerShell：

```powershell
mysql --version
mysql -u root -p
```

第一条打印版本号，第二条登录。看到 `Enter password:` 后输入安装时设置的密码。输入过程中屏幕不会显示星号，光标也不动，输完直接回车。

登录成功的标志是提示符变成：

```text
mysql>
```

如果系统找不到 `mysql` 命令，先别急着配置环境变量。开始菜单里找 **MySQL Command Line Client**，打开后同样能输入 SQL。它只是客户端入口不同，不影响后面的操作。

顺便说一句，`-p` 后面不要直接跟密码。让 MySQL 单独询问，密码就不会留在命令历史里。

## 2. 把建表语句保存成文件

在 PowerShell 建一个后续几篇都会使用的目录：

```powershell
New-Item -ItemType Directory -Force E:\notes-service\sql
```

新建 `E:\notes-service\sql\01_init.sql`，内容如下：

```sql
CREATE DATABASE db_note
  DEFAULT CHARACTER SET utf8mb4;

USE db_note;

CREATE TABLE note (
  id INT PRIMARY KEY COMMENT '便条编号',
  title VARCHAR(50) NOT NULL COMMENT '标题',
  text VARCHAR(255) NULL COMMENT '正文',
  book VARCHAR(20) NOT NULL DEFAULT '学习' COMMENT '所属本子',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) COMMENT '便条表';

INSERT INTO note (id, title, text, created_at) VALUES
  (1, '协程', '等待网页时，可以先处理别的任务', '2026-10-26 09:00:00'),
  (2, '接口', '给函数一个可以从网络访问的地址', '2026-10-28 20:00:00'),
  (3, '虚拟机', '在虚拟硬件上运行一套 Linux', '2026-10-30 21:00:00'),
  (4, '快照', '记录某个时间点的状态', '2026-11-01 08:30:00');
```

这里刻意固定了四张便条的创建时间。下一篇要练排序和分页，固定数据才能保证你查出来的结果和文章一致。平时写程序不用传 `created_at`，数据库会自动填当前时间。

表里的几条约束现在就要看懂：

- `id INT PRIMARY KEY`：主键不能重复，后面按编号修改便条就靠它。
- `title ... NOT NULL`：标题必须填写；`text` 没有这个限制，所以正文可以为空。
- `book ... DEFAULT '学习'`：插入时没写本子，就归入“学习”。
- `VARCHAR(50)`：最多保存 50 个字符，不是每条数据都占满 50 个字符。

`utf8mb4` 也别省。中文、emoji 都靠它正常保存，建库时设置一次，比以后处理乱码省事。

回到 `mysql>`，执行这个文件：

```sql
SOURCE E:/notes-service/sql/01_init.sql;
```

注意这里用 `/`，不要把 Windows 路径里的反斜杠原样带进去。

然后检查：

```sql
USE db_note;
SHOW TABLES;
DESC note;

SELECT id, title, text, book, created_at
FROM note
ORDER BY id;
```

最后一条应该返回四行，`book` 都是“学习”。`DESC note` 里，`id` 的 `Key` 一列应显示 `PRI`，`title` 的 `Null` 一列应显示 `NO`。

如果重新执行 `SOURCE` 后报 `database exists` 或 `Duplicate entry`，不是数据坏了，而是这份初始化脚本只用于第一次建表。表已经建好的话，直接查询即可。

## 3. 插入时省略几列，看看默认值

再插入一张只给标题的便条：

```sql
INSERT INTO note (id, title)
VALUES (99, '只给标题');

SELECT id, title, text, book, created_at
FROM note
WHERE id = 99;
```

你会看到：

- `text` 是 `NULL`，表示没有正文；
- `book` 是“学习”，来自默认值；
- `created_at` 是当前时间，也来自默认值。

`NULL` 不是空字符串 `''`，更不是数字 0。下一篇查询空正文时，这个区别会直接影响结果。

不需要的列不写进 `INSERT`，比给所有列硬凑一个值更清楚。比如自动编号、自动时间，都应该交给数据库处理。

## 4. 修改和删除，先确认会碰到哪一行

把 4 号便条的正文补完整。先用准备给 `UPDATE` 的条件查一次：

```sql
SELECT id, title, text
FROM note
WHERE id = 4;
```

确认只有“快照”这一行，再执行：

```sql
UPDATE note
SET text = '记录某个时间点的状态，出问题时可以恢复'
WHERE id = 4;

SELECT id, title, text
FROM note
WHERE id = 4;
```

`SET` 决定改成什么，`WHERE` 决定改哪些行。漏写 `WHERE` 不会报语法错误，MySQL 会直接更新整张表，所以“先 SELECT 同一个条件”不是形式步骤，是在检查影响范围。

刚才的 99 号已经没用了，删掉：

```sql
SELECT id, title FROM note WHERE id = 99;
DELETE FROM note WHERE id = 99;
SELECT id, title FROM note WHERE id = 99;
```

最后一次查询应为空。`DELETE` 只删行，表还在；`DROP TABLE note` 才是连表结构一起删除。看到 `DROP` 时多停一秒，永远不过分。

## 5. 报错时先看这几项

**`ERROR 1045: Access denied`**

登录失败。先确认输入的是 MySQL 的 `root` 密码，不是 Windows 密码。

**`ERROR 1046: No database selected`**

当前没有选库。执行：

```sql
USE db_note;
SELECT DATABASE();
```

第二条应返回 `db_note`。

**`ERROR 1062: Duplicate entry`**

主键重复。比如 1 号便条已经存在，又执行了一次 `(1, '协程', ...)`。想继续看数据就查询，不必反复插入。

现在表里应该仍是最初的四张便条，4 号正文已经更新，99 号已经删除。下一篇不碰表结构，专门解决“十张、一百张便条里怎么找出自己要的那几张”：[WHERE、排序、分页和分组统计](/post/mysql-dql/)。
