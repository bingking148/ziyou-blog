---
title: 'Python 第 16 篇：网络编程，让程序隔着网络说话'
weight: 16
cover: /images/covers/python-socket-network-cover.jpg
date: 2026-11-03T09:00:00+08:00
lastmod: 2026-11-06T10:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '网络编程', 'socket']
description: '前面所有程序都只在一台电脑里自说自话。这篇把程序连上网：socket 是什么、服务器端怎么绑定端口等连接、客户端怎么连上去收发消息，最后跑通一个能隔空对话的收发程序。'
math: false
mermaid: false
comments: true
toc: true
---

前面十六篇写的程序，全都只在一台电脑里自说自话——数据从硬盘读进来，算完再写回硬盘，从来没出过这台机器。可真实的程序不是这样的：你浏览器访问的网页、手机 App 拉取的消息、调大模型 API 时发的请求，数据都在网络里来回跑。

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

用第 11 篇的文件操作，让服务器每处理一条消息，就往 `server.log` 里追加一行「时间 + 客户端地址 + 收到的内容」。网络编程和文件操作在同一个程序里碰头。

**练习四：收发 JSON**

把第 13 篇的 JSON 用起来：客户端把字典 `{'user': 'alice', 'msg': '你好'}` 用 `json.dumps` 转成字符串再 `encode` 发送，服务器收到后 `decode` 再 `json.loads` 还原成字典打印。看看结构化的数据在网络里是怎么传的。

## 7. 小结

网络编程就一条线：服务器 `bind → listen → accept → 收发 → close`，客户端 `connect → 收发 → close`，两边靠 `(ip, 端口)` 元组对上号，消息用 `encode` 发、`decode` 收。地址测试用 `127.0.0.1`，端口被占用就换一个。

程序能跨机器说话了。但有个问题一直没碰：程序现在还是一件一件做事的，同一时刻只能干一件事。下一篇讲进程和线程，让程序「同时」干好几件事——[第 17 篇：进程与线程](/post/python-process-thread/)。
