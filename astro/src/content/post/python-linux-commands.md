---
title: 'Python 第 21 篇：Linux 基础命令，先连上虚拟机再敲'
weight: 21
cover: /images/covers/python-linux-commands-cover.jpg
date: 2026-11-12T09:00:00+08:00
updatedDate: 2026-11-12T09:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', 'Linux', '命令行']
description: '同一套课的命令行一讲：用 VMware 里的 CentOS 连上 192.168.88.100，再把 ls、cd、权限、tar、ps 这些每天会碰到的命令敲熟。删除只在 /tmp 里练。'
math: false
mermaid: false
comments: true
toc: true
---

脚本在 Windows 上能跑，拷到 Linux 上却连解释器都找不到；文件 `ls` 看得见，一执行就 `Permission denied`；虚拟机明明开着，宿主机 `ping` 不通。这三件事和算法无关，全是操作系统的事。

这一篇不装新的 Python 语法。它把课堂那台 CentOS 7 虚拟机连上，再把当天要敲的命令走一遍：看目录、建文件、看内容、改权限、打包、看进程和网络。删除只在 `/tmp` 里做，不碰系统目录。

## 1. 三层：电脑、VMware、虚拟机

课堂的机器是一台联想电脑，上面是 Windows 10 或 11。VMware 是装在 Windows 里的虚拟化软件，里面再开虚拟机。一台装 CentOS，一台可以装 Ubuntu，旁边还能开腾讯会议和浏览器。虚拟机不是「一个文件夹」，它是一台用软件造出来的电脑，有自己的系统。

连上去用 SSH：IP 地址、端口号 22、用户名和密码。课堂这台是 `192.168.88.100`，用户 `root`，端口 22。Windows 只负责开窗口，命令都在虚拟机里敲。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-linux-stack" viewBox="0 0 680 420" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>Windows 上的 VMware 里跑 CentOS，SSH 用 IP、22 端口和用户名连进去</title>
  <style>
    .diag-py-linux-stack { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-linux-stack { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-gray:#2a2d33; }
  </style>
  <rect x="40" y="300" width="600" height="72" rx="12" fill="var(--fill-gray)" stroke="currentColor" stroke-width="1.6"/>
  <text x="340" y="328" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">联想电脑</text>
  <text x="340" y="352" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">Disk · Memory · CPU</text>
  <rect x="40" y="228" width="600" height="56" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.6"/>
  <text x="340" y="256" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">操作系统 Windows</text>
  <rect x="40" y="36" width="360" height="176" rx="14" fill="none" stroke="var(--amber)" stroke-width="1.8"/>
  <text x="220" y="62" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--amber)">VMware</text>
  <rect x="60" y="84" width="140" height="104" rx="10" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.6"/>
  <text x="130" y="118" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">CentOS</text>
  <text x="130" y="146" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">VM-1</text>
  <rect x="216" y="84" width="160" height="104" rx="10" fill="none" stroke="var(--gray)" stroke-width="1.4" stroke-dasharray="5 4"/>
  <text x="296" y="124" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">Ubuntu</text>
  <text x="296" y="150" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">VM-2</text>
  <rect x="424" y="48" width="216" height="150" rx="12" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.6"/>
  <text x="532" y="82" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">SSH</text>
  <text x="532" y="112" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">192.168.88.100</text>
  <text x="532" y="136" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">端口 22</text>
  <text x="532" y="160" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">用户名 root</text>
</svg>
</figure>

导入虚拟机的顺序，按课件来，不要跳：

1. 把 `ai_node1.zip` 解压。压缩包旁边会有一份说明文档，那是完整文档，不是安装包。
2. 用 VMware 打开解压出来的 `ai_node1.vmx`。
3. 网卡保持 NAT。课堂要的是：主机能上网，虚拟机就能上网，IP 固定成 `192.168.88.100`。
4. 用 `root` 登录。登录后敲 `ifconfig`，看有没有 `inet 192.168.88.100`。网卡名可能是 `ens33`，也可能是别的，以 `ifconfig` 里看到的为准。

Windows 上用 MobaXterm 或同类工具建会话：Remote host 填 `192.168.88.100`，username 填 `root`，端口 `22`。也可以直接：

```bash
ssh root@192.168.88.100
```

> [!WARNING]
> IP 不是 `.100`，多半是镜像里留着旧配置，得改网卡配置再启用，不是 SSH 软件坏了。`ping` 不加次数会一直刷，用 `ping -c 3`，或者 `Ctrl + C` 停下。

通不通，从近到远看，不要一上来就怀疑百度：

1. `ping 127.0.0.1`：自己都 ping 不通，先重启虚拟机。
2. `ifconfig`：没有 `inet`，配置没生效。
3. `ping 192.168.88.2`：这是课堂 NAT 的网关。不通，就是子网或网关写错。
4. `ping 8.8.8.8`：IP 通、域名不通，才是 DNS。
5. `ping www.baidu.com`：这一下通了，说明虚拟机出去了。

## 2. 一条命令的三段

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

## 3. 建、看、走、删

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

## 4. 权限：文件在，但不让你执行

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

## 5. 打包，以及服务卡死了怎么办

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

## 6. 小项目：在 /tmp 里做一次自检

SSH 连上虚拟机之后，把下面存成 `/tmp/check.sh`。它只用这一篇出现过的命令。

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

`764` 让你能执行它。`ping` 的目标是课堂网关。网关不通，就回到第 1 节那张从近到远的表，不要先改脚本。

跑完可以删掉练习文件：

```bash
rm /tmp/check.sh
```

## 7. 课后小项目

**练习一：绝对路径和相对路径（必做）**

在 `/tmp` 里 `mkdir box`，`cd box`，`touch a.txt`。分别用相对路径和绝对路径 `cat` 这个文件。然后 `cd /`，再试一次相对路径，看它为什么找不到。

**练习二：故意制造 Permission denied**

`touch /tmp/run.sh`，写一行 `echo hi`，不要 `chmod`，直接 `./run.sh`。看报错。再 `chmod +x`，重跑。

**练习三：只在 /tmp 里删除**

建一个目录，里面放两个文件，用 `rm -r` 删掉整个目录。删之前先 `pwd`，确认自己在 `/tmp` 下面。

## 8. 小结

虚拟机跑在 VMware 里，SSH 靠 IP、22 端口和用户名。命令是「命令 + 选项 + 参数」。`ls cd pwd mkdir touch rm` 管目录和文件，`cat more tail` 管看内容，`chmod` 管能不能执行，`tar zxvf` 管解开压缩包，`ps` 和 `kill` 管进程，`ifconfig`、`ping` 管网络。报错先读红字，删除只在 `/tmp`。

命令行能用了，前面 FastAPI 那个接口就可以放到这种机器上跑。系列写到这里，Python 从第一篇的 `print` 走到了「别人能调用的服务」和「服务所在的那台 Linux」。
