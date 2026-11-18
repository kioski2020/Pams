import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Image as ImageIcon,
  Maximize2,
  Sparkles,
  X,
} from 'lucide-react';
import type { BookPage } from '../types/card';
import { musicEngine } from '../utils/musicPlayer';

interface FlipBookProps {
  pages: BookPage[];
  visible: boolean;
  hasActiveNote: boolean;
  enableHeart: boolean;
  onActiveContentChange: (content: string) => void;
  onBookFinished: () => void;
  onFirstInteract?: () => void;
}

interface PhysicalSheet {
  sheetIndex: number;
  front?: BookPage;
  back?: BookPage;
}

interface SparkleParticle {
  id: number;
  sx: number;
  sy: number;
  size: number;
  color: string;
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

const WASHI_STYLES = [
  'bg-pink-200/75 border-pink-300/60 -rotate-3',
  'bg-amber-100/80 border-amber-300/60 rotate-2',
  'bg-rose-200/75 border-rose-300/60 -rotate-2',
  'bg-purple-200/75 border-purple-300/60 rotate-3',
];

const AMBIENT_PETALS = [
  { id: 0, left: '6%', size: 14, dur: 12.5, delay: 0, drift: 48, rot: 210, opacity: 0.52, color: '#f9a8d4' },
  { id: 1, left: '14%', size: 10, dur: 14.2, delay: -3.5, drift: -36, rot: -180, opacity: 0.4, color: '#fde68a' },
  { id: 2, left: '23%', size: 16, dur: 11.4, delay: -6.2, drift: 55, rot: 240, opacity: 0.48, color: '#fb7185' },
  { id: 3, left: '36%', size: 11, dur: 15.0, delay: -1.8, drift: -42, rot: 190, opacity: 0.36, color: '#fbcfe8' },
  { id: 4, left: '52%', size: 13, dur: 13.3, delay: -8.1, drift: 38, rot: -220, opacity: 0.45, color: '#f472b6' },
  { id: 5, left: '66%', size: 15, dur: 12.0, delay: -4.4, drift: -50, rot: 250, opacity: 0.5, color: '#fda4af' },
  { id: 6, left: '78%', size: 11, dur: 14.6, delay: -9.5, drift: 42, rot: -195, opacity: 0.42, color: '#fef08a' },
  { id: 7, left: '89%', size: 15, dur: 11.8, delay: -2.4, drift: -46, rot: 215, opacity: 0.5, color: '#f9a8d4' },
];

function CoverFace({ page }: { page?: BookPage }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [page?.image]);

  return (
    <div className="book-page-face absolute inset-0 overflow-hidden rounded-r-xl border border-amber-300/45 bg-gradient-to-br from-[#3a0f24] via-[#260918] to-[#17050f] text-amber-100 select-none z-[2]">
      {/* Subtle blended keepsake photo backdrop */}
      {page?.image && !imgError && (
        <img
          src={page.image}
          alt="For Pams Keepsake Cover"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="absolute inset-0 h-full w-full object-cover opacity-22 grayscale scale-105 [backface-visibility:hidden]"
          draggable={false}
        />
      )}

      {/* Velvety burgundy radial vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_45%_40%,rgba(190,24,93,0.22),rgba(20,4,14,0.88)_78%)]"
      />

      {/* Left Linen Binding Spine Accent */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-black/55 via-amber-900/20 to-transparent border-r border-amber-200/20"
      />

      {/* Double Gold-Foil Filigree Border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3.5 rounded-lg border border-amber-300/45"
      >
        <div className="absolute inset-1.5 rounded border border-amber-200/20" />
        {/* Corner diamond sparkles */}
        <span className="absolute -top-1 -left-1 h-2 w-2 rotate-45 bg-amber-300/80" />
        <span className="absolute -top-1 -right-1 h-2 w-2 rotate-45 bg-amber-300/80" />
        <span className="absolute -bottom-1 -left-1 h-2 w-2 rotate-45 bg-amber-300/80" />
        <span className="absolute -bottom-1 -right-1 h-2 w-2 rotate-45 bg-amber-300/80" />
      </div>

      {/* Crimson Satin Ribbon Bookmark peeking on Right Edge */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-6 h-full w-3.5 bg-gradient-to-b from-rose-600/80 via-pink-700/70 to-rose-900/85 shadow-md"
      />

      {/* Centered Gold-Foil Embossed Cover Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-7 py-10 text-center">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/80">
          <Sparkles className="h-3 w-3 text-amber-300" />
          <span>Birthday Edition</span>
          <Sparkles className="h-3 w-3 text-amber-300" />
        </div>

        <div className="space-y-2.5">
          <p className="font-handwriting gold-foil-text text-5xl leading-none drop-shadow-[0_2px_10px_rgba(251,191,36,0.28)]">
            For Pams
          </p>
          <div className="mx-auto flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-300/60" />
            <Heart className="h-3.5 w-3.5 text-pink-300 fill-pink-300" />
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-300/60" />
          </div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-pink-100/75">
            Princess Ariane Mikaela Silla
          </p>
        </div>

        {/* Interactive Crimson & Gold Wax Seal */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 via-rose-700 to-rose-950 shadow-[0_6px_18px_rgba(0,0,0,0.55),inset_0_2px_4px_rgba(255,220,230,0.45)] ring-2 ring-amber-300/55">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/45 bg-rose-800/70">
              <span className="font-handwriting text-base font-bold text-amber-100">
                P ♥
              </span>
            </div>
          </div>
          <span className="text-[10px] font-medium tracking-[0.16em] uppercase text-amber-200/80">
            Tap to break the seal
          </span>
        </div>
      </div>
    </div>
  );
}

function ScrapbookPageFace({
  page,
  side,
  pageNumber,
  isCover,
  isBackCover,
  onInspectPhoto,
}: {
  page?: BookPage;
  side: 'front' | 'back';
  pageNumber: number;
  isCover: boolean;
  isBackCover: boolean;
  onInspectPhoto: (page: BookPage, label: string) => void;
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [page?.image]);

  if (isCover) {
    return <CoverFace page={page} />;
  }

  const chapterRoman = ROMAN_NUMERALS[(pageNumber - 1) % ROMAN_NUMERALS.length] || String(pageNumber);
  const memoryLabel = isBackCover ? 'Forever Memories' : `Memory ${chapterRoman}`;
  const polaroidTilt =
    pageNumber % 2 === 0 ? '-rotate-[1.4deg]' : 'rotate-[1.4deg]';
  const washiClass = WASHI_STYLES[pageNumber % WASHI_STYLES.length];

  return (
    <div
      className={`book-page-face parchment-paper absolute inset-0 overflow-hidden border border-stone-300/80 ${
        side === 'front'
          ? 'rounded-r-xl z-[2]'
          : 'book-page-back rounded-l-xl'
      }`}
    >
      {/* Realistic Inner Book Binding Spine Shadow */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 z-10 w-8 ${
          side === 'front'
            ? 'left-0 bg-gradient-to-r from-black/22 via-black/[0.06] to-transparent'
            : 'right-0 bg-gradient-to-l from-black/22 via-black/[0.06] to-transparent'
        }`}
      />

      {/* Delicate Hairline Scrapbook Inner Border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 rounded border border-rose-300/40"
      />

      <div className="relative z-[5] flex h-full w-full flex-col items-center justify-between px-6 py-5">
        {/* Top Chapter Header */}
        <div className="flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-800/55">
          <span>{memoryLabel}</span>
          <span className="flex items-center gap-1 text-amber-700/60">
            <Sparkles className="h-2.5 w-2.5" />
            <span>{isBackCover ? 'Fin' : `#0${pageNumber}`}</span>
          </span>
        </div>

        {/* Tilted Polaroid Photo Frame with Washi Tape */}
        <div
          className={`relative w-full max-w-[218px] bg-white p-2 pb-6 shadow-[0_8px_20px_rgba(88,28,45,0.16)] ring-1 ring-stone-200/90 transition-transform duration-300 ${polaroidTilt}`}
        >
          {/* Washi Tape Accent Strip (no backdrop-blur inside 3D-rotated faces) */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 h-4 w-16 rounded-[2px] border shadow-xs ${washiClass}`}
          />

          <div className="relative h-[222px] w-full overflow-hidden bg-stone-100">
            {!page?.image ? (
              <div className="h-full w-full bg-rose-50/40" />
            ) : !imgError ? (
              <img
                src={page.image}
                alt={page.content || memoryLabel}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover select-none [backface-visibility:hidden]"
                draggable={false}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-stone-50 to-pink-50 p-4 text-center text-stone-400">
                <ImageIcon className="mb-2 h-7 w-7 text-pink-300" />
                <span className="font-handwriting text-base text-stone-500">
                  {memoryLabel}
                </span>
              </div>
            )}

            {/* Quick Lightbox Zoom Button */}
            {page?.image && !imgError && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInspectPhoto(page, memoryLabel);
                }}
                className="absolute right-1.5 bottom-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white/95 transition hover:scale-110 hover:bg-pink-600 cursor-pointer"
                aria-label={`View ${memoryLabel} full size`}
                title="View photo up close"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Polaroid Bottom Handwritten Footer */}
          <div className="mt-1.5 flex items-center justify-between px-0.5">
            <span className="font-handwriting truncate text-base text-rose-900/85">
              {page?.caption || (isBackCover ? 'Forever yours ♥' : `Sweet Memory #${pageNumber}`)}
            </span>
            <Heart className="ml-1.5 h-3 w-3 shrink-0 text-pink-500/80 fill-pink-400/75" />
          </div>
        </div>

        {/* Bottom Subtle Keepsake Mark */}
        <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-stone-500/75">
          {isBackCover ? 'With all my love ♥' : 'Tap to turn page'}
        </p>
      </div>
    </div>
  );
}

export function FlipBook({
  pages,
  visible,
  hasActiveNote,
  enableHeart,
  onActiveContentChange,
  onBookFinished,
  onFirstInteract,
}: FlipBookProps) {
  const [flippedCount, setFlippedCount] = useState(0);
  const [bookScale, setBookScale] = useState(1);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);
  const [activeFlip, setActiveFlip] = useState<{
    sheetIndex: number;
    dir: 'forward' | 'backward';
  } | null>(null);
  const [inspectedPhoto, setInspectedPhoto] = useState<{ page: BookPage; label: string } | null>(
    null
  );

  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const sparkleIdRef = useRef(0);
  const sparkleClearTimerRef = useRef<number | null>(null);
  const flipTimerRef = useRef<number | null>(null);

  const sheets = useMemo<PhysicalSheet[]>(() => {
    const result: PhysicalSheet[] = [];
    for (let i = 0; i < pages.length; i += 2) {
      result.push({
        sheetIndex: i / 2,
        front: pages[i],
        back: pages[i + 1],
      });
    }
    return result;
  }, [pages]);

  const totalSheets = sheets.length;

  useEffect(() => {
    if (visible) {
      setFlippedCount(0);
      setActiveFlip(null);
      setInspectedPhoto(null);
    }
  }, [pages, visible]);

  useEffect(() => {
    return () => {
      if (sparkleClearTimerRef.current !== null) {
        window.clearTimeout(sparkleClearTimerRef.current);
      }
      if (flipTimerRef.current !== null) {
        window.clearTimeout(flipTimerRef.current);
      }
    };
  }, []);

  // Responsive scaling for mobile & desktop (preserving clearance for Memory Note + Controls)
  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxWidthScale = (vw - 36) / 600;
      const maxHeightScale = (vh - (hasActiveNote ? 295 : 195)) / 400;
      const nextScale = Math.min(1.04, Math.max(0.45, Math.min(maxWidthScale, maxHeightScale)));
      setBookScale(nextScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [hasActiveNote]);

  // Sync active spread's handwritten content to TypewriterNote
  useEffect(() => {
    if (!visible) {
      onActiveContentChange('');
      return;
    }

    if (flippedCount === 0) {
      onActiveContentChange(sheets[0]?.front?.content || '');
      return;
    }

    const leftBackContent = sheets[flippedCount - 1]?.back?.content || '';
    const rightFrontContent = sheets[flippedCount]?.front?.content || '';
    const combined = [leftBackContent, rightFrontContent].filter(Boolean).join('\n');
    onActiveContentChange(combined);
  }, [flippedCount, sheets, visible, onActiveContentChange]);

  const emitSparkles = useCallback((isCoverUnseal = false) => {
    const palette = ['#ff69b4', '#fde047', '#ffffff', '#fda4af', '#fbbf24'];
    const count = isCoverUnseal ? 14 : 9;
    const next: SparkleParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = (isCoverUnseal ? 75 : 55) + Math.random() * 85;
      next.push({
        id: ++sparkleIdRef.current,
        sx: Math.cos(angle) * dist,
        sy: Math.sin(angle) * dist - 14,
        size: (isCoverUnseal ? 10 : 7) + Math.random() * 7,
        color: palette[i % palette.length],
      });
    }
    setSparkles(next);
    if (sparkleClearTimerRef.current !== null) {
      window.clearTimeout(sparkleClearTimerRef.current);
    }
    sparkleClearTimerRef.current = window.setTimeout(() => {
      setSparkles([]);
    }, 680);
  }, []);

  const triggerFlipMotion = useCallback(
    (sheetIndex: number, dir: 'forward' | 'backward') => {
      setActiveFlip({ sheetIndex, dir });
      if (flipTimerRef.current !== null) {
        window.clearTimeout(flipTimerRef.current);
      }
      flipTimerRef.current = window.setTimeout(() => {
        setActiveFlip(null);
      }, 860);
    },
    []
  );

  const nextPage = useCallback(() => {
    onFirstInteract?.();
    if (flippedCount >= totalSheets) {
      if (enableHeart) {
        musicEngine.playWaxSealSound();
        onActiveContentChange('');
        onBookFinished();
      }
      return;
    }

    if (flippedCount === 0) {
      musicEngine.playWaxSealSound();
      emitSparkles(true);
    } else {
      musicEngine.playPageFlipSound();
      emitSparkles(false);
    }
    triggerFlipMotion(flippedCount, 'forward');
    setFlippedCount((prev) => prev + 1);
  }, [
    flippedCount,
    totalSheets,
    enableHeart,
    onActiveContentChange,
    onBookFinished,
    onFirstInteract,
    emitSparkles,
    triggerFlipMotion,
  ]);

  const prevPage = useCallback(() => {
    onFirstInteract?.();
    if (flippedCount > 0) {
      musicEngine.playPageFlipSound();
      emitSparkles(false);
      triggerFlipMotion(flippedCount - 1, 'backward');
      setFlippedCount((prev) => prev - 1);
    }
  }, [flippedCount, onFirstInteract, emitSparkles, triggerFlipMotion]);

  const jumpToSheet = useCallback(
    (targetCount: number) => {
      onFirstInteract?.();
      const clamped = Math.max(0, Math.min(totalSheets, targetCount));
      if (clamped === flippedCount) return;
      if (flippedCount === 0 && clamped > 0) {
        musicEngine.playWaxSealSound();
        emitSparkles(true);
      } else {
        musicEngine.playPageFlipSound();
        emitSparkles(false);
      }
      const movedSheet = clamped > flippedCount ? clamped - 1 : clamped;
      triggerFlipMotion(movedSheet, clamped > flippedCount ? 'forward' : 'backward');
      setFlippedCount(clamped);
    },
    [flippedCount, totalSheets, onFirstInteract, emitSparkles, triggerFlipMotion]
  );

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inspectedPhoto) {
        if (e.key === 'Escape') {
          setInspectedPhoto(null);
        }
        return;
      }
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, inspectedPhoto, nextPage, prevPage]);

  const handlePointerDown = (x: number, y: number) => {
    dragStartRef.current = { x, y, time: Date.now() };
  };

  const handlePointerEnd = (x: number, y: number) => {
    if (!dragStartRef.current) return;
    const dx = x - dragStartRef.current.x;
    const dy = y - dragStartRef.current.y;
    const dt = Math.max(1, Date.now() - dragStartRef.current.time);
    dragStartRef.current = null;

    if (Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) > 45 || Math.abs(dx) / dt > 0.45)) {
      if (dx < 0) nextPage();
      else prevPage();
    }
  };

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
    setTilt({
      rx: -ny * 5.2,
      ry: nx * 5.8,
    });
  };

  const handleStageMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const progressLabel =
    flippedCount === 0
      ? 'Cover • Wax Seal'
      : flippedCount >= totalSheets
        ? 'Closing Page'
        : `Spread ${flippedCount} of ${Math.max(1, totalSheets - 1)}`;

  return (
    <div
      className={`fixed inset-0 z-[20] flex flex-col items-center justify-center px-3 transition-all duration-700 ${
        visible
          ? 'opacity-100 scale-100 pointer-events-auto'
          : 'opacity-0 scale-95 pointer-events-none'
      }`}
    >
      {/* Ambient Floating Rose Petals & Bokeh Around the Book */}
      {visible && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-[1]">
          {AMBIENT_PETALS.map((p) => (
            <span
              key={p.id}
              className="animate-petal-drift absolute -top-6 rounded-full"
              style={
                {
                  left: p.left,
                  width: `${p.size}px`,
                  height: `${Math.round(p.size * 0.72)}px`,
                  background: p.color,
                  borderRadius: '65% 35% 70% 30% / 55% 45% 60% 40%',
                  boxShadow: `0 0 12px ${p.color}66`,
                  '--petal-dur': `${p.dur}s`,
                  '--petal-drift': `${p.drift}px`,
                  '--petal-rot': `${p.rot}deg`,
                  '--petal-opacity': p.opacity,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Scaled 3D Scrapbook Container */}
      <div
        className="relative z-[5] flex items-center justify-center transition-transform duration-500"
        style={{
          marginTop: hasActiveNote ? `${Math.round(135 * bookScale)}px` : '0px',
          width: `${Math.round(600 * bookScale)}px`,
          height: `${Math.round(400 * bookScale)}px`,
        }}
      >
        <div
          className="book-3d relative shrink-0"
          style={{
            width: 600,
            height: 400,
            transform: `scale(${bookScale})`,
            transformOrigin: 'center center',
          }}
          onMouseMove={handleStageMouseMove}
          onMouseLeave={handleStageMouseLeave}
        >
          {/* Interactive Pointer-Tilt & Cover-to-Spread Center-Gliding Stage */}
          <div
            className="book-stage relative h-[400px] w-[600px] select-none cursor-grab active:cursor-grabbing"
            style={{
              transform: `translateX(${
                flippedCount === 0 ? -150 : flippedCount >= totalSheets ? 150 : 0
              }px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            }}
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseUp={(e) => handlePointerEnd(e.clientX, e.clientY)}
            onTouchStart={(e) =>
              handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)
            }
            onTouchEnd={(e) =>
              handlePointerEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
            }
          >
            {/* Dynamic Aura Tracking Visible Cover vs Open Spread */}
            <div
              aria-hidden="true"
              className="book-glow-aura absolute -top-7 -bottom-7 -z-10 rounded-3xl transition-all duration-700"
              style={{
                left: flippedCount === 0 ? 276 : -24,
                right: flippedCount >= totalSheets ? 276 : -24,
              }}
            />
            <div
              aria-hidden="true"
              className="book-ethereal-bloom pointer-events-none absolute -top-12 -bottom-12 -z-10 rounded-[36px]"
              style={{
                left: flippedCount === 0 ? 256 : -44,
                right: flippedCount >= totalSheets ? 256 : -44,
              }}
            />

            {/* Central Spine Binding Ridge visible when opened */}
            {flippedCount > 0 && flippedCount < totalSheets && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 z-[150] h-full w-3 bg-gradient-to-r from-black/25 via-amber-200/25 to-black/25"
              />
            )}

            {/* Page-Turn Sparkle Burst Emitter */}
            {sparkles.length > 0 && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 z-[200] -translate-x-1/2 -translate-y-1/2"
              >
                {sparkles.map((sp) => (
                  <span
                    key={sp.id}
                    className="animate-book-sparkle absolute"
                    style={
                      {
                        width: `${sp.size}px`,
                        height: `${sp.size}px`,
                        '--sx': `${sp.sx}px`,
                        '--sy': `${sp.sy}px`,
                      } as React.CSSProperties
                    }
                  >
                    <svg viewBox="0 0 24 24" className="h-full w-full" fill={sp.color}>
                      <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
                    </svg>
                  </span>
                ))}
              </div>
            )}

            {sheets.map((sheet) => {
              const isFlipped = sheet.sheetIndex < flippedCount;
              const isActivelyTurning = activeFlip?.sheetIndex === sheet.sheetIndex;
              const zIndex = isActivelyTurning
                ? totalSheets + 25
                : isFlipped
                  ? sheet.sheetIndex + 1
                  : totalSheets - sheet.sheetIndex;

              return (
                <div
                  key={sheet.sheetIndex}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    isFlipped
                      ? `Flip back to sheet ${sheet.sheetIndex + 1}`
                      : `Turn to sheet ${sheet.sheetIndex + 2}`
                  }
                  onClick={() => {
                    if (flippedCount === totalSheets && enableHeart) {
                      nextPage();
                    } else if (isFlipped) {
                      prevPage();
                    } else {
                      nextPage();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (flippedCount === totalSheets && enableHeart) {
                        nextPage();
                      } else if (isFlipped) {
                        prevPage();
                      } else {
                        nextPage();
                      }
                    }
                  }}
                  style={{ zIndex }}
                  className={`book-page absolute top-0 right-0 h-[400px] w-[300px] cursor-pointer focus-visible:outline-2 focus-visible:outline-pink-400 ${
                    isFlipped ? 'flipped' : ''
                  }`}
                >
                  <ScrapbookPageFace
                    page={sheet.front}
                    side="front"
                    pageNumber={sheet.sheetIndex * 2}
                    isCover={sheet.sheetIndex === 0}
                    isBackCover={false}
                    onInspectPhoto={(page, label) => setInspectedPhoto({ page, label })}
                  />
                  <ScrapbookPageFace
                    page={sheet.back}
                    side="back"
                    pageNumber={sheet.sheetIndex * 2 + 1}
                    isCover={false}
                    isBackCover={sheet.sheetIndex === totalSheets - 1}
                    onInspectPhoto={(page, label) => setInspectedPhoto({ page, label })}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrapbook Navigation Bar & Chapter Dots */}
      <div className="relative z-[6] mt-4 flex flex-col items-center gap-2.5">
        <div className="flex items-center gap-2 rounded-full border border-pink-300/25 bg-[#0c0814]/82 px-2.5 py-1.5 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
          <button
            type="button"
            onClick={prevPage}
            disabled={flippedCount === 0}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-pink-100 transition hover:bg-pink-500/30 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            aria-label="Previous page"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5 px-1">
            {Array.from({ length: totalSheets + 1 }, (_, i) => {
              const active = i === flippedCount;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => jumpToSheet(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    active
                      ? 'w-5 bg-gradient-to-r from-pink-400 to-amber-300 shadow-[0_0_8px_rgba(244,114,182,0.8)]'
                      : 'w-2 bg-white/25 hover:bg-white/50'
                  }`}
                  aria-label={i === 0 ? 'Go to cover' : `Go to spread ${i}`}
                />
              );
            })}
          </div>

          <span className="hidden sm:inline text-[11px] font-medium tracking-wide text-pink-100/80 px-1.5">
            {progressLabel}
          </span>

          <button
            type="button"
            onClick={nextPage}
            disabled={flippedCount >= totalSheets && !enableHeart}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-pink-100 transition hover:bg-pink-500/30 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            aria-label="Next page"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Final Surprise Reveal Prompt or Hint */}
        {flippedCount === totalSheets && enableHeart ? (
          <button
            type="button"
            onClick={nextPage}
            className="animate-pulse rounded-full border border-pink-300/60 bg-gradient-to-r from-pink-500/35 to-rose-500/35 px-5 py-2 text-xs sm:text-sm font-semibold text-pink-100 shadow-[0_0_26px_rgba(255,105,180,0.5)] backdrop-blur-md transition hover:brightness-110 cursor-pointer"
          >
            Tap again to reveal your surprise 💗
          </button>
        ) : (
          <p className="text-[11px] text-white/65">
            {flippedCount === 0
              ? 'Tap the wax seal or swipe left to open Pams’ keepsake book'
              : 'Tap pages, arrows, or swipe to flip • Tap zoom icon on any photo'}
          </p>
        )}
      </div>

      {/* Photo Memory Lightbox Modal */}
      {inspectedPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          onClick={() => setInspectedPhoto(null)}
        >
          <div
            className="relative flex max-h-[88vh] max-w-md flex-col items-center rounded-2xl bg-[#fdf8f3] p-3 pb-5 text-stone-800 shadow-[0_24px_60px_rgba(0,0,0,0.65)] ring-1 ring-amber-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setInspectedPhoto(null)}
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg transition hover:bg-rose-500 cursor-pointer"
              aria-label="Close photo view"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={inspectedPhoto.page.image}
              alt={inspectedPhoto.label}
              referrerPolicy="no-referrer"
              className="max-h-[64vh] w-auto rounded-lg object-contain"
            />
            <div className="mt-3 text-center px-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-600/75">
                {inspectedPhoto.label}
              </p>
              {inspectedPhoto.page.caption && (
                <p className="font-handwriting text-2xl text-rose-900">
                  {inspectedPhoto.page.caption}
                </p>
              )}
              {inspectedPhoto.page.content && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm">
                  {inspectedPhoto.page.content}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
