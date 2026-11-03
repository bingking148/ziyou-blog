# -*- coding: utf-8 -*-
"""给 Python 基础专栏 13/14/15 三篇生成封面（1600x900 JPEG）。
风格与现有封面一致：纯色渐变底 + 少量几何元素 + 标题文字。
"""
from PIL import Image, ImageDraw, ImageFont
import math, os

FONT = "C:/Windows/Fonts/msyhbd.ttc"
OUT = r"E:/blog/astro/public/images/covers"
W, H = 1600, 900

# 三张封面的主题色（与系列其他封面的低饱和柔和感保持一致）
THEMES = {
    "python-file-formats-cover.jpg": {
        "top": (58, 131, 155), "bot": (22, 72, 92),
        "accent": (255, 214, 130),
        "kicker": "Python 第 13 篇",
        "title": "CSV · TSV · JSON",
        "sub": "给数据立个固定格式",
    },
    "python-shallow-deep-copy-cover.jpg": {
        "top": (52, 91, 112), "bot": (18, 38, 52),
        "accent": (255, 166, 158),
        "kicker": "Python 第 14 篇",
        "title": "赋值 · 浅拷贝 · 深拷贝",
        "sub": "看清变量在内存里的本质",
    },
    "python-decorator-advanced-cover.jpg": {
        "top": (86, 70, 102), "bot": (36, 27, 52),
        "accent": (255, 199, 120),
        "kicker": "Python 第 15 篇",
        "title": "多装饰器与带参装饰器",
        "sub": "给函数装外挂的进阶玩法",
    },
}


def lerp(c1, c2, t):
    return tuple(round(a + (b - a) * t) for a, b in zip(c1, c2))


def font(size):
    return ImageFont.truetype(FONT, size)


def make(path, cfg):
    img = Image.new("RGB", (W, H))
    px = img.load()
    top, bot = cfg["top"], cfg["bot"]
    for y in range(H):
        t = y / (H - 1)
        c = lerp(top, bot, t)
        for x in range(W):
            px[x, y] = c

    d = ImageDraw.Draw(img, "RGBA")
    accent = cfg["accent"]

    # 几个半透明圆环，点缀
    for cx, cy, r, alpha in [(1380, 180, 260, 26), (180, 760, 220, 20), (1430, 760, 340, 16)]:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=accent + (alpha,), width=10)

    # 三张小标签片，呼应「格式/拷贝/装饰」的主题
    chips = ["{ }", "[ ]", "@"]
    x0, y0, chip_w, chip_h, gap = 220, 640, 170, 170, 36
    for i, ch in enumerate(chips):
        x = x0 + i * (chip_w + gap)
        d.rounded_rectangle([x, y0, x + chip_w, y0 + chip_h], radius=26,
                            fill=accent + (34,), outline=accent + (120,), width=3)
        f = font(84)
        bbox = d.textbbox((0, 0), ch, font=f)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        d.text((x + (chip_w - tw) / 2, y0 + (chip_h - th) / 2 - bbox[1]),
               ch, font=f, fill=accent + (230,))

    # 左上 kicker
    d.text((90, 82), cfg["kicker"], font=font(46), fill=accent + (235,))

    # 标题（可能很长，自动缩字号）
    size = 132
    while size > 64:
        f = font(size)
        bbox = d.textbbox((0, 0), cfg["title"], font=f)
        if bbox[2] - bbox[0] <= W - 180:
            break
        size -= 8
    d.text((90, 150), cfg["title"], font=f, fill=(255, 255, 255, 255))

    # 副标题
    d.text((92, 330), cfg["sub"], font=font(64), fill=(230, 238, 245, 220))

    img.save(path, "JPEG", quality=80, optimize=True, progressive=True)
    print("saved", path)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, cfg in THEMES.items():
        make(os.path.join(OUT, name), cfg)
