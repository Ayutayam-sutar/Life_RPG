import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Search, 
  Filter, 
  Dumbbell, 
  Brain, 
  MessageSquare, 
  CheckCircle2, 
  ScrollText
} from 'lucide-react';
import { Quest, AttributeType, UserCharacter } from '../types';
import { QuestCard } from './QuestCard';
import { playQuestCompleteSound, playCoinSound, playLevelUpSound, playClickSound } from '../utils/sound';

interface QuestBoardProps {
  quests: Quest[];
  character: UserCharacter;
  onCompleteQuest: (questId: string) => Promise<{ leveledUp: boolean; newLevel?: number }>;
  onUncompleteQuest: (questId: string) => Promise<void>;
  onDeleteQuest: (questId: string) => Promise<void>;
  onOpenAddModal: () => void;
  onLevelUpCelebration: (newLevel: number) => void;
}

export const QuestBoard: React.FC<QuestBoardProps> = ({
  quests,
  character,
  onCompleteQuest,
  onUncompleteQuest,
  onDeleteQuest,
  onOpenAddModal,
  onLevelUpCelebration,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | AttributeType | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const triggerCelebrationParticles = () => {
    confetti({
      particleCount: 55,
      spread: 70,
      origin: { y: 0.68 },
      colors: ['#fbbf24', '#f59e0b', '#10b981', '#6366f1', '#ec4899'],
      ticks: 180,
    });
  };

  const handleToggleComplete = async (quest: Quest) => {
    playClickSound();

    if (quest.isCompleted) {
      await onUncompleteQuest(quest.id);
    } else {
      playQuestCompleteSound();
      playCoinSound();
      triggerCelebrationParticles();

      const result = await onCompleteQuest(quest.id);
      if (result.leveledUp && result.newLevel) {
        playLevelUpSound();
        onLevelUpCelebration(result.newLevel);
      }
    }
  };

  const filteredQuests = useMemo(() => {
    return quests.filter((q) => {
      if (selectedFilter === 'active' && q.isCompleted) return false;
      if (selectedFilter === 'completed' && !q.isCompleted) return false;
      if (
        (selectedFilter === 'strength' || selectedFilter === 'intellect' || selectedFilter === 'charisma') &&
        q.category !== selectedFilter
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesDesc = (q.description || '').toLowerCase().includes(query);
        return matchesTitle || matchesDesc;
      }

      return true;
    });
  }, [quests, selectedFilter, searchQuery]);

  const activeCount = quests.filter((q) => !q.isCompleted).length;
  const completedCount = quests.filter((q) => q.isCompleted).length;

  return (
    <div className="w-full space-y-4">
      {/* Action Header & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 rounded-2xl p-4 shadow-sm">
        {/* Category & Status Filter Pills */}
        <div
          role="tablist"
          aria-label="Quest filters"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
        >
          <button
            role="tab"
            aria-selected={selectedFilter === 'all'}
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              selectedFilter === 'all'
                ? 'bg-amber-50 dark:bg-amber-950/400 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>All ({quests.length})</span>
          </button>

          <button
            role="tab"
            aria-selected={selectedFilter === 'strength'}
            onClick={() => setSelectedFilter('strength')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
              selectedFilter === 'strength'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-rose-700 hover:text-rose-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Strength</span>
          </button>

          <button
            role="tab"
            aria-selected={selectedFilter === 'intellect'}
            onClick={() => setSelectedFilter('intellect')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              selectedFilter === 'intellect'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-indigo-700 hover:text-indigo-800 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Intellect</span>
          </button>

          <button
            role="tab"
            aria-selected={selectedFilter === 'charisma'}
            onClick={() => setSelectedFilter('charisma')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              selectedFilter === 'charisma'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:text-amber-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Charisma</span>
          </button>

          <button
            role="tab"
            aria-selected={selectedFilter === 'active'}
            onClick={() => setSelectedFilter('active')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              selectedFilter === 'active'
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border border-amber-300'
                : 'text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-slate-50'
            }`}
          >
            Active ({activeCount})
          </button>

          <button
            role="tab"
            aria-selected={selectedFilter === 'completed'}
            onClick={() => setSelectedFilter('completed')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              selectedFilter === 'completed'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:text-slate-50'
            }`}
          >
            Done ({completedCount})
          </button>
        </div>

        {/* Search Input & Add Quest Trigger */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search quests & tasks..."
              aria-label="Search quests"
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors shadow-2xs"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={onOpenAddModal}
            className="flex-shrink-0 px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/400 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Plus className="w-4 h-4" />
            <span>New Quest</span>
          </motion.button>
        </div>
      </div>

      {/* Quest Cards Animated List */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {filteredQuests.length > 0 ? (
            filteredQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                streakMultiplier={character.streak.multiplier}
                onToggleComplete={handleToggleComplete}
                onDelete={onDeleteQuest}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 rounded-2xl shadow-xs"
            >
              <ScrollText className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Quests in this View</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                No tasks match your active filter. Create a new personal quest or clear the search query.
              </p>
              <button
                onClick={onOpenAddModal}
                className="mt-4 px-4 py-2 bg-amber-50 dark:bg-amber-950/400 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                + Create New Quest
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Completed Summary Footer */}
      {completedCount > 0 && (
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 pt-2 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {completedCount} quest{completedCount > 1 ? 's' : ''} completed today! Keep the momentum alive.
          </span>
        </div>
      )}
    </div>
  );
};

