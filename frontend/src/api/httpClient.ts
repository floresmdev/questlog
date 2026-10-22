import type { QuestlogApi } from './client';

type Params = Record<string, string | number | undefined>;

/** GET /api/<path> as JSON. Same-origin: nginx (prod) or the Vite proxy (dev) forwards it. */
async function get<T>(path: string, params: Params = {}): Promise<T> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value));
  }
  const url = `/api${path}${query.size ? `?${query}` : ''}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`GET ${url} failed with ${res.status}`);
  return res.json() as Promise<T>;
}

export const httpApi: QuestlogApi = {
  getCurrentUser: () => get('/me'),
  getUsers: () => get('/users'),
  getAreas: () => get('/areas'),
  getBuilds: () => get('/builds'),
  getCurrentBuild: () => get('/builds/current'),

  getBoard: (filters = {}, perLane) => get('/board', { ...filters, perLane }),
  getTask: (id) => get(`/tasks/${encodeURIComponent(id)}`),
  getTaskStats: () => get('/stats/tasks'),
  getPriorityStats: () => get('/stats/priorities'),
  getAreaWorkload: (limit) => get('/stats/area-workload', { limit }),
  getActivity: (scope, limit) => get('/activity', { scope, limit }),

  getOverviewStats: () => get('/stats/overview'),
  getAreaProgress: (limit) => get('/stats/area-progress', { limit }),
  getWeeklyCompleted: (weeks) => get('/stats/weekly-completed', { weeks }),
  getAgenda: (date) => get('/agenda', { date }),
  getCalendarEvents: (from, to) => get('/calendar', { from, to }),
  getUpcomingDeadlines: (limit) => get('/deadlines', { limit }),
  getBuildHistory: (limit) => get('/builds/history', { limit }),
  getDoneBreakdown: () => get('/stats/done-breakdown'),
};
