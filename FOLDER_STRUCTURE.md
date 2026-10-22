# Wanderly folder structure

```
Best Project/
├── README.md
├── FOLDER_STRUCTURE.md
├── scripts/
│   ├── init-client-git.ps1
│   └── init-server-git.ps1
├── server/                    # Express + MongoDB API (12 commits)
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/db.js
│       ├── models/            # User, Package, Booking, Review, Blog, etc.
│       ├── controllers/
│       ├── middleware/
│       ├── routes/index.js
│       ├── utils/
│       └── seed/              # 25 packages + demo users
└── client/                    # Next.js App Router (21 commits)
    ├── .env.example
    ├── package.json
    └── src/
        ├── app/               # Routes (home, explore, packages, dashboards, blog…)
        ├── components/        # UI, layout, tours, dashboard, home
        ├── contexts/          # Auth (JWT hydrate), Toast
        └── lib/                 # API client, utils
```
