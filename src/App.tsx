import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Music, Pause, Play, Settings, FastForward, QrCode } from 'lucide-react';
import { LoadingIntro } from './components/LoadingIntro';
import { MatrixRainCanvas } from './components/MatrixRainCanvas';
import { ParticleSequenceCanvas } from './components/ParticleSequenceCanvas';
import { StarfieldLayer } from './components/StarfieldLayer';
import { CelebrationEffects } from './components/CelebrationEffects';
import { TypewriterNote } from './components/TypewriterNote';
import { FlipBook } from './components/FlipBook';
import { SettingsModal } from './components/SettingsModal';
import { HeartQrModal } from './components/HeartQrModal';
import { StarlightTrailCanvas } from './components/StarlightTrailCanvas';
import { GalaxyHeartScene } from './components/GalaxyHeartScene';
import {
  DEFAULT_BOOK_IMAGES,
  DEFAULT_SETTINGS,
  type CardSettings,
  type StagePhase,
} from './types/card';
import { musicEngine } from './utils/musicPlayer';

const STORAGE_KEY = 'made_for_pams_settings_v11';

type ExtendedPhase = 'loading' | StagePhase | 'heart' | 'galaxy';

function loadInitialSettings(): CardSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const hash = window.location.hash;
    if (hash.startsWith('#config=')) {
      const encoded = hash.slice('#config='.length);
      const json = decodeURIComponent(escape(atob(encoded)));
      const parsed = JSON.parse(json) as Partial<CardSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        pages:
          Array.isArray(parsed.pages) && parsed.pages.length > 0
            ? parsed.pages
            : DEFAULT_SETTINGS.pages,
      };
    }
  } catch {
    // Ignore malformed hash
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CardSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        pages:
          Array.isArray(parsed.pages) && parsed.pages.length > 0
            ? parsed.pages
            : DEFAULT_SETTINGS.pages,
      };
    }
  } catch {
    // Ignore storage error
  }

  return DEFAULT_SETTINGS;
}

export default function App() {
  const isEditorMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('edit') === '1';
  const isQrMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('qr') === '1';
  const isDevPreview =
    typeof window !== 'undefined' &&
    (window.location.hostname.startsWith('ais-dev-') ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  const [settings, setSettings] = useState<CardSettings>(loadInitialSettings);
  const [phase, setPhase] = useState<ExtendedPhase>('loading');
  const [runId, setRunId] = useState(1);
  const [activeNote, setActiveNote] = useState('');
  const [showGift, setShowGift] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(isQrMode);
  const [galaxyFadingFromHeart, setGalaxyFadingFromHeart] = useState(false);

  const timersRef = useRef<number[]>([]);
  const userInteractedMusicRef = useRef(false);

  const clearPhaseTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearPhaseTimers();
      musicEngine.stop();
    };
  }, [clearPhaseTimers]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && musicEngine.isPlaying()) {
        musicEngine.stop();
        setIsMusicPlaying(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const triggerCelebrationAndBook = useCallback(() => {
    clearPhaseTimers();
    setPhase('celebration');
    setShowFireworks(true);

    if (settings.enableGift) {
      setShowGift(true);
    }

    const fireworkTimer = window.setTimeout(() => {
      setShowFireworks(false);
    }, 1700);
    timersRef.current.push(fireworkTimer);

    if (settings.enableBook) {
      const bookDelay = settings.enableGift ? 2800 : 750;
      const bookTimer = window.setTimeout(() => {
        setShowGift(false);
        setPhase('book');
      }, bookDelay);
      timersRef.current.push(bookTimer);
    } else if (settings.enableHeart) {
      const heartDelay = settings.enableGift ? 2800 : 750;
      const heartTimer = window.setTimeout(() => {
        setShowGift(false);
        setPhase('heart');
        setShowFireworks(true);
      }, heartDelay);
      timersRef.current.push(heartTimer);
    }
  }, [clearPhaseTimers, settings.enableBook, settings.enableGift, settings.enableHeart]);

  const handleBookFinished = useCallback(() => {
    clearPhaseTimers();
    setActiveNote('');
    setPhase('heart');
    setShowFireworks(true);

    const fireworkTimer = window.setTimeout(() => {
      setShowFireworks(false);
    }, 1800);
    timersRef.current.push(fireworkTimer);
  }, [clearPhaseTimers]);

  const handleReopenBook = useCallback(() => {
    clearPhaseTimers();
    setGalaxyFadingFromHeart(false);
    setShowFireworks(false);
    setShowGift(false);
    setPhase('book');
  }, [clearPhaseTimers]);

  const handleOpenGalaxy = useCallback(() => {
    clearPhaseTimers();
    setShowFireworks(false);
    setShowGift(false);
    setGalaxyFadingFromHeart(true);
    setPhase('galaxy');
    const fadeTimer = window.setTimeout(() => {
      setGalaxyFadingFromHeart(false);
    }, 360);
    timersRef.current.push(fadeTimer);
  }, [clearPhaseTimers]);

  const handleBackToHeart = useCallback(() => {
    clearPhaseTimers();
    setGalaxyFadingFromHeart(false);
    setShowFireworks(false);
    setShowGift(false);
    setPhase('heart');
  }, [clearPhaseTimers]);

  const handleLoadingComplete = useCallback(() => {
    setPhase('sequence');
  }, []);

  const handleReplay = useCallback(() => {
    clearPhaseTimers();
    setGalaxyFadingFromHeart(false);
    setShowGift(false);
    setShowFireworks(false);
    setActiveNote('');
    setPhase('loading');
    setRunId((n) => n + 1);
  }, [clearPhaseTimers]);

  const handleToggleMusic = () => {
    userInteractedMusicRef.current = true;
    if (isMusicPlaying) {
      musicEngine.stop();
      setIsMusicPlaying(false);
    } else {
      const started = musicEngine.start(settings.musicTrackId, settings.customAudioUrl);
      setIsMusicPlaying(started);
    }
  };

  const handleFirstBookInteract = useCallback(() => {
    if (!userInteractedMusicRef.current && !isMusicPlaying) {
      userInteractedMusicRef.current = true;
      const started = musicEngine.start(settings.musicTrackId, settings.customAudioUrl);
      setIsMusicPlaying(started);
    }
  }, [isMusicPlaying, settings.musicTrackId, settings.customAudioUrl]);

  const handleApplySettings = (next: CardSettings) => {
    setSettings(next);
    setSettingsOpen(false);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota errors
    }

    if (isMusicPlaying) {
      musicEngine.start(next.musicTrackId, next.customAudioUrl);
    }

    clearPhaseTimers();
    setShowGift(false);
    setShowFireworks(false);
    setActiveNote('');
    setPhase('loading');
    setRunId((n) => n + 1);
  };

  const handleCopyShareLink = async (candidate: CardSettings): Promise<boolean> => {
    try {
      const shareable: CardSettings = {
        ...candidate,
        customAudioUrl: candidate.customAudioUrl.startsWith('data:')
          ? ''
          : candidate.customAudioUrl,
        pages: candidate.pages.map((p) => ({
          ...p,
          image: p.image.startsWith('data:') ? DEFAULT_SETTINGS.pages[1].image : p.image,
        })),
        heartPhotos: (candidate.heartPhotos || []).filter((url) => !url.startsWith('data:')),
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(shareable))));
      const shareUrl = `${window.location.origin}${window.location.pathname}#config=${encoded}`;
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch {
      return false;
    }
  };

  const showMatrix = phase === 'sequence';
  const showStars = phase !== 'sequence' && phase !== 'loading' && phase !== 'galaxy';
  const showBook = phase === 'book' && settings.enableBook;
  const showHeartCollage = (phase === 'heart' || galaxyFadingFromHeart) && settings.enableHeart;
  const showGalaxy = phase === 'galaxy';
  const allRotatingPhotos = useMemo(() => {
    const pageImgs = settings.pages.map((p) => p.image).filter(Boolean);
    const heartImgs =
      settings.heartPhotos && settings.heartPhotos.length > 0
        ? settings.heartPhotos.filter(Boolean)
        : pageImgs;
    return Array.from(
      new Set([...heartImgs, ...pageImgs.slice(1, 5), DEFAULT_BOOK_IMAGES.extra].filter(Boolean))
    );
  }, [settings.heartPhotos, settings.pages]);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#05050a] select-none">
      {/* Pre-Countdown Loading Screen */}
      <LoadingIntro
        visible={phase === 'loading'}
        accentColor={settings.sequenceColor}
        onComplete={handleLoadingComplete}
      />

      {/* Layer 1: Continuous Matrix Letter Rain */}
      <MatrixRainCanvas
        text={settings.matrixText}
        color1={settings.matrixColor1}
        color2={settings.matrixColor2}
        visible={showMatrix}
      />

      {/* Layer 2: Twinkling Night Sky Stars */}
      <StarfieldLayer visible={showStars} />

      {/* Layer 3: Particle Countdown & Word Morphing Canvas */}
      <ParticleSequenceCanvas
        countdown={settings.countdown}
        sequenceText={settings.sequence}
        color={settings.sequenceColor}
        runId={runId}
        active={phase === 'sequence'}
        onSequenceComplete={triggerCelebrationAndBook}
      />

      {/* Layer 4: Gift Reveal, Fireworks & 30-Photo Heart Shape Finale */}
      <CelebrationEffects
        showGift={showGift}
        showFireworks={showFireworks}
        showHeartCollage={showHeartCollage}
        isExitingToGalaxy={phase === 'galaxy' && galaxyFadingFromHeart}
        photos={allRotatingPhotos}
        envelopeMessage={settings.envelopeMessage}
        accentColor={settings.sequenceColor}
        onReopenBook={handleReopenBook}
        onReplay={handleReplay}
        onOpenGalaxy={handleOpenGalaxy}
      />

      {/* Layer 4B: 3D Galaxy Heart Finale */}
      <GalaxyHeartScene
        visible={showGalaxy}
        photos={allRotatingPhotos}
        onBackToHeart={handleBackToHeart}
      />

      {/* Layer 5: Floating Handwritten Typewriter Note */}
      <TypewriterNote text={activeNote} visible={showBook} />

      {/* Layer 6: Interactive 3D FlipBook */}
      <FlipBook
        pages={settings.pages}
        visible={showBook}
        hasActiveNote={activeNote.trim().length > 0}
        enableHeart={settings.enableHeart}
        onActiveContentChange={setActiveNote}
        onBookFinished={handleBookFinished}
        onFirstInteract={handleFirstBookInteract}
      />

      {/* Layer 7: Interactive Touch & Cursor Starlight Sparkle Trail */}
      <StarlightTrailCanvas />

      {/* Top-Right Floating Controls */}
      <div className="fixed top-4 right-4 z-[60] flex items-center gap-2.5">
        {isEditorMode && (phase === 'loading' || phase === 'sequence') && (
          <button
            type="button"
            onClick={triggerCelebrationAndBook}
            className="flex h-10 items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3.5 text-xs font-medium text-white/85 backdrop-blur-md transition hover:border-pink-400/60 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
            title="Skip intro sequence"
          >
            <FastForward className="h-3.5 w-3.5" />
            <span>Skip</span>
          </button>
        )}

        {(isDevPreview || isEditorMode || isQrMode) && (
          <button
            type="button"
            onClick={() => setQrOpen(true)}
            className="flex h-10 items-center gap-1.5 rounded-full border border-pink-300/35 bg-black/55 px-3.5 text-xs font-medium text-pink-100 backdrop-blur-md transition hover:scale-105 hover:border-pink-400/80 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
            aria-label="Open Heart QR Card"
            title="Get Heart QR Code Card"
          >
            <QrCode className="h-4 w-4 text-pink-300" />
            <span>Heart QR</span>
          </button>
        )}

        {isEditorMode && (
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/85 backdrop-blur-md transition hover:scale-105 hover:border-pink-400/70 hover:text-pink-300 cursor-pointer"
            aria-label="Customize gift card"
            title="Customize"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>
        )}

        <button
          type="button"
          onClick={handleToggleMusic}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur-md transition hover:scale-105 cursor-pointer ${
            isMusicPlaying
              ? 'music-playing-pulse border-pink-400/75 text-pink-300'
              : 'hover:border-pink-400/60'
          }`}
          aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
          title={isMusicPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isMusicPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <span className="relative flex items-center justify-center">
              <Play className="h-4 w-4 ml-0.5" />
              <Music className="sr-only" />
            </span>
          )}
        </button>
      </div>

      {/* Customization Studio Modal (only available in ?edit=1 mode) */}
      {isEditorMode && (
        <SettingsModal
          open={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onApply={handleApplySettings}
          onCopyShareLink={handleCopyShareLink}
          onOpenQr={() => setQrOpen(true)}
        />
      )}

      {/* Heart-Shaped QR Code Card Generator (?qr=1 or from Settings) */}
      <HeartQrModal open={qrOpen} onClose={() => setQrOpen(false)} />
    </main>
  );
}
