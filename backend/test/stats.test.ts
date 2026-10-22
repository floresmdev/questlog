import { describe, expect, it } from 'vitest';
import { mockApi } from '../../frontend/src/api/mockClient';
import { get, normalize } from './support/contract';

describe('stats endpoints', () => {
  it.each([
    ['/api/stats/tasks', () => mockApi.getTaskStats()],
    ['/api/stats/priorities', () => mockApi.getPriorityStats()],
    ['/api/stats/area-workload?limit=5', () => mockApi.getAreaWorkload(5)],
    ['/api/stats/overview', () => mockApi.getOverviewStats()],
    ['/api/stats/area-progress?limit=6', () => mockApi.getAreaProgress(6)],
    ['/api/stats/weekly-completed?weeks=8', () => mockApi.getWeeklyCompleted(8)],
    ['/api/stats/done-breakdown', () => mockApi.getDoneBreakdown()],
  ])('GET %s matches mock mode', async (path, mock) => {
    const res = await get(path).expect(200);
    expect(normalize(res.body)).toEqual(normalize(await mock()));
  });

  it('computes the design numbers from the seeded tasks', async () => {
    const { body } = await get('/api/stats/tasks').expect(200);
    expect(body).toMatchObject({
      total: 64,
      newThisWeek: 9,
      inProgressDueThisWeek: 5,
      sprint: { done: 48, inProgress: 22, pending: 30 },
    });
  });

  it('buckets weeks from Monday in the studio timezone', async () => {
    const { body } = await get('/api/stats/weekly-completed?weeks=2').expect(200);
    expect(body).toEqual([
      { weekStart: '2026-09-14', count: 4 },
      { weekStart: '2026-09-21', count: 4 },
    ]);
  });

  it('requires a limit', async () => {
    await get('/api/stats/area-workload').expect(400);
  });
});
