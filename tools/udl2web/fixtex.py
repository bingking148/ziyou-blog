# -*- coding: utf-8 -*-
"""修复 json 中 latex 的命令粘连：\\elli -> \\ell i；\\mu1 -> \\mu 1"""
import json, os, re

DATA = r"E:\blog\astro\src\data\udl"
n = 0
for f in sorted(os.listdir(DATA)):
    if not f.endswith(".json"):
        continue
    p = os.path.join(DATA, f)
    d = json.load(open(p, encoding="utf-8"))
    for pg in d["sections"]:
        for blocks in (pg["en"], pg["zh"]):
            for b in blocks:
                if b.get("type") == "equation" and b.get("latex"):
                    t = b["latex"]
                    t2 = re.sub(r"\\([a-zA-Z]+)(?=[A-Za-z0-9])", r"\\\1 ", t)
                    t2 = t2.replace(r"^{\sqrt}", r"^{\sqrt{}}").replace(r"\sqrt\\", r"\sqrt{}\\")
                    if t2 != t:
                        b["latex"] = t2
                        n += 1
    json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False)
print("patched equations:", n)
