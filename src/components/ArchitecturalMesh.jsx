import { useEffect, useRef } from "react";

// Helper: interpolate between two hex colors
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

export default function ArchitecturalMesh() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight * 0.9);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // --- Color palette ---
    const colors = isDark
      ? ["#38bdf8", "#818cf8", "#a78bfa"] // cool cyan-violet for dark
      : ["#4285F4", "#34A853", "#FBBC05", "#EA4335"]; // Google 4-color

    // --- Nodes setup ---
    const nodeCount = Math.min(36, Math.floor(width / 40));
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 2 - 1, // depth
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    // --- Animate ---
    function draw() {
      ctx.clearRect(0, 0, width, height);
      const colorStep = (Date.now() % 5000) / 5000;

      // Trails fade
      ctx.fillStyle = isDark ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)";
      ctx.fillRect(0, 0, width, height);

      // --- Draw connections ---
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 170) {
            const alpha = 1 - dist / 170;
            const color = lerpColor(
              colors[i % colors.length],
              colors[j % colors.length],
              (colorStep + i / nodeCount) % 1
            );
            ctx.strokeStyle = color.replace("rgb", "rgba").replace(")", `,${0.12 + alpha * 0.3})`);
            ctx.lineWidth = 0.8 + nodes[i].z * 0.3;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // --- Draw nodes ---
      for (const n of nodes) {
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 10);
        gradient.addColorStop(0, "rgba(66,133,244,0.9)");
        gradient.addColorStop(1, "rgba(66,133,244,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.2 + n.z, 0, Math.PI * 2);
        ctx.fill();

        // Move nodes
        n.x += n.vx + (mouse.current.x - width / 2) * 0.00003;
        n.y += n.vy + (mouse.current.y - height / 2) * 0.00003;

        // Wrap edges
        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;
      }

      requestAnimationFrame(draw);
    }

    draw();

    // --- Resize & Mouse handlers ---
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
        zIndex: 1,
        mixBlendMode: "overlay",
        opacity: 0.85,
        filter: "brightness(1.1)",
      }}
    />
  );
}
