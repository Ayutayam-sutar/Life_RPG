import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Shield, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  Dumbbell, 
  Brain, 
  MessageSquare, 
  Coins, 
  ShoppingBag, 
  TrendingUp, 
  Zap, 
  Play,
  Check,
  ChevronRight
} from 'lucide-react';
import { playQuestCompleteSound } from '../utils/sound';

interface LandingPageProps {
  onStartDemo: () => void;
  onOpenAuth: () => void;
  onGoToDashboard?: () => void;
  isAuthenticated?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDemo,
  onOpenAuth,
  onGoToDashboard,
  isAuthenticated = false,
}) => {
  const [demoQuestCompleted, setDemoQuestCompleted] = useState(false);
  const [demoXp, setDemoXp] = useState(350);
  const [demoGold, setDemoGold] = useState(120);
  const [showDemoFloat, setShowDemoFloat] = useState(false);

  const handleInteractiveDemoToggle = () => {
    if (!demoQuestCompleted) {
      playQuestCompleteSound();
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.65 },
        colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899'],
      });
      setDemoQuestCompleted(true);
      setDemoXp((prev) => prev + 100);
      setDemoGold((prev) => prev + 50);
      setShowDemoFloat(true);
      setTimeout(() => setShowDemoFloat(false), 2200);
    } else {
      setDemoQuestCompleted(false);
      setDemoXp((prev) => Math.max(350, prev - 100));
      setDemoGold((prev) => Math.max(120, prev - 50));
    }
  };

  // Animation variants for staggered rendering
  // Animation variants for staggered rendering
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full space-y-24 sm:space-y-32 pb-24 selection:bg-amber-500/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 text-center">
        {/* Dynamic Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-b from-amber-300/40 via-orange-200/20 to-transparent dark:from-amber-900/30 dark:via-orange-950/20 blur-[100px] pointer-events-none -z-10 rounded-full" />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 -right-20 w-96 h-96 bg-indigo-200/50 dark:bg-indigo-900/30 rounded-full blur-[100px] pointer-events-none -z-10" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-32 -left-20 w-96 h-96 bg-amber-200/50 dark:bg-amber-900/20 rounded-full blur-[100px] pointer-events-none -z-10" 
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300 dark:border-amber-500/30 bg-white/50 dark:bg-slate-900/50 text-amber-900 dark:text-amber-200 text-xs font-bold mb-8 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Gamified Productivity Engine • v2.0</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Neon DB Powered</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-cinzel font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]"
          >
            Gamify Your Life.{' '}
            <span className="block mt-2 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent drop-shadow-sm">
              Level Up Reality.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Transform coding sprints, gym sessions, and daily habits into tangible XP, gold, and rewards. Experience a non-linear progression system built for high achievers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {isAuthenticated && onGoToDashboard ? (
              <button
                onClick={onGoToDashboard}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl shadow-xl shadow-orange-500/20 dark:shadow-orange-900/40 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={onStartDemo}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl shadow-xl shadow-orange-500/20 dark:shadow-orange-900/40 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play as Ayutayam</span>
                </button>

                <button
                  onClick={onOpenAuth}
                  className="w-full sm:w-auto px-8 py-4 bg-white/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all hover:border-slate-300 dark:hover:border-slate-500 backdrop-blur-md"
                >
                  <span>Sign In / Register</span>
                </button>
              </>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free to play
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Neon DB Cloud Sync
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time Analytics
            </span>
          </motion.div>
        </div>

        {/* Aceternity Style Interactive Component */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 max-w-2xl mx-auto px-4"
        >
          <div className="relative group rounded-3xl p-[1.5px] bg-gradient-to-b from-amber-400/50 via-orange-500/20 to-slate-200 dark:from-amber-500/30 dark:via-orange-500/10 dark:to-slate-800 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-400/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
            <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl rounded-[22px] p-6 border border-white/50 dark:border-slate-800 text-left relative z-10 overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                      Live Quest Engine
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Hero: Ayutayam • Level 5</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/50">
                    {demoXp} / 500 XP
                  </span>
                  <span className="flex items-center gap-1 text-yellow-700 dark:text-yellow-400 font-bold bg-yellow-50 dark:bg-yellow-900/30 px-2.5 py-1 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
                    <Coins className="w-3.5 h-3.5" />
                    {demoGold} Gold
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-5 w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/50 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  initial={{ width: '70%' }}
                  animate={{ width: demoQuestCompleted ? '90%' : '70%' }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>

              {/* Interactive Quest Row */}
              <div className="mt-5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-4 relative overflow-hidden transition-colors hover:border-amber-400 dark:hover:border-amber-500/50">
                <AnimatePresence>
                  {showDemoFloat && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.8 }}
                      animate={{ opacity: 1, y: -25, scale: 1 }}
                      exit={{ opacity: 0, y: -45 }}
                      className="absolute right-16 top-4 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 pointer-events-none bg-amber-100 dark:bg-amber-900/80 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700 shadow-lg"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>+100 XP • +50 Gold!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-4 min-w-0">
                  <button
                    onClick={handleInteractiveDemoToggle}
                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm ${
                      demoQuestCompleted
                        ? 'bg-amber-500 border-amber-500 text-white dark:text-slate-900 shadow-amber-500/30'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-amber-500 dark:hover:border-amber-500'
                    }`}
                  >
                    {demoQuestCompleted && <Check className="w-5 h-5 stroke-[3]" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px]">
                        Intellect • Daily
                      </span>
                    </div>
                    <p className={`text-sm sm:text-base font-bold mt-1 transition-colors duration-300 ${
                      demoQuestCompleted 
                        ? 'line-through text-slate-400 dark:text-slate-600' 
                        : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      Complete 45 Minutes of Deep Work
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleInteractiveDemoToggle}
                  className="flex-shrink-0 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-slate-900 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors"
                >
                  {demoQuestCompleted ? 'Undo' : 'Check Off'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-cinzel font-bold text-slate-900 dark:text-white">
            Engineered for Life
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4">
            A system designed to replace hollow dopamine loops with tangible, real-world momentum.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 shadow-sm hover:shadow-xl dark:hover:shadow-amber-500/5 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Non-Linear Leveling</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              XP scales smoothly. Early levels come quickly to build habits, while master ranks demand true long-term dedication and discipline.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 shadow-sm hover:shadow-xl dark:hover:shadow-orange-500/5 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Flame className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Streak Multipliers</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Maintain daily completions to unlock up to <strong>1.5× bonus multipliers</strong>. Protect your momentum with emergency streak shields.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Triad Attributes</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Categorize tasks into Strength (fitness), Intellect (deep work), and Charisma (social). Balance your real-world character profile.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={itemVariants} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 shadow-sm hover:shadow-xl dark:hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Rewards Store</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Exchange earned Gold for real-life self-rewards—a guilt-free movie night, gaming gear, or specialty coffee.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* User Interface Dashboard Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-14 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">
              Personalized Experience
            </span>
            <h3 className="text-3xl sm:text-4xl font-cinzel font-bold text-slate-900 dark:text-white mt-3">
              Your Real-Life Identity
            </h3>
          </div>

          {/* Glass Mockup Dashboard Card */}
          <div className="max-w-3xl mx-auto bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border border-white/50 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            {/* Top Bar of Mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200/50 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-cinzel font-black text-2xl shadow-lg shadow-amber-500/20">
                  5
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="font-cinzel text-xl font-bold text-slate-900 dark:text-white">Ayutayam</h4>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                      Level 5 Achiever
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Title: Fledgling Strategist • 1,250 Total XP</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-bold text-yellow-600 dark:text-yellow-500">
                  <Coins className="w-4 h-4" />
                  <span>420 Gold</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-sm font-bold text-orange-600 dark:text-orange-500">
                  <Flame className="w-4 h-4" />
                  <span>4 Days (1.15×)</span>
                </div>
              </div>
            </div>

            {/* Three Attribute Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-sm font-bold text-rose-600 dark:text-rose-500 mb-2">
                  <span className="flex items-center gap-1.5"><Dumbbell className="w-4 h-4" /> Strength</span>
                  <span>Lvl 4</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div className="p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  <span className="flex items-center gap-1.5"><Brain className="w-4 h-4" /> Intellect</span>
                  <span>Lvl 5</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              <div className="p-4 bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-sm font-bold text-amber-600 dark:text-amber-500 mb-2">
                  <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> Charisma</span>
                  <span>Lvl 3</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center max-w-3xl mx-auto px-4">
        <h2 className="text-4xl sm:text-5xl font-cinzel font-bold text-slate-900 dark:text-white">
          Ready to Level Up?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 mb-10">
          Join high-performers transforming everyday discipline into an engaging adventure.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <button
            onClick={onStartDemo}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl shadow-xl shadow-orange-500/20 dark:shadow-orange-900/40 transition-all hover:scale-105"
          >
            Start Playing Free Now
          </button>
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-10 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl shadow-sm transition-all"
          >
            Sign In / Register
          </button>
        </div>
      </section>
    </div>
  );
};