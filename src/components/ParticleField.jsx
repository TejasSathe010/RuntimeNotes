import { useEffect, useRef } from "react";

export default function ParticleField() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight * 0.9);
    const particles = [];

    const numParticles = Math.floor(width / 40);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Color base
    const baseColor = isDark ? [56, 189, 248] : [66, 133, 244]; // cyan vs blue

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 - 1,
        r: Math.random() * 2.2 + 0.5,
        opacity: Math.random() * 0.35 + 0.1,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        const dx = (mouse.current.x - width / 2) * 0.0005;
        const dy = (mouse.current.y - height / 2) * 0.0005;
        p.x += p.vx + dx * p.z;
        p.y += p.vy + dy * p.z;

        if (p.x < -50) p.x = width + 50;
        if (p.x > width + 50) p.x = -50;
        if (p.y < -50) p.y = height + 50;
        if (p.y > height + 50) p.y = -50;

        const [r, g, b] = baseColor;
        ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1.2 - p.z * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight * 0.9;
    };
    const handleMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 0.5,
        mixBlendMode: "screen",
        filter: "blur(6px) brightness(1.3)",
        opacity: 0.6,
      }}
    />
  );
}
