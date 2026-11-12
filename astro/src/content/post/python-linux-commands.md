---
title: 'Python 第 22 篇：Linux 基础命令'
weight: 22
cover: /images/covers/python-linux-commands-cover.jpg
date: 2026-11-12T09:00:00+08:00
updatedDate: 2026-11-12T19:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', 'Linux', '命令行']
description: '登录自己装的 Ubuntu 之后，在家目录的「练习」文件夹里写便条、找字、给脚本执行权、打包，再用 apt 装上 tree。'
math: false
mermaid: false
comments: true
toc: true
---

虚拟机已经能登录的话，打开终端。还没装好，先看 [第 21 篇：用 VMware 装好 Linux 虚拟机](/post/python-linux-vm/)。

这一篇只做一件事：在家目录里建一个叫 `练习` 的文件夹，把一张便条和一个小脚本放进去，再打包。人是你安装时建的那个用户，要动系统时再 `sudo`。

先确认是你自己，并且人在家目录：

```bash
whoami
hostname
pwd
```

`whoami` 应该是你的用户名，不是 `root`。`pwd` 类似 `/home/你的用户名`。屏幕乱了就敲 `clear`。命令敲到一半想放弃，按 `Ctrl + C`。

## 1. 建练习目录，看一眼

```bash
cd
mkdir 练习
cd 练习
pwd
touch note.txt
ls -alh ~/练习
```

`cd` 单独敲会回到家目录。`~` 就是家目录，所以 `~/练习` 和你现在所在的这个文件夹是同一个地方。`mkdir` 建目录，`touch` 建一个空文件。

`ls -alh ~/练习` 这一行拆开是三截。`ls` 是命令，`-alh` 是选项，`~/练习` 是要看的那个目录。`-l` 是长格式，`-a` 连隐藏文件一起看，`-h` 把大小写成 KB、MB。顺序可以调换，`ls -alh` 和 `ls -hla` 一样。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-lab-ls" viewBox="0 0 680 210" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>ls -alh ~/练习 分成命令、选项、参数</title>
  <style>
    .diag-py-lab-ls { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-lab-ls { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; }
  </style>
  <rect x="28" y="28" width="190" height="96" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8"/>
  <text x="123" y="62" font-size="22" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">ls</text>
  <text x="123" y="94" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">命令</text>
  <rect x="244" y="28" width="190" height="96" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8"/>
  <text x="339" y="62" font-size="22" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">-alh</text>
  <text x="339" y="94" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">选项</text>
  <rect x="460" y="28" width="192" height="96" rx="12" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="556" y="62" font-size="22" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">~/练习</text>
  <text x="556" y="94" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">参数</text>
  <text x="340" y="164" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor">ls -alh ~/练习</text>
</svg>
</figure>

左边是要做什么：列出。中间是怎么列：长一些、带隐藏文件、大小好读。右边是对谁做：家目录下的 `练习`。三截之间都有空格。记不住某个选项时，敲 `ls --help`，或者 `man ls`，看完按 `q` 退出。打路径时按 `Tab` 会补全，向上的方向键能翻出刚敲过的命令。

`~/练习/note.txt` 从家目录写起，是好认的一条路径。只写 `note.txt`，则要看你 `pwd` 在不在 `练习` 里面。`.` 是当前目录，`..` 是上一层。

```bash
cd ..
pwd
cd ~/练习
```

## 2. 写一张便条，再读出来

空文件没东西好看。在 `练习` 里写入三行，内容就是你刚做完的那台机器：

```bash
printf '装好了\n用户是我自己\n快照叫刚装好\n' > note.txt
cat note.txt
```

`>` 是「写进这个文件，原来的内容不要了」。再补一行时用 `>>`，那是接到末尾：

```bash
echo '再记一笔' >> note.txt
cat note.txt
```

> [!WARNING]
> `echo 你好 > note.txt` 会把便条整个换成「你好」。想追加，用 `>>`。

分开看头尾和行数：

```bash
head -n 2 note.txt
tail -n 1 note.txt
wc -l note.txt
less note.txt
```

`less` 一屏一屏看，按 `q` 退出。便条很短，`cat` 就够。文件长了再用 `less`，或者 `tail -f` 守在末尾等新行，离开也是 `Ctrl + C`。

要改一个字，用 `nano`：

```bash
nano note.txt
```

写完按 `Ctrl + O` 回车保存，`Ctrl + X` 退出。窗口底下写着这些键。

不小心进了 `vim`：按 `Esc`，输入 `:q!`，回车。这一篇的修改用 `nano`。

复制一张再改名，顺手建一个空目录再删掉。`rmdir` 只能删空目录：

```bash
cp note.txt note-copy.txt
mv note-copy.txt 备份.txt
mkdir 空的
rmdir 空的
```

## 3. 找出「快照」这两个字

便条里有一行写着快照。把它滤出来：

```bash
grep 快照 note.txt
grep -n 快照 note.txt
find ~/练习 -name "*.txt"
```

`grep` 看的是文件里的字，`-n` 会带上行号。`find` 看的是文件名。范围先写 `~/练习`，不要从 `/` 把整台机器扫一遍。

两条接起来也行。`|` 把前一条的输出交给后一条：

```bash
cat note.txt | grep 快照
ls -lh | grep txt
```

## 4. 写一个脚本，给它执行权

在同一个目录里放一个脚本，让它说一声「你好」：

```bash
echo 'echo 你好' > hi.sh
./hi.sh
```

第一下多半是 `Permission denied`。文件在，但是不能当程序跑。`ls -l hi.sh` 最左边一串类似 `-rw-r--r--`。第一个符号 `-` 表示这是文件。后面九位分成三组：你自己、同组、其他人。每组是 `rwx`，读、写、执行，没有的那一位是 `-`。现在缺的是执行。

```bash
chmod 764 hi.sh
./hi.sh
```

这下应该打出 `你好`。`7` 是 `4+2+1`，也就是读、写、执行都有。`6` 是读和写。`4` 是只读。所以 `764` 是：你自己能读能改能跑，同组能读能改，别人只能读。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-lab-chmod" viewBox="0 0 680 250" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>chmod 764 hi.sh：你自己能跑，同组能改，别人只能读</title>
  <style>
    .diag-py-lab-chmod { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-lab-chmod { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; }
  </style>
  <text x="340" y="28" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">chmod 764 hi.sh</text>
  <text x="126" y="62" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">你自己 7</text>
  <text x="340" y="62" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">同组 6</text>
  <text x="554" y="62" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">其他人 4</text>
  <rect x="36" y="84" width="180" height="96" rx="12" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8"/>
  <text x="126" y="118" font-size="26" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">rwx</text>
  <text x="126" y="152" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">能读能改能跑</text>
  <rect x="250" y="84" width="180" height="96" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8"/>
  <text x="340" y="118" font-size="26" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">rw-</text>
  <text x="340" y="152" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">能读能改</text>
  <rect x="464" y="84" width="180" height="96" rx="12" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="554" y="118" font-size="26" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">r--</text>
  <text x="554" y="152" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">只能读</text>
  <text x="340" y="214" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--red)">./hi.sh 才能打出「你好」</text>
</svg>
</figure>

图上三格就是 `764` 的三截，对象是刚才那个 `hi.sh`。你自己这一格有 `x`，所以 `./hi.sh` 跑得起来。只想给自己加执行、不动别人，也可以写 `chmod u+x hi.sh`。`u` 是你自己，`+x` 是加上执行。

你改不了系统目录，那是另一回事。`touch /etc/hello` 会 `Permission denied`，`chmod` 救不了，因为那个目录不属于你。装软件时用 `sudo`，它只抬高这一条命令，问的是你自己的密码。

## 5. 打包，再装一个 tree

便条和脚本都在 `练习` 里了，收成一个包：

```bash
cd ~/练习
tar czf 练习.tar.gz note.txt hi.sh
tar tzf 练习.tar.gz
```

`c` 是创建，`x` 是解开，`z` 走 gzip，`t` 是只看包里有什么，先别解，`f` 后面跟文件名。确认包里只有这两个文件。

想看目录长什么样，装一个小工具 `tree`。Ubuntu 上用 `apt`：

```bash
sudo apt update
sudo apt install tree
tree ~/练习
```

`sudo apt update` 先更新软件列表，`install` 才去装。不想要了：`sudo apt remove tree`。

做完看一眼这台新机器。磁盘、这个目录占了多少、内存、地址、出不出得去：

```bash
df -h
du -sh ~/练习
free -h
ip addr
ping -c 3 ubuntu.com
```

`ip addr` 里跳过 `127.0.0.1`，`inet` 那一行是这台虚拟机自己的地址。`ping` 不加 `-c` 会一直刷，`Ctrl + C` 停下。老文档里的 `ifconfig` 这里默认没有，看地址用 `ip addr`。

有个命令自己停不下来，又不是在前台占着窗口：先 `ps` 找到进程号，`kill 进程号`。还不走，再用 `kill -9 进程号`。`-9` 不给它收拾，留到后手。`top` 会占住屏幕不停刷新，看完按 `q`。

> [!WARNING]
> `rm -rf` 不会问你，也没有回收站。删之前先 `pwd`。这一篇的删除只在 `~/练习` 里做，或者你明确知道自己在 `/tmp`。不要碰 `/`、`/etc`、`/usr`。

## 6. 小项目：把练习目录再走一遍

从家目录开始，按顺序敲。每一步看完输出再敲下一行。

```bash
cd
mkdir -p 练习
cd 练习
whoami
pwd
printf '装好了\n用户是我自己\n快照叫刚装好\n' > note.txt
grep 快照 note.txt
echo 'echo 你好' > hi.sh
chmod 764 hi.sh
./hi.sh
tar czf 练习.tar.gz note.txt hi.sh
tar tzf 练习.tar.gz
sudo apt update
sudo apt install tree
tree ~/练习
```

`whoami` 是你的用户名。`grep` 只打出带「快照」的那一行。`./hi.sh` 打出「你好」。`tar tzf` 里只有 `note.txt` 和 `hi.sh`。`tree` 把这个目录画出来。

要清掉练习，先确认路径：

```bash
pwd
rm -r ~/练习
```

## 7. 课后小项目

**练习一：两条路径指同一个文件（必做）**

重新建好 `~/练习` 和 `note.txt`。在 `~/练习` 里敲 `cat note.txt`，再敲 `cat ~/练习/note.txt`。然后 `cd /`，再只敲 `cat note.txt`，看它为什么找不到。

**练习二：再制造一次 Permission denied**

`echo 'echo 你好' > ~/练习/hi.sh`，不要 `chmod`，直接 `~/练习/hi.sh`。看报错。再 `chmod u+x ~/练习/hi.sh`，重跑。

**练习三：滤出一行再打包**

便条里加一行不带「快照」的话。用 `grep 快照` 确认只剩那一行被滤出。`tar czf` 只打包 `note.txt`。`tar tzf` 看包里没有把别的目录带进去。删东西之前先 `pwd`。

## 8. 小结

这一次都在 `~/练习` 里：`ls -alh` 看它，`>` 和 `>>` 写便条，`grep` 找出「快照」，`chmod 764 hi.sh` 让 `./hi.sh` 说得出「你好」，`tar` 把两个文件收成包，`sudo apt install tree` 把目录画出来。命令是「命令、选项、参数」。记不住就 `--help` 或 `man`。

删除先看路径，只在 `~/练习` 或 `/tmp` 里练。命令行会用了，前面那本笔记的接口，也可以放到这台 Linux 上跑。
