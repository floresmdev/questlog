import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pool, query } from '../src/db';

// The database itself must refuse invalid task states, whatever the API does.
describe('tasks.done_state_matches_status', () => {
  let areaId: string;
  let userId: string;

  beforeAll(async () => {
    [{ id: areaId }] = await query<{ id: string }>(
      `INSERT INTO areas (name, color_key) VALUES ('Schema test', 'qa') RETURNING id`,
    );
    [{ id: userId }] = await query<{ id: string }>(
      `INSERT INTO users (email, full_name, initials, avatar_color)
       VALUES ('schema-test@questlog.dev', 'Schema Test', 'ST', 'slate') RETURNING id`,
    );
  });

  afterAll(async () => {
    await query('DELETE FROM tasks WHERE area_id = $1', [areaId]);
    await query('DELETE FROM areas WHERE id = $1', [areaId]);
    await query('DELETE FROM users WHERE id = $1', [userId]);
  });

  const insertTask = (status: string, doneState: string | null) =>
    query(
      `INSERT INTO tasks (title, area_id, created_by, status, done_state)
       VALUES ('t', $1, $2, $3, $4)`,
      [areaId, userId, status, doneState],
    );

  it('rejects a done task without done_state', async () => {
    await expect(insertTask('done', null)).rejects.toThrow(/done_state_matches_status/);
  });

  it('rejects an open task with a done_state', async () => {
    await expect(insertTask('pending', 'active')).rejects.toThrow(/done_state_matches_status/);
  });

  it('accepts consistent rows and generates a QL code', async () => {
    await insertTask('done', 'removed');
    await insertTask('in_progress', null);
    const rows = await query<{ code: string }>('SELECT code FROM tasks WHERE area_id = $1', [
      areaId,
    ]);
    expect(rows.map((r) => r.code)).toEqual([
      expect.stringMatching(/^QL-\d{3}$/),
      expect.stringMatching(/^QL-\d{3}$/),
    ]);
  });
});

afterAll(() => pool.end());
