export interface BookPage {
  id: string;
  image: string;
  caption?: string;
  content?: string;
}

export type ThemePresetId = 'pink-passion' | 'midnight-rose' | 'golden-warmth' | 'ocean-breeze' | 'custom';

export type StagePhase = 'sequence' | 'celebration' | 'book';

export interface CardSettings {
  themePreset: ThemePresetId;
  musicTrackId: string;
  customAudioUrl: string;
  customAudioName: string;
  countdown: number;
  matrixText: string;
  matrixColor1: string;
  matrixColor2: string;
  sequence: string;
  sequenceColor: string;
  enableGift: boolean;
  enableBook: boolean;
  enableHeart: boolean;
  pages: BookPage[];
  heartPhotos: string[];
  envelopeMessage: string;
}

export interface ThemePreset {
  id: Exclude<ThemePresetId, 'custom'>;
  name: string;
  matrixColor1: string;
  matrixColor2: string;
  sequenceColor: string;
  swatch: [string, string];
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'pink-passion',
    name: 'Pink Passion',
    matrixColor1: '#ff69b4',
    matrixColor2: '#ff1493',
    sequenceColor: '#ff69b4',
    swatch: ['#ff69b4', '#ff1493'],
  },
  {
    id: 'midnight-rose',
    name: 'Midnight Rose',
    matrixColor1: '#fb7185',
    matrixColor2: '#be123c',
    sequenceColor: '#fda4af',
    swatch: ['#fb7185', '#be123c'],
  },
  {
    id: 'golden-warmth',
    name: 'Golden Warmth',
    matrixColor1: '#fbbf24',
    matrixColor2: '#f59e0b',
    sequenceColor: '#fde68a',
    swatch: ['#fbbf24', '#f59e0b'],
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    matrixColor1: '#38bdf8',
    matrixColor2: '#818cf8',
    sequenceColor: '#7dd3fc',
    swatch: ['#38bdf8', '#818cf8'],
  },
];

export const DEFAULT_BOOK_IMAGES = {
  gift: '/assets/original/happy3.gif',
  cover: '/assets/original/theend.jpg',
  photo1: '/assets/aistudio/IMG_20260329_172951_c5019441.jpg',
  photo2: '/assets/aistudio/0c60f796830e4f6938b01b5f147fbcc7_0_08e87f91.jpg',
  photo3: '/assets/aistudio/Screenshot_2026-04-07-18-19-29-129_com.ss.android.ugc.trill_ef1a26d5.png',
  photo4: '/assets/aistudio/page5_upright.jpg',
  extra: '/assets/aistudio/78202f2c62871c6df8b5f1d965098c2d_1736425694482_0_506843b4.webp',
};

export const DEFAULT_SETTINGS: CardSettings = {
  themePreset: 'pink-passion',
  musicTrackId: 'happy-birthday-box',
  customAudioUrl: '',
  customAudioName: '',
  countdown: 3,
  matrixText: 'HAPPYBIRTHDAY',
  matrixColor1: '#ff69b4',
  matrixColor2: '#ff1493',
  sequence: 'HAPPY|BIRTHDAY|TO|PAMS|❤',
  sequenceColor: '#ff69b4',
  enableGift: true,
  enableBook: true,
  enableHeart: true,
  pages: [
    {
      id: 'page-0',
      image: DEFAULT_BOOK_IMAGES.cover,
      caption: 'For Pams',
      content: '',
    },
    {
      id: 'page-1',
      image: DEFAULT_BOOK_IMAGES.photo1,
      caption: 'My favorite smile ✨',
      content: 'Happy Birthday, Bebe Pams! Today is all about celebrating the sweetest person in my life.',
    },
    {
      id: 'page-2',
      image: DEFAULT_BOOK_IMAGES.photo2,
      caption: 'Soft & radiant 💕',
      content: 'Your laugh is still my favorite sound, and seeing you happy will always be my favorite thing.',
    },
    {
      id: 'page-3',
      image: DEFAULT_BOOK_IMAGES.photo3,
      caption: 'Always my sunshine 🌸',
      content: 'I hope today wraps you in comfort, sweetness, and all the little things that make you smile.',
    },
    {
      id: 'page-4',
      image: DEFAULT_BOOK_IMAGES.photo4,
      caption: 'Pure comfort 🤍',
      content: 'Even the simplest days feel brighter and warmer just by having you around.',
    },
    {
      id: 'page-5',
      image: DEFAULT_BOOK_IMAGES.extra,
      caption: 'Precious moments 💫',
      content: 'Every quiet moment and silly memory we share is something I cherish more than you know.',
    },
    {
      id: 'page-6',
      image: '/assets/aistudio/Screenshot_2026-11-07_153549_ef27c9da.png',
      caption: 'Prettiest glow 💖',
      content: 'Thank you for being so gentle, thoughtful, and effortlessly wonderful every single day.',
    },
    {
      id: 'page-7',
      image: '/assets/aistudio/Screenshot_2026-11-07_165012_d7463c65.png',
      caption: 'Wishing you pure joy 🎂',
      content: 'May this new year bring you calm mornings, endless peace, and everything your heart hopes for.',
    },
    {
      id: 'page-8',
      image: '/assets/aistudio/Screenshot_2026-01-27_192310_cd9bc354.png',
      caption: 'My favorite person ❤',
      content: 'Enjoy your special day to the fullest, Bebe — you deserve every ounce of love today.',
    },
    {
      id: 'page-9',
      image: '/assets/aistudio/Screenshot_2026-02-22_145801_7159f35b.png',
      caption: 'Forever cheering for you 💗',
      content: 'Happy Birthday once again, Pams! One more surprise is waiting for you right after this ✨',
    },
  ],
  heartPhotos: [
    '/assets/aistudio/Screenshot_2026-11-07_153549_ef27c9da.png',
    '/assets/aistudio/Screenshot_2026-11-07_162950_b9594353.png',
    '/assets/aistudio/Screenshot_2026-11-07_165012_d7463c65.png',
    '/assets/aistudio/Screenshot_2026-11-07_165309_ebedeb71.png',
    '/assets/aistudio/Screenshot_2026-11-07_154903_5430fc71.png',
    '/assets/aistudio/Screenshot_2026-11-07_165214_76c90633.png',
    '/assets/aistudio/Screenshot_2026-11-07_154656_b83536be.png',
    '/assets/aistudio/Screenshot_2026-11-07_162113_9dacebe8.png',
    '/assets/aistudio/Screenshot_2026-11-07_164758_be021574.png',
    '/assets/aistudio/Screenshot_2026-11-07_155150_8ac0b930.png',
    '/assets/aistudio/Screenshot_2026-11-07_165417_3df565f3.png',
    '/assets/aistudio/Screenshot_2026-11-07_154604_2aa65d1e.png',
    '/assets/aistudio/Screenshot_2026-11-07_154911_e90bd018.png',
    '/assets/aistudio/Screenshot_2026-11-07_155258_6f2154e2.png',
    '/assets/aistudio/Screenshot_2026-11-07_160112_6e33007c.png',
    '/assets/aistudio/Screenshot_2026-11-07_155911_9aec1f1c.png',
    '/assets/aistudio/Screenshot_2026-11-07_161936_96d4d318.png',
    '/assets/aistudio/Screenshot_2026-11-07_164742_5a90844a.png',
    '/assets/aistudio/Screenshot_2026-11-07_164936_6c90e89f.png',
    '/assets/aistudio/Screenshot_2026-11-07_153209_389f4a04.png',
    '/assets/aistudio/Screenshot_2026-11-07_153717_c6bae1fd.png',
    '/assets/aistudio/Screenshot_2026-11-07_153737_5bc3c2fa.png',
    '/assets/aistudio/Screenshot_2026-11-07_155556_d6e74ad7.png',
    '/assets/aistudio/Screenshot_2026-11-07_160528_0a12ff2a.png',
    '/assets/aistudio/Screenshot_2026-11-07_153004_7b7080a5.png',
    '/assets/aistudio/Screenshot_2026-01-27_192310_cd9bc354.png',
    '/assets/aistudio/Screenshot_2026-01-29_173410_c2c0d95a.png',
    '/assets/aistudio/Screenshot_2026-02-22_145801_7159f35b.png',
    '/assets/aistudio/Screenshot_2026-01-24_115436_4061f4c5.png',
    '/assets/aistudio/Screenshot_2026-01-24_114824_ab4f2730.png',
  ],
  envelopeMessage:
    "HAPPIEST BIRTHDAY PAM,ZII,ZIA,BEBE,BABY!! 🥳💗\n\nIt's honestly crazy to think that it's already been more than a year since we first met in OTLUM. Who would've thought that me randomly joining a roblox game just because Niku kept talking about it would eventually lead me to someone as special as you? I definitely wasn't expecting to meet someone who would become such a big part of my life\nLooking back, it's funny how everything started with a simple bridal carry HAHAHA. From casually hanging out in OTLUM to exploring random hiking games then our SDF club moments, and all those random moments in between, we've come a long way. And somehow, after all this time, you're still someone I look forward to spending time with\nMore than a year of memories, countless conversations, silly moments, and calls that somehow turn into hours. Who would've thought we'd have that much to talk about? And we may had problems, arguments and some other stuffs going on between us but I'm genuinely grateful that our paths crossed. Out of all the random people I could've met that day, I'm glad it was you. Again HAPPIEST BIRTHDAY PRINCESS ARIANE MIKAELA SILLA!",
};
