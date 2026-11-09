#!/usr/bin/env python3
"""把霞鹜文楷 Screen 收成两份站点用得到的 woff2。

字形仍来自仓库里的 unicode-range 切片，不换字体、不改度量。
critical：首页模板、导航页脚、专栏与文章标题简介（首屏和标题会用到）。
rest：其余静态正文。评论等动态文字仍走原来的全量 CSS，按需再下。

依赖：pip install fonttools brotli
然后在 astro/ 下执行：python3 scripts/subset-wenkai.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

from fontTools.merge import Merger
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
src_root = root / "src"
font_dir = root / "public/resources/lxgw-wenkai-screen-webfont@1.1.0"
files_dir = font_dir / "files"
css_path = font_dir / "lxgwwenkaiscreen.css"
out_css = font_dir / "lxgwwenkaiscreen-used.css"

CRITICAL_FILES = {
    "layouts/Base.astro": "astro",
    "pages/index.astro": "astro",
    "styles/global.css": "css",
    "consts.ts": "js",
    "components/MoodKnob.astro": "astro",
    "components/BackToTop.astro": "astro",
}


def strip_comments(text: str, kind: str) -> str:
    if kind in {"astro", "css", "js", "md"}:
        text = re.sub(r"/\*[\s\S]*?\*/", " ", text)
    if kind == "astro":
        text = re.sub(r"<!--[\s\S]*?-->", " ", text)
    if kind in {"astro", "js", "md"}:
        text = re.sub(r"(^|[^:\\])//.*?$", r"\1", text, flags=re.M)
    return text


def parse_faces(css: str):
    faces = []
    for block in re.split(r"/\*[^*]*\*/", css):
        src = re.search(r"url\('\./files/([^']+)'\)", block)
        ur = re.search(r"unicode-range:\s*([^;}]+)", block)
        if not src or not ur:
            continue
        faces.append((src.group(1), parse_ranges(ur.group(1))))
    return faces


def parse_ranges(raw: str):
    cps = set()
    for part in raw.split(","):
        part = part.strip()
        if not part.upper().startswith("U+"):
            continue
        body = part[2:]
        if "-" in body:
            a, b = body.split("-", 1)
            cps.update(range(int(a, 16), int(b, 16) + 1))
        else:
            cps.add(int(body, 16))
    return cps


def collect_chars():
    critical = set()
    everything = set()
    for rel, kind in CRITICAL_FILES.items():
        text = strip_comments((src_root / rel).read_text(encoding="utf-8"), kind)
        critical.update(map(ord, text))
    for path in src_root.rglob("*"):
        if "generated" in path.parts or not path.is_file():
            continue
        if path.suffix.lower() not in {".astro", ".css", ".ts", ".mjs", ".md", ".json"}:
            continue
        rel = path.relative_to(src_root).as_posix()
        kind = "css" if path.suffix == ".css" else "md" if path.suffix == ".md" else "js" if path.suffix in {".ts", ".mjs", ".json"} else "astro"
        text = strip_comments(path.read_text(encoding="utf-8", errors="ignore"), kind)
        everything.update(map(ord, text))
        if rel.startswith("content/columns/"):
            critical.update(map(ord, text))
        elif rel.startswith("content/post/"):
            matter = re.match(r"---\n([\s\S]*?)\n---", text)
            block = matter.group(1) if matter else ""
            for key in ("title", "description", "tags", "categories"):
                found = re.search(rf"^{key}:\s*(.*)$", block, re.M)
                if found:
                    critical.update(map(ord, found.group(1)))
    return critical, everything


def unicode_range(cps):
    ordered = sorted(set(cps))
    if not ordered:
        return ""
    parts = []
    start = prev = ordered[0]
    for cp in ordered[1:]:
        if cp == prev + 1:
            prev = cp
            continue
        parts.append(format_span(start, prev))
        start = prev = cp
    parts.append(format_span(start, prev))
    return ", ".join(parts)


def format_span(start, end):
    if start == end:
        return f"U+{start:04X}"
    return f"U+{start:04X}-{end:04X}"


def subset_to_ttf(src: Path, keep: list[int], dest: Path):
    font = TTFont(src)
    options = Options()
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    options.recommended_glyphs = True
    options.glyph_names = True
    options.legacy_kern = True
    options.hinting = True
    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=keep)
    subsetter.subset(font)
    font.flavor = None
    font.save(dest)
    font.close()


def merge_ranges(faces, wanted: set[int], tmp: Path, label: str) -> TTFont | None:
    paths = []
    for name, declared in faces:
        src = files_dir / name
        font = TTFont(src)
        cmap = font.getBestCmap() or {}
        keep = [cp for cp in declared if cp in wanted and cp in cmap]
        font.close()
        if not keep:
            continue
        dest = tmp / f"{label}-{len(paths):03d}.ttf"
        subset_to_ttf(src, keep, dest)
        paths.append(dest)
    if not paths:
        return None
    merged = Merger().merge([str(p) for p in paths])
    hhea = merged["hhea"]
    if (hhea.ascent, hhea.descent, hhea.lineGap) != (1900, -500, 0):
        raise SystemExit(f"{label} 度量被改写：{hhea.ascent} {hhea.descent} {hhea.lineGap}")
    return merged


def face_css(filename: str, cps: set[int]) -> str:
    return (
        "@font-face {\n"
        "  font-family: 'LXGW WenKai Screen';\n"
        "  font-style: normal;\n"
        "  font-weight: 400;\n"
        "  font-display: swap;\n"
        f"  src: url('./{filename}') format('woff2');\n"
        f"  unicode-range: {unicode_range(cps)};\n"
        "}\n"
    )


def main():
    faces = parse_faces(css_path.read_text(encoding="utf-8"))
    if len(faces) < 90:
        raise SystemExit(f"没有解析到文楷切片，只有 {len(faces)} 段")
    critical_text, all_text = collect_chars()
    covered = set()
    for _, declared in faces:
        covered |= declared
    critical = critical_text & covered
    rest = (all_text & covered) - critical
    tmp = root / ".wenkai-tmp"
    tmp.mkdir(exist_ok=True)
    for old in tmp.glob("*.ttf"):
        old.unlink()
    critical_font = merge_ranges(faces, critical, tmp, "critical")
    rest_font = merge_ranges(faces, rest, tmp, "rest")
    if critical_font is None:
        raise SystemExit("critical 子集是空的")
    critical_name = "lxgwwenkaiscreen-critical.woff2"
    rest_name = "lxgwwenkaiscreen-rest.woff2"
    critical_path = font_dir / critical_name
    rest_path = font_dir / rest_name
    critical_font.flavor = "woff2"
    critical_font.save(critical_path)
    css = "/* 由 scripts/subset-wenkai.py 生成。字形与度量来自 LXGW WenKai Screen，只是少下了用不到的切片。 */\n"
    css += face_css(critical_name, set(critical_font.getBestCmap() or {}))
    if rest_font is not None:
        rest_font.flavor = "woff2"
        rest_font.save(rest_path)
        css += face_css(rest_name, set(rest_font.getBestCmap() or {}))
    out_css.write_text(css, encoding="utf-8")
    # 声明了 unicode-range、但切片里没有字形的字符。检查脚本放行它们，
    # 这些字本来就会落到后面的系统字体，不是这次子集漏掉的。
    present = set()
    for name, _declared in faces:
        font = TTFont(files_dir / name)
        for table in font["cmap"].tables:
            if hasattr(table, "cmap"):
                present.update(table.cmap)
        font.close()
    absent = sorted((all_text & covered) - present)
    (font_dir / "wenkai-absent.txt").write_text("".join(chr(cp) for cp in absent), encoding="utf-8")
    for path in tmp.glob("*.ttf"):
        path.unlink()
    tmp.rmdir()
    print(
        f"critical {critical_path.stat().st_size} bytes / {len(critical_font.getBestCmap() or {})} glyphs; "
        f"rest {rest_path.stat().st_size if rest_path.exists() else 0} bytes / {len(rest_font.getBestCmap() or {}) if rest_font else 0} glyphs"
    )


if __name__ == "__main__":
    sys.exit(main() or 0)
