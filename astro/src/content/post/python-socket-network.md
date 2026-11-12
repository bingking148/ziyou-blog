---
title: '网络与并发 第 1 篇：网络编程，让程序隔着网络说话'
weight: 1
cover: /images/covers/python-socket-network-cover.jpg
date: 2026-11-03T09:00:00+08:00
updatedDate: 2026-11-12T20:30:00+08:00
categories: ['人工智能', 'Python网络与并发']
tags: ['Python', '编程基础', '网络编程', 'socket']
description: '让程序隔着网络收发：socket 是什么、服务器怎么等连接、客户端怎么把消息送过去，最后跑通一个能对话的收发程序。'
math: false
mermaid: false
comments: true
toc: true
---

到这里，程序还只在一台电脑里算完，再写回硬盘。浏览器打开的网页、手机拉来的消息、调大模型时发出的请求，数据都在网络里来回跑。

这一篇让程序开口说话，学 Python 网络编程最基础的一环：socket。

## 1. socket 是什么

socket 翻译过来叫「套接字」，听着玄乎，其实就是**网络上两个程序之间的一个通信端点**。你可以把它想象成一根电话线的两端：一端是你，一端是对方，接通之后两边都能说、都能听。

Python 里创建一个 socket 对象：

```python
import socket

socket_object = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print(socket_object)
```

两个参数各管一件事：

1. `AF_INET` 是地址家族，意思是「用 IPv4」；对应的还有 `AF_INET6`（IPv6）；
2. `SOCK_STREAM` 是 socket 类型，意思是「用 TCP 协议」；对应的还有 `SOCK_DGRAM`（UDP）。

新手第一次接触，记这一对就行：**IPv4 + TCP**，也就是 `socket.AF_INET, socket.SOCK_STREAM`。TCP 是可靠的、按顺序的传输，绝大多数网页、API 请求都走它。

## 2. 服务器端：等着别人连进来

通信总要有一方先「摆好摊」等着，这一方叫服务器端。服务器端的流程是固定的：创建 socket → 绑定地址 → 开始监听 → 接受连接 → 收发数据 → 关闭。

```python
import socket

# 1.创建服务器端 socket：IPv4 + TCP
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# 2.绑定 IP 地址和端口号
server_socket.bind(('192.168.1.13', 10086))

# 3.开始监听，5 是最大等待连接数
server_socket.listen(5)

# 4.等客户端连进来，accept 会阻塞在这里
accept_socket, client_info = server_socket.accept()
print(f'accept_socket: {accept_socket}')
print(f'client_info: {client_info}')

# 5.给客户端发消息
accept_socket.send(b'Welcome to Socket!')

# 6.收客户端的消息并打印
data = accept_socket.recv(1024).decode('utf-8')
print(f'服务器端接收来自 {client_info} 的信息：{data}')

# 7.释放资源
accept_socket.close()
```

几个地方解释一下：

1. `bind(('192.168.1.13', 10086))` 里的地址是元组 `(ip, 端口号)`。端口号就是程序在机器上的「门牌」，一台机器上不同程序靠不同的端口号区分；
2. `accept()` 会**卡住**——没有客户端连进来，程序就一直等在这里，不往下走。它返回两个值：一个专门用于这次通信的新 socket，以及客户端的地址信息；
3. `send(b'...')` 前面加 `b` 表示这是**字节**。网络上传输的是字节流，所以发字符串要先 `.encode('utf-8')`，收下来要 `.decode('utf-8')`；
4. `recv(1024)` 的 1024 是「一次最多收 1024 个字节」。

## 3. 客户端：主动连上去

客户端不用监听，直接去连服务器的地址：

```python
import socket

# 1.创建客户端 socket
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# 2.连接服务器，同样用 (ip, 端口) 元组
client_socket.connect(('192.168.1.13', 10086))

# 3.收服务器的消息
data = client_socket.recv(1024).decode('utf-8')
print(f'客户端接收到：{data}')

# 4.给服务器发消息
client_socket.send('Socket很好玩，很有趣，我很喜欢'.encode('utf-8'))

# 5.关闭
client_socket.close()
```

客户端和服务器是对称的：服务器 `accept` 到的那个新 socket，和客户端 `connect` 之后的 socket，就是这根「电话线」的两端，一个 `send`、另一个就 `recv` 到。

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-accept-second-socket" viewBox="0 0 680 400" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>服务器 listen 的套接字只负责等连接，accept 得到的是另一根通信用的 socket</title>
  <style>
    .diag-accept-second-socket { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-accept-second-socket { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M34,39 Q169.5,40.8 306,39.7 Q320.3,40.1 320.3,54 Q320.4,190.2 320.5,326 Q320,339.7 306,340.7 Q169.4,339.7 34,339.1 Q19.6,340.2 20.5,326 Q19.4,190 19.1,54 Q20.4,40.2 34,39 Z" fill="none" stroke="var(--blue)" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="170" y="64" font-size="18" text-anchor="middle" dominant-baseline="central" fill="var(--blue)" font-weight="bold">服务器</text>
  <text x="170" y="86" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">(192.168.1.13, 10086)</text>
  <path d="M70,121 Q169.5,119.6 270,120.9 Q279.9,119.8 279.9,130 Q279.5,154.8 279.6,180 Q279.9,189.8 270,189.1 Q170.2,190.9 70,190.1 Q59.6,189.9 59.5,180 Q60.7,155.5 60.4,130 Q59.7,120.1 70,121 Z" fill="var(--fill-gray)" stroke="var(--gray)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="170" y="144.4" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">socket · listen</text><text x="170" y="165.6" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">等连接</text>
  <text x="170" y="210" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--blue)" font-weight="bold">accept</text>
  <line x1="170" y1="190" x2="170" y2="222" stroke="var(--blue)" stroke-width="1.8" stroke-linecap="round"/><path d="M170,230 L173.2,222 L166.8,222 Z" fill="var(--blue)"/>
  <path d="M70,236.8 Q170.6,235.9 270,236.9 Q280,235.6 280.4,246 Q281,271.4 279.2,296 Q279.8,306.3 270,305.2 Q169.7,305 70,306.8 Q59.8,305.9 59.6,296 Q59.2,271.3 59.7,246 Q60.3,236.2 70,236.8 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="170" y="260.4" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">新 socket</text><text x="170" y="281.6" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">这次通信</text>
  <path d="M514,39.7 Q579.8,39.2 646,39.1 Q659.7,39.7 660.7,54 Q659.3,190.1 659.5,326 Q660.3,340.2 646,340.8 Q579.8,339.9 514,340.9 Q500.3,339.8 499.9,326 Q500.4,189.8 500.2,54 Q500,40.2 514,39.7 Z" fill="none" stroke="var(--amber)" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="580" y="64" font-size="18" text-anchor="middle" dominant-baseline="central" fill="var(--amber)" font-weight="bold">客户端</text>
  <path d="M530,235.1 Q580.6,235.2 630,235.1 Q639.9,236.1 640.9,246 Q639.7,270.6 639.7,296 Q640.3,306.2 630,305.1 Q579.4,306 530,305.3 Q520.1,305.9 520.8,296 Q519.8,270.9 520.5,246 Q520,235.8 530,235.1 Z" fill="var(--fill-amber)" stroke="var(--amber)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="580" y="260.4" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">socket</text><text x="580" y="281.6" font-size="16" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-weight="bold">connect</text>
  <line x1="280" y1="271" x2="520" y2="271" stroke="var(--green)" stroke-width="3" stroke-linecap="round"/>
  <text x="400" y="250" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--green)" font-weight="bold">send</text>
  <text x="400" y="296" font-size="15" text-anchor="middle" dominant-baseline="central" fill="var(--green)" font-weight="bold">recv</text>
  <text x="400" y="330" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">这根「电话线」的两端</text>
  <text x="170" y="360" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">监听用的那个不进这根线</text>
</svg>
</figure>


## 4. 一个能循环服务的服务器

上面第 2 节的服务器只服务一个客户端就结束了。真实的服务器要一直开着，来一个处理一个，还要处理各种意外：

```python
import socket

server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# 让端口在服务器重启后能立刻再次使用
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, True)
server_socket.bind(('127.0.0.1', 10086))
server_socket.listen(5)

try:
    while True:
        accept_socket, client_info = server_socket.accept()
        print(f'客户端【{client_info}】已经连接')

        try:
            accept_socket.send(b'Welcome to Socket!')
            data = accept_socket.recv(1024)

            if data:
                print(f'服务器端接收来自【{client_info}】的信息：{data.decode("utf-8")}。')
            else:
                print(f'客户端【{client_info}】未发送数据即断开！')
        except (ConnectionResetError, BrokenPipeError) as e:
            print(f'与【{client_info}】通信异常：{e}')
        finally:
            accept_socket.close()
except KeyboardInterrupt:
    print('\n服务器手动关闭！')
finally:
    server_socket.close()
```

这段比第 2 节多了四样，都是真实服务器必须考虑的：

1. `setsockopt(SO_REUSEADDR, True)`——不写它，服务器 Ctrl+C 关掉后，端口要等一会儿才能重新用；
2. 外层 `while True` 循环——处理完一个客户端，接着等下一个，服务器不退出；
3. `ConnectionResetError`、`BrokenPipeError`——客户端可能发一半就粗暴断开，不接住这两种异常，服务器会跟着崩；
4. `KeyboardInterrupt`——用户按 Ctrl+C 是「正常关机」，不是程序错误，单独接住给个提示。

跑起来后，先启动服务器，再开另一个窗口跑客户端，就能看到两边互相收发消息。测试时把 IP 换成 `127.0.0.1`——这是「本机」的地址，两个程序在同一台电脑上也能通。

## 5. 几个容易写错的地方

1. 端口被占用——`bind` 报错 `OSError: Address already in use`，多半是上个服务器没关干净。加 `SO_REUSEADDR`，或者换个端口号；
2. `send` 忘了 `encode`——网络传的是字节，直接发字符串报 `TypeError`。发的时候 `.encode('utf-8')`，收的时候 `.decode('utf-8')`；
3. 服务器忘了 `accept`——`listen` 只是开始监听，不 `accept` 就永远收不到连接；
4. 客户端连不上——`connect` 报 `ConnectionRefusedError`，多半是服务器没启动，或 IP/端口写错了；
5. `recv` 一次收不全——1024 字节是上限不是保证，大消息可能要循环 `recv` 拼起来。本阶段用 `send` 发、`recv` 收短消息，不用管这个；
6. 服务器只服务一次就退出——`accept` 和收发要放进 `while True` 循环里，才能一个接一个地服务。

## 6. 课后小项目

**练习一：回话机器人（必做）**

写一个服务器，客户端连上来发什么，服务器就原样回一句「你说的是：xxx」。先跑服务器，再跑客户端，亲眼看到消息在两边来回。地址用 `127.0.0.1` 和任意一个端口。

**练习二：一问一答**

改练习一：客户端循环输入、循环发送，服务器每次收到都回一句；客户端输入 `bye` 时两边一起退出。看看「服务器一直开着、客户端随时进出」是什么感觉。

**练习三：给服务器加日志**

用[《Python 文件与数据》第 1 篇](/post/python-file-operations/)的文件操作，让服务器每处理一条消息，就往 `server.log` 里追加一行「时间 + 客户端地址 + 收到的内容」。网络编程和文件操作在同一个程序里碰头。

**练习四：收发 JSON**

把[《Python 文件与数据》第 2 篇](/post/python-file-formats/)的 JSON 用起来：客户端把字典 `{'user': 'alice', 'msg': '你好'}` 用 `json.dumps` 转成字符串再 `encode` 发送，服务器收到后 `decode` 再 `json.loads` 还原成字典打印。看看结构化的数据在网络里是怎么传的。

## 7. 小结

网络编程就一条线：服务器 `bind → listen → accept → 收发 → close`，客户端 `connect → 收发 → close`，两边靠 `(ip, 端口)` 元组对上号，消息用 `encode` 发、`decode` 收。地址测试用 `127.0.0.1`，端口被占用就换一个。

程序能跨机器说话了。但同一时刻还是只干一件事。下一篇讲进程和线程，让程序同时干好几件——[网络与并发 第 2 篇：进程与线程](/post/python-process-thread/)。
