# DevPulse

Team productivity and project-management platform: teams, projects, sprints, tasks (kanban), daily work logs, GitHub activity sync, productivity scoring, leave management, and reporting — with real-time notifications.

## Stack

- **Backend** — Node/Express, MySQL (`mysql2`), JWT auth, Socket.IO for real-time push.
- **Frontend** — Angular 20, standalone components, signals, Tailwind CSS v4 (with dark mode), Chart.js.
- **Database** — MySQL, schema + migrations + seed data in `database/`.

## Features

- Auth: org signup, login, invites, forgot/reset password, role-based access (Admin / Manager / Developer / Tester / Super Admin).
- Teams, projects, sprints, and a drag-and-drop task kanban board.
- Task detail view with threaded comments and file attachments.
- Daily work logs, GitHub activity sync, and productivity scoring.
- Leave requests with manager approval, and a work calendar (holidays).
- Dashboard, weekly reports (with CSV export), and an admin activity log/audit trail.
- In-app notifications pushed live over Socket.IO.

## Getting started

```bash
# backend
cd backend
npm install
npm run dev          # http://localhost:5000, requires MySQL running + backend/.env configured

# frontend (separate terminal)
cd web
npm install
npm start             # http://localhost:8080
```

See [docs/QUICKSTART.md](docs/QUICKSTART.md) for full local setup (starting MySQL, seeded demo logins, common gotchas) and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deploying to Railway (backend) + Vercel (frontend).

## Testing

```bash
cd backend && npm test    # Jest
cd web && npm run test:ci # Karma/Jasmine, headless
```

Both run automatically on push/PR via `.github/workflows/ci.yml`.

## Project layout

- `backend/` — Express API. See `backend/src/modules/*` for the module pattern (`controller` / `services` / `repository` / `routes` / `validator`).
- `web/` — Angular app. Routes are lazy-loaded (`web/src/app/app.routes.ts`); feature pages live under `web/src/app/features/`.
- `database/` — `schema.sql`, `migrations/`, `seed.sql`.
- `docs/` — build history (`PROGRESS.md`), local setup (`QUICKSTART.md`), deployment (`DEPLOYMENT.md`).
