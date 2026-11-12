---
title: 'Python 第 21 篇：用 VMware 装好 Linux 虚拟机'
weight: 21
cover: /images/covers/python-linux-vm-cover.jpg
date: 2026-11-11T09:00:00+08:00
lastmod: 2026-11-11T09:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', 'Linux', 'VMware']
description: '在 Windows 上用 VMware 导入课堂那台 CentOS，网卡保持 NAT，再用 SSH 以 root 连上 192.168.88.100 的 22 端口。通不通，从近到远 ping。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇的接口在你自己的 Windows 上能跑。真要放到一台 Linux 上，先得有那台机器。课堂不另买电脑，做法是：在现有的 Windows 里装 VMware，再导入一台已经装好 CentOS 的虚拟机，用 SSH 连进去。

这一篇不敲 `ls`、`chmod` 那些命令。命令在 [第 22 篇：Linux 基础命令](/post/python-linux-commands/)。这里只做一件事：把虚拟机打开，并且从你的电脑连上去。

## 1. 三层：电脑、VMware、虚拟机

课堂的机器是一台联想电脑，上面是 Windows 10 或 11。VMware 是装在 Windows 里的虚拟化软件，里面再开虚拟机。一台装 CentOS，一台可以装 Ubuntu，旁边还能开腾讯会议和浏览器。虚拟机不是「一个文件夹」，它是一台用软件造出来的电脑，有自己的系统。

连上去用 SSH：IP 地址、端口号 22、用户名和密码。课堂这台是 `192.168.88.100`，用户 `root`，端口 22。Windows 只负责开窗口，后面的命令都在虚拟机里敲。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-py-linux-stack" viewBox="0 0 680 420" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>Windows 上的 VMware 里跑 CentOS，SSH 用 IP、22 端口和用户名连进去</title>
  <style>
    .diag-py-linux-stack { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#c41e3a; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f8d6d8; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-py-linux-stack { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#ff6a5c; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c2428; --fill-gray:#2a2d33; }
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

## 2. 导入虚拟机

顺序按课件来，不要跳：

1. 把 `ai_node1.zip` 解压。压缩包旁边会有一份说明文档，那是完整文档，不是安装包。
2. 用 VMware 打开解压出来的 `ai_node1.vmx`。
3. 网卡保持 NAT。课堂要的是：主机能上网，虚拟机就能上网，IP 固定成 `192.168.88.100`。
4. 用 `root` 登录。登录后敲 `ifconfig`，看有没有 `inet 192.168.88.100`。网卡名可能是 `ens33`，也可能是别的，以 `ifconfig` 里看到的为准。

> [!NOTE]
> NAT 的意思是：虚拟机借用你这台 Windows 的网络出去。课堂把网关留在 `192.168.88.2`。IP 不是 `.100`，多半是镜像里留着旧配置，得改网卡配置再启用，不是 SSH 软件坏了。

## 3. 用 SSH 连进去

Windows 上用 MobaXterm 或同类工具建会话：Remote host 填 `192.168.88.100`，username 填 `root`，端口 `22`。也可以直接：

```bash
ssh root@192.168.88.100
```

提示输入密码就输入。进去之后，提示符会变成 `[root@node1 ~]#` 这一类。看到这个，人已经在虚拟机里了，不在 Windows 的命令行里。

> [!WARNING]
> 端口写错、IP 写错，SSH 会一直转圈或直接拒绝。先核对这三个数：`192.168.88.100`、`22`、`root`。不要去改虚拟机里还没看懂的配置文件。

## 4. 小项目：确认这台机器真的通了

登录之后，从近到远敲。每一行都要有回复，再敲下一行。`ping` 不加次数会一直刷，用 `-c 3`，或者 `Ctrl + C` 停下。

```bash
ping -c 3 127.0.0.1
ifconfig
ping -c 3 192.168.88.2
ping -c 3 8.8.8.8
ping -c 3 www.baidu.com
```

每一行在查什么：

1. `127.0.0.1`：自己。自己都 ping 不通，先重启虚拟机。
2. `ifconfig`：要看到 `inet 192.168.88.100`。没有 `inet`，配置没生效。
3. `192.168.88.2`：课堂 NAT 的网关。不通，就是子网或网关写错。
4. `8.8.8.8`：IP 通、域名不通，才是 DNS。
5. `www.baidu.com`：这一下通了，说明虚拟机出去了。

五步都通，这台 CentOS 就可以拿来敲命令。

## 5. 课后小项目

**练习一：按顺序导入并登录（必做）**

解压 `ai_node1.zip`，用 VMware 打开 `ai_node1.vmx`，确认网卡是 NAT，再用 `ssh root@192.168.88.100` 登录。把 `ifconfig` 里带 `inet` 的那一行抄下来。

**练习二：从近到远各 ping 一次**

把第 4 节的五行再敲一遍。哪一行先失败，就停在那一行，不要跳到百度。

**练习三：让 ping 自己停**

先敲 `ping 192.168.88.2`，看它一直刷。用 `Ctrl + C` 停掉。再敲 `ping -c 3 192.168.88.2`，确认它自己停在第三下。

## 6. 小结

Windows 上跑 VMware，VMware 里跑 CentOS。SSH 靠三样东西：IP `192.168.88.100`、端口 `22`、用户名 `root`。网卡用 NAT。通不通从自己、本机 IP、网关、外网 IP、域名，由近到远看。

机器通了，下一篇才开始敲命令：[第 22 篇：Linux 基础命令](/post/python-linux-commands/)。
