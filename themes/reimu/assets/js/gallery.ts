type GalleryDomItem = {
  title: string;
  src: string;
  description: string;
};

(function () {
  const root = document.querySelector<HTMLElement>("[data-gallery-root]");
  if (!root || root.dataset.galleryReady === "true") return;
  root.dataset.galleryReady = "true";

  const frames = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-gallery-item]"));
  const lightbox = root.querySelector<HTMLElement>("[data-gallery-lightbox]");
  const lightboxImage = root.querySelector<HTMLImageElement>("[data-gallery-lightbox-image]");
  const lightboxTitle = root.querySelector<HTMLElement>("[data-gallery-lightbox-title]");
  const lightboxDescription = root.querySelector<HTMLElement>("[data-gallery-lightbox-description]");
  const closeButton = root.querySelector<HTMLButtonElement>(".gallery-lightbox-close");
  let activeFrame: HTMLButtonElement | null = null;

  function itemFromFrame(frame: HTMLButtonElement): GalleryDomItem {
    return {
      title: frame.dataset.galleryTitle || "未命名作品",
      src: frame.dataset.gallerySrc || "",
      description: frame.dataset.galleryDescription || "这张图片还没有简介。",
    };
  }

  function openLightbox(frame: HTMLButtonElement) {
    const item = itemFromFrame(frame);
    if (!item.src || !lightbox || !lightboxImage || !lightboxTitle || !lightboxDescription) return;

    activeFrame = frame;
    lightboxImage.src = item.src;
    lightboxImage.alt = item.title;
    lightboxTitle.textContent = item.title;
    lightboxDescription.textContent = item.description;
    lightbox.hidden = false;
    document.body.classList.add("gallery-modal-open");
    requestAnimationFrame(() => closeButton?.focus({ preventScroll: true }));
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.classList.remove("gallery-modal-open");
    activeFrame?.focus({ preventScroll: true });
    activeFrame = null;
  }

  frames.forEach((frame) => {
    frame.addEventListener("click", () => openLightbox(frame));
    frame.addEventListener("pointermove", (event) => {
      const rect = frame.getBoundingClientRect();
      frame.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
      frame.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
    });
  });

  root.querySelectorAll("[data-gallery-close]").forEach((target) => {
    target.addEventListener("click", closeLightbox);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox && !lightbox.hidden) {
      closeLightbox();
    }
  });
})();
