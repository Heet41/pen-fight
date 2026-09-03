# Pen Fight

A browser-based physics game inspired by the classic desk game where players use pens to knock their opponent out of the arena.

**Live Demo:** https://pen-fight-neon.vercel.app/  
**Backend API:** https://pen-fight-backend.onrender.com  
**Repository:** https://github.com/Heet41/pen-fight

---

## Overview

Pen Fight recreates the simple idea of a physical pen battle as an interactive web game.

Players aim and launch a virtual pen across the arena, using physics-based movement, collisions, friction, and boundaries to knock the opposing pen out of play.

The project combines a React frontend, a Node.js backend, PostgreSQL persistence, authentication, game-state management, and real-time infrastructure into a full-stack application.

---

## Features

### Gameplay

- **Local 2-Player Battle**
  - Pass-and-play multiplayer on the same device
  - Separate controls for Player 1 and Player 2
  - Turn-based gameplay
  - Physics-based shooting and collisions
  - Round and victory handling

- **AI Arena**
  - Play against AI opponents
  - Easy, Medium, and Hard difficulty levels
  - AI-controlled turns
  - Physics-aware shot decisions

- **Physics-Based Game Engine**
  - Pen movement and momentum
  - Friction
  - Collision detection
  - Arena boundaries
  - Trajectory preview
  - Knockout detection

- **Game Feedback**
  - Victory and defeat states
  - Visual effects
  - Particle effects
  - Synthesized game audio
  - Responsive game controls

### Accounts & Authentication

- User registration
- Login with username or email
- JWT-based authentication
- Password hashing with bcrypt
- Guest mode
- Demo accounts
- Logout functionality
- Persistent authenticated sessions

### Player Features

- Player profiles
- Match statistics
- Win/loss tracking
- Win rate
- Match history
- Achievements
- Leaderboard
- Cosmetic items

### User Interface

- Dark neon arcade-inspired design
- Animated interface
- Responsive desktop and mobile layouts
- Custom cursor
- Atmospheric particle effects
- Animated transitions
- Dedicated game, profile, settings, and lobby screens

---

## Screenshots

Screenshots of the finished application can be added here.

```text
docs/screenshots/
├── landing.png
├── login.png
├── menu.png
├── local-battle.png
├── ai-battle.png
├── victory.png
├── profile.png
└── settings.png
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State Management | Zustand |
| Rendering | HTML5 Canvas |
| Backend | Node.js |
| API | Express |
| Real-time | Socket.IO |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT + bcrypt |
| Validation | Zod |
| Security | Helmet, CORS, Rate Limiting |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Database Hosting | Neon PostgreSQL |

---

## Architecture

Pen Fight is organized as a TypeScript monorepo with separate frontend, backend, shared, and database layers.

```text
                         ┌─────────────────────┐
                         │      Browser        │
                         │   React + Canvas    │
                         └──────────┬──────────┘
                                    │
                         HTTP / Socket.IO
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │       Backend       │
                         │ Node.js + Express   │
                         │      Socket.IO      │
                         └──────────┬──────────┘
                                    │
                              Prisma ORM
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      PostgreSQL     │
                         │    Neon Database    │
                         └─────────────────────┘

                         ┌─────────────────────┐
                         │       Shared        │
                         │ Types + Game Config │
                         └─────────────────────┘
```

---

## Project Structure

```text
pen-fight/
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI and game components
│   │   ├── pages/           # Application pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # Zustand state management
│   │   ├── utils/            # Frontend utilities
│   │   └── types/            # Frontend types
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── config/           # Environment and database configuration
│   │   ├── controllers/      # API request handlers
│   │   ├── middleware/       # Authentication, errors, rate limiting
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Database access
│   │   ├── websocket/        # Socket.IO functionality
│   │   └── utils/            # Backend utilities
│   └── ...
│
├── shared/
│   └── src/
│       └── index.ts          # Shared types and game configuration
│
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Development/demo data
│
├── docs/                     # Project documentation
├── package.json
└── README.md
```

---

## Running Locally

### Prerequisites

Make sure you have:

- Node.js 20+
- npm 10+
- PostgreSQL 15+ or a PostgreSQL-compatible database

### 1. Clone the repository

```bash
git clone https://github.com/Heet41/pen-fight.git
cd pen-fight
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file based on the project's environment configuration.

At minimum, configure your PostgreSQL connection and application secrets.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/penfight?schema=public"
JWT_SECRET="your-development-jwt-secret"
COOKIE_SECRET="your-development-cookie-secret"
CORS_ORIGIN="http://localhost:5173"
FRONTEND_URL="http://localhost:5173"
```

Do not commit real production secrets to Git.

### 4. Generate Prisma Client

```bash
npx prisma generate --schema=prisma/schema.prisma
```

### 5. Run database migrations

For a development database:

```bash
npx prisma migrate dev --schema=prisma/schema.prisma
```

### 6. Seed the database

```bash
npx prisma db seed
```

The seed creates demo users, achievements, cosmetic items, seasons, and sample data.

### 7. Start the application

```bash
npm run dev
```

The development application runs at:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3001
Health:   http://localhost:3001/api/health
```

---

## Demo Accounts

The seeded database includes demo accounts for testing.

| Username | Email | Password |
|---|---|---|
| admin | admin@penfight.gg | Admin@12345 |
| alice | alice@penfight.gg | Alice@12345 |
| bob | bob@penfight.gg | Bob@12345 |
| charlie | charlie@penfight.gg | Charlie@12345 |
| diana | diana@penfight.gg | Diana@12345 |
| eve | eve@penfight.gg | Eve@12345 |

These accounts are intended for demonstration and development purposes.

---

## Database

Pen Fight uses PostgreSQL with Prisma ORM.

The database contains data for areas including:

- User accounts
- Player statistics
- Matches
- Match players
- Match events
- Game rooms
- Achievements
- Cosmetic items
- Seasons
- Player progression

Useful Prisma commands:

```bash
# Generate Prisma Client
npx prisma generate --schema=prisma/schema.prisma

# Create and apply development migrations
npx prisma migrate dev --schema=prisma/schema.prisma

# Apply production migrations
npx prisma migrate deploy --schema=prisma/schema.prisma

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio --schema=prisma/schema.prisma
```

---

## Authentication

The authentication system supports:

- Account registration
- Username/email login
- Password hashing with bcrypt
- JWT authentication
- Authenticated API requests
- Guest sessions
- Logout
- Current-user session restoration

Authentication requests are handled by the backend API and protected using middleware where required.

---

## API

The backend exposes a REST API under:

```text
/api
```

The application also exposes a health endpoint:

```text
GET /api/health
```

Production health check:

https://pen-fight-backend.onrender.com/api/health

The backend also includes Socket.IO infrastructure for real-time game communication.

---

## Deployment

Pen Fight is deployed as separate frontend, backend, and database services.

### Frontend

Hosted on **Vercel**.

```text
https://pen-fight-neon.vercel.app/
```

The frontend is built using:

```bash
npm run build --workspace=frontend
```

### Backend

Hosted on **Render**.

```text
https://pen-fight-backend.onrender.com
```

The backend build process includes:

```bash
npm install
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate deploy --schema=prisma/schema.prisma
npm run build --workspace=backend
```

### Database

Hosted using **Neon PostgreSQL**.

Production migrations are applied using:

```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

---

## Security

The backend includes several security measures:

- Password hashing using bcrypt
- JWT authentication
- HTTP authentication mechanisms
- Helmet security headers
- CORS configuration
- API rate limiting
- Authentication rate limiting
- Request validation
- Centralized error handling

Production secrets and database credentials are stored as environment variables rather than committed to the repository.

---

## Development Principles

The project was developed around a few practical principles:

- Build the MVP before adding complexity
- Keep frontend, backend, database, and shared logic separated
- Test major features before moving forward
- Make one change at a time when debugging
- Avoid unnecessary rewrites of working systems
- Prioritize usability and responsive design
- Deploy before considering the project finished
- Fix real bugs before adding new features

---

## Current Status

Pen Fight is currently deployed and playable.

### Completed

- [x] Project foundation
- [x] React frontend
- [x] Express backend
- [x] PostgreSQL database
- [x] Prisma integration
- [x] Authentication
- [x] Guest mode
- [x] Demo accounts
- [x] Local 2-player gameplay
- [x] AI gameplay
- [x] Turn-based game flow
- [x] Physics-based gameplay
- [x] Victory and defeat states
- [x] Player profiles
- [x] Match statistics
- [x] Achievements
- [x] Leaderboard
- [x] Cosmetic system
- [x] Responsive UI
- [x] Production deployment
- [x] Production database
- [x] Production health monitoring

---

## Future Improvements

Possible future improvements include:

- Online matchmaking
- Private online rooms
- Expanded multiplayer functionality
- Additional arenas and game modes
- More cosmetic content
- Additional gameplay effects
- Improved competitive systems
- More automated integration and end-to-end testing

These are future possibilities rather than requirements for the current release.

---

## What I Learned

Building Pen Fight involved working across the full application stack, including:

- React application architecture
- TypeScript
- Canvas-based game development
- Physics and collision systems
- State management with Zustand
- REST API design
- Authentication and authorization
- PostgreSQL database design
- Prisma ORM
- WebSocket infrastructure
- Responsive UI development
- Production deployment
- Environment configuration
- Debugging cross-origin and deployment issues

The project was particularly useful for understanding how frontend gameplay, backend services, authentication, and persistent data work together in a real full-stack application.

---

## License

This project was created as a personal portfolio project.

---

## Author

**Heet Khunt**

GitHub: https://github.com/Heet41

Project: https://github.com/Heet41/pen-fight

Live Demo: https://pen-fight-neon.vercel.app/