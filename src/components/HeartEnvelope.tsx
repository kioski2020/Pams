import { useEffect, useRef, useState } from 'react';
import { Heart, X } from 'lucide-react';

interface HeartEnvelopeProps {
  visible: boolean;
  message: string;
}

function HeartWaxSeal({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-pink-400 via-rose-500 to-rose-600 shadow-[0_3px_12px_rgba(225,29,72,0.55),inset_0_1px_2px_rgba(255,255,255,0.55)] ring-2 ring-amber-200/85 ${
        compact ? 'h-7 w-7 sm:h-10 sm:w-10' : 'h-12 w-12 sm:h-14 sm:w-14'
      }`}
    >
      <Heart
        className={`${
          compact ? 'h-3.5 w-3.5 sm:h-5 sm:w-5' : 'h-6 w-6 sm:h-7 sm:w-7'
        } fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]`}
      />
    </div>
  );
}

function AstralCorner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const posClasses = {
    tl: 'top-2 left-2',
    tr: 'top-2 right-2 rotate-90',
    br: 'bottom-2 right-2 rotate-180',
    bl: 'bottom-2 left-2 -rotate-90',
  }[position];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 28 28"
      className={`pointer-events-none absolute h-6 w-6 text-amber-500/65 ${posClasses}`}
      fill="none"
    >
      <path d="M2 18 V4 Q2 2 4 2 H18" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M6 6 L7 8.5 L9.5 9.5 L7 10.5 L6 13 L5 10.5 L2.5 9.5 L5 8.5 Z" fill="currentColor" />
    </svg>
  );
}

export function HeartEnvelope({ visible, message }: HeartEnvelopeProps) {
  const [centerReady, setCenterReady] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [envelopeEntered, setEnvelopeEntered] = useState(false);
  const [flapOpen, setFlapOpen] = useState(false);
  const [flapBehind, setFlapBehind] = useState(false);
  const [letterOut, setLetterOut] = useState(false);
  const [letterExpanded, setLetterExpanded] = useState(false);

  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    clearTimers();
    if (!visible) {
      setCenterReady(false);
      setIsModalOpen(false);
      setEnvelopeEntered(false);
      setFlapOpen(false);
      setFlapBehind(false);
      setLetterOut(false);
      setLetterExpanded(false);
      return;
    }

    const readyTimer = window.setTimeout(() => {
      setCenterReady(true);
    }, 1350);
    timersRef.current.push(readyTimer);

    return clearTimers;
  }, [visible]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const handleOpen = () => {
    if (isModalOpen) return;
    clearTimers();
    setIsModalOpen(true);
    setEnvelopeEntered(false);
    setFlapOpen(false);
    setFlapBehind(false);
    setLetterOut(false);
    setLetterExpanded(false);

    const t1 = window.setTimeout(() => setEnvelopeEntered(true), 30);
    const t2 = window.setTimeout(() => setFlapOpen(true), 380);
    const t3 = window.setTimeout(() => setFlapBehind(true), 700);
    const t4 = window.setTimeout(() => setLetterOut(true), 820);
    const t5 = window.setTimeout(() => setLetterExpanded(true), 1320);

    timersRef.current.push(t1, t2, t3, t4, t5);
  };

  const handleClose = () => {
    clearTimers();
    setLetterExpanded(false);
    setLetterOut(false);

    const t1 = window.setTimeout(() => {
      setFlapBehind(false);
      setFlapOpen(false);
    }, 220);

    const t2 = window.setTimeout(() => {
      setEnvelopeEntered(false);
    }, 520);

    const t3 = window.setTimeout(() => {
      setIsModalOpen(false);
    }, 760);

    timersRef.current.push(t1, t2, t3);
  };

  if (!visible) return null;

  const trimmedMessage = message.trim() || 'Happy Birthday! I love you always. ❤️';

  return (
    <>
      {/* Center Closed Heart Envelope inside the 30-Photo Heart */}
      <div
        className={`fixed left-1/2 top-[49%] -translate-x-1/2 -translate-y-1/2 z-[40] flex flex-col items-center transition-all duration-700 ${
          centerReady && !isModalOpen
            ? 'opacity-100 scale-100 animate-envelope-float pointer-events-auto'
            : 'opacity-0 scale-50 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Open birthday message envelope"
          className="group relative flex flex-col items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-pink-300 rounded-xl"
        >
          {/* Ambient pink aura */}
          <div
            aria-hidden="true"
            className="absolute -inset-3 rounded-2xl bg-pink-500/30 blur-xl transition duration-300 group-hover:bg-pink-400/45"
          />

          {/* Compact Envelope Body */}
          <div className="relative h-[68px] w-[100px] sm:h-[108px] sm:w-[160px] overflow-hidden rounded-lg sm:rounded-xl border border-rose-200/90 bg-gradient-to-br from-[#fff9fb] via-[#ffedf3] to-[#ffd6e5] shadow-[0_10px_28px_rgba(255,105,180,0.45)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
            <svg
              viewBox="0 0 160 108"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full pointer-events-none"
              aria-hidden="true"
            >
              <polygon points="0,0 80,58 0,108" fill="#ffe4ee" />
              <polygon points="160,0 80,58 160,108" fill="#ffe0ec" />
              <polygon
                points="0,108 80,46 160,108"
                fill="#fff5f8"
                stroke="#f4c4d6"
                strokeWidth="1.2"
              />
              <polygon
                points="0,0 160,0 80,62"
                fill="#ffdde9"
                stroke="#f2b8ce"
                strokeWidth="1.4"
              />
            </svg>

            {/* Centered Heart Design on Middle of Envelope */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-transform duration-300 group-hover:scale-110">
              <HeartWaxSeal compact />
            </div>
          </div>

          <span className="mt-2 rounded-full bg-black/55 px-2.5 py-0.5 text-[10px] sm:text-xs font-medium tracking-wide text-pink-100 backdrop-blur-sm shadow border border-pink-300/25 whitespace-nowrap">
            Tap to open 💌
          </span>
        </button>
      </div>

      {/* Interactive 3D Envelope Opening Stage & Letter Reveal */}
      {isModalOpen && (
        <div
          className={`fixed inset-0 z-[55] flex items-center justify-center p-4 transition-all duration-500 ${
            envelopeEntered ? 'bg-black/70 backdrop-blur-sm opacity-100' : 'bg-black/0 opacity-0'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Birthday letter"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative flex w-full max-w-md min-h-[440px] items-center justify-center">
            {/* 3D Animated Envelope */}
            <div
              className={`envelope-3d relative h-[190px] w-[290px] sm:h-[235px] sm:w-[360px] transition-all duration-700 ease-out ${
                !envelopeEntered
                  ? 'opacity-0 scale-50 translate-y-0'
                  : letterExpanded
                    ? 'opacity-85 scale-75 translate-y-[150px] sm:translate-y-[175px]'
                    : 'opacity-100 scale-100 translate-y-0'
              }`}
            >
              {/* Envelope Interior Back Wall */}
              <div className="absolute inset-0 rounded-xl border border-rose-200/90 bg-gradient-to-b from-[#f8d7e4] to-[#ffeaf1] shadow-[0_20px_50px_rgba(0,0,0,0.45)]" />

              {/* Rising Mini Letter Card inside the Envelope Pocket */}
              <div
                className={`absolute left-4 right-4 top-3 bottom-3 rounded-lg border border-rose-200/80 bg-gradient-to-b from-[#fffdf9] to-[#fff5f7] p-4 shadow-md transition-all duration-700 ease-out ${
                  letterExpanded ? 'opacity-0' : 'opacity-100'
                }`}
                style={{
                  zIndex: 15,
                  transform: letterOut
                    ? 'translateY(-68%) scale(1.03)'
                    : 'translateY(6%) scale(0.95)',
                }}
              >
                <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                  <Heart className="h-5 w-5 fill-rose-400 text-rose-400" />
                  <p className="font-handwriting line-clamp-3 text-base sm:text-lg text-[#6b3410]">
                    {trimmedMessage}
                  </p>
                </div>
              </div>

              {/* Front Envelope Pocket */}
              <svg
                viewBox="0 0 360 235"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full rounded-xl pointer-events-none"
                style={{ zIndex: 20 }}
                aria-hidden="true"
              >
                <polygon points="0,0 180,126 0,235" fill="#ffe3ee" />
                <polygon points="360,0 180,126 360,235" fill="#ffdfeb" />
                <polygon
                  points="0,235 180,104 360,235"
                  fill="#fff5f8"
                  stroke="#f4bfd3"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Top Hinged 3D Flap + Centered Heart Seal */}
              <div
                className="envelope-flap-3d absolute top-0 left-0 right-0 h-[55%] pointer-events-none"
                style={{
                  zIndex: flapBehind ? 5 : 30,
                  transform: flapOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
                }}
              >
                <svg
                  viewBox="0 0 360 130"
                  preserveAspectRatio="none"
                  className="h-full w-full drop-shadow-[0_4px_6px_rgba(190,24,93,0.12)]"
                  aria-hidden="true"
                >
                  <polygon
                    points="0,0 360,0 180,126"
                    fill="#ffdbe8"
                    stroke="#f1b2ca"
                    strokeWidth="1.5"
                  />
                </svg>

                {/* Heart Design right at the center of the closed envelope */}
                <div
                  className={`absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/3 transition-opacity duration-300 ${
                    flapBehind ? 'opacity-25' : 'opacity-100'
                  }`}
                >
                  <HeartWaxSeal />
                </div>
              </div>
            </div>

            {/* Expanded Readable Letter Sheet (glides seamlessly into view) */}
            <div
              className={`content-display-card absolute z-30 w-[min(92vw,520px)] rounded-2xl border border-amber-300/60 ring-1 ring-inset ring-amber-400/25 px-5 py-6 sm:px-9 sm:py-7 text-center transition-all duration-700 ease-out ${
                letterExpanded
                  ? 'opacity-100 -translate-y-8 sm:-translate-y-10 scale-100 pointer-events-auto'
                  : 'opacity-0 translate-y-12 scale-75 pointer-events-none'
              }`}
            >
              <AstralCorner position="tl" />
              <AstralCorner position="tr" />
              <AstralCorner position="bl" />
              <AstralCorner position="br" />

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close letter"
                className="absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-rose-100/90 text-rose-700 transition hover:bg-rose-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-3 flex items-center justify-center gap-2 text-rose-500">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400/75" />
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="h-3 w-3 text-amber-500/80"
                  fill="currentColor"
                >
                  <path d="M8 0 L9.8 6.2 L16 8 L9.8 9.8 L8 16 L6.2 9.8 L0 8 L6.2 6.2 Z" />
                </svg>
                <Heart className="h-5 w-5 fill-rose-500 text-rose-500 animate-heartbeat" />
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="h-3 w-3 text-amber-500/80"
                  fill="currentColor"
                >
                  <path d="M8 0 L9.8 6.2 L16 8 L9.8 9.8 L8 16 L6.2 9.8 L0 8 L6.2 6.2 Z" />
                </svg>
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400/75" />
              </div>

              <div className="max-h-[58dvh] overflow-y-auto px-1 text-center space-y-3">
                {trimmedMessage.split('\n').map((line, idx) =>
                  line.trim() ? (
                    <p
                      key={idx}
                      className={
                        idx === 0
                          ? 'font-handwriting text-2xl sm:text-[28px] font-bold leading-snug tracking-wide text-rose-600'
                          : 'font-handwriting text-[20px] sm:text-[24px] font-semibold leading-[1.55] tracking-wide text-[#6b3410]'
                      }
                    >
                      {line}
                    </p>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
