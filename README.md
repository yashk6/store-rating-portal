# Store Rating & Reviews Portal

## 🏬 Overview
A full‑stack web application that lets **store owners** manage their stores, **normal users** rate stores (1‑5 stars), and **system administrators** manage users, stores, and view analytics.

## ✨ Features
- Role‑based authentication (Admin, Store Owner, Normal User)
- CRUD for stores and users (admin only)
- Rating system with unique `(user, store)` constraint
- Dashboard per role showing relevant metrics
- Responsive React UI built with Vite + glass‑morphism styling
- Backend API with Express + Sequelize (SQLite for easy local dev)
- **Vercel‑ready** deployment configuration (static build output in `build/`)

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, React‑Router, Lucide‑React
- **Backend:** Express, Sequelize, SQLite (dev) – can switch to PostgreSQL/MySQL by editing `backend/config/db.js`
- **Auth:** JWT + bcrypt
- **Deployment:** Vercel (static build + serverless functions)

## 🚀 Getting Started Locally
```bash
# Clone the repo
git clone https://github.com/yashk6/store-rating-portal.git
cd store-rating-portal

# Install dependencies (frontend & backend)
npm install                # root (for Vercel scripts)
cd frontend && npm ci && cd ..
cd backend && npm ci && cd ..

# Run the servers
# Backend (default SQLite)
npm run start            # from repo root – uses Vercel script to start backend
# Frontend (dev mode)
npm run dev             # from repo root – forwards to Vite
```
Open http://localhost:5173 to see the UI. The backend runs on http://localhost:3000.

## 📦 Vercel Deployment
The repository now contains a **root `package.json`** with a `build` script that:
1. Installs frontend dependencies
2. Runs `vite build`
3. Copies the generated `frontend/dist` folder into a top‑level `build/` directory.

`vercel.json` is configured to:
- Serve the static files from `build/`
- Route `/api/*` to the backend serverless functions.

### Deploy Steps
1. Link the repo on Vercel (if not already linked).
2. Ensure the **Output Directory** in Vercel settings is set to `build` (the `vercel.json` already specifies this).
3. Click **Deploy** – Vercel will run `npm run build` and the site should come online.

## 🔐 Test Credentials (pre‑seeded)
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `Admin@123` |
| Store Owner | `owner@example.com` | `Owner@123` |
| Normal User | `user@example.com` | `User@123` |

> **Note:** Passwords meet the validation rules (8‑16 chars, uppercase, special char).

## 📚 Additional Docs
- See `backend/README.md` for API reference.
- See `frontend/README.md` for UI component guide.

---
*Generated on $(date)*
