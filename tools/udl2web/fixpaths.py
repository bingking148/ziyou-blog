# -*- coding: utf-8 -*-
"""修复 batch 生成的 json 里缺失的 figures/ 路径段"""
import json, os, re

DATA = r"E:\blog\astro\src\data\udl"
for f in os.listdir(DATA):
    if not f.endswith(".json"):
        continue
    p = os.path.join(DATA, f)
    d = json.load(open(p, encoding="utf-8"))
    cnt = 0
    for pg in d["sections"]:
        for blocks in (pg["en"], pg["zh"]):
            for b in blocks:
                img = b.get("img", "")
                # /learning/udl/chN/xxx.webp -> /learning/udl/chN/figures/xxx.webp
                if re.fullmatch(r"/learning/udl/ch\d+/[^/]+\.webp", img):
                    b["img"] = img.replace(f"/{f[:-5]}/", f"/{f[:-5]}/figures/", 1)
                    cnt += 1
    json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False)
    if cnt:
        print(f, "fixed", cnt)
