# ⚔️ Life RPG --- Gamified Productivity Web Application

> **Turn real-life progress into an RPG.**

Life RPG transforms everyday habits, tasks, workouts, study sessions,
and personal goals into an engaging virtual progression system. Instead
of relying only on delayed real-world rewards, users receive immediate
feedback through XP, Gold, levels, attributes, streak multipliers,
badges, titles, and visual rewards.

The project is designed as a **full-stack RPG productivity platform**,
with a secure server-authoritative backend rather than a simple
frontend-only prototype.

------------------------------------------------------------------------

## 🎮 Project Overview

Traditional productivity tools can feel repetitive because the payoff
from activities such as studying, reading, exercising, or coding may
take weeks or months to become visible.

Life RPG bridges that gap by applying familiar game mechanics to
real-world productivity:

-   Complete a real-world task → earn **XP + Gold**
-   Gain enough XP → **level up**
-   Complete tasks consistently → build a **streak multiplier**
-   Focus on different activity types → improve **character attributes**
-   Spend Gold → unlock **badges, titles, and themes**
-   Keep progressing → turn productivity into a visible character
    journey

The original project brief emphasizes immediate feedback, clear
progression, tangible rewards, a cohesive visual theme, responsive
interaction, and a robust full-stack architecture. It also requires
persistent server-side data rather than relying solely on
`localStorage`. fileciteturn0file0L3-L12

------------------------------------------------------------------------

# ⚔️ Core Features

## 1. RPG Progression Engine

Life RPG uses a non-linear XP progression system so that higher levels
require progressively more experience.

### Level XP Formula

``` text
Level XP = 100 × (Level ^ 1.5)
```

The system continuously evaluates a player's total XP to determine:

-   Current level
-   XP required for the next level
-   Remaining XP
-   Level progress percentage
-   Level-up events

This creates a progression curve where advancement becomes increasingly
meaningful.

The project brief specifically requires a non-linear leveling system in
which each subsequent level requires more XP than the previous one.
fileciteturn0file0L47-L55

------------------------------------------------------------------------

## 2. 🧬 Character Attribute System

Different real-world activities improve different RPG attributes.

  -----------------------------------------------------------------------
  Attribute                           Example Activities
  ----------------------------------- -----------------------------------
  💪 **Strength**                     Workouts, gym, lifting, cardio,
                                      hydration

  🧠 **Intellect**                    Coding, algorithms, architecture
                                      reviews, reading

  🗣️ **Charisma**                     Public speaking, presentations,
                                      team retrospectives, social
                                      outreach
  -----------------------------------------------------------------------

This makes productivity more than a simple XP counter: users gradually
build a virtual representation of their real-world development.

The project brief also calls for task categories that improve specific
character attributes---for example, coding increasing Intellect and gym
activity increasing Strength. fileciteturn0file0L56-L60

------------------------------------------------------------------------

## 3. 💰 Economy & Adventurer's Bazaar

Completing quests rewards players with **Gold** in addition to XP.

Gold can be spent in the **Adventurer's Bazaar** to unlock virtual
rewards such as:

### Legendary Badges

-   ⚔️ **Excalibur of Focus**
-   📜 **Tome of the Archmage**

### Prestige Titles

-   👑 **Shadow Monarch**

### Custom UI Themes

-   🌐 **Cyberpunk Grid**
-   🎧 **Lo-Fi Study**

The reward economy is intended to make task completion feel tangible and
give players additional long-term goals. The project brief requires an
economy/reward system where users can earn currency or points and spend
them on virtual items, themes, or profile badges.
fileciteturn0file0L56-L61

------------------------------------------------------------------------

## 4. 🔥 Daily Streaks & Reward Multiplier

Life RPG tracks consecutive days of activity.

The reward multiplier is calculated as:

``` text
Multiplier = 1.0 + min(0.5, (Streak - 1) × 0.05)
```

### Maximum Multiplier

``` text
1.5×
```

The multiplier applies to:

-   XP rewards
-   Gold rewards

This encourages consistent daily activity without allowing the
multiplier to grow indefinitely.

Streak tracking is one of the core gamification systems required by the
project brief. fileciteturn0file0L56-L60

------------------------------------------------------------------------

# 🛡️ Server-Authoritative Anti-Cheat

A major design goal of Life RPG is preventing users from directly
manipulating their character statistics.

The frontend follows a **Zero-Trust Client** approach.

Instead of sending reward values from the browser, the client sends only
the quest identifier:

``` json
{
  "questId": "..."
}
```

The client does **not** submit:

``` text
XP
Gold
Streak
Attribute Points
Level
Reward Multiplier
```

These values are calculated on the backend.

### Server Responsibilities

The Express backend is responsible for:

-   Validating the authenticated user
-   Validating quest ownership
-   Calculating XP rewards
-   Calculating Gold rewards
-   Validating streaks
-   Calculating dates
-   Applying reward multipliers
-   Updating attributes
-   Calculating level progression
-   Persisting activity history
-   Maintaining audit logs

Activity is persisted atomically with audit logging in:

``` text
activity_logs
```

This architecture makes the backend the authoritative source of
progression data.

------------------------------------------------------------------------

# 🏗️ Architecture

``` text
┌──────────────────────────────┐
│          React UI            │
│                              │
│ Quests • Character • Bazaar  │
│ Stats • Progress • Themes    │
└──────────────┬───────────────┘
               │
               │ Authenticated API
               │ { questId }
               ▼
┌──────────────────────────────┐
│      Node.js + Express       │
│                              │
│ Authentication              │
│ Quest Validation             │
│ XP / Gold Calculation        │
│ Streak Validation            │
│ Attribute Progression        │
│ Anti-Cheat Logic             │
└──────────────┬───────────────┘
               │
               │ Atomic persistence
               ▼
┌──────────────────────────────┐
│       Persistent Data        │
│                              │
│ liferpg_database.json        │
│ Prisma Schema / SQL Schema   │
│ Activity Logs                │
└──────────────────────────────┘
```

The project brief requires a full-stack architecture with authentication
and persistent storage for users, tasks, character data, and historical
activity rather than a purely client-side implementation.
fileciteturn0file0L8-L12

------------------------------------------------------------------------

# 🛠️ Tech Stack

## Frontend

-   **React 19**
-   **Tailwind CSS**
-   **Motion (`motion/react`)**
-   **Lucide Icons**
-   **Canvas Confetti**

## Audio

-   Custom **8-bit Web Audio API synthesizer**
-   No external audio assets required

## Backend

-   **Node.js**
-   **Express**
-   **TypeScript**
-   **tsx** for development
-   **esbuild** for production bundling
-   Production bundle format: **CommonJS**

## Authentication

-   **JWT (JSON Web Tokens)**
-   **bcryptjs** password hashing

## Database & Persistence

-   **Prisma schema**
-   **SQL DDL schema**
-   Atomic persistent file database engine
-   ACID write transactions
-   Database file:

``` text
data/liferpg_database.json
```

Schema files:

``` text
src/server/schema.prisma
src/server/schema.sql
```

------------------------------------------------------------------------

# 📁 Project Structure

A typical project structure is:

``` text
Life-RPG/
│
├── src/
│   ├── client/
│   │   └── ...
│   │
│   └── server/
│       ├── schema.prisma
│       ├── schema.sql
│       └── ...
│
├── data/
│   └── liferpg_database.json
│
├── .env.example
├── package.json
└── README.md
```

> The exact frontend/backend folder structure may vary depending on the
> implementation.

------------------------------------------------------------------------

# 🚀 Getting Started

## Prerequisites

Make sure you have:

-   **Node.js 20+**
-   **npm** or **bun**

------------------------------------------------------------------------

## 1. Clone the Repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <PROJECT_DIRECTORY>
```

------------------------------------------------------------------------

## 2. Configure Environment Variables

Copy the example environment file:

``` bash
cp .env.example .env
```

Set the JWT secret in `.env`:

``` env
JWT_SECRET="liferpg_secret_jwt_key_random"
```

> For production, use a long, unpredictable secret rather than the
> example value.

------------------------------------------------------------------------

## 3. Install Dependencies

Using npm:

``` bash
npm install
```

Or using bun:

``` bash
bun install
```

------------------------------------------------------------------------

## 4. Start Development Server

``` bash
npm run dev
```

The application will be available at:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

# 📦 Production Build

Build the application:

``` bash
npm run build
```

Start the production server:

``` bash
npm start
```

------------------------------------------------------------------------

# 🔐 Authentication & Security

Life RPG uses JWT-based authentication and bcrypt password hashing.

The backend is designed around the principle that **the client should
never be trusted with authoritative progression values**.

For example, a malicious client should not be able to submit:

``` json
{
  "questId": "quest-123",
  "xp": 999999,
  "gold": 999999
}
```

Instead, the backend determines the correct reward based on the quest
stored on the server.

This supports the requirement that each authenticated user can access
and modify only their own tasks and character data.
fileciteturn0file0L47-L53

------------------------------------------------------------------------

# 🎨 UI / UX Philosophy

Life RPG intentionally avoids the look of a generic enterprise SaaS
dashboard.

The design direction is inspired by:

-   16-bit dungeon crawlers
-   RPG interfaces
-   Retro gaming
-   Fantasy progression systems
-   Tactile game feedback

The interface is designed to make actions feel rewarding through:

-   Micro-interactions
-   Motion animations
-   Level-up feedback
-   Confetti effects
-   Reward notifications
-   Progress bars
-   RPG terminology
-   Custom themes
-   8-bit audio feedback

The supplied project brief explicitly emphasizes an interface that feels
**alive, tactile, and thematically cohesive**, with instant reactions to
XP gains, level-ups, and purchases. fileciteturn0file0L13-L27

------------------------------------------------------------------------

# 📱 Responsive & Accessible Design

The application is designed to work across:

-   📱 Mobile
-   📲 Tablet
-   💻 Laptop
-   🖥️ Desktop

Accessibility considerations include:

-   Keyboard navigation
-   Tab navigation
-   Enter / Space interactions
-   Semantic structure
-   Screen-reader-friendly UI

These requirements are explicitly included in the project brief.
fileciteturn0file0L62-L64

------------------------------------------------------------------------

# 🗃️ Database

Life RPG includes the following schema references:

``` text
src/server/schema.prisma
src/server/schema.sql
```

The persistent runtime database is:

``` text
data/liferpg_database.json
```

The system maintains persistent information such as:

-   Users
-   Authentication information
-   Tasks / quests
-   Character progression
-   Attributes
-   Rewards
-   Inventory / unlocked items
-   Activity history
-   Audit logs

The competition brief requires a database capable of maintaining users,
tasks, character attributes, historical logs, and inventory-related
data. fileciteturn0file0L10-L12

------------------------------------------------------------------------

# 📜 Deliverables

The project is intended to provide:

### 1. Public GitHub Repository

The repository should contain:

-   Frontend source code
-   Backend source code
-   Database/schema files
-   `.env.example`
-   Detailed README
-   Clean chronological commit history

The supplied brief requires at least **3 chronological commits** and a
repository containing the backend code. fileciteturn0file0L38-L41
fileciteturn0file0L81-L87

### 2. Live Deployment

A publicly accessible deployment of the application.

Example hosting platforms from the brief include:

-   Vercel
-   Netlify
-   Render
-   Railway
-   Heroku
-   AWS

fileciteturn0file0L42-L43

### 3. Walkthrough Video

A short demonstration showing:

1.  User signup/login
2.  Adding a task
3.  Completing a task
4.  Receiving XP / rewards
5.  Level progression
6.  Refreshing the page
7.  Confirming database persistence

The required video duration is **90--180 seconds** and the file must be
**under 100 MB**. fileciteturn0file0L44-L46

------------------------------------------------------------------------

# 👥 Team

## Team Juggernaut

  Team Member                 Role
  --------------------------- ----------------------------------
  **Ayutayam Sutar**          🧑‍💻 Backend Developer & Team Lead
  **Sushree Adyasha Sahoo**   🎨 Frontend Developer
  **Deepshikha Swain**        🎨 Frontend Developer
  **Ayushman Pradhan**        🚀 Deployment & UI/UX

### Team Responsibilities

**Ayutayam Sutar --- Backend Developer & Team Lead** - Backend
architecture - Express API development - Authentication - RPG
progression logic - XP / Gold calculations - Streak validation -
Database and persistence - Server-side security / anti-cheat - Team
coordination

**Sushree Adyasha Sahoo --- Frontend Developer** - React interface
development - Quest and progression screens - RPG components - Frontend
interactions - Responsive implementation

**Deepshikha Swain --- Frontend Developer** - React UI development -
Interactive components - Animations and user feedback - Responsive
layouts - Frontend integration

**Ayushman Pradhan --- Deployment & UI/UX** - Deployment and production
setup - UI/UX design support - Visual consistency - Responsive design
support - Deployment testing

------------------------------------------------------------------------

# 🧪 Error Handling & Edge Cases

Life RPG is designed to account for common application edge cases,
including:

-   Empty task submissions
-   Invalid quest IDs
-   Unauthorized requests
-   Duplicate completion attempts
-   Invalid authentication tokens
-   Network failures
-   Persistent database failures
-   Invalid reward manipulation attempts
-   Unexpected runtime errors

The project brief specifically evaluates robustness, including behavior
when users submit invalid/empty tasks or lose their internet connection.
fileciteturn0file0L75-L80

------------------------------------------------------------------------

# 🏆 Judging & Design Goals

The project is built around the judging priorities defined in the
supplied brief:

### 🎨 Design & UX

A polished, creative, cohesive experience rather than generic dashboard
components.

### ⚡ Performance & SEO

Fast loading, optimized assets, responsive behavior, semantic HTML,
accessibility, and SEO-friendly content.

### 🎮 Creativity & Gamification

The RPG systems should feel meaningful rather than simply being
decorative.

### 🛡️ Robustness & Edge Cases

The application should handle invalid input, failures, and unexpected
states gracefully.

### ♿ Accessibility & Responsiveness

The experience should remain usable across screen sizes and support
keyboard navigation.

fileciteturn0file0L67-L80

------------------------------------------------------------------------

# ⚠️ Important Submission Requirements

Before submission, verify:

-   [ ] GitHub repository is public
-   [ ] Repository contains both frontend and backend
-   [ ] At least 3 chronological commits exist
-   [ ] `.env.example` is included
-   [ ] Live deployment works
-   [ ] Backend connects successfully in production
-   [ ] Primary data is not stored only in `localStorage`
-   [ ] No blank-screen/runtime crashes occur
-   [ ] Walkthrough video is publicly accessible
-   [ ] Video is 90--180 seconds
-   [ ] Video is below 100 MB
-   [ ] Signup/login works
-   [ ] Quest creation/completion works
-   [ ] XP and Gold rewards work
-   [ ] Level progression works
-   [ ] Page refresh preserves data
-   [ ] Responsive UI works
-   [ ] Keyboard navigation works

These checks reflect the zero-tolerance submission rules and required
deliverables in the supplied project brief.
fileciteturn0file0L38-L46 fileciteturn0file0L65-L87

------------------------------------------------------------------------

# 🧭 Product Vision

Life RPG is built around one simple idea:

> **Make progress feel like progress.**

Instead of seeing a completed workout, coding session, or study session
as another checkbox, Life RPG turns that action into measurable
character growth.

Every quest completed contributes to the adventurer's journey.

**Complete quests. Earn XP. Build attributes. Maintain your streak.
Spend your Gold. Level up your life.**

------------------------------------------------------------------------

## ⚔️ Team Juggernaut

**Sushree Adyasha Sahoo** · Frontend Developer\
**Deepshikha Swain** · Frontend Developer\
**Ayushman Pradhan** · Deployment & UI/UX\
**Ayutayam Sutar** · Backend Developer & Team Lead
