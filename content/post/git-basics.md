---
title: 'Git 第 1 篇：给每次改动留一个能回去的版本'
weight: 3
cover: /images/covers/git-basics-cover.jpg
date: 2026-11-23T09:00:00+08:00
lastmod: 2026-11-25T16:09:02+08:00
categories: ['人工智能', 'Docker与Git']
tags: ['Python', '编程基础', 'Git', '版本管理']
description: '在便条项目里完成 Git 初始化、忽略敏感文件、分批提交、安全撤销，再开分支开发标题搜索并合并回 main。'
math: false
mermaid: false
comments: true
toc: true
---

便条项目现在有五六个代码文件，还有 Dockerfile、Compose 配置和依赖清单。继续靠复制文件夹备份，最后只会得到一堆 `notes-service-final`、`notes-service-final-2`，谁也说不清哪份能跑。

Git 要解决的问题很直接：每次能运行的修改都留一个版本，改错了能比较、能撤销，新功能可以先放到分支上试。

下面直接在 `E:\notes-service` 里做，不拿一个无关的 `hello.txt` 演示。

## 1. 初始化仓库，先挡住不该提交的文件

安装 Git for Windows 后，在 PowerShell 执行：

```powershell
Set-Location E:\notes-service
git --version
git init -b main
git config user.name "你的名字"
git config user.email "你的邮箱"
```

`git init` 会创建隐藏的 `.git` 目录，提交历史和分支信息由 Git 管理，别手动改里面的文件。这里的 `git config` 没有 `--global`，署名只对当前项目生效。

先新建 `.gitignore`：

```text
.venv/
__pycache__/
*.py[cod]
.env
note_full.sql
*.log
```

原因很实际：

- `.venv` 可以按 `requirements.txt` 重装，没必要提交几百 MB；
- Python 缓存每次运行都会再生；
- `.env` 有数据库密码；
- `note_full.sql` 可能包含完整业务数据。

检查规则是否生效：

```powershell
git check-ignore -v .env note_full.sql
git status --short
```

第一条应列出 `.gitignore` 中对应的规则。第二条里应该有 `.env.example`、代码和部署文件，但不应该有 `.env`、`.venv`、`note_full.sql`。

> [!NOTE]
> 如果密码文件以前已经提交过，只补 `.gitignore` 不会清除历史。忽略规则只管未跟踪文件，已经泄露的密码也要及时更换。

## 2. 第一次提交前，先看会提交什么

```powershell
git add .
git status
git diff --cached --name-only
```

`git add .` 把当前可提交的文件放进暂存区。暂存区可以理解为“下一次提交的装箱区”：你可以先挑好这次要提交的内容，而不是把目录里所有改动一股脑记进去。

最后一条会列出即将提交的文件。看到 `.env.example` 没问题，看到 `.env` 就停下来检查 `.gitignore`。

确认后提交：

```powershell
git commit -m "建立便条接口与 Docker 部署基线"
git log --oneline
git status
```

`log --oneline` 一行显示一个提交，开头的短字符是提交 ID。`status` 最后应显示工作区干净。

提交说明写清楚做了什么。三个月后翻历史，“建立便条接口与 Docker 部署基线”还能看懂，“更新”“修改”基本等于没写。

## 3. 看差异，再试一次安全撤销

打开 `main.py`，把：

```python
app = FastAPI(title='便条接口')
```

改为：

```python
app = FastAPI(title='便条接口 v2')
```

执行：

```powershell
git diff -- main.py
```

减号是旧内容，加号是新内容。这里比较的是工作区和暂存区，因为还没 `add`，所以能看到刚改的一行。

暂存后再比较一次：

```powershell
git add main.py
git diff -- main.py
git diff --cached -- main.py
```

第一条现在应为空，因为改动已经进暂存区；第二条显示暂存区相对上一次提交的差异。以后遇到“明明改了，`git diff` 却没东西”，先看看是不是已经暂存。

提交：

```powershell
git commit -m "接口标题增加版本号"
```

假设这次提交不该发布，可以反向撤销：

```powershell
git revert --no-edit HEAD
```

`HEAD` 是当前分支最新提交。`revert` 不会抹掉历史，而是创建一个新提交，把“标题加 v2”反向改回去。`--no-edit` 使用自动生成的提交说明，不打开编辑器。

检查：

```powershell
git log --oneline -3
git diff HEAD~2 HEAD -- main.py
```

历史里会保留“修改”和“撤销”两次提交；第二条比较最初基线与撤销后的内容，应该没有差异。

这种方式适合已经推送、可能被别人拿到的提交。`git reset --hard` 则会移动分支并丢弃工作区改动，不要为了历史看起来短一点就随手用。

如果只是想取消暂存，文件内容保留：

```powershell
git restore --staged main.py
```

## 4. 开个分支，给列表加标题搜索

不直接在 main 上试新功能：

```powershell
git switch -c feat/search-notes
```

把 `main.py` 中的 `list_notes` 改成下面这样，其余路由不动：

```python
@app.get('/notes', response_model=list[NoteOut])
def list_notes(
    book_id: int | None = None,
    q: str | None = None,
    session: Session = Depends(get_db),
):
    statement = select(Note)
    if book_id is not None:
        statement = statement.where(Note.book_id == book_id)
    if q:
        statement = statement.where(Note.title.contains(q))

    statement = statement.order_by(Note.id)
    return session.scalars(statement).all()
```

新增的只是 `q` 参数和一个条件。`Note.title.contains(q)` 会生成参数化的模糊查询，不用自己拼 `%...%` SQL 字符串。

代码改了，容器里的镜像还没改。重新构建：

```powershell
docker compose up -d --build
```

打开 <http://127.0.0.1:8000/docs>，在 `GET /notes` 的 `q` 中输入 `线程`，应只返回标题包含“线程”的便条。再同时传 `book_id=1`，确认两个条件能一起生效。

测试通过再提交：

```powershell
git diff -- main.py
git add main.py
git commit -m "支持按标题搜索便条"
```

Git 只能保存版本，不能保证版本可用。提交前运行一次，比以后从历史里翻出一堆坏版本省事。

切回 main：

```powershell
git switch main
```

此时 `main.py` 里的 `q` 会消失，因为工作区恢复到 main 的内容。功能没有丢，它还在 `feat/search-notes` 的提交里。

合并：

```powershell
git merge feat/search-notes
git log --oneline --graph --all -5
git status --short
```

合并后搜索功能回到 main，状态应为空。如果开发期间 main 没有新提交，Git 通常会显示 `Fast-forward`，直接把 main 移到功能分支的最新提交。历史仍是一条直线，这不代表没合并。

分支不再需要时：

```powershell
git branch -d feat/search-notes
```

小写 `-d` 会检查是否已经合并，适合日常清理。

## 5. 需要远程备份时再推送

本地 Git 已经能管理版本。需要换电脑或协作时，再在 GitHub、Gitee 创建一个空仓库，关联后推送：

```powershell
git remote add origin https://github.com/your-name/notes-service.git
git push -u origin main
```

把 URL 换成自己的仓库地址。`origin` 是远程地址的常用别名，`-u` 记录本地 main 和远程 main 的对应关系，之后通常只需 `git push`。

推送前确认仓库里一直没有 `.env` 和数据库备份。公开仓库尤其如此，Git 能记住每次提交，也会记住你不小心提交过的密码。

到这里，这个项目有了三套互不替代的保护：MySQL 让数据活过程序重启，Docker 让环境可以重建，Git 让代码变化有迹可查。下次改坏时，先判断坏的是数据、环境还是代码，再找对应工具处理。
