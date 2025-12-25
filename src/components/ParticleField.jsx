import { useEffect, useRef } from "react";

export default function ParticleField({ quality = "auto", intensity = 1.0 }) {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId = 0;
    let width = 0;
    let height = 0;

    const getIsDark = () =>
      document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const setupSize = () => {
      width = window.innerWidth;
      height = Math.max(420, Math.floor(window.innerHeight * 0.65));

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setupSize();

    const densityDiv = quality === "low" ? 76 : quality === "high" ? 36 : width < 640 ? 78 : 44;
    const numParticles = Math.max(26, Math.floor(width / densityDiv));

    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 2 - 1,
      r: Math.random() * 2.2 + 0.7,
      opacity: Math.random() * 0.28 + 0.12,
      vx: (Math.random() - 0.5) * 0.11,
      vy: (Math.random() - 0.5) * 0.11,
    }));

    const draw = () => {
      const isDark = getIsDark();
      const baseColor = isDark ? [56, 189, 248] : [66, 133, 244];

      ctx.clearRect(0, 0, width, height);

      // Nice soft additive glow
      ctx.globalCompositeOperation = "lighter";

      const dx = (mouse.current.x - width / 2) * 0.00045;
      const dy = (mouse.current.y - height / 2) * 0.00045;

      for (const p of particles) {
        p.x += p.vx + dx * p.z;
        p.y += p.vy + dy * p.z;

        if (p.x < -60) p.x = width + 60;
        if (p.x > width + 60) p.x = -60;
        if (p.y < -60) p.y = height + 60;
        if (p.y > height + 60) p.y = -60;

        const [r, g, b] = baseColor;
        const a = Math.min(0.85, p.opacity * (0.95 + intensity * 0.35));

        // small glow gradient makes them visible but classy
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
        glow.addColorStop(0, `rgba(${r},${g},${b},${a})`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1.18 - p.z * 0.25), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => setupSize();
    const handleMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMove);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMove);
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
