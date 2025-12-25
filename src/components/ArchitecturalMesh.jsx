import { useEffect, useRef } from "react";

function lerpColor(a, b, amount) {
  const ah = +("0x" + a.replace("#", ""));
  const bh = +("0x" + b.replace("#", ""));
  const ar = ah >> 16,
    ag = (ah >> 8) & 0xff,
    ab = ah & 0xff;
  const br = bh >> 16,
    bg = (bh >> 8) & 0xff,
    bb = bh & 0xff;
  const rr = ar + amount * (br - ar);
  const rg = ag + amount * (bg - ag);
  const rb = ab + amount * (bb - ab);
  return `rgb(${rr | 0},${rg | 0},${rb | 0})`;
}

export default function ArchitecturalMesh({ quality = "auto", intensity = 1.0 }) {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const getIsDark = () =>
      document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const getColors = (isDark) =>
      isDark
        ? ["#38bdf8", "#818cf8", "#a78bfa"]
        : ["#4285F4", "#34A853", "#FBBC05", "#EA4335"];

    const setupSize = () => {
      width = window.innerWidth;
      height = Math.max(420, Math.floor(window.innerHeight * 0.65));

      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setupSize();

    const nodeDiv = quality === "low" ? 72 : quality === "high" ? 44 : width < 900 ? 64 : 52;
    const nodeCount = Math.min(52, Math.max(22, Math.floor(width / nodeDiv)));

    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 2 - 1,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
    }));

    // Responsive connection radius
    const baseMaxDist = Math.max(160, Math.min(230, Math.floor(width * 0.22)));

    const draw = () => {
      const isDark = getIsDark();
      const colors = getColors(isDark);

      // Clear fully each frame (no wash-out)
      ctx.clearRect(0, 0, width, height);

      // Add subtle vignette to increase perceived contrast
      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.15,
        width * 0.5,
        height * 0.5,
        Math.min(width, height) * 0.8
      );
      vignette.addColorStop(0, isDark ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)");
      vignette.addColorStop(1, isDark ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.35)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Brighter blending
      ctx.globalCompositeOperation = "lighter";

      const t = Date.now();
      const colorStep = (t % 6500) / 6500;

      const maxDist = baseMaxDist;
      const baseLine = (isDark ? 0.28 : 0.22) * intensity;
      const boostLine = (isDark ? 0.55 : 0.48) * intensity;

      // connections
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = 1 - dist / maxDist;

            const color = lerpColor(
              colors[i % colors.length],
              colors[j % colors.length],
              (colorStep + i / nodeCount) % 1
            );

            // Stronger + crisp lines
            const a = Math.min(0.95, baseLine + alpha * boostLine);
            ctx.strokeStyle = color.replace("rgb", "rgba").replace(")", `,${a})`);
            ctx.lineWidth = Math.max(0.9, 1.05 + nodes[i].z * 0.28);

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // nodes glow
      for (const n of nodes) {
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 18);
        glow.addColorStop(
          0,
          isDark
            ? "rgba(56,189,248,0.95)"
            : "rgba(66,133,244,0.85)"
        );
        glow.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.4 + n.z * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // motion
        n.x += n.vx + (mouse.current.x - width / 2) * 0.000045;
        n.y += n.vy + (mouse.current.y - height / 2) * 0.000045;

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;
      }

      // restore default composite
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
        // screen can wash out on light backgrounds; "lighter" in-canvas already helps
        mixBlendMode: "normal",
        opacity: 0.92,
        filter: "saturate(1.15) contrast(1.18)",
      }}
    />
  );
}
