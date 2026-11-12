---
title: '文件与数据 第 3 篇：赋值、浅拷贝与深拷贝，一个雷坑出两个 bug'
weight: 3
cover: /images/covers/python-shallow-deep-copy-cover.jpg
date: 2026-11-02T11:00:00+08:00
updatedDate: 2026-11-12T20:30:00+08:00
categories: ['人工智能', 'Python', 'Python文件与数据']
tags: ['Python', '编程基础', '深浅拷贝', '可变对象']
description: '`b = a` 之后改 b，a 为什么也跟着变？`id()`、`is` 和 `==` 有什么区别？切片、copy、deepcopy 各自的边界在哪？两个真实 bug——函数默认参数 box=[]、类属性 tags=[]——都从这里长出来。'
math: false
mermaid: false
comments: true
toc: true
---

先做一个实验。下面这段代码，你猜会打印什么？

```python
a = [1, 2, 3]
b = a
b.append(100)

print(a)   # ?
print(b)   # ?
```

很多人第一次猜：`a` 还是 `[1, 2, 3]`，`b` 变成 `[1, 2, 3, 100]`。

实际是：**两个都成了 `[1, 2, 3, 100]`。**

改的是 `b`，`a` 也跟着变了。这不是 bug，是 Python 里**最基础也最反直觉**的一条规则。这一篇把它讲到底——顺带拆掉两个它埋下的真 bug。

## 1. 变量名是指向值的标签

先把[《Python 基础》第 2 篇](/post/python-basics-for-ai/)的一个说法升级一下。那时说「变量是装数据的盒子」，这个比喻在整数、字符串身上挺好用，但遇到列表就露馅了。

更准确的图景是：**变量名是一张标签，贴在值上**。

```python
a = [1, 2, 3]
b = a
```

`[1, 2, 3]` 这个列表在内存里只有**一份**。`a` 是贴在上面的标签，`b = a` 是**又贴了一张标签在同一个列表上**——没有复制任何东西。

所以 `b.append(100)` 是在改那个**唯一的列表**，`a` 看到的自然也是改过的。两张标签，一个东西。

想验证「是不是同一个东西」，Python 给了两个工具：

```python
print(id(a))      # 内存地址，同一对象地址相同
print(id(b))

print(a is b)     # True：is 判断是不是同一个对象
print(a == b)     # True：== 判断值相不相等
```

- **`id()`**：返回对象的「身份证号」（内存地址）。同一个对象，`id` 相同；
- **`is`**：判断两个变量是否指向**同一个对象**；
- **`==`**：判断两个变量的**值**相不相等。

这俩最容易混。看：

```python
a = [1, 2, 3]
b = [1, 2, 3]     # 重新造了一个一模一样的列表

print(a == b)     # True：值一样
print(a is b)     # False：但这是两个不同的对象
```

`a` 和 `b` 是两个独立列表，恰好内容相同。`==` 看内容，`is` 看身份。记住一句：**`is` 比的是「是不是同一个」，`==` 比的是「是不是一样」**。

## 2. 不可变对象为什么没这毛病

可是整数、字符串这么赋值，怎么没事？

```python
x = 100
y = x
x = x + 1

print(x)   # 101
print(y)   # 100
```

`y` 没跟着变。因为 `int`、`str`、`tuple` 是**不可变对象**——它们自己改不了，想「改」只能造个新的：

```python
x = 100
x = x + 1      # 不是把 100 改成 101，而是新造一个 101，让标签 x 贴过去
```

`x + 1` 算出一个新的 101，`x` 这张标签从 100 上撕下来，贴到 101 上。`y` 还贴在 100 上，自然没动。你可以用 `id()` 验证：加一前后 `x` 的 `id` 变了，因为贴的是新对象。

**列表、字典、集合是可变对象**，能原地改（`append`、`[0]=...`），于是「两个标签贴同一个」的坑就来了。

所以规则是：**赋值从来不复制。** 不管可不可变，`=` 只是贴标签。区别只在可变对象能原地改，才让你看到「改一个、动一片」。

## 3. 浅拷贝：只复制外面一层

想真正得到一个独立的副本，用浅拷贝。三种写法，效果一样：

```python
import copy

a = [1, [2, 3]]

b1 = a.copy()
b2 = a[:]
b3 = list(a)
b4 = copy.copy(a)
```

这四种都是**浅拷贝**：复制出了一个新的外层列表，但**里面的元素还是原来那些**。

对于「只有一层」的列表，浅拷贝就够独立了：

```python
scores = [90, 85, 77]
backup = scores[:]
backup[0] = 100

print(scores)    # [90, 85, 77]  ← 没动
print(backup)    # [100, 85, 77]
```

`backup` 是新列表，改它不影响 `scores`。这正是第 1 篇做备份时 `[:]` 能当「备份」用的原因。

但数据一旦有嵌套，浅拷贝就不顶用了：

```python
classes = [['张三', '李四'], ['王五']]
snapshot = classes[:]          # 浅拷贝

snapshot[0].append('周周')     # 改的是内层列表

print(classes[0])              # ['张三', '李四', '周周']  ← 原列表也变了！
print(snapshot[0])             # ['张三', '李四', '周周']
print(classes[0] is snapshot[0])   # True：内层还是同一个对象
```

浅拷贝只复制了**外层**列表；外层里装着的内层列表，两张表里还是**同一个**。改内层，两边一起变。

图景：浅拷贝就像复印了目录页，但每个条目指向的还是原来的章节。目录是新的，内容还是共用的。

## 4. 深拷贝：里里外外全复制

想让嵌套结构也彻底独立，用 `deepcopy`：

```python
import copy

classes = [['张三', '李四'], ['王五']]
snapshot = copy.deepcopy(classes)

snapshot[0].append('周周')

print(classes[0])                 # ['张三', '李四']  ← 原列表这次没动
print(snapshot[0])                # ['张三', '李四', '周周']
print(classes[0] is snapshot[0])  # False：内层也是新对象了
```

`deepcopy` 会**递归**地复制：外层复制、内层复制、内层里再套一层也复制，直到最里面。复制完，两个结构完全独立，改谁都影响不到另一个。

代价是慢一点、占内存一点（毕竟真的多造了一套数据），所以只在**真需要完全独立**时才用。

### 4.1 不可变对象：浅拷贝、深拷贝都懒得复制

有个细节会让人困惑：

```python
import copy

s = 'python'
print(copy.copy(s) is s)      # True
print(copy.deepcopy(s) is s)  # True
```

对字符串这种不可变对象，`copy` 和 `deepcopy` 都会**直接返回原对象**——反正它不可变，复制一份纯属浪费内存。所以三个 `is` 全 True，这是优化，不是 bug。

## 5. 三个层次一句话

<figure style="text-align:center;margin:2.5rem 0 2rem;">
<svg class="diag-three-levels" viewBox="0 0 680 460" style="max-width:100%;height:auto;" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>赋值不复制，浅拷贝只复制一层，深拷贝把内层也复制成独立的一份</title>
  <style>
    .diag-three-levels { color:#3a4656; --blue:#3d6fb4; --amber:#c07a2e; --green:#3f8f6b; --red:#b3522e; --purple:#6d5b9a; --teal:#2a7a6d; --gray:#6b7380; --fill-blue:#d7e6f7; --fill-amber:#f3e3cc; --fill-green:#d7eee3; --fill-red:#f3d8ce; --fill-purple:#e6dff3; --fill-teal:#d4eeea; --fill-gray:#e8e6e1; font-family: "LXGW WenKai Screen", "LXGW WenKai", "Source Han Serif SC", "Noto Serif CJK SC", Georgia, serif; }
    [data-theme="dark"] .diag-three-levels { color:#aeb9c8; --blue:#8ab2e8; --amber:#e0a862; --green:#7cc3a0; --red:#e08a6a; --purple:#b7a7e0; --teal:#7ec9bc; --gray:#9aa3b0; --fill-blue:#1e3a5f; --fill-amber:#5c3d1a; --fill-green:#1a4d2e; --fill-red:#5c1a1a; --fill-purple:#2d1b69; --fill-teal:#1a4d4d; --fill-gray:#2a2d33; }
  </style>
  <path d="M22,16.5 Q117.7,15.5 214,15.4 Q226,15.8 225.8,28 Q226.4,229.7 226,432 Q225.9,443.7 214,444.8 Q117.9,443.4 22,443.8 Q10.2,444.4 10.2,432 Q9.4,230.3 10.3,28 Q10.2,15.8 22,16.5 Z" fill="none" stroke="var(--gray)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="118" y="38" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--gray)" font-weight="bold">赋值不复制</text>
  <text x="118" y="64" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">snapshot = classes</text>
  <text x="28" y="120" font-size="14" text-anchor="start" dominant-baseline="central" fill="currentColor" font-weight="bold">classes</text>
  <text x="28" y="150" font-size="14" text-anchor="start" dominant-baseline="central" fill="currentColor" font-weight="bold">snapshot</text>
  <line x1="100" y1="120" x2="132.6" y2="147.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M138,152 L134.4,145.3 L130.8,149.6 Z" fill="currentColor"/>
  <line x1="100" y1="150" x2="131.2" y2="158.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M138,160 L131.9,155.5 L130.5,160.9 Z" fill="currentColor"/>
  <path d="M104,152.4 Q138.6,152.8 172,151.6 Q182.3,151.6 182.1,162 Q182.6,180 182.3,198 Q182.2,207.8 172,208.9 Q138.5,208.3 104,208.8 Q94.3,207.7 94.6,198 Q93,180.2 95,162 Q94,152.1 104,152.4 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="138" y="180" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">外层列表</text>
  <line x1="138" y1="208" x2="102.8" y2="244.9" stroke="var(--blue)" stroke-width="1.4" stroke-linecap="round"/><path d="M98,250 L104.9,246.9 L100.8,243 Z" fill="var(--blue)"/>
  <line x1="138" y1="208" x2="173.2" y2="244.9" stroke="var(--blue)" stroke-width="1.4" stroke-linecap="round"/><path d="M178,250 L175.2,243 L171.1,246.9 Z" fill="var(--blue)"/>
  <path d="M56,250.7 Q98.4,250.8 140,251 Q148.1,249.7 149,258 Q148.9,280.7 148.5,304 Q147.7,312.3 140,312.6 Q97.8,311.9 56,312.1 Q48.3,311.9 47.6,304 Q48.6,280.7 48.9,258 Q47.8,249.9 56,250.7 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/><text x="98" y="266" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">张三</text><text x="98" y="286" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">李四</text>
  <path d="M156,249.5 Q197.5,250.7 240,249.4 Q248.1,249.7 247.5,258 Q248.9,270.9 247.5,284 Q248.1,292.4 240,292 Q197.7,291.7 156,291.2 Q148.2,292.1 147.1,284 Q147.9,271.4 147.4,258 Q147.7,249.7 156,249.5 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/><text x="198" y="266" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">王五</text>
  <text x="118" y="400" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">内外都是同一份</text>
  <path d="M246,15.5 Q341.7,16.7 438,15.1 Q450.3,15.7 449.4,28 Q449.7,229.9 450.6,432 Q449.9,444.3 438,444.4 Q342.5,444.3 246,443.1 Q233.8,444.2 233.5,432 Q234,230.4 233.3,28 Q234.1,16.2 246,15.5 Z" fill="none" stroke="var(--amber)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="342" y="38" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--amber)" font-weight="bold">浅拷贝复制一层</text>
  <text x="342" y="64" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">snapshot = classes[:]</text>
  <text x="250" y="120" font-size="14" text-anchor="start" dominant-baseline="central" fill="currentColor" font-weight="bold">classes</text>
  <path d="M330,104.8 Q360.6,103.6 390,103.1 Q400,103.8 400.2,114 Q400.3,121.8 400.1,130 Q400,140.4 390,139.7 Q360.3,139.9 330,139.5 Q320.3,139.9 320.6,130 Q320.3,121.6 320.1,114 Q320,104.1 330,104.8 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="360" y="122" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">外层 A</text>
  <text x="250" y="200" font-size="14" text-anchor="start" dominant-baseline="central" fill="currentColor" font-weight="bold">snapshot</text>
  <path d="M330,184.4 Q359.8,184.4 390,184.5 Q400.1,184 400.4,194 Q400.3,202.1 399.4,210 Q400,220.1 390,219.3 Q359.7,219.7 330,219.5 Q320,219.7 319.2,210 Q319.3,202.6 320.8,194 Q319.6,184.4 330,184.4 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="360" y="202" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">外层 B</text>
  <path d="M300,279.7 Q347.6,280.3 394,280 Q401.6,279.9 402,288 Q401,318.7 402.6,350 Q402,357.9 394,357.4 Q346.8,358.7 300,358.2 Q291.7,357.7 292.7,350 Q291.9,318.6 291.6,288 Q291.8,279.7 300,279.7 Z" fill="var(--fill-red)" stroke="var(--red)" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="347" y="298" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">张三</text>
  <text x="347" y="318" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">李四</text>
  <text x="347" y="340" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--red)" font-weight="bold">周周</text>
  <line x1="360" y1="140" x2="347.6" y2="273" stroke="var(--red)" stroke-width="1.5" stroke-linecap="round"/><path d="M347,280 L350.4,273.3 L344.9,272.8 Z" fill="var(--red)"/>
  <line x1="360" y1="220" x2="348.5" y2="273.2" stroke="var(--red)" stroke-width="1.5" stroke-linecap="round"/><path d="M347,280 L351.2,273.8 L345.7,272.6 Z" fill="var(--red)"/>
  <line x1="384" y1="140" x2="421.6" y2="243.4" stroke="var(--blue)" stroke-width="1.3" stroke-linecap="round"/><path d="M424,250 L424.2,242.5 L419,244.4 Z" fill="var(--blue)"/>
  <line x1="384" y1="220" x2="418.4" y2="245.8" stroke="var(--blue)" stroke-width="1.3" stroke-linecap="round"/><path d="M424,250 L420.1,243.6 L416.7,248 Z" fill="var(--blue)"/>
  <path d="M404,251 Q417.9,249.9 432,250.1 Q442.3,249.7 441.6,260 Q441,265.8 441.5,272 Q442.2,282.2 432,281.6 Q417.6,282.4 404,282.4 Q393.7,282.4 394.3,272 Q393.3,265.7 393.1,260 Q393.7,250.1 404,251 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="418" y="266" font-size="13" text-anchor="middle" dominant-baseline="central" fill="currentColor">王五</text>
  <text x="342" y="378" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--red)" font-weight="bold">append(&#x27;周周&#x27;)</text>
  <text x="342" y="400" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--red)">两边一起变</text>
  <path d="M470,16.6 Q565.8,15 662,15.4 Q674,16 673.4,28 Q673.9,229.5 674.5,432 Q674.3,444.3 662,443 Q565.5,444 470,444.9 Q457.7,443.8 458,432 Q457.5,229.8 457.7,28 Q457.6,16 470,16.6 Z" fill="none" stroke="var(--green)" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="566" y="38" font-size="16" text-anchor="middle" dominant-baseline="central" fill="var(--green)" font-weight="bold">深拷贝复制全部</text>
  <text x="566" y="54.8" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">snapshot =</text><text x="566" y="73.2" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--gray)">copy.deepcopy(classes)</text>
  <text x="474" y="120" font-size="14" text-anchor="start" dominant-baseline="central" fill="currentColor" font-weight="bold">classes</text>
  <path d="M554,103.8 Q584.1,103.1 614,104.9 Q624.3,103.9 623,114 Q623.3,121.8 623.5,130 Q623.8,140 614,139.8 Q584,140.1 554,140.9 Q543.8,140.1 543.6,130 Q544.7,121.6 544.8,114 Q544.3,103.9 554,103.8 Z" fill="var(--fill-blue)" stroke="var(--blue)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="584" y="122" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">外层 A</text>
  <text x="474" y="248" font-size="14" text-anchor="start" dominant-baseline="central" fill="currentColor" font-weight="bold">snapshot</text>
  <path d="M554,231.9 Q584.1,231.9 614,231.8 Q623.7,231.6 623.8,242 Q623.5,250.5 624,258 Q624,268.2 614,267.8 Q584,268.5 554,269 Q544.3,267.8 545,258 Q544.8,249.9 544.2,242 Q544.1,231.9 554,231.9 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="584" y="250" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">外层 B</text>
  <line x1="568" y1="140" x2="514.3" y2="165" stroke="var(--blue)" stroke-width="1.4" stroke-linecap="round"/><path d="M508,168 L515.5,167.6 L513.2,162.5 Z" fill="var(--blue)"/>
  <path d="M484,168.6 Q519.2,168.1 554,167 Q563.6,167.8 564.7,178 Q563.9,189.7 563.7,202 Q564.2,212.2 554,212.7 Q519.6,212.2 484,212.5 Q474.1,211.7 474.3,202 Q474.6,190.3 474.5,178 Q474.1,167.8 484,168.6 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="519" y="180.8" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">张三</text><text x="519" y="199.2" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">李四</text>
  <path d="M584,168.1 Q609.5,168.3 634,167.8 Q644,167.7 645,178 Q644.8,183.4 643.4,190 Q644.1,200.2 634,199.5 Q609.1,199 584,199.6 Q574.2,200.4 573.4,190 Q573.8,183.9 573,178 Q574,168.3 584,168.1 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="609" y="184" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">王五</text>
  <line x1="608" y1="140" x2="608" y2="161" stroke="var(--blue)" stroke-width="1.4" stroke-linecap="round"/><path d="M608,168 L610.8,161 L605.2,161 Z" fill="var(--blue)"/>
  <line x1="568" y1="268" x2="514.3" y2="293" stroke="var(--green)" stroke-width="1.4" stroke-linecap="round"/><path d="M508,296 L515.5,295.6 L513.2,290.5 Z" fill="var(--green)"/>
  <path d="M484,295.7 Q519.2,295.4 554,295.5 Q563.7,295.9 564.5,306 Q563.6,328 564.4,350 Q564,359.6 554,360.2 Q518.4,359.1 484,359.3 Q473.9,359.9 474.8,350 Q474.3,328.3 474.7,306 Q474.1,296.2 484,295.7 Z" fill="var(--fill-green)" stroke="var(--green)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="519" y="309.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">张三</text><text x="519" y="328" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">李四</text><text x="519" y="346.5" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">周周</text>
  <path d="M584,295.1 Q609.4,295 634,296.3 Q644,295.9 645,306 Q643.2,312.2 644.2,318 Q644.3,328.3 634,328.1 Q608.7,327.9 584,327.8 Q573.8,328 573.3,318 Q573.6,312.5 574.2,306 Q573.9,296.2 584,295.1 Z" fill="var(--fill-teal)" stroke="var(--teal)" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><text x="609" y="312" font-size="14" text-anchor="middle" dominant-baseline="central" fill="currentColor">王五</text>
  <line x1="608" y1="268" x2="608" y2="289" stroke="var(--green)" stroke-width="1.4" stroke-linecap="round"/><path d="M608,296 L610.8,289 L605.2,289 Z" fill="var(--green)"/>
  <text x="566" y="400" font-size="14" text-anchor="middle" dominant-baseline="central" fill="var(--green)">周周只出现在副本里</text>
</svg>
</figure>


| 写法 | 复制了什么 | 嵌套改一个会怎样 |
|---|---|---|
| `b = a` | 什么都没复制，贴标签 | 两边都变（同一个对象） |
| `a.copy()` / `a[:]` / `list(a)` / `copy.copy(a)` | 只复制外层 | 外层独立，**内层共享** |
| `copy.deepcopy(a)` | 里外全复制 | 完全独立 |

记忆线索：**赋值不复制，浅拷贝复制一层，深拷贝复制全部。** 用谁取决于「要不要动内层」——只是修修改改顶层，浅拷贝够；要动嵌套结构，上 deepcopy。

## 6. 两个从这儿长出来的真 bug

理解了上面这些，再看两个经典的坑，一眼就能看穿。

### 6.1 函数默认参数 `box=[]`

```python
def add(item, box=[]):
    box.append(item)
    return box

print(add('苹果'))    # ['苹果']
print(add('香蕉'))    # ['苹果', '香蕉']  ← 咦，苹果怎么还在？
print(add('橘子'))    # ['苹果', '香蕉', '橘子']
```

每次调用都在往里加，`box` 却越攒越多。原因：`box=[]` 这个列表是在**函数定义时**创建一次的，之后所有调用**共用同一个列表**——和第 1 节的 `b = a` 是同一回事，只不过这个列表被 Python 藏在了函数默认参数里。

正确写法：

```python
def add(item, box=None):
    if box is None:
        box = []
    box.append(item)
    return box
```

[《Python 基础》第 6 篇](/post/python-functions-in-depth/)讲过这个坑，现在你看到它的底层了：**默认参数里的可变对象 = 所有调用共享一个标签。**

### 6.2 类属性 `tags=[]`

```python
class Student:
    tags = []        # 类属性，所有实例共享

s1 = Student()
s2 = Student()

s1.tags.append('Agent')
print(s2.tags)       # ['Agent']  ← s2 也变了！
```

`s1.tags` 和 `s2.tags` 指向的是**同一个列表**——类属性只存了一份，所有实例共用。这和[《Python 面向对象》第 2 篇](/post/python-oop-advanced-exceptions/)讲「类属性放可变对象」是同一个坑，从「标签贴同一份」这个角度看，一下子就通了。

正确写法是把可变对象放进 `__init__`：

```python
class Student:
    def __init__(self):
        self.tags = []   # 每个实例各造一个自己的列表
```

到这里，一条线串起来了：**`=` 不复制 → 可变对象能原地改 → 于是「共享」会互相牵连 → 所以默认参数、类属性这些「只建一次」的地方，千万别放可变对象。**

## 7. 常见坑清单

1. **以为 `b = a` 复制了**——复制的是标签，不是数据。要独立副本用浅拷贝或深拷贝；
2. **`is` 和 `==` 混用**——`is` 比身份，`==` 比内容。两个不同列表值相同，`==` 是 True、`is` 是 False；
3. **浅拷贝当深拷贝用**——嵌套列表用 `[:]` 复制，改内层照样串。动内层就 `deepcopy`；
4. **默认参数写 `box=[]`**——所有调用共享一个列表。改成 `box=None` 再在函数里新建；
5. **类属性写 `tags=[]`**——所有实例共享。放进 `__init__` 里用 `self.tags = []`；
6. **对不可变对象纠结 `copy is 原对象`**——返回同一对象是优化，不是复制失败。

## 8. 课后小项目

**练习一：看 id 说话（必做）**

跑第 1 节的实验，把 `id(a)`、`id(b)`、`a is b`、`a == b` 全打印出来。再自己造一个 `c = [1, 2, 3]`，对比 `a is c` 和 `a == c`。亲眼看到 id 的变化，这一篇就真懂了。

**练习二：判断串不串**

下面每段代码跑之前先猜：改完之后原列表变没变？猜完再跑验证。

```python
# ①
a = [[1, 2], [3, 4]]
b = a[:]
b[0] = [99]

# ②
a = [[1, 2], [3, 4]]
b = a[:]
b[0].append(99)

# ③
a = [[1, 2], [3, 4]]
b = copy.deepcopy(a)
b[0].append(99)
```

提示：①改的是外层（换掉 `b[0]` 这张标签），②③改的是内层。

**练习三：修一个 bug**

下面的函数想给每个用户初始化一个空的历史记录，但跑起来会串。找出问题并修好：

```python
def new_chat(name, history=[]):
    return {'name': name, 'history': history}
```

**练习四：给模型消息做个快照（综合）**

调大模型前，`messages` 是「列表套字典」。写一个函数 `snapshot(messages)`，返回一个 `deepcopy` 的副本，然后往副本里追加一条 `{"role": "user", "content": "..."}`，验证原 `messages` 没被动。想想：这里用浅拷贝会怎样？

## 9. 本篇小结

1. **变量是标签不是盒子**——`b = a` 从不复制，只是再贴一张标签；
2. **`id()` 看身份，`is` 比是不是同一个，`==` 比内容相不相等**；
3. **可变对象能原地改，不可变对象只能换新**——所以「改一个动一片」的坑只发生在列表、字典、集合身上；
4. **浅拷贝复制一层，深拷贝里外全复制**——动不动内层，是选它们的分界线；
5. **默认参数 `box=[]`、类属性 `tags=[]` 都是「共享同一份」的坑**——看到它们，就该条件反射想到这一篇。

这个坑填平之后，你对「数据在内存里怎么待着」已经有了直觉。下一篇用正则和生成器处理乱文本和超大文件——[文件与数据 第 4 篇：正则与生成器](/post/python-regex-generator/)。
