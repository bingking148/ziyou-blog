---
title: 'Docker 与 Git 专栏'
category: 'Docker与Git'
order: 7
cover: /images/covers/docker-basics-cover.jpg
description: '把 MySQL 和便条接口装进容器、用 compose 一条命令起齐，再给项目目录接上 Git：每次改动留一个能回去的版本。三篇按顺序读。'
---

收录于[专栏](/columns/)。

[数据库专栏](/categories/数据库/)结束时，你手上有一个连 MySQL 的便条接口，但它和数据库都装在这台电脑上。这一栏解决两件事：换一台电脑怎么一样能跑（Docker），改坏了怎么退回去（Git）。

| 篇目 | 内容 |
|---|---|
| [第 1 篇：把 MySQL 装进容器](/post/docker-basics/) | 镜像、容器、卷、端口映射，一条 run 起 MySQL |
| [第 2 篇：一条命令，接口和数据库一起起来](/post/docker-compose-deploy/) | Dockerfile、compose、容器名当地址、健康检查 |
| [第 3 篇：给每次改动留一个能回去的版本](/post/git-basics/) | 三个区、提交与差异、分支与合并、.gitignore 与远程 |

## 前置要求

第 1、2 篇接着数据库专栏的便条项目做，先走完那边五篇。第 3 篇只需要一个项目目录，任何目录都行。Windows 上装 Docker Desktop 和 Git for Windows，步骤在各篇开头。

三篇走完，部署是一条命令，历史是一串快照。整条学习路到这里收口，回[专栏列表](/columns/)可以挑别的栏再走一遍。