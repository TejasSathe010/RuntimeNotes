import { useEffect, useRef } from "react";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function normalizeQuality(quality, width) {
  if (quality === "low" || quality === "high") return quality;
  if (width < 640) return "low";
  if (width > 1200) return "high";
  return "auto";
}

function createParticleSprite(rgb, radius = 14) {
  const c = document.createElement("canvas");
  const d = radius * 2;
  c.width = d;
  c.height = d;
  const g = c.getContext("2d");
  if (!g) return null;

  const grad = g.createRadialGradient(radius, radius, 0, radius, radius, radius);
  grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.75)`);
  grad.addColorStop(0.55, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.22)`);
  grad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);

  g.fillStyle = grad;
  g.beginPath();
  g.arc(radius, radius, radius, 0, Math.PI * 2);
  g.fill();

  return c;
}

export default function ParticleField({ quality = "auto", intensity = 1.0 }) {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    let rafId = 0;
    let running = true;

    let width = 0;
    let height = 0;
    let dpr = 1;

    let particles = [];
    let sprite = null;
    let isDark = false;

    const TARGET_FPS = 60;
    const FRAME_MS = 1000 / TARGET_FPS;
    let lastFrameTime = 0;

    const readIsDark = () =>
      document.documentElement.classList.contains("dark") ||
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ||
      false;

    const rebuildTheme = () => {
      isDark = readIsDark();
      const rgb = isDark ? [56, 189, 248] : [66, 133, 244];
      sprite = createParticleSprite(rgb, 14);
    };

    const getBounds = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const r = parent.getBoundingClientRect();
        return {
          w: Math.max(320, Math.floor(r.width)),
          h: Math.max(420, Math.floor(r.height)),
        };
      }
      return {
        w: window.innerWidth,
        h: Math.max(420, Math.floor(window.innerHeight * 0.65)),
      };
    };

    const buildParticles = () => {
      const q = normalizeQuality(quality, width);
      const densityDiv = q === "low" ? 80 : q === "high" ? 36 : width < 640 ? 82 : 46;

      const num = Math.max(26, Math.floor(width / densityDiv));
      particles = Array.from({ length: num }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 - 1,
        r: Math.random() * 2.2 + 0.7,
        opacity: Math.random() * 0.28 + 0.12,
        vx: (Math.random() - 0.5) * 0.11,
        vy: (Math.random() - 0.5) * 0.11,
      }));
    };

    const setupSize = () => {
      const { w, h } = getBounds();
      width = w;
      height = h;

      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildParticles();
    };

    rebuildTheme();
    setupSize();

    const step = (now) => {
      if (!running) return;

      if (now - lastFrameTime < FRAME_MS) {
        rafId = requestAnimationFrame(step);
        return;
      }
      lastFrameTime = now;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      const dx = (mouse.current.x - width / 2) * 0.00045;
      const dy = (mouse.current.y - height / 2) * 0.00045;

      if (sprite) {
        for (const p of particles) {
          p.x += p.vx + dx * p.z;
          p.y += p.vy + dy * p.z;

          if (p.x < -60) p.x = width + 60;
          if (p.x > width + 60) p.x = -60;
          if (p.y < -60) p.y = height + 60;
          if (p.y > height + 60) p.y = -60;

          const a = clamp(p.opacity * (0.95 + intensity * 0.35), 0, 0.85);
          const size = (18 + p.r * 6) * (1.18 - p.z * 0.25);

          ctx.globalAlpha = a;
          ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    const handleResize = () => setupSize();
    const handlePointerMove = (e) => {
      mouse.current.x = e.clientX ?? mouse.current.x;
      mouse.current.y = e.clientY ?? mouse.current.y;
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        lastFrameTime = 0;
        rafId = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(rafId);
      }
    };

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onScheme = () => rebuildTheme();

    const mo = new MutationObserver(() => rebuildTheme());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    mq?.addEventListener?.("change", onScheme);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      mq?.removeEventListener?.("change", onScheme);
      mo.disconnect();
    };
  }, [quality, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{
        mixBlendMode: "normal",
        opacity: 0.75,
        filter: "blur(3px) saturate(1.1) contrast(1.1)",
      }}
    />
  );
}
