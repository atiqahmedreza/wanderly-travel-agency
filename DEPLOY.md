# Deploy Wanderly (Vercel + Render + MongoDB Atlas)

Use this for your **live website URL** on the submission form.

| Step | Service | Result |
|------|---------|--------|
| 1 | MongoDB Atlas | Database |
| 2 | Render | API at `https://….onrender.com` |
| 3 | Vercel | Site at `https://….vercel.app` |
| 4 | Seed + README | Data + submission link |

---

## 1. MongoDB Atlas (free)

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register).
2. Create a **free M0 cluster** (any cloud region).
3. **Database Access** → Add user (username + password). Save the password.
4. **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`) for class demo.
5. **Database** → **Connect** → **Drivers** → copy the connection string.
6. Replace `<password>` with your user password and set the database name, e.g.  
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/wanderly?retryWrites=true&w=majority`

Keep this URI for Render (`MONGODB_URI`).

---

## 2. Render — backend API

1. [https://dashboard.render.com](https://dashboard.render.com) → sign in with **GitHub**.
2. **New +** → **Web Service** → connect repo **`atiqahmedreza/wanderly-travel-agency`**.
3. Settings:

   | Field | Value |
   |-------|--------|
   | **Name** | `wanderly-api` (or any name) |
   | **Root Directory** | `server` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance type** | Free |

4. **Environment** → add:

   | Key | Value |
   |-----|--------|
   | `MONGODB_URI` | Atlas connection string from step 1 |
   | `JWT_SECRET` | long random string (e.g. 32+ characters) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | leave empty for now — set after Vercel (step 3) |

5. **Create Web Service** → wait until **Live**.
6. Copy the URL, e.g. `https://wanderly-api.onrender.com`.
7. Test: open `https://YOUR-API.onrender.com/api/health` → should show `"Wanderly API is running"`.

### Seed production database (once)

First deploy uses an empty Atlas DB. Either:

**A — Render Shell** (Dashboard → your service → **Shell**):

```bash
npm run seed
```

**B — From your PC** (temporarily put Atlas URI in `server/.env`, then):

```powershell
cd server
npm run seed
```

You should see `Packages: 9` and demo users created.

---

## 3. Vercel — frontend

> **Important:** `https://wanderly-travel-agency.vercel.app` is **not** this repo — it is another project. You must deploy **your** GitHub repo and use **your** Vercel URL (e.g. `wanderly-atiq.vercel.app`).

1. [https://vercel.com](https://vercel.com) → sign in with **GitHub**.
2. **Add New…** → **Project** → import **`atiqahmedreza/wanderly-travel-agency`** (your repo).
3. **Project Name:** pick a **unique** name, e.g. `wanderly-atiq` or `wanderly-bd-travel` (avoids clashing with other sites).
4. **Configure Project**:

   | Field | Value |
   |-------|--------|
   | **Root Directory** | `client` (Edit → set to `client`) |
   | **Framework** | Next.js (auto) |

4. **Environment Variables**:

   | Key | Value |
   |-----|--------|
   | `NEXT_PUBLIC_API_URL` | `https://YOUR-API.onrender.com/api` |

   Use your real Render URL from step 2 (include `/api` at the end).

5. **Deploy** → copy the site URL, e.g. `https://wanderly-travel-agency.vercel.app`.

---

## 4. Connect frontend ↔ API (CORS)

1. Back in **Render** → **Environment** → set:

   `CLIENT_URL` = your Vercel URL **exactly** (no trailing slash), e.g.  
   `https://wanderly-travel-agency.vercel.app`

2. **Save** → Render redeploys automatically.

3. Open the **Vercel URL** → test **Explore**, **Blog**, **Login**.

> Render free tier may **sleep** after ~15 minutes. First visit can take 30–60 seconds while the API wakes up.

---

## 5. Update README & submission

In `README.md`, fill the live URLs table, then:

```powershell
git add README.md
git commit -m "docs: add live deployment URLs"
git push
```

**Submission form:**

- **Live Website URL** → Vercel link  
- **GitHub** → `https://github.com/atiqahmedreza/wanderly-travel-agency`  
- **User / Admin** → see `SUBMISSION.md`

---

## Optional: Stripe on production

Add on Render:

- `STRIPE_SECRET_KEY` = `sk_test_…` from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

Without it, booking on **localhost** still works (dev confirm). On live site, configure Stripe or note in README.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Explore empty / Network Error | Wrong `NEXT_PUBLIC_API_URL`; redeploy Vercel |
| CORS error | `CLIENT_URL` on Render must match Vercel URL exactly |
| 503 / DB errors | Check `MONGODB_URI`; Atlas IP allow list |
| Slow first load | Render free cold start — wait and refresh |
| No packages | Run `npm run seed` against Atlas |
