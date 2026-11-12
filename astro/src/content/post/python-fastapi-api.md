---
title: 'Python 第 20 篇：FastAPI，把函数变成别人能调用的接口'
weight: 20
cover: /images/covers/python-fastapi-api-cover.jpg
date: 2026-11-10T09:00:00+08:00
updatedDate: 2026-11-10T09:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', 'FastAPI', 'API']
description: '用 FastAPI 把一个 Python 函数挂到 HTTP 上：路径参数、查询参数、POST 的 JSON 请求体，以及自动生成的 /docs。最后做一个能跑的问答接口。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇的协程还是你自己在脚本里 `asyncio.run()`。真要给别人用，就得有一个地址：对方发来 HTTP 请求，你的函数跑完，再把 JSON 送回去。

FastAPI 就是干这个的。它是一个做 API 的 Web 框架，站在 Starlette 和 Pydantic 上面，吃 Python 的类型标注，也吃上一篇的 `async`。文档在 <https://fastapi.tiangolo.com> 。

这一篇的小项目是一个能问一句、答一句的接口。中间把路径、查询参数、请求体各走一遍，不堆很多互不相干的文件。

## 1. 一次调用长什么样

对方要告诉你三件事：去哪个地址、请求头里带什么、正文是什么。FastAPI 收到之后，按你写的路径和方法（GET 还是 POST）找到函数，把结果再送回去。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-fastapi-request" viewBox="0 0 680 360" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>请求地址、header、body 进 FastAPI，再按 GET 或 POST 给出响应</title>
  <style>
    .diag-py-fastapi-request { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-fastapi-request { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-gray:#2a2d33; }
  </style>
  <rect x="28" y="36" width="250" height="250" rx="16" fill="var(--fill-gray)" stroke="var(--gray)" stroke-width="1.6"/>
  <text x="153" y="64" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">调用方</text>
  <rect x="48" y="88" width="210" height="44" rx="10" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="153" y="110" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">请求地址 URL</text>
  <rect x="48" y="144" width="210" height="44" rx="10" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.6"/>
  <text x="153" y="166" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">header</text>
  <rect x="48" y="200" width="210" height="56" rx="10" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.6"/>
  <text x="153" y="220" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">body</text>
  <text x="153" y="240" font-size="13" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">JSON 正文</text>
  <line x1="278" y1="168" x2="348" y2="168" stroke="var(--red)" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M356,168 L346,163 L346,173 Z" fill="var(--red)"/>
  <text x="316" y="148" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--red)">HTTP</text>
  <rect x="364" y="70" width="280" height="180" rx="16" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8"/>
  <text x="504" y="108" font-size="22" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">FastAPI</text>
  <text x="504" y="146" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">GET 请求</text>
  <text x="504" y="176" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">POST 请求</text>
  <text x="504" y="214" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">按路径找到函数</text>
  <text x="504" y="286" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">返回 JSON</text>
</svg>
</figure>

请求地址像 `https://api.deepseek.com/chat/completions`。header 里常见两行：`Content-Type: application/json`，以及 `Authorization: Bearer ...` 这种凭证。body 才是真正要处理的 JSON，比如模型名和 messages。GET 多半把条件放在地址里；POST 把要提交的数据放在 body 里。

浏览器或别的程序，就是靠这两种方法来调用你的接口。

## 2. 最小的一个接口

装两个包。FastAPI 是框架，Uvicorn 是把它跑起来的 ASGI 服务器。

```bash
pip install fastapi uvicorn
```

新建 `main.py`：

```python
from fastapi import FastAPI

app = FastAPI(title="第一个服务接口 API")


@app.get("/")
def read_root():
    return {"message": "Hello World"}
```

`@app.get("/")` 是装饰器：有人用 GET 访问根路径时，就调用这个函数。返回字典，FastAPI 会把它变成 JSON。

在 `main.py` 所在目录启动：

```bash
uvicorn main:app --reload
```

这行拆开是：`main` 是 `main.py` 这个模块，`app` 是里面的 `app = FastAPI()`，`--reload` 表示你改了代码就自动重启，只在开发时用。

浏览器打开：

- <http://127.0.0.1:8000/> 看到 `{"message":"Hello World"}`
- <http://127.0.0.1:8000/docs> 是自动生成的交互式文档，可以直接在页面上试接口

停服务用 `Ctrl + C`。

> [!NOTE]
> 函数写成普通 `def` 也可以。里面没有 `await` 时，FastAPI 会把它丢进线程池，避免一个慢函数堵住所有请求。要等网络、等数据库，就写成 `async def`，和上一篇一样。

## 3. 路径参数：地址里的一段

`/items/1001` 这种，`1001` 是路径的一部分，不是问号后面的附加条件。

```python
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}
```

类型写成 `int`，对方要是传来 `abc`，FastAPI 直接回 422，不会进你的函数。这是类型标注在干活，不是你手写的 if。

顺序有讲究。固定路径要写在带参数的路径前面，不然 `me` 会被当成某个 `user_id`：

```python
@app.get("/users/me")
async def read_user_me():
    return {"user_id": "the current user"}


@app.get("/users/{user_id}")
async def read_user(user_id: str):
    return {"user_id": user_id}
```

## 4. 查询参数：问号后面的条件

`/items/1001?q=苹果` 里，`q` 是查询参数。函数里多写一个带默认值的参数即可。

```python
@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
```

不传 `q`，就是 `None`。传了，就出现在返回的 JSON 里。

再看一个「从第几个开始、要几条」的切法。数据先放在内存里，真项目里这里会去问数据库：

```python
users = {
    "u1": "Foo",
    "u2": "Bar",
    "u3": "Baz",
    "u4": "Qux",
}


@app.get("/users")
async def read_users(start: int = 0, limit: int = 2):
    keys = list(users)[start:start + limit]
    return [{"user_id": key, "user_name": users[key]} for key in keys]
```

访问 `/users?start=1&limit=2`，拿到的是从第二条开始的两条。

## 5. POST：把 JSON 交进来

创建一条记录，用 POST，数据在 body 里。用 Pydantic 的 `BaseModel` 声明字段，FastAPI 会按这个形状检查对方传来的 JSON。

```python
from pydantic import BaseModel


class Item(BaseModel):
    name: str
    price: float
    description: str | None = None


items: list[dict] = []


@app.post("/items")
async def create_item(item: Item):
    data = item.model_dump()
    items.append(data)
    return data
```

缺 `name`、或者 `price` 不是数，请求会被拒绝。`description` 可以不传。

在 `/docs` 里选这个接口，填 JSON，就能看到返回。也可以用 curl：

```bash
curl -X POST http://127.0.0.1:8000/items \
  -H "Content-Type: application/json" \
  -d '{"name":"笔记本","price":19.9}'
```

## 6. 小项目：一个能问一句的接口

把上面三块串成一个文件，仍然叫 `main.py`。根路径打个招呼；用路径看一条笔记；用 POST 提一个问题。这里不接真模型，函数把问题原样组织成一句回复，保证你没配 API Key 也能跑通。以后把 `answer()` 换成真正的调用即可，路径不用改。

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="学习助手接口", version="0.1.0")

notes = {
    1: "协程遇到 await 就让出控制权",
    2: "create_task 之后要 gather，不然主协程一走任务就没了",
}


class Question(BaseModel):
    text: str


@app.get("/")
async def root():
    return {"message": "欢迎使用学习助手"}


@app.get("/notes/{note_id}")
async def read_note(note_id: int, short: bool = False):
    text = notes.get(note_id)
    if text is None:
        return {"note_id": note_id, "text": None}
    if short:
        return {"note_id": note_id, "text": text[:8]}
    return {"note_id": note_id, "text": text}


@app.post("/ask")
async def ask(question: Question):
    reply = f"收到问题：{question.text}。先查笔记，再决定要不要调用模型。"
    return {"content": reply}
```

启动：

```bash
uvicorn main:app --reload
```

然后试三条：

- <http://127.0.0.1:8000/>
- <http://127.0.0.1:8000/notes/1?short=true>
- <http://127.0.0.1:8000/docs> 里调用 `/ask`，body 写 `{"text":"协程和线程差在哪"}`

`short` 是查询参数。`note_id` 是路径参数。`text` 在 POST 的 body 里。三种位置，这一份代码都碰到了。

> [!WARNING]
> 这个 `items` / `notes` 存在进程内存里。服务一关，数据就没了。它只用来把接口跑通，不是数据库。

路由变多以后，课程里的做法是按资源拆文件：用户、商品各自一个 `APIRouter`，再在主文件里 `app.include_router(...)`。前缀写成 `/users`，这个文件里的路径就都挂在 `/users` 下面。一篇先把一个文件跑通，拆分留到接口真的挤不下再做。

## 7. 课后小项目

**练习一：加上「列出全部笔记」（必做）**

写一个 `GET /notes`，把 `notes` 里每一条变成 `{"note_id": ..., "text": ...}` 放进列表返回。在 `/docs` 里点一次。

**练习二：价格必须是正数**

给第 5 节的 `Item` 加一条：`price` 小于 0 时，不要append，返回 `{"error": "价格不能为负"}`。用 `/docs` 或 curl 各打一次合法和非法的 JSON。

**练习三：问句太短就拒绝**

`/ask` 里如果 `question.text` 去掉空格后不足 2 个字，返回 `{"content": "问题太短"}`，不要装成已经回答了。

## 8. 小结

FastAPI 用装饰器把函数挂到路径上。`uvicorn main:app --reload` 启动，`/docs` 能直接试。路径参数写在花括号里，查询参数是函数里带默认值的参数，POST 的 JSON 用 `BaseModel` 接。返回字典就是 JSON。

接口要部署到一台没有桌面的机器上时，下一步就是命令行：[第 21 篇：Linux 基础命令](/post/python-linux-commands/)。
