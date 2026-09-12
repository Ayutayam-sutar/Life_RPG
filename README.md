# Life RPG - Gamified Productivity Web Application

> Transform mundane real-world habits and tasks into an engaging virtual progression system. Solves the "delayed gratification" problem by providing instant dopamine feedback, tactile 16-bit dungeon crawler aesthetics, and genuine RPG mechanics.

---

## ⚔️ Architecture & Core Features

### 1. RPG Progression Engine
- **Non-Linear Leveling Formula**:
  $$\text{Level XP} = 100 \times (\text{Level}^{1.5})$$
- Evaluates total XP continuously to calculate current level, remaining XP needed for the next rank, and visual progress bar percentages.

### 2. Attribute System
- **Strength**: Physical workouts, gym, lifting, cardio, hydration.
- **Intellect**: Deep coding sessions, algorithms, architecture reviews, reading books.
- **Charisma**: Public speaking, presentations, team retrospectives, social outreach.

### 3. Economy & Virtual Bazaar
- Completing quests yields **Gold** alongside XP.
- Players spend Gold in the Adventurer's Bazaar to unlock legendary badges (*Excalibur of Focus*, *Tome of the Archmage*), visual prestige titles (*Shadow Monarch*), and custom UI themes (*Cyberpunk Grid*, *Lo-Fi Study*).

### 4. Daily Streaks & Multiplier
- Tracks consecutive days of activity.
- Visual multiplier bonus:
  $$\text{Multiplier} = 1.0 + \min(0.5, (\text{Streak} - 1) \times 0.05)$$
- Up to **1.5x Multiplier** applied to both XP and Gold rewards for consistent adventurers.

### 5. Server-Authoritative Anti-Cheat
- **Zero-Trust Client**: Client payloads send only `{ questId }`. XP and Gold amounts are NEVER accepted from client input.
- All quest rewards, streak validations, date calculations, attribute point distributions, and level progressions are calculated and signed on the Express backend.
- Full atomic file persistence with audit logging in `activity_logs`.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Tailwind CSS, Motion (`motion/react`), Lucide Icons, Canvas Confetti
- **Audio**: Custom in-browser 8-Bit Web Audio API synthesizer (no external assets needed)
- **Backend**: Node.js & Express with TypeScript (`tsx` in dev, `esbuild` bundled CommonJS in prod)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **Database**: Production Schema provided in Prisma (`src/server/schema.prisma`) and SQL (`src/server/schema.sql`). Atomic persistent file database engine with ACID write transactions in `data/liferpg_database.json`.

---

## 🚀 Setup & Execution

### Prerequisites
- Node.js 20+
- npm or bun

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `JWT_SECRET` is set:
```env
JWT_SECRET="liferpg_secret_jwt_key_random"
```

### Install Dependencies & Start
```bash
npm install
npm run dev
```
The application will launch on `http://localhost:3000`.

### Production Build & Launch
```bash
npm run build
npm start
```

---

## 📜 Database Schemas
- **Prisma Schema**: `src/server/schema.prisma`
- **SQL DDL**: `src/server/schema.sql`
- Or click the **Deliverables** button in the app header to view live syntax-highlighted schema and formulas.
