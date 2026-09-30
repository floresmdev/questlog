# Questlog — Design Handoff (Game Dev Task Manager)

Source of truth for implementing the two approved screens: **Tasks (Kanban)** and **Overview**.

## 1. Reference files

| File | Screen | Frame |
|---|---|---|
| `design/tasks.reference.html` | Tasks / Kanban | 1440 × 1200 |
| `design/overview.reference.html` | Overview | 1440 × 1080 |
| `design/*.png` (optional) | Exported screenshots of both screens | — |

The `.html` references are written in a proprietary canvas format (`<x-dc>`, `<sc-for>`, `{{holes}}`, a `DCLogic` class, and a `support.js` runtime that is NOT included). **Do not try to run them or port that runtime.** Read them only for exact layout, spacing, colors, copy, and sample data (the sample data lives in each file's `renderVals()`).

## 1b. Architecture (self-hosted, no BaaS)

3-tier, fully self-hosted. No Supabase, no serverless.

```
Internet ──443──> [nginx]  serves the Vite static build + reverse-proxies /api
                     │  (docker network: backend_net, internal)
                     ▼
                  [api]    Node.js + Express (REST, JWT/session auth, business logic)
                     │
                     ▼
                  [db]     PostgreSQL 16 — named volume `pgdata`, never exposed publicly
```

Monorepo layout:

```
/frontend   Vite + React + TS + Tailwind
/backend    Node + Express + pg, SQL migrations
/infra      nginx/*.conf, scripts/ (backup.sh, restore.sh), compose overrides
/docs       HANDOFF.md, design/, runbook.md, architecture.md
docker-compose.yml          (base)
docker-compose.dev.yml      (hot reload, db port exposed to localhost only)
docker-compose.prod.yml     (TLS, restart policies, no exposed db)
```

The frontend must talk to the backend ONLY through `frontend/src/api/` (a typed fetch client against `/api/*`). No direct DB or third-party BaaS SDKs in the frontend.

## 2. Design tokens

**Font:** `Plus Jakarta Sans` (400/500/600/700/800) for the UI; `JetBrains Mono` (500/600) for task IDs and build numbers (`QL-142`, `v0.9.0 · #214`).

| Token | Value | Use |
|---|---|---|
| bg | `#F4F6FA` | App background |
| surface | `#FFFFFF` | Cards, sidebar, header |
| border | `#E6E9F0` | Card borders |
| text | `#111827` | Primary text |
| text-muted | `#6B7280` | Secondary text |
| primary | `#2563EB` | Buttons, active nav, charts |
| primary-soft | `#E8EFFE` | Sidebar build card |
| radius-card | `16px` | Panels |
| radius-task | `10px` | Kanban cards |

**Kanban lane colors (header / lane bg / text):**
- Pending: `#DDE8FC` / `#F5F8FE` / `#1E3A8A`
- In progress: `#FCEFC9` / `#FFFBF1` / `#78350F`
- Done · Active in game: `#D5F0DE` / `#F3FBF5` / `#14532D`
- Done · Modified / Removed: `#E9E3FB` / `#F8F6FE` / `#4C1D95`

**Area tags (bg / text):** Programming `#DBEAFE/#1D4ED8` · Art `#FCE7F3/#BE185D` · Design `#EDE9FE/#6D28D9` · Audio `#CCFBF1/#0F766E` · UI/UX `#FEF3C7/#92400E` · QA `#FEE2E2/#B91C1C` · Animation `#FFEDD5/#C2410C` · Narrative `#DCFCE7/#15803D`

**Priority (bg / text):** High `#FEE2E2/#B91C1C` · Medium `#FEF3C7/#92400E` · Low `#E0E7FF/#3730A3`

**Done state badges:** Active in game `#DCFCE7/#15803D` · Modified `#EDE9FE/#6D28D9` · Removed `#FEE2E2/#B91C1C` (title struck through)

## 3. Client requirements → data model

Each task has: assignee + area, description, status (pending / in progress / done), priority, comments, the version/build where it was integrated, and dates. Done tasks are split into **active in the game** vs **modified or removed**.

```
areas        (id, name, color_key)
users        (id, email unique, password_hash, full_name, role enum('admin','member'), initials, avatar_color, created_at)
builds       (id, version text, build_number int, released_at date null, notes text)
tasks        (id, code text unique 'QL-###', title, description,
              area_id → areas, assignee_id → profiles,
              status enum('pending','in_progress','done'),
              done_state enum('active','modified','removed') null   -- only when status='done'
              change_note text null,                                -- why it was modified/removed
              priority enum('high','medium','low'),
              start_date date, due_date date, completed_at timestamptz null,
              target_build_id → builds null,     -- build it is planned for
              integrated_build_id → builds null, -- build where it landed
              position int,                      -- order inside a lane
              created_by, created_at, updated_at)
comments     (id, task_id → tasks, author_id → profiles, body, created_at)
activity_log (id, task_id, actor_id, action text, payload jsonb, created_at)
```

Constraint: `done_state IS NULL` unless `status = 'done'`; `done_state` is required when `status = 'done'`.

**Kanban lanes are derived:** Pending = `status='pending'`; In progress = `status='in_progress'`; Active in game = `done` + `active`; Modified/Removed = `done` + (`modified` | `removed`).

## 4. Screens and components

**Shared layout:** `Sidebar` (logo, nav, current-build card, user footer) · `TopBar` (title + subtitle, search, actions, avatar).

**Tasks:** `StatCard` ×3 + `SprintDonut` · `KanbanBoard` (filters: area, assignee, build; list/board toggle) · `KanbanLane` ×4 with the "DONE · SPLIT BY IN-GAME STATE" group label over the last two · `TaskCard` (variants: open / done-active / done-changed) · `TaskDetailPanel` (all fields, description, comments thread + composer, Edit / Mark as done) · `RecentActivity` · `AreaWorkload` · `PriorityOverview`.

**Overview:** `StatCard` ×4 · `AreaProgress` · `WeeklyCompletedChart` (line/area, last 8 weeks) · `TodayTasks` · `MiniCalendar` + `UpcomingDeadlines` · `BuildHistory` (timeline) · `DoneStateBreakdown` (stacked bar + 3 tiles).

## 5. Key interactions

- Drag and drop between lanes updates `status`/`done_state`. Dropping into a done lane opens a small dialog asking for the integrated build (and a change note for modified/removed).
- Clicking a card opens it in `TaskDetailPanel`; every field is editable inline.
- Every change writes an `activity_log` row, which feeds the Recent Activity widgets.
- UI copy is in Spanish (see the reference files for exact strings).
