# ✒️ Pen Fight

A **production-ready, browser-based multiplayer pen fighting game** — the classic desk game, reimagined for the web.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791)](https://postgresql.org)

---

## 🎮 Game Concept

Two players control virtual pens on a game board and try to knock the opponent's pen outside the playable area. Players alternate turns, aiming and shooting with adjustable power. Physics handles friction, collisions, and boundaries. Last pen inside the arena wins.

---

## ✨ Features

### Gameplay
- **Local 2-Player** — Pass & play on the same device with round score tracking
- **VS AI Bot** — Three difficulty levels: Easy, Medium, and Hard with strategic physics simulation
- **HTML5 Canvas Engine** — Deterministic physics, capsule pen collision, momentum conservation, trajectory preview
- **Web Audio FX** — Synthesized launch swoosh, pen collision clacks, and victory fanfares

### Progression & Customization
- **XP & Levels** — Earn XP from AI and Local battles, level up dynamically
- **Global Leaderboard** — Ranked by MMR, Win Rate %, and Win Streaks
- **Locker & Cosmetics** — Unlock and equip pen skins, glow effects, and titles
- **Achievements** — 15 unlockable milestone achievements
- **Player Profiles** — Detailed match history, stats, and win rates

### Technical
- **Type-safe Monorepo** — 100% TypeScript across frontend, backend, and shared packages
- **Secure Auth** — JWT with HTTP-only cookies, bcrypt hashing, and instant Guest mode
- **Automated Tests** — Complete unit test suites for Physics, AI, and Ranking algorithms

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Game Rendering | HTML5 Canvas |
| State Management | Zustand |
| Backend | Node.js, Express, TypeScript |
| Real-time | Socket.IO |
| Database | PostgreSQL 15+ |
| ORM | Prisma |
| Authentication | JWT, bcryptjs, HTTP-only cookies |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |

---

## 📁 Project Structure

```
pen-fight/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page-level components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand state stores
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   └── ...
├── backend/           # Express API + Socket.IO
│   └── src/
│       ├── config/        # Environment configuration
│       ├── controllers/   # Request handlers
│       ├── middleware/    # Auth, rate limiting, error handling
│       ├── routes/        # API route definitions
│       ├── services/      # Business logic
│       ├── repositories/  # Database access layer
│       ├── websocket/     # Socket.IO event handlers
│       └── utils/         # Shared utilities
├── shared/            # Shared types, constants, game config
│   └── src/
│       └── index.ts       # Types, constants, game config
├── prisma/            # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts
└── docs/              # Documentation
```

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [PostgreSQL](https://postgresql.org/) 15+
- npm 10+

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/pen-fight.git
cd pen-fight
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and set your DATABASE_URL and secrets
```

### 3. Database Setup

```bash
# Create the database
createdb penfight

# Run migrations
npx prisma migrate dev --schema=prisma/schema.prisma

# Seed development data
npx ts-node prisma/seed.ts
```

### 4. Start Development

```bash
# Start both frontend and backend concurrently
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health check**: http://localhost:3001/api/health

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `PORT` | ❌ | `3001` | Backend server port |
| `NODE_ENV` | ❌ | `development` | Environment |
| `JWT_SECRET` | ✅ | — | JWT signing secret (change in production!) |
| `JWT_EXPIRES_IN` | ❌ | `7d` | JWT token lifetime |
| `COOKIE_SECRET` | ✅ | — | Cookie signing secret |
| `CORS_ORIGIN` | ❌ | `http://localhost:5173` | Allowed CORS origin |
| `FRONTEND_URL` | ❌ | `http://localhost:5173` | Frontend URL for links |
| `RATE_LIMIT_WINDOW_MS` | ❌ | `900000` | Rate limit window (15min) |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ | `100` | Max requests per window |
| `AUTH_RATE_LIMIT_MAX` | ❌ | `10` | Max auth attempts per window |

---

## 🗄️ Database

### Schema Overview

| Table | Purpose |
|-------|---------|
| `users` | Player accounts |
| `player_stats` | Win/loss stats, rating |
| `rooms` | Online game rooms |
| `matches` | Match records |
| `match_players` | Player-match mapping |
| `match_events` | Shot/collision event log |

### Commands

```bash
# Run migrations
npx prisma migrate dev --schema=prisma/schema.prisma

# Reset database (⚠️ destroys all data)
npx prisma migrate reset --schema=prisma/schema.prisma

# Open database studio
npx prisma studio --schema=prisma/schema.prisma

# Seed with test data
npx ts-node prisma/seed.ts
```

---

## 🌐 API Overview

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/:id` | Get user profile |
| PATCH | `/api/users/:id` | Update profile |
| GET | `/api/users/:id/stats` | Player stats |

### Rooms
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/rooms` | Create room |
| POST | `/api/rooms/join` | Join with code |
| GET | `/api/rooms/:code` | Get room info |
| DELETE | `/api/rooms/:id` | Delete room |

### Matches
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/matches` | Create match |
| GET | `/api/matches/:id` | Get match |
| GET | `/api/matches/history` | Match history |

### Other
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leaderboard` | Leaderboard |
| GET | `/api/health` | Health check |

---

## ⚡ WebSocket Events

### Client → Server
| Event | Description |
|-------|-------------|
| `room:create` | Create a new room |
| `room:join` | Join a room by code |
| `room:leave` | Leave current room |
| `room:ready` | Toggle ready state |
| `game:shot` | Submit a shot (angle + power) |
| `reaction:send` | Send an emoji reaction |
| `quickchat:send` | Send a quick chat message |
| `rematch:request` | Request a rematch |
| `rematch:accept` | Accept rematch |
| `matchmaking:join` | Join ranked queue |
| `matchmaking:cancel` | Leave ranked queue |

### Server → Client
| Event | Description |
|-------|-------------|
| `game:start` | Match starting |
| `game:state` | Full game state update |
| `game:turn` | Turn changed |
| `game:physics` | Physics simulation result |
| `game:ended` | Match over, with winner |
| `player:disconnect` | Opponent disconnected |
| `player:reconnect` | Opponent reconnected |
| `matchmaking:found` | Match found |
| `reaction:receive` | Receive reaction |
| `rank:updated` | Rating/rank changed |
| `level:up` | Level up notification |
| `achievement:unlocked` | Achievement earned |

---

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run all tests
npm test
```

---

## 🐳 Docker

```bash
# Start all services (PostgreSQL + Backend + Frontend)
docker compose up

# Background mode
docker compose up -d

# Stop
docker compose down
```

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Backend (Railway/Render)
1. Connect GitHub repo
2. Set environment variables
3. Deploy `backend/` directory
4. Make sure the platform supports WebSockets

### Database (Supabase / Neon / Railway PostgreSQL)
1. Create a PostgreSQL instance
2. Copy the connection string to `DATABASE_URL`
3. Run `prisma migrate deploy`

---

## 🗺️ Build Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ | Project foundation |
| 2 | 🔲 | Database schema |
| 3 | 🔲 | Authentication |
| 4 | 🔲 | Core game engine |
| 5 | 🔲 | Local multiplayer |
| 6 | 🔲 | AI |
| 7 | 🔲 | Online rooms |
| 8 | 🔲 | Custom rooms |
| 9 | 🔲 | Social features |
| 10 | 🔲 | XP & levels |
| 11 | 🔲 | Ranked mode |
| 12 | 🔲 | Matchmaking |
| 13 | 🔲 | Seasons & achievements |
| 14 | 🔲 | Polish |
| 15 | 🔲 | Testing |

---

## 📝 License

MIT — see [LICENSE](LICENSE) for details.
