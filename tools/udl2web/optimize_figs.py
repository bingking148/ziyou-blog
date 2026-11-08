# -*- coding: utf-8 -*-
"""全部插图 PNG -> WebP（q90），并更新 udl 数据里的引用路径"""
import json, os
from PIL import Image

ROOT = r"E:\blog\astro\public\learning\udl"
DATA = r"E:\blog\astro\src\data\udl"

total_before = total_after = 0
n = 0
for ch in sorted(os.listdir(ROOT)):
    figdir = os.path.join(ROOT, ch, "figures")
    if not os.path.isdir(figdir):
        continue
    for f in os.listdir(figdir):
        if not f.endswith(".png"):
            continue
        src = os.path.join(figdir, f)
        dst = src[:-4] + ".webp"
        im = Image.open(src)
        if im.mode in ("RGBA", "P"):
            im = im.convert("RGB") if im.mode == "P" else im
        im.save(dst, "WEBP", quality=90, method=4)
        sb, sa = os.path.getsize(src), os.path.getsize(dst)
        total_before += sb
        total_after += sa
        os.remove(src)
        n += 1
print("%d png->webp: %.1fMB -> %.1fMB" % (n, total_before / 1e6, total_after / 1e6))

# 更新 json 路径
for f in os.listdir(DATA):
    if not f.endswith(".json"):
        continue
    p = os.path.join(DATA, f)
    d = json.load(open(p, encoding="utf-8"))
    cnt = 0
    for pg in d["sections"]:
        for blocks in (pg["en"], pg["zh"]):
            for b in blocks:
                if b.get("img", "").endswith(".png"):
                    b["img"] = b["img"][:-4] + ".webp"
                    cnt += 1
    json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False)
    print(f, "updated", cnt)
