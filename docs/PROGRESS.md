# DevPulse Build Progress

**Status: V1 build complete.** Backend + web app fully built, wired, and browser-verified end-to-end (see "Session 2" section at the bottom). Everything in "What's left" below was finished.

Working log for the Backend + Web V1 build (see full plan at `C:\Users\LENOVO\.claude\plans\cached-dancing-wren.md`).
Read this file first when resuming — it has everything needed to continue without re-discovering context.

## Critical context

- **The `devpulse` MySQL database already had real data before this build started**: organization id=1 "DevPulse Technologies" with users "Tejaswini" / "Tejaswini Shinde" and team "Backend Team", created 2026-06-26 — **do not delete/overwrite this**. It's pre-existing user data, not seed data.
- The live schema was far more mature than the empty `database/schema.sql` suggested (sprints, task_comments, task_history, leave_requests, work_calendar, user_sessions, attachments, invitation_logs, app_settings, notifications, activity_logs all already existed). `database/schema.sql` has now been rewritten to faithfully mirror the live schema.
- Backend server (`node server.js` in `backend/`) was left **running in the background** on port 5000 during this session for testing. If it's not running, start it with `cd backend && npm run dev`.
- MySQL80 Windows service must be running (`net start MySQL80` if not).

## What's done

### Database
- `database/schema.sql` — full CREATE TABLE script mirroring the live DB (24 tables), safe to re-run (`IF NOT EXISTS`).
- `database/migrations/001_add_github_and_productivity.sql` — additive migration for the 3 things the live DB was missing: `users.github_username`, `milestones` table, `github_activity` table, `productivity_scores` table. **Already applied** to the live DB.
- `database/seed.sql` — creates a **second, separate demo organization** ("DevPulse Demo Company", org id 2) alongside the pre-existing org (id 1), so testing never touches real data. **Already applied.** Seeded logins (all password `Admin@123`):
  - `admin@devpulse.com` — Admin
  - `rahul@devpulse.com` — Manager / team lead of "Core Engineering", github_username `octocat`
  - `priya@devpulse.com` — Developer, github_username `torvalds`
  - Seed also created project "Training Management System" (id 1) with milestones, tasks, daily logs, github_activity.
  - During manual testing more data was added on top: team "QA Team" (id 3), project "Mobile Revamp" (id 2), task "Redesign login screen" (id 5), a milestone, a daily log — all fine to keep, all under org id 2.

### Backend (`backend/src`)
Bug fixes made along the way:
- `utils/generatecode.js` → renamed to `generateCode.js` (case-sensitivity bug that only worked on Windows, would've broken on Linux deploy).
- `app.js` — login rate limiter's `keyGenerator` fixed to use `ipKeyGenerator` helper (express-rate-limit v8 IPv6 safety requirement; server wouldn't boot without this fix). Also added a 404 handler + wired up `errorMiddleware`.
- `config/db.js` — added `dateStrings: ["DATE"]` to the mysql2 pool config. **Important bug**: without this, MySQL `DATE` columns came back as JS `Date` objects at local midnight, and `.toISOString()` shifted them back a day for positive UTC-offset timezones (verified: commits/hours were showing up one day early). Fixed and verified.
- `.env` — fixed `FRONTEND_URL` typo (`http://localhost:3000y` → `http://localhost:4200`, matching Angular's default port).
- `POST /auth/register` — was completely unguarded (anyone could self-register into any `organization_id` with any role). Now requires `authMiddleware` + Admin/Super Admin role.
- **New**: `POST /auth/register-organization` (public) — creates an organization + its first Admin user in one transaction (`AuthRepository.createOrganizationWithAdmin`). This is the real "Sign Up" entry point; previously there was no way to create an org via the API at all.
- `modules/invite` — was unguarded (any authenticated user could invite) and trusted a client-supplied `organization_id`. Fixed: now Admin/Super-Admin-only, and `organization_id` always comes from the JWT, never the request body.
- `constants/roles.js` and `constants/status.js` — updated to match the real DB enums (`Super Admin`/`Tester` added to roles; `Backlog`/`Code Review`/`Blocked` added to task status).
- `middleware/roleMiddleware.js`, `utils/pagination.js`, `config/logger.js` — were empty stub files, now implemented.
- Added `utils/dateRange.js` (week/month/today range helpers, ISO week number) — shared by daily-logs, dashboard, productivity, github, reports modules.
- Added `constants/productivity.js` — scoring weights/targets (40hr/week, 20 commits/week targets; 40/30/30 weighting).

New modules (all follow the existing `auth`/`invite` pattern: `*.controller.js` / `*.services.js` / `*.repository.js` / `*.routes.js` / `*.validator.js` / `index.js`), all wired into `app.js`, all authenticated via `authMiddleware`, role-restricted where appropriate via `roleMiddleware`:

| Module | Mount | Notes |
|---|---|---|
| `teams` | `/api/teams` | CRUD, Admin-only write |
| `projects` | `/api/projects` | CRUD + `/​:id/members` add/remove, Admin/Manager write |
| `tasks` | `/api/tasks` | CRUD + `PATCH /:id/status` (kanban drag-drop, owner or Admin/Manager only) |
| `dailyLogs` | `/api/daily-logs` | CRUD + `/user-hours` (today/week/month aggregation) |
| `milestones` | `/api/milestones` | CRUD scoped to a project |
| `github` | `/api/github` | `PUT /username`, `POST /sync` (calls public GitHub events API), `GET /activity` |
| `productivity` | `/api/productivity` | `GET /me` (calculates on demand), `GET /team` (Admin/Manager) |
| `dashboard` | `/api/dashboard` | `GET /` (own overview), `GET /team` (Admin/Manager) |
| `reports` | `/api/reports` | `GET /weekly` (chart data), `GET /export` (CSV download) |
| `users` | `/api/users` | **Added mid-build** — wasn't in the original plan but is needed for populating "assign to" dropdowns everywhere. List/get/update/deactivate, org-scoped. |

Cron jobs (`node-cron`, newly added dependency): `jobs/githubSync.js` (nightly 11pm, syncs all users with a github_username) and `jobs/productivityCron.js` (nightly 11:30pm, recalculates everyone's score). Both started from `server.js`.

**Backend fully verified end-to-end via curl**: register-organization → login → create team → create project → assign member → create task → update task status → create daily log → set/sync github username → dashboard → productivity → weekly report → team dashboard → CSV export → role enforcement (403 for non-manager). Everything works.

### Web (`web/` — Angular 20)
- Scaffolded **directly into `web/`** (not `web/devpulse-web/` — used `--directory .`). Standalone components, no SSR, routing enabled.
- Tailwind CSS v4 installed (`.postcssrc.json` + `@theme` block with `brand-*` color scale in `src/styles.css`).
- `@angular/cdk@20` installed (pinned — latest `@angular/cdk` requires Angular 22+, incompatible). Will be used for kanban drag-drop.
- `chart.js` installed directly — **skipped `ng2-charts`** (its peer deps require `@angular/cdk >=21`, conflicts with Angular 20). Plan is to wrap Chart.js manually in a small standalone component instead.
- `src/environments/environment.ts` — `apiUrl: "http://localhost:5000/api"`.
- Core layer done (`src/app/core/`):
  - `models/`: `user`, `api`, `project`, `task`, `daily-log`, `team`, `dashboard`.
  - `services/`: `auth` (signal-based current-user state + localStorage token persistence), `project`, `task`, `daily-log`, `team`, `milestone`, `dashboard` (includes `downloadCsv` via blob), `github`, `user`, `invite`.
  - `interceptors/auth.interceptor.ts` — attaches Bearer token, retries once on 401 via refresh token, logs out on refresh failure.
  - `guards/auth.guard.ts`, `guards/role.guard.ts` (factory: `roleGuard(['Admin', ...])`).
- Shared layer done (`src/app/shared/`):
  - `components/icon.ts` — tiny inline-SVG icon component (no external icon package), `components/stat-card.ts` — dashboard stat tile.
  - `layout/shell.ts` + `shell.html` — sidebar (role-aware nav) + topbar shell wrapping authenticated routes.
- Auth pages (`src/app/features/auth/`):
  - `login.ts` + `login.html` — **done**.
  - `signup.ts` — **done** (register-organization form). **`signup.html` was NOT yet written — this is where the session was interrupted.**

## What's left (in order)

1. **`signup.html`** — template for `signup.ts` (form fields: organization_name, name, email, password — mirror `login.html`'s styling).
2. Accept-invite page (`features/auth/accept-invite.ts/html`) — reads `:token` from route, calls `InviteService.verify()` to show name/email/role, form for password, calls `InviteService.accept()`.
3. Forgot-password / reset-password pages (`features/auth/forgot-password.ts/html`, `reset-password.ts/html`).
4. **Wire `app.routes.ts`** — public routes (`/login`, `/signup`, `/accept-invite/:token`, `/forgot-password`, `/reset-password/:token`) and an authenticated parent route using `Shell` as the component with children: `/dashboard`, `/projects`, `/projects/:id`, `/tasks`, `/daily-logs`, `/reports`, `/team` (role-guarded), `/admin` (role-guarded). Apply `authGuard` on the parent.
5. **Wire `app.config.ts`** — add `provideHttpClient(withInterceptors([authInterceptor]))`.
6. Dashboard page — stat cards (today hours, weekly hours, commits, tasks completed, productivity score) via `DashboardService.getMine()`, weekly chart via `DashboardService.getWeeklyReport()` wrapped in a manual Chart.js component.
7. Projects list/create/edit + project detail (members, milestones) pages.
8. Tasks kanban board — Todo/In Progress/Testing/Done columns using `@angular/cdk` drag-drop, calling `TaskService.updateStatus()` on drop.
9. Daily logs — quick log entry form + history table.
10. Reports page (weekly chart + CSV export button via `DashboardService.downloadCsv()`), Team page (Admin/Manager analytics table via `DashboardService.getTeam()`), Admin page (user list/invite via `UserService` + `InviteService`, team management via `TeamService`).
11. **Browser walkthrough verification** — `ng serve` (or `npm start`) in `web/`, then manually: sign up → login → create project → create task → drag across kanban → log hours → set github username → view dashboard → view weekly chart → export CSV. Backend must be running on port 5000.

## Useful facts for resuming
- Plan file: `C:\Users\LENOVO\.claude\plans\cached-dancing-wren.md`
- Backend module pattern to copy for any new module: look at `backend/src/modules/teams/` (small, clean example) or `backend/src/modules/projects/` (larger example with sub-resources).
- All API responses are `{ success, message, data }`; paginated list responses are `{ items, pagination: { page, pageSize, total, totalPages } }` — matches `web/src/app/core/models/api.model.ts`.
- Today's date during this session was 2026-07-14 (Tuesday).

## Session 2 (2026-07-15) — finished the web app

All remaining items from "What's left" were built and verified:

- `signup.html`, `accept-invite.ts/html`, `forgot-password.ts/html`, `reset-password.ts/html` — all auth pages done.
- `app.config.ts` wired with `provideHttpClient(withInterceptors([authInterceptor]))`; `app.routes.ts` wired with public routes + an authenticated `Shell`-wrapped parent route (`authGuard`) with role-guarded `/team` and `/admin` children.
- New feature pages, each following the existing signal + reactive-forms style: `features/dashboard`, `features/projects` (list + detail, with member/milestone management), `features/tasks` (kanban board using `@angular/cdk` drag-drop, 4 columns Todo/In Progress/Testing/Done), `features/daily-logs`, `features/reports`, `features/team`, `features/admin`.
- New shared component: `shared/components/weekly-chart.ts` — a small standalone Chart.js wrapper (bar+line combo) used by both the dashboard and reports page.

**Important gotcha hit and fixed**: this project's `tsconfig.json` targets `ES2022`, which defaults `useDefineForClassFields` to `true`. That means class field initializers (e.g. `readonly form = this.fb.group(...)`) run *before* constructor-parameter-property assignments (`constructor(private fb: FormBuilder) {}`), so `this.fb` is `undefined` at that point — a real `TS2729` build error, not a lint nitpick. Every component in this app (including the pre-existing `login.ts`/`signup.ts` from session 1, which had never actually been build-verified) now uses `inject()` field initializers instead of constructor-parameter DI, e.g.:
  ```ts
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  readonly form = this.fb.group({ ... }); // safe: fb is already assigned by field-init order
  ```
  **Any new component must follow this `inject()` pattern, not constructor-parameter DI** — otherwise `ng build` fails with `TS2729`.

**Browser-verified** via a headless Playwright script (login → dashboard stat cards/chart → projects list → project detail members/milestones → tasks kanban drag-drop → daily log create → reports chart/CSV button → team analytics table → admin user/team management) as both a Manager (`rahul@devpulse.com`) and Admin (`admin@devpulse.com`). Zero console errors, zero failed HTTP requests across the whole flow. `ng build` succeeds (one bundle-size budget warning, not an error).

## Session 3 (2026-07-15) — tests, CSV verification, responsive, dark mode

All four "not yet done" items from session 2 were completed:

- **CSV export bug found + fixed**: `backend/src/modules/reports/report.services.js` `exportLogsCsv()` only escaped `work_description` for CSV, not `project_name`/`task_title` — a project or task name containing a comma/quote would have corrupted the file. Added a generic `csvField()` escaper (RFC 4180-style: quote+double-quote-escape when the value contains `,`, `"`, or a newline) applied to every column, header included. Verified against the live API before and after.
- **Backend tests**: added Jest + Supertest (`backend/package.json` → `npm test`). 38 tests across `utils/dateRange.test.js`, `utils/pagination.test.js`, `middleware/roleMiddleware.test.js`, `modules/reports/report.services.test.js` (weekly aggregation + the CSV escaping above), `modules/auth/auth.services.test.js` (login lockout/attempts, register dup-email, forgot/reset-password). Needed a `moduleNameMapper` shim (`backend/test/uuidShim.js`, backed by `crypto.randomUUID()`) because the installed `uuid@14` package is ESM-only and Jest can't parse it without a full Babel/ESM setup — mapped `uuid` → the shim instead of adding that complexity.
- **Frontend tests**: 35 Jasmine/Karma specs (`npm test` in `web/`) covering `AuthService`, `ProjectService`, `TaskService`, `DashboardService`, both route guards, `Login` component, and `TaskBoard`'s kanban drag/drop logic (reorder-in-column, cross-column status update, revert-on-error). Also fixed the stale CLI-default `app.spec.ts` (asserted an `<h1>` that no longer exists since routing replaced it).
- **Responsive pass**: `shared/layout/shell.ts/html` rebuilt with a collapsible mobile sidebar (fixed off-canvas, slides in via `-translate-x-full`/`md:translate-x-0`, backdrop overlay, auto-closes on navigation), a mobile sticky header with hamburger, and `overflow-x-auto` wrappers around every data table (daily-logs, reports, team, admin, dashboard team-overview) so wide tables scroll instead of breaking layout on narrow screens.
- **Dark mode**: Tailwind v4 class-based dark mode via `@custom-variant dark (&:where(.dark, .dark *));` in `styles.css` (v4 has no JS config, this is the documented opt-in). New `core/services/theme.service.ts` (signal-based, localStorage-persisted, defaults to `prefers-color-scheme`), applied at the root via `App`'s constructor so it's set before any route renders. Toggle button (sun/moon icon) lives in the shell's topbar. `dark:` variants added across every page/component. `StatCard` was refactored from inline hex `[style.background-color]`/`[style.color]` inputs to a `tone` input (`indigo`/`cyan`/`slate`/`green`/`amber`) mapped to Tailwind classes with `dark:` variants — inline styles can't be overridden by `dark:` utility classes (specificity), so the tone-class approach was required, not optional. `WeeklyChart` (Chart.js) reads `ThemeService.theme()` via an `effect()` and re-renders with theme-appropriate axis/grid/legend colors when the theme flips.

**Browser-verified again** (fresh Playwright pass): confirmed dark mode toggles correctly, persists across a full page reload (localStorage), and renders correctly on dashboard/tasks/reports; confirmed the mobile viewport (390×844) hamburger menu opens/closes the sidebar with backdrop, auto-closes on nav, and every page (dashboard, admin, daily-logs) is usable at that width in both themes. Zero console errors, zero failed HTTP requests. Both `ng build` and both test suites (`backend`: 38/38, `web`: 35/35) pass.
