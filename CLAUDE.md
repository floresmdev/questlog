@docs/STATUS.md

# Questlog

## Project
- Task manager for a game dev studio (freelance client).
- Also my SysAdmin portfolio project: infra and ops decisions matter as much as the code.

## Architecture
- Self-hosted 3-tier via Docker Compose: nginx (static build + `/api` reverse proxy) → Node/Express → PostgreSQL 16.
- Never Supabase, BaaS, serverless or a managed DB.
- `db` is never exposed publicly; in prod only nginx publishes ports (80/443).
- No third-party runtime requests from the browser: fonts and assets are self-hosted.
- Target layout and network diagram: [docs/HANDOFF.md §1b](docs/HANDOFF.md).

## Repo map
- `frontend/` — Vite + React + TS + Tailwind SPA. Details: [frontend/CLAUDE.md](frontend/CLAUDE.md).
  - `frontend/src/api/` — the only data access layer; start here for anything data-related.
  - `frontend/src/pages/` — route entry points (`/overview`, `/tasks`).
  - `frontend/src/mocks/` — the dev dataset: behind the mock client and loaded by the backend seed.
- `backend/` — Express 5 + TS API, SQL migrations, seed, tests. Details: [backend/CLAUDE.md](backend/CLAUDE.md).
- `infra/` — infra config (`postgres/initdb/`); nginx and scripts come in later phases.
- `docker-compose.yml` (shared base) + `docker-compose.dev.yml` (dev overrides).
- `docs/` — handoff, status, decisions.
  - `docs/HANDOFF.md` — design tokens, data model, screens, interactions.
  - `docs/design/` — approved screen references (`*.reference.html`, `*@2x.png`).
  - `docs/QUESTLOG_ROADMAP.md` — long-term phase plan, acceptance criteria, checkpoints. Read only the current phase's section.
  - `docs/STATUS.md` — current state (volatile). `docs/DECISIONS.md` — ADR log.
  - `docs/runbook.md` — how to run, migrate, seed, reset, troubleshoot.
  - `docs/learning/phase-*.md` — per-phase learning notes (roadmap §8).
- `.claude/commands/` — project slash commands (`/session-end`).
- Not yet created: `docker-compose.prod.yml`, nginx config, Dockerfile prod stages (phase 4).

## Commands
Full operations guide: [docs/runbook.md](docs/runbook.md).

Stack (repo root; `.env` from `.env.example`):
- `docker compose up -d --build` — db + api (dev). `docker compose ps` — health.
- `docker compose exec api npm run migrate -- up` / `npm run seed` — schema / dev data.

`frontend/` (Node 20.19+):
- `npm run dev` — http://localhost:5173 with mocks; `VITE_API_MODE=http npm run dev` — against the API.
- `npm run build` — `tsc -b` + `vite build` → `frontend/dist/`. `npm run preview` — serve it.

`backend/` (Node 22.9+; `backend/.env` from `.env.example`):
- `npm test` — Vitest + Supertest against `TEST_DATABASE_URL` (migrated and seeded each run).
- `npm run dev` — API on :3000 outside Docker.

Both packages (TypeScript pinned to ~6.0, ADR 011):
- Before committing: `npm run lint && npm run typecheck && npm run format:check` (backend: also `npm test`).

## Conventions
- TypeScript strict (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`).
- One component per file.
- Frontend data access only through `frontend/src/api`.
- UI copy in Spanish; code, comments and commits in English.
- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:` …).
- Commits are authored as the repo owner (`floresmdev <alefmontes@outlook.com>`); no AI co-author or session trailers.
- Small, reviewable commits: never mix tooling, refactors and features in one commit.

## Sources of truth
- [docs/HANDOFF.md](docs/HANDOFF.md) — design and data model (§3 is the final schema). Read only the section you need.
- [docs/QUESTLOG_ROADMAP.md](docs/QUESTLOG_ROADMAP.md) — what each phase delivers and its definition of done.
- [docs/DECISIONS.md](docs/DECISIONS.md) — why past choices were made. Check before reopening one.

## Working agreement
- Plan before any multi-file change; wait for my OK.
- Ask before adding dependencies.
- Never commit secrets (`.env*` is gitignored; keep it that way). Commit `.env.example` only.
- One phase at a time; stop at every 🛑 checkpoint in the roadmap.
- Always stop and ask before: a dependency not listed in the roadmap; a schema change beyond HANDOFF §3; `git push`, force ops, history rewrites, deleting branches/tags; anything touching real servers, DNS, cloud accounts, paid resources or real secrets; any choice the roadmap doesn't settle.
- When blocked: add the question to `STATUS.md` → Open questions, stop, summarize.
- Docker / infra / ops work: explain what each command does and why (I'm learning SysAdmin), and let me run it unless I say otherwise. Infra phases follow the learning protocol in roadmap §8.

## Do not read unless the task needs it
- `node_modules/`, `dist/`, `package-lock.json` (any), `docs/design/*.html`.

## Session end
- Run `/session-end`.
