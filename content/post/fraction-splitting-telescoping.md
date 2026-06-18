---
title: '裂项相消法：从分数拆分看透数列求和的本质'
date: 2026-05-31T10:48:33+08:00
lastmod: 2026-05-31T10:48:33+08:00
cover: /images/covers/fraction-splitting-cover.jpg
math: true
tags:
  - 数学
  - 数列
  - 裂项相消
categories:
  - 数学笔记
---

## 一、从最简单的分数拆分开始

先看几个很普通的式子：

$$\frac{1}{1\times2}=1-\frac12$$

$$\frac{1}{2\times3}=\frac12-\frac13$$

$$\frac{1}{5\times6}=\frac15-\frac16$$

这些式子并不高级，本质就是通分。

比如：

$$\frac15-\frac16=\frac{6-5}{5\times6}=\frac1{5\times6}$$

于是可以得到一般规律：

$$\frac{1}{n(n+1)}=\frac1n-\frac1{n+1}$$

这就是数列求和里非常重要的思想：**裂项相消**。

---

## 二、为什么裂项相消这么有用？

如果要求：

$$\frac{1}{1\times2}+\frac{1}{2\times3}+\frac{1}{3\times4}+\cdots+\frac{1}{n(n+1)}$$

把每一项都拆开：

$$\left(1-\frac12\right)+\left(\frac12-\frac13\right)+\left(\frac13-\frac14\right)+\cdots+\left(\frac1n-\frac1{n+1}\right)$$

中间的部分会一正一负全部抵消，最后只剩：

$$1-\frac1{n+1}$$

这就是"相消"的力量。

<div class="ziyou-viz" id="telescope-viz">
  <div class="viz-caption">👇 选一个项数 n，点"播放"看中间项如何一对对相消，最后只剩首尾两项。</div>
  <div class="viz-toolbar">
    <label>项数 n：<input type="range" id="t-n" min="3" max="10" step="1" value="6"><span class="viz-val" id="t-n-val">6</span></label>
    <span class="viz-btns">
      <button id="t-play">▶ 播放</button>
      <button id="t-step">⏭ 单步</button>
      <button id="t-reset">↺ 重置</button>
    </span>
  </div>
  <div class="viz-expr" id="t-expr"></div>
  <div class="viz-result" id="t-result"></div>
</div>
<style>
#telescope-viz{margin:1.6em 0;padding:1.2em 1.4em;border:1px solid var(--color-border);border-radius:12px;background:var(--color-surface)}
#telescope-viz .viz-caption{color:var(--color-text-muted);font-size:.9em;margin-bottom:1em;line-height:1.5}
#telescope-viz .viz-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:1.2em;margin-bottom:1em}
#telescope-viz .viz-toolbar label{display:flex;align-items:center;gap:.5em;font-size:.9em;color:var(--color-text-strong)}
#telescope-viz .viz-toolbar input[type=range]{width:120px;accent-color:var(--color-link)}
#telescope-viz .viz-val{font-family:Menlo,Consolas,monospace;color:var(--color-link);font-weight:600}
#telescope-viz .viz-btns{display:flex;gap:.5em}
#telescope-viz button{padding:.35em .9em;border:1px solid var(--color-border);border-radius:8px;background:transparent;color:var(--color-text-strong);cursor:pointer;font-size:.85em;transition:all .15s}
#telescope-viz button:hover{background:var(--color-link);color:#fff;border-color:var(--color-link)}
#telescope-viz .viz-expr{min-height:3em;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.15em;padding:.8em;line-height:2;font-size:1.05em;overflow-x:auto}
#telescope-viz .t-term{display:inline-flex;align-items:center;padding:.1em .2em;border-radius:5px;transition:opacity .4s ease,background .3s ease,transform .3s ease;white-space:nowrap}
#telescope-viz .t-term.t-cancel{opacity:0;transform:scale(.6)}
#telescope-viz .t-term.t-hi{background:var(--color-link);color:#fff}
#telescope-viz .t-term.t-keep{font-weight:600;color:var(--color-link)}
#telescope-viz .t-op{color:var(--color-text-muted);padding:0 .05em}
#telescope-viz .viz-result{margin-top:.6em;text-align:center;color:var(--color-text-strong);min-height:1.6em}
</style>
<script>
(function(){
  const root=document.getElementById('telescope-viz');if(!root)return;
  const nIn=document.getElementById('t-n'),nVal=document.getElementById('t-n-val');
  const expr=document.getElementById('t-expr'),result=document.getElementById('t-result');
  const playBtn=document.getElementById('t-play'),stepBtn=document.getElementById('t-step'),resetBtn=document.getElementById('t-reset');
  let terms=[],ops=[]; // terms: 数组 {k, sign, val}; 相消按值 k 配对
  let cancelQueue=[];  // 待相消的配对索引
  let timer=null;
  // 配色：用 link 色的不同亮度区分不同数值对
  let pairColor={};
  function readColor(){
    const cs=getComputedStyle(document.documentElement);
    return (cs.getPropertyValue('--color-link').trim())||'#4285f4';
  }
  function build(){
    const n=parseInt(nIn.value,10);nVal.textContent=n;
    stop();
    expr.innerHTML='';result.textContent='';
    // 生成展开项：1, -1/2, +1/2, -1/3, +1/3, ... -1/(n+1)
    // 第一项 +1（1 - 1/2），之后每对 ( -1/k , +1/k )
    pairColor={};
    const colorBase=readColor();
    terms=[];ops=[];
    // 项序列：+1, -1/2, +1/2, -1/3, +1/3, ... , -1/(n+1)   (注意 +1/2 来自第二对拆分的负项)
    // 实际：第 i 项(i=0..n) 是 (-1)^? ... 用结构化方式生成
    // 项0: +1 ; 项 2j-1: -1/(j+1) ; 项 2j: +1/(j+1)  其中 j=1..n  共 2n+1 项? 
    // 重列：展开 = (1 - 1/2) + (1/2 - 1/3) + ... + (1/n - 1/(n+1))
    // 拍平：1, -1/2, +1/2, -1/3, +1/3, ..., -1/n, +1/n, -1/(n+1)
    const seq=[];
    seq.push({val:1,sign:1});          // +1
    for(let k=2;k<=n+1;k++){
      seq.push({val:1/k,sign:-1});      // -1/k
      if(k<=n)seq.push({val:1/k,sign:1});// +1/k （最后一项 k=n+1 没有 +）
    }
    // 渲染
    seq.forEach((it,i)=>{
      if(i>0){
        const op=document.createElement('span');op.className='t-op';
        op.textContent=it.sign>0?'+':'−';expr.appendChild(op);
      }else if(it.sign<0){
        const op=document.createElement('span');op.className='t-op';op.textContent='−';expr.appendChild(op);
      }
      const span=document.createElement('span');span.className='t-term';
      span.dataset.idx=i;span.dataset.val=it.val;span.dataset.sign=it.sign;
      // 数值文本
      const v=it.val;
      const body=frac(v);
      span.innerHTML=body;
      expr.appendChild(span);
      terms.push(span);
    });
    // 构造相消配对：相邻同值异号 (idx i, i+1) 其中 sign 不同 val 相同
    cancelQueue=[];
    const used=new Set();
    for(let i=0;i<seq.length-1;i++){
      if(used.has(i))continue;
      if(seq[i].val===seq[i+1].val && seq[i].sign!==seq[i+1].sign){
        cancelQueue.push([i,i+1]);
        used.add(i);used.add(i+1);
      }
    }
    // 给每对配不同颜色
    cancelQueue.forEach((pair,pi)=>{
      pairColor[pi]=shade(colorBase,-0.15+pi*0.12);
      pair.forEach(idx=>{terms[idx].dataset.pair=pi;});
    });
  }
  function frac(v){
    // v=1/k 形式，渲染为 1/k；v=1 渲染为 1
    if(v===1)return '1';
    const k=Math.round(1/v);
    return '<span style="display:inline-flex;flex-direction:column;align-items:center;line-height:1;font-size:.9em"><span>1</span><span style="border-top:1px solid currentColor;width:100%;min-width:.7em"></span><span>'+k+'</span></span>';
  }
  function shade(hex,amt){
    const c=hex.replace('#','');const num=parseInt(c.length===3?c.split('').map(x=>x+x).join(''):c,16);
    let r=(num>>16)&255,g=(num>>8)&255,b=num&255;
    r=Math.round(r+(amt>0?(255-r):r)*amt);g=Math.round(g+(amt>0?(255-g):g)*amt);b=Math.round(b+(amt>0?(255-b):b)*amt);
    return 'rgb('+Math.max(0,Math.min(255,r))+','+Math.max(0,Math.min(255,g))+','+Math.max(0,Math.min(255,b))+')';
  }
  let stepAt=0;
  function doStep(){
    if(stepAt>=cancelQueue.length){renderResult();return false;}
    const pair=cancelQueue[stepAt];const col=pairColor[stepAt];
    pair.forEach(idx=>{
      const el=terms[idx];
      el.style.background=col;el.style.color='#fff';
      el.classList.add('t-hi');
    });
    setTimeout(()=>{
      pair.forEach(idx=>{terms[idx].classList.add('t-cancel');});
    },350);
    stepAt++;
    return true;
  }
  function renderResult(){
    const n=parseInt(nIn.value,10);
    result.innerHTML='最后只剩首尾两项：';
    const s=document.createElement('span');s.className='t-keep';s.style.color=readColor();
    s.textContent=' 1 − 1/'+(n+1)+' ';
    result.appendChild(s);
    const sum=1-1/(n+1);
    const sumspan=document.createElement('span');
    sumspan.textContent=' = '+(Math.round(sum*1000)/1000);
    result.appendChild(sumspan);
  }
  function play(){
    stop();
    if(stepAt>=cancelQueue.length){reset();setTimeout(play,200);return;}
    timer=setInterval(()=>{
      const ok=doStep();
      if(!ok)stop();
    },800);
  }
  function stop(){if(timer){clearInterval(timer);timer=null;}}
  function reset(){stop();stepAt=0;build();}
  playBtn.addEventListener('click',play);
  stepBtn.addEventListener('click',()=>{stop();doStep();});
  resetBtn.addEventListener('click',reset);
  nIn.addEventListener('input',reset);
  document.body.addEventListener('reimu:theme-set',()=>{build();});
  build();
})();
</script>

原来看起来很长的一串数列，其实只要找到拆分方式，就能瞬间变短。

---

## 三、如果两个数不是相邻的怎么办？

比如：

$$\frac1{2\times5}$$

2 和 5 中间差了 3，不是相邻数。

我们可以这样拆：

$$\frac1{2\times5}=\frac13\left(\frac12-\frac15\right)$$

因为：

$$\frac12-\frac15=\frac{5-2}{2\times5}=\frac3{2\times5}$$

所以要再乘一个 $\frac13$。

一般地：

$$\frac1{n(n+k)}=\frac1k\left(\frac1n-\frac1{n+k}\right)$$

这里的关键不是死背公式，而是看懂：**分母中两个数差多少，前面就要除以多少**。

---

## 四、三个连续因子的裂项

再往上走一层，比如：

$$\frac1{n(n+1)(n+2)}$$

它也可以裂项：

$$\frac1{n(n+1)(n+2)}=\frac12\left[\frac1{n(n+1)}-\frac1{(n+1)(n+2)}\right]$$

为什么前面是 $\frac12$？

因为：

$$\frac1{n(n+1)}-\frac1{(n+1)(n+2)}=\frac{2}{n(n+1)(n+2)}$$

所以要乘 $\frac12$，才能变成原来的式子。

这其实还是通分，只是形式更复杂了。

---

## 五、从"分数裂项"反过来看"乘积求和"

裂项不仅能处理分数，也可以反过来处理乘积求和。

比如要求：

$$1\times2+2\times3+3\times4+\cdots+n(n+1)$$

可以把每一项写成两个更大乘积的差：

$$k(k+1)=\frac13\left[k(k+1)(k+2)-(k-1)k(k+1)\right]$$

因为括号里两个式子相减后，中间公共的 $k(k+1)$ 会留下一个差值 3：

$$k(k+1)[(k+2)-(k-1)] = 3k(k+1)$$

所以前面要乘 $\frac13$。

于是：

$$1\times2+2\times3+\cdots+n(n+1)=\frac13 n(n+1)(n+2)$$

例如：

$$1\times2+2\times3+\cdots+99\times100=\frac13\times99\times100\times101$$

这比一项一项加快得多。

---

## 六、平方和公式也可以这样理解

常见的平方和公式是：

$$1^2+2^2+3^2+\cdots+n^2=\frac{n(n+1)(2n+1)}6$$

很多人只会背，但我们可以把它拆成更熟悉的东西。

注意：

$$k^2=k(k-1)+k$$

所以：

$$1^2+2^2+3^2+\cdots+n^2$$

可以拆成：

$$[0\times1+1\times2+2\times3+\cdots+(n-1)n]+[1+2+3+\cdots+n]$$

第一部分是前面讲过的乘积求和：

$$0\times1+1\times2+\cdots+(n-1)n=\frac{(n-1)n(n+1)}3$$

第二部分是等差数列求和：

$$1+2+3+\cdots+n=\frac{n(n+1)}2$$

合起来：

$$\frac{(n-1)n(n+1)}3+\frac{n(n+1)}2$$

通分整理后得到：

$$\frac{n(n+1)(2n+1)}6$$

这就是平方和公式的来源。