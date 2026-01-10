import { useEffect, useRef } from "react";


function normalizeQuality(quality, width) {
  if (quality === "low" || quality === "high") return quality;
  // auto
  if (width < 640) return "low";
  if (width > 1200) return "high";
  return "auto";
}

function getPalette(isDark) {
  // keep your vibe: Google-ish in light, neon in dark
  return isDark
    ? ["#38bdf8", "#818cf8", "#a78bfa"]
    : ["#4285F4", "#34A853", "#FBBC05", "#EA4335"];
}

function hexToRgb(hex) {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpRgb(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function rgba(rgb, a) {
  return `rgba(${rgb[0] | 0},${rgb[1] | 0},${rgb[2] | 0},${a})`;
}

function createGlowSprite(colorRgb, radius = 18) {
  const c = document.createElement("canvas");
  const d = radius * 2;
  c.width = d;
  c.height = d;
  const g = c.getContext("2d");
  if (!g) return null;

  const grad = g.createRadialGradient(radius, radius, 0, radius, radius, radius);
  grad.addColorStop(0, rgba(colorRgb, 0.95));
  grad.addColorStop(0.55, rgba(colorRgb, 0.35));
  grad.addColorStop(1, rgba(colorRgb, 0));

  g.fillStyle = grad;
  g.beginPath();
  g.arc(radius, radius, radius, 0, Math.PI * 2);
  g.fill();

  return c;
}

export default function ArchitecturalMesh({ quality = "auto", intensity = 1.0 }) {
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

    let nodes = [];
    let nodeCount = 0;
    let baseMaxDist = 200;

    let isDark = false;
    let paletteHex = [];
    let paletteRgb = [];
    let glowSprite = null;

    // frame limiter (keeps it smooth + quiet)
    const TARGET_FPS = 60; // set 45 if you want even cooler laptops
    const FRAME_MS = 1000 / TARGET_FPS;
    let lastFrameTime = 0;

    const readIsDark = () =>
      document.documentElement.classList.contains("dark") ||
      window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ||
      false;

    const rebuildTheme = () => {
      isDark = readIsDark();
      paletteHex = getPalette(isDark);
      paletteRgb = paletteHex.map(hexToRgb);

      // glow sprite from your primary vibe color
      const base = isDark ? hexToRgb("#38bdf8") : hexToRgb("#4285F4");
      glowSprite = createGlowSprite(base, 18);
    };

    const getBounds = () => {
      // prefer parent bounds (more correct than window.innerWidth)
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

    const buildNodes = () => {
      const q = normalizeQuality(quality, width);
      const nodeDiv = q === "low" ? 74 : q === "high" ? 46 : width < 900 ? 64 : 52;

      nodeCount = Math.min(56, Math.max(22, Math.floor(width / nodeDiv)));

      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 - 1,
        vx: (Math.random() - 0.5) * 0.34,
        vy: (Math.random() - 0.5) * 0.34,
      }));

      baseMaxDist = Math.max(160, Math.min(235, Math.floor(width * 0.22)));
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

      buildNodes();
    };

    // theme updates without polling every frame
    rebuildTheme();
    setupSize();

    const drawVignette = () => {
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.12,
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.8
      );
      vignette.addColorStop(0, isDark ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)");
      vignette.addColorStop(1, isDark ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.35)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    const step = (now) => {
      if (!running) return;

      // frame limiter
      if (now - lastFrameTime < FRAME_MS) {
        rafId = requestAnimationFrame(step);
        return;
      }
      lastFrameTime = now;

      ctx.clearRect(0, 0, width, height);
      drawVignette();

      ctx.globalCompositeOperation = "lighter";

      const t = (now % 6500) / 6500;
      const maxDist = baseMaxDist;
      const baseLine = (isDark ? 0.28 : 0.22) * intensity;
      const boostLine = (isDark ? 0.55 : 0.48) * intensity;

      // Connections (O(n^2) but fine at <=56; the sprite saves the heavy part)
      for (let i = 0; i < nodeCount; i++) {
        const ni = nodes[i];
        for (let j = i + 1; j < nodeCount; j++) {
          const nj = nodes[j];
          const dx = ni.x - nj.x;
          const dy = ni.y - nj.y;
          const dist = Math.hypot(dx, dy);
          if (dist >= maxDist) continue;

          const alpha = 1 - dist / maxDist;

          // stable but dynamic color mixing (no string replace hacks)
          const c1 = paletteRgb[i % paletteRgb.length];
          const c2 = paletteRgb[j % paletteRgb.length];
          const mix = (t + i / nodeCount) % 1;
          const rgb = lerpRgb(c1, c2, mix);

          const a = Math.min(0.92, baseLine + alpha * boostLine);
          ctx.strokeStyle = rgba(rgb, a);
          ctx.lineWidth = Math.max(0.9, 1.05 + ni.z * 0.28);

          ctx.beginPath();
          ctx.moveTo(ni.x, ni.y);
          ctx.lineTo(nj.x, nj.y);
          ctx.stroke();
        }
      }

      // Nodes: fast glow sprite
      if (glowSprite) {
        for (const n of nodes) {
          const r = 2.2 + n.z * 0.8;
          const size = 22 + n.z * 4; // sprite render size
          ctx.globalAlpha = 0.9;

          ctx.drawImage(glowSprite, n.x - size / 2, n.y - size / 2, size, size);

          ctx.globalAlpha = 1;
          ctx.fillStyle = isDark ? "rgba(56,189,248,0.9)" : "rgba(66,133,244,0.85)";
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fill();

          // motion
          const mx = (mouse.current.x - width / 2) * 0.000045;
          const my = (mouse.current.y - height / 2) * 0.000045;
          n.x += n.vx + mx;
          n.y += n.vy + my;

          if (n.x < 0) n.x = width;
          if (n.x > width) n.x = 0;
          if (n.y < 0) n.y = height;
          if (n.y > height) n.y = 0;
        }
      }

      ctx.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    const handleResize = () => setupSize();

    const handlePointerMove = (e) => {
      // supports mouse + touch + pen
      mouse.current.x = e.clientX ?? mouse.current.x;
      mouse.current.y = e.clientY ?? mouse.current.y;
    };

    // Pause when tab hidden (big CPU saver)
    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        lastFrameTime = 0;
        rafId = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(rafId);
      }
    };

    // Theme change listeners
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
        opacity: 0.92,
        filter: "saturate(1.15) contrast(1.18)",
      }}
    />
  );
}
