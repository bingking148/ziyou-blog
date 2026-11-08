# -*- coding: utf-8 -*-
"""Dump span-level structure of a page for calibration."""
import sys, json
import fitz

pdf = r"E:\pdf\out_book\UDL_bilingual_dual.pdf"
page_no = int(sys.argv[1]) if len(sys.argv) > 1 else 16
side = sys.argv[2] if len(sys.argv) > 2 else "L"

d = fitz.open(pdf)
p = d[page_no]
x_mid = p.rect.width / 2
clip = fitz.Rect(0, 0, x_mid, p.rect.height) if side == "L" else fitz.Rect(x_mid, 0, p.rect.width, p.rect.height)
dd = p.get_text("dict", clip=clip)
for b in dd["blocks"]:
    if b.get("type") != 0:
        print("IMAGE BLOCK", b["bbox"])
        continue
    for l in b["lines"]:
        spans = []
        for s in l["spans"]:
            t = s["text"]
            if not t.strip():
                continue
            spans.append("[%s|%.1f|y=%.0f] %r" % (s["font"], s["size"], s["origin"][1], t))
        if spans:
            print("LINE y=%.0f x=%.0f:" % (l["bbox"][1], l["bbox"][0]))
            for s in spans:
                print("   ", s)
