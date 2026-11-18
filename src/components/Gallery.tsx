import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface GalleryProps {
  photos: string[];
  visible: boolean;
  open: boolean;
  initialZoomIndex?: number | null;
  onClose: () => void;
}

function getTileSpanClass(index: number, total: number): string {
  if (total <= 4) return 'col-span-1 row-span-1';
  if (index === 0) return 'col-span-2 row-span-2';
  const cycle = index % 11;
  if (cycle === 5) return 'col-span-2 row-span-1 sm:row-span-2';
  if (cycle === 8) return 'col-span-2 row-span-1';
  if (cycle === 3) return 'row-span-2';
  return 'col-span-1 row-span-1';
}

function GalleryGridTile({
  src,
  index,
  total,
  onSelect,
}: {
  src: string;
  index: number;
  total: number;
  onSelect: (index: number) => void;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const spanClass = getTileSpanClass(index, total);
  const formattedNum = String(index + 1).padStart(2, '0');

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className={`group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-pink-300/50 hover:shadow-[0_14px_34px_rgba(244,114,182,0.22)] focus-visible:outline-2 focus-visible:outline-pink-300 cursor-pointer ${spanClass}`}
      style={{
        animation: `galleryTileReveal 0.48s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(index * 22, 400)}ms both`,
      }}
      aria-label={`Zoom into memory photo ${index + 1} of ${total}`}
    >
      {!hasError ? (
        <img
          src={src}
          alt={`Memory ${index + 1}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-rose-950/60 via-[#120d1d] to-stone-900/80 p-3 text-center">
          <ImageIcon className="mb-1.5 h-6 w-6 text-pink-300/60" />
          <span className="text-xs font-medium text-pink-100/70">Memory {formattedNum}</span>
        </div>
      )}

      {/* Subtle Bottom Contrast Scrim & Hover Affordance */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-95"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-2.5">
        <span className="font-mono text-[11px] font-medium tracking-wider text-white/85 tabular-nums">
          {formattedNum}
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-pink-100 opacity-85 transition-all duration-300 group-hover:scale-110 group-hover:bg-pink-500/85 group-hover:text-white group-hover:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

export function Gallery({
  photos,
  visible,
  open,
  initialZoomIndex = null,
  onClose,
}: GalleryProps) {
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [isDeepZoomed, setIsDeepZoomed] = useState(false);
  const [lightboxError, setLightboxError] = useState(false);

  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!visible || !open) {
      setZoomedIndex(null);
      setIsDeepZoomed(false);
      return;
    }

    if (
      typeof initialZoomIndex === 'number' &&
      initialZoomIndex >= 0 &&
      initialZoomIndex < photos.length
    ) {
      setZoomedIndex(initialZoomIndex);
    } else {
      setZoomedIndex(null);
    }
    setIsDeepZoomed(false);
  }, [visible, open, initialZoomIndex, photos.length]);

  useEffect(() => {
    setLightboxError(false);
    setIsDeepZoomed(false);

    if (zoomedIndex !== null && thumbStripRef.current) {
      const activeThumb = thumbStripRef.current.children[zoomedIndex] as HTMLElement | undefined;
      activeThumb?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [zoomedIndex]);

  const showPrev = useCallback(() => {
    if (photos.length === 0) return;
    setZoomedIndex((prev) => (prev === null ? 0 : (prev - 1 + photos.length) % photos.length));
  }, [photos.length]);

  const showNext = useCallback(() => {
    if (photos.length === 0) return;
    setZoomedIndex((prev) => (prev === null ? 0 : (prev + 1) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (!visible || !open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedIndex !== null) {
          setZoomedIndex(null);
        } else {
          onClose();
        }
        return;
      }

      if (zoomedIndex !== null) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          showPrev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          showNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, open, zoomedIndex, onClose, showPrev, showNext]);

  if (!visible || !open) return null;

  const activePhotoSrc = zoomedIndex !== null ? photos[zoomedIndex] : null;

  return (
    <div
      className="fixed inset-0 z-[65] flex flex-col bg-[#06050c]/94 backdrop-blur-xl text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Memory photo gallery"
    >
      {/* Top Gallery Header */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3.5 sm:px-8 sm:py-4">
        <div className="min-w-0">
          <h2 className="font-handwriting text-2xl sm:text-3xl font-bold tracking-wide text-pink-100 leading-none">
            Our Memories
          </h2>
          <div className="mt-1 flex items-center gap-2 text-xs text-white/60 tabular-nums">
            <span>{photos.length} moments</span>
            <span aria-hidden="true">·</span>
            <span>Tap any photo to zoom</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex min-h-[42px] items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3.5 text-xs sm:text-sm font-medium text-white/90 transition hover:border-pink-300/50 hover:bg-pink-500/20 cursor-pointer shrink-0 whitespace-nowrap"
          aria-label="Close gallery"
        >
          <X className="h-4 w-4" />
          <span>Close</span>
        </button>
      </header>

      {/* Dynamic Interactive Bento Grid */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-8 sm:py-6">
        {photos.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-white/60">
            <ImageIcon className="mb-2 h-9 w-9 text-pink-300/50" />
            <p className="text-sm">No photos available yet.</p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 auto-rows-[140px] sm:auto-rows-[168px] lg:auto-rows-[184px] grid-flow-dense gap-3 sm:gap-4 pb-8">
            {photos.map((src, idx) => (
              <GalleryGridTile
                key={`${idx}-${src}`}
                src={src}
                index={idx}
                total={photos.length}
                onSelect={(selectedIdx) => setZoomedIndex(selectedIdx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Enlarged Photo Zoom Lightbox */}
      {zoomedIndex !== null && activePhotoSrc && (
        <div
          className="fixed inset-0 z-[75] flex flex-col justify-between bg-black/92 backdrop-blur-md p-3 sm:p-6 animate-[fadeZoomIn_220ms_cubic-bezier(0.16,1,0.3,1)]"
          role="dialog"
          aria-modal="true"
          aria-label={`Zoomed memory ${zoomedIndex + 1} of ${photos.length}`}
          onClick={() => setZoomedIndex(null)}
          onTouchStart={(e) => {
            swipeStartRef.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
            };
          }}
          onTouchEnd={(e) => {
            if (!swipeStartRef.current) return;
            const dx = e.changedTouches[0].clientX - swipeStartRef.current.x;
            const dy = e.changedTouches[0].clientY - swipeStartRef.current.y;
            swipeStartRef.current = null;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
              if (dx < 0) showNext();
              else showPrev();
            }
          }}
        >
          {/* Lightbox Top Bar */}
          <div
            className="flex items-center justify-between gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/75 tabular-nums">
              <span className="font-semibold text-pink-200">
                Memory {String(zoomedIndex + 1).padStart(2, '0')}
              </span>
              <span aria-hidden="true">/</span>
              <span>{String(photos.length).padStart(2, '0')}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDeepZoomed((z) => !z)}
                className="flex h-10 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 text-xs font-medium text-white/90 transition hover:border-pink-300/50 hover:bg-white/20 cursor-pointer whitespace-nowrap"
                aria-label={isDeepZoomed ? 'Reset zoom' : 'Zoom closer'}
              >
                {isDeepZoomed ? (
                  <>
                    <ZoomOut className="h-4 w-4 text-pink-300" />
                    <span className="hidden sm:inline">Fit Screen</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="h-4 w-4 text-pink-300" />
                    <span className="hidden sm:inline">Zoom Closer</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setZoomedIndex(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:border-pink-300/60 hover:bg-rose-600/85 cursor-pointer"
                aria-label="Back to gallery grid"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Center Zoomed Image Stage */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden my-2">
            {photos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="absolute left-1 sm:left-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/90 backdrop-blur-sm transition hover:scale-105 hover:border-pink-300/60 hover:bg-pink-600/75 cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <div
              className="relative flex max-h-[68dvh] max-w-[86vw] items-center justify-center overflow-auto rounded-2xl"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeepZoomed((z) => !z);
              }}
            >
              {!lightboxError ? (
                <img
                  src={activePhotoSrc}
                  alt={`Memory ${zoomedIndex + 1}`}
                  referrerPolicy="no-referrer"
                  onError={() => setLightboxError(true)}
                  className={`max-h-[66dvh] w-auto max-w-full rounded-2xl object-contain shadow-[0_24px_70px_rgba(0,0,0,0.85)] ring-1 ring-white/15 transition-transform duration-300 ease-out select-none ${
                    isDeepZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                  }`}
                  draggable={false}
                />
              ) : (
                <div className="flex h-64 w-64 flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white/65">
                  <ImageIcon className="mb-2 h-8 w-8 text-pink-300/60" />
                  <span className="text-sm">Unable to load photo</span>
                </div>
              )}
            </div>

            {photos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="absolute right-1 sm:right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/90 backdrop-blur-sm transition hover:scale-105 hover:border-pink-300/60 hover:bg-pink-600/75 cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Filmstrip */}
          {photos.length > 1 && (
            <div
              ref={thumbStripRef}
              className="mx-auto flex max-w-full items-center gap-2 overflow-x-auto px-2 py-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((src, idx) => {
                const isActive = idx === zoomedIndex;
                return (
                  <button
                    key={`${idx}-thumb-${src}`}
                    type="button"
                    onClick={() => setZoomedIndex(idx)}
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'scale-105 border-pink-300 ring-2 ring-pink-400/55 opacity-100'
                        : 'border-white/15 opacity-55 hover:opacity-90'
                    }`}
                    aria-label={`Jump to photo ${idx + 1}`}
                  >
                    <img
                      src={src}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
