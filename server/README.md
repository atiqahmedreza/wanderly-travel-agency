# Wanderly API

Express + MongoDB backend for the Wanderly travel agency platform.

## Setup

```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

## Environment

See `.env.example` for `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `IMGBB_API_KEY`, and `CLIENT_URL`.

## Scripts

- `npm run dev` — development with nodemon
- `npm run seed` — reset and seed database (24+ packages)
- `npm start` — production server
