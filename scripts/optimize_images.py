# -*- coding: utf-8 -*-
"""一次性图片优化：封面压到 1600px JPEG，hero-bg 出三档 srcset。原图备份到 E:/blog_image_backup"""
import os
import shutil
from PIL import Image

ROOT = r"E:\blog"
BACKUP = r"E:\blog_image_backup"
COVERS = os.path.join(ROOT, "static", "images", "covers")
HERO = os.path.join(ROOT, "static", "images", "hero-bg.png")

os.makedirs(BACKUP, exist_ok=True)


def backup(rel):
    src = os.path.join(ROOT, rel)
    dst = os.path.join(BACKUP, rel.replace("static" + os.sep, ""))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)


def save_jpeg(img, path, max_w, quality=80):
    if img.mode != "RGB":
        img = img.convert("RGB")
    if img.width > max_w:
        h = round(img.height * max_w / img.width)
        img = img.resize((max_w, h), Image.LANCZOS)
    img.save(path, "JPEG", quality=quality, optimize=True, progressive=True)


total_before = total_after = 0

# 1) 封面：全部压到 1600px 宽 JPEG
for name in sorted(os.listdir(COVERS)):
    if not name.lower().endswith((".jpg", ".jpeg")):
        continue
    p = os.path.join(COVERS, name)
    before = os.path.getsize(p)
    backup(os.path.relpath(p, ROOT))
    img = Image.open(p)
    save_jpeg(img, p, 1600)
    after = os.path.getsize(p)
    total_before += before
    total_after += after
    print(f"cover {name}: {before//1024}K -> {after//1024}K  ({img.width}x{img.height} src)")

# 2) hero-bg：三档 JPEG
backup("static/images/hero-bg.png")
img = Image.open(HERO)
for w in (760, 1280, 1920):
    out = os.path.join(ROOT, "static", "images", f"hero-bg-{w}.jpg")
    save_jpeg(img, out, w, quality=82)
    print(f"hero-bg-{w}.jpg: {os.path.getsize(out)//1024}K")
total_before += os.path.getsize(HERO)
total_after += sum(
    os.path.getsize(os.path.join(ROOT, "static", "images", f"hero-bg-{w}.jpg")) for w in (760, 1280, 1920)
)

print(f"\nTOTAL: {total_before/1048576:.1f}MB -> {total_after/1048576:.1f}MB")
