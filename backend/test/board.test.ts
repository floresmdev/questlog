import { describe, expect, it } from 'vitest';
import { mockApi } from '../../frontend/src/api/mockClient';
import { get, normalize, uuidOf } from './support/contract';

describe('GET /api/board', () => {
  it('matches mock mode', async () => {
    const res = await get('/api/board').expect(200);
    expect(normalize(res.body)).toEqual(normalize(await mockApi.getBoard()));
  });

  it('derives the four lanes with full totals', async () => {
    const res = await get('/api/board').expect(200);
    expect(res.body.map((l: { id: string; total: number }) => [l.id, l.total])).toEqual([
      ['pending', 19],
      ['in_progress', 14],
      ['done_active', 24],
      ['done_changed', 7],
    ]);
  });

  it('applies filters and perLane like mock mode', async () => {
    const res = await get(
      `/api/board?areaId=${uuidOf('area-prog')}&buildId=${uuidOf('b-090')}&perLane=2`,
    ).expect(200);
    const mock = await mockApi.getBoard({ areaId: 'area-prog', buildId: 'b-090' }, 2);
    expect(normalize(res.body)).toEqual(normalize(mock));
  });

  it('rejects malformed filters with 400', async () => {
    await get('/api/board?areaId=not-a-uuid').expect(400);
    await get('/api/board?perLane=0').expect(400);
  });
});

describe('GET /api/tasks/:id', () => {
  it.each(['t-142', 't-139', 't-122', 't-153'])('%s matches mock mode', async (mockId) => {
    const res = await get(`/api/tasks/${uuidOf(mockId)}`).expect(200);
    expect(normalize(res.body)).toEqual(normalize(await mockApi.getTask(mockId)));
  });

  it('returns the 2 latest comments, oldest first, and the full count', async () => {
    const res = await get(`/api/tasks/${uuidOf('t-142')}`).expect(200);
    expect(res.body.commentCount).toBe(4);
    expect(
      res.body.comments.map((c: { author: { initials: string } }) => c.author.initials),
    ).toEqual(['LP', 'DR']);
  });

  it('returns 404 for an unknown task and 400 for a malformed id', async () => {
    await get('/api/tasks/00000000-0000-4000-8000-000000000000').expect(404);
    await get('/api/tasks/142').expect(400);
  });
});
