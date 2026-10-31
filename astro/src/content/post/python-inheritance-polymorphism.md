---
title: 'Python 第 10 篇：继承、封装与多态，组一个助手家族'
weight: 10
cover: /images/covers/python-inheritance-polymorphism-cover.jpg
date: 2026-10-31T08:00:00+08:00
updatedDate: 2026-10-31T08:00:00+08:00
categories: ['人工智能', 'Python基础']
tags: ['Python', '编程基础', '面向对象', '继承', '多态']
description: 'Python 基础系列收官：方法重写与 super 的完整用法、多继承的就近原则、私有属性与公共接口、多态三前提、抽象类定规范，最后把 OOP 的最后几块拼图拼成一个助手家族。'
math: false
mermaid: false
comments: true
toc: true
---

上一篇的 [第 9 篇](/post/python-oop-advanced-exceptions/) 把 `Assistant` 拆成了三层分工的智能助手。但面向对象的地图上还剩几块空白，而且每一块都是你马上会撞上的：

1. **重写了父类的方法，还想借父类的实现**——总不能复制粘贴吧？（super 的完整用法）
2. **`api_key` 这种东西谁都能 `bot.api_key = "xxx"` 改掉**——有没有办法把它藏起来？（封装）
3. **不同的助手，能不能用同一个函数统一调用**——不然每加一种助手，全程序都要跟着改。（多态）

这一篇把剩下的拼图全部补完：**继承的完整玩法（重写、super、多继承）、封装、多态、抽象类、类方法与静态方法**，最后组装成一个**助手家族**，并给整个 Python 基础系列收官。

## 1. 继承的完整玩法

第 9 篇你已经会最基本的继承了。这一节把剩下的三件事补齐：重写、super 的完整用法、多继承。

### 1.1 所有类的祖师爷：object

先补一个冷知识。下面三种类的写法，完全等价：

```python
class Assistant:          # 写法一：不写括号
    pass

class Assistant():        # 写法二：空括号
    pass

class Assistant(object):  # 写法三：明写父类
    pass
```

不写父类时，Python 自动让它继承 `object`——**所有类的祖先**。`print` 一个对象会显示什么、`==` 默认怎么比，这些默认行为全部来自 `object`。

第 8 篇你写过的魔法方法 `__str__`、`__eq__`，其实就是**重写 `object` 的方法**——你从第 8 篇起就一直在用继承了，只是当时没说破。

### 1.2 方法重写：子类的同名方法说了算

需求来了：家族里每个助手被打招呼时的反应不同。子类定义一个和父类**同名**的方法，就会**覆盖**父类的版本——这叫**重写**：

```python
class BaseAssistant:
    def __init__(self, name):
        self.name = name

    def greet(self):
        return f"你好，我是助手 {self.name}"


class ChatAssistant(BaseAssistant):
    def greet(self):                              # 同名 = 重写
        return f"嗨！我是聊天助手 {self.name}，找我唠什么都行"


a = BaseAssistant("小基")
c = ChatAssistant("小聊")
print(a.greet())     # 你好，我是助手 小基
print(c.greet())     # 嗨！我是聊天助手 小聊，找我唠什么都行
```

规则一句话：**调用时先找子类自己有没有这个方法，有就用子类的；没有才往上找父类。**属性也一样，同名属性同样被覆盖。

### 1.3 super()：重写了，还想借父类的

重写有个副作用：父类版本彻底被盖住了。但很多时候你只是想**加一点东西**，不是全盘换掉。比如翻译助手想先亮出「翻译模式」，再执行父类的打招呼逻辑：

```python
class TranslateAssistant(BaseAssistant):
    def __init__(self, name, target_lang):
        super().__init__(name)          # ① 借父类的 __init__ 建 name
        self.target_lang = target_lang  # ② 再加自己的

    def greet(self):
        parent_msg = super().greet()    # ③ 借父类的 greet 拿基础版本
        return f"[{self.target_lang} 翻译模式] " + parent_msg


t = TranslateAssistant("小译", "英语")
print(t.greet())
# [英语 翻译模式] 你好，我是助手 小译
```

`super()` 代表「父类的那个版本」，三处用法是同一个意思：

- `super().__init__(name)`——**子类重写 `__init__` 时必须借它**，否则父类的属性根本不会被创建（第 9 篇坑清单第 3 条的出处）；
- `super().greet()`——重写普通方法后借父类实现，最常见的搭配是「父类的结果 + 自己的加工」。

> [!TIP]
> 判断要不要写 `super()` 只需一句：**子类的这个方法，需不需要父类已经做的事？**需要就借，不需要就不写。

### 1.4 多继承：从左往右找

一个类可以同时继承多个父类：

```python
class Master:
    def __init__(self):
        self.skill = "古法手艺"


class School:
    def __init__(self):
        self.skill = "AI 自动化工艺"


class Apprentice(Master, School):     # 同时继承两个
    pass


a = Apprentice()
print(a.skill)    # 古法手艺
```

两个父类都有 `skill`，实际生效的是 **`Master` 的**——**就近原则：从左往右找，先找到谁用谁的**。括号里的顺序就是查找顺序（这个顺序有个正式名字叫 MRO，入门阶段记住「从左往右」就够了）。

> [!WARNING]
> 多继承容易让「这个方法到底是谁的」变成玄学。日常项目的建议：**能用单继承就用单继承**；真要用，让几个父类各管一摊、互不重叠。

## 2. 封装：有些东西不想让你直接碰

### 2.1 先看一个事故

第 8 篇的 `ChatBot` 把 `api_key` 存成了普通实例属性。这意味着任何拿到对象的人都能：

```python
bot = ChatBot("小聊", "sk-正确的密钥")
bot.api_key = "手滑改错的"      # 没人拦你
bot.api_key = None              # 也没人拦你
```

属性全裸露在外，谁都能读、谁都能改，改错了程序才在很远的地方报错。**封装**就是解决这个问题的：**把不该直接碰的成员藏起来，只留安全的入口。**

### 2.2 双下划线：私有属性与私有方法

属性名或方法名前面加**两个下划线**，它就变成私有的：

```python
class SecretBot:
    def __init__(self, name, api_key):
        self.name = name            # 公开：随便读写
        self.__api_key = api_key    # 私有：外部不能直接访问

    def __raw_request(self):        # 私有方法：内部自己用
        return f"[拿着 {self.__api_key[:6]}... 发请求]"

    def send(self, text):
        return self.__raw_request() + text    # 类内部随便用


bot = SecretBot("小聊", "sk-abcdef123")
print(bot.name)         # 小聊  ✓
print(bot.send("你好")) # [拿着 sk-abc... 发请求]你好  ✓
print(bot.__api_key)    # ✗ AttributeError
bot.__raw_request()     # ✗ AttributeError
```

三条规则：

1. **类内部**：随便用（`self.__api_key`）；
2. **类外部**：直接访问报 `AttributeError`；
3. **子类**：也访问不到——私有的东西**不被继承**，2.4 马上验证。

### 2.3 公共接口：藏起来，但留门

藏起来不等于用不了。惯例是提供 `get_xxx` / `set_xxx` 两个公共方法当「窗口」，而且**窗口里可以加检查**：

```python
class SecretBot:
    def __init__(self, name, api_key):
        self.name = name
        self.__api_key = api_key

    def get_key_tail(self):              # 只给看尾部，不给看全貌
        return self.__api_key[-4:]

    def set_api_key(self, new_key):      # 想改？先过安检
        if not isinstance(new_key, str) or not new_key.startswith("sk-"):
            raise ValueError("api_key 必须是 sk- 开头的字符串")
        self.__api_key = new_key


bot = SecretBot("小聊", "sk-abcdef123")
print(bot.get_key_tail())         # f123
bot.set_api_key("sk-ffffff999")   # ✓ 合法，放行
bot.set_api_key("123")            # ✗ ValueError: api_key 必须是 sk- 开头的字符串
```

对比一下就明白封装的价值：**直接暴露属性，校验得靠每个使用者的自觉；藏在 set 方法里，校验只写一次，谁都绕不过去。**

> [!NOTE]
> Python 的「私有」其实是**改名**而不是真锁门：`__api_key` 会被改名为 `_SecretBot__api_key`，你写 `bot._SecretBot__api_key` 仍然能摸到。所以它更像一块「请勿触碰」的提示牌——**用来防误用，防不了蓄意破坏**。这是 Python 的哲学：我们都是成年人。

### 2.4 验证：私有成员不被子类继承

```python
class ChildBot(SecretBot):
    def leak(self):
        return self.__api_key      # 子类也碰不到


c = ChildBot("小继", "sk-111122223333")
c.leak()        # ✗ AttributeError
c.send("你好")  # ✓ 父类公开方法正常继承
```

想让子类用？和外部一样——走父类留的公共接口。

## 3. 多态：同一个接口，不同的表现

### 3.1 一个函数管一整个家族

家族助手越来越多，现在要做个「群发」功能：让每个助手都对同一句话做出反应。

靠 `if` 判断类型？每加一种助手就加一个分支，迟早写崩。多态的思路是：**它们都是 `BaseAssistant` 的子类，都有 `greet` 方法——直接调，不用管它是谁。**

```python
def greet_all(assistants):
    """接收一列助手，挨个打招呼。参数按父类类型对待"""
    for assistant in assistants:
        print(assistant.greet())      # 实际跑的是各自子类的版本


family = [
    BaseAssistant("小基"),
    ChatAssistant("小聊"),
    TranslateAssistant("小译", "英语"),
]
greet_all(family)
# 你好，我是助手 小基
# 嗨！我是聊天助手 小聊，找我唠什么都行
# [英语 翻译模式] 你好，我是助手 小译
```

同一个 `greet()` 调用，三个对象给出三种反应。（为了聚焦多态，这里的助手先不带密钥，第 6 节组装时再加回来。）

**多态成立的三个前提**：

1. **有继承**——三个类都是 `BaseAssistant` 的子类；
2. **有方法重写**——`greet` 各自都重写了（不重写就都执行父类的，多态无意义）；
3. **用父类类型的引用去调用**——`greet_all` 把参数都当 `BaseAssistant` 用，实际传进去的是子类对象。

### 3.2 多态的好处：加一个助手，一行不改

家族来新成员：

```python
class VoiceAssistant(BaseAssistant):
    def greet(self):
        return f"【语音助手 {self.name}】叮咚——欢迎光临！"


family.append(VoiceAssistant("小声"))
greet_all(family)      # 四个助手全部正常打招呼
```

`greet_all` **一个字都没改**。这就是多态最大的价值：**新功能靠「加子类」扩展，不靠「改老代码」**。

第 9 篇你体会过「组合优于继承」，这一篇补上另一半：**当一堆东西确实是同一类事物的不同变体时，继承 + 多态是最顺手的组织方式**。

## 4. 抽象类：只定规范，不管实现

再看一眼 `BaseAssistant.greet`——家族里没有任何助手直接用它，每个子类都重写它。那父类里写完整实现的意义是什么？没有意义。

这种「**只声明，不实现，专门让子类去实现**」的方法叫**抽象方法**，含抽象方法的类就是**抽象类**（可以理解为接口）：

```python
class BaseAssistant:
    def __init__(self, name):
        self.name = name

    def greet(self):
        pass        # 抽象方法：只规定「助手必须会打招呼」，怎么打自己定
```

抽象类的作用是**定规范**：谁来继承我，就必须把 `greet` 实现出来。规范在上，实现在下——就像充电接口标准是统一的，各厂商自己造。

> [!NOTE]
> 上面这种 `pass` 写法靠自觉：子类忘了重写，调用时返回 `None`，不报错。Python 标准库 `abc` 提供了强制版：
>
> ```python
> from abc import ABC, abstractmethod
>
> class BaseAssistant(ABC):
>     def __init__(self, name):
>         self.name = name
>
>     @abstractmethod
>     def greet(self): ...
>
> BaseAssistant("小基")   # ✗ TypeError: 抽象类不能实例化
> ```
>
> 抽象方法没实现完，类**根本造不出对象**。第三方框架的基类经常这么写。

## 5. 类方法与静态方法

到目前为止你写的都是**实例方法**（第一个参数 `self`）。Python 还有两种。

### 5.1 类方法：第一个参数是类本身

`@classmethod` 装饰的方法，第一个参数收到的不是对象，而是**类**（惯例叫 `cls`）：

```python
class ChatAssistant(BaseAssistant):
    def __init__(self, name, api_key, model="deepseek-chat"):
        super().__init__(name, api_key)
        self.model = model

    @classmethod
    def from_config(cls, config):          # cls 收到的是类自己
        return cls(config["name"], config["api_key"], model=config.get("model"))
```

最常见的用途是**替代构造函数**——从一个配置字典直接造对象：

```python
cfg = {"name": "小聊", "api_key": "sk-abcdef123", "model": "deepseek-reasoner"}
bot = ChatAssistant.from_config(cfg)   # 类名直接调，不用先创建对象
print(bot.model)    # deepseek-reasoner
```

注意一个细节：子类调 `from_config` 时，`cls` 是子类自己，造出来的是**子类对象**——这份代码写一次，整个家族都能用。

### 5.2 静态方法：跟类和对象都无关，只是住在类里

`@staticmethod` 装饰的方法，**既不收 `self` 也不收 `cls`**，本质是个普通函数，只是逻辑上属于这个类：

```python
class BaseAssistant:
    @staticmethod
    def show_menu():
        """打印家族菜单——不需要任何对象状态"""
        print("=" * 24)
        print("【1】群发问候  【2】换密钥  【0】退出")
        print("=" * 24)


BaseAssistant.show_menu()    # 类名直接调
```

判断标准很简单：**方法体里既不用 `self` 也不用 `cls`，就写静态方法**（打印菜单、格式转换这类工具函数）。

### 5.3 三种方法一张表

| 写法 | 第一个参数 | 自动拿到什么 | 典型用途 |
|---|---|---|---|
| 实例方法 | `self`（对象） | 实例属性、类属性 | 绝大多数方法 |
| 类方法 | `cls`（类） | 类属性、`cls(...)` 造对象 | 替代构造函数、操作类属性 |
| 静态方法 | 无 | 什么都不自动给 | 与状态无关的工具函数 |

## 6. 组装：助手家族

把这一篇的所有零件拼起来。需求：

1. 一个基类定规范：所有助手必须有名字、都要会 `greet`，`api_key` 私有、只能走带校验的接口；
2. 三个子类各自重写 `greet`，其中一个用 `super()` 借父类的实现；
3. 类方法 `from_config` 从配置造助手，静态方法 `show_menu` 打菜单；
4. `greet_all` 多态地群发问候；
5. 主程序用第 9 篇的容错结构跑菜单循环。

```python
class BaseAssistant:
    family_name = "AiHome"                     # 类属性：全家共享

    def __init__(self, name, api_key):
        self.name = name                       # 公开
        self.__api_key = api_key               # 私有

    @staticmethod
    def show_menu():                           # 静态方法：菜单
        print("=" * 24)
        print("【1】群发问候  【2】换密钥  【0】退出")
        print("=" * 24)

    def get_key_tail(self):                    # 公共接口：只露尾部
        return self.__api_key[-4:]

    def set_api_key(self, new_key):            # 公共接口：带校验
        if not isinstance(new_key, str) or not new_key.startswith("sk-"):
            raise ValueError("api_key 必须是 sk- 开头的字符串")
        self.__api_key = new_key

    def greet(self):
        # 通用版：想让子类「必须自己实现」时，把这行改成 pass（见第 4 节）
        return f"你好，我是助手 {self.name}"


class ChatAssistant(BaseAssistant):
    def __init__(self, name, api_key, model="deepseek-chat"):
        super().__init__(name, api_key)        # 借父类建基础属性
        self.model = model

    @classmethod
    def from_config(cls, config):              # 类方法：配置造对象
        return cls(config["name"], config["api_key"],
                   model=config.get("model", "deepseek-chat"))

    def greet(self):                           # 全重写
        return f"嗨！我是 {self.family_name} 的聊天助手 {self.name}（{self.model}）"


class TranslateAssistant(BaseAssistant):
    def __init__(self, name, api_key, target_lang="英语"):
        super().__init__(name, api_key)
        self.target_lang = target_lang

    def greet(self):                           # 重写 + 借父类
        return f"[{self.target_lang} 翻译模式] " + super().greet()


class VoiceAssistant(BaseAssistant):
    def greet(self):                           # 全重写
        return f"【语音助手 {self.name}】叮咚——欢迎光临！"


def greet_all(assistants):
    """多态：按父类接口统一调用"""
    for assistant in assistants:
        print(assistant.greet())


if __name__ == "__main__":
    family = [
        ChatAssistant.from_config({"name": "小聊", "api_key": "sk-chat-1111",
                                   "model": "deepseek-chat"}),
        TranslateAssistant("小译", "sk-tr-2222", target_lang="英语"),
        VoiceAssistant("小声", "sk-vo-3333"),
    ]

    while True:
        BaseAssistant.show_menu()
        choice = input("请选择：").strip()

        if choice == "1":
            greet_all(family)                          # 多态群发
        elif choice == "2":
            name = input("要改谁的密钥：")
            target = None
            for a in family:
                if a.name == name:
                    target = a
                    break
            if target is None:
                print("  没有这个助手")
                continue
            try:
                target.set_api_key(input("新密钥："))  # 公共接口带校验
                print(f"  已更新，现在尾号是 {target.get_key_tail()}")
            except ValueError as e:
                print(f"  拒绝：{e}")                # 第 9 篇的容错
        elif choice == "0":
            print("再见！")
            break
```

跑起来：

```text
========================
【1】群发问候  【2】换密钥  【0】退出
========================
请选择：1
嗨！我是 AiHome 的聊天助手 小聊（deepseek-chat）
[英语 翻译模式] 你好，我是助手 小译
【语音助手 小声】叮咚——欢迎光临！
========================
【1】群发问候  【2】换密钥  【0】退出
========================
请选择：2
要改谁的密钥：小声
新密钥：123
  拒绝：api_key 必须是 sk- 开头的字符串
```

这段代码为什么值得看：

1. **`TranslateAssistant.greet` 是「super 借力」的标准形态**——父类出基础版，子类加包装；
2. **`family_name` 是第 9 篇的类属性**——子类里通过 `self` 也能读到，读共享；
3. **`set_api_key` 的校验只写一次**——菜单入口和未来任何入口都绕不过去；
4. **家族扩展只加子类**——`greet_all` 和菜单不用动，多态对扩展开放；
5. **主循环的输入处理**沿用第 9 篇 `read_int` 的思路——旧知识在新代码里自己长出来了。

## 7. 常见坑清单

1. **重写 `__init__` 忘了 `super().__init__(...)`**——父类属性没建，后面 `AttributeError`（又提一次，因为它是继承类 bug 榜第一名）；
2. **以为 `super()` 只能在 `__init__` 里用**——任何重写的方法里都能借父类版本；
3. **多继承把顺序写反**——就近原则找到的是另一个父类的方法，结果「能跑但来源错」；
4. **私有属性名只写一个下划线**——`_api_key` 只是「约定别碰」，不是私有，外部照样能访问；
5. **在类外给 `bot.__api_key` 赋值以为改成功了**——那是在对象上新建了一个同名属性，真正的私有成员毫发无损；
6. **抽象方法写 `pass` 后子类忘了重写**——调用不报错、返回 `None`，坑藏在运行时（用 `abc` 能提前暴露）；
7. **该用实例方法的地方写成 `@staticmethod`**——方法体里又想用 `self`，只能把对象当参数传，越写越绕。

## 8. 课后小项目

**练习一：图形家族（必做）**

写 `Shape` 类定规范（`area` 方法），`Circle`、`Square` 继承并重写。把几个图形放进列表，用一个函数循环打印各自的面积——全程不许写一个判断类型的 `if`。

**练习二：给助手家族添丁**

加一个 `CodeAssistant`：`greet` 里先 `super().greet()`，再追加一句「随时可以帮你写代码」；顺手让它支持 `from_config`。

**练习三：把 BankAccount 封装起来**

第 8 篇练习三的 `BankAccount`，这次升级：余额改成私有 `__balance`；存取款必须走 `deposit` / `withdraw`，里面做金额校验（负数拒绝）；对外只提供 `get_balance` 查询。

**练习四：配置化开工**

给家族写一个 `load_family(configs)`：接收一个配置列表（就用 Python 字典列表），用类方法批量 `from_config` 造出所有助手。想挑战的话，密钥校验不过的配置要跳过并打印原因——用 `try/except`，别让一个坏配置毁掉整个家族。

## 9. 系列总结

十篇文章，走完了这条路：

| 篇 | 你学会了 | 你做出了 |
|---|---|---|
| 1 | 装环境、跑程序 | Hello World |
| 2 | 变量、类型、运算 | BMI 计算器 |
| 3 | 判断、循环、函数 | 猜数字游戏 |
| 4 | range、嵌套循环 | 石头剪刀布 |
| 5 | 五类容器 | 记账本 |
| 6 | 函数进阶、递归 | 成绩分析工具箱 |
| 7 | lambda、模块、包 | 可 import 的工具库 |
| 8 | 类、对象、魔法方法 | 聊天机器人 |
| 9 | 类属性、协作、异常 | 多部件协作的智能助手 |
| 10 | 继承、封装、多态、抽象类 | 助手家族 |

这十篇覆盖的是**语法**。但你已经能看出来了：真正让程序有价值的是**结构**——第 5 篇的「列表套字典」、第 6 篇的「一个函数只做一件事」、第 9 篇的「组合优于继承」、第 10 篇的「对扩展开放，对修改关闭」。

### 9.1 接下来往哪走

**想继续 Python 的深度**：

- **文件读写与 JSON**——程序要能存数据（`open()`、`json`）；
- **虚拟环境**——`venv`、`pip`，项目依赖隔离；
- **装饰器与迭代器**——Python 最优雅的两个特性；
- **类型标注进阶**——`typing` 模块、泛型。

**想转向 AI 应用**（本专栏的主线方向）：

- [大模型概念网络](/post/ai-llm-concept-network/)——先搞清楚这些名词都是什么；
- [Transformer 与注意力机制](/post/transformer-attention-basics/)——模型内部怎么运作；
- [Ollama 本地部署](/post/ollama-local-llm-deploy/)——在自己电脑上跑一个大模型；
- [大模型 API 调用](/post/llm-api-apifox-deepseek/)——用 Python 调 DeepSeek；
- [提示词工程](/post/prompt-engineering-workflow/)——怎么把话说清楚；
- [Streamlit 聊天应用](/post/streamlit-ai-chat/)——做出能给别人用的界面；
- [Agent 开发](/post/ai-agent-tool-memory-rag/)——工具、记忆、RAG。

### 9.2 最后一句

这十篇里，你写了十个能跑的程序。它们都很小，但**每一个都是完整的**——有输入、有处理、有输出。

学编程最难的不是语法，是「从空文件到能跑的东西」这段距离。你现在已经跨过去了十次。

下一步不用等什么时机，打开编辑器，把助手家族改成你自己的版本就行。改着改着，你就有了自己的项目。
