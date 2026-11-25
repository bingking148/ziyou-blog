---
title: 'Docker 第 2 篇：一条命令，接口和数据库一起起来'
weight: 2
cover: /images/covers/docker-compose-deploy-cover.jpg
date: 2026-11-22T09:00:00+08:00
lastmod: 2026-11-25T16:09:02+08:00
categories: ['人工智能', 'Docker与Git']
tags: ['Python', '编程基础', 'Docker', 'Docker Compose', 'FastAPI']
description: '写 Dockerfile 和 requirements.txt，把连接配置改为环境变量，再用 Compose 管理 FastAPI、MySQL、健康检查和旧数据卷。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇只解决了 MySQL。FastAPI 仍要用本机 Python 启动，数据库还要先 `docker run`，换台电脑照样得翻笔记。

现在把接口也做成镜像，再用 Compose 把两个服务写在一起。最后启动项目只需要：

```powershell
docker compose up -d --build
```

不过先把边界说清楚：这些文件能重建程序环境，不能自动复制旧电脑里的数据。数据仍由 `note-data` 卷或 `note_full.sql` 备份负责。

## 1. 数据库地址不能再写死

容器里的 FastAPI 如果连接 `127.0.0.1`，找到的是它自己，不是 MySQL。Compose 会把同一项目的服务放进同一个默认网络，服务名 `mysql-db` 就可以直接当主机名。

把 `database.py` 改成：

```python
import os

from sqlalchemy import URL, create_engine
from sqlalchemy.orm import sessionmaker


DATABASE_URL = URL.create(
    'mysql+pymysql',
    username=os.getenv('MYSQL_USER', 'root'),
    password=os.getenv('MYSQL_PASSWORD', '123456'),
    host=os.getenv('MYSQL_HOST', '127.0.0.1'),
    port=int(os.getenv('MYSQL_PORT', '9999')),
    database=os.getenv('MYSQL_DB', 'db_note'),
    query={'charset': 'utf8mb4'},
)

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
```

默认值用于宿主机直接运行，仍连上一篇的 `127.0.0.1:9999`。Compose 启动时会传入 `MYSQL_HOST=mysql-db`、`MYSQL_PORT=3306`，不用为了两种环境维护两份代码。

## 2. 给 FastAPI 写 Dockerfile

新建 `requirements.txt`：

```text
fastapi
uvicorn[standard]
sqlalchemy>=2.0,<3.0
pymysql
cryptography
```

再新建没有扩展名的 `Dockerfile`：

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY database.py models.py schema.py main.py ./

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

先复制依赖清单、安装依赖，再复制代码，是为了利用构建缓存。以后只改 `main.py`，不必把 PyMySQL、FastAPI 全部重装一遍。

`--host 0.0.0.0` 不能改成 `127.0.0.1`。Uvicorn 必须监听容器网卡，宿主机的端口映射才连得进来。

`PYTHONUNBUFFERED=1` 让日志及时输出，否则 `docker compose logs` 可能看不到你刚打印的内容。

再写 `.dockerignore`：

```text
.git
.venv
__pycache__/
*.pyc
.env
note_full.sql
```

虚拟环境、密码文件和数据库备份都不该被打进镜像。

可以先单独构建一次，确认依赖和文件名没错：

```powershell
Set-Location E:\notes-service
docker build -t note-app:1.0.0 .
```

末尾的 `.` 是当前目录，别漏。

## 3. 密码放 .env，模板可以公开

新建 `.env`：

```text
MYSQL_ROOT_PASSWORD=123456
```

这个密码必须与上一篇 `note-data` 卷里的实际 root 密码一致。卷已经初始化过，这一次不是重设密码，而是登录旧数据库。

再建 `.env.example`：

```text
MYSQL_ROOT_PASSWORD=replace-with-your-local-password
```

Compose 会读取 `.env`，镜像不会包含它。下一篇用 Git 管理项目时，忽略 `.env`，提交 `.env.example`。

## 4. 把两个服务写进 docker-compose.yml

```yaml
services:
  mysql-db:
    image: mysql:8.0.45
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: db_note
    ports:
      - "9999:3306"
    volumes:
      - note-data:/var/lib/mysql
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h localhost -uroot -p$$MYSQL_ROOT_PASSWORD --silent"]
      interval: 3s
      timeout: 3s
      retries: 20
      start_period: 20s

  note-app:
    build: .
    image: note-app:1.0.0
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      MYSQL_HOST: mysql-db
      MYSQL_PORT: "3306"
      MYSQL_USER: root
      MYSQL_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DB: db_note
    depends_on:
      mysql-db:
        condition: service_healthy

volumes:
  note-data:
    name: note-data
```

这份文件里有三个地方值得逐项核对，错了往往不会立刻报语法错误。

**`MYSQL_HOST` 必须等于服务名。**这里是 `mysql-db`，不是容器 ID，也不是 `127.0.0.1`。容器之间走 `mysql-db:3306`，不经过宿主机的 9999。

**FastAPI 要等数据库健康。**容器 running 不等于 MySQL 初始化完成。`mysqladmin ping` 做健康检查，`condition: service_healthy` 让接口在数据库能响应后再启动。健康检查里的 `$$` 是为了把 `$MYSQL_ROOT_PASSWORD` 留给容器 shell 解析，不要让 Compose 提前替换掉。

**实际卷名必须固定为 `note-data`。**Compose 默认会给卷加项目名前缀，例如 `notes-service_note-data`。如果不写最后的 `name: note-data`，它会新建一个空卷，旧便条看起来就像“丢了”。加上这两行，才能接回上一篇手动创建的卷。

最终目录应该是：

```text
E:\notes-service\
├── .dockerignore
├── .env
├── .env.example
├── database.py
├── models.py
├── schema.py
├── main.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── note_full.sql
```

## 5. 从手动容器切到 Compose

先检查配置：

```powershell
docker compose config --quiet
```

没有报错再停掉上一篇的手动容器。只删容器，不删卷：

```powershell
docker stop note-db
docker rm note-db
docker compose up -d --build
```

检查：

```powershell
docker compose ps
docker compose logs --tail=50 note-app
```

数据库应先显示 `healthy`，然后接口启动。打开 <http://127.0.0.1:8000/notes>，应该还是原来的数据。再到 <http://127.0.0.1:8000/docs> 新增一张便条，记下编号。

接着停掉整个项目再启动：

```powershell
docker compose down
docker compose up -d
```

重新查询刚才的编号，便条仍在。`down` 会删除本项目的容器和默认网络，但不会删除命名卷。**不要顺手加 `-v`，那个参数会删卷。**

以后改了 Python 或依赖，执行：

```powershell
docker compose up -d --build
```

镜像里的代码不会因为宿主机文件变化而自动更新。只改 `.env` 也要重新创建服务，正在运行的进程不会自己重读配置。

如果接口一直连接失败，先看 `docker compose ps` 中 MySQL 是否 healthy，再看 `docker compose logs mysql-db`。如果服务正常却查不到旧数据，运行 `docker volume inspect note-data`，先确认用的是不是旧卷。

换电脑时，代码和配置可以直接复制；旧便条要另外带上 `note_full.sql`，在新数据库健康后导入：

```powershell
Get-Content -LiteralPath .\note_full.sql -Raw -Encoding UTF8 | docker compose exec -T mysql-db mysql -u root -p123456 db_note
```

密码以新机器的 `.env` 为准。没复制备份却看到一个空库，不是 Compose 把数据弄丢了，而是数据根本没有随代码过来。

现在项目已经有一组值得保存的文件了。下一篇接入 Git，记录每次修改，并试一次撤销提交和分支开发：[Git 版本管理](/post/git-basics/)。
