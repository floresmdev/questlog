# Decisions

Append-only. Newest at the bottom. To reverse a decision, add a new entry that supersedes it.

Format: `## NNN · YYYY-MM-DD · title` → Decision / Why / Rejected.

## 001 · 2026-09-29 · Monorepo
- **Decision:** One repo with `frontend/`, `backend/`, `infra/`, `docs/` and the compose files at the root (layout in HANDOFF §1b).
- **Why:** One person, one deployable stack; frontend, API and infra change together; one history to show as a portfolio.
- **Rejected:** Separate repos per tier (sync overhead, no benefit at this size); workspace tooling (Nx/Turborepo) — not needed yet.

## 002 · 2026-09-29 · Self-hosted 3-tier instead of Supabase
- **Decision:** nginx + Node/Express + PostgreSQL 16 in Docker Compose on my own server. No BaaS, no serverless.
- **Why:** This is a SysAdmin portfolio project — running the reverse proxy, TLS, DB, backups and networking myself is the point. Also no vendor lock-in for the client.
- **Rejected:** Supabase (hides exactly the ops work I want to show); Firebase / serverless functions (same reason, plus lock-in).

## 003 · 2026-09-29 · Mock API behind an interface
- **Decision:** `QuestlogApi` interface in `frontend/src/api/client.ts`, one method per future endpoint; `mockApi` implements it over `src/mocks/`; `api/index.ts` picks the implementation.
- **Why:** Build the UI before the backend exists; the interface doubles as the endpoint contract for phase 2; switching to HTTP is a one-line change.
- **Rejected:** Mocks imported straight into components (rewrite every component later); MSW / json-server (extra dependency, still needs typed contract).

## 004 · 2026-09-29 · HTML references over PNGs as source of truth
- **Decision:** `docs/design/*.reference.html` wins for layout, spacing, colors, copy and sample data. Exceptions taken from the PNGs: logged-in user is Gonzalo ("GonzaGOD", CEO) instead of Laura (Producer), and game name is `[JUEGO SUPREMO]` instead of `[NOMBRE DEL JUEGO]` (`lib/app.ts`).
- **Why:** HTML has exact values; PNGs are lossy exports. The PNGs carry the client's latest choice for user and game name.
- **Rejected:** PNG as primary (eyeballed pixels); porting the HTML's proprietary runtime (HANDOFF §1 forbids it).

## 005 · 2026-09-29 · Scrollable task detail panel
- **Decision:** `TaskDetailPanel` keeps header and action buttons fixed; the middle (fields, description, comments) scrolls (`overflow-y-auto`).
- **Why:** The design frame has a fixed height; real descriptions and comment threads are longer than the sample and would push the actions off-screen.
- **Rejected:** Growing the panel/page with content (breaks the board layout); truncating description/comments (hides data).

## 006 · 2026-09-29 · APP_NOW constant
- **Decision:** `frontend/src/lib/now.ts` exports `APP_NOW` = 2026-09-28 16:20 (when the mocks were drawn); all relative dates use it.
- **Why:** Mock data has fixed dates; with `new Date()` "hace 2 h", the calendar and "today" would drift from the references.
- **Rejected:** `new Date()` now (UI wrong against mocks); shifting mock dates relative to now (noisy, hard to compare with refs). Switch to `new Date()` when real data lands.

## 007 · 2026-10-21 · Final data model
- **Decision:** HANDOFF §3 replaced by the final schema: `users.job_title` (nullable) and `is_active`; `builds.build_number` nullable plus `planned_for` (a build in preparation has no number and no `released_at`); `tasks.due_date` → `due_at timestamptz`; `activity_log` stores structured events (`action` + `payload`) and the client renders the Spanish sentence; `sessions` table for phase 2b; `CHECK ((status = 'done') = (done_state IS NOT NULL))`; indexes listed in §3. Every FK points at `users` (no `profiles`).
- **Why:** Resolves the four open questions from phase 1: the UI shows job titles, times of day on the agenda and builds in preparation. Keeping activity structured lets copy differ per screen and keeps UI language out of the DB.
- **Rejected:** A separate `due_time` column (two columns for one instant); overloading `released_at` as a planned date (ambiguous); storing rendered sentences in `activity_log` (copy changes would need data migrations).

## 008 · 2026-10-21 · Backend stack
- **Decision:** Node LTS + Express 5 + TypeScript strict (`tsx` in dev); `pg` with a small query helper, no ORM; `node-pg-migrate` with plain SQL migrations; `zod` for request and env validation; `pino` for logs; `helmet`. Vitest + Supertest against a dedicated test database.
- **Why:** Plain SQL keeps the schema, constraints and aggregates (stats endpoints) visible and reviewable; few dependencies; env validated at startup fails fast on misconfiguration.
- **Rejected:** Prisma/TypeORM (hides SQL, extra codegen/runtime); NestJS (heavy for this size); mocking the DB in tests (misses constraint and SQL bugs).

## 009 · 2026-10-21 · Server-side sessions, not JWT
- **Decision:** argon2id password hashes; sessions stored in the `sessions` table, referenced by an `httpOnly`, `SameSite=Lax` cookie (`Secure` in prod). Logout deletes the session. Rate-limited login; failed logins logged in a parseable format. Roles `admin` / `member` enforced in middleware.
- **Why:** Same-origin SPA behind one nginx, so cookies just work; sessions are revocable instantly and auditable (ip, user agent); no token kept in JS-readable storage.
- **Rejected:** JWT in localStorage (XSS-readable, no real logout); stateless JWT cookies (revocation needs a denylist anyway).

## 010 · 2026-10-21 · No third-party runtime requests from the browser
- **Decision:** Fonts and assets are bundled and served by our nginx; Google Fonts goes away in phase 1.5.
- **Why:** Privacy for the client's users, works under a strict CSP (`default-src 'self'; font-src 'self'`), and the app doesn't depend on another service being up.
- **Rejected:** Google Fonts CDN (third-party request on every load, needs CSP exceptions).

## 011 · 2026-10-21 · ESLint + Prettier, TypeScript pinned to 6.0
- **Decision:** ESLint flat config with typescript-eslint, react-hooks and react-refresh; Prettier for formatting (`singleQuote`, `printWidth: 100`). TypeScript downgraded from 7.0 to `~6.0`.
- **Why:** typescript-eslint needs TypeScript's JS compiler API, which TS 7 (native port) doesn't ship; its peer range is `<6.1`. ESLint is the standard setup and the backend will share it. TS 7's speed doesn't matter at this size. Width 100 matches the existing code (long Tailwind class lines) and minimizes churn.
- **Rejected:** oxlint (no TS dependency, but less common and fewer plugins); Biome (replaces Prettier too, least standard). Revisit TS 7 when typescript-eslint supports it.
