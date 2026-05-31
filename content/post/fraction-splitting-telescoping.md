---
title: '裂项相消法：从分数拆分看透数列求和的本质'
date: 2026-05-31T10:00:00+08:00
lastmod: 2026-05-31T10:00:00+08:00
cover: /images/covers/fraction-splitting-cover.jpg
math: true
tags:
  - 数学
  - 数列
  - 裂项相消
categories:
  - 数学笔记
---

## 一、从最简单的分数拆分开始

先看几个很普通的式子：

$$\frac{1}{1\times2}=1-\frac12$$

$$\frac{1}{2\times3}=\frac12-\frac13$$

$$\frac{1}{5\times6}=\frac15-\frac16$$

这些式子并不高级，本质就是通分。

比如：

$$\frac15-\frac16=\frac{6-5}{5\times6}=\frac1{5\times6}$$

于是可以得到一般规律：

$$\frac{1}{n(n+1)}=\frac1n-\frac1{n+1}$$

这就是数列求和里非常重要的思想：**裂项相消**。

---

## 二、为什么裂项相消这么有用？

如果要求：

$$\frac{1}{1\times2}+\frac{1}{2\times3}+\frac{1}{3\times4}+\cdots+\frac{1}{n(n+1)}$$

把每一项都拆开：

$$\left(1-\frac12\right)+\left(\frac12-\frac13\right)+\left(\frac13-\frac14\right)+\cdots+\left(\frac1n-\frac1{n+1}\right)$$

中间的部分会一正一负全部抵消，最后只剩：

$$1-\frac1{n+1}$$

这就是"相消"的力量。

原来看起来很长的一串数列，其实只要找到拆分方式，就能瞬间变短。

---

## 三、如果两个数不是相邻的怎么办？

比如：

$$\frac1{2\times5}$$

2 和 5 中间差了 3，不是相邻数。

我们可以这样拆：

$$\frac1{2\times5}=\frac13\left(\frac12-\frac15\right)$$

因为：

$$\frac12-\frac15=\frac{5-2}{2\times5}=\frac3{2\times5}$$

所以要再乘一个 $\frac13$。

一般地：

$$\frac1{n(n+k)}=\frac1k\left(\frac1n-\frac1{n+k}\right)$$

这里的关键不是死背公式，而是看懂：**分母中两个数差多少，前面就要除以多少**。

---

## 四、三个连续因子的裂项

再往上走一层，比如：

$$\frac1{n(n+1)(n+2)}$$

它也可以裂项：

$$\frac1{n(n+1)(n+2)}=\frac12\left[\frac1{n(n+1)}-\frac1{(n+1)(n+2)}\right]$$

为什么前面是 $\frac12$？

因为：

$$\frac1{n(n+1)}-\frac1{(n+1)(n+2)}=\frac{2}{n(n+1)(n+2)}$$

所以要乘 $\frac12$，才能变成原来的式子。

这其实还是通分，只是形式更复杂了。

---

## 五、从"分数裂项"反过来看"乘积求和"

裂项不仅能处理分数，也可以反过来处理乘积求和。

比如要求：

$$1\times2+2\times3+3\times4+\cdots+n(n+1)$$

可以把每一项写成两个更大乘积的差：

$$k(k+1)=\frac13\left[k(k+1)(k+2)-(k-1)k(k+1)\right]$$

因为括号里两个式子相减后，中间公共的 $k(k+1)$ 会留下一个差值 3：

$$k(k+1)[(k+2)-(k-1)] = 3k(k+1)$$

所以前面要乘 $\frac13$。

于是：

$$1\times2+2\times3+\cdots+n(n+1)=\frac13 n(n+1)(n+2)$$

例如：

$$1\times2+2\times3+\cdots+99\times100=\frac13\times99\times100\times101$$

这比一项一项加快得多。

---

## 六、平方和公式也可以这样理解

常见的平方和公式是：

$$1^2+2^2+3^2+\cdots+n^2=\frac{n(n+1)(2n+1)}6$$

很多人只会背，但我们可以把它拆成更熟悉的东西。

注意：

$$k^2=k(k-1)+k$$

所以：

$$1^2+2^2+3^2+\cdots+n^2$$

可以拆成：

$$[0\times1+1\times2+2\times3+\cdots+(n-1)n]+[1+2+3+\cdots+n]$$

第一部分是前面讲过的乘积求和：

$$0\times1+1\times2+\cdots+(n-1)n=\frac{(n-1)n(n+1)}3$$

第二部分是等差数列求和：

$$1+2+3+\cdots+n=\frac{n(n+1)}2$$

合起来：

$$\frac{(n-1)n(n+1)}3+\frac{n(n+1)}2$$

通分整理后得到：

$$\frac{n(n+1)(2n+1)}6$$

这就是平方和公式的来源。