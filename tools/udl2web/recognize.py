# -*- coding: utf-8 -*-
"""批量把公式裁图识别成 LaTeX，回填到章节 json。
- 扫描 data/udl/*.json 中 type=equation 且 latex 为空的块
- 同一张图（en/zh 共用）只识别一次
- 并发调用视觉模型（默认 hy3 免费，失败回退 glm-5.3-flash-max）
"""
import base64, hashlib, json, os, re, sys, threading, time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

API = "http://127.0.0.1:3065/v1/chat/completions"
CRED = r"C:\Users\Administrator\.dsh\.credentials.yaml"
DATA = r"E:\blog\astro\src\data\udl"
PUB = r"E:\blog\astro\public\learning\udl"
CACHE = r"E:\blog\tools\udl2web\tex_cache.json"

MODELS = ["hy3", "glm-5.3-flash-max", "GLM-5.3-Flash"]

SYSTEM = (
    "你是 LaTeX 公式识别专家。用户给你一张从数学教材 PDF 裁出的公式图片。"
    "只输出该公式的 LaTeX 代码：不要解释、不要 markdown 代码块、不要前后缀。"
    "多行公式用 \\begin{aligned}...\\end{aligned}，用 & 对齐、\\\\ 换行。"
    "忽略右侧的公式编号如 (2.3)。"
    "使用标准命令：\\sum_{i=1}^{I}、\\prod、\\int、\\frac、\\operatorname*{argmax}_{\\phi} 等。"
    "粗体向量用 \\mathbf{}，希腊字母用 \\phi \\theta \\mu \\sigma 等。"
)


def get_key():
    raw = open(CRED, encoding="utf-8").read()
    m = re.search(r"sk-a2a-[A-Za-z0-9_\-]+", raw)
    if not m:
        raise SystemExit("no key")
    return m.group(0)


KEY = get_key()
_lock = threading.Lock()
_CACHE = {}


def load_cache():
    global _CACHE
    if os.path.exists(CACHE):
        try:
            _CACHE = json.load(open(CACHE, encoding="utf-8"))
        except Exception:
            _CACHE = {}


def save_cache():
    json.dump(_CACHE, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False)


def img_hash(path):
    with open(path, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()


def img_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


INLINE_PROMPT = (
    "这是数学教材正文中的一个行内公式片段（可能只有几个符号，如 y_i、Pr(x|φ)、σ²、∇_θ L）。"
    "只输出可直接内联使用的 LaTeX 片段：不要 \\begin{aligned}、不要换行、不要解释、不要 markdown。"
    "例如 y\\in\\{0,1\\}、\\Pr(\\mathbf{x}|\\boldsymbol{\\phi})、\\sigma^2\\mathbf{I}。"
)


def ask_one(model, path, timeout=120, inline=False):
    ext = os.path.splitext(path)[1].lstrip(".").lower()
    mime = "image/webp" if ext == "webp" else "image/png"
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": INLINE_PROMPT if inline else SYSTEM},
            {"role": "user", "content": [
                {"type": "text", "text": "输出 LaTeX："},
                {"type": "image_url", "image_url": {"url": "data:%s;base64,%s" % (mime, img_b64(path))}},
            ]},
        ],
        "temperature": 0,
        "max_tokens": 400 if inline else 1500,
    }
    req = urllib.request.Request(
        API, data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + KEY},
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        out = json.loads(r.read())
    txt = out["choices"][0]["message"]["content"].strip()
    txt = re.sub(r"^```[a-zA-Z]*\s*", "", txt)
    txt = re.sub(r"\s*```$", "", txt)
    return txt.strip()


def recognize(path, inline=False):
    h = img_hash(path)
    with _lock:
        if h in _CACHE:
            return _CACHE[h]
    last = None
    for m in MODELS:
        try:
            tex = ask_one(m, path, inline=inline)
            with _lock:
                _CACHE[h] = tex
            return tex
        except Exception as e:
            last = e
            time.sleep(0.5)
    raise RuntimeError("all models failed: %s" % last)


def collect():
    """返回 {img_rel: [任务描述]}，含显示公式与行内公式"""
    jobs = {}
    for f in sorted(os.listdir(DATA)):
        if not f.endswith(".json"):
            continue
        p = os.path.join(DATA, f)
        d = json.load(open(p, encoding="utf-8"))
        for pi, pg in enumerate(d["sections"]):
            for side in ("en", "zh"):
                for bi, b in enumerate(pg[side]):
                    if b.get("type") == "equation" and b.get("img") and not b.get("latex"):
                        jobs.setdefault(b["img"], []).append(("eq", f, pi, side, bi))
            for side in ("en_inline", "zh_inline"):
                for ii, im in enumerate(pg.get(side, [])):
                    if im.get("img") and not im.get("latex"):
                        jobs.setdefault(im["img"], []).append(("in", f, pi, side, ii))
    return jobs


def fill_inline(d):
    """把行内公式 latex 回填到正文占位符 ⟦mN⟧ -> $tex$"""
    n = 0
    for pg in d["sections"]:
        for side, inline_key in (("en", "en_inline"), ("zh", "zh_inline")):
            mapping = {}
            for im in pg.get(inline_key, []):
                if im.get("latex"):
                    mapping[im["ph"]] = im["latex"]
            if not mapping:
                continue
            for b in pg[side]:
                if b.get("type") not in ("body", "note", "figcap") or not b.get("text"):
                    continue
                t = b["text"]
                if "⟦m" not in t:
                    continue
                for ph, tex in mapping.items():
                    t = t.replace(ph, "$%s$" % tex)
                # 残留占位符（识别失败）清成原文
                t = re.sub(r"⟦m\d+⟧", "", t)
                b["text"] = t
                n += 1
    return n


def main():
    workers = int(sys.argv[1]) if len(sys.argv) > 1 else 16
    load_cache()
    jobs = collect()
    print("待识别公式图:", len(jobs), "（缓存 %d）" % len(_CACHE))
    results = {}
    done = 0
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {}
        for img in jobs:
            rel = img.replace("/learning/udl/", "").replace("/", os.sep)
            path = os.path.join(PUB, rel)
            if not os.path.exists(path):
                print("MISS", img)
                continue
            is_inline = bool(re.search(r"_[ij]\d+\.", os.path.basename(img)))
            futs[ex.submit(recognize, path, is_inline)] = img
        for fut in as_completed(futs):
            img = futs[fut]
            try:
                results[img] = fut.result()
            except Exception as e:
                print("FAIL", img, str(e)[:120])
            done += 1
            if done % 25 == 0:
                el = time.time() - t0
                print("  %d/%d  %.0fs  (%.2f/s)" % (done, len(futs), el, done / max(el, 1)))
    print("识别完成:", len(results), "耗时 %.0fs" % (time.time() - t0))
    save_cache()

    # 回填
    n = 0
    n_in = 0
    for f in sorted(os.listdir(DATA)):
        if not f.endswith(".json"):
            continue
        p = os.path.join(DATA, f)
        d = json.load(open(p, encoding="utf-8"))
        for pg in d["sections"]:
            for side in ("en", "zh"):
                for b in pg[side]:
                    if b.get("type") == "equation" and b.get("img") in results:
                        b["latex"] = results[b["img"]]
                        n += 1
            for side in ("en_inline", "zh_inline"):
                for im in pg.get(side, []):
                    if im.get("img") in results:
                        im["latex"] = results[im["img"]]
                        n_in += 1
        n_in += fill_inline(d)
        json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False)
    print("回填：显示公式块 %d，行内公式 %d" % (n, n_in))


if __name__ == "__main__":
    main()
