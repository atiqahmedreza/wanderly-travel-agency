# Wanderly

**Wanderly** is a production-ready travel agency platform where travelers discover curated tour packages, read detailed itineraries and reviews, book trips online, and pay securely. Admins manage packages, bookings, destinations, and business reports.

## Live URLs

| App | URL |
|-----|-----|
| **Live website (submit this)** | https://wanderly-travel-agency.vercel.app |
| API (Render) | https://wanderly-travel-agency.onrender.com/api |

## GitHub repository

**https://github.com/atiqahmedreza/wanderly-travel-agency**

| Part | Folder |
|------|--------|
| **Frontend source** | [`client/`](./client) — Next.js App Router |
| **Backend source** | [`server/`](./server) — Express + MongoDB |

See [`SUBMISSION.md`](./SUBMISSION.md) for instructor checklist and demo logins.

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@wanderly.com | Admin@123 |
| Traveler | maya.rahman@email.com | Travel@123 |

## Key features

- Photography-led marketing site with light/dark mode
- Server-driven Explore page (filter, sort, pagination)
- Package details, reviews (post-booking), wishlist
- Stripe Checkout (USD) and booking confirmation
- User and Admin dashboards with Recharts analytics
- Blog, contact, newsletter, legal pages
- imgBB image uploads, JWT auth (7-day), role-based access

## Getting started

### Easiest — one command (Windows)

From the **project root** (folder that contains `client/` and `server/`):

```powershell
npm install
cd server; npm install; cd ../client; npm install; cd ..
npm run dev
```

This clears ports **5000** and **3000**, creates `.env` / `.env.local` if missing, and opens two terminals (API + website).

- **Website:** [http://localhost:3000](http://localhost:3000)  
- **API health:** [http://localhost:5000/api/health](http://localhost:5000/api/health)  

Stop stray Node processes: `npm run stop` from the project root.

If MongoDB is not installed locally, the API uses an **in-memory database** (data resets when you stop the server). That is fine for demos; use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) in `server/.env` for persistent data.

### Manual — two terminals

**Server**

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

**Client**

```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## npm packages

### Client

`next`, `react`, `react-dom`, `tailwindcss`, `framer-motion`, `next-themes`, `recharts`, `react-hook-form`, `@hookform/resolvers`, `zod`, `axios`, `date-fns`, `clsx`, `tailwind-merge`, `lucide-react`, `@stripe/stripe-js`

### Server

`express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`, `express-validator`, `stripe`, `multer`, `form-data`, `node-fetch`, `morgan`, `helmet`, `express-rate-limit`

## License

MIT — portfolio / educational use.
