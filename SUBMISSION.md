# Wanderly — submission pointers

## Repository layout (instructor checklist)

| Requirement | Location |
|-------------|----------|
| **Frontend source code** | [`/client`](./client) — Next.js 14, TypeScript, Tailwind |
| **Backend source code** | [`/server`](./server) — Express, MongoDB, JWT, Stripe |
| **Documentation** | [`README.md`](./README.md) (setup, features, tech stack) |

## Demo credentials (after `npm run seed` in `server/`)

| Role | Email | Password |
|------|--------|----------|
| User | maya.rahman@email.com | Travel@123 |
| Admin | admin@wanderly.com | Admin@123 |

## Local run (Windows)

From project root: `npm run dev`  
Website: http://localhost:3000 · API: http://localhost:5000/api/health

## Live deployment (Render only)

Deploy guide: **[DEPLOY.md](./DEPLOY.md)**

| | URL |
|---|-----|
| **Website (submit)** | `https://wanderly-web.onrender.com` _(create `client` service on Render)_ |
| **API** | https://wanderly-travel-agency.onrender.com/api |
| **GitHub** | https://github.com/atiqahmedreza/wanderly-travel-agency |

**Do not submit** any `*.vercel.app` link for this project unless it is a deployment **you** built from this repo (Home / Explore / Blog / Bangladesh packages).
