---
title: 'MySQL 第 2 篇：查询，从一堆便条里挑出要的那张'
weight: 2
cover: /images/covers/mysql-dql-cover.jpg
date: 2026-11-15T09:00:00+08:00
updatedDate: 2026-11-25T14:35:00+08:00
categories: ['人工智能', '数据库']
tags: ['Python', '编程基础', 'MySQL', 'SQL']
description: '便条加到十张之后，SELECT 不再只看全表：WHERE 挑行、LIKE 找字、ORDER BY 排序、LIMIT 分页、GROUP BY 按本子统计，最后看清一条查询的执行顺序。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇结束时 `note` 表里是四张便条，`SELECT *` 一眼看全。这一篇先把它加到十张，再学怎么从里面挑：只要某一本的、只要带某个词的、只要最近三张、每本各有几张。

挑的动作全在 `SELECT` 一句里完成，零件一个个加。

## 1. 编号自己长，再补六张

上一篇的编号是手给的。便条会继续加，编号不该再自己数。把 `id` 列改成自增：

```sql
USE db_note;
ALTER TABLE note MODIFY id INT NOT NULL AUTO_INCREMENT;
```

`ALTER TABLE` 是改已经建好的表。改完之后插入可以不写 `id`，MySQL 接着最大的编号往下发。补六张，时间故意分散在十一月上旬，后面按时间挑要用：

```sql
INSERT INTO note (title, text, book, created_at) VALUES
    ('装饰器', '给函数挂一个秒表', '学习', '2026-11-02 09:10:00'),
    ('生成器', '大文件分批次读', '学习', '2026-11-04 20:00:00'),
    ('进程与线程', '同时干几件事，各干各的', '学习', '2026-11-06 21:30:00'),
    ('正则', '从一堆文字里捞出电话号码', '学习', '2026-11-08 10:00:00'),
    ('买菜', '鸡蛋、番茄、葱', '随手', '2026-11-09 18:20:00'),
    ('电影', NULL, '随手', '2026-11-10 22:00:00');
```

注意最后一行：`text` 给了 `NULL`。有的便条只有标题，正文空着，这种情况表里允许，查询时也要能认出来。现在 `SELECT * FROM note;` 是十行，编号 1 到 10。

## 2. 挑行：WHERE

只要「学习」这本的：

```sql
SELECT * FROM note WHERE book = '学习';
```

只要正文里带「线程」两个字的。`LIKE` 是模糊匹配，`%` 代表任意一段字符：

```sql
SELECT * FROM note WHERE title LIKE '%线程%';
```

`'华为%'` 是以华为开头，`'%小黑瓶'` 是以小黑瓶结尾，`'%线程%'` 是包含。只命中 7 号那一张。

只要十一月 4 号到 8 号写的，两种写法等价：

```sql
SELECT * FROM note
WHERE created_at BETWEEN '2026-11-04 00:00:00' AND '2026-11-08 23:59:59';

SELECT * FROM note
WHERE created_at >= '2026-11-04 00:00:00'
  AND created_at <= '2026-11-08 23:59:59';
```

`BETWEEN` 两头都含。条件可以叠：`AND` 是都要满足，`OR` 是满足一个就行。只要「随手」本里编号 9 或 10 的：

```sql
SELECT * FROM note WHERE book = '随手' AND id IN (9, 10);
```

`IN (9, 10)` 等于 `id = 9 OR id = 10`，列表长的时候省很多字。

最后认空值。空不是空字符串，也不是 0，是「这里没给过值」，所以不能用 `=` 比：

```sql
SELECT * FROM note WHERE text IS NULL;
SELECT * FROM note WHERE text IS NOT NULL;
```

第一句只返回 10 号「电影」。写成 `text = NULL` 一行都查不到，这是新手最常踩的一个坑。

## 3. 排序和分页：ORDER BY、LIMIT

最近的三张排前面：

```sql
SELECT * FROM note ORDER BY created_at DESC LIMIT 3;
```

`ORDER BY` 排序，`DESC` 从大到小（时间上就是从新到旧），`ASC` 反过来，不写默认 `ASC`。`LIMIT 3` 只取排完的前三行：10、9、8。

`LIMIT` 还能带一个起点：`LIMIT 3, 3` 是跳过前 3 行、再取 3 行，也就是第 2 页、每页 3 条。第 3 页就是 `LIMIT 6, 3`。规律是 `LIMIT (页码 - 1) * 每页条数, 每页条数`。接口里的分页就是这么来的。

排序可以叠条件：`ORDER BY book, created_at DESC` 先按本子排，同一本里再按时间从新到旧。

## 4. 数一数：聚合与分组

整表有几个数：

```sql
SELECT COUNT(*) AS cnt FROM note;
SELECT COUNT(text) AS cnt_with_text FROM note;
SELECT MAX(created_at) AS newest FROM note;
```

`COUNT(*)` 数行数，10。`COUNT(text)` 只数 `text` 非空的行，9——**聚合函数不理 NULL**。`MAX`、`MIN`、`AVG`、`SUM` 是同一族，对数值列求最大最小平均和。`AS` 给结果列起个名字，返回里好看。

更有用的是按本子各数各的：

```sql
SELECT book, COUNT(*) AS cnt
FROM note
GROUP BY book;
```

`GROUP BY book` 先把十行按本子分成两堆，再对每一堆各算一次 `COUNT`。结果是两行：学习 8、随手 2。

分完组还想再筛，用 `HAVING`，它筛的是组，不是行：

```sql
SELECT book, COUNT(*) AS cnt
FROM note
GROUP BY book
HAVING cnt > 3;
```

只剩「学习」那一组。`WHERE` 在分组前挑行，`HAVING` 在分组后挑组，位置不能换。

还有一个小零件 `DISTINCT`，去掉结果里重复的值：

```sql
SELECT DISTINCT book FROM note;
```

十行折成两行：学习、随手。想知道「一共有几本」，就数这个结果。

## 5. 一条查询是按什么顺序跑的

把零件全装上看一句：

```sql
SELECT book, COUNT(*) AS cnt
FROM note
WHERE text IS NOT NULL
GROUP BY book
HAVING cnt > 3
ORDER BY cnt DESC
LIMIT 1;
```

读起来是「从 note 里，正文非空的，按本子分组，留下超过 3 张的本子，按张数从多到少，取第一名」。执行的顺序和写的顺序不完全一样，数据是一路变少的：

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-mysql-pipeline" viewBox="0 0 680 400" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>一条查询里数据从十行一路筛到一行</title>
  <style>
    .diag-mysql-pipeline { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-mysql-pipeline { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; }
  </style>
  <rect x="60" y="14" width="440" height="52" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="280" y="40" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">FROM note：整表 10 行</text>
  <text x="560" y="40" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">10 行</text>
  <line x1="280" y1="66" x2="280" y2="80" stroke="var(--gray)" stroke-width="1.6"/><path d="M280,88 L275,80 L285,80 Z" fill="var(--gray)"/>
  <rect x="60" y="90" width="440" height="52" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="280" y="116" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">WHERE text IS NOT NULL：去掉电影</text>
  <text x="560" y="116" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">9 行</text>
  <line x1="280" y1="142" x2="280" y2="156" stroke="var(--gray)" stroke-width="1.6"/><path d="M280,164 L275,156 L285,156 Z" fill="var(--gray)"/>
  <rect x="60" y="166" width="440" height="52" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="280" y="192" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">GROUP BY book：折成两堆再 COUNT</text>
  <text x="560" y="192" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">2 行</text>
  <line x1="280" y1="218" x2="280" y2="232" stroke="var(--gray)" stroke-width="1.6"/><path d="M280,240 L275,232 L285,232 Z" fill="var(--gray)"/>
  <rect x="60" y="242" width="440" height="52" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="280" y="268" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">HAVING cnt &gt; 3：随手只有 2 张，出局</text>
  <text x="560" y="268" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">1 行</text>
  <line x1="280" y1="294" x2="280" y2="308" stroke="var(--gray)" stroke-width="1.6"/><path d="M280,316 L275,308 L285,308 Z" fill="var(--gray)"/>
  <rect x="60" y="318" width="440" height="52" rx="12" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="280" y="344" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">ORDER BY cnt DESC，LIMIT 1</text>
  <text x="560" y="344" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">1 行</text>
</svg>
</figure>

`FROM` 拿全表，`WHERE` 砍行，`GROUP BY` 把行折成组，`HAVING` 砍组，`ORDER BY` 排队，`LIMIT` 截断。写查询时按这个顺序想需求，就不容易把 `WHERE` 和 `HAVING` 放错位置。

## 6. 小项目：把十张便条问一遍

按顺序执行，每句看完结果再下一句：

```sql
USE db_note;
SELECT title, book FROM note WHERE book = '随手';
SELECT * FROM note WHERE title LIKE '%线程%';
SELECT * FROM note WHERE text IS NULL;
SELECT * FROM note ORDER BY created_at DESC LIMIT 3;
SELECT * FROM note ORDER BY created_at LIMIT 3, 3;
SELECT book, COUNT(*) AS cnt FROM note GROUP BY book;
SELECT book, COUNT(*) AS cnt FROM note GROUP BY book HAVING cnt > 3;
SELECT DISTINCT book FROM note;
```

第二句返回 9、10 两行；第三句只有 7 号；第四句只有 10 号；第五句是 10、9、8；第六句是 7、6、5；第七句两行 8 和 2；第八句一行学习；第九句两个本子名。

## 7. 课后小项目

**练习一：第二新的便条（必做）**

按时间从新到旧排，跳过第 1 行取 1 行。应该是 9 号「买菜」。

**练习二：每本最新的一张**

先只查「学习」本，按时间倒序取 1 张。再换「随手」本做一次。体会 `WHERE` 和 `LIMIT` 各管哪一段。

**练习三：数空正文**

用 `COUNT(*)` 和 `COUNT(text)` 各数一次整表，两个数差几？差的那几行是哪几张？用 `IS NULL` 把它们找出来对一下。

## 8. 小结

`WHERE` 挑行，`LIKE` 找字，`BETWEEN` 和 `IN` 圈范围，`IS NULL` 认空；`ORDER BY` 排队、`LIMIT` 截断和分页；`COUNT` 一族数数，`GROUP BY` 分堆、`HAVING` 筛堆。一句查询就是这些零件按固定顺序拼起来。

现在本子名是写在每张便条上的一个字符串。十张还行，一百张里要把「学习」改名叫「功课」，就得改一百行。下一篇把本子单独成一张表，再让 Python 接手读写：[MySQL 第 3 篇：两张表连起来查，再让 Python 接手](/post/mysql-join-pymysql/)。