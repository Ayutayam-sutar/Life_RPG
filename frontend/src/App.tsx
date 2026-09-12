import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Volume2, 
  VolumeX, 
  Plus, 
  BookOpen, 
  Coins, 
  Database, 
  LogOut, 
  Sparkles,
  Flame,
  UserCheck,
  Sun,
  Moon
} from 'lucide-react';
import { UserCharacter, Quest, AuthResponse } from './types';
import { api } from './api/client';
import { CharacterDashboard } from './components/CharacterDashboard';
import { QuestBoard } from './components/QuestBoard';
import { AddQuestModal } from './components/AddQuestModal';
import { ShopModal } from './components/ShopModal';
import { ActivityLogDrawer } from './components/ActivityLogDrawer';
import { LevelUpCelebration } from './components/LevelUpCelebration';
import { SchemaSpecModal } from './components/SchemaSpecModal';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { toggleMute, getMuteState, playClickSound } from './utils/sound';
import { useTheme } from './utils/theme';
import { DashboardSkeleton, QuestBoardSkeleton } from './components/ui/Skeleton';

export default function App() {
  // Authentication & Core State
  const [user, setUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const [character, setCharacter] = useState<UserCharacter | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Preferences State
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  // Modals State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [celebrationLevel, setCelebrationLevel] = useState<number | null>(null);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Initial Data (Strict Session Check)
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Look explicitly for your API client's token
      const token = localStorage.getItem('liferpg_jwt_token');
      if (!token) {
        setUser(null);
        setCharacter(null);
        setLoading(false);
        return;
      }

      const profile = await api.getMe();
      if (profile && profile.user) {
        setUser(profile.user);
        setCharacter(profile.character);
        const questData = await api.getQuests();
        setQuests(questData);
      }
    } catch {
      // If token is invalid, strictly clear it so we don't loop
      localStorage.removeItem('liferpg_jwt_token');
      setUser(null);
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    applyTheme();
    loadData();
    setIsAudioMuted(getMuteState());
  }, [loadData]);

  // Keyboard Shortcuts ('n' for new quest, 'b' for rewards, 'l' for activity log)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when inside inputs or textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (!user) return; // Disable shortcuts if logged out

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowAddModal(true);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setShowShopModal(true);
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setShowLogsDrawer(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const handleToggleSound = () => {
    const muted = toggleMute();
    setIsAudioMuted(muted);
    if (!muted) playClickSound();
  };

  const handleAuthSuccess = async (auth: AuthResponse) => {
    setUser(auth.user);
    setCharacter(auth.character);
    setShowAuthModal(false);
    const questData = await api.getQuests();
    setQuests(questData);
    showToast(`Welcome, ${auth.user.username}!`);
  };

  const handleStartDemo = async () => {
    try {
      setLoading(true);
      const res = await api.loginAsDemo();
      setUser(res.user);
      setCharacter(res.character);
      const questData = await api.getQuests();
      setQuests(questData);
      showToast(`Welcome to the Demo, ${res.user.username}!`);
    } catch (err: unknown) {
      showToast('Failed to load demo account.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCharacter(null);
    setQuests([]);
    showToast('Logged out successfully.');
  };

  // Optimistic Quest Completion
  const handleCompleteQuest = async (questId: string): Promise<{ leveledUp: boolean; newLevel?: number }> => {
    const prevQuests = [...quests];
    const targetQuest = quests.find((q) => q.id === questId);
    if (!targetQuest) return { leveledUp: false };

    // Optimistic UI update
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, isCompleted: true, completedAt: new Date().toISOString() } : q))
    );

    try {
      // Server anti-cheat authoritative verification
      const result = await api.completeQuest(questId);
      
      setQuests((prev) => prev.map((q) => (q.id === questId ? result.quest : q)));
      setCharacter(result.character);

      showToast(`+${result.xpGained} XP • +${result.goldGained} Gold earned!`);

      return {
        leveledUp: result.leveledUp,
        newLevel: result.newLevel,
      };
    } catch (err: unknown) {
      setQuests(prevQuests);
      const message = err instanceof Error ? err.message : 'Failed to complete quest';
      showToast(`Error: ${message}`);
      return { leveledUp: false };
    }
  };

  // Optimistic Uncomplete
  const handleUncompleteQuest = async (questId: string) => {
    const prevQuests = [...quests];
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, isCompleted: false, completedAt: undefined } : q))
    );

    try {
      const result = await api.uncompleteQuest(questId);
      setQuests((prev) => prev.map((q) => (q.id === questId ? result.quest : q)));
      setCharacter(result.character);
      showToast('Quest reopened in your task list.');
    } catch (err: unknown) {
      setQuests(prevQuests);
      const message = err instanceof Error ? err.message : 'Failed to revert quest';
      showToast(`Error: ${message}`);
    }
  };

  // Create Quest
  const handleCreateQuest = async (data: {
    title: string;
    description: string;
    category: Quest['category'];
    difficulty: Quest['difficulty'];
    type: Quest['type'];
  }) => {
    try {
      const newQuest = await api.createQuest(data);
      setQuests((prev) => [newQuest, ...prev]);
      showToast(`Quest created: "${newQuest.title}"`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Creation failed';
      showToast(`Error: ${message}`);
    }
  };

  // Delete Quest
  const handleDeleteQuest = async (questId: string) => {
    try {
      await api.deleteQuest(questId);
      setQuests((prev) => prev.filter((q) => q.id !== questId));
      showToast('Quest deleted.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Deletion failed';
      showToast(`Error: ${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-50 flex flex-col selection:bg-amber-400 selection:text-slate-950 font-sans relative">
      
      {/* Persistent Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-black border border-amber-400 text-amber-300 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Clean Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-xl flex items-center justify-center font-black shadow-inner border border-amber-200 dark:border-amber-800/50">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-cinzel text-base font-black text-slate-900 dark:text-slate-50 tracking-wider block">
                LEVIO
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-500 font-bold uppercase tracking-wider block -mt-1">
                Gamify Productivity
              </span>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
              className="p-2 sm:px-3 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl transition cursor-pointer flex items-center justify-center border border-transparent hover:border-slate-300 dark:hover:border-slate-600 group focus:outline-none"
            >
              {isDark ? (
                <Sun className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Sound Mute Toggle */}
            <button
              onClick={handleToggleSound}
              aria-label={isAudioMuted ? 'Unmute audio effects' : 'Mute audio effects'}
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-2 rounded-xl transition cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-amber-600 focus:outline-none"
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
            </button>

            {/* Dashboard-Only Buttons */}
            {user && (
              <>
                <button
                  onClick={() => setShowShopModal(true)}
                  className="hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-bold items-center gap-1.5 transition cursor-pointer bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-100 shadow-sm"
                >
                  <Coins className="w-3.5 h-3.5 text-yellow-600" />
                  <span>Rewards</span>
                </button>

                <button
                  onClick={() => setShowLogsDrawer(true)}
                  className="hidden md:flex px-3 py-1.5 rounded-xl text-xs font-semibold items-center gap-1.5 transition cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Activity</span>
                </button>
              </>
            )}

            {/* <button
              onClick={() => setShowSchemaModal(true)}
              className="hidden lg:flex px-3 py-1.5 rounded-xl text-xs font-semibold items-center gap-1.5 transition cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>Architecture</span>
            </button> */}

            {/* User Account / Auth Trigger */}
            {user ? (
              <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200 dark:border-slate-700">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-inner">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <span>{user.username}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 rounded-xl transition-all cursor-pointer font-bold text-xs shadow-sm hover:shadow-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="ml-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer hover:scale-105 active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto p-4 lg:p-8 space-y-6 max-w-7xl">
        {loading ? (
          <div className="space-y-6">
            <DashboardSkeleton />
            <QuestBoardSkeleton />
          </div>
        ) : !user || !character ? (
          <LandingPage
            onStartDemo={handleStartDemo}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Quick Tips Callout */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-slate-50">Life RPG Active:</strong> Earn XP and Gold by completing fitness, learning, and daily productivity quests.
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">Press [N] New Quest</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">Press [B] Store</span>
              </div>
            </div>

            {/* Primary Character Dashboard Component */}
            <CharacterDashboard
              character={character}
              onOpenShop={() => setShowShopModal(true)}
              onOpenLogs={() => setShowLogsDrawer(true)}
              onOpenSchema={() => setShowSchemaModal(true)}
            />

            {/* Primary Quest Board Component */}
            <QuestBoard
              quests={quests}
              character={character}
              onCompleteQuest={handleCompleteQuest}
              onUncompleteQuest={handleUncompleteQuest}
              onDeleteQuest={handleDeleteQuest}
              onOpenAddModal={() => setShowAddModal(true)}
              onLevelUpCelebration={(lvl) => setCelebrationLevel(lvl)}
            />
          </motion.div>
        )}
      </main>

      {/* Floating Action Button for Mobile (Only visible when logged in) */}
      {user && character && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowAddModal(true)}
          aria-label="Add new quest"
          className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-amber-500 hover:bg-amber-400 text-white rounded-full shadow-2xl shadow-amber-500/40 flex items-center justify-center cursor-pointer font-bold border-2 border-white dark:border-slate-900 focus:outline-none"
        >
          <Plus className="w-7 h-7" />
        </motion.button>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 dark:text-amber-500 font-bold">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Non-Linear Progression: Level XP = 100 × (Lvl ^ 1.5)</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs">
            <button
              onClick={() => setShowSchemaModal(true)}
              className="hover:text-amber-600 dark:hover:text-amber-400 underline cursor-pointer font-medium transition-colors"
            >
              View DB Architecture
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Real Database Persistence Verified</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {character && (
        <>
          <AddQuestModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            streakDays={character.streak.currentStreak}
            onCreateQuest={handleCreateQuest}
          />
          <ShopModal
            isOpen={showShopModal}
            onClose={() => setShowShopModal(false)}
            character={character}
            onCharacterUpdate={(updated) => setCharacter(updated)}
          />
          <ActivityLogDrawer
            isOpen={showLogsDrawer}
            onClose={() => setShowLogsDrawer(false)}
          />
          <LevelUpCelebration
            newLevel={celebrationLevel}
            character={character}
            onClose={() => setCelebrationLevel(null)}
          />
        </>
      )}

      <SchemaSpecModal
        isOpen={showSchemaModal}
        onClose={() => setShowSchemaModal(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

// Ensure Light Mode is strictly enforced
function applyTheme() {
  if (localStorage.getItem('liferpg_theme') === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('liferpg_theme', 'light');
  }
}