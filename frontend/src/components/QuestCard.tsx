import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  Dumbbell, 
  Brain, 
  MessageSquare, 
  Sparkles, 
  Coins, 
  Trash2, 
  Clock, 
  Flame
} from 'lucide-react';
import { Quest, AttributeType, QuestDifficulty } from '../types';
import { CelebrationSparks } from './ui/CelebrationSparks';

interface QuestCardProps {
  quest: Quest;
  streakMultiplier: number;
  onToggleComplete: (quest: Quest) => void;
  onDelete: (questId: string) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  streakMultiplier,
  onToggleComplete,
  onDelete,
}) => {
  const [showSparks, setShowSparks] = useState(false);

  // Updated to match the new Dashboard triad colors
  const getCategoryMeta = (cat: AttributeType) => {
    switch (cat) {
      case 'strength':
        return {
          icon: Dumbbell,
          label: 'Strength',
          color: 'text-rose-600 dark:text-rose-400',
          bg: 'bg-rose-500/10 border-rose-500/20',
        };
      case 'intellect':
        return {
          icon: Brain,
          label: 'Intellect',
          color: 'text-indigo-600 dark:text-indigo-400',
          bg: 'bg-indigo-500/10 border-indigo-500/20',
        };
      case 'charisma':
        return {
          icon: MessageSquare,
          label: 'Charisma',
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-500/10 border-amber-500/20',
        };
    }
  };

  // Updated with modern opacity-based glass tags
  const getDifficultyColor = (diff: QuestDifficulty) => {
    switch (diff) {
      case 'trivial':
        return 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20';
      case 'easy':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'medium':
        return 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'hard':
        return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'legendary':
        return 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30 font-bold shadow-[0_0_15px_rgba(192,38,211,0.15)]';
    }
  };

  const meta = getCategoryMeta(quest.category);
  const CategoryIcon = meta.icon;

  const handleCheckboxClick = () => {
    if (!quest.isCompleted) {
      setShowSparks(true);
      setTimeout(() => setShowSparks(false), 1200);
    }
    onToggleComplete(quest);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleCheckboxClick();
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${
        quest.isCompleted
          ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 opacity-75 grayscale-[0.3]'
          : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-300/60 dark:hover:border-amber-700/60 hover:-translate-y-0.5'
      }`}
    >
      <div className="flex items-start gap-4 relative">
        {/* Celebration particle burst container */}
        <CelebrationSparks
          active={showSparks}
          xp={quest.xpReward}
          gold={quest.goldReward}
        />

        {/* Premium Tactile Checkbox */}
        <motion.button
          type="button"
          role="checkbox"
          aria-checked={quest.isCompleted}
          aria-label={quest.isCompleted ? `Mark ${quest.title} as incomplete` : `Complete quest: ${quest.title}`}
          onClick={handleCheckboxClick}
          onKeyDown={handleKeyDown}
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          className={`relative mt-1 flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            quest.isCompleted
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-500 text-white shadow-lg shadow-orange-500/30'
              : 'bg-slate-100/50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-amber-500 dark:hover:border-amber-500 text-transparent hover:text-amber-500/40 shadow-inner'
          }`}
        >
          <motion.div
            initial={false}
            animate={{
              scale: quest.isCompleted ? 1 : 0.65,
              opacity: quest.isCompleted ? 1 : 0,
              rotate: quest.isCompleted ? 0 : -20,
            }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
          >
            <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          </motion.div>
        </motion.button>

        {/* Quest Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            
            {/* Category Tag */}
            <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5 shadow-sm ${meta.bg} ${meta.color}`}>
              <CategoryIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {meta.label}
            </span>

            {/* Difficulty Tag */}
            <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider shadow-sm ${getDifficultyColor(quest.difficulty)}`}>
              {quest.difficulty}
            </span>

            {/* Quest Type Tag */}
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
              {quest.type === 'daily' ? 'Daily Quest' : quest.type === 'habit' ? 'Habit' : 'Epic Quest'}
            </span>

            {quest.isCompleted && (
              <span className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400 font-black bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 shadow-sm ml-auto">
                COMPLETED
              </span>
            )}
          </div>

          <h2
            className={`font-bold text-base sm:text-lg tracking-tight transition-colors mt-1.5 ${
              quest.isCompleted
                ? 'text-slate-500 dark:text-slate-400 line-through decoration-slate-300 dark:decoration-slate-600'
                : 'text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400'
            }`}
          >
            {quest.title}
          </h2>

          {quest.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed font-medium">
              {quest.description}
            </p>
          )}

          {/* Reward Badges Bar */}
          <div className="flex items-center gap-2 sm:gap-3 mt-4 flex-wrap text-xs">
            
            {/* XP Yield */}
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+{quest.xpReward} XP</span>
              {streakMultiplier > 1 && !quest.isCompleted && (
                <span
                  className="text-[10px] text-orange-600 dark:text-orange-400 flex items-center ml-1 font-black bg-orange-500/10 px-1.5 py-0.5 rounded"
                  title="Active Streak Multiplier Applied"
                >
                  <Flame className="w-3 h-3 inline mr-0.5" /> {streakMultiplier}x
                </span>
              )}
            </div>

            {/* Gold Yield */}
            <div className="flex items-center gap-1.5 text-yellow-700 dark:text-yellow-400 font-bold bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/20 shadow-sm">
              <Coins className="w-3.5 h-3.5" />
              <span>+{quest.goldReward} G</span>
            </div>

            {/* Attribute Points Gain */}
            <div className={`flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-xl border shadow-sm ${meta.bg} ${meta.color}`}>
              <span>+{quest.attributeGain} {meta.label.slice(0, 3).toUpperCase()}</span>
            </div>

            {quest.completedAt && (
              <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 ml-auto font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <Clock className="w-3 h-3" />
                <span>{new Date(quest.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delete Action Button */}
        <button
          onClick={() => onDelete(quest.id)}
          aria-label={`Abandon quest: ${quest.title}`}
          title="Abandon Quest"
          className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-2 rounded-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 absolute top-0 right-0 sm:relative sm:top-auto sm:right-auto"
        >
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </motion.div>
  );
};