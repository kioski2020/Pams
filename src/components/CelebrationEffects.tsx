import { useEffect, useState } from 'react';
import { BookOpen, RotateCcw, Sparkles } from 'lucide-react';
import { DEFAULT_BOOK_IMAGES } from '../types/card';
import { HeartEnvelope } from './HeartEnvelope';

interface CelebrationEffectsProps {
  showGift: boolean;
  showFireworks: boolean;
  showHeartCollage: boolean;
  isExitingToGalaxy?: boolean;
  photos: string[];
  envelopeMessage: string;
  accentColor: string;
  onReopenBook: () => void;
  onReplay: () => void;
  onOpenGalaxy: () => void;
}

interface HeartPhotoNode {
  id: number;
  src: string;
  targetX: number;
  targetY: number;
  visible: boolean;
}

const FIREWORK_RAYS = Array.from({ length: 18 }, (_, i) => i * 20);
const TOTAL_HEART_PHOTOS = 30;

interface FloatingBalloonConfig {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  sway: number;
  rotStart: number;
  rotEnd: number;
  opacity: number;
  color: string;
}

const BALLOON_COLORS = ['#ff69b4', '#ff1493', '#fb7185', '#f472b6', '#fda4af'];

const FLOATING_HEART_BALLOONS: FloatingBalloonConfig[] = Array.from(
  { length: 18 },
  (_, i) => ({
    id: i,
    left: `${4 + ((i * 19) % 92)}%`,
    size: [24, 34, 48, 62, 28, 42, 56, 30, 68][i % 9],
    duration: 10.5 + (i % 6) * 1.4,
    delay: -(i * 1.15),
    sway: (i % 2 === 0 ? 1 : -1) * (16 + (i % 4) * 7),
    rotStart: i % 2 === 0 ? -8 : 7,
    rotEnd: i % 2 === 0 ? 8 : -7,
    opacity: 0.28 + (i % 4) * 0.08,
    color: BALLOON_COLORS[i % BALLOON_COLORS.length],
  })
);

export function CelebrationEffects({
  showGift,
  showFireworks,
  showHeartCollage,
  isExitingToGalaxy = false,
  photos,
  envelopeMessage,
  accentColor,
  onReopenBook,
  onReplay,
  onOpenGalaxy,
}: CelebrationEffectsProps) {
  const [heartNodes, setHeartNodes] = useState<HeartPhotoNode[]>([]);
  const [photoOffset, setPhotoOffset] = useState(0);
  const [isShiftingPhotos, setIsShiftingPhotos] = useState(false);

  // Compute responsive parametric heart layout for 30 popping photos
  useEffect(() => {
    if (!showHeartCollage) {
      setHeartNodes([]);
      setPhotoOffset(0);
      setIsShiftingPhotos(false);
      return;
    }

    const validPhotos = photos.filter(Boolean);
    const pool = validPhotos.length > 0 ? validPhotos : [DEFAULT_BOOK_IMAGES.photo1];

    // Preload all 35 photos so simultaneous swaps happen cleanly from browser cache
    pool.forEach((src) => {
      const preload = new Image();
      preload.src = src;
    });

    const computeScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const photoHalf = vw < 640 ? 34 : 58;
      const maxRadiusX = Math.max(100, vw / 2 - photoHalf - 16);
      const maxRadiusY = Math.max(100, vh / 2 - photoHalf - 34);
      // Parametric heart spans ~[-16..16] in X and ~[-17..12] in Y
      return Math.min(16.5, maxRadiusX / 16, maxRadiusY / 17.5);
    };

    const buildNodes = (alreadyVisible: boolean): HeartPhotoNode[] => {
      const scale = computeScale();
      return Array.from({ length: TOTAL_HEART_PHOTOS }, (_, idx) => {
        const t = (idx / TOTAL_HEART_PHOTOS) * Math.PI * 2;
        const sinT = Math.sin(t);
        const cosT = Math.cos(t);
        const targetX = scale * 16 * Math.pow(sinT, 3);
        const targetY =
          -scale * (13 * cosT - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        return {
          id: idx,
          src: pool[idx % pool.length],
          targetX,
          targetY,
          visible: alreadyVisible,
        };
      });
    };

    setHeartNodes(buildNodes(false));

    const timers: number[] = [];
    for (let i = 0; i < TOTAL_HEART_PHOTOS; i++) {
      const timer = window.setTimeout(() => {
        setHeartNodes((prev) =>
          prev.map((node) => (node.id === i ? { ...node, visible: true } : node))
        );
      }, 120 + i * 75);
      timers.push(timer);
    }

    // Periodically rotate through all 35 photos simultaneously across the 30 heart frames
    let swapInterval: number | undefined;
    let swapMidTimer: number | undefined;
    if (pool.length > 1) {
      const startRotationTimer = window.setTimeout(() => {
        const step = pool.length > TOTAL_HEART_PHOTOS ? 6 : 5;
        swapInterval = window.setInterval(() => {
          setIsShiftingPhotos(true);
          swapMidTimer = window.setTimeout(() => {
            setPhotoOffset((prev) => (prev + step) % pool.length);
            setIsShiftingPhotos(false);
          }, 280);
        }, 5200);
      }, 3600);
      timers.push(startRotationTimer);
    }

    const handleResize = () => {
      setHeartNodes(buildNodes(true));
    };
    window.addEventListener('resize', handleResize);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      if (swapInterval !== undefined) window.clearInterval(swapInterval);
      if (swapMidTimer !== undefined) window.clearTimeout(swapMidTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [showHeartCollage, photos]);

  return (
    <>
      {/* Center Gift Celebration GIF */}
      {showGift && (
        <div
          className="fixed top-1/2 left-1/2 z-[30] w-64 h-64 sm:w-80 sm:h-80 max-w-[80vw] max-h-[70vh] pointer-events-none animate-gift-celebration"
          aria-hidden="true"
        >
          <img
            src={DEFAULT_BOOK_IMAGES.gift}
            alt="Birthday celebration"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain drop-shadow-[0_0_28px_rgba(255,105,180,0.45)]"
          />
        </div>
      )}

      {/* Radial Fireworks */}
      {showFireworks && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[25] pointer-events-none overflow-hidden"
        >
          {[
            { top: '34%', left: '28%' },
            { top: '30%', left: '72%' },
            { top: '52%', left: '50%' },
          ].map((pos, burstIdx) => (
            <div
              key={burstIdx}
              className="absolute w-48 h-48 -translate-x-1/2 -translate-y-1/2"
              style={{ top: pos.top, left: pos.left }}
            >
              {FIREWORK_RAYS.map((angle) => (
                <span
                  key={angle}
                  className="firework-ray absolute top-1/2 left-1/2 w-1.5 h-5 rounded-t-full origin-bottom"
                  style={
                    {
                      '--angle': `${angle}deg`,
                      background: `radial-gradient(circle, #ffffff 0%, ${accentColor} 75%, transparent 100%)`,
                      animationDelay: `${burstIdx * 160}ms`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Grand 30-Photo Heart Shape Finale (after book closes) */}
      {showHeartCollage && (
        <div
          className={`fixed inset-0 z-[35] overflow-hidden transition-all duration-350 ease-in ${
            isExitingToGalaxy ? 'opacity-0 scale-115 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          {/* Background Floating Heart Balloons */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
          >
            {FLOATING_HEART_BALLOONS.map((balloon) => (
              <div
                key={balloon.id}
                className="animate-balloon-heart absolute top-0 flex flex-col items-center"
                style={
                  {
                    left: balloon.left,
                    '--dur': `${balloon.duration}s`,
                    '--sway': `${balloon.sway}px`,
                    '--rot-start': `${balloon.rotStart}deg`,
                    '--rot-end': `${balloon.rotEnd}deg`,
                    '--balloon-opacity': balloon.opacity,
                    animationDelay: `${balloon.delay}s`,
                  } as React.CSSProperties
                }
              >
                <svg
                  width={balloon.size}
                  height={balloon.size}
                  viewBox="0 0 32 30"
                  fill="none"
                  style={{
                    filter: `drop-shadow(0 0 10px ${balloon.color}66)`,
                  }}
                >
                  <path
                    d="M16 28.5C16 28.5 2 19.6 2 10.2C2 5.4 5.7 2 10.2 2C12.9 2 15.1 3.4 16 5.2C16.9 3.4 19.1 2 21.8 2C26.3 2 30 5.4 30 10.2C30 19.6 16 28.5 16 28.5Z"
                    fill={balloon.color}
                  />
                  {/* Balloon Glossy Highlight */}
                  <ellipse
                    cx="9.5"
                    cy="8.5"
                    rx="2.3"
                    ry="4"
                    transform="rotate(-24 9.5 8.5)"
                    fill="white"
                    fillOpacity="0.38"
                  />
                </svg>
                {/* Delicate Balloon String */}
                <svg
                  width="12"
                  height={Math.round(balloon.size * 0.8)}
                  viewBox="0 0 12 40"
                  fill="none"
                  className="-mt-1 opacity-40"
                >
                  <path
                    d="M6 0 C8 12, 3 24, 7 40"
                    stroke="#fbcfe8"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ))}
          </div>

          <div className="relative z-[5] h-full w-full pointer-events-none">
            {heartNodes.map((node) => {
              const validPool = photos.length > 0 ? photos : [node.src];
              const activeSrc = validPool[(node.id + photoOffset) % validPool.length] || node.src;
              const nodeScale = !node.visible ? 0 : isShiftingPhotos ? 0.86 : 1;
              const nodeOpacity = !node.visible ? 0 : isShiftingPhotos ? 0.25 : 1;

              return (
                <img
                  key={node.id}
                  src={activeSrc}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="fixed w-14 h-14 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl object-cover border-[3px] sm:border-[5px] border-white bg-white shadow-[0_0_20px_rgba(255,105,180,0.85)]"
                  style={{
                    left: '50%',
                    top: '47%',
                    opacity: nodeOpacity,
                    transform: node.visible
                      ? `translate(calc(-50% + ${node.targetX.toFixed(1)}px), calc(-50% + ${node.targetY.toFixed(1)}px)) scale(${nodeScale})`
                      : 'translate(-50%, -50%) scale(0)',
                    transition:
                      'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease-out',
                  }}
                />
              );
            })}
          </div>

          {/* Center Interactive Heart Envelope & Message Reveal */}
          <HeartEnvelope visible={showHeartCollage} message={envelopeMessage} />

          {/* Clean Bottom Controls for Finale */}
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[45] flex max-w-[95vw] items-center gap-1 sm:gap-2 rounded-full border border-white/15 bg-black/65 px-2 sm:px-3 py-1.5 text-[11px] sm:text-sm text-white/90 backdrop-blur-md shadow-xl">
            <button
              type="button"
              onClick={onReopenBook}
              className="flex min-h-[34px] sm:min-h-[36px] items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1.5 font-medium transition hover:bg-white/10 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5 text-pink-300" />
              <span>Reopen Card</span>
            </button>
            <span aria-hidden="true" className="h-4 w-px bg-white/15 shrink-0" />
            <button
              type="button"
              onClick={onReplay}
              className="flex min-h-[34px] sm:min-h-[36px] items-center gap-1 sm:gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 font-medium text-pink-200 transition hover:bg-white/10 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Replay All</span>
            </button>
            <span aria-hidden="true" className="h-4 w-px bg-white/15 shrink-0" />
            <button
              type="button"
              onClick={onOpenGalaxy}
              className="flex min-h-[34px] sm:min-h-[36px] items-center gap-1 sm:gap-1.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 px-3 sm:px-3.5 py-1.5 font-semibold text-white shadow-[0_0_18px_rgba(255,105,180,0.65)] transition hover:scale-105 hover:brightness-110 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next Surprise</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
