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

## 012 · 2026-10-22 · One dev dataset for mocks and seed, enforced by contract tests
- **Decision:** `frontend/src/mocks/` is the single dev dataset: 64 tasks with the design cards first, real comment rows, five builds. The backend seed loads those files directly, mapping mock ids to deterministic UUIDs. `mockApi` computes every stat from the rows with the same rules as the SQL, and backend contract tests compare each endpoint with `mockApi` on the same data.
- **Why:** "Mock mode and http mode look identical" becomes a test instead of a hope. Hard-coded stats couldn't agree with the data, and the design's own numbers contradicted each other. One dataset means one place to edit.
- **Rejected:** Keeping 14 cards and accepting shrunken stats; a separate SQL seed file (two copies that drift); generating random data (non-reproducible screenshots and tests).

## 013 · 2026-10-22 · Time rules: frozen now, studio timezone, rolling weeks
- **Decision:** `APP_NOW` freezes "now" (Mon 2026-09-28 16:20 Mexico City) in dev/test, and is unset in production. Days and weeks are counted in `APP_TIMEZONE` (the Postgres session timezone, see `db.ts`). Weekly charts use Monday-start weeks and exclude the current week. "This week" counters are rolling: the last 7 days for things that happened, today through 7 days ahead for things that are due. Timestamps are `timestamptz`; `DATE` columns stay `YYYY-MM-DD` strings in Node.
- **Why:** Stats must match the fixed seed data and be testable. A studio in Mexico City shouldn't see "today" flip at 18:00 because the server runs in UTC. Rolling windows avoid a "this week" that resets every Monday morning. Parsing `DATE` into JS `Date` silently shifts days.
- **Rejected:** Calendar-week counters (on a Monday they'd mostly show 0); server-local time; shifting seed dates relative to the real clock.

## 014 · 2026-10-22 · UUID keys and schema details
- **Decision:** Primary keys are `uuid DEFAULT gen_random_uuid()`. Tasks also get a human code `QL-###` from a sequence. `color_key` and `avatar_color` are `text` with `CHECK` lists. `users.password_hash` is `NOT NULL DEFAULT '!'`, a locked account like in `/etc/shadow`, until phase 2b sets real argon2id hashes. `activity_log.task_id` is `ON DELETE SET NULL` and comments `ON DELETE CASCADE`.
- **Why:** UUIDs can't be enumerated by counting and fit the frontend's `Id = string`; people use `QL-###` anyway. The CHECKs keep invalid UI tokens out of the database. A locked marker avoids a nullable credential column. History outlives deleted tasks; comments don't.
- **Rejected:** `bigint` identity keys (guessable, leaks counts); Postgres enums for colors (adding one needs `ALTER TYPE`); nullable `password_hash`.

## 015 · 2026-10-22 · Dev Docker stack layout
- **Decision:** `docker-compose.yml` holds what every environment shares: services, network, volume, healthchecks, restart policy, no published ports. `docker-compose.dev.yml` adds hot reload (bind-mounted source plus an anonymous `node_modules` volume), ports on `127.0.0.1` only, and an init script that creates `questlog_test`. `COMPOSE_FILE` in `.env` selects the pair. `backend/Dockerfile` has a `dev` stage running `tsx watch` as the `node` user, with `init: true`. Migrations and seed are explicit `docker compose exec` commands, never run on container start.
- **Why:** Prod (phase 4) only adds its own override, so nothing is duplicated. Localhost binding keeps the DB off the LAN. A restart must never change the schema by surprise.
- **Rejected:** One compose file with profiles (dev and prod settings tangled together); running Postgres on the host; auto-migrating in the container entrypoint.

## 016 · 2026-10-22 · Backend runs TypeScript via tsx and shares the frontend's types
- **Decision:** The backend imports response types (`import type`) and seed data from `frontend/src/`, uses `moduleResolution: "bundler"`, and runs `.ts` directly with `tsx`. Responses are shaped as JSON in SQL (`json_build_object` fragments in `db/json.ts`), typed with the shared interfaces. How production runs the code (tsx or a compiled bundle) is decided in phase 4.
- **Why:** One contract, no duplicated interfaces. `bundler` resolution accepts the frontend's extensionless imports. SQL-built JSON avoids a mapping layer for every endpoint.
- **Rejected:** A shared workspace package now (tooling for one file); `NodeNext` resolution (would require `.js` extensions across the frontend); an ORM to map rows.
