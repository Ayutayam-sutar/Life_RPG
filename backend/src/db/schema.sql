-- =======================================================
-- LIFE RPG DATABASE SCHEMA (Neon PostgreSQL)
-- =======================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS characters (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100) DEFAULT 'Fledgling Adventurer',
    avatar VARCHAR(100) DEFAULT 'warrior_pixel',
    level INT DEFAULT 1,
    total_xp INT DEFAULT 0,
    gold INT DEFAULT 100,
    
    -- Streak Engine
    current_streak INT DEFAULT 1,
    longest_streak INT DEFAULT 1,
    last_active_date DATE,
    streak_multiplier REAL DEFAULT 1.0,
    
    -- RPG Attributes
    strength_lvl INT DEFAULT 1,
    strength_xp INT DEFAULT 0,
    intellect_lvl INT DEFAULT 1,
    intellect_xp INT DEFAULT 0,
    charisma_lvl INT DEFAULT 1,
    charisma_xp INT DEFAULT 0,
    
    equipped_badge_id VARCHAR(36),
    equipped_title VARCHAR(100),
    active_theme VARCHAR(50) DEFAULT 'dungeon',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quests (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL CHECK (category IN ('strength', 'intellect', 'charisma')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('trivial', 'easy', 'medium', 'hard', 'legendary')),
    type VARCHAR(20) NOT NULL DEFAULT 'daily' CHECK (type IN ('daily', 'habit', 'epic')),
    xp_reward INT NOT NULL,
    gold_reward INT NOT NULL,
    attribute_gain INT NOT NULL DEFAULT 2,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id VARCHAR(36) REFERENCES quests(id) ON DELETE SET NULL,
    quest_title VARCHAR(255) NOT NULL,
    category VARCHAR(20),
    type VARCHAR(30) DEFAULT 'quest_complete',
    xp_earned INT DEFAULT 0,
    gold_earned INT DEFAULT 0,
    gold_spent INT DEFAULT 0,
    streak_at_time INT DEFAULT 1,
    new_level INT,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_items (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('badge', 'theme', 'title', 'relic')),
    cost INT NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) NOT NULL,
    rarity VARCHAR(20) DEFAULT 'Common' CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')),
    stat_boost VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_inventory (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id VARCHAR(36) NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_equipped BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_quests_user_status ON quests(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_quests_category ON quests(category);
CREATE INDEX IF NOT EXISTS idx_logs_user_timestamp ON activity_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id);
