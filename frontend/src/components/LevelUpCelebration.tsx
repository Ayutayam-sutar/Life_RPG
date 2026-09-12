import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Award, Sparkles, Flame, Shield, ArrowRight } from 'lucide-react';
import { UserCharacter } from '../types';

interface LevelUpCelebrationProps {
  newLevel: number | null;
  character: UserCharacter;
  onClose: () => void;
}

export const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({
  newLevel,
  character,
  onClose,
}) => {
  useEffect(() => {
    if (newLevel) {
      const end = Date.now() + 1500;
      const interval: NodeJS.Timeout = setInterval(() => {
        if (Date.now() > end) {
          return clearInterval(interval);
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#fbbf24', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [newLevel]);

  if (!newLevel) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-3xl shadow-2xl p-7 text-center relative overflow-hidden"
        >
          {/* Glowing Aura */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-50 dark:bg-amber-950/400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-50 dark:bg-amber-950/400/15 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Trophy */}
          <div className="w-20 h-20 mx-auto mb-3 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 rounded-2xl flex items-center justify-center p-3 shadow-md shadow-amber-500/15">
            <Award className="w-12 h-12 text-amber-600 animate-bounce" />
          </div>

          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            Level Up Achieved!
          </span>
          <h2 className="font-cinzel text-3xl font-black text-slate-900 dark:text-slate-50 mt-1 mb-2">
            LEVEL {newLevel}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">
            Your real-world consistency has unlocked new rank and capabilities! Keep up the momentum.
          </p>

          {/* New Title Card */}
          <div className="mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl inline-block w-full">
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-800 dark:text-amber-200">
              Unlocked Rank Title
            </div>
            <div className="font-cinzel text-base font-bold text-amber-900 dark:text-amber-100 mt-0.5">
              "{character.title || 'Level 5 Achiever'}"
            </div>
          </div>

          {/* Stat Boost Preview */}
          <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-semibold">
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
              <Shield className="w-4 h-4 mx-auto mb-1 text-rose-500" />
              <div>STR {character.attributes.strength.level}</div>
            </div>
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700">
              <Sparkles className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
              <div>INT {character.attributes.intellect.level}</div>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200">
              <Flame className="w-4 h-4 mx-auto mb-1 text-amber-500" />
              <div>CHA {character.attributes.charisma.level}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full py-3 bg-amber-50 dark:bg-amber-950/400 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

