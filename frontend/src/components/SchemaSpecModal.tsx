import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Database, Code, ShieldCheck, Copy, Check } from 'lucide-react';

interface SchemaSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaSpecModal: React.FC<SchemaSpecModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'leveling' | 'anticheat'>('sql');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SQL_CODE = `-- LIFE RPG NEON POSTGRESQL DDL SCHEMA
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE characters (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100) DEFAULT 'Fledgling Adventurer',
    level INT DEFAULT 1,
    total_xp INT DEFAULT 0,
    gold INT DEFAULT 100,
    current_streak INT DEFAULT 1,
    longest_streak INT DEFAULT 1,
    streak_multiplier REAL DEFAULT 1.0,
    strength_lvl INT DEFAULT 1, strength_xp INT DEFAULT 0,
    intellect_lvl INT DEFAULT 1, intellect_xp INT DEFAULT 0,
    charisma_lvl INT DEFAULT 1, charisma_xp INT DEFAULT 0,
    equipped_badge_id VARCHAR(36),
    equipped_title VARCHAR(100),
    active_theme VARCHAR(50) DEFAULT 'dungeon'
);

CREATE TABLE quests (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('strength', 'intellect', 'charisma')),
    difficulty VARCHAR(20) CHECK (difficulty IN ('trivial', 'easy', 'medium', 'hard', 'legendary')),
    type VARCHAR(20) DEFAULT 'daily',
    xp_reward INT NOT NULL,
    gold_reward INT NOT NULL,
    attribute_gain INT DEFAULT 2,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP
);

CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    quest_title VARCHAR(255),
    type VARCHAR(30) DEFAULT 'quest_complete',
    xp_earned INT DEFAULT 0,
    gold_earned INT DEFAULT 0,
    streak_at_time INT DEFAULT 1,
    details TEXT
);

CREATE TABLE shop_items (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(20) CHECK (category IN ('badge', 'theme', 'title', 'relic')),
    cost INT NOT NULL,
    icon VARCHAR(100),
    rarity VARCHAR(20) DEFAULT 'Common'
);`;

  const LEVELING_CODE = `/**
 * LEVELING ENGINE FORMULA
 * Level XP = 100 * (level ^ 1.5)
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 0) return 100;
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function calculateLevelFromTotalXp(totalXp: number) {
  let level = 1;
  let remainingXp = Math.max(0, Math.floor(totalXp));

  while (true) {
    const needed = getXpRequiredForLevel(level);
    if (remainingXp < needed) {
      return {
        level,
        currentLevelXp: remainingXp,
        nextLevelXp: needed,
        progressPercent: Math.round((remainingXp / needed) * 100)
      };
    }
    remainingXp -= needed;
    level++;
  }
}

// Daily Streak Multiplier: up to 1.5x bonus
export function calculateStreakMultiplier(streakDays: number): number {
  if (streakDays <= 1) return 1.0;
  return Number((1.0 + Math.min(0.5, (streakDays - 1) * 0.05)).toFixed(2));
}`;

  const ANTICHEAT_DOCS = `### Anti-Cheat Server-Authoritative Architecture (Neon DB)

1. Client cannot forge XP or Gold values:
   POST /api/quests/:id/complete sends ONLY { questId }.
   
2. Server validates:
   - Quest exists and belongs to authenticated req.userId (JWT verified).
   - Quest is not already marked completed.
   - Streak calculation is performed on server date checks
     (diffDays === 1 ? streak++ : streak = 1).
   
3. Server executes non-linear leveling formula and rewards:
   - Base XP * streakMultiplier
   - Base Gold * streakMultiplier
   - Calculates attribute level progression
   - Writes immutable log into activity_logs
   
4. All mutations use ACID transactions via @neondatabase/serverless:
   - BEGIN → row-level FOR UPDATE locks on quests + characters
   - Atomic multi-table updates (quest, character, activity_log)
   - COMMIT on success, ROLLBACK on any error
   - Prevents concurrent double-spend and race conditions

5. Neon PostgreSQL provides durable, serverless-scale storage
   with automatic backups and point-in-time recovery.`;

  const tabs = [
    { key: 'sql' as const, label: 'SQL Schema', icon: Database },
    { key: 'leveling' as const, label: 'Progression Math', icon: Code },
    { key: 'anticheat' as const, label: 'Anti-Cheat Verification', icon: ShieldCheck },
  ];

  const content = activeTab === 'sql' ? SQL_CODE : activeTab === 'leveling' ? LEVELING_CODE : ANTICHEAT_DOCS;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl dark:shadow-slate-950/50 p-6 relative flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 dark:border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-cinzel text-lg font-bold text-slate-900 dark:text-slate-50">System Architecture & Schema</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Neon DB PostgreSQL specifications and anti-cheat architecture</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1.5 rounded-lg transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pb-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.key
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="mt-4 flex-1 overflow-y-auto bg-slate-900 dark:bg-slate-950 border border-slate-800 dark:border-slate-800 rounded-xl p-4 relative font-mono text-xs text-slate-200 leading-relaxed shadow-inner">
            <button
              onClick={() => handleCopy(content)}
              className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <pre className="overflow-x-auto whitespace-pre">{content}</pre>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span>Database: Neon PostgreSQL (Serverless) — backend/src/db/schema.sql</span>
            <button onClick={onClose} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-lg cursor-pointer transition">Close</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
