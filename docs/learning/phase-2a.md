# Phase 2a — Backend foundation + PostgreSQL in Docker

What this phase built: an Express API and a PostgreSQL database, running as two containers
on a private Docker network, with the schema in versioned migrations and the dev data seeded
from the same files the frontend mocks use.

## 1. Concepts

**Image vs container.** An image is a read-only template (filesystem + default command);
a container is a running instance of it with its own writable layer. `postgres:16-alpine` is
an image; `questlog-db-1` is a container. Deleting a container throws away its writable layer,
which is why the database files live in a volume. In the repo: `backend/Dockerfile` builds the
`questlog-api` image; `docker-compose.yml` turns images into containers.

**Layers and build cache.** Each Dockerfile instruction creates a layer, and Docker reuses
cached layers until something they depend on changes. The Dockerfile copies `package*.json`
and runs `npm ci` *before* the source exists in the image, so editing code never reinstalls
dependencies. Reverse those steps and every change costs a full `npm ci`.

**Volumes: named, anonymous and bind mounts.**
- *Named* (`pgdata`): managed by Docker and survives `down`. Only `down -v` deletes it.
- *Bind mount* (`./backend:/app/backend`): a host folder appears inside the container, so
  code edits show up live. Files keep their host owner (uid), hence the `EACCES` note in the runbook.
- *Anonymous* (`/app/backend/node_modules`): shields the image's `node_modules` from the bind
  mount above it, which would otherwise hide it.

**Networks and service discovery.** Compose puts both services on a user-defined bridge network
(`questlog_backend`). Docker runs an internal DNS there, so the API reaches Postgres at host
`db`, port 5432. That's `DATABASE_URL=…@db:5432/…` in `docker-compose.yml`. Nothing outside the
network can connect unless a port is *published*.

**Port publishing: 127.0.0.1 vs 0.0.0.0.** `ports: ['5432:5432']` binds the host port on
*every* interface (0.0.0.0), so anyone on your LAN, or the internet on a VPS, can try to log
in to Postgres. `'127.0.0.1:5432:5432'` binds only loopback: reachable from your machine,
refused from anywhere else. Docker writes its own iptables rules for published ports and can
bypass ufw, so the bind address is the control that actually holds. In production (phase 4)
`db` and `api` publish nothing at all.

**Healthchecks and startup order.** `depends_on` alone waits for the container to *start*,
not for Postgres to accept connections. `condition: service_healthy` waits for the `pg_isready`
healthcheck. The API's own healthcheck calls `/api/health`, which returns 200 only if a query
succeeds. Monitoring and deploys will reuse that same signal.

**Migrations.** The schema is code: `backend/migrations/*.sql`, applied in order by
node-pg-migrate and recorded in `pgmigrations`. Any empty database (dev, test, a restore target
in phase 6, production) reaches the exact same schema with one command. The test suite drops
and rebuilds `questlog_test` from the migrations on every run.

**Signals and PID 1.** `docker compose stop` sends SIGTERM and waits 10 s before SIGKILL.
PID 1 in a container gets no default signal handlers, and `npm` doesn't reliably pass signals
to its child. So the image runs `tsx` directly, `init: true` adds a tiny init process, and
`server.ts` handles SIGTERM by finishing open requests and closing the DB pool.

## 2. Commands I ran (and why)

Run on the cloud dev machine to build and verify this phase. You can reproduce all of them.

| Command | What it does / why |
|---|---|
| `docker compose config` | Merges the compose files, substitutes `.env`, prints the result. Checks syntax and shows what Docker will really run, without starting anything. |
| `docker compose up -d --build` | Builds the API image (dev stage), creates the network and volume, starts `db`, waits until it's healthy, then starts `api`. `-d` = detached. |
| `docker compose ps` | Lists the services with state, health and published ports. Confirmed both were `healthy` and bound to `127.0.0.1`. |
| `docker compose exec api npm run migrate -- up` | Runs a command inside the running `api` container. Applied the schema migration. |
| `docker compose exec api npm run seed` | Loaded the 64-task dev dataset. |
| `docker compose exec api npx vitest run` | Ran the 47 API tests inside the container against `questlog_test`. |
| `docker compose exec db psql -U questlog -d questlog -c '\l'` | Listed databases. Confirmed the init script created `questlog_test`. |
| `docker compose restart db` | Restarted only Postgres. Data was still there afterwards. |
| `docker compose down` then `up -d` | Removed containers and network, then recreated them. Data survived (the `pgdata` volume stayed). |
| `docker compose down -v` then `up -d` | Also deleted the volume. The database came back empty (0 tables). |
| `bash -c '</dev/tcp/<ip>/5432'` | Opens a raw TCP connection. Port 5432 was open on `127.0.0.1` and refused on the machine's network IP. |

Two problems were specific to the cloud sandbox, and you won't see them at home:
- Docker Hub answered `429 Too Many Requests` (shared IP). I pulled the official images from
  Google's mirror (`mirror.gcr.io/library/…`) and tagged them under their normal names.
- The sandbox intercepts HTTPS with its own certificate, so `npm ci` inside the build failed
  with `SELF_SIGNED_CERT_IN_CHAIN`. I built the image once with a scratch Dockerfile that trusted
  that certificate. The committed `backend/Dockerfile` is unchanged.

## 3. Hands-on exercises (do these yourself)

- [ ] Follow the runbook's first-time setup from a fresh clone, then open the app with `VITE_API_MODE=http`.
- [ ] `docker compose ps`: explain each column. Why is `db` healthy before `api` starts?
- [ ] `docker network inspect questlog_backend`: find both containers and their IPs. From
      inside the API container, `docker compose exec api ping -c1 db` (DNS by service name).
- [ ] Persistence: change a row in psql, then run `restart db`, then `down` + `up`. Is the change
      still there? Then `down -v` + `up`. Why is it gone now? (Re-run migrate + seed afterwards.)
- [ ] LAN exposure: from your phone or another computer on the same Wi-Fi, try
      `<your-pc-ip>:3000/api/health`. It must fail. Temporarily change the API port to
      `'3000:3000'`, `up -d`, and try again (it works: that's the exposure). Revert it.
- [ ] `sudo ss -ltnp | grep -E '5432|3000'`: see the `127.0.0.1` binding at the OS level.
- [ ] Stop Postgres (`docker compose stop db`) and call `curl -i localhost:3000/api/health`.
      What status do you get and why? Start it again and watch the API recover on its own.
- [ ] psql: write these three queries by hand:
      1. open tasks per area;
      2. tasks completed per week (`date_trunc`);
      3. the 3 high-priority tasks due soonest.
      Compare with `backend/src/routes/stats.ts`.
- [ ] Make a new migration that adds a column, apply it, roll it back with `migrate -- down`.
      Then delete the file.
- [ ] `time docker compose stop api`: it should take well under 10 s. Why? (Section 1, "Signals and PID 1".)

## 4. Interview questions (answer in your own words first)

1. **Why does the database use a named volume, and what's the difference between `docker compose down` and `down -v`?**
   Containers are disposable. The volume holds Postgres's data files outside the container's
   writable layer, so they survive recreation and upgrades. `down` removes containers and
   networks. `-v` also removes volumes, which deletes the data.
2. **What's wrong with `ports: "5432:5432"` on a server?**
   It binds 0.0.0.0, so Postgres is reachable from every network the host is on, and Docker's
   iptables rules can bypass the host firewall. Publish only what must be public (nginx 80/443)
   and bind dev ports to 127.0.0.1.
3. **`depends_on` vs a healthcheck: what problem does `condition: service_healthy` solve?**
   A started container isn't a ready service. Postgres needs seconds to initialize; without the
   healthcheck the API would start first and crash or retry on connection errors.
4. **How do two containers find each other?**
   On a user-defined network, Docker's embedded DNS resolves service names (`db`) to container
   IPs. Container IPs change on recreation; names don't.
5. **Why manage the schema with migrations instead of editing the database by hand?**
   Reproducibility and review. Every environment gets the same schema from git, changes are
   versioned and reversible, and a restore or a new server needs one command.
