# Deploying DevPulse (Railway + Vercel)

Backend + MySQL on Railway, frontend on Vercel. This repo is a monorepo
(`backend/` and `web/` at the root), so both platforms need their
**Root Directory** set explicitly — neither can auto-detect it.

## 1. Backend + database on Railway

1. **New Project → Deploy from GitHub repo** → select this repo.
2. On the created service, go to **Settings → Root Directory** and set it to `backend`.
   Railway will pick up `backend/railway.json` (start command `node server.js`,
   health check `GET /health`, auto-restart on failure) and `backend/package.json`
   automatically via Nixpacks — no other build config needed.
3. **Add a database**: in the project, click **+ New → Database → Add MySQL**.
   Railway provisions it and exposes connection variables (`MYSQLHOST`,
   `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQLPORT`) on the MySQL
   service itself.
4. On the **backend service's** Variables tab, set (reference the MySQL
   service's variables with `${{MySQL.MYSQLHOST}}` etc., or paste the values directly):
   ```
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_USER=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   DB_NAME=${{MySQL.MYSQLDATABASE}}
   JWT_SECRET=<generate a new random 48+ char string>
   JWT_REFRESH_SECRET=<a different random 48+ char string>
   ACCESS_TOKEN_EXPIRE=15m
   REFRESH_TOKEN_EXPIRE=30d
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=<your gmail address>
   MAIL_PASS=<a Google App Password, not your real password>
   FRONTEND_URL=<your Vercel URL from step 2 below - placeholder for now>
   ```
   Railway sets `PORT` itself; `server.js` already reads `process.env.PORT`.
5. **Load the schema**: connect to the new Railway MySQL instance (Railway
   gives you a connection string / or use its web Query tab) and run, in order:
   `database/schema.sql`, then `database/migrations/001_add_github_and_productivity.sql`,
   then optionally `database/seed.sql` for demo data.
6. Deploy. Once live, copy the generated public URL (Settings → Networking →
   Generate Domain), e.g. `https://devpulse-backend-production.up.railway.app`.
   Verify it with `curl https://<that-url>/health` — should return
   `{"success":true,"message":"ok"}`.

## 2. Frontend on Vercel

1. **New Project → Import** this repo.
2. Set **Root Directory** to `web` in the import screen (or Project Settings
   → General afterward).
3. Vercel will read `web/vercel.json` for the build command
   (`npm run build`) and output directory (`dist/devpulse-web/browser`) —
   no framework preset needed, leave it as "Other" if asked.
4. **Before the first real deploy**, edit
   `web/src/environments/environment.prod.ts` and replace
   `https://REPLACE_WITH_YOUR_RAILWAY_BACKEND_URL/api` with your actual
   Railway backend URL + `/api` (e.g.
   `https://devpulse-backend-production.up.railway.app/api`), then commit
   and push — Angular bakes this in at build time, it isn't a runtime env var.
5. Deploy. Copy the resulting Vercel URL (e.g. `https://devpulse.vercel.app`).

## 3. Wire the two together

1. Back on Railway, set the backend's `FRONTEND_URL` variable to the exact
   Vercel URL from step 2.5 (no trailing slash) and redeploy the backend —
   this is what the CORS lockdown in `app.js` checks against.
2. Confirm end-to-end: open the Vercel URL, log in, and check the browser's
   Network tab shows successful `200` responses from the Railway API with
   no CORS errors in the console.

## Notes

- `backend/.env` is never deployed — it's gitignored. Everything the app
  needs comes from the platform's own environment variable settings.
- If you rotate `JWT_SECRET`/`JWT_REFRESH_SECRET` later, every logged-in
  user gets signed out (all existing tokens become invalid) — expected.
- The CI workflow (`.github/workflows/ci.yml`) only runs tests; it does not
  deploy anything. Railway and Vercel each auto-deploy on push to `main`
  once connected via their own GitHub integration — no GitHub Actions
  secrets needed for that.
