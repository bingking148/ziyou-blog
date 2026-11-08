# -*- coding: utf-8 -*-
"""
UDL bilingual PDF -> structured JSON + figure crops.
Usage: python extract.py <out_dir> <ch_start_page> <ch_end_page_exclusive> <ch_number>
Pages are 0-based PDF indices of the chapter's first page and the next chapter's first page.
Each PDF page = left half English page + right half Chinese page.
"""
import json, os, re, sys
import fitz

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_math import page_math_regions

PDF = r"E:\pdf\out_book\UDL_bilingual_dual.pdf"
X_MID_RATIO = 0.5

# ---------------------------------------------------------------- char map
MATH_FONT_PAT = re.compile(r"^(CM(MI|SY|EX|R|TI|IT)|LM(MI|SY|EX)|MSAM|MSBM|EUFM)")
GREEK = {
    "α": "alpha", "β": "beta", "γ": "gamma", "δ": "delta", "ε": "epsilon",
    "ϵ": "epsilon", "ζ": "zeta", "η": "eta", "θ": "theta", "ι": "iota",
    "κ": "kappa", "λ": "lambda", "μ": "mu", "ν": "nu", "ξ": "xi",
    "π": "pi", "ρ": "rho", "σ": "sigma", "τ": "tau", "υ": "upsilon",
    "ϕ": "phi", "φ": "varphi", "χ": "chi", "ψ": "psi", "ω": "omega",
    "Γ": "Gamma", "Δ": "Delta", "Θ": "Theta", "Λ": "Lambda", "Ξ": "Xi",
    "Π": "Pi", "Σ": "Sigma", "Υ": "Upsilon", "Φ": "Phi", "Ψ": "Psi", "Ω": "Omega",
    "∂": "partial", "∇": "nabla", "∞": "infty", "∀": "forall", "∃": "exists",
    "∈": "in", "∉": "notin", "⊂": "subset", "⊆": "subseteq", "∪": "cup",
    "∩": "cap", "∅": "emptyset", "→": "rightarrow", "←": "leftarrow",
    "⇒": "Rightarrow", "⇐": "Leftarrow", "↦": "mapsto", "·": "cdot",
    "×": "times", "÷": "div", "±": "pm", "∓": "mp", "≤": "leq", "≥": "geq",
    "≠": "neq", "≈": "approx", "≡": "equiv", "∼": "sim", "∝": "propto",
    "∑": "sum", "∏": "prod", "∫": "int", "√": "sqrt", "∼": "sim",
    "∗": "ast", "⋆": "star", "∘": "circ", "⊗": "otimes", "⊙": "odot",
    "⊕": "oplus", "⊥": "perp", "∥": "parallel", "∠": "angle", "ℓ": "ell",
    "ℏ": "hbar", "∂": "partial", "‾": "", "¯": "",
}
LIG = {"ﬀ": "ff", "ﬁ": "fi", "ﬂ": "fl", "ﬃ": "ffi", "ﬄ": "ffl"}


def is_math_font(f):
    return bool(MATH_FONT_PAT.match(f)) or f in ("CMMI10", "CMR10", "CMSY10", "CMEX10")


def clean_text(t):
    for k, v in LIG.items():
        t = t.replace(k, v)
    # strip private control chars (CJK bold/italic font switches emit \x03)
    t = re.sub(r"[\x00-\x08\x0b-\x1f\x7f]", " ", t)
    return t


def span_to_tex(span, main_baseline):
    """Convert one math span to LaTeX-ish text."""
    t = clean_text(span["text"])
    if not t:
        return ""
    out = []
    for ch in t:
        if ch in GREEK:
            out.append("\\%s " % GREEK[ch])
        elif ch == "−":
            out.append("-")
        elif ch == "’":
            out.append("'")
        elif ch == "\u2032":  # prime
            out.append("'")
        elif ch == "µ":
            out.append("\\mu ")
        elif ch == "π":
            out.append("\\pi ")
        else:
            out.append(ch)
    t = "".join(out).strip()
    # subscript / superscript detection via baseline offset
    dy = span["origin"][1] - main_baseline
    if dy > 1.5:
        t = "_{%s}" % t
    elif dy < -1.5:
        t = "^{%s}" % t
    return t


def line_is_math(line):
    spans = [s for s in line["spans"] if s["text"].strip()]
    if not spans:
        return False
    # text-font spans that carry only punctuation are allowed; equation numbers
    # like (2.1) are typeset in math fonts themselves. Section numbers
    # ("1.1.1", LMSans10-Bold) must NOT match.
    def num_only(s):
        if is_math_font(s["font"]):
            return True
        if "Bold" in s["font"]:
            return False  # section numbers ("1.1.1", LMSans/NotoSerif bold)
        if "Italic" in s["font"] and len(s["text"].strip()) <= 2:
            return True  # italic math letters rendered in a text italic font
        return bool(re.fullmatch(r"[\s\d.,()+\-='\"（（）\[\]]*", s["text"]))
    return all(is_math_font(s["font"]) or num_only(s) for s in spans)


SOLID_MATH = re.compile(r"^(CM(MI|MIB|SY|EX|R|BX)\d*|MSBM|MSAM|EUFM)")


def line_has_solid_math(spans):
    """该行是否含"确定无疑"的数学字体（用于把同行的 LMRoman-Italic 判定为数学）"""
    return any(SOLID_MATH.match(s["font"]) for s in spans)


def render_math_html(group, baseline):
    """把行内数学 span 组渲染成 HTML：数学斜体 + 上下标，避免字符被空格拆散。"""
    out = []
    for s in group:
        dy = s["origin"][1] - baseline
        txt = clean_text(s["text"]).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        if dy > 1.5:
            out.append("<sub>%s</sub>" % txt)
        elif dy < -1.5:
            out.append("<sup>%s</sup>" % txt)
        else:
            out.append(txt)
    return '<span class="imath">%s</span>' % "".join(out)


def extract_side(page, left=True, fig_rects=(), math_rects=(), collect_inline=None):
    """Extract one half-page into typed blocks."""
    w = page.rect.width
    x_mid = w * X_MID_RATIO
    clip = fitz.Rect(0, 125, x_mid, 705) if left else fitz.Rect(x_mid, 125, w, 705)
    dd = page.get_text("dict", clip=clip, sort=True)
    lines = []
    for b in dd["blocks"]:
        if b.get("type") != 0:
            continue
        for l in b["lines"]:
            spans = [s for s in l["spans"] if s["text"].strip()]
            if not spans:
                continue
            lb = fitz.Rect(l["bbox"])
            # 落在显示公式区域内的行：由主循环统一处理（避免碎片块）
            if any(mr.contains(fitz.Point(lb.x0 + lb.width / 2, lb.y0 + lb.height / 2)) or
                   (mr.y0 - 3 <= lb.y0 <= mr.y1 and mr.x0 - 6 <= lb.x0 <= mr.x1 + 6 and lb.y1 <= mr.y1 + 3)
                   for mr in math_rects):
                continue
            lines.append({
                "bbox": lb,
                "spans": spans,
                "size": max(s["size"] for s in spans),
                "y": l["bbox"][1],
            })
    # margin notes & captions are set in two mini-columns: reading order is
    # (column, y) for small text, plain y for body text
    note_xs = [l["bbox"].x0 for l in lines if l["size"] <= 9.4]
    note_mid = None
    if note_xs and max(note_xs) - min(note_xs) > 100:
        note_mid = (min(note_xs) + max(note_xs)) / 2
    def sort_key(l):
        yy = round(l["y"] * 2) / 2
        if note_mid is not None and l["size"] <= 9.4:
            return (1 if l["bbox"].x0 > note_mid else 0, yy, l["bbox"].x0)
        return (0, yy, l["bbox"].x0)
    lines.sort(key=sort_key)

    # left margin = most common line x0 (for first-line-indent paragraph detection)
    import collections as _c
    margin = _c.Counter(round(l["bbox"].x0) for l in lines if l["size"] > 9.4).most_common(1)
    margin_x = margin[0][0] if margin else 0

    blocks = []          # {type, text|latex, size}
    cur = None           # current paragraph accumulator
    prev = None

    def flush():
        nonlocal cur
        if cur and cur["text"].strip():
            blocks.append(cur)
        cur = None

    for ln in lines:
        # figure-internal labels: line inside a figure rect AND in the same
        # horizontal band as the figure (margin captions/notes sit further left)
        if any(r.y0 - 2 < ln["y"] < r.y1 - 4 and ln["bbox"].x0 >= r.x0 - 4 for r in fig_rects):
            continue
        txt_all = "".join(clean_text(s["text"]) for s in ln["spans"]).strip()
        size = ln["size"]
        # dominant span = longest text: mixed lines (note heading + note body)
        # must be classified by the body of the text, not the biggest font
        dom = max(ln["spans"], key=lambda s: len(s["text"].strip()))
        fonts = {dom["font"]}
        bold_dom = "Bold" in dom["font"]
        size = dom["size"]
        # classify by dominant size (caption/note refined after text join)
        if size >= 15:
            kind = "h1"
        elif bold_dom and 11.5 <= size < 13:
            kind = "h2"
        elif bold_dom and 10.4 <= size < 11.4:
            kind = "h3"
        elif size <= 9.4:
            kind = "note"      # 8-9pt non-figure text = margin note / note heading
        else:
            kind = "body"
        # anything set in the left margin column (left of the body text block)
        # is a margin note regardless of point size (except headings, whose
        # numbers also hang into the margin on chapter opener pages)
        if size < 12 and kind not in ("h1", "h2", "h3") and ln["bbox"].x0 < margin_x - 25:
            kind = "note"
        if line_is_math(ln):
            kind = "equation"

        # drop footer lines
        if re.match(r"^\s*(Draft|草稿)", txt_all):
            continue

        baseline = ln["spans"][0]["origin"][1]

        if kind == "equation":
            flush()
            tex = "".join(span_to_tex(s, baseline) for s in ln["spans"]).strip()
            tex = re.sub(r"[\(\（]\s*\d+\.\d+\s*[\)\）]\s*$", "", tex).strip()
            if blocks and blocks[-1]["type"] == "equation" and abs(blocks[-1]["y"] - ln["y"]) < 30:
                blocks[-1]["latex"] += " \\\\ " + tex
                blocks[-1]["y"] = ln["y"]
                blocks[-1]["rect"] = [
                    min(blocks[-1]["rect"][0], ln["bbox"].x0), min(blocks[-1]["rect"][1], ln["bbox"].y0),
                    max(blocks[-1]["rect"][2], ln["bbox"].x1), max(blocks[-1]["rect"][3], ln["bbox"].y1),
                ]
            else:
                blocks.append({
                    "type": "equation", "latex": tex, "y": ln["y"], "page": page.number,
                    "rect": [ln["bbox"].x0, ln["bbox"].y0, ln["bbox"].x1, ln["bbox"].y1],
                    "side": "L" if left else "R",
                })
            prev = ln
            continue

        gap = ln["spans"][0]["origin"][1] - (prev["spans"][0]["origin"][1] if prev else 999)
        indented = ln["bbox"].x0 > margin_x + 8
        new_para = (
            cur is None
            or kind != cur["type"]
            or kind in ("h1", "h2", "h3")
            or (indented and kind in ("body", "note"))
            or gap > (12.8 if left else 18)   # en: para gap 13.3 vs leading 12.0; zh relies on indent
        )
        if new_para:
            flush()
            cur = {"type": kind, "text": "", "y": ln["y"], "_yend": ln["bbox"].y1, "page": page.number}
        cur["_yend"] = ln["bbox"].y1
        parts = []
        spans = ln["spans"]
        solid = line_has_solid_math(spans)

        def is_math_s(sp):
            if is_math_font(sp["font"]):
                return True
            # 同一行有确定数学字体时，Latin Modern 斜体也按数学处理
            # （UDL 的数学斜体与正文强调斜体共用 LMRoman-Italic，只能靠上下文区分）
            return solid and "LMRoman" in sp["font"] and "Italic" in sp["font"]

        si = 0
        while si < len(spans):
            s = spans[si]
            if is_math_s(s):
                grp = [s]
                sj = si + 1
                while sj < len(spans) and is_math_s(spans[sj]):
                    grp.append(spans[sj])
                    sj += 1
                gtxt = "".join(g["text"] for g in grp).strip()
                # 以括号开头的数学紧跟前面（f[x] 不加空格）；否则需要空格（of y）
                need_space = not gtxt.startswith(("(", "[", "{"))
                html = render_math_html(grp, baseline)
                if need_space:
                    parts.append(" ")
                parts.append(html)
                si = sj
                continue
            txt = clean_text(s["text"])
            txt = txt.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            parts.append(" " + txt)
            si += 1
        joined = re.sub(r"\s+", " ", "".join(parts)).strip()
        # 括号前不留空格：Pr (x|φ) -> Pr(x|φ)
        joined = re.sub(r"\s+([\(\[\{])", r"\1", joined)
        joined = re.sub(r"([\)\]\}])\s+(?=[,.;:])", r"\1", joined)
        joined = re.sub(r"\s+", " ", "".join(parts)).strip()
        if cur["text"].endswith(tuple("-‐‑–")):
            cur["text"] = cur["text"][:-1]          # de-hyphenate
        elif cur["text"]:
            cur["text"] += " "
        cur["text"] += joined
        prev = ln
    flush()

    # merge heading-number-only blocks into the following heading block
    merged = []
    for b in blocks:
        if (
            merged
            and b["type"] in ("h2", "h3")
            and merged[-1]["type"] == b["type"]
            and re.fullmatch(r"\d+(\.\d+)*", merged[-1]["text"].strip())
        ):
            merged[-1]["text"] += " " + b["text"]
            continue
        merged.append(b)
    blocks = merged

    # merge consecutive note blocks: margin notes & captions flow through two
    # mini-columns, so adjacent note blocks are usually one logical paragraph.
    # A new note starts when text looks like a note heading ("Bias and fairness:",
    # "Notebook 1.1", "Figure …", "附录 A …").
    NOTE_HEAD = re.compile(
        r"^([A-Z][A-Za-z ,'’-]{2,40}:|Figure\s|图\s*\d|Notebook\s|笔记本\s*\d|附录\s|Appendix\s|Notation|符号$|[\u4e00-\u9fffA-Za-z][\u4e00-\u9fff，、 ]{1,18}：)"
    )
    HYPHENS = "-‐‑–"
    def smart_join(a, b):
        if a.endswith(tuple(HYPHENS)):
            return a[:-1] + b.lstrip()
        return a.rstrip() + " " + b.lstrip()
    merged2 = []
    for b in blocks:
        if (
            merged2
            and b["type"] == "note"
            and merged2[-1]["type"] == "note"
            and not NOTE_HEAD.match(b["text"].strip())
        ):
            merged2[-1]["text"] = smart_join(merged2[-1]["text"], b["text"])
            merged2[-1]["_yend"] = b.get("_yend", merged2[-1]["_yend"])
            continue
        merged2.append(b)
    for b in merged2:
        b.pop("_yend", None)
    blocks = merged2

    # "(2.1)" style equation-number blocks: merge into the preceding short
    # math-looking body line, promoting it to an equation
    merged3 = []
    for b in blocks:
        if (
            merged3
            and b["type"] == "equation"
            and not b["latex"].strip()
            and merged3[-1]["type"] == "body"
            and re.fullmatch(r"[A-Za-z0-9\s=\+\-\*\(\)\[\]\|\.']{1,60}", merged3[-1]["text"].strip() or " ")
            and re.search(r"[=]", merged3[-1]["text"])
        ):
            merged3[-1]["type"] = "equation"
            merged3[-1]["latex"] = merged3[-1]["text"]
            merged3[-1].pop("text", None)
            continue
        if b["type"] == "equation" and not b["latex"].strip():
            continue  # drop empty equation blocks
        merged3.append(b)
    blocks = merged3

    # mark figure captions: small-text blocks that start with "Figure N.M" / "图 N.M"
    # (body text is >=9.5pt, captions/notes smaller, so a body paragraph citing 图1.2 is safe)
    for b in blocks:
        if b["type"] in ("note", "caption", "body") and b["type"] != "body" \
                and re.match(r"^(Figure|图)\s*\d+\.\d+", b["text"].strip()):
            b["type"] = "figcap"

    # tidy spaces before punctuation in plain-text blocks (PDF extraction artifact)
    for b in blocks:
        if b["type"] not in ("equation",):
            b["text"] = re.sub(r"\s+([,.;:!?%)\]}，。；：！？）】》”’、])", r"\1", b["text"])
            b["text"] = re.sub(r"([(\[{（【《 “‘])\s+", r"\1", b["text"])
            t = b["text"]
            # CJK 空格规范：汉字之间不留空格（\x03 清洗残留 / span 拼接残留）；
            # 汉字与拉丁字母数字之间保留单个空格（盘古之白）
            t = re.sub(r"([\u4e00-\u9fff，。；：、！“”（）])\s+(?=[\u4e00-\u9fff，。；：、！“”（）])", r"\1", t)
            t = re.sub(r"([\u4e00-\u9fff])\s*([A-Za-z0-9])", r"\1 \2", t)
            t = re.sub(r"([A-Za-z0-9%.])\s*([\u4e00-\u9fff])", r"\1 \2", t)
            b["text"] = re.sub(r"  +", " ", t).strip()

    return blocks


def find_figures(page, blocks_side):
    """Cluster vector drawings + images into figure regions, render crops."""
    w = page.rect.width
    x_mid = w * X_MID_RATIO
    clipL = fitz.Rect(0, 40, x_mid, page.rect.height - 30)
    regions = []
    # image blocks
    dd = page.get_text("dict", clip=clipL)
    rects = []
    for b in dd["blocks"]:
        if b.get("type") == 1:
            rects.append(fitz.Rect(b["bbox"]))
    for dr in page.get_drawings():
        r = fitz.Rect(dr["rect"])
        if r.x1 < x_mid - 5 and r.height > 0.5:
            rects.append(r)
    if not rects:
        return regions
    # cluster by vertical proximity
    rects.sort(key=lambda r: r.y0)
    clusters = []
    for r in rects:
        if clusters and r.y0 - clusters[-1][0].y1 < 25:
            c = clusters[-1]
            clusters[-1] = [fitz.Rect(min(c[0].x0, r.x0), min(c[0].y0, r.y0), max(c[0].x1, r.x1), max(c[0].y1, r.y1)), c[1] + 1]
        else:
            clusters.append([fitz.Rect(r), 1])
    for rect, n in clusters:
        if rect.width < 40 or rect.height < 40 or n < 2:
            continue  # rules, page decorations etc.
        if rect.y0 < 110 or rect.y1 > 700:
            continue  # header/footer decorations
        if rect.x0 < 60 and rect.x1 > 550:
            continue  # full-width page decoration frames
        regions.append(rect)
    # merge overlapping detections (image block + drawing cluster of same figure)
    mergedr = []
    for r in regions:
        if mergedr:
            p = mergedr[-1]
            inter = fitz.Rect(p) & r
            a = p.get_area() * r.get_area()
            if not inter.is_empty and inter.get_area() / max(a, 1) > 0.5:
                mergedr[-1] = fitz.Rect(min(p.x0, r.x0), min(p.y0, r.y0), max(p.x1, r.x1), max(p.y1, r.y1))
                continue
        mergedr.append(r)
    return mergedr


def bad_latex(tex):
    """复杂/损坏的公式还原：多行、未映射字符（CMEX 大运算符）、连续上下标、碎片"""
    if not tex.strip():
        return True
    if "\\\\" in tex:
        return True
    if re.search(r'[µ#"ˆ˜¯˘]', tex):
        return True
    if re.search(r"[_^]\{[^}]*\}[_^]\{", tex):
        return True
    t = tex.strip()
    if len(t) < 6:
        return True  # 孤立碎片（求和下限、单独符号等）
    if len(t) < 12 and not re.search(r"\\|\[|\(|\{", t):
        return True  # 'i=1' 类求和下限（无 LaTeX 命令的短式子）
    return False


def degrade_equations(doc, blocks_by_page, out_dir, ch_no):
    """把 bad_latex 的公式块降级为高清裁图（eqimg），与原书 100% 一致。
    先把同页相邻（y 差 < 45）的公式块合并成整块再判定，避免多行公式碎片。
    裁图 = 文字bbox ∪ 同y范围重叠的绘制对象框（根号/大括号/上下标等），确保完整。"""
    n = 0
    for pno, blocks in blocks_by_page:
        page = doc[pno]
        x_mid = page.rect.width * X_MID_RATIO
        # 该页左半的绘制对象框（公式多行运算在左半）
        draw_rects = []
        for dr in page.get_drawings():
            r = fitz.Rect(dr["rect"])
            if r.x1 < x_mid - 5 and r.width < x_mid:
                draw_rects.append(r)
        # 合并相邻 equation 块（用 rect 的 y0 判定相邻；y 已被 pair_figures 清理）
        merged = []
        for b in blocks:
            if (
                b.get("type") == "equation"
                and merged
                and merged[-1].get("type") == "equation"
                and merged[-1].get("page") == pno
                and b.get("rect")
                and merged[-1].get("rect")
                and abs(merged[-1]["rect"][3] - b["rect"][1]) < 45
            ):
                t = merged[-1]
                t["latex"] += " \\\\ " + b.get("latex", "")
                r0, r1 = t["rect"], b["rect"]
                t["rect"] = [min(r0[0], r1[0]), min(r0[1], r1[1]), max(r0[2], r1[2]), max(r0[3], r1[3])]
                continue
            merged.append(b)
        blocks[:] = merged
        for b in blocks:
            if b.get("type") != "equation" or not bad_latex(b.get("latex", "")):
                continue
            if b.get("img"):
                continue  # 已有完整区域裁图，等视觉识别回填 latex；保留图作兜底
            page = doc[pno]
            r = b.get("rect")
            if not r:
                b["type"] = "note"
                b["text"] = b.pop("latex", "")
                continue
            # 并入该 y 范围内重叠的绘制对象框（根号横线/大括号/上下标等）
            ry0, ry1 = r[1], r[3]
            for dr in draw_rects:
                if dr.y0 < ry1 + 6 and dr.y1 > ry0 - 6:
                    # 只并入水平方向贴近公式区的（避免把整页装饰框并入）
                    if dr.x0 < r[2] + 60 and dr.x1 > r[0] - 60:
                        r[0] = min(r[0], dr.x0)
                        r[2] = max(r[2], dr.x1)
                        r[1] = min(r[1], dr.y0)
                        r[3] = max(r[3], dr.y1)
            clip = fitz.Rect(r[0] - 8, r[1] - 8, r[2] + 8, r[3] + 8)
            pix = page.get_pixmap(clip=clip, dpi=220)
            name = "figures/ch%s_p%02d_eq%d.png" % (ch_no, pno, n)
            pix.save(os.path.join(out_dir, name))
            n += 1
            b["type"] = "eqimg"
            b["img"] = name
            b.pop("latex", None)
            b.pop("rect", None)
            b.pop("side", None)
    return n


def main():
    out_dir = sys.argv[1]
    p_start, p_end, ch_no = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
    os.makedirs(os.path.join(out_dir, "figures"), exist_ok=True)
    d = fitz.open(PDF)
    result = {"chapter": ch_no, "sections": []}
    all_en_blocks, all_zh_blocks, all_figs = [], [], []

    for pno in range(p_start, p_end):
        page = d[pno]
        figs = find_figures(page, None)
        w = page.rect.width
        x_mid = w * X_MID_RATIO
        zh_rects = [fitz.Rect(r.x0 + x_mid, r.y0, r.x1 + x_mid, r.y1) for r in figs]
        # 显示公式区域（完整聚类，替代原来的逐行碎片）
        en_math, _ = page_math_regions(page, left=True)
        zh_math_raw, _ = page_math_regions(page, left=False)
        en_math_rects = [m["rect"] for m in en_math]
        zh_math_rects = [m["rect"] for m in zh_math_raw]
        en = extract_side(page, left=True, fig_rects=figs, math_rects=en_math_rects)
        zh = extract_side(page, left=False, fig_rects=zh_rects, math_rects=zh_math_rects)
        # 公式裁图 + 插入到 block 流（type=equation，latex 待视觉识别回填）
        eq_meta = []
        for i, m in enumerate(en_math):
            r = m["rect"]
            clip = fitz.Rect(r.x0 - 6, r.y0 - 6, r.x1 + 6, r.y1 + 6)
            pix = page.get_pixmap(clip=clip, dpi=200)
            name = "figures/ch%s_p%02d_m%d.png" % (ch_no, pno, i)
            pix.save(os.path.join(out_dir, name))
            eq_meta.append({"img": name, "y": r.y0, "page": pno})
        for blocks, metas in ((en, eq_meta), (zh, eq_meta)):
            for meta in metas:
                idx = next((i for i, b in enumerate(blocks) if b.get("y", 0) > meta["y"]), len(blocks))
                blocks.insert(idx, {
                    "type": "equation", "img": meta["img"], "latex": "",
                    "y": meta["y"], "page": pno,
                })
        # render figure crops from left half
        fig_meta = []
        for i, r in enumerate(figs):
            clip = fitz.Rect(r.x0 - 3, r.y0 - 3, r.x1 + 3, r.y1 + 3)
            pix = page.get_pixmap(clip=clip, dpi=220)
            name = "figures/ch%s_p%02d_f%d.png" % (ch_no, pno - p_start + 1, i)
            pix.save(os.path.join(out_dir, name))
            fig_meta.append({"img": name, "rect": [r.x0, r.y0, r.x1, r.y1], "page": pno})
        # pair figure crops with their caption blocks (caption sits below the figure)
        def pair(blocks, rects, imgs):
            used = set()
            for rect, meta in zip(rects, imgs):
                caps = [b for b in blocks if b["type"] == "figcap" and b["y"] > rect.y1 - 2 and id(b) not in used]
                if caps:
                    cap = min(caps, key=lambda b: b["y"])
                    used.add(id(cap))
                    cap["type"] = "figure"
                    cap["img"] = meta["img"]
            # unmatched figures: insert as standalone blocks at their vertical position
            for rect, meta in zip(rects, imgs):
                if meta["img"] in [b.get("img") for b in blocks]:
                    continue
                idx = next((i for i, b in enumerate(blocks) if b.get("y", 0) > rect.y1), len(blocks))
                blocks.insert(idx, {"type": "figure", "img": meta["img"], "text": "", "y": rect.y1, "page": page.number})

        for blocks in (en, zh):
            for b in blocks:
                pass  # keep y until post-pass
        all_en_blocks.append((pno, en))
        all_zh_blocks.append((pno, zh))
        all_figs.extend(fig_meta)
        result["sections"].append({
            "pdf_page": pno,
            "en": en, "zh": zh,
            "figures": [{"img": m["img"]} for m in fig_meta],
        })
        print("page", pno, "en blocks", len(en), "zh blocks", len(zh), "figures", len(figs))

    pair_figures(all_en_blocks, all_zh_blocks, all_figs)
    neq = degrade_equations(d, all_en_blocks, out_dir, ch_no)
    neq += degrade_equations(d, all_zh_blocks, out_dir, ch_no)
    print("degraded equations -> images:", neq)

    with open(os.path.join(out_dir, "chapter.json"), "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
    print("done ->", out_dir)


def pair_figures(all_en, all_zh, all_figs):
    """Global post-pass: pair figure crops with caption blocks by reading order
    (figures and their captions appear in the same order within a chapter);
    handles cross-page captions."""
    figs_sorted = sorted(all_figs, key=lambda f: (f["page"], f["rect"][1]))
    used_imgs = set()

    def match(blocks_by_page, side):
        caps = []
        for pno, blocks in blocks_by_page:
            for b in blocks:
                if b["type"] == "figcap":
                    caps.append((pno, b.get("y", 0), b))
        caps.sort(key=lambda t: (t[0], t[1]))
        if side == "en":
            pairs = list(zip(figs_sorted, caps))
            for f, (_, _, cap) in pairs:
                cap["type"] = "figure"
                cap["img"] = f["img"]
                used_imgs.add(f["img"])
        else:
            # zh side: pair zh captions with the same images, by same order
            zh_caps = [c for _, _, c in caps]
            cand = [f for f in figs_sorted]
            if len(zh_caps) == len(cand):
                for f, cap in zip(cand, zh_caps):
                    cap["type"] = "figure"
                    cap["img"] = f["img"]
            else:
                # counts differ (extraction noise): pair by caption number
                for cap in zh_caps:
                    m = re.match(r"^(?:Figure|图)\s*(\d+\.\d+)", cap["text"].strip())
                    if m and int(m.group(1).split(".")[1]) is not None:
                        pass
                for i, cap in enumerate(zh_caps):
                    if i < len(cand):
                        cap["type"] = "figure"
                        cap["img"] = cand[i]["img"]
        # unmatched figures -> standalone blocks in their page stream
        placed = {b.get("img") for _, blocks in blocks_by_page for b in blocks}
        for f in figs_sorted:
            if f["img"] in placed:
                continue
            for pno, blocks in blocks_by_page:
                if pno != f["page"]:
                    continue
                idx = next((i for i, b in enumerate(blocks) if b.get("y", 0) > f["rect"][3]), len(blocks))
                blocks.insert(idx, {"type": "figure", "img": f["img"], "text": "", "y": f["rect"][3], "page": pno})
                break

    match(all_en, "en")
    match(all_zh, "zh")

    # zh figure blocks carry empty captions (图注 sits in a neighbouring note
    # block) — merge that note into the figure block for a symmetric structure
    for _, blocks in all_zh:
        for i, b in enumerate(blocks):
            if b["type"] == "figure" and not b.get("text", "").strip():
                for j in (i - 1, i + 1):
                    if 0 <= j < len(blocks):
                        nb = blocks[j]
                        if nb["type"] == "note" and re.match(r"^(图)\s*\d+\.\d+", nb["text"].strip()):
                            b["text"] = nb["text"].strip()
                            nb["type"] = "_removed"
                            break

    # cross-page paragraph continuation: if a body block doesn't end with
    # terminal punctuation and the next body block starts lowercase (en) /
    # ordinary text (zh), merge them across the page boundary
    for _, blocks in all_en + all_zh:
        clean = [b for b in blocks if b["type"] != "_removed"]
        blocks[:] = clean
        for i, b in enumerate(blocks):
            if b["type"] == "body":
                t = b["text"].strip()
                if t.endswith(("-", ",", ";")) or (t and not re.search(r"[.。！？!?：:]$", t)):
                    b["cont"] = True

    for _, blocks in all_en + all_zh:
        for b in blocks:
            b.pop("y", None)


if __name__ == "__main__":
    main()
