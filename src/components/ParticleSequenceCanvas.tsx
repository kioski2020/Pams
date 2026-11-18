import { useEffect, useRef } from 'react';

interface ParticleSequenceCanvasProps {
  countdown: number;
  sequenceText: string;
  color: string;
  runId: number;
  active: boolean;
  onSequenceComplete: () => void;
}

interface TargetPoint {
  x: number;
  y: number;
  z: number;
  a: number;
}

interface Dot {
  x: number;
  y: number;
  z: number;
  a: number;
  tx: number;
  ty: number;
  tz: number;
  ta: number;
  ease: number;
  settled: boolean;
  queue: TargetPoint[];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const parsed = parseInt(full, 16);
  if (Number.isNaN(parsed)) {
    return { r: 255, g: 105, b: 180 };
  }
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

export function ParticleSequenceCanvas({
  countdown,
  sequenceText,
  color,
  runId,
  active,
  onSequenceComplete,
}: ParticleSequenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completeRef = useRef(onSequenceComplete);
  completeRef.current = onSequenceComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!active) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const shapeCanvas = document.createElement('canvas');
    const shapeCtx = shapeCanvas.getContext('2d');
    if (!shapeCtx) return;

    const rgb = hexToRgb(color);
    let animFrame = 0;
    let destroyed = false;

    const getGap = () => (window.innerWidth < 768 ? 5 : 7);
    const getDotRadius = () => (window.innerWidth < 768 ? 2.2 : 3.2);

    // Pre-render offscreen dot sprites to eliminate expensive per-dot shadowBlur
    const createDotSprite = (settled: boolean): HTMLCanvasElement => {
      const sCanvas = document.createElement('canvas');
      sCanvas.width = 24;
      sCanvas.height = 24;
      const sCtx = sCanvas.getContext('2d')!;
      if (settled) {
        const bg = sCtx.createRadialGradient(12, 12, 4, 12, 12, 12);
        bg.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
        bg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sCtx.fillStyle = bg;
        sCtx.fillRect(0, 0, 24, 24);

        sCtx.beginPath();
        sCtx.arc(12, 12, 6.2, 0, Math.PI * 2);
        sCtx.fillStyle = `rgb(${Math.min(255, rgb.r + 38)}, ${Math.min(255, rgb.g + 48)}, ${Math.min(255, rgb.b + 48)})`;
        sCtx.fill();
      } else {
        sCtx.beginPath();
        sCtx.arc(12, 12, 6, 0, Math.PI * 2);
        sCtx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        sCtx.fill();
      }
      return sCanvas;
    };

    const settledSprite = createDotSprite(true);
    const dustSprite = createDotSprite(false);

    const resizeCanvases = () => {
      const w = Math.max(320, window.innerWidth || 800);
      const h = Math.max(320, window.innerHeight || 600);
      canvas.width = w;
      canvas.height = h;
      shapeCanvas.width = w;
      shapeCanvas.height = h;
      shapeCtx.fillStyle = '#ffffff';
      shapeCtx.textBaseline = 'middle';
      shapeCtx.textAlign = 'center';
    };

    resizeCanvases();

    const dots: Dot[] = [];

    const createDot = (x: number, y: number): Dot => {
      const r = getDotRadius();
      return {
        x,
        y,
        z: r,
        a: 1,
        tx: x,
        ty: y,
        tz: r,
        ta: 1,
        ease: 8,
        settled: true,
        queue: [],
      };
    };

    const buildTextPoints = (label: string): TargetPoint[] => {
      const w = shapeCanvas.width;
      const h = shapeCanvas.height;
      const gap = getGap();
      const dotR = getDotRadius();

      shapeCtx.clearRect(0, 0, w, h);

      const isCompact = w < 768;
      const isNumber = /^\d+$/.test(label);
      const baseFontSize = isCompact ? 220 : 440;
      const fontFamily = '"Plus Jakarta Sans", "Avenir", "Helvetica Neue", Arial, sans-serif';

      shapeCtx.font = `900 ${baseFontSize}px ${fontFamily}`;
      const measured = Math.max(1, shapeCtx.measureText(label).width);

      const maxWidthRatio = 0.84;
      const maxHeightRatio = isNumber ? 0.68 : 0.42;
      const fontSize = Math.max(
        48,
        Math.floor(
          Math.min(
            baseFontSize,
            (w * maxWidthRatio * baseFontSize) / measured,
            h * maxHeightRatio
          )
        )
      );

      shapeCtx.font = `900 ${fontSize}px ${fontFamily}`;
      shapeCtx.fillText(label, w / 2, h / 2);

      const imgData = shapeCtx.getImageData(0, 0, w, h).data;
      const points: TargetPoint[] = [];

      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          const alpha = imgData[(y * w + x) * 4 + 3];
          if (alpha > 90) {
            points.push({ x, y, z: dotR, a: 1 });
          }
        }
      }

      // O(N) Fisher-Yates shuffle so dot transitions disperse uniformly with zero stall
      for (let i = points.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = points[i];
        points[i] = points[j];
        points[j] = tmp;
      }

      return points;
    };

    let activeSettledTargetCount = 0;

    const switchShape = (points: TargetPoint[], isCountdown: boolean) => {
      if (points.length > dots.length) {
        const needed = points.length - dots.length;
        for (let i = 0; i < needed; i++) {
          dots.push(
            createDot(
              canvas.width / 2 + (Math.random() - 0.5) * 140,
              canvas.height / 2 + (Math.random() - 0.5) * 140
            )
          );
        }
      }

      activeSettledTargetCount = points.length;

      for (let d = 0; d < points.length; d++) {
        const target = points[d];
        const dot = dots[d];
        dot.queue.length = 0;
        dot.tx = target.x;
        dot.ty = target.y;
        dot.tz = target.z;
        dot.ta = 1;
        dot.settled = true;
        // Exponential damping speed (per-second): fast crisp snap on numbers, smooth glide on words
        dot.ease = isCountdown ? 12.5 : 8.2;
      }

      for (let i = points.length; i < dots.length; i++) {
        const dot = dots[i];
        dot.queue.length = 0;
        dot.settled = false;
        dot.ease = 3.2;
        dot.tx = Math.random() * canvas.width;
        dot.ty = Math.random() * canvas.height;
        dot.tz = Math.random() * 1.6 + 0.8;
        dot.ta = Math.random() * 0.14 + 0.04;
      }
    };

    // Build timeline steps with generous readable hold times AFTER words lock into place
    interface SequenceStep {
      label: string;
      holdSeconds: number;
      maxAssembleSeconds: number;
      isCountdown: boolean;
    }

    const steps: SequenceStep[] = [];
    const countStart = Math.max(0, Math.min(10, countdown));
    for (let n = countStart; n >= 1; n--) {
      steps.push({
        label: String(n),
        holdSeconds: 1.05,
        maxAssembleSeconds: 0.75,
        isCountdown: true,
      });
    }

    const words = sequenceText
      .split('|')
      .map((w) => w.trim())
      .filter(Boolean);
    const finalWords = words.length > 0 ? words : ['HAPPY', 'BIRTHDAY', 'TO', 'PAMS', '❤'];

    for (const word of finalWords) {
      const isShort = word.length <= 2;
      const baseHold = isShort ? 1.75 : 2.15;
      const extraHold = Math.max(0, (word.length - 4) * 0.09);
      steps.push({
        label: word,
        holdSeconds: baseHold + extraHold,
        maxAssembleSeconds: 1.15,
        isCountdown: false,
      });
    }

    let stepIdx = 0;
    let finishingOut = false;
    let assembleElapsed = 0;
    let holdElapsed = 0;
    let wordFormed = false;
    let finishElapsed = 0;

    const startNextStep = () => {
      if (stepIdx >= steps.length) {
        finishingOut = true;
        finishElapsed = 0;
        switchShape([], false);
        return;
      }
      const current = steps[stepIdx];
      stepIdx++;
      assembleElapsed = 0;
      holdElapsed = 0;
      wordFormed = false;
      switchShape(buildTextPoints(current.label), current.isCountdown);
    };

    startNextStep();

    let lastTime = performance.now();

    const renderLoop = (now: number) => {
      if (destroyed) return;
      // Clamp dt to 50ms so even if browser stalls or lags, particles advance cleanly without skipping hold time
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(0.05, Math.max(0.001, rawDt));

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let settledNearTarget = 0;
      const alphaFactor = 1 - Math.exp(-8.5 * dt);

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dx = dot.tx - dot.x;
        const dy = dot.ty - dot.y;
        const distSq = dx * dx + dy * dy;

        if (distSq > 0.49) {
          const moveFactor = 1 - Math.exp(-dot.ease * dt);
          dot.x += dx * moveFactor;
          dot.y += dy * moveFactor;
        } else {
          dot.x = dot.tx;
          dot.y = dot.ty;
        }

        if (dot.settled && distSq < 9) {
          settledNearTarget++;
        }

        dot.a += (dot.ta - dot.a) * alphaFactor;
        dot.z += (dot.tz - dot.z) * alphaFactor;

        let drawX = dot.x;
        let drawY = dot.y;
        if (dot.settled && distSq <= 9) {
          // Subtle living starlight shimmer while keeping letters razor sharp
          drawX += Math.sin(now * 0.007 + i) * 0.35;
          drawY += Math.cos(now * 0.006 + i * 1.3) * 0.35;
        }

        const diameter = dot.z * (dot.settled ? 3.85 : 3.2);
        const half = diameter * 0.5;
        ctx.globalAlpha = Math.max(0, Math.min(1, dot.a));
        ctx.drawImage(
          dot.settled ? settledSprite : dustSprite,
          drawX - half,
          drawY - half,
          diameter,
          diameter
        );
      }
      ctx.globalAlpha = 1;

      if (finishingOut) {
        finishElapsed += dt;
        if (finishElapsed >= 0.85) {
          if (!destroyed) completeRef.current();
          return;
        }
      } else {
        const currentStep = steps[Math.max(0, stepIdx - 1)];
        if (!wordFormed) {
          assembleElapsed += dt;
          const formedRatio =
            activeSettledTargetCount > 0 ? settledNearTarget / activeSettledTargetCount : 1;
          if (formedRatio >= 0.92 || assembleElapsed >= currentStep.maxAssembleSeconds) {
            wordFormed = true;
          }
        } else {
          holdElapsed += dt;
          if (holdElapsed >= currentStep.holdSeconds) {
            startNextStep();
          }
        }
      }

      animFrame = window.requestAnimationFrame(renderLoop);
    };

    animFrame = window.requestAnimationFrame(renderLoop);

    const handleResize = () => {
      resizeCanvases();
      if (!finishingOut && stepIdx > 0) {
        const current = steps[stepIdx - 1];
        switchShape(buildTextPoints(current.label), current.isCountdown);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      destroyed = true;
      window.cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [countdown, sequenceText, color, runId, active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 z-[15] h-full w-full pointer-events-none transition-opacity duration-500 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}
