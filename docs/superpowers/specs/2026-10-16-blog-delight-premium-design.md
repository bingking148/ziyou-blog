# 博客趣味与质感升级设计（yzrt 元素移植）

日期：2026-10-16 ｜ 状态：已获用户批准（"都做"）

## 目标

基于 gitee.com/greyd097/yzrt 的 10 个 CSS 组件演示，为 Hugo 博客（reimu 主题）补齐 8 项
"记忆点"交互与高级感细节。全部通过既有 `params.yml injector` 注入机制与
`layouts/404.html` 覆盖实现，不改动主题源码，可整体回退。

## 功能清单

| # | 功能 | 来源 | 落点 | 说明 |
|---|------|------|------|------|
| 1 | 氛围旋钮 | 声音控制旋钮 | injector.sidebar_end | 拟态旋钮+19 颗 LED，拖动旋转全站 `--red-*` 色相；滚轮/方向键微调；双击复位；localStorage 持久化；LED 与光晕颜色跟随当前色相 |
| 2 | 404 水滴页 | CSS水滴 + Go Pro按钮 | layouts/404.html | 大号"404"上叠 blob 水滴（backdrop blur 制造"水下"感），呼吸动画+悬停形变；Go Pro 式液态填充返回按钮 |
| 3 | 导航玻璃 pill | 导航栏对比 | head_end CSS + body_end JS | `#main-nav` 下悬停/激活项弹性滑动的玻璃胶囊，弹簧缓动，URL 匹配定初始位 |
| 4 | Hero 逐字入场 | launch start | body_end JS | 首页 H1 "ZIYOU" 逐字上浮+模糊消散入场，逐字悬停微抬；reduced-motion 时跳过 |
| 5 | CTA 液态填充 | Go Pro升级按钮 | head_end CSS | `#hero-cta-read` 伪元素圆形 difference 混合滑入，圆变方液态铺满 |
| 6 | 按压态细节 | 拟态按钮 | head_end CSS | 暗色切换/菜单/关于按钮按下时内凹阴影+缩放，暗色模式适配 |
| 7 | 首字下沉 | 编辑排版（非仓库） | head_end CSS | 文章首个段落首字 3em 文楷下沉，墨蓝着色 |
| 8 | 阅读进度条 | 通用高级感（非仓库） | head_end CSS + body_end JS | 顶部 3px 墨蓝→朱砂渐变条，仅文章页出现 |

## 关键实现决策

- **旋钮与封面取色共存**：封面取色脚本先注册、氛围旋钮后执行；旋钮在 `load` 后
  `setTimeout(0)` 再应用一次确保压过封面色；双主题切换时两者各自重应用、注册顺序保证
  旋钮胜出。复位 = 恢复初始化时快照的 `--red-*` 原值并清除存储。
- **导航 pill 不用 class 切换**，由 JS 测量 `translateX + width`，弹簧贝塞尔
  `cubic-bezier(.34,1.56,.64,1)`，字体就绪后二次校位。
- **CTA 混合**：`isolation:isolate` + 伪元素 `z-index:-1` + `mix-blend-mode:difference`，
  文字自动反色，明暗两版免适配。
- **可访问性**：所有动画尊重 `prefers-reduced-motion`；旋钮带 `role="slider"`
  与方向键支持；pill/进度条纯装饰有 aria 处理。
- **移动端**：旋钮随侧栏自然隐藏（主题行为）；烟花/播放器已有的移动禁用逻辑不受影响。

## 验证

hugo 构建 + Playwright 断言：pill 元素定位、逐字包裹、旋钮拖动后 `--red-0` 变化、
进度条滚动 scaleX、404 页水滴与按钮存在；各页截图人工复核。

## 刻意不做

Gemini UI（无聊天场景）、B站搜索栏（未开 Algolia）、整组拟态按钮（与玻璃语言冲突，
仅取按压态）、live2d（配置已有开关，另行决定）。
