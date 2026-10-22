# backend/

Express 5 + TypeScript (run by `tsx`) + PostgreSQL via `pg`, no ORM. Root rules: [../CLAUDE.md](../CLAUDE.md). Operations: [../docs/runbook.md](../docs/runbook.md).

## Map

- `src/config.ts` — env validated with zod at import; fails fast with every problem listed. Add new settings here and in both `.env.example` files.
- `src/db.ts` — the pool (session `TimeZone` = `APP_TIMEZONE`) and `query()`. Always `$1` parameters, never string-built values.
- `src/db/json.ts` — SQL fragments building the API JSON shapes (`userJson`, `taskListJson`, `LANE_SQL`…).
- `src/routes/*.ts` — one router per resource, registered in `src/app.ts`. Paths mirror the comments in `frontend/src/api/client.ts`.
- `src/time.ts` — `now()`: pass it as a query parameter instead of using SQL `now()`, so `APP_NOW` works.
- `src/db/seed*.ts` — loads `frontend/src/mocks/` with deterministic UUIDs (`seedUuid('t-142')`).
- `migrations/*.sql` — node-pg-migrate, `-- Up Migration` / `-- Down Migration`. Never edit one that ran; add a new file.
- `test/` — Vitest + Supertest. `support/global-setup.ts` rebuilds `questlog_test` from the migrations and seeds it.

## Rules

- Response types come from `frontend/src/api/types.ts` (`import type`). A contract change = types + `client.ts` + `mockClient.ts` + `httpClient.ts` + route.
- Every endpoint gets a contract test: `normalize(res.body)` must equal `normalize(await mockApi.x())` (`test/support/contract.ts`).
- Validate query params with the zod helpers in `src/validate.ts`; a ZodError becomes a 400.
- Day/week logic relies on the session timezone (`::date`, `date_trunc('week', …)`). Keep the mock client's rules in sync (ADR 013).
