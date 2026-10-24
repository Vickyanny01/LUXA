import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface WelcomeAnimationProps {
  onClose: () => void;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onClose }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar filling up over 2.6 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5;
      });
    }, 60);

    // Auto-transition into application after 2.8s
    const timeout = setTimeout(() => {
      onClose();
    }, 2800);

    const handleKeyDown = () => {
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      key="welcome-intro-splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 text-white select-none cursor-pointer overflow-hidden"
    >
      {/* VIBRANT COLORFUL ATMOSPHERIC AURORA MESH */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left Cyan & Emerald Aurora */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [-20, 20, -20],
            y: [-10, 15, -10],
          }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/35 via-emerald-500/25 to-transparent blur-3xl"
        />

        {/* Center-right Electric Violet & Magenta Aurora */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [20, -20, 20],
            y: [15, -15, 15],
          }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
          className="absolute top-1/4 -right-24 w-96 sm:w-[32rem] h-96 sm:h-[32rem] rounded-full bg-gradient-to-bl from-fuchsia-600/30 via-indigo-600/25 to-transparent blur-3xl"
        />

        {/* Bottom-center Sunset Amber & Coral Glow */}
        <motion.div
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="absolute -bottom-24 left-1/3 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-gradient-to-t from-amber-500/30 via-orange-500/20 to-transparent blur-3xl"
        />

        {/* Subtle dark radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(10,10,10,0.85)_80%)]" />

        {/* Refined dot grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px] opacity-10" />
      </div>

      {/* Centerpiece: ONLY Colorful Logo Emblem & Colorful Designed Name */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {/* Colorful Animated Emblem */}
        <motion.div
          initial={{ scale: 0.65, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6 sm:mb-8"
        >
          {/* Multi-color ambient aura ring behind emblem */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { repeat: Infinity, duration: 14, ease: 'linear' },
              scale: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
            }}
            className="absolute -inset-8 bg-gradient-to-tr from-emerald-500/30 via-cyan-500/30 via-violet-500/30 to-amber-500/30 rounded-full blur-2xl pointer-events-none"
          />

          <svg
            width="120"
            height="120"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
          >
            <defs>
              {/* Prism Facet 1: Electric Violet to Fuchsia */}
              <linearGradient id="splash-stem" x1="20" y1="20" x2="26" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#C084FC" />
                <stop offset="45%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>

              {/* Prism Facet 2: Emerald to Cyan */}
              <linearGradient id="splash-base" x1="26" y1="54" x2="60" y2="54" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="40%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>

              {/* Prism Facet 3: Amber to Sunset Orange to Coral */}
              <linearGradient id="splash-beam" x1="30" y1="20" x2="62" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>

              {/* Hexagonal Shield Rainbow Spectrum */}
              <linearGradient id="splash-shield" x1="12" y1="8" x2="68" y2="72" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="25%" stopColor="#818CF8" />
                <stop offset="50%" stopColor="#C084FC" />
                <stop offset="75%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>

              {/* Vibrant Glow Filter */}
              <filter id="splash-chroma-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Rainbow Prism Outer Shield */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              d="M40 8 L68 24 L68 56 L40 72 L12 56 L12 24 Z"
              stroke="url(#splash-shield)"
              strokeWidth="2.2"
              fill="rgba(99, 102, 241, 0.04)"
            />

            {/* Inner Prismatic Refraction Lines */}
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              d="M40 14 L62 27 L62 53 L40 66 L18 53 L18 27 Z"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              fill="none"
            />

            {/* Architectural 'L' Form (Violet to Emerald to Cyan) */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
              d="M26 22 L26 54 L56 54"
              stroke="url(#splash-base)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
              d="M26 22 L26 44"
              stroke="url(#splash-stem)"
              strokeWidth="6.5"
              strokeLinecap="round"
            />

            {/* Discovery Refraction Beams (Amber to Coral) */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.95 }}
              transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
              d="M32 30 L56 46 M42 20 L64 36"
              stroke="url(#splash-beam)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Glowing Multi-color Optical Node */}
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.5 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              cx="55"
              cy="27"
              r="8"
              fill="#F43F5E"
              filter="url(#splash-chroma-glow)"
            />
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              cx="55"
              cy="27"
              r="5.5"
              fill="#10B981"
              filter="url(#splash-chroma-glow)"
            />
            <circle
              cx="55"
              cy="27"
              r="2.5"
              fill="#FEF08A"
            />
          </svg>
        </motion.div>

        {/* Colorful Designed Brand Name Typography */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center pl-4 sm:pl-6">
            <h1
              className="font-black font-sans text-6xl sm:text-7xl md:text-8xl tracking-[0.35em] sm:tracking-[0.45em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 via-indigo-400 via-fuchsia-400 to-amber-400 drop-shadow-[0_4px_24px_rgba(16,185,129,0.25)]"
            >
              LUXA
            </h1>
            <motion.span
              animate={{
                scale: [1, 1.45, 1],
                boxShadow: [
                  '0 0 10px #10B981, 0 0 20px #06B6D4',
                  '0 0 18px #F59E0B, 0 0 30px #EC4899',
                  '0 0 10px #10B981, 0 0 20px #06B6D4',
                ],
              }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-300 mb-2 sm:mb-4 ml-[-0.1em]"
            />
          </div>

          {/* Vibrant Colorful Sub-label */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.25em' }}
            animate={{ opacity: 1, letterSpacing: '0.45em' }}
            transition={{ duration: 0.9, delay: 0.55 }}
            className="mt-3 sm:mt-4 text-[11px] sm:text-xs font-mono font-bold tracking-[0.45em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-amber-300 drop-shadow-sm"
          >
            AI PRODUCT DISCOVERY
          </motion.p>
        </motion.div>
      </div>

      {/* Colorful Rainbow Progress Line & Tap Prompt */}
      <div className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-3.5 px-6 z-10">
        <div className="w-40 sm:w-56 h-1 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <motion.div
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 via-indigo-500 via-fuchsia-500 to-amber-400 rounded-full transition-all duration-75 shadow-[0_0_12px_#34d399]"
          />
        </div>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.45, 0.9, 0.45] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="text-[10px] sm:text-[11px] font-sans font-medium tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-neutral-300 via-white to-neutral-300 hover:from-emerald-300 hover:to-cyan-300 transition-all"
        >
          Tap anywhere to enter
        </motion.span>
      </div>
    </motion.div>
  );
};
