-- Up Migration

-- Initial schema (docs/HANDOFF.md §3). `sessions` arrives with auth in phase 2b.
-- IDs are UUIDs from gen_random_uuid() (built into PostgreSQL 13+).

CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'done');
CREATE TYPE done_state AS ENUM ('active', 'modified', 'removed');
CREATE TYPE task_priority AS ENUM ('high', 'medium', 'low');

CREATE TABLE areas (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name      text NOT NULL UNIQUE,
  color_key text NOT NULL
    CHECK (color_key IN ('programming', 'art', 'design', 'audio', 'uiux', 'qa', 'animation', 'narrative'))
);

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  -- argon2id hash (phase 2b). '!' = locked account that can't log in, like
  -- in /etc/shadow; no hash ever equals it.
  password_hash text NOT NULL DEFAULT '!',
  full_name     text NOT NULL,
  job_title     text,
  role          user_role NOT NULL DEFAULT 'member',
  initials      text NOT NULL,
  avatar_color  text NOT NULL
    CHECK (avatar_color IN ('blue', 'violet', 'pink', 'teal', 'orange', 'red', 'slate')),
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE builds (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version      text NOT NULL UNIQUE,
  -- A build in preparation has no CI number and no release yet.
  build_number integer UNIQUE,
  planned_for  date,
  released_at  timestamptz,
  notes        text NOT NULL DEFAULT ''
);

-- Human-readable task codes: QL-001, QL-002…
CREATE SEQUENCE task_code_seq;

CREATE TABLE tasks (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                text NOT NULL UNIQUE
    DEFAULT 'QL-' || lpad(nextval('task_code_seq')::text, 3, '0'),
  title               text NOT NULL,
  description         text NOT NULL DEFAULT '',
  area_id             uuid NOT NULL REFERENCES areas (id),
  assignee_id         uuid REFERENCES users (id),
  status              task_status NOT NULL DEFAULT 'pending',
  done_state          done_state,
  change_note         text,
  priority            task_priority NOT NULL DEFAULT 'medium',
  start_date          date,
  due_at              timestamptz,
  completed_at        timestamptz,
  target_build_id     uuid REFERENCES builds (id),
  integrated_build_id uuid REFERENCES builds (id),
  position            integer NOT NULL DEFAULT 0,
  created_by          uuid NOT NULL REFERENCES users (id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  -- The core invariant, enforced by the database whatever the API does:
  -- a done task always has a done_state, an open task never has one.
  CONSTRAINT done_state_matches_status CHECK ((status = 'done') = (done_state IS NOT NULL))
);

CREATE TABLE comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    uuid NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  author_id  uuid NOT NULL REFERENCES users (id),
  body       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Structured events only; the frontend renders the Spanish sentence.
CREATE TABLE activity_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- History outlives the task: deleting a task keeps its events.
  task_id    uuid REFERENCES tasks (id) ON DELETE SET NULL,
  actor_id   uuid NOT NULL REFERENCES users (id),
  action     text NOT NULL,
  payload    jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes follow the screens' filters and sorts.
CREATE INDEX tasks_status_done_state_idx ON tasks (status, done_state); -- Kanban lanes
CREATE INDEX tasks_assignee_id_idx ON tasks (assignee_id);             -- assignee filter
CREATE INDEX tasks_area_id_idx ON tasks (area_id);                     -- area filter, area stats
CREATE INDEX tasks_due_at_idx ON tasks (due_at);                       -- agenda, deadlines
CREATE INDEX comments_task_id_idx ON comments (task_id);               -- detail panel, counts
CREATE INDEX activity_log_created_at_idx ON activity_log (created_at DESC); -- newest first

-- Down Migration

DROP TABLE activity_log;
DROP TABLE comments;
DROP TABLE tasks;
DROP SEQUENCE task_code_seq;
DROP TABLE builds;
DROP TABLE users;
DROP TABLE areas;
DROP TYPE task_priority;
DROP TYPE done_state;
DROP TYPE task_status;
DROP TYPE user_role;
