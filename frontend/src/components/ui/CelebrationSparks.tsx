import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Coins } from 'lucide-react';

interface CelebrationSparksProps {
  active: boolean;
  xp: number;
  gold: number;
}

export const CelebrationSparks: React.FC<CelebrationSparksProps> = ({
  active,
  xp,
  gold,
}) => {
  if (!active) return null;

  // 8 radial spark trajectories
  const particles = [
    { x: -36, y: -28, scale: 1.1, color: '#fbbf24' },
    { x: 36, y: -30, scale: 0.9, color: '#f59e0b' },
    { x: -44, y: 10, scale: 0.8, color: '#10b981' },
    { x: 44, y: 12, scale: 1.2, color: '#6366f1' },
    { x: -20, y: -42, scale: 1.0, color: '#ec4899' },
    { x: 22, y: -44, scale: 0.9, color: '#fbbf24' },
    { x: -16, y: 28, scale: 0.7, color: '#eab308' },
    { x: 18, y: 26, scale: 0.8, color: '#3b82f6' },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible z-30 flex items-center justify-center">
      {/* Shockwave Halo */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0.9 }}
        animate={{ scale: 2.2, opacity: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="absolute w-12 h-12 rounded-full border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.6)]"
      />

      {/* Burst Particles */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0],
            scale: [0, p.scale, 0],
          }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.02 }}
          style={{ backgroundColor: p.color }}
          className="absolute w-2 h-2 rounded-full shadow-lg"
        />
      ))}

      {/* Floating XP & Gold Floaters */}
      <motion.div
        initial={{ y: 0, opacity: 0, scale: 0.6 }}
        animate={{ y: -42, opacity: [0, 1, 1, 0], scale: 1 }}
        transition={{ duration: 1.1, times: [0, 0.2, 0.7, 1], ease: 'easeOut' }}
        className="absolute -top-6 flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-amber-300 text-xs rounded-full border border-amber-400/90 shadow-lg shadow-amber-500/20 backdrop-blur-md"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="font-bold tracking-tight">+{xp} XP</span>
        <span className="text-slate-500">•</span>
        <Coins className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-yellow-400 font-bold">+{gold} G</span>
      </motion.div>
    </div>
  );
};
