# Status

## Phase and goal
- Phase 1 (static frontend) — done, tagged `v0.1.0-frontend-static`.
- Next: Phase 1.5 — housekeeping (self-hosted fonts, lint/format, cleanup), then Phase 2a — backend + PostgreSQL in Docker (dev). Full plan: [QUESTLOG_ROADMAP.md](QUESTLOG_ROADMAP.md) §6.

## Done last session
- Added `docs/QUESTLOG_ROADMAP.md` (long-term plan).
- HANDOFF §1b/§2/§3 updated to the final architecture and schema; ADRs 007–010.
- `CLAUDE.md` working rules updated (phase gating, stop-and-ask list, commit authorship).

## Next 3 steps
1. Phase 1.5: self-host fonts, add lint + format tooling, delete root `package-lock.json` stub.
2. Phase 2a: scaffold `backend/` + `docker-compose.yml` / `docker-compose.dev.yml` (`db`, `api`).
3. Phase 2a: migrations for HANDOFF §3, seed from `frontend/src/mocks/`, read endpoints + SQL stats.

## Open questions (need your decision)
- Linter: `typescript-eslint` supports TypeScript `<6.1`, the frontend uses TS 7. Pin TS 6.0, or lint with a TS-independent tool (oxlint / Biome)?
- Logged-in demo user and game name (Gonzalo / CEO, `[JUEGO SUPREMO]`, ADR 004): confirm real names with the client before production.
- Hosting: AWS EC2 vs another VPS; who pays for server and domain.
- Offsite backup target: S3 vs Backblaze B2.
- Domain name.
- Sanitized public copy of the repo later? (needs client approval)

## Known issues / tech debt
- Fonts load from Google Fonts — violates the no-third-party-runtime rule (ADR 010).
- `frontend/src/api/types.ts` and mocks predate the final schema (e.g. `due_at`, `planned_for`).
- `QuestlogApi` is read-only: comment composer, drag-drop, edits are inert.
- Several stats are hard-coded in `mocks/dashboard.ts`, not derived from tasks.
- No linter, no tests; `npm run typecheck` is the only check.
- Root `package-lock.json` is an empty stub (no root `package.json`).

## Last updated
- 2026-10-21 · `092e7da`
