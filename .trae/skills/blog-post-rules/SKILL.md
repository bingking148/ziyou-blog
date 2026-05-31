---
name: "blog-post-rules"
description: "Defines timestamp rules for publishing blog posts in this Hugo project. Invoke when creating or editing blog posts to ensure realistic timestamps."
---

# Blog Post Timestamp Rules

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