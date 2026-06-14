/**
 * 引力场背景动效
 *
 * 特性：
 *  - 主题色联动：从 CSS 变量 --red-1 读取，跟随浅色/深色模式变化
 *  - 常驻微呼吸：鼠标静止时网格点叠加极弱噪声漂移，画面始终“活着”
 *  - 发光核心 + 涟漪：鼠标处绘制径向辉光与扩散涟漪环
 *  - 3D 引力井：网格点在鼠标处按伪深度向内塌缩，呈现凹陷质感
 *  - 性能：resize 节流、页面隐藏暂停、低端机/低功耗模式跳过
 */
(function () {
  const canvas = document.getElementById("gravity-canvas") as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    canvas.style.display = "none";
    return;
  }

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationId = 0;
  let running = false;

  const mouse = { x: -1000, y: -1000, active: false };
  // 用于呼吸噪声的时间相位
  let phase = 0;

  const config = {
    gridSpacing: isMobile ? 44 : 30,
    gridRows: 0,
    gridCols: 0,
    lineWidth: isMobile ? 0.7 : 0.85,
    collapseRadius: isMobile ? 130 : 200,
    pullStrength: 0.12,
    damping: 0.86,
    returnSpeed: 0.025,
    maxCompression: 0.82,
    // 呼吸噪声幅度（像素）
    breathAmp: isMobile ? 0.4 : 0.6,
    // 涟漪环数量
    ripples: isMobile ? 2 : 3,
  };

  interface GridPoint {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    vx: number;
    vy: number;
  }

  let gridPoints: GridPoint[][] = [];

  // 缓存主题色（hex -> rgb），仅在主题切换时更新
  let cachedRGB = "66, 133, 244";

  function readThemeColor(): string {
    const read = () => {
      try {
        const v = getComputedStyle(document.documentElement)
          .getPropertyValue("--red-1")
          .trim();
        if (!v) return cachedRGB;
        const hex = v.replace("#", "");
        if (/^[0-9a-fA-F]{3}$/.test(hex)) {
          const r = parseInt(hex[0] + hex[0], 16);
          const g = parseInt(hex[1] + hex[1], 16);
          const b = parseInt(hex[2] + hex[2], 16);
          return `${r}, ${g}, ${b}`;
        }
        if (/^[0-9a-fA-F]{6}$/.test(hex)) {
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          return `${r}, ${g}, ${b}`;
        }
        return cachedRGB;
      } catch {
        return cachedRGB;
      }
    };
    cachedRGB = read();
    return cachedRGB;
  }

  function initGrid() {
    gridPoints = [];
    const cols = config.gridCols;
    const rows = config.gridRows;
    for (let row = 0; row <= rows; row++) {
      const rowPoints: GridPoint[] = [];
      for (let col = 0; col <= cols; col++) {
        const x = col * config.gridSpacing - config.gridSpacing / 2;
        const y = row * config.gridSpacing - config.gridSpacing / 2;
        rowPoints.push({ x, y, baseX: x, baseY: y, vx: 0, vy: 0 });
      }
      gridPoints.push(rowPoints);
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    config.gridCols = Math.ceil(width / config.gridSpacing) + 2;
    config.gridRows = Math.ceil(height / config.gridSpacing) + 2;

    initGrid();
    readThemeColor();
  }

  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 150);
  };

  function updatePoints() {
    const breath = config.breathAmp;
    for (let row = 0; row <= config.gridRows; row++) {
      for (let col = 0; col <= config.gridCols; col++) {
        const point = gridPoints[row][col];

        // 呼吸噪声：极弱、缓慢、基于位置的相位偏移，避免整体同步抖动
        const noiseX = Math.sin(phase + row * 0.31 + col * 0.17) * breath;
        const noiseY = Math.cos(phase * 0.8 + row * 0.21 - col * 0.19) * breath;

        let targetX = point.baseX + noiseX;
        let targetY = point.baseY + noiseY;

        if (mouse.active) {
          const dx = targetX - mouse.x;
          const dy = targetY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.collapseRadius && dist > 0.01) {
            const t = 1 - dist / config.collapseRadius;
            const pullFactor = t * t;
            // 伪 3D 引力井：越靠近中心，塌缩越深
            const compression = pullFactor * config.maxCompression;
            const scale = 1 - compression;

            targetX = mouse.x + dx * scale;
            targetY = mouse.y + dy * scale;

            point.vx += (targetX - point.x) * config.pullStrength;
            point.vy += (targetY - point.y) * config.pullStrength;
          }
        }

        point.vx += (targetX - point.x) * config.returnSpeed;
        point.vy += (targetY - point.y) * config.returnSpeed;

        point.vx *= config.damping;
        point.vy *= config.damping;

        point.x += point.vx;
        point.y += point.vy;
      }
    }
  }

  function drawGrid(color: string) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // 批量描边：按透明度分桶减少 strokeStyle 切换
    // 但为保持简洁，这里直接逐线绘制，颜色字符串复用缓存变量
    for (let row = 0; row <= config.gridRows; row++) {
      for (let col = 0; col < config.gridCols; col++) {
        drawLine(gridPoints[row][col], gridPoints[row][col + 1], color);
      }
    }
    for (let col = 0; col <= config.gridCols; col++) {
      for (let row = 0; row < config.gridRows; row++) {
        drawLine(gridPoints[row][col], gridPoints[row + 1][col], color);
      }
    }

    if (mouse.active) {
      drawCore(color);
      drawRipples(color);
    }
  }

  function drawLine(p1: GridPoint, p2: GridPoint, color: string) {
    if (!ctx) return;

    let opacity = 0.07;
    let lineWidth = config.lineWidth;

    if (mouse.active) {
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dx = mouse.x - midX;
      const dy = mouse.y - midY;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);

      if (distToMouse < config.collapseRadius) {
        const normalizedDist = distToMouse / config.collapseRadius;
        const centerFactor = (1 - normalizedDist) ** 2;
        opacity = 0.1 + centerFactor * 0.55;
        lineWidth = config.lineWidth + centerFactor * 1.1;
      }
    }

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = `rgba(${color}, ${opacity})`;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  function drawCore(color: string) {
    if (!ctx) return;

    // 径向辉光
    const glow = ctx.createRadialGradient(
      mouse.x,
      mouse.y,
      0,
      mouse.x,
      mouse.y,
      40
    );
    glow.addColorStop(0, `rgba(${color}, 0.55)`);
    glow.addColorStop(0.4, `rgba(${color}, 0.22)`);
    glow.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 40, 0, Math.PI * 2);
    ctx.fill();

    // 实心核心
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color}, 0.95)`;
    ctx.fill();

    // 细描边
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 7, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color}, 0.35)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawRipples(color: string) {
    if (!ctx) return;
    const time = performance.now() / 1000;
    for (let i = 0; i < config.ripples; i++) {
      // 每个环错相位，制造连续扩散感
      const t = (time * 0.6 + i / config.ripples) % 1;
      const radius = 8 + t * config.collapseRadius * 0.9;
      const alpha = (1 - t) * 0.28;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${color}, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function animate() {
    if (!running) return;
    phase += 0.01;
    updatePoints();
    drawGrid(cachedRGB);
    animationId = requestAnimationFrame(animate);
  }

  function start() {
    if (running) return;
    running = true;
    animate();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(animationId);
  }

  // 事件绑定
  window.addEventListener("resize", onResize, { passive: true });

  document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  document.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  document.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    },
    { passive: true }
  );

  document.addEventListener("touchend", () => {
    mouse.active = false;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  // 主题切换时刷新颜色
  document.body.addEventListener("reimu:theme-set", readThemeColor);

  // 初始化
  resize();
  readThemeColor();
  start();
})();
