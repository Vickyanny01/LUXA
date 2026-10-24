import React from 'react';

interface LuxaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark-only' | 'wordmark-only';
  theme?: 'dark' | 'light' | 'colorful';
  className?: string;
  animate?: boolean;
}

export const LuxaLogo: React.FC<LuxaLogoProps> = ({
  size = 'md',
  variant = 'full',
  theme = 'colorful',
  className = '',
  animate = false,
}) => {
  const isDark = theme === 'dark';

  // Sizing configurations
  const dimensions = {
    sm: { icon: 24, text: 'text-xl', tracking: 'tracking-[0.2em]', sub: 'text-[9px]' },
    md: { icon: 32, text: 'text-2xl', tracking: 'tracking-[0.25em]', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-4xl', tracking: 'tracking-[0.3em]', sub: 'text-xs' },
    xl: { icon: 84, text: 'text-5xl sm:text-7xl md:text-8xl', tracking: 'tracking-[0.35em] sm:tracking-[0.45em]', sub: 'text-xs sm:text-sm' },
  }[size];

  // Unique ID prefix to avoid SVG filter collisions when multiple logos are rendered
  const id = React.useId().replace(/:/g, '');

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Designed Colorful Logo Emblem */}
      {variant !== 'wordmark-only' && (
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            width={dimensions.icon}
            height={dimensions.icon}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-500 ${animate ? 'hover:scale-105' : ''}`}
          >
            <defs>
              {/* Prism Facet 1: Electric Violet to Fuchsia */}
              <linearGradient id={`grad-stem-${id}`} x1="20" y1="20" x2="26" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>

              {/* Prism Facet 2: Emerald to Cyan */}
              <linearGradient id={`grad-base-${id}`} x1="26" y1="54" x2="60" y2="54" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="40%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>

              {/* Prism Facet 3: Amber to Sunset Orange to Coral */}
              <linearGradient id={`grad-beam-${id}`} x1="30" y1="20" x2="62" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>

              {/* Hexagonal Shield Rainbow Spectrum */}
              <linearGradient id={`grad-shield-${id}`} x1="12" y1="8" x2="68" y2="72" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="25%" stopColor="#818CF8" />
                <stop offset="50%" stopColor="#C084FC" />
                <stop offset="75%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>

              {/* Colorful Glow Filter */}
              <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Hexagonal Geometric Prism Shield (Multi-colored) */}
            <path
              d="M40 8 L68 24 L68 56 L40 72 L12 56 L12 24 Z"
              stroke={`url(#grad-shield-${id})`}
              strokeWidth="2.2"
              strokeDasharray="4 2"
              fill={isDark ? 'rgba(16, 185, 129, 0.04)' : 'rgba(99, 102, 241, 0.04)'}
              opacity="0.85"
            />

            {/* Inner Prismatic Refraction Lines */}
            <path
              d="M40 14 L62 27 L62 53 L40 66 L18 53 L18 27 Z"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              strokeDasharray="2 3"
              fill="none"
            />

            {/* Architectural 'L' Form (Violet to Emerald to Cyan) */}
            <path
              d="M26 22 L26 54 L56 54"
              stroke={`url(#grad-base-${id})`}
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M26 22 L26 44"
              stroke={`url(#grad-stem-${id})`}
              strokeWidth="6.5"
              strokeLinecap="round"
            />

            {/* Discovery Refraction Beams (Amber to Coral) */}
            <path
              d="M32 30 L56 46 M42 20 L64 36"
              stroke={`url(#grad-beam-${id})`}
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.95"
            />

            {/* Glowing Multi-color Optical Node */}
            <circle
              cx="55"
              cy="27"
              r="7"
              fill="#F43F5E"
              opacity="0.35"
              filter={`url(#glow-${id})`}
            />
            <circle
              cx="55"
              cy="27"
              r="5"
              fill="#10B981"
              filter={`url(#glow-${id})`}
            />
            <circle
              cx="55"
              cy="27"
              r="2.5"
              fill="#FDE047"
            />
          </svg>
        </div>
      )}

      {/* Designed LUXA Wordmark with Vibrant Chromatic Gradients */}
      {variant !== 'mark-only' && (
        <div className="flex flex-col">
          <div className="flex items-center">
            <span
              className={`font-black font-sans uppercase leading-none ${dimensions.text} ${dimensions.tracking} text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-cyan-500 via-indigo-500 via-fuchsia-500 to-amber-500 drop-shadow-xs`}
              style={{ letterSpacing: size === 'xl' ? '0.35em' : '0.2em' }}
            >
              LUXA
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 mb-1 ml-0.5 animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>

          {size === 'xl' && (
            <span
              className={`font-mono uppercase font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-amber-300 mt-2.5 ${dimensions.sub} tracking-[0.4em]`}
            >
              AI Product Discovery
            </span>
          )}
        </div>
      )}
    </div>
  );
};
