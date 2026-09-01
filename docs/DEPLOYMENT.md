# 🚀 Pen Fight — Production Deployment Guide (Vercel + Render + Neon)

This guide provides exact step-by-step instructions for deploying the **Pen Fight** production stack:
- 🖥️ **Frontend:** [Vercel](https://vercel.com) (Edge CDN React 18 SPA)
- 🔌 **Backend:** [Render](https://render.com) (Node.js 20+ Express & Socket.IO Web Service)
- 🗄️ **Database:** [Neon](https://neon.tech) (Serverless PostgreSQL 16)

---

## 🏗️ Architecture & Data Flow

```
┌────────────────────────────────┐            ┌────────────────────────────────┐
│      Vercel (Frontend)         │  HTTPS API │      Render (Backend)          │
│    https://penfight.vercel.app ├───────────►│  https://penfight.onrender.com │
│    VITE_API_URL=...            │◄───WSS─────┤  (0.0.0.0:$PORT)               │
└────────────────────────────────┘            └───────────────┬────────────────┘
                                                              │
                                                              ▼
                                              ┌────────────────────────────────┐
                                              │     Neon (PostgreSQL 16)       │
                                              │  ep-xyz.neon.tech?sslmode=...  │
                                              └────────────────────────────────┘
```

---

## 📋 Exact Deployment Steps

### STEP 1: Provision Neon PostgreSQL Database

1. Sign up / log in to [Neon](https://console.neon.tech).
2. Click **Create Project** $\to$ Name it `penfight` $\to$ Region: choose closest to your Render region (e.g. `US East (N. Virginia)` or `EU Frankfurt`).
3. Under **Connection Details**, copy the **Pooled Connection String** (or Direct Connection String):
   ```
   postgresql://<user>:<password>@<endpoint-id>.neon.tech/neondb?sslmode=require
   ```
   *(Keep this connection string handy for Step 2).*

---

### STEP 2: Deploy Backend to Render

1. Sign up / log in to [Render](https://dashboard.render.com).
2. Click **New +** $\to$ Select **Web Service**.
3. Connect your GitHub repository (`pen-fight`).
4. Configure service settings:
   - **Name:** `penfight-backend`
   - **Region:** Same region as Neon (e.g. `Oregon` or `Frankfurt`)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank / project root)*
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm install && npx prisma generate --schema=prisma/schema.prisma && npx prisma db push --schema=prisma/schema.prisma && npm run build --workspace=backend
     ```
   - **Start Command:**
     ```bash
     npm run start --workspace=backend
     ```
   - **Plan:** `Free` or `Starter`
   - **Health Check Path:** `/health`
5. Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations & security |
   | `DATABASE_URL` | `<neon_connection_string>` | Copied from Step 1 |
   | `JWT_SECRET` | *(click Generate or random 32-char string)* | Auth session signing key |
   | `COOKIE_SECRET` | *(click Generate or random 32-char string)* | Cookie encryption key |
   | `CORS_ORIGIN` | `https://penfight.vercel.app,http://localhost:5173` | Replace with your Vercel URL |
6. Click **Create Web Service**.
7. Once deployed, copy your Render URL (e.g. `https://penfight-backend.onrender.com`).
8. *(Optional)* Seed initial achievements & items in Neon by opening Render **Shell** and running:
   ```bash
   npx ts-node -P tsconfig.json prisma/seed.ts
   ```

---

### STEP 3: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com/dashboard).
2. Click **Add New...** $\to$ **Project** $\to$ Import your `pen-fight` repository.
3. Configure project settings:
   - **Project Name:** `penfight`
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend` (or leave root since `vercel.json` is configured)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://penfight-backend.onrender.com` | Your Render backend URL |
   | `VITE_SOCKET_URL` | `https://penfight-backend.onrender.com` | Your Render backend URL |
5. Click **Deploy**.
6. Once deployed, note your Vercel URL (e.g. `https://penfight.vercel.app`).

---

### STEP 4: Update CORS on Render (Final Linkage)

1. Go back to your [Render Dashboard](https://dashboard.render.com) $\to$ `penfight-backend` $\to$ **Environment**.
2. Ensure `CORS_ORIGIN` contains your actual Vercel deployment URL:
   ```
   https://penfight.vercel.app
   ```
3. Render will automatically re-deploy with the updated CORS configuration.

---

## 🛠️ Verification & Health Check

1. Test Backend Health:
   ```bash
   curl https://penfight-backend.onrender.com/api/health
   ```
   **Expected output:**
   ```json
   {
     "success": true,
     "status": "healthy",
     "service": "Pen Fight API",
     "version": "1.0.0",
     "database": "connected"
   }
   ```
2. Open your Vercel URL in your browser (`https://penfight.vercel.app`).
3. Register an account or click **Play as Guest**.
4. Test:
   - Local 2-Player match
   - Play VS AI match
   - Global Leaderboard
   - Locker & Cosmetics

---

## 📝 Summary of Exact Commands

| Task | Command |
|---|---|
| **Frontend Build** | `npm run build --workspace=frontend` *(executes `tsc && vite build`)* |
| **Backend Build** | `npm run build --workspace=backend` *(executes `tsc`)* |
| **Backend Start** | `npm run start --workspace=backend` *(executes `node dist/backend/src/index.js`)* |
| **Database Schema Push** | `npx prisma db push --schema=prisma/schema.prisma` |
| **Database Seed** | `npx ts-node -P tsconfig.json prisma/seed.ts` |
