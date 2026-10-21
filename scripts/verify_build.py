# -*- coding: utf-8 -*-
"""生产构建产物体检：站内资源 404 / 远程依赖 / 关键功能点。

用法：先 `hugo --minify --gc --cleanDestinationDir`，再 `python scripts/verify_build.py`。
注意产物被 minify 后 HTML 属性引号会被剥掉，所有检查都不依赖引号。
"""
import json
import os
import re
import sys
from urllib.parse import unquote

PUB = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")
problems = []

# 不带引号假设地抓取属性值（minify 后可能是 href=/foo 或 href="/foo"）
ATTR = re.compile(r'(?:src|href|srcset|poster|data-src)\s*=\s*"([^">]+)"|([^\s>]+)')
ASSET_EXT = (
    ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".ico",
    ".js", ".mjs", ".css", ".json", ".xml", ".txt", ".woff", ".woff2", ".ttf",
)


def collect_refs(html):
    refs = set()
    for m in re.finditer(r'(?:src|href|poster)\s*=\s*(?:"([^">]+)"|([^\s>]+))', html):
        u = m.group(1) or m.group(2) or ""
        # srcset 可能是 "a 1x, b 2x" 形式
        for part in u.split(","):
            refs.add(part.strip().split(" ")[0])
    return refs


def file_exists(url):
    """站内 URL → public 下文件是否存在（处理百分号编码、无扩展名回退）"""
    p = unquote(url.split("#")[0].split("?")[0]).lstrip("/")
    if not p:
        return os.path.isfile(os.path.join(PUB, "index.html"))
    p = p.rstrip("/")
    cands = [p]
    if not p.lower().endswith(ASSET_EXT):
        cands += [p + "/index.html", p + ".html"]
    else:
        cands += [os.path.join(p, "index.html")]
    for c in cands:
        if os.path.isfile(os.path.join(PUB, c.replace("/", os.sep))):
            return True
    return False


pages = []
for root, _dirs, files in os.walk(PUB):
    for f in files:
        if f.endswith(".html") and not root.startswith(os.path.join(PUB, "resources")):
            pages.append(os.path.join(root, f))

ok_refs = 0
remote_hosts = {}
for page in sorted(pages):
    rel = os.path.relpath(page, PUB)
    html = open(page, encoding="utf-8", errors="replace").read()
    for ref in collect_refs(html):
        if not ref or ref.startswith(("http", "//", "mailto:", "javascript:", "data:", "#")):
            if ref.startswith("//"):
                m = re.match(r"^//([^/]+)", ref)
                if m:
                    remote_hosts.setdefault(m.group(1), set()).add(rel)
            elif ref.startswith("http"):
                m = re.match(r"^https?://([^/]+)", ref)
                if m:
                    remote_hosts.setdefault(m.group(1), set()).add(rel)
            continue
        if not ref.startswith("/"):
            continue  # 相对引用（少见于本主题）
        if file_exists(ref):
            ok_refs += 1
        else:
            problems.append(f"404: {ref}  (in {rel})")

print(f"[1/5] {len(pages)} pages, {ok_refs} local asset refs OK")

# ---- CSS url() 引用（只检查被页面引用的 css；未挂载的库 css 降级为警告） ----
linked_css = set()
for root, _dirs, files in os.walk(PUB):
    for f in files:
        if not f.endswith(".html"):
            continue
        html = open(os.path.join(root, f), encoding="utf-8", errors="replace").read()
        for m in re.finditer(r'href\s*=\s*(?:")?(/[^"\s>]+\.css)', html):
            linked_css.add(m.group(1).lstrip("/").replace("/", os.sep))

css_ok = 0
warn = []
for root, _dirs, files in os.walk(PUB):
    for f in files:
        if not f.endswith(".css"):
            continue
        rel = os.path.relpath(os.path.join(root, f), PUB)
        is_linked = rel in linked_css or rel.startswith("css" + os.sep)
        css = open(os.path.join(root, f), encoding="utf-8", errors="replace").read()
        for m in re.finditer(r"url\((['\"]?)([^'\")]+)\1\)", css):
            u = m.group(2)
            if u.startswith("data:") or re.match(r"^(https?:)?//", u):
                continue
            full = os.path.normpath(os.path.join(root, u.split("?")[0]))
            if os.path.isfile(full):
                css_ok += 1
            elif is_linked:
                problems.append(f"404 in linked css: {u}  (from {rel})")
            else:
                warn.append(f"{u}  (from {rel}, css 未被任何页面引用)")
if warn:
    print("  warn: 未挂载 css 中的断链（不影响线上页面）:")
    for w in sorted(set(warn))[:5]:
        print("    -", w)
print(f"[2/5] {css_ok} css url() refs OK")

# ---- 搜索索引 ----
sj = os.path.join(PUB, "search", "index.json")
if os.path.isfile(sj):
    data = json.load(open(sj, encoding="utf-8"))
    content_dir = os.path.join(os.path.dirname(PUB), "content", "post")
    expect = len([f for f in os.listdir(content_dir) if f.endswith(".md") and f != "_index.md"])
    status = "OK" if len(data) == expect else "FAIL"
    print(f"[3/5] search index: {len(data)} posts (expect {expect}) [{status}]")
    if status == "FAIL":
        problems.append(f"search index post count {len(data)} != {expect}")
else:
    problems.append("search/index.json missing")

# ---- 关键产物 ----
def read(p):
    return open(os.path.join(PUB, p), encoding="utf-8", errors="replace").read()

home = read("index.html")
post = read(os.path.join("post", "ai-seventy-years", "index.html"))
checks = {
    "home: hero avatar under /avatar/": "hero-avatar" in home and "/avatar/" in home,
    "home: hero-bg srcset (760/1280/1920)": all(f"hero-bg-{w}.jpg" in home for w in (760, 1280, 1920)),
    "home: no livereload": "livereload" not in home,
    "home: no google/jsdelivr/webcache fonts": all(h not in home for h in ("fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net", "npm.webcache.cn", "unpkg.com")),
    "home: lxgw+mulish local css": "/resources/lxgw-wenkai-screen-webfont@1.1.0/style.css" in home and "/resources/mulish/mulish.css" in home,
    "home: typed.js local": "/resources/typed.js@" in home,
    "home: meting api set": "meting.qjqq.cn" in home,
    "home: css fingerprinted (main.min.*)": re.search(r"main\.min\.[0-9a-f]+\.css", home) is not None,
    "home: og:url is production": 'content="https://ziyou814.top/"' in home,
    "post: vendor js all local (aplayer/meting/pace/etc)": all(
        f"/resources/{p}" in post for p in ("aplayer@", "meting@", "pace-js@", "busuanzi@", "quicklink@", "clipboard@", "lazysizes@", "mouse-firework@", "photoswipe@", "@waline/client")
    ),
    "post: katex local css": "/resources/katex@" in post,
    "post: outdate hook present": "outdate" in post,
    "post: inline customs survived minify (mood knob)": "mood-knob" in post,
    "post: inline customs survived minify (nav pill)": "reimu-nav-pill" in post,
    "search page: fuse local + ui": "/resources/fuse.js@7.1.0" in read(os.path.join("search", "index.html")),
}
for k, v in checks.items():
    print(f"    [{'OK' if v else 'FAIL'}] {k}")
    if not v:
        problems.append(f"check failed: {k}")
print("[4/5] feature checks done")

# ---- robots / sitemap ----
for f in ("robots.txt", "sitemap.xml", "index.xml"):
    if not os.path.isfile(os.path.join(PUB, f)):
        problems.append(f"{f} missing")
print(f"[5/5] robots/sitemap/rss present")

print("\nremote hosts still referenced (should be content links + alicdn only):")
for host in sorted(remote_hosts):
    print(f"    {host}  ({len(remote_hosts[host])} pages)")

print("=" * 60)
if problems:
    print(f"PROBLEMS ({len(problems)}):")
    for p in problems[:50]:
        print("  -", p)
    sys.exit(1)
print("ALL CHECKS PASSED")
