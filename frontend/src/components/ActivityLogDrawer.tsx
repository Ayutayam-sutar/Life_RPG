import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Sparkles, Coins, Flame, Award, RefreshCw, Ghost, Swords, ArrowUpCircle, ShoppingBag, ScrollText } from 'lucide-react';
import { ActivityLog } from '../types';
import { api } from '../api/client';

interface ActivityLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'all' | 'quests' | 'shop' | 'levels';

// HACKATHON FEATURE 1: Dynamic Rarity Engine
// Calculates item rarity based on XP earned or event type to create RPG glowing borders
const getRarityStyles = (log: ActivityLog) => {
  if (log.type === 'level_up' || (log.type === 'quest_complete' && log.xpEarned >= 300)) {
    return 'border-yellow-400/60 shadow-[0_0_15px_rgba(250,204,21,0.15)] dark:border-yellow-500/50 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-900/10'; // Legendary
  }
  if (log.type === 'quest_complete' && log.xpEarned >= 200) {
    return 'border-purple-400/60 shadow-[0_0_15px_rgba(192,132,252,0.15)] dark:border-purple-500/50 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/10'; // Epic
  }
  if (log.type === 'quest_complete' && log.xpEarned >= 100) {
    return 'border-blue-400/60 shadow-[0_0_15px_rgba(96,165,250,0.15)] dark:border-blue-500/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10'; // Rare
  }
  return 'border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800/60'; // Common
};

export const ActivityLogDrawer: React.FC<ActivityLogDrawerProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // HACKATHON FEATURE 3: Tab Filtering State
  const [activeTab, setActiveTab] = useState<TabType>('all');

  useEffect(() => {
    if (isOpen) {
      loadLogs();
      setActiveTab('all'); // Reset filters when opening the drawer
    }
  }, [isOpen]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.getActivityLogs();
      setLogs(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve activity logs';
      console.error('Failed to load logs:', err);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // HACKATHON FEATURE 2: Total Collection Math (Fast & Memoized)
  const { totalXP, totalGold } = useMemo(() => {
    return logs.reduce(
      (acc, log) => ({
        totalXP: acc.totalXP + (log.xpEarned || 0),
        totalGold: acc.totalGold + (log.goldEarned || 0),
      }),
      { totalXP: 0, totalGold: 0 }
    );
  }, [logs]);

  // Apply Tab Filters
  const filteredLogs = useMemo(() => {
    if (activeTab === 'all') return logs;
    if (activeTab === 'quests') return logs.filter(l => l.type === 'quest_complete');
    if (activeTab === 'shop') return logs.filter(l => l.type === 'shop_purchase');
    if (activeTab === 'levels') return logs.filter(l => l.type === 'level_up');
    return logs;
  }, [logs, activeTab]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity">
        <motion.div
          initial={{ x: '100%', opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 240, mass: 0.9 }}
          className="w-full sm:max-w-md bg-slate-50 dark:bg-slate-900 shadow-2xl h-full flex flex-col border-l border-slate-200 dark:border-slate-800 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-inner">
                <ScrollText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-sans text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Progress Record
                </h2>
                <p className="font-sans text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Your quest history & transactions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={loadLogs}
                title="Refresh Activity Log"
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 rounded-lg transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 rounded-lg transition-all cursor-pointer active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* HACKATHON FEATURE 2 UI: Recent Haul Banner */}
          {!loading && logs.length > 0 && (
            <div className="px-4 pt-4 shrink-0">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[14px] p-3 shadow-lg shadow-indigo-500/20 flex items-center justify-between border border-indigo-400/30 text-white">
                <div className="font-sans font-bold text-[13px] tracking-wide text-indigo-50 uppercase">
                  Total Collection
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1 text-[12px] font-bold font-mono bg-black/20 px-2 py-0.5 rounded-md text-amber-300 shadow-inner border border-white/10">
                    +{totalXP} XP
                  </span>
                  <span className="flex items-center gap-1 text-[12px] font-bold font-mono bg-black/20 px-2 py-0.5 rounded-md text-yellow-300 shadow-inner border border-white/10">
                    +{totalGold} G
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* HACKATHON FEATURE 3 UI: Filter Tabs */}
          {!loading && logs.length > 0 && (
            <div className="px-4 pt-4 shrink-0 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1">
              {[
                { id: 'all', label: 'All History', icon: BookOpen },
                { id: 'quests', label: 'Quests', icon: Swords },
                { id: 'levels', label: 'Level Ups', icon: ArrowUpCircle },
                { id: 'shop', label: 'Shop', icon: ShoppingBag },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold font-sans transition-all active:scale-95 whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-800 text-white dark:bg-indigo-500/20 dark:text-indigo-300 shadow-md border border-slate-800 dark:border-indigo-500/30'
                        : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between gap-3 font-medium shrink-0">
              <span>{errorMsg}</span>
              <button
                onClick={loadLogs}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-transform"
              >
                Retry
              </button>
            </div>
          )}

          {/* Logs List Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-white dark:bg-slate-800 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-700/50 shadow-sm" />
                ))}
              </div>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  // HACKATHON FEATURE 1 UI: Applying Dynamic Rarity Styles here!
                  className={`group rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 flex flex-col gap-3 border ${getRarityStyles(log)}`}
                >
                  {/* Top Row: Icon and Title */}
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {log.type === 'quest_complete' && (
                        <div className="flex items-center justify-center w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-[12px] border border-amber-200/60 dark:border-amber-500/20 text-amber-500">
                          <Sparkles className="w-5 h-5" />
                        </div>
                      )}
                      {log.type === 'level_up' && (
                        <div className="flex items-center justify-center w-10 h-10 bg-yellow-50 dark:bg-yellow-500/10 rounded-[12px] border border-yellow-200/60 dark:border-yellow-500/20 text-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.3)]">
                          <Award className="w-5 h-5" />
                        </div>
                      )}
                      {log.type === 'shop_purchase' && (
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-[12px] border border-blue-200/60 dark:border-blue-500/20 text-blue-500">
                          <Coins className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0 flex items-center min-h-[40px]">
                      <h3 className="font-sans text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-tight break-words">
                        {log.questTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Middle Row: Description */}
                  {log.details && (
                    <p className="font-sans text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {log.details}
                    </p>
                  )}

                  {/* Bottom Row: Pill Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {log.xpEarned > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/50 text-[11px] font-bold tracking-wide shadow-sm">
                        +{log.xpEarned} XP
                      </span>
                    ) : null}

                    {log.goldEarned > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200/60 dark:border-yellow-700/50 text-[11px] font-bold tracking-wide shadow-sm">
                        +{log.goldEarned} G
                      </span>
                    ) : null}

                    {log.goldSpent !== undefined && log.goldSpent > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-700/50 text-[11px] font-bold tracking-wide shadow-sm">
                        -{log.goldSpent} G
                      </span>
                    ) : null}

                    {log.streakAtTime ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200/60 dark:border-orange-700/50 text-[11px] font-bold tracking-wide ml-auto shadow-sm">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        {log.streakAtTime} d streak
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center pb-12">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                  className="w-16 h-16 mb-4 rounded-[16px] bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <Ghost className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                </motion.div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {activeTab === 'all' ? 'No activity recorded yet' : 'No records found here'}
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-[220px] leading-relaxed">
                  {activeTab === 'all' 
                    ? 'Complete quests and daily tasks to see your chronicle unfold!'
                    : `Check back later for more ${activeTab} updates!`}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
