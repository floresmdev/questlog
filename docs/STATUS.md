# Status

## Phase and goal
- Phase 2a (backend foundation + PostgreSQL in Docker) — implemented and verified in the cloud sandbox; 🛑 checkpoint: Alejandro runs the acceptance checks on his machine, then tag `v0.2.0-backend-read`.
- Next: Phase 2b — auth, roles, write endpoints. Plan: [QUESTLOG_ROADMAP.md](QUESTLOG_ROADMAP.md) §6.

## Done last session
- Frontend contract aligned with the final schema; activity is structured events rendered on the client.
- Mock dataset grown to 64 tasks; all stats derived (no hard-coded numbers).
- `backend/`: Express 5 + TS, SQL migration, seed from the mocks, all 19 `QuestlogApi` endpoints, 47 tests (incl. contract tests vs `mockApi`).
- `httpClient` + `VITE_API_MODE`; mock and http modes render pixel-identical.
- Docker Compose dev stack (`db`, `api`), runbook, `docs/learning/phase-2a.md`, ADRs 012–016.

## Next 3 steps
1. On your Linux PC: runbook first-time setup, the acceptance checks (roadmap 2a) and the hands-on list in `docs/learning/phase-2a.md`.
2. Tag `v0.2.0-backend-read` once they pass.
3. Phase 2b plan: argon2id + server-side sessions, roles, write endpoints with activity events in the same transaction.

## Open questions (need your decision)
- Logged-in demo user and game name (Gonzalo / CEO, `[JUEGO SUPREMO]`, ADR 004): confirm real names with the client before production.
- Hosting: AWS EC2 vs another VPS; who pays for server and domain.
- Offsite backup target: S3 vs Backblaze B2.
- Domain name.
- Sanitized public copy of the repo later? (needs client approval)

## Known issues / tech debt
- `QuestlogApi` is read-only: comment composer, drag-drop, edits are inert (phase 2b/3).
- `/api/me` returns `DEV_USER_EMAIL` until sessions exist (phase 2b).
- `APP_NOW` is frozen to the seed date in dev/test (phase 3 switches to the real clock).
- The api container runs as uid 1000; bind-mounted repos owned by another uid can't be written from inside (runbook → Troubleshooting).
- How production runs the backend (tsx vs compiled bundle) is open until phase 4 (ADR 016).
- `dist/` ships unused cyrillic/greek/vietnamese font subsets (never downloaded thanks to `unicode-range`).

## Last updated
- 2026-10-22 · `00b70c1`
