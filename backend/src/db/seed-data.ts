import type { ClientBase } from 'pg';
import { activity } from '../../../frontend/src/mocks/activity';
import { areas } from '../../../frontend/src/mocks/areas';
import { builds } from '../../../frontend/src/mocks/builds';
import { comments } from '../../../frontend/src/mocks/comments';
import { tasks } from '../../../frontend/src/mocks/tasks';
import { users } from '../../../frontend/src/mocks/users';
import { seedUuid } from './seed-ids';

const id = (mockId: string | null) => (mockId ? seedUuid(mockId) : null);

/** Replaces all data with the frontend dev dataset, in one transaction. */
export async function seedDatabase(client: ClientBase): Promise<void> {
  await client.query('BEGIN');
  try {
    await client.query('TRUNCATE activity_log, comments, tasks, builds, users, areas CASCADE');

    for (const a of areas) {
      await client.query('INSERT INTO areas (id, name, color_key) VALUES ($1, $2, $3)', [
        id(a.id),
        a.name,
        a.colorKey,
      ]);
    }
    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, email, full_name, job_title, role, initials, avatar_color, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id(u.id),
          u.email,
          u.fullName,
          u.jobTitle,
          u.role,
          u.initials,
          u.avatarColor,
          u.isActive,
          u.createdAt,
        ],
      );
    }
    for (const b of builds) {
      await client.query(
        `INSERT INTO builds (id, version, build_number, planned_for, released_at, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id(b.id), b.version, b.buildNumber, b.plannedFor, b.releasedAt, b.notes],
      );
    }
    for (const t of tasks) {
      await client.query(
        `INSERT INTO tasks (id, code, title, description, area_id, assignee_id, status, done_state,
           change_note, priority, start_date, due_at, completed_at, target_build_id,
           integrated_build_id, position, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          id(t.id),
          t.code,
          t.title,
          t.description,
          id(t.areaId),
          id(t.assigneeId),
          t.status,
          t.doneState,
          t.changeNote,
          t.priority,
          t.startDate,
          t.dueAt,
          t.completedAt,
          id(t.targetBuildId),
          id(t.integratedBuildId),
          t.position,
          id(t.createdBy),
          t.createdAt,
          t.updatedAt,
        ],
      );
    }
    for (const c of comments) {
      await client.query(
        'INSERT INTO comments (id, task_id, author_id, body, created_at) VALUES ($1, $2, $3, $4, $5)',
        [id(c.id), id(c.taskId), id(c.authorId), c.body, c.createdAt],
      );
    }
    for (const a of activity) {
      // Build snapshots inside the payload reference builds by id too.
      const payload =
        'build' in a.payload && a.payload.build
          ? { ...a.payload, build: { ...a.payload.build, id: id(a.payload.build.id) } }
          : a.payload;
      await client.query(
        `INSERT INTO activity_log (id, task_id, actor_id, action, payload, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id(a.id), id(a.taskId), id(a.actorId), a.action, payload, a.createdAt],
      );
    }

    // New tasks continue after the highest seeded code (QL-167 → QL-168).
    await client.query(
      `SELECT setval('task_code_seq', (SELECT max(substring(code FROM 4)::int) FROM tasks))`,
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
}
