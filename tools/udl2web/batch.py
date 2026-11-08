# -*- coding: utf-8 -*-
"""批量转换 UDL 全书章节：extract -> astro 数据/资源。用法：python batch.py [ch1 ch2 ...]（默认全部）"""
import json, os, shutil, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
PDF = r"E:\pdf\out_book\UDL_bilingual_dual.pdf"
import fitz

# (章号, zhTitle, enTitle, 0-based 起页, 0-based 止页)  — 来自书签 level1，止页=下一章起页
CHAPTERS = [
    (1, "引言", "Introduction", 14, 30),
    (2, "监督学习", "Supervised learning", 30, 38),
    (3, "浅层神经网络", "Shallow neural networks", 38, 54),
    (4, "深度神经网络", "Deep neural networks", 54, 69),
    (5, "损失函数", "Loss functions", 69, 90),
    (6, "拟合模型", "Fitting models", 90, 109),
    (7, "梯度与初始化", "Gradients and initialization", 109, 131),
    (8, "衡量性能", "Measuring performance", 131, 151),
    (9, "正则化", "Regularization", 151, 174),
    (10, "卷积网络", "Convolutional networks", 174, 199),
    (11, "残差网络", "Residual networks", 199, 220),
    (12, "Transformers", "Transformers", 220, 253),
    (13, "图神经网络", "Graph neural networks", 253, 282),
    (14, "无监督学习", "Unsupervised learning", 282, 289),
    (15, "生成对抗网络", "Generative adversarial networks", 289, 317),
    (16, "归一化流", "Normalizing flows", 317, 340),
    (17, "变分自编码器", "Variational autoencoders", 340, 362),
    (18, "扩散模型", "Diffusion models", 362, 387),
    (19, "强化学习", "Reinforcement learning", 387, 415),
    (20, "深度学习为何有效", "Why does deep learning work?", 415, 434),
    (21, "深度学习与伦理", "Deep learning and ethics", 434, 450),
    (22, "符号", "Notation", 450, 453),
    (23, "数学", "Mathematics", 453, 462),
    (24, "概率", "Probability", 462, 476),
]

TOOLS = r"E:\blog\tools\udl2web"
ASTRO_DATA = r"E:\blog\astro\src\data\udl"
ASTRO_PUB = r"E:\blog\astro\public\learning\udl"


def convert(nums):
    done = []
    for no, zh, en, s, e in CHAPTERS:
        if nums and no not in nums:
            continue
        out = os.path.join(TOOLS, "out_ch%d" % no)
        if os.path.isdir(out):
            shutil.rmtree(out)
        figdir_target = os.path.join(ASTRO_PUB, "ch%d" % no)
        if os.path.isdir(figdir_target):
            shutil.rmtree(figdir_target)
        print("=== ch%d %s (pdf %d..%d)" % (no, en, s, e))
        r = subprocess.run([sys.executable, os.path.join(TOOLS, "extract.py"), out, str(s), str(e), str(no)])
        if r.returncode != 0:
            print("!! ch%d extract FAILED" % no)
            continue
        # 拷贝资源 + 改写路径
        figdir = os.path.join(ASTRO_PUB, "ch%d" % no, "figures")
        os.makedirs(figdir, exist_ok=True)
        for f in os.listdir(os.path.join(out, "figures")):
            shutil.copy2(os.path.join(out, "figures", f), figdir)
        data = json.load(open(os.path.join(out, "chapter.json"), encoding="utf-8"))
        for pgsec in data["sections"]:
            for blocks in (pgsec["en"], pgsec["zh"]):
                for b in blocks:
                    if b.get("img"):
                        b["img"] = "/learning/udl/ch%d/figures/%s" % (no, b["img"].split("/", 1)[1])
            # 行内公式片段的图片路径
            for key in ("en_inline", "zh_inline"):
                for im in pgsec.get(key, []):
                    if im.get("img"):
                        im["img"] = "/learning/udl/ch%d/figures/%s" % (no, im["img"].split("/", 1)[1])
        json.dump(data, open(os.path.join(ASTRO_DATA, "ch%d.json" % no), "w", encoding="utf-8"), ensure_ascii=False)
        done.append((no, zh, en, len(data["sections"])))
    # 重写注册表
    lines = []
    for n, zh, en, pages in done:
        lines.append("  { id: 'ch%d', num: %d, zhTitle: '%s', enTitle: '%s', pages: (ch%d as any).sections }," % (n, n, zh, en, n))
    open(os.path.join(ASTRO_DATA, "index.ts"), "w", encoding="utf-8").write(
        "// UDL 双语阅读资料章节注册表（batch.py 自动生成）\n" +
        "\n".join("import ch%d from './ch%d.json';" % (n, n) for n, *_ in done) +
        "\n\nexport interface UdlBlock {\n  type: string;\n  text?: string;\n  latex?: string;\n  img?: string;\n  cont?: boolean;\n}\n\nexport const UDL_CHAPTERS = [\n" +
        "\n".join(lines) + "\n];\n\nexport const UDL_META = {\n  bookZh: '理解深度学习',\n  bookEn: 'Understanding Deep Learning',\n  author: 'Simon J.D. Prince',\n  source: 'udlbook.com',\n  license: 'CC BY-NC-ND 4.0（仅作个人学习笔记用途）',\n};\n")
    print("registry written with %d chapters" % len(done))


if __name__ == "__main__":
    nums = set(int(a) for a in sys.argv[1:]) or None
    convert(nums)
