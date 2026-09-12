import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Dumbbell, Brain, MessageSquare, Plus, Sparkles, Wand2, Coins, Flame } from 'lucide-react';
import { AttributeType, QuestDifficulty, QuestType } from '../types';
import { DIFFICULTY_CONFIG, calculateStreakMultiplier } from '../utils/leveling';

interface AddQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  onCreateQuest: (questData: {
    title: string;
    description: string;
    category: AttributeType;
    difficulty: QuestDifficulty;
    type: QuestType;
  }) => Promise<void>;
}

const PRESETS: Array<{
  title: string;
  category: AttributeType;
  difficulty: QuestDifficulty;
  type: QuestType;
  description: string;
}> = [
  {
    title: 'Morning Workout & Core Circuit',
    category: 'strength',
    difficulty: 'hard',
    type: 'daily',
    description: '45-minute strength routine and stretching.',
  },
  {
    title: 'Algorithm Study & Code Review',
    category: 'intellect',
    difficulty: 'medium',
    type: 'daily',
    description: 'Solve LeetCode katas and refactor core architecture.',
  },
  {
    title: 'Team Presentation & Active Listening',
    category: 'charisma',
    difficulty: 'medium',
    type: 'daily',
    description: 'Communicate project goals with clarity and poise.',
  },
  {
    title: 'Drink 2.5L Water & Posture Check',
    category: 'strength',
    difficulty: 'trivial',
    type: 'habit',
    description: 'Physical recovery, hydration, and alignment.',
  },
  {
    title: 'Deep Work: Read Tech Documentation',
    category: 'intellect',
    difficulty: 'hard',
    type: 'epic',
    description: '60 minutes uninterrupted focus without distractions.',
  },
];

export const AddQuestModal: React.FC<AddQuestModalProps> = ({
  isOpen,
  onClose,
  streakDays,
  onCreateQuest,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AttributeType>('strength');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('medium');
  const [type, setType] = useState<QuestType>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const multiplier = calculateStreakMultiplier(streakDays);
  const previewRewards = {
    xp: Math.round(DIFFICULTY_CONFIG[difficulty].baseXp * multiplier),
    gold: Math.round(DIFFICULTY_CONFIG[difficulty].baseGold * multiplier),
    points: DIFFICULTY_CONFIG[difficulty].attributePoints,
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setCategory(preset.category);
    setDifficulty(preset.difficulty);
    setType(preset.type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCreateQuest({
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        type,
      });
      setTitle('');
      setDescription('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/50 dark:border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Background Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Sticky Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800/80 relative z-20 bg-white/40 dark:bg-slate-900/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-cinzel text-xl font-black text-slate-900 dark:text-white tracking-tight">Create New Quest</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Set your goals and forge your legacy.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body Area */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 relative z-10 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            
            {/* Quick Presets */}
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2.5">
                <Wand2 className="w-4 h-4 text-amber-500" /> Quick Templates
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-3.5 py-2 text-[11px] bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50 dark:hover:bg-amber-900/30 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700/50 rounded-xl text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 whitespace-nowrap cursor-pointer transition-all font-semibold shadow-sm"
                  >
                    {p.title.slice(0, 26)}{p.title.length > 26 ? '...' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Title & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                    Quest Title <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Complete 45 mins of Deep Work"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                    Description & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add target metrics, rules, or criteria..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm resize-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* RPG Attribute Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  Focus Area
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setCategory('strength')}
                    className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                      category === 'strength'
                        ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 shadow-md shadow-rose-500/10'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-500 hover:border-rose-300 dark:hover:border-rose-700'
                    }`}
                  >
                    <Dumbbell className={`w-5 h-5 mx-auto mb-2 ${category === 'strength' ? 'text-rose-500' : ''}`} />
                    <div className="text-xs font-bold text-center">Strength</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('intellect')}
                    className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                      category === 'intellect'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-400 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-500 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <Brain className={`w-5 h-5 mx-auto mb-2 ${category === 'intellect' ? 'text-indigo-500' : ''}`} />
                    <div className="text-xs font-bold text-center">Intellect</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('charisma')}
                    className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                      category === 'charisma'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 shadow-md shadow-amber-500/10'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-500 hover:border-amber-300 dark:hover:border-amber-700'
                    }`}
                  >
                    <MessageSquare className={`w-5 h-5 mx-auto mb-2 ${category === 'charisma' ? 'text-amber-500' : ''}`} />
                    <div className="text-xs font-bold text-center">Charisma</div>
                  </button>
                </div>
              </div>

              {/* Difficulty Tier */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(['trivial', 'easy', 'medium', 'hard', 'legendary'] as QuestDifficulty[]).map((d) => {
                    const isActive = difficulty === d;
                    const activeColor = 
                      d === 'trivial' ? 'bg-slate-500/10 border-slate-500 text-slate-700 dark:text-slate-300' :
                      d === 'easy' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400' :
                      d === 'medium' ? 'bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-400' :
                      d === 'hard' ? 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400' :
                      'bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-400 font-black shadow-[0_0_10px_rgba(217,70,239,0.2)]';

                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={`py-2.5 px-1 rounded-xl border text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          isActive 
                            ? activeColor 
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-500 hover:border-slate-400'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quest Frequency */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                  Frequency Type
                </label>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {(['daily', 'habit', 'epic'] as QuestType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2.5 px-2 rounded-xl border text-center font-bold capitalize transition-all cursor-pointer shadow-sm ${
                        type === t
                          ? 'bg-amber-500 border-amber-500 text-white shadow-amber-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-amber-300 dark:hover:border-amber-700'
                      }`}
                    >
                      {t === 'daily' ? 'Daily' : t === 'habit' ? 'Habit' : 'Epic'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Rewards Banner */}
              <div className="p-4 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                <span className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Estimated Rewards</span>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700 dark:text-amber-400 text-xs font-black shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" /> +{previewRewards.xp} XP
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-700 dark:text-yellow-400 text-xs font-black shadow-sm">
                    <Coins className="w-3.5 h-3.5" /> +{previewRewards.gold} G
                  </div>
                  {multiplier > 1 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 rounded-lg text-orange-600 dark:text-orange-400 text-[10px] font-black" title="Streak Bonus Active">
                      <Flame className="w-3 h-3" /> {multiplier}x
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{isSubmitting ? 'Forging...' : 'Create Quest'}</span>
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};