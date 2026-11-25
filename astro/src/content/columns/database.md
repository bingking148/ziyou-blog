---
title: '数据库专栏'
category: '数据库'
order: 6
cover: /images/covers/mysql-ddl-dml-cover.jpg
description: '把便条从内存搬进 MySQL：建库建表、查询、两张表关联、PyMySQL 读写，再用 SQLAlchemy 把表写成类、接回 FastAPI 接口。五篇按顺序读。'
---

收录于[专栏](/columns/)。

起点是 [FastAPI 那一篇](/post/python-fastapi-api/)留下的警告：POST 进去的便条待在内存里，服务一关就没了。这一栏把这句话解决掉，顺带把数据这条路走全：表怎么建、怎么查、怎么拆，Python 怎么读写，最后接口怎么接上数据库。

| 篇目 | 内容 |
|---|---|
| [第 1 篇：建库建表，把便条搬进数据库](/post/mysql-ddl-dml/) | 库、表、类型与约束，INSERT / UPDATE / DELETE |
| [第 2 篇：查询，从一堆便条里挑出要的那张](/post/mysql-dql/) | WHERE、LIKE、排序分页、聚合分组、执行顺序 |
| [第 3 篇：两张表连起来查，再让 Python 接手](/post/mysql-join-pymysql/) | 内连接与外连接，PyMySQL 连接、游标、commit |
| [第 4 篇：把表写成类，增删改查不再拼 SQL](/post/sqlalchemy-orm/) | 模型、会话、relationship，sqlacodegen 反向生成 |
| [第 5 篇：接上 FastAPI，便条这次真的存住了](/post/fastapi-sqlalchemy/) | get_db 按请求发会话，重启验证数据还在 |

## 前置要求

需要 [Python 专栏](/categories/python/)里函数和面向对象两段，以及 [网络与并发段第 4 篇的 FastAPI](/post/python-fastapi-api/)。没装过 MySQL 的话，第 1 篇开头有安装说明。

五篇走完，便条住在磁盘上，接口重启不丢。接下来想把这套东西一条命令搬到别的电脑，看 [Docker 与 Git 专栏](/categories/docker与git/)。