@docs/STATUS.md

# Questlog

## Project
- Task manager for a game dev studio (freelance client).
- Also my SysAdmin portfolio project: infra and ops decisions matter as much as the code.

## Architecture
- Self-hosted 3-tier via Docker Compose: nginx (static build + `/api` reverse proxy) → Node/Express → PostgreSQL 16.
- Never Supabase, BaaS or serverless.
- Target layout and network diagram: [docs/HANDOFF.md §1b](docs/HANDOFF.md).

## Repo map
- `frontend/` — Vite + React + TS + Tailwind SPA. Details: [frontend/CLAUDE.md](frontend/CLAUDE.md).
  - `frontend/src/api/` — the only data access layer; start here for anything data-related.
  - `frontend/src/pages/` — route entry points (`/overview`, `/tasks`).
  - `frontend/src/mocks/` — typed sample data behind the mock client.
- `docs/` — handoff, status, decisions.
  - `docs/HANDOFF.md` — design tokens, data model, screens, interactions.
  - `docs/design/` — approved screen references (`*.reference.html`, `*@2x.png`).
  - `docs/STATUS.md` — current state (volatile). `docs/DECISIONS.md` — ADR log.
- `.claude/commands/` — project slash commands (`/session-end`).
- Not yet created (phase 2+): `backend/`, `infra/`, `docker-compose*.yml`.

## Commands
Run in `frontend/` (Node 20.19+):
- `npm install`
- `npm run dev` — http://localhost:5173, proxies `/api` → `localhost:3000`
- `npm run build` — `tsc -b` + `vite build` → `frontend/dist/`
- `npm run typecheck` — no linter configured yet; this is the only check
- `npm run preview` — serve the built `dist/`

## Conventions
- TypeScript strict (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`).
- One component per file.
- Frontend data access only through `frontend/src/api`.
- UI copy in Spanish; code, comments and commits in English.
- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:` …).

## Sources of truth
- [docs/HANDOFF.md](docs/HANDOFF.md) — design and data model. Read only the section you need.
- [docs/DECISIONS.md](docs/DECISIONS.md) — why past choices were made. Check before reopening one.

## Working agreement
- Plan before any multi-file change; wait for my OK.
- Ask before adding dependencies.
- Never commit secrets (`.env*` is gitignored; keep it that way).
- Docker / infra / ops work: explain what each command does and why (I'm learning SysAdmin), and let me run it unless I say otherwise.

## Do not read unless the task needs it
- `node_modules/`, `dist/`, `package-lock.json` (any), `docs/design/*.html`.

## Session end
- Run `/session-end`.
