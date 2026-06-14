/**
 * 首页沉浸式英雄区滚动联动（v2 毛玻璃方案）
 *
 * 职责：
 *  - 仅在首页（#header.hero-home 存在时）启用
 *  - 滚动时把进度（0..1）写入 <html> 的 CSS 变量：
 *      --hero-progress        : 0=完整英雄区, 1=完全进入文章区
 *      --hero-blur            : 背景模糊像素 0 → 18px
 *      --hero-overlay-alpha   : 内容遮罩透明度 0 → 0.82
 *      --hero-title-opacity   : 英雄区文字 1 → 0
 *  - 由 hero.scss 用 calc()/filter 实时驱动，零重排，过渡丝滑
 *  - 点击 #hero-scroll-hint 平滑滚到文章区
 */
(function () {
  const header = document.querySelector("#header.hero-home") as HTMLElement | null;
  if (!header) return;

  const root = document.documentElement;
  const hint = document.getElementById("hero-scroll-hint");

  // 在这段滚动距离内完成「英雄区 → 毛玻璃文章区」过渡
  // 用英雄区高度的一个比例，保证过渡幅度看得见
  const transitionDistance = () => {
    const h = header.offsetHeight || window.innerHeight;
    return Math.max(h * 0.55, 320);
  };

  // 终态参数
  const MAX_BLUR = 18; // px
  const MAX_OVERLAY = 0.82; // 浅色模式略透；深色在 CSS 里覆盖
  const TITLE_FADE_END = 0.45; // 进度到 0.45 时标题完全消失

  let ticking = false;

  // easeOutQuad：起步快、收尾缓，模糊自然贴合滚动减速感
  const ease = (t: number) => 1 - (1 - t) * (1 - t);

  function update() {
    ticking = false;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const dist = transitionDistance();
    const raw = Math.min(Math.max(scrollTop / dist, 0), 1);
    const p = ease(raw);

    root.style.setProperty("--hero-progress", p.toFixed(4));
    root.style.setProperty("--hero-blur", (MAX_BLUR * p).toFixed(2) + "px");
    root.style.setProperty("--hero-overlay-alpha", (MAX_OVERLAY * p).toFixed(3));

    // 标题/按钮在前半段就淡出，避免文字被模糊背景“吃掉”时仍残留
    const titleOpacity = Math.max(0, 1 - raw / TITLE_FADE_END);
    root.style.setProperty("--hero-title-opacity", titleOpacity.toFixed(3));
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // 点击滚动提示：平滑滚到英雄区底部（文章列表起点）
  if (hint) {
    hint.addEventListener("click", () => {
      const target =
        header.getBoundingClientRect().bottom + window.scrollY - 1;
      window.scrollTo({ top: target, behavior: "smooth" });
    });
  }

  // 初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", update);
  } else {
    update();
  }
})();
