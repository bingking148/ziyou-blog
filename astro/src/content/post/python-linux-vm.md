---
title: 'Python 第 21 篇：用 VMware 装好 Linux 虚拟机'
weight: 21
cover: /images/covers/python-linux-vm-cover.jpg
date: 2026-11-11T09:00:00+08:00
updatedDate: 2026-11-12T19:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', 'Linux', 'VMware']
description: '在 Windows 上从官网下载 VMware 和 Ubuntu，新建一台虚拟机，把 Linux 装进虚拟磁盘。卸掉 ISO，用自己的用户登录，再打一张快照。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇的笔记跑在你这台 Windows 上。想把它放到 Linux 上，先得有一台 Linux。不必另买电脑：在这台 Windows 里装 VMware，新建一台虚拟机，把 Ubuntu 装进一块虚拟磁盘。

弄坏的是这块虚拟磁盘，不是 Windows 里的文件。装好后拍一张快照，改乱了可以回到这一张。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-fresh-vm" viewBox="0 0 680 400" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>Windows 上的 VMware 里是一台新建的 Linux，安装盘是 ubuntu 的 ISO</title>
  <style>
    .diag-py-fresh-vm { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --teal:#2a7a6d; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-teal:#d4eeea; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-fresh-vm { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --teal:#7ec9bc; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-teal:#1a4d4d; }
  </style>
  <rect x="28" y="20" width="624" height="360" rx="16" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8"/>
  <text x="340" y="50" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">Windows 主机</text>
  <rect x="48" y="76" width="584" height="280" rx="14" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.6"/>
  <text x="340" y="106" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor">VMware Workstation</text>
  <rect x="68" y="136" width="320" height="190" rx="12" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8"/>
  <text x="228" y="186" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">新建的 Linux</text>
  <text x="228" y="222" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">从 ISO 装进虚拟磁盘</text>
  <text x="228" y="256" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">登录用你建的用户</text>
  <rect x="412" y="136" width="196" height="190" rx="12" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8"/>
  <text x="510" y="196" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">ubuntu 的 ISO</text>
  <text x="510" y="230" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">当前的长期支持版</text>
  <text x="510" y="262" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">这就是安装盘</text>
</svg>
</figure>

外框是你现在的 Windows。里面跑着 VMware。VMware 里面左边是要新建的 Linux，系统装在虚拟磁盘里，登录用你等会儿自己建的用户。右边是安装盘，一张 Ubuntu 的 ISO。

下面按这五步做完：下 Workstation，下 Ubuntu 的 ISO，新建虚拟机，安装 Linux，打快照。

## 1. 下 Workstation

只从官网下。打开 Broadcom 的支持门户：

<https://support.broadcom.com>

没有账号就注册一个免费的。登录之后，在免费软件下载里找 **VMware Workstation Pro** 的 Windows 版，下页面上当前给出的那个。个人使用不需要许可证密钥。

下完双击安装包，按它自己的页面走完。开始菜单里能打开 Workstation，这一步就成了。

> [!WARNING]
> 不要从第三方下载站下 VMware。只认 Broadcom / VMware 的官网。

如果安装时，或者后面给虚拟机开机时，提示 CPU 虚拟化没开：重启，按开机画面上的键进 BIOS（常见是 `Del`、`F2` 或 `F10`）。把 Intel 的 **VT-x** 或 AMD 的 **AMD-V**（有的主板写成 SVM）设成开启，保存退出。别的选项不要动。

## 2. 下 Ubuntu 的 ISO

Linux 装 Ubuntu 桌面版。只打开这个地址：

<https://ubuntu.com/download/desktop>

选页面上标着 **LTS** 的那一版，也就是当前的长期支持版。电脑是普通的 Intel 或 AMD，下 64 位桌面版。文件以 `.iso` 结尾。

这个文件就是安装盘。虚拟机开机时读它，才会走进安装程序。

> [!WARNING]
> 不要下别人重新打包的「精简版」「集成版」。只认 `ubuntu.com`。

## 3. 新建虚拟机

打开 Workstation，新建一台虚拟机。安装来源选你刚下的 ISO。系统类型选 Linux，版本选 Ubuntu 64 位。向导若已经认出这张盘，跟着它走。

然后在自定义硬件里改成这一套：处理器 2 核，内存 4GB，磁盘 40GB 或更多，网卡选 **NAT**。磁盘存成单个文件即可。主机内存还宽裕的话，内存可以给到 6GB，桌面会松一点。

这四个数各管一件事。2 核够安装和后面敲命令。4GB 是分给这台虚拟机的内存。40GB 是虚拟磁盘，Ubuntu 就装在这里。NAT 是让虚拟机借用你 Windows 的网络上网，地址由 VMware 分配，每台不一样，重启后也可能变。

桥接是另一种接法：虚拟机像局域网里的另一台电脑，向路由器要地址。今天用不到，网卡留在 NAT。

> [!NOTE]
> 安装程序问你要不要清空磁盘时，它看见的是这块新建的虚拟磁盘，不是 Windows 那块硬盘。动手前看一眼向导里的磁盘是不是虚拟机自己的。

## 4. 安装 Linux

给这台虚拟机开机。读到 ISO 之后会进 Ubuntu 的安装程序。

1. 选安装 Ubuntu，不要只试用一下就关掉。
2. 语言和键盘选你看得懂的。
3. 磁盘选清除整块磁盘并安装。这块盘就是上一步那 40GB。
4. 创建你自己的用户名和密码。以后就用这个人登录。
5. 装完按提示重启。

重启如果又进了安装程序，是 ISO 还挂着。安装程序要你取出安装盘时，到虚拟机设置里找到 CD/DVD，取消「启动时连接」，或者把 ISO 拿掉，再回车。这一次应该从虚拟磁盘启动，出现登录界面或桌面。用你刚建的用户进去。

日常就用这个用户。要管理员权限时，在命令前加 `sudo`，输入的是你自己的密码。不要把系统改成一开机就是 root。

## 5. 打快照

先让窗口和剪贴板好用。在虚拟机里打开终端，执行：

```bash
sudo apt update
sudo apt install open-vm-tools open-vm-tools-desktop
```

密码输入时屏幕不显示，输完回车。装完把虚拟机重启一次。

然后打快照。在 VMware 的虚拟机菜单里找快照（Snapshot），拍一张，名字写成「刚装好」。后面改乱了，就恢复到这张，这张之后的改动会消失。

想不看桌面、从 Windows 连进来，再装 SSH。仍在虚拟机的终端里：

```bash
sudo apt install openssh-server
ip addr
```

跳过 `lo` 和 `127.0.0.1`。找带 `inet` 的那一行，斜杠前面是 IP，例如 `192.168.146.128`。这只是一个样子，你的数字以屏幕上为准。

回到 Windows 的 PowerShell：

```bash
ssh 你的用户名@刚才的IP
```

端口是 22，一般不用写。第一次问你信不信任，输入 `yes`，再输入虚拟机里那个用户的密码。提示符变成你的用户名，人就已经在虚拟机里了。

> [!NOTE]
> Windows 提示找不到 `ssh`：到「设置 → 应用 → 可选功能」里安装 OpenSSH 客户端。NAT 下 IP 重启后可能变，连不上就再跑一次 `ip addr`。

五步走完，就是这张图。步骤名字和上面几节是同一套。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-fresh-steps" viewBox="0 0 680 520" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>下 Workstation，下 ISO，新建虚拟机，安装 Linux，打快照</title>
  <style>
    .diag-py-fresh-steps { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f8d6d8; --fill-teal:#d4eeea; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-fresh-steps { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c2428; --fill-teal:#1a4d4d; }
  </style>
  <rect x="80" y="16" width="520" height="76" rx="14" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8"/>
  <text x="340" y="42" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor">下 Workstation</text>
  <text x="340" y="68" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">官网的 Windows 版</text>
  <line x1="340" y1="92" x2="340" y2="108" stroke="var(--gray)" stroke-width="1.6"/><path d="M340,116 L335,108 L345,108 Z" fill="var(--gray)"/>
  <rect x="80" y="120" width="520" height="76" rx="14" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8"/>
  <text x="340" y="146" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor">下 Ubuntu 的 ISO</text>
  <text x="340" y="172" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">选当前的长期支持版</text>
  <line x1="340" y1="196" x2="340" y2="212" stroke="var(--gray)" stroke-width="1.6"/><path d="M340,220 L335,212 L345,212 Z" fill="var(--gray)"/>
  <rect x="80" y="224" width="520" height="76" rx="14" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8"/>
  <text x="340" y="250" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor">新建虚拟机</text>
  <text x="340" y="276" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">挂上 ISO，网卡用 NAT</text>
  <line x1="340" y1="300" x2="340" y2="316" stroke="var(--gray)" stroke-width="1.6"/><path d="M340,324 L335,316 L345,316 Z" fill="var(--gray)"/>
  <rect x="80" y="328" width="520" height="76" rx="14" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8"/>
  <text x="340" y="354" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor">安装 Linux</text>
  <text x="340" y="380" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">虚拟磁盘，建自己的用户</text>
  <line x1="340" y1="404" x2="340" y2="420" stroke="var(--gray)" stroke-width="1.6"/><path d="M340,428 L335,420 L345,420 Z" fill="var(--gray)"/>
  <rect x="80" y="432" width="520" height="76" rx="14" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.8"/>
  <text x="340" y="458" font-size="18" text-anchor="middle" dominant-baseline="central" fill="currentColor">打快照</text>
  <text x="340" y="484" font-size="15" text-anchor="middle" dominant-baseline="central" fill="currentColor">名字写成「刚装好」</text>
</svg>
</figure>

先下 Workstation，再下 ISO。新建虚拟机时把这张 ISO 挂上，网卡用 NAT。安装时用的是虚拟磁盘，同时建好你的用户。最后卸掉 ISO，确认进的是系统，再打快照。SSH 不是必做，要远程时再开。

## 6. 小项目：装到能登录，并试一次快照

按上面五步做完，留下两样东西：

1. 能用你的用户名登录。桌面或登录界面是系统，不是安装程序。终端里 `whoami` 打出的是你的用户名，不是 `root`。
2. 一张名叫「刚装好」的快照。

然后试快照管不管用。登录后执行：

```bash
cd
touch snapshot-test.txt
```

回到 VMware，把虚拟机恢复到「刚装好」，再登录，看家目录里还有没有 `snapshot-test.txt`。没有，说明恢复生效了。

## 7. 课后小项目

**练习一：自己装到能登录（必做）**

从 Workstation 和 Ubuntu 的 ISO 下起，新建虚拟机，装完，用你创建的用户登录。把 `whoami` 的输出记下来。

**练习二：再拍一张**

在「刚装好」之后改一点看得见的东西，比如壁纸，或新建一个空文件。恢复快照，确认改动消失。再拍一张，名字写成「练习完」。

**练习三：从 Windows 连一次**

装上 `openssh-server`，用 `ip addr` 抄下你自己的 IP，在 Windows 里执行 `ssh 用户名@IP`。连上后跑 `pwd`，人应该在你的家目录里。

## 8. 小结

Windows 上跑 VMware，VMware 里是一台新建的 Linux。安装盘是 Ubuntu 官网当前的长期支持版。虚拟机用 2 核、4GB 内存、40GB 磁盘、NAT。登录用你自己的用户。装完卸掉 ISO，打一张「刚装好」。要远程，再用 `ip addr` 看到的地址、端口 22 和这个用户名。

下一篇就在这台机器里敲命令：[第 22 篇：Linux 基础命令](/post/python-linux-commands/)。
