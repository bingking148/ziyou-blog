(function () {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const isLowPower = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isLowPower) return;

  function getThemeColor() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    return isDark
      ? ["#a5c9ff", "#669df6", "#4285f4", "#1a73e8"]
      : ["#4285f4", "#669df6", "#a1c2fa", "#1a73e8"];
  }

  function createRipple(x: number, y: number) {
    const colors = getThemeColor();
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(container);

    // Create 3 ripple rings
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement("div");
      const size = 20 + i * 15;
      ring.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        width: ${size}px;
        height: ${size}px;
        border: 2px solid ${colors[i % colors.length]};
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        opacity: 0.8;
        animation: click-ripple 0.8s ease-out ${i * 0.08}s forwards;
      `;
      container.appendChild(ring);
    }

    // Create spark particles
    const particleCount = isMobile ? 6 : 10;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const distance = 30 + Math.random() * 40;
      const size = 2 + Math.random() * 3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const duration = 0.5 + Math.random() * 0.4;
      const delay = Math.random() * 0.1;

      particle.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        box-shadow: 0 0 ${size * 2}px ${color};
        transform: translate(-50%, -50%);
        opacity: 1;
        animation: click-spark ${duration}s ease-out ${delay}s forwards;
        --spark-angle: ${angle}rad;
        --spark-distance: ${distance}px;
      `;
      container.appendChild(particle);
    }

    // Cleanup
    setTimeout(() => {
      container.remove();
    }, 1200);
  }

  // Add keyframes if not already added
  if (!document.getElementById("click-effect-styles")) {
    const style = document.createElement("style");
    style.id = "click-effect-styles";
    style.textContent = `
      @keyframes click-ripple {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 0.8;
        }
        100% {
          transform: translate(-50%, -50%) scale(3);
          opacity: 0;
        }
      }
      @keyframes click-spark {
        0% {
          transform: translate(-50%, -50%) translate(0, 0) scale(1);
          opacity: 1;
        }
        70% {
          opacity: 0.6;
        }
        100% {
          transform: translate(-50%, -50%) translate(
            calc(cos(var(--spark-angle)) * var(--spark-distance)),
            calc(sin(var(--spark-angle)) * var(--spark-distance))
          ) scale(0);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.addEventListener("click", (e) => {
    // Skip if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest("a") ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select") ||
      target.closest("label") ||
      target.closest(".nav-icon") ||
      target.closest(".main-nav-link-wrap")
    ) {
      // Still show a subtle effect
      createRipple(e.clientX, e.clientY);
      return;
    }
    createRipple(e.clientX, e.clientY);
  });

  // Touch support
  document.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const target = touch.target as HTMLElement;
        if (
          target.closest("a") ||
          target.closest("button") ||
          target.closest("input") ||
          target.closest("textarea") ||
          target.closest("select")
        ) {
          return;
        }
        // Debounce for touch
        createRipple(touch.clientX, touch.clientY);
      }
    },
    { passive: true }
  );
})();
