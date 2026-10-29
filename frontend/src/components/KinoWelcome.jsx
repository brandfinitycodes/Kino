import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KinoWelcome = ({ onComplete }) => {
  const [phase, setPhase] = useState('launch'); // launch -> pulse -> unfold -> shine

  useEffect(() => {
    // Stage sequence
    const t1 = setTimeout(() => setPhase('pulse'), 850);
    const t2 = setTimeout(() => setPhase('unfold'), 1300);
    const t3 = setTimeout(() => setPhase('shine'), 2200);

    // End splash and transition smoothly into app
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 3900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 bg-[#090807] flex flex-col items-center justify-center z-[9999] overflow-hidden select-none"
    >
      {/* Ambient background glows */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-orange-600/15 to-amber-500/10 rounded-full blur-[140px] pointer-events-none z-0 -translate-y-10" />
      <div className="absolute w-[350px] h-[350px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none z-0 translate-y-32" />

      {/* Floating subtle micro-sparkles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: `${15 + i * 14}%`,
              y: '65%',
              opacity: 0,
              scale: 0.5
            }}
            animate={{
              y: ['65%', '35%'],
              opacity: [0, 0.7, 0],
              scale: [0.5, 1, 0.3]
            }}
            transition={{
              duration: 2.5 + (i % 3) * 0.5,
              repeat: Infinity,
              delay: 0.3 * i,
              ease: 'easeOut'
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-300 blur-[0.5px]"
          />
        ))}
      </div>

      {/* Main Branding Stage */}
      <div className="relative z-10 flex flex-col items-center gap-7 px-4">
        
        {/* Glow badge pill backing */}
        <div className="relative flex items-center justify-center">
          
          {/* Radial shockwave on arrow pulse */}
          <AnimatePresence>
            {phase !== 'launch' && (
              <motion.div
                key="shockwave"
                initial={{ scale: 0.6, opacity: 0.9 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="absolute w-36 h-36 rounded-full border border-orange-500/40 bg-orange-500/10 blur-sm pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Shooting Growth Arrow Pulse */}
          <AnimatePresence>
            {phase !== 'launch' && (
              <motion.div
                key="growth-arrow"
                initial={{ x: -95, y: 25, scale: 0.5, opacity: 0 }}
                animate={{
                  x: [-95, -65, -35],
                  y: [25, -45, -75],
                  scale: [0.5, 1.4, 0.9],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                className="absolute z-20 pointer-events-none flex items-center justify-center"
              >
                <div className="relative">
                  {/* Arrow Head Icon */}
                  <svg
                    width="34"
                    height="34"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_15px_#EA580C]"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                  {/* Glowing comet tail */}
                  <div className="absolute top-3 left-3 w-10 h-10 bg-orange-500/35 rounded-full blur-lg -z-10" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ambient Backlight Glow behind the logo stage */}
          <div className="absolute -inset-6 bg-gradient-to-r from-orange-500/30 via-amber-500/25 to-orange-600/30 blur-3xl rounded-[48px] pointer-events-none" />

          {/* Logo Assembly Container (Enlarged Sleek Dark Obsidian Glass Stage with Luminous Glow) */}
          <div className="relative overflow-hidden flex items-center px-8 py-5 sm:px-12 sm:py-7 md:px-14 md:py-8 rounded-[32px] sm:rounded-[40px] bg-white/[0.05] backdrop-blur-2xl border border-white/15 shadow-[0_0_80px_rgba(234,88,12,0.35),0_30px_70px_rgba(0,0,0,0.85)]">
            
            {/* Shimmer light sweep across the logo */}
            {phase === 'shine' && (
              <motion.div
                initial={{ x: '-120%' }}
                animate={{ x: '250%' }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                className="absolute inset-y-0 w-36 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none z-30"
              />
            )}

            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Fox Cart 'G' Emblem - Launches with rolling momentum */}
              <motion.div
                initial={{ x: -200, opacity: 0, rotate: -35, scale: 0.7 }}
                animate={{
                  x: 0,
                  opacity: 1,
                  rotate: [ -35, 6, -3, 0 ],
                  scale: [ 0.7, 1.08, 0.97, 1 ]
                }}
                transition={{
                  duration: 0.85,
                  ease: [0.175, 0.885, 0.32, 1.15]
                }}
                className="relative shrink-0 flex items-center justify-center"
              >
                <img
                  src="/growfox-icon-darkmode.png"
                  alt="GrowFox Emblem"
                  className="h-16 sm:h-24 md:h-28 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                />
              </motion.div>

              {/* "row Fox" Typography - Unrolls outward to the right */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{
                  width: phase === 'launch' ? 0 : 'auto',
                  opacity: phase === 'launch' ? 0 : 1
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="overflow-hidden flex items-center shrink-0"
              >
                <motion.div
                  initial={{ x: -25, opacity: 0 }}
                  animate={{
                    x: phase === 'launch' ? -25 : 0,
                    opacity: phase === 'launch' ? 0 : 1
                  }}
                  transition={{
                    duration: 0.6,
                    ease: 'easeOut',
                    delay: 0.05
                  }}
                  className="flex items-center"
                >
                  <img
                    src="/growfox-text-darkmode.png"
                    alt="GrowFox Text"
                    className="h-11 sm:h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] pr-1.5"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Sleek Animated Divider */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: phase === 'launch' ? 0 : 240,
            opacity: phase === 'launch' ? 0 : 0.8
          }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="relative h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_#F59E0B]" />
        </motion.div>

        {/* Cinematic Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10, letterSpacing: '0.25em' }}
          animate={{
            opacity: phase === 'launch' ? 0 : 0.9,
            y: phase === 'launch' ? 10 : 0,
            letterSpacing: '0.42em'
          }}
          transition={{ duration: 0.9, delay: 0.35, ease: 'easeOut' }}
          className="text-[10px] sm:text-xs font-black tracking-[0.42em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-amber-100 to-orange-200 font-sans select-none text-center"
        >
          CREATE • CONNECT • GROW
        </motion.p>
      </div>
    </motion.div>
  );
};

export default KinoWelcome;
