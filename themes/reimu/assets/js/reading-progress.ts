/**
 * 右侧竖向阅读进度条
 *
 * 取代旧的顶部横条。仅文章页启用。
 *
 * 结构（由 JS 创建并插入 body 末尾）：
 *   <div id="reading-progress">
 *     <div class="rp-track"><div class="rp-fill"></div></div>
 *   </div>
 *
 * 行为：
 *  - 进度 = 整页滚动进度（已滚 / 可滚高度）
 *  - .rp-fill 用 transform: scaleY() 缩放，比改 height 更平滑（不触发布局）
 *  - rAF 节流
 */
(function () {
  const root = document.createElement("div");
  root.id = "reading-progress";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML =
    '<div class="rp-track"><span class="rp-thumb"></span></div>';
  document.body.appendChild(root);

  const fill = document.createElement("div");
  fill.className = "rp-fill";
  root.querySelector(".rp-track")!.appendChild(fill);

  const thumb = root.querySelector(".rp-thumb") as HTMLElement | null;

  let ticking = false;

  function update() {
    ticking = false;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) {
      root.style.opacity = "0";
      return;
    }
    root.style.opacity = "1";
    const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
    // 用 transform 缩放，避免布局抖动
    fill.style.transform = `scaleY(${progress})`;
    if (thumb) {
      thumb.style.top = `${progress * 100}%`;
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", update);
  } else {
    update();
  }
})();
