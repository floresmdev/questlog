import { describe, expect, it } from 'vitest';
import { mockApi } from '../../frontend/src/api/mockClient';
import { get, normalize } from './support/contract';

describe('activity, agenda, calendar, deadlines, build history', () => {
  it.each([
    ['/api/activity?scope=tasks&limit=4', () => mockApi.getActivity('tasks', 4)],
    ['/api/activity?scope=all&limit=5', () => mockApi.getActivity('all', 5)],
    ['/api/agenda?date=2026-09-28', () => mockApi.getAgenda('2026-09-28')],
    ['/api/agenda?date=2026-09-27', () => mockApi.getAgenda('2026-09-27')],
    [
      '/api/calendar?from=2026-08-30&to=2026-10-10',
      () => mockApi.getCalendarEvents('2026-08-30', '2026-10-10'),
    ],
    ['/api/deadlines?limit=3', () => mockApi.getUpcomingDeadlines(3)],
    ['/api/deadlines?limit=10', () => mockApi.getUpcomingDeadlines(10)],
    ['/api/builds/history?limit=4', () => mockApi.getBuildHistory(4)],
  ])('GET %s matches mock mode', async (path, mock) => {
    const res = await get(path).expect(200);
    expect(normalize(res.body)).toEqual(normalize(await mock()));
  });

  it('stores structured events, not sentences', async () => {
    const { body } = await get('/api/activity?scope=tasks&limit=1').expect(200);
    expect(body[0]).toMatchObject({
      action: 'task.moved',
      payload: { from: 'pending', to: 'in_progress' },
      task: { code: 'QL-142' },
    });
    expect(body[0]).not.toHaveProperty('text');
  });

  it('orders the agenda by time of day (studio timezone)', async () => {
    const { body } = await get('/api/agenda?date=2026-09-28').expect(200);
    const clock = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Mexico_City',
      hour: '2-digit',
      minute: '2-digit',
    });
    expect(body.map((i: { dueAt: string }) => clock.format(new Date(i.dueAt)))).toEqual([
      '09:00',
      '11:30',
      '15:00',
      '16:30',
      '18:00',
    ]);
  });

  it('validates dates and scope', async () => {
    await get('/api/agenda?date=28-09-2026').expect(400);
    await get('/api/calendar?from=2026-09-01').expect(400);
    await get('/api/activity?scope=overview&limit=5').expect(400);
  });
});
