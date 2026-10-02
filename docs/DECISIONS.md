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
