# Astro 站点（线上版本，2026-10-31 起上线）

本目录是博客 https://ziyou814.top/ 的**线上版本**（Astro 5，2026-10-31 完成切站）。仓库根的 Hugo 站已下线，源码保留作回滚备份。

## 开发

```bash
npm install       # 首次
npm run dev       # 开发服务器 http://localhost:4321
npm run build     # 生产构建 → dist/
npm run preview   # 本地预览构建产物
```

## 迁移约束（继续有效）

- **URL 与 Hugo 完全一致**（尾斜杠、`/post/<slug>/`、CJK 分类目录名小写化规则），否则 Waline 评论线程与不蒜子计数会脱钩
- **`--red-*` CSS 变量名不可改**：封面取色与氛围旋钮脚本都写这组变量
- 氛围旋钮持久化键 `yzrt-mood-hue`、主题键 `theme`，与旧站共享
- 全部第三方资源 vendored 在 `public/resources/`，零公共 CDN（Waline 表情包 unpkg 按需加载除外）
- 文章 frontmatter 同 Hugo，仅 `lastmod` → `updatedDate`；新文章放 `src/content/post/`
- 专栏定义在 `src/content/columns/*.md`（`category` 精确匹配文章 categories 项）；专栏内篇号用 `weight`（从 1 起）

## 双写同步

文章在仓库根 `content/post/`（Hugo，写作入口）与 `src/content/post/`（Astro）各留一份，用根目录的同步工具保持一致：

```bash
python -I scripts/sync_post.py              # 全量 Hugo → Astro
python -I scripts/sync_post.py --reverse    # Astro → Hugo
python -I scripts/sync_post.py --check      # 只查漂移，不写文件
```

## 体检

```bash
cd .. && python -I scripts/verify_build.py astro/dist
```

## 部署

**自动部署**：Cloudflare Pages 项目 `ziyou-blog` 连接本仓库并绑定 ziyou814.top，push main 自动构建上线。构建配置存在 CF 后台：根目录 `astro`、构建命令 `npm ci && npm run build`、输出 `dist`、环境变量 `NODE_VERSION=22`。

**回滚** = Pages 部署历史一键回退；GitHub Actions 的 `site` artifact 仅作手动备份。
