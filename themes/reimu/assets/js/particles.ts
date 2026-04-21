(function () {
  const canvas = document.getElementById("particle-canvas") as HTMLCanvasElement | null;
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
  let particles: Particle[] = [];
  let mouse = { x: -1000, y: -1000, active: false };
  let animationId: number;

  const config = {
    particleCount: isMobile ? 20 : 50,
    connectionDistance: isMobile ? 80 : 120,
    mouseDistance: isMobile ? 100 : 150,
    speed: isMobile ? 0.3 : 0.5,
    lineOpacity: 0.15,
    particleOpacity: 0.4,
    particleRadius: isMobile ? 1.5 : 2,
  };

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    baseX: number;
    baseY: number;

    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.baseX = this.x;
      this.baseY = this.y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * config.speed + 0.1;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.radius = Math.random() * config.particleRadius + 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Keep in bounds
      this.x = Math.max(0, Math.min(width, this.x));
      this.y = Math.max(0, Math.min(height, this.y));

      // Mouse interaction
      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.mouseDistance) {
          const force = (config.mouseDistance - dist) / config.mouseDistance;
          this.vx += (dx / dist) * force * 0.02;
          this.vy += (dy / dist) * force * 0.02;
        }
      }

      // Damping
      this.vx *= 0.99;
      this.vy *= 0.99;

      // Minimum movement
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed < 0.1) {
        const angle = Math.random() * Math.PI * 2;
        this.vx += Math.cos(angle) * 0.01;
        this.vy += Math.sin(angle) * 0.01;
      }
    }

    draw() {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(var(--particle-color), ${config.particleOpacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    if (!ctx) return;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.connectionDistance) {
          const opacity = (1 - dist / config.connectionDistance) * config.lineOpacity;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(var(--particle-color), ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      // Mouse connections
      if (mouse.active) {
        const dx = mouse.x - particles[i].x;
        const dy = mouse.y - particles[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.mouseDistance) {
          const opacity = (1 - dist / config.mouseDistance) * config.lineOpacity * 1.5;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(var(--particle-color), ${opacity})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  function getThemeColor() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    return isDark ? "165, 201, 255" : "66, 133, 244"; // blue-ish for the user's theme
  }

  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const color = getThemeColor();
    canvas.style.setProperty("--particle-color", color);

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    drawConnections();
    animationId = requestAnimationFrame(animate);
  }

  // Events
  window.addEventListener("resize", () => {
    resize();
    initParticles();
  });

  document.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  document.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  // Touch support
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

  // Handle theme changes
  document.body.addEventListener("reimu:theme-set", () => {
    // Color will be updated in next frame
  });

  // Visibility API to pause when tab hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });

  resize();
  initParticles();
  animate();
})();
