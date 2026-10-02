import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const KinoWelcome = ({ onComplete }) => {
  useEffect(() => {
    // Hold the splash screen active (total 4.2 seconds)
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 4200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Dot drawing coordinates timeline:
  // 1. Vertical stem of K (from 30,25 to 30,75)
  // 2. Fly to top of upper branch (from 30,75 to 65,25)
  // 3. Draw upper branch (from 65,25 to 32,50)
  // 4. Draw lower branch (from 32,50 to 65,75)
  // 5. Float up to the dot position of 'i' (from 65,75 to 85,25)
  const dotX = [30, 30, 65, 32, 65, 85];
  const dotY = [25, 75, 25, 50, 75, 25];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 bg-[#0C0A09] flex flex-col items-center justify-center z-[9999] overflow-hidden"
    >
      {/* Subtle warm ambient background glow */}
      <div className="absolute w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none z-0 translate-x-1/2 -translate-y-1/2" />

      {/* Centered logo and tagline container */}
      <div className="flex flex-col items-center gap-14 relative z-10">
        {/* SVG Animated Logo */}
        <div className="scale-[1.75] sm:scale-[2.5] transform origin-center">
          <svg
            width="220"
            height="100"
            viewBox="0 0 220 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_0_20px_rgba(234,88,12,0.2)]"
          >
            {/* LETTER K PATHS */}
            {/* Vertical Stem */}
            <motion.path
              d="M 30,25 L 30,75"
              stroke="url(#orangeGradient)"
              strokeWidth="7"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 0.8,
                ease: 'easeInOut',
                delay: 0.2,
              }}
            />

            {/* Upper Diagonal Branch */}
            <motion.path
              d="M 65,25 L 32,50"
              stroke="url(#orangeGradient)"
              strokeWidth="7"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 0.6,
                ease: 'easeInOut',
                delay: 1.2,
              }}
            />

            {/* Lower Diagonal Branch */}
            <motion.path
              d="M 32,50 L 65,75"
              stroke="url(#orangeGradient)"
              strokeWidth="7"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 0.6,
                ease: 'easeInOut',
                delay: 1.8,
              }}
            />

            {/* LETTERS 'ino' PATHS (Splashed / Faded in as dot lands) */}
            <g className="letters-ino">
              {/* i (Stem) */}
              <motion.path
                d="M 85,42 L 85,75"
                stroke="white"
                strokeWidth="7"
                strokeLinecap="round"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: 2.8,
                }}
              />

              {/* n */}
              <motion.path
                d="M 105,42 L 105,75 M 105,48 C 110,38 126,38 126,52 L 126,75"
                stroke="white"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: 3.0,
                }}
              />

              {/* o (Mathematically Perfect Circle aligned with n and i) */}
              <motion.circle
                cx="162.5"
                cy="58.5"
                r="16.5"
                stroke="white"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: 3.2,
                }}
              />
            </g>

            {/* THE DRAWING DOT */}
            <motion.circle
              r="5"
              fill="#EA580C"
              className="shadow-[0_0_15px_#EA580C]"
              initial={{ cx: 30, cy: 25, opacity: 0 }}
              animate={{
                cx: dotX,
                cy: dotY,
                opacity: [0, 1, 1, 1, 1, 1],
                scale: [1, 1.3, 1, 1.3, 1, 1.5],
              }}
              transition={{
                // Align dot movements with path drawings
                times: [0, 0.18, 0.27, 0.45, 0.63, 1], 
                duration: 2.8,
                ease: 'easeInOut',
                delay: 0.2,
              }}
            />

            {/* GRADIENTS DEFINITION */}
            <defs>
              <linearGradient id="orangeGradient" x1="30" y1="25" x2="65" y2="75" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Subtitle / Cinematic Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ delay: 3.4, duration: 1.0, ease: 'easeOut' }}
          className="text-xs sm:text-sm font-black tracking-[0.4em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-orange-100 to-amber-200 font-sans select-none text-center"
        >
          CREATE . CONNECT . GROW
        </motion.p>
      </div>
    </motion.div>
  );
};

export default KinoWelcome;
