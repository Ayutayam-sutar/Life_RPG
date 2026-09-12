export type AttributeType = 'strength' | 'intellect' | 'charisma';
export type QuestDifficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'legendary';
export type QuestType = 'daily' | 'habit' | 'epic';

export interface AttributeStats {
  level: number;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number;
}

export interface CharacterAttributes {
  strength: AttributeStats;
  intellect: AttributeStats;
  charisma: AttributeStats;
}

export interface UserCharacter {
  id: string;
  userId: string;
  name: string;
  title: string;
  avatar: string;
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  gold: number;
  attributes: CharacterAttributes;
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
    multiplier: number;
  };
  inventory: ShopItem[];
  equippedBadgeId?: string;
  equippedTitle?: string;
  activeTheme?: string;
  createdAt: string;
}

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: AttributeType;
  difficulty: QuestDifficulty;
  type: QuestType;
  xpReward: number;
  goldReward: number;
  attributeGain: number;
  isCompleted: boolean;
  completedAt?: string;
  dueDate?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  questId?: string;
  questTitle: string;
  category?: AttributeType;
  type: 'quest_complete' | 'level_up' | 'shop_purchase' | 'streak_milestone';
  xpEarned: number;
  goldEarned: number;
  goldSpent?: number;
  streakAtTime: number;
  newLevel?: number;
  details?: string;
  timestamp: string;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'badge' | 'theme' | 'title' | 'relic';
  cost: number;
  description: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  statBoost?: string;
  purchased?: boolean;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  character: UserCharacter;
}

export interface CompleteQuestResult {
  quest: Quest;
  character: UserCharacter;
  leveledUp: boolean;
  xpGained: number;
  goldGained: number;
  multiplier: number;
  newLevel?: number;
  attributeGained: {
    attribute: AttributeType;
    points: number;
  };
}
