import { useMemo } from 'react';

interface StarfieldLayerProps {
  visible: boolean;
}

interface StarItem {
  id: number;
  left: string;
  top: string;
  size: 'small' | 'medium' | 'large';
  duration: string;
  delay: string;
}

interface ShootingStarConfig {
  id: number;
  top: string;
  left: string;
  width: number;
  angle: number;
  dx: number;
  dy: number;
  duration: number;
  delay: number;
  tailColor: string;
}

const SHOOTING_STARS: ShootingStarConfig[] = [
  { id: 1, top: '12%', left: '8%', width: 115, angle: 28, dx: 360, dy: 190, duration: 6.8, delay: 0.6, tailColor: '#fde68a' },
  { id: 2, top: '22%', left: '58%', width: 95, angle: 34, dx: 320, dy: 215, duration: 8.2, delay: 2.8, tailColor: '#ff69b4' },
  { id: 3, top: '8%', left: '36%', width: 130, angle: 25, dx: 400, dy: 185, duration: 9.4, delay: 5.1, tailColor: '#f5d08a' },
  { id: 4, top: '42%', left: '14%', width: 90, angle: 30, dx: 290, dy: 165, duration: 7.6, delay: 4.0, tailColor: '#fda4af' },
  { id: 5, top: '16%', left: '74%', width: 105, angle: 148, dx: -300, dy: 185, duration: 8.8, delay: 6.4, tailColor: '#fde68a' },
];

const CONSTELLATION_PATHS = [
  'M 10 18 L 19 14 L 28 21 L 34 15',
  'M 68 15 L 77 11 L 85 18 L 91 13',
  'M 14 74 L 22 68 L 31 76 L 26 85 Z',
  'M 72 72 L 80 65 L 88 73 L 84 82',
];

const CONSTELLATION_NODES = [
  [10, 18], [19, 14], [28, 21], [34, 15],
  [68, 15], [77, 11], [85, 18], [91, 13],
  [14, 74], [22, 68], [31, 76], [26, 85],
  [72, 72], [80, 65], [88, 73], [84, 82],
];

export function StarfieldLayer({ visible }: StarfieldLayerProps) {
  const stars = useMemo<StarItem[]>(() => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: sizes[i % 5 === 0 ? 2 : i % 2 === 0 ? 1 : 0],
      duration: `${(Math.random() * 2.5 + 1.5).toFixed(2)}s`,
      delay: `${(Math.random() * 2).toFixed(2)}s`,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[5] pointer-events-none overflow-hidden transition-opacity duration-1000 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Faint Astral Constellation Lines */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-55"
      >
        <defs>
          <linearGradient id="constellationStroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#fda4af" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        {CONSTELLATION_PATHS.map((d, idx) => (
          <path
            key={idx}
            d={d}
            fill="none"
            stroke="url(#constellationStroke)"
            strokeWidth="0.14"
            strokeDasharray="0.6 0.6"
          />
        ))}
        {CONSTELLATION_NODES.map(([cx, cy], idx) => (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r="0.26"
            fill={idx % 2 === 0 ? '#fde68a' : '#fbcfe8'}
            fillOpacity="0.5"
          />
        ))}
      </svg>

      {/* Twinkling Starfield */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star ${star.size}`}
          style={{
            left: star.left,
            top: star.top,
            animationDuration: star.duration,
            animationDelay: star.delay,
          }}
        />
      ))}

      {/* Diagonal Shooting Stars / Star Trails */}
      {SHOOTING_STARS.map((meteor) => (
        <div
          key={meteor.id}
          className="animate-shooting-star absolute flex items-center"
          style={
            {
              top: meteor.top,
              left: meteor.left,
              width: `${meteor.width}px`,
              height: '2px',
              opacity: 0,
              '--shoot-angle': `${meteor.angle}deg`,
              '--dx': `${meteor.dx}px`,
              '--dy': `${meteor.dy}px`,
              '--shoot-dur': `${meteor.duration}s`,
              animationDelay: `${meteor.delay}s`,
            } as React.CSSProperties
          }
        >
          <div
            className="h-[1.5px] w-full rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${meteor.tailColor}88 55%, #ffffff 100%)`,
              boxShadow: `0 0 8px ${meteor.tailColor}`,
            }}
          />
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-white"
            style={{
              boxShadow: `0 0 10px 2px ${meteor.tailColor}`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
