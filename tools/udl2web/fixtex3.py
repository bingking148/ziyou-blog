# -*- coding: utf-8 -*-
"""latex 规范化重建 v3：先把命令内部的空格污染彻底吸掉（\sig m a -> \sigma），
再统一补命令后的空格。幂等，可反复跑。"""
import json, os, re

DATA = r"E:\blog\astro\src\data\udl"

COMMANDS = sorted([
    "alpha", "beta", "gamma", "delta", "epsilon", "varepsilon", "zeta", "eta", "theta",
    "iota", "kappa", "lambda", "mu", "nu", "xi", "pi", "rho", "sigma", "varsigma",
    "tau", "upsilon", "phi", "varphi", "chi", "psi", "omega", "Gamma", "Delta",
    "Theta", "Lambda", "Xi", "Pi", "Sigma", "Upsilon", "Phi", "Psi", "Omega",
    "ell", "infty", "partial", "nabla", "forall", "approx", "leftarrow",
    "rightarrow", "Leftarrow", "Rightarrow", "mapsto", "cdot", "times", "div",
    "pm", "mp", "leq", "geq", "neq", "equiv", "sim", "propto", "sum", "prod",
    "int", "sqrt", "ast", "star", "circ", "otimes", "odot", "oplus", "perp",
    "parallel", "angle", "hbar", "exp", "log", "argmin", "argmax", "max", "min",
    "det", "dim", "sin", "cos", "tan", "arcsin", "arccos", "arctan", "sinh",
    "cosh", "tanh", "ln", "Var", "Cov", "Pr", "mathbb", "mathcal", "mathbf",
    "mathrm", "text", "ell", "to", "ldots", "cdots", "in", "hat", "bar", "tilde",
], key=len, reverse=True)

def normalize(t):
    # 1) 吸掉命令内部空格：\sig m a / \parti a l -> 一个候选命令
    #    做法：删掉 \word 后面所有单个空格，然后贪心匹配最长命令
    def absorb(m):
        body = m.group(1).replace(" ", "")
        return "\\" + body
    t = re.sub(r"\\([a-zA-Z](?: ?[a-zA-Z]){0,9})", absorb, t)
    # 2) 在命令流上重新断词：最长匹配已知命令
    out, i = [], 0
    while i < len(t):
        if t[i] == "\\":
            m = re.match(r"\\([a-zA-Z]+)", t[i:])
            if m:
                word = m.group(1)
                hit = next((c for c in COMMANDS if word.startswith(c)), None)
                if hit:
                    out.append("\\" + hit)
                    i += 1 + len(hit)
                    # 命令后必须跟空格或非字母
                    if i < len(t) and t[i].isalnum():
                        out.append(" ")
                    continue
                # 未知命令：原样保留，加空格
                out.append(m.group(0) + " ")
                i += len(m.group(0))
                continue
        out.append(t[i])
        i += 1
    t = "".join(out)
    # 3) 特殊残留：^{exp} / ^{\sqrt} 这类悬空上标内的命令
    t = t.replace("^{\\sqrt}", "^{\\sqrt{}}")
    t = t.replace("=^{exp}", "= \\exp")
    t = re.sub(r"\^{\\([a-zA-Z]+)\}", r"\\$1", t) if False else t
    # 4) 多余空格
    t = re.sub(r"  +", " ", t)
    return t

n = 0
for f in sorted(os.listdir(DATA)):
    if not f.endswith(".json"):
        continue
    p = os.path.join(DATA, f)
    d = json.load(open(p, encoding="utf-8"))
    for pg in d["sections"]:
        for blocks in (pg["en"], pg["zh"]):
            for b in blocks:
                if b.get("type") == "equation" and b.get("latex"):
                    t = b["latex"]
                    t2 = normalize(t)
                    if t2 != t:
                        b["latex"] = t2
                        n += 1
    json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False)
print("normalized:", n)

# 快速单测
tests = [r"\sigm a^{2}", r"\partia l \ell i", r"y\i n {0,1}", r"-\inft y", r"\thet a 10",
         r"\mu1", r"\cdotEy", r"\foralln\in {1, . . . , N}", r"Pr(y|\mu, \kappa)"]
for t in tests:
    print(repr(t), "->", repr(normalize(t)))
