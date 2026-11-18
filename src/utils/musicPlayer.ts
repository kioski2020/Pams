export interface MusicTrackOption {
  id: string;
  label: string;
  tempoBpm: number;
  waveform: OscillatorType;
  notes: Array<{ freq: number; beats: number }>;
}

// Frequencies in Hz
const N = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  REST: 0,
};

export const BUILTIN_TRACKS: MusicTrackOption[] = [
  {
    id: 'happy-birthday-box',
    label: 'Happy Birthday (Music Box)',
    tempoBpm: 112,
    waveform: 'sine',
    notes: [
      { freq: N.G4, beats: 0.75 },
      { freq: N.G4, beats: 0.25 },
      { freq: N.A4, beats: 1 },
      { freq: N.G4, beats: 1 },
      { freq: N.C5, beats: 1 },
      { freq: N.B4, beats: 2 },
      { freq: N.G4, beats: 0.75 },
      { freq: N.G4, beats: 0.25 },
      { freq: N.A4, beats: 1 },
      { freq: N.G4, beats: 1 },
      { freq: N.D5, beats: 1 },
      { freq: N.C5, beats: 2 },
      { freq: N.G4, beats: 0.75 },
      { freq: N.G4, beats: 0.25 },
      { freq: N.G5, beats: 1 },
      { freq: N.E5, beats: 1 },
      { freq: N.C5, beats: 1 },
      { freq: N.B4, beats: 1 },
      { freq: N.A4, beats: 2 },
      { freq: N.F5, beats: 0.75 },
      { freq: N.F5, beats: 0.25 },
      { freq: N.E5, beats: 1 },
      { freq: N.C5, beats: 1 },
      { freq: N.D5, beats: 1 },
      { freq: N.C5, beats: 2.5 },
      { freq: N.REST, beats: 1 },
    ],
  },
  {
    id: 'warm-piano-chime',
    label: 'Warm Birthday Chime',
    tempoBpm: 96,
    waveform: 'triangle',
    notes: [
      { freq: N.C5, beats: 1 },
      { freq: N.E5, beats: 1 },
      { freq: N.G5, beats: 1.5 },
      { freq: N.E5, beats: 0.5 },
      { freq: N.F5, beats: 1 },
      { freq: N.D5, beats: 1 },
      { freq: N.B4, beats: 2 },
      { freq: N.C5, beats: 1 },
      { freq: N.E5, beats: 1 },
      { freq: N.A5, beats: 1.5 },
      { freq: N.G5, beats: 0.5 },
      { freq: N.F5, beats: 1 },
      { freq: N.E5, beats: 1 },
      { freq: N.C5, beats: 2 },
    ],
  },
  {
    id: 'starlight-lullaby',
    label: 'Starlight Lullaby',
    tempoBpm: 88,
    waveform: 'sine',
    notes: [
      { freq: N.E4, beats: 1 },
      { freq: N.G4, beats: 1 },
      { freq: N.C5, beats: 2 },
      { freq: N.B4, beats: 1 },
      { freq: N.A4, beats: 1 },
      { freq: N.G4, beats: 2 },
      { freq: N.F4, beats: 1 },
      { freq: N.A4, beats: 1 },
      { freq: N.G4, beats: 1 },
      { freq: N.E4, beats: 1 },
      { freq: N.D4, beats: 2 },
      { freq: N.C4, beats: 2 },
    ],
  },
  {
    id: 'celebration-waltz',
    label: 'Celebration Waltz',
    tempoBpm: 132,
    waveform: 'triangle',
    notes: [
      { freq: N.G4, beats: 1 },
      { freq: N.C5, beats: 1 },
      { freq: N.E5, beats: 1 },
      { freq: N.G5, beats: 2 },
      { freq: N.E5, beats: 1 },
      { freq: N.F5, beats: 1 },
      { freq: N.D5, beats: 1 },
      { freq: N.B4, beats: 1 },
      { freq: N.C5, beats: 3 },
    ],
  },
];

class CelebratoryMusicEngine {
  private ctx: AudioContext | null = null;
  private timer: number | null = null;
  private noteIndex = 0;
  private playing = false;
  private currentTrack: MusicTrackOption = BUILTIN_TRACKS[0];
  private htmlAudio: HTMLAudioElement | null = null;
  private customUrl = '';

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(freq: number, durationSec: number, waveform: OscillatorType) {
    if (!freq || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const harmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const harmonicGain = this.ctx.createGain();

    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, now);

    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(freq * 2, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec * 0.95);

    harmonicGain.gain.setValueAtTime(0.0001, now);
    harmonicGain.gain.exponentialRampToValueAtTime(0.035, now + 0.015);
    harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec * 0.6);

    osc.connect(gain);
    harmonic.connect(harmonicGain);
    gain.connect(this.ctx.destination);
    harmonicGain.connect(this.ctx.destination);

    osc.start(now);
    harmonic.start(now);
    osc.stop(now + durationSec);
    harmonic.stop(now + durationSec);
  }

  private scheduleNextNote() {
    if (!this.playing) return;
    const track = this.currentTrack;
    const note = track.notes[this.noteIndex % track.notes.length];
    const beatMs = (60 / track.tempoBpm) * 1000;
    const durationMs = note.beats * beatMs;

    this.playTone(note.freq, durationMs / 1000, track.waveform);
    this.noteIndex = (this.noteIndex + 1) % track.notes.length;

    this.timer = window.setTimeout(() => {
      this.scheduleNextNote();
    }, durationMs);
  }

  public start(trackId: string, customAudioUrl = ''): boolean {
    this.stop();
    this.customUrl = customAudioUrl;

    if (trackId === 'custom' && customAudioUrl) {
      try {
        this.htmlAudio = new Audio(customAudioUrl);
        this.htmlAudio.loop = true;
        this.htmlAudio.volume = 0.6;
        void this.htmlAudio.play();
        this.playing = true;
        return true;
      } catch {
        return false;
      }
    }

    const found = BUILTIN_TRACKS.find((t) => t.id === trackId) || BUILTIN_TRACKS[0];
    this.currentTrack = found;
    this.noteIndex = 0;

    const ctx = this.ensureContext();
    if (!ctx) return false;

    this.playing = true;
    this.scheduleNextNote();
    return true;
  }

  public stop() {
    this.playing = false;
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.currentTime = 0;
      this.htmlAudio = null;
    }
  }

  public playPageFlipSound() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;

      const duration = 0.14;
      const sampleCount = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < sampleCount; i++) {
        const env = Math.sin((i / sampleCount) * Math.PI);
        channel[i] = (Math.random() * 2 - 1) * env * 0.35;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2600, ctx.currentTime + duration);
      filter.Q.value = 1.4;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch {
      // Ignore audio errors when unmuted playback isn't allowed yet
    }
  }

  public playWaxSealSound() {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const start = ctx.currentTime + idx * 0.055;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.065, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.45);
      });
    } catch {
      // Ignore audio errors
    }
  }

  public isPlaying(): boolean {
    return this.playing;
  }
}

export const musicEngine = new CelebratoryMusicEngine();
