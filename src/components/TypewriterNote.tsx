import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface TypewriterNoteProps {
  text: string;
  visible: boolean;
}

export function TypewriterNote({ text, visible }: TypewriterNoteProps) {
  const [displayed, setDisplayed] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!visible || !text.trim()) {
      setDisplayed('');
      setIsTyping(false);
      return;
    }

    let index = 0;
    setDisplayed('');
    setIsTyping(true);

    const interval = window.setInterval(() => {
      index++;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(interval);
        setIsTyping(false);
      }
    }, 34);

    return () => window.clearInterval(interval);
  }, [text, visible]);

  const hasContent = visible && text.trim().length > 0;

  return (
    <div
      className={`fixed top-14 sm:top-4 left-1/2 -translate-x-1/2 z-[40] w-[90vw] max-w-[650px] transition-all duration-500 ${
        hasContent
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}
      aria-live="polite"
    >
      <div className="content-display-card relative rounded-2xl px-5 py-4 sm:px-9 sm:py-5 border border-amber-200/60 max-h-[155px] sm:max-h-[195px] overflow-y-auto">
        <span
          aria-hidden="true"
          className="absolute top-2.5 left-3.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-500/70 select-none"
        >
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>Memory Note</span>
        </span>
        <span
          aria-hidden="true"
          className="animate-heartbeat absolute top-2.5 right-3.5 text-lg sm:text-xl select-none"
        >
          💕
        </span>
        <p className="font-handwriting romantic-gradient-text text-center text-lg sm:text-[24px] leading-[1.6] tracking-wide m-0 pt-3 px-2">
          <span>{displayed}</span>
          {isTyping && <span className="typewriter-cursor" aria-hidden="true" />}
        </p>
      </div>
    </div>
  );
}
