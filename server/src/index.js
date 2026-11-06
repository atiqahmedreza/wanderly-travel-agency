require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// CLIENT_URL may hold several comma-separated origins, so a second front end
// can be added without a code change. EXTRA_CLIENT_URLS does the same, kept
// separate so CLIENT_URL stays the single canonical origin used for Stripe
// redirects in bookingController.
const splitOrigins = (value) =>
  (value || '')
    .split(',')
    .map((entry) => entry.trim().replace(/\/$/, ''))
    .filter(Boolean);

const allowedOrigins = [
  ...splitOrigins(process.env.CLIENT_URL),
  ...splitOrigins(process.env.EXTRA_CLIENT_URLS),
  // The Vercel-hosted client. Render's web service sleeps after 15 minutes
  // idle and takes ~45s to wake, and the free tier has only enough
  // instance-hours to keep one service warm, which is the API.
  'https://wanderly-travel-agency-drab.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

const isLocalDevOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== 'production' && isLocalDevOrigin(origin)) {
        return callback(null, true);
      }
      try {
        const { hostname } = new URL(origin);
        if (process.env.NODE_ENV === 'production' && hostname.endsWith('.onrender.com')) {
          return callback(null, true);
        }
      } catch {
        /* ignore malformed origin */
      }
      // Refuse without throwing: throwing here surfaces as a 500, which makes
      // a blocked origin look like the API is broken.
      callback(null, false);
    },
    credentials: true,
  })
);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  routes
);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

connectDB()
  .then(async () => {
    const Package = require('./models/Package');
    const { seedDatabase, ensureBlogPosts } = require('./seed/seed');
    const count = await Package.countDocuments();
    if (count === 0) {
      console.log('Empty database — seeding tour packages…');
      await seedDatabase({ closeConnection: false });
    } else {
      await ensureBlogPosts();
    }
    const server = app.listen(PORT, () => console.log(`Wanderly API listening on port ${PORT}`));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `Port ${PORT} is already in use. From project root run: npm run stop — then start the server again.`
        );
      } else {
        console.error(err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
