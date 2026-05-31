---
name: "blog-post-rules"
description: "Defines rules for publishing blog posts in this Hugo project. Invoke when creating or editing blog posts to ensure proper formatting, timestamps, and frontmatter."
---

# Blog Post Publishing Rules

## 项目信息
- **框架**: Hugo + reimu 主题
- **内容目录**: `content/post/`
- **静态资源**: `static/images/`

## 时间戳规则（重要）

### 必须使用真实时间精确到秒

创建或修改文章时，`date` 和 `lastmod` 字段必须使用**真实的当前时间**，精确到秒，秒数不能为 00。

**正确示例**:
```yaml
date: 2026-05-31T14:22:18+08:00
lastmod: 2026-05-31T14:22:18+08:00
```

**错误示例**:
```yaml
date: 2026-05-31T10:00:00+08:00  # 秒数为00，不真实
date: 2026-05-31T14:22:00+08:00  # 秒数为00，不真实
```

### 如何获取真实时间
- 使用当前实际时间（精确到秒）
- 秒数应该是 01-59 之间的随机值，不要是 00
- 时区使用 `+08:00`（北京时间）

## Frontmatter 模板

```yaml
---
title: '文章标题'
date: 2026-05-31T14:22:18+08:00      # 真实时间，精确到秒
lastmod: 2026-05-31T14:22:18+08:00   # 真实时间，精确到秒
cover: /images/covers/cover.jpg       # 封面图片路径
math: false                           # 是否启用数学公式
tags:
  - 标签1
  - 标签2
categories:
  - 分类
---
```

## 其他规则

1. **数学公式**: 需要时设置 `math: true`，使用 KaTeX 语法（`$$...$$` 块级，`$...$` 行内）
2. **封面图片**: 放在 `static/images/covers/` 目录，引用路径以 `/images/` 开头
3. **标签**: 3-5 个相关标签
4. **分类**: 1-2 个分类
5. **避免使用**: "小学"、"高中"等教育阶段字眼