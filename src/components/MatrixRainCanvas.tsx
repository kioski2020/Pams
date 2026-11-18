import { useEffect, useRef } from 'react';

interface MatrixRainCanvasProps {
  text: string;
  color1: string;
  color2: string;
  visible: boolean;
}

export function MatrixRainCanvas({
  text,
  color1,
  color2,
  visible,
}: MatrixRainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const chars = (text.trim() || 'HAPPYBIRTHDAY').split('');
    let drops: number[] = [];
    let delays: number[] = [];
    let started: boolean[] = [];
    let fontSize = 25;
    let maxLength = 40;
    let startTime = Date.now();
    let resizeTimeout: number | null = null;

    const initGrid = () => {
      const w = Math.max(320, window.innerWidth || 800);
      const h = Math.max(320, window.innerHeight || 600);
      canvas.width = w;
      canvas.height = h;
      const isCompact = w < 768;
      fontSize = isCompact ? 13 : 25;
      const columns = Math.max(1, Math.floor(w / fontSize));
      maxLength = Math.floor(h / fontSize) + 2;

      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * maxLength));
      delays = Array.from({ length: columns }, () => Math.random() * 800);
      started = Array.from({ length: columns }, (_, idx) => idx % 3 === 0);
      startTime = Date.now();

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    initGrid();

    const intervalMs = window.innerWidth < 768 ? 48 : 54;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `bold ${fontSize}px Menlo, Consolas, "Liberation Mono", "Courier New", monospace`;

      const now = Date.now();
      for (let pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass === 0 ? color1 : color2;
        for (let i = pass; i < drops.length; i += 2) {
          if (!started[i] && now - startTime >= delays[i]) {
            started[i] = true;
          }
          if (started[i] && drops[i] < maxLength) {
            const glyph = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(glyph, i * fontSize, drops[i] * fontSize);
          }
          if (started[i]) {
            drops[i]++;
          }
          if (drops[i] >= maxLength) {
            drops[i] = 0;
            delays[i] = Math.random() * 450;
            started[i] = true;
          }
        }
      }
    };

    const timer = window.setInterval(draw, intervalMs);

    const handleResize = () => {
      if (resizeTimeout !== null) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        initGrid();
      }, 120);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.clearInterval(timer);
      if (resizeTimeout !== null) window.clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [text, color1, color2, visible]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 z-[1] h-full w-full pointer-events-none transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
