import request from 'supertest';
import { activity } from '../../../frontend/src/mocks/activity';
import { areas } from '../../../frontend/src/mocks/areas';
import { builds } from '../../../frontend/src/mocks/builds';
import { comments } from '../../../frontend/src/mocks/comments';
import { tasks } from '../../../frontend/src/mocks/tasks';
import { users } from '../../../frontend/src/mocks/users';
import { createApp } from '../../src/app';
import { seedUuid } from '../../src/db/seed-ids';

const mockIdByUuid = new Map(
  [areas, users, builds, tasks, comments, activity]
    .flat()
    .map((row) => [seedUuid(row.id), row.id] as const),
);
const TIMESTAMP = /^\d{4}-\d\d-\d\dT\d\d:\d\d/;

/**
 * Makes an API response comparable with a mockApi result: seeded UUIDs become
 * mock ids again, and timestamps become epoch ms (same instant, any format).
 */
export function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalize(v)]));
  }
  if (typeof value === 'string') {
    if (mockIdByUuid.has(value)) return mockIdByUuid.get(value);
    if (TIMESTAMP.test(value)) return new Date(value).getTime();
  }
  return value;
}

export const app = createApp();
export const get = (path: string) => request(app).get(path);
export const uuidOf = seedUuid;
