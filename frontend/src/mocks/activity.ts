import type { ActivityEvent, Id } from '../api/types';

/** An activity_log row before joins: actor and task are ids. */
export type ActivitySeed = ActivityEvent & {
  id: Id;
  actorId: Id;
  taskId: Id | null;
  createdAt: string;
};

const v090 = { id: 'b-090', version: 'v0.9.0', buildNumber: 214 };

export const activity: ActivitySeed[] = [
  {
    id: 'a-1',
    actorId: 'u-dr',
    taskId: 't-142',
    action: 'task.moved',
    payload: { from: 'pending', to: 'in_progress' },
    createdAt: '2026-09-28T14:20:00-06:00',
  },
  {
    id: 'a-5',
    actorId: 'u-lp',
    taskId: 't-139',
    action: 'comment.created',
    payload: {},
    createdAt: '2026-09-28T13:20:00-06:00',
  },
  {
    id: 'a-2',
    actorId: 'u-lp',
    taskId: 't-139',
    action: 'task.priority_changed',
    payload: { from: 'medium', to: 'high' },
    createdAt: '2026-09-28T12:05:00-06:00',
  },
  {
    id: 'a-7',
    actorId: 'u-lm',
    taskId: null,
    action: 'build.released',
    payload: { build: v090 },
    createdAt: '2026-09-26T18:00:00-06:00',
  },
  {
    id: 'a-3',
    actorId: 'u-st',
    taskId: 't-122',
    action: 'task.completed',
    payload: { doneState: 'removed', build: v090 },
    createdAt: '2026-09-26T10:40:00-06:00',
  },
  {
    id: 'a-4',
    actorId: 'u-st',
    taskId: 't-131',
    action: 'task.completed',
    payload: { doneState: 'active', build: v090 },
    createdAt: '2026-09-26T09:15:00-06:00',
  },
  {
    id: 'a-6',
    actorId: 'u-ac',
    taskId: 't-127',
    action: 'task.completed',
    payload: { doneState: 'modified', build: v090 },
    createdAt: '2026-09-25T17:00:00-06:00',
  },
];
