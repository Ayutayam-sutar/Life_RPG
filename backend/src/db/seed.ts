import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { pool, query } from './neon.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  LIFE RPG — Neon DB Initialization');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!process.env.DATABASE_URL) {
    console.error('✗ DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  // Step 1: Apply schema.sql
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`✗ Schema file not found at: ${schemaPath}`);
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  console.log('→ Applying schema.sql to Neon PostgreSQL...');

  try {
    await pool.query(schemaSql);
    console.log('✓ Schema tables created successfully.');
  } catch (error) {
    console.error('✗ Failed to apply schema:', error);
    process.exit(1);
  }

  // Step 2: Seed demo user if not exists
  console.log('→ Checking for demo seed data...');

  const existing = await query('SELECT id FROM users WHERE email = $1', ['demo@liferpg.realm']);
  if (existing.length > 0) {
    console.log('✓ Demo user already exists, skipping seed.');
  } else {
    console.log('→ Seeding demo user "Ayutayam"...');

    const demoUserId = 'demo_user_id_101';
    const demoCharId = 'demo_char_101';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('demo1234', salt);

    // Insert demo user
    await query(
      `INSERT INTO users (id, email, username, password_hash) VALUES ($1, $2, $3, $4)`,
      [demoUserId, 'demo@liferpg.realm', 'Ayutayam', passwordHash]
    );

    // Insert demo character (Level 5, 420 Gold, 7-day streak)
    await query(
      `INSERT INTO characters (id, user_id, name, title, avatar, level, total_xp, gold,
        current_streak, longest_streak, last_active_date, streak_multiplier,
        strength_lvl, strength_xp, intellect_lvl, intellect_xp, charisma_lvl, charisma_xp,
        equipped_badge_id, equipped_title, active_theme)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        demoCharId, demoUserId, 'Ayutayam', 'Level 5 Achiever', 'warrior_pixel',
        5, 2050, 420,
        7, 12, new Date().toISOString().split('T')[0], 1.3,
        6, 480, 5, 390, 4, 260,
        'badge_pixel_sword', 'Level 5 Achiever', 'dungeon'
      ]
    );

    // Insert demo quests
    const demoQuests = [
      { id: 'q_str_1', title: 'Barbell Squats & 5K Interval Run', desc: 'Forge raw physical resilience in the iron dungeon.', cat: 'strength', diff: 'hard', type: 'daily', xp: 286, gold: 156, attr: 8, completed: false },
      { id: 'q_int_1', title: 'Implement Full-Stack Anti-Cheat API', desc: 'Deep-work coding session: write secure backend validation logic.', cat: 'intellect', diff: 'medium', type: 'daily', xp: 130, gold: 65, attr: 4, completed: true },
      { id: 'q_cha_1', title: 'Deliver Product Architecture Presentation', desc: 'Captivate stakeholders with confident vocal presence and clear visual aids.', cat: 'charisma', diff: 'hard', type: 'epic', xp: 286, gold: 156, attr: 8, completed: false },
      { id: 'q_str_2', title: 'Morning Mobility & 50 Pushups', desc: 'Grease the groove before sunrise.', cat: 'strength', diff: 'easy', type: 'habit', xp: 58, gold: 32, attr: 2, completed: false },
      { id: 'q_int_2', title: 'Read 20 Pages of System Design Handbook', desc: 'Expand mental schemas on distributed queues and cache invalidation.', cat: 'intellect', diff: 'medium', type: 'daily', xp: 130, gold: 65, attr: 4, completed: false },
      { id: 'q_cha_2', title: 'Check in with 3 Friends & Mentors', desc: 'Cultivate high-trust fellowship in the guild.', cat: 'charisma', diff: 'easy', type: 'daily', xp: 58, gold: 32, attr: 2, completed: false },
    ];

    for (const q of demoQuests) {
      await query(
        `INSERT INTO quests (id, user_id, title, description, category, difficulty, type, xp_reward, gold_reward, attribute_gain, is_completed, completed_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [q.id, demoUserId, q.title, q.desc, q.cat, q.diff, q.type, q.xp, q.gold, q.attr, q.completed, q.completed ? new Date(Date.now() - 3600000).toISOString() : null]
      );
    }

    console.log('✓ Demo quests seeded.');

    // Seed activity logs
    await query(
      `INSERT INTO activity_logs (id, user_id, quest_id, quest_title, category, type, xp_earned, gold_earned, streak_at_time, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      ['log_seed_1', demoUserId, 'q_int_1', 'Implement Full-Stack Anti-Cheat API', 'intellect', 'quest_complete', 130, 65, 7, 'Earned 130 XP (1.3x streak multiplier) and 65 Gold.']
    );

    console.log('✓ Demo activity logs seeded.');
  }

  // Step 3: Seed shop catalog if empty
  const shopCheck = await query('SELECT COUNT(*)::int as count FROM shop_items');
  const shopCount = (shopCheck[0] as { count: number }).count;

  if (shopCount === 0) {
    console.log('→ Seeding shop catalog...');
    const shopItems = [
      { id: 'badge_pixel_sword', name: 'Focus Blade', cat: 'badge', cost: 50, desc: 'A sleek symbol of physical discipline awarded to consistent achievers.', icon: 'Sword', rarity: 'Common', boost: '+5% Strength XP' },
      { id: 'badge_grimoire', name: 'Deep Work Manual', cat: 'badge', cost: 80, desc: 'A master guide for high-intensity problem solving and coding.', icon: 'BookOpen', rarity: 'Rare', boost: '+5% Intellect XP' },
      { id: 'badge_bard_lute', name: 'Keynote Speaker Badge', cat: 'badge', cost: 80, desc: 'Celebrates articulate communication, public presence, and leadership.', icon: 'Sparkles', rarity: 'Rare', boost: '+5% Charisma XP' },
      { id: 'title_shadow_monarch', name: 'Title: Elite Strategist', cat: 'title', cost: 150, desc: 'Displays a prestigious gold title on your user profile card.', icon: 'Crown', rarity: 'Epic', boost: 'Visual Prestige Title' },
      { id: 'relic_phoenix_feather', name: 'Streak Shield', cat: 'relic', cost: 250, desc: 'Protects your daily consistency multiplier if you miss a single day.', icon: 'Flame', rarity: 'Legendary', boost: '24h Streak Grace Period' },
      { id: 'theme_cyberpunk_neon', name: 'Cyberpunk Dark Theme', cat: 'theme', cost: 200, desc: 'High-tech neon cyan and amber terminal matrix interface.', icon: 'Cpu', rarity: 'Epic', boost: 'Alternate Cyberpunk UI Theme' },
      { id: 'theme_lofi_parchment', name: 'Clean Slate Theme', cat: 'theme', cost: 180, desc: 'Crisp minimalist aesthetic with amber highlights.', icon: 'Coffee', rarity: 'Rare', boost: 'Alternate Minimalist Theme' },
    ];

    for (const item of shopItems) {
      await query(
        `INSERT INTO shop_items (id, name, category, cost, description, icon, rarity, stat_boost) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [item.id, item.name, item.cat, item.cost, item.desc, item.icon, item.rarity, item.boost]
      );
    }

    // Seed demo user's inventory (owns Focus Blade)
    const demoExists = await query('SELECT id FROM users WHERE id = $1', ['demo_user_id_101']);
    if (demoExists.length > 0) {
      await query(
        `INSERT INTO user_inventory (id, user_id, item_id, is_equipped) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [crypto.randomUUID(), 'demo_user_id_101', 'badge_pixel_sword', true]
      );
    }

    console.log('✓ Shop catalog seeded.');
  } else {
    console.log(`✓ Shop catalog already has ${shopCount} items.`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✓ Neon DB initialization complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await pool.end();
}

initializeDatabase().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
