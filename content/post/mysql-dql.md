---
title: 'MySQL 第 2 篇：查询，从一堆便条里挑出要的那张'
weight: 2
cover: /images/covers/mysql-dql-cover.jpg
date: 2026-11-15T09:00:00+08:00
lastmod: 2026-11-25T16:09:02+08:00
categories: ['人工智能', '数据库']
tags: ['Python', '编程基础', 'MySQL', 'SQL']
description: '把便条补到十张，逐层学会 WHERE、LIKE、ORDER BY、LIMIT、GROUP BY，并能解释一条查询各部分的先后关系。'
math: false
mermaid: false
comments: true
toc: true
---

四张便条用 `SELECT *` 看一眼就完了，四十张、四百张就不能这么查。实际写接口时，查询通常带着几个要求：只看某个本子、标题包含某个词、最新的排前面、一页只返回十条。

这一篇就在这些需求里把 `SELECT` 练熟。先补数据，之后的每条 SQL 都可以直接运行。

## 1. 补到十张便条

上一篇手动写 `id`，是为了看清主键。以后编号交给 MySQL 自增，省得每次先查最大编号。

新建 `E:\notes-service\sql\02_more_notes.sql`：

```sql
USE db_note;

ALTER TABLE note MODIFY id INT NOT NULL AUTO_INCREMENT;

INSERT INTO note (title, text, book, created_at) VALUES
  ('装饰器', '在不改函数源码的情况下增加计时功能', '学习', '2026-11-02 09:10:00'),
  ('生成器', '需要时再生成下一份数据', '学习', '2026-11-04 20:00:00'),
  ('进程与线程', '两种任务执行方式', '学习', '2026-11-06 21:30:00'),
  ('正则表达式', '按规则从文本中提取内容', '学习', '2026-11-08 10:00:00'),
  ('买菜', '鸡蛋、番茄、葱', '随手', '2026-11-09 18:20:00'),
  ('电影', NULL, '随手', '2026-11-10 22:00:00');

SELECT MIN(id) AS first_id, MAX(id) AS last_id, COUNT(*) AS total
FROM note;
```

在 MySQL 客户端执行：

```sql
SOURCE E:/notes-service/sql/02_more_notes.sql;
```

最后应看到最小编号 1、最大编号 10、总数 10。`ALTER TABLE ... MODIFY` 改的是列定义，原来的编号和数据不会清空。六条新数据没写 `id`，MySQL 从 5 接着发号。

最后一张“电影”的正文是 `NULL`，留着后面查空值。

## 2. WHERE：把条件写明白

查“随手”本里的便条：

```sql
SELECT id, title, text
FROM note
WHERE book = '随手';
```

只想要 9 号和 10 号，可以加 `IN`：

```sql
SELECT id, title, book
FROM note
WHERE book = '随手' AND id IN (9, 10);
```

`IN (9, 10)` 就是 `id = 9 OR id = 10`，但写起来短得多。多个 `AND`、`OR` 混在一条 SQL 里时，括号别省：

```sql
WHERE book = '随手' AND (id = 9 OR id = 10)
```

这行表达的是一个整体条件：本子必须是“随手”，编号再从 9 和 10 中选。没有括号，读者还得先回忆运算符优先级。

### 标题只记得一部分

```sql
SELECT id, title
FROM note
WHERE title LIKE '%线程%';
```

`%` 表示任意长度的一段内容。`'%线程%'` 是标题里包含“线程”；`'线程%'` 则要求以“线程”开头。另一个通配符 `_` 只匹配一个字符，本项目暂时用不到。

### 查某几天创建的便条

```sql
SELECT id, title, created_at
FROM note
WHERE created_at >= '2026-11-04 00:00:00'
  AND created_at < '2026-11-09 00:00:00';
```

时间范围推荐写成“包含起点，不包含终点”。这里能完整覆盖 4 日到 8 日。把终点写成 `2026-11-08 23:59:59` 看似直观，遇到带小数秒的时间就可能漏掉最后一段。

### 查没有正文的便条

```sql
SELECT id, title FROM note WHERE text IS NULL;
SELECT id, title FROM note WHERE text IS NOT NULL;
```

结果分别只有“电影”，以及其余九张。这里写 `text = NULL` 查不到东西。`NULL` 表示缺失，判断它要用 `IS NULL`，普通等号不负责这件事。

## 3. 最新三张和分页

```sql
SELECT id, title, created_at
FROM note
ORDER BY created_at DESC, id DESC
LIMIT 3;
```

应得到 10、9、8。`DESC` 表示倒序，时间上就是由新到旧。再加一个 `id DESC`，是为了处理创建时间相同的情况：时间一样时，编号大的排前面，顺序才不会忽前忽后。

第二页这样写：

```sql
SELECT id, title
FROM note
ORDER BY created_at DESC, id DESC
LIMIT 3 OFFSET 3;
```

`OFFSET 3` 是跳过前三行，所以应得到 7、6、5。每页 `page_size` 条，页码从 1 开始，偏移量就是 `(页码 - 1) * page_size`。

有一点很容易被忽略：`LIMIT 3` 只负责“取三行”，并不保证取哪三行。想要“最新三张”，`ORDER BY` 必须写。

## 4. 统计总数，再按本子分组

```sql
SELECT COUNT(*) AS total, COUNT(text) AS with_text
FROM note;
```

结果是 10 和 9。两个计数只差一列，含义却不同：

- `COUNT(*)` 数行数，十张便条就是十行；
- `COUNT(text)` 只数 `text` 不是 `NULL` 的行，所以“电影”不算。

按本子统计：

```sql
SELECT book, COUNT(*) AS total
FROM note
GROUP BY book
ORDER BY total DESC;
```

结果应为学习 8、随手 2。`GROUP BY book` 把相同本子名的行放到一起，再对每组执行一次 `COUNT(*)`。

只要便条数超过 3 的本子：

```sql
SELECT book, COUNT(*) AS total
FROM note
GROUP BY book
HAVING COUNT(*) > 3;
```

这里不能用 `WHERE COUNT(*) > 3`。`WHERE` 处理的是分组前的一行行原始数据，那时还没有“每组多少行”；`HAVING` 才是分组后的筛选。

两个一起用就很清楚了：

```sql
SELECT book, COUNT(*) AS total
FROM note
WHERE text IS NOT NULL
GROUP BY book
HAVING COUNT(*) > 3;
```

先排除空正文，再分组，再留下数量大于 3 的组。`WHERE` 和 `HAVING` 不是二选一，只是工作的阶段不同。

## 5. 一条查询看不懂，就按数据处理顺序拆

```sql
SELECT book, COUNT(*) AS total
FROM note
WHERE text IS NOT NULL
GROUP BY book
HAVING COUNT(*) > 3
ORDER BY total DESC
LIMIT 1;
```

别从 `SELECT` 开始逐字翻译。先看数据怎么流动：

1. `FROM note`：从便条表开始。
2. `WHERE text IS NOT NULL`：十行留下九行。
3. `GROUP BY book`：按本子分组，分别计数。
4. `HAVING COUNT(*) > 3`：数量不够的组去掉。
5. `SELECT`：生成最终结果列。
6. `ORDER BY ... LIMIT 1`：排序后取第一行。

这也解释了为什么 `SELECT` 里刚起的别名不能直接放进 `WHERE`：处理 `WHERE` 时，结果列还没生成。

调试长查询也可以倒着简化：先去掉 `LIMIT` 和 `ORDER BY`，再暂时去掉 `HAVING`，确认 `FROM + WHERE + GROUP BY` 的中间结果正确，再一层层加回来。比盯着整条 SQL 找错快得多。

到这里，查询已经够支撑一个简单的便条列表了。但 `book` 里的“学习”重复存了八次，改个名字要更新八行，这个结构该收拾了。下一篇把本子拆成单独的表，再用 Python 连接数据库：[JOIN 与 PyMySQL](/post/mysql-join-pymysql/)。
