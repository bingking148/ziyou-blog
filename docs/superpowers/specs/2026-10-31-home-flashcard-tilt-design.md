# 首页滚动全息闪卡效果 · 设计文档

日期：2026-10-31 · 状态：已确认（方案 A）

## 目标

首页下滑时，内容区图片像手持闪卡从不同角度观看：随滚动连续改变 `rotateX/rotateY`，斜角时浮现白色高光扫过与彩虹偏光，正对时干净回正。风格取「全息闪卡」，覆盖内容区全部图片。

## 范围

| 元素 | 标记 | 角度签名 |
|---|---|---|
| 专题封面 ×2（`.series-visual`） | `data-flashcard="series"` | 1 号 ry −19°/rx 8°，2 号 ry +17°/rx −12°（方向相反） |
| 随想大图（`.interlude-image`） | `data-flashcard="interlude"` | ry +11°/rx +15°（横图绕 X 为主） |
| 列表悬停预览图（`.latest-preview` 内新增 `.preview-card`） | `data-flashcard="preview"` | 按序号交替 ±13°，rx 按 3 取模 −5/0/+5° |

Hero 封面已有独立效果，不在本次范围内。

## 结构

每个地面卡片包一层 `.flashcard-stage`（含 `.flashcard-shadow` 椭圆投影）；列表预览图因悬浮在文字上方无地面投影，直接在 `.latest-preview` 内加 `.preview-card` 作为 3D 层。

## 滚动映射

- progress `p ∈ [-1, 1]`：卡片中心相对视口中心归一化（入场 −1 → 居中 0 → 离场 +1）。
- 角度 = 签名 × p：入场从一侧斜望、居中回正、离场翻向另一侧。
- `translateZ = (1−|p|) × lift`：居中时微微向观者弹起。
- 高光 `--fc-gx` 扫掠方向与 rotateY 反向联动；高光/彩虹透明度 ∝ |p|（正对干净，斜角起光）。
- 签名在 JS 中按 DOM 顺序分配（series/preview 计数器），初始状态全为 0°（即现状），无闪烁。

## 实现方式（方案 A，零依赖）

- 沿用首页 Hero 的 rAF + CSS 自定义属性模式；单个 rAF 循环驱动全部卡片。
- `IntersectionObserver`（rootMargin 25%）控制激活集合，离屏跳过；被动 scroll/resize 监听。
- 只动 `transform/opacity`：高光层为 220% 宽渐变条 `translateX`，彩虹层为超出卡面的 `conic-gradient` 小幅位移（`mix-blend-mode: screen / color-dodge`），投影用 `translateX`，均走合成器。
- 卡片自身 `transform: perspective(1100px) translateZ() rotateX() rotateY()`，不依赖父级 perspective。

## 降级

- `prefers-reduced-motion: reduce`：脚本 early-return，CSS 隐藏光泽/彩虹/投影并还原 transform。
- 禁用 JS：变量默认 0°，维持现有平面外观。
- 移动端（≤760px）：角度与位移乘 0.45 保留光泽；列表预览图移动端本就不显示。

## 验收

1. 桌面滚动：三组图片角度随滚动连续变化且方向各异，居中回正、有轻微前倾弹起。
2. 斜角时高光扫过 + 彩虹偏光可见，正对时干净。
3. 列表悬停预览出现时带倾斜与光泽，外层出现动画不受影响。
4. `astro build` 通过；reduced-motion 下与现状一致。
