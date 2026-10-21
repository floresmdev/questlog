# Status

## Phase and goal
- Phase 1.5 (housekeeping) — implemented, waiting for review (🛑 checkpoint before push).
- Next: Phase 2a — backend + PostgreSQL in Docker (dev). Plan: [QUESTLOG_ROADMAP.md](QUESTLOG_ROADMAP.md) §6.

## Done last session
- Roadmap added, with a design-rationale section (§11); context docs synced (HANDOFF §3, ADRs 007–010).
- Fonts self-hosted via `@fontsource-variable/*`; no third-party requests (verified, pixel-identical render).
- ESLint + Prettier added, TypeScript pinned to ~6.0 (ADR 011); codebase formatted.
- `useApi` fixed: loading derived from deps instead of `setState` in the effect.
- Removed empty root `package-lock.json`.

## Next 3 steps
1. Review and push phase 1.5; delete the local empty `questlog-handoff/` folder on your machine.
2. Phase 2a plan: `backend/` scaffold, `docker-compose.yml` + `docker-compose.dev.yml` (`db`, `api`). Prereq: Docker Engine + Compose plugin installed by you.
3. Phase 2a: migrations for HANDOFF §3, seed from `frontend/src/mocks/`, read endpoints + SQL stats.

## Open questions (need your decision)
- Logged-in demo user and game name (Gonzalo / CEO, `[JUEGO SUPREMO]`, ADR 004): confirm real names with the client before production.
- Hosting: AWS EC2 vs another VPS; who pays for server and domain.
- Offsite backup target: S3 vs Backblaze B2.
- Domain name.
- Sanitized public copy of the repo later? (needs client approval)

## Known issues / tech debt
- `frontend/src/api/types.ts` and mocks predate the final schema (e.g. `due_at`, `planned_for`).
- `QuestlogApi` is read-only: comment composer, drag-drop, edits are inert.
- Several stats are hard-coded in `mocks/dashboard.ts`, not derived from tasks.
- No tests yet; lint + typecheck + format:check are the checks.
- `dist/` ships unused cyrillic/greek/vietnamese font subsets (never downloaded thanks to `unicode-range`; fontsource variable packages have no per-subset entry).

## Last updated
- 2026-10-21 · `0091441`
