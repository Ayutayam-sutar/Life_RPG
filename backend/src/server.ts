import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query, withTransaction } from './db/neon.ts';
import { QuestDifficulty, AttributeType, ShopItem } from './types.ts';
import {
  calculateLevelFromTotalXp,
  calculateQuestRewards,
  calculateStreakMultiplier,
  getHeroTitle,
  DIFFICULTY_CONFIG,
} from './utils/leveling.ts';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'liferpg_ultra_secure_dungeon_master_secret_key_2026';

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173','https://levio12.netlify.app/'],
  credentials: true,
}));

// ─── Auth Types ──────────────────────────────────────────
interface AuthenticatedRequest extends Request {
  userId?: string;
}

// ─── Auth Middleware ─────────────────────────────────────
async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  const fallbackToDemo = async () => {
    const rows = await query<{ id: string }>('SELECT id FROM users WHERE email = $1', ['demo@liferpg.realm']);
    if (rows.length > 0) {
      req.userId = rows[0].id;
      return true;
    }
    return false;
  };

  if (!token) {
    if (await fallbackToDemo()) return next();
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, async (err: unknown, decoded: unknown) => {
    if (err) {
      if (await fallbackToDemo()) return next();
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }
    const payload = decoded as { userId: string };
    req.userId = payload.userId;
    next();
  });
}

// ─── Helper: Build character object from DB row ─────────
function buildCharacterFromRow(row: Record<string, unknown>, inventory: ShopItem[] = []) {
  const totalXp = row.total_xp as number;
  const levelInfo = calculateLevelFromTotalXp(totalXp);

  const attrXp = (xp: number, lvl: number) => {
    const needed = lvl * 50;
    let remaining = xp;
    let level = 1;
    let attrNeeded = level * 50;
    while (remaining >= attrNeeded) {
      remaining -= attrNeeded;
      level++;
      attrNeeded = level * 50;
    }
    return { level: Math.max(lvl, level), xp, currentLevelXp: remaining, nextLevelXp: attrNeeded };
  };

  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    title: row.title as string,
    avatar: row.avatar as string || 'warrior_pixel',
    level: levelInfo.level,
    totalXp,
    currentLevelXp: levelInfo.currentLevelXp,
    nextLevelXp: levelInfo.nextLevelXp,
    progressPercent: levelInfo.progressPercent,
    gold: row.gold as number,
    attributes: {
      strength: attrXp(row.strength_xp as number, row.strength_lvl as number),
      intellect: attrXp(row.intellect_xp as number, row.intellect_lvl as number),
      charisma: attrXp(row.charisma_xp as number, row.charisma_lvl as number),
    },
    streak: {
      currentStreak: row.current_streak as number,
      longestStreak: row.longest_streak as number,
      lastActiveDate: row.last_active_date ? String(row.last_active_date).split('T')[0] : null,
      multiplier: row.streak_multiplier as number,
    },
    inventory,
    equippedBadgeId: row.equipped_badge_id as string | undefined,
    equippedTitle: row.equipped_title as string | undefined,
    activeTheme: row.active_theme as string || 'dungeon',
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

async function getCharacterForUser(userId: string) {
  const rows = await query(
    `SELECT * FROM characters WHERE user_id = $1 LIMIT 1`, [userId]
  );
  if (rows.length === 0) return null;

  // Get inventory
  const invRows = await query(
    `SELECT si.*, ui.is_equipped FROM user_inventory ui JOIN shop_items si ON ui.item_id = si.id WHERE ui.user_id = $1`,
    [userId]
  );
  const inventory: ShopItem[] = invRows.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    category: r.category as ShopItem['category'],
    cost: r.cost as number,
    description: r.description as string,
    icon: r.icon as string,
    rarity: r.rarity as ShopItem['rarity'],
    statBoost: r.stat_boost as string | undefined,
    purchased: true,
  }));

  return buildCharacterFromRow(rows[0], inventory);
}

function buildQuestFromRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    description: (row.description || '') as string,
    category: row.category as AttributeType,
    difficulty: row.difficulty as QuestDifficulty,
    type: (row.type || 'daily') as 'daily' | 'habit' | 'epic',
    xpReward: row.xp_reward as number,
    goldReward: row.gold_reward as number,
    attributeGain: row.attribute_gain as number,
    isCompleted: row.is_completed as boolean,
    completedAt: row.completed_at ? String(row.completed_at) : undefined,
    dueDate: row.due_date ? String(row.due_date) : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

// ═══════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════

// 1. Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Life RPG Backend (Neon DB)', timestamp: new Date().toISOString() });
});

// 2. Auth: Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.length > 0) return res.status(409).json({ error: 'An adventurer with this email already exists' });

    const userId = crypto.randomUUID();
    const charId = crypto.randomUUID();
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    await query(
      `INSERT INTO users (id, email, username, password_hash) VALUES ($1, $2, $3, $4)`,
      [userId, email, username, passwordHash]
    );

    const levelInfo = calculateLevelFromTotalXp(0);
    await query(
      `INSERT INTO characters (id, user_id, name, title, level, total_xp, gold, current_streak, longest_streak, last_active_date, streak_multiplier, strength_lvl, strength_xp, intellect_lvl, intellect_xp, charisma_lvl, charisma_xp, equipped_title, active_theme)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [charId, userId, username, 'Fledgling Adventurer', 1, 0, 50, 1, 1, new Date().toISOString().split('T')[0], 1.0, 1, 0, 1, 0, 1, 0, 'Fledgling Adventurer', 'dungeon']
    );

    // Starter quests
    const starterQuests = [
      { title: '30-Minute Gym Workout or Run', desc: 'Test physical limits and build endurance.', cat: 'strength', diff: 'medium' as QuestDifficulty },
      { title: 'Solve Algorithm or Read Technical Docs', desc: 'Sharpen cognitive faculties and learn new patterns.', cat: 'intellect', diff: 'medium' as QuestDifficulty },
      { title: 'Practice Speech or Network with a Colleague', desc: 'Level up presence, empathy, and social grace.', cat: 'charisma', diff: 'easy' as QuestDifficulty },
    ];

    for (const sq of starterQuests) {
      const rewards = calculateQuestRewards(sq.diff, 1);
      await query(
        `INSERT INTO quests (id, user_id, title, description, category, difficulty, type, xp_reward, gold_reward, attribute_gain)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [crypto.randomUUID(), userId, sq.title, sq.desc, sq.cat, sq.diff, 'daily', rewards.xp, rewards.gold, rewards.attributePoints]
      );
    }

    const character = await getCharacterForUser(userId);
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: userId, username, email }, character });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    res.status(500).json({ error: message });
  }
});

// 3. Auth: Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const users = await query<{ id: string; username: string; email: string; password_hash: string }>(
      'SELECT id, username, email, password_hash FROM users WHERE LOWER(email) = LOWER($1)', [email]
    );
    if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = users[0];
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const character = await getCharacterForUser(user.id);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email }, character });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    res.status(500).json({ error: message });
  }
});

// 4. Auth: Demo 1-Click Login
app.post('/api/auth/demo', async (_req: Request, res: Response) => {
  try {
    const users = await query<{ id: string; username: string; email: string }>(
      'SELECT id, username, email FROM users WHERE email = $1', ['demo@liferpg.realm']
    );
    if (users.length === 0) return res.status(500).json({ error: 'Demo hero account not initialized. Run: npm run db:init' });

    const user = users[0];
    const character = await getCharacterForUser(user.id);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email }, character });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Demo login failed';
    res.status(500).json({ error: message });
  }
});

// 5. Auth: Get Current Profile
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await query<{ id: string; username: string; email: string }>(
      'SELECT id, username, email FROM users WHERE id = $1', [req.userId!]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = users[0];
    const character = await getCharacterForUser(req.userId!);

    res.json({ user: { id: user.id, username: user.username, email: user.email }, character });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Profile lookup failed';
    res.status(500).json({ error: message });
  }
});

// 6. Character Stats
app.get('/api/character', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const character = await getCharacterForUser(req.userId!);
  if (!character) return res.status(404).json({ error: 'Character not found' });
  res.json(character);
});

// 7. Equip Inventory Item
app.post('/api/character/equip', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: 'Item ID required' });

    // Check ownership
    const owned = await query('SELECT si.category, si.name FROM user_inventory ui JOIN shop_items si ON ui.item_id = si.id WHERE ui.user_id = $1 AND ui.item_id = $2', [req.userId!, itemId]);
    if (owned.length === 0) return res.status(400).json({ error: 'Item not owned' });

    const item = owned[0] as { category: string; name: string };
    if (item.category === 'badge') {
      await query('UPDATE characters SET equipped_badge_id = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [itemId, req.userId!]);
    } else if (item.category === 'theme') {
      await query('UPDATE characters SET active_theme = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [itemId, req.userId!]);
    } else if (item.category === 'title') {
      const titleName = (item.name as string).replace('Title: ', '');
      await query('UPDATE characters SET equipped_title = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [titleName, req.userId!]);
    }

    const character = await getCharacterForUser(req.userId!);
    res.json(character);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Equip failed';
    res.status(400).json({ error: message });
  }
});

// 8. Quests: List All
app.get('/api/quests', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const rows = await query('SELECT * FROM quests WHERE user_id = $1 ORDER BY created_at DESC', [req.userId!]);
  res.json(rows.map(buildQuestFromRow));
});

// 9. Quests: Create Quest
app.post('/api/quests', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category, difficulty, type } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Quest title cannot be empty' });

    const validCategories: AttributeType[] = ['strength', 'intellect', 'charisma'];
    if (!validCategories.includes(category)) return res.status(400).json({ error: 'Invalid category' });

    const validDifficulties: QuestDifficulty[] = ['trivial', 'easy', 'medium', 'hard', 'legendary'];
    if (!validDifficulties.includes(difficulty)) return res.status(400).json({ error: 'Invalid difficulty' });

    // Get current streak for reward calculation
    const charRows = await query<{ current_streak: number }>('SELECT current_streak FROM characters WHERE user_id = $1', [req.userId!]);
    const streakDays = charRows.length > 0 ? charRows[0].current_streak : 1;
    const rewards = calculateQuestRewards(difficulty, streakDays);

    const questId = crypto.randomUUID();
    await query(
      `INSERT INTO quests (id, user_id, title, description, category, difficulty, type, xp_reward, gold_reward, attribute_gain)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [questId, req.userId!, title.trim(), (description || '').trim(), category, difficulty, type || 'daily', rewards.xp, rewards.gold, rewards.attributePoints]
    );

    const questRows = await query('SELECT * FROM quests WHERE id = $1', [questId]);
    res.status(201).json(buildQuestFromRow(questRows[0]));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create quest';
    res.status(500).json({ error: message });
  }
});

// 10. Quests: Update Quest
app.patch('/api/quests/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const questId = req.params.id;
    const existing = await query('SELECT * FROM quests WHERE id = $1 AND user_id = $2', [questId, req.userId!]);
    if (existing.length === 0) return res.status(404).json({ error: 'Quest not found' });

    const updates = req.body;
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (updates.title !== undefined) { sets.push(`title = $${idx++}`); values.push(updates.title); }
    if (updates.description !== undefined) { sets.push(`description = $${idx++}`); values.push(updates.description); }
    if (updates.category !== undefined) { sets.push(`category = $${idx++}`); values.push(updates.category); }
    if (updates.difficulty !== undefined) {
      sets.push(`difficulty = $${idx++}`); values.push(updates.difficulty);
      const charRows = await query<{ current_streak: number }>('SELECT current_streak FROM characters WHERE user_id = $1', [req.userId!]);
      const streakDays = charRows.length > 0 ? charRows[0].current_streak : 1;
      const rewards = calculateQuestRewards(updates.difficulty, streakDays);
      sets.push(`xp_reward = $${idx++}`); values.push(rewards.xp);
      sets.push(`gold_reward = $${idx++}`); values.push(rewards.gold);
      sets.push(`attribute_gain = $${idx++}`); values.push(rewards.attributePoints);
    }
    if (updates.type !== undefined) { sets.push(`type = $${idx++}`); values.push(updates.type); }

    if (sets.length > 0) {
      sets.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(questId, req.userId!);
      await query(`UPDATE quests SET ${sets.join(', ')} WHERE id = $${idx++} AND user_id = $${idx}`, values);
    }

    const updated = await query('SELECT * FROM quests WHERE id = $1', [questId]);
    res.json(buildQuestFromRow(updated[0]));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update quest';
    res.status(500).json({ error: message });
  }
});

// 11. Quests: Delete Quest
app.delete('/api/quests/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const result = await query('DELETE FROM quests WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId!]);
  if (result.length === 0) return res.status(404).json({ error: 'Quest not found' });
  res.json({ success: true, message: 'Quest eliminated' });
});

// 12. ANTI-CHEAT: Complete Quest (ACID Transaction)
app.post('/api/quests/:id/complete', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await withTransaction(async (client) => {
      // Fetch quest with row lock
      const questRes = await client.query(
        `SELECT * FROM quests WHERE id = $1 AND user_id = $2 FOR UPDATE`, [req.params.id, req.userId!]
      );
      if (questRes.rows.length === 0) throw new Error('Quest not found');
      const questRow = questRes.rows[0];
      if (questRow.is_completed) throw new Error('Quest is already completed');

      // Fetch character with row lock
      const charRes = await client.query(
        `SELECT * FROM characters WHERE user_id = $1 FOR UPDATE`, [req.userId!]
      );
      if (charRes.rows.length === 0) throw new Error('Character not found');
      const charRow = charRes.rows[0];

      // Streak calculation
      const todayStr = new Date().toISOString().split('T')[0];
      let newStreak = charRow.current_streak;
      if (!charRow.last_active_date) {
        newStreak = 1;
      } else {
        const lastDate = new Date(charRow.last_active_date).toISOString().split('T')[0];
        if (lastDate !== todayStr) {
          const diffDays = Math.round((new Date(todayStr).getTime() - new Date(lastDate).getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) newStreak += 1;
          else if (diffDays > 1) newStreak = 1;
        }
      }
      const longestStreak = Math.max(charRow.longest_streak, newStreak);
      const rewards = calculateQuestRewards(questRow.difficulty, newStreak);

      // Level progression
      const oldLevel = charRow.level;
      const newTotalXp = charRow.total_xp + rewards.xp;
      const levelInfo = calculateLevelFromTotalXp(newTotalXp);
      const leveledUp = levelInfo.level > oldLevel;
      const category = questRow.category as AttributeType;
      const newTitle = getHeroTitle(levelInfo.level, category);

      // Attribute progression
      let { strength_lvl, strength_xp, intellect_lvl, intellect_xp, charisma_lvl, charisma_xp } = charRow;
      const attrPoints = rewards.attributePoints * 10;
      if (category === 'strength') {
        strength_xp += attrPoints;
        let needed = strength_lvl * 50;
        while (strength_xp >= needed) { strength_xp -= needed; strength_lvl++; needed = strength_lvl * 50; }
      } else if (category === 'intellect') {
        intellect_xp += attrPoints;
        let needed = intellect_lvl * 50;
        while (intellect_xp >= needed) { intellect_xp -= needed; intellect_lvl++; needed = intellect_lvl * 50; }
      } else if (category === 'charisma') {
        charisma_xp += attrPoints;
        let needed = charisma_lvl * 50;
        while (charisma_xp >= needed) { charisma_xp -= needed; charisma_lvl++; needed = charisma_lvl * 50; }
      }

      // Update quest
      const completedAt = new Date().toISOString();
      await client.query(
        `UPDATE quests SET is_completed = TRUE, completed_at = $1, xp_reward = $2, gold_reward = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4`,
        [completedAt, rewards.xp, rewards.gold, req.params.id]
      );

      // Update character
      await client.query(
        `UPDATE characters SET level = $1, total_xp = $2, gold = $3, title = $4, current_streak = $5, longest_streak = $6, last_active_date = $7, streak_multiplier = $8, strength_lvl = $9, strength_xp = $10, intellect_lvl = $11, intellect_xp = $12, charisma_lvl = $13, charisma_xp = $14, equipped_title = COALESCE(equipped_title, $4), updated_at = CURRENT_TIMESTAMP WHERE user_id = $15`,
        [levelInfo.level, newTotalXp, charRow.gold + rewards.gold, newTitle, newStreak, longestStreak, todayStr, rewards.multiplier, strength_lvl, strength_xp, intellect_lvl, intellect_xp, charisma_lvl, charisma_xp, req.userId!]
      );

      // Activity log
      await client.query(
        `INSERT INTO activity_logs (id, user_id, quest_id, quest_title, category, type, xp_earned, gold_earned, streak_at_time, new_level, details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [crypto.randomUUID(), req.userId!, req.params.id, questRow.title, category, 'quest_complete', rewards.xp, rewards.gold, newStreak, leveledUp ? levelInfo.level : null, `Completed "${questRow.title}" (${questRow.difficulty}). Earned ${rewards.xp} XP and ${rewards.gold} Gold at ${rewards.multiplier}x streak multiplier.`]
      );

      if (leveledUp) {
        await client.query(
          `INSERT INTO activity_logs (id, user_id, quest_id, quest_title, type, xp_earned, gold_earned, streak_at_time, new_level, details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [crypto.randomUUID(), req.userId!, req.params.id, `Level Up! Reached Level ${levelInfo.level}`, 'level_up', 0, 0, newStreak, levelInfo.level, `Ascended to Level ${levelInfo.level}! Earned new title: "${newTitle}".`]
        );
      }

      return { questRow: { ...questRow, is_completed: true, completed_at: completedAt, xp_reward: rewards.xp, gold_reward: rewards.gold }, leveledUp, rewards, levelInfo, newStreak, longestStreak, category };
    });

    const quest = buildQuestFromRow(result.questRow);
    const character = await getCharacterForUser(req.userId!);

    res.json({
      quest,
      character,
      leveledUp: result.leveledUp,
      xpGained: result.rewards.xp,
      goldGained: result.rewards.gold,
      multiplier: result.rewards.multiplier,
      newLevel: result.leveledUp ? result.levelInfo.level : undefined,
      attributeGained: { attribute: result.category, points: result.rewards.attributePoints },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to complete quest';
    res.status(400).json({ error: message });
  }
});

// 13. Revert Quest Completion
app.post('/api/quests/:id/uncomplete', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await withTransaction(async (client) => {
      const questRes = await client.query('SELECT * FROM quests WHERE id = $1 AND user_id = $2 FOR UPDATE', [req.params.id, req.userId!]);
      if (questRes.rows.length === 0) throw new Error('Quest not found');
      const questRow = questRes.rows[0];
      if (!questRow.is_completed) throw new Error('Quest is not completed');

      const charRes = await client.query('SELECT * FROM characters WHERE user_id = $1 FOR UPDATE', [req.userId!]);
      if (charRes.rows.length === 0) throw new Error('Character not found');
      const charRow = charRes.rows[0];

      const newTotalXp = Math.max(0, charRow.total_xp - questRow.xp_reward);
      const newGold = Math.max(0, charRow.gold - questRow.gold_reward);
      const levelInfo = calculateLevelFromTotalXp(newTotalXp);

      await client.query('UPDATE quests SET is_completed = FALSE, completed_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [req.params.id]);
      await client.query('UPDATE characters SET level = $1, total_xp = $2, gold = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4', [levelInfo.level, newTotalXp, newGold, req.userId!]);
    });

    const questRows = await query('SELECT * FROM quests WHERE id = $1', [req.params.id]);
    const quest = buildQuestFromRow(questRows[0]);
    const character = await getCharacterForUser(req.userId!);

    res.json({ quest, character });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to revert quest';
    res.status(400).json({ error: message });
  }
});

// 14. Shop Catalog
app.get('/api/shop', async (_req: Request, res: Response) => {
  const rows = await query('SELECT * FROM shop_items ORDER BY cost ASC');
  const items: ShopItem[] = rows.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    category: r.category as ShopItem['category'],
    cost: r.cost as number,
    description: r.description as string,
    icon: r.icon as string,
    rarity: r.rarity as ShopItem['rarity'],
    statBoost: r.stat_boost as string | undefined,
  }));
  res.json(items);
});

// 15. Purchase Item
app.post('/api/shop/purchase', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: 'Item ID required' });

    await withTransaction(async (client) => {
      const charRes = await client.query('SELECT gold FROM characters WHERE user_id = $1 FOR UPDATE', [req.userId!]);
      if (charRes.rows.length === 0) throw new Error('Character not found');
      const gold = charRes.rows[0].gold;

      const itemRes = await client.query('SELECT * FROM shop_items WHERE id = $1', [itemId]);
      if (itemRes.rows.length === 0) throw new Error('Item not found in shop');
      const item = itemRes.rows[0];

      const ownedRes = await client.query('SELECT id FROM user_inventory WHERE user_id = $1 AND item_id = $2', [req.userId!, itemId]);
      if (ownedRes.rows.length > 0) throw new Error('You already own this item');

      if (gold < item.cost) throw new Error(`Insufficient gold! You need ${item.cost} Gold, but have ${gold}`);

      await client.query('UPDATE characters SET gold = gold - $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [item.cost, req.userId!]);
      await client.query('INSERT INTO user_inventory (id, user_id, item_id, is_equipped) VALUES ($1, $2, $3, $4)', [crypto.randomUUID(), req.userId!, itemId, false]);

      // Auto-equip
      if (item.category === 'badge') {
        await client.query('UPDATE characters SET equipped_badge_id = $1 WHERE user_id = $2', [itemId, req.userId!]);
      } else if (item.category === 'theme') {
        await client.query('UPDATE characters SET active_theme = $1 WHERE user_id = $2', [itemId, req.userId!]);
      } else if (item.category === 'title') {
        const titleName = item.name.replace('Title: ', '');
        await client.query('UPDATE characters SET equipped_title = $1 WHERE user_id = $2', [titleName, req.userId!]);
      }

      // Activity log
      const charAfter = await client.query('SELECT current_streak FROM characters WHERE user_id = $1', [req.userId!]);
      await client.query(
        `INSERT INTO activity_logs (id, user_id, quest_title, type, gold_spent, streak_at_time, details) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [crypto.randomUUID(), req.userId!, `Purchased ${item.name}`, 'shop_purchase', item.cost, charAfter.rows[0].current_streak, `Unlocked ${item.name} (${item.rarity}) for ${item.cost} Gold.`]
      );
    });

    const character = await getCharacterForUser(req.userId!);
    const itemRows = await query('SELECT * FROM shop_items WHERE id = $1', [itemId]);
    const item: ShopItem = {
      id: (itemRows[0] as Record<string, unknown>).id as string,
      name: (itemRows[0] as Record<string, unknown>).name as string,
      category: (itemRows[0] as Record<string, unknown>).category as ShopItem['category'],
      cost: (itemRows[0] as Record<string, unknown>).cost as number,
      description: (itemRows[0] as Record<string, unknown>).description as string,
      icon: (itemRows[0] as Record<string, unknown>).icon as string,
      rarity: (itemRows[0] as Record<string, unknown>).rarity as ShopItem['rarity'],
      statBoost: (itemRows[0] as Record<string, unknown>).stat_boost as string | undefined,
    };

    res.json({ character, item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Purchase failed';
    res.status(400).json({ error: message });
  }
});

// 16. Activity Logs
app.get('/api/logs', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const rows = await query(
    'SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 30',
    [req.userId!]
  );
  const logs = rows.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    userId: r.user_id as string,
    questId: r.quest_id as string | undefined,
    questTitle: r.quest_title as string,
    category: r.category as AttributeType | undefined,
    type: r.type as string,
    xpEarned: r.xp_earned as number,
    goldEarned: r.gold_earned as number,
    goldSpent: r.gold_spent as number | undefined,
    streakAtTime: r.streak_at_time as number,
    newLevel: r.new_level as number | undefined,
    details: r.details as string | undefined,
    timestamp: String(r.timestamp),
  }));
  res.json(logs);
});

// ─── Start Server ────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Life RPG Backend] 🚀 Neon DB API server listening on http://0.0.0.0:${PORT}`);
});
