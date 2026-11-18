import { useEffect, useState } from 'react';
import {
  X,
  Play,
  Square,
  Plus,
  Trash2,
  Upload,
  Share2,
  RotateCcw,
  Sparkles,
  Check,
  QrCode,
} from 'lucide-react';
import {
  DEFAULT_BOOK_IMAGES,
  DEFAULT_SETTINGS,
  THEME_PRESETS,
  type BookPage,
  type CardSettings,
  type ThemePresetId,
} from '../types/card';
import { BUILTIN_TRACKS, musicEngine } from '../utils/musicPlayer';

interface SettingsModalProps {
  open: boolean;
  settings: CardSettings;
  onClose: () => void;
  onApply: (next: CardSettings) => void;
  onCopyShareLink: (next: CardSettings) => Promise<boolean>;
  onOpenQr?: () => void;
}

export function SettingsModal({
  open,
  settings,
  onClose,
  onApply,
  onCopyShareLink,
  onOpenQr,
}: SettingsModalProps) {
  const [draft, setDraft] = useState<CardSettings>(settings);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(settings);
      setPreviewPlaying(false);
      setCopiedLink(false);
    }
  }, [open, settings]);

  useEffect(() => {
    if (!open && previewPlaying) {
      musicEngine.stop();
      setPreviewPlaying(false);
    }
  }, [open, previewPlaying]);

  if (!open) return null;

  const selectThemePreset = (presetId: ThemePresetId) => {
    if (presetId === 'custom') {
      setDraft((prev) => ({ ...prev, themePreset: 'custom' }));
      return;
    }
    const found = THEME_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setDraft((prev) => ({
      ...prev,
      themePreset: found.id,
      matrixColor1: found.matrixColor1,
      matrixColor2: found.matrixColor2,
      sequenceColor: found.sequenceColor,
    }));
  };

  const togglePreviewMusic = () => {
    if (previewPlaying) {
      musicEngine.stop();
      setPreviewPlaying(false);
    } else {
      const ok = musicEngine.start(draft.musicTrackId, draft.customAudioUrl);
      setPreviewPlaying(ok);
    }
  };

  const handleCustomAudioUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : '';
      if (!url) return;
      setDraft((prev) => ({
        ...prev,
        musicTrackId: 'custom',
        customAudioUrl: url,
        customAudioName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePageImageUpload = (pageId: string, file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : '';
      if (!url) return;
      setDraft((prev) => ({
        ...prev,
        pages: prev.pages.map((p) => (p.id === pageId ? { ...p, image: url } : p)),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleHeartPhotosUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = typeof reader.result === 'string' ? reader.result : '';
        if (!url) return;
        setDraft((prev) => ({
          ...prev,
          heartPhotos: [...(prev.heartPhotos || []), url].slice(0, 30),
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeHeartPhoto = (idx: number) => {
    setDraft((prev) => ({
      ...prev,
      heartPhotos: (prev.heartPhotos || []).filter((_, i) => i !== idx),
    }));
  };

  const addPage = () => {
    const fallbackImages = [
      DEFAULT_BOOK_IMAGES.photo1,
      DEFAULT_BOOK_IMAGES.photo2,
      DEFAULT_BOOK_IMAGES.photo3,
      DEFAULT_BOOK_IMAGES.photo4,
    ];
    const nextIdx = draft.pages.length;
    const newPage: BookPage = {
      id: `page-${Date.now()}`,
      image: fallbackImages[nextIdx % fallbackImages.length],
      content: '',
    };
    setDraft((prev) => ({ ...prev, pages: [...prev.pages, newPage] }));
  };

  const removePage = (pageId: string) => {
    if (draft.pages.length <= 1) return;
    setDraft((prev) => ({
      ...prev,
      pages: prev.pages.filter((p) => p.id !== pageId),
    }));
  };

  const handleCopyShare = async () => {
    const ok = await onCopyShareLink(draft);
    if (ok) {
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleReset = () => {
    setDraft(DEFAULT_SETTINGS);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (previewPlaying) {
      musicEngine.stop();
      setPreviewPlaying(false);
    }
    onApply(draft);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-stone-50 text-stone-900 shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5" />
            <h2 id="settings-modal-title" className="text-lg font-semibold tracking-tight">
              Customize Gift Page
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 cursor-pointer"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Music Settings */}
          <section className="rounded-xl bg-white p-4 shadow-sm border border-stone-200/80 space-y-3">
            <h3 className="text-sm font-semibold text-stone-800 border-b border-stone-100 pb-2">
              Background Music
            </h3>
            <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center">
              <select
                value={draft.musicTrackId}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, musicTrackId: e.target.value }))
                }
                className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-pink-500 focus:outline-none"
              >
                {BUILTIN_TRACKS.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.label}
                  </option>
                ))}
                {draft.customAudioUrl && (
                  <option value="custom">
                    Custom: {draft.customAudioName || 'Uploaded Audio'}
                  </option>
                )}
              </select>

              <button
                type="button"
                onClick={togglePreviewMusic}
                className={`inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  previewPlaying
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-stone-900 text-white hover:bg-stone-800'
                }`}
              >
                {previewPlaying ? (
                  <>
                    <Square className="h-3.5 w-3.5" />
                    <span>Stop Preview</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    <span>Preview</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <label className="inline-flex items-center gap-2 rounded-lg border border-dashed border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:border-pink-400 hover:text-pink-600 cursor-pointer transition">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload MP3 / WAV</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  onChange={(e) => handleCustomAudioUpload(e.target.files?.[0])}
                />
              </label>
              {draft.customAudioName && (
                <span className="truncate text-xs text-stone-500 max-w-[200px]">
                  {draft.customAudioName}
                </span>
              )}
            </div>
          </section>

          {/* Countdown & Particle Sequence */}
          <section className="rounded-xl bg-white p-4 shadow-sm border border-stone-200/80 space-y-3">
            <h3 className="text-sm font-semibold text-stone-800 border-b border-stone-100 pb-2">
              Countdown & Main Particle Words
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Countdown Seconds
                </label>
                <select
                  value={draft.countdown}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      countdown: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-pink-500 focus:outline-none"
                >
                  <option value={0}>No Countdown</option>
                  <option value={3}>3 seconds</option>
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Word Sequence (separate words with |)
                </label>
                <input
                  type="text"
                  value={draft.sequence}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, sequence: e.target.value }))
                  }
                  placeholder="HAPPY|BIRTHDAY|TO|PAMS|❤"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Matrix Rain & Color Theme */}
          <section className="rounded-xl bg-white p-4 shadow-sm border border-stone-200/80 space-y-3">
            <h3 className="text-sm font-semibold text-stone-800 border-b border-stone-100 pb-2">
              Matrix Rain & Color Palette
            </h3>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Matrix Rain Characters
              </label>
              <input
                type="text"
                value={draft.matrixText}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, matrixText: e.target.value }))
                }
                placeholder="HAPPYBIRTHDAY"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {THEME_PRESETS.map((preset) => {
                const active = draft.themePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectThemePreset(preset.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition cursor-pointer ${
                      active
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    <span
                      className="h-4 w-full rounded"
                      style={{
                        background: `linear-gradient(90deg, ${preset.swatch[0]}, ${preset.swatch[1]})`,
                      }}
                    />
                    <span className="truncate max-w-full">{preset.name}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => selectThemePreset('custom')}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-xs font-medium transition cursor-pointer ${
                  draft.themePreset === 'custom'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                }`}
              >
                <span className="h-4 w-full rounded bg-gradient-to-r from-pink-400 via-amber-300 to-sky-400" />
                <span>Custom</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Rain Color 1
                </label>
                <input
                  type="color"
                  value={draft.matrixColor1}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      themePreset: 'custom',
                      matrixColor1: e.target.value,
                    }))
                  }
                  className="h-9 w-full cursor-pointer rounded border border-stone-200 bg-white p-0.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Rain Color 2
                </label>
                <input
                  type="color"
                  value={draft.matrixColor2}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      themePreset: 'custom',
                      matrixColor2: e.target.value,
                    }))
                  }
                  className="h-9 w-full cursor-pointer rounded border border-stone-200 bg-white p-0.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Particle Color
                </label>
                <input
                  type="color"
                  value={draft.sequenceColor}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      themePreset: 'custom',
                      sequenceColor: e.target.value,
                    }))
                  }
                  className="h-9 w-full cursor-pointer rounded border border-stone-200 bg-white p-0.5"
                />
              </div>
            </div>
          </section>

          {/* Celebration Toggles */}
          <section className="rounded-xl bg-white p-4 shadow-sm border border-stone-200/80 space-y-2.5">
            <h3 className="text-sm font-semibold text-stone-800 border-b border-stone-100 pb-2">
              Effects & Flipbook
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 cursor-pointer">
                <span>Gift Reveal</span>
                <input
                  type="checkbox"
                  checked={draft.enableGift}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, enableGift: e.target.checked }))
                  }
                  className="h-4 w-4 accent-pink-500"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 cursor-pointer">
                <span>3D Flipbook</span>
                <input
                  type="checkbox"
                  checked={draft.enableBook}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, enableBook: e.target.checked }))
                  }
                  className="h-4 w-4 accent-pink-500"
                />
              </label>

              <label className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 cursor-pointer">
                <span>Heart Bursts</span>
                <input
                  type="checkbox"
                  checked={draft.enableHeart}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, enableHeart: e.target.checked }))
                  }
                  className="h-4 w-4 accent-pink-500"
                />
              </label>
            </div>
          </section>

          {/* Dedicated Heart Shape Collage Photos */}
          {draft.enableHeart && (
            <section className="rounded-xl bg-white p-4 shadow-sm border border-stone-200/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                <div>
                  <h3 className="text-sm font-semibold text-stone-800">
                    Heart Shape Photos ({draft.heartPhotos?.length || 0} / 30 slots)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Upload 1–30 photos for the heart finale (or leave empty to reuse book photos).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(draft.heartPhotos?.length || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => setDraft((prev) => ({ ...prev, heartPhotos: [] }))}
                      className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <label className="inline-flex items-center gap-1 rounded-lg bg-pink-50 px-2.5 py-1.5 text-xs font-semibold text-pink-600 hover:bg-pink-100 cursor-pointer transition">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => handleHeartPhotosUpload(e.target.files)}
                    />
                  </label>
                </div>
              </div>

              {(draft.heartPhotos?.length || 0) > 0 && (
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {draft.heartPhotos.map((src, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img
                        src={src}
                        alt={`Heart photo ${idx + 1}`}
                        className="h-full w-full rounded-lg object-cover border border-stone-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeHeartPhoto(idx)}
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow cursor-pointer"
                        aria-label={`Remove heart photo ${idx + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Center Heart Envelope Message
                </label>
                <textarea
                  rows={4}
                  value={draft.envelopeMessage || ''}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, envelopeMessage: e.target.value }))
                  }
                  placeholder="Write your birthday letter revealed inside the envelope..."
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-800 focus:border-pink-500 focus:outline-none resize-y"
                />
              </div>
            </section>
          )}

          {/* Book Pages Editor */}
          {draft.enableBook && (
            <section className="rounded-xl bg-white p-4 shadow-sm border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="text-sm font-semibold text-stone-800">
                  Book Pages ({draft.pages.length})
                </h3>
                <button
                  type="button"
                  onClick={addPage}
                  className="inline-flex items-center gap-1 rounded-lg bg-pink-50 px-2.5 py-1.5 text-xs font-semibold text-pink-600 hover:bg-pink-100 cursor-pointer transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Page</span>
                </button>
              </div>

              <div className="space-y-3">
                {draft.pages.map((page, index) => (
                  <div
                    key={page.id}
                    className="flex flex-col sm:flex-row gap-3 rounded-lg border border-stone-200 bg-stone-50/70 p-3"
                  >
                    <div className="flex items-center gap-3 sm:flex-col sm:w-20 shrink-0">
                      {page.image ? (
                        <img
                          src={page.image}
                          alt={`Page ${index + 1}`}
                          referrerPolicy="no-referrer"
                          className="h-16 w-12 sm:h-24 sm:w-16 rounded object-cover border border-stone-200 bg-white"
                        />
                      ) : (
                        <div className="flex h-16 w-12 sm:h-24 sm:w-16 items-center justify-center rounded border border-stone-200 bg-white text-[10px] font-medium text-stone-400">
                          White
                        </div>
                      )}
                      <label className="inline-flex items-center gap-1 rounded border border-stone-300 bg-white px-2 py-1 text-[11px] font-medium text-stone-700 hover:border-pink-400 cursor-pointer">
                        <Upload className="h-3 w-3" />
                        <span>Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) =>
                            handlePageImageUpload(page.id, e.target.files?.[0])
                          }
                        />
                      </label>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-700">
                          Page {index + 1} {index === 0 ? '(Cover)' : ''}
                        </span>
                        {draft.pages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePage(page.id)}
                            className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                            aria-label={`Remove page ${index + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={page.caption || ''}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            pages: prev.pages.map((p) =>
                              p.id === page.id ? { ...p, caption: e.target.value } : p
                            ),
                          }))
                        }
                        placeholder="Short Polaroid photo caption (shown under the photo)..."
                        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-800 focus:border-pink-500 focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        value={page.content || ''}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            pages: prev.pages.map((p) =>
                              p.id === page.id ? { ...p, content: e.target.value } : p
                            ),
                          }))
                        }
                        placeholder="Warm handwritten note displayed above the book..."
                        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs sm:text-sm text-stone-800 focus:border-pink-500 focus:outline-none resize-y"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 cursor-pointer transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={handleCopyShare}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 cursor-pointer transition"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share Link</span>
                  </>
                )}
              </button>
              {onOpenQr && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenQr();
                  }}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-pink-300 bg-pink-50 px-3 py-2 text-xs font-semibold text-pink-700 hover:bg-pink-100 cursor-pointer transition"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Heart QR Card</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-pink-600 hover:to-rose-600 cursor-pointer transition"
            >
              <span>Apply & Replay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
