import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface LoadingIntroProps {
  visible: boolean;
  accentColor: string;
  onComplete: () => void;
}

export function LoadingIntro({ visible, accentColor, onComplete }: LoadingIntroProps) {
  const [progress, setProgress] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      setFadingOut(false);
      return;
    }

    setProgress(0);
    setFadingOut(false);

    const start = performance.now();
    const duration = 2400;
    let rafId = 0;
    let doneTimer: number | null = null;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (elapsed < duration) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        setFadingOut(true);
        doneTimer = window.setTimeout(() => {
          onComplete();
        }, 400);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (doneTimer !== null) window.clearTimeout(doneTimer);
    };
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[50] flex flex-col items-center justify-center bg-[#05050a] px-6 text-center transition-opacity duration-400 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-live="polite"
    >
      {/* Soft ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-64 w-64 rounded-full blur-3xl opacity-25"
        style={{ backgroundColor: accentColor }}
      />

      {/* Animated Astral Gold & Rose Heart Loader */}
      <div className="relative mb-7 flex h-24 w-24 items-center justify-center">
        {/* Outer Champagne-Gold Astral Orbit Ring */}
        <span
          aria-hidden="true"
          className="animate-astral-orbit-reverse absolute -inset-2 rounded-full border border-dashed border-amber-200/45"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-amber-200/20"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-200 border-r-pink-400 animate-spin"
          style={{
            animationDuration: '1.25s',
          }}
        />
        {/* 4-Point Star Cardinal Accent */}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="absolute -top-3.5 h-3.5 w-3.5 text-amber-200 drop-shadow-[0_0_6px_rgba(253,230,138,0.85)]"
          fill="currentColor"
        >
          <path d="M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z" />
        </svg>
        <Heart
          className="h-8 w-8 animate-heartbeat"
          style={{ color: accentColor, fill: accentColor }}
        />
      </div>

      {/* Requested Loading Copy */}
      <h1 className="font-display-script text-2xl sm:text-4xl text-white tracking-wide drop-shadow-[0_0_16px_rgba(255,105,180,0.45)]">
        Preparing Something Special
      </h1>
      <p className="mt-2.5 text-sm sm:text-base font-medium text-amber-100/85 tracking-wide">
        Good Thing Takes Time
      </p>

      {/* Smooth Starlight Progress Rail */}
      <div className="relative mt-7 h-1.5 w-56 sm:w-64 overflow-hidden rounded-full bg-white/10 ring-1 ring-amber-200/20">
        <div
          className="h-full rounded-full transition-[width] duration-75"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, #fde68a, ${accentColor}, #ff1493)`,
            boxShadow: `0 0 12px ${accentColor}`,
          }}
        />
      </div>
    </div>
  );
}
