# Questlog — Master Roadmap & Context

> **For the coding agent.** Save this file as `docs/ROADMAP.md` and add one line to the root `CLAUDE.md` repo map pointing to it. It is the long-term plan. `docs/STATUS.md` is still the short-term state, and `docs/DECISIONS.md` is still the decision log. Do not copy this file's content into them; link to it.
>
> Read this file once, completely, at the start of background work. After that, read only the section of the phase you are working on.

---

## 1. Project context

**What:** Questlog is a web-based Kanban task manager for a small game development studio. It is a real freelance client with real users, so availability and data safety matter.

**Client requirements (original, in Spanish, summarized):**
- Each task has an **assignee and area**, a **description**, a **status** (pending / in progress / done), a **priority**, **comments**, the **version/build where it was integrated**, and **dates**.
- **Done tasks must be split into two groups:** *active in the game* and *modified or removed*.
- It must be accessible from any browser.

**Approved design:** two screens, **Tareas** (Kanban + detail panel) and **Overview** (dashboard). The design specs are in `docs/HANDOFF.md`, with references in `docs/design/` (HTML + PNG). The UI copy is in Spanish.

---

## 2. Owner profile & goals

**Owner:** Alejandro ("Jefe"). He is a recent Mechatronics Engineering graduate who works on a manufacturing engineering team. He programmed mainly in C++ (microcontrollers and Arduino) during university, and he has a cybersecurity background (security consulting, a SOC detection lab project, Hack The Box). He is studying toward **CCNA** and **AWS Cloud Practitioner**. His target is a tech role at a large company, with a focus on **Linux, networking, Python, cloud, AI and, later, cybersecurity**. He is moving toward **SysAdmin / infrastructure / DevOps (DevSecOps)**.

**This project has two goals, and both are equally important:**

| Goal | What "done" means |
|---|---|
| **Delivery** | The client's team uses Questlog daily in production, on a server he operates. |
| **Learning / CV** | He can explain and reproduce every infra decision: containers, networking, reverse proxy, TLS, backups, disaster recovery, CI/CD, monitoring and hardening. |

**Learning map.** When a phase touches one of these topics, make that learning explicit:

| Skill area | Where the project exercises it |
|---|---|
| Linux administration | VPS setup, users, SSH, systemd, cron/timers, logs, permissions, package updates |
| Networking (CCNA) | Docker networks, ports and bindings, DNS records, firewall rules (ufw + cloud security groups), TLS, reverse proxy |
| Cloud (AWS CCP) | EC2, security groups, Elastic IP, S3 for offsite backups, IAM least-privilege user for backups |
| Bash + Python | Bash for backup/restore/deploy scripts; Python for at least one ops tool (e.g. a backup verification / health report script) |
| Security | Hardening, CSP and security headers, secrets handling, auth design, image scanning, Wazuh agent → his SOC lab, fail2ban |
| Databases | PostgreSQL schema design, migrations, indexes, SQL aggregates, pg_dump/pg_restore |
| Web development | React + TS frontend, Node/Express API, REST design, tests |

---

## 3. Architecture & non-negotiables

```
Internet :443 → [nginx: static Vite build + TLS + reverse proxy /api]
                        │ internal Docker network
                        ▼
                 [api: Node.js + Express 5 + TypeScript]
                        │
                        ▼
                 [db: PostgreSQL 16 + named volume pgdata]  ← never exposed publicly
```

**Non-negotiables:**
1. **Fully self-hosted 3-tier.** No Supabase, no BaaS, no serverless, no managed DB.
2. **Monorepo:** `frontend/`, `backend/`, `infra/`, `docs/`, compose files at the root.
3. **Frontend data access only through `frontend/src/api/`** (the `QuestlogApi` interface with mock and http clients).
4. **No third-party runtime dependencies in the browser.** Fonts and assets are self-hosted.
5. **Secrets never in git.** Commit `.env.example` only.
6. The repo stays **private** (the client's data and name are in it). A sanitized public copy for the portfolio may come later, but only with the client's approval.
7. UI copy in Spanish. Code, comments, commits and docs in English. Use conventional commits.
8. **Honest claims only.** Never describe this as "high availability" (a single VPS is not HA). Use: *production deployment with monitoring, automatic restarts, offsite backups and tested restore.*

---

## 4. Current state (as of this document)

### Done
- **Phase 1, static frontend:** Vite + React + TS + Tailwind + React Router. Both screens are built to match the design using mock data behind `QuestlogApi`. `APP_NOW` (28 Sep 2026, 16:20) is in `src/lib/now.ts`. Tagged `v0.1.0-frontend-static` (verify that it exists).
- **Agent context files** (commit `092e7da`): `CLAUDE.md`, `frontend/CLAUDE.md`, `docs/STATUS.md`, `docs/DECISIONS.md` (001–006), `.claude/commands/session-end.md`.

### Not done yet (known issues)
- Fonts are loaded from **Google Fonts**, which violates non-negotiable #4.
- **No linter or formatter.** Only `typecheck` exists.
- `docs/HANDOFF.md` §3 still references a `profiles` table in `assignee_id` / `author_id`. It must be `users`. §3 also still says `due_date`.
- An empty `package-lock.json` at the root, and an empty `questlog-handoff/` folder.
- Stats are hard-coded in the mocks instead of being computed.
- `QuestlogApi` is read-only: comments, drag and drop and editing don't work yet.
- The local commit `092e7da` may not be pushed yet. Check `git status` / `git log origin/main..` and, if needed, **ask before pushing**.

---

## 5. Final data model (supersedes HANDOFF §3 where they differ)

```
areas        (id, name, color_key)
users        (id, email unique, password_hash, full_name, job_title null,
              role enum('admin','member'), initials, avatar_color,
              is_active bool default true, created_at)
builds       (id, version text, build_number int null, planned_for date null,
              released_at timestamptz null, notes text)
              -- build in preparation: build_number null, released_at null
tasks        (id, code text unique 'QL-###', title, description,
              area_id → areas, assignee_id → users null,
              status enum('pending','in_progress','done'),
              done_state enum('active','modified','removed') null,
              change_note text null,
              priority enum('high','medium','low'),
              start_date date null, due_at timestamptz null,
              completed_at timestamptz null,
              target_build_id → builds null, integrated_build_id → builds null,
              position int, created_by → users, created_at, updated_at)
              CHECK: (status = 'done') = (done_state IS NOT NULL)
comments     (id, task_id → tasks ON DELETE CASCADE, author_id → users, body, created_at)
activity_log (id, task_id → tasks null, actor_id → users, action text,
              payload jsonb, created_at)
              -- structured events only; the frontend renders the Spanish sentence
sessions     (id, user_id → users, created_at, expires_at, ip, user_agent)   -- phase 2b
```

Indexes: `tasks(status, done_state)`, `tasks(assignee_id)`, `tasks(area_id)`, `tasks(due_at)`, `comments(task_id)`, `activity_log(created_at DESC)`.

Kanban lanes are derived: Pending = `pending`; In progress = `in_progress`; Active in game = `done` + `active`; Modified/Removed = `done` + (`modified` | `removed`).

---

## 6. Phase plan

Each phase lists the **tasks**, the **acceptance criteria** (definition of done), what Alejandro learns, and a **🛑 checkpoint**: at a checkpoint, stop and wait for Alejandro. Finish each phase with `/session-end` and a git tag where indicated.

### Phase 1.5: Housekeeping

**Tasks**
1. **Self-host fonts:** install `@fontsource-variable/plus-jakarta-sans` and `@fontsource-variable/jetbrains-mono`, import them in `main.tsx` (latin + latin-ext subsets only if supported), remove the Google Fonts `<link>`/preconnect tags from `index.html`, and update the Tailwind font families.
2. **Lint and format:** ESLint flat config (typescript-eslint, react-hooks, react-refresh) + Prettier. Add `lint`, `format` and `typecheck` scripts. Set up the tooling in one commit and fix the issues it finds in a separate commit.
3. **Fix `docs/HANDOFF.md` §3** so it matches section 5 of this document.
4. **Delete** the empty root `package-lock.json` and the empty `questlog-handoff/` folder.
5. Add this file as `docs/ROADMAP.md` and link it from `CLAUDE.md`.
6. Update `CLAUDE.md` commands, `STATUS.md` tech debt, and `DECISIONS.md` (self-hosted fonts: privacy, a strict CSP `font-src 'self'` later, no third-party runtime dependency).

**Acceptance criteria**
- `npm run lint && npm run typecheck && npm run build` pass.
- `grep -r "fonts.googleapis\|fonts.gstatic" frontend/dist frontend/index.html` returns nothing, and `.woff2` files exist in `dist/assets/`.

**Learning:** why third-party requests matter (privacy, CSP, availability).

**🛑 Checkpoint:** show the summary and ask before pushing.

### Phase 2a: Backend foundation + PostgreSQL in Docker (dev)

**Prerequisite (Alejandro does this):** install Docker Engine + the Compose plugin on his Linux machine. Note for him: membership in the `docker` group is root-equivalent.

**Tasks**
1. `backend/`: Node LTS, Express 5, TypeScript strict (`tsx` for dev), `pg` with a small query helper (no ORM), `node-pg-migrate` with plain SQL migrations, `zod`, `pino`, `helmet`. Config comes from env vars validated at startup. Commit `.env.example`.
2. Migrations for the section 5 model (everything except `sessions`): enums, FKs, the CHECK constraint, indexes.
3. A seed script that reproduces the current mock data, so the UI looks identical.
4. Read-only REST endpoints that match `QuestlogApi`, one route file per resource. `GET /api/health` returns 200 only if the DB responds.
5. **Stats endpoints computed with SQL aggregates:** sprint progress, area progress, weekly completed, done-state breakdown, priority counts. Then remove the hard-coded stats from the mocks.
6. `docker-compose.yml` + `docker-compose.dev.yml`:
   - `db`: `postgres:16-alpine`, named volume `pgdata`, `pg_isready` healthcheck.
   - `api`: dev target, bind mount for hot reload, `depends_on: db: condition: service_healthy`, healthcheck on `/api/health`.
   - One user-defined network. Publish `db` only on `127.0.0.1:5432` and `api` only on `127.0.0.1:3000`. `restart: unless-stopped`.
   - Add a one-line **why** comment next to every non-obvious setting.
7. Frontend: `src/api/httpClient.ts`, selected with `VITE_API_MODE=mock|http` (default `mock`). Vite dev proxy `/api → http://localhost:3000`. Components do not change.
8. Tests: Vitest + Supertest for the API against a dedicated test database (a separate compose service or DB name).
9. `docs/runbook.md`: start/stop, migrate, seed, psql, logs, reset. Explain `down` vs `down -v`.

**Acceptance criteria**
- `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d` makes both services healthy.
- With `VITE_API_MODE=http`, the UI looks the same as with mocks.
- Data survives `docker compose restart db` and `down` + `up`, but not `down -v`.
- `db` is not reachable from another machine on the LAN.

**Learning:** images vs containers, networks, volumes, healthchecks, port binding to 127.0.0.1 vs 0.0.0.0, migrations.

**🛑 Checkpoint:** show the plan before implementing. At the end, ask Alejandro to run the acceptance checks himself (see section 8). Tag `v0.2.0-backend-read`.

### Phase 2b: Authentication, authorization and write endpoints

**Tasks**
1. Auth with **argon2id** password hashing. **Server-side sessions** in the `sessions` table, with a cookie that is `httpOnly`, `Secure` (in prod), `SameSite=Lax` and has a sensible expiry. Logout invalidates the session server-side.
2. Rate-limit `/api/auth/login`, and log failed logins in a format fail2ban/Wazuh can parse later.
3. Roles: `admin` manages users, areas and builds; `member` manages tasks and comments. Enforce this in middleware and test it.
4. Write endpoints: create/update/move tasks (status, done_state, position), comments, builds, areas, users (admin only). Validate with zod. **Every mutation writes an `activity_log` event in the same DB transaction.**
5. Business rules: moving a task to *done* requires `done_state`. `integrated_build_id` is required for `active`, and `change_note` is required for `modified`/`removed`.
6. Seed creates an initial admin from env vars (no hard-coded password).
7. Frontend login page and an auth guard on routes.

**Acceptance criteria:** tests cover auth, roles and the done-state rules. An unauthenticated request to any `/api` route except `/api/health` and `/api/auth/*` gets 401.

**Learning:** auth design, the session vs JWT trade-off, transactions, least privilege.

**🛑 Checkpoint:** before choosing session settings and before creating the first admin flow. Tag `v0.3.0-backend-write`.

### Phase 3: Make the frontend functional

**Tasks**
1. Kanban drag and drop with `@dnd-kit` (between lanes and reordering within a lane), with optimistic updates and rollback on error.
2. Dropping into a done lane opens a dialog: integrated build (for *active*) or change note (for *modified*/*removed*).
3. Detail panel: inline editing of every field, the comments thread, and a working composer.
4. New task form, filters (area / assignee / build), search.
5. Activity feed rendered from structured events (Spanish sentences built on the client).
6. Replace `APP_NOW` with the real current time, keeping it injectable for tests.
7. Basic responsive behavior (horizontal-scroll Kanban below 1280px is already planned).

**Acceptance criteria:** the full client workflow works end to end against the real API: create → assign → move → comment → mark done (active / modified / removed) → appears correctly on Overview.

**🛑 Checkpoint:** demo to Alejandro, who will show it to the client. Tag `v0.4.0-mvp`.

### Phase 4: Production containers

**Tasks**
1. Multi-stage `frontend/Dockerfile`: a node build stage, then an `nginx:alpine` runtime that serves `dist/`.
2. Multi-stage `backend/Dockerfile`: build → slim runtime, **non-root user**, production dependencies only.
3. `infra/nginx/`: serve static files with long cache on hashed assets and no cache on `index.html`, SPA fallback, `proxy_pass /api` to `api:3000`, gzip, and security headers: **CSP** (`default-src 'self'; font-src 'self'; ...`), HSTS (only once TLS is on), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
4. `docker-compose.prod.yml`: no bind mounts; `db` and `api` have no published ports; only nginx publishes 80/443. Healthchecks, `restart: unless-stopped`, memory limits, log rotation (`json-file` with `max-size`/`max-file`). Run migrations at deploy time, not at container start.
5. A local "prod-like" run with the prod compose file.

**Acceptance criteria:** the prod stack runs locally; securityheaders.com-style checks pass for the headers; containers don't run as root (`docker compose exec api id`).

**Learning:** image layers and size, multi-stage builds, nginx config, security headers.

**Tag:** `v0.5.0-prod-containers`.

### Phase 5: Server provisioning, hardening and TLS

> Alejandro creates the server and buys/points the domain. The agent writes the scripts and docs but **never creates paid resources.**

**Tasks (as scripts + documentation in `infra/` and `docs/runbook.md`)**
1. Server: **AWS EC2** is preferred (it aligns with AWS CCP: VPC, security groups, Elastic IP); a DigitalOcean/Hetzner VPS is the alternative. Aim for **2 GB RAM**. Ubuntu LTS.
2. Hardening checklist script: a non-root sudo user, SSH keys only, `PermitRootLogin no`, `PasswordAuthentication no`, ufw (22/80/443 only), plus a cloud security group that mirrors it, fail2ban, `unattended-upgrades`, timezone set explicitly, swap file.
3. Docker install, deploy directory layout, `.env` with `chmod 600`.
4. DNS A record → server IP. TLS with **certbot (Let's Encrypt)**, with automatic renewal verified (`certbot renew --dry-run`), and nginx reload after renewal.
5. Enable HSTS after TLS works.

**Acceptance criteria:** SSL Labs grade A; `nmap` from outside shows only 22/80/443; root SSH login and password login are both refused.

**Learning:** Linux admin, SSH, firewalls (host and cloud), DNS, PKI/TLS.

**🛑 Checkpoint:** every step that touches the real server is done by Alejandro, following the runbook. Tag `v1.0.0` when the client starts using it.

### Phase 6: Backups & disaster recovery

**Tasks**
1. `infra/scripts/backup.sh`: `pg_dump -Fc` through `docker compose exec`, compression, **encryption** (age or gpg), upload **offsite** (S3 with a least-privilege IAM user, or Backblaze B2), retention of 7 daily + 4 weekly, logs, non-zero exit on failure.
2. Schedule it with a **systemd timer** (preferred) or cron at **03:00 America/Mexico_City**. The server clock is usually UTC, so convert explicitly and document it.
3. `infra/scripts/restore.sh`: download → decrypt → restore into a fresh database.
4. A **Python** ops script, e.g. `backup_check.py`: verifies that the latest offsite backup exists, is recent and decrypts, and prints or alerts a report.
5. **Restore drill:** restore onto a clean machine or container, then measure and document **RTO** (time to recover) and **RPO** (max data loss).
6. Alerting when a backup fails (email, Telegram or Uptime Kuma push monitor).

**Acceptance criteria:** a documented, timed restore from offsite backup into an empty environment, and a failure alert tested by forcing a failure.

**Learning:** DR concepts, Bash scripting, Python scripting, S3/IAM, encryption, systemd timers.

### Phase 7: CI/CD

**Tasks**
1. GitHub Actions on PR/push: lint, typecheck and tests for frontend and backend (only the packages that changed).
2. On a tag or on main: build images, scan them with **Trivy**, push to **GHCR** with immutable tags (git SHA + semver).
3. Deploy job over SSH with a dedicated deploy key and user: pull the images by tag, run migrations, `docker compose up -d`, then a health check. Roll back to the previous tag automatically if the health check fails.
4. Secrets only in GitHub Actions secrets.
5. Document the manual rollback in the runbook.

**Acceptance criteria:** pushing a tag deploys to production with no manual steps; a deliberately broken build is blocked; rollback is tested.

### Phase 8: Observability & security monitoring

**Tasks**
1. **Uptime Kuma** (or an external uptime service) monitoring the public URL and `/api/health`, with alerts.
2. **Wazuh agent** on the server, reporting to the Wazuh manager in Alejandro's **SOC Detection Lab** (the manager does NOT run on the small VPS). Add custom rules for repeated failed logins to Questlog.
3. fail2ban jails for sshd and nginx (and optionally the app's failed-login log).
4. Log retention policy; basic resource monitoring (disk, memory, container restarts).

**Acceptance criteria:** a simulated SSH brute force and app login brute force both show up in Wazuh, and fail2ban bans the source.

**Learning:** SIEM integration, log pipelines, detection rules. This links to his cybersecurity profile.

### Phase 9: Documentation & portfolio

**Tasks**
1. `README.md`: what it is, the architecture diagram, the stack, how to run it locally, the deployment summary.
2. `docs/architecture.md`, `docs/runbook.md` (complete), `docs/security.md` (threat model lite, controls in place).
3. **Incident simulation + post-mortem:** e.g. the DB container is deleted → restore from backup. Write a blameless post-mortem with a timeline, the RTO/RPO achieved and the lessons learned.
4. Draft honest CV bullets and a 2-minute interview explanation (see section 9).

### Stretch goals (only after v1.0 is stable)
- **Terraform** for the EC2 instance + security group + S3 bucket; **Ansible** for hardening (configuration as code).
- A staging environment (a second compose project or a small second server).
- Realtime board updates with Server-Sent Events.
- Prometheus + Grafana, if the server has the resources.

---

## 7. Rules for background / autonomous work

1. **Allowed without asking:** reading code, writing code and docs inside the current phase, running local commands needed to build/test/verify (npm, docker compose in dev, tests), and local commits with conventional messages.
2. **Always stop at a 🛑 checkpoint**, and also before:
   - adding a dependency not listed in this roadmap
   - changing the data model beyond section 5
   - `git push`, force operations, rewriting history, or deleting branches/tags
   - anything involving real servers, DNS, cloud accounts, paid resources or real secrets
   - any decision with multiple reasonable options that this roadmap does not already settle
3. **One phase at a time.** Do not start the next phase until the current one meets its acceptance criteria and Alejandro has approved it.
4. When blocked, write the question in `STATUS.md` → "Open questions", stop, and summarize.
5. Keep `STATUS.md` short and rewritten; append decisions to `DECISIONS.md`; run `/session-end` at the end of every work block.
6. Prefer small, reviewable commits. Don't mix tooling, refactors and features in one commit.

---

## 8. Learning protocol (important: this project is a learning vehicle)

For every phase that involves infra/ops (2a, 4, 5, 6, 7, 8), the agent maintains **`docs/learning/phase-N.md`** containing:

1. **Concepts:** 3–6 key concepts used in that phase, each explained in 2–3 lines and tied to where it appears in the repo.
2. **Commands I ran:** every infra/ops command the agent executed, what it does, and why. Alejandro must be able to reproduce everything.
3. **Hands-on exercises for Alejandro:** a checklist he does himself, without the agent. Examples:
   - Phase 2a: stop the db, start it again, and confirm the data is still there; inspect the network with `docker network inspect`; connect with `psql` and write 3 queries by hand.
   - Phase 5: harden SSH himself following the runbook; read `/var/log/auth.log`.
   - Phase 6: run a full restore drill himself and time it.
4. **Interview questions:** 3–5 questions an interviewer could ask about this phase, with short model answers. These are for practice; he should answer them in his own words.

Running commands for verification is fine, but the hands-on checklist must leave Alejandro able to do it alone.

---

## 9. Portfolio narrative (honest)

Draft CV bullets (to refine at Phase 9 with real numbers):
- *Designed, built and operate a self-hosted task management platform used daily by a game development studio (React/TS, Node/Express, PostgreSQL).*
- *Containerized a 3-tier architecture with Docker Compose behind an Nginx reverse proxy with automated Let's Encrypt TLS and a strict CSP; hardened an Ubuntu server on AWS EC2 (SSH keys, ufw/security groups, fail2ban).*
- *Implemented encrypted, offsite PostgreSQL backups with automated verification and a documented restore drill (RTO X min / RPO 24 h).*
- *Built a CI/CD pipeline (GitHub Actions → GHCR → SSH deploy) with image scanning and automated rollback; integrated server logs into a Wazuh SIEM.*

Never claim high availability, scale or numbers that were not measured.

---

## 10. Open decisions for Alejandro (keep updated in STATUS.md)

- The logged-in demo user and the game name placeholder: the PNG versions (Gonzalo / CEO, `[JUEGO SUPREMO]`) are used per decision 004. Confirm the real names with the client before production.
- Hosting provider: AWS EC2 (recommended for the AWS CCP alignment) vs another VPS. Who pays for the server and domain (him or the client)?
- Offsite backup target: S3 vs Backblaze B2.
- Domain name.
- Whether a sanitized public copy of the repo will be published later (requires the client's approval).

---

## 11. Design decisions & rationale (my reasoning)

The short, formal record of each decision is in `docs/DECISIONS.md`. This section is the longer explanation in my own words: what I chose, how it works, and why I can defend it.

### System design

**Three tiers, each with one job.** nginx is the only thing facing the internet: it terminates TLS, serves the static frontend build and forwards `/api` to the API. The API holds all business rules and is the only process that talks to the database. PostgreSQL holds the data and nothing else. Because every request goes through one entry point, I only harden, log and rate-limit in one place, and the database has no network path from the outside at all.

**Same origin for the frontend and the API.** The browser loads the app and calls `/api` on the same domain, through the same nginx. That removes CORS completely, lets me use plain cookies for sessions, and lets me ship a strict CSP (`default-src 'self'`), because the page never needs to talk to another origin.

**Docker Compose on one server, not Kubernetes.** The load is one small studio. Compose gives me reproducible environments, health checks, restart policies and isolated networks, which is everything I need at this size. Kubernetes would add a control plane to operate without solving a problem I have. I also don't call a single server "highly available": a single server is a single point of failure. What I do instead is make recovery fast and tested (backups, a timed restore drill, automatic restarts, monitoring).

**Network exposure is a deliberate decision, not a default.** In development I publish `db` and `api` only on `127.0.0.1`, so they're reachable from my machine but not from my LAN. Publishing a port as `5432:5432` binds to `0.0.0.0` and exposes the database to every network the machine is on. In production `db` and `api` publish no ports at all; containers reach each other by service name on an internal Docker network, and only nginx publishes 80/443. The cloud security group and ufw repeat the same rule at two more layers (defense in depth).

**Health checks drive startup order.** `depends_on` alone only waits for the container to start, not for Postgres to accept connections. I use `condition: service_healthy` with `pg_isready`, and `GET /api/health` returns 200 only if the API can actually query the database. That same endpoint is what uptime monitoring and the deploy script check before declaring a release good.

**Data lives in a named volume, not in the container.** Containers are disposable; `pgdata` is not. `docker compose down` removes the containers and keeps the data, `down -v` deletes the volume too. Knowing that difference is the line between a restart and data loss.

### Data model

**Kanban lanes are derived, not stored.** A task has a `status` (pending / in progress / done) and, only when done, a `done_state` (active / modified / removed). The four lanes are just queries over those two columns. Storing a separate "lane" column would create two sources of truth that can disagree.

**The database enforces the core invariant.** `CHECK ((status = 'done') = (done_state IS NOT NULL))` makes it impossible to save a done task without a done state, or a pending task with one, whatever bug the API has. Rules that depend on context (an *active* task needs the build it was integrated in; a *modified/removed* task needs a change note) are validated in the API, where I can return a clear error message.

**One timestamp instead of a date plus a time.** `due_at timestamptz` stores an exact instant in UTC; the frontend shows it in the studio's local time. Splitting it into `due_date` + `due_time` would mean two columns that must stay in sync and timezone bugs at midnight.

**A build in preparation is a real state.** `build_number` is nullable and `planned_for` holds the target date, so "v0.10 planned for 15 Nov, no CI number yet" is modeled directly instead of overloading `released_at` with two meanings.

**The activity log stores facts, not sentences.** Each row is `action` + `payload` (JSON) written in the same transaction as the change it describes. The frontend turns that into Spanish text. The same event can be phrased differently on each screen, and changing the wording never requires a data migration.

**Indexes follow the queries.** I index what the screens filter and sort by: lane (`status, done_state`), assignee, area, due date, comments by task, and the newest activity first. Nothing speculative.

### Backend

**Plain SQL with `pg`, no ORM.** The stats on both screens are aggregates (`COUNT ... FILTER`, `GROUP BY`, weekly buckets). Writing them in SQL keeps them fast and readable, and I can paste any query into `psql` to debug it. A small query helper gives me parameterized queries (no string concatenation, so no SQL injection) without hiding the SQL.

**Migrations are versioned SQL files.** `node-pg-migrate` applies them in order and records which ones ran, so every environment (dev, test, prod, a restore target) builds the exact same schema from git. In production, migrations run as an explicit deploy step, not on container start, so a restart can never change the schema by surprise.

**Validate at the edges.** `zod` validates every request body and the environment variables at startup. A missing `DATABASE_URL` crashes the API immediately with a clear message instead of failing later on the first request.

**Every mutation and its activity event share one transaction.** Either both are written or neither is, so the activity feed can never show a change that didn't happen, or miss one that did.

**Tests hit a real database.** API tests run with Vitest + Supertest against a dedicated test database, because the bugs that matter most here (constraints, joins, aggregates) are exactly the ones a mocked database would hide.

### Security

**Server-side sessions instead of JWTs.** On login I create a row in `sessions` and send the browser a random session ID in an `httpOnly`, `SameSite=Lax` cookie (`Secure` in production). JavaScript can't read it, so an XSS bug can't steal it, and logging out deletes the row, which ends the session immediately. A JWT can't be revoked before it expires without building a denylist, which is a session table again. Since the frontend and API share an origin, cookies have no downside here.

**argon2id for passwords.** It's deliberately slow and memory-hard, which makes brute-forcing a leaked hash expensive even on GPUs. Plain SHA-256 is fast by design, which is exactly wrong for passwords.

**Least privilege everywhere.** `member` manages tasks and comments; only `admin` manages users, areas and builds, enforced in middleware and covered by tests. The same idea applies to infrastructure: containers run as a non-root user, the backup job uses an IAM user that can only write to one bucket, and the deploy user only has what deploying needs.

**No third-party requests from the browser.** Fonts are bundled with the app instead of loaded from Google Fonts. My users' IPs aren't sent to a third party, the CSP can stay at `font-src 'self'`, and the app doesn't depend on another service being up.

**Logs are written to be parsed.** Failed logins are logged in a consistent format so fail2ban can ban the source and Wazuh can alert on brute-force patterns.

### Frontend

**The UI depends on an interface, not on the backend.** Every screen gets data through `QuestlogApi`. I built the whole UI against a mock implementation first; the interface doubles as the API contract, and switching to the real backend is a config value (`VITE_API_MODE`) with no component changes.

**Tooling: ESLint + typescript-eslint, with TypeScript pinned to 6.0.** typescript-eslint needs TypeScript's JavaScript compiler API, which TypeScript 7 (the native rewrite) doesn't provide yet. ESLint is the standard most teams use, and the backend will share the same setup, so I pinned the compiler to 6.0 instead of switching linters. At this codebase size, TS 7's speed gain doesn't matter. I'll move back to 7 when typescript-eslint supports it. Prettier handles formatting, so lint rules only deal with correctness.

### Operations

**Images are built once and promoted by tag.** CI builds an image, scans it with Trivy and pushes it to GHCR tagged with the git SHA and the version. Production runs that exact image. Rolling back means redeploying the previous tag, not rebuilding old code and hoping it comes out the same.

**Multi-stage builds.** The build stage has the compilers and dev dependencies; the runtime image only has the output and production dependencies. Smaller images download faster and expose fewer packages with known vulnerabilities.

**Backups are only real if a restore works.** Nightly `pg_dump`, encrypted before it leaves the server, stored offsite with a retention policy, checked automatically by a Python script, and proven by a timed restore drill. That drill gives me two numbers I can state honestly: RTO (how long recovery takes) and RPO (how much data I can lose, 24 h with nightly dumps).
