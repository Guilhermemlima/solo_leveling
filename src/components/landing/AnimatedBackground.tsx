"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

interface AnimatedBackgroundProps {
  intensity?: "low" | "medium" | "high";
  className?: string;
  /** Skip base gradient and orbs — show only particle canvas (use on top of video backgrounds) */
  transparent?: boolean;
}

const COLORS = [
  "rgba(6, 182, 212,",   // ciano
  "rgba(139, 92, 246,",  // roxo
  "rgba(251, 191, 36,",  // dourado
  "rgba(99, 102, 241,",  // índigo
];

export default function AnimatedBackground({
  intensity = "medium",
  className = "",
  transparent = false,
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const baseCount = { low: 40, medium: 80, high: 150 }[intensity];
    const particleCount = isMobile ? Math.floor(baseCount * 0.35) : baseCount;
    const particles: Particle[] = [];
    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const createParticle = (): Particle => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const maxLife = 100 + Math.random() * 150;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.8 - 0.2,
        radius: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.2,
        color,
        life: 0,
        maxLife,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const progress = p.life / p.maxLife;
        const fadeAlpha = progress < 0.2
          ? (progress / 0.2) * p.alpha
          : progress > 0.8
          ? ((1 - progress) / 0.2) * p.alpha
          : p.alpha;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${fadeAlpha})`;
        ctx.fill();

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        grad.addColorStop(0, `${p.color}${fadeAlpha * 0.4})`);
        grad.addColorStop(1, `${p.color}0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.life >= p.maxLife) {
          particles[i] = createParticle();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {!transparent && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-900/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-900/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-amber-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "3s" }} />
        </>
      )}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
