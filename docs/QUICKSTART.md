# Quick Start (resuming local dev)

Read this first when picking the project back up. For full history/decisions see `PROGRESS.md`; for hosting see `DEPLOYMENT.md`.

## 1. Start MySQL

MySQL80 runs as a Windows service.

```powershell
Get-Service MySQL80          # check status
net start MySQL80            # if not running
```

## 2. Start the backend

```bash
cd backend
npm run dev                  # nodemon, port 5000
curl http://localhost:5000/health   # should return {"success":true,"message":"ok"}
```

Reads config from `backend/.env` (gitignored — if it's missing, copy `backend/.env.example` and fill in real values). DB connects as `devpulse_app`, a MySQL user scoped to only the `devpulse` database (not root) — see `DB_USER`/`DB_PASSWORD` in `.env` for the current password.

## 3. Start the frontend

```bash
cd web
npm start                    # ng serve, port 8080
```

Open **http://localhost:8080**.

## 4. Log in

Seeded demo accounts (all password `Admin@123`):

| Email | Role |
|---|---|
| `admin@devpulse.com` | Admin |
| `rahul@devpulse.com` | Manager (Core Engineering team lead) |
| `priya@devpulse.com` | Developer |

## 5. Connect MySQL Workbench (optional)

New connection → Host `localhost`, Port `3306`, Username `devpulse_app`, password from `backend/.env`'s `DB_PASSWORD`. You'll only see the `devpulse` schema — this user can't touch other databases or run DDL, so use `root` instead if you need to alter the schema.

## Common gotcha: stale dev server on the port

If `npm run dev` / `npm start` boots but requests hang, time out, or you see behavior that doesn't match the code you just changed, an old server process from a previous session is likely still holding the port (Windows doesn't always clean these up when a background task is stopped).

```powershell
Get-NetTCPConnection -LocalPort 5000,8080 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
```

Then restart. This has bitten us more than once — always suspect this first if something that should obviously work doesn't.

## Running the tests

```bash
cd backend && npm test        # Jest: 38 unit + 9 integration
cd web && npm run test:ci     # Karma/Jasmine, headless
```

Both also run automatically on push/PR via `.github/workflows/ci.yml`.

## Project layout

- `backend/` — Node/Express API, MySQL via `mysql2`. See `backend/src/modules/*` for the module pattern (controller/service/repository/routes/validator).
- `web/` — Angular 20, standalone components, signals, Tailwind v4 with dark mode. Routes are lazy-loaded (`web/src/app/app.routes.ts`).
- `database/` — `schema.sql`, `migrations/`, `seed.sql`.
