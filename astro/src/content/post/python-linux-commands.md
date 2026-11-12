---
title: 'Python 第 22 篇：Linux 基础命令'
weight: 22
cover: /images/covers/python-linux-commands-cover.jpg
date: 2026-11-12T09:00:00+08:00
updatedDate: 2026-11-12T09:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', 'Linux', '命令行']
description: '连上 CentOS 之后，把 ls、cd、路径、权限、tar、ps 这些每天会碰到的命令敲熟。删除只在 /tmp 里练。'
math: false
mermaid: false
comments: true
toc: true
---

脚本在 Windows 上能跑，拷到 Linux 上却 `Permission denied`；文件 `ls` 看得见，一执行就没权限。这和算法无关，是命令和权限的事。

虚拟机怎么打开、SSH 怎么连，在 [第 21 篇：用 VMware 装好 Linux 虚拟机](/post/python-linux-vm/)。这一篇假设你已经用 `root` 登进 `192.168.88.100`，只把当天要敲的命令走一遍：看目录、建文件、看内容、改权限、打包、看进程和网络。删除只在 `/tmp` 里做，不碰系统目录。

## 1. 一条命令的三段

每条命令都是这三段：命令、选项、参数。中间必须有空格。

`ls -alh /root` 里，`ls` 是命令（list），`-alh` 是选项，`/root` 是参数。选项顺序可以换，`ls -alh` 和 `ls -hla` 一样。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-linux-cmd" viewBox="0 0 680 200" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>ls -alh /root 分成命令、选项、参数</title>
  <style>
    .diag-py-linux-cmd { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-linux-cmd { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; }
  </style>
  <rect x="36" y="36" width="180" height="88" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8"/>
  <text x="126" y="68" font-size="22" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">ls</text>
  <text x="126" y="98" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">命令</text>
  <rect x="250" y="36" width="180" height="88" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8"/>
  <text x="340" y="68" font-size="22" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">-alh</text>
  <text x="340" y="98" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">选项</text>
  <rect x="464" y="36" width="180" height="88" rx="12" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="554" y="68" font-size="22" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">/root</text>
  <text x="554" y="98" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">参数</text>
  <text x="340" y="160" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">ls -alh /root</text>
</svg>
</figure>

目录树先认两个地方就够：`/bin` 放普通用户也能用的命令，`ls`、`cp`、`mv`、`cat` 的本体是这里的文件；`/sbin` 放管理员命令，名字里的 s 是 super。发行版换了，这些命令还在；变的是装包那一条，CentOS 用 `yum`，Debian 系才换成 `apt`。

## 2. 建、看、走、删

六个命令覆盖大部分日常：`ls`、`cd`、`pwd`、`mkdir`、`touch`、`rm`。

```bash
pwd                     # 我现在在哪
ls                      # 这里有什么
ls -alh                 # 含隐藏文件，长格式，大小更好读
cd /tmp                 # 走进 /tmp
mkdir sandbox           # 建目录
cd sandbox
touch note.txt          # 建一个空文件
```

路径分两种。`/tmp/sandbox` 从根写起，是绝对路径。`note.txt`、`../` 是相对路径，相对你 `pwd` 所在的目录。`cd` 走错，多半是把这两种混了。先 `pwd`，再决定下一跳。

看文件：

```bash
cat note.txt            # 一下子打完
more note.txt           # 一屏一屏看，长文件用这个
tail -f /var/log/messages
```

`tail -f` 会停在文件末尾，有新行就继续打。看日志时用它。`Ctrl + C` 退出。

删东西：

```bash
rm note.txt
rm -r sandbox           # 删目录
```

> [!WARNING]
> `rm -rf` 不会问你。课堂约定：今天所有删除都在 `/tmp` 里做，不碰 `/`、`/etc`、`/root` 里不是你刚建的东西。命令敲错可以重来，系统目录删了就不好看了。

## 3. 权限：文件在，但不让你执行

`ls -l` 最左边一串像 `-rwxr-xr--`。第一个符号是类型，`-` 是文件，`d` 是目录。后面九位分成三组：本人、同组、其他人。每组都是 `rwx`：读、写、执行。没有那一项，就是 `-`。

脚本在，`./run.sh` 却 `Permission denied`，通常不是文件坏了，是没有执行位。`chmod +x run.sh` 给它加上。数字写法里，`r=4`、`w=2`、`x=1`，`7` 是 `4+2+1`，所以 `chmod 764 run.sh` 是本人 `rwx`、同组 `rw-`、其他人 `r--`。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-linux-rwx" viewBox="0 0 680 220" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>chmod 764：本人 rwx，同组 rw，其他人只读</title>
  <style>
    .diag-py-linux-rwx { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-linux-rwx { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; }
  </style>
  <text x="126" y="28" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">本人 7</text>
  <text x="340" y="28" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">同组 6</text>
  <text x="554" y="28" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">其他人 4</text>
  <rect x="36" y="52" width="180" height="100" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8"/>
  <text x="126" y="88" font-size="28" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">rwx</text>
  <text x="126" y="124" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">读 写 执行</text>
  <rect x="250" y="52" width="180" height="100" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8"/>
  <text x="340" y="88" font-size="28" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">rw-</text>
  <text x="340" y="124" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">读 写</text>
  <rect x="464" y="52" width="180" height="100" rx="12" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="554" y="88" font-size="28" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">r--</text>
  <text x="554" y="124" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">只读</text>
  <text x="340" y="184" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--red)">chmod 764 文件名</text>
</svg>
</figure>

## 4. 打包，以及服务卡死了怎么办

传代码用 `tar`。四个字母可以记成口诀：`z` 走 gzip，`x` 是解开，`v` 是列出过程，`f` 后面跟文件名。打包是 `c` 不是 `x`。

```bash
tar zcvf sandbox.tar.gz sandbox    # 打包
tar zxvf sandbox.tar.gz            # 解开
```

进程和服务：

```bash
ps -ef                # 谁在跑
kill -9 进程号         # 停不下来时再用来强制结束
ifconfig              # 网卡和 IP
free                  # 内存
df                    # 磁盘还剩多少
```

`kill -9` 不给程序收拾的机会。能正常停的服务，先找它自己的停止方式。只有卡死、普通信号没用时，再用 `-9`。

## 5. 小项目：在 /tmp 里做一次自检

SSH 已经连上的话，把下面存成 `/tmp/check.sh`。它只用这一篇出现过的命令。还没连上，先回到第 21 篇。

```bash
cd /tmp
cat > check.sh << 'EOF'
#!/bin/bash
echo "现在在：$(pwd)"
ls -alh /tmp
df
free
ping -c 3 192.168.88.2
EOF
chmod 764 check.sh
./check.sh
```

`764` 让你能执行它。`ping` 的目标是课堂网关。网关不通，就回到第 21 篇那张从近到远的表，不要先改脚本。

跑完可以删掉练习文件：

```bash
rm /tmp/check.sh
```

## 6. 课后小项目

**练习一：绝对路径和相对路径（必做）**

在 `/tmp` 里 `mkdir box`，`cd box`，`touch a.txt`。分别用相对路径和绝对路径 `cat` 这个文件。然后 `cd /`，再试一次相对路径，看它为什么找不到。

**练习二：故意制造 Permission denied**

`touch /tmp/run.sh`，写一行 `echo hi`，不要 `chmod`，直接 `./run.sh`。看报错。再 `chmod +x`，重跑。

**练习三：只在 /tmp 里删除**

建一个目录，里面放两个文件，用 `rm -r` 删掉整个目录。删之前先 `pwd`，确认自己在 `/tmp` 下面。

## 7. 小结

命令是「命令 + 选项 + 参数」。`ls cd pwd mkdir touch rm` 管目录和文件，`cat more tail` 管看内容，`chmod` 管能不能执行，`tar zxvf` 管解开压缩包，`ps` 和 `kill` 管进程，`ifconfig`、`ping` 管网络。报错先读红字，删除只在 `/tmp`。

命令行能用了，前面 FastAPI 那个接口就可以放到这种机器上跑。系列写到这里，Python 从第一篇的 `print` 走到了「别人能调用的服务」和「服务所在的那台 Linux」。
