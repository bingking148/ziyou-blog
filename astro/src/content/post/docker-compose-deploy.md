---
title: 'Docker 第 2 篇：一条命令，接口和数据库一起起来'
weight: 2
cover: /images/covers/docker-compose-deploy-cover.jpg
date: 2026-11-22T09:00:00+08:00
updatedDate: 2026-11-25T14:35:00+08:00
categories: ['人工智能', 'Docker与Git']
tags: ['Python', '编程基础', 'Docker', 'Docker Compose', 'FastAPI']
description: '给便条接口写一个 Dockerfile，再用 docker-compose.yml 把它和 MySQL 容器编在一起：容器名当地址、健康检查等就绪、一条 up -d 全起来。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇 MySQL 进了容器，接口还跑在宿主机的 Python 里：换电脑仍要装 Python、装四个包、起 uvicorn。这一篇把接口也打包，再让两个容器听同一条命令。

编排的工具是 Docker Compose：一个 `docker-compose.yml` 写清楚有几个服务、各用什么镜像、开什么端口、挂什么卷、谁等谁，然后 `docker compose up -d` 一把全起。

## 1. 给接口写一个 Dockerfile

镜像怎么造，写在一个叫 `Dockerfile` 的文件里，放在接口四个文件旁边：

```dockerfile
FROM python:3.12
WORKDIR /app
COPY database.py models.py schema.py main.py ./
RUN pip install fastapi uvicorn sqlalchemy pymysql cryptography
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

一行一步：

- `FROM` 选底包：一个装好 Python 3.12 的现成镜像，不用自己从操作系统装起。
- `WORKDIR` 容器里的工作目录，后面的命令都在 `/app` 下执行。
- `COPY` 把宿主机这四个文件抄进镜像。
- `RUN` 造镜像时执行一次：装依赖。`cryptography` 是 pymysql 连 MySQL 8 时要用的。
- `CMD` 容器启动时跑的命令。`--host 0.0.0.0` 是关键：听容器里所有网卡，端口映射才进得来；写 127.0.0.1 的话容器只跟自己说话，外面敲不开门。

单独造一次看看：

```bash
docker build -t note-app:1.0.0 .
```

`-t` 给镜像起名加标签，末尾的点表示「Dockerfile 在当前目录」。造完 `docker images` 能看到它。

## 2. 连接信息改成环境变量

容器里的接口连 MySQL，不能再写 `127.0.0.1`——容器里的 127.0.0.1 是容器自己。Compose 会给两个容器一个共用网络，网络里**容器名就是地址**。把 `database.py` 开头改成从环境变量读：

```python
import os

MYSQL_HOST = os.getenv('MYSQL_HOST', '127.0.0.1')
MYSQL_PORT = os.getenv('MYSQL_PORT', '3306')
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '123456')
MYSQL_DB = os.getenv('MYSQL_DB', 'db_note')

DATABASE_URL = (
    f'mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}'
    f'@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4'
)
```

不给环境变量时走默认值，本机直接跑还是连本机 MySQL；给了就连给的那个。同一份代码，两种环境，差别全在外面注入的变量里。

## 3. compose 文件：两个服务一张网

同目录写 `docker-compose.yml`：

```yaml
services:
  mysql-db:
    image: mysql:8.0.45
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: "123456"
      MYSQL_DATABASE: "db_note"
    ports:
      - "9999:3306"
    volumes:
      - note-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-p123456"]
      interval: 3s
      timeout: 3s
      retries: 10
      start_period: 5s
    networks:
      - app-net

  note-app:
    build: .
    image: note-app:1.0.0
    ports:
      - "8000:8000"
    environment:
      MYSQL_HOST: "mysql-db"
      MYSQL_PORT: "3306"
      MYSQL_USER: "root"
      MYSQL_PASSWORD: "123456"
      MYSQL_DB: "db_note"
    depends_on:
      mysql-db:
        condition: service_healthy
    networks:
      - app-net

volumes:
  note-data:

networks:
  app-net:
    driver: bridge
```

和上一篇那条 `run` 对照着读：`image`、`environment`、`ports`、`volumes` 就是 `-e`、`-p`、`-v` 的 YAML 写法。新东西有三处：

- `networks`：两个服务进同一张 `app-net` 网，于是 `MYSQL_HOST: "mysql-db"` 这个容器名能当地址用。注意端口是容器里的 3306，不是宿主机映射的 9999——容器之间走内部网络，不绕宿主机那道门。
- `healthcheck`：每 3 秒 ping 一次 MySQL，ping 通才算健康。上一篇说过「容器起了不等于服务好了」，这里把「好了」变成机器能判断的状态。
- `depends_on` 加 `condition: service_healthy`：note-app 等 mysql-db 健康了再启动。不写这个，接口会在 MySQL 还在初始化时扑上去连接，然后报错退出。

`build: .` 表示这个服务的镜像按当前目录的 Dockerfile 现造。

## 4. 一条命令起来

先把上一篇手动起的容器停掉删掉，端口和卷名都让给 compose：

```bash
docker stop note-db
docker rm note-db
docker compose up -d
```

第一次 `up` 会造 note-app 镜像、拉 mysql 镜像、建卷建网、按依赖顺序起两个容器。之后看：

```bash
docker compose ps
docker compose logs note-app
```

`ps` 里两个服务都 running，mysql-db 还带 healthy 标记。日志里能看到接口启动、SQLAlchemy 连上库。浏览器打开 <http://127.0.0.1:8000/notes>，十三张便条在——卷还是那个 `note-data`，上一篇搬进去的数据直接接上。

去 `/docs` POST 一张新便条，然后：

```bash
docker compose down
docker compose up -d
```

`down` 停掉并删除两个容器和网络，**卷不动**。再 `up`，新便条还在。改过代码或 Dockerfile 之后用 `docker compose up -d --build`，重造镜像再起。

> [!WARNING]
> `docker compose down -v` 连卷一起删，便条清空。除非你明确想从零开始，否则 down 后面不带 -v。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-compose" viewBox="0 0 680 380" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>同一张网里两个容器，名字当地址，卷在外面</title>
  <style>
    .diag-compose { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-compose { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-gray:#2a2d33; }
  </style>
  <rect x="30" y="14" width="620" height="200" rx="16" fill="none" stroke="var(--gray)" stroke-width="1.4" stroke-dasharray="6 5"/>
  <text x="52" y="38" font-size="14" fill="var(--gray)">网络 app-net</text>
  <rect x="60" y="56" width="250" height="120" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8"/>
  <text x="185" y="88" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">容器 note-app</text>
  <text x="185" y="118" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">uvicorn 听 8000</text>
  <text x="185" y="146" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">MYSQL_HOST=mysql-db</text>
  <rect x="370" y="56" width="250" height="120" rx="12" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="495" y="88" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">容器 mysql-db</text>
  <text x="495" y="118" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">MySQL 听 3306</text>
  <text x="495" y="146" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">healthcheck 通过才放行</text>
  <line x1="310" y1="116" x2="362" y2="116" stroke="var(--gray)" stroke-width="1.6"/><path d="M370,116 L362,111 L362,121 Z" fill="var(--gray)"/>
  <text x="340" y="100" font-size="13" text-anchor="middle" fill="var(--gray)">名字当地址</text>
  <rect x="60" y="250" width="250" height="70" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="185" y="276" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">宿主机 8000 → note-app</text>
  <text x="185" y="300" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">浏览器和 /docs 走这里</text>
  <line x1="185" y1="176" x2="185" y2="242" stroke="var(--gray)" stroke-width="1.6"/><path d="M185,250 L180,242 L190,242 Z" fill="var(--gray)"/>
  <rect x="370" y="250" width="250" height="70" rx="12" fill="var(--fill-gray)" stroke="currentColor" stroke-width="1.5"/>
  <text x="495" y="276" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">卷 note-data</text>
  <text x="495" y="300" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">down 不带 -v 就不动它</text>
  <line x1="495" y1="176" x2="495" y2="242" stroke="var(--gray)" stroke-width="1.6"/><path d="M495,250 L490,242 L500,242 Z" fill="var(--gray)"/>
  <text x="340" y="356" font-size="14" text-anchor="middle" fill="var(--gray)">docker compose up -d：按依赖顺序把这张图一次起齐</text>
</svg>
</figure>

## 5. 小项目：换一台电脑的口述清单

到这一步，「换一台电脑」要做的只剩：装 Docker Desktop；把这个目录（四个 py、Dockerfile、compose 文件）拷过去；`docker compose up -d`。数据要一起走的话，带上上一篇的 `note_full.sql`，起好后喂一次。没有安装器、没有 pip、没有改代码。

把这个目录完整跑一遍验收：`compose ps` 两个服务健康；`/notes` 有数据；POST 一张；`down` 再 `up`；新便条还在。

## 6. 课后小项目

**练习一：看等待生效（必做）**

`docker compose down` 之后 `up -d`，立刻连着敲几次 `docker compose ps`：头几次只有 mysql-db，健康状态从 starting 变 healthy；note-app 要等它 healthy 之后才出现在列表里。这就是 `condition: service_healthy` 在管事。

**练习二：改一个端口**

把 compose 里 note-app 的映射改成 `8001:8000`，`up -d` 之后浏览器该开哪个地址？容器里的 uvicorn 端口要不要改？想清楚再动手。

**练习三：跟日志**

`docker compose logs -f note-app` 跟着刷，去 `/docs` 点几次接口，看每次请求的 SQL 从日志里过。`Ctrl + C` 退出跟随，容器不受影响。

## 7. 小结

Dockerfile 把接口造成镜像，compose 把两个服务编进一张网：容器名当地址，健康检查加依赖条件解决启动顺序，卷在容器外面活数据。`up -d` 起、`down` 收、`--build` 重造，部署从一份安装步骤变成一条命令。

代码和配置现在都在一个目录里了。改坏一行怎么退回去？怎么两个人改同一个目录不打架？下一篇交给 Git：[Git 第 1 篇：给每次改动留一个能回去的版本](/post/git-basics/)。