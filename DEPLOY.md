# Deploy Wanderly (Render only)

This project is **not** hosted on Vercel. The public URL `wanderly-travel-agency.vercel.app` belongs to **another** website — do not use it.

Host **API** and **website** on [Render](https://render.com) from your GitHub repo.

## 1. MongoDB Atlas

Connection string with database `wanderly` (see earlier Atlas setup).  
Use as `MONGODB_URI` on the API service. Seed once from your PC: `cd server && npm run seed`.

## 2. API service (you may already have this)

| Setting | Value |
|---------|--------|
| Repo | `atiqahmedreza/wanderly-travel-agency` |
| Root Directory | `server` |
| Build | `npm install` |
| Start | `npm start` |

Env: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `NODE_ENV=production`, `CLIENT_URL` (set after step 3).

Health: `https://wanderly-travel-agency.onrender.com/api/health`

## 3. Website service (your real Wanderly UI)

**New + → Web Service** → same repo:

| Setting | Value |
|---------|--------|
| Name | `wanderly-web` |
| Root Directory | `client` |
| Build | `npm install && npm run build` |
| Start | `npm start` |
| Plan | Free |

Env:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://wanderly-travel-agency.onrender.com/api` |

**Live URL for submission:** `https://wanderly-web.onrender.com` (or whatever name Render gives you).

Then set API **`CLIENT_URL`** to that exact URL and redeploy the API.

## 4. Remove wrong Vercel site from your account (optional)

If you imported a project on Vercel by mistake:

1. [vercel.com/dashboard](https://vercel.com/dashboard)
2. Open any **Wanderly** project that shows India/Hotels/Cabs
3. **Settings → Delete Project**

That removes it from **your** Vercel account only (not from the whole internet).

## 5. Submit

| Field | Value |
|-------|--------|
| Live website | Your `wanderly-web.onrender.com` URL |
| GitHub | https://github.com/atiqahmedreza/wanderly-travel-agency |
| API | https://wanderly-travel-agency.onrender.com/api |
