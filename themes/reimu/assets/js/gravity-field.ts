(function () {
  const canvas = document.getElementById("gravity-canvas") as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const isLowPower = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (isLowPower) {
    canvas.style.display = "none";
    return;
  }

  let width: number, height: number;
  let animationId: number;
  let mouse = { x: -1000, y: -1000, active: false };

  const config = {
    gridSpacing: isMobile ? 35 : 28,
    gridRows: 0,
    gridCols: 0,
    lineWidth: 0.8,
    collapseRadius: isMobile ? 120 : 180,
    pullStrength: 0.1,
    damping: 0.85,
    returnSpeed: 0.02,
    maxCompression: 0.85,
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

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    config.gridCols = Math.ceil(width / config.gridSpacing) + 2;
    config.gridRows = Math.ceil(height / config.gridSpacing) + 2;

    initGrid();
  }

  function initGrid() {
    gridPoints = [];
    for (let row = 0; row <= config.gridRows; row++) {
      const rowPoints: GridPoint[] = [];
      for (let col = 0; col <= config.gridCols; col++) {
        const x = col * config.gridSpacing - config.gridSpacing / 2;
        const y = row * config.gridSpacing - config.gridSpacing / 2;
        rowPoints.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
        });
      }
      gridPoints.push(rowPoints);
    }
  }

  function getLineColor() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    return isDark ? "120, 140, 180" : "60, 70, 90";
  }

  function updatePoints() {
    for (let row = 0; row <= config.gridRows; row++) {
      for (let col = 0; col <= config.gridCols; col++) {
        const point = gridPoints[row][col];

        let targetX = point.baseX;
        let targetY = point.baseY;

        if (mouse.active) {
          const dx = point.baseX - mouse.x;
          const dy = point.baseY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.collapseRadius && dist > 0) {
            const pullFactor = Math.pow(1 - dist / config.collapseRadius, 2);
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

  function drawGrid() {
    if (!ctx) return;
    const color = getLineColor();

    ctx.clearRect(0, 0, width, height);

    for (let row = 0; row <= config.gridRows; row++) {
      for (let col = 0; col < config.gridCols; col++) {
        const p1 = gridPoints[row][col];
        const p2 = gridPoints[row][col + 1];
        drawLine(p1, p2, color);
      }
    }

    for (let col = 0; col <= config.gridCols; col++) {
      for (let row = 0; row < config.gridRows; row++) {
        const p1 = gridPoints[row][col];
        const p2 = gridPoints[row + 1][col];
        drawLine(p1, p2, color);
      }
    }

    if (mouse.active) {
      drawCenter(color);
    }
  }

  function drawLine(p1: GridPoint, p2: GridPoint, color: string) {
    if (!ctx) return;

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    let distToMouse = Infinity;

    if (mouse.active) {
      distToMouse = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2);
    }

    let opacity: number;
    let lineWidth: number;

    if (mouse.active && distToMouse < config.collapseRadius) {
      const normalizedDist = distToMouse / config.collapseRadius;
      const centerFactor = Math.pow(1 - normalizedDist, 2);

      opacity = 0.1 + centerFactor * 0.5;
      lineWidth = config.lineWidth + centerFactor * 1.0;
    } else {
      opacity = 0.08;
      lineWidth = config.lineWidth;
    }

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = `rgba(${color}, ${opacity})`;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  function drawCenter(color: string) {
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color}, 0.9)`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 12, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color}, 0.3)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function animate() {
    updatePoints();
    drawGrid();
    animationId = requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => {
    resize();
  });

  document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  document.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  document.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  });

  document.addEventListener("touchend", () => {
    mouse.active = false;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });

  resize();
  animate();
})();
