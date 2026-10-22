import { describe, expect, it } from 'vitest';
import { mockApi } from '../../frontend/src/api/mockClient';
import { get, normalize } from './support/contract';

// Contract tests: each endpoint must return exactly what mock mode shows.
describe('reference endpoints', () => {
  it('GET /api/me returns the DEV_USER_EMAIL user', async () => {
    const res = await get('/api/me').expect(200);
    expect(res.body.email).toBe('gonzalo@questlog.dev');
    expect(normalize(res.body)).toEqual(normalize(await mockApi.getCurrentUser()));
  });

  it('never exposes password hashes', async () => {
    const res = await get('/api/users').expect(200);
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });

  it.each([
    ['/api/users', () => mockApi.getUsers()],
    ['/api/areas', () => mockApi.getAreas()],
    ['/api/builds', () => mockApi.getBuilds()],
    ['/api/builds/current', () => mockApi.getCurrentBuild()],
  ])('GET %s matches mock mode', async (path, mock) => {
    const res = await get(path).expect(200);
    expect(normalize(res.body)).toEqual(normalize(await mock()));
  });
});
