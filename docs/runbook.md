# Runbook

How to run and operate Questlog. Commands run from the repo root unless noted.
Phase 2a covers the **development** stack; production (phase 4–5) gets its own sections later.

## First-time setup

1. Install Docker Engine + the Compose plugin (`docker compose version` must work).
   Adding your user to the `docker` group avoids `sudo`, but that group is root-equivalent:
   anyone in it can mount the host filesystem into a container.
2. Create the env files from the examples and set a password (letters and digits only):
   ```bash
   cp .env.example .env                 # read by Docker Compose
   cp backend/.env.example backend/.env # read by npm scripts run on your machine
   ```
   Use the same password in both. Both files are gitignored; never commit them.
3. Start the stack, create the schema, load the dev data:
   ```bash
   docker compose up -d --build
   docker compose exec api npm run migrate -- up
   docker compose exec api npm run seed
   ```
4. Frontend against the real API:
   ```bash
   cd frontend && npm install && VITE_API_MODE=http npm run dev   # http://localhost:5173
   ```

`COMPOSE_FILE` in `.env` makes plain `docker compose …` use
`docker-compose.yml` + `docker-compose.dev.yml`. Without it, pass both:
`docker compose -f docker-compose.yml -f docker-compose.dev.yml …`.

## Daily use

| Task | Command |
|---|---|
| Start (detached) | `docker compose up -d` |
| Status + health | `docker compose ps` |
| Follow API logs | `docker compose logs -f api` |
| Restart the API | `docker compose restart api` (code changes reload on their own) |
| Stop, keep containers | `docker compose stop` |
| Stop and remove containers (data kept) | `docker compose down` |
| Rebuild after `package.json` changes | `docker compose up -d --build -V` |

`-V` (`--renew-anon-volumes`) recreates the anonymous `node_modules` volume.
Without it, the container keeps the old dependencies even after a rebuild.

## Database

| Task | Command |
|---|---|
| psql shell | `docker compose exec db psql -U questlog -d questlog` |
| Apply migrations | `docker compose exec api npm run migrate -- up` |
| Roll back the last migration | `docker compose exec api npm run migrate -- down` |
| New migration file | `docker compose exec api npm run migrate -- create <name>` |
| Reload dev data (deletes all rows) | `docker compose exec api npm run seed` |

Useful psql commands: `\dt` (tables), `\d tasks` (columns, constraints, indexes), `\l` (databases), `\q` (quit).

Migrations are plain SQL in `backend/migrations/`, applied in filename order and recorded
in the `pgmigrations` table. Never edit a migration that has already run anywhere: add a new one.

## Tests and checks

```bash
cd backend && npm test        # API tests against questlog_test (rebuilt on every run)
cd backend && npm run lint && npm run typecheck && npm run format:check
cd frontend && npm run lint && npm run typecheck && npm run format:check
```

`npm test` on your machine uses `TEST_DATABASE_URL` from `backend/.env`, which points at the
dev Postgres published on `127.0.0.1:5432`. Inside the container: `docker compose exec api npm test`.

## Reset

| What you want | Command | What it deletes |
|---|---|---|
| Fresh containers, same data | `docker compose down && docker compose up -d` | containers, network |
| Empty database | `docker compose down -v && docker compose up -d`, then migrate + seed | **the `pgdata` volume: all data** |

`down` removes containers and the network, but named volumes survive, so your data is still there
on the next `up`. `down -v` also deletes volumes: the database is gone, and the init script runs
again on the next start, recreating `questlog_test`.

## Troubleshooting

- **`port is already allocated` on 5432 or 3000**: something else is listening (a local
  Postgres, another API). Find it with `sudo ss -ltnp | grep -E ':5432|:3000'`.
- **`api` stays `starting`/`unhealthy`**: `docker compose logs api`. Usually the database
  isn't migrated yet, or `.env` is missing a value (the API prints exactly which one).
- **`required variable … is missing a value`**: add it to the root `.env`.
- **`EACCES` writing inside `/app/backend` (e.g. `npm test` in the container)**: the
  container runs as uid 1000 (`node`) and the bind-mounted repo belongs to another uid.
  Check with `id -u`. Either run that command with `docker compose exec -u root api …`,
  or clone the repo as a user with uid 1000.
- **`429 Too Many Requests` pulling images**: Docker Hub's anonymous pull limit.
  Wait, or log in with `docker login`.
