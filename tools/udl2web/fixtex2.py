# -*- coding: utf-8 -*-
"""修复 json 中 latex 的命令粘连 v2：
已知命令表优先断词（\\sigma2 -> \\sigma 2），不动命令内部；
同时把万能变体（\\sqr t 等）归一。幂等安全。"""
import json, os, re

DATA = r"E:\blog\astro\src\data\udl"

COMMANDS = sorted([
    "alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta", "theta",
    "iota", "kappa", "lambda", "mu", "nu", "xi", "pi", "rho", "sigma",
    "tau", "upsilon", "phi", "chi", "psi", "omega", "Gamma", "Delta",
    "Theta", "Lambda", "Xi", "Pi", "Sigma", "Upsilon", "Phi", "Psi", "Omega",
    "ell", "infty", "partial", "nabla", "forall", "in", "notin", "approx",
    "leftarrow", "rightarrow", "Leftarrow", "Rightarrow", "mapsto", "cdot",
    "times", "div", "pm", "mp", "leq", "geq", "neq", "equiv", "sim", "propto",
    "sum", "prod", "int", "sqrt", "ast", "star", "circ", "otimes", "odot",
    "oplus", "perp", "parallel", "angle", "hbar", "kappa", "exp", "log",
    "argmin", "argmax", "max", "min", "det", "dim", "arg", "sin", "cos",
    "tan", "arcsin", "arccos", "arctan", "sinh", "cosh", "tanh", "ln",
    "Var", "Cov", "Pr", "mathbb", "mathcal", "mathbf", "mathrm", "text",
], key=len, reverse=True)

CMD = r"\\(?:%s)" % "|".join(re.escape(c) for c in COMMANDS)

def fix_tex(t):
    # 1) 修复先前补丁切开的命令：\sigm a -> \sigma a（去掉命令中间多余空格）
    for c in COMMANDS:
        if len(c) > 3:
            half = len(c) - 2
            t = t.replace("\\" + c[:half] + " " + c[half:], "\\" + c + " ")
    # 2) 归一万能变体
    t = t.replace("\\sqr t", "\\sqrt")
    # 3) 命令后紧跟字母/数字：加空格（不动已有空格）
    t = re.sub(r"(\\[a-zA-Z]{3,})(?=[A-Za-z0-9])", r"\1 ", t)
    # 4) 剩余单字符命令粘字母：\ph i -> \phi i（宽容处理常见片段）
    t = re.sub(r"\\([a-z]{1,2}) (?=[A-Za-z])", lambda m: "\\" + m.group(1), t) if False else t
    # 5) \cdotE 这种：\cdot E
    t = re.sub(r"\\cdot(?=[A-Za-z])", r"\\cdot ", t)
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
                    t2 = fix_tex(t)
                    if t2 != t:
                        b["latex"] = t2
                        n += 1
    json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False)
print("patched:", n)
