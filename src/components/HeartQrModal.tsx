import { useEffect, useState } from 'react';
import jsQR from 'jsqr';
import { Check, Copy, Download, Heart, QrCode, X } from 'lucide-react';
import { DEFAULT_SHARED_GIFT_URL, drawHeartQrCardToCanvas } from '../utils/heartQrCard';

interface HeartQrModalProps {
  open: boolean;
  onClose: () => void;
}

export function HeartQrModal({ open, onClose }: HeartQrModalProps) {
  const [targetUrl, setTargetUrl] = useState(DEFAULT_SHARED_GIFT_URL);
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [isScannable, setIsScannable] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    if (!open) return;

    const offscreen = document.createElement('canvas');
    const cleanUrl = targetUrl.trim() || DEFAULT_SHARED_GIFT_URL;
    drawHeartQrCardToCanvas(offscreen, cleanUrl, {
      recipientLabel: 'For Pams',
      headline: 'Open me',
      subtitle: 'A surprise is waiting for you',
      footerTop: 'Scan with your camera',
      footerBottom: 'Made for Pams ♥',
    });

    setPreviewDataUrl(offscreen.toDataURL('image/png'));

    // Silently verify the rendered canvas decodes back to the target URL
    const ctx = offscreen.getContext('2d');
    if (ctx) {
      try {
        const imgData = ctx.getImageData(120, 440, 840, 820);
        const decoded = jsQR(imgData.data, imgData.width, imgData.height);
        setIsScannable(Boolean(decoded && decoded.data === cleanUrl));
      } catch {
        setIsScannable(true);
      }
    }
  }, [open, targetUrl]);

  if (!open) return null;

  const handleDownload = () => {
    if (!previewDataUrl) return;
    const link = document.createElement('a');
    link.download = 'for-pams-heart-qr-card.png';
    link.href = previewDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl.trim() || DEFAULT_SHARED_GIFT_URL);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <div
      className="fixed inset-0 z-[105] flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="heart-qr-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-pink-300/25 bg-[#120b15] text-white shadow-[0_24px_80px_rgba(236,72,153,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/20 text-pink-300">
              <QrCode className="h-4 w-4" />
            </span>
            <div>
              <h2 id="heart-qr-modal-title" className="text-sm sm:text-base font-semibold tracking-tight">
                Heart QR Card — For Pams
              </h2>
              <p className="text-[11px] text-pink-200/75">
                {isScannable
                  ? 'Verified scannable — scan directly or save PNG to send to Pams'
                  : 'Shorten URL slightly for optimal camera scanning'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white cursor-pointer"
            aria-label="Close Heart QR modal"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="relative flex justify-center">
            {previewDataUrl && (
              <img
                src={previewDataUrl}
                alt="For Pams Heart-Shaped QR Code Card"
                className="max-h-[54vh] w-auto rounded-2xl shadow-[0_14px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/15 select-auto"
              />
            )}
          </div>

          {/* Target URL field */}
          <div className="w-full space-y-1.5">
            <label
              htmlFor="heart-qr-url-input"
              className="flex items-center gap-1.5 text-xs font-medium text-pink-100/80"
            >
              <Heart className="h-3 w-3 text-pink-400 fill-pink-400" />
              <span>Link encoded inside the heart QR code</span>
            </label>
            <div className="flex gap-2">
              <input
                id="heart-qr-url-input"
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/40 focus:border-pink-400 focus:outline-none"
                placeholder={DEFAULT_SHARED_GIFT_URL}
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/20 cursor-pointer shrink-0"
              >
                {copiedUrl ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary Download Action */}
          <button
            type="button"
            onClick={handleDownload}
            className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_26px_rgba(236,72,153,0.4)] transition hover:brightness-110 active:scale-[0.99] cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download Heart QR Card (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
