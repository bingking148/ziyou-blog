# -*- coding: utf-8 -*-
"""清洗视觉模型输出的 LaTeX：
- 去掉 $$...$$ / \\[...\\] / $...$ 外层包装
- 去掉模型加的代码围栏
- 无法被 KaTeX 渲染的（表格/代码/特殊符号/结构残缺）置空，交给图片兜底
"""
import json, os, re, sys

DATA = r"E:\blog\astro\src\data\udl"

# KaTeX 不支持的构造 -> 用图兜底
UNSUPPORTED = [
    r"\begin{tabular}", r"\begin{verbatim}", r"\begin{table}", r"\begin{align}",
    r"\ding", r"\checkmark", r"\toprule", r"\midrule", r"\bottomrule",
    r"\begin{cases}",  # KaTeX 其实支持，但保险起见先不管
]
UNSUPPORTED = [u for u in UNSUPPORTED if u != r"\begin{cases}"]


def clean(t):
    t = (t or "").strip()
    # 代码围栏
    t = re.sub(r"^```[a-zA-Z]*\s*", "", t)
    t = re.sub(r"\s*```$", "", t)
    t = t.strip()
    # 外层 $$ / \[ \] / $  / \( \)
    for a, b in (("$$", "$$"), ("\\[", "\\]"), ("\\(", "\\)"), ("$", "$")):
        if t.startswith(a) and t.endswith(b) and len(t) > len(a) + len(b):
            t = t[len(a):len(t) - len(b)].strip()
            break
    # 再次剥离（嵌套 $$\[...\]$$）
    for a, b in (("$$", "$$"), ("\\[", "\\]")):
        if t.startswith(a) and t.endswith(b) and len(t) > len(a) + len(b):
            t = t[len(a):len(t) - len(b)].strip()
    # 结构残缺：以下标/上标开头说明丢了主体
    if re.match(r"^[_^]", t):
        return ""
    # 未闭合的 \left / \right 数量不匹配（粗略）
    if t.count("\\left") != t.count("\\right"):
        return ""
    # 花括号配平
    if t.count("{") != t.count("}"):
        return ""
    for u in UNSUPPORTED:
        if u in t:
            return ""
    return t.strip()


def main():
    stats = {"clean": 0, "empty": 0, "total": 0}
    for f in sorted(os.listdir(DATA)):
        if not f.endswith(".json"):
            continue
        p = os.path.join(DATA, f)
        d = json.load(open(p, encoding="utf-8"))
        changed = False
        for pg in d["sections"]:
            for side in ("en", "zh"):
                for b in pg[side]:
                    if b.get("type") != "equation":
                        continue
                    stats["total"] += 1
                    if not b.get("latex"):
                        stats["empty"] += 1
                        continue
                    c = clean(b["latex"])
                    if c != b["latex"]:
                        b["latex"] = c
                        changed = True
                    if not c:
                        stats["empty"] += 1
        if changed:
            json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False)
    print(stats)


if __name__ == "__main__":
    main()
