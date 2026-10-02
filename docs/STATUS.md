# Status

## Phase and goal
- Phase 1 (static frontend) — done, tagged `v0.1.0-frontend-static`.
- Next: Phase 2 — backend (Node/Express + PostgreSQL in Docker Compose) serving the endpoints in `frontend/src/api/client.ts`.

## Done last session
- Overview and Tareas screens built from `docs/design/` refs, all data via `mockApi`.
- Typed `QuestlogApi` interface with one method per future `/api/*` endpoint.
- Tailwind tokens + `lib/styles.ts` maps from HANDOFF §2.
- Tagged `v0.1.0-frontend-static`.

## Next 3 steps
1. Resolve the open data-model questions below; update HANDOFF §3.
2. Scaffold `backend/` (Express + `pg`) and `docker-compose.yml` + `docker-compose.dev.yml` with `db` (postgres:16, volume `pgdata`) and `api`.
3. First SQL migration for the §3 schema + seed from `frontend/src/mocks/`; implement `GET /api/me`, `/api/areas`, `/api/builds`.

## Open questions (need your decision)
- `users.job_title`: sidebar/comments show "CEO", "Producer"… — add the column? (`api/types.ts` `User.jobTitle`)
- `tasks.due_time`: Overview agenda shows times of day; schema only has `due_date`. Add a time column or drop times? (`AgendaItem`)
- Builds in preparation: UI shows builds with no CI number and a planned date. Make `build_number` nullable and add `planned_at` (vs overloading `released_at`)? (`Build`)
- Activity text: copy differs per screen. Render from `action` + `payload` on the server or the client? (`ActivityItem`)

## Known issues / tech debt
- HANDOFF §3 references `profiles` (assignee_id, author_id); the table is `users`.
- `QuestlogApi` is read-only: no mutations; comment composer, drag-drop, edits are inert.
- Several stats are hard-coded in `mocks/dashboard.ts`, not derived from tasks.
- No linter, no tests; `npm run typecheck` is the only check.
- Root `package-lock.json` is an empty stub (no root `package.json`); empty untracked `questlog-handoff/` dir.
- Fonts load from Google Fonts (external dependency for a self-hosted app).

## Last updated
- 2026-10-01 · `e7f0126`
