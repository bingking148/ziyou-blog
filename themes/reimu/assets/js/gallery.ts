// 画廊交互：仅保留指针跟随高光（pointer-tracked sheen）。
// 图片放大查看(lightbox)统一交给全站 PhotoSwipe 5 处理，不再使用自写弹窗。
(function () {
  const root = document.querySelector<HTMLElement>("[data-gallery-root]");
  if (!root || root.dataset.galleryReady === "true") return;
  root.dataset.galleryReady = "true";

  const frames = Array.from(
    root.querySelectorAll<HTMLAnchorElement>(".gallery-frame"),
  );

  frames.forEach((frame) => {
    frame.addEventListener("pointermove", (event) => {
      const rect = frame.getBoundingClientRect();
      frame.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
      frame.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
    });
  });
})();
