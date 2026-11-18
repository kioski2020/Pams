import { useEffect, useRef } from 'react';

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  rotation: number;
  vr: number;
  color: string;
  isStar: boolean;
}

interface StarBurst {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  rotation: number;
  color: string;
}

const TRAIL_COLORS = ['#fde68a', '#f5d08a', '#ff69b4', '#fda4af', '#ffffff'];
const MAX_PARTICLES = 120;

export function StarlightTrailCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let width = Math.max(320, window.innerWidth || 800);
    let height = Math.max(320, window.innerHeight || 600);
    const particles: SparkleParticle[] = [];
    const bursts: StarBurst[] = [];
    let lastSpawn = 0;
    let rafId = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, window.innerWidth || 800);
      height = Math.max(320, window.innerHeight || 600);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const spawn = (x: number, y: number, count: number, burstSpeed = 1) => {
      for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) {
          particles.shift();
        }
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.35 + Math.random() * 1.1) * burstSpeed;
        particles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.35,
          size: 3 + Math.random() * 4.5,
          alpha: 0.92,
          decay: 0.022 + Math.random() * 0.018,
          rotation: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.08,
          color: TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)],
          isStar: Math.random() > 0.3,
        });
      }
    };

    const spawnStarBurst = (x: number, y: number) => {
      // Subtle expanding starlight halo + 8 glint rays
      if (bursts.length >= 8) bursts.shift();
      bursts.push({
        x,
        y,
        radius: 5,
        maxRadius: 36,
        alpha: 0.62,
        rotation: Math.random() * Math.PI * 0.25,
        color: Math.random() > 0.45 ? '#fde68a' : '#fda4af',
      });

      // Symmetrical gentle radial ring of miniature twinkling 4-point stars
      const ringCount = 10;
      const baseRot = Math.random() * Math.PI * 2;
      for (let i = 0; i < ringCount; i++) {
        if (particles.length >= MAX_PARTICLES) {
          particles.shift();
        }
        const angle = baseRot + (i / ringCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.22;
        const speed = 1.15 + Math.random() * 1.05;
        particles.push({
          x: x + Math.cos(angle) * 4,
          y: y + Math.sin(angle) * 4,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.8 + Math.random() * 3.8,
          alpha: 0.92,
          decay: 0.026 + Math.random() * 0.014,
          rotation: angle,
          vr: (Math.random() - 0.5) * 0.09,
          color: TRAIL_COLORS[i % TRAIL_COLORS.length],
          isStar: true,
        });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawn < 24) return;
      lastSpawn = now;
      spawn(e.clientX, e.clientY, 2, 0.75);
    };

    const handlePointerDown = (e: PointerEvent) => {
      spawnStarBurst(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    const drawFourPointStar = (
      x: number,
      y: number,
      r: number,
      rotation: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      const inner = r * 0.28;
      for (let i = 0; i < 4; i++) {
        const outerAngle = (i * Math.PI) / 2;
        const innerAngle = outerAngle + Math.PI / 4;
        if (i === 0) {
          ctx.moveTo(Math.cos(outerAngle) * r, Math.sin(outerAngle) * r);
        } else {
          ctx.lineTo(Math.cos(outerAngle) * r, Math.sin(outerAngle) * r);
        }
        ctx.lineTo(Math.cos(innerAngle) * inner, Math.sin(innerAngle) * inner);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render subtle expanding tap star-bursts
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.radius += (b.maxRadius - b.radius) * 0.14;
        b.alpha -= 0.032;

        if (b.alpha <= 0.02) {
          bursts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, b.alpha * 0.55);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.stroke();

        // 8 delicate starlight rays radiating from the tap point
        ctx.globalAlpha = Math.max(0, b.alpha * 0.72);
        ctx.beginPath();
        for (let r = 0; r < 8; r++) {
          const ang = b.rotation + (r * Math.PI) / 4;
          const innerR = b.radius * 0.42;
          const outerR = b.radius * (r % 2 === 0 ? 1.12 : 0.85);
          ctx.moveTo(b.x + Math.cos(ang) * innerR, b.y + Math.sin(ang) * innerR);
          ctx.lineTo(b.x + Math.cos(ang) * outerR, b.y + Math.sin(ang) * outerR);
        }
        ctx.stroke();
        ctx.restore();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.965;
        p.vy = p.vy * 0.965 + 0.01;
        p.rotation += p.vr;
        p.alpha -= p.decay;

        if (p.alpha <= 0.02) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        if (p.isStar) {
          drawFourPointStar(p.x, p.y, p.size, p.rotation);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-[58] pointer-events-none"
    />
  );
}
