# -*- coding: utf-8 -*-
"""把用户提供的三张原图压缩成封面，覆盖 13/14/15 三篇的封面（Astro + Hugo 两侧）。"""
from PIL import Image
import os, shutil

SRC_DIR = r"C:/Users/Administrator/Desktop/blog1"
BACKUP = r"E:/blog_image_backup/blog1"
OUT_ASTRO = r"E:/blog/astro/public/images/covers"
OUT_HUGO = r"E:/blog/static/images/covers"

# 按文件名顺序映射到三篇文章
MAPPING = [
    ("A30221A056D270B2808D9A677BE7B92C.jpg", "python-file-formats-cover.jpg"),
    ("BBFDF4D1709ADE918ADA0FA100F994D1.jpg", "python-shallow-deep-copy-cover.jpg"),
    ("F83C2F3B32AB60908DC0B9A7C5142CD4.jpg", "python-decorator-advanced-cover.jpg"),
]

MAX_W = 1600


def save_jpeg(img, path):
    if img.mode != "RGB":
        img = img.convert("RGB")
    if img.width > MAX_W:
        h = round(img.height * MAX_W / img.width)
        img = img.resize((MAX_W, h), Image.LANCZOS)
    img.save(path, "JPEG", quality=80, optimize=True, progressive=True)


os.makedirs(BACKUP, exist_ok=True)
for src_name, dst_name in MAPPING:
    src = os.path.join(SRC_DIR, src_name)
    shutil.copy2(src, os.path.join(BACKUP, src_name))  # 备份原图

    img = Image.open(src)
    for out_dir in (OUT_ASTRO, OUT_HUGO):
        save_jpeg(img, os.path.join(out_dir, dst_name))

    final = Image.open(os.path.join(OUT_ASTRO, dst_name))
    print(f"{src_name} -> {dst_name}  {final.size}  {os.path.getsize(os.path.join(OUT_ASTRO, dst_name))//1024} KB")
