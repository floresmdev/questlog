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
