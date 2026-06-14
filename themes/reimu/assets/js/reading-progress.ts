/**
 * 顶部阅读进度条
 *
 * DOM（#reading-progress-bar）和样式已在 baseof.html / main.scss 中就绪，
 * 此脚本仅负责按文章正文滚动位置更新 width。
 *
 * 行为：
 *  - 仅在存在文章正文（article）时启用，其它页面（首页/归档/画廊）不显示
 *  - 进度 = 已滚过的正文高度 / 正文可滚高度
 *  - 滚动事件用 rAF 节流，避免抖动
 */
(function () {
  const bar = document.getElementById("reading-progress-bar");
  if (!bar) return;

  let ticking = false;

  function update() {
    ticking = false;
    const article = document.querySelector(".article-entry") as HTMLElement | null;
    if (!article) {
      // 非文章页：隐藏
      bar.style.opacity = "0";
      bar.style.width = "0%";
      return;
    }

    bar.style.opacity = "1";

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      bar.style.width = "0%";
      return;
    }
    const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
    bar.style.width = progress * 100 + "%";
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  // 初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", update);
  } else {
    update();
  }
})();
