#!/usr/bin/env python3
"""Hugo 与 Astro 文章双写同步工具。

双写约定：content/post/（Hugo，写作入口）与 astro/src/content/post/（Astro）
各留一份，除 frontmatter 里 lastmod（Hugo）与 updatedDate（Astro）这一处
字段名外，内容完全一致。本工具把一侧的改动同步到另一侧：

    python -I scripts/sync_post.py                    # 全量 Hugo → Astro
    python -I scripts/sync_post.py foo.md bar.md      # 只同步指定文章
    python -I scripts/sync_post.py --reverse          # 反向：Astro → Hugo
    python -I scripts/sync_post.py --check            # 只报告漂移，不写文件

说明：
- 只处理文章；专栏定义（content/categories/*/_index.md 与
  astro/src/content/columns/*.md）结构不同，改了请手动同步。
- 只在源侧存在的文件会新建到目标侧；只在目标侧存在的文件原样保留，
  结尾会提示用 --reverse（或默认方向）补齐。
- 写出统一 UTF-8 无 BOM + LF；字段名按目标侧约定转换，其余内容逐行保留。
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HUGO_DIR = ROOT / "content" / "post"
ASTRO_DIR = ROOT / "astro" / "src" / "content" / "post"

HUGO_KEY = "lastmod"
ASTRO_KEY = "updatedDate"


def split_frontmatter(text: str) -> tuple[list[str], str]:
    """按行拆出 YAML frontmatter（首行必须是 ---）与其余正文。

    返回 (frontmatter 行列表, 正文)；没有合法 frontmatter 时返回 ([], 原文)。
    """
    lines = text.split("\n")
    if not lines or lines[0].strip() != "---":
        return [], text
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            return lines[1:i], "\n".join(lines[i + 1:])
    return [], text


def convert_key(text: str, src_key: str, dst_key: str) -> str:
    """frontmatter 里把 src_key 行改名为 dst_key（仅首个匹配），其余逐行保留。"""
    fm, body = split_frontmatter(text)
    if not fm:
        return text
    out = []
    swapped = False
    for line in fm:
        key, sep, rest = line.partition(":")
        if not swapped and key.strip() == src_key and sep:
            out.append(f"{dst_key}:{rest}")
            swapped = True
        else:
            out.append(line)
    return "---\n" + "\n".join(out) + "\n---\n" + body


def canonical(text: str, mod_key: str) -> str:
    """归一化后用于比对：本侧的 lastmod/updatedDate 统一成 MOD，换行已由文本模式抹平。"""
    fm, body = split_frontmatter(text)
    fm = [re.sub(rf"^{mod_key}(\s*:)", "MOD\\1", line) for line in fm]
    return "\n".join(fm) + "\n" + body


def write_converted(dst: Path, text: str, src_key: str, dst_key: str) -> None:
    with open(dst, "w", encoding="utf-8", newline="\n") as f:
        f.write(convert_key(text, src_key, dst_key))


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Hugo 与 Astro 文章双写同步",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__.splitlines()[2],
    )
    parser.add_argument(
        "slugs", nargs="*", help="只处理这些文章（文件名或 slug，如 python-zero-setup.md）"
    )
    parser.add_argument("--reverse", action="store_true", help="反向同步：Astro → Hugo")
    parser.add_argument("--check", action="store_true", help="只检查漂移，不写文件")
    args = parser.parse_args()

    src_dir, dst_dir = (ASTRO_DIR, HUGO_DIR) if args.reverse else (HUGO_DIR, ASTRO_DIR)
    src_key, dst_key = (ASTRO_KEY, HUGO_KEY) if args.reverse else (HUGO_KEY, ASTRO_KEY)

    src_files = sorted(p for p in src_dir.glob("*.md") if p.name != "_index.md")
    if args.slugs:
        wanted = {s if s.endswith(".md") else s + ".md" for s in args.slugs}
        missing = wanted - {p.name for p in src_files}
        if missing:
            print(f"源侧（{src_dir.name}/）不存在: {', '.join(sorted(missing))}", file=sys.stderr)
            return 2
        src_files = [p for p in src_files if p.name in wanted]

    drifted: list[str] = []
    created: list[str] = []
    updated: list[str] = []
    same = 0

    for src in src_files:
        dst = dst_dir / src.name
        src_text = src.read_text(encoding="utf-8-sig")
        if not dst.exists():
            drifted.append(src.name)
            if args.check:
                print(f"[漂移] 仅 {src_dir.name}/ 有: {src.name}")
                continue
            write_converted(dst, src_text, src_key, dst_key)
            print(f"[新建] {src.name}")
            created.append(src.name)
            continue
        if canonical(src_text, src_key) != canonical(dst.read_text(encoding="utf-8-sig"), dst_key):
            drifted.append(src.name)
            if args.check:
                print(f"[漂移] {src.name}")
                continue
            write_converted(dst, src_text, src_key, dst_key)
            print(f"[更新] {src.name}")
            updated.append(src.name)
        else:
            same += 1

    dst_only: list[str] = []
    if not args.slugs:
        src_names = {p.name for p in src_files}
        for dst in sorted(dst_dir.glob("*.md")):
            if dst.name != "_index.md" and dst.name not in src_names:
                dst_only.append(dst.name)
                print(f"[提示] 仅 {dst_dir.name}/ 有: {dst.name}（用 {'--reverse ' if not args.reverse else ''}补齐）")

    direction = "Astro → Hugo" if args.reverse else "Hugo → Astro"
    if args.check:
        if drifted:
            print(f"\n检查完成（{direction}）：{len(drifted)} 篇漂移，请去掉 --check 执行同步。")
            return 1
        print(f"\n检查完成（{direction}）：{same} 篇一致，无漂移。")
        return 0

    print(
        f"\n同步完成（{direction}）：新建 {len(created)}，更新 {len(updated)}，"
        f"已一致 {same}。"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
