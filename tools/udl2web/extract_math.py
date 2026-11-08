# -*- coding: utf-8 -*-
"""数学区域检测 v2：
- 收集每页左半的所有数学字体 span
- 按行（y）分组，判断整行是否全为数学（display 候选）还是夹杂正文（inline）
- display 行按 y 间距聚类成完整公式区域
- 输出统计 + 用于裁图/识别的区域列表
"""
import json, os, re, sys
import fitz

PDF = r"E:\pdf\out_book\UDL_bilingual_dual.pdf"
X_MID_RATIO = 0.5

# 真正的数学字体：Computer Modern 数学族 + AMS 黑板/花体
# 注意：LMRoman10-Italic 是正文强调斜体，不是数学，必须排除
MATH_FONT_PAT = re.compile(
    r"^(CM(MI|MIB|SY|EX|R|BX|TI|SS|SL|TT|CSC|DUNH|FIB|V|U)\d*$|"
    r"LM(MI|SY|EX|Math)|LMMath|"
    r"MSAM|MSBM|EUFM|RSFS|STIX|XITS|Asana-Math)",
)


def is_math_font(f):
    return bool(MATH_FONT_PAT.match(f))


def page_math_regions(page, left=True):
    """返回 (display_regions, inline_hits)"""
    w = page.rect.width
    x_mid = w * X_MID_RATIO
    clip = fitz.Rect(0, 120, x_mid, 710) if left else fitz.Rect(x_mid, 120, w, 710)
    dd = page.get_text("dict", clip=clip, sort=True)

    # 按 line 收集 span，标记是否含数学
    rows = []
    EQNUM = re.compile(r"^\s*[\(\（]\s*\d+\.\d+\s*[\)\）]\s*$")
    for b in dd["blocks"]:
        if b.get("type") != 0:
            continue
        for l in b["lines"]:
            spans = [s for s in l["spans"] if s["text"].strip()]
            if not spans:
                continue
            math_spans = [s for s in spans if is_math_font(s["font"])]
            # 公式编号 (C.8) 不算正文，避免整行被判为文本
            text_spans = [s for s in spans if not is_math_font(s["font"]) and not EQNUM.match(s["text"])]
            mc = sum(len(s["text"].strip()) for s in math_spans)
            tc = sum(len(s["text"].strip()) for s in text_spans)
            rows.append({
                "bbox": fitz.Rect(l["bbox"]),
                "y": l["spans"][0]["origin"][1],
                "all_math": mc > 0 and (tc == 0 or mc / float(mc + tc) > 0.6),
                "has_math": mc > 0,
                "n_math": len(math_spans),
            })
    rows.sort(key=lambda r: r["y"])

    display_rows = [r for r in rows if r["all_math"]]
    inline_rows = [r for r in rows if r["has_math"] and not r["all_math"]]

    # display 行按 y 间距聚类（同一公式的多行：间距 < 42pt，含大积分号跨行）
    regions = []
    for r in display_rows:
        if regions and r["y"] - regions[-1]["rect"].y1 < 42:
            last = regions[-1]
            last["rect"] = fitz.Rect(
                min(last["rect"].x0, r["bbox"].x0), min(last["rect"].y0, r["bbox"].y0),
                max(last["rect"].x1, r["bbox"].x1), max(last["rect"].y1, r["bbox"].y1),
            )
            last["rows"].append(r)
        else:
            regions.append({"rect": fitz.Rect(r["bbox"]), "rows": [r]})

    # 并入该区域内的绘制对象（根号/大括号/分数线）
    draw_rects = [fitz.Rect(d["rect"]) for d in page.get_drawings()]
    for reg in regions:
        rc = reg["rect"]
        for dr in draw_rects:
            if dr.y0 < rc.y1 + 6 and dr.y1 > rc.y0 - 6 and dr.x0 < rc.x1 + 40 and dr.x1 > rc.x0 - 40:
                if dr.width < x_mid * 0.95:  # 排除整页装饰框
                    rc |= dr
        reg["rect"] = rc
    return regions, inline_rows


def main():
    d = fitz.open(PDF)
    p0, p1 = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (14, 476)
    tot_disp = tot_inline = 0
    pages_with_inline = 0
    samples = []
    for pno in range(p0, p1):
        page = d[pno]
        regs, inls = page_math_regions(page, left=True)
        tot_disp += len(regs)
        tot_inline += len(inls)
        if inls:
            pages_with_inline += 1
        if len(samples) < 5 and regs:
            samples.append((pno, [(tuple(round(v) for v in r["rect"]), len(r["rows"])) for r in regs[:3]]))
    print("pages %d..%d" % (p0, p1))
    print("display 公式区域:", tot_disp)
    print("inline 数学行:", tot_inline, "（涉及页数 %d）" % pages_with_inline)
    for s in samples:
        print("  p%d:" % s[0], s[1])


if __name__ == "__main__":
    main()
