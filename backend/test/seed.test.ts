import { afterAll, describe, expect, it } from 'vitest';
import { comments } from '../../frontend/src/mocks/comments';
import { tasks } from '../../frontend/src/mocks/tasks';
import { seedUuid } from '../src/db/seed-ids';
import { pool, query } from '../src/db';

describe('seed', () => {
  it('loads every mock task and comment', async () => {
    const [counts] = await query<{ tasks: number; comments: number }>(
      'SELECT (SELECT count(*) FROM tasks)::int AS tasks, (SELECT count(*) FROM comments)::int AS comments',
    );
    expect(counts).toEqual({ tasks: tasks.length, comments: comments.length });
  });

  it('uses stable ids derived from the mock ids', async () => {
    const [row] = await query<{ code: string }>('SELECT code FROM tasks WHERE id = $1', [
      seedUuid('t-142'),
    ]);
    expect(row.code).toBe('QL-142');
  });
});

afterAll(() => pool.end());
