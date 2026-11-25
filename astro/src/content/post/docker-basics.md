---
title: 'Docker 第 1 篇：把 MySQL 装进容器'
weight: 1
cover: /images/covers/docker-basics-cover.jpg
date: 2026-11-20T09:00:00+08:00
updatedDate: 2026-11-25T16:09:02+08:00
categories: ['人工智能', 'Docker与Git']
tags: ['Python', '编程基础', 'Docker', 'MySQL', '容器']
description: '用 Docker Desktop 启动 MySQL，理解镜像、容器、卷和端口映射，把现有 db_note 导入容器，再让 FastAPI 改连新端口。'
math: false
mermaid: false
comments: true
toc: true
---

现在换一台电脑跑便条项目，最费时间的不是复制代码，而是重装 MySQL、建库、导数据。先把数据库搬进 Docker，FastAPI 暂时不动。迁移结束后，应用只需要改一个端口。

这里使用 `mysql:8.0.45`，练习密码统一写成 `123456`。真实项目不要把这个密码拿去部署。

## 1. 先确认 Docker 能工作

安装 Docker Desktop，按安装提示启用 WSL 2。启动后等引擎状态变成运行中，再打开 PowerShell：

```powershell
docker version
```

结果里应同时有 **Client** 和 **Server**。只有 Client、Server 报连接错误，通常是 Docker Desktop 还没启动好，先处理这个，不要急着拉 MySQL。

接着拉镜像：

```powershell
docker pull mysql:8.0.45
```

镜像里装着 MySQL 及其运行环境。镜像本身不运行，也不会保存你的便条；接下来要从它启动容器。

## 2. 启动容器，数据放进命名卷

```powershell
docker run -d --name note-db -p 9999:3306 -e MYSQL_ROOT_PASSWORD=123456 -e MYSQL_DATABASE=db_note -v note-data:/var/lib/mysql mysql:8.0.45
```

这条命令有点长，但每项都有用：

| 参数 | 作用 |
|---|---|
| `-d` | 后台运行 |
| `--name note-db` | 给容器起名字，后续管理不用记容器 ID |
| `-p 9999:3306` | 宿主机 9999 转发到容器 3306 |
| `-e MYSQL_ROOT_PASSWORD=...` | 首次初始化时设置 root 密码 |
| `-e MYSQL_DATABASE=db_note` | 首次初始化时创建数据库 |
| `-v note-data:/var/lib/mysql` | 用 `note-data` 卷保存 MySQL 数据文件 |

本机安装的 MySQL 已占用 3306，所以宿主机改用 9999。端口顺序永远是 **宿主机:容器**，容器里的 MySQL 仍然监听 3306，没有被改成 9999。

命令返回一串容器 ID，只说明容器创建了，不代表数据库已经初始化完。继续查：

```powershell
docker ps --filter "name=note-db"
docker logs note-db 2>&1 | Select-String "ready for connections"
```

看到 `ready for connections` 后再连接：

```powershell
docker exec -it note-db mysql -u root -p db_note
```

输入 `123456`。进入 `mysql>` 后执行：

```sql
SELECT DATABASE();
SHOW TABLES;
```

当前库应是 `db_note`，此时还没有表。输入 `exit;` 退出客户端，容器会继续运行。

## 3. 把原来的 db_note 搬进来

现在有两个数据库：宿主机 3306 里的旧库有数据，容器 9999 里的新库是空的。先把旧库导出。

在能运行 `mysqldump` 的 PowerShell 中执行：

```powershell
Set-Location E:\notes-service
mysqldump -u root -p --default-character-set=utf8mb4 --result-file=note_full.sql db_note
```

这里输入的是**原宿主机 MySQL** 的密码，不一定是容器的 `123456`。

使用 `--result-file` 而不是 `mysqldump ... > note_full.sql`，是为了避开不同 PowerShell 版本对原生命令输出重定向的编码差异。备份文件不该因为这种细节变成乱码。

导入容器：

```powershell
Get-Content -LiteralPath .\note_full.sql -Raw -Encoding UTF8 | docker exec -i note-db mysql -u root -p123456 db_note
```

`-i` 必须保留，它让容器里的 `mysql` 能读取 PowerShell 管道送来的 SQL。这里的 `-p123456` 只用于本地练习；密码写进命令会留在历史记录里，正式环境不要这么做。

再次进入容器数据库检查：

```powershell
docker exec -it note-db mysql -u root -p db_note
```

```sql
SHOW TABLES;
SELECT COUNT(*) FROM note;
SELECT COUNT(*) FROM book;
SHOW CREATE TABLE note;
```

`book` 和 `note` 都应该在，行数与导出前一致，`SHOW CREATE TABLE note` 里还应看到外键。只核对表名不够，数据和约束也得一起过来。

如果找不到 `mysqldump`，检查本机 MySQL 的 `bin` 目录是否加入 `PATH`。它通常和之前使用的 `mysql.exe` 在同一个目录。

## 4. FastAPI 改连 9999

打开 `database.py`，把 `URL.create()` 里的：

```python
port=3306,
```

改成：

```python
port=9999,
```

主机仍是 `127.0.0.1`，因为 FastAPI 还运行在宿主机。容器 root 密码沿用 `123456` 的话，其他配置不用改。上一篇的 `note_db.py` 如果还要用，也把 `DB_CONFIG['port']` 改成 9999。

重启 Uvicorn，打开 <http://127.0.0.1:8000/notes>。数据应该和迁移前一样。

这里别再回旧 MySQL 改数据。现在两份 `db_note` 互相同步不了，FastAPI 读写的是 9999 后面的容器库。

## 5. 删除容器试一次，数据不能跟着没

先停止再启动：

```powershell
docker stop note-db
docker start note-db
```

停止期间接口会报数据库连接错误；等 MySQL 重新就绪后应恢复。

再做一个更有说服力的测试：

```powershell
docker stop note-db
docker rm note-db
```

然后重新执行第 2 节那条完整的 `docker run`。名字、端口、镜像都不变，尤其是 `-v note-data:/var/lib/mysql` 不能换。等数据库就绪后再查，便条仍在。

这说明容器和数据不是一回事：容器删了可以重建，数据留在 `note-data` 卷里。镜像负责提供 MySQL 程序，容器负责运行，卷负责保存数据。

还有一个坑：卷已经有数据后，再改 `MYSQL_ROOT_PASSWORD` 或 `MYSQL_DATABASE`，不会自动重置现有账户和数据库。这两个变量主要服务于空数据目录的首次初始化。

> [!WARNING]
> `docker rm note-db` 不删卷；`docker volume rm note-data` 才删数据。以后看到 `docker compose down -v`、`prune --volumes` 也要先停一下，别把“清理空间”做成“清理数据库”。

如果启动时提示端口被占，把宿主机端口换成 9998，例如 `-p 9998:3306`，同时把 `database.py` 改成 9998。若提示容器名冲突，用 `docker ps -a` 找旧的 `note-db`；已停止的容器也会占用名字。

MySQL 已经容器化了，但这条 `docker run` 参数不少，FastAPI 还要手动启动。下一篇把两个服务写进一份 Compose 文件，一次启动：[Docker Compose](/post/docker-compose-deploy/)。
