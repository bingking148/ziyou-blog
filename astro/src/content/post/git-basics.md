---
title: 'Git 第 1 篇：给每次改动留一个能回去的版本'
weight: 3
cover: /images/covers/git-basics-cover.jpg
date: 2026-11-23T09:00:00+08:00
updatedDate: 2026-11-25T14:35:00+08:00
categories: ['人工智能', 'Docker与Git']
tags: ['Python', '编程基础', 'Git', '版本管理']
description: '便条项目不再靠复制文件夹备份：init 建仓、add 进暂存区、commit 留版本，diff 看改了什么，branch 开一条线试新功能，merge 合回来。'
math: false
mermaid: false
comments: true
toc: true
---

到上一篇为止，便条项目的目录里有四个 py、一个 Dockerfile、一个 compose 文件。改坏一行想退回去，你现在的办法大概是复制一份文件夹叫「备份」。改十次就是十个文件夹，哪个是哪个全靠文件名和记忆。

Git 换一种存法：每次你确认「这一版可以」，它就给整个目录拍一张快照存进历史。以后任意两版之间能看差异，任意一版能退回去，还能开一条平行线试新功能、试成了再合回来。这一篇就在便条项目目录里把这套动作走一遍。

## 1. 装 Git，建仓

Windows 上装 Git for Windows，装完开始菜单里多一个 Git Bash。后面命令都在 Git Bash 里敲（PowerShell 里也一样能用）。走进项目目录：

```bash
cd /e/notes-service
git init -b main
git config user.name ziyou
git config user.email ziyou@example.com
```

`init` 把当前目录变成仓库：多一个隐藏目录 `.git`，历史全存在里面，**别手动改它**。`-b main` 指定主分支叫 main。`config` 不带 `--global` 时只对这个仓库生效：提交要署名，名字邮箱写在这里，练习用示例邮箱就够。

看一眼现状：

```bash
git status
```

它说有一堆 untracked 文件：四个 py、Dockerfile、compose 文件，还有 `__pycache__` 之类。哪些该进历史、哪些不该，先定规矩。

## 2. 不该进的先挡住：.gitignore

缓存、虚拟环境、带密码的文件不进历史。目录里新建 `.gitignore`：

```text
__pycache__/
*.pyc
.venv/
.env
```

一行一个模式。存完再 `git status`，`__pycache__` 不见了——被挡住的不再列为待处理。密码一类以后放 `.env`，代码里 `os.getenv` 读，文件本身不进仓库。

## 3. 三个区：工作区、暂存区、历史

Git 里文件待的地方分三层，动作就是在这三层之间搬：

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-git-areas" viewBox="0 0 680 300" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>工作区改、暂存区挑、commit 进历史</title>
  <style>
    .diag-git-areas { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-git-areas { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; }
  </style>
  <rect x="30" y="40" width="180" height="120" rx="14" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8"/>
  <text x="120" y="76" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">工作区</text>
  <text x="120" y="108" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">你正在编辑的文件</text>
  <text x="120" y="134" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">git diff 看这里</text>
  <rect x="250" y="40" width="180" height="120" rx="14" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8"/>
  <text x="340" y="76" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">暂存区</text>
  <text x="340" y="108" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">挑好准备提交的内容</text>
  <text x="340" y="134" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">git diff --cached</text>
  <rect x="470" y="40" width="180" height="120" rx="14" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="560" y="76" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">历史</text>
  <text x="560" y="108" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">一张张快照</text>
  <text x="560" y="134" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">git log 翻</text>
  <line x1="210" y1="80" x2="242" y2="80" stroke="var(--gray)" stroke-width="1.6"/><path d="M250,80 L242,75 L242,85 Z" fill="var(--gray)"/>
  <text x="226" y="66" font-size="13" text-anchor="middle" fill="var(--gray)">add</text>
  <line x1="430" y1="80" x2="462" y2="80" stroke="var(--gray)" stroke-width="1.6"/><path d="M470,80 L462,75 L462,85 Z" fill="var(--gray)"/>
  <text x="446" y="66" font-size="13" text-anchor="middle" fill="var(--gray)">commit</text>
  <line x1="340" y1="160" x2="340" y2="196" stroke="var(--gray)" stroke-width="1.6"/><path d="M340,204 L335,196 L345,196 Z" fill="var(--gray)"/>
  <text x="340" y="228" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--red)">restore --staged：从暂存区退回，工作区内容不动</text>
  <text x="340" y="268" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">提交是「挑好的这一批」，不是「目录此刻的全部」</text>
</svg>
</figure>

暂存区是中间那层挑拣的篮子：改了五个文件，可以只挑三个进下一次提交。这是 Git 和「自动同步网盘」最大的区别——**提交什么由你挑，什么时候提交也由你定**。

## 4. 第一次提交

```bash
git add .
git status
git commit -m "便条接口基线：四个文件加 Docker 部署"
git log --oneline
```

`add .` 把当前目录所有没被挡住的改动放进暂存区；`status` 里它们变绿，列在「要提交的变更」下；`commit` 把篮子里这一批拍成快照，`-m` 后面是这张快照的说明，写清楚这次改了什么，以后翻历史靠它。`log --oneline` 一行一版：短编号加说明。

## 5. 改一行，看差异，再提交

把 `main.py` 里 `FastAPI(title='便条接口')` 改成 `title='便条接口 v2'`，然后：

```bash
git diff
git add main.py
git diff --cached
git commit -m "接口标题加版本号"
```

`git diff` 看工作区相对暂存区改了什么：减号行是旧的，加号行是新的。`add` 之后 `git diff` 空了——改动进篮子了；`git diff --cached` 接着看篮子里相对上一版改了什么。两个 diff 各看一段，别混。

手滑多 add 了一个不想提交的文件：

```bash
git restore --staged 文件名
```

只把它从篮子里拿出来，文件内容一个字不动。

## 6. 开一条线试新功能：分支

想给接口补一个删除地址，又怕改坏现在能跑的版本。开一条分支：

```bash
git switch -c feat/delete-note
```

`switch -c` 创建并切过去。此刻工作区内容和 main 上一模一样，但之后的提交都记在这条新线上，main 不动。把 [SQLAlchemy 第 2 篇](/post/fastapi-sqlalchemy/)练习二的删除接口写进 `main.py`，跑通，然后：

```bash
git add main.py
git commit -m "补 DELETE /notes/{id}"
git switch main
git merge feat/delete-note
git log --oneline --graph -5
```

切回 main 时看一眼 `main.py`：删除接口不在——它在那条线上。`merge` 把那条线的提交接进 main，文件里才有了删除接口。`log --graph` 画出分叉和汇合：一条线出去，一条线回来。

试坏了也不怕：分支上怎么改都不影响 main，大不了这条线不要了。这就是「复制文件夹备份」想要而做不到的事——备份之间没有合并，分支有。

## 7. 放到远程：可选的一步

本地历史已经够你退回去。想再多一份异地备份、或者和别人共用，把仓库推到一个远程托管处（GitHub、Gitee 都行）：在网站上建一个空仓库，然后：

```bash
git remote add origin 仓库地址
git push -u origin main
```

`remote add` 给地址起名叫 origin，`push` 把本地历史送上去，`-u` 记下对应关系，以后一句 `git push` 就够。第一次推会弹登录授权，按提示走完。之后每次提交完推一下，异地那份就跟上。

> [!WARNING]
> `git reset --hard` 会把工作区未提交的改动直接抹掉，没有回收站。练习阶段只用 `status`、`diff`、`restore --staged` 这些看得见的动作；带 hard 的命令，先弄清它抹的是哪一层再说。

## 8. 小项目：把这一篇连起来跑

在项目目录里按顺序：init、config、写 .gitignore、add、commit 基线；改标题、diff、add、diff --cached、commit；开 feat/delete-note、写删除接口、commit；切回 main、merge、log --graph。验收：`git log --oneline` 至少四个提交，`main.py` 里有删除接口，`git status` 干净。

## 9. 课后小项目

**练习一：挑着提交（必做）**

同时改 `main.py` 和 `schema.py`，只 `add main.py` 就 commit。`status` 里 schema.py 应该还在「未暂存」里等着。再单独提交它。体会篮子的存在。

**练习二：看某一版改了什么**

`git log --oneline` 挑一个短编号，`git show 编号` 看那张快照的完整差异。对照你当时写的 `-m` 说明。

**练习三：挡一次密码**

新建 `.env` 写一行假密码，`git status` 确认它不出现。再把 .gitignore 里那行删掉看它冒出来，恢复。明白挡的是模式，不是文件本身。

## 10. 小结

工作区改、暂存区挑、commit 进历史；diff 看两段差异，restore --staged 退篮子；switch 开线、merge 合线，log 翻快照；.gitignore 挡住不该进的，push 送一份去异地。复制文件夹的时代到此结束。

Docker 与 Git 专栏到这里，整条路也到这里：从 [Python 专栏](/categories/python/)的第一行 print，到便条住在 MySQL 里、接口和数据库一条命令起齐、每次改动都有版本可回。回去翻任何一篇，代码都还在原地等你跑。