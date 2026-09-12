import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame, Coins, Dumbbell, Brain, MessageSquare, Shield, Sparkles, Award,
  Crown, BookOpen, Sword, Coffee, Cpu, Pencil, Lock, Palette, Shirt,
  UserRound, Zap, ChevronRight, X, ArrowUpRight
} from 'lucide-react';
import { UserCharacter, AttributeType } from '../types';

interface CharacterDashboardProps {
  character: UserCharacter;
  onOpenShop: () => void;
  onOpenLogs: () => void;
  onOpenSchema: () => void;
}

type Role = 'strength' | 'intellect' | 'charisma';

const stages = [
  ['Novice', 'The Beginner', '🌱'], ['Learner', 'The Student', '📚'], ['Explorer', 'The Explorer', '🧭'],
  ['Builder', 'The Builder', '🔨'], ['Communicator', 'The Communicator', '💬'], ['Strategist', 'The Strategist', '♟️'],
  ['Creator', 'The Creator', '🎨'], ['Leader', 'The Leader', '👑'], ['Champion', 'The Champion', '⚔️'], ['Legend', 'The Legend', '✨'],
  ['Master', 'The Master', '🧙'], ['Hero', 'The Hero', '🛡️'], ['Sage', 'The Sage', '🔮'], ['Commander', 'The Commander', '🏹'],
  ['Elite', 'The Elite', '💎'], ['Guardian', 'The Guardian', '🌌'], ['Mythic', 'The Mythic', '🔥'], ['Ascendant', 'The Ascendant', '☄️'],
  ['Immortal', 'The Immortal', '🌟'], ['Transcendent', 'The Transcendent', '👾'],
] as const;

const roleMeta: Record<Role, { label: string; icon: React.ElementType; color: string; quote: string }> = {
  strength: { label: 'Athlete', icon: Dumbbell, color: '#fb7185', quote: 'Train the body, sharpen the will.' },
  intellect: { label: 'Scholar', icon: Brain, color: '#38bdf8', quote: 'Knowledge compounds every day.' },
  charisma: { label: 'Communicator', icon: MessageSquare, color: '#f472b6', quote: 'Ideas become reality when we share them.' },
};

const avatarThemes = [
  { name: 'Violet', main: '#8b5cf6', accent: '#22d3ee' },
  { name: 'Rose', main: '#ec4899', accent: '#f97316' },
  { name: 'Cyan', main: '#06b6d4', accent: '#a78bfa' },
  { name: 'Indigo', main: '#6366f1', accent: '#f472b6' },
  { name: 'Amber', main: '#f59e0b', accent: '#ef4444' },
];

const hairOptions = ['#3f2a20', '#111827', '#7c2d12', '#164e63', '#581c87', '#b91c1c', '#d97706', '#9ca3af'];
const outfitOptions = ['#334155', '#4c1d95', '#155e75', '#9f1239', '#365314', '#b45309', '#0f172a', '#1e3a8a'];

function dominantRole(character: UserCharacter): Role {
  const attrs = character.attributes;
  const entries: [Role, number][] = [
    ['strength', attrs.strength.level],
    ['intellect', attrs.intellect.level],
    ['charisma', attrs.charisma.level],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function EvolutionAvatar({ level, role, hair, outfit, accent }: { level: number; role: Role; hair: string; outfit: string; accent: string }) {
  const stage = Math.min(20, Math.max(1, level));
  const roleInfo = roleMeta[role];
  const helmet = stage >= 8;
  const cape = stage >= 12;
  const glow = stage >= 16;
  const prop = role === 'strength' ? 'dumbbell' : role === 'intellect' ? 'book' : 'chat';
  
  return (
    <motion.div 
      key={`${stage}-${role}-${hair}-${outfit}`} 
      initial={{ opacity: 0, scale: 0.86, y: 8 }} 
      animate={{ opacity: 1, scale: 1, y: 0 }} 
      transition={{ type: 'spring', stiffness: 220, damping: 18 }} 
      className="w-full h-full relative flex items-center justify-center"
    >
      {glow && (
        <div 
          className="absolute inset-2 rounded-2xl blur-2xl opacity-40 dark:opacity-60 mix-blend-screen" 
          style={{ background: `radial-gradient(circle, ${roleInfo.color}, transparent 68%)` }} 
        />
      )}
      <svg viewBox="0 0 40 40" className="relative w-full h-full drop-shadow-xl" shapeRendering="crispEdges" aria-label={`${roleInfo.label} level ${stage} avatar`}>
        {cape && <path d="M8 24 L3 34 L12 32 L20 37 L28 32 L37 34 L32 24Z" fill={accent} opacity=".9" />}
        {helmet ? <path d="M10 10 Q20 3 30 10 L30 16 L10 16Z" fill={accent} /> : <path d="M11 8 Q20 3 29 8 L31 15 L9 15Z" fill={hair} />}
        <rect x="12" y="12" width="16" height="12" rx="3" fill="#f5c6a5" />
        <rect x="15" y="16" width="3" height="3" fill="#111827" />
        <rect x="22" y="16" width="3" height="3" fill="#111827" />
        <rect x="18" y="21" width="5" height="1.5" fill="#7f1d1d" />
        {helmet && <rect x="9" y="12" width="22" height="3" fill={accent} />}
        <path d="M10 25 L30 25 L33 37 L7 37Z" fill={outfit} />
        <rect x="17" y="27" width="6" height="7" rx="1" fill={accent} />
        <rect x="8" y="26" width="5" height="3" fill="#f5c6a5" />
        <rect x="27" y="26" width="5" height="3" fill="#f5c6a5" />
        <rect x="11" y="36" width="7" height="2" fill="#111827" />
        <rect x="22" y="36" width="7" height="2" fill="#111827" />
        {stage >= 4 && <rect x="4" y="20" width="3" height="10" fill={accent} />}
        {prop === 'dumbbell' && <><rect x="33" y="20" width="3" height="10" fill={accent} /><rect x="31" y="18" width="7" height="3" fill={accent} /><rect x="31" y="29" width="7" height="3" fill={accent} /></>}
        {prop === 'book' && <><rect x="32" y="20" width="7" height="9" rx="1" fill={accent} /><path d="M32 20 L35.5 22 L39 20" stroke="#fff" strokeWidth="1" fill="none" /></>}
        {prop === 'chat' && <><rect x="31" y="17" width="8" height="7" rx="2" fill="#fff" /><path d="M33 24 L32 27 L36 24" fill="#fff" /><circle cx="34" cy="20.5" r=".7" fill={roleInfo.color} /><circle cx="37" cy="20.5" r=".7" fill={roleInfo.color} /></>}
        {stage >= 18 && <circle cx="20" cy="6" r="2" fill="#fbbf24" />}
      </svg>
    </motion.div>
  );
}

export const CharacterDashboard: React.FC<CharacterDashboardProps> = ({ character, onOpenShop, onOpenLogs, onOpenSchema }) => {
  const [customOpen, setCustomOpen] = useState(false);
  const [themeIndex, setThemeIndex] = useState(0);
  const [hair, setHair] = useState(hairOptions[0]);
  const [outfit, setOutfit] = useState(outfitOptions[0]);
  
  const premiumUnlocked = character.level >= 6;
  const role = dominantRole(character);
  const roleInfo = roleMeta[role];
  const RoleIcon = roleInfo.icon;
  const stageIndex = Math.min(character.level, 20) - 1;
  const stage = stages[stageIndex];
  const xpPercent = Math.max(0, Math.min(100, character.progressPercent));
  const nextXp = Math.max(0, character.nextLevelXp - character.currentLevelXp);
  const avatarKey = `life-rpg-avatar-${character.id}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(avatarKey) || '{}');
      if (typeof saved.themeIndex === 'number') setThemeIndex(saved.themeIndex % avatarThemes.length);
      if (saved.hair) setHair(saved.hair);
      if (saved.outfit) setOutfit(saved.outfit);
    } catch {}
  }, [avatarKey]);

  const saveCustomization = (nextTheme: number, nextHair: string, nextOutfit: string) => {
    setThemeIndex(nextTheme); 
    setHair(nextHair); 
    setOutfit(nextOutfit);
    try { localStorage.setItem(avatarKey, JSON.stringify({ themeIndex: nextTheme, hair: nextHair, outfit: nextOutfit })); } catch {}
  };

  const attributes = useMemo(() => [
    { key: 'strength' as const, label: 'Strength', icon: Dumbbell, color: 'text-rose-500', bg: 'bg-rose-500', stats: character.attributes.strength },
    { key: 'intellect' as const, label: 'Intellect', icon: Brain, color: 'text-indigo-500', bg: 'bg-indigo-500', stats: character.attributes.intellect },
    { key: 'charisma' as const, label: 'Charisma', icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-500', stats: character.attributes.charisma },
  ], [character]);

  const getBadgeIcon = (badgeId?: string) => {
    switch (badgeId) {
      case 'badge_pixel_sword': return <Sword className="w-4 h-4 text-amber-500" />;
      case 'badge_grimoire': return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'title_shadow_monarch': return <Crown className="w-4 h-4 text-yellow-500" />;
      default: return <Award className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <section className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden transition-colors">
      
      {/* Dynamic Ambient Glow */}
      <div 
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 dark:opacity-30 mix-blend-screen"
        style={{ background: `radial-gradient(circle, ${roleInfo.color}, transparent 70%)` }}
      />

      {/* Top Profile Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between pb-8 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
        
        {/* Avatar & Info */}
        <div className="flex items-center gap-5">
          <div 
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 shadow-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex-shrink-0"
            style={{ boxShadow: `0 10px 30px -10px ${roleInfo.color}40` }}
          >
            <EvolutionAvatar level={character.level} role={role} hair={hair} outfit={outfit} accent={avatarThemes[themeIndex].main} />
            <div className="absolute -bottom-2 -right-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs px-2.5 py-1 rounded-lg shadow-md border-2 border-white dark:border-slate-900">
              LVL {character.level}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-cinzel text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {character.name || 'Hero'}
              </h1>
              {premiumUnlocked && (
                <button 
                  onClick={() => setCustomOpen(true)} 
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors shadow-sm" 
                  title="Customize Avatar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
              <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                {stage[0]}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-400">Level {character.level}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium pt-1" style={{ color: roleInfo.color }}>
              <RoleIcon className="w-4 h-4" />
              <span>{roleInfo.label} Path</span>
              <span className="text-slate-400 mx-1">•</span>
              <span className="text-slate-500 dark:text-slate-400">Tier {Math.ceil(character.level / 5)}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium pt-1">
              “{roleInfo.quote}”
            </p>
          </div>
        </div>

        {/* Action Stats HUD */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenShop}
            className="flex-1 md:flex-none flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 rounded-2xl transition-all cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-500">Vault</div>
              <div className="font-black text-sm text-slate-900 dark:text-white">{character.gold} Gold</div>
            </div>
          </motion.button>

          <div className="flex-1 md:flex-none flex items-center gap-3 px-4 py-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 rounded-2xl shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-orange-700 dark:text-orange-500">Streak</div>
              <div className="font-black text-sm text-slate-900 dark:text-white">{character.streak.currentStreak} Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Experience Progress */}
      <div className="mt-8 relative z-10">
        <div className="flex justify-between items-end mb-2.5 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 dark:text-white uppercase tracking-wide">
              Level {character.level} Progression
            </span>
            <span className="text-slate-500 font-medium text-xs hidden sm:inline">
              ({character.currentLevelXp} / {character.nextLevelXp} XP)
            </span>
          </div>
          <div className="font-bold text-amber-600 dark:text-amber-400 text-lg">
            {xpPercent}%
          </div>
        </div>

        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-full p-0.5 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>
        
        <div className="flex justify-between items-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-medium">
          <span>Total Earned: <strong className="text-slate-700 dark:text-slate-300">{character.totalXp.toLocaleString()} XP</strong></span>
          <span>{nextXp} XP to next level</span>
        </div>
      </div>

      {/* Premium Customization Banner */}
      <div className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Premium Avatar Workshop</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {premiumUnlocked ? 'Unlocked! Customize your evolved hero avatar.' : 'Reach Level 6 to unlock custom colors & gear.'}
            </p>
          </div>
        </div>
        <button 
          disabled={!premiumUnlocked} 
          onClick={() => setCustomOpen(true)} 
          className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {premiumUnlocked ? 'Customize' : 'Locked'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Attribute Stats Triad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 relative z-10">
        {attributes.map(({ key, label, icon: Icon, color, bg, stats }) => {
          const pct = Math.min(100, Math.round((stats.currentLevelXp / Math.max(1, stats.nextLevelXp)) * 100));
          return (
            <div key={key} className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{label}</span>
                </div>
                <strong className="text-sm text-slate-900 dark:text-white font-black">Lv {stats.level}</strong>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Evolution Strip (Hidden on Mobile) */}
      <div className="hidden lg:block mt-10 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Evolution Timeline</h3>
          </div>
          <p className="text-xs text-slate-500">Your avatar upgrades automatically</p>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {stages.map((s, i) => {
            const unlocked = character.level >= i + 1;
            const active = character.level === i + 1;
            return (
              <div 
                key={i} 
                className={`flex-shrink-0 w-24 p-3 rounded-2xl border transition-all ${
                  active ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 shadow-sm' 
                  : unlocked ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-70' 
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-40 grayscale'
                }`}
                title={unlocked ? `Level ${i + 1}: ${s[1]}` : `Unlock at Level ${i + 1}`}
              >
                <div className="w-10 h-10 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-lg mb-2 relative shadow-inner">
                  {s[2]}
                  {!unlocked && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-800 text-white rounded-full flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <div className="text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">LVL {i + 1}</div>
                <div className={`text-center text-[11px] font-bold truncate ${active ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {s[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipped Item Footer */}
      {character.inventory && character.inventory.length > 0 && (
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4 text-xs relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Equipped Item:</span>
            {character.inventory.find(i => i.id === character.equippedBadgeId) ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-bold shadow-sm">
                {getBadgeIcon(character.equippedBadgeId)}
                <span>{character.inventory.find(i => i.id === character.equippedBadgeId)?.name}</span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-normal">
                  ({character.inventory.find(i => i.id === character.equippedBadgeId)?.statBoost})
                </span>
              </div>
            ) : (
              <span className="text-slate-400 italic">No item equipped</span>
            )}
          </div>
          <button onClick={onOpenShop} className="text-amber-600 dark:text-amber-400 hover:text-amber-500 font-bold inline-flex items-center gap-1 transition-colors">
            <span>Visit Rewards Store to equip items</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Customization Modal */}
      <AnimatePresence>
        {customOpen && premiumUnlocked && (
          <motion.div 
            className="fixed inset-0 z-[100] bg-slate-900/60 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setCustomOpen(false)}
          >
            <motion.div 
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              initial={{ y: 20, opacity: 0, scale: 0.95 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              exit={{ y: 20, opacity: 0, scale: 0.95 }} 
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Background Glow */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Avatar Workshop</span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">Customize {stage[0]}</h2>
                </div>
                <button onClick={() => setCustomOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Live Preview */}
              <div className="w-32 h-32 mx-auto bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-2 shadow-inner mb-8 relative z-10">
                <EvolutionAvatar level={character.level} role={role} hair={hair} outfit={outfit} accent={avatarThemes[themeIndex].main} />
              </div>

              <div className="space-y-6 relative z-10">
                {/* Aura Selection */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                    <Palette className="w-4 h-4" /> Aura Color
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {avatarThemes.map((t, i) => (
                      <button 
                        key={t.name} 
                        aria-label={t.name} 
                        onClick={() => saveCustomization(i, hair, outfit)} 
                        className={`w-10 h-10 rounded-full border-4 transition-all shadow-sm ${themeIndex === i ? 'border-amber-400 scale-110' : 'border-transparent hover:scale-105'}`} 
                        style={{ background: `linear-gradient(135deg, ${t.main}, ${t.accent})` }} 
                      />
                    ))}
                  </div>
                </div>

                {/* Hair Selection */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                    <UserRound className="w-4 h-4" /> Hair Color
                  </label>
                  <div className="flex gap-2.5 flex-wrap">
                    {hairOptions.map(c => (
                      <button 
                        key={c} 
                        aria-label="Hair color" 
                        onClick={() => saveCustomization(themeIndex, c, outfit)} 
                        className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm ${hair === c ? 'border-amber-400 scale-110 ring-2 ring-amber-400/20' : 'border-slate-200 dark:border-slate-700 hover:scale-105'}`} 
                        style={{ background: c }} 
                      />
                    ))}
                  </div>
                </div>

                {/* Outfit Selection */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                    <Shirt className="w-4 h-4" /> Outfit Color
                  </label>
                  <div className="flex gap-2.5 flex-wrap">
                    {outfitOptions.map(c => (
                      <button 
                        key={c} 
                        aria-label="Outfit color" 
                        onClick={() => saveCustomization(themeIndex, hair, c)} 
                        className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm ${outfit === c ? 'border-amber-400 scale-110 ring-2 ring-amber-400/20' : 'border-slate-200 dark:border-slate-700 hover:scale-105'}`} 
                        style={{ background: c }} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setCustomOpen(false)} 
                className="w-full mt-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] relative z-10"
              >
                <Sparkles className="w-4 h-4" />
                Save Avatar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};