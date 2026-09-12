import { QuestDifficulty, AttributeType } from '../types.ts';

/**
 * LIFE RPG CORE PROGRESSION ENGINE
 * Non-linear leveling: Level XP = 100 * (level ^ 1.5)
 */

export function getXpRequiredForLevel(level: number): number {
  if (level <= 0) return 100;
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function getCumulativeXpForLevel(targetLevel: number): number {
  let total = 0;
  for (let lvl = 1; lvl < targetLevel; lvl++) {
    total += getXpRequiredForLevel(lvl);
  }
  return total;
}

export function calculateLevelFromTotalXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  let level = 1;
  let remainingXp = Math.max(0, Math.floor(totalXp));

  while (true) {
    const needed = getXpRequiredForLevel(level);
    if (remainingXp < needed) {
      const progressPercent = Math.min(100, Math.max(0, Math.round((remainingXp / needed) * 100)));
      return { level, currentLevelXp: remainingXp, nextLevelXp: needed, progressPercent };
    }
    remainingXp -= needed;
    level++;
  }
}

export function calculateStreakMultiplier(streakDays: number): number {
  if (streakDays <= 1) return 1.0;
  const bonus = Math.min(0.5, (streakDays - 1) * 0.05);
  return Number((1.0 + bonus).toFixed(2));
}

export const DIFFICULTY_CONFIG: Record<QuestDifficulty, { baseXp: number; baseGold: number; attributePoints: number }> = {
  trivial: { baseXp: 20, baseGold: 10, attributePoints: 1 },
  easy: { baseXp: 45, baseGold: 25, attributePoints: 2 },
  medium: { baseXp: 100, baseGold: 50, attributePoints: 4 },
  hard: { baseXp: 220, baseGold: 120, attributePoints: 8 },
  legendary: { baseXp: 500, baseGold: 300, attributePoints: 15 },
};

export function calculateQuestRewards(difficulty: QuestDifficulty, streakDays: number) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  const multiplier = calculateStreakMultiplier(streakDays);
  return {
    xp: Math.round(config.baseXp * multiplier),
    gold: Math.round(config.baseGold * multiplier),
    multiplier,
    attributePoints: config.attributePoints,
  };
}

export function getHeroTitle(level: number, dominantAttribute?: AttributeType): string {
  if (level < 3) return 'Novice Achiever';
  const role =
    dominantAttribute === 'strength' ? 'Athlete' :
    dominantAttribute === 'intellect' ? 'Strategist' :
    dominantAttribute === 'charisma' ? 'Communicator' :
    'Achiever';
  if (level < 10) return `Level ${level} ${role}`;
  if (level < 20) return `Elite Level ${level} ${role}`;
  if (level < 35) return `Master Level ${level} ${role}`;
  return `Grandmaster ${role}`;
}
