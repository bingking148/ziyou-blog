---
title: 'Docker 第 1 篇：把 MySQL 装进容器'
weight: 1
cover: /images/covers/docker-basics-cover.jpg
date: 2026-11-20T09:00:00+08:00
updatedDate: 2026-11-25T14:35:00+08:00
categories: ['人工智能', 'Docker与Git']
tags: ['Python', '编程基础', 'Docker', 'MySQL', '容器']
description: '换一台电脑就要重装一遍 MySQL？这一篇装 Docker Desktop，用一条 docker run 起一个 MySQL 容器，把 db_note 整个搬进去，Python 只改一个端口。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇结束时，你手上有一个便条接口和一个 MySQL。它们都装在这台电脑上：MySQL 是安装器一步步装出来的，密码是你设的，库是你建的。换一台电脑，这套步骤要原样再来一遍，版本还可能不一样。

Docker 解决的就是「再来一遍」。它把程序和程序需要的环境一起打包成一个**镜像**，镜像跑起来的实例叫**容器**。同一份镜像，在这台电脑和那台电脑里跑出来的容器是一样的。这一篇先拿 MySQL 练手：不装安装器，一条命令起一个 MySQL。

## 1. 装 Docker Desktop

Windows 上去 Docker 官网下 Docker Desktop 安装器，双击装，中途它要启用 WSL2（Windows 里跑 Linux 的那层），按提示重启一次。装完启动 Docker Desktop，等托盘图标不再转圈，开一个 PowerShell 验证：

```bash
docker version
```

能打出 Client 和 Server 两段版本信息，就是通了。Server 那段是后台真正干活的引擎。下面所有命令在 PowerShell 里敲，和你前面用的终端是同一个；这些命令在 [Linux 虚拟机](/post/python-linux-vm/)里也一字不差。

## 2. 四个词先认下

- **镜像**：打包好的只读模板，相当于「MySQL 8.0.45 加它需要的全套环境」。从仓库拉下来就能用。
- **容器**：镜像跑起来的实例。一个镜像可以起很多个容器，互不相干。
- **卷**：容器外面的一块存储。容器删了卷还在，数据靠它活下来。
- **端口映射**：容器里的服务有自己的端口，映射一个宿主机端口出去，外面才敲得到门。

## 3. 拉镜像，起容器

```bash
docker pull mysql:8.0.45
docker run -d --name note-db -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=db_note -p 9999:3306 -v note-data:/var/lib/mysql mysql:8.0.45
```

`run` 这一行参数多，逐个拆：

- `-d` 后台跑，不占住你的终端。
- `--name note-db` 给容器起名，后面停它看它都用这个名字。
- `-e` 设环境变量。MySQL 镜像认这两个：root 密码、启动时自动建的库名。第一篇里手敲的 `CREATE DATABASE`，这里一个变量就办了。
- `-p 9999:3306` 把宿主机的 9999 映射到容器里的 3306。不用 3306 是因为你本机已经装着一个 MySQL，它占着 3306；两个 MySQL 各走各的门。
- `-v note-data:/var/lib/mysql` 把命名卷 `note-data` 挂到容器里 MySQL 存数据的目录。**数据落在卷里，不在容器里**，这一句是后面「删容器数据还在」的全部原因。

看它起来没有：

```bash
docker ps
docker logs note-db
```

`ps` 列出正在跑的容器。`logs` 看日志，MySQL 第一次启动要初始化数据目录，刷到 `ready for connections` 才算真的能连，容器起了不等于服务好了——这个区别下一篇还要用。

## 4. 进容器看一眼，把库搬进去

容器里自带 mysql 客户端，不用在本机装任何东西：

```bash
docker exec note-db mysql --version
docker exec -it note-db mysql -uroot -p123456 db_note
```

`exec` 是「在这个跑着的容器里再执行一条命令」。`-it` 给交互终端，第二条就是进容器里的 MySQL 命令行，`SHOW TABLES;` 一下：空的，库是新建的。

把本机那个 `db_note` 整个搬过来。先在本机 PowerShell 里导出（`mysqldump` 随 MySQL 安装器一起装好了）：

```bash
mysqldump -u root -p db_note > note_full.sql
```

再喂给容器里的 mysql：

```bash
Get-Content .\note_full.sql -Raw | docker exec -i note-db mysql -uroot -p123456 db_note
```

`-i` 让容器里的命令读你管道送进去的内容。喂完再 `exec -it` 进去 `SELECT * FROM note;`，十三张便条都在，本子表也在。导出加导入，就是数据库搬家的标准动作。

## 5. Python 只改一个端口

容器里的 MySQL 从宿主机看就是 `127.0.0.1:9999`。把连接信息里的端口改一下：

```python
conn = pymysql.connect(
    host='127.0.0.1',
    port=9999,          # 原来是 3306
    user='root',
    password='123456',
    database='db_note',
    charset='utf8mb4',
)
```

SQLAlchemy 那串地址同理，`3306` 改 `9999`。跑上一篇的接口，`/notes` 返回的还是那十三张——只是这次背后是容器里的 MySQL。本机那个 MySQL 可以停掉了，两个库内容一样，别连错门。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-docker-run" viewBox="0 0 680 360" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>镜像起容器，端口映射出去，数据落在卷里</title>
  <style>
    .diag-docker-run { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-docker-run { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-gray:#2a2d33; }
  </style>
  <rect x="40" y="16" width="200" height="80" rx="12" fill="var(--fill-gray)" stroke="currentColor" stroke-width="1.5"/>
  <text x="140" y="44" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">镜像 mysql:8.0.45</text>
  <text x="140" y="72" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">只读模板</text>
  <line x1="240" y1="56" x2="272" y2="56" stroke="var(--gray)" stroke-width="1.6"/><path d="M280,56 L272,51 L272,61 Z" fill="var(--gray)"/>
  <rect x="282" y="16" width="240" height="80" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8"/>
  <text x="402" y="44" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">容器 note-db</text>
  <text x="402" y="72" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">里面听着 3306</text>
  <rect x="40" y="140" width="200" height="80" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="140" y="168" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">宿主机 9999</text>
  <text x="140" y="196" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">Python 连这里</text>
  <line x1="240" y1="180" x2="330" y2="180" stroke="var(--gray)" stroke-width="1.6"/>
  <line x1="330" y1="180" x2="330" y2="104" stroke="var(--gray)" stroke-width="1.6"/><path d="M330,96 L325,104 L335,104 Z" fill="var(--gray)"/>
  <text x="352" y="150" font-size="14" fill="var(--gray)">-p 9999:3306</text>
  <rect x="282" y="240" width="240" height="80" rx="12" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="402" y="268" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">卷 note-data</text>
  <text x="402" y="296" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">数据住这里，容器删了还在</text>
  <line x1="402" y1="96" x2="402" y2="232" stroke="var(--gray)" stroke-width="1.6"/><path d="M402,240 L397,232 L407,232 Z" fill="var(--gray)"/>
  <text x="416" y="170" font-size="14" fill="var(--gray)">-v 挂载</text>
</svg>
</figure>

## 6. 停、起、删：数据在哪一边

```bash
docker stop note-db
docker ps -a
docker start note-db
```

`stop` 之后 `ps` 看不到它，`ps -a` 能看到停着的。`start` 原样起回来，便条一张不少。

再狠一点：停掉之后 `docker rm note-db` 把容器删了，然后用第 3 节那条 `run` 原样再起一个同名容器——卷还是那个 `note-data`，数据跟着回来。**容器是随时可扔的壳，卷才是数据。** 删镜像 `docker rmi mysql:8.0.45` 要先删光用它的容器。

> [!WARNING]
> `docker volume rm note-data` 和 `docker system prune --volumes` 删的是卷，便条这次真的没了。练习清理时先 `docker volume ls` 看一眼名字，带数据的卷不在清理范围里。

## 7. 小项目：一条命令的 MySQL

把第 3 节两条命令、第 4 节搬家两条、第 5 节改端口跑一遍。验收标准：`docker ps` 里有 note-db；接口 `/notes` 返回十三张；`docker stop` 之后接口连不上，`start` 之后又连得上。

## 8. 课后小项目

**练习一：两个互不相干的 MySQL（必做）**

用同一个镜像再起一个容器，名字 `note-db2`，端口 `9998:3306`，卷换一个新名字。进去 `SHOW TABLES;`，是空的。体会「一个镜像多个容器」。用完停掉删掉。

**练习二：日志里找就绪**

`docker logs note-db` 翻到 `ready for connections` 那行。回想 `docker ps` 显示 Up 的时候服务是不是已经好了。

**练习三：容器里的客户端**

`docker exec -it note-db mysql -uroot -p123456 db_note` 进去，把 2 号便条正文改一句，退出，回接口 `GET /notes/2` 看改动。确认你改的和接口读的是同一个库。

## 9. 小结

镜像是模板、容器是实例、卷是数据、端口映射是门。`pull` 拉模板，`run` 起实例，`exec` 进去做事，`logs` 看它说话，`stop/start/rm` 管壳的生灭。MySQL 从此是一条命令的事，搬家靠导出导入。

接口本身还跑在宿主机的 Python 里。下一篇把它也打包成镜像，两个容器一条命令一起起：[Docker 第 2 篇：一条命令，接口和数据库一起起来](/post/docker-compose-deploy/)。